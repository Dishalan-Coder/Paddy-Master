"""Order payments and Stripe subscription billing."""

from datetime import datetime, timezone
from typing import Any

from pymongo import ReturnDocument

from app.core.config import settings
from app.db.mongodb import get_database_or_raise
from app.models.payment import (
    PaymentMethod,
    PaymentRequest,
    PaymentStatus,
    SubscriptionCheckoutRequest,
    SubscriptionPlan,
    SubscriptionStatus,
)
from app.services.notification_service import create_notification
from app.utils.mongo import object_id_or_none, serialize_document

ACTIVE_SUBSCRIPTION_STATUSES = {
    SubscriptionStatus.ACTIVE.value,
    SubscriptionStatus.TRIALING.value,
}

STRIPE_SUBSCRIPTION_EVENTS = {
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
}


class StripeConfigurationError(RuntimeError):
    """Raised when Stripe billing is unavailable because config is incomplete."""


def _object_value(source: Any, key: str, default: Any = None) -> Any:
    if source is None:
        return default
    if isinstance(source, dict):
        return source.get(key, default)
    getter = getattr(source, "get", None)
    if callable(getter):
        return getter(key, default)
    return getattr(source, key, default)


def _stripe_client():
    if not settings.STRIPE_SECRET_KEY.strip():
        raise StripeConfigurationError("Stripe secret key is not configured.")

    try:
        import stripe
    except ImportError as exc:
        raise StripeConfigurationError(
            "Stripe SDK is not installed. Install backend requirements first."
        ) from exc

    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def _public_url(path: str) -> str:
    base_url = settings.PUBLIC_SITE_URL.strip().rstrip("/")
    if not base_url:
        raise StripeConfigurationError("PUBLIC_SITE_URL is not configured.")
    return f"{base_url}{path}"


def _success_url() -> str:
    return settings.STRIPE_SUCCESS_URL.strip() or _public_url(
        "/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}"
    )


def _cancel_url() -> str:
    return settings.STRIPE_CANCEL_URL.strip() or _public_url(
        "/billing?checkout=cancelled"
    )


def _billing_return_url() -> str:
    return settings.STRIPE_BILLING_RETURN_URL.strip() or _public_url("/billing")


def _plan_settings(plan: SubscriptionPlan) -> dict:
    plans = {
        SubscriptionPlan.FARMER_PRO: {
            "role": "farmer",
            "price_id": settings.STRIPE_FARMER_PRICE_ID.strip(),
            "name": "Farmer Pro",
        },
        SubscriptionPlan.BUYER_PRO: {
            "role": "buyer",
            "price_id": settings.STRIPE_BUYER_PRICE_ID.strip(),
            "name": "Buyer Pro",
        },
    }
    return plans[plan]


def _default_plan_for_role(role: str) -> SubscriptionPlan:
    if role == "farmer":
        return SubscriptionPlan.FARMER_PRO
    if role == "buyer":
        return SubscriptionPlan.BUYER_PRO
    raise ValueError("Subscriptions are available for farmers and buyers only")


def _resolve_plan(user: dict, requested_plan: SubscriptionPlan | None) -> tuple:
    plan = requested_plan or _default_plan_for_role(user.get("role"))
    plan_settings = _plan_settings(plan)
    if plan_settings["role"] != user.get("role"):
        raise ValueError("This subscription plan is not available for your role")
    if not plan_settings["price_id"]:
        raise StripeConfigurationError(
            f"Stripe price ID is not configured for {plan_settings['name']}."
        )
    return plan, plan_settings


def _datetime_from_timestamp(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    try:
        return datetime.fromtimestamp(int(value), tz=timezone.utc)
    except (TypeError, ValueError, OSError):
        return None


def _iso_datetime(value: Any) -> str | None:
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def _plan_from_price(price_id: str | None, fallback: Any = None) -> str | None:
    if fallback:
        return str(fallback)
    if price_id == settings.STRIPE_FARMER_PRICE_ID.strip():
        return SubscriptionPlan.FARMER_PRO.value
    if price_id == settings.STRIPE_BUYER_PRICE_ID.strip():
        return SubscriptionPlan.BUYER_PRO.value
    return None


async def pay_order(order_id: str, buyer_id, data: PaymentRequest) -> dict:
    db = get_database_or_raise()
    oid = object_id_or_none(order_id)
    if oid is None:
        raise ValueError("Invalid order identifier")
    order = await db.orders.find_one({"_id": oid, "buyer_id": buyer_id})
    if not order:
        raise ValueError("Order not found")
    if order.get("status") == "cancelled":
        raise ValueError("Cancelled orders cannot be paid")
    if order.get("payment_status") == PaymentStatus.PAID.value:
        raise ValueError("Order is already paid")

    method = data.method.value
    if data.method == PaymentMethod.CARD_DEMO:
        if data.demo_token != "demo-success":
            status = PaymentStatus.FAILED.value
        else:
            status = PaymentStatus.PAID.value
    elif data.method == PaymentMethod.BANK_TRANSFER:
        if not data.reference or len(data.reference.strip()) < 4:
            raise ValueError("Bank transfer reference is required")
        status = PaymentStatus.PROCESSING.value
    else:
        status = PaymentStatus.PENDING.value

    now = datetime.now(timezone.utc)
    update = {
        "payment_method": method,
        "payment_status": status,
        "payment_reference": data.reference.strip() if data.reference else None,
        "paid_at": now if status == PaymentStatus.PAID.value else None,
        "updated_at": now,
    }
    result = await db.orders.find_one_and_update(
        {"_id": oid, "buyer_id": buyer_id},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
    )
    await create_notification(
        buyer_id,
        "Payment updated",
        f"Payment for order {str(oid)[-6:]} is {status.replace('_', ' ')}.",
        "payment",
        "/orders",
        {"order_id": str(oid), "status": status},
    )
    return serialize_document(result)


async def confirm_bank_transfer(order_id: str) -> dict:
    """Confirm a processing bank transfer and credit delivered orders once."""
    db = get_database_or_raise()
    oid = object_id_or_none(order_id)
    if oid is None:
        raise ValueError("Invalid order identifier")

    order = await db.orders.find_one({"_id": oid})
    if not order:
        raise ValueError("Order not found")
    if order.get("status") == "cancelled":
        raise ValueError("Cancelled orders cannot be confirmed")
    if order.get("payment_method") != PaymentMethod.BANK_TRANSFER.value:
        raise ValueError("Only bank transfers require administrator confirmation")
    if order.get("payment_status") == PaymentStatus.PAID.value:
        raise ValueError("Payment is already confirmed")
    if order.get("payment_status") != PaymentStatus.PROCESSING.value:
        raise ValueError("Bank transfer is not awaiting confirmation")

    now = datetime.now(timezone.utc)
    result = await db.orders.find_one_and_update(
        {"_id": oid, "payment_status": PaymentStatus.PROCESSING.value},
        {
            "$set": {
                "payment_status": PaymentStatus.PAID.value,
                "paid_at": now,
                "updated_at": now,
            }
        },
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise ValueError("Payment state changed; refresh and try again")

    if result.get("status") == "delivered":
        credit_claim = await db.orders.find_one_and_update(
            {"_id": oid, "wallet_credited": {"$ne": True}},
            {"$set": {"wallet_credited": True, "updated_at": now}},
            return_document=ReturnDocument.AFTER,
        )
        if credit_claim:
            await db.users.update_one(
                {"_id": result["farmer_id"]},
                {
                    "$inc": {"wallet_balance": result["total_price"]},
                    "$set": {"updated_at": now},
                },
            )
            result["wallet_credited"] = True

    order_code = str(oid)[-6:].upper()
    await create_notification(
        result["buyer_id"],
        "Bank transfer confirmed",
        f"Payment for order #{order_code} has been confirmed.",
        "payment",
        "/orders",
        {"order_id": str(oid), "status": PaymentStatus.PAID.value},
    )
    await create_notification(
        result["farmer_id"],
        "Buyer payment confirmed",
        f"Bank transfer for order #{order_code} has been confirmed.",
        "payment",
        "/orders",
        {"order_id": str(oid), "status": PaymentStatus.PAID.value},
    )
    return serialize_document(result)


def subscription_summary(user: dict) -> dict:
    status = user.get("subscription_status") or SubscriptionStatus.INACTIVE.value
    if status not in {item.value for item in SubscriptionStatus}:
        status = SubscriptionStatus.INACTIVE.value
    plan = user.get("subscription_plan")
    if plan not in {item.value for item in SubscriptionPlan}:
        plan = None
    return {
        "plan": plan,
        "status": status,
        "active": status in ACTIVE_SUBSCRIPTION_STATUSES,
        "current_period_end": _iso_datetime(
            user.get("subscription_current_period_end")
        ),
        "cancel_at_period_end": bool(
            user.get("subscription_cancel_at_period_end", False)
        ),
        "stripe_customer_id": user.get("stripe_customer_id"),
        "stripe_subscription_id": user.get("stripe_subscription_id"),
    }


async def create_subscription_checkout(
    user: dict, data: SubscriptionCheckoutRequest
) -> dict:
    stripe = _stripe_client()
    db = get_database_or_raise()
    current = subscription_summary(user)
    if current["active"]:
        raise ValueError("An active subscription already exists")

    plan, plan_settings = _resolve_plan(user, data.plan)
    customer_id = user.get("stripe_customer_id")
    user_id = str(user["_id"])
    now = datetime.now(timezone.utc)

    try:
        if not customer_id:
            customer = stripe.Customer.create(
                email=user.get("email"),
                name=user.get("full_name"),
                metadata={"user_id": user_id, "role": user.get("role")},
            )
            customer_id = _object_value(customer, "id")
            await db.users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "stripe_customer_id": customer_id,
                        "updated_at": now,
                    }
                },
            )

        checkout_session = stripe.checkout.Session.create(
            mode="subscription",
            customer=customer_id,
            client_reference_id=user_id,
            line_items=[{"price": plan_settings["price_id"], "quantity": 1}],
            success_url=_success_url(),
            cancel_url=_cancel_url(),
            allow_promotion_codes=True,
            metadata={"user_id": user_id, "plan": plan.value},
            subscription_data={"metadata": {"user_id": user_id, "plan": plan.value}},
        )
    except Exception as exc:  # Stripe raises a family of request exceptions.
        raise RuntimeError(f"Could not create Stripe checkout session: {exc}") from exc

    session_id = _object_value(checkout_session, "id")
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "subscription_plan": plan.value,
                "subscription_status": SubscriptionStatus.INCOMPLETE.value,
                "stripe_checkout_session_id": session_id,
                "updated_at": now,
            }
        },
    )
    return {"url": _object_value(checkout_session, "url"), "session_id": session_id}


async def create_billing_portal_session(user: dict) -> dict:
    stripe = _stripe_client()
    customer_id = user.get("stripe_customer_id")
    if not customer_id:
        raise ValueError("Start a subscription before opening billing management")

    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=_billing_return_url(),
        )
    except Exception as exc:
        raise RuntimeError(f"Could not create Stripe billing portal session: {exc}") from exc

    return {"url": _object_value(portal_session, "url"), "session_id": None}


async def _sync_subscription(subscription: Any) -> dict | None:
    db = get_database_or_raise()
    subscription_id = _object_value(subscription, "id")
    customer_id = _object_value(subscription, "customer")
    metadata = _object_value(subscription, "metadata", {}) or {}
    user_id = metadata.get("user_id")
    status = _object_value(subscription, "status", SubscriptionStatus.INACTIVE.value)
    items = _object_value(_object_value(subscription, "items"), "data", []) or []
    first_item = items[0] if items else None
    price_id = _object_value(_object_value(first_item, "price"), "id")

    query_options = []
    oid = object_id_or_none(user_id) if user_id else None
    if oid is not None:
        query_options.append({"_id": oid})
    if subscription_id:
        query_options.append({"stripe_subscription_id": subscription_id})
    if customer_id:
        query_options.append({"stripe_customer_id": customer_id})
    if not query_options:
        return None

    update = {
        "stripe_customer_id": customer_id,
        "stripe_subscription_id": subscription_id,
        "subscription_plan": _plan_from_price(price_id, metadata.get("plan")),
        "subscription_price_id": price_id,
        "subscription_status": status,
        "subscription_current_period_start": _datetime_from_timestamp(
            _object_value(subscription, "current_period_start")
        ),
        "subscription_current_period_end": _datetime_from_timestamp(
            _object_value(subscription, "current_period_end")
        ),
        "subscription_cancel_at_period_end": bool(
            _object_value(subscription, "cancel_at_period_end", False)
        ),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.users.find_one_and_update(
        {"$or": query_options},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
    )
    return serialize_document(result) if result else None


async def _sync_checkout_session(session: Any) -> dict | None:
    db = get_database_or_raise()
    metadata = _object_value(session, "metadata", {}) or {}
    user_id = metadata.get("user_id") or _object_value(session, "client_reference_id")
    oid = object_id_or_none(user_id) if user_id else None
    if oid is None:
        return None

    update = {
        "stripe_customer_id": _object_value(session, "customer"),
        "stripe_subscription_id": _object_value(session, "subscription"),
        "subscription_plan": metadata.get("plan"),
        "subscription_status": SubscriptionStatus.ACTIVE.value,
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.users.find_one_and_update(
        {"_id": oid},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
    )
    return serialize_document(result) if result else None


async def handle_stripe_webhook(payload: bytes, signature: str | None) -> dict:
    stripe = _stripe_client()
    if not settings.STRIPE_WEBHOOK_SECRET.strip():
        raise StripeConfigurationError("Stripe webhook secret is not configured.")
    if not signature:
        raise ValueError("Stripe signature header is missing")

    try:
        event = stripe.Webhook.construct_event(
            payload, signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as exc:
        raise ValueError("Invalid Stripe webhook payload") from exc
    except Exception as exc:
        if exc.__class__.__name__ == "SignatureVerificationError":
            raise ValueError("Invalid Stripe webhook signature") from exc
        raise

    db = get_database_or_raise()
    event_id = _object_value(event, "id")
    event_type = _object_value(event, "type")
    if event_id and await db.stripe_events.find_one({"event_id": event_id}):
        return {"received": True, "duplicate": True}

    data = _object_value(event, "data", {}) or {}
    event_object = _object_value(data, "object")
    synced_user = None

    if event_type == "checkout.session.completed":
        synced_user = await _sync_checkout_session(event_object)
        subscription_id = _object_value(event_object, "subscription")
        if subscription_id:
            try:
                synced_user = await _sync_subscription(
                    stripe.Subscription.retrieve(subscription_id)
                )
            except Exception:
                pass
    elif event_type in STRIPE_SUBSCRIPTION_EVENTS:
        synced_user = await _sync_subscription(event_object)

    if event_id:
        await db.stripe_events.insert_one(
            {
                "event_id": event_id,
                "type": event_type,
                "processed_at": datetime.now(timezone.utc),
                "user_id": synced_user.get("_id") if synced_user else None,
            }
        )

    return {"received": True, "type": event_type}
