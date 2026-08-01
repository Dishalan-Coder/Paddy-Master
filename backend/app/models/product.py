"""Product model for paddy listings in the marketplace."""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

SUPPORTED_PRICE_UNITS_KG = {72, 75}


class ProductStatus(str, Enum):
    ACTIVE = "active"
    SOLD = "sold"
    EXPIRED = "expired"
    REMOVED = "removed"


class ProductCreate(BaseModel):
    variety: str = Field(..., min_length=1, max_length=50)
    quantity_kg: float = Field(..., gt=0)
    price_per_kg: float = Field(..., gt=0)
    price_unit_kg: int = Field(default=72)
    region: str = Field(..., min_length=1, max_length=100)
    district: str = Field(..., min_length=1, max_length=100)
    harvest_date: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=1000)
    is_organic: bool = False
    image_urls: List[str] = Field(default_factory=list)
    rating: float = 0.0
    total_reviews: int = 0

    @field_validator(
        "variety", "region", "district", "harvest_date", "description", mode="before"
    )
    @classmethod
    def strip_text(cls, value):
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None

    @field_validator("price_unit_kg")
    @classmethod
    def validate_price_unit(cls, value: int) -> int:
        if value not in SUPPORTED_PRICE_UNITS_KG:
            raise ValueError("Select a valid market price unit")
        return value


class ProductUpdate(BaseModel):
    variety: Optional[str] = Field(default=None, min_length=1, max_length=50)
    quantity_kg: Optional[float] = Field(default=None, gt=0)
    price_per_kg: Optional[float] = Field(default=None, gt=0)
    price_unit_kg: Optional[int] = None
    region: Optional[str] = Field(default=None, min_length=1, max_length=100)
    district: Optional[str] = Field(default=None, min_length=1, max_length=100)
    harvest_date: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=1000)
    is_organic: Optional[bool] = None
    status: Optional[ProductStatus] = None
    image_urls: Optional[List[str]] = None

    @field_validator(
        "variety", "region", "district", "harvest_date", "description", mode="before"
    )
    @classmethod
    def strip_update_text(cls, value):
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None

    @field_validator("price_unit_kg")
    @classmethod
    def validate_update_price_unit(cls, value: Optional[int]) -> Optional[int]:
        if value is not None and value not in SUPPORTED_PRICE_UNITS_KG:
            raise ValueError("Select a valid market price unit")
        return value


class ProductInDB(ProductCreate):
    id: str = Field(alias="_id")
    farmer_id: str
    status: ProductStatus = ProductStatus.ACTIVE
    views: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True, "from_attributes": True}
