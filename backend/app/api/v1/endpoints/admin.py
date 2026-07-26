"""Admin management endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo import ReturnDocument

from app.db.mongodb import get_database_or_raise
from app.middleware.role_middleware import require_admin
from app.services.s3_service import resolve_file_url
from app.utils.mongo import object_id_or_none, serialize_document

router = APIRouter()


@router.get("/users")
async def get_all_users(
    role: str | None = Query(None, pattern="^(farmer|buyer|admin)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin=Depends(require_admin),
):
    db = get_database_or_raise()
    query = {"role": role} if role else {}
    total = await db.users.count_documents(query)
    users = await db.users.find(query, {"hashed_password": 0}).skip(skip).limit(limit).to_list(limit)
    return {"users": serialize_document(users), "total": total}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, admin=Depends(require_admin)):
    db = get_database_or_raise()
    oid = object_id_or_none(user_id)
    if oid is None:
        raise HTTPException(status_code=404, detail="User not found")
    if oid == admin["_id"]:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account")
    result = await db.users.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")


@router.get("/products")
async def get_all_products(
    status_filter: str | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin=Depends(require_admin),
):
    db = get_database_or_raise()
    query = {"status": status_filter} if status_filter else {}
    total = await db.products.count_documents(query)
    products = await db.products.find(query).skip(skip).limit(limit).to_list(limit)
    for product in products:
        product["image_urls"] = [resolve_file_url(value) for value in product.get("image_urls", [])]
    return {"products": serialize_document(products), "total": total}


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, admin=Depends(require_admin)):
    db = get_database_or_raise()
    oid = object_id_or_none(product_id)
    if oid is None:
        raise HTTPException(status_code=404, detail="Product not found")
    result = await db.products.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")


@router.get("/orders")
async def get_all_orders(
    status_filter: str | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin=Depends(require_admin),
):
    db = get_database_or_raise()
    query = {"status": status_filter} if status_filter else {}
    total = await db.orders.count_documents(query)
    orders = await db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    user_ids = list({value for order in orders for value in (order.get("buyer_id"), order.get("farmer_id")) if value})
    product_ids = list({order.get("product_id") for order in orders if order.get("product_id")})
    users = await db.users.find({"_id": {"$in": user_ids}}, {"full_name": 1}).to_list(len(user_ids)) if user_ids else []
    products = await db.products.find({"_id": {"$in": product_ids}}, {"variety": 1}).to_list(len(product_ids)) if product_ids else []
    user_map = {item["_id"]: item.get("full_name", "Unknown") for item in users}
    product_map = {item["_id"]: item.get("variety", "Paddy") for item in products}
    for order in orders:
        order["buyer_name"] = user_map.get(order.get("buyer_id"), "Unknown")
        order["farmer_name"] = user_map.get(order.get("farmer_id"), "Unknown")
        order["product_variety"] = product_map.get(order.get("product_id"), "Paddy")
    return {"orders": serialize_document(orders), "total": total}


@router.patch("/users/{user_id}/verify")
async def verify_user(user_id: str, admin=Depends(require_admin)):
    db = get_database_or_raise()
    oid = object_id_or_none(user_id)
    if oid is None:
        raise HTTPException(status_code=404, detail="User not found")
    result = await db.users.find_one_and_update(
        {"_id": oid},
        {"$set": {"is_verified": True, "updated_at": datetime.now(timezone.utc)}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    result.pop("hashed_password", None)
    return serialize_document(result)
