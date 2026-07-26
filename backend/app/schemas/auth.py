"""Authentication request and response schemas."""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.utils.validators import get_phone_validation_error


class LoginRequest(BaseModel):
    login_id: str = Field(..., min_length=3, max_length=120, description="Phone number or email")
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("login_id")
    @classmethod
    def clean_login_id(cls, value: str) -> str:
        return value.strip().lower() if "@" in value else value.strip()


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(...)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(..., pattern="^(farmer|buyer)$")
    district: Optional[str] = Field(default=None, max_length=100)

    @field_validator("full_name", "phone", "district", mode="before")
    @classmethod
    def strip_text(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if isinstance(value, str) else value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        error = get_phone_validation_error(value)
        if error:
            raise ValueError(error)
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    full_name: str
    email: str
    district: Optional[str] = None
