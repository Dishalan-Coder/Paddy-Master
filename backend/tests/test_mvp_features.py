"""Coverage for the expanded MVP routes and Mongo-safe date storage."""

import pytest
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.core.jwt import create_access_token
from app.main import app


def farmer_token(fake_database):
    user_id = ObjectId()
    fake_database.users.documents.append(
        {
            "_id": user_id,
            "full_name": "MVP Farmer",
            "email": "mvp-farmer@example.com",
            "phone": "0770000009",
            "role": "farmer",
            "district": "Kilinochchi",
        }
    )
    return user_id, create_access_token({"sub": str(user_id), "role": "farmer"})


@pytest.mark.asyncio
async def test_crop_and_expense_dates_are_mongo_safe_strings(fake_database):
    user_id, token = farmer_token(fake_database)
    farm_id = ObjectId()
    fake_database.farms.documents.append(
        {
            "_id": farm_id,
            "farmer_id": user_id,
            "name": "Test Field",
            "location": "Paranthan",
            "area_acres": 2.5,
        }
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        crop_response = await client.post(
            "/api/v1/crops/",
            json={
                "farm_id": str(farm_id),
                "variety": "Samba",
                "planting_date": "2026-07-01",
                "expected_harvest_date": "2026-10-15",
                "area_acres": 2.5,
                "growth_stage": "planted",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert crop_response.status_code == 201
        crop_id = crop_response.json()["_id"]
        assert fake_database.crops.documents[0]["planting_date"] == "2026-07-01"

        expense_response = await client.post(
            "/api/v1/expenses/",
            json={
                "farm_id": str(farm_id),
                "crop_id": crop_id,
                "category": "fertilizer",
                "amount": 12500,
                "description": "Top dressing",
                "expense_date": "2026-07-20",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert expense_response.status_code == 201
        assert fake_database.expenses.documents[0]["expense_date"] == "2026-07-20"


@pytest.mark.asyncio
async def test_create_farm_rejects_name_with_numbers(fake_database):
    _user_id, token = farmer_token(fake_database)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/farms/",
            json={
                "name": "Field 1",
                "location": "Paranthan",
                "area_acres": 2.5,
            },
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 422
    assert "Farm name cannot contain numbers" in response.text


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "method,path",
    [
        ("GET", "/api/v1/notifications/"),
        ("GET", "/api/v1/recommendations/"),
        ("GET", "/api/v1/reviews/products/507f1f77bcf86cd799439011"),
        ("POST", "/api/v1/payments/orders/507f1f77bcf86cd799439011"),
        (
            "PATCH",
            "/api/v1/payments/orders/507f1f77bcf86cd799439011/confirm-bank-transfer",
        ),
    ],
)
async def test_expanded_mvp_routes_are_protected(method, path):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.request(
            method, path, json={} if method == "POST" else None
        )
        assert response.status_code == 401
