"""Weather data proxy with agricultural alerts and a no-key fallback."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

import httpx

from app.core.config import settings

WEATHER_BASE = "https://api.openweathermap.org/data/2.5"
DISTRICT_COORDS = {
    "anuradhapura": {"lat": 8.3114, "lon": 80.4037},
    "polonnaruwa": {"lat": 7.9403, "lon": 81.0188},
    "kurunegala": {"lat": 7.4863, "lon": 80.3647},
    "hambantota": {"lat": 6.1243, "lon": 81.1185},
    "ampara": {"lat": 7.3018, "lon": 81.6747},
    "mannar": {"lat": 8.9810, "lon": 79.9044},
    "trincomalee": {"lat": 8.5874, "lon": 81.2152},
    "batticaloa": {"lat": 7.7310, "lon": 81.6747},
    "kilinochchi": {"lat": 9.3803, "lon": 80.3770},
    "jaffna": {"lat": 9.6615, "lon": 80.0255},
    "mullaitivu": {"lat": 9.2671, "lon": 80.8143},
    "vavuniya": {"lat": 8.7514, "lon": 80.4971},
    "puttalam": {"lat": 8.0408, "lon": 79.8394},
    "kandy": {"lat": 7.2906, "lon": 80.6337},
    "matale": {"lat": 7.4675, "lon": 80.6234},
    "nuwara_eliya": {"lat": 6.9497, "lon": 80.7891},
    "badulla": {"lat": 6.9934, "lon": 81.0550},
    "monaragala": {"lat": 6.8728, "lon": 81.3506},
    "ratnapura": {"lat": 6.6828, "lon": 80.4028},
    "kegalle": {"lat": 7.2513, "lon": 80.3464},
    "colombo": {"lat": 6.9271, "lon": 79.8612},
    "gampaha": {"lat": 7.0840, "lon": 79.9975},
    "kalutara": {"lat": 6.5854, "lon": 79.9607},
    "galle": {"lat": 6.0535, "lon": 80.2210},
    "matara": {"lat": 5.9549, "lon": 80.5550},
}


def normalize_district(district: str) -> str:
    return district.strip().lower().replace(" ", "_")


def sample_weather(district: str) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    forecast = [
        {
            "date": (now + timedelta(days=index)).isoformat(),
            "temp": 30 - (index % 2),
            "humidity": 76 + index,
            "description": "partly cloudy" if index % 2 == 0 else "light rain",
            "icon": "02d" if index % 2 == 0 else "10d",
            "rain": 0 if index % 2 == 0 else 2.4,
        }
        for index in range(5)
    ]
    return {
        "current": {
            "temp": 30,
            "feels_like": 33,
            "humidity": 78,
            "wind_speed": 3.2,
            "description": "partly cloudy",
            "icon": "02d",
        },
        "forecast": forecast,
        "alerts": [
            {
                "type": "rain",
                "severity": "medium",
                "message": "Light rain is expected. Review irrigation and avoid unnecessary pesticide spraying.",
                "time": "within 48 hours",
            },
            {
                "type": "pest",
                "severity": "medium",
                "message": "Warm, humid conditions may increase fungal and pest pressure. Inspect field edges.",
                "time": "this week",
            },
        ],
        "district": district.replace("_", " ").title(),
        "source": "sample",
    }


async def get_weather(district: str = "anuradhapura") -> Dict[str, Any]:
    key = normalize_district(district)
    if key not in DISTRICT_COORDS:
        key = "anuradhapura"
    if not settings.WEATHER_API_KEY or settings.WEATHER_API_KEY.lower().startswith(
        "your_"
    ):
        return sample_weather(key)

    coords = DISTRICT_COORDS[key]
    params = {
        "lat": coords["lat"],
        "lon": coords["lon"],
        "appid": settings.WEATHER_API_KEY,
        "units": "metric",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            current_resp, forecast_resp = await client.get(
                f"{WEATHER_BASE}/weather", params=params
            ), await client.get(f"{WEATHER_BASE}/forecast", params=params)
            current_resp.raise_for_status()
            forecast_resp.raise_for_status()
            current, forecast = current_resp.json(), forecast_resp.json()
    except (httpx.HTTPError, KeyError, ValueError):
        return sample_weather(key)

    return {
        "current": {
            "temp": current["main"]["temp"],
            "feels_like": current["main"]["feels_like"],
            "humidity": current["main"]["humidity"],
            "wind_speed": current["wind"]["speed"],
            "description": current["weather"][0]["description"],
            "icon": current["weather"][0]["icon"],
        },
        "forecast": [
            {
                "date": item["dt_txt"],
                "temp": item["main"]["temp"],
                "humidity": item["main"]["humidity"],
                "description": item["weather"][0]["description"],
                "icon": item["weather"][0]["icon"],
                "rain": item.get("rain", {}).get("3h", 0),
            }
            for item in forecast.get("list", [])[:40:8]
        ],
        "alerts": generate_alerts(current, forecast),
        "district": key.replace("_", " ").title(),
        "source": "openweathermap",
    }


def generate_alerts(current: dict, forecast: dict) -> List[Dict[str, Any]]:
    items = forecast.get("list", [])
    if not items:
        return []
    alerts: List[Dict[str, Any]] = []
    for item in items[:16]:
        rain = item.get("rain", {}).get("3h", 0)
        if rain > 15:
            alerts.append(
                {
                    "type": "flood",
                    "severity": "high",
                    "message": f"Heavy rain expected ({rain}mm/3h). Check field drainage.",
                    "time": item.get("dt_txt", "soon"),
                }
            )
            break
        if rain > 5:
            alerts.append(
                {
                    "type": "rain",
                    "severity": "medium",
                    "message": f"Rain expected ({rain}mm/3h). Delay pesticide application.",
                    "time": item.get("dt_txt", "soon"),
                }
            )
            break

    total_rain = sum(item.get("rain", {}).get("3h", 0) for item in items)
    max_temp = max(item.get("main", {}).get("temp", 0) for item in items)
    if total_rain < 2 and max_temp > 35:
        alerts.append(
            {
                "type": "drought",
                "severity": "high",
                "message": "Little rain and high temperatures are expected. Review irrigation.",
                "time": "this week",
            }
        )

    humidity_values = [item.get("main", {}).get("humidity", 0) for item in items[:8]]
    if humidity_values and sum(humidity_values) / len(humidity_values) > 85:
        alerts.append(
            {
                "type": "pest",
                "severity": "medium",
                "message": "High humidity may increase pest and fungal disease risk.",
                "time": "this week",
            }
        )
    return alerts
