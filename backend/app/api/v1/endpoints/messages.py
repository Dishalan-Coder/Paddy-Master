"""Chat message endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.middleware.auth_middleware import get_current_user
from app.services import message_service

router = APIRouter()


class SendMessageRequest(BaseModel):
    receiver_id: str
    content: str = Field(..., min_length=1, max_length=2000)


@router.post("/{conversation_id}")
async def send_message(
    conversation_id: str, data: SendMessageRequest, user=Depends(get_current_user)
):
    try:
        return await message_service.send_message(
            conversation_id, user["_id"], data.receiver_id, data.content
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{conversation_id}")
async def get_messages(conversation_id: str, user=Depends(get_current_user)):
    return await message_service.get_messages(conversation_id, user["_id"])
