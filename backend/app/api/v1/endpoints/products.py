"""Marketplace product endpoints."""

from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)

from app.middleware.auth_middleware import get_current_user
from app.middleware.role_middleware import require_farmer
from app.models.product import ProductCreate, ProductUpdate
from app.services import product_service, s3_service

router = APIRouter()
MAX_IMAGE_SIZE = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(
    variety: str = Form(...),
    quantity_kg: float = Form(..., gt=0),
    price_per_kg: float = Form(..., gt=0),
    price_unit_kg: int = Form(72),
    region: str = Form(...),
    district: str = Form(...),
    harvest_date: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_organic: bool = Form(False),
    images: List[UploadFile] = File(default=[]),
    user=Depends(require_farmer),
):
    if len(images) > 5:
        raise HTTPException(status_code=400, detail="Upload a maximum of 5 images")

    image_urls: list[str] = []
    for image in images:
        content_type = image.content_type or "application/octet-stream"
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400, detail=f"Unsupported image type: {content_type}"
            )
        content = await image.read(MAX_IMAGE_SIZE + 1)
        if len(content) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400, detail="Each image must be 5 MB or smaller"
            )
        key = s3_service.upload_file(content, "products", content_type)
        if key:
            image_urls.append(key)

    data = ProductCreate(
        variety=variety,
        quantity_kg=quantity_kg,
        price_per_kg=price_per_kg,
        price_unit_kg=price_unit_kg,
        region=region,
        district=district,
        harvest_date=harvest_date,
        description=description,
        is_organic=is_organic,
        image_urls=image_urls,
    )
    return await product_service.create_product(user["_id"], data)


@router.get("/my")
async def my_products(user=Depends(require_farmer)):
    return await product_service.get_farmer_products(user["_id"])


@router.get("/")
async def list_products(
    variety: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    is_organic: Optional[bool] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: int = Query(-1),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user),
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=400, detail="Minimum price cannot exceed maximum price"
        )
    return await product_service.get_all_products(
        variety=variety,
        region=region,
        district=district,
        min_price=min_price,
        max_price=max_price,
        is_organic=is_organic,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit,
    )


@router.get("/{product_id}")
async def get_product(product_id: str, user=Depends(get_current_user)):
    product = await product_service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}")
async def update_product(
    product_id: str, data: ProductUpdate, user=Depends(require_farmer)
):
    product = await product_service.update_product(product_id, user["_id"], data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, user=Depends(require_farmer)):
    if not await product_service.delete_product(product_id, user["_id"]):
        raise HTTPException(status_code=404, detail="Product not found")
