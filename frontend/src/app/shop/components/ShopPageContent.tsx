"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import { useUser } from "@/context/UserContext";
import { useInfiniteVisibleCount } from "@/hooks/useInfiniteVisibleCount";
import { getApiUrl, apiFetch } from "@/utils";
import { SORT_OPTIONS } from "../constants";
import { getProductAspectRatio, sortProducts } from "../utils";
import { useShopCatalog } from "../hooks/useShopCatalog";
import { useShopCountry } from "../hooks/useShopCountry";
import { useShopFilters } from "../hooks/useShopFilters";
import { useShopViewport } from "../hooks/useShopViewport";
import { ShopAuthPrompt } from "./ShopAuthPrompt";
import { ShopCatalogResults } from "./ShopCatalogResults";
import { ShopDesktopFiltersSidebar } from "./ShopDesktopFiltersSidebar";
import { ShopFiltersPanel } from "./ShopFiltersPanel";
import { ShopMobileFiltersDrawer } from "./ShopMobileFiltersDrawer";
import { ShopToolbar } from "./ShopToolbar";
import {
  getShopCardMaxWidth,
  getShopColumnCount,
  getShopGridColumns,
  getShopGridGap,
} from "../utils/shopGridLayout";

const DESKTOP_FILTERS_COLLAPSED_KEY = "artshop_shop_filters_collapsed_pc";

export function ShopPageContent() {
  const { user } = useUser();
  const { activeCountryCode, searchParams } = useShopCountry();
  const { isMobile, isPhone } = useShopViewport();
  const { allProducts, categories, labels, loading, error } =
    useShopCatalog(activeCountryCode);

  const [likedIds, setLikedIds] = useState<Set<number> | undefined>(undefined);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const [sortIdx, setSortIdx] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [desktopFiltersCollapsed, setDesktopFiltersCollapsed] = useState(false);
  const [gridMode, setGridMode] = useState<"1" | "2" | "3">("2");
  const [gridLoaded, setGridLoaded] = useState(false);
  const [naturalAspectRatios, setNaturalAspectRatios] = useState<
    Record<number, number>
  >({});
  const [artworkContainerWidths, setArtworkContainerWidths] = useState<
    Record<number, number>
  >({});

  const {
    globalPrintPrice,
    units,
    pendingLikes,
    addPendingLike,
    removePendingLike,
    unauthLikeCount,
    incrementUnauthLikeCount,
  } = usePreferences();
  const itemsPerPage = gridMode === "3" ? 36 : gridMode === "2" ? 24 : 12;

  useEffect(() => {
    const saved = localStorage.getItem("artshop_shop_grid");
    if (saved === "1" || saved === "2" || saved === "3") {
      setGridMode(saved);
    }
    setGridLoaded(true);
  }, []);

  useEffect(() => {
    if (gridLoaded) {
      localStorage.setItem("artshop_shop_grid", gridMode);
    }
  }, [gridMode, gridLoaded]);

  useEffect(() => {
    const saved = localStorage.getItem(DESKTOP_FILTERS_COLLAPSED_KEY);
    if (saved === "true") {
      setDesktopFiltersCollapsed(true);
    }
  }, []);

  const handleToggleDesktopFilters = useCallback(() => {
    setDesktopFiltersCollapsed((previous) => {
      const next = !previous;
      localStorage.setItem(DESKTOP_FILTERS_COLLAPSED_KEY, String(next));
      return next;
    });
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
  }, [pendingLikes, user]);

  useEffect(() => {
    const mob = window.innerWidth < 1024;
    const storageKey = mob
      ? "artshop_shop_gridMode_mobile"
      : "artshop_shop_gridMode_pc";
    const saved = sessionStorage.getItem(storageKey) as "1" | "2" | "3" | null;
    if (saved === "1" || saved === "2" || saved === "3") {
      setGridMode(saved);
    } else {
      setGridMode(mob ? "1" : "2");
    }
  }, [isMobile]);

  const handleSetGridMode = (val: "1" | "2" | "3") => {
    setGridMode(val);
    const storageKey = isMobile
      ? "artshop_shop_gridMode_mobile"
      : "artshop_shop_gridMode_pc";
    sessionStorage.setItem(storageKey, val);
  };

  const effectiveLikedIds = useMemo(
    () => (user ? likedIds : new Set(pendingLikes)),
    [likedIds, pendingLikes, user],
  );
  const {
    state: filters,
    actions: filterActions,
    bounds,
    availableYears,
    filtered,
    activeFilterCount,
  } = useShopFilters({
    allProducts,
    effectiveLikedIds,
    initialLiked: searchParams.get("liked") === "true",
    units,
  });

  const paginationResetKey = useMemo(
    () =>
      [
        activeCountryCode,
        sortIdx,
        gridMode,
        units,
        filters.filterLiked ? "liked" : "all",
        filters.categoryFilter.join(","),
        filters.priceMin,
        filters.priceMax,
        filters.widthMin,
        filters.widthMax,
        filters.heightMin,
        filters.heightMax,
        filters.activeYears.join(","),
        filters.activeOrientations.join(","),
        filters.activeLabels.join(","),
      ].join("|"),
    [
      activeCountryCode,
      filters.activeLabels,
      filters.activeOrientations,
      filters.activeYears,
      filters.categoryFilter,
      filters.filterLiked,
      filters.heightMax,
      filters.heightMin,
      filters.priceMax,
      filters.priceMin,
      filters.widthMax,
      filters.widthMin,
      gridMode,
      sortIdx,
      units,
    ],
  );

  const { visibleCount, loadMoreRef } = useInfiniteVisibleCount<HTMLDivElement>({
    totalCount: filtered.length,
    pageSize: itemsPerPage,
    resetKey: paginationResetKey,
    preloadDistance: isMobile ? 1200 : 900,
    enabled: !loading && !error,
  });

  /** Updates pending likes locally, and occasionally prompts the user. */
  const handleAuthRequired = (id: number, isLiked: boolean) => {
    if (isLiked) {
      addPendingLike(id);
    } else {
      removePendingLike(id);
    }

    incrementUnauthLikeCount();
    const nextCount = unauthLikeCount + 1;

    // Display the auth prompt on the 1st like, and then every 3rd like (4th, 7th...)
    if ((nextCount - 1) % 3 === 0) {
      setTimeout(() => setShowAuthPrompt(true), 1000);
    }
  };

  /** Synchronizes like state from child to parent, useful for live filtering. */
  const handleLikeChange = useCallback((id: number, isLiked: boolean) => {
    setLikedIds((prev) => {
      const next = new Set(prev || []);
      if (isLiked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleNaturalAspectRatio = useCallback((id: number, ratio: number) => {
    setNaturalAspectRatios((prev) => {
      if (prev[id] === ratio) {
        return prev;
      }
      return { ...prev, [id]: ratio };
    });
  }, []);

  const handleContainerWidthChange = useCallback(
    (id: number, width: number) => {
      setArtworkContainerWidths((prev) => {
        if (prev[id] === width) {
          return prev;
        }
        return { ...prev, [id]: width };
      });
    },
    [],
  );

  /** Final sorted results for exhibition, respecting pagination and display limits. */
  const displayed = useMemo(() => {
    return sortProducts(
      filtered,
      SORT_OPTIONS[sortIdx].key,
      globalPrintPrice,
    ).slice(0, visibleCount);
  }, [filtered, sortIdx, visibleCount, globalPrintPrice]);

  /** Calculate the total number of active filters to show count badges on mobile. */
  const clearAll = filterActions.clearAll;

  const columnCount = getShopColumnCount({ isMobile, isPhone, gridMode });
  const gridColumns = getShopGridColumns(columnCount);
  const gridGap = getShopGridGap({ isMobile, isPhone, gridMode });
  const cardMaxWidth = getShopCardMaxWidth({ isMobile, gridMode });
  const displayedAspectRatioRange = useMemo(() => {
    const ratios = displayed
      .map((product) =>
        getProductAspectRatio(product, naturalAspectRatios[product.id]),
      )
      .filter((ratio): ratio is number => ratio !== null);

    if (ratios.length === 0) {
      return undefined;
    }

    return {
      min: Math.min(...ratios),
      max: Math.max(...ratios),
    };
  }, [displayed, naturalAspectRatios]);
  const rowImageStageHeights = useMemo(() => {
    if (!isMobile || gridMode === "1") {
      return undefined;
    }

    return displayed.map((_, index) => {
      const rowStart = Math.floor(index / columnCount) * columnCount;
      const rowProducts = displayed.slice(rowStart, rowStart + columnCount);
      const rowHeights = rowProducts
        .map((product) => {
          const width = artworkContainerWidths[product.id];
          const ratio = getProductAspectRatio(product, naturalAspectRatios[product.id]);
          return width && ratio ? width / ratio : null;
        })
        .filter((height): height is number => height !== null && Number.isFinite(height));

      return rowHeights.length ? Math.ceil(Math.max(...rowHeights)) : undefined;
    });
  }, [artworkContainerWidths, columnCount, displayed, gridMode, isMobile, naturalAspectRatios]);

  const filtersPanel = (
    <ShopFiltersPanel
      isMobile={isMobile}
      filterLiked={filters.filterLiked}
      setFilterLiked={filterActions.setFilterLiked}
      categoryFilter={filters.categoryFilter}
      setCategoryFilter={filterActions.setCategoryFilter}
      priceMin={filters.priceMin}
      priceMax={filters.priceMax}
      setPriceMin={filterActions.setPriceMin}
      setPriceMax={filterActions.setPriceMax}
      units={units}
      wGlobalMin={bounds.wGlobalMin}
      wGlobalMax={bounds.wGlobalMax}
      widthMin={filters.widthMin}
      widthMax={filters.widthMax}
      setWidthMin={filterActions.setWidthMin}
      setWidthMax={filterActions.setWidthMax}
      hGlobalMin={bounds.hGlobalMin}
      hGlobalMax={bounds.hGlobalMax}
      heightMin={filters.heightMin}
      heightMax={filters.heightMax}
      setHeightMin={filterActions.setHeightMin}
      setHeightMax={filterActions.setHeightMax}
      availableYears={availableYears}
      activeYears={filters.activeYears}
      setActiveYears={filterActions.setActiveYears}
      activeOrientations={filters.activeOrientations}
      setActiveOrientations={filterActions.setActiveOrientations}
      categories={categories}
      labels={labels}
      activeLabels={filters.activeLabels}
      setActiveLabels={filterActions.setActiveLabels}
    />
  );

  // Initial page load: Reset scroll to provide a consistent entrance to the catalog.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  return (
    <div
      className="premium-texture-bg"
      style={{ color: "var(--color-charcoal)", minHeight: "100vh" }}
    >
      <ShopMobileFiltersDrawer
        open={drawerOpen}
        activeFilterCount={activeFilterCount}
        resultCount={filtered.length}
        onClose={() => setDrawerOpen(false)}
        onClearAll={clearAll}
      >
        {filtersPanel}
      </ShopMobileFiltersDrawer>

      <div style={{ display: "flex", gap: "0", alignItems: "flex-start" }}>
        <ShopDesktopFiltersSidebar
          collapsed={desktopFiltersCollapsed}
          activeFilterCount={activeFilterCount}
          onClearAll={clearAll}
        >
          {filtersPanel}
        </ShopDesktopFiltersSidebar>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: isMobile
              ? "0.75rem 0.35rem 6rem"
              : "1rem 2.5rem 6rem 2rem",
            transition: "padding-left 0.42s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <ShopToolbar
            resultCount={filtered.length}
            activeFilterCount={activeFilterCount}
            isMobile={isMobile}
            desktopFiltersCollapsed={desktopFiltersCollapsed}
            gridMode={gridMode}
            sortIdx={sortIdx}
            onOpenFilters={() => setDrawerOpen(true)}
            onToggleDesktopFilters={handleToggleDesktopFilters}
            onGridModeChange={handleSetGridMode}
            onSortChange={setSortIdx}
          />

          <ShopCatalogResults
            loading={loading}
            error={error}
            filteredCount={filtered.length}
            displayed={displayed}
            gridColumns={gridColumns}
            gridGap={gridGap}
            cardMaxWidth={cardMaxWidth}
            layoutVersion={desktopFiltersCollapsed ? "filters-collapsed" : "filters-open"}
            gridMode={gridMode}
            isMobile={isMobile}
            countryCode={activeCountryCode}
            likedIds={effectiveLikedIds}
            imageAspectRatioRange={displayedAspectRatioRange}
            rowImageStageHeights={rowImageStageHeights}
            visibleCount={visibleCount}
            loadMoreRef={loadMoreRef}
            onClearAll={clearAll}
            onAuthRequired={!user ? handleAuthRequired : undefined}
            onLikeChange={handleLikeChange}
            onNaturalAspectRatio={handleNaturalAspectRatio}
            onContainerWidthChange={handleContainerWidthChange}
          />
        </div>
      </div>
      <ShopAuthPrompt
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
      />
    </div>
  );
}
