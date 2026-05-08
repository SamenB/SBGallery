"use client";

export function CheckoutResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 768px) {
        .checkout-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        .checkout-summary { order: -1; }
      }
      @media (max-width: 480px) {
        .checkout-two-col { grid-template-columns: 1fr !important; }
      }
      .pac-container {
        border-radius: 8px !important;
        border: 1px solid rgba(17,17,17,0.12) !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
        font-family: var(--font-sans) !important;
        margin-top: 4px !important;
      }
      .pac-item {
        padding: 8px 12px !important;
        font-size: 0.85rem !important;
        cursor: pointer !important;
        border-top: 1px solid rgba(17,17,17,0.04) !important;
      }
      .pac-item:hover { background-color: rgba(236,72,153,0.06) !important; }
      .pac-item-query { font-size: 0.85rem !important; color: #111 !important; }
      .pac-matched { font-weight: 600 !important; }
      .pac-icon { display: none !important; }
    `}</style>
  );
}
