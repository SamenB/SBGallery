"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, RefreshCcw, Save, X } from "lucide-react";
import { countries } from "@/countries";
import { apiFetch, apiJson, getApiUrl } from "@/utils";

interface PricingRegion {
  id: number;
  slug: string;
  label: string;
  country_codes: string[];
  default_multiplier: number;
  sort_order: number;
  is_fallback: boolean;
  category_multipliers: Record<string, number>;
  override_count: number;
}
interface RegionsPayload {
  regions: PricingRegion[];
  category_ids: string[];
}
type CountryAssignmentDraft = {
  countryCode: string;
  currentRegionSlug: string;
  targetRegionSlug: string;
};
const CATEGORY_LABELS: Record<string, string> = {
  paperPrintRolled: "Paper Rolled",
  paperPrintBoxFramed: "Paper Box Framed",
  paperPrintClassicFramed: "Paper Classic Framed",
  canvasRolled: "Canvas Rolled",
  canvasStretched: "Canvas Stretched",
  canvasClassicFrame: "Canvas Classic Frame",
  canvasFloatingFrame: "Canvas Floating Frame",
};
const CATEGORY_GROUP: Record<string, "paper" | "canvas"> = {
  paperPrintRolled: "paper",
  paperPrintBoxFramed: "paper",
  paperPrintClassicFramed: "paper",
  canvasRolled: "canvas",
  canvasStretched: "canvas",
  canvasClassicFrame: "canvas",
  canvasFloatingFrame: "canvas",
};
const REGION_META: Record<string, { tone: string; note: string }> = {
  premium: {
    tone: "border-emerald-200 bg-emerald-50/55 text-emerald-900",
    note: "High-income core and focus markets.",
  },
  mid: {
    tone: "border-blue-200 bg-blue-50/60 text-blue-950",
    note: "Expansion markets. Ukraine is intentionally listed first.",
  },
  budget: {
    tone: "border-stone-200 bg-stone-50 text-stone-800",
    note: "Fallback for every country not assigned above.",
  },
};
const COUNTRY_NAME_BY_CODE = new Map(countries.map((country) => [country.code, country.name]));
function formatMultiplier(value: number): string {
  return `x${value.toFixed(1)}`;
}
function formatCountry(code: string): string {
  const name = COUNTRY_NAME_BY_CODE.get(code);
  return name ? `${name} (${code})` : code;
}
function MultiplierInput({
  value,
  muted,
  disabled,
  onChange,
}: {
  value: number;
  muted?: boolean;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(value.toFixed(1));

  useEffect(() => {
    setDraft(value.toFixed(1));
  }, [value]);

  const commit = () => {
    const parsed = Number.parseFloat(draft);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) {
      setDraft(value.toFixed(1));
      return;
    }
    onChange(Number(parsed.toFixed(2)));
  };

  return (
    <input
      type="number"
      min="1"
      max="10"
      step="0.1"
      value={draft}
      disabled={disabled}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setDraft(value.toFixed(1));
          event.currentTarget.blur();
        }
      }}
      className={`h-8 w-16 rounded-md border px-2 text-center font-mono text-xs font-bold outline-none transition focus:ring-2 focus:ring-[#31323E]/18 disabled:cursor-wait disabled:opacity-50 ${
        muted ? "border-[#31323E]/10 bg-[#31323E]/4 text-[#31323E]/55" : "border-blue-200 bg-blue-50 text-blue-700"
      }`}
      aria-label={`Multiplier ${formatMultiplier(value)}`}
    />
  );
}

export {
  CATEGORY_LABELS,
  CATEGORY_GROUP,
  REGION_META,
  COUNTRY_NAME_BY_CODE,
  formatMultiplier,
  formatCountry,
  MultiplierInput,
};
export type { PricingRegion, RegionsPayload, CountryAssignmentDraft };
