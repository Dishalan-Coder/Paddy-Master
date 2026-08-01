"""Tests for user profile update endpoints."""

import pytest
from botocore.exceptions import ClientError
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services import s3_service


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
async def test_update_profile_rejects_name_with_numbers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await register_user(client)

        response = await client.put(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
            json={"full_name": "Farmer 2"},
        )

    assert response.status_code == 422
    assert "Full name cannot contain numbers" in response.text


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


@pytest.mark.asyncio
async def test_upload_profile_photo_uses_local_storage(tmp_path, monkeypatch):
    monkeypatch.setattr(s3_service, "UPLOAD_ROOT", tmp_path)
    monkeypatch.setattr(s3_service.settings, "AWS_ACCESS_KEY_ID", "")
    monkeypatch.setattr(s3_service.settings, "AWS_SECRET_ACCESS_KEY", "")
    monkeypatch.setattr(s3_service.settings, "S3_BUCKET_NAME", "")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await register_user(client)

        response = await client.post(
            "/api/v1/users/me/photo",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
            files={"image": ("profile.png", b"fake image bytes", "image/png")},
        )

        profile = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
        )

    assert response.status_code == 200
    image_url = response.json()["profile_image_url"]
    assert image_url.startswith("/uploads/profiles/")
    assert (tmp_path / image_url.removeprefix("/uploads/")).read_bytes() == (
        b"fake image bytes"
    )
    assert profile.json()["profile_image_url"] == image_url


@pytest.mark.asyncio
async def test_upload_profile_photo_falls_back_to_local_when_s3_fails(
    tmp_path, monkeypatch
):
    class BrokenS3Client:
        def put_object(self, **_kwargs):
            raise ClientError(
                {"Error": {"Code": "NoSuchBucket", "Message": "Missing bucket"}},
                "PutObject",
            )

    monkeypatch.setattr(s3_service, "UPLOAD_ROOT", tmp_path)
    monkeypatch.setattr(s3_service.settings, "AWS_ACCESS_KEY_ID", "AKIA_TEST")
    monkeypatch.setattr(s3_service.settings, "AWS_SECRET_ACCESS_KEY", "secret")
    monkeypatch.setattr(s3_service.settings, "S3_BUCKET_NAME", "missing-bucket")
    monkeypatch.setattr(s3_service, "get_s3_client", lambda: BrokenS3Client())

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await register_user(client)

        response = await client.post(
            "/api/v1/users/me/photo",
            headers={"Authorization": f"Bearer {registered['access_token']}"},
            files={"image": ("profile.webp", b"webp image bytes", "image/webp")},
        )

    assert response.status_code == 200
    image_url = response.json()["profile_image_url"]
    assert image_url.startswith("/uploads/profiles/")
    assert image_url.endswith(".webp")
    assert (tmp_path / image_url.removeprefix("/uploads/")).read_bytes() == (
        b"webp image bytes"
    )
