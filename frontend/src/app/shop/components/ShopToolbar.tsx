"use client";

import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { SORT_OPTIONS } from "../constants";

type ShopToolbarProps = {
  resultCount: number;
  activeFilterCount: number;
  isMobile: boolean;
  desktopFiltersCollapsed: boolean;
  gridMode: "1" | "2" | "3";
  sortIdx: number;
  onOpenFilters: () => void;
  onToggleDesktopFilters: () => void;
  onGridModeChange: (value: "1" | "2" | "3") => void;
  onSortChange: (value: number) => void;
};

export function ShopToolbar({
  resultCount,
  activeFilterCount,
  isMobile,
  desktopFiltersCollapsed,
  gridMode,
  sortIdx,
  onOpenFilters,
  onToggleDesktopFilters,
  onGridModeChange,
  onSortChange,
}: ShopToolbarProps) {
  const DesktopFilterIcon = desktopFiltersCollapsed ? ChevronRight : ChevronLeft;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1rem",
        flexWrap: isMobile ? "nowrap" : "wrap",
        gap: isMobile ? "0.75rem" : "1rem",
        overflowX: isMobile ? "auto" : "visible",
        paddingBottom: isMobile ? "5px" : 0,
        scrollbarWidth: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "1rem", flexShrink: 0 }}>
        {!isMobile && (
          <button
            type="button"
            className="shop-toolbar-filter-toggle"
            aria-controls="shop-desktop-filters"
            aria-expanded={!desktopFiltersCollapsed}
            onClick={onToggleDesktopFilters}
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{desktopFiltersCollapsed ? "Show filters" : "Hide filters"}</span>
            {activeFilterCount > 0 && (
              <span className="shop-toolbar-filter-count">{activeFilterCount}</span>
            )}
            <DesktopFilterIcon size={13} strokeWidth={1.6} aria-hidden="true" />
          </button>
        )}
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 300, color: "var(--color-muted)", whiteSpace: "nowrap" }}>{resultCount} works</span>
        {isMobile && (
          <button
            onClick={onOpenFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.8rem",
              backgroundColor: activeFilterCount > 0 ? "rgba(26,26,24,0.03)" : "transparent",
              color: "var(--color-charcoal)",
              border: "1px solid",
              borderColor: activeFilterCount > 0 ? "var(--color-charcoal)" : "rgba(26,26,24,0.12)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "1rem", flexShrink: 0 }}>
        <div className="grid-toggle-wrapper" style={{ display: "flex", alignItems: "center", backgroundColor: "var(--color-cream-dark)", borderRadius: "6px", padding: "2px" }}>
          {(["1", "2", "3"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onGridModeChange(mode)}
              title={`${mode} in a row`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 8px",
                backgroundColor: gridMode === mode ? "#ffffff" : "transparent",
                color: gridMode === mode ? "var(--color-charcoal)" : "var(--color-muted)",
                border: "none",
                borderRadius: "4px",
                boxShadow: gridMode === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <GridIcon mode={mode} />
            </button>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <select
            value={sortIdx}
            onChange={(event) => onSortChange(Number(event.target.value))}
            style={{
              appearance: "none",
              backgroundColor: "transparent",
              border: "1px solid rgba(26,26,24,0.2)",
              borderRadius: "20px",
              padding: "0.4rem 2.2rem 0.4rem 1rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-charcoal)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {SORT_OPTIONS.map((sortOption, index) => (
              <option key={sortOption.key} value={index}>
                {sortOption.label}
              </option>
            ))}
          </select>
          <span style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "0.65rem", color: "var(--color-charcoal)", fontWeight: 300 }}>v</span>
        </div>
      </div>
    </div>
  );
}

function GridIcon({ mode }: { mode: "1" | "2" | "3" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      {mode === "1" && <rect x="2" y="2" width="12" height="12" rx="1" />}
      {mode === "2" && (
        <>
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </>
      )}
      {mode === "3" && (
        <>
          <rect x="1" y="1" width="3.5" height="3.5" rx="0.5" />
          <rect x="6.25" y="1" width="3.5" height="3.5" rx="0.5" />
          <rect x="11.5" y="1" width="3.5" height="3.5" rx="0.5" />
          <rect x="1" y="6.25" width="3.5" height="3.5" rx="0.5" />
          <rect x="6.25" y="6.25" width="3.5" height="3.5" rx="0.5" />
          <rect x="11.5" y="6.25" width="3.5" height="3.5" rx="0.5" />
          <rect x="1" y="11.5" width="3.5" height="3.5" rx="0.5" />
          <rect x="6.25" y="11.5" width="3.5" height="3.5" rx="0.5" />
          <rect x="11.5" y="11.5" width="3.5" height="3.5" rx="0.5" />
        </>
      )}
    </svg>
  );
}
