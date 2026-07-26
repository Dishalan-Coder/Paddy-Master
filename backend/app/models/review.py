"""Marketplace review models."""

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class ReviewCreate(BaseModel):
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3, max_length=1000)
    image_urls: List[str] = Field(default_factory=list, max_length=3)

    @field_validator("order_id", "comment", mode="before")
    @classmethod
    def strip_text(cls, value):
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    comment: Optional[str] = Field(default=None, min_length=3, max_length=1000)

    @field_validator("comment", mode="before")
    @classmethod
    def strip_update_text(cls, value):
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped or None
