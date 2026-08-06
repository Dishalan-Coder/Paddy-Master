"""Buyer-managed paddy prices, trends, and regional comparisons."""

from collections import defaultdict
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


def _clean_prices(prices: Dict[str, float]) -> Dict[str, float]:
    clean_prices: Dict[str, float] = {}
    for key, value in (prices or {}).items():
        price_key = str(key).strip()
        if not price_key:
            continue
        try:
            amount = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError("All market prices must be greater than zero") from exc
        if amount <= 0:
            raise ValueError("All market prices must be greater than zero")
        clean_prices[price_key] = round(amount, 2)

    if not clean_prices:
        raise ValueError("All market prices must be greater than zero")
    return clean_prices


def _date_text(value: Any) -> str:
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return str(value or "")


def _created_text(value: Any) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value or "")


def _best_offer(prices: Dict[str, float]) -> float:
    values = []
    for value in (prices or {}).values():
        try:
            values.append(float(value))
        except (TypeError, ValueError):
            continue
    return round(max(values), 2) if values else 0.0


def _average_prices(documents: list[dict]) -> Dict[str, float]:
    totals: dict[str, float] = defaultdict(float)
    counts: dict[str, int] = defaultdict(int)
    for document in documents:
        for key, value in (document.get("prices") or {}).items():
            try:
                amount = float(value)
            except (TypeError, ValueError):
                continue
            totals[key] += amount
            counts[key] += 1

    return {
        key: round(total / counts[key], 2)
        for key, total in totals.items()
        if counts[key]
    }


def _prepare_buyer_offer(document: dict) -> dict:
    offer = dict(document)
    offer["buyer_id"] = str(offer.get("buyer_id") or "")
    offer["buyer_name"] = offer.get("buyer_name") or "Wholesale buyer"
    offer["buyer_district"] = offer.get("buyer_district") or offer.get("region") or ""
    offer["best_offer"] = _best_offer(offer.get("prices") or {})
    return offer


def _latest_buyer_offers(documents: list[dict]) -> list[dict]:
    latest_by_buyer: dict[str, dict] = {}
    sorted_documents = sorted(
        documents,
        key=lambda item: (
            _date_text(item.get("date")),
            _created_text(item.get("created_at")),
        ),
        reverse=True,
    )
    for document in sorted_documents:
        buyer_id = str(document.get("buyer_id") or "")
        if not buyer_id or buyer_id in latest_by_buyer:
            continue
        latest_by_buyer[buyer_id] = _prepare_buyer_offer(document)

    return sorted(
        latest_by_buyer.values(),
        key=lambda item: (item.get("best_offer") or 0, item.get("buyer_name") or ""),
        reverse=True,
    )


def _buyer_trend(documents: list[dict], price_unit_kg: int) -> list[dict]:
    by_date: dict[str, list[dict]] = defaultdict(list)
    for document in documents:
        by_date[_date_text(document.get("date"))].append(document)

    trend = []
    for day, day_documents in sorted(by_date.items()):
        average_prices = _average_prices(day_documents)
        if not day or not average_prices:
            continue
        trend.append(
            {
                "date": day,
                "region": "buyer_average",
                "prices": average_prices,
                "price_unit_kg": price_unit_kg,
                "offer_count": len(day_documents),
            }
        )
    return trend


def _regional_buyer_prices(
    buyer_prices: list[dict], price_unit_kg: int
) -> list[dict]:
    by_region: dict[str, list[dict]] = defaultdict(list)
    for document in buyer_prices:
        region = (document.get("region") or document.get("buyer_district") or "").strip()
        if region:
            by_region[region].append(document)

    regional_prices = []
    for region, region_documents in sorted(by_region.items()):
        average_prices = _average_prices(region_documents)
        if not average_prices:
            continue
        regional_prices.append(
            {
                "region": region,
                "prices": average_prices,
                "price_unit_kg": price_unit_kg,
                "buyer_count": len(region_documents),
            }
        )
    return regional_prices


async def get_latest_prices(
    price_unit_kg: int = DEFAULT_PRICE_UNIT_KG,
    current_user: dict | None = None,
) -> Dict[str, Any]:
    db = get_database_or_raise()
    unit = _validate_price_unit(price_unit_kg)
    today = date.today()
    today_text = today.isoformat()

    buyer_documents = (
        await db.market_prices.find(
            {
                "buyer_id": {"$exists": True},
                "price_unit_kg": unit,
                "date": {"$lte": today_text},
            }
        )
        .sort("date", -1)
        .to_list(1000)
    )
    buyer_prices = _latest_buyer_offers(buyer_documents)
    current_buyer_offer = None
    if current_user and current_user.get("role") == "buyer":
        current_buyer_id = str(current_user.get("_id") or "")
        current_buyer_offer = next(
            (
                offer
                for offer in buyer_prices
                if str(offer.get("buyer_id")) == current_buyer_id
            ),
            None,
        )

    reference_latest = await db.market_prices.find_one(
        {
            "region": "national",
            "price_unit_kg": unit,
            "date": {"$lte": today_text},
            "buyer_id": {"$exists": False},
        },
        sort=[("date", -1)],
    )
    if not reference_latest:
        reference_latest = {
            "date": today_text,
            "prices": _default_prices(unit),
            "price_unit_kg": unit,
            "region": "national",
            "created_at": datetime.now(timezone.utc),
        }

    seven_days_ago = (today - timedelta(days=7)).isoformat()
    buyer_trend_documents = [
        document
        for document in buyer_documents
        if _date_text(document.get("date")) >= seven_days_ago
    ]
    trend = _buyer_trend(buyer_trend_documents, unit)
    if not trend:
        trend = (
            await db.market_prices.find(
                {
                    "region": "national",
                    "price_unit_kg": unit,
                    "date": {"$gte": seven_days_ago},
                    "buyer_id": {"$exists": False},
                }
            )
            .sort("date", 1)
            .to_list(10)
        )

    latest = buyer_prices[0] if buyer_prices else reference_latest
    if not trend:
        trend = [latest]

    regional = _regional_buyer_prices(buyer_prices, unit)
    if not regional:
        regional = (
            await db.market_prices.find(
                {
                    "date": reference_latest["date"],
                    "price_unit_kg": unit,
                    "region": {"$ne": "national"},
                    "buyer_id": {"$exists": False},
                }
            )
            .to_list(30)
        )

    return serialize_document(
        {
            "latest": latest,
            "market_reference": reference_latest,
            "buyer_prices": buyer_prices,
            "current_buyer_offer": current_buyer_offer,
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
    buyer: dict | None = None,
) -> dict:
    db = get_database_or_raise()
    unit = _validate_price_unit(price_unit_kg)
    clean_prices = _clean_prices(prices)
    selected_date = price_date or date.today()

    buyer = buyer or {}
    buyer_id = buyer.get("_id")
    if buyer.get("role") != "buyer" or not buyer_id:
        raise ValueError("Only buyers can update market prices")

    buyer_district = (buyer.get("district") or "").strip()
    selected_region = (region or buyer_district or "national").strip() or "national"
    doc = {
        "date": selected_date.isoformat(),
        "prices": clean_prices,
        "price_unit_kg": unit,
        "region": selected_region,
        "buyer_id": buyer_id,
        "buyer_name": buyer.get("full_name") or "Wholesale buyer",
        "buyer_district": buyer_district,
        "created_by_role": "buyer",
        "created_at": datetime.now(timezone.utc),
    }
    await db.market_prices.update_one(
        {
            "date": doc["date"],
            "buyer_id": doc["buyer_id"],
            "price_unit_kg": doc["price_unit_kg"],
        },
        {"$set": doc},
        upsert=True,
    )
    return serialize_document(_prepare_buyer_offer(doc))
