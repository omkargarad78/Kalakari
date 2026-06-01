from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.all_schemas import CustomOrderResponse, CustomOrderCreate, CustomOrderUpdate
from app.crud.crud_operations import (
    create_custom_order, get_user_custom_orders, get_all_custom_orders_admin
)
from app.api.v1.deps import get_current_user, get_current_admin
from app.services.mail import send_custom_order_quotation
from app.models.all_models import CustomOrder

router = APIRouter()

@router.post("/", response_model=CustomOrderResponse)
def add_custom_request(
    custom_in: CustomOrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return create_custom_order(db, current_user.id, custom_in)

@router.get("/my-requests", response_model=List[CustomOrderResponse])
def my_requests(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    orders = get_user_custom_orders(db, current_user.id)
    # Populate user details manually
    res = []
    for o in orders:
        o_res = CustomOrderResponse.from_orm(o)
        o_res.user_name = current_user.full_name
        o_res.user_email = current_user.email
        res.append(o_res)
    return res

@router.get("/admin/all", response_model=List[CustomOrderResponse])
def admin_all_requests(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    orders = get_all_custom_orders_admin(db)
    res = []
    for o in orders:
        o_res = CustomOrderResponse.from_orm(o)
        if o.user:
            o_res.user_name = o.user.full_name
            o_res.user_email = o.user.email
        res.append(o_res)
    return res

@router.put("/{custom_order_id}/quote", response_model=CustomOrderResponse)
def send_quotation(
    custom_order_id: str,
    update_in: CustomOrderUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    query = select(CustomOrder).where(CustomOrder.id == custom_order_id)
    custom_order = db.execute(query).scalars().first()
    if not custom_order:
        raise HTTPException(status_code=404, detail="Custom order request not found")
        
    custom_order.status = "Quoted"
    if update_in.quotation_amount is not None:
        custom_order.quotation_amount = update_in.quotation_amount
    if update_in.admin_notes is not None:
        custom_order.admin_notes = update_in.admin_notes
        
    db.commit()
    db.refresh(custom_order)
    
    # Send Quotation Email
    if custom_order.user:
        send_custom_order_quotation(
            custom_order.user.email,
            custom_order.id,
            float(custom_order.quotation_amount),
            custom_order.admin_notes
        )
        
    o_res = CustomOrderResponse.from_orm(custom_order)
    if custom_order.user:
        o_res.user_name = custom_order.user.full_name
        o_res.user_email = custom_order.user.email
    return o_res

@router.put("/{custom_order_id}/respond", response_model=CustomOrderResponse)
def respond_to_quote(
    custom_order_id: str,
    accept: bool,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(CustomOrder).where(CustomOrder.id == custom_order_id)
    custom_order = db.execute(query).scalars().first()
    if not custom_order:
        raise HTTPException(status_code=404, detail="Custom order request not found")
    if custom_order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    if accept:
        custom_order.status = "Approved"
    else:
        custom_order.status = "Rejected"
        
    db.commit()
    db.refresh(custom_order)
    
    o_res = CustomOrderResponse.from_orm(custom_order)
    o_res.user_name = current_user.full_name
    o_res.user_email = current_user.email
    return o_res
