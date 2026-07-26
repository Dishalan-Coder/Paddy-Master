"""Expense tracking and profit/loss calculation."""

from datetime import datetime, timezone
from typing import Any, Dict, List

from app.db.mongodb import get_database_or_raise
from app.models.expense import ExpenseCreate
from app.utils.mongo import object_id_or_none, serialize_document


async def add_expense(farmer_id, data: ExpenseCreate) -> dict:
    db = get_database_or_raise()
    doc = data.model_dump(mode="json")

    if doc.get("crop_id"):
        crop_id = object_id_or_none(doc["crop_id"])
        if crop_id is None or not await db.crops.find_one(
            {"_id": crop_id, "farmer_id": farmer_id}
        ):
            raise ValueError("Crop not found or not owned by you")
        doc["crop_id"] = crop_id
    else:
        doc["crop_id"] = None

    if doc.get("farm_id"):
        farm_id = object_id_or_none(doc["farm_id"])
        if farm_id is None or not await db.farms.find_one(
            {"_id": farm_id, "farmer_id": farmer_id}
        ):
            raise ValueError("Farm not found or not owned by you")
        doc["farm_id"] = farm_id
    else:
        doc["farm_id"] = None

    doc["farmer_id"] = farmer_id
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.expenses.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_document(doc)


async def get_expenses(farmer_id, crop_id: str | None = None) -> List[dict]:
    db = get_database_or_raise()
    query: Dict[str, Any] = {"farmer_id": farmer_id}
    if crop_id:
        oid = object_id_or_none(crop_id)
        if oid is None:
            return []
        query["crop_id"] = oid

    expenses = await db.expenses.find(query).sort("expense_date", -1).to_list(200)
    return serialize_document(expenses)


async def calculate_profit_loss(farmer_id) -> Dict[str, Any]:
    db = get_database_or_raise()
    exp_result = await db.expenses.aggregate(
        [
            {"$match": {"farmer_id": farmer_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
    ).to_list(1)
    total_expenses = exp_result[0]["total"] if exp_result else 0.0

    earn_result = await db.orders.aggregate(
        [
            {"$match": {"farmer_id": farmer_id, "status": "delivered"}},
            {"$group": {"_id": None, "total": {"$sum": "$total_price"}}},
        ]
    ).to_list(1)
    total_earnings = earn_result[0]["total"] if earn_result else 0.0

    categories = await db.expenses.aggregate(
        [
            {"$match": {"farmer_id": farmer_id}},
            {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        ]
    ).to_list(20)

    return {
        "total_expenses": round(total_expenses, 2),
        "total_earnings": round(total_earnings, 2),
        "profit_loss": round(total_earnings - total_expenses, 2),
        "category_breakdown": {str(c["_id"]): round(c["total"], 2) for c in categories},
    }
