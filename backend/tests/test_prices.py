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


def second_buyer_token(fake_database):
    user_id = ObjectId()
    fake_database.users.documents.append(
        {
            "_id": user_id,
            "full_name": "Rice Mill Buyer",
            "email": "rice-mill-buyer@example.com",
            "phone": "0770000034",
            "role": "buyer",
            "district": "Polonnaruwa",
        }
    )
    return create_access_token({"sub": str(user_id), "role": "buyer"})


def farmer_token(fake_database):
    user_id = ObjectId()
    fake_database.users.documents.append(
        {
            "_id": user_id,
            "full_name": "Market Farmer",
            "email": "market-farmer@example.com",
            "phone": "0770000033",
            "role": "farmer",
            "district": "Anuradhapura",
        }
    )
    return create_access_token({"sub": str(user_id), "role": "farmer"})


@pytest.mark.asyncio
async def test_market_prices_are_stored_by_buyer_and_unit(fake_database):
    buyer = buyer_token(fake_database)
    farmer = farmer_token(fake_database)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_72 = await client.put(
            "/api/v1/prices/",
            params={"price_unit_kg": 72},
            json={"nadu": 8100, "samba": 8500},
            headers={"Authorization": f"Bearer {buyer}"},
        )
        create_75 = await client.put(
            "/api/v1/prices/",
            params={"price_unit_kg": 75},
            json={"nadu": 8400, "samba": 8850},
            headers={"Authorization": f"Bearer {buyer}"},
        )
        get_72 = await client.get(
            "/api/v1/prices/",
            params={"price_unit_kg": 72},
            headers={"Authorization": f"Bearer {farmer}"},
        )
        get_75 = await client.get(
            "/api/v1/prices/",
            params={"price_unit_kg": 75},
            headers={"Authorization": f"Bearer {farmer}"},
        )
        get_buyer_view = await client.get(
            "/api/v1/prices/",
            params={"price_unit_kg": 72},
            headers={"Authorization": f"Bearer {buyer}"},
        )

    assert create_72.status_code == 200
    assert create_75.status_code == 200
    assert len(fake_database.market_prices.documents) == 2
    assert create_72.json()["buyer_name"] == "Market Buyer"
    assert get_72.status_code == 200
    assert get_72.json()["selected_unit_kg"] == 72
    assert get_72.json()["latest"]["prices"]["nadu"] == 8100
    assert get_72.json()["buyer_prices"][0]["buyer_name"] == "Market Buyer"
    assert get_72.json()["current_buyer_offer"] is None
    assert get_75.status_code == 200
    assert get_75.json()["selected_unit_kg"] == 75
    assert get_75.json()["latest"]["prices"]["nadu"] == 8400
    assert get_buyer_view.json()["current_buyer_offer"]["prices"]["nadu"] == 8100


@pytest.mark.asyncio
async def test_farmers_can_compare_every_buyers_prices(fake_database):
    buyer = buyer_token(fake_database)
    second_buyer = second_buyer_token(fake_database)
    farmer = farmer_token(fake_database)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.put(
            "/api/v1/prices/",
            params={"price_unit_kg": 72},
            json={"nadu": 8100, "samba": 8500},
            headers={"Authorization": f"Bearer {buyer}"},
        )
        await client.put(
            "/api/v1/prices/",
            params={"price_unit_kg": 72},
            json={"nadu": 8250, "samba": 8725},
            headers={"Authorization": f"Bearer {second_buyer}"},
        )
        response = await client.get(
            "/api/v1/prices/",
            params={"price_unit_kg": 72},
            headers={"Authorization": f"Bearer {farmer}"},
        )

    assert response.status_code == 200
    buyer_prices = response.json()["buyer_prices"]
    assert [offer["buyer_name"] for offer in buyer_prices] == [
        "Rice Mill Buyer",
        "Market Buyer",
    ]
    assert buyer_prices[0]["best_offer"] == 8725
    assert buyer_prices[1]["prices"]["nadu"] == 8100


@pytest.mark.asyncio
async def test_admins_cannot_fix_market_prices(fake_database):
    admin = admin_token(fake_database)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.put(
            "/api/v1/prices/",
            params={"price_unit_kg": 72},
            json={"nadu": 8100},
            headers={"Authorization": f"Bearer {admin}"},
        )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_market_prices_reject_invalid_unit(fake_database):
    buyer = buyer_token(fake_database)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.put(
            "/api/v1/prices/",
            params={"price_unit_kg": 1},
            json={"nadu": 112},
            headers={"Authorization": f"Bearer {buyer}"},
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Select a valid market price unit"
