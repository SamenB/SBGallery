"use client";

export function PaymentBadges() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
      <span style={{ fontSize: "0.65rem", color: "#aaa", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em" }}>We accept</span>
      <svg width="34" height="22" viewBox="0 0 34 22" fill="none" style={{ opacity: 0.5 }}>
        <rect width="34" height="22" rx="4" fill="#1A1F71" />
        <text x="17" y="14" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Arial">
          VISA
        </text>
      </svg>
      <svg width="34" height="22" viewBox="0 0 34 22" fill="none" style={{ opacity: 0.5 }}>
        <rect width="34" height="22" rx="4" fill="#252525" />
        <circle cx="14" cy="11" r="6" fill="#EB001B" opacity="0.9" />
        <circle cx="20" cy="11" r="6" fill="#F79E1B" opacity="0.9" />
      </svg>
      <svg width="38" height="22" viewBox="0 0 38 22" fill="none" style={{ opacity: 0.5 }}>
        <rect width="38" height="22" rx="4" fill="#fff" stroke="#ddd" strokeWidth="0.5" />
        <text x="19" y="13.5" textAnchor="middle" fill="#5F6368" fontSize="7" fontWeight="600" fontFamily="Arial">
          G Pay
        </text>
      </svg>
      <svg width="38" height="22" viewBox="0 0 38 22" fill="none" style={{ opacity: 0.5 }}>
        <rect width="38" height="22" rx="4" fill="#000" />
        <text x="19" y="13.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="600" fontFamily="Arial">
          Pay
        </text>
      </svg>
    </div>
  );
}
