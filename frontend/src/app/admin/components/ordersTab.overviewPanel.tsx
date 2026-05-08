"use client";

import { getImageUrl } from "@/utils";
import { SectionLabel, inputCls } from "./ordersTab.shared";

type OrderOverviewPanelProps = {
  order: any;
  active: boolean;
  isEditing: boolean;
  editData: any;
  setEditData: (data: any) => void;
};

export function OrderOverviewPanel({
  order,
  active,
  isEditing,
  editData,
  setEditData,
}: OrderOverviewPanelProps) {
  return (
    <>
      {/*  Col 1: Customer + Items + Address  */}{" "}
      <div className={active ? "space-y-6" : "hidden"}>
        {" "}
        {/* Customer */}{" "}
        <div className="bg-white border border-[#31323E]/10 rounded-xl p-5">
          {" "}
          <SectionLabel text="Customer" />{" "}
          {isEditing ? (
            <div className="space-y-2">
              {" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <input
                  className={inputCls}
                  value={editData.first_name || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      first_name: e.target.value,
                    })
                  }
                  placeholder="First Name"
                />{" "}
                <input
                  className={inputCls}
                  value={editData.last_name || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      last_name: e.target.value,
                    })
                  }
                  placeholder="Last Name"
                />{" "}
              </div>{" "}
              <input
                className={inputCls}
                value={editData.email || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    email: e.target.value,
                  })
                }
                placeholder="Email"
              />{" "}
              <input
                className={inputCls}
                value={editData.phone || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone"
              />{" "}
            </div>
          ) : (
            <div className="space-y-0.5">
              {" "}
              <p className="font-bold text-base text-[#31323E]">
                {" "}
                {order.first_name} {order.last_name}{" "}
              </p>{" "}
              <p className="text-xs text-[#31323E]/60 font-medium">
                {order.email}
              </p>{" "}
              <p className="text-xs text-[#31323E]/60 font-medium">
                {order.phone}
              </p>{" "}
            </div>
          )}{" "}
        </div>{" "}
        {/* Items */}{" "}
        <div className="bg-white border border-[#31323E]/10 rounded-xl p-5">
          {" "}
          <SectionLabel text="Items Ordered" />{" "}
          <div className="space-y-2">
            {" "}
            {(order.items || []).map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex gap-3 p-3 bg-[#31323E]/2 rounded-lg border border-[#31323E]/8"
              >
                {item.artwork?.images?.[0] && (
                  <img
                    src={getImageUrl(item.artwork.images[0], "thumb")}
                    className="w-11 h-11 object-cover rounded-lg border border-[#31323E]/10 flex-shrink-0"
                    alt=""
                  />
                )}{" "}
                <div className="flex-1 min-w-0">
                  {" "}
                  <p className="text-sm font-bold text-[#31323E] truncate">
                    {item.artwork?.title || "Untitled"}
                  </p>{" "}
                  <p className="text-[10px] font-semibold text-[#31323E]/50 uppercase tracking-wider mt-0.5">
                    {" "}
                    {item.edition_type === "original"
                      ? "Original"
                      : "Print"}{" "}
                    {item.size ? `  ${item.size}` : ""}{" "}
                    {item.finish ? `  ${item.finish}` : ""}{" "}
                  </p>{" "}
                </div>{" "}
                <p className="text-sm font-bold text-[#31323E] flex-shrink-0">
                  ${item.price}
                </p>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {/* Shipping Address */}{" "}
        <div className="bg-white border border-[#31323E]/10 rounded-xl p-5">
          {" "}
          <SectionLabel text="Shipping Address" />{" "}
          {isEditing ? (
            <div className="space-y-2">
              {" "}
              <input
                className={inputCls}
                value={editData.shipping_address_line1 || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    shipping_address_line1: e.target.value,
                  })
                }
                placeholder="Street"
              />{" "}
              <input
                className={inputCls}
                value={editData.shipping_address_line2 || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    shipping_address_line2: e.target.value,
                  })
                }
                placeholder="Apt / Suite"
              />{" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <input
                  className={inputCls}
                  value={editData.shipping_city || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      shipping_city: e.target.value,
                    })
                  }
                  placeholder="City"
                />{" "}
                <input
                  className={inputCls}
                  value={editData.shipping_postal_code || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      shipping_postal_code: e.target.value,
                    })
                  }
                  placeholder="Postal"
                />{" "}
              </div>{" "}
              <input
                className={inputCls}
                value={editData.shipping_country || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    shipping_country: e.target.value,
                  })
                }
                placeholder="Country"
              />{" "}
            </div>
          ) : (
            <div className="text-sm text-[#31323E] space-y-0.5">
              {" "}
              {order.shipping_address_line1 ? (
                <>
                  {" "}
                  <p className="font-semibold">
                    {order.shipping_address_line1}
                  </p>{" "}
                  {order.shipping_address_line2 && (
                    <p className="text-[#31323E]/60 font-medium">
                      {order.shipping_address_line2}
                    </p>
                  )}{" "}
                  <p className="text-[#31323E]/60 font-medium">
                    {" "}
                    {order.shipping_city}{" "}
                    {order.shipping_postal_code
                      ? `, ${order.shipping_postal_code}`
                      : ""}
                  </p>{" "}
                  <p className="text-[10px] uppercase tracking-widest text-[#31323E]/40 font-bold pt-0.5">
                    {" "}
                    {order.shipping_country}{" "}
                    {order.shipping_country_code
                      ? `(${order.shipping_country_code})`
                      : ""}{" "}
                  </p>{" "}
                  {order.shipping_notes && (
                    <div className="mt-2 p-2.5 bg-[#31323E]/4 rounded-lg text-[#31323E]/70 text-[11px] font-medium border border-[#31323E]/8">
                      &ldquo;{order.shipping_notes}&rdquo;
                    </div>
                  )}{" "}
                </>
              ) : (
                <p className="text-[#31323E]/25 font-medium italic">
                  No shipping address.
                </p>
              )}{" "}
            </div>
          )}{" "}
        </div>{" "}
        {/* Discovery */}{" "}
        {order.discovery_source && (
          <div className="bg-white border border-[#31323E]/10 rounded-xl p-4">
            {" "}
            <SectionLabel text="Discovery Source" />{" "}
            <p className="text-sm text-[#31323E] font-medium">
              {order.discovery_source}
            </p>{" "}
            {order.promo_code && (
              <p className="text-xs font-bold text-[#31323E]/50 uppercase tracking-wider mt-1">
                Promo: {order.promo_code}
              </p>
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </>
  );
}

