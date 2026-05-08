import type { Artwork, ArtworkFormState, DragItem, ImageEntry } from "./types";
import {
  currentYear,
  extractCanvasWrapSelectionFromOverrides,
  resolveImageUrl,
} from "./utils";

export interface RefreshPayload {
  detail?: string;
  message?: string;
  bake?: { id?: number };
  artwork_storefront_materialization?: { materialized_count?: number };
  cache_clear?: { deleted_keys?: number };
}

export function mapArtworkToFormState(artwork: Artwork): ArtworkFormState {
  return {
    title: artwork.title || "",
    description: artwork.description || "",
    year: artwork.year || currentYear,
    width_cm: artwork.width_cm || "",
    height_cm: artwork.height_cm || "",
    original_price: artwork.original_price || "",
    has_original: Boolean(artwork.has_original),
    has_canvas_print: Boolean(artwork.has_canvas_print),
    has_canvas_print_limited: Boolean(artwork.has_canvas_print_limited),
    has_paper_print: Boolean(artwork.has_paper_print),
    has_paper_print_limited: Boolean(artwork.has_paper_print_limited),
    canvas_print_limited_quantity: artwork.canvas_print_limited_quantity || "",
    paper_print_limited_quantity: artwork.paper_print_limited_quantity || "",
    white_border_pct: artwork.white_border_pct ?? 5,
    print_aspect_ratio_id: artwork.print_aspect_ratio_id || null,
    orientation: artwork.orientation || "Horizontal",
    labels: (artwork.labels || []).map((label) => label.id),
    original_status: artwork.original_status || "available",
    print_quality_url: artwork.print_quality_url || "",
    print_profile_overrides: artwork.print_profile_overrides || null,
    show_in_gallery: artwork.show_in_gallery ?? true,
    show_in_shop: artwork.show_in_shop ?? true,
    canvas_wrap_style: extractCanvasWrapSelectionFromOverrides(
      artwork.print_profile_overrides,
    ),
  };
}

export function mapImagesToDragItems(
  images: ImageEntry[] | undefined,
): DragItem[] {
  return (images || []).map((image) => ({
    type: "existing" as const,
    url: resolveImageUrl(image),
    existingData: image,
  }));
}

export function buildRefreshSummary(payload: RefreshPayload): string {
  const summaryParts = [
    "Payloads refreshed.",
    typeof payload.bake?.id === "number" ? `Bake #${payload.bake.id}.` : null,
    typeof payload.artwork_storefront_materialization?.materialized_count ===
    "number"
      ? `${payload.artwork_storefront_materialization.materialized_count} artwork payloads rebuilt.`
      : null,
    typeof payload.cache_clear?.deleted_keys === "number"
      ? `${payload.cache_clear.deleted_keys} cache keys cleared.`
      : null,
  ].filter(Boolean);
  return summaryParts.join(" ");
}
