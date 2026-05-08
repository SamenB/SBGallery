"use client";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, apiJson, getApiUrl } from "@/utils";

const inputCls =
  "w-full border border-[#31323E]/15 rounded-md px-3 py-2 text-sm text-[#31323E] font-medium bg-white focus:outline-none focus:border-[#31323E]/50 focus:ring-2 focus:ring-[#31323E]/10";
import type {
  SnapshotBake,
  SnapshotRatio,
  SnapshotCategory,
  SnapshotSizeEntry,
  SnapshotCell,
  SnapshotCountry,
  SnapshotResponse,
} from "./prodigiSnapshot.types";
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
function badgeClass(kind: "green" | "blue" | "amber" | "red" | "neutral") {
  if (kind === "green") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (kind === "blue") {
    return "bg-sky-50 text-sky-700";
  }
  if (kind === "amber") {
    return "bg-amber-50 text-amber-700";
  }
  if (kind === "red") {
    return "bg-rose-50 text-rose-700";
  }
  return "bg-[#F3F3F1] text-[#31323E]/70";
}
function effectiveFulfillmentBadge(
  level: SnapshotCell["effective_fulfillment_level"],
) {
  if (level === "local") {
    return badgeClass("green");
  }
  if (level === "regional") {
    return badgeClass("blue");
  }
  if (level === "cross_border") {
    return badgeClass("neutral");
  }
  if (level === "mixed") {
    return badgeClass("amber");
  }
  return badgeClass("red");
}
function effectiveGeographyBadge(
  scope: SnapshotCell["effective_geography_scope"],
) {
  if (scope === "domestic") {
    return badgeClass("green");
  }
  if (scope === "europe") {
    return badgeClass("blue");
  }
  if (scope === "international") {
    return badgeClass("neutral");
  }
  if (scope === "mixed") {
    return badgeClass("amber");
  }
  return badgeClass("red");
}
function taxBadge(risk: SnapshotCell["tax_risk"]) {
  if (risk === "low") {
    return badgeClass("green");
  }
  if (risk === "elevated") {
    return badgeClass("amber");
  }
  return badgeClass("red");
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
  const normalized = (tiers ?? []).filter((tier) => tier);
  const visible = normalized.some((tier) => tier !== "other")
    ? normalized.filter((tier) => tier !== "other")
    : normalized;
  return visible.map((tier) => shippingTierLabel(tier)).join(" | ") || "-";
}
function formatMoney(currency?: string | null, amount?: number | null) {
  if (!currency || amount === null || amount === undefined) {
    return "-";
  }
  return `${currency} ${amount.toFixed(2)}`;
}
function pickDisplayShippingProfile(size: SnapshotSizeEntry) {
  if (!size.available) {
    return null;
  }
  const profiles = size.shipping_profiles ?? [];
  if (!profiles.length) {
    return null;
  }
  if (size.shipping_support.chosen_tier) {
    const chosen = profiles.find(
      (profile) => profile.tier === size.shipping_support.chosen_tier,
    );
    if (chosen) {
      return chosen;
    }
  }
  if (size.shipping_support.cheapest_tier) {
    const cheapest = profiles.find(
      (profile) => profile.tier === size.shipping_support.cheapest_tier,
    );
    if (cheapest) {
      return cheapest;
    }
  }
  if (size.default_shipping_tier) {
    const preferred = profiles.find(
      (profile) => profile.tier === size.default_shipping_tier,
    );
    if (preferred) {
      return preferred;
    }
  }
  return profiles[0];
}
function visibleShippingProfiles(size: SnapshotSizeEntry) {
  const profiles = size.shipping_profiles ?? [];
  if (profiles.some((profile) => profile.tier !== "other")) {
    return profiles.filter((profile) => profile.tier !== "other");
  }
  return profiles;
}
function shippingSupportBadge(status: "covered" | "blocked" | "unavailable") {
  if (status === "covered") {
    return badgeClass("green");
  }
  if (status === "unavailable") {
    return badgeClass("neutral");
  }
  return badgeClass("red");
}
function marketSegmentBadge(
  segment: "core" | "focus" | "expansion" | "long_tail",
) {
  if (segment === "core") {
    return badgeClass("green");
  }
  if (segment === "focus") {
    return badgeClass("blue");
  }
  if (segment === "expansion") {
    return badgeClass("amber");
  }
  return badgeClass("neutral");
}
function sizeSupportClass(
  status: "covered" | "blocked" | "unavailable",
  available: boolean,
) {
  if (!available) {
    return "border-rose-200 bg-rose-50";
  }
  if (status === "covered") {
    return "border-emerald-200 bg-emerald-50";
  }
  return "border-[#D9D7D0] bg-[#F3F3F1]";
}
function businessModeBadge(mode: "included" | "pass_through" | "hide") {
  if (mode === "included") {
    return badgeClass("green");
  }
  if (mode === "pass_through") {
    return badgeClass("amber");
  }
  return badgeClass("neutral");
}
function businessModeLabel(mode: "included" | "pass_through" | "hide") {
  if (mode === "included") {
    return "included legacy";
  }
  if (mode === "pass_through") {
    return "checkout";
  }
  return "hidden";
}
function formatCountryShippingSummary(
  summary:
    | SnapshotCountry["shipping_summary"]
    | NonNullable<
        SnapshotResponse["priority_market_summary"]
      >["focus_countries"][number],
) {
  const base = formatMoney(
    summary.currency,
    summary.avg_covered_shipping_price,
  );
  if (base === "-") {
    return summary.mixed_currency ? "Mixed" : "-";
  }
  return summary.mixed_currency ? `${base} (mixed)` : base;
}
function formatCountryBadgeCap(
  summary:
    | SnapshotCountry["shipping_summary"]
    | NonNullable<
        SnapshotResponse["priority_market_summary"]
      >["focus_countries"][number],
) {
  const base = formatMoney(summary.currency, summary.suggested_badge_cap);
  if (base === "-") {
    return summary.mixed_currency ? "Mixed" : "-";
  }
  return summary.mixed_currency ? `${base} (mixed)` : base;
}
function sizeCardClass(size: SnapshotSizeEntry) {
  if (!size.available) {
    return "border-rose-200 bg-rose-50";
  }
  if (size.business_policy.shipping_mode === "included") {
    return "border-emerald-200 bg-emerald-50";
  }
  if (size.business_policy.shipping_mode === "pass_through") {
    return "border-amber-200 bg-amber-50";
  }
  return "border-[#D9D7D0] bg-[#F3F3F1]";
}
function customerDeliveryLabel(size: SnapshotSizeEntry) {
  if (!size.available) {
    return "-";
  }
  if (size.business_policy.shipping_mode === "included") {
    return "Included legacy";
  }
  if (size.business_policy.shipping_mode === "pass_through") {
    return formatMoney(
      size.currency,
      size.business_policy.customer_shipping_price,
    );
  }
  return "Hidden";
}
function formatTierCounts(counts: Record<string, number> | null | undefined) {
  const entries = Object.entries(counts ?? {});
  if (!entries.length) {
    return "-";
  }
  return entries
    .sort(([leftTier], [rightTier]) => leftTier.localeCompare(rightTier))
    .map(([tier, count]) => `${shippingTierLabel(tier)} ${count}`)
    .join(" / ");
}

export {
  inputCls,
  formatAttributePairs,
  formatAllowedAttributes,
  badgeClass,
  effectiveFulfillmentBadge,
  effectiveGeographyBadge,
  taxBadge,
  shippingTierLabel,
  formatShippingTierList,
  formatMoney,
  pickDisplayShippingProfile,
  visibleShippingProfiles,
  shippingSupportBadge,
  marketSegmentBadge,
  sizeSupportClass,
  businessModeBadge,
  businessModeLabel,
  formatCountryShippingSummary,
  formatCountryBadgeCap,
  sizeCardClass,
  customerDeliveryLabel,
  formatTierCounts,
};
export type {
  SnapshotBake,
  SnapshotRatio,
  SnapshotCategory,
  SnapshotSizeEntry,
  SnapshotCell,
  SnapshotCountry,
  SnapshotResponse,
} from "./prodigiSnapshot.types";
