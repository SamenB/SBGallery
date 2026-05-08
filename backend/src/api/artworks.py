"""
API endpoints for managing artworks.
Includes CRUD operations, bulk creation, and image uploading.
"""

from fastapi import APIRouter, Body, File, Form, Query, UploadFile

from src.api.dependencies import AdminDep, DBDep
from src.schemas.artworks import ArtworkAddBulk, ArtworkAddRequest, ArtworkPatchRequest
from src.services.artwork_media import ArtworkMediaService
from src.services.artwork_print_workflow import ArtworkPrintWorkflowService
from src.services.artworks import ArtworkService

router = APIRouter(prefix="/artworks", tags=["Artworks"])
bulk_router = APIRouter(prefix="/artworks/bulk", tags=["Artworks"])


@router.get("/admin/list")
async def get_admin_artworks(
    admin_id: AdminDep,
    db: DBDep,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    title: str | None = Query(None),
    labels: list[int] | None = Query(None),
    year_from: int | None = Query(None),
    year_to: int | None = Query(None),
    price_min: int | None = Query(None),
    price_max: int | None = Query(None),
    orientation: str | None = Query(None),
    size_category: str | None = Query(None),
    include_print_readiness: bool = Query(
        False,
        description="When true, include admin-facing print workflow readiness summary per artwork.",
    ),
):
    return await ArtworkService(db).get_admin_artworks(
        limit=limit,
        offset=offset,
        title=title,
        labels=labels,
        year_from=year_from,
        year_to=year_to,
        price_min=price_min,
        price_max=price_max,
        orientation=orientation,
        size_category=size_category,
        include_print_readiness=include_print_readiness,
    )


@router.get("")
async def get_artworks(
    db: DBDep,
    limit: int = Query(10, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    title: str | None = Query(None),
    labels: list[int] | None = Query(None),
    year_from: int | None = Query(None),
    year_to: int | None = Query(None),
    price_min: int | None = Query(None),
    price_max: int | None = Query(None),
    orientation: str | None = Query(None),
    size_category: str | None = Query(None),
    country: str | None = Query(
        None,
        min_length=2,
        max_length=2,
        description="ISO 3166-1 alpha-2. When provided, artworks are enriched with baked storefront summary for this region.",
    ),
    surface: str = Query(
        "shop",
        pattern="^(shop|gallery|all)$",
        description="Public surface to read: shop, gallery, or all visible artworks.",
    ),
):
    """
    Retrieves a list of artworks with optional filtering and pagination.
    """
    return await ArtworkService(db).get_all_artworks(
        limit=limit,
        offset=offset,
        title=title,
        labels=labels,
        year_from=year_from,
        year_to=year_to,
        price_min=price_min,
        price_max=price_max,
        orientation=orientation,
        size_category=size_category,
        country_code=country.upper() if country else None,
        surface=surface,
    )


@router.get("/{artwork_id_or_slug}")
async def get_artwork(
    artwork_id_or_slug: str,
    db: DBDep,
    country: str | None = Query(
        None,
        min_length=2,
        max_length=2,
        description="Optional ISO 3166-1 alpha-2 country code for baked storefront enrichment.",
    ),
):
    """
    Retrieves a single artwork by its numeric ID or unique slug.
    """
    return await ArtworkMediaService(db).get_artwork(artwork_id_or_slug, country)


@router.post("")
async def create_artwork(
    admin_id: AdminDep,
    db: DBDep,
    artwork_data: ArtworkAddRequest = Body(
        openapi_examples={
            "1": {
                "summary": "Basic artwork",
                "value": {
                    "title": "Starry Night",
                    "description": "A famous painting by Van Gogh",
                    "price": 10000,
                    "quantity": 1,
                    "labels": [1, 2],
                },
            }
        },
    ),
):
    """
    Creates a new artwork in the database. Requires admin privileges.
    """
    artwork = await ArtworkService(db).create_artwork(artwork_data)
    return {"status": "OK", "data": artwork}


@router.put("/{artwork_id}")
async def update_artwork(
    artwork_id: int,
    admin_id: AdminDep,
    db: DBDep,
    artwork_data: ArtworkAddRequest = Body(),
):
    """
    Updates an entire artwork record by its ID. Requires admin privileges.
    """
    await ArtworkService(db).update_artwork(artwork_id, artwork_data)
    return {"status": "OK"}


@router.patch("/{artwork_id}")
async def patch_artwork(
    artwork_id: int,
    admin_id: AdminDep,
    db: DBDep,
    artwork_data: ArtworkPatchRequest = Body(
        openapi_examples={
            "1": {
                "summary": "Update title",
                "value": {"title": "Updated Title"},
            },
            "2": {
                "summary": "Update labels",
                "value": {"labels": [1, 3, 5]},
            },
        },
    ),
):
    """
    Partially updates an artwork record by its ID. Requires admin privileges.
    """
    await ArtworkService(db).update_artwork_partially(artwork_id, artwork_data)
    return {"status": "OK"}


@router.post("/{artwork_id}/images")
async def upload_artwork_images(
    artwork_id: int, admin_id: AdminDep, db: DBDep, files: list[UploadFile] = File(...)
):
    """
    Uploads multiple images for a specific artwork.
    """
    return await ArtworkMediaService(db).upload_artwork_images(artwork_id, files)


@router.post("/{artwork_id}/print-image")
async def upload_print_quality_image(
    artwork_id: int, admin_id: AdminDep, db: DBDep, file: UploadFile = File(...)
):
    """
    Uploads a high-resolution source image for print-on-demand fulfillment.
    """
    return await ArtworkMediaService(db).upload_print_quality_image(artwork_id, file)


@router.get("/{artwork_id}/print-profile")
async def get_artwork_print_profile(artwork_id: int, db: DBDep):
    """
    Returns the recommended and effective active-provider print-profile bundle for one artwork.
    """
    return await ArtworkMediaService(db).get_print_profile_bundle(artwork_id)


@router.get("/{artwork_id}/print-workflow")
async def get_artwork_print_workflow(
    artwork_id: int,
    admin_id: AdminDep,
    db: DBDep,
):
    return await ArtworkPrintWorkflowService(db).get_workflow(artwork_id)


@router.post("/{artwork_id}/print-assets")
async def upload_artwork_print_asset(
    artwork_id: int,
    admin_id: AdminDep,
    db: DBDep,
    file: UploadFile = File(...),
    asset_role: str = Form(...),
    category_id: str | None = Form(None),
    slot_size_label: str | None = Form(None),
    note: str | None = Form(None),
):
    return await ArtworkMediaService(db).upload_print_asset(
        artwork_id=artwork_id,
        file=file,
        asset_role=asset_role,
        category_id=category_id,
        slot_size_label=slot_size_label,
        note=note,
    )


@router.delete("/{artwork_id}/print-assets/{asset_id}")
async def delete_artwork_print_asset(
    artwork_id: int,
    asset_id: int,
    admin_id: AdminDep,
    db: DBDep,
):
    return await ArtworkMediaService(db).delete_print_asset(
        artwork_id=artwork_id,
        asset_id=asset_id,
    )


async def _get_artwork_print_storefront(
    artwork_id_or_slug: str,
    db: DBDep,
    country: str = Query(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2"),
):
    """
    Resolves public storefront print offers for one artwork in one destination country.
    """
    return await ArtworkMediaService(db).get_artwork_print_storefront(
        artwork_id_or_slug=artwork_id_or_slug,
        country=country,
    )


@router.get("/{artwork_id_or_slug}/prints")
async def get_artwork_print_storefront(
    artwork_id_or_slug: str,
    db: DBDep,
    country: str = Query(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2"),
):
    """
    Public storefront print offers for one artwork and one destination country.
    """
    return await _get_artwork_print_storefront(
        artwork_id_or_slug=artwork_id_or_slug,
        db=db,
        country=country,
    )


@router.get("/{artwork_id_or_slug}/storefront-offers")
async def get_artwork_storefront_offers(
    artwork_id_or_slug: str,
    db: DBDep,
    country: str = Query(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2"),
):
    """
    Backward-compatible alias for the older storefront naming.
    """
    return await _get_artwork_print_storefront(
        artwork_id_or_slug=artwork_id_or_slug,
        db=db,
        country=country,
    )


@router.delete("/{artwork_id}")
async def delete_artwork(artwork_id: int, admin_id: AdminDep, db: DBDep):
    """
    Deletes an artwork record from the database by its ID. Requires admin privileges.
    """
    await ArtworkService(db).delete_artwork(artwork_id)
    return {"status": "OK"}


@bulk_router.post("")
async def create_artworks_bulk(
    admin_id: AdminDep, db: DBDep, artworks_data: list[ArtworkAddBulk] = Body()
):
    """
    Creates multiple artworks in a single request. Requires admin privileges.
    """
    count = await ArtworkService(db).create_artworks_bulk(artworks_data)
    return {"status": "OK", "count": count}
