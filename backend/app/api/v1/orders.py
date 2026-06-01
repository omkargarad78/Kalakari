from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from decimal import Decimal
from app.db.session import get_db
from app.schemas.all_schemas import OrderResponse, OrderCreate, OrderStatusUpdate, CouponResponse
from app.crud.crud_operations import (
    create_order_with_upi, get_order_by_id, get_user_orders, get_all_orders_admin, get_coupon_by_code
)
from app.api.v1.deps import get_current_user, get_current_admin
from app.services.mail import send_order_confirmation_email, send_order_status_update
from app.services.cloudinary_service import upload_image
from app.models.all_models import Order, Payment

router = APIRouter()

@router.post("/checkout", response_model=OrderResponse)
def checkout(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # Standard shipping fee (mock: 150 INR, or free shipping if order > 2000)
        shipping_fee = Decimal("150.00")
        
        # Calculate subtotal first to check for free shipping criteria
        subtotal = Decimal("0.00")
        for item in order_in.items:
            from app.crud.crud_operations import get_product_by_id
            product = get_product_by_id(db, item.product_id)
            if product:
                price = product.price
                if item.product_variant_id:
                    from app.models.all_models import ProductVariant
                    variant = db.execute(select(ProductVariant).where(ProductVariant.id == item.product_variant_id)).scalars().first()
                    if variant and variant.price_override is not None:
                        price = variant.price_override
                subtotal += price * item.quantity
                
        if subtotal >= Decimal("2000.00"):
            shipping_fee = Decimal("0.00")
            
        order = create_order_with_upi(db, current_user.id, order_in, shipping_fee)
        
        # Send confirmation email
        send_order_confirmation_email(
            current_user.email,
            order.id,
            float(order.total_amount),
            order_in.transaction_id
        )
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history", response_model=List[OrderResponse])
def order_history(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_user_orders(db, current_user.id)

@router.get("/all", response_model=List[OrderResponse])
def admin_orders(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    return get_all_orders_admin(db, status=status, search=search)

@router.get("/{order_id}", response_model=OrderResponse)
def order_detail(order_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != "Admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden access to this order")
    return order

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    
    # Notify user of status update
    if order.user:
        send_order_status_update(order.user.email, order.id, order.status)
        
    return order

@router.put("/{order_id}/verify-payment", response_model=OrderResponse)
def verify_payment(
    order_id: str,
    is_completed: bool,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if not order.payment:
        raise HTTPException(status_code=400, detail="No payment info attached to order")
        
    if is_completed:
        order.payment.status = "Completed"
        order.status = "Confirmed"
    else:
        order.payment.status = "Failed"
        order.status = "Cancelled"
        
    db.commit()
    db.refresh(order)
    
    if order.user:
        send_order_status_update(order.user.email, order.id, order.status)
        
    return order

# ----------------- COUPON VALIDATOR -----------------
@router.get("/coupons/validate/{code}", response_model=CouponResponse)
def validate_coupon(code: str, db: Session = Depends(get_db)):
    coupon = get_coupon_by_code(db, code)
    if not coupon or not coupon.is_active:
        raise HTTPException(status_code=404, detail="Invalid or inactive coupon code")
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Coupon code has expired")
    if coupon.uses_count >= coupon.max_uses:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    return coupon

# ----------------- PAYMENT RECEIPT UPLOAD -----------------
@router.post("/upload-receipt")
def upload_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    url = upload_image(file, folder="receipts")
    return {"url": url}
