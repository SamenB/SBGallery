"use client";

import type {
  ArtworkPrintStorefront,
  MediumOffers,
  PurchaseType,
} from "@/lib/artworkStorefront";

export function PrintConfiguratorHeader({
  purchaseType,
  storefront,
  mediumOffers,
  hasHighResAsset,
}: {
  purchaseType: PurchaseType;
  storefront: ArtworkPrintStorefront;
  mediumOffers: MediumOffers | null;
  hasHighResAsset: boolean;
}) {
  const limitedOnly = !mediumOffers?.open_available && !!mediumOffers?.limited_available;
  const limitedAvailable = !!mediumOffers?.limited_available;

  return (
    <div className="pc-header" style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <p className="pc-title">Fine Art {purchaseType === "canvas" ? "Canvas" : "Paper"} Prints</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <p className="pc-subtitle">Baked storefront profile for {storefront.country_name || storefront.country_code}</p>
            {hasHighResAsset && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "2px 6px",
                  background: "rgba(16, 185, 129, 0.08)",
                  color: "#10B981",
                  borderRadius: "4px",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Verified Full-Res
              </span>
            )}
          </div>
        </div>
        {limitedAvailable && (
          <div
            style={{
              background: limitedOnly
                ? "linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)"
                : "linear-gradient(135deg, #F2E9D2 0%, #D8C3A5 100%)",
              color: "#1a1a1a",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              boxShadow: "0 2px 8px rgba(212, 175, 55, 0.2)",
              flexShrink: 0,
              textAlign: "center",
            }}
          >
            {limitedOnly ? "Limited Edition" : "Limited Available"}
            {mediumOffers?.limited_quantity ? (
              <div style={{ fontSize: "0.55rem", opacity: 0.8, marginTop: "1px" }}>
                Edition size {mediumOffers.limited_quantity}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
