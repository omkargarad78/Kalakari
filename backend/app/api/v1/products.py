from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from decimal import Decimal
from app.db.session import get_db
from app.schemas.all_schemas import (
    ProductResponse, ProductCreate, ProductUpdate,
    CategoryResponse, CategoryCreate, CategoryUpdate, ProductVariantResponse, ProductVariantCreate, ProductImageResponse
)
from app.crud.crud_operations import (
    get_products, get_product_by_slug, get_product_by_id, create_product, update_product, delete_product,
    get_categories, get_category_by_slug, create_category, get_category_by_id, update_category, delete_category
)
from app.api.v1.deps import get_current_admin
from app.models.all_models import ProductImage, ProductVariant, Category
from app.services.cloudinary_service import upload_image

router = APIRouter()

# ----------------- CATEGORIES -----------------
@router.get("/categories", response_model=List[CategoryResponse])
def read_categories(db: Session = Depends(get_db)):
    return get_categories(db)

@router.post("/categories", response_model=CategoryResponse)
def add_category(cat_in: CategoryCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    existing = get_category_by_slug(db, cat_in.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists.")
    return create_category(db, cat_in.name, cat_in.slug, cat_in.description, cat_in.image_url)

@router.put("/categories/{category_id}", response_model=CategoryResponse)
def edit_category(category_id: str, cat_in: CategoryUpdate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    cat = get_category_by_id(db, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    # If slug is being changed, enforce uniqueness
    if cat_in.slug and cat_in.slug != cat.slug:
        existing = get_category_by_slug(db, cat_in.slug)
        if existing:
            raise HTTPException(status_code=400, detail="Category slug already exists.")
    return update_category(db, cat, cat_in)

@router.delete("/categories/{category_id}")
def remove_category(category_id: str, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    success = delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"status": "success", "message": "Category deleted successfully"}

# ----------------- PRODUCTS -----------------
@router.get("", response_model=List[ProductResponse])
@router.get("/", response_model=List[ProductResponse])
def read_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: Optional[str] = None,
    is_featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    prods = get_products(db, search=search, category_slug=category, sort_by=sort_by, is_featured=is_featured)
    # Populate category names manually or via relationships
    res = []
    for p in prods:
        p_res = ProductResponse.model_validate(p)
        if p.category:
            p_res.category_name = p.category.name
        res.append(p_res)
    return res

@router.get("/{slug}", response_model=ProductResponse)
def read_product(slug: str, db: Session = Depends(get_db)):
    prod = get_product_by_slug(db, slug)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    p_res = ProductResponse.model_validate(prod)
    if prod.category:
        p_res.category_name = prod.category.name
    return p_res

@router.post("/", response_model=ProductResponse)
def add_product(product_in: ProductCreate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    existing = get_product_by_slug(db, product_in.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Product slug already exists.")
    prod = create_product(db, product_in)
    return prod

@router.put("/{product_id}", response_model=ProductResponse)
def edit_product(product_id: str, product_in: ProductUpdate, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    prod = get_product_by_id(db, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return update_product(db, prod, product_in)

@router.delete("/{product_id}")
def remove_product(product_id: str, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    success = delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "success", "message": "Product deleted successfully"}

# ----------------- VARIANTS & IMAGES -----------------
@router.post("/{product_id}/images", response_model=ProductImageResponse)
def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    position: int = Form(0),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    prod = get_product_by_id(db, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
        
    url = upload_image(file, folder="products")
    img = ProductImage(product_id=product_id, url=url, position=position)
    db.add(img)
    db.commit()
    db.refresh(img)
    return img

@router.post("/{product_id}/variants", response_model=ProductVariantResponse)
def add_product_variant(
    product_id: str,
    var_in: ProductVariantCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    prod = get_product_by_id(db, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
        
    variant = ProductVariant(
        product_id=product_id,
        name=var_in.name,
        price_override=var_in.price_override,
        stock=var_in.stock
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant
