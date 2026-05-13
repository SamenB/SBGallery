import { ArrowDown, ArrowUp, Grip, Save, X } from "lucide-react";
import type { PointerEvent } from "react";
import { useRef, useState } from "react";
import { Artwork } from "./types";
import { resolveImageUrl } from "./utils";

interface ArtworkShopOrderGridProps {
  artworks: Artwork[];
  saving: boolean;
  dirty: boolean;
  message: string | null;
  error: string | null;
  onReorder: (artworks: Artwork[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

function moveArtwork(items: Artwork[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function moveArtworkById(items: Artwork[], activeId: number, overId: number) {
  return moveArtwork(
    items,
    items.findIndex((artwork) => artwork.id === activeId),
    items.findIndex((artwork) => artwork.id === overId),
  );
}

export function ArtworkShopOrderGrid({
  artworks,
  saving,
  dirty,
  message,
  error,
  onReorder,
  onSave,
  onCancel,
}: ArtworkShopOrderGridProps) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const dragIdRef = useRef<number | null>(null);
  const lastOverIdRef = useRef<number | null>(null);
  const capturedElementRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId || dragIdRef.current === null) return;
    const target = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find((element) => element instanceof HTMLElement && element.dataset.artworkId);
    const overId = target instanceof HTMLElement ? Number(target.dataset.artworkId) : null;
    if (!overId || overId === dragIdRef.current) {
      lastOverIdRef.current = null;
      return;
    }
    if (overId === lastOverIdRef.current) return;
    lastOverIdRef.current = overId;
    onReorder(moveArtworkById(artworks, dragIdRef.current, overId));
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    if (capturedElementRef.current?.hasPointerCapture(event.pointerId)) {
      capturedElementRef.current.releasePointerCapture(event.pointerId);
    }
    pointerIdRef.current = null;
    dragIdRef.current = null;
    lastOverIdRef.current = null;
    capturedElementRef.current = null;
    setDraggingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#31323E]/10 bg-[#F7F7F5] px-4 py-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#31323E]">
            Default shop order
          </h3>
          <p className="mt-1 text-xs font-semibold text-[#31323E]/45">
            {artworks.length} shop artworks
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-xl border border-[#31323E]/15 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#31323E]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Close
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 rounded-xl bg-[#31323E] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Saving" : "Save order"}
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      {artworks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#31323E]/15 bg-white px-5 py-8 text-center text-sm font-semibold text-[#31323E]/50">
          No shop artworks are available for ordering.
        </div>
      ) : (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          {artworks.map((artwork, index) => (
            <div
              key={artwork.id}
              data-artwork-id={artwork.id}
              onPointerDown={(event) => {
                pointerIdRef.current = event.pointerId;
                dragIdRef.current = artwork.id;
                lastOverIdRef.current = null;
                capturedElementRef.current = event.currentTarget;
                setDraggingId(artwork.id);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-transform ${
                draggingId === artwork.id
                  ? "z-10 scale-[1.03] border-[#31323E]/40 opacity-80"
                  : "border-[#31323E]/10"
              }`}
              style={{ touchAction: "none" }}
            >
              <div className="relative aspect-square bg-[#31323E]/5">
                {artwork.images && artwork.images.length > 0 ? (
                  <img
                    src={resolveImageUrl(artwork.images[0], "medium")}
                    alt={artwork.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.14em] text-[#31323E]/35">
                    No image
                  </div>
                )}
                <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#31323E]">
                  <Grip className="h-3.5 w-3.5" aria-hidden="true" />
                  {index + 1}
                </div>
              </div>
              <div className="space-y-3 px-3 py-3">
                <p className="line-clamp-2 min-h-[2.4em] text-sm font-bold leading-tight text-[#31323E]">
                  {artwork.title}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Move ${artwork.title} up`}
                    disabled={index === 0}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => onReorder(moveArtwork(artworks, index, index - 1))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#31323E]/12 bg-white text-[#31323E] disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${artwork.title} down`}
                    disabled={index === artworks.length - 1}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => onReorder(moveArtwork(artworks, index, index + 1))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#31323E]/12 bg-white text-[#31323E] disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
