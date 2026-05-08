import type { OrderDetailTab } from "./ordersTab.types";
import type { AdminOrder, AdminOrderItem } from "./ordersTab.types";

//  Constants

const PAYMENT_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    bg: "#F9F9F9",
    border: "#E4E4E7",
    text: "#71717A",
    icon: "",
  },
  {
    value: "awaiting_payment",
    label: "Awaiting Bank",
    bg: "#FEFCE8",
    border: "#FDE047",
    text: "#854D0E",
    icon: "",
  },
  {
    value: "processing",
    label: "Processing",
    bg: "#EFF6FF",
    border: "#93C5FD",
    text: "#1D4ED8",
    icon: "",
  },
  {
    value: "hold",
    label: "On Hold",
    bg: "#F8FAFC",
    border: "#94A3B8",
    text: "#475569",
    icon: "",
  },
  {
    value: "paid",
    label: "Paid",
    bg: "#F0FDF4",
    border: "#22C55E",
    text: "#15803D",
    icon: "",
  },
  {
    value: "mock_paid",
    label: "Mock Paid",
    bg: "#F0FDF4",
    border: "#86EFAC",
    text: "#15803D",
    icon: "",
  },
  {
    value: "failed",
    label: "Failed",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    text: "#991B1B",
    icon: "",
  },
  {
    value: "refunded",
    label: "Refunded",
    bg: "#FAF5FF",
    border: "#C4B5FD",
    text: "#6B21A8",
    icon: "",
  },
];

const PAYMENT_STATUS_MAP = Object.fromEntries(
  PAYMENT_STATUSES.map((s) => [s.value, s]),
);

// Print edition types that trigger print-specific fulfillment steps
const PRINT_EDITION_TYPES = new Set([
  "canvas_print",
  "canvas_print_limited",
  "paper_print",
  "paper_print_limited",
]);

function orderHasPrints(order: Pick<AdminOrder, "items">): boolean {
  return (
    order.items?.some((item: AdminOrderItem) =>
      Boolean(item.edition_type && PRINT_EDITION_TYPES.has(item.edition_type)),
    ) ?? false
  );
}

function orderSegmentLabel(
  order: Pick<AdminOrder, "checkout_segment">,
): string | null {
  if (order.checkout_segment === "originals") {
    return "Original shipment";
  }
  if (order.checkout_segment === "prints") {
    return "Print fulfillment";
  }
  return null;
}

// Base fulfillment steps (always present)
const BASE_STEPS = [
  {
    value: "confirmed",
    label: "Confirmed",
    icon: "",
    auto: true,
    desc: "Auto-set when payment received",
  },
  {
    value: "packaging",
    label: "Packaging",
    icon: "",
    auto: false,
    desc: "Preparing parcel",
  },
  {
    value: "shipped",
    label: "Shipped",
    icon: "",
    auto: false,
    desc: "Dispatched with TTN",
  },
  {
    value: "delivered",
    label: "Delivered",
    icon: "",
    auto: false,
    desc: "Received by buyer",
  },
];

// Extra steps inserted after "confirmed" when prints are present
const PRINT_STEPS = [
  {
    value: "print_ordered",
    label: "Print Ordered",
    icon: "",
    auto: false,
    desc: "Sent to print studio",
  },
  {
    value: "print_received",
    label: "Print Received",
    icon: "",
    auto: false,
    desc: "Artwork back from studio",
  },
];

function getFulfillmentSteps(hasPrints: boolean) {
  if (!hasPrints) return BASE_STEPS;
  // Insert print steps between "confirmed" and "packaging"
  return [
    BASE_STEPS[0], // confirmed
    ...PRINT_STEPS, // print_ordered, print_received
    ...BASE_STEPS.slice(1), // packaging, shipped, delivered
  ];
}

// Legacy flat array (used only for filter pills in the advanced filter UI)
const FULFILLMENT_STEPS = getFulfillmentSteps(true);

// show all possible statuses in filter
const FULFILLMENT_STEP_VALUES = FULFILLMENT_STEPS.map((s) => s.value);

const CARRIERS = [
  { value: "nova_poshta", label: "Nova Poshta" },
  { value: "ukrposhta", label: "Ukrposhta" },
  { value: "dhl", label: "DHL" },
  { value: "fedex", label: "FedEx" },
  { value: "ups", label: "UPS" },
  { value: "meest", label: "Meest Express" },
];

const PAID_STATUSES = new Set(["paid", "mock_paid"]);

const ORDER_DETAIL_TABS: Array<{
  id: OrderDetailTab;
  label: string;
  desc: string;
}> = [
  { id: "overview", label: "Overview", desc: "Customer, items, shipping" },
  { id: "lifecycle", label: "Lifecycle", desc: "Payment and fulfillment" },
  { id: "prodigi", label: "Prodigi", desc: "Provider gates and cost" },
  { id: "activity", label: "Activity", desc: "Timeline and admin actions" },
];

//  Shared Input Styles

const inputCls =
  "w-full bg-white border border-[#31323E]/15 rounded-lg px-3 py-2 text-sm font-medium text-[#31323E] focus:outline-none focus:border-[#31323E]/50 focus:ring-2 focus:ring-[#31323E]/10 placeholder-[#31323E]/30 transition-all";

//  Tiny helpers

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#31323E]/40 mb-2.5 leading-none">
      {text}
    </p>
  );
}

function PaymentBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "lg";
}) {
  const cfg = PAYMENT_STATUS_MAP[status] || {
    bg: "#F9F9F9",
    border: "#E4E4E7",
    text: "#71717A",
    label: status,
    icon: "?",
  };
  const cls =
    size === "lg"
      ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border-2"
      : "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border";
  return (
    <span
      className={cls}
      style={{
        backgroundColor: cfg.bg,
        borderColor: cfg.border,
        color: cfg.text,
      }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

function FulfillmentBadge({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 border border-red-200 text-red-600">
        Cancelled
      </span>
    );
  }
  const step = FULFILLMENT_STEPS.find((s) => s.value === status);
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#31323E]/5 border border-[#31323E]/15 text-[#31323E]">
      {step?.icon || ""} {step?.label || status}
    </span>
  );
}

export {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_MAP,
  PRINT_EDITION_TYPES,
  orderHasPrints,
  orderSegmentLabel,
  BASE_STEPS,
  PRINT_STEPS,
  getFulfillmentSteps,
  FULFILLMENT_STEPS,
  FULFILLMENT_STEP_VALUES,
  CARRIERS,
  PAID_STATUSES,
  ORDER_DETAIL_TABS,
  inputCls,
  SectionLabel,
  PaymentBadge,
  FulfillmentBadge,
};
