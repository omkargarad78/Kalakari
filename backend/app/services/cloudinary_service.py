import os
import shutil
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from app.core.config import settings

# Initialize Cloudinary if credentials are provided
cloudinary_configured = False
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    cloudinary_configured = True

def upload_image(file: UploadFile, folder: str = "crochet") -> str:
    """
    Uploads file to Cloudinary or falls back to local storage if credentials are not configured.
    Returns the public URL of the uploaded image.
    """
    if cloudinary_configured:
        try:
            # Upload to Cloudinary
            response = cloudinary.uploader.upload(
                file.file,
                folder=folder,
                resource_type="image"
            )
            return response.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload error: {e}. Falling back to local storage.")
    
    # Local Storage Fallback
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file locally
    file.file.seek(0)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return local API URL path
    # E.g. /static/uploads/<filename>
    return f"/static/{unique_filename}"
