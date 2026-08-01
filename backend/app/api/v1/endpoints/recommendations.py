"""Farmer recommendations and smart reminders."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator

from app.middleware.role_middleware import require_farmer
from app.services import recommendation_service

router = APIRouter()


class AdvisoryChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)

    @field_validator("message")
    @classmethod
    def message_must_have_text(cls, value: str) -> str:
        text = value.strip()
        if not text:
            raise ValueError("Message cannot be empty")
        return text


@router.get("/")
async def recommendations(user=Depends(require_farmer)):
    return await recommendation_service.get_farmer_recommendations(
        user["_id"], user.get("district") or "anuradhapura"
    )


@router.post("/chat")
async def advisory_chat(payload: AdvisoryChatRequest, user=Depends(require_farmer)):
    return await recommendation_service.chat_farmer_advisory(
        user["_id"], payload.message, user.get("district") or "anuradhapura"
    )
