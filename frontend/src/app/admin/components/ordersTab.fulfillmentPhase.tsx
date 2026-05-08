import { useState } from "react";
import { CARRIERS, PAID_STATUSES, SectionLabel, getFulfillmentSteps, inputCls, orderHasPrints } from "./ordersTab.constants";

function FulfillmentPhase({
  order,
  onStatusChange,
  saving,
}: {
  order: any;
  onStatusChange: (status: string, extra?: { tracking_number?: string; carrier?: string; notes?: string }) => void;
  saving: boolean;
}) {
  const hasPrints = orderHasPrints(order);
  const steps = getFulfillmentSteps(hasPrints);
  const stepValues = steps.map((s) => s.value);

  const [notes, setNotes] = useState(order.notes || "");
  const [trackingNum, setTrackingNum] = useState(order.tracking_number || "");
  const [carrier, setCarrier] = useState(order.carrier || "nova_poshta");
  const [showShipping, setShowShipping] = useState(false);

  const isPaid = PAID_STATUSES.has(order.payment_status);
  const isCancelled = order.fulfillment_status === "cancelled";
  const currentIdx = stepValues.indexOf(order.fulfillment_status);
  const nextStep = currentIdx >= 0 && currentIdx < stepValues.length - 1 ? steps[currentIdx + 1] : null;

  const handleAdvance = () => {
    if (!nextStep) return;
    if (nextStep.value === "shipped") {
      setShowShipping(true);
      return;
    }
    if (!window.confirm(`Advance fulfillment to "${nextStep.label}"?`)) return;
    onStatusChange(nextStep.value, { notes: notes || undefined });
  };

  const handleConfirmShip = () => {
    if (!window.confirm(`Mark order as Shipped with carrier "${CARRIERS.find((c) => c.value === carrier)?.label}"?`))
      return;
    onStatusChange("shipped", {
      tracking_number: trackingNum || undefined,
      carrier: carrier || undefined,
      notes: notes || undefined,
    });
    setShowShipping(false);
  };

  if (!isPaid && !isCancelled) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[#31323E]/10 p-6 text-center bg-[#31323E]/2">
        <div className="text-3xl mb-2"></div>
        <p className="font-bold text-[#31323E] text-sm mb-1">Fulfillment Locked</p>
        <p className="text-xs text-[#31323E]/40 font-medium leading-relaxed">
          Awaiting payment confirmation.
          <br />
          Unlocks automatically when Monobank confirms.
        </p>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
        <p className="text-red-600 text-sm font-bold mb-1">Order Cancelled</p>
        <p className="text-xs text-red-500 font-medium">
          {order.payment_status === "failed" || order.payment_status === "refunded"
            ? "Auto-cancelled due to payment failure. Original artwork released back to inventory."
            : "This order has been cancelled."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pipeline steps rail */}
      <div>
        <SectionLabel text="Fulfillment Steps" />
        {!hasPrints && (
          <p className="text-[10px] text-[#31323E]/40 font-medium mb-2 leading-relaxed">
            Original-only order print steps skipped.
          </p>
        )}
        <div className="space-y-1.5">
          {steps.map((step, idx) => {
            const isCurrent = step.value === order.fulfillment_status;
            const isPast = currentIdx > idx;
            const isClickable = !step.auto && !saving;

            return (
              <button
                key={step.value}
                onClick={() => {
                  if (!isClickable) return;
                  if (step.value === "shipped") {
                    setShowShipping(true);
                    return;
                  }
                  if (!window.confirm(`Set fulfillment status to "${step.label}"?`)) return;
                  onStatusChange(step.value, { notes: notes || undefined });
                }}
                disabled={saving || step.auto}
                title={step.auto ? `Auto-set: ${step.desc}` : step.desc}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  isCurrent ? "shadow-sm" : isPast ? "opacity-80 hover:opacity-100" : "opacity-30 hover:opacity-50"
                } ${isClickable && !isCurrent ? "cursor-pointer" : "cursor-default"}`}
                style={{
                  backgroundColor: isCurrent ? "#fff" : isPast ? "#F8FAFC" : "#fff",
                  borderColor: isCurrent ? "#31323E" : isPast ? "#A1A1AA" : "#E4E4E7",
                  color: isCurrent ? "#31323E" : isPast ? "#52525B" : "#A1A1AA",
                }}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 border-2 ${
                    isCurrent
                      ? "bg-[#31323E] text-white border-[#31323E]"
                      : isPast
                        ? "bg-white text-[#31323E] border-[#A1A1AA]"
                        : "bg-white text-[#D4D4D8] border-[#E4E4E7]"
                  }`}
                >
                  {isPast ? "" : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold">
                      {step.icon} {step.label}
                    </span>
                    {step.auto && (
                      <span className="text-[8px] uppercase tracking-wider font-bold bg-blue-50 text-blue-500 border border-blue-100 px-1.5 py-0.5 rounded-full">
                        Auto
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[8px] uppercase tracking-wider font-bold bg-[#31323E] text-white px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] opacity-60 mt-0.5 font-medium">{step.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick advance */}
      {nextStep && !showShipping && (
        <button
          onClick={handleAdvance}
          disabled={saving}
          className="w-full py-3 bg-[#31323E] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#434455] transition-all shadow-sm disabled:opacity-50"
        >
          {saving ? "Updating" : ` Advance to: ${nextStep.label}`}
        </button>
      )}

      {/* Shipping input panel */}
      {showShipping && (
        <div className="p-4 bg-white border-2 border-[#31323E]/15 rounded-xl space-y-3">
          <SectionLabel text="Shipping Details" />
          <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className={inputCls}>
            {CARRIERS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
            <option value="">Other / Manual</option>
          </select>
          <input
            value={trackingNum}
            onChange={(e) => setTrackingNum(e.target.value)}
            placeholder="Tracking / TTN number"
            className={inputCls}
          />
          <div className="flex gap-2">
            <button
              onClick={handleConfirmShip}
              disabled={saving}
              className="flex-1 py-2.5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
            >
              {saving ? "Saving" : " Mark as Shipped"}
            </button>
            <button
              onClick={() => setShowShipping(false)}
              className="px-4 py-2.5 border border-[#31323E]/15 text-[#31323E] text-[10px] font-bold rounded-lg hover:bg-[#31323E]/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tracking info */}
      {order.fulfillment_status === "shipped" && order.tracking_number && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <SectionLabel text="Tracking Info" />
          <p className="text-sm text-emerald-800 font-semibold">
            {CARRIERS.find((c) => c.value === order.carrier)?.label || order.carrier}
            {"  "}
            <span className="font-bold font-mono">{order.tracking_number}</span>
          </p>
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-emerald-700 underline hover:text-emerald-900 mt-1.5 inline-block font-medium"
            >
              Track Parcel
            </a>
          )}
        </div>
      )}

      {/* Cancel order */}
      {order.fulfillment_status !== "delivered" && (
        <button
          onClick={() => {
            if (!window.confirm("Cancel this order? Original artworks will be returned to inventory.")) return;
            onStatusChange("cancelled");
          }}
          disabled={saving}
          className="w-full text-[10px] uppercase tracking-widest font-bold text-red-300 hover:text-red-600 transition-colors py-1.5"
        >
          Cancel Order
        </button>
      )}

      {/* Admin notes */}
      <div>
        <SectionLabel text="Internal Notes (not visible to customer)" />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Fragile  bubble wrap. Packed 4 May."
          rows={2}
          className={inputCls}
        />
      </div>
    </div>
  );
}

// Order Timeline

export { FulfillmentPhase };
