# Import all the models, so that Base has them before being
# imported by Alembic or database initialization scripts.
from app.db.session import Base
from app.models.all_models import (
    User,
    Address,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Order,
    OrderItem,
    Payment,
    Review,
    Wishlist,
    Coupon,
    CustomOrder,
    Notification,
    ContactMessage,
    NewsletterSubscriber,
    AdminLog,
    AuditLog
)
