"""Crop CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.subscription_middleware import require_farmer_general_access
from app.models.crop import CropCreate, CropUpdate
from app.services import crop_service

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_crop(data: CropCreate, user=Depends(require_farmer_general_access)):
    try:
        return await crop_service.create_crop(user["_id"], data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/")
async def get_crops(user=Depends(require_farmer_general_access)):
    return await crop_service.get_crops(user["_id"])


@router.get("/{crop_id}")
async def get_crop(crop_id: str, user=Depends(require_farmer_general_access)):
    crop = await crop_service.get_crop_by_id(crop_id, user["_id"])
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.put("/{crop_id}")
async def update_crop(
    crop_id: str, data: CropUpdate, user=Depends(require_farmer_general_access)
):
    try:
        crop = await crop_service.update_crop(crop_id, user["_id"], data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.delete("/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_crop(crop_id: str, user=Depends(require_farmer_general_access)):
    if not await crop_service.delete_crop(crop_id, user["_id"]):
        raise HTTPException(status_code=404, detail="Crop not found")
