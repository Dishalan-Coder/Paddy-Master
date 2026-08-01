"""Tests for AI-assisted smart advisory recommendations."""

import json

import httpx
import pytest
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.core.jwt import create_access_token
from app.main import app
from app.services import recommendation_service


def farmer_token(fake_database):
    user_id = ObjectId()
    fake_database.users.documents.append(
        {
            "_id": user_id,
            "full_name": "Advisory Farmer",
            "email": "advisory-farmer@example.com",
            "phone": "0770000010",
            "role": "farmer",
            "district": "Kilinochchi",
        }
    )
    return user_id, create_access_token({"sub": str(user_id), "role": "farmer"})


def add_crop(fake_database, user_id):
    crop_id = ObjectId()
    fake_database.crops.documents.append(
        {
            "_id": crop_id,
            "farmer_id": user_id,
            "variety": "Samba",
            "planting_date": "2026-07-01",
            "expected_harvest_date": "2026-08-10",
            "area_acres": 2.5,
            "growth_stage": "tillering",
        }
    )
    return crop_id


async def fake_weather(_district):
    return {
        "source": "test",
        "district": "Kilinochchi",
        "current": {"temp": 31, "humidity": 82, "description": "cloudy"},
        "forecast": [{"rain": 3.2, "description": "light rain"}],
        "alerts": [
            {
                "type": "rain",
                "severity": "medium",
                "message": "Light rain expected.",
                "time": "within 48 hours",
            }
        ],
    }


@pytest.mark.asyncio
async def test_recommendations_use_openai_when_configured(fake_database, monkeypatch):
    user_id, token = farmer_token(fake_database)
    crop_id = add_crop(fake_database, user_id)
    captured = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "output_text": json.dumps(
                    {
                        "recommendations": [
                            {
                                "crop_id": str(crop_id),
                                "crop_variety": "Samba",
                                "category": "AI Field care",
                                "title": "AI tillering check",
                                "message": "Inspect tillers and adjust irrigation after rain.",
                                "priority": "high",
                                "days_to_harvest": 9,
                            }
                        ]
                    }
                )
            }

    class FakeAsyncClient:
        def __init__(self, timeout):
            self.timeout = timeout

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return False

        async def post(self, url, headers, json):
            captured["url"] = url
            captured["headers"] = headers
            captured["json"] = json
            return FakeResponse()

    monkeypatch.setattr(recommendation_service.settings, "OPENAI_API_KEY", "sk-test")
    monkeypatch.setattr(recommendation_service.settings, "OPENAI_MODEL", "gpt-test")
    monkeypatch.setattr(recommendation_service, "get_weather", fake_weather)
    monkeypatch.setattr(recommendation_service.httpx, "AsyncClient", FakeAsyncClient)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/recommendations/",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["recommendation_source"] == "openai"
    assert data["ai_model"] == "gpt-test"
    assert data["recommendations"][0]["title"] == "AI tillering check"
    assert captured["url"] == recommendation_service.OPENAI_RESPONSES_URL
    assert captured["json"]["model"] == "gpt-test"
    assert "Samba" in captured["json"]["input"]


@pytest.mark.asyncio
async def test_recommendations_fall_back_to_rules_when_openai_fails(
    fake_database, monkeypatch
):
    user_id, token = farmer_token(fake_database)
    add_crop(fake_database, user_id)

    class BrokenAsyncClient:
        def __init__(self, timeout):
            self.timeout = timeout

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return False

        async def post(self, *_args, **_kwargs):
            raise httpx.ConnectError("offline")

    monkeypatch.setattr(recommendation_service.settings, "OPENAI_API_KEY", "sk-test")
    monkeypatch.setattr(recommendation_service.settings, "OPENAI_MODEL", "gpt-test")
    monkeypatch.setattr(recommendation_service, "get_weather", fake_weather)
    monkeypatch.setattr(recommendation_service.httpx, "AsyncClient", BrokenAsyncClient)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/recommendations/",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["recommendation_source"] == "rules"
    assert data["ai_model"] is None
    assert any(item["category"] == "Fertilizer" for item in data["recommendations"])


@pytest.mark.asyncio
async def test_advisory_chat_uses_openai_when_configured(fake_database, monkeypatch):
    user_id, token = farmer_token(fake_database)
    add_crop(fake_database, user_id)
    captured = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "output_text": json.dumps(
                    {
                        "reply": "Keep shallow water today and inspect tillers.",
                        "suggested_actions": [
                            "Check field moisture",
                            "Record tiller condition",
                        ],
                    }
                )
            }

    class FakeAsyncClient:
        def __init__(self, timeout):
            self.timeout = timeout

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return False

        async def post(self, url, headers, json):
            captured["url"] = url
            captured["headers"] = headers
            captured["json"] = json
            return FakeResponse()

    monkeypatch.setattr(recommendation_service.settings, "OPENAI_API_KEY", "sk-test")
    monkeypatch.setattr(recommendation_service.settings, "OPENAI_MODEL", "gpt-test")
    monkeypatch.setattr(recommendation_service, "get_weather", fake_weather)
    monkeypatch.setattr(recommendation_service.httpx, "AsyncClient", FakeAsyncClient)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/recommendations/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"message": "What should I do for tillering today?"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["advisory_source"] == "openai"
    assert data["ai_model"] == "gpt-test"
    assert data["reply"] == "Keep shallow water today and inspect tillers."
    assert data["suggested_actions"] == [
        "Check field moisture",
        "Record tiller condition",
    ]
    assert captured["url"] == recommendation_service.OPENAI_RESPONSES_URL
    assert captured["json"]["model"] == "gpt-test"
    assert "What should I do for tillering today?" in captured["json"]["input"]


@pytest.mark.asyncio
async def test_advisory_chat_falls_back_to_rules_when_openai_fails(
    fake_database, monkeypatch
):
    user_id, token = farmer_token(fake_database)
    add_crop(fake_database, user_id)

    class BrokenAsyncClient:
        def __init__(self, timeout):
            self.timeout = timeout

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return False

        async def post(self, *_args, **_kwargs):
            raise httpx.ConnectError("offline")

    monkeypatch.setattr(recommendation_service.settings, "OPENAI_API_KEY", "sk-test")
    monkeypatch.setattr(recommendation_service.settings, "OPENAI_MODEL", "gpt-test")
    monkeypatch.setattr(recommendation_service, "get_weather", fake_weather)
    monkeypatch.setattr(recommendation_service.httpx, "AsyncClient", BrokenAsyncClient)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/recommendations/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"message": "Can I apply fertilizer now?"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["advisory_source"] == "rules"
    assert data["ai_model"] is None
    assert "rule-based answer" in data["reply"]
    assert "local agriculture officer" in data["reply"]
    assert data["suggested_actions"]


@pytest.mark.asyncio
async def test_advisory_chat_rejects_blank_message(fake_database):
    _user_id, token = farmer_token(fake_database)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/recommendations/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"message": "   "},
        )

    assert response.status_code == 422
