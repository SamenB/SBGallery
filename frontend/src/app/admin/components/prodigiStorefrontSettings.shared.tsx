"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Database, Play, RefreshCcw, Save } from "lucide-react";
import { apiFetch, apiJson, getApiUrl } from "@/utils";

type ShippingPolicy = {
  checkout_shipping_cap: number;
  preferred_tier_order: string[];
  fallback_when_none_under_cap: string;
  fallback_tier: string;
};
type CategoryPolicy = Record<
  string,
  {
    label: string;
    fixed_attributes: Record<string, unknown>;
    allowed_attributes: Record<string, unknown[]>;
    recommended_defaults: Record<string, unknown>;
    shipping: {
      visible_methods?: string[];
      preferred_order?: string[];
      default_method?: string;
    };
    notes?: string[];
  }
>;
type SnapshotDefaults = {
  paper_material: string;
  include_notice_level: boolean;
};
type StorefrontSettingsPayload = {
  defaults: {
    shipping_policy: ShippingPolicy;
    category_policy: CategoryPolicy;
    snapshot_defaults: SnapshotDefaults;
    payload_policy_version: string;
  };
  settings: {
    updated_at?: string | null;
  };
  effective: {
    shipping_policy: ShippingPolicy;
    category_policy: CategoryPolicy;
    snapshot_defaults: SnapshotDefaults;
    payload_policy_version: string;
  };
  status: {
    active_bake?: {
      id: number;
      bake_key: string;
      paper_material: string;
      include_notice_level: boolean;
      ratio_count: number;
      country_count: number;
      offer_group_count: number;
      offer_size_count: number;
    } | null;
    materialized_payload_count: number;
  };
};
type ProductionPrepareDecision = {
  prepare_needed: boolean;
  status: string;
  reasons: string[];
  source?: {
    path?: string;
    sha256?: string;
    rows_seen?: number;
    size_bytes?: number;
    error?: string;
  } | null;
  active_bake?: {
    id?: number;
    bake_key?: string;
    status?: string;
    source_sha256?: string;
    source_row_count?: number;
    source_size_bytes?: number;
    pipeline_version?: string;
    policy_version?: string;
    offer_group_count?: number;
    offer_size_count?: number;
    settings?: {
      payload_policy_version?: string;
    } | null;
  } | null;
  materialized_payload_count: number;
  expected: {
    pipeline_version?: string;
    policy_version?: string;
  };
};
type ProductionPrepareResult = {
  status: string;
  decision: ProductionPrepareDecision;
  refreshed_decision?: ProductionPrepareDecision;
  settings?: StorefrontSettingsPayload;
  report?: {
    status?: string;
    validation?: {
      approved?: boolean;
      summary?: Record<string, unknown>;
    };
    cache_clear?: Record<string, unknown>;
    csv_rebuild?: Record<string, unknown> | null;
  } | null;
};
type CategoryDraft = {
  fixed: string;
  allowed: string;
  recommended: string;
  visibleMethods: string;
  preferredOrder: string;
  defaultMethod: string;
};
const tierOptions = ["overnight", "express", "standardplus", "standard", "budget"];
const fallbackModes = ["standard_then_cheapest", "cheapest", "block"];
function joinList(value?: string[]) {
  return (value || []).join(", ");
}
function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
function asPrettyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}
function parseObject(value: string, label: string) {
  const parsed = JSON.parse(value || "{}");
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`${label} must be a JSON object.`);
  }
  return parsed as Record<string, unknown>;
}
function formatNumber(value: number | undefined) {
  return typeof value === "number" ? value.toLocaleString() : "Unknown";
}
function formatDecision(decision: ProductionPrepareDecision | null) {
  if (!decision) return "Loading";
  return decision.prepare_needed ? "Needed" : "Current";
}
function formatPrepareMessage(result: ProductionPrepareResult) {
  if (result.status === "skipped") {
    return "Production prepare skipped because the active snapshot is current.";
  }
  if (result.report?.status === "ready") {
    return "Production prepare completed: snapshot, payloads, validation, and cache clear are ready.";
  }
  return "Production prepare completed with failed validation. Check the report before relying on the snapshot.";
}

export {
  tierOptions,
  fallbackModes,
  joinList,
  splitList,
  asPrettyJson,
  parseObject,
  formatNumber,
  formatDecision,
  formatPrepareMessage,
};
export type {
  ShippingPolicy,
  CategoryPolicy,
  SnapshotDefaults,
  StorefrontSettingsPayload,
  ProductionPrepareDecision,
  ProductionPrepareResult,
  CategoryDraft,
};
