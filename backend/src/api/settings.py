"""
API endpoints for managing global site settings.
Provides functionality to retrieve and update configurations like contact info and homepage media.
"""

from fastapi import APIRouter

from src.api.dependencies import AdminDep, DBDep
from src.schemas.settings import SiteSettingsResponse, SiteSettingsUpdate
from src.services.site_settings import SiteSettingsService

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=SiteSettingsResponse)
async def get_settings(db: DBDep):
    """
    Retrieves the global site settings.
    Initializes default settings if none exist.
    """
    return await SiteSettingsService(db).get_settings()


@router.put("", response_model=SiteSettingsResponse)
async def update_settings(data: SiteSettingsUpdate, admin_id: AdminDep, db: DBDep):
    """
    Updates the global site settings. Requires admin privileges.
    """
    return await SiteSettingsService(db).update_settings(data)
