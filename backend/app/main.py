import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base

# Initialize Database on Startup (convenient for development and simple deploys)
try:
    print("Auto-initializing database schemas...")
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database auto-schema error: {e}. Alembic may need running.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
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

# Health check endpoint
@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "service": "crochet-backend"}

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)
