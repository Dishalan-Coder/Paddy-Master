"""Chat message model."""

from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    conversation_id: str
    sender_id: str
    receiver_id: str
    content: str = Field(..., min_length=1, max_length=2000)


class MessageInDB(MessageCreate):
    id: str = Field(alias="_id")
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    receiver_id: str
    content: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)