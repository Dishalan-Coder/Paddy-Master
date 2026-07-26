"""Daily market price model."""

from datetime import datetime, date, timezone
from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict, Field


class MarketPriceCreate(BaseModel):
    date: date
    prices: Dict[str, float] = Field(
        ..., description="e.g. {'nadu': 112, 'samba': 118, 'k_samba': 121}"
    )
    region: str = "national"


class MarketPriceInDB(MarketPriceCreate):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class MarketPriceOut(BaseModel):
    id: str
    date: date
    prices: Dict[str, float]
    region: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class RegionalPrice(BaseModel):
    region: str
    prices: Dict[str, float]
