from fastapi import APIRouter
from app.api.v1 import (
    auth, products, orders, custom_orders, wishlist, reviews, contact, analytics, addresses, notifications
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(custom_orders.router, prefix="/custom-orders", tags=["custom-orders"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(contact.router, prefix="", tags=["public"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(addresses.router, prefix="/addresses", tags=["addresses"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
