"""Dashboard data endpoints."""

from fastapi import APIRouter, Depends

from app.middleware.role_middleware import require_admin, require_buyer
from app.middleware.subscription_middleware import require_farmer_general_access
from app.services import report_service

router = APIRouter()


@router.get("/")
async def farmer_dashboard(user=Depends(require_farmer_general_access)):
    return await report_service.get_farmer_dashboard(user["_id"])


@router.get("/buyer")
async def buyer_dashboard(user=Depends(require_buyer)):
    return await report_service.get_buyer_dashboard(user["_id"])


@router.get("/admin")
async def admin_dashboard(admin=Depends(require_admin)):
    return await report_service.get_admin_analytics()
