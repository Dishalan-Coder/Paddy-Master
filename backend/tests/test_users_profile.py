"""Tests for user profile update endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


async def register_user(client: AsyncClient, **overrides):
    payload = {
        "full_name": "Profile User",
        "phone": "0770000001",
        "email": "profile@example.com",
        "password": "securepass123",
        "role": "farmer",
        "district": "Anuradhapura",
    }
    payload.update(overrides)
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    return response.json()


@pytest.mark.asyncio
async def test_update_profile_trims_and_normalizes_fields():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await register_user(client)

        response = await client.put(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
            json={
                "full_name": "  Updated Farmer  ",
                "phone": " 0771234567 ",
                "email": " UPDATED@example.com ",
                "district": " Colombo ",
                "address": "  Main Road  ",
                "bio": "  Organic paddy supplier.  ",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Farmer"
    assert data["phone"] == "0771234567"
    assert data["email"] == "updated@example.com"
    assert data["district"] == "Colombo"
    assert data["address"] == "Main Road"
    assert data["bio"] == "Organic paddy supplier."


@pytest.mark.asyncio
async def test_update_profile_rejects_trimmed_short_name():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await register_user(client)

        response = await client.put(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
            json={"full_name": " A "},
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_profile_rejects_duplicate_email_or_phone():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await register_user(
            client,
            full_name="Existing Buyer",
            phone="0770000002",
            email="existing@example.com",
            role="buyer",
        )
        registered = await register_user(
            client,
            full_name="Second Farmer",
            phone="0770000003",
            email="second@example.com",
        )

        response = await client.put(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
            json={"email": " existing@example.com "},
        )

    assert response.status_code == 409
    assert response.json()["detail"] == "Email or phone already in use"


@pytest.mark.asyncio
async def test_update_profile_rejects_non_numeric_phone():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await register_user(client)

        response = await client.put(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
            json={"phone": "+94771234567"},
        )

    assert response.status_code == 422
    assert "Only numbers can be entered" in response.text


@pytest.mark.asyncio
async def test_update_profile_rejects_phone_without_07_prefix():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await register_user(client)

        response = await client.put(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
            json={"phone": "0812345678"},
        )

    assert response.status_code == 422
    assert "Phone number must start with 07" in response.text


@pytest.mark.asyncio
async def test_update_profile_rejects_invalid_district():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await register_user(client)

        response = await client.put(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
            json={"district": "Invalid district"},
        )

    assert response.status_code == 422
    assert "Select a valid district" in response.text
