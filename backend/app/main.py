import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base

# Initialize Database on Startup (convenient for development and simple deploys)
try:
    print("Auto-initializing database schemas...")
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database auto-schema error: {e}. Alembic may need running.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from app.db.seed import seed_db

        seed_db()
    except Exception as e:
        print(f"Catalogue seed warning: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Uploaded files locally if Cloudinary is offline or missing
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)
app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")

# Product thumbnails (dev / API-only runs; production also copies these into the static export)
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
PRODUCTS_DIR = REPO_ROOT / "frontend" / "public" / "products"
if PRODUCTS_DIR.is_dir():
    app.mount("/products", StaticFiles(directory=str(PRODUCTS_DIR)), name="product_thumbnails")

# Health check endpoint
@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "service": "kalakari-backend"}

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve Next.js static export (production only)
# `next build` with output:"export" produces a static `out/` directory.
# Mounts must be registered before the catch-all route handler.
FRONTEND_DIR = Path(settings.FRONTEND_BUILD_DIR)
if FRONTEND_DIR.exists():
    # Mount _next assets (JS/CSS chunks) at their expected path
    next_static = FRONTEND_DIR / "_next"
    if next_static.exists():
        app.mount("/_next", StaticFiles(directory=str(next_static)), name="nextjs_assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        """Serve Next.js static export for all non-API routes."""
        if full_path.startswith("api/"):
            from fastapi import HTTPException

            raise HTTPException(status_code=404, detail="Not found")
        # With trailingSlash:true, Next.js exports each route as <route>/index.html
        candidate_html = FRONTEND_DIR / full_path / "index.html"
        if candidate_html.is_file():
            return FileResponse(str(candidate_html))

        # Try as a direct file (images, JS, CSS, favicon, etc.)
        direct_file = FRONTEND_DIR / full_path
        if direct_file.is_file():
            return FileResponse(str(direct_file))

        # Root index fallback
        root_index = FRONTEND_DIR / "index.html"
        if root_index.is_file():
            return FileResponse(str(root_index))

        # 404 page
        not_found = FRONTEND_DIR / "404" / "index.html"
        if not_found.is_file():
            return FileResponse(str(not_found), status_code=404)
        return FileResponse(str(root_index), status_code=404)
