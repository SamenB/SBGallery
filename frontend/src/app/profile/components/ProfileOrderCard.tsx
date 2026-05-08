"use client";

import { getImageUrl } from "@/utils";
import type { ProfileOrder } from "../types";
import { ProfileFulfillmentProgress } from "./ProfileFulfillmentProgress";
import { ProfileStatusBadge } from "./ProfileStatusBadge";

export function ProfileOrderCard({
  order,
  isExpanded,
  onToggle,
  convertPrice,
}: {
  order: ProfileOrder;
  isExpanded: boolean;
  onToggle: () => void;
  convertPrice: (price: number) => string;
}) {
  const fulfillmentStatus = order.fulfillment_status || "pending";
  return (
    <div
      className="overflow-hidden rounded-xl transition-all duration-300"
      style={{
        backgroundColor: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(12px) saturate(1.2)",
        WebkitBackdropFilter: "blur(12px) saturate(1.2)",
        border: "1px solid rgba(26,26,24,0.08)",
        boxShadow: isExpanded ? "0 12px 40px rgba(0,0,0,0.04)" : "0 4px 20px rgba(0,0,0,0.02)",
        transform: isExpanded ? "translateY(-2px)" : "none",
      }}
    >
      <button onClick={onToggle} className="flex w-full flex-col items-start justify-between gap-4 p-5 text-left outline-none sm:flex-row sm:items-center sm:p-6">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <ProfileStatusBadge status={order.payment_status} />
          </div>
          <p className="mb-4 font-sans text-[0.9rem] font-medium text-[var(--color-charcoal)]">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {order.items.length > 0 && (
              <span className="ml-2 font-normal text-[rgba(26,26,24,0.4)]">
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </span>
            )}
          </p>
          <ProfileFulfillmentProgress status={fulfillmentStatus} order={order} />
        </div>
        <div className="ml-0 mt-4 flex flex-shrink-0 items-center gap-4 sm:ml-4 sm:mt-0">
          <p className="font-price text-xl font-semibold tracking-tight text-[var(--color-charcoal)]">
            {convertPrice(order.total_price)}
          </p>
          <span className="text-[0.65rem] text-[rgba(26,26,24,0.4)]" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }}>
            v
          </span>
        </div>
      </button>
      {isExpanded && (
        <div className="space-y-6 border-t border-[rgba(26,26,24,0.06)] bg-white/50 px-5 py-6 sm:px-6">
          {order.items.length > 0 && (
            <div>
              <p className="mb-3 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-[rgba(26,26,24,0.4)]">
                Items
              </p>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const imgSrc = item.artwork?.images?.[0]
                    ? getImageUrl(item.artwork.images[0], "thumb")
                    : null;
                  return (
                    <div key={item.id} className="-mx-2 flex items-center gap-4 rounded-lg border-b border-[rgba(26,26,24,0.04)] px-2 py-3 transition-colors last:border-0 hover:bg-[rgba(26,26,24,0.01)]">
                      {imgSrc && <img src={imgSrc} alt="" className="h-12 w-12 flex-shrink-0 rounded border border-[rgba(26,26,24,0.06)] object-cover shadow-sm" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-[0.95rem] font-medium text-[var(--color-charcoal)]">
                          {item.artwork?.title || `Artwork #${item.artwork_id}`}
                        </p>
                        <p className="mt-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-[rgba(26,26,24,0.5)]">
                          {item.edition_type === "original" ? "Original" : "Print"}
                          {item.size && ` / ${item.size}`}
                          {item.finish && ` / ${item.finish}`}
                        </p>
                      </div>
                      <p className="font-price flex-shrink-0 text-lg font-semibold tracking-tight text-[var(--color-charcoal)]">
                        {convertPrice(item.price)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {(order.shipping_city || order.shipping_country) && (
            <div>
              <p className="mb-1 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-[rgba(26,26,24,0.4)]">
                Delivery Address
              </p>
              <p className="font-sans text-[0.85rem] font-medium text-[rgba(26,26,24,0.7)]">
                {[order.shipping_city, order.shipping_country].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
