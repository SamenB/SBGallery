"use client";

import { PAYMENT_STATUS_MAP, PAYMENT_STATUSES, FULFILLMENT_STEPS } from "./ordersTab.shared";

type OrdersDashboardHeaderProps = {
  totalCount: number;
  activeCount: number;
  paidCount: number;
  shippedCount: number;
  prodigiMode: "automatic" | "manual";
  prodigiModeDraft: "automatic" | "manual";
  modeSaving: boolean;
  mainTab: "active" | "completed" | "advanced";
  showAdvanced: boolean;
  filterType: "payment" | "fulfillment";
  statusFilter: string;
  onProdigiModeDraftChange: (mode: "automatic" | "manual") => void;
  onSaveProdigiMode: () => void;
  onMainTabChange: (tab: "active" | "completed" | "advanced") => void;
  onShowAdvancedChange: (value: boolean) => void;
  onFilterTypeChange: (type: "payment" | "fulfillment") => void;
  onStatusFilterChange: (status: string) => void;
};

export function OrdersDashboardHeader({
  totalCount,
  activeCount,
  paidCount,
  shippedCount,
  prodigiMode,
  prodigiModeDraft,
  modeSaving,
  mainTab,
  showAdvanced,
  filterType,
  statusFilter,
  onProdigiModeDraftChange,
  onSaveProdigiMode,
  onMainTabChange,
  onShowAdvancedChange,
  onFilterTypeChange,
  onStatusFilterChange,
}: OrdersDashboardHeaderProps) {
  return (
    <div className="pb-8 mb-8 border-b border-[#31323E]/8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#31323E] mb-1">Orders</h2>
          <p className="text-sm text-[#31323E]/50 font-medium">{totalCount} total orders manage payment & fulfillment lifecycle</p>
        </div>
        <div className="flex flex-wrap gap-3 flex-shrink-0">
          <ProdigiModeControl prodigiMode={prodigiMode} prodigiModeDraft={prodigiModeDraft} modeSaving={modeSaving} onDraftChange={onProdigiModeDraftChange} onSave={onSaveProdigiMode} />
          <MetricCard tone="dark" value={activeCount} label="Active" />
          <MetricCard tone="green" value={paidCount} label="Paid" />
          <MetricCard tone="blue" value={shippedCount} label="Shipped" />
        </div>
      </div>
      <OrdersFilterTabs
        mainTab={mainTab}
        showAdvanced={showAdvanced}
        activeCount={activeCount}
        filterType={filterType}
        statusFilter={statusFilter}
        onMainTabChange={onMainTabChange}
        onShowAdvancedChange={onShowAdvancedChange}
        onFilterTypeChange={onFilterTypeChange}
        onStatusFilterChange={onStatusFilterChange}
      />
    </div>
  );
}

function ProdigiModeControl({ prodigiMode, prodigiModeDraft, modeSaving, onDraftChange, onSave }: Pick<OrdersDashboardHeaderProps, "prodigiMode" | "prodigiModeDraft" | "modeSaving"> & { onDraftChange: OrdersDashboardHeaderProps["onProdigiModeDraftChange"]; onSave: () => void }) {
  return (
    <div className="rounded-xl border border-[#31323E]/10 bg-white p-3 shadow-sm">
      <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#31323E]/35">Prodigi submit mode</p>
      <div className="flex gap-1">
        {(["automatic", "manual"] as const).map((mode) => (
          <button key={mode} onClick={() => onDraftChange(mode)} disabled={modeSaving} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] rounded-lg transition-all disabled:opacity-70 ${prodigiModeDraft === mode ? "bg-[#31323E] text-white" : "text-[#31323E]/45 hover:bg-[#31323E]/5"}`}>
            {mode}
          </button>
        ))}
      </div>
      <button type="button" onClick={onSave} disabled={modeSaving || prodigiModeDraft === prodigiMode} className="mt-2 w-full rounded-lg bg-[#31323E] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-all disabled:opacity-35">
        {modeSaving ? "Saving" : "Save Mode"}
      </button>
    </div>
  );
}

function MetricCard({ tone, value, label }: { tone: "dark" | "green" | "blue"; value: number; label: string }) {
  const cls =
    tone === "dark"
      ? "bg-[#31323E] text-white"
      : tone === "green"
        ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
        : "bg-blue-50 border border-blue-100 text-blue-600";
  const labelCls = tone === "dark" ? "text-white/60" : tone === "green" ? "text-emerald-500/80" : "text-blue-500/80";
  return (
    <div className={`${cls} rounded-xl px-4 py-3 text-center shadow-sm min-w-[70px]`}>
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className={`text-[10px] font-bold uppercase tracking-wider ${labelCls} mt-1`}>{label}</div>
    </div>
  );
}

function OrdersFilterTabs(props: Pick<OrdersDashboardHeaderProps, "mainTab" | "showAdvanced" | "activeCount" | "filterType" | "statusFilter" | "onMainTabChange" | "onShowAdvancedChange" | "onFilterTypeChange" | "onStatusFilterChange">) {
  const { mainTab, showAdvanced, activeCount, filterType, statusFilter, onMainTabChange, onShowAdvancedChange, onFilterTypeChange, onStatusFilterChange } = props;
  const statusOptions = filterType === "fulfillment" ? [...FULFILLMENT_STEPS.map((step) => step.value), "cancelled", "pending"] : PAYMENT_STATUSES.map((status) => status.value);
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6 items-start">
      <div className="flex bg-[#31323E]/5 rounded-xl p-1 gap-0.5">
        {(["active", "completed"] as const).map((tab) => (
          <button key={tab} onClick={() => { onMainTabChange(tab); onShowAdvancedChange(false); }} className={`px-5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${mainTab === tab ? "bg-white text-[#31323E] shadow-sm" : "text-[#31323E]/50 hover:text-[#31323E]"}`}>
            {tab}
            {tab === "active" && activeCount > 0 && <span className="ml-1.5 bg-[#31323E] text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">{activeCount}</span>}
          </button>
        ))}
        <button onClick={() => { onMainTabChange("advanced"); onShowAdvancedChange(!showAdvanced); }} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${mainTab === "advanced" ? "bg-[#31323E] text-white shadow-sm" : "text-[#31323E]/50 hover:text-[#31323E]"}`}>
          Filters
        </button>
      </div>
      {mainTab === "advanced" && showAdvanced && (
        <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-[#31323E]/10 shadow-sm">
          <div className="flex gap-2">
            {(["fulfillment", "payment"] as const).map((type) => (
              <button key={type} onClick={() => { onFilterTypeChange(type); onStatusFilterChange("all"); }} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${filterType === type ? "bg-[#31323E] text-white border-[#31323E]" : "bg-white text-[#31323E]/60 border-[#31323E]/15 hover:border-[#31323E]/30"}`}>
                {type}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StatusFilterButton active={statusFilter === "all"} onClick={() => onStatusFilterChange("all")} label="All" />
            {statusOptions.map((status) => (
              <StatusFilterButton key={status} active={statusFilter === status} onClick={() => onStatusFilterChange(status)} label={filterType === "fulfillment" ? FULFILLMENT_STEPS.find((step) => step.value === status)?.label || status : PAYMENT_STATUS_MAP[status]?.label || status} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusFilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all ${active ? "bg-[#31323E] text-white border-[#31323E]" : "bg-white text-[#31323E]/50 border-[#31323E]/12 hover:border-[#31323E]/25"}`}>
      {label}
    </button>
  );
}
