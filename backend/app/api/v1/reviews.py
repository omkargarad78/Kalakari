from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.all_schemas import ReviewResponse, ReviewCreate
from app.crud.crud_operations import create_review, get_approved_product_reviews
from app.api.v1.deps import get_current_user, get_current_admin
from app.models.all_models import Review

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
def add_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    review = create_review(db, current_user.id, review_in)
    r_res = ReviewResponse.from_orm(review)
    r_res.user_name = current_user.full_name
    return r_res

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: str, db: Session = Depends(get_db)):
    reviews = get_approved_product_reviews(db, product_id)
    res = []
    for r in reviews:
        r_res = ReviewResponse.from_orm(r)
        if r.user:
            r_res.user_name = r.user.full_name
        res.append(r_res)
    return res

@router.get("/admin/all", response_model=List[ReviewResponse])
def admin_all_reviews(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    reviews = db.execute(select(Review).order_by(Review.created_at.desc())).scalars().all()
    res = []
    for r in reviews:
        r_res = ReviewResponse.from_orm(r)
        if r.user:
            r_res.user_name = r.user.full_name
        res.append(r_res)
    return res

@router.put("/{review_id}/approve", response_model=ReviewResponse)
def approve_review(
    review_id: str,
    approve: bool,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    review = db.execute(select(Review).where(Review.id == review_id)).scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    review.is_approved = approve
    db.commit()
    db.refresh(review)
    
    r_res = ReviewResponse.from_orm(review)
    if review.user:
        r_res.user_name = review.user.full_name
    return r_res
