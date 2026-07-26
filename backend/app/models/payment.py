"""Basic payment workflow models.

The included card flow is a local demo workflow, not a real payment gateway.
"""

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


class PaymentRequest(BaseModel):
    method: PaymentMethod
    reference: Optional[str] = Field(default=None, max_length=120)
    demo_token: Optional[str] = Field(default=None, max_length=120)
