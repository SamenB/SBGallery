from unittest.mock import AsyncMock

import pytest

from src.exeptions import InvalidDataException, ObjectNotFoundException
from src.services.artworks import ArtworkService


class MockArtworkDBManager:
    def __init__(self):
        self.artworks = AsyncMock()
        self.commit = AsyncMock()
        self.rollback = AsyncMock()


@pytest.mark.asyncio
async def test_update_shop_order_persists_positions():
    db = MockArtworkDBManager()
    db.artworks.get_existing_ids.return_value = {3, 1, 2}

    result = await ArtworkService(db).update_shop_order([3, 1, 2])

    db.artworks.update_shop_display_order.assert_awaited_once_with([3, 1, 2])
    db.commit.assert_awaited_once()
    assert result == {"status": "OK", "count": 3}


@pytest.mark.asyncio
async def test_update_shop_order_rejects_duplicates():
    db = MockArtworkDBManager()

    with pytest.raises(InvalidDataException):
        await ArtworkService(db).update_shop_order([1, 1])

    db.artworks.update_shop_display_order.assert_not_awaited()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_update_shop_order_rejects_missing_artworks():
    db = MockArtworkDBManager()
    db.artworks.get_existing_ids.return_value = {1}

    with pytest.raises(ObjectNotFoundException):
        await ArtworkService(db).update_shop_order([1, 2])

    db.artworks.update_shop_display_order.assert_not_awaited()
    db.commit.assert_not_awaited()
