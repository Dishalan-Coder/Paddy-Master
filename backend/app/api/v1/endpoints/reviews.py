"""Product review endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.middleware.auth_middleware import get_current_user
from app.middleware.role_middleware import require_buyer
from app.models.review import ReviewCreate
from app.services import review_service

router = APIRouter()


@router.get("/products/{product_id}")
async def product_reviews(
    product_id: str,
    limit: int = Query(30, ge=1, le=100),
    user=Depends(get_current_user),
):
    return await review_service.get_product_reviews(product_id, limit)


@router.post("/products/{product_id}", status_code=201)
async def add_review(product_id: str, data: ReviewCreate, user=Depends(require_buyer)):
    try:
        return await review_service.create_review(user["_id"], product_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
