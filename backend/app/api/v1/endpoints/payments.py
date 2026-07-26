"""Basic payment endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from app.middleware.role_middleware import require_admin, require_buyer
from app.models.payment import PaymentRequest
from app.services import payment_service

router = APIRouter()


@router.post("/orders/{order_id}")
async def pay_order(order_id: str, data: PaymentRequest, user=Depends(require_buyer)):
    try:
        return await payment_service.pay_order(order_id, user["_id"], data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.patch("/orders/{order_id}/confirm-bank-transfer")
async def confirm_bank_transfer(order_id: str, admin=Depends(require_admin)):
    try:
        return await payment_service.confirm_bank_transfer(order_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
