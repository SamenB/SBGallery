"use client";

import { Check, RefreshCcw } from "lucide-react";

import {
  CountryList,
  CountryMovePanel,
  MultiplierTable,
  StatusMessage,
} from "./printPricing.components";
import { REGION_META, MultiplierInput } from "./printPricing.shared";
import { usePrintPricingRegions } from "./usePrintPricingRegions";

export default function PrintPricingTab() {
  const {
    data,
    loading,
    savingRegionId,
    syncing,
    savedRegionId,
    countryDraft,
    setCountryDraft,
    savingCountry,
    error,
    syncDefaults,
    updateRegion,
    moveCountry,
    groupedCategories,
    fallbackCountryCodes,
  } = usePrintPricingRegions();

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-10">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#31323E]/20 border-t-[#31323E]" />
        <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#31323E]/45">
          Loading pricing
        </span>
      </div>
    );
  }

  if (!data || data.regions.length === 0) {
    return (
      <div className="max-w-3xl space-y-5">
        <header className="border-b border-[#31323E]/8 pb-5">
          <h2 className="text-2xl font-bold tracking-tight text-[#31323E]">
            Print Pricing
          </h2>
          <p className="mt-1 text-sm font-medium text-[#31323E]/50">
            Create the managed Premium, Mid, and Budget regions.
          </p>
        </header>
        {error && <StatusMessage text={error} />}
        <button
          type="button"
          onClick={syncDefaults}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-md bg-[#31323E] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#444552] disabled:opacity-50"
        >
          <RefreshCcw size={14} />
          {syncing ? "Creating" : "Create Regions"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#31323E]/8 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#31323E]">
            Print Pricing
          </h2>
          <p className="mt-1 max-w-3xl text-sm font-medium leading-relaxed text-[#31323E]/50">
            Global print prices use regional markups. Original artwork prices
            stay per-artwork.
          </p>
        </div>
        <button
          type="button"
          onClick={syncDefaults}
          disabled={syncing}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#31323E]/12 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#31323E]/65 transition hover:bg-[#31323E]/4 disabled:opacity-50"
          title="Sync Premium, Mid, and Budget region definitions"
        >
          <RefreshCcw size={14} />
          Sync Regions
        </button>
      </header>

      {error && <StatusMessage text={error} />}

      <section className="grid gap-4 xl:grid-cols-3">
        {data.regions.map((region) => {
          const meta = REGION_META[region.slug] ?? REGION_META.budget;
          const isSaving = savingRegionId === region.id;
          const isSaved = savedRegionId === region.id;
          return (
            <article
              key={region.id}
              className={`rounded-lg border p-4 ${meta.tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {region.label}
                  </h3>
                  <p className="mt-1 text-xs font-semibold opacity-65">
                    {meta.note}
                  </p>
                </div>
                {isSaved && (
                  <span className="inline-flex h-7 items-center gap-1 rounded-md bg-white/70 px-2 text-[10px] font-bold uppercase tracking-[0.12em]">
                    <Check size={13} />
                    Saved
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.14em] opacity-55">
                  Default
                </span>
                <MultiplierInput
                  value={region.default_multiplier}
                  disabled={isSaving}
                  muted
                  onChange={(value) =>
                    updateRegion(region, { default_multiplier: value })
                  }
                />
              </div>

              <CountryList
                region={region}
                fallbackCountryCodes={fallbackCountryCodes}
                onSelect={(countryCode) =>
                  setCountryDraft({
                    countryCode,
                    currentRegionSlug: region.slug,
                    targetRegionSlug: region.slug,
                  })
                }
              />
            </article>
          );
        })}
      </section>

      {countryDraft && (
        <CountryMovePanel
          draft={countryDraft}
          regions={data.regions}
          saving={savingCountry}
          onTargetChange={(targetRegionSlug) =>
            setCountryDraft((previous) =>
              previous ? { ...previous, targetRegionSlug } : previous,
            )
          }
          onCancel={() => setCountryDraft(null)}
          onSave={moveCountry}
        />
      )}

      <MultiplierTable
        title="Paper Categories"
        categoryIds={groupedCategories.paper}
        regions={data.regions}
        savingRegionId={savingRegionId}
        onChange={(region, categoryId, value) =>
          updateRegion(region, {
            category_multipliers: { [categoryId]: value },
          })
        }
      />

      <MultiplierTable
        title="Canvas Categories"
        categoryIds={groupedCategories.canvas}
        regions={data.regions}
        savingRegionId={savingRegionId}
        onChange={(region, categoryId, value) =>
          updateRegion(region, {
            category_multipliers: { [categoryId]: value },
          })
        }
      />
    </div>
  );
}
