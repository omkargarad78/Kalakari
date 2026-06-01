from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc, and_
from decimal import Decimal
from datetime import datetime, timedelta
from app.models.all_models import (
    User, Address, Category, Product, ProductImage, ProductVariant,
    Order, OrderItem, Payment, Review, Wishlist, Coupon, CustomOrder,
    Notification, ContactMessage, NewsletterSubscriber, AdminLog, AuditLog
)
from app.core.security import get_password_hash

# ----------------- USER CRUD -----------------
def get_user_by_email(db: Session, email: str):
    return db.execute(select(User).where(User.email == email)).scalars().first()

def get_user_by_id(db: Session, user_id: str):
    return db.execute(select(User).where(User.id == user_id)).scalars().first()

def create_user(db: Session, user_in) -> User:
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="Customer",
        is_active=True,
        is_verified=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user: User, data) -> User:
    if data.full_name:
        user.full_name = data.full_name
    if data.email:
        user.email = data.email
    if data.password:
        user.hashed_password = get_password_hash(data.password)
    db.commit()
    db.refresh(user)
    return user

# ----------------- CATEGORY CRUD -----------------
def get_categories(db: Session):
    return db.execute(select(Category).order_by(Category.name)).scalars().all()

def get_category_by_slug(db: Session, slug: str):
    return db.execute(select(Category).where(Category.slug == slug)).scalars().first()

def create_category(db: Session, name: str, slug: str, description: str = None, image_url: str = None) -> Category:
    db_cat = Category(name=name, slug=slug, description=description, image_url=image_url)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

# ----------------- PRODUCT CRUD -----------------
def get_products(
    db: Session,
    search: str = None,
    category_slug: str = None,
    sort_by: str = None,
    is_featured: bool = None,
    is_visible: bool = True,
    skip: int = 0,
    limit: int = 50
):
    query = select(Product)
    
    if is_visible is not None:
        query = query.where(Product.is_visible == is_visible)
    if is_featured is not None:
        query = query.where(Product.is_featured == is_featured)
    if category_slug:
        cat_query = select(Category.id).where(Category.slug == category_slug)
        cat_id = db.execute(cat_query).scalar_one_or_none()
        if cat_id:
            query = query.where(Product.category_id == cat_id)
            
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Product.name.ilike(search_filter)) | 
            (Product.description.ilike(search_filter)) |
            (Product.materials.ilike(search_filter))
        )
        
    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(desc(Product.created_at))
    else:
        query = query.order_by(desc(Product.is_featured), desc(Product.created_at))
        
    query = query.offset(skip).limit(limit)
    return db.execute(query).scalars().all()

def get_product_by_slug(db: Session, slug: str):
    return db.execute(select(Product).where(Product.slug == slug)).scalars().first()

def get_product_by_id(db: Session, product_id: str):
    return db.execute(select(Product).where(Product.id == product_id)).scalars().first()

def create_product(db: Session, product_in) -> Product:
    db_prod = Product(
        name=product_in.name,
        slug=product_in.slug,
        description=product_in.description,
        price=product_in.price,
        stock=product_in.stock,
        category_id=product_in.category_id,
        is_featured=product_in.is_featured,
        is_visible=product_in.is_visible,
        materials=product_in.materials,
        handmade_details=product_in.handmade_details,
        shipping_info=product_in.shipping_info
    )
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

def update_product(db: Session, product: Product, data) -> Product:
    for field, value in data.dict(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product

def delete_product(db: Session, product_id: str) -> bool:
    prod = get_product_by_id(db, product_id)
    if prod:
        db.delete(prod)
        db.commit()
        return True
    return False

# ----------------- ADDRESS CRUD -----------------
def get_user_addresses(db: Session, user_id: str):
    return db.execute(select(Address).where(Address.user_id == user_id)).scalars().all()

def get_address_by_id(db: Session, address_id: str, user_id: str):
    return db.execute(select(Address).where(and_(Address.id == address_id, Address.user_id == user_id))).scalars().first()

def create_address(db: Session, user_id: str, addr_in) -> Address:
    if addr_in.is_default:
        # Unmark other defaults
        db.query(Address).filter(Address.user_id == user_id).update({Address.is_default: False})
        
    db_addr = Address(
        user_id=user_id,
        full_name=addr_in.full_name,
        address_line1=addr_in.address_line1,
        address_line2=addr_in.address_line2,
        city=addr_in.city,
        state=addr_in.state,
        postal_code=addr_in.postal_code,
        country=addr_in.country,
        phone=addr_in.phone,
        address_type=addr_in.address_type,
        is_default=addr_in.is_default
    )
    db.add(db_addr)
    db.commit()
    db.refresh(db_addr)
    return db_addr

# ----------------- COUPON CRUD -----------------
def get_coupon_by_code(db: Session, code: str):
    return db.execute(select(Coupon).where(Coupon.code == code)).scalars().first()

# ----------------- ORDER CRUD -----------------
def get_order_by_id(db: Session, order_id: str):
    return db.execute(select(Order).where(Order.id == order_id)).scalars().first()

def get_user_orders(db: Session, user_id: str):
    return db.execute(select(Order).where(Order.user_id == user_id).order_by(desc(Order.created_at))).scalars().all()

def get_all_orders_admin(db: Session, status: str = None, search: str = None):
    query = select(Order)
    if status:
        query = query.where(Order.status == status)
    if search:
        # search by id or email
        query = query.join(User).where((Order.id.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))
    return db.execute(query.order_by(desc(Order.created_at))).scalars().all()

def create_order_with_upi(db: Session, user_id: str, order_in, shipping_fee: Decimal) -> Order:
    # 1. Verify coupon (if any)
    coupon = None
    discount = Decimal("0.00")
    if order_in.coupon_code:
        coupon = get_coupon_by_code(db, order_in.coupon_code)
        
    # 2. Calculate subtotal
    subtotal = Decimal("0.00")
    order_items = []
    
    for item in order_in.items:
        product = get_product_by_id(db, item.product_id)
        if not product or product.stock < item.quantity:
            raise ValueError(f"Insufficient stock for product {product.name if product else item.product_id}")
            
        # Variant check
        price = product.price
        if item.product_variant_id:
            variant = db.execute(select(ProductVariant).where(ProductVariant.id == item.product_variant_id)).scalars().first()
            if variant:
                if variant.stock < item.quantity:
                    raise ValueError(f"Insufficient stock for variant {variant.name}")
                if variant.price_override is not None:
                    price = variant.price_override
                    
        item_total = price * item.quantity
        subtotal += item_total
        
        # Track items to insert
        order_items.append({
            "product_id": item.product_id,
            "product_variant_id": item.product_variant_id,
            "quantity": item.quantity,
            "price": price,
            "product_ref": product,
            "variant_ref": variant if item.product_variant_id else None
        })
        
    # Apply discount
    if coupon and coupon.is_active:
        if subtotal >= coupon.min_purchase_amount:
            if coupon.discount_type == "Percentage":
                discount = subtotal * (coupon.value / Decimal("100.00"))
            elif coupon.discount_type == "Fixed":
                discount = coupon.value
            elif coupon.discount_type == "Free_Shipping":
                shipping_fee = Decimal("0.00")
            coupon.uses_count += 1
            
    final_total = subtotal - discount + shipping_fee
    
    # 3. Create Order
    db_order = Order(
        user_id=user_id,
        status="Pending",  # Pending verification
        total_amount=final_total,
        shipping_address_id=order_in.shipping_address_id,
        billing_address_id=order_in.billing_address_id,
        coupon_id=coupon.id if coupon else None,
        discount_amount=discount,
        gift_note=order_in.gift_note,
        shipping_fee=shipping_fee,
        payment_method="UPI"
    )
    db.add(db_order)
    db.flush() # Populate order ID
    
    # 4. Create Order Items & Reduce Stock
    for item in order_items:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item["product_id"],
            product_variant_id=item["product_variant_id"],
            quantity=item["quantity"],
            price=item["price"]
        )
        db.add(db_item)
        
        # Deduct inventory
        item["product_ref"].stock -= item["quantity"]
        if item["variant_ref"]:
            item["variant_ref"].stock -= item["quantity"]
            
    # 5. Create Payment record
    db_payment = Payment(
        order_id=db_order.id,
        transaction_id=order_in.transaction_id,
        payment_method="UPI",
        status="Pending",  # Pending verification
        amount=final_total,
        screenshot_url=order_in.screenshot_url
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_order)
    return db_order

# ----------------- CUSTOM ORDERS CRUD -----------------
def create_custom_order(db: Session, user_id: str, custom_in) -> CustomOrder:
    db_custom = CustomOrder(
        user_id=user_id,
        description=custom_in.description,
        preferred_colors=custom_in.preferred_colors,
        budget=custom_in.budget,
        required_delivery_date=custom_in.required_delivery_date,
        additional_notes=custom_in.additional_notes,
        reference_image_url=custom_in.reference_image_url,
        status="Pending"
    )
    db.add(db_custom)
    db.commit()
    db.refresh(db_custom)
    return db_custom

def get_user_custom_orders(db: Session, user_id: str):
    return db.execute(select(CustomOrder).where(CustomOrder.user_id == user_id).order_by(desc(CustomOrder.created_at))).scalars().all()

def get_all_custom_orders_admin(db: Session):
    return db.execute(select(CustomOrder).order_by(desc(CustomOrder.created_at))).scalars().all()

# ----------------- WISHLIST CRUD -----------------
def get_user_wishlist(db: Session, user_id: str):
    return db.execute(select(Wishlist).where(Wishlist.user_id == user_id)).scalars().all()

def add_to_wishlist(db: Session, user_id: str, product_id: str):
    existing = db.execute(select(Wishlist).where(and_(Wishlist.user_id == user_id, Wishlist.product_id == product_id))).scalars().first()
    if existing:
        return existing
    db_w = Wishlist(user_id=user_id, product_id=product_id)
    db.add(db_w)
    db.commit()
    db.refresh(db_w)
    return db_w

def remove_from_wishlist(db: Session, user_id: str, product_id: str) -> bool:
    item = db.execute(select(Wishlist).where(and_(Wishlist.user_id == user_id, Wishlist.product_id == product_id))).scalars().first()
    if item:
        db.delete(item)
        db.commit()
        return True
    return False

# ----------------- REVIEW CRUD -----------------
def create_review(db: Session, user_id: str, review_in) -> Review:
    db_review = Review(
        user_id=user_id,
        product_id=review_in.product_id,
        rating=review_in.rating,
        comment=review_in.comment,
        is_approved=False,
        is_featured=False
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_approved_product_reviews(db: Session, product_id: str):
    return db.execute(select(Review).where(and_(Review.product_id == product_id, Review.is_approved == True))).scalars().all()

# ----------------- CONTACT AND NEWSLETTER -----------------
def create_contact_message(db: Session, msg_in) -> ContactMessage:
    db_msg = ContactMessage(
        name=msg_in.name,
        email=msg_in.email,
        phone=msg_in.phone,
        subject=msg_in.subject,
        message=msg_in.message
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def subscribe_newsletter(db: Session, email: str) -> NewsletterSubscriber:
    existing = db.execute(select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)).scalars().first()
    if existing:
        existing.is_active = True
        db.commit()
        return existing
    db_sub = NewsletterSubscriber(email=email, is_active=True)
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

# ----------------- ANALYTICS STATS CRUD -----------------
def get_admin_dashboard_stats(db: Session) -> dict:
    # 1. Total revenue (completed/delivered/processing payments/confirmed/shipped/packed orders)
    valid_statuses = ["Confirmed", "Processing", "Packed", "Shipped", "Delivered"]
    total_rev_q = select(func.sum(Order.total_amount)).where(Order.status.in_(valid_statuses))
    total_rev = db.execute(total_rev_q).scalar() or Decimal("0.00")
    
    # 2. Counts
    total_orders = db.execute(select(func.count(Order.id))).scalar() or 0
    total_products = db.execute(select(func.count(Product.id))).scalar() or 0
    total_customers = db.execute(select(func.count(User.id)).where(User.role == "Customer")).scalar() or 0
    
    # 3. Monthly Sales (last 6 months)
    monthly_sales = []
    for i in range(5, -1, -1):
        target_date = datetime.utcnow() - timedelta(days=30 * i)
        start_date = datetime(target_date.year, target_date.month, 1)
        if target_date.month == 12:
            end_date = datetime(target_date.year + 1, 1, 1)
        else:
            end_date = datetime(target_date.year, target_date.month + 1, 1)
            
        sales_sum = db.execute(
            select(func.sum(Order.total_amount))
            .where(and_(Order.created_at >= start_date, Order.created_at < end_date, Order.status.in_(valid_statuses)))
        ).scalar() or Decimal("0.00")
        
        monthly_sales.append({
            "month": start_date.strftime("%B"),
            "revenue": float(sales_sum)
        })
        
    # 4. Inventory Warnings (stock < 3)
    warnings = []
    low_products = db.execute(select(Product).where(Product.stock <= 3)).scalars().all()
    for p in low_products:
        warnings.append({
            "id": p.id,
            "name": p.name,
            "stock": p.stock,
            "type": "Product"
        })
        
    # 5. Conversion Rate
    completed_orders = db.execute(select(func.count(Order.id)).where(Order.status.in_(valid_statuses))).scalar() or 0
    all_checkouts = db.execute(select(func.count(Order.id))).scalar() or 0
    conversion_rate = (completed_orders / all_checkouts * 100.0) if all_checkouts > 0 else 0.0
    
    # 6. Abandoned Cart Rate
    # Calculated as unpaid/pending orders that did not get confirmed (e.g., status is "Pending" for over 24 hours, or Cancelled)
    cancelled_orders = db.execute(select(func.count(Order.id)).where(Order.status == "Cancelled")).scalar() or 0
    pending_orders = db.execute(select(func.count(Order.id)).where(Order.status == "Pending")).scalar() or 0
    abandoned_rate = ((cancelled_orders + pending_orders) / all_checkouts * 100.0) if all_checkouts > 0 else 0.0
    
    # 7. Recent Activity (Latest 5 orders and custom requests)
    recent_activity = []
    latest_orders = db.execute(select(Order).order_by(desc(Order.created_at)).limit(5)).scalars().all()
    for o in latest_orders:
        recent_activity.append({
            "type": "order",
            "message": f"Order #{o.id[:8]} placed for INR {o.total_amount}",
            "time": o.created_at.strftime("%Y-%m-%d %H:%M")
        })
    latest_customs = db.execute(select(CustomOrder).order_by(desc(CustomOrder.created_at)).limit(5)).scalars().all()
    for c in latest_customs:
        recent_activity.append({
            "type": "custom_order",
            "message": f"Custom request from User #{c.user_id[:8]} for budget INR {c.budget or 0}",
            "time": c.created_at.strftime("%Y-%m-%d %H:%M")
        })
        
    return {
        "total_revenue": total_rev,
        "total_orders": total_orders,
        "total_products": total_products,
        "total_customers": total_customers,
        "monthly_sales": monthly_sales,
        "recent_activity": recent_activity[:5],
        "inventory_warnings": warnings,
        "conversion_rate": round(conversion_rate, 2),
        "abandoned_cart_rate": round(abandoned_rate, 2)
    }
