"""Basic order payment workflow.

Cash on delivery and bank transfer are recorded. ``card_demo`` simulates a
successful local payment only when the demo token is ``demo-success``.
"""

from datetime import datetime, timezone

from pymongo import ReturnDocument

from app.db.mongodb import get_database_or_raise
from app.models.payment import PaymentMethod, PaymentRequest, PaymentStatus
from app.services.notification_service import create_notification
from app.utils.mongo import object_id_or_none, serialize_document


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
