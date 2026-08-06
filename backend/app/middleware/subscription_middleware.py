"""Subscription access dependencies."""

from fastapi import Depends, HTTPException, status

from app.middleware.role_middleware import require_farmer
from app.services.subscription_access import (
    has_farmer_general_access,
    has_farmer_premium_access,
)

FARMER_PREMIUM_REQUIRED_MESSAGE = (
    "Farmer subscription required for Marketplace, Smart Advisory, and Orders"
)
FARMER_TRIAL_EXPIRED_MESSAGE = (
    "Your 21-day free access has ended. Start the LKR 150 farmer subscription to continue."
)


def assert_farmer_premium_access(user: dict) -> None:
    if not has_farmer_premium_access(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=FARMER_PREMIUM_REQUIRED_MESSAGE,
        )


def assert_farmer_general_access(user: dict) -> None:
    if not has_farmer_general_access(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=FARMER_TRIAL_EXPIRED_MESSAGE,
        )


async def require_farmer_premium_access(user=Depends(require_farmer)):
    assert_farmer_premium_access(user)
    return user


async def require_farmer_general_access(user=Depends(require_farmer)):
    assert_farmer_general_access(user)
    return user
