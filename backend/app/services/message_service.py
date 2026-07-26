"""Chat messaging service."""

from datetime import datetime, timezone
from typing import List

from app.db.mongodb import get_database_or_raise
from app.utils.mongo import object_id_or_none, serialize_document


async def send_message(conversation_id: str, sender_id, receiver_id: str, content: str) -> dict:
    db = get_database_or_raise()
    receiver_oid = object_id_or_none(receiver_id)
    if receiver_oid is None or not await db.users.find_one({"_id": receiver_oid}):
        raise ValueError("Receiver not found")
    if receiver_oid == sender_id:
        raise ValueError("You cannot message yourself")

    text = content.strip()
    if not text:
        raise ValueError("Message cannot be empty")

    doc = {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "receiver_id": receiver_oid,
        "content": text,
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.messages.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_document(doc)


async def get_messages(conversation_id: str, user_id) -> List[dict]:
    db = get_database_or_raise()
    messages = await db.messages.find({
        "conversation_id": conversation_id,
        "$or": [{"sender_id": user_id}, {"receiver_id": user_id}],
    }).sort("created_at", 1).to_list(200)
    await db.messages.update_many(
        {"conversation_id": conversation_id, "receiver_id": user_id, "is_read": False},
        {"$set": {"is_read": True}},
    )
    return serialize_document(messages)
