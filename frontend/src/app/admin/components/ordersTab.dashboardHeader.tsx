"use client";

import {
  FULFILLMENT_STEPS,
  PAYMENT_STATUS_MAP,
  PAYMENT_STATUSES,
} from "./ordersTab.shared";

type OrdersDashboardHeaderProps = {
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
    <div className="mb-5 border-b border-[#31323E]/8 pb-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <OrdersFilterTabs
          mainTab={mainTab}
          showAdvanced={showAdvanced}
          filterType={filterType}
          statusFilter={statusFilter}
          onMainTabChange={onMainTabChange}
          onShowAdvancedChange={onShowAdvancedChange}
          onFilterTypeChange={onFilterTypeChange}
          onStatusFilterChange={onStatusFilterChange}
        />
        <ProdigiModeControl
          prodigiMode={prodigiMode}
          prodigiModeDraft={prodigiModeDraft}
          modeSaving={modeSaving}
          onDraftChange={onProdigiModeDraftChange}
          onSave={onSaveProdigiMode}
        />
      </div>
    </div>
  );
}

function ProdigiModeControl({
  prodigiMode,
  prodigiModeDraft,
  modeSaving,
  onDraftChange,
  onSave,
}: Pick<
  OrdersDashboardHeaderProps,
  "prodigiMode" | "prodigiModeDraft" | "modeSaving"
> & {
  onDraftChange: OrdersDashboardHeaderProps["onProdigiModeDraftChange"];
  onSave: () => void;
}) {
  const hasChanges = prodigiModeDraft !== prodigiMode;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#31323E]/10 bg-white px-2 py-1.5 shadow-sm">
      <span className="pl-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#31323E]/35">
        Submit mode
      </span>
      <div className="flex rounded-md bg-[#31323E]/5 p-0.5">
        {(["automatic", "manual"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onDraftChange(mode)}
            disabled={modeSaving}
            className={`rounded px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition-all disabled:opacity-60 ${
              prodigiModeDraft === mode
                ? "bg-[#31323E] text-white shadow-sm"
                : "text-[#31323E]/45 hover:text-[#31323E]"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={modeSaving || !hasChanges}
        className="rounded-md border border-[#31323E]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#31323E]/55 transition-all hover:border-[#31323E]/25 hover:text-[#31323E] disabled:opacity-35"
      >
        {modeSaving ? "Saving" : "Save"}
      </button>
    </div>
  );
}

function OrdersFilterTabs(
  props: Pick<
    OrdersDashboardHeaderProps,
    | "mainTab"
    | "showAdvanced"
    | "filterType"
    | "statusFilter"
    | "onMainTabChange"
    | "onShowAdvancedChange"
    | "onFilterTypeChange"
    | "onStatusFilterChange"
  >,
) {
  const {
    mainTab,
    showAdvanced,
    filterType,
    statusFilter,
    onMainTabChange,
    onShowAdvancedChange,
    onFilterTypeChange,
    onStatusFilterChange,
  } = props;
  const statusOptions =
    filterType === "fulfillment"
      ? [...FULFILLMENT_STEPS.map((step) => step.value), "cancelled", "pending"]
      : PAYMENT_STATUSES.map((status) => status.value);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex rounded-lg bg-[#31323E]/5 p-1">
        {(["active", "completed"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              onMainTabChange(tab);
              onShowAdvancedChange(false);
            }}
            className={`rounded-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all ${
              mainTab === tab
                ? "bg-white text-[#31323E] shadow-sm"
                : "text-[#31323E]/45 hover:text-[#31323E]"
            }`}
          >
            {tab}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            onMainTabChange("advanced");
            onShowAdvancedChange(!showAdvanced);
          }}
          className={`rounded-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all ${
            mainTab === "advanced"
              ? "bg-[#31323E] text-white shadow-sm"
              : "text-[#31323E]/45 hover:text-[#31323E]"
          }`}
        >
          Filters
        </button>
      </div>

      {mainTab === "advanced" && showAdvanced ? (
        <div className="flex flex-col gap-2 rounded-lg border border-[#31323E]/10 bg-white p-3 shadow-sm">
          <div className="flex gap-2">
            {(["fulfillment", "payment"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onFilterTypeChange(type);
                  onStatusFilterChange("all");
                }}
                className={`rounded-md border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition-all ${
                  filterType === type
                    ? "border-[#31323E] bg-[#31323E] text-white"
                    : "border-[#31323E]/12 bg-white text-[#31323E]/50 hover:border-[#31323E]/25"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex max-w-[760px] flex-wrap gap-1.5">
            <StatusFilterButton
              active={statusFilter === "all"}
              onClick={() => onStatusFilterChange("all")}
              label="All"
            />
            {statusOptions.map((status) => (
              <StatusFilterButton
                key={status}
                active={statusFilter === status}
                onClick={() => onStatusFilterChange(status)}
                label={
                  filterType === "fulfillment"
                    ? FULFILLMENT_STEPS.find((step) => step.value === status)
                        ?.label || status
                    : PAYMENT_STATUS_MAP[status]?.label || status
                }
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusFilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] transition-all ${
        active
          ? "border-[#31323E] bg-[#31323E] text-white"
          : "border-[#31323E]/12 bg-white text-[#31323E]/50 hover:border-[#31323E]/25"
      }`}
    >
      {label}
    </button>
  );
}
