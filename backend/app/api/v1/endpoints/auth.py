"""Auth endpoints — register and login."""

from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services import auth_service

router = APIRouter()


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register(data: RegisterRequest):
    try:
        result = await auth_service.register_user(data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    try:
        result = await auth_service.login_user(data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
