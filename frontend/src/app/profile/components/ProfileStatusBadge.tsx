"use client";

const PAYMENT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: "rgba(34,197,94,0.15)", text: "#15803d", label: "Paid" },
  pending: { bg: "rgba(250,204,21,0.2)", text: "#b45309", label: "Pending" },
  awaiting_payment: {
    bg: "rgba(250,204,21,0.2)",
    text: "#b45309",
    label: "Awaiting Payment",
  },
  processing: { bg: "rgba(96,165,250,0.15)", text: "#1d4ed8", label: "Processing" },
  failed: { bg: "rgba(239,68,68,0.12)", text: "#b91c1c", label: "Failed" },
  refunded: { bg: "rgba(168,85,247,0.15)", text: "#7e22ce", label: "Refunded" },
  mock_paid: { bg: "rgba(34,197,94,0.15)", text: "#15803d", label: "Paid" },
  hold: { bg: "rgba(96,165,250,0.15)", text: "#1d4ed8", label: "On Hold" },
};

export function ProfileStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_COLORS[status] || {
    bg: "rgba(0,0,0,0.05)",
    text: "#555",
    label: status,
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.65rem",
        borderRadius: "999px",
        fontSize: "0.65rem",
        fontFamily: "var(--font-sans, system-ui)",
        fontWeight: 650,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        backgroundColor: config.bg,
        color: config.text,
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}
