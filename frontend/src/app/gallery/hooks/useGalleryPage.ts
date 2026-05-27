"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import { useUser } from "@/context/UserContext";
import { useInfiniteVisibleCount } from "@/hooks/useInfiniteVisibleCount";
import { apiFetch, getApiUrl } from "@/utils";
import { getProductAspectRatio } from "@/app/shop/utils";
import { IMAGE_ZONE } from "../constants";
import {
  getGalleryColumnCount,
  getGalleryGridColumns,
  getGalleryGridGap,
  getVisibleGalleryGroups,
  mapGalleryArtwork,
} from "../utils";
import {
  Artwork,
  GalleryGridMode,
  GalleryGroupBy,
  SortKey,
} from "../types";

interface ArtworkListResponse {
  items?: Artwork[];
  data?: Artwork[];
}

const isGalleryGridMode = (value: string | null): value is GalleryGridMode =>
  value === "1" || value === "2" || value === "3";

const DEFAULT_GALLERY_GRID_MODE: GalleryGridMode = "3";

const readArtworks = (payload: ArtworkListResponse | Artwork[]): Artwork[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

export function useGalleryPage() {
  const { user } = useUser();
  const {
    pendingLikes,
    addPendingLike,
    removePendingLike,
    unauthLikeCount,
    incrementUnauthLikeCount,
  } = usePreferences();
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [groupBy, setGroupBy] = useState<GalleryGroupBy>("collection");
  const [lightbox, setLightbox] = useState<{
    works: Artwork[];
    index: number;
  } | null>(null);
  const [gridMode, setGridMode] = useState<GalleryGridMode>(DEFAULT_GALLERY_GRID_MODE);
  const [isMobile, setIsMobile] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [naturalAspectRatios, setNaturalAspectRatios] = useState<
    Record<number, number>
  >({});
  const [artworkContainerWidths, setArtworkContainerWidths] = useState<
    Record<number, number>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const itemsPerPage = gridMode === "3" ? 36 : gridMode === "2" ? 24 : 12;

  // Shared progressive rendering: sentinel observer plus passive scroll fallback.
  const galleryPaginationResetKey = `${groupBy}|${sortKey}|${gridMode}`;
  const { visibleCount, loadMoreRef } = useInfiniteVisibleCount<HTMLDivElement>({
    totalCount: allArtworks.length,
    pageSize: itemsPerPage,
    resetKey: galleryPaginationResetKey,
    preloadDistance: isMobile ? 1200 : 900,
    enabled: !loading && !error,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      setIsPhone(width < 768);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const storageKey =
      window.innerWidth < 768
        ? "artshop_gallery_gridMode_mobile"
        : "artshop_gallery_gridMode_pc";
    const saved = sessionStorage.getItem(storageKey);
    setGridMode(isGalleryGridMode(saved) ? saved : DEFAULT_GALLERY_GRID_MODE);
  }, [isMobile]);

  useEffect(() => {
    apiFetch(`${getApiUrl()}/artworks?limit=1000&surface=gallery`)
      .then((res) => res.json())
      .then((payload: ArtworkListResponse | Artwork[]) => {
        const rawData = readArtworks(payload);
        if (!rawData.length) {
          setError("Unable to initialize archive structure.");
          return;
        }
        setAllArtworks(rawData.map(mapGalleryArtwork));
      })
      .catch((err: unknown) => {
        console.error("Archive data initialization failed:", err);
        setError("Archive data temporarily unavailable.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setLikedIds(new Set(pendingLikes));
      return;
    }
    apiFetch(`${getApiUrl()}/users/me/likes`)
      .then((r) => (r.ok ? r.json() : []))
      .then((items: { id: number }[]) => {
        setLikedIds(new Set(items.map((a) => a.id)));
      })
      .catch(() => setLikedIds(new Set()));
  }, [user, pendingLikes]);

  const handleSetGridMode = (val: GalleryGridMode) => {
    setGridMode(val);
    const storageKey = isMobile
      ? "artshop_gallery_gridMode_mobile"
      : "artshop_gallery_gridMode_pc";
    sessionStorage.setItem(storageKey, val);
  };

  const handleAuthRequired = (id: number, isLiked: boolean) => {
    if (isLiked) addPendingLike(id);
    else removePendingLike(id);
    incrementUnauthLikeCount();
    if (unauthLikeCount % 3 === 0) {
      setTimeout(() => setShowAuthPrompt(true), 1000);
    }
  };

  const handleLike = async (id: number, newState: boolean) => {
    try {
      if (newState) {
        await apiFetch(`${getApiUrl()}/users/me/likes/${id}`, {
          method: "POST",
        });
        setLikedIds((prev) => new Set(prev).add(id));
        return;
      }
      await apiFetch(`${getApiUrl()}/users/me/likes/${id}`, {
        method: "DELETE",
      });
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {}
  };

  const handleNaturalAspectRatio = useCallback((id: number, ratio: number) => {
    setNaturalAspectRatios((prev) =>
      prev[id] === ratio ? prev : { ...prev, [id]: ratio },
    );
  }, []);

  const handleContainerWidthChange = useCallback((id: number, width: number) => {
    setArtworkContainerWidths((prev) =>
      prev[id] === width ? prev : { ...prev, [id]: width },
    );
  }, []);

  const columnCount = getGalleryColumnCount(gridMode, isMobile, isPhone);
  const gridColumns = getGalleryGridColumns(columnCount);
  const gridGap = getGalleryGridGap(gridMode, isMobile);
  const visibleGroups = useMemo(
    () => getVisibleGalleryGroups(allArtworks, groupBy, sortKey, visibleCount),
    [allArtworks, groupBy, sortKey, visibleCount],
  );
  const effectiveLikedIds = user ? likedIds : new Set(pendingLikes);
  const visibleArtworks = useMemo(
    () => visibleGroups.flatMap((group) => group.works),
    [visibleGroups],
  );
  const visibleAspectRatioRange = useMemo(() => {
    const ratios = visibleArtworks
      .map((work) =>
        getProductAspectRatio(work, naturalAspectRatios[work.id]),
      )
      .filter((ratio): ratio is number => ratio !== null);

    if (!ratios.length) return undefined;

    const widths = visibleArtworks
      .map((work) => artworkContainerWidths[work.id])
      .filter((width): width is number => Boolean(width));

    return {
      min: Math.min(...ratios),
      max: Math.max(...ratios),
      containerWidth: widths.length ? Math.min(...widths) : undefined,
    };
  }, [artworkContainerWidths, naturalAspectRatios, visibleArtworks]);
  const getRowAspectRatioRange = useCallback(
    (works: Artwork[], index: number) => {
      if (!isMobile) {
        return visibleAspectRatioRange;
      }

      const rowStart = Math.floor(index / columnCount) * columnCount;
      const rowWorks = works.slice(rowStart, rowStart + columnCount);
      const ratios = rowWorks
        .map((work) =>
          getProductAspectRatio(work, naturalAspectRatios[work.id]),
        )
        .filter((ratio): ratio is number => ratio !== null);
      if (!ratios.length) return undefined;

      const widths = rowWorks
        .map((work) => artworkContainerWidths[work.id])
        .filter((width): width is number => Boolean(width));
      return {
        min: Math.min(...ratios),
        max: Math.max(...ratios),
        containerWidth: widths.length ? Math.min(...widths) : undefined,
      };
    },
    [artworkContainerWidths, columnCount, isMobile, naturalAspectRatios, visibleAspectRatioRange],
  );
  const getRowImageStageHeight = useCallback(
    (works: Artwork[], index: number) => {
      if (!isMobile || gridMode === "1") {
        return undefined;
      }

      const rowStart = Math.floor(index / columnCount) * columnCount;
      const rowWorks = works.slice(rowStart, rowStart + columnCount);
      const rowHeights = rowWorks
        .map((work) => {
          const width = artworkContainerWidths[work.id];
          const ratio = getProductAspectRatio(work, naturalAspectRatios[work.id]);
          return width && ratio ? width / ratio : null;
        })
        .filter((height): height is number => height !== null && Number.isFinite(height));

      return rowHeights.length ? Math.ceil(Math.max(...rowHeights)) : undefined;
    },
    [artworkContainerWidths, columnCount, gridMode, isMobile, naturalAspectRatios],
  );

  return {
    allArtworks,
    loading,
    error,
    sortKey,
    setSortKey,
    groupBy,
    setGroupBy,
    lightbox,
    setLightbox,
    gridMode,
    handleSetGridMode,
    isMobile,
    visibleGroups,
    visibleCount,
    loadMoreRef,
    gridColumns,
    gridGap,
    effectiveLikedIds,
    showAuthPrompt,
    setShowAuthPrompt,
    handleLike,
    handleAuthRequired,
    getRowAspectRatioRange,
    handleNaturalAspectRatio,
    handleContainerWidthChange,
    getRowImageStageHeight,
    imageZone: IMAGE_ZONE[gridMode] || 380,
  };
}
