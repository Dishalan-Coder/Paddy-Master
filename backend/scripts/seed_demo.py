"""Seed a complete local demo dataset.

Usage:
    python -m scripts.seed_demo

The script is idempotent and intended only for local development/demo use.
"""

import asyncio
from datetime import date, datetime, timedelta, timezone

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.core.security import hash_password

DEMO_PASSWORD = "Demo123!"


async def upsert_user(
    db, *, email: str, phone: str, name: str, role: str, district: str, verified: bool
):
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "full_name": name,
                "phone": phone,
                "email": email,
                "hashed_password": hash_password(DEMO_PASSWORD),
                "role": role,
                "district": district,
                "profile_image_url": None,
                "is_verified": verified,
                "rating": 4.8 if role == "farmer" else 0.0,
                "total_reviews": 12 if role == "farmer" else 0,
                "wallet_balance": 245000.0 if role == "farmer" else 0.0,
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )
    return await db.users.find_one({"email": email})


async def main():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    now = datetime.now(timezone.utc)

    admin = await upsert_user(
        db,
        email="admin@paddymaster.lk",
        phone="0770000001",
        name="Paddy Master Admin",
        role="admin",
        district="Colombo",
        verified=True,
    )
    farmer = await upsert_user(
        db,
        email="farmer@paddymaster.lk",
        phone="0770000002",
        name="Arul Selvan",
        role="farmer",
        district="Kilinochchi",
        verified=True,
    )
    buyer = await upsert_user(
        db,
        email="buyer@paddymaster.lk",
        phone="0770000003",
        name="Nimal Traders",
        role="buyer",
        district="Colombo",
        verified=True,
    )

    await db.farms.delete_many({"demo_seed": True})
    farm_result = await db.farms.insert_one(
        {
            "farmer_id": farmer["_id"],
            "name": "Green Valley Field",
            "location": "Paranthan",
            "area_acres": 8.5,
            "soil_type": "clay loam",
            "district": "Kilinochchi",
            "demo_seed": True,
            "created_at": now,
        }
    )

    await db.crops.delete_many({"demo_seed": True})
    crop_docs = [
        {
            "farmer_id": farmer["_id"],
            "farm_id": farm_result.inserted_id,
            "variety": "Samba",
            "planting_date": (date.today() - timedelta(days=70)).isoformat(),
            "expected_harvest_date": (date.today() + timedelta(days=35)).isoformat(),
            "area_acres": 4.5,
            "growth_stage": "flowering",
            "notes": "Main season crop",
            "demo_seed": True,
            "created_at": now,
            "updated_at": now,
        },
        {
            "farmer_id": farmer["_id"],
            "farm_id": farm_result.inserted_id,
            "variety": "Nadu",
            "planting_date": (date.today() - timedelta(days=38)).isoformat(),
            "expected_harvest_date": (date.today() + timedelta(days=67)).isoformat(),
            "area_acres": 4.0,
            "growth_stage": "tillering",
            "notes": "Monitor leaf colour",
            "demo_seed": True,
            "created_at": now,
            "updated_at": now,
        },
    ]
    crop_ids = (await db.crops.insert_many(crop_docs)).inserted_ids

    await db.expenses.delete_many({"demo_seed": True})
    await db.expenses.insert_many(
        [
            {
                "farmer_id": farmer["_id"],
                "farm_id": farm_result.inserted_id,
                "crop_id": crop_ids[0],
                "category": "fertilizer",
                "amount": 42000.0,
                "description": "Basal and top-dressing fertilizer",
                "expense_date": (date.today() - timedelta(days=20)).isoformat(),
                "demo_seed": True,
                "created_at": now,
            },
            {
                "farmer_id": farmer["_id"],
                "farm_id": farm_result.inserted_id,
                "crop_id": crop_ids[1],
                "category": "labor",
                "amount": 28500.0,
                "description": "Field preparation labour",
                "expense_date": (date.today() - timedelta(days=35)).isoformat(),
                "demo_seed": True,
                "created_at": now,
            },
        ]
    )

    await db.products.delete_many({"demo_seed": True})
    products = [
        {
            "farmer_id": farmer["_id"],
            "variety": "Samba",
            "quantity_kg": 2200.0,
            "price_per_kg": 118.0,
            "region": "Paranthan",
            "district": "Kilinochchi",
            "harvest_date": (date.today() - timedelta(days=7)).isoformat(),
            "description": "Clean, well-dried Samba paddy stored in new bags.",
            "is_organic": False,
            "image_urls": [],
            "rating": 4.8,
            "total_reviews": 8,
            "status": "active",
            "views": 128,
            "demo_seed": True,
            "created_at": now - timedelta(days=2),
            "updated_at": now,
        },
        {
            "farmer_id": farmer["_id"],
            "variety": "Nadu",
            "quantity_kg": 1500.0,
            "price_per_kg": 111.0,
            "region": "Kilinochchi",
            "district": "Kilinochchi",
            "harvest_date": (date.today() - timedelta(days=3)).isoformat(),
            "description": "Fresh Nadu paddy suitable for wholesale buyers.",
            "is_organic": True,
            "image_urls": [],
            "rating": 4.6,
            "total_reviews": 4,
            "status": "active",
            "views": 84,
            "demo_seed": True,
            "created_at": now - timedelta(days=1),
            "updated_at": now,
        },
    ]
    product_ids = (await db.products.insert_many(products)).inserted_ids

    await db.orders.delete_many({"demo_seed": True})
    await db.orders.insert_one(
        {
            "product_id": product_ids[0],
            "buyer_id": buyer["_id"],
            "farmer_id": farmer["_id"],
            "quantity_kg": 500.0,
            "unit_price": 118.0,
            "total_price": 59000.0,
            "delivery_address": "No. 18, Main Street, Colombo 11",
            "notes": "Call before delivery",
            "status": "confirmed",
            "payment_method": "bank_transfer",
            "payment_status": "processing",
            "payment_reference": "DEMO-BANK-001",
            "paid_at": None,
            "wallet_credited": False,
            "demo_seed": True,
            "created_at": now - timedelta(days=1),
            "updated_at": now,
        }
    )

    await db.market_prices.delete_many({"demo_seed": True})
    price_docs = []
    for offset in range(7):
        day = date.today() - timedelta(days=6 - offset)
        price_docs.append(
            {
                "date": day.isoformat(),
                "region": "national",
                "prices": {
                    "nadu": 108 + offset * 0.7,
                    "samba": 115 + offset * 0.5,
                    "k_samba": 119 + offset * 0.4,
                },
                "demo_seed": True,
                "created_at": now,
            }
        )
    for region, delta in [
        ("Kilinochchi", -1.5),
        ("Anuradhapura", 0.5),
        ("Polonnaruwa", 1.0),
    ]:
        price_docs.append(
            {
                "date": date.today().isoformat(),
                "region": region,
                "prices": {
                    "nadu": 112 + delta,
                    "samba": 118 + delta,
                    "k_samba": 121 + delta,
                },
                "demo_seed": True,
                "created_at": now,
            }
        )
    await db.market_prices.insert_many(price_docs)

    await db.notifications.delete_many({"demo_seed": True})
    await db.notifications.insert_many(
        [
            {
                "user_id": farmer["_id"],
                "title": "Irrigation reminder",
                "message": "Review water level in the Nadu field before evening.",
                "type": "reminder",
                "action_url": "/recommendations",
                "metadata": {},
                "is_read": False,
                "demo_seed": True,
                "created_at": now,
            },
            {
                "user_id": buyer["_id"],
                "title": "Order confirmed",
                "message": "Your Samba order has been confirmed by the farmer.",
                "type": "order",
                "action_url": "/orders",
                "metadata": {},
                "is_read": False,
                "demo_seed": True,
                "created_at": now,
            },
            {
                "user_id": admin["_id"],
                "title": "Demo environment ready",
                "message": "Farmer, buyer, product, price, and order sample data is available.",
                "type": "system",
                "action_url": "/admin",
                "metadata": {},
                "is_read": False,
                "demo_seed": True,
                "created_at": now,
            },
        ]
    )

    print("Demo data created.")
    print(f"Admin:  admin@paddymaster.lk / {DEMO_PASSWORD}")
    print(f"Farmer: farmer@paddymaster.lk / {DEMO_PASSWORD}")
    print(f"Buyer:  buyer@paddymaster.lk / {DEMO_PASSWORD}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
