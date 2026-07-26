"""Daily market prices, trends, and regional comparisons."""

from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict

from app.db.mongodb import get_database_or_raise
from app.utils.mongo import serialize_document

DEFAULT_PRICES = {"nadu": 112.0, "samba": 118.0, "k_samba": 121.0}


async def get_latest_prices() -> Dict[str, Any]:
    db = get_database_or_raise()
    today = date.today()
    today_text = today.isoformat()

    latest = await db.market_prices.find_one(
        {"region": "national", "date": {"$lte": today_text}},
        sort=[("date", -1)],
    )
    if not latest:
        latest = {
            "date": today_text,
            "prices": DEFAULT_PRICES,
            "region": "national",
            "created_at": datetime.now(timezone.utc),
        }

    seven_days_ago = (today - timedelta(days=7)).isoformat()
    trend = await db.market_prices.find(
        {"region": "national", "date": {"$gte": seven_days_ago}}
    ).sort("date", 1).to_list(10)
    if not trend:
        trend = [latest]

    regional = await db.market_prices.find(
        {"date": latest["date"], "region": {"$ne": "national"}}
    ).to_list(30)

    return serialize_document({"latest": latest, "trend": trend, "regional": regional})


async def update_market_prices(
    prices: Dict[str, float], region: str = "national", price_date: date | None = None
) -> dict:
    db = get_database_or_raise()
    if not prices or any(value <= 0 for value in prices.values()):
        raise ValueError("All market prices must be greater than zero")

    selected_date = price_date or date.today()
    doc = {
        "date": selected_date.isoformat(),
        "prices": {key: round(float(value), 2) for key, value in prices.items()},
        "region": region.strip() or "national",
        "created_at": datetime.now(timezone.utc),
    }
    await db.market_prices.update_one(
        {"date": doc["date"], "region": doc["region"]},
        {"$set": doc},
        upsert=True,
    )
    return serialize_document(doc)
