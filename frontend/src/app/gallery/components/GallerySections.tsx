"use client";

import { Ref } from "react";
import { ArtCard } from "./ArtCard";
import { Artwork, GalleryGridMode, GalleryGroup } from "../types";

interface GallerySectionsProps {
  groups: GalleryGroup[];
  gridMode: GalleryGridMode;
  imageZone: number;
  isMobile: boolean;
  gridColumns: string;
  gridGap: string;
  likedIds: Set<number>;
  visibleCount: number;
  totalCount: number;
  loadMoreRef: Ref<HTMLDivElement>;
  onOpenLightbox: (works: Artwork[], index: number) => void;
  onLike: (id: number, newState: boolean) => Promise<void>;
  onAuthRequired: (id: number, newState: boolean) => void;
  onNaturalAspectRatio: (id: number, ratio: number) => void;
  onContainerWidthChange: (id: number, width: number) => void;
  getRowAspectRatioRange: (
    works: Artwork[],
    index: number,
  ) => { min: number; max: number; containerWidth?: number } | undefined;
  getRowImageStageHeight?: (works: Artwork[], index: number) => number | undefined;
}

export function GallerySections({
  groups,
  gridMode,
  imageZone,
  isMobile,
  gridColumns,
  gridGap,
  likedIds,
  visibleCount,
  totalCount,
  loadMoreRef,
  onOpenLightbox,
  onLike,
  onAuthRequired,
  onNaturalAspectRatio,
  onContainerWidthChange,
  getRowAspectRatioRange,
  getRowImageStageHeight,
}: GallerySectionsProps) {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {groups.map(({ name, works, totalInGroup }) => (
          <section key={name} style={{ paddingBottom: "0.5rem", marginBottom: 0 }}>
            <div
              style={{
                width: "100%",
                margin: isMobile ? "0 0 0.6rem" : "0 0 0.75rem",
              }}
            >
              <div
                style={{
                  maxWidth: "1600px",
                  margin: "0 auto",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    width: "100%",
                    padding: isMobile ? "0.6rem 0.75rem" : "0.6rem 1.5rem",
                    borderBottom: "1px solid rgba(26,26,24,0.35)",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "1.05rem",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "var(--color-charcoal)",
                      margin: 0,
                    }}
                  >
                    {name}
                  </h2>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      fontWeight: 300,
                      color: "var(--color-muted)",
                    }}
                  >
                    {works.length}
                    {works.length < totalInGroup ? ` of ${totalInGroup}` : ""}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ overflow: "hidden", padding: "16px 0 18px", margin: "-8px 0 0" }}>
              <div
                className="magnetic-scroll"
                style={{
                  width: "100%",
                  padding: isMobile ? "0 0.35rem 1rem" : "0 0 0.5rem",
                }}
              >
                <div
                  className="art-grid"
                  style={{
                    maxWidth: "1600px",
                    margin: "0 auto",
                    padding: isMobile ? "0" : "0 2.5rem",
                    display: "grid",
                    gridTemplateColumns: gridColumns,
                    justifyContent: "start",
                    gap: gridGap,
                    alignItems: "start",
                  }}
                >
                  {works.map((work, index) => (
                    <ArtCard
                      key={work.id}
                      work={work}
                      onClick={() => onOpenLightbox(works, index)}
                      zoneH={imageZone}
                      gridMode={gridMode}
                      isMobile={isMobile}
                      liked={likedIds.has(work.id)}
                      rowAspectRatioRange={getRowAspectRatioRange(works, index)}
                      fixedImageStageHeight={getRowImageStageHeight?.(works, index)}
                      onNaturalAspectRatio={onNaturalAspectRatio}
                      onContainerWidthChange={onContainerWidthChange}
                      onLike={onLike}
                      onAuthRequired={onAuthRequired}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
      {visibleCount < totalCount && (
        <div
          ref={loadMoreRef}
          style={{
            height: "40px",
            paddingBottom: "4rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--color-muted)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Curating more works...
          </span>
        </div>
      )}
    </>
  );
}
