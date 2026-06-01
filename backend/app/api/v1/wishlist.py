from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.all_schemas import WishlistResponse, WishlistCreate
from app.crud.crud_operations import get_user_wishlist, add_to_wishlist, remove_from_wishlist
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[WishlistResponse])
def read_wishlist(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    items = get_user_wishlist(db, current_user.id)
    return items

@router.post("/", response_model=WishlistResponse)
def create_wishlist_item(item_in: WishlistCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return add_to_wishlist(db, current_user.id, item_in.product_id)

@router.delete("/{product_id}")
def delete_wishlist_item(product_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    success = remove_from_wishlist(db, current_user.id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    return {"status": "success", "message": "Product removed from wishlist"}
