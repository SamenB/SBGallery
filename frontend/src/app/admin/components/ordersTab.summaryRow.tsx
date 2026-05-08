import { getImageUrl } from "@/utils";
import {
  FulfillmentBadge,
  PaymentBadge,
  orderHasPrints,
  orderSegmentLabel,
} from "./ordersTab.shared";
import type { AdminOrder, OrderDetailTab } from "./ordersTab.types";

export function OrderSummaryRow({
  order,
  isExpanded,
  setExpandedId,
  setOrderDetailTabs,
  loadProdigiFlow,
}: {
  order: AdminOrder;
  isExpanded: boolean;
  setExpandedId: (id: number | null) => void;
  setOrderDetailTabs: React.Dispatch<
    React.SetStateAction<Record<number, OrderDetailTab>>
  >;
  loadProdigiFlow: (orderId: number) => void;
}) {
  const thumbnail = order.items?.[0]?.artwork?.images?.[0];

  return (
    <button
      onClick={() => {
        const nextExpanded = isExpanded ? null : order.id;
        setExpandedId(nextExpanded);
        if (nextExpanded) {
          setOrderDetailTabs((previous) => ({
            ...previous,
            [order.id]: previous[order.id] ?? "overview",
          }));
        }
        if (nextExpanded && orderHasPrints(order)) {
          void loadProdigiFlow(order.id);
        }
      }}
      className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#31323E]/1"
    >
      <div className="relative h-12 w-12 flex-shrink-0">
        {thumbnail ? (
          <img
            src={getImageUrl(thumbnail, "thumb")}
            className="h-full w-full rounded-lg border border-[#31323E]/10 object-cover"
            alt=""
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#31323E]/5 text-lg font-bold text-[#31323E]/20" />
        )}
        {(order.items?.length ?? 0) > 1 && (
          <span className="absolute -bottom-1 -right-1 rounded-full bg-[#31323E] px-1.5 py-0.5 text-[9px] font-bold text-white shadow ring-2 ring-white">
            +{(order.items?.length ?? 1) - 1}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#31323E]/40">
            #{order.id}
          </span>
          {orderSegmentLabel(order) && (
            <span className="rounded-md border border-[#31323E]/15 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#31323E]/45">
              {orderSegmentLabel(order)}
            </span>
          )}
          <PaymentBadge status={order.payment_status} />
          <FulfillmentBadge status={order.fulfillment_status || "pending"} />
        </div>
        <h3 className="truncate text-base font-bold leading-tight text-[#31323E]">
          {order.first_name} {order.last_name}
        </h3>
        <p className="mt-0.5 truncate text-[11px] font-semibold text-[#31323E]/50">
          {order.items
            ?.map((item) => item.artwork?.title || "Artwork")
            .join("  ")}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden text-right lg:block">
          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-[#31323E]/40">
            Date
          </p>
          <p className="text-xs font-semibold text-[#31323E]">
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="min-w-[70px] text-right">
          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-[#31323E]/40">
            Total
          </p>
          <p className="text-lg font-bold text-[#31323E]">
            ${order.total_price}
          </p>
        </div>
        <div
          className={`text-[#31323E]/25 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </button>
  );
}
