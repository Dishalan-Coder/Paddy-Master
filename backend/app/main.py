"""Paddy Master FastAPI application entry point."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.mongodb import close_db, connect_db, get_database
from app.middleware.error_handler import register_error_handlers

BACKEND_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_db()
    yield
    await close_db()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Paddy Master API",
        description="Smart Paddy Field Agriculture Management System",
        version="1.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
    app.include_router(api_router, prefix="/api/v1")
    register_error_handlers(app)

    @app.get("/health")
    async def health_check():
        return {
            "status": "ok",
            "service": "paddy-master-api",
            "database": "connected" if get_database() is not None else "disconnected",
        }

    return app


app = create_app()
