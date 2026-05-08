from __future__ import annotations

from src.schemas.settings import SiteSettingsResponse, SiteSettingsUpdate


class SiteSettingsService:
    def __init__(self, db):
        self.db = db

    async def get_settings(self) -> SiteSettingsResponse:
        settings = await self.db.site_settings.get_or_create()
        await self.db.commit()
        return settings

    async def update_settings(self, data: SiteSettingsUpdate) -> SiteSettingsResponse:
        settings = await self.db.site_settings.update(data)
        await self.db.commit()
        return settings
