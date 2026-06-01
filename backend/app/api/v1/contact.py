from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.all_schemas import (
    ContactMessageCreate, ContactMessageResponse,
    NewsletterSubscriberCreate, NewsletterSubscriberResponse
)
from app.crud.crud_operations import create_contact_message, subscribe_newsletter
from app.api.v1.deps import get_current_admin
from app.models.all_models import ContactMessage, NewsletterSubscriber

router = APIRouter()

@router.post("/contact", response_model=ContactMessageResponse)
def submit_contact(msg_in: ContactMessageCreate, db: Session = Depends(get_db)):
    return create_contact_message(db, msg_in)

@router.post("/newsletter", response_model=NewsletterSubscriberResponse)
def add_subscriber(sub_in: NewsletterSubscriberCreate, db: Session = Depends(get_db)):
    return subscribe_newsletter(db, sub_in.email)

@router.get("/admin/contacts", response_model=List[ContactMessageResponse])
def get_contacts(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    return db.execute(select(ContactMessage).order_by(ContactMessage.created_at.desc())).scalars().all()

@router.get("/admin/newsletter-subscribers", response_model=List[NewsletterSubscriberResponse])
def get_newsletter_subscribers(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    return db.execute(select(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc())).scalars().all()
