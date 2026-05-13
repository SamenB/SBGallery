"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/app/shop/components/ProductCard";
import { IMAGE_ZONE } from "@/app/shop/constants";
import { getEqualAreaImageSize, getProductAspectRatio } from "@/app/shop/utils";
import type { AspectRatioRange } from "@/app/shop/utils";
import type { Product } from "@/app/shop/types";
import {
  getShopColumnCount,
  getShopGridColumns,
  getShopGridGap,
} from "@/app/shop/utils/shopGridLayout";

interface RecentPaintingsGridProps {
  works: Product[];
}

const MOBILE_ARTWORK_VISUAL_GAP_PX = 18;
const MOBILE_ARTWORK_FALLBACK_GAP = "0.7rem";

export default function RecentPaintingsGrid({ works }: RecentPaintingsGridProps) {
  const [naturalAspectRatios, setNaturalAspectRatios] = useState<Record<number, number>>({});
  const [containerWidths, setContainerWidths] = useState<Record<number, number>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollStopped = useRef(false);

  useEffect(() => {
    const syncViewport = () => {
      const w = window.innerWidth;
      setIsMobile(w < 1024);
      setIsPhone(w < 768);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  // Desktop: gridMode "2" → 3 columns (matches shop default).
  // Mobile phone: gridMode "1" → single-column horizontal scroll.
  const gridMode = isPhone ? "1" : "2";
  const zoneH = IMAGE_ZONE[gridMode] || 380;
  const columnCount = isPhone ? 1 : getShopColumnCount({ isMobile, isPhone, gridMode });
  const gridColumns = getShopGridColumns(columnCount);
  const gridGap = getShopGridGap({ isMobile, isPhone, gridMode });

  const artworkAxisAspectRatioRange = useMemo(() => {
    const ratios = works
      .map((work) => getProductAspectRatio(work, naturalAspectRatios[work.id]))
      .filter((ratio): ratio is number => ratio !== null);

    if (ratios.length === 0) return undefined;

    const measuredContainerWidths = works
      .map((work) => containerWidths[work.id])
      .filter((width): width is number => Boolean(width));

    return {
      min: Math.min(...ratios),
      max: Math.max(...ratios),
      containerWidth:
        measuredContainerWidths.length > 0
          ? Math.min(...measuredContainerWidths)
          : undefined,
    } satisfies AspectRatioRange;
  }, [containerWidths, naturalAspectRatios, works]);

  const fixedImageStageHeight = useMemo(() => {
    if (!artworkAxisAspectRatioRange?.containerWidth) return undefined;

    const maxImageHeight = Math.max(
      ...works.map((work) => {
        const size = getEqualAreaImageSize({
          product: work,
          containerWidth: artworkAxisAspectRatioRange.containerWidth ?? 0,
          zoneHeight: zoneH,
          isMobile,
          rowAspectRatioRange: artworkAxisAspectRatioRange,
          naturalAspectRatio: naturalAspectRatios[work.id],
          maxWidthRatio: 1,
        });
        return size?.height ?? 0;
      }),
    );

    if (maxImageHeight <= 0) return undefined;

    return Math.min(zoneH, Math.ceil(maxImageHeight + (isMobile ? 20 : 28)));
  }, [artworkAxisAspectRatioRange, isMobile, naturalAspectRatios, works, zoneH]);

  const imageWidthsById = useMemo(() => {
    if (!artworkAxisAspectRatioRange?.containerWidth) return {};

    return works.reduce<Record<number, number>>((acc, work) => {
      const size = getEqualAreaImageSize({
        product: work,
        containerWidth:
          containerWidths[work.id] ?? artworkAxisAspectRatioRange.containerWidth ?? 0,
        zoneHeight: zoneH,
        isMobile,
        rowAspectRatioRange: artworkAxisAspectRatioRange,
        naturalAspectRatio: naturalAspectRatios[work.id],
        maxWidthRatio: 1,
      });

      if (size?.width) {
        acc[work.id] = size.width;
      }

      return acc;
    }, {});
  }, [artworkAxisAspectRatioRange, containerWidths, isMobile, naturalAspectRatios, works, zoneH]);

  // Gentle auto-scroll on mobile — stops permanently on first touch
  useEffect(() => {
    if (!isPhone) return;
    const el = scrollRef.current;
    if (!el) return;

    const stopAutoScroll = () => {
      autoScrollStopped.current = true;
      el.removeEventListener("touchstart", stopAutoScroll);
      el.removeEventListener("pointerdown", stopAutoScroll);
    };

    el.addEventListener("touchstart", stopAutoScroll, { passive: true });
    el.addEventListener("pointerdown", stopAutoScroll);

    let raf: number;
    const speed = 0.4;

    const tick = () => {
      if (autoScrollStopped.current) return;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 1) {
        autoScrollStopped.current = true;
        return;
      }
      el.scrollLeft += speed;
      raf = requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => {
      if (!autoScrollStopped.current) {
        raf = requestAnimationFrame(tick);
      }
    }, 1500);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      el.removeEventListener("touchstart", stopAutoScroll);
      el.removeEventListener("pointerdown", stopAutoScroll);
    };
  }, [isPhone]);

  const handleNaturalAspectRatio = useCallback((id: number, ratio: number) => {
    setNaturalAspectRatios((prev) => {
      if (prev[id] === ratio) return prev;
      return { ...prev, [id]: ratio };
    });
  }, []);

  const handleContainerWidthChange = useCallback((id: number, width: number) => {
    setContainerWidths((prev) => {
      if (prev[id] === width) return prev;
      return { ...prev, [id]: width };
    });
  }, []);

  const getMobileItemMarginRight = useCallback(
    (index: number) => {
      if (!isPhone || index >= works.length - 1) return undefined;

      const current = works[index];
      const next = works[index + 1];
      if (!current || !next) return undefined;

      const currentContainerWidth =
        containerWidths[current.id] ?? artworkAxisAspectRatioRange?.containerWidth;
      const nextContainerWidth =
        containerWidths[next.id] ?? artworkAxisAspectRatioRange?.containerWidth;
      const currentImageWidth = imageWidthsById[current.id];
      const nextImageWidth = imageWidthsById[next.id];

      if (
        !currentContainerWidth ||
        !nextContainerWidth ||
        !currentImageWidth ||
        !nextImageWidth
      ) {
        return MOBILE_ARTWORK_FALLBACK_GAP;
      }

      const currentBlankRight = Math.max(0, (currentContainerWidth - currentImageWidth) / 2);
      const nextBlankLeft = Math.max(0, (nextContainerWidth - nextImageWidth) / 2);
      const marginRight =
        MOBILE_ARTWORK_VISUAL_GAP_PX - currentBlankRight - nextBlankLeft;

      return `${Math.round(marginRight)}px`;
    },
    [artworkAxisAspectRatioRange, containerWidths, imageWidthsById, isPhone, works],
  );

  // On mobile phones: horizontal scroll with peek. Otherwise: shop-identical grid.
  if (isPhone) {
    return (
      <div ref={scrollRef} className="recent-paintings-scroll">
        <div className="recent-paintings-spacer" aria-hidden="true" />
        {works.map((work, index) => (
          <div
            key={work.id}
            className="recent-paintings-item"
            data-snap-align={index === 1 ? "center" : "start"}
            style={{
              marginRight: getMobileItemMarginRight(index),
            }}
          >
            <ProductCard
              product={work}
              zoneH={zoneH}
              gridMode={gridMode}
              isMobile={isMobile}
              listIndex={index}
              rowAspectRatioRange={artworkAxisAspectRatioRange}
              fixedImageStageHeight={fixedImageStageHeight}
              onNaturalAspectRatio={handleNaturalAspectRatio}
              onContainerWidthChange={handleContainerWidthChange}
            />
          </div>
        ))}
        <div className="recent-paintings-spacer" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: gridGap,
        alignItems: "start",
      }}
    >
      {works.map((work, index) => (
        <ProductCard
          key={work.id}
          product={work}
          zoneH={zoneH}
          gridMode={gridMode}
          isMobile={isMobile}
          listIndex={index}
          rowAspectRatioRange={artworkAxisAspectRatioRange}
          fixedImageStageHeight={fixedImageStageHeight}
          onNaturalAspectRatio={handleNaturalAspectRatio}
          onContainerWidthChange={handleContainerWidthChange}
        />
      ))}
    </div>
  );
}
