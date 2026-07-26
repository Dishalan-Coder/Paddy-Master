"""Create or update an administrator account."""

import argparse
import asyncio
from datetime import datetime, timezone

from app.core.security import hash_password
from app.db.mongodb import close_db, connect_db, get_database_or_raise


async def create_admin(args):
    await connect_db()
    db = get_database_or_raise()
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"email": args.email.lower()},
        {
            "$set": {
                "full_name": args.name,
                "phone": args.phone,
                "email": args.email.lower(),
                "hashed_password": hash_password(args.password),
                "role": "admin",
                "district": args.district,
                "profile_image_url": None,
                "is_verified": True,
                "rating": 0.0,
                "total_reviews": 0,
                "updated_at": now,
            },
            "$setOnInsert": {"wallet_balance": 0.0, "created_at": now},
        },
        upsert=True,
    )
    print(f"Admin account ready: {args.email.lower()}")
    await close_db()


def main():
    parser = argparse.ArgumentParser(
        description="Create or update a Paddy Master admin"
    )
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--phone", required=True)
    parser.add_argument("--password", required=True, help="Use at least 8 characters")
    parser.add_argument("--district", default="Colombo")
    args = parser.parse_args()
    if len(args.password) < 8:
        parser.error("--password must contain at least 8 characters")
    asyncio.run(create_admin(args))


if __name__ == "__main__":
    main()
