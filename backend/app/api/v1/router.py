"""Aggregate all endpoint routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin, auth, crops, expenses, farms, messages, notifications, orders,
    payments, prices, products, recommendations, reports, reviews, users, weather,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(farms.router, prefix="/farms", tags=["Farms"])
api_router.include_router(crops.router, prefix="/crops", tags=["Crops"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(prices.router, prefix="/prices", tags=["Market Prices"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messages"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(reports.router, prefix="/dashboard", tags=["Dashboard"])
