from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.all_schemas import AddressResponse, AddressCreate
from app.crud.crud_operations import get_user_addresses, create_address, get_address_by_id
from app.api.v1.deps import get_current_user
from app.models.all_models import Address

router = APIRouter()

@router.get("/", response_model=List[AddressResponse])
def read_addresses(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_user_addresses(db, current_user.id)

@router.post("/", response_model=AddressResponse)
def add_address(
    addr_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return create_address(db, current_user.id, addr_in)

@router.delete("/{address_id}")
def delete_address(
    address_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    addr = get_address_by_id(db, address_id, current_user.id)
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(addr)
    db.commit()
    return {"status": "success", "message": "Address deleted"}
