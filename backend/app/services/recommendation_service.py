"""Rule-based crop recommendations and reminders."""

from datetime import date, datetime
from typing import Any, Dict, List

from app.db.mongodb import get_database_or_raise
from app.services.weather_service import get_weather
from app.utils.mongo import serialize_document


STAGE_ADVICE = {
    "planted": ("Irrigation", "Keep the field moist and inspect seedling establishment daily."),
    "germination": ("Field care", "Maintain shallow water and remove early weeds."),
    "tillering": ("Fertilizer", "Review the first top-dressing schedule and monitor leaf colour."),
    "stem_elongation": ("Nutrition", "Check nitrogen and potassium needs before panicle initiation."),
    "booting": ("Pest watch", "Inspect for leaf folder, stem borer, and fungal symptoms."),
    "heading": ("Water", "Avoid water stress while panicles are emerging."),
    "flowering": ("Protection", "Avoid pesticide spraying during peak flowering hours."),
    "grain_filling": ("Water", "Maintain adequate moisture, then reduce water gradually."),
    "maturity": ("Harvest", "Drain the field and prepare labour, bags, and transport."),
}


async def get_farmer_recommendations(farmer_id, district: str = "anuradhapura") -> Dict[str, Any]:
    db = get_database_or_raise()
    crops = await db.crops.find({"farmer_id": farmer_id, "growth_stage": {"$ne": "harvested"}}).sort("expected_harvest_date", 1).to_list(20)
    weather = await get_weather(district)
    items: List[dict] = []
    today = date.today()

    for crop in crops:
        stage = crop.get("growth_stage", "planted")
        category, message = STAGE_ADVICE.get(stage, ("Crop care", "Inspect the crop and record the current growth stage."))
        harvest_date = crop.get("expected_harvest_date")
        days_to_harvest = None
        if harvest_date:
            if isinstance(harvest_date, datetime):
                harvest_date = harvest_date.date()
            elif isinstance(harvest_date, str):
                try:
                    harvest_date = date.fromisoformat(harvest_date[:10])
                except ValueError:
                    harvest_date = None
            if harvest_date:
                days_to_harvest = (harvest_date - today).days
        priority = "high" if days_to_harvest is not None and days_to_harvest <= 14 else "medium"
        items.append({
            "crop_id": crop["_id"],
            "crop_variety": crop.get("variety", "Paddy"),
            "category": category,
            "title": f"{category} for {crop.get('variety', 'your crop')}",
            "message": message,
            "priority": priority,
            "days_to_harvest": days_to_harvest,
        })

    for alert in weather.get("alerts", []):
        items.insert(0, {
            "category": "Weather alert",
            "title": alert.get("type", "Weather").replace("_", " ").title(),
            "message": alert.get("message", "Review local weather conditions."),
            "priority": alert.get("severity", "medium"),
            "time": alert.get("time"),
        })

    return {
        "recommendations": serialize_document(items[:12]),
        "weather_source": weather.get("source"),
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }
