"""Payment and subscription workflow models."""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class PaymentMethod(str, Enum):
    CASH_ON_DELIVERY = "cash_on_delivery"
    BANK_TRANSFER = "bank_transfer"
    CARD_DEMO = "card_demo"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class SubscriptionPlan(str, Enum):
    FARMER_PRO = "farmer_pro"
    BUYER_PRO = "buyer_pro"


class SubscriptionStatus(str, Enum):
    INACTIVE = "inactive"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"
    TRIALING = "trialing"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    PAUSED = "paused"
    UNPAID = "unpaid"


class PaymentRequest(BaseModel):
    method: PaymentMethod
    reference: Optional[str] = Field(default=None, max_length=120)
    demo_token: Optional[str] = Field(default=None, max_length=120)


class SubscriptionCheckoutRequest(BaseModel):
    plan: Optional[SubscriptionPlan] = None


class StripeRedirectResponse(BaseModel):
    url: str
    session_id: Optional[str] = None


class SubscriptionStatusResponse(BaseModel):
    plan: Optional[SubscriptionPlan] = None
    status: SubscriptionStatus = SubscriptionStatus.INACTIVE
    active: bool = False
    current_period_end: Optional[str] = None
    cancel_at_period_end: bool = False
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
