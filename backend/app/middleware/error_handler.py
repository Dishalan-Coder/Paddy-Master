"""Global exception handling for FastAPI."""

import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.db.mongodb import DatabaseUnavailableError

logger = logging.getLogger(__name__)


async def database_exception_handler(_: Request, exc: DatabaseUnavailableError):
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": str(exc), "message": "Database unavailable"},
    )


async def general_exception_handler(_: Request, exc: Exception):
    logger.exception("Unhandled application error", exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred",
            "message": "Internal server error",
        },
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(DatabaseUnavailableError, database_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
