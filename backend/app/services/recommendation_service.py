"""AI-assisted crop recommendations and rule-based fallback reminders."""

import json
import logging
from datetime import date, datetime
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings
from app.db.mongodb import get_database_or_raise
from app.services.weather_service import get_weather
from app.utils.mongo import serialize_document

logger = logging.getLogger(__name__)
OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
MAX_RECOMMENDATIONS = 12
MAX_CHAT_SUGGESTIONS = 3
PRIORITIES = {"low", "medium", "high"}


STAGE_ADVICE = {
    "planted": (
        "Irrigation",
        "Keep the field moist and inspect seedling establishment daily.",
    ),
    "germination": ("Field care", "Maintain shallow water and remove early weeds."),
    "tillering": (
        "Fertilizer",
        "Review the first top-dressing schedule and monitor leaf colour.",
    ),
    "stem_elongation": (
        "Nutrition",
        "Check nitrogen and potassium needs before panicle initiation.",
    ),
    "booting": (
        "Pest watch",
        "Inspect for leaf folder, stem borer, and fungal symptoms.",
    ),
    "heading": ("Water", "Avoid water stress while panicles are emerging."),
    "flowering": (
        "Protection",
        "Avoid pesticide spraying during peak flowering hours.",
    ),
    "grain_filling": (
        "Water",
        "Maintain adequate moisture, then reduce water gradually.",
    ),
    "maturity": ("Harvest", "Drain the field and prepare labour, bags, and transport."),
}


ADVISORY_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "recommendations": {
            "type": "array",
            "maxItems": MAX_RECOMMENDATIONS,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "crop_id": {"type": ["string", "null"]},
                    "crop_variety": {"type": ["string", "null"]},
                    "category": {"type": "string"},
                    "title": {"type": "string"},
                    "message": {"type": "string"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                    "days_to_harvest": {"type": ["integer", "null"]},
                    "time": {"type": ["string", "null"]},
                },
                "required": ["category", "title", "message", "priority"],
            },
        }
    },
    "required": ["recommendations"],
}


CHAT_ADVISORY_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "reply": {
            "type": "string",
            "description": "A concise farm advisory answer for the farmer.",
        },
        "suggested_actions": {
            "type": "array",
            "maxItems": MAX_CHAT_SUGGESTIONS,
            "items": {"type": "string"},
        },
    },
    "required": ["reply"],
}


def _parse_harvest_date(value) -> Optional[date]:
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


def _date_string(value) -> Optional[str]:
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, str):
        return value[:10]
    return None


def _days_to_harvest(crop: dict, today: date) -> Optional[int]:
    harvest_date = _parse_harvest_date(crop.get("expected_harvest_date"))
    return (harvest_date - today).days if harvest_date else None


def _rule_crop_recommendations(crops: list[dict], today: date) -> List[dict]:
    items: List[dict] = []
    for crop in crops:
        stage = crop.get("growth_stage", "planted")
        category, message = STAGE_ADVICE.get(
            stage,
            ("Crop care", "Inspect the crop and record the current growth stage."),
        )
        days_to_harvest = _days_to_harvest(crop, today)
        priority = (
            "high"
            if days_to_harvest is not None and days_to_harvest <= 14
            else "medium"
        )
        items.append(
            {
                "crop_id": crop["_id"],
                "crop_variety": crop.get("variety", "Paddy"),
                "category": category,
                "title": f"{category} for {crop.get('variety', 'your crop')}",
                "message": message,
                "priority": priority,
                "days_to_harvest": days_to_harvest,
            }
        )
    return items


def _weather_recommendations(weather: dict) -> List[dict]:
    return [
        {
            "category": "Weather alert",
            "title": alert.get("type", "Weather").replace("_", " ").title(),
            "message": alert.get("message", "Review local weather conditions."),
            "priority": alert.get("severity", "medium"),
            "time": alert.get("time"),
        }
        for alert in weather.get("alerts", [])
    ]


def _fallback_recommendations(crops: list[dict], weather: dict, today: date) -> List[dict]:
    return (_weather_recommendations(weather) + _rule_crop_recommendations(crops, today))[
        :MAX_RECOMMENDATIONS
    ]


def _crop_context(crops: list[dict], today: date) -> List[dict]:
    return [
        {
            "crop_id": str(crop.get("_id")),
            "variety": crop.get("variety", "Paddy"),
            "growth_stage": crop.get("growth_stage", "planted"),
            "planting_date": _date_string(crop.get("planting_date")),
            "expected_harvest_date": _date_string(crop.get("expected_harvest_date")),
            "days_to_harvest": _days_to_harvest(crop, today),
            "area_acres": crop.get("area_acres"),
            "notes": crop.get("notes"),
        }
        for crop in crops
    ]


def _weather_context(weather: dict) -> dict:
    return {
        "source": weather.get("source"),
        "current": weather.get("current"),
        "forecast": weather.get("forecast", [])[:5],
        "alerts": weather.get("alerts", []),
        "district": weather.get("district"),
    }


def _extract_response_text(payload: dict) -> str:
    if isinstance(payload.get("output_text"), str):
        return payload["output_text"]

    parts: list[str] = []
    for output in payload.get("output", []):
        for content in output.get("content", []):
            text = content.get("text")
            if isinstance(text, dict):
                text = text.get("value")
            if isinstance(text, str):
                parts.append(text)
    return "\n".join(parts)


def _normalize_ai_items(raw_items, fallback_items: list[dict]) -> Optional[List[dict]]:
    if not isinstance(raw_items, list):
        return None

    items: list[dict] = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title") or "").strip()
        message = str(item.get("message") or "").strip()
        if not title or not message:
            continue

        priority = str(item.get("priority") or "medium").lower()
        if priority not in PRIORITIES:
            priority = "medium"

        days_to_harvest = item.get("days_to_harvest")
        if isinstance(days_to_harvest, str) and days_to_harvest.lstrip("-").isdigit():
            days_to_harvest = int(days_to_harvest)
        elif not isinstance(days_to_harvest, int):
            days_to_harvest = None

        normalized = {
            "crop_id": item.get("crop_id"),
            "crop_variety": item.get("crop_variety"),
            "category": str(item.get("category") or "Crop care").strip(),
            "title": title,
            "message": message,
            "priority": priority,
            "days_to_harvest": days_to_harvest,
        }
        if item.get("time"):
            normalized["time"] = str(item["time"])
        items.append(normalized)

    return items[:MAX_RECOMMENDATIONS] or fallback_items


def _normalize_chat_suggestions(raw_suggestions) -> list[str]:
    if not isinstance(raw_suggestions, list):
        return []

    suggestions: list[str] = []
    for suggestion in raw_suggestions:
        text = str(suggestion or "").strip()
        if text:
            suggestions.append(text[:180])
    return suggestions[:MAX_CHAT_SUGGESTIONS]


def _rule_chat_reply(
    question: str, crops: list[dict], weather: dict, fallback_items: list[dict]
) -> dict:
    question_text = question.strip()
    lines = [
        "I couldn't reach the AI advisor right now, so here is a practical rule-based answer from your saved crop and weather records."
    ]

    if not crops:
        lines.append(
            "Add at least one active crop record with growth stage and expected harvest date so the advisory can be more specific."
        )
    else:
        crop = crops[0]
        variety = crop.get("variety", "your paddy crop")
        stage = crop.get("growth_stage", "planted").replace("_", " ")
        lines.append(f"For {variety} at {stage} stage, inspect field condition today.")

    if fallback_items:
        for item in fallback_items[:3]:
            title = item.get("title") or item.get("category") or "Farm reminder"
            message = item.get("message") or "Review this field condition."
            lines.append(f"{title}: {message}")

    if weather.get("alerts"):
        lines.append("Prioritize current weather alerts before fertilizer or spray work.")

    if any(word in question_text.lower() for word in ("pesticide", "fertilizer", "dose")):
        lines.append(
            "For chemicals or exact dosages, confirm the product label and local agriculture officer guidance before applying."
        )

    suggestions = [
        "Check field moisture and drainage",
        "Update crop growth stage after inspection",
        "Review expected harvest timing",
    ]
    return {"reply": "\n".join(lines), "suggested_actions": suggestions}


def _normalize_chat_payload(raw_payload, fallback_payload: dict) -> dict:
    if not isinstance(raw_payload, dict):
        return fallback_payload

    reply = str(raw_payload.get("reply") or "").strip()
    if not reply:
        return fallback_payload

    return {
        "reply": reply[:2400],
        "suggested_actions": _normalize_chat_suggestions(
            raw_payload.get("suggested_actions")
        ),
    }


async def _load_farmer_advisory_context(farmer_id, district: str):
    db = get_database_or_raise()
    crops = (
        await db.crops.find(
            {"farmer_id": farmer_id, "growth_stage": {"$ne": "harvested"}}
        )
        .sort("expected_harvest_date", 1)
        .to_list(20)
    )
    weather = await get_weather(district)
    today = date.today()
    fallback_items = _fallback_recommendations(crops, weather, today)
    return crops, weather, today, fallback_items


async def _ai_recommendations(
    crops: list[dict], weather: dict, district: str, today: date, fallback_items: list[dict]
) -> Optional[List[dict]]:
    if not settings.openai_enabled:
        return None

    context = {
        "district": district,
        "today": today.isoformat(),
        "crops": _crop_context(crops, today),
        "weather": _weather_context(weather),
        "fallback_rules": [
            {
                "growth_stage": stage,
                "category": category,
                "message": message,
            }
            for stage, (category, message) in STAGE_ADVICE.items()
        ],
    }
    instructions = (
        "You are Paddy Master's agricultural Smart Advisory assistant for paddy "
        "farmers in Sri Lanka. Generate concise, practical advisory cards from "
        "the supplied crop records and weather data. Prioritize urgent weather, "
        "harvest, irrigation, fertilizer, pest, and field-care actions. Do not "
        "invent crop records or exact chemical dosages. If pesticide, fertilizer, "
        "or disease advice is relevant, keep it cautious and tell the farmer to "
        "check local labels or an agronomist before applying products."
    )
    request_body = {
        "model": settings.OPENAI_MODEL,
        "instructions": instructions,
        "input": json.dumps(context, default=str),
        "text": {
            "format": {
                "type": "json_schema",
                "name": "paddy_smart_advisory",
                "description": "Smart advisory cards for paddy crop management.",
                "schema": ADVISORY_SCHEMA,
                "strict": False,
            }
        },
        "max_output_tokens": 1800,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                OPENAI_RESPONSES_URL,
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=request_body,
            )
            response.raise_for_status()
        text = _extract_response_text(response.json())
        payload = json.loads(text)
        return _normalize_ai_items(payload.get("recommendations"), fallback_items)
    except (httpx.HTTPError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        logger.warning("OpenAI smart advisory failed; using rule fallback: %s", exc)
        return None


async def _ai_chat_reply(
    question: str,
    crops: list[dict],
    weather: dict,
    district: str,
    today: date,
    fallback_payload: dict,
) -> Optional[dict]:
    if not settings.openai_enabled:
        return None

    context = {
        "district": district,
        "today": today.isoformat(),
        "farmer_question": question,
        "crops": _crop_context(crops, today),
        "weather": _weather_context(weather),
        "current_rule_advisories": fallback_payload,
    }
    instructions = (
        "You are Paddy Master's chat-based Smart Advisory assistant for paddy "
        "farmers in Sri Lanka. Answer the farmer's question using only the "
        "supplied crop records, district, weather, and advisory context. Reply "
        "in the same language as the farmer's question where practical. Keep "
        "the answer direct and actionable. If the question is not about paddy "
        "farming, farm operations, weather, harvest, pests, fertilizer, "
        "irrigation, or marketplace readiness, politely redirect to paddy farm "
        "advice. Do not invent crop records, weather facts, exact chemical "
        "dosages, or guaranteed outcomes. For pesticide, fertilizer, disease, "
        "or safety-critical advice, recommend checking local labels or a "
        "qualified agriculture officer before applying products."
    )
    request_body = {
        "model": settings.OPENAI_MODEL,
        "instructions": instructions,
        "input": json.dumps(context, default=str),
        "text": {
            "format": {
                "type": "json_schema",
                "name": "paddy_chat_advisory",
                "description": "A chat response and short suggested actions.",
                "schema": CHAT_ADVISORY_SCHEMA,
                "strict": False,
            }
        },
        "max_output_tokens": 1200,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                OPENAI_RESPONSES_URL,
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=request_body,
            )
            response.raise_for_status()
        text = _extract_response_text(response.json())
        return _normalize_chat_payload(json.loads(text), fallback_payload)
    except (httpx.HTTPError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        logger.warning("OpenAI advisory chat failed; using rule fallback: %s", exc)
        return None


async def get_farmer_recommendations(
    farmer_id, district: str = "anuradhapura"
) -> Dict[str, Any]:
    crops, weather, today, fallback_items = await _load_farmer_advisory_context(
        farmer_id, district
    )
    ai_items = await _ai_recommendations(crops, weather, district, today, fallback_items)
    items = ai_items or fallback_items

    return {
        "recommendations": serialize_document(items[:MAX_RECOMMENDATIONS]),
        "recommendation_source": "openai" if ai_items else "rules",
        "ai_model": settings.OPENAI_MODEL if ai_items else None,
        "weather_source": weather.get("source"),
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }


async def chat_farmer_advisory(
    farmer_id, question: str, district: str = "anuradhapura"
) -> Dict[str, Any]:
    crops, weather, today, fallback_items = await _load_farmer_advisory_context(
        farmer_id, district
    )
    fallback_payload = _rule_chat_reply(question, crops, weather, fallback_items)
    ai_payload = await _ai_chat_reply(
        question, crops, weather, district, today, fallback_payload
    )
    payload = ai_payload or fallback_payload

    return {
        "reply": payload["reply"],
        "suggested_actions": payload.get("suggested_actions", []),
        "advisory_source": "openai" if ai_payload else "rules",
        "ai_model": settings.OPENAI_MODEL if ai_payload else None,
        "weather_source": weather.get("source"),
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }
