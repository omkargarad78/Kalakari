import sys
import os
import json
from pathlib import Path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from decimal import Decimal
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal, Base
from app.core.security import get_password_hash
from app.models.all_models import User, Category, Product, ProductImage, ProductVariant, Coupon

def seed_db():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Seed Users (if empty)
        admin = db.query(User).filter_by(email="admin@crochet.com").first()
        if not admin:
            admin = User(
                email="admin@crochet.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Mother Artisan",
                role="Admin",
                is_active=True,
                is_verified=True
            )
            db.add(admin)
            print("Seeded admin user (admin@crochet.com / admin123)")
            
        customer = db.query(User).filter_by(email="customer@crochet.com").first()
        if not customer:
            customer = User(
                email="customer@crochet.com",
                hashed_password=get_password_hash("customer123"),
                full_name="Jane Customer",
                role="Customer",
                is_active=True,
                is_verified=True
            )
            db.add(customer)
            print("Seeded customer user (customer@crochet.com / customer123)")
            
        # 2. Seed Categories (upsert by slug)
        categories_data = [
            {"name": "Hair Accessories", "slug": "hair-accessories", "description": "Clips, scrunchies, and small crochet hair essentials.", "image_url": "/catalogue-source.png"},
            {"name": "Hair Bun & Style Accessories", "slug": "hair-bun-style-accessories", "description": "Bun covers, gajra and hair styling pieces.", "image_url": "/catalogue-source.png"},
            {"name": "Flower Appliqués & Brooches", "slug": "flower-appliques-brooches", "description": "Appliqués, brooches, and floral add-ons.", "image_url": "/catalogue-source.png"},
            {"name": "Home Decor", "slug": "home-decor", "description": "Mats, coasters, decor rounds, and home pieces.", "image_url": "/catalogue-source.png"},
            {"name": "Garlands & Hangings", "slug": "garlands-hangings", "description": "Torans, garlands, and decorative hangings.", "image_url": "/catalogue-source.png"},
            {"name": "Coasters & Trinkets", "slug": "coasters-trinkets", "description": "Mini flower coasters and small trinket sets.", "image_url": "/catalogue-source.png"},
        ]

        categories = []
        for item in categories_data:
            existing = db.query(Category).filter_by(slug=item["slug"]).first()
            if existing:
                existing.name = item["name"]
                existing.description = item["description"]
                existing.image_url = item["image_url"]
                categories.append(existing)
            else:
                cat = Category(
                    name=item["name"],
                    slug=item["slug"],
                    description=item["description"],
                    image_url=item["image_url"],
                )
                db.add(cat)
                categories.append(cat)
        db.commit()
        print("Seeded/updated Kalakari categories.")
            
        # 3. Seed Products from the Kalakari catalogue (upsert by slug)
        catalogue_json = (
            Path(__file__).resolve().parents[3]
            / "frontend"
            / "scripts"
            / "catalogue-crops.json"
        )
        catalogue_cfg = json.loads(catalogue_json.read_text(encoding="utf-8"))
        catalogue_products = [
            (
                p["category_slug"],
                p["name"],
                p["slug"],
                p["price_inr"],
                p.get("description", "Handmade crochet creation by Kalakari."),
            )
            for p in catalogue_cfg["products"]
        ]

        allowed_category_slugs = {
            "hair-accessories",
            "hair-bun-style-accessories",
            "flower-appliques-brooches",
            "home-decor",
            "garlands-hangings",
            "coasters-trinkets",
        }
        allowed_product_slugs = {slug for _, _, slug, _, _ in catalogue_products}

        # Enforce curated catalogue only (remove old generic categories/products).
        for prod in db.query(Product).all():
            if prod.slug not in allowed_product_slugs:
                db.delete(prod)
        db.commit()

        for cat in db.query(Category).all():
            if cat.slug not in allowed_category_slugs:
                db.delete(cat)
        db.commit()

        # Map categories
        cats_by_slug = {c.slug: c for c in categories}

        for cat_slug, name, slug, price, description in catalogue_products:
            category = cats_by_slug.get(cat_slug)
            existing = db.query(Product).filter_by(slug=slug).first()
            if existing:
                existing.name = name
                existing.price = Decimal(str(price))
                existing.category_id = category.id if category else None
                existing.is_visible = True
                existing.description = description
                existing.stock = max(existing.stock or 0, 20)
                p = existing
            else:
                p = Product(
                    name=name,
                    slug=slug,
                    description=description,
                    price=Decimal(str(price)),
                    stock=20,
                    category_id=category.id if category else None,
                    is_featured=False,
                    is_visible=True,
                )
                db.add(p)
                db.flush()

            img_url = f"/products/{slug}.png"
            for old_img in db.query(ProductImage).filter_by(product_id=p.id).all():
                if old_img.url != img_url:
                    db.delete(old_img)
            existing_img = db.query(ProductImage).filter_by(product_id=p.id, url=img_url).first()
            if not existing_img:
                db.add(ProductImage(product_id=p.id, url=img_url, position=0))

        db.commit()
        print("Seeded/updated catalogue products.")
            
        # 4. Seed Coupons (if empty)
        if db.query(Coupon).count() == 0:
            coupon_welcome = Coupon(
                code="WELCOME10",
                discount_type="Percentage",
                value=Decimal("10.00"),
                min_purchase_amount=Decimal("1000.00"),
                is_active=True
            )
            coupon_freeship = Coupon(
                code="FREESHIP",
                discount_type="Free_Shipping",
                value=Decimal("0.00"),
                min_purchase_amount=Decimal("1500.00"),
                is_active=True
            )
            db.add(coupon_welcome)
            db.add(coupon_freeship)
            db.commit()
            print("Seeded 2 promo coupons.")
            
        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
