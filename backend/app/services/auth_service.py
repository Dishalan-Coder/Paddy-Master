"""Authentication business logic."""

from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.core.jwt import create_access_token
from app.core.security import hash_password, verify_password
from app.db.mongodb import get_database_or_raise
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.notification_service import create_notification


async def register_user(data: RegisterRequest) -> dict:
    db = get_database_or_raise()
    email = str(data.email).lower()

    existing = await db.users.find_one(
        {"$or": [{"email": email}, {"phone": data.phone}]}
    )
    if existing:
        field = "email" if existing.get("email") == email else "phone"
        raise ValueError(f"{field} already registered")

    now = datetime.now(timezone.utc)
    user_doc = {
        "full_name": data.full_name,
        "phone": data.phone,
        "email": email,
        "hashed_password": hash_password(data.password),
        "role": data.role,
        "district": data.district,
        "profile_image_url": None,
        "is_verified": False,
        "rating": 0.0,
        "total_reviews": 0,
        "wallet_balance": 0.0,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await db.users.insert_one(user_doc)
    except DuplicateKeyError as exc:
        raise ValueError("Email or phone already registered") from exc

    user_id = str(result.inserted_id)
    await create_notification(
        result.inserted_id,
        "Welcome to Paddy Master",
        "Your account is ready. Complete your profile and start using your role-based workspace.",
        "system",
        "/profile",
    )
    token = create_access_token({"sub": user_id, "role": data.role})

    return TokenResponse(
        access_token=token,
        user_id=user_id,
        role=data.role,
        full_name=data.full_name,
        email=email,
        district=data.district,
    ).model_dump()


async def login_user(data: LoginRequest) -> dict:
    db = get_database_or_raise()
    login_id = data.login_id.lower() if "@" in data.login_id else data.login_id
    user = await db.users.find_one({"$or": [{"email": login_id}, {"phone": login_id}]})

    if not user or not verify_password(data.password, user.get("hashed_password", "")):
        raise ValueError("Invalid credentials")

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        role=user["role"],
        full_name=user["full_name"],
        email=user["email"],
        district=user.get("district"),
    ).model_dump()
