from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.session import get_db
from app.schemas.all_schemas import UserResponse, UserCreate, Token, UserUpdate
from app.crud.crud_operations import get_user_by_email, create_user, update_user_profile
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.api.v1.deps import get_current_user
from app.services.mail import send_welcome_email

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
    user = create_user(db, user_in)
    # Send welcome email (asynchronous or background task, but we invoke it directly)
    send_welcome_email(user.email, user.full_name)
    return user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(data: UserUpdate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_user_profile(db, current_user, data)
