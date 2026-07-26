"""Order model for marketplace transactions."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.payment import PaymentMethod, PaymentStatus


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PICKUP_SCHEDULED = "pickup_scheduled"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class OrderCreate(BaseModel):
    product_id: str
    quantity_kg: float = Field(..., gt=0)
    delivery_address: str = Field(..., min_length=5, max_length=300)
    payment_method: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY
    notes: Optional[str] = Field(default=None, max_length=500)

    @field_validator("product_id", "delivery_address", "notes", mode="before")
    @classmethod
    def strip_text(cls, value):
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None


class OrderInDB(OrderCreate):
    id: str = Field(alias="_id")
    buyer_id: str
    farmer_id: str
    total_price: float
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_reference: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
