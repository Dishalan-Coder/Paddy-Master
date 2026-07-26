"""Role-based access control dependencies."""

from fastapi import Depends, HTTPException, status

from app.middleware.auth_middleware import get_current_user
from app.models.user import UserRole


def require_role(*roles: UserRole):
    async def role_checker(user=Depends(get_current_user)):
        if user["role"] not in [r.value for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(r.value for r in roles)}",
            )
        return user

    return role_checker


require_farmer = require_role(UserRole.FARMER)
require_buyer = require_role(UserRole.BUYER)
require_admin = require_role(UserRole.ADMIN)
require_farmer_or_buyer = require_role(UserRole.FARMER, UserRole.BUYER)
