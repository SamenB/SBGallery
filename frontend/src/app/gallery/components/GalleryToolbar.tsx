"use client";

import { GalleryGridMode, GalleryGroupBy, SortKey } from "../types";

const GROUP_OPTIONS: { id: GalleryGroupBy; label: string }[] = [
  { id: "collection", label: "Collection" },
  { id: "year", label: "Year" },
  { id: "medium", label: "Medium" },
];

const controlShellStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--color-cream-dark)",
  borderRadius: "6px",
  padding: "2px",
};

const controlButtonStyle = (active: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "4px 12px",
  fontFamily: "var(--font-sans)",
  fontSize: "0.7rem",
  fontWeight: 500,
  letterSpacing: "0.05em",
  backgroundColor: active ? "#ffffff" : "transparent",
  color: active ? "var(--color-charcoal)" : "var(--color-muted)",
  border: "none",
  borderRadius: "4px",
  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
  cursor: "pointer",
  transition: "all 0.2s",
});

const iconButtonStyle = (active: boolean): React.CSSProperties => ({
  ...controlButtonStyle(active),
  padding: "4px 8px",
});

function GridIcon({ mode }: { mode: GalleryGridMode }) {
  if (mode === "1") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <rect x="2" y="2" width="12" height="12" rx="1" />
      </svg>
    );
  }
  const cells =
    mode === "2"
      ? [
          [2, 2, 5],
          [9, 2, 5],
          [2, 9, 5],
          [9, 9, 5],
        ]
      : [
          [1, 1, 3.5],
          [6.25, 1, 3.5],
          [11.5, 1, 3.5],
          [1, 6.25, 3.5],
          [6.25, 6.25, 3.5],
          [11.5, 6.25, 3.5],
          [1, 11.5, 3.5],
          [6.25, 11.5, 3.5],
          [11.5, 11.5, 3.5],
        ];
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      {cells.map(([x, y, size]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={size} height={size} rx="0.5" />
      ))}
    </svg>
  );
}

interface GalleryToolbarProps {
  artworkCount: number;
  groupBy: GalleryGroupBy;
  onGroupByChange: (value: GalleryGroupBy) => void;
  sortKey: SortKey;
  onSortKeyChange: (value: SortKey) => void;
  gridMode: GalleryGridMode;
  onGridModeChange: (value: GalleryGridMode) => void;
  isMobile: boolean;
}

export function GalleryToolbar({
  artworkCount,
  groupBy,
  onGroupByChange,
  gridMode,
  onGridModeChange,
  isMobile,
}: GalleryToolbarProps) {
  return (
    <div
      style={{
        maxWidth: "1600px",
        margin: "0 auto",
        padding: isMobile ? "1rem 0.75rem 2rem" : "1.5rem 2.5rem 2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? "0.75rem" : "1rem",
          flexWrap: isMobile ? "nowrap" : "wrap",
          overflowX: isMobile ? "auto" : "visible",
          paddingBottom: isMobile ? "5px" : 0,
          scrollbarWidth: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              display: isMobile ? "none" : "inline",
            }}
          >
            Group By
          </span>
          {isMobile ? (
            <div style={{ position: "relative" }}>
              <select
                value={groupBy}
                onChange={(e) => onGroupByChange(e.target.value as GalleryGroupBy)}
                style={{
                  appearance: "none",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(26,26,24,0.2)",
                  borderRadius: "20px",
                  padding: "0.35rem 2.2rem 0.35rem 1rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-charcoal)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {GROUP_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span
                style={{
                  position: "absolute",
                  right: "0.8rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  fontSize: "0.65rem",
                  color: "var(--color-charcoal)",
                  fontWeight: 300,
                }}
              >
                v
              </span>
            </div>
          ) : (
            <div style={controlShellStyle}>
              {GROUP_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onGroupByChange(option.id)}
                  style={controlButtonStyle(groupBy === option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "0.5rem" : "1.5rem",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                display: isMobile ? "none" : "inline",
              }}
            >
              View
            </span>
            <div className="grid-toggle-wrapper" style={controlShellStyle}>
              {(["1", "2", "3"] as GalleryGridMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onGridModeChange(mode)}
                  style={iconButtonStyle(gridMode === mode)}
                  title={
                    mode === "1"
                      ? "Exhibition View"
                      : mode === "2"
                        ? "Standard View"
                        : "Dense View"
                  }
                >
                  <GridIcon mode={mode} />
                </button>
              ))}
            </div>
          </div>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-muted)",
              flexShrink: 0,
            }}
          >
            {artworkCount} works
          </span>
        </div>
      </div>
    </div>
  );
}
