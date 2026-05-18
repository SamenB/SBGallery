"use client";

import type { Dispatch, SetStateAction } from "react";
import type { Units } from "@/context/PreferencesContext";
import type { Label, LabelCategory } from "../types";
import { DualRangeSlider } from "./DualRangeSlider";
import { FilterCheckbox } from "./FilterCheckbox";
import { PriceRangeSection } from "./PriceRangeSection";
import { SidebarSection } from "./SidebarSection";

type ShopFiltersPanelProps = {
  isMobile: boolean;
  filterLiked: boolean;
  setFilterLiked: (value: boolean) => void;
  categoryFilter: string[];
  setCategoryFilter: Dispatch<SetStateAction<string[]>>;
  priceMin: number;
  priceMax: number;
  setPriceMin: (value: number) => void;
  setPriceMax: (value: number) => void;
  units: Units;
  wGlobalMin: number;
  wGlobalMax: number;
  widthMin: number;
  widthMax: number;
  setWidthMin: (value: number) => void;
  setWidthMax: (value: number) => void;
  hGlobalMin: number;
  hGlobalMax: number;
  heightMin: number;
  heightMax: number;
  setHeightMin: (value: number) => void;
  setHeightMax: (value: number) => void;
  availableYears: number[];
  activeYears: number[];
  setActiveYears: Dispatch<SetStateAction<number[]>>;
  activeOrientations: string[];
  setActiveOrientations: Dispatch<SetStateAction<string[]>>;
  categories: LabelCategory[];
  labels: Label[];
  activeLabels: number[];
  setActiveLabels: Dispatch<SetStateAction<number[]>>;
};

const toggleStr = (setter: Dispatch<SetStateAction<string[]>>, val: string) =>
  setter((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));

const toggleNum = (setter: Dispatch<SetStateAction<number[]>>, val: number) =>
  setter((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));

export function ShopFiltersPanel({
  isMobile,
  filterLiked,
  setFilterLiked,
  categoryFilter,
  setCategoryFilter,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  units,
  wGlobalMin,
  wGlobalMax,
  widthMin,
  widthMax,
  setWidthMin,
  setWidthMax,
  hGlobalMin,
  hGlobalMax,
  heightMin,
  heightMax,
  setHeightMin,
  setHeightMax,
  availableYears,
  activeYears,
  setActiveYears,
  activeOrientations,
  setActiveOrientations,
  categories,
  labels,
  activeLabels,
  setActiveLabels,
}: ShopFiltersPanelProps) {
  return (
    <>
      <SidebarSection title="My Collection" defaultOpen={true} isMobile={isMobile}>
        <FilterCheckbox label="My Likes" active={filterLiked} onClick={() => setFilterLiked(!filterLiked)} isMobile={isMobile} />
      </SidebarSection>

      <SidebarSection title="Category" defaultOpen={false} isMobile={isMobile}>
        <FilterCheckbox label="Available Originals" active={categoryFilter.includes("originals")} onClick={() => toggleStr(setCategoryFilter, "originals")} isMobile={isMobile} />
        <FilterCheckbox label="Prints Available" active={categoryFilter.includes("prints")} onClick={() => toggleStr(setCategoryFilter, "prints")} isMobile={isMobile} />
      </SidebarSection>

      <PriceRangeSection
        key={`${priceMin}-${priceMax}`}
        min={priceMin}
        max={priceMax}
        onChange={(mn, mx) => {
          setPriceMin(mn);
          setPriceMax(mx);
        }}
        isMobile={isMobile}
      />

      <SidebarSection title="Size" defaultOpen={false} isMobile={isMobile}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>({units})</span>
        </div>
        {wGlobalMax > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <DualRangeSlider
              label="Width"
              unit={units}
              globalMin={wGlobalMin}
              globalMax={wGlobalMax}
              valueMin={widthMin || wGlobalMin}
              valueMax={widthMax || wGlobalMax}
              onChange={(mn, mx) => {
                setWidthMin(mn);
                setWidthMax(mx);
              }}
            />
            <DualRangeSlider
              label="Height"
              unit={units}
              globalMin={hGlobalMin}
              globalMax={hGlobalMax}
              valueMin={heightMin || hGlobalMin}
              valueMax={heightMax || hGlobalMax}
              onChange={(mn, mx) => {
                setHeightMin(mn);
                setHeightMax(mx);
              }}
            />
          </div>
        ) : (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#bbb", fontStyle: "italic" }}>No size data yet</span>
        )}
      </SidebarSection>

      <SidebarSection title="Year" defaultOpen={false} isMobile={isMobile}>
        {availableYears.length > 0 ? (
          availableYears.map((y) => <FilterCheckbox key={y} label={String(y)} active={activeYears.includes(y)} onClick={() => toggleNum(setActiveYears, y)} isMobile={isMobile} />)
        ) : (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#bbb", fontStyle: "italic" }}>No year data yet</span>
        )}
      </SidebarSection>

      <SidebarSection title="Orientation" defaultOpen={false} isMobile={isMobile}>
        <FilterCheckbox label="Horizontal" active={activeOrientations.includes("horizontal")} onClick={() => toggleStr(setActiveOrientations, "horizontal")} isMobile={isMobile} />
        <FilterCheckbox label="Vertical" active={activeOrientations.includes("vertical")} onClick={() => toggleStr(setActiveOrientations, "vertical")} isMobile={isMobile} />
        <FilterCheckbox label="Square" active={activeOrientations.includes("square")} onClick={() => toggleStr(setActiveOrientations, "square")} isMobile={isMobile} />
      </SidebarSection>

      {categories.map((cat) => {
        const catLabels = labels.filter((label) => label.category_id === cat.id);
        if (catLabels.length === 0) return null;

        return (
          <SidebarSection key={cat.id} title={cat.title} defaultOpen={false} isMobile={isMobile}>
            {catLabels.map((label) => (
              <FilterCheckbox key={label.id} label={label.title} active={activeLabels.includes(label.id)} onClick={() => toggleNum(setActiveLabels, label.id)} isMobile={isMobile} />
            ))}
          </SidebarSection>
        );
      })}
    </>
  );
}
