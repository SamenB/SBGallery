"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, apiJson, getApiUrl } from "@/utils";
import {
  asPrettyJson,
  joinList,
  parseObject,
  splitList,
  formatPrepareMessage,
} from "./prodigiStorefrontSettings.shared";
import type {
  CategoryDraft,
  CategoryPolicy,
  ProductionPrepareDecision,
  ProductionPrepareResult,
  ShippingPolicy,
  SnapshotDefaults,
  StorefrontSettingsPayload,
} from "./prodigiStorefrontSettings.shared";

export function useProdigiStorefrontSettings() {
  const [payload, setPayload] = useState<StorefrontSettingsPayload | null>(
    null,
  );
  const [shippingPolicy, setShippingPolicy] = useState<ShippingPolicy | null>(
    null,
  );
  const [snapshotDefaults, setSnapshotDefaults] =
    useState<SnapshotDefaults | null>(null);
  const [payloadPolicyVersion, setPayloadPolicyVersion] = useState("");
  const [categoryDrafts, setCategoryDrafts] = useState<
    Record<string, CategoryDraft>
  >({});
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [productionDecision, setProductionDecision] =
    useState<ProductionPrepareDecision | null>(null);
  const [includeApiChecks, setIncludeApiChecks] = useState(false);
  const [includeQuotes, setIncludeQuotes] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoryIds = useMemo(
    () => Object.keys(payload?.effective.category_policy || {}),
    [payload],
  );

  const applyPayload = useCallback((nextPayload: StorefrontSettingsPayload) => {
    const effective = nextPayload.effective;
    setPayload(nextPayload);
    setShippingPolicy(effective.shipping_policy);
    setSnapshotDefaults(effective.snapshot_defaults);
    setPayloadPolicyVersion(effective.payload_policy_version);
    setCategoryDrafts(
      Object.fromEntries(
        Object.entries(effective.category_policy).map(
          ([categoryId, policy]) => [
            categoryId,
            {
              fixed: asPrettyJson(policy.fixed_attributes),
              allowed: asPrettyJson(policy.allowed_attributes),
              recommended: asPrettyJson(policy.recommended_defaults),
              visibleMethods: joinList(policy.shipping.visible_methods),
              preferredOrder: joinList(policy.shipping.preferred_order),
              defaultMethod: policy.shipping.default_method || "",
            },
          ],
        ),
      ),
    );
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(
        `${getApiUrl()}/v1/admin/prodigi/storefront-settings`,
      );
      applyPayload(await apiJson<StorefrontSettingsPayload>(response));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load storefront settings.",
      );
    } finally {
      setLoading(false);
    }
  }, [applyPayload]);

  const loadProductionStatus = useCallback(async () => {
    try {
      const response = await apiFetch(
        `${getApiUrl()}/v1/admin/prodigi/production-prepare`,
      );
      setProductionDecision(await apiJson<ProductionPrepareDecision>(response));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load production prepare status.",
      );
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadProductionStatus();
  }, [loadSettings, loadProductionStatus]);

  const buildSaveBody = () => {
    if (!shippingPolicy || !snapshotDefaults || !payload)
      throw new Error("Settings are not loaded yet.");
    const categoryPolicy: CategoryPolicy = Object.fromEntries(
      Object.entries(payload.effective.category_policy).map(
        ([categoryId, policy]) => {
          const draft = categoryDrafts[categoryId];
          return [
            categoryId,
            {
              ...policy,
              fixed_attributes: parseObject(
                draft.fixed,
                `${categoryId}.fixed_attributes`,
              ),
              allowed_attributes: parseObject(
                draft.allowed,
                `${categoryId}.allowed_attributes`,
              ) as Record<string, unknown[]>,
              recommended_defaults: parseObject(
                draft.recommended,
                `${categoryId}.recommended_defaults`,
              ),
              shipping: {
                visible_methods: splitList(draft.visibleMethods),
                preferred_order: splitList(draft.preferredOrder),
                default_method: draft.defaultMethod.trim(),
              },
            },
          ];
        },
      ),
    );
    return {
      shipping_policy: shippingPolicy,
      category_policy: categoryPolicy,
      snapshot_defaults: snapshotDefaults,
      payload_policy_version: payloadPolicyVersion.trim(),
    };
  };

  const saveSettings = async () => {
    setBusyAction("save");
    setError(null);
    setMessage(null);
    try {
      const response = await apiFetch(
        `${getApiUrl()}/v1/admin/prodigi/storefront-settings`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildSaveBody()),
        },
      );
      applyPayload(await apiJson<StorefrontSettingsPayload>(response));
      setMessage("Storefront settings saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save storefront settings.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const runProductionPrepare = async (force: boolean) => {
    setBusyAction(force ? "prepare-force" : "prepare");
    setError(null);
    setMessage(null);
    try {
      const response = await apiFetch(
        `${getApiUrl()}/v1/admin/prodigi/production-prepare`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            force,
            include_api_checks: includeApiChecks,
            include_quotes: includeQuotes,
          }),
        },
      );
      const result = await apiJson<ProductionPrepareResult>(response);
      if (result.settings) applyPayload(result.settings);
      else await loadSettings();
      setProductionDecision(result.refreshed_decision || result.decision);
      setMessage(formatPrepareMessage(result));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Production prepare failed.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const updateCategoryDraft = (
    categoryId: string,
    key: keyof CategoryDraft,
    value: string,
  ) => {
    setCategoryDrafts((current) => ({
      ...current,
      [categoryId]: { ...current[categoryId], [key]: value },
    }));
  };

  return {
    payload,
    shippingPolicy,
    setShippingPolicy,
    snapshotDefaults,
    setSnapshotDefaults,
    payloadPolicyVersion,
    setPayloadPolicyVersion,
    categoryDrafts,
    loading,
    busyAction,
    productionDecision,
    includeApiChecks,
    setIncludeApiChecks,
    includeQuotes,
    setIncludeQuotes,
    message,
    error,
    categoryIds,
    loadProductionStatus,
    saveSettings,
    runProductionPrepare,
    updateCategoryDraft,
  };
}
