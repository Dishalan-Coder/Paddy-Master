"""Subscription and farmer trial access rules."""

from datetime import datetime, timedelta, timezone
from typing import Any

from app.models.payment import SubscriptionStatus

ACTIVE_SUBSCRIPTION_STATUSES = {
    SubscriptionStatus.ACTIVE.value,
    SubscriptionStatus.TRIALING.value,
}

FARMER_FREE_TRIAL_DAYS = 21
FARMER_MONTHLY_PRICE_LKR = 150
BUYER_MONTHLY_PRICE_LKR = 300
FARMER_PREMIUM_FEATURES = ("marketplace", "smart_advisory", "orders")


def _as_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str) and value:
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            return None
    return None


def is_subscription_active(user: dict) -> bool:
    return (user.get("subscription_status") or "") in ACTIVE_SUBSCRIPTION_STATUSES


def plan_price_lkr(role: str | None) -> int:
    return FARMER_MONTHLY_PRICE_LKR if role == "farmer" else BUYER_MONTHLY_PRICE_LKR


def farmer_free_trial_ends_at(user: dict, now: datetime | None = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    created_at = _as_datetime(user.get("created_at")) or now
    return created_at + timedelta(days=FARMER_FREE_TRIAL_DAYS)


def is_farmer_free_trial_active(user: dict, now: datetime | None = None) -> bool:
    if user.get("role") != "farmer":
        return False
    now = now or datetime.now(timezone.utc)
    return now <= farmer_free_trial_ends_at(user, now)


def has_farmer_premium_access(user: dict) -> bool:
    return user.get("role") != "farmer" or is_subscription_active(user)


def has_farmer_general_access(user: dict) -> bool:
    return (
        user.get("role") != "farmer"
        or is_subscription_active(user)
        or is_farmer_free_trial_active(user)
    )


def access_summary(user: dict) -> dict:
    role = user.get("role")
    subscription_active = is_subscription_active(user)
    summary = {
        "subscription_active": subscription_active,
        "monthly_price_lkr": plan_price_lkr(role),
        "currency": "LKR",
    }
    if role != "farmer":
        return summary

    trial_ends_at = farmer_free_trial_ends_at(user)
    free_trial_active = is_farmer_free_trial_active(user)
    summary.update(
        {
            "free_trial_days": FARMER_FREE_TRIAL_DAYS,
            "free_trial_ends_at": trial_ends_at.isoformat(),
            "free_trial_active": free_trial_active,
            "premium_features": list(FARMER_PREMIUM_FEATURES),
            "premium_features_active": subscription_active,
            "general_features_active": subscription_active or free_trial_active,
        }
    )
    return summary
