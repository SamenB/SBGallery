"use client";

import { useCallback, useMemo, useState } from "react";
import { getProductAspectRatio } from "@/app/shop/utils";
import type { AspectRatioRange } from "@/app/shop/utils";
import HomeArtCard from "@/components/HomeArtCard";

interface RecentPainting {
  id: number;
  width_cm?: number;
  height_cm?: number;
  width_in?: number;
  height_in?: number;
}

interface RecentPaintingsGridProps {
  works: RecentPainting[];
}

export default function RecentPaintingsGrid({ works }: RecentPaintingsGridProps) {
  const [naturalAspectRatios, setNaturalAspectRatios] = useState<Record<number, number>>({});
  const [containerWidths, setContainerWidths] = useState<Record<number, number>>({});

  const handleNaturalAspectRatio = useCallback((id: number, ratio: number) => {
    setNaturalAspectRatios(prev => {
      if (prev[id] === ratio) {
        return prev;
      }
      return { ...prev, [id]: ratio };
    });
  }, []);

  const rowAspectRatioRange = useMemo<AspectRatioRange | undefined>(() => {
    const ratios = works
      .map(work => getProductAspectRatio(work, naturalAspectRatios[work.id]))
      .filter((ratio): ratio is number => ratio !== null);
    const measuredContainerWidths = works
      .map(work => containerWidths[work.id])
      .filter((width): width is number => Boolean(width));

    if (ratios.length === 0) {
      return undefined;
    }

    return {
      min: Math.min(...ratios),
      max: Math.max(...ratios),
      containerWidth: measuredContainerWidths.length > 0 ? Math.min(...measuredContainerWidths) : undefined,
    };
  }, [containerWidths, naturalAspectRatios, works]);

  const handleContainerWidthChange = useCallback((id: number, width: number) => {
    setContainerWidths(prev => {
      if (prev[id] === width) {
        return prev;
      }
      return { ...prev, [id]: width };
    });
  }, []);

  return (
    <div className="recent-paintings-scroll">
      <div className="recent-paintings-spacer" aria-hidden="true" />

      {works.map((work) => (
        <div key={work.id} className="recent-paintings-item">
          <HomeArtCard
            work={work}
            zoneH={360}
            rowAspectRatioRange={rowAspectRatioRange}
            onNaturalAspectRatio={handleNaturalAspectRatio}
            onContainerWidthChange={handleContainerWidthChange}
          />
        </div>
      ))}

      <div className="recent-paintings-spacer" aria-hidden="true" />
    </div>
  );
}
