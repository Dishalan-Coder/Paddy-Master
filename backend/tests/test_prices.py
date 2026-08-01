"""Tests for market price units."""

import pytest
from bson import ObjectId
from httpx import ASGITransport, AsyncClient

from app.core.jwt import create_access_token
from app.main import app


def admin_token(fake_database):
    user_id = ObjectId()
    fake_database.users.documents.append(
        {
            "_id": user_id,
            "full_name": "Market Admin",
            "email": "market-admin@example.com",
            "phone": "0770000031",
            "role": "admin",
        }
    )
    return create_access_token({"sub": str(user_id), "role": "admin"})


def buyer_token(fake_database):
    user_id = ObjectId()
    fake_database.users.documents.append(
        {
            "_id": user_id,
            "full_name": "Market Buyer",
            "email": "market-buyer@example.com",
            "phone": "0770000032",
            "role": "buyer",
        }
    )
    return create_access_token({"sub": str(user_id), "role": "buyer"})


@pytest.mark.asyncio
async def test_market_prices_are_stored_by_unit(fake_database):
    admin = admin_token(fake_database)
    buyer = buyer_token(fake_database)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_72 = await client.put(
            "/api/v1/prices/",
            params={"price_unit_kg": 72},
            json={"nadu": 8100, "samba": 8500},
            headers={"Authorization": f"Bearer {admin}"},
        )
        create_75 = await client.put(
            "/api/v1/prices/",
            params={"price_unit_kg": 75},
            json={"nadu": 8400, "samba": 8850},
            headers={"Authorization": f"Bearer {admin}"},
        )
        get_72 = await client.get(
            "/api/v1/prices/",
            params={"price_unit_kg": 72},
            headers={"Authorization": f"Bearer {buyer}"},
        )
        get_75 = await client.get(
            "/api/v1/prices/",
            params={"price_unit_kg": 75},
            headers={"Authorization": f"Bearer {buyer}"},
        )

    assert create_72.status_code == 200
    assert create_75.status_code == 200
    assert len(fake_database.market_prices.documents) == 2
    assert get_72.status_code == 200
    assert get_72.json()["selected_unit_kg"] == 72
    assert get_72.json()["latest"]["prices"]["nadu"] == 8100
    assert get_75.status_code == 200
    assert get_75.json()["selected_unit_kg"] == 75
    assert get_75.json()["latest"]["prices"]["nadu"] == 8400


@pytest.mark.asyncio
async def test_market_prices_reject_invalid_unit(fake_database):
    admin = admin_token(fake_database)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.put(
            "/api/v1/prices/",
            params={"price_unit_kg": 1},
            json={"nadu": 112},
            headers={"Authorization": f"Bearer {admin}"},
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Select a valid market price unit"
