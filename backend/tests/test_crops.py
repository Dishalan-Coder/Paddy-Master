"""Tests for crop CRUD endpoints."""

import pytest
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.core.jwt import create_access_token
from app.main import app


@pytest.mark.asyncio
async def test_create_crop_without_farm(fake_database):
    user_id = ObjectId()
    fake_database.users.documents.append(
        {
            "_id": user_id,
            "full_name": "Test Farmer",
            "email": "farmer@example.com",
            "phone": "0770000001",
            "role": "farmer",
        }
    )
    token = create_access_token({"sub": str(user_id), "role": "farmer"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/crops/",
            json={
                "farm_id": "nonexistent_farm",
                "variety": "Nadu",
                "planting_date": "2025-06-01",
                "expected_harvest_date": "2025-09-15",
                "area_acres": 2.5,
                "growth_stage": "planted",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 400
        assert "farm" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_crops_unauthorized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/crops/")
        assert response.status_code == 401
