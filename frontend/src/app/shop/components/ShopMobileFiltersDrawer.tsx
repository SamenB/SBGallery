"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
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
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const previousStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = previousStyles.overflow;
      body.style.position = previousStyles.position;
      body.style.top = previousStyles.top;
      body.style.width = previousStyles.width;
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [open]);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(26,26,24,0.68)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            zIndex: 40,
            touchAction: "none",
          }}
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shop filters"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "#ffffff",
          borderTop: "1px solid var(--color-border)",
          borderRadius: "10px 10px 0 0",
          boxShadow: "0 -18px 60px rgba(26,26,24,0.22)",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
          maxHeight: "min(86dvh, 720px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          overscrollBehavior: "contain",
          pointerEvents: open ? "auto" : "none",
          visibility: open ? "visible" : "hidden",
          transitionProperty: "transform, visibility",
        }}
      >
        <div
          style={{
            padding: "1.1rem 1.25rem 0.95rem",
            borderBottom: "1px solid rgba(26,26,24,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
            flexShrink: 0,
          }}
        >
          <div style={{ position: "absolute", top: "0.55rem", left: "50%", transform: "translateX(-50%)", width: "36px", height: "3px", borderRadius: "2px", backgroundColor: "rgba(26,26,24,0.16)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", paddingTop: "0.35rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 650, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-charcoal)" }}>Filters</h3>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 300, color: "var(--color-muted)" }}>
              {resultCount} work{resultCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", paddingTop: "0.35rem" }}>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-charcoal)",
                  background: "rgba(26,26,24,0.035)",
                  border: "1px solid rgba(26,26,24,0.1)",
                  borderRadius: "999px",
                  cursor: "pointer",
                  padding: "0.55rem 0.75rem",
                }}
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              style={{
                color: "var(--color-charcoal)",
                background: "#ffffff",
                border: "1px solid rgba(26,26,24,0.14)",
                borderRadius: "999px",
                cursor: "pointer",
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <X size={17} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div
          style={{
            padding: "1.1rem 1.25rem 1rem",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            flex: "1 1 auto",
          }}
        >
          {children}
        </div>
        <div style={{ padding: "0.95rem 1.25rem 1rem", borderTop: "1px solid rgba(26,26,24,0.06)", backgroundColor: "#ffffff", flexShrink: 0 }}>
          <button
            type="button"
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
