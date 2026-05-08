from __future__ import annotations


class UserProfileService:
    def __init__(self, db):
        self.db = db

    async def get_liked_artworks(self, user_id: int):
        return await self.db.user_likes.get_liked_artworks(user_id)

    async def add_like(self, *, user_id: int, artwork_id: int) -> dict:
        await self.db.artworks.get_one(id=artwork_id)
        if not await self.db.user_likes.exists(user_id=user_id, artwork_id=artwork_id):
            await self.db.user_likes.add(user_id=user_id, artwork_id=artwork_id)
            await self.db.commit()
        return {"status": "OK"}

    async def remove_like(self, *, user_id: int, artwork_id: int) -> dict:
        await self.db.user_likes.delete(user_id=user_id, artwork_id=artwork_id)
        await self.db.commit()
        return {"status": "OK"}
