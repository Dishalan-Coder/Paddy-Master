"""Farmer recommendations and smart reminders."""

from fastapi import APIRouter, Depends

from app.middleware.role_middleware import require_farmer
from app.services import recommendation_service

router = APIRouter()


@router.get("/")
async def recommendations(user=Depends(require_farmer)):
    return await recommendation_service.get_farmer_recommendations(
        user["_id"], user.get("district") or "anuradhapura"
    )
