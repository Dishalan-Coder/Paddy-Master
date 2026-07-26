"""MongoDB connection management using Motor."""

from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

client: Optional[AsyncIOMotorClient] = None
db: Optional[AsyncIOMotorDatabase] = None


class DatabaseUnavailableError(RuntimeError):
    """Raised when an endpoint needs MongoDB but no connection is available."""


async def connect_db() -> None:
    global client, db
    try:
        candidate = AsyncIOMotorClient(
            settings.MONGO_URI, serverSelectionTimeoutMS=5000
        )
        await candidate.admin.command("ping")
        client = candidate
        db = client[settings.DB_NAME]

        await db.users.create_index("email", unique=True)
        await db.users.create_index("phone", unique=True)
        await db.products.create_index("farmer_id")
        await db.products.create_index([("variety", 1), ("region", 1)])
        await db.orders.create_index("buyer_id")
        await db.orders.create_index("farmer_id")
        await db.messages.create_index("conversation_id")
        await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
        await db.notifications.create_index(
            [("user_id", 1), ("metadata.reminder_key", 1)],
            unique=True,
            partialFilterExpression={"metadata.reminder_key": {"$exists": True}},
        )
        await db.reviews.create_index([("product_id", 1), ("created_at", -1)])
        await db.reviews.create_index([("order_id", 1), ("buyer_id", 1)], unique=True)
        await db.orders.create_index([("status", 1), ("created_at", -1)])
        print("Connected to MongoDB")
    except Exception as exc:
        if client:
            client.close()
        client = None
        db = None
        print(f"MongoDB connection unavailable: {exc}")


async def close_db() -> None:
    global client, db
    if client:
        client.close()
    client = None
    db = None


def get_database() -> Optional[AsyncIOMotorDatabase]:
    return db


def get_database_or_raise() -> AsyncIOMotorDatabase:
    database = get_database()
    if database is None:
        raise DatabaseUnavailableError(
            "Database not available. Start MongoDB or check MONGO_URI in backend/.env."
        )
    return database
