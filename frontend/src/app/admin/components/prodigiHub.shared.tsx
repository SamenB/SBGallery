"use client";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, apiJson, getApiUrl } from "@/utils";

const inputCls =
  "w-full border border-[#31323E]/15 rounded-md px-3 py-2 text-sm text-[#31323E] font-medium bg-white focus:outline-none focus:border-[#31323E]/50 focus:ring-2 focus:ring-[#31323E]/10";
import type {
  HubMode,
  ProbeResult,
  PreviewRatio,
  PreviewCategory,
  PreviewRatioCard,
  PreviewPaperMaterial,
  PreviewCountryOption,
  PreviewCountryCell,
  PreviewCountryRow,
  PreviewSizeSlot,
  PreviewCategoryOverview,
  PreviewFulfillmentSummary,
  PreviewStorefrontPolicy,
  PreviewFulfillmentPolicy,
  PreviewOffer,
  PreviewSizeCell,
  PreviewCountryCategoryRow,
  SelectedCountryPreview,
  SelectedRatioPreview,
  CatalogPreviewResponse,
  StorefrontCardSize,
  StorefrontCardPreview,
  HiddenStorefrontCard,
  SelectedCountryStorefrontPreview,
  FulfillmentJob,
  FulfillmentJobsResponse,
  FulfillmentJobDetail,
} from "./prodigiHub.types";
const denseButton =
  "px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] rounded-md border transition-all";
function countryStatusClass(status: PreviewCountryRow["completion_status"]) {
  if (status === "full") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "partial") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-rose-50 text-rose-700";
}
function buildSlotTooltip(slot: PreviewSizeSlot) {
  const members =
    slot.member_size_labels.join(", ") || slot.recommended_size_label;
  return `Recommended slot: ${slot.recommended_size_label}
Centroid: ${slot.centroid_size_label}
Strongest real size: ${slot.strongest_size_label}
Cluster members: ${members}
Coverage countries: ${slot.country_count}`;
}
function formatAttributePairs(values: Record<string, string>) {
  const entries = Object.entries(values);
  if (!entries.length) {
    return "None";
  }
  return entries.map(([key, value]) => `${key}: ${value}`).join(" | ");
}
function formatAllowedAttributes(values: Record<string, string[]>) {
  const entries = Object.entries(values);
  if (!entries.length) {
    return "None";
  }
  return entries.map(([key, list]) => `${key}: ${list.join(", ")}`).join(" | ");
}
function fulfillmentLevelClass(
  level: PreviewFulfillmentPolicy["fulfillment_level"],
) {
  if (level === "local") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (level === "regional") {
    return "bg-sky-50 text-sky-700";
  }
  if (level === "cross_border") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-rose-50 text-rose-700";
}
function storefrontActionClass(
  action: PreviewFulfillmentPolicy["storefront_action"],
) {
  if (action === "show") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (action === "show_with_notice") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-rose-50 text-rose-700";
}
function fulfillmentLevelLabel(
  level: PreviewFulfillmentPolicy["fulfillment_level"],
) {
  if (level === "local") {
    return "local";
  }
  if (level === "regional") {
    return "regional";
  }
  if (level === "cross_border") {
    return "cross-border";
  }
  return "unsupported";
}
function storefrontActionLabel(
  action: PreviewFulfillmentPolicy["storefront_action"],
) {
  if (action === "show") {
    return "primary";
  }
  if (action === "show_with_notice") {
    return "notice";
  }
  return "hide";
}
function geographyScopeClass(
  scope: PreviewFulfillmentPolicy["geography_scope"],
) {
  if (scope === "domestic") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (scope === "europe") {
    return "bg-sky-50 text-sky-700";
  }
  if (scope === "international") {
    return "bg-stone-100 text-stone-700";
  }
  return "bg-rose-50 text-rose-700";
}
function geographyScopeLabel(
  scope: PreviewFulfillmentPolicy["geography_scope"],
) {
  if (scope === "domestic") {
    return "domestic";
  }
  if (scope === "europe") {
    return "europe";
  }
  if (scope === "international") {
    return "international";
  }
  return "none";
}
function taxRiskClass(risk: PreviewFulfillmentPolicy["tax_risk"]) {
  if (risk === "low") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (risk === "elevated") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-rose-50 text-rose-700";
}
function shippingTierLabel(tier: string | null | undefined) {
  if (tier === "express") {
    return "ex";
  }
  if (tier === "standard") {
    return "std";
  }
  if (tier === "budget") {
    return "bud";
  }
  if (tier === "overnight") {
    return "ovn";
  }
  return tier || "-";
}
function formatShippingTierList(tiers: string[] | null | undefined) {
  return (
    (tiers ?? []).map((tier) => shippingTierLabel(tier)).join(" | ") || "-"
  );
}
function shippingSupportClass(status: "covered" | "blocked" | "unavailable") {
  if (status === "covered") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "unavailable") {
    return "bg-[#F3F3F1] text-[#31323E]/60";
  }
  return "bg-rose-50 text-rose-700";
}

export {
  inputCls,
  denseButton,
  countryStatusClass,
  buildSlotTooltip,
  formatAttributePairs,
  formatAllowedAttributes,
  fulfillmentLevelClass,
  storefrontActionClass,
  fulfillmentLevelLabel,
  storefrontActionLabel,
  geographyScopeClass,
  geographyScopeLabel,
  taxRiskClass,
  shippingTierLabel,
  formatShippingTierList,
  shippingSupportClass,
};
export type {
  HubMode,
  ProbeResult,
  PreviewRatio,
  PreviewCategory,
  PreviewRatioCard,
  PreviewPaperMaterial,
  PreviewCountryOption,
  PreviewCountryCell,
  PreviewCountryRow,
  PreviewSizeSlot,
  PreviewCategoryOverview,
  PreviewFulfillmentSummary,
  PreviewStorefrontPolicy,
  PreviewFulfillmentPolicy,
  PreviewOffer,
  PreviewSizeCell,
  PreviewCountryCategoryRow,
  SelectedCountryPreview,
  SelectedRatioPreview,
  CatalogPreviewResponse,
  StorefrontCardSize,
  StorefrontCardPreview,
  HiddenStorefrontCard,
  SelectedCountryStorefrontPreview,
  FulfillmentJob,
  FulfillmentJobsResponse,
  FulfillmentJobDetail,
} from "./prodigiHub.types";
