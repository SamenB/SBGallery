"use client";

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

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden bg-[#4D4E5C]"
      onTouchStart={lightbox.handleOuterTouchStart}
      onTouchEnd={lightbox.handleOuterTouchEnd}
    >
      <div
        className="lb-header"
        style={{
          opacity: lightbox.zoom > 1 ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <h2 className="lb-title m-0 font-[var(--font-artwork-title)] font-normal not-italic text-white/95">
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
            className="block max-h-[94vh] max-w-[94vw] bg-white object-contain shadow-[0_40px_90px_rgba(0,0,0,0.35),0_10px_30px_rgba(0,0,0,0.12)]"
            src={getImageUrl(currentImage, "original")}
            alt={lightbox.work.title}
            draggable={false}
          />
        ) : (
          <div
            className="h-[94vh] max-h-[800px] w-[94vw] max-w-[800px] shadow-[0_40px_90px_rgba(0,0,0,0.35),0_10px_30px_rgba(0,0,0,0.12)]"
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
