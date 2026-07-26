"""Notification and reminder data models."""

from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class NotificationType(str, Enum):
    ORDER = "order"
    PAYMENT = "payment"
    WEATHER = "weather"
    CROP = "crop"
    REMINDER = "reminder"
    SYSTEM = "system"


class NotificationCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    message: str = Field(..., min_length=2, max_length=600)
    type: NotificationType = NotificationType.SYSTEM
    action_url: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
