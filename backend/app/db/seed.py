import sys
import os
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
            
        # 2. Seed Categories (if empty)
        if db.query(Category).count() == 0:
            categories_data = [
                {"name": "Luxury Bags", "slug": "luxury-bags", "description": "Exquisite handmade shoulder bags and totes.", "image_url": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600"},
                {"name": "Apparel & Cardigans", "slug": "apparel-cardigans", "description": "Comfortable, premium knitted apparel.", "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600"},
                {"name": "Floral Bouquets", "slug": "floral-bouquets", "description": "Everlasting crochet flowers for home decor.", "image_url": "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600"},
                {"name": "Cute Amigurumi", "slug": "cute-amigurumi", "description": "Handcrafted plushies and stuffed animals.", "image_url": "https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=600"}
            ]
            categories = []
            for item in categories_data:
                cat = Category(
                    name=item["name"],
                    slug=item["slug"],
                    description=item["description"],
                    image_url=item["image_url"]
                )
                db.add(cat)
                categories.append(cat)
            db.commit()
            print("Seeded 4 categories.")
        else:
            categories = db.query(Category).all()
            
        # 3. Seed Products & Images & Variants (if empty)
        if db.query(Product).count() == 0:
            cat_bags = next(c for c in categories if c.slug == "luxury-bags")
            cat_apparel = next(c for c in categories if c.slug == "apparel-cardigans")
            cat_floral = next(c for c in categories if c.slug == "floral-bouquets")
            cat_amigurumi = next(c for c in categories if c.slug == "cute-amigurumi")
            
            products_data = [
                {
                    "name": "Sage Green Crochet Tote Bag",
                    "slug": "sage-green-crochet-tote",
                    "description": "A luxury everyday tote bag knitted with double-strand sage cotton. Features double reinforced shoulder straps, a heavy texture detail, and structured bottom. Perfect companion for weekend trips and artisan coffee shop visits.",
                    "price": Decimal("2499.00"),
                    "stock": 8,
                    "category_id": cat_bags.id,
                    "is_featured": True,
                    "materials": "100% Organic Sage Cotton Yarn",
                    "handmade_details": "Meticulously double-stitched over 14 hours by our family makers. Seamless base and flexible yet non-stretch shoulder strap support.",
                    "shipping_info": "Ships in 2-3 business days. Packed in a sustainable linen dustbag.",
                    "images": ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800"],
                    "variants": ["Sage Green (Standard)", "Creamy White Extra Big"]
                },
                {
                    "name": "Oversized Sunset Mohair Cardigan",
                    "slug": "oversized-sunset-mohair-cardigan",
                    "description": "Wrap yourself in warmth and absolute elegance. This chunky hand-knit cardigan blends premium mohair fibers and delicate silk to create an ethereal halo-like finish. Colored in transitions resembling a warm summer sunset.",
                    "price": Decimal("5999.00"),
                    "stock": 3,
                    "category_id": cat_apparel.id,
                    "is_featured": True,
                    "materials": "70% Kid Mohair, 30% Mulberry Silk",
                    "handmade_details": "Handcrafted over 28 hours using custom large wooden needles to maintain a light, cloud-like airy puff design.",
                    "shipping_info": "Due to high demand, please allow 5-7 days for shipping configuration.",
                    "images": ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800"],
                    "variants": ["Pastel Sunset", "Golden Harvest"]
                },
                {
                    "name": "Everlasting Cream Rose Bouquet",
                    "slug": "everlasting-cream-rose-bouquet",
                    "description": "A set of five exquisitely detailed crochet roses in warm cream and blush tones. Includes flexible internal stem wiring to arrange in your favorite high-end ceramic vase. A perfect everlasting gift that never fades.",
                    "price": Decimal("1299.00"),
                    "stock": 15,
                    "category_id": cat_floral.id,
                    "is_featured": False,
                    "materials": "Soft Acrylic & Milk Cotton Blend, Galvanized Stem Wires",
                    "handmade_details": "Each rose takes 2 hours of delicate petal-by-petal loop work. Hand-wrapped stems with organic green leaves.",
                    "shipping_info": "Ships next business day in a premium gift box.",
                    "images": ["https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800"],
                    "variants": ["Blush Cream 5-pack", "Crimson Red 5-pack"]
                },
                {
                    "name": "Forest Mushroom Desk Amigurumi",
                    "slug": "forest-mushroom-desk-amigurumi",
                    "description": "An adorable woodland mushroom companion to brighten your desk space. Features a speckled red cap, cozy safety-lock eyes, and a sweet hand-stitched smile. Stuffed with hypoallergenic premium recycled fluff.",
                    "price": Decimal("899.00"),
                    "stock": 10,
                    "category_id": cat_amigurumi.id,
                    "is_featured": False,
                    "materials": "Milk Cotton Yarn, Safety Eyes, Recycled Poly-fil",
                    "handmade_details": "Tight single-crochet stitching guarantees durability and shape. Weighted bottom so it stands perfectly upright.",
                    "shipping_info": "Ships in 1-2 business days in a beautiful craft paper bag.",
                    "images": ["https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=800"],
                    "variants": ["Red Speckled Cap", "Brown Oak Cap"]
                }
            ]
            
            for item in products_data:
                p = Product(
                    name=item["name"],
                    slug=item["slug"],
                    description=item["description"],
                    price=item["price"],
                    stock=item["stock"],
                    category_id=item["category_id"],
                    is_featured=item["is_featured"],
                    materials=item["materials"],
                    handmade_details=item["handmade_details"],
                    shipping_info=item["shipping_info"]
                )
                db.add(p)
                db.flush() # Populate ID
                
                # Image
                for idx, img_url in enumerate(item["images"]):
                    p_img = ProductImage(
                        product_id=p.id,
                        url=img_url,
                        position=idx
                    )
                    db.add(p_img)
                    
                # Variants
                for v_name in item["variants"]:
                    p_var = ProductVariant(
                        product_id=p.id,
                        name=v_name,
                        stock=4
                    )
                    db.add(p_var)
                    
            db.commit()
            print("Seeded 4 products with images and variants.")
            
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
