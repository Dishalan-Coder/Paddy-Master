"""MongoDB identifier and serialization helpers."""

from datetime import date, datetime
from enum import Enum
from typing import Any, Optional

from bson import ObjectId


def to_object_id(value: Any) -> ObjectId:
    """Convert a string/ObjectId to ObjectId or raise ValueError."""
    if isinstance(value, ObjectId):
        return value
    text = str(value)
    if not ObjectId.is_valid(text):
        raise ValueError("Invalid identifier")
    return ObjectId(text)


def object_id_or_none(value: Any) -> Optional[ObjectId]:
    try:
        return to_object_id(value)
    except (TypeError, ValueError):
        return None


def serialize_document(value: Any) -> Any:
    """Recursively make MongoDB documents JSON-safe."""
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, (datetime, date)):
        return value
    if isinstance(value, dict):
        return {key: serialize_document(item) for key, item in value.items()}
    if isinstance(value, list):
        return [serialize_document(item) for item in value]
    if isinstance(value, tuple):
        return [serialize_document(item) for item in value]
    return value
