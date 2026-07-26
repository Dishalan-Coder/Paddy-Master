"""Expense model for tracking farm costs."""

from datetime import datetime, timezone, date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from enum import Enum


class ExpenseCategory(str, Enum):
    SEEDS = "seeds"
    FERTILIZER = "fertilizer"
    PESTICIDE = "pesticide"
    LABOR = "labor"
    IRRIGATION = "irrigation"
    EQUIPMENT = "equipment"
    TRANSPORT = "transport"
    OTHER = "other"


class ExpenseCreate(BaseModel):
    crop_id: Optional[str] = None
    farm_id: Optional[str] = None
    category: ExpenseCategory
    amount: float = Field(..., gt=0)
    description: str = Field(..., min_length=1, max_length=200)
    expense_date: date

    @field_validator("crop_id", "farm_id", "description", mode="before")
    @classmethod
    def strip_text(cls, value):
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None


class ExpenseInDB(ExpenseCreate):
    id: str = Field(alias="_id")
    farmer_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class ExpenseOut(BaseModel):
    id: str
    crop_id: Optional[str] = None
    farm_id: Optional[str] = None
    farmer_id: str
    category: ExpenseCategory
    amount: float
    description: str
    expense_date: date
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)
