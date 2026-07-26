"""Order endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth_middleware import get_current_user
from app.middleware.role_middleware import require_buyer, require_farmer
from app.models.order import OrderCreate
from app.services import order_service

router = APIRouter()


@router.post("/", status_code=201)
async def create_order(data: OrderCreate, user=Depends(require_buyer)):
    try:
        return await order_service.create_order(user["_id"], data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/buyer")
async def buyer_orders(user=Depends(require_buyer)):
    return await order_service.get_buyer_orders(user["_id"])


@router.get("/farmer")
async def farmer_orders(user=Depends(require_farmer)):
    return await order_service.get_farmer_orders(user["_id"])


@router.patch("/{order_id}/status")
async def update_status(order_id: str, status_data: dict, user=Depends(get_current_user)):
    new_status = status_data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status field required")
    try:
        result = await order_service.update_order_status(order_id, user, new_status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    return result
