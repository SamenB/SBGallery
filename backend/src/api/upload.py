"""
API endpoints for general image uploads.
"""

from fastapi import APIRouter, File, UploadFile

from src.api.dependencies import AdminDep
from src.services.uploads import ImageUploadService

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/image")
async def upload_image(admin_id: AdminDep, file: UploadFile = File(...)):
    """
    Uploads and processes an image file. Requires admin privileges.
    """
    return await ImageUploadService().upload_image(file)
