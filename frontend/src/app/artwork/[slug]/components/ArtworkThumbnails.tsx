"use client";

import { getImageUrl } from "@/utils";
import type { Artwork } from "../types";
import type { ArtworkLayoutMetrics } from "../hooks/useArtworkDetailPage";

type ArtworkImage = NonNullable<Artwork["images"]>[number];

export function ArtworkThumbnails({
  images,
  selectedImageIndex,
  layoutMetrics,
  onSelect,
}: {
  images: ArtworkImage[];
  selectedImageIndex: number;
  layoutMetrics: ArtworkLayoutMetrics;
  onSelect: (idx: number) => void;
}) {
  if (images.length <= 1) return null;
  const isMobile = layoutMetrics.winW < 768;

  return (
    <div
      style={{
        position: "absolute",
        bottom: isMobile ? "4px" : "6px",
        top: "auto",
        width: "100%",
        overflowX: isMobile ? "auto" : "visible",
        overflowY: "visible",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: isMobile ? 0 : "18px",
        transform: "none",
        paddingBottom: isMobile ? 0 : "18px",
        marginBottom: 0,
        scrollbarWidth: "none",
        transition: "bottom 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: isMobile ? "0.25rem" : "0.5rem",
          justifyContent: "center",
          paddingTop: isMobile ? "0.5rem" : 0,
          minWidth: "min-content",
        }}
      >
        {images.map((img, idx) => {
          const isActive = selectedImageIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              style={{
                height: isMobile ? "24px" : "70px",
                width: isMobile ? "24px" : "auto",
                padding: 0,
                flexShrink: 0,
                margin: isActive ? (isMobile ? "0 4px" : "0 10px") : "0",
                border: isActive
                  ? `2px solid ${isMobile ? "#fff" : "var(--color-charcoal)"}`
                  : "2px solid transparent",
                cursor: "pointer",
                borderRadius: isMobile ? "50%" : "4px",
                overflow: "hidden",
                outline: "none",
                background: "none",
                display: "block",
                opacity: isActive ? 1 : 0.55,
                boxShadow: isActive
                  ? isMobile
                    ? "0 2px 6px rgba(0,0,0,0.15)"
                    : "var(--shadow-card-deep)"
                  : isMobile
                    ? "0 1px 3px rgba(0,0,0,0.08)"
                    : "var(--shadow-thumb)",
                transition:
                  "margin 0.25s ease, opacity 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <img
                src={getImageUrl(img, "thumb")}
                alt=""
                style={{
                  height: "100%",
                  width: isMobile ? "100%" : "auto",
                  display: "block",
                  objectFit: isMobile ? "cover" : "initial",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
