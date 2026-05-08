import { useState } from "react";
import { PAID_STATUSES, PAYMENT_STATUS_MAP, PAYMENT_STATUSES } from "./ordersTab.constants";

function PaymentPhase({
  order,
  onPaymentOverride,
  overrideSaving,
}: {
  order: any;
  onPaymentOverride: (status: string) => void;
  overrideSaving: boolean;
}) {
  const [showOverride, setShowOverride] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.payment_status);

  const cfg = PAYMENT_STATUS_MAP[order.payment_status] || PAYMENT_STATUSES[0];
  const isPaid = PAID_STATUSES.has(order.payment_status);
  const isAwaitingOrProcessing = ["awaiting_payment", "processing", "hold"].includes(order.payment_status);

  return (
    <div className="space-y-3">
      {/* Status display */}
      <div
        className="p-4 rounded-xl border-2 flex items-start gap-3"
        style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
      >
        <span className="text-xl flex-shrink-0 mt-0.5" style={{ color: cfg.text }}>
          {cfg.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: cfg.text }}>
            {cfg.label}
          </p>
          {isPaid && <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Payment confirmed by Monobank</p>}
          {isAwaitingOrProcessing && (
            <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Waiting for bank confirmation</p>
          )}
          {order.payment_status === "failed" && (
            <p className="text-[11px] text-red-700 mt-0.5 font-medium">Payment declined fulfillment auto-cancelled</p>
          )}
          {order.payment_status === "refunded" && (
            <p className="text-[11px] text-purple-700 mt-0.5 font-medium">
              Payment reversed fulfillment auto-cancelled
            </p>
          )}
          {order.payment_status === "pending" && (
            <p className="text-[11px] text-[#31323E]/50 mt-0.5 font-medium">Payment session not yet initiated</p>
          )}
        </div>
        <span
          className="flex-shrink-0 text-[9px] uppercase tracking-wider font-bold bg-white/60 border border-current/20 px-2 py-0.5 rounded-full"
          style={{ color: cfg.text }}
        >
          Auto
        </span>
      </div>

      {/* Invoice info */}
      {order.invoice_id && (
        <div className="bg-white border border-[#31323E]/10 rounded-xl p-3.5 space-y-1.5">
          <p className="text-[9px] uppercase tracking-widest font-bold text-[#31323E]/40">Monobank Invoice</p>
          <p className="text-[11px] font-mono font-semibold text-[#31323E] truncate">{order.invoice_id}</p>
          {order.payment_url && (
            <a
              href={order.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 font-medium"
            >
              Payment URL
            </a>
          )}
        </div>
      )}

      {/* Manual override */}
      <div className="border border-amber-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowOverride(!showOverride)}
          className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-sm"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              Manual Payment Override
            </span>
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-amber-400 transition-transform ${showOverride ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {showOverride && (
          <div className="px-4 pb-4 pt-3 bg-white space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Not recommended</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Payment status is automatically managed by the Monobank webhook. Only use this if payment was received
                outside the system (bank transfer, cash).
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-wider font-bold text-[#31323E]/50">Force Payment Status</p>
              <div className="grid grid-cols-2 gap-1.5">
                {PAYMENT_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedStatus(s.value)}
                    className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border-2 transition-all text-left flex items-center gap-1.5 ${selectedStatus === s.value ? "ring-2 ring-offset-1 ring-[#31323E]" : "opacity-60 hover:opacity-100"}`}
                    style={{
                      backgroundColor: s.bg,
                      borderColor: selectedStatus === s.value ? s.border : "#E4E4E7",
                      color: s.text,
                    }}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (selectedStatus === order.payment_status) return;
                  if (
                    !window.confirm(
                      ` Force payment status to "${selectedStatus}"?\n\nThis overrides the Monobank webhook data.`,
                    )
                  )
                    return;
                  onPaymentOverride(selectedStatus);
                  setShowOverride(false);
                }}
                disabled={overrideSaving || selectedStatus === order.payment_status}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all disabled:opacity-40"
              >
                {overrideSaving ? "Saving" : "Apply Override"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

//  Phase 2: Fulfillment

export { PaymentPhase };
