"use client";

export function ArtworkFullscreenButton({
  top,
  right,
  visible,
  onClick,
}: {
  top: number;
  right: number;
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: `${top}px`,
        right: `${right}px`,
        zIndex: 100,
        display: visible ? "inline-flex" : "none",
        alignItems: "center",
        gap: "0.6rem",
        background: "rgba(255,255,255,0.3)",
        color: "rgba(26,26,24,0.45)",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: "20px",
        padding: "0.4rem 0.9rem",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        backdropFilter: "blur(4px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.8 }}
      >
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
      Fullscreen
    </button>
  );
}
