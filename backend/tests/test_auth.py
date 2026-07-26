"""Tests for authentication endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_register_farmer():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Test Farmer",
                "phone": "0771234567",
                "email": "testfarmer@example.com",
                "password": "securepass123",
                "role": "farmer",
                "district": "Anuradhapura",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["role"] == "farmer"


@pytest.mark.asyncio
async def test_login_invalid_credentials():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/login",
            json={
                "login_id": "nonexistent@example.com",
                "password": "wrongpass",
            },
        )
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_register_duplicate_email():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "full_name": "Dup User",
            "phone": "0779998888",
            "email": "dup@example.com",
            "password": "securepass123",
            "role": "buyer",
        }
        await client.post("/api/v1/auth/register", json=payload)
        resp = await client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 400


@pytest.mark.asyncio
async def test_register_rejects_non_numeric_phone():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Bad Phone",
                "phone": "+94771234567",
                "email": "badphone@example.com",
                "password": "securepass123",
                "role": "buyer",
            },
        )
        assert resp.status_code == 422
        assert "Only numbers can be entered" in resp.text


@pytest.mark.asyncio
async def test_register_rejects_name_with_numbers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Farmer 1",
                "phone": "0771234568",
                "email": "badname@example.com",
                "password": "securepass123",
                "role": "farmer",
                "district": "Anuradhapura",
            },
        )
        assert resp.status_code == 422
        assert "Full name cannot contain numbers" in resp.text


@pytest.mark.asyncio
async def test_register_rejects_phone_without_07_prefix():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Bad Prefix",
                "phone": "0812345678",
                "email": "badprefix@example.com",
                "password": "securepass123",
                "role": "buyer",
            },
        )
        assert resp.status_code == 422
        assert "Phone number must start with 07" in resp.text
