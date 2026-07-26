"""Notification persistence and retrieval."""

from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional

from pymongo import ReturnDocument

from app.db.mongodb import get_database_or_raise
from app.utils.mongo import object_id_or_none, serialize_document


async def create_notification(
    user_id,
    title: str,
    message: str,
    notification_type: str = "system",
    action_url: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> dict:
    db = get_database_or_raise()
    doc = {
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "action_url": action_url,
        "metadata": metadata or {},
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.notifications.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_document(doc)


REMINDER_COPY = {
    "planted": (
        "Irrigation reminder",
        "Keep the newly planted field evenly moist and check water depth.",
    ),
    "germination": (
        "Irrigation reminder",
        "Maintain shallow water and inspect seedling establishment.",
    ),
    "tillering": (
        "Fertilizer reminder",
        "Review the top-dressing schedule and monitor paddy leaf colour.",
    ),
    "stem_elongation": (
        "Fertilizer reminder",
        "Check nitrogen and potassium needs before panicle initiation.",
    ),
    "booting": (
        "Pest inspection",
        "Inspect the crop for stem borer, leaf folder, and fungal symptoms.",
    ),
    "heading": (
        "Irrigation reminder",
        "Avoid water stress while panicles are emerging.",
    ),
    "flowering": (
        "Crop protection",
        "Inspect pest pressure and avoid spraying during peak flowering.",
    ),
    "grain_filling": (
        "Irrigation reminder",
        "Maintain adequate moisture, then reduce water gradually.",
    ),
    "maturity": (
        "Harvest reminder",
        "Drain the field and confirm labour, bags, transport, and buyer plans.",
    ),
}


def _as_date(value):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


async def ensure_daily_crop_reminders(user_id) -> int:
    """Create deduplicated in-app reminders for active crops for the current day."""
    db = get_database_or_raise()
    crops = (
        await db.crops.find(
            {"farmer_id": user_id, "growth_stage": {"$ne": "harvested"}}
        )
        .sort("expected_harvest_date", 1)
        .limit(20)
        .to_list(20)
    )
    today = date.today()
    created = 0

    for crop in crops:
        stage = crop.get("growth_stage", "planted")
        title, message = REMINDER_COPY.get(
            stage,
            (
                "Crop check reminder",
                "Inspect the field and update the crop growth stage.",
            ),
        )
        harvest_date = _as_date(crop.get("expected_harvest_date"))
        days_to_harvest = (harvest_date - today).days if harvest_date else None
        reminder_type = (
            "harvest"
            if days_to_harvest is not None and days_to_harvest <= 14
            else stage
        )
        if reminder_type == "harvest":
            title = "Harvest scheduling reminder"
            message = f"{crop.get('variety', 'Paddy')} is due for harvest in about {max(days_to_harvest, 0)} days. Confirm labour, bags, transport, and buyer arrangements."

        reminder_key = f"{today.isoformat()}:{crop['_id']}:{reminder_type}"
        exists = await db.notifications.find_one(
            {"user_id": user_id, "metadata.reminder_key": reminder_key}
        )
        if exists:
            continue
        await create_notification(
            user_id,
            title,
            message,
            "reminder",
            "/recommendations",
            {
                "crop_id": str(crop["_id"]),
                "reminder_key": reminder_key,
                "days_to_harvest": days_to_harvest,
            },
        )
        created += 1
    return created


async def get_notifications(
    user_id, unread_only: bool = False, limit: int = 30
) -> Dict[str, Any]:
    db = get_database_or_raise()
    query: Dict[str, Any] = {"user_id": user_id}
    if unread_only:
        query["is_read"] = False
    items = (
        await db.notifications.find(query)
        .sort("created_at", -1)
        .limit(limit)
        .to_list(limit)
    )
    unread_count = await db.notifications.count_documents(
        {"user_id": user_id, "is_read": False}
    )
    return {"notifications": serialize_document(items), "unread_count": unread_count}


async def mark_read(notification_id: str, user_id) -> Optional[dict]:
    db = get_database_or_raise()
    oid = object_id_or_none(notification_id)
    if oid is None:
        return None
    result = await db.notifications.find_one_and_update(
        {"_id": oid, "user_id": user_id},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc)}},
        return_document=ReturnDocument.AFTER,
    )
    return serialize_document(result) if result else None


async def mark_all_read(user_id) -> int:
    db = get_database_or_raise()
    result = await db.notifications.update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc)}},
    )
    return result.modified_count
