"""Order payment and subscription billing endpoints."""

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status

from app.middleware.role_middleware import (
    require_admin,
    require_buyer,
    require_farmer_or_buyer,
)
from app.models.payment import (
    PaymentRequest,
    StripeRedirectResponse,
    SubscriptionCheckoutRequest,
    SubscriptionStatusResponse,
)
from app.services import payment_service
from app.services.payment_service import StripeConfigurationError

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


@router.get("/subscription", response_model=SubscriptionStatusResponse)
async def get_subscription(user=Depends(require_farmer_or_buyer)):
    return payment_service.subscription_summary(user)


@router.post("/subscription/checkout", response_model=StripeRedirectResponse)
async def create_subscription_checkout(
    data: SubscriptionCheckoutRequest,
    user=Depends(require_farmer_or_buyer),
):
    try:
        return await payment_service.create_subscription_checkout(user, data)
    except StripeConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/subscription/portal", response_model=StripeRedirectResponse)
async def create_billing_portal(user=Depends(require_farmer_or_buyer)):
    try:
        return await payment_service.create_billing_portal_session(user)
    except StripeConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/subscription/webhook")
async def stripe_subscription_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="Stripe-Signature"),
):
    payload = await request.body()
    try:
        return await payment_service.handle_stripe_webhook(payload, stripe_signature)
    except StripeConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
