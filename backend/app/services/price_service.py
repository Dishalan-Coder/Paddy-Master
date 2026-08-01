"""Daily market prices, trends, and regional comparisons."""

from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict

from app.db.mongodb import get_database_or_raise
from app.utils.mongo import serialize_document

PRICE_UNIT_OPTIONS = (72, 75)
DEFAULT_PRICE_UNIT_KG = 72
BASE_KG_REFERENCE_PRICES = {"nadu": 112.0, "samba": 118.0, "k_samba": 121.0}


def _validate_price_unit(price_unit_kg: int) -> int:
    try:
        unit = int(price_unit_kg)
    except (TypeError, ValueError) as exc:
        raise ValueError("Select a valid market price unit") from exc
    if unit not in PRICE_UNIT_OPTIONS:
        raise ValueError("Select a valid market price unit")
    return unit


def _default_prices(price_unit_kg: int) -> Dict[str, float]:
    return {
        key: round(value * price_unit_kg, 2)
        for key, value in BASE_KG_REFERENCE_PRICES.items()
    }


async def get_latest_prices(price_unit_kg: int = DEFAULT_PRICE_UNIT_KG) -> Dict[str, Any]:
    db = get_database_or_raise()
    unit = _validate_price_unit(price_unit_kg)
    today = date.today()
    today_text = today.isoformat()

    latest = await db.market_prices.find_one(
        {
            "region": "national",
            "price_unit_kg": unit,
            "date": {"$lte": today_text},
        },
        sort=[("date", -1)],
    )
    if not latest:
        latest = {
            "date": today_text,
            "prices": _default_prices(unit),
            "price_unit_kg": unit,
            "region": "national",
            "created_at": datetime.now(timezone.utc),
        }

    seven_days_ago = (today - timedelta(days=7)).isoformat()
    trend = (
        await db.market_prices.find(
            {
                "region": "national",
                "price_unit_kg": unit,
                "date": {"$gte": seven_days_ago},
            }
        )
        .sort("date", 1)
        .to_list(10)
    )
    if not trend:
        trend = [latest]

    regional = await db.market_prices.find(
        {
            "date": latest["date"],
            "price_unit_kg": unit,
            "region": {"$ne": "national"},
        }
    ).to_list(30)

    return serialize_document(
        {
            "latest": latest,
            "trend": trend,
            "regional": regional,
            "selected_unit_kg": unit,
            "price_unit_options": list(PRICE_UNIT_OPTIONS),
        }
    )


async def update_market_prices(
    prices: Dict[str, float],
    region: str = "national",
    price_date: date | None = None,
    price_unit_kg: int = DEFAULT_PRICE_UNIT_KG,
) -> dict:
    db = get_database_or_raise()
    unit = _validate_price_unit(price_unit_kg)
    if not prices or any(value <= 0 for value in prices.values()):
        raise ValueError("All market prices must be greater than zero")

    selected_date = price_date or date.today()
    doc = {
        "date": selected_date.isoformat(),
        "prices": {key: round(float(value), 2) for key, value in prices.items()},
        "price_unit_kg": unit,
        "region": region.strip() or "national",
        "created_at": datetime.now(timezone.utc),
    }
    await db.market_prices.update_one(
        {
            "date": doc["date"],
            "region": doc["region"],
            "price_unit_kg": doc["price_unit_kg"],
        },
        {"$set": doc},
        upsert=True,
    )
    return serialize_document(doc)
