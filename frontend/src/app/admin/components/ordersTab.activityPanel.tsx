"use client";

import { SectionLabel, OrderTimeline } from "./ordersTab.shared";

type OrderActivityPanelProps = {
  order: any;
  active: boolean;
  isEditing: boolean;
  saving: boolean;
  setIsEditing: (id: number | null) => void;
  setEditData: (data: any) => void;
  handlePatch: () => void;
  handleDelete: (id: number) => void;
};

export function OrderActivityPanel({
  order,
  active,
  isEditing,
  saving,
  setIsEditing,
  setEditData,
  handlePatch,
  handleDelete,
}: OrderActivityPanelProps) {
  return (
    <div className={active ? "space-y-6" : "hidden"}>
      <div className="bg-white border border-[#31323E]/10 rounded-xl p-5">
        <OrderTimeline order={order} />
      </div>
      <div className="bg-white border border-[#31323E]/10 rounded-xl p-5">
        <SectionLabel text="Admin Actions" />
        {isEditing ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePatch}
              disabled={saving}
              className="bg-[#31323E] text-white font-bold text-[11px] uppercase tracking-wider py-3 rounded-xl shadow-sm hover:bg-[#434455] transition-all disabled:opacity-50"
            >
              {saving ? "Saving" : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setIsEditing(null);
                setEditData(null);
              }}
              className="bg-[#31323E]/5 border border-[#31323E]/15 text-[#31323E] font-bold text-[11px] uppercase tracking-wider py-3 rounded-xl hover:bg-[#31323E]/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => {
                setEditData({ ...order });
                setIsEditing(order.id);
              }}
              className="w-full bg-[#31323E] text-white font-bold text-[11px] uppercase tracking-wider py-3 rounded-xl shadow-sm hover:bg-[#434455] transition-all"
            >
              Edit Order Data
            </button>
            <button
              onClick={() => handleDelete(order.id)}
              className="w-full bg-white text-red-500 hover:bg-red-500 hover:text-white font-bold text-[11px] uppercase tracking-wider py-3 rounded-xl border border-red-200 hover:border-red-500 transition-all shadow-sm"
            >
              Delete Permanently
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
