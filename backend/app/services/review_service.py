"""Verified marketplace reviews."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.db.mongodb import get_database_or_raise
from app.models.review import ReviewCreate
from app.services.s3_service import resolve_file_url
from app.utils.mongo import object_id_or_none, serialize_document


async def create_review(buyer_id, product_id: str, data: ReviewCreate) -> dict:
    db = get_database_or_raise()
    product_oid = object_id_or_none(product_id)
    order_oid = object_id_or_none(data.order_id)
    if product_oid is None or order_oid is None:
        raise ValueError("Invalid product or order identifier")

    order = await db.orders.find_one({
        "_id": order_oid,
        "product_id": product_oid,
        "buyer_id": buyer_id,
        "status": "delivered",
    })
    if not order:
        raise ValueError("Only delivered purchases can be reviewed")
    if await db.reviews.find_one({"order_id": order_oid, "buyer_id": buyer_id}):
        raise ValueError("This order has already been reviewed")

    product = await db.products.find_one({"_id": product_oid})
    if not product:
        raise ValueError("Product not found")

    now = datetime.now(timezone.utc)
    doc = {
        "product_id": product_oid,
        "order_id": order_oid,
        "buyer_id": buyer_id,
        "farmer_id": product["farmer_id"],
        "rating": data.rating,
        "comment": data.comment.strip(),
        "image_urls": data.image_urls,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.reviews.insert_one(doc)
    doc["_id"] = result.inserted_id
    await _refresh_ratings(db, product_oid, product["farmer_id"])
    return serialize_document(doc)


async def _refresh_ratings(db, product_id, farmer_id) -> None:
    product_stats = await db.reviews.aggregate([
        {"$match": {"product_id": product_id}},
        {"$group": {"_id": None, "rating": {"$avg": "$rating"}, "count": {"$sum": 1}}},
    ]).to_list(1)
    farmer_stats = await db.reviews.aggregate([
        {"$match": {"farmer_id": farmer_id}},
        {"$group": {"_id": None, "rating": {"$avg": "$rating"}, "count": {"$sum": 1}}},
    ]).to_list(1)
    if product_stats:
        await db.products.update_one(
            {"_id": product_id},
            {"$set": {
                "rating": round(product_stats[0]["rating"], 2),
                "total_reviews": product_stats[0]["count"],
                "updated_at": datetime.now(timezone.utc),
            }},
        )
    if farmer_stats:
        await db.users.update_one(
            {"_id": farmer_id},
            {"$set": {
                "rating": round(farmer_stats[0]["rating"], 2),
                "total_reviews": farmer_stats[0]["count"],
                "updated_at": datetime.now(timezone.utc),
            }},
        )


async def get_product_reviews(product_id: str, limit: int = 30) -> Dict[str, Any]:
    db = get_database_or_raise()
    oid = object_id_or_none(product_id)
    if oid is None:
        return {"reviews": [], "average_rating": 0, "total": 0}
    reviews = await db.reviews.find({"product_id": oid}).sort("created_at", -1).limit(limit).to_list(limit)
    buyer_ids = list({item["buyer_id"] for item in reviews})
    buyers = await db.users.find({"_id": {"$in": buyer_ids}}, {"full_name": 1, "profile_image_key": 1, "profile_image_url": 1}).to_list(len(buyer_ids)) if buyer_ids else []
    buyer_map = {item["_id"]: item for item in buyers}
    for review in reviews:
        buyer = buyer_map.get(review["buyer_id"], {})
        review["buyer_name"] = buyer.get("full_name", "Verified buyer")
        review["buyer_image_url"] = resolve_file_url(buyer.get("profile_image_key") or buyer.get("profile_image_url"))
    total = await db.reviews.count_documents({"product_id": oid})
    aggregate = await db.reviews.aggregate([
        {"$match": {"product_id": oid}},
        {"$group": {"_id": None, "rating": {"$avg": "$rating"}}},
    ]).to_list(1)
    return {
        "reviews": serialize_document(reviews),
        "average_rating": round(aggregate[0]["rating"], 2) if aggregate else 0,
        "total": total,
    }
