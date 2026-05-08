import { AlertCircle, Save, X } from "lucide-react";
import {
  CATEGORY_LABELS,
  formatCountry,
  MultiplierInput,
} from "./printPricing.shared";
import type {
  CountryAssignmentDraft,
  PricingRegion,
} from "./printPricing.shared";

function CountryList({
  region,
  fallbackCountryCodes,
  onSelect,
}: {
  region: PricingRegion;
  fallbackCountryCodes: string[];
  onSelect: (countryCode: string) => void;
}) {
  const countryCodes = region.is_fallback
    ? fallbackCountryCodes
    : region.country_codes;

  return (
    <div className="mt-4 flex max-h-48 flex-wrap gap-1.5 overflow-y-auto pr-1">
      {countryCodes.map((code) => (
        <button
          type="button"
          key={code}
          title={formatCountry(code)}
          onClick={() => onSelect(code)}
          className={`rounded-md border px-2 py-1 text-[11px] font-bold ${code === "UA" ? "border-yellow-300 bg-yellow-100 text-yellow-950" : "border-current/10 bg-white/55 hover:bg-white/85"} transition`}
        >
          {code === "UA" ? "Ukraine (UA)" : code}
        </button>
      ))}
    </div>
  );
}

function CountryMovePanel({
  draft,
  regions,
  saving,
  onTargetChange,
  onCancel,
  onSave,
}: {
  draft: CountryAssignmentDraft;
  regions: PricingRegion[];
  saving: boolean;
  onTargetChange: (targetRegionSlug: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const changed = draft.currentRegionSlug !== draft.targetRegionSlug;

  return (
    <section className="rounded-lg border border-[#31323E]/10 bg-[#FAFAF8] p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#31323E]/40">
            Country Assignment
          </p>
          <h3 className="mt-1 text-base font-bold text-[#31323E]">
            {formatCountry(draft.countryCode)}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#31323E]/10 bg-white text-[#31323E]/45 transition hover:text-[#31323E]"
          title="Close"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {regions.map((region) => (
          <button
            key={region.slug}
            type="button"
            onClick={() => onTargetChange(region.slug)}
            className={`rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${draft.targetRegionSlug === region.slug ? "border-[#31323E] bg-[#31323E] text-white" : "border-[#31323E]/12 bg-white text-[#31323E]/55 hover:text-[#31323E]"}`}
          >
            {region.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!changed || saving}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-[#31323E] px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#444552] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Save size={14} />
          {saving ? "Saving" : "Save"}
        </button>
        <span className="text-xs font-semibold text-[#31323E]/42">
          Moving to Budget removes the country from explicit regional lists.
        </span>
      </div>
    </section>
  );
}

function MultiplierTable({
  title,
  categoryIds,
  regions,
  savingRegionId,
  onChange,
}: {
  title: string;
  categoryIds: string[];
  regions: PricingRegion[];
  savingRegionId: number | null;
  onChange: (region: PricingRegion, categoryId: string, value: number) => void;
}) {
  if (categoryIds.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#31323E]/40">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-[#31323E]/10 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-[#31323E]/4">
              <th className="border-b border-[#31323E]/8 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[#31323E]/45">
                Category
              </th>
              {regions.map((region) => (
                <th
                  key={region.id}
                  className="border-b border-[#31323E]/8 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#31323E]/45"
                >
                  {region.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryIds.map((categoryId) => (
              <tr
                key={categoryId}
                className="border-b border-[#31323E]/5 last:border-b-0"
              >
                <td className="px-4 py-3 text-xs font-bold text-[#31323E]/70">
                  {CATEGORY_LABELS[categoryId] ?? categoryId}
                </td>
                {regions.map((region) => {
                  const value =
                    region.category_multipliers[categoryId] ??
                    region.default_multiplier;
                  const isOverride =
                    Math.abs(value - region.default_multiplier) > 0.001;
                  return (
                    <td key={region.id} className="px-4 py-3 text-center">
                      <MultiplierInput
                        value={value}
                        disabled={savingRegionId === region.id}
                        muted={!isOverride}
                        onChange={(nextValue) =>
                          onChange(region, categoryId, nextValue)
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
      <AlertCircle size={15} />
      {text}
    </div>
  );
}

export { CountryList, CountryMovePanel, MultiplierTable, StatusMessage };
