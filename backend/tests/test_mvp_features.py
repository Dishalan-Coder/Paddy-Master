"""Coverage for the expanded MVP routes and Mongo-safe date storage."""

from datetime import datetime, timedelta, timezone

import pytest
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.core.jwt import create_access_token
from app.main import app
from app.services import payment_service


def farmer_token(fake_database, **overrides):
    user_id = ObjectId()
    user_doc = {
        "_id": user_id,
        "full_name": "MVP Farmer",
        "email": f"mvp-farmer-{str(user_id)[-6:]}@example.com",
        "phone": f"077{str(user_id)[-7:]}",
        "role": "farmer",
        "district": "Kilinochchi",
        "created_at": datetime.now(timezone.utc),
        "subscription_status": "inactive",
    }
    user_doc.update(overrides)
    fake_database.users.documents.append(user_doc)
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
async def test_subscription_status_defaults_to_inactive(fake_database):
    _user_id, token = farmer_token(fake_database)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/payments/subscription",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert response.json()["status"] == "inactive"
    assert response.json()["active"] is False
    assert response.json()["monthly_price_lkr"] == 150
    assert response.json()["free_trial_days"] == 21
    assert response.json()["free_trial_active"] is True


@pytest.mark.asyncio
async def test_farmer_premium_features_require_subscription(fake_database):
    _user_id, token = farmer_token(fake_database)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        marketplace = await client.get(
            "/api/v1/products/",
            headers={"Authorization": f"Bearer {token}"},
        )
        advisory = await client.get(
            "/api/v1/recommendations/",
            headers={"Authorization": f"Bearer {token}"},
        )
        orders = await client.get(
            "/api/v1/orders/farmer",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert marketplace.status_code == 403
    assert advisory.status_code == 403
    assert orders.status_code == 403
    assert (
        marketplace.json()["detail"]
        == "Farmer subscription required for Marketplace, Smart Advisory, and Orders"
    )


@pytest.mark.asyncio
async def test_farmer_general_features_are_free_for_21_days(fake_database):
    _user_id, token = farmer_token(fake_database)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/farms/",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_farmer_general_features_require_subscription_after_trial(
    fake_database,
):
    _user_id, token = farmer_token(
        fake_database, created_at=datetime.now(timezone.utc) - timedelta(days=22)
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/farms/",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 403
    assert (
        response.json()["detail"]
        == "Your 21-day free access has ended. Start the LKR 150 farmer subscription to continue."
    )


@pytest.mark.asyncio
async def test_active_farmer_subscription_unlocks_features_after_trial(fake_database):
    _user_id, token = farmer_token(
        fake_database,
        created_at=datetime.now(timezone.utc) - timedelta(days=22),
        subscription_status="active",
        subscription_plan="farmer_pro",
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        farms = await client.get(
            "/api/v1/farms/",
            headers={"Authorization": f"Bearer {token}"},
        )
        marketplace = await client.get(
            "/api/v1/products/",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert farms.status_code == 200
    assert marketplace.status_code == 200


@pytest.mark.asyncio
async def test_subscription_checkout_requires_stripe_configuration(
    fake_database, monkeypatch
):
    _user_id, token = farmer_token(fake_database)
    monkeypatch.setattr(payment_service.settings, "STRIPE_SECRET_KEY", "")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/payments/subscription/checkout",
            json={"plan": "farmer_pro"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 503
    assert "Stripe secret key is not configured" in response.json()["detail"]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "method,path",
    [
        ("GET", "/api/v1/notifications/"),
        ("GET", "/api/v1/recommendations/"),
        ("GET", "/api/v1/reviews/products/507f1f77bcf86cd799439011"),
        ("GET", "/api/v1/payments/subscription"),
        ("POST", "/api/v1/payments/subscription/checkout"),
        ("POST", "/api/v1/payments/subscription/portal"),
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
