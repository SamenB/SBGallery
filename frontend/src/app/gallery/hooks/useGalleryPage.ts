"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import { useUser } from "@/context/UserContext";
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
  const [visibleCount, setVisibleCount] = useState(12);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const itemsPerPage = gridMode === "3" ? 36 : gridMode === "2" ? 24 : 12;

  /* ── Infinite scroll via window scroll events ──
   *
   * IntersectionObserver was unreliable on mobile browsers (callback
   * wouldn't re-fire after React re-renders). A plain scroll listener
   * with rAF throttle + a post-render re-check is simple and bulletproof.
   */
  const totalRef = useRef(0);
  const pageRef = useRef(itemsPerPage);
  totalRef.current = allArtworks.length;
  pageRef.current = itemsPerPage;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);

  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node;
  }, []);

  /** True when the sentinel is within ~600px of the viewport bottom */
  const isSentinelNear = useCallback(() => {
    const el = sentinelRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight + 600;
    }
    // Fallback: check if user is near the bottom of the document
    const scrollY = window.scrollY ?? window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight;
    const viewH = window.innerHeight;
    return docHeight - scrollY - viewH < 600;
  }, []);

  const maybeLoadMore = useCallback(() => {
    if (!isSentinelNear()) return;
    setVisibleCount((prev) => {
      if (prev >= totalRef.current) return prev;
      return prev + pageRef.current;
    });
  }, [isSentinelNear]);

  // Scroll listener with rAF throttle
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(maybeLoadMore);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [maybeLoadMore]);

  // After visibleCount changes, the sentinel may still be near the viewport
  // (e.g. small batch sizes on large screens). Re-check after the browser
  // has painted the new items so we chain-load if needed.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(maybeLoadMore);
    });
    return () => cancelAnimationFrame(id);
  }, [visibleCount, maybeLoadMore]);

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

  useEffect(() => {
    setVisibleCount((prev) => Math.max(prev, itemsPerPage));
  }, [itemsPerPage]);

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
