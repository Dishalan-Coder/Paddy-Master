"""Marketplace product pricing unit tests."""

import pytest
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.core.jwt import create_access_token
from app.main import app
from app.models.product import ProductStatus


def user_token(fake_database, role: str, email: str):
    user_id = ObjectId()
    user_doc = {
            "_id": user_id,
            "full_name": f"{role.title()} User",
            "email": email,
            "phone": f"077{str(len(fake_database.users.documents) + 1).zfill(7)}",
            "role": role,
            "district": "Kilinochchi",
    }
    if role == "farmer":
        user_doc.update(
            {
                "subscription_status": "active",
                "subscription_plan": "farmer_pro",
            }
        )
    fake_database.users.documents.append(user_doc)
    return user_id, create_access_token({"sub": str(user_id), "role": role})


@pytest.mark.asyncio
async def test_create_product_stores_marketplace_price_unit(fake_database):
    _farmer_id, token = user_token(fake_database, "farmer", "unit-farmer@example.com")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/products/",
            data={
                "variety": "Nadu",
                "quantity_kg": "144",
                "price_per_kg": "7200",
                "price_unit_kg": "72",
                "region": "Kilinochchi",
                "district": "Kilinochchi",
                "is_organic": "false",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 201
    data = response.json()
    assert data["price_per_kg"] == 7200
    assert data["price_unit_kg"] == 72
    assert data["unit_price_per_kg"] == 100


@pytest.mark.asyncio
async def test_create_order_uses_listing_price_unit_for_total(fake_database):
    farmer_id, _farmer_token = user_token(
        fake_database, "farmer", "order-unit-farmer@example.com"
    )
    _buyer_id, buyer_token = user_token(
        fake_database, "buyer", "order-unit-buyer@example.com"
    )
    product_id = ObjectId()
    fake_database.products.documents.append(
        {
            "_id": product_id,
            "farmer_id": farmer_id,
            "variety": "Samba",
            "quantity_kg": 100,
            "price_per_kg": 7500,
            "price_unit_kg": 75,
            "unit_price_per_kg": 100,
            "region": "Kilinochchi",
            "district": "Kilinochchi",
            "status": ProductStatus.ACTIVE.value,
        }
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/orders/",
            json={
                "product_id": str(product_id),
                "quantity_kg": 37.5,
                "delivery_address": "123 Main Street, Kilinochchi",
                "payment_method": "cash_on_delivery",
            },
            headers={"Authorization": f"Bearer {buyer_token}"},
        )

    assert response.status_code == 201
    data = response.json()
    assert data["unit_price"] == 7500
    assert data["price_unit_kg"] == 75
    assert data["unit_price_per_kg"] == 100
    assert data["total_price"] == 3750
    assert fake_database.products.documents[0]["quantity_kg"] == 62.5
