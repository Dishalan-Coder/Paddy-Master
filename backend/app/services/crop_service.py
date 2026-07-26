"""Crop CRUD business logic."""

from datetime import datetime, timezone
from typing import List, Optional

from pymongo import ReturnDocument

from app.db.mongodb import get_database_or_raise
from app.models.crop import CropCreate, CropUpdate
from app.utils.mongo import object_id_or_none, serialize_document


async def create_crop(farmer_id, data: CropCreate) -> dict:
    db = get_database_or_raise()
    farm_id = object_id_or_none(data.farm_id)
    if farm_id is None:
        raise ValueError("Invalid farm identifier")

    farm = await db.farms.find_one({"_id": farm_id, "farmer_id": farmer_id})
    if not farm:
        raise ValueError("Farm not found or not owned by you")

    now = datetime.now(timezone.utc)
    doc = data.model_dump(mode="json")
    doc["farm_id"] = farm_id
    doc["farmer_id"] = farmer_id
    doc["created_at"] = now
    doc["updated_at"] = now

    result = await db.crops.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_document(doc)


async def get_crops(farmer_id) -> List[dict]:
    db = get_database_or_raise()
    crops = await db.crops.find({"farmer_id": farmer_id}).sort("created_at", -1).to_list(100)
    return serialize_document(crops)


async def get_crop_by_id(crop_id: str, farmer_id) -> Optional[dict]:
    db = get_database_or_raise()
    oid = object_id_or_none(crop_id)
    if oid is None:
        return None
    crop = await db.crops.find_one({"_id": oid, "farmer_id": farmer_id})
    return serialize_document(crop) if crop else None


async def update_crop(crop_id: str, farmer_id, data: CropUpdate) -> Optional[dict]:
    db = get_database_or_raise()
    oid = object_id_or_none(crop_id)
    if oid is None:
        return None

    update_data = data.model_dump(mode="json", exclude_none=True)
    if "farm_id" in update_data:
        farm_id = object_id_or_none(update_data["farm_id"])
        if farm_id is None or not await db.farms.find_one({"_id": farm_id, "farmer_id": farmer_id}):
            raise ValueError("Farm not found or not owned by you")
        update_data["farm_id"] = farm_id
    if not update_data:
        return await get_crop_by_id(crop_id, farmer_id)

    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await db.crops.find_one_and_update(
        {"_id": oid, "farmer_id": farmer_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    return serialize_document(result) if result else None


async def delete_crop(crop_id: str, farmer_id) -> bool:
    db = get_database_or_raise()
    oid = object_id_or_none(crop_id)
    if oid is None:
        return False
    result = await db.crops.delete_one({"_id": oid, "farmer_id": farmer_id})
    return result.deleted_count > 0
