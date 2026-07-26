"""User profile endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, EmailStr, Field, field_validator
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_database_or_raise
from app.middleware.auth_middleware import get_current_user
from app.services import s3_service
from app.utils.mongo import serialize_document
from app.utils.validators import get_name_validation_error, get_phone_validation_error

router = APIRouter()
MAX_IMAGE_SIZE = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
VALID_DISTRICTS = {
    "Anuradhapura",
    "Polonnaruwa",
    "Kurunegala",
    "Hambantota",
    "Ampara",
    "Mannar",
    "Trincomalee",
    "Batticaloa",
    "Jaffna",
    "Kilinochchi",
    "Mullaitivu",
    "Vavuniya",
    "Puttalam",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Badulla",
    "Monaragala",
    "Ratnapura",
    "Kegalle",
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Galle",
    "Matara",
}


def present_user(user: dict) -> dict:
    safe_user = serialize_document(user)
    safe_user.pop("hashed_password", None)
    stored_key = user.get("profile_image_key") or user.get("profile_image_url")
    safe_user["profile_image_url"] = s3_service.resolve_file_url(stored_key)
    safe_user.pop("profile_image_key", None)
    return safe_user


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None)
    email: EmailStr | None = None
    district: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=300)
    bio: str | None = Field(default=None, max_length=500)

    @field_validator("full_name", "phone", "district", "address", "bio", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email", mode="before")
    @classmethod
    def strip_email(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        return str(value).lower() if value is not None else value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if value is None:
            return value
        error = get_phone_validation_error(value)
        if error:
            raise ValueError(error)
        return value

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value):
        if value is None:
            return value
        error = get_name_validation_error(value, "Full name")
        if error:
            raise ValueError(error)
        return value

    @field_validator("district")
    @classmethod
    def validate_district(cls, value):
        if value is None:
            return value
        if value not in VALID_DISTRICTS:
            raise ValueError("Select a valid district")
        return value


@router.get("/me")
async def get_my_profile(user=Depends(get_current_user)):
    return present_user(user)


@router.put("/me")
async def update_profile(update_data: ProfileUpdate, user=Depends(get_current_user)):
    db = get_database_or_raise()
    filtered = update_data.model_dump(exclude_none=True)
    if not filtered:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    duplicate_checks = []
    if "email" in filtered and filtered["email"] != user.get("email"):
        duplicate_checks.append(
            {"email": filtered["email"], "_id": {"$ne": user["_id"]}}
        )
    if "phone" in filtered and filtered["phone"] != user.get("phone"):
        duplicate_checks.append(
            {"phone": filtered["phone"], "_id": {"$ne": user["_id"]}}
        )
    if duplicate_checks and await db.users.find_one({"$or": duplicate_checks}):
        raise HTTPException(status_code=409, detail="Email or phone already in use")

    filtered["updated_at"] = datetime.now(timezone.utc)
    try:
        result = await db.users.find_one_and_update(
            {"_id": user["_id"]},
            {"$set": filtered},
            return_document=ReturnDocument.AFTER,
        )
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=409, detail="Email or phone already in use"
        ) from exc

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    return present_user(result)


@router.post("/me/photo")
async def upload_profile_photo(
    image: UploadFile = File(...),
    user=Depends(get_current_user),
):
    content_type = image.content_type or "application/octet-stream"
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Use a JPG, PNG, or WebP image")
    content = await image.read(MAX_IMAGE_SIZE + 1)
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be 5 MB or smaller")
    key = s3_service.upload_file(content, "profiles", content_type)
    if not key:
        raise HTTPException(
            status_code=503, detail="Image storage is currently unavailable"
        )
    image_url = s3_service.resolve_file_url(key)
    if not image_url:
        raise HTTPException(status_code=503, detail="Could not create image URL")

    db = get_database_or_raise()
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "profile_image_key": key,
                "profile_image_url": None,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    return {"profile_image_url": image_url}
