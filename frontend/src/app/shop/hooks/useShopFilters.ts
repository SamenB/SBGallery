"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../types";
import { getOrientation } from "../utils";

export interface ShopFilterState {
  categoryFilter: string[];
  priceMin: number;
  priceMax: number;
  widthMin: number;
  widthMax: number;
  heightMin: number;
  heightMax: number;
  activeYears: number[];
  activeOrientations: string[];
  activeLabels: number[];
  filterLiked: boolean;
}

export function useShopFilters({
  allProducts,
  effectiveLikedIds,
  initialLiked,
  units,
}: {
  allProducts: Product[];
  effectiveLikedIds: Set<number> | undefined;
  initialLiked: boolean;
  units: "cm" | "in";
}) {
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(999999);
  const [widthMin, setWidthMin] = useState(0);
  const [widthMax, setWidthMax] = useState(0);
  const [heightMin, setHeightMin] = useState(0);
  const [heightMax, setHeightMax] = useState(0);
  const [activeYears, setActiveYears] = useState<number[]>([]);
  const [activeOrientations, setActiveOrientations] = useState<string[]>([]);
  const [activeLabels, setActiveLabels] = useState<number[]>([]);
  const [filterLiked, setFilterLiked] = useState(initialLiked);

  useEffect(() => {
    setFilterLiked(initialLiked);
  }, [initialLiked]);

  const getUnitVal = useCallback(
    (product: Product, measure: "width" | "height") => {
      if (units === "in") {
        const inchValue =
          measure === "width" ? product.width_in : product.height_in;
        if (inchValue !== undefined && inchValue !== null) return inchValue;
        const cmValue =
          (measure === "width" ? product.width_cm : product.height_cm) ?? 0;
        return Number((cmValue * 0.393701).toFixed(2));
      }
      return (measure === "width" ? product.width_cm : product.height_cm) ?? 0;
    },
    [units],
  );

  const prevUnitsRef = useRef(units);
  useEffect(() => {
    if (prevUnitsRef.current !== units) {
      prevUnitsRef.current = units;
      setWidthMin(0);
      setWidthMax(0);
      setHeightMin(0);
      setHeightMax(0);
    }
  }, [units]);

  const wGlobalMin = useMemo(
    () =>
      getMinDimension(allProducts, (product) => getUnitVal(product, "width")),
    [allProducts, getUnitVal],
  );
  const wGlobalMax = useMemo(
    () =>
      getMaxDimension(
        allProducts,
        (product) => getUnitVal(product, "width"),
        units === "in" ? 80 : 200,
      ),
    [allProducts, getUnitVal, units],
  );
  const hGlobalMin = useMemo(
    () =>
      getMinDimension(allProducts, (product) => getUnitVal(product, "height")),
    [allProducts, getUnitVal],
  );
  const hGlobalMax = useMemo(
    () =>
      getMaxDimension(
        allProducts,
        (product) => getUnitVal(product, "height"),
        units === "in" ? 80 : 200,
      ),
    [allProducts, getUnitVal, units],
  );

  useEffect(() => {
    if (wGlobalMin > 0 && widthMax === 0) {
      setWidthMin(wGlobalMin);
      setWidthMax(wGlobalMax);
    }
    if (hGlobalMin > 0 && heightMax === 0) {
      setHeightMin(hGlobalMin);
      setHeightMax(hGlobalMax);
    }
  }, [wGlobalMin, wGlobalMax, hGlobalMin, hGlobalMax, widthMax, heightMax]);

  const availableYears = useMemo(
    () =>
      [
        ...new Set(
          allProducts
            .map((product) => product.year)
            .filter((year): year is number => Boolean(year)),
        ),
      ].sort((a, b) => b - a),
    [allProducts],
  );

  const filtered = useMemo(() => {
    let list = allProducts;

    if (
      categoryFilter.includes("originals") &&
      !categoryFilter.includes("prints")
    ) {
      list = list.filter((product) => product.original_status === "available");
    } else if (
      categoryFilter.includes("prints") &&
      !categoryFilter.includes("originals")
    ) {
      list = list.filter((product) => product.has_prints);
    } else if (
      categoryFilter.includes("originals") &&
      categoryFilter.includes("prints")
    ) {
      list = list.filter(
        (product) =>
          product.original_status === "available" || product.has_prints,
      );
    }

    if (filterLiked) {
      if (!effectiveLikedIds) return [];
      list = list.filter((product) => effectiveLikedIds.has(product.id));
    }

    if (priceMin > 0 || priceMax < 999999) {
      list = list.filter(
        (product) =>
          product.original_status === "available" &&
          product.original_price &&
          product.original_price >= priceMin &&
          product.original_price <= priceMax,
      );
    }

    const effWMax = widthMax || wGlobalMax;
    if ((widthMin > 0 && widthMin > wGlobalMin) || effWMax < wGlobalMax) {
      list = list.filter((product) => {
        const width = getUnitVal(product, "width");
        return width > 0 && width >= widthMin && width <= effWMax;
      });
    }

    const effHMax = heightMax || hGlobalMax;
    if ((heightMin > 0 && heightMin > hGlobalMin) || effHMax < hGlobalMax) {
      list = list.filter((product) => {
        const height = getUnitVal(product, "height");
        return height > 0 && height >= heightMin && height <= effHMax;
      });
    }

    if (activeYears.length > 0)
      list = list.filter(
        (product) => product.year && activeYears.includes(product.year),
      );
    if (activeOrientations.length > 0)
      list = list.filter((product) => {
        const orientation = getOrientation(product);
        return orientation && activeOrientations.includes(orientation);
      });
    if (activeLabels.length > 0)
      list = list.filter((product) =>
        (product.labels || []).some((label) => activeLabels.includes(label.id)),
      );

    return list;
  }, [
    activeLabels,
    activeOrientations,
    activeYears,
    allProducts,
    categoryFilter,
    effectiveLikedIds,
    filterLiked,
    getUnitVal,
    hGlobalMax,
    hGlobalMin,
    heightMax,
    heightMin,
    priceMax,
    priceMin,
    wGlobalMax,
    wGlobalMin,
    widthMax,
    widthMin,
  ]);

  const widthActive = widthMin > wGlobalMin || widthMax < wGlobalMax;
  const heightActive = heightMin > hGlobalMin || heightMax < hGlobalMax;
  const activeFilterCount =
    categoryFilter.length +
    (filterLiked ? 1 : 0) +
    (priceMin > 0 || priceMax < 999999 ? 1 : 0) +
    (widthActive ? 1 : 0) +
    (heightActive ? 1 : 0) +
    activeYears.length +
    activeOrientations.length +
    activeLabels.length;

  const clearAll = useCallback(() => {
    setCategoryFilter([]);
    setPriceMin(0);
    setPriceMax(999999);
    setWidthMin(wGlobalMin);
    setWidthMax(wGlobalMax);
    setHeightMin(hGlobalMin);
    setHeightMax(hGlobalMax);
    setActiveYears([]);
    setActiveOrientations([]);
    setActiveLabels([]);
    setFilterLiked(false);
  }, [hGlobalMax, hGlobalMin, wGlobalMax, wGlobalMin]);

  const state = useMemo(
    () => ({
      categoryFilter,
      priceMin,
      priceMax,
      widthMin,
      widthMax,
      heightMin,
      heightMax,
      activeYears,
      activeOrientations,
      activeLabels,
      filterLiked,
    }),
    [
      activeLabels,
      activeOrientations,
      activeYears,
      categoryFilter,
      filterLiked,
      heightMax,
      heightMin,
      priceMax,
      priceMin,
      widthMax,
      widthMin,
    ],
  );

  const actions = useMemo(
    () => ({
      setCategoryFilter,
      setPriceMin,
      setPriceMax,
      setWidthMin,
      setWidthMax,
      setHeightMin,
      setHeightMax,
      setActiveYears,
      setActiveOrientations,
      setActiveLabels,
      setFilterLiked,
      clearAll,
    }),
    [clearAll],
  );

  const bounds = useMemo(
    () => ({ wGlobalMin, wGlobalMax, hGlobalMin, hGlobalMax }),
    [hGlobalMax, hGlobalMin, wGlobalMax, wGlobalMin],
  );

  return {
    state,
    actions,
    bounds,
    availableYears,
    filtered,
    activeFilterCount,
  };
}

function getMinDimension(
  products: Product[],
  pick: (product: Product) => number,
) {
  const values = products.map(pick).filter((value) => value > 0);
  return values.length ? Math.floor(Math.min(...values)) : 0;
}

function getMaxDimension(
  products: Product[],
  pick: (product: Product) => number,
  fallback: number,
) {
  const values = products.map(pick).filter((value) => value > 0);
  return values.length ? Math.ceil(Math.max(...values)) : fallback;
}
