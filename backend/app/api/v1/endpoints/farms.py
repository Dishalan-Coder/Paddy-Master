"""Farm CRUD endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from app.db.mongodb import get_database_or_raise
from app.middleware.subscription_middleware import require_farmer_general_access
from app.models.farm import FarmCreate
from app.utils.mongo import object_id_or_none, serialize_document

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_farm(data: FarmCreate, user=Depends(require_farmer_general_access)):
    db = get_database_or_raise()
    doc = data.model_dump()
    doc.update({"farmer_id": user["_id"], "created_at": datetime.now(timezone.utc)})
    result = await db.farms.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_document(doc)


@router.get("/")
async def get_farms(user=Depends(require_farmer_general_access)):
    db = get_database_or_raise()
    farms = (
        await db.farms.find({"farmer_id": user["_id"]})
        .sort("created_at", -1)
        .to_list(100)
    )
    return serialize_document(farms)


@router.put("/{farm_id}")
async def update_farm(
    farm_id: str, data: FarmCreate, user=Depends(require_farmer_general_access)
):
    db = get_database_or_raise()
    oid = object_id_or_none(farm_id)
    if oid is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    result = await db.farms.find_one_and_update(
        {"_id": oid, "farmer_id": user["_id"]},
        {"$set": data.model_dump()},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Farm not found")
    return serialize_document(result)


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farm(farm_id: str, user=Depends(require_farmer_general_access)):
    db = get_database_or_raise()
    oid = object_id_or_none(farm_id)
    if oid is None:
        raise HTTPException(status_code=404, detail="Farm not found")
    if await db.crops.count_documents({"farm_id": oid}) > 0:
        raise HTTPException(status_code=409, detail="Delete the farm's crops first")
    result = await db.farms.delete_one({"_id": oid, "farmer_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Farm not found")
