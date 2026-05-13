"use client";

import { IMAGE_ZONE } from "../constants";
import type { Product } from "../types";
import type { AspectRatioRange } from "../utils";
import type { ShopGridMode } from "../utils/shopGridLayout";
import { ProductCard } from "./ProductCard";

type ShopCatalogResultsProps = {
  loading: boolean;
  error: string | null;
  filteredCount: number;
  displayed: Product[];
  gridColumns: string;
  gridGap: string;
  cardMaxWidth?: number;
  layoutVersion?: string;
  gridMode: ShopGridMode;
  isMobile: boolean;
  countryCode: string;
  likedIds?: Set<number>;
  imageAspectRatioRange?: AspectRatioRange;
  rowImageStageHeights?: (number | undefined)[];
  visibleCount: number;
  loadMoreRef: (node?: Element | null | undefined) => void;
  onClearAll: () => void;
  onAuthRequired?: (id: number, isLiked: boolean) => void;
  onLikeChange: (id: number, isLiked: boolean) => void;
  onNaturalAspectRatio: (id: number, ratio: number) => void;
  onContainerWidthChange: (id: number, width: number) => void;
};

export function ShopCatalogResults({
  loading,
  error,
  filteredCount,
  displayed,
  gridColumns,
  gridGap,
  cardMaxWidth,
  layoutVersion,
  gridMode,
  isMobile,
  countryCode,
  likedIds,
  imageAspectRatioRange,
  rowImageStageHeights,
  visibleCount,
  loadMoreRef,
  onClearAll,
  onAuthRequired,
  onLikeChange,
  onNaturalAspectRatio,
  onContainerWidthChange,
}: ShopCatalogResultsProps) {
  if (loading) {
    return <div style={{ padding: "5rem 1rem", textAlign: "center", fontFamily: "var(--font-sans)", color: "var(--color-muted)", fontSize: "0.85rem" }}>Curating catalog...</div>;
  }

  if (error) {
    return <div style={{ padding: "5rem 1rem", textAlign: "center", fontFamily: "var(--font-sans)", color: "#C87070" }}>{error}</div>;
  }

  return (
    <>
      {filteredCount > 0 ? (
        <div className="art-grid" style={{ display: "grid", gridTemplateColumns: gridColumns, justifyContent: "start", gap: gridGap, alignItems: "start" }}>
          {displayed.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              zoneH={IMAGE_ZONE[gridMode] || 380}
              gridMode={gridMode}
              isMobile={isMobile}
              maxCardWidth={cardMaxWidth}
              layoutVersion={layoutVersion}
              countryCode={countryCode}
              likedIds={likedIds}
              listIndex={index}
              rowAspectRatioRange={imageAspectRatioRange}
              fixedImageStageHeight={rowImageStageHeights?.[index]}
              useNaturalMobileSizing
              onNaturalAspectRatio={onNaturalAspectRatio}
              onContainerWidthChange={onContainerWidthChange}
              onAuthRequired={onAuthRequired}
              onLikeChange={onLikeChange}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.2rem", color: "var(--color-muted)", marginBottom: "1.25rem" }}>Exhibition results remain empty for these parameters.</p>
          <button
            onClick={onClearAll}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Reset all parameters
          </button>
        </div>
      )}

      {visibleCount < filteredCount && (
        <div ref={loadMoreRef} style={{ height: "40px", marginTop: "2rem", display: "flex", justifyContent: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>Curating more works...</span>
        </div>
      )}
    </>
  );
}
