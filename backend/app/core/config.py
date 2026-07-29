"""Application configuration loaded from the project ``.env`` and environment variables."""

from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    # MongoDB
    MONGO_URI: str
    DB_NAME: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_EXPIRE_MINUTES: int

    # AWS S3 (optional; local uploads are used when these are not configured)
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    S3_BUCKET_NAME: str

    # Weather (optional; safe sample data is returned when this is empty)
    WEATHER_API_KEY: str

    # Comma-separated origins
    CORS_ORIGINS: str

    # Public frontend URL used for external payment redirects
    PUBLIC_SITE_URL: str

    # Stripe subscriptions
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_FARMER_PRICE_ID: str
    STRIPE_BUYER_PRICE_ID: str
    STRIPE_SUCCESS_URL: str
    STRIPE_CANCEL_URL: str
    STRIPE_BILLING_RETURN_URL: str

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    @property
    def s3_enabled(self) -> bool:
        return bool(
            self.AWS_ACCESS_KEY_ID
            and self.AWS_SECRET_ACCESS_KEY
            and self.S3_BUCKET_NAME
            and not self.AWS_ACCESS_KEY_ID.lower().startswith("your_")
        )


settings = Settings()
