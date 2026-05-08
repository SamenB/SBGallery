import { SectionLabel } from "./ordersTab.constants";

function OrderTimeline({ order }: { order: any }) {
  const steps = [
    { key: "created_at", label: "Order Placed", icon: "" },
    { key: "confirmed_at", label: "Payment & Confirmed", icon: "" },
    { key: "print_ordered_at", label: "Print Ordered", icon: "" },
    { key: "print_received_at", label: "Print Received", icon: "" },
    { key: "shipped_at", label: "Shipped", icon: "" },
    { key: "delivered_at", label: "Delivered", icon: "" },
  ];
  const activeSteps = steps.filter((s) => order[s.key]);
  if (activeSteps.length === 0) return null;

  return (
    <div>
      <SectionLabel text="Order Timeline" />
      <div className="relative pl-6 space-y-4">
        <div className="absolute left-[9px] top-1 bottom-1 w-px bg-[#31323E]/10" />
        {steps.map((step) => {
          const ts = order[step.key];
          if (!ts) return null;
          return (
            <div key={step.key} className="relative flex items-start gap-3">
              <div className="absolute -left-6 w-4 h-4 rounded-full bg-white border-2 border-[#31323E]/25 flex items-center justify-center text-[8px] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-[#31323E]">{step.label}</p>
                <p className="text-[10px] text-[#31323E]/50 font-medium">
                  {new Date(ts).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { OrderTimeline };
