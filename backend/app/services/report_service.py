"""Dashboard analytics and reporting."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from app.db.mongodb import get_database_or_raise
from app.utils.mongo import serialize_document


async def get_admin_analytics() -> Dict[str, Any]:
    db = get_database_or_raise()
    month_ago = datetime.now(timezone.utc) - timedelta(days=30)

    active_farmers = await db.users.count_documents({"role": "farmer"})
    active_buyers = await db.users.count_documents({"role": "buyer"})
    pending_verifications = await db.users.count_documents({"is_verified": False})

    gmv_result = await db.orders.aggregate(
        [
            {"$match": {"status": "delivered", "created_at": {"$gte": month_ago}}},
            {"$group": {"_id": None, "total": {"$sum": "$total_price"}}},
        ]
    ).to_list(1)
    monthly_gmv = gmv_result[0]["total"] if gmv_result else 0

    order_trend = await db.orders.aggregate(
        [
            {"$match": {"created_at": {"$gte": month_ago}}},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                    },
                    "count": {"$sum": 1},
                    "volume": {"$sum": "$total_price"},
                }
            },
            {"$sort": {"_id": 1}},
        ]
    ).to_list(31)

    recent_orders = await db.orders.find().sort("created_at", -1).limit(5).to_list(5)
    return serialize_document(
        {
            "active_farmers": active_farmers,
            "active_buyers": active_buyers,
            "pending_verifications": pending_verifications,
            "monthly_gmv": round(monthly_gmv, 2),
            "open_disputes": await db.orders.count_documents({"status": "disputed"}),
            "order_trend": order_trend,
            "recent_activity": recent_orders,
            "pending_products": await db.products.count_documents(
                {"status": "active", "views": 0}
            ),
            "active_listings": await db.products.count_documents({"status": "active"}),
            "total_orders": await db.orders.count_documents({}),
            "payment_processing": await db.orders.count_documents(
                {"payment_status": "processing"}
            ),
        }
    )


async def get_farmer_dashboard(farmer_id) -> Dict[str, Any]:
    db = get_database_or_raise()
    upcoming_harvests = (
        await db.crops.find(
            {"farmer_id": farmer_id, "growth_stage": {"$ne": "harvested"}}
        )
        .sort("expected_harvest_date", 1)
        .limit(3)
        .to_list(3)
    )
    user = await db.users.find_one({"_id": farmer_id}, {"wallet_balance": 1})

    revenue_result = await db.orders.aggregate(
        [
            {"$match": {"farmer_id": farmer_id, "status": "delivered"}},
            {"$group": {"_id": None, "total": {"$sum": "$total_price"}}},
        ]
    ).to_list(1)
    expenses_result = await db.expenses.aggregate(
        [
            {"$match": {"farmer_id": farmer_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
    ).to_list(1)
    revenue = revenue_result[0]["total"] if revenue_result else 0
    expenses = expenses_result[0]["total"] if expenses_result else 0

    return serialize_document(
        {
            "active_crops": await db.crops.count_documents(
                {"farmer_id": farmer_id, "growth_stage": {"$ne": "harvested"}}
            ),
            "active_products": await db.products.count_documents(
                {"farmer_id": farmer_id, "status": "active"}
            ),
            "pending_orders": await db.orders.count_documents(
                {"farmer_id": farmer_id, "status": "pending"}
            ),
            "wallet_balance": user.get("wallet_balance", 0) if user else 0,
            "upcoming_harvests": upcoming_harvests,
            "total_revenue": round(revenue, 2),
            "total_expenses": round(expenses, 2),
            "net_profit": round(revenue - expenses, 2),
        }
    )


async def get_buyer_dashboard(buyer_id) -> Dict[str, Any]:
    db = get_database_or_raise()
    active_statuses = ["pending", "confirmed", "pickup_scheduled", "in_transit"]
    spend_result = await db.orders.aggregate(
        [
            {"$match": {"buyer_id": buyer_id, "status": {"$ne": "cancelled"}}},
            {"$group": {"_id": None, "total": {"$sum": "$total_price"}}},
        ]
    ).to_list(1)
    return {
        "available_listings": await db.products.count_documents({"status": "active"}),
        "active_orders": await db.orders.count_documents(
            {"buyer_id": buyer_id, "status": {"$in": active_statuses}}
        ),
        "completed_orders": await db.orders.count_documents(
            {"buyer_id": buyer_id, "status": "delivered"}
        ),
        "total_spend": round(spend_result[0]["total"], 2) if spend_result else 0,
    }
