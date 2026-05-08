"use client";

export function ArtworkMobileTitle({
  title,
  liked,
  animating,
  onToggleLike,
}: {
  title: string;
  liked: boolean;
  animating: boolean;
  onToggleLike: () => void;
}) {
  return (
    <div
      className="mobile-title-row"
      style={{
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "0",
        marginTop: "1rem",
        textAlign: "left",
        gap: "1rem",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-artwork-title)",
          fontSize: "clamp(2.4rem, 4.5vw, 3.4rem)",
          fontWeight: 400,
          fontStyle: "normal",
          color: "var(--color-charcoal)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <button
        onClick={onToggleLike}
        aria-label={liked ? "Unlike" : "Like"}
        style={{
          background: "rgba(255,255,255,0.88)",
          border: "1px solid rgba(0,0,0,0.05)",
          borderRadius: "50%",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          flexShrink: 0,
          transform: animating ? "scale(1.2)" : "scale(1)",
          transition:
            "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s",
          outline: "none",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={liked ? "#e84057" : "none"}
          stroke={liked ? "#e84057" : "#999"}
          strokeWidth={liked ? "1.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "fill 0.25s, stroke 0.25s", pointerEvents: "none" }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
}
