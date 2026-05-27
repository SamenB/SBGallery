"""
Asynchronous background tasks for the ArtShop application.
Includes image processing (optimization, resizing, and WebP conversion)
and scheduled maintenance tasks like email notifications.
"""

import asyncio
import time
from pathlib import Path
from typing import TypedDict

from loguru import logger
from PIL import Image, ImageOps
from sqlalchemy import select, update

from src.database import new_session_null_pool
from src.models.artworks import ArtworksOrm
from src.tasks.celery_app import celery_instance
from src.utils.db_manager import DBManager


class ImageVariantSpec(TypedDict):
    max_size: tuple[int, int] | None
    quality: int


IMAGE_VARIANT_SPECS: dict[str, ImageVariantSpec] = {
    "original": {"max_size": None, "quality": 92},
    "large": {"max_size": (2560, 2560), "quality": 90},
    "medium": {"max_size": (1600, 1600), "quality": 86},
    "thumb": {"max_size": (500, 500), "quality": 78},
}


def run_async(coro):
    """
    Safely executes an asynchronous coroutine within a synchronous Celery task.
    Manages a new event loop for the duration of the execution.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def _normalize_image_for_webp(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img)

    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        alpha = img.convert("RGBA").split()[-1]
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        bg.paste(img, mask=alpha)
        return bg.convert("RGB")
    if img.mode != "RGB":
        return img.convert("RGB")
    return img


def generate_gallery_image_variants(
    *,
    source_img: Image.Image,
    output_dir: Path,
    prefix: str,
) -> dict[str, str]:
    variants: dict[str, str] = {}
    for variant, spec in IMAGE_VARIANT_SPECS.items():
        image = source_img.copy()
        max_size = spec["max_size"]
        if max_size is not None:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)

        filename = f"{prefix}_{variant}.webp"
        image.save(
            output_dir / filename,
            format="WEBP",
            quality=spec["quality"],
            method=6,
        )
        variants[variant] = f"/static/images/{filename}"
    return variants


@celery_instance.task
def process_and_attach_image(model_type: str, model_id: int, temp_paths: list[str]):
    """
    Optimizes and generates multiple versions of uploaded images.

    Logic:
    1. Creates target directories if missing.
    2. Converts images to WebP format with storefront variants (original, large, medium, thumb).
    3. Handles transparency and color modes.
    4. Saves optimized files with globally unique names to prevent collisions.
    5. Updates the database record with the new image URL metadata.
    6. Cleans up temporary upload files.
    """
    logger.info("Processing images for {} id={}", model_type, model_id)
    output_dir = Path("static/images")
    output_dir.mkdir(parents=True, exist_ok=True)

    final_paths = []
    upload_ts = int(time.time())

    try:
        for idx, temp_file_path in enumerate(temp_paths):
            file_path = Path(temp_file_path)
            if not file_path.exists():
                logger.error(
                    "Temp file not found — possible volume mismatch between api and worker containers: {}",
                    file_path,
                )
                continue

            with Image.open(file_path) as img:
                img = _normalize_image_for_webp(img)

                # Generate unique filename prefix using model ID and timestamp.
                prefix = f"{model_type}_{model_id}_{upload_ts}_{idx}"
                final_paths.append(
                    generate_gallery_image_variants(
                        source_img=img,
                        output_dir=output_dir,
                        prefix=prefix,
                    )
                )

            # Delete the temporary uploaded file to free space.
            file_path.unlink(missing_ok=True)

        async def update_db(the_final_paths: list):
            """Internal helper to atomically append image details to the DB record."""
            async with new_session_null_pool() as session:
                orm_model = ArtworksOrm
                # Retrieve current image list to append new items.
                result = await session.execute(
                    select(orm_model.images).where(orm_model.id == model_id)
                )
                row = result.scalar_one_or_none()
                existing_images = list(row) if row else []
                merged_images = existing_images + the_final_paths

                # Update the model with the merged JSON array.
                stmt = (
                    update(orm_model).where(orm_model.id == model_id).values(images=merged_images)
                )
                await session.execute(stmt)
                await session.commit()

        if final_paths:
            run_async(update_db(final_paths))

        logger.info(
            "Images processed for {} id={}: paths={}",
            model_type,
            model_id,
            final_paths,
        )
        return final_paths

    except Exception as e:
        logger.error("Failed to process images for {} id={}: {}", model_type, model_id, e)
        raise


async def release_abandoned_orders_helper():
    """
    Helper for releasing artworks stuck in pending/awaiting_payment.
    """
    from src.services.orders import OrderService

    logger.info("Running abandoned orders cleanup...")
    async with DBManager(session_factory=new_session_null_pool) as db:
        await OrderService(db).run_abandoned_orders_cleanup(timeout_hours=2)


@celery_instance.task(name="release_abandoned_orders")
def release_abandoned_orders():
    """
    Periodic task triggered by Celery Beat every hour to release
    original artworks from abandoned shopping carts.
    """
    logger.info("Task started: release_abandoned_orders")
    try:
        run_async(release_abandoned_orders_helper())
    except Exception as e:
        logger.error("Task failed: release_abandoned_orders: {}", e)
        return
    logger.info("Task finished: release_abandoned_orders")
