"use client";

import Link from "next/link";
import { PUBLIC_ROUTES } from "@/lib/publicRoutes";

function NavArrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      width="8"
      height="14"
      viewBox="0 0 8 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={direction === "next" ? "7,1 1,7 7,13" : "1,1 7,7 1,13"} />
    </svg>
  );
}

function NavLink({
  href,
  children,
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.65rem 1.4rem",
    color: disabled ? "var(--color-border)" : "var(--color-muted)",
    opacity: disabled ? 0.35 : 1,
    textDecoration: "none",
    transition: "color 0.2s",
    whiteSpace: "nowrap",
    cursor: disabled ? "default" : "pointer",
  };
  if (disabled || !href) return <span style={style}>{children}</span>;
  return (
    <Link
      href={href}
      style={style}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--color-charcoal)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--color-muted)";
      }}
    >
      {children}
    </Link>
  );
}

function Divider() {
  return (
    <span
      style={{
        width: "1px",
        height: "16px",
        background: "var(--color-border)",
        opacity: 0.5,
        flexShrink: 0,
      }}
    />
  );
}

export function ArtworkDetailNav({
  prevSlug,
  nextSlug,
  isMobile,
}: {
  prevSlug: string | null;
  nextSlug: string | null;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: isMobile ? "1rem" : "2rem",
        fontFamily: "var(--font-sans)",
        fontSize: "0.72rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        position: "relative",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#fff",
          borderRadius: "40px",
          boxShadow:
            "0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)",
          padding: "0 0.25rem",
        }}
      >
        <NavLink href={prevSlug ? `/artwork/${prevSlug}` : undefined} disabled={!prevSlug}>
          <NavArrow direction="next" /> Next
        </NavLink>
        <Divider />
        <Link
          href={PUBLIC_ROUTES.originalsAndPrints}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.65rem 1.6rem",
            color: "var(--color-muted)",
            textDecoration: "none",
            transition: "color 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          All Works
        </Link>
        <Divider />
        <NavLink href={nextSlug ? `/artwork/${nextSlug}` : undefined} disabled={!nextSlug}>
          Prev <NavArrow direction="prev" />
        </NavLink>
      </div>
    </div>
  );
}
