"use client";

import type { ReactNode } from "react";

type ShopMobileFiltersDrawerProps = {
  open: boolean;
  activeFilterCount: number;
  resultCount: number;
  onClose: () => void;
  onClearAll: () => void;
  children: ReactNode;
};

export function ShopMobileFiltersDrawer({ open, activeFilterCount, resultCount, onClose, onClearAll, children }: ShopMobileFiltersDrawerProps) {
  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(26,26,24,0.75)", zIndex: 40 }} />}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "#ffffff",
          borderTop: "1px solid var(--color-border)",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid rgba(26,26,24,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            backgroundColor: "#ffffff",
            zIndex: 1,
          }}
        >
          <div style={{ position: "absolute", top: "0.5rem", left: "50%", transform: "translateX(-50%)", width: "32px", height: "3px", borderRadius: "2px", backgroundColor: "rgba(26,26,24,0.12)" }} />
          <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "0.5rem", color: "var(--color-charcoal)" }}>Filters</h3>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.5rem" }}>
            {activeFilterCount > 0 && (
              <button
                onClick={onClearAll}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  fontWeight: 300,
                  color: "var(--color-charcoal-mid)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(26,26,24,0.2)",
                  paddingBottom: "1px",
                }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                fontSize: "2rem",
                fontWeight: 200,
                color: "var(--color-charcoal)",
                background: "none",
                border: "none",
                cursor: "pointer",
                minWidth: "64px",
                minHeight: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                lineHeight: 1,
                padding: "0 10px",
              }}
            >
              x
            </button>
          </div>
        </div>
        <div style={{ padding: "1.25rem 1.5rem 1rem" }}>{children}</div>
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(26,26,24,0.06)", position: "sticky", bottom: 0, backgroundColor: "#ffffff" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "0.85rem",
              backgroundColor: "var(--color-charcoal)",
              color: "var(--color-cream)",
              borderRadius: "2px",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              fontWeight: 400,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              minHeight: "48px",
            }}
          >
            Show {resultCount} work{resultCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </>
  );
}
