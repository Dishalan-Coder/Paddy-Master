"""Tests for order endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_create_order_unauthorized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/orders/",
            json={
                "product_id": "fake_id",
                "quantity_kg": 100,
                "delivery_address": "123 Main St, Colombo",
            },
        )
        assert resp.status_code == 401
