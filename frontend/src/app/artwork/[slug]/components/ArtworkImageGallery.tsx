"use client";

import type { CSSProperties, RefObject } from "react";
import { getImageUrl } from "@/utils";
import type { Artwork } from "../types";
import type { ArtworkLayoutMetrics } from "../hooks/useArtworkDetailPage";
import { ArtworkFullscreenButton } from "./ArtworkFullscreenButton";
import { ArtworkThumbnails } from "./ArtworkThumbnails";

type ArtworkImage = NonNullable<Artwork["images"]>[number];

const getImageDimensions = (
  work: Artwork,
  idx: number,
  aspect: number | undefined,
  layoutMetrics: ArtworkLayoutMetrics,
): CSSProperties => {
  if (!aspect || layoutMetrics.boxW <= 0 || layoutMetrics.winW <= 0) {
    return { margin: "auto" };
  }

  if (layoutMetrics.winW < 768) {
    const width = layoutMetrics.boxW * 0.95;
    return { width: `${width}px`, height: `${width / aspect}px`, margin: "0 auto" };
  }

  if (layoutMetrics.boxH <= 0) return { margin: "auto" };

  const isVertical = aspect < 1;
  const thumbReserve = isVertical ? 280 : 200;
  const maxW = layoutMetrics.boxW - 45;
  const maxH = layoutMetrics.boxH - thumbReserve;
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  return { width: `${width}px`, height: `${height}px`, margin: "0 auto" };
};

const getFallbackAspect = (work: Artwork, idx: number): number => {
  if (idx !== 0) return 1;
  if (work.width_cm && work.height_cm) return work.width_cm / work.height_cm;
  if (work.orientation === "horizontal") return 1.5;
  if (work.orientation === "vertical") return 0.75;
  return 1;
};

interface ArtworkImageGalleryProps {
  work: Artwork;
  images: ArtworkImage[];
  selectedImageIndex: number;
  onSelectedImageIndexChange: (idx: number | ((prev: number) => number)) => void;
  layoutMetrics: ArtworkLayoutMetrics;
  imageAspectRatios: Record<number, number>;
  boxRef: RefObject<HTMLDivElement | null>;
  imageFrameRef: RefObject<(HTMLDivElement | null)[]>;
  swipeRef: RefObject<number | null>;
  hasTouchRef: RefObject<boolean>;
  zoomPos: { x: number; y: number };
  isZooming: boolean;
  setIsZooming: (value: boolean) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onImageDimensions: (idx: number, naturalWidth: number, naturalHeight: number) => void;
  onOpenFullSize: () => void;
}

export function ArtworkImageGallery({
  work,
  images,
  selectedImageIndex,
  onSelectedImageIndexChange,
  layoutMetrics,
  imageAspectRatios,
  boxRef,
  imageFrameRef,
  swipeRef,
  hasTouchRef,
  zoomPos,
  isZooming,
  setIsZooming,
  onPointerMove,
  onImageDimensions,
  onOpenFullSize,
}: ArtworkImageGalleryProps) {
  const activeAspect =
    imageAspectRatios[selectedImageIndex] ||
    getFallbackAspect(work, selectedImageIndex);
  const activeImageMetrics = getImageDimensions(
    work,
    selectedImageIndex,
    activeAspect,
    layoutMetrics,
  );
  const activeImageWidth =
    typeof activeImageMetrics.width === "string"
      ? parseFloat(activeImageMetrics.width)
      : 0;
  const activeImageHeight =
    typeof activeImageMetrics.height === "string"
      ? parseFloat(activeImageMetrics.height)
      : 0;
  const viewFullSizeRightOffset = Math.max(
    0,
    (layoutMetrics.boxW - activeImageWidth) / 2,
  );

  return (
    <div className="artwork-img-col">
      <div
        className="artwork-img-area"
        style={{ marginTop: layoutMetrics.winW < 768 ? "0.75rem" : "0" }}
      >
        <div className="artwork-slider-wrap">
          <div
            ref={boxRef}
            style={{
              width: "100%",
              height: layoutMetrics.winW < 768 ? "auto" : "100%",
              position: layoutMetrics.winW < 768 ? "relative" : "absolute",
              inset: layoutMetrics.winW < 768 ? "auto" : 0,
            }}
          >
            <div
              className="w-full z-10"
              style={{
                position: "relative",
                margin: "-60px -30px",
                padding: "60px 30px",
                width: "calc(100% + 60px)",
                height:
                  layoutMetrics.winW < 768
                    ? `calc(${activeImageHeight}px + 120px + 32px + 24px)`
                    : "calc(100% + 120px)",
                transition: "height 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                overflow: "hidden",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0px, black 15px, black calc(100% - 15px), transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0px, black 15px, black calc(100% - 15px), transparent 100%)",
              }}
              onTouchStart={(e) => {
                hasTouchRef.current = true;
                setIsZooming(false);
                swipeRef.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (swipeRef.current === null) return;
                const delta = swipeRef.current - e.changedTouches[0].clientX;
                if (delta > 48 && images.length > 1) {
                  onSelectedImageIndexChange((prev) =>
                    prev < images.length - 1 ? prev + 1 : 0,
                  );
                } else if (delta < -48 && images.length > 1) {
                  onSelectedImageIndexChange((prev) =>
                    prev > 0 ? prev - 1 : images.length - 1,
                  );
                }
                swipeRef.current = null;
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8rem",
                  width: "100%",
                  height: "100%",
                  transition: isZooming
                    ? "none"
                    : "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
                  transform: `translateX(calc(-${selectedImageIndex * 100}% - ${selectedImageIndex * 8}rem))`,
                }}
              >
                {images.length > 0 ? (
                  images.map((img, idx) => (
                    <ArtworkImageSlide
                      key={idx}
                      work={work}
                      img={img}
                      idx={idx}
                      selectedImageIndex={selectedImageIndex}
                      layoutMetrics={layoutMetrics}
                      explicitDimensions={getImageDimensions(
                        work,
                        idx,
                        imageAspectRatios[idx] || getFallbackAspect(work, idx),
                        layoutMetrics,
                      )}
                      knownAspectRatio={imageAspectRatios[idx]}
                      imageFrameRef={imageFrameRef}
                      hasTouchRef={hasTouchRef}
                      zoomPos={zoomPos}
                      isZooming={isZooming}
                      setIsZooming={setIsZooming}
                      onPointerMove={onPointerMove}
                      onImageDimensions={onImageDimensions}
                      onOpenFullSize={onOpenFullSize}
                    />
                  ))
                ) : (
                  <div
                    style={{
                      flex: "0 0 100%",
                      width: "100%",
                      height: "100%",
                      background: `linear-gradient(135deg, ${work.gradientFrom}, ${work.gradientTo})`,
                    }}
                  />
                )}
              </div>
            </div>
            <ArtworkFullscreenButton
              top={activeImageHeight + 5}
              right={viewFullSizeRightOffset}
              visible={layoutMetrics.winW >= 768 && activeImageHeight > 0}
              onClick={onOpenFullSize}
            />
          </div>
          <ArtworkThumbnails
            images={images}
            selectedImageIndex={selectedImageIndex}
            layoutMetrics={layoutMetrics}
            onSelect={onSelectedImageIndexChange}
          />
        </div>
      </div>
    </div>
  );
}

function ArtworkImageSlide({
  work,
  img,
  idx,
  selectedImageIndex,
  layoutMetrics,
  explicitDimensions,
  knownAspectRatio,
  imageFrameRef,
  hasTouchRef,
  zoomPos,
  isZooming,
  setIsZooming,
  onPointerMove,
  onImageDimensions,
  onOpenFullSize,
}: {
  work: Artwork;
  img: ArtworkImage;
  idx: number;
  selectedImageIndex: number;
  layoutMetrics: ArtworkLayoutMetrics;
  explicitDimensions: CSSProperties;
  knownAspectRatio?: number;
  imageFrameRef: RefObject<(HTMLDivElement | null)[]>;
  hasTouchRef: RefObject<boolean>;
  zoomPos: { x: number; y: number };
  isZooming: boolean;
  setIsZooming: (value: boolean) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onImageDimensions: (idx: number, naturalWidth: number, naturalHeight: number) => void;
  onOpenFullSize: () => void;
}) {
  return (
    <div
      style={{
        flex: "0 0 100%",
        width: "100%",
        height: layoutMetrics.winW < 768 ? "auto" : "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        className="artwork-frame"
        ref={(el) => {
          imageFrameRef.current[idx] = el;
        }}
        onPointerEnter={(e) => {
          if (!hasTouchRef.current && e.pointerType === "mouse" && window.innerWidth > 768) {
            setIsZooming(true);
          }
        }}
        onPointerLeave={(e) => {
          if (!hasTouchRef.current && e.pointerType === "mouse") setIsZooming(false);
        }}
        onPointerMove={onPointerMove}
        onClick={() => {
          setIsZooming(false);
          onOpenFullSize();
        }}
        style={{
          display: "flex",
          position: "relative",
          overflow: "hidden",
          borderRadius: "4px",
          boxShadow: "var(--shadow-card-deep)",
          cursor: "crosshair",
          ...explicitDimensions,
        }}
      >
        <img
          src={getImageUrl(img, "medium")}
          alt={work.title}
          loading={idx === 0 ? "eager" : "lazy"}
          onLoad={(e) =>
            onImageDimensions(
              idx,
              e.currentTarget.naturalWidth,
              e.currentTarget.naturalHeight,
            )
          }
          ref={(el) => {
            if (el && el.complete && el.naturalWidth > 0 && !knownAspectRatio) {
              onImageDimensions(idx, el.naturalWidth, el.naturalHeight);
            }
          }}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: explicitDimensions.width ? "100%" : "auto",
            height: explicitDimensions.height ? "100%" : "auto",
            objectFit: "contain",
            transform:
              isZooming && selectedImageIndex === idx ? "scale(2.5)" : "scale(1)",
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transition: isZooming ? "none" : "transform 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
