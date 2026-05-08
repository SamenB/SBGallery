"use client";

import type { ProfileOrder } from "../types";

const FULFILLMENT_STEPS = [
  { key: "received", label: "Order Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const getUIFulfillmentIndex = (dbStatus: string): number => {
  switch (dbStatus) {
    case "pending":
      return 0;
    case "confirmed":
    case "print_ordered":
    case "print_received":
    case "packaging":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
};

export function ProfileFulfillmentProgress({
  status,
  order,
}: {
  status: string;
  order: ProfileOrder;
}) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/8 p-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-red-700">
        Order Cancelled
      </div>
    );
  }

  const currentIdx = getUIFulfillmentIndex(status);
  return (
    <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "max-content" }}>
        {FULFILLMENT_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: isPending ? 0.35 : 1 }}>
                <div
                  style={{
                    width: isCurrent ? "2.2rem" : "1.85rem",
                    height: isCurrent ? "2.2rem" : "1.85rem",
                    borderRadius: "50%",
                    background: isCompleted ? "rgba(34,197,94,0.15)" : isCurrent ? "rgba(26,26,24,0.06)" : "transparent",
                    border: isCompleted ? "1.5px solid rgba(34,197,94,0.6)" : isCurrent ? "1.5px solid rgba(26,26,24,0.4)" : "1.5px solid rgba(26,26,24,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isCurrent ? "0.75rem" : "0.65rem",
                    fontWeight: 800,
                  }}
                >
                  {idx + 1}
                </div>
                <span style={{ fontSize: "0.60rem", fontWeight: isCurrent ? 700 : 500, color: isCompleted ? "#15803d" : isCurrent ? "#1a1a18" : "rgba(26,26,24,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  {step.label}
                </span>
              </div>
              {idx < FULFILLMENT_STEPS.length - 1 && (
                <div style={{ width: "36px", height: "1.5px", background: isCompleted ? "rgba(34,197,94,0.5)" : "rgba(26,26,24,0.1)", flexShrink: 0, marginBottom: "14px" }} />
              )}
            </div>
          );
        })}
      </div>
      {(status === "shipped" || status === "delivered") && order.tracking_number && (
        <div className="mt-4 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4">
          <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-emerald-700">
            Tracking
          </p>
          <p className="font-mono text-[0.75rem] text-[var(--color-charcoal)]">
            {order.carrier && <span className="mr-2 font-semibold capitalize">{order.carrier.replace(/_/g, " ")}</span>}
            {order.tracking_number}
          </p>
          {order.tracking_url && (
            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[0.7rem] font-semibold text-emerald-700 underline underline-offset-4">
              Track your parcel
            </a>
          )}
        </div>
      )}
    </div>
  );
}
