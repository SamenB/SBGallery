"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { countries } from "@/countries";
import { apiFetch, apiJson, getApiUrl } from "@/utils";
import { CATEGORY_GROUP } from "./printPricing.shared";
import type {
  CountryAssignmentDraft,
  PricingRegion,
  RegionsPayload,
} from "./printPricing.shared";

export function usePrintPricingRegions() {
  const [data, setData] = useState<RegionsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingRegionId, setSavingRegionId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [savedRegionId, setSavedRegionId] = useState<number | null>(null);
  const [countryDraft, setCountryDraft] =
    useState<CountryAssignmentDraft | null>(null);
  const [savingCountry, setSavingCountry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = getApiUrl();

  const loadRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`${api}/print-pricing/regions`);
      setData(await apiJson(response));
    } catch {
      setError("Network error while loading print pricing regions.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  const syncDefaults = async () => {
    setSyncing(true);
    setError(null);
    try {
      const response = await apiFetch(`${api}/print-pricing/regions/seed`, {
        method: "POST",
      });
      if (!response.ok) {
        setError("Could not sync the managed pricing regions.");
        return;
      }
      await loadRegions();
    } catch {
      setError("Network error while syncing pricing regions.");
    } finally {
      setSyncing(false);
    }
  };

  const updateRegion = async (
    region: PricingRegion,
    payload: {
      default_multiplier?: number;
      category_multipliers?: Record<string, number>;
    },
  ) => {
    setSavingRegionId(region.id);
    setError(null);
    try {
      const response = await apiFetch(
        `${api}/print-pricing/regions/${region.id}/multipliers`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        const body = await apiJson<{ detail?: string }>(response).catch(
          (): { detail?: string } => ({}),
        );
        setError(body.detail || "Could not update multiplier.");
        return;
      }
      const updated = await apiJson<PricingRegion>(response);
      setData((previous) =>
        previous
          ? {
              ...previous,
              regions: previous.regions.map((item) =>
                item.id === updated.id ? updated : item,
              ),
            }
          : previous,
      );
      setSavedRegionId(region.id);
      window.setTimeout(() => setSavedRegionId(null), 1200);
    } catch {
      setError("Network error while updating multiplier.");
    } finally {
      setSavingRegionId(null);
    }
  };

  const moveCountry = async () => {
    if (!countryDraft) return;
    setSavingCountry(true);
    setError(null);
    try {
      const response = await apiFetch(
        `${api}/print-pricing/regions/country-assignment`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country_code: countryDraft.countryCode,
            target_region_slug: countryDraft.targetRegionSlug,
          }),
        },
      );
      if (!response.ok) {
        const body = await apiJson<{ detail?: string }>(response).catch(
          (): { detail?: string } => ({}),
        );
        setError(body.detail || "Could not move country.");
        return;
      }
      setData(await apiJson(response));
      setCountryDraft(null);
    } catch {
      setError("Network error while moving country.");
    } finally {
      setSavingCountry(false);
    }
  };

  const groupedCategories = useMemo(() => {
    const categoryIds = data?.category_ids ?? [];
    return {
      paper: categoryIds.filter((id) => CATEGORY_GROUP[id] === "paper"),
      canvas: categoryIds.filter((id) => CATEGORY_GROUP[id] === "canvas"),
    };
  }, [data]);

  const assignedCountryCodes = useMemo(() => {
    const explicitCodes = new Set<string>();
    for (const region of data?.regions ?? []) {
      if (!region.is_fallback) {
        for (const code of region.country_codes) explicitCodes.add(code);
      }
    }
    return explicitCodes;
  }, [data]);

  const fallbackCountryCodes = useMemo(
    () =>
      countries
        .map((country) => country.code)
        .filter((code) => !assignedCountryCodes.has(code)),
    [assignedCountryCodes],
  );

  return {
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
  };
}
