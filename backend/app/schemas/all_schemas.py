from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime
from decimal import Decimal

# Token Schema
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Image Schemas
class ProductImageBase(BaseModel):
    url: str
    position: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: str
    product_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Variant Schemas
class ProductVariantBase(BaseModel):
    name: str
    price_override: Optional[Decimal] = None
    stock: int = 0

class ProductVariantCreate(ProductVariantBase):
    pass

class ProductVariantResponse(ProductVariantBase):
    id: str
    product_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: Decimal
    stock: int
    category_id: Optional[str] = None
    is_featured: bool = False
    is_visible: bool = True
    materials: Optional[str] = None
    handmade_details: Optional[str] = None
    shipping_info: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    category_id: Optional[str] = None
    is_featured: Optional[bool] = None
    is_visible: Optional[bool] = None
    materials: Optional[str] = None
    handmade_details: Optional[str] = None
    shipping_info: Optional[str] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []
    category_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Address Schemas
class AddressBase(BaseModel):
    full_name: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone: str
    address_type: str = "shipping"
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Cart & Order Item Schemas
class OrderItemBase(BaseModel):
    product_id: str
    product_variant_id: Optional[str] = None
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(BaseModel):
    id: str
    product_id: Optional[str]
    product_variant_id: Optional[str]
    quantity: int
    price: Decimal
    product_name: Optional[str] = None
    variant_name: Optional[str] = None
    product_image: Optional[str] = None
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    transaction_id: str
    payment_method: str = "UPI"
    amount: Decimal
    screenshot_url: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: str
    order_id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Coupon Schemas
class CouponBase(BaseModel):
    code: str
    discount_type: str
    value: Decimal
    min_purchase_amount: Decimal = 0.00
    expires_at: Optional[datetime] = None
    max_uses: int = 100
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: str
    uses_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    shipping_address_id: str
    billing_address_id: str
    coupon_code: Optional[str] = None
    gift_note: Optional[str] = None
    items: List[OrderItemCreate]
    transaction_id: str  # UPI transaction UTR reference
    screenshot_url: Optional[str] = None  # Uploaded receipt

class OrderResponse(BaseModel):
    id: str
    user_id: Optional[str]
    status: str
    total_amount: Decimal
    discount_amount: Decimal
    gift_note: Optional[str]
    shipping_fee: Decimal
    payment_method: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    payment: Optional[PaymentResponse] = None
    shipping_address: Optional[AddressResponse] = None
    billing_address: Optional[AddressResponse] = None
    
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str

# Review Schemas
class ReviewBase(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str
    user_id: str
    user_name: Optional[str] = None
    is_approved: bool
    is_featured: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Wishlist Schemas
class WishlistCreate(BaseModel):
    product_id: str

class WishlistResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True

# Custom Order Schemas
class CustomOrderCreate(BaseModel):
    description: str
    preferred_colors: Optional[str] = None
    budget: Optional[Decimal] = None
    required_delivery_date: Optional[datetime] = None
    additional_notes: Optional[str] = None
    reference_image_url: Optional[str] = None

class CustomOrderUpdate(BaseModel):
    status: Optional[str] = None
    quotation_amount: Optional[Decimal] = None
    admin_notes: Optional[str] = None

class CustomOrderResponse(BaseModel):
    id: str
    user_id: str
    description: str
    preferred_colors: Optional[str]
    budget: Optional[Decimal]
    required_delivery_date: Optional[datetime]
    additional_notes: Optional[str]
    reference_image_url: Optional[str]
    status: str
    quotation_amount: Optional[Decimal]
    admin_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    
    class Config:
        from_attributes = True

# Contact Schemas
class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str

class ContactMessageResponse(ContactMessageCreate):
    id: str
    is_replied: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Newsletter Schemas
class NewsletterSubscriberCreate(BaseModel):
    email: EmailStr

class NewsletterSubscriberResponse(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Notifications
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class DashboardStats(BaseModel):
    total_revenue: Decimal
    total_orders: int
    total_products: int
    total_customers: int
    monthly_sales: List[dict]
    recent_activity: List[dict]
    inventory_warnings: List[dict]
    conversion_rate: float
    abandoned_cart_rate: float
