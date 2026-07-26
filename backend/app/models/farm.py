"""Farm model."""

from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.utils.validators import get_name_validation_error


class FarmCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    area_acres: float = Field(..., gt=0)
    soil_type: Optional[str] = None
    district: Optional[str] = None

    @field_validator("name", "location", "soil_type", "district", mode="before")
    @classmethod
    def strip_text(cls, value):
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        if value is None:
            return value
        error = get_name_validation_error(value, "Farm name")
        if error:
            raise ValueError(error)
        return value


class FarmInDB(FarmCreate):
    id: str = Field(alias="_id")
    farmer_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class FarmOut(BaseModel):
    id: str
    name: str
    location: str
    area_acres: float
    soil_type: Optional[str] = None
    district: Optional[str] = None
    farmer_id: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)
