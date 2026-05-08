from __future__ import annotations

from src.models.site_settings import SiteSettingsOrm
from src.repositories.mappers.mappers import SiteSettingsMapper
from src.schemas.settings import SiteSettingsResponse, SiteSettingsUpdate


class SiteSettingsRepository:
    def __init__(self, session):
        self.session = session

    async def get_or_create_orm(self) -> SiteSettingsOrm:
        settings_obj = await self.session.get(SiteSettingsOrm, 1)
        if settings_obj is None:
            settings_obj = SiteSettingsOrm(id=1)
            self.session.add(settings_obj)
            await self.session.flush()
        return settings_obj

    async def get_or_create(self) -> SiteSettingsResponse:
        settings_obj = await self.get_or_create_orm()
        return SiteSettingsMapper.map_to_schema(settings_obj)

    async def update(self, data: SiteSettingsUpdate) -> SiteSettingsResponse:
        settings_obj = await self.get_or_create_orm()
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(settings_obj, key, value)
        await self.session.flush()
        await self.session.refresh(settings_obj)
        return SiteSettingsMapper.map_to_schema(settings_obj)
