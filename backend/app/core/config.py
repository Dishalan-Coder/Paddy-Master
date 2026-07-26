"""Application configuration loaded from ``backend/.env`` and environment variables."""

from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # MongoDB
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "paddy_master"

    # JWT
    JWT_SECRET: str = "change-this-secret-before-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # AWS S3 (optional; local uploads are used when these are not configured)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = ""

    # Weather (optional; safe sample data is returned when this is empty)
    WEATHER_API_KEY: str = ""

    # Comma-separated origins
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def s3_enabled(self) -> bool:
        return bool(
            self.AWS_ACCESS_KEY_ID
            and self.AWS_SECRET_ACCESS_KEY
            and self.S3_BUCKET_NAME
            and not self.AWS_ACCESS_KEY_ID.lower().startswith("your_")
        )


settings = Settings()
