"""
API endpoints for user-specific data and interactions.
Currently handles artwork "likes" (favorites) for the authenticated user.
"""

from fastapi import APIRouter

from src.api.dependencies import DBDep, UserDep
from src.services.users import UserProfileService

router = APIRouter(prefix="/users/me", tags=["Users"])


@router.get("/likes")
async def get_my_likes(user_id: UserDep, db: DBDep):
    """
    Retrieves all artworks liked by the currently authenticated user.
    """
    return await UserProfileService(db).get_liked_artworks(user_id)


@router.post("/likes/{artwork_id}")
async def add_like(artwork_id: int, user_id: UserDep, db: DBDep):
    """
    Adds an artwork to the user's liked list.
    Verifies artwork existence and prevents duplicate likes.
    """
    return await UserProfileService(db).add_like(user_id=user_id, artwork_id=artwork_id)


@router.delete("/likes/{artwork_id}")
async def remove_like(artwork_id: int, user_id: UserDep, db: DBDep):
    """
    Removes an artwork from the user's liked list.
    """
    return await UserProfileService(db).remove_like(user_id=user_id, artwork_id=artwork_id)
