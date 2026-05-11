"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/app/shop/components/ProductCard";
import { IMAGE_ZONE } from "@/app/shop/constants";
import { getProductAspectRatio } from "@/app/shop/utils";
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

export default function RecentPaintingsGrid({ works }: RecentPaintingsGridProps) {
  const [naturalAspectRatios, setNaturalAspectRatios] = useState<Record<number, number>>({});
  const [containerWidths, setContainerWidths] = useState<Record<number, number>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollStopped = useRef(false);

  useEffect(() => {
    const w = window.innerWidth;
    setIsMobile(w < 1024);
    setIsPhone(w < 768);
  }, []);

  // Desktop: gridMode "2" → 3 columns (matches shop default).
  // Mobile phone: gridMode "1" → single-column horizontal scroll.
  const gridMode = isPhone ? "1" : "2";
  const zoneH = IMAGE_ZONE[gridMode] || 380;
  const columnCount = isPhone ? 1 : getShopColumnCount({ isMobile, isPhone, gridMode });
  const gridColumns = getShopGridColumns(columnCount);
  const gridGap = getShopGridGap({ isMobile, isPhone, gridMode });

  // Exact same row-based aspect-ratio range computation as ShopPageContent
  const rowAspectRatioRanges = useMemo(() => {
    return works.map((_, index) => {
      const rowStart = Math.floor(index / columnCount) * columnCount;
      const rowProducts = works.slice(rowStart, rowStart + columnCount);
      const ratios = rowProducts
        .map((w) => getProductAspectRatio(w, naturalAspectRatios[w.id]))
        .filter((ratio): ratio is number => ratio !== null);

      if (ratios.length === 0) return undefined;

      const rowContainerWidthValues = rowProducts
        .map((w) => containerWidths[w.id])
        .filter((width): width is number => Boolean(width));

      return {
        min: Math.min(...ratios),
        max: Math.max(...ratios),
        containerWidth: rowContainerWidthValues.length > 0
          ? Math.min(...rowContainerWidthValues)
          : undefined,
      } satisfies AspectRatioRange;
    });
  }, [columnCount, containerWidths, naturalAspectRatios, works]);

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

  // On mobile phones: horizontal scroll with peek. Otherwise: shop-identical grid.
  if (isPhone) {
    return (
      <div ref={scrollRef} className="recent-paintings-scroll">
        <div className="recent-paintings-spacer" aria-hidden="true" />
        {works.map((work, index) => (
          <div key={work.id} className="recent-paintings-item">
            <ProductCard
              product={work}
              zoneH={zoneH}
              gridMode={gridMode}
              isMobile={isMobile}
              listIndex={index}
              rowAspectRatioRange={rowAspectRatioRanges[index]}
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
          rowAspectRatioRange={rowAspectRatioRanges[index]}
          onNaturalAspectRatio={handleNaturalAspectRatio}
          onContainerWidthChange={handleContainerWidthChange}
        />
      ))}
    </div>
  );
}
