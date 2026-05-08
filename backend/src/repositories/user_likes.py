from __future__ import annotations

from sqlalchemy import delete, insert, select

from src.models.artworks import ArtworksOrm
from src.models.user_likes import UserLikesOrm
from src.repositories.mappers.mappers import ArtworkMapper
from src.schemas.artworks import Artwork


class UserLikesRepository:
    def __init__(self, session):
        self.session = session

    async def get_liked_artworks(self, user_id: int) -> list[Artwork]:
        result = await self.session.execute(
            select(ArtworksOrm).join(UserLikesOrm).where(UserLikesOrm.user_id == user_id)
        )
        return [ArtworkMapper.map_to_schema(model) for model in result.scalars()]

    async def exists(self, *, user_id: int, artwork_id: int) -> bool:
        result = await self.session.execute(
            select(UserLikesOrm).where(
                UserLikesOrm.user_id == user_id,
                UserLikesOrm.artwork_id == artwork_id,
            )
        )
        return result.scalar_one_or_none() is not None

    async def add(self, *, user_id: int, artwork_id: int) -> None:
        await self.session.execute(
            insert(UserLikesOrm).values(user_id=user_id, artwork_id=artwork_id)
        )

    async def delete(self, *, user_id: int, artwork_id: int) -> None:
        await self.session.execute(
            delete(UserLikesOrm).where(
                UserLikesOrm.user_id == user_id,
                UserLikesOrm.artwork_id == artwork_id,
            )
        )
