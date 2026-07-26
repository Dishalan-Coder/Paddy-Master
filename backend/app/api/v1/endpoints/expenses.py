"""Expense tracking endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.middleware.role_middleware import require_farmer
from app.models.expense import ExpenseCreate
from app.services import expense_service

router = APIRouter()


@router.post("/", status_code=201)
async def add_expense(data: ExpenseCreate, user=Depends(require_farmer)):
    try:
        return await expense_service.add_expense(user["_id"], data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/")
async def get_expenses(crop_id: str | None = Query(None), user=Depends(require_farmer)):
    return await expense_service.get_expenses(user["_id"], crop_id)


@router.get("/profit-loss")
async def get_profit_loss(user=Depends(require_farmer)):
    return await expense_service.calculate_profit_loss(user["_id"])
