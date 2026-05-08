import { useCallback, useEffect, useRef, useState } from "react";
import type { LightboxArtwork } from "./lightbox.types";
import { getTouchCenter, getTouchDist } from "./lightbox.utils";

export function useLightboxController({
  works,
  startWorkIndex,
  startImageIndex,
  onClose,
}: {
  works: LightboxArtwork[];
  startWorkIndex: number;
  startImageIndex: number;
  onClose: () => void;
}) {
  const [wIdx, setWIdx] = useState(startWorkIndex);
  const [imageIdx, setImageIdx] = useState(startImageIndex);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const work = works[wIdx];
  const images = work.images || [];
  const dragRef = useRef<{
    sx: number;
    sy: number;
    px: number;
    py: number;
  } | null>(null);
  const pinchRef = useRef<{
    dist: number;
    zoom: number;
    cx: number;
    cy: number;
  } | null>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const tapRef = useRef(0);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setOrigin({ x: 50, y: 50 });
  }, [wIdx, imageIdx]);

  const applyZoom = useCallback((newZoom: number, ox = 50, oy = 50) => {
    const clamped = Math.max(1, Math.min(newZoom, 8));
    setZoom((previous) => {
      if (clamped === 1) {
        setPan({ x: 0, y: 0 });
        setOrigin({ x: 50, y: 50 });
      } else if (previous === 1 && clamped > 1) {
        setOrigin({ x: ox, y: oy });
      }
      return clamped;
    });
  }, []);

  const handlePrev = useCallback(() => {
    if (works.length > 1) {
      setWIdx((index) => (index - 1 + works.length) % works.length);
      setImageIdx(0);
    } else if (images.length > 1) {
      setImageIdx((index) => (index - 1 + images.length) % images.length);
    }
  }, [images.length, works.length]);

  const handleNext = useCallback(() => {
    if (works.length > 1) {
      setWIdx((index) => (index + 1) % works.length);
      setImageIdx(0);
    } else if (images.length > 1) {
      setImageIdx((index) => (index + 1) % images.length);
    }
  }, [images.length, works.length]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") handlePrev();
      if (event.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const element = imgRef.current;
    if (!element) return;
    const preventTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };
    const preventWheel = (event: WheelEvent) => {
      if (!(event.target as HTMLElement).closest(".lb-details"))
        event.preventDefault();
    };
    element.addEventListener("touchmove", preventTouch, { passive: false });
    document.addEventListener("wheel", preventWheel, { passive: false });
    return () => {
      element.removeEventListener("touchmove", preventTouch);
      document.removeEventListener("wheel", preventWheel);
    };
  }, []);

  const handleDoubleTap = useCallback(
    (clientX: number, clientY: number) => {
      if (zoom > 1) {
        applyZoom(1);
      } else {
        applyZoom(
          3,
          (clientX / window.innerWidth) * 100,
          (clientY / window.innerHeight) * 100,
        );
      }
    },
    [applyZoom, zoom],
  );

  const handleOuterTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches.length === 1 && zoom === 1)
        swipeRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
    },
    [zoom],
  );

  const handleOuterTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!swipeRef.current || zoom > 1) return;
      const dx = swipeRef.current.x - event.changedTouches[0].clientX;
      const dy = swipeRef.current.y - event.changedTouches[0].clientY;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 60) onClose();
      else if (dx > 48) handleNext();
      else if (dx < -48) handlePrev();
      swipeRef.current = null;
    },
    [handleNext, handlePrev, onClose, zoom],
  );

  const canNav = (images.length > 1 || works.length > 1) && zoom === 1;

  return {
    work,
    images,
    imageIdx,
    imgRef,
    dragRef,
    pinchRef,
    zoom,
    origin,
    pan,
    canNav,
    handlePrev,
    handleNext,
    handleOuterTouchStart,
    handleOuterTouchEnd,
    imageHandlers: {
      onWheel: (event: React.WheelEvent<HTMLDivElement>) => {
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        applyZoom(
          zoom + (event.deltaY > 0 ? -0.4 : 0.4),
          ((event.clientX - rect.left) / rect.width) * 100,
          ((event.clientY - rect.top) / rect.height) * 100,
        );
      },
      onDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        handleDoubleTap(event.clientX, event.clientY);
      },
      onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => {
        if (zoom <= 1) return;
        event.preventDefault();
        dragRef.current = {
          sx: event.clientX,
          sy: event.clientY,
          px: pan.x,
          py: pan.y,
        };
      },
      onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        setPan({
          x: dragRef.current.px + (event.clientX - dragRef.current.sx),
          y: dragRef.current.py + (event.clientY - dragRef.current.sy),
        });
      },
      onMouseUp: () => {
        dragRef.current = null;
      },
      onMouseLeave: () => {
        dragRef.current = null;
      },
      onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (event.touches.length === 2) {
          const center = getTouchCenter(event.touches);
          pinchRef.current = {
            dist: getTouchDist(event.touches),
            zoom,
            cx: (center.x / window.innerWidth) * 100,
            cy: (center.y / window.innerHeight) * 100,
          };
          dragRef.current = null;
          return;
        }
        pinchRef.current = null;
        if (zoom > 1)
          dragRef.current = {
            sx: event.touches[0].clientX,
            sy: event.touches[0].clientY,
            px: pan.x,
            py: pan.y,
          };
        else
          swipeRef.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };

        const now = Date.now();
        if (now - tapRef.current < 280) {
          handleDoubleTap(event.touches[0].clientX, event.touches[0].clientY);
          tapRef.current = 0;
        } else {
          tapRef.current = now;
        }
      },
      onTouchMove: (event: React.TouchEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (event.touches.length === 2 && pinchRef.current) {
          const scale = getTouchDist(event.touches) / pinchRef.current.dist;
          applyZoom(
            pinchRef.current.zoom * scale,
            pinchRef.current.cx,
            pinchRef.current.cy,
          );
        } else if (event.touches.length === 1 && dragRef.current && zoom > 1) {
          setPan({
            x:
              dragRef.current.px +
              (event.touches[0].clientX - dragRef.current.sx),
            y:
              dragRef.current.py +
              (event.touches[0].clientY - dragRef.current.sy),
          });
        }
      },
      onTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => {
        if (event.touches.length < 2) pinchRef.current = null;
        if (event.touches.length < 1) dragRef.current = null;
        if (
          swipeRef.current !== null &&
          zoom === 1 &&
          event.changedTouches.length === 1
        ) {
          const dx = swipeRef.current.x - event.changedTouches[0].clientX;
          const dy = swipeRef.current.y - event.changedTouches[0].clientY;
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 60) onClose();
          else if (dx > 48) handleNext();
          else if (dx < -48) handlePrev();
          swipeRef.current = null;
        }
      },
      onClick: (event: React.MouseEvent<HTMLDivElement>) =>
        event.stopPropagation(),
    },
  };
}
