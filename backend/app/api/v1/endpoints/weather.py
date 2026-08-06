"""Weather proxy endpoint."""

from fastapi import APIRouter, Depends, Query

from app.middleware.auth_middleware import get_current_user
from app.middleware.subscription_middleware import assert_farmer_general_access
from app.services import weather_service

router = APIRouter()


@router.get("/")
async def get_weather(
    district: str = Query("anuradhapura"),
    user=Depends(get_current_user),
):
    if user.get("role") == "farmer":
        assert_farmer_general_access(user)
    return await weather_service.get_weather(district)
