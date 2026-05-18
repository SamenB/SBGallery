"use client";

import type { Artwork } from "../types";
import type { ArtworkLayoutMetrics } from "../hooks/useArtworkDetailPage";

export function ArtworkDetailsSection({
  work,
  layoutMetrics,
}: {
  work: Artwork;
  layoutMetrics: ArtworkLayoutMetrics;
}) {
  return (
    <div
      style={{
        marginTop: layoutMetrics.winW < 768 ? "1.5rem" : "6rem",
        borderTop: "1px solid var(--color-border)",
        paddingTop: layoutMetrics.winW < 768 ? "2rem" : "4rem",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "2rem",
          fontStyle: "italic",
          marginBottom: "3rem",
          textAlign: "center",
        }}
      >
        Artwork Details
      </h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            maxWidth: "860px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: layoutMetrics.winW < 768 ? "1fr" : "1.25fr 0.9fr",
            gap: layoutMetrics.winW < 768 ? "2rem" : "4rem",
            alignItems: "start",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1rem",
              }}
            >
              About
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.92rem",
                lineHeight: 1.75,
                color: "var(--color-charcoal-mid)",
              }}
            >
              {work.description || "Artwork description is not available yet."}
            </p>
          </div>
          <div>
          <h3
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1.5rem",
            }}
          >
            Specifications
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Medium", work.medium],
                ["Size", work.size],
                work.print_aspect_ratio?.label ? ["Print Ratio", work.print_aspect_ratio.label] : null,
                work.original_status ? ["Original Status", work.original_status.replaceAll("_", " ")] : null,
              ].filter((item): item is string[] => Boolean(item)).map(([label, value]) => (
                <tr key={label} style={{ borderBottom: "1px solid rgba(26,26,24,0.05)" }}>
                  <td
                    style={{
                      padding: "0.75rem 0",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-muted)",
                      textTransform: "uppercase",
                      width: "100px",
                    }}
                  >
                    {label}
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
