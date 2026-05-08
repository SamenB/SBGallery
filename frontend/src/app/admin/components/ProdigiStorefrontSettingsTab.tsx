"use client";

import { RefreshCcw, Save } from "lucide-react";
import {
  ActivePayloadStatus,
  PolicyDefaultsPanel,
  ProductionPreparePanel,
} from "./prodigiStorefrontSettings.sections";
import { CategoryPolicyList } from "./prodigiStorefrontSettings.categoryPolicy";
import { useProdigiStorefrontSettings } from "./useProdigiStorefrontSettings";

export default function ProdigiStorefrontSettingsTab() {
  const settings = useProdigiStorefrontSettings();

  if (settings.loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center text-sm font-semibold text-[#31323E]/50">
        Loading storefront settings...
      </div>
    );
  }

  if (
    !settings.payload ||
    !settings.shippingPolicy ||
    !settings.snapshotDefaults
  ) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
        {settings.error || "Storefront settings are unavailable."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Storefront Settings
          </h2>
          <p className="mt-1 max-w-3xl text-sm font-medium leading-relaxed text-[#31323E]/52">
            Runtime policy for Prodigi snapshot baking, materialized storefront
            payloads, and checkout-visible shipping selection.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={settings.saveSettings}
            disabled={settings.busyAction !== null}
            className="inline-flex items-center gap-2 rounded-md bg-[#31323E] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-45"
          >
            <Save size={15} />
            {settings.busyAction === "save" ? "Saving" : "Save"}
          </button>
          <button
            type="button"
            onClick={settings.loadProductionStatus}
            disabled={settings.busyAction !== null}
            className="inline-flex items-center gap-2 rounded-md border border-[#31323E]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#31323E] disabled:opacity-45"
          >
            <RefreshCcw size={15} />
            Check Prepare
          </button>
        </div>
      </div>

      {(settings.message || settings.error) && (
        <div
          className={`rounded-md border px-4 py-3 text-sm font-semibold ${settings.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          {settings.error || settings.message}
        </div>
      )}

      <ActivePayloadStatus payload={settings.payload} />
      <ProductionPreparePanel
        busyAction={settings.busyAction}
        productionDecision={settings.productionDecision}
        includeApiChecks={settings.includeApiChecks}
        setIncludeApiChecks={settings.setIncludeApiChecks}
        includeQuotes={settings.includeQuotes}
        setIncludeQuotes={settings.setIncludeQuotes}
        runProductionPrepare={(force) =>
          void settings.runProductionPrepare(force)
        }
      />
      <PolicyDefaultsPanel
        shippingPolicy={settings.shippingPolicy}
        setShippingPolicy={settings.setShippingPolicy}
        snapshotDefaults={settings.snapshotDefaults}
        setSnapshotDefaults={settings.setSnapshotDefaults}
        payloadPolicyVersion={settings.payloadPolicyVersion}
        setPayloadPolicyVersion={settings.setPayloadPolicyVersion}
      />
      <CategoryPolicyList
        payload={settings.payload}
        categoryIds={settings.categoryIds}
        categoryDrafts={settings.categoryDrafts}
        updateCategoryDraft={settings.updateCategoryDraft}
      />
    </div>
  );
}
