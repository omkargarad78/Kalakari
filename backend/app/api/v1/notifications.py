from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.all_schemas import NotificationResponse
from app.api.v1.deps import get_current_user
from app.models.all_models import Notification

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def read_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    ).scalars().all()

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    notif = db.execute(
        select(Notification)
        .where(Notification.id == notification_id, Notification.user_id == current_user.id)
    ).scalars().first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
