"""Order creation, payment metadata, and status management."""

from datetime import datetime, timezone
from typing import List, Optional

from pymongo import ReturnDocument

from app.db.mongodb import get_database_or_raise
from app.models.order import OrderCreate, OrderStatus
from app.models.payment import PaymentMethod, PaymentStatus
from app.models.product import ProductStatus
from app.services.notification_service import create_notification
from app.services.s3_service import resolve_file_url
from app.utils.mongo import object_id_or_none, serialize_document

FARMER_TRANSITIONS = {
    OrderStatus.PENDING.value: OrderStatus.CONFIRMED.value,
    OrderStatus.CONFIRMED.value: OrderStatus.PICKUP_SCHEDULED.value,
    OrderStatus.PICKUP_SCHEDULED.value: OrderStatus.IN_TRANSIT.value,
    OrderStatus.IN_TRANSIT.value: OrderStatus.DELIVERED.value,
}

ADMIN_TRANSITIONS = {
    OrderStatus.PENDING.value: {
        OrderStatus.CONFIRMED.value,
        OrderStatus.CANCELLED.value,
        OrderStatus.DISPUTED.value,
    },
    OrderStatus.CONFIRMED.value: {
        OrderStatus.PICKUP_SCHEDULED.value,
        OrderStatus.CANCELLED.value,
        OrderStatus.DISPUTED.value,
    },
    OrderStatus.PICKUP_SCHEDULED.value: {
        OrderStatus.IN_TRANSIT.value,
        OrderStatus.CANCELLED.value,
        OrderStatus.DISPUTED.value,
    },
    OrderStatus.IN_TRANSIT.value: {
        OrderStatus.DELIVERED.value,
        OrderStatus.DISPUTED.value,
    },
    OrderStatus.DELIVERED.value: set(),
    OrderStatus.DISPUTED.value: {
        OrderStatus.DELIVERED.value,
        OrderStatus.CANCELLED.value,
    },
    OrderStatus.CANCELLED.value: set(),
}


async def create_order(buyer_id, data: OrderCreate) -> dict:
    db = get_database_or_raise()
    product_id = object_id_or_none(data.product_id)
    if product_id is None:
        raise ValueError("Invalid product identifier")

    quantity = float(data.quantity_kg)
    now = datetime.now(timezone.utc)
    product = await db.products.find_one_and_update(
        {
            "_id": product_id,
            "status": ProductStatus.ACTIVE.value,
            "quantity_kg": {"$gte": quantity},
            "farmer_id": {"$ne": buyer_id},
        },
        {"$inc": {"quantity_kg": -quantity}, "$set": {"updated_at": now}},
        return_document=ReturnDocument.BEFORE,
    )

    if not product:
        existing = await db.products.find_one({"_id": product_id})
        if not existing or existing.get("status") != ProductStatus.ACTIVE.value:
            raise ValueError("Product not found or not available")
        if existing.get("farmer_id") == buyer_id:
            raise ValueError("You cannot order your own product")
        raise ValueError(f"Only {existing.get('quantity_kg', 0)}kg available")

    remaining = float(product["quantity_kg"]) - quantity
    if remaining <= 0:
        await db.products.update_one(
            {"_id": product_id},
            {
                "$set": {
                    "quantity_kg": 0,
                    "status": ProductStatus.SOLD.value,
                    "updated_at": now,
                }
            },
        )

    payment_method = data.payment_method.value
    doc = {
        "product_id": product_id,
        "buyer_id": buyer_id,
        "farmer_id": product["farmer_id"],
        "quantity_kg": quantity,
        "unit_price": float(product["price_per_kg"]),
        "total_price": round(quantity * float(product["price_per_kg"]), 2),
        "delivery_address": data.delivery_address.strip(),
        "notes": data.notes.strip() if data.notes else None,
        "status": OrderStatus.PENDING.value,
        "payment_method": payment_method,
        "payment_status": PaymentStatus.PENDING.value,
        "payment_reference": None,
        "paid_at": None,
        "wallet_credited": False,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await db.orders.insert_one(doc)
    except Exception:
        await db.products.update_one(
            {"_id": product_id},
            {
                "$inc": {"quantity_kg": quantity},
                "$set": {
                    "status": ProductStatus.ACTIVE.value,
                    "updated_at": datetime.now(timezone.utc),
                },
            },
        )
        raise

    doc["_id"] = result.inserted_id
    order_code = str(result.inserted_id)[-6:].upper()
    await create_notification(
        buyer_id,
        "Order placed",
        f"Your {product.get('variety', 'paddy')} order #{order_code} has been sent to the farmer.",
        "order",
        "/orders",
        {"order_id": str(result.inserted_id)},
    )
    await create_notification(
        product["farmer_id"],
        "New marketplace order",
        f"A buyer ordered {quantity:g} kg of {product.get('variety', 'paddy')}.",
        "order",
        "/orders",
        {"order_id": str(result.inserted_id)},
    )
    return serialize_document(doc)


async def _enrich_orders(db, orders: List[dict], include_buyer: bool) -> List[dict]:
    if not orders:
        return []
    product_ids = list({o["product_id"] for o in orders})
    user_ids = list(
        {o["buyer_id"] if include_buyer else o["farmer_id"] for o in orders}
    )
    products = await db.products.find(
        {"_id": {"$in": product_ids}},
        {"variety": 1, "image_urls": 1, "district": 1},
    ).to_list(len(product_ids))
    users = await db.users.find(
        {"_id": {"$in": user_ids}},
        {"full_name": 1, "phone": 1, "rating": 1},
    ).to_list(len(user_ids))
    product_map = {p["_id"]: p for p in products}
    user_map = {u["_id"]: u for u in users}

    for order in orders:
        product = product_map.get(order["product_id"], {})
        order["product_variety"] = product.get("variety", "Unknown")
        order["product_image_url"] = resolve_file_url(
            (product.get("image_urls") or [None])[0]
        )
        user_key = order["buyer_id"] if include_buyer else order["farmer_id"]
        profile = user_map.get(user_key, {})
        if include_buyer:
            order["buyer_name"] = profile.get("full_name", "Unknown")
            order["buyer_phone"] = profile.get("phone")
        else:
            order["farmer_name"] = profile.get("full_name", "Unknown")
            order["farmer_phone"] = profile.get("phone")
            order["farmer_rating"] = profile.get("rating", 0)
    return serialize_document(orders)


async def get_buyer_orders(buyer_id) -> List[dict]:
    db = get_database_or_raise()
    orders = (
        await db.orders.find({"buyer_id": buyer_id}).sort("created_at", -1).to_list(100)
    )
    return await _enrich_orders(db, orders, include_buyer=False)


async def get_farmer_orders(farmer_id) -> List[dict]:
    db = get_database_or_raise()
    orders = (
        await db.orders.find({"farmer_id": farmer_id})
        .sort("created_at", -1)
        .to_list(100)
    )
    return await _enrich_orders(db, orders, include_buyer=True)


async def update_order_status(
    order_id: str, user: dict, new_status: str
) -> Optional[dict]:
    db = get_database_or_raise()
    oid = object_id_or_none(order_id)
    if oid is None:
        return None
    if new_status not in {status.value for status in OrderStatus}:
        raise ValueError("Invalid order status")

    order = await db.orders.find_one({"_id": oid})
    if not order:
        return None

    user_id = user["_id"]
    role = user.get("role")
    current = order["status"]

    if new_status == current:
        raise ValueError(f"Order is already {current}")

    if role == "admin":
        allowed = new_status in ADMIN_TRANSITIONS.get(current, set())
    elif order["farmer_id"] == user_id:
        allowed = FARMER_TRANSITIONS.get(current) == new_status
    elif order["buyer_id"] == user_id:
        allowed = new_status == OrderStatus.CANCELLED.value and current in {
            OrderStatus.PENDING.value,
            OrderStatus.CONFIRMED.value,
        }
    else:
        allowed = False

    if not allowed:
        raise ValueError(f"Cannot change order from {current} to {new_status}")

    if (
        new_status == OrderStatus.DELIVERED.value
        and order.get("payment_method") != PaymentMethod.CASH_ON_DELIVERY.value
        and order.get("payment_status") != PaymentStatus.PAID.value
    ):
        raise ValueError("Payment must be confirmed before delivery")

    now = datetime.now(timezone.utc)
    set_fields = {"status": new_status, "updated_at": now}
    if new_status == OrderStatus.CANCELLED.value:
        if order.get("payment_status") == PaymentStatus.PAID.value:
            set_fields["payment_status"] = PaymentStatus.REFUNDED.value
        elif order.get("payment_status") == PaymentStatus.PROCESSING.value:
            set_fields["payment_status"] = PaymentStatus.FAILED.value
    if (
        new_status == OrderStatus.DELIVERED.value
        and order.get("payment_method") == PaymentMethod.CASH_ON_DELIVERY.value
    ):
        set_fields.update({"payment_status": PaymentStatus.PAID.value, "paid_at": now})

    result = await db.orders.find_one_and_update(
        {"_id": oid, "status": current},
        {"$set": set_fields},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise ValueError("Order status changed; refresh and try again")

    if new_status == OrderStatus.CANCELLED.value:
        await db.products.update_one(
            {"_id": order["product_id"]},
            {
                "$inc": {"quantity_kg": order["quantity_kg"]},
                "$set": {"status": ProductStatus.ACTIVE.value, "updated_at": now},
            },
        )
    elif new_status == OrderStatus.DELIVERED.value:
        credit_claim = await db.orders.find_one_and_update(
            {"_id": oid, "wallet_credited": {"$ne": True}},
            {"$set": {"wallet_credited": True, "updated_at": now}},
            return_document=ReturnDocument.AFTER,
        )
        if credit_claim:
            await db.users.update_one(
                {"_id": order["farmer_id"]},
                {
                    "$inc": {"wallet_balance": order["total_price"]},
                    "$set": {"updated_at": now},
                },
            )
            result["wallet_credited"] = True

    label = new_status.replace("_", " ").title()
    await create_notification(
        order["buyer_id"],
        f"Order {label}",
        f"Your order #{str(oid)[-6:].upper()} is now {label.lower()}.",
        "order",
        "/orders",
        {"order_id": str(oid), "status": new_status},
    )
    if role != "farmer":
        await create_notification(
            order["farmer_id"],
            f"Order {label}",
            f"Order #{str(oid)[-6:].upper()} is now {label.lower()}.",
            "order",
            "/orders",
            {"order_id": str(oid), "status": new_status},
        )

    return serialize_document(result)
