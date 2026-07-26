"""Authenticated notification endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.middleware.auth_middleware import get_current_user
from app.services import notification_service

router = APIRouter()


@router.get("/")
async def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(30, ge=1, le=100),
    user=Depends(get_current_user),
):
    if user.get("role") == "farmer":
        await notification_service.ensure_daily_crop_reminders(user["_id"])
    return await notification_service.get_notifications(user["_id"], unread_only, limit)


@router.patch("/read-all")
async def read_all(user=Depends(get_current_user)):
    count = await notification_service.mark_all_read(user["_id"])
    return {"updated": count}


@router.patch("/{notification_id}/read")
async def read_notification(notification_id: str, user=Depends(get_current_user)):
    result = await notification_service.mark_read(notification_id, user["_id"])
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return result
