"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getImageUrl } from "@/utils";
import {
  LightboxArrowButton,
  LightboxCloseButton,
  LightboxStyles,
} from "./LightboxControls";
import type { LightboxArtwork } from "./lightbox.types";
import { useLightboxController } from "./useLightboxController";

export default function Lightbox({
  works,
  startWorkIndex = 0,
  startImageIndex = 0,
  onClose,
}: {
  works: LightboxArtwork[];
  startWorkIndex?: number;
  startImageIndex?: number;
  onClose: () => void;
}) {
  const lightbox = useLightboxController({
    works,
    startWorkIndex,
    startImageIndex,
    onClose,
  });
  const currentImage = lightbox.images[lightbox.imageIdx];
  const headerRef = useRef<HTMLDivElement>(null);
  const artworkVisualRef = useRef<HTMLElement | null>(null);
  const [titleOverlapsArtwork, setTitleOverlapsArtwork] = useState(false);

  const measureTitleOverlap = useCallback(() => {
    const header = headerRef.current;
    const artwork = artworkVisualRef.current;
    if (!header || !artwork || window.innerWidth < 768) {
      setTitleOverlapsArtwork(false);
      return;
    }

    const headerRect = header.getBoundingClientRect();
    const artworkRect = artwork.getBoundingClientRect();
    const margin = 14;
    const overlaps =
      headerRect.left < artworkRect.right + margin &&
      headerRect.right > artworkRect.left - margin &&
      headerRect.top < artworkRect.bottom + margin &&
      headerRect.bottom > artworkRect.top - margin;

    setTitleOverlapsArtwork(overlaps);
  }, []);

  const setArtworkVisualRef = useCallback(
    (node: HTMLElement | null) => {
      artworkVisualRef.current = node;
      measureTitleOverlap();
    },
    [measureTitleOverlap],
  );

  useEffect(() => {
    const frameId = requestAnimationFrame(measureTitleOverlap);
    window.addEventListener("resize", measureTitleOverlap);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measureTitleOverlap);
    };
  }, [currentImage, lightbox.imageIdx, lightbox.work.title, measureTitleOverlap]);

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden backdrop-blur-[2px]"
      onTouchStart={lightbox.handleOuterTouchStart}
      onTouchEnd={lightbox.handleOuterTouchEnd}
      style={{ backgroundColor: "rgba(7, 10, 22, 0.9)" }}
    >
      <div
        ref={headerRef}
        className="lb-header"
        style={{
          opacity: lightbox.zoom > 1 || titleOverlapsArtwork ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <h2
          className="lb-title m-0 font-normal not-italic text-white/95"
          style={{ fontFamily: "var(--font-artwork-title)" }}
        >
          {lightbox.work.title}
        </h2>
      </div>

      <div
        ref={lightbox.imgRef}
        className="flex h-screen w-screen select-none items-center justify-center"
        {...lightbox.imageHandlers}
        style={{
          cursor:
            lightbox.zoom > 1
              ? lightbox.dragRef.current
                ? "grabbing"
                : "grab"
              : "default",
          transform: `scale(${lightbox.zoom}) translate(${lightbox.pan.x / lightbox.zoom}px, ${lightbox.pan.y / lightbox.zoom}px)`,
          transformOrigin: `${lightbox.origin.x}% ${lightbox.origin.y}%`,
          transition:
            lightbox.pinchRef.current || lightbox.dragRef.current
              ? "none"
              : "transform 0.12s ease",
          touchAction: "none",
        }}
      >
        {currentImage ? (
          <img
            ref={setArtworkVisualRef}
            className="lb-artwork-visual block bg-white object-contain shadow-[0_40px_90px_rgba(0,0,0,0.35),0_10px_30px_rgba(0,0,0,0.12)]"
            src={getImageUrl(currentImage, "original")}
            alt={lightbox.work.title}
            draggable={false}
            onLoad={measureTitleOverlap}
          />
        ) : (
          <div
            ref={setArtworkVisualRef}
            className="lb-artwork-visual h-[94vh] max-h-[800px] shadow-[0_40px_90px_rgba(0,0,0,0.35),0_10px_30px_rgba(0,0,0,0.12)]"
            style={{
              background: `linear-gradient(160deg, ${lightbox.work.gradientFrom} 0%, ${lightbox.work.gradientTo} 100%)`,
            }}
          />
        )}
      </div>

      <LightboxCloseButton onClose={onClose} />
      {lightbox.canNav ? (
        <>
          <LightboxArrowButton direction="prev" onClick={lightbox.handlePrev} />
          <LightboxArrowButton direction="next" onClick={lightbox.handleNext} />
        </>
      ) : null}
      <LightboxStyles />
    </div>
  );
}
