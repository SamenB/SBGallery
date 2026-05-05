from unittest.mock import AsyncMock, MagicMock

import pytest

from src.exeptions import ObjectAlreadyExistsException
from src.schemas.artworks import ArtworkAddRequest, ArtworkPatchRequest
from src.services.artworks import ArtworkService


class MockDBManager:
    def __init__(self):
        self.artworks = AsyncMock()
        self.artworks.get_one_or_none.return_value = None
        self.artworks.get_next_shop_sort_order.return_value = 100
        self.artwork_print_assets = AsyncMock()
        self.artwork_print_assets.get_file_urls_for_artwork.return_value = []
        self.artwork_labels = AsyncMock()
        self.commit = AsyncMock()
        self.rollback = AsyncMock()


@pytest.fixture
def artwork_service():
    service = ArtworkService(MockDBManager())
    return service


@pytest.mark.asyncio
async def test_get_artwork_by_id(artwork_service):
    mock_artwork = MagicMock()
    mock_artwork.id = 1
    artwork_service.db.artworks.get_one.return_value = mock_artwork

    result = await artwork_service.get_artwork_by_id(1)

    assert result.id == 1
    artwork_service.db.artworks.get_one.assert_awaited_once_with(id=1)


@pytest.mark.asyncio
async def test_create_artwork(artwork_service):
    mock_artwork = MagicMock()
    mock_artwork.id = 5
    artwork_service.db.artworks.add.return_value = mock_artwork

    # Create Mock Data
    data = {
        "title": "A new painting",
        "description": "...",
        "orientation": "Vertical",
        "labels": [1, 2],
    }
    artwork_data = ArtworkAddRequest(**data)

    result = await artwork_service.create_artwork(artwork_data)

    assert result.id == 5
    artwork_service.db.artworks.add.assert_awaited_once()
    added_payload = artwork_service.db.artworks.add.await_args.args[0]
    assert added_payload.shop_sort_order == 100
    artwork_service.db.artwork_labels.add_bulk.assert_awaited_once()  # two labels
    artwork_service.db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_create_artwork_duplicate_fails(artwork_service):
    # Setup mock to raise ObjectAlreadyExistsException
    artwork_service.db.artworks.add.side_effect = ObjectAlreadyExistsException()

    data = {"title": "Duplicate", "description": "...", "orientation": "Horizontal", "labels": []}
    artwork_data = ArtworkAddRequest(**data)

    with pytest.raises(ObjectAlreadyExistsException):
        await artwork_service.create_artwork(artwork_data)

    # Commit shouldn't be called if it failed
    artwork_service.db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_delete_artwork(artwork_service):
    artwork_service.db.artworks.get_one.return_value = MagicMock()

    await artwork_service.delete_artwork(1)

    artwork_service.db.artworks.delete.assert_awaited_once_with(id=1)
    artwork_service.db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_patch_images_removes_files_no_longer_referenced(
    artwork_service, tmp_path, monkeypatch
):
    monkeypatch.chdir(tmp_path)
    stale_dir = tmp_path / "static" / "images"
    stale_dir.mkdir(parents=True)
    stale_file = stale_dir / "old_large.webp"
    kept_file = stale_dir / "kept_large.webp"
    stale_file.write_bytes(b"old")
    kept_file.write_bytes(b"kept")

    artwork_service._refresh_materialized_storefront = AsyncMock()
    artwork_service.db.artworks.get_one.return_value = MagicMock(
        images=[
            {
                "large": "/static/images/old_large.webp",
                "medium": "/static/images/old_medium.webp",
            },
            {"large": "/static/images/kept_large.webp"},
        ]
    )

    await artwork_service.update_artwork_partially(
        1,
        ArtworkPatchRequest(images=[{"large": "/static/images/kept_large.webp"}]),
    )

    assert not stale_file.exists()
    assert kept_file.exists()
    artwork_service.db.artworks.edit.assert_awaited_once()
    artwork_service.db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_shop_order_deduplicates_and_commits(artwork_service):
    artwork_service._refresh_materialized_storefront = AsyncMock()

    await artwork_service.update_shop_order([3, 2, 3, 1])

    artwork_service.db.artworks.update_shop_sort_order.assert_awaited_once_with([3, 2, 1])
    artwork_service.db.commit.assert_awaited_once()
    artwork_service._refresh_materialized_storefront.assert_awaited_once_with([3, 2, 1])
