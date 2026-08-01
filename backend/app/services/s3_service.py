"""Image storage helper with optional S3 and a local development fallback."""

from pathlib import Path
from typing import Optional
import uuid
import logging

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import settings

BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_ROOT = BACKEND_DIR / "uploads"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
logger = logging.getLogger(__name__)


def _extension(content_type: str) -> str:
    return {
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }.get(content_type, ".jpg")


def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def _store_local_file(file_bytes: bytes, folder: str, filename: str) -> Optional[str]:
    key = f"{folder}/{filename}"
    destination = UPLOAD_ROOT / folder / filename
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(file_bytes)
    except OSError:
        logger.exception("Local file upload failed for %s", key)
        return None
    return f"local://{key}"


def upload_file(
    file_bytes: bytes, folder: str, content_type: str = "image/jpeg"
) -> Optional[str]:
    if not file_bytes:
        return None

    extension = _extension(content_type)
    filename = f"{uuid.uuid4().hex}{extension}"

    if settings.s3_enabled:
        key = f"{folder}/{filename}"
        try:
            get_s3_client().put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
            )
            return f"s3://{key}"
        except ClientError as exc:
            error = exc.response.get("Error", {})
            logger.warning(
                "S3 upload failed for %s with %s: %s; using local storage",
                key,
                error.get("Code", "Unknown"),
                error.get("Message", str(exc)),
            )
        except BotoCoreError as exc:
            logger.warning(
                "S3 upload failed for %s with %s; using local storage", key, exc
            )

    return _store_local_file(file_bytes, folder, filename)


def generate_presigned_url(key: str, expires_in: int = 3600) -> Optional[str]:
    if key.startswith("local://"):
        return "/uploads/" + key.removeprefix("local://")
    if key.startswith("s3://"):
        key = key.removeprefix("s3://")
    if not settings.s3_enabled:
        return None
    try:
        return get_s3_client().generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
            ExpiresIn=expires_in,
        )
    except (ClientError, BotoCoreError):
        return None


def delete_file(key: str) -> bool:
    if key.startswith("local://"):
        path = UPLOAD_ROOT / key.removeprefix("local://")
        try:
            path.unlink(missing_ok=True)
            return True
        except OSError:
            return False
    if not settings.s3_enabled:
        return False
    try:
        get_s3_client().delete_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key.removeprefix("s3://"),
        )
        return True
    except (ClientError, BotoCoreError):
        return False


def resolve_file_url(value: str | None, expires_in: int = 3600) -> Optional[str]:
    """Return a usable URL from a stored local/S3 key or an existing URL."""
    if not value:
        return None
    if value.startswith(("http://", "https://", "/uploads/")):
        return value
    return generate_presigned_url(value, expires_in)
