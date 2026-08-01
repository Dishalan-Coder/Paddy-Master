"""Marketplace product service."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pymongo import ReturnDocument

from app.db.mongodb import get_database_or_raise
from app.models.product import (
    ProductCreate,
    ProductStatus,
    ProductUpdate,
    SUPPORTED_PRICE_UNITS_KG,
)
from app.services.s3_service import resolve_file_url
from app.utils.mongo import object_id_or_none, serialize_document

DEFAULT_PRODUCT_PRICE_UNIT_KG = 72
ALLOWED_SORT_FIELDS = {
    "created_at",
    "price_per_kg",
    "unit_price_per_kg",
    "quantity_kg",
    "variety",
    "views",
}


def resolve_product_pricing(product: dict) -> tuple[int, float, float]:
    raw_unit = product.get("price_unit_kg")
    try:
        unit = int(raw_unit or DEFAULT_PRODUCT_PRICE_UNIT_KG)
    except (TypeError, ValueError):
        unit = DEFAULT_PRODUCT_PRICE_UNIT_KG
    unit_was_saved = raw_unit is not None and unit in SUPPORTED_PRICE_UNITS_KG
    if not unit_was_saved:
        unit = DEFAULT_PRODUCT_PRICE_UNIT_KG

    price = float(product.get("price_per_kg") or 0)
    if not unit_was_saved:
        price = price * unit

    return unit, round(price, 2), round(price / unit, 4) if unit else 0.0


def _present_product(product: dict) -> dict:
    product = dict(product)
    unit, unit_price, unit_price_per_kg = resolve_product_pricing(product)
    product["price_unit_kg"] = unit
    product["price_per_kg"] = unit_price
    product["unit_price_per_kg"] = unit_price_per_kg
    product["image_urls"] = [
        url
        for url in (resolve_file_url(value) for value in product.get("image_urls", []))
        if url
    ]
    return product


async def create_product(farmer_id, data: ProductCreate) -> dict:
    db = get_database_or_raise()
    now = datetime.now(timezone.utc)
    doc = data.model_dump(mode="json")
    unit, unit_price, unit_price_per_kg = resolve_product_pricing(doc)
    doc["price_unit_kg"] = unit
    doc["price_per_kg"] = unit_price
    doc["unit_price_per_kg"] = unit_price_per_kg
    doc.update(
        {
            "farmer_id": farmer_id,
            "status": ProductStatus.ACTIVE.value,
            "views": 0,
            "rating": 0.0,
            "total_reviews": 0,
            "created_at": now,
            "updated_at": now,
        }
    )
    result = await db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_document(_present_product(doc))


async def get_farmer_products(farmer_id) -> List[dict]:
    db = get_database_or_raise()
    products = (
        await db.products.find({"farmer_id": farmer_id})
        .sort("created_at", -1)
        .to_list(100)
    )
    return serialize_document([_present_product(product) for product in products])


async def get_all_products(
    variety: str | None = None,
    region: str | None = None,
    district: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    is_organic: bool | None = None,
    sort_by: str = "created_at",
    sort_order: int = -1,
    skip: int = 0,
    limit: int = 20,
) -> Dict[str, Any]:
    db = get_database_or_raise()
    query: Dict[str, Any] = {"status": ProductStatus.ACTIVE.value}

    if variety:
        query["variety"] = {"$regex": variety.strip(), "$options": "i"}
    if region:
        query["region"] = {"$regex": region.strip(), "$options": "i"}
    if district:
        query["district"] = {"$regex": district.strip(), "$options": "i"}
    if min_price is not None or max_price is not None:
        query["unit_price_per_kg"] = {}
        if min_price is not None:
            query["unit_price_per_kg"]["$gte"] = min_price
        if max_price is not None:
            query["unit_price_per_kg"]["$lte"] = max_price
    if is_organic is not None:
        query["is_organic"] = is_organic

    sort_field = sort_by if sort_by in ALLOWED_SORT_FIELDS else "created_at"
    if sort_field == "price_per_kg":
        sort_field = "unit_price_per_kg"
    direction = 1 if sort_order == 1 else -1
    total = await db.products.count_documents(query)
    products = (
        await db.products.find(query)
        .sort(sort_field, direction)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )

    farmer_ids = list({p.get("farmer_id") for p in products if p.get("farmer_id")})
    farmer_map = {}
    if farmer_ids:
        farmers = await db.users.find(
            {"_id": {"$in": farmer_ids}},
            {"full_name": 1, "rating": 1, "district": 1, "is_verified": 1},
        ).to_list(len(farmer_ids))
        farmer_map = {farmer["_id"]: farmer for farmer in farmers}

    for product in products:
        farmer = farmer_map.get(product.get("farmer_id"))
        product["farmer_name"] = (
            farmer.get("full_name", "Unknown") if farmer else "Unknown"
        )
        product["farmer_rating"] = farmer.get("rating", 0.0) if farmer else 0.0
        product["farmer_verified"] = (
            farmer.get("is_verified", False) if farmer else False
        )

    return {
        "products": serialize_document(
            [_present_product(product) for product in products]
        ),
        "total": total,
        "skip": skip,
        "limit": limit,
    }


async def get_product_by_id(product_id: str) -> Optional[dict]:
    db = get_database_or_raise()
    oid = object_id_or_none(product_id)
    if oid is None:
        return None

    product = await db.products.find_one_and_update(
        {"_id": oid},
        {"$inc": {"views": 1}},
        return_document=ReturnDocument.AFTER,
    )
    if not product:
        return None

    farmer = await db.users.find_one(
        {"_id": product.get("farmer_id")},
        {
            "full_name": 1,
            "rating": 1,
            "total_reviews": 1,
            "district": 1,
            "phone": 1,
            "is_verified": 1,
        },
    )
    product["farmer_name"] = farmer.get("full_name", "Unknown") if farmer else "Unknown"
    product["farmer_rating"] = farmer.get("rating", 0.0) if farmer else 0.0
    product["farmer_verified"] = farmer.get("is_verified", False) if farmer else False
    product["farmer_total_reviews"] = farmer.get("total_reviews", 0) if farmer else 0
    return serialize_document(_present_product(product))


async def update_product(
    product_id: str, farmer_id, data: ProductUpdate
) -> Optional[dict]:
    db = get_database_or_raise()
    oid = object_id_or_none(product_id)
    if oid is None:
        return None

    update_data = data.model_dump(mode="json", exclude_none=True)
    if "status" in update_data and hasattr(update_data["status"], "value"):
        update_data["status"] = update_data["status"].value
    if not update_data:
        product = await db.products.find_one({"_id": oid, "farmer_id": farmer_id})
        return serialize_document(_present_product(product)) if product else None

    if "price_per_kg" in update_data or "price_unit_kg" in update_data:
        existing = await db.products.find_one({"_id": oid, "farmer_id": farmer_id})
        if not existing:
            return None
        pricing_doc = {**existing, **update_data}
        if "price_per_kg" in update_data and "price_unit_kg" not in update_data:
            pricing_doc["price_unit_kg"] = (
                existing.get("price_unit_kg") or DEFAULT_PRODUCT_PRICE_UNIT_KG
            )
        unit, unit_price, unit_price_per_kg = resolve_product_pricing(pricing_doc)
        update_data["price_unit_kg"] = unit
        update_data["price_per_kg"] = unit_price
        update_data["unit_price_per_kg"] = unit_price_per_kg

    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await db.products.find_one_and_update(
        {"_id": oid, "farmer_id": farmer_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    return serialize_document(_present_product(result)) if result else None


async def delete_product(product_id: str, farmer_id) -> bool:
    db = get_database_or_raise()
    oid = object_id_or_none(product_id)
    if oid is None:
        return False
    result = await db.products.delete_one({"_id": oid, "farmer_id": farmer_id})
    return result.deleted_count > 0
