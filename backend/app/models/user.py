"""User model — farmer, buyer, or admin."""

from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from enum import Enum


class UserRole(str, Enum):
    FARMER = "farmer"
    BUYER = "buyer"
    ADMIN = "admin"


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=10, pattern=r"^07\d{8}$")
    email: str = Field(..., min_length=5, max_length=100)
    role: UserRole
    district: Optional[str] = None
    profile_image_url: Optional[str] = None
    is_verified: bool = False
    rating: float = 0.0
    total_reviews: int = 0
    subscription_plan: Optional[str] = None
    subscription_status: str = "inactive"
    subscription_current_period_end: Optional[datetime] = None
    subscription_cancel_at_period_end: bool = False


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    wallet_balance: float = 0.0
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class UserOut(BaseModel):
    id: str
    full_name: str
    phone: str
    email: str
    role: UserRole
    district: Optional[str] = None
    profile_image_url: Optional[str] = None
    is_verified: bool
    rating: float
    total_reviews: int
    wallet_balance: float
    subscription_plan: Optional[str] = None
    subscription_status: str = "inactive"
    subscription_current_period_end: Optional[datetime] = None
    subscription_cancel_at_period_end: bool = False
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)
