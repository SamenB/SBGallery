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
        <div style={{ maxWidth: "600px", width: "100%" }}>
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
              ].map(([label, value]) => (
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
  );
}
