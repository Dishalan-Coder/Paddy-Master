"""Market price endpoints."""

from datetime import date
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth_middleware import get_current_user
from app.middleware.role_middleware import require_admin
from app.services import price_service

router = APIRouter()


@router.get("/")
async def get_prices(user=Depends(get_current_user)):
    return await price_service.get_latest_prices()


@router.put("/")
async def update_prices(
    prices: Dict[str, float],
    region: str = "national",
    price_date: date | None = None,
    admin=Depends(require_admin),
):
    try:
        return await price_service.update_market_prices(prices, region, price_date)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
