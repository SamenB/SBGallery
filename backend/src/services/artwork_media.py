from __future__ import annotations

import os
import shutil
from uuid import uuid4

from fastapi import UploadFile
from fastapi.concurrency import run_in_threadpool

from src.exeptions import InvalidDataException, ObjectNotFoundException
from src.print_on_demand import get_print_provider
from src.schemas.artworks import ArtworkPatchRequest
from src.services.artwork_print_workflow import ArtworkPrintWorkflowService
from src.services.artworks import ArtworkService
from src.tasks.tasks import process_and_attach_image


class ArtworkMediaService:
    def __init__(self, db):
        self.db = db

    async def get_artwork(self, artwork_id_or_slug: str, country: str | None):
        if artwork_id_or_slug.isdigit():
            artwork = await ArtworkService(self.db).get_artwork_by_id(int(artwork_id_or_slug))
        else:
            artwork = await ArtworkService(self.db).get_artwork_by_slug(artwork_id_or_slug)

        if not country:
            return artwork

        serialized = artwork.model_dump(mode="json")
        provider = get_print_provider()
        serialized["print_storefront"] = await provider.get_artwork_storefront(
            db=self.db,
            artwork_id_or_slug=artwork_id_or_slug,
            country_code=country.upper(),
        )
        serialized["storefront_summary"] = provider.build_summary_from_storefront_payload(
            serialized["print_storefront"]
        )
        return serialized

    async def upload_artwork_images(self, artwork_id: int, files: list[UploadFile]) -> dict:
        os.makedirs("static/images/temp", exist_ok=True)
        temp_paths = []
        for idx, file in enumerate(files):
            temp_path = f"static/images/temp/art_{artwork_id}_{idx}_{file.filename}"
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            temp_paths.append(temp_path)

        final_paths = await run_in_threadpool(
            process_and_attach_image,
            model_type="artwork",
            model_id=artwork_id,
            temp_paths=temp_paths,
        )
        return {"status": "success", "images": final_paths or []}

    async def upload_print_quality_image(self, artwork_id: int, file: UploadFile) -> dict:
        allowed_types = {"image/tiff", "image/png", "image/jpeg", "image/webp", "image/x-tiff"}
        if file.content_type not in allowed_types:
            raise InvalidDataException(detail="Unsupported format. Use TIFF, PNG, JPEG or WebP.")

        out_dir = "static/print"
        os.makedirs(out_dir, exist_ok=True)
        original_ext = os.path.splitext(file.filename or "upload")[1] or ".jpg"
        safe_ext = original_ext.lower().replace(".tiff", ".tif")
        filename = f"print_{artwork_id}_{uuid4().hex[:8]}{safe_ext}"
        dest_path = f"{out_dir}/{filename}"

        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        public_url = f"/static/print/{filename}"
        source_metadata = get_print_provider().extract_source_metadata(
            file_path=dest_path,
            public_url=public_url,
        )
        await ArtworkService(self.db).update_artwork_partially(
            artwork_id,
            ArtworkPatchRequest(
                print_quality_url=public_url,
                print_source_metadata=source_metadata,
            ),
        )
        return {"url": public_url, "metadata": source_metadata}

    async def get_print_profile_bundle(self, artwork_id: int) -> dict:
        return await get_print_provider().get_print_profile_bundle(
            db=self.db,
            artwork_id=artwork_id,
        )

    async def upload_print_asset(
        self,
        *,
        artwork_id: int,
        file: UploadFile,
        asset_role: str,
        category_id: str | None,
        slot_size_label: str | None,
        note: str | None,
    ) -> dict:
        await ArtworkService(self.db).get_artwork_by_id(artwork_id)
        service = ArtworkPrintWorkflowService(self.db)
        file_ext = (os.path.splitext(file.filename or "")[1] or "").lower()
        try:
            service.validate_asset_upload_scope(
                asset_role=asset_role,
                file_ext=file_ext,
            )
        except ValueError as exc:
            raise InvalidDataException(detail=str(exc)) from exc

        out_dir = os.path.join(
            "static",
            "print-prep",
            str(artwork_id),
            self._sanitize_path_fragment(category_id, "shared"),
            self._sanitize_path_fragment(asset_role, "asset"),
        )
        os.makedirs(out_dir, exist_ok=True)
        filename = (
            f"{self._sanitize_path_fragment(slot_size_label, 'variant')}_"
            f"{uuid4().hex[:8]}{file_ext or '.png'}"
        )
        dest_path = os.path.join(out_dir, filename)

        try:
            with open(dest_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            public_url = "/" + dest_path.replace("\\", "/")
            metadata = service.extract_prepared_asset_metadata(dest_path, public_url=public_url)
            if slot_size_label is None:
                await service.validate_master_upload_dimensions(
                    artwork_id=artwork_id,
                    asset_role=asset_role,
                    width_px=int(metadata.get("width_px") or 0),
                    height_px=int(metadata.get("height_px") or 0),
                )
            asset = await service.upsert_prepared_asset(
                artwork_id=artwork_id,
                provider_key=get_print_provider().provider_key,
                category_id=category_id,
                asset_role=asset_role,
                slot_size_label=slot_size_label,
                file_url=public_url,
                file_name=file.filename or filename,
                file_ext=file_ext or None,
                mime_type=file.content_type,
                file_size_bytes=metadata.get("file_size_bytes"),
                checksum_sha256=service.compute_sha256(dest_path),
                file_metadata=metadata,
                note=note,
            )
            await self.db.commit()
            return {
                "status": "OK",
                "asset": asset.model_dump(mode="json"),
                "generated_assets": [],
                "derivatives_scheduled": False,
            }
        except ValueError as exc:
            await self.db.rollback()
            self._remove_if_exists(dest_path)
            raise InvalidDataException(detail=str(exc)) from exc
        except Exception:
            await self.db.rollback()
            self._remove_if_exists(dest_path)
            raise

    async def delete_print_asset(self, *, artwork_id: int, asset_id: int) -> dict:
        try:
            asset = await self.db.artwork_print_assets.get_one(id=asset_id)
        except ObjectNotFoundException as exc:
            raise ObjectNotFoundException(detail="Prepared print asset not found") from exc

        if int(asset.artwork_id) != artwork_id:
            raise ObjectNotFoundException(detail="Prepared print asset not found")

        service = ArtworkPrintWorkflowService(self.db)
        if asset.slot_size_label is None:
            await service.delete_generated_assets_for_master(asset)
        await service.delete_prepared_asset(asset_id)
        await self.db.commit()

        file_path = str(asset.file_url or "").lstrip("/")
        self._remove_if_exists(file_path)
        return {"status": "OK"}

    async def get_artwork_print_storefront(self, artwork_id_or_slug: str, country: str) -> dict:
        return await get_print_provider().get_artwork_storefront(
            db=self.db,
            artwork_id_or_slug=artwork_id_or_slug,
            country_code=country,
        )

    def _sanitize_path_fragment(self, value: str | None, fallback: str) -> str:
        import re

        candidate = (value or "").strip()
        normalized = re.sub(r"[^a-zA-Z0-9_-]+", "-", candidate).strip("-").lower()
        return normalized or fallback

    def _remove_if_exists(self, path: str) -> None:
        if path and os.path.exists(path):
            os.remove(path)
