"""Crop model with growth stage tracking."""

from datetime import datetime, date, timezone
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from enum import Enum


class GrowthStage(str, Enum):
    PLANTED = "planted"
    GERMINATION = "germination"
    TILLERING = "tillering"
    STEM_ELONGATION = "stem_elongation"
    BOOTING = "booting"
    HEADING = "heading"
    FLOWERING = "flowering"
    GRAIN_FILLING = "grain_filling"
    MATURITY = "maturity"
    HARVESTED = "harvested"


class CropCreate(BaseModel):
    farm_id: str
    variety: str = Field(..., min_length=1, max_length=50)
    planting_date: date
    expected_harvest_date: date
    area_acres: float = Field(..., gt=0)
    growth_stage: GrowthStage = GrowthStage.PLANTED
    notes: Optional[str] = Field(default=None, max_length=500)

    @field_validator("farm_id", "variety", "notes", mode="before")
    @classmethod
    def strip_text(cls, value):
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.expected_harvest_date <= self.planting_date:
            raise ValueError("Expected harvest date must be after planting date")
        return self


class CropUpdate(BaseModel):
    variety: Optional[str] = Field(default=None, min_length=1, max_length=50)
    planting_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    area_acres: Optional[float] = Field(default=None, gt=0)
    growth_stage: Optional[GrowthStage] = None
    notes: Optional[str] = Field(default=None, max_length=500)

    @field_validator("variety", "notes", mode="before")
    @classmethod
    def strip_update_text(cls, value):
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None

    @model_validator(mode="after")
    def validate_update_dates(self):
        if (
            self.planting_date
            and self.expected_harvest_date
            and self.expected_harvest_date <= self.planting_date
        ):
            raise ValueError("Expected harvest date must be after planting date")
        return self


class CropInDB(CropCreate):
    id: str = Field(alias="_id")
    farmer_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class CropOut(BaseModel):
    id: str
    farm_id: str
    farmer_id: str
    variety: str
    planting_date: date
    expected_harvest_date: date
    area_acres: float
    growth_stage: GrowthStage
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(populate_by_name=True)
