"use client";
import { useMemo, useState } from "react";
import type { CartItem } from "@/context/CartContext";
import { usePreferences } from "@/context/PreferencesContext";
import type {
  ArtworkPrintStorefront,
  MediumOffers,
  PurchaseType,
  StorefrontCard,
  StorefrontSizeOption,
} from "@/lib/artworkStorefront";
import {
  resolveRoundedCustomerPriceParts,
  resolveStorefrontCustomerTotal,
  resolveStorefrontProductPrice,
  resolveStorefrontShippingPrice,
} from "@/lib/artworkStorefront";
import { filterFrameColorOptionsForSwatches } from "@/lib/prodigiPrintOptions";

type CartEditionType = "canvas_print" | "canvas_print_limited" | "paper_print" | "paper_print_limited";
interface PrintConfiguratorProps {
  artworkId: number;
  artworkTitle: string;
  purchaseType: PurchaseType;
  units: "cm" | "in";
  isSmall: boolean;
  onAddToCart: (item: Omit<CartItem, "quantity">) => void;
  imageGradientFrom: string;
  imageGradientTo: string;
  imageUrl?: string;
  hasHighResAsset?: boolean;
  storefront: ArtworkPrintStorefront | null;
  storefrontLoading: boolean;
  storefrontError: string | null;
}
function getSizeKey(size: StorefrontSizeOption): string {
  return String(size.sku || size.slot_size_label || size.size_label);
}
function titleCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
function formatAttributeValue(value: string): string {
  return titleCase(value);
}
function parseSizeLabel(label: string): { widthCm: number; heightCm: number } | null {
  const normalized = label.replace(/cm$/i, "").trim();
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)$/i);
  if (!match) {
    return null;
  }

  const widthCm = Number(match[1]);
  const heightCm = Number(match[2]);
  if (Number.isNaN(widthCm) || Number.isNaN(heightCm)) {
    return null;
  }

  return { widthCm, heightCm };
}
function formatSizeLabel(label: string, units: "cm" | "in"): string {
  const parsed = parseSizeLabel(label);
  if (!parsed) {
    return label;
  }

  if (units === "in") {
    const widthIn = (parsed.widthCm / 2.54).toFixed(1).replace(/\.0$/, "");
    const heightIn = (parsed.heightCm / 2.54).toFixed(1).replace(/\.0$/, "");
    return `${widthIn} x ${heightIn} in`;
  }

  const widthCm = parsed.widthCm.toFixed(parsed.widthCm % 1 === 0 ? 0 : 1).replace(/\.0$/, "");
  const heightCm = parsed.heightCm.toFixed(parsed.heightCm % 1 === 0 ? 0 : 1).replace(/\.0$/, "");
  return `${widthCm} x ${heightCm} cm`;
}
function formatInches(widthIn: number, heightIn: number, units: "cm" | "in"): string {
  if (units === "cm") {
    const widthCm = (widthIn * 2.54).toFixed(1).replace(/\.0$/, "");
    const heightCm = (heightIn * 2.54).toFixed(1).replace(/\.0$/, "");
    return `${widthCm} x ${heightCm} cm`;
  }
  return `${widthIn.toFixed(1).replace(/\.0$/, "")} x ${heightIn.toFixed(1).replace(/\.0$/, "")} in`;
}
function isMountedFrame(card: StorefrontCard | null): boolean {
  return Boolean(card?.category_id?.toLowerCase().includes("mounted"));
}
function isUkShippedBoxFrame(card: StorefrontCard | null, countryCode?: string | null): boolean {
  if (!card || card.category_id !== "paperPrintBoxFramed") {
    return false;
  }
  return Boolean(
    countryCode?.toUpperCase() !== "GB" && card.source_countries?.map((item) => item.toUpperCase()).includes("GB"),
  );
}
function buildImageWindowLabel(
  card: StorefrontCard | null,
  size: StorefrontSizeOption | null,
  units: "cm" | "in",
): string | null {
  if (!isMountedFrame(card) || !size?.print_area?.width_px || !size.print_area.height_px) {
    return null;
  }

  const dimensions = size.print_area.dimensions || {};
  const targetDpi = Number(dimensions.target_dpi || dimensions.dpi || 300);
  if (!targetDpi || Number.isNaN(targetDpi)) {
    return null;
  }
  const widthIn = Number(size.print_area.width_px) / targetDpi;
  const heightIn = Number(size.print_area.height_px) / targetDpi;
  if (!Number.isFinite(widthIn) || !Number.isFinite(heightIn)) {
    return null;
  }
  return formatInches(widthIn, heightIn, units);
}
function resolveAllowedAttributeOptions(
  card: StorefrontCard | null,
  size?: StorefrontSizeOption | null,
): Record<string, string[]> {
  const source =
    size?.allowed_attribute_options && Object.keys(size.allowed_attribute_options).length > 0
      ? size.allowed_attribute_options
      : card?.allowed_attribute_options || {};
  const resolved: Record<string, string[]> = {};
  for (const [key, options] of Object.entries(source)) {
    resolved[key] = filterFrameColorOptionsForSwatches(card, key, options);
  }
  return resolved;
}
function buildInitialAttributeSelection(
  card: StorefrontCard | null,
  size?: StorefrontSizeOption | null,
): Record<string, string> {
  if (!card) {
    return {};
  }

  const initial: Record<string, string> = {};
  const allowedOptions = resolveAllowedAttributeOptions(card, size);
  const defaults = {
    ...(card.default_prodigi_attributes || {}),
    ...(size?.provider_attributes || {}),
  };
  for (const [key, options] of Object.entries(allowedOptions)) {
    if (!options.length) {
      continue;
    }
    const defaultValue = defaults[key];
    initial[key] = defaultValue && options.includes(defaultValue) ? defaultValue : options[0];
  }
  return initial;
}
function normalizeAttributeSelection(
  card: StorefrontCard | null,
  size: StorefrontSizeOption | null,
  current: Record<string, string>,
): Record<string, string> {
  const allowedOptions = resolveAllowedAttributeOptions(card, size);
  const defaults = buildInitialAttributeSelection(card, size);
  const normalized: Record<string, string> = {};
  for (const [key, options] of Object.entries(allowedOptions)) {
    if (!options.length) {
      continue;
    }
    const currentValue = current[key];
    normalized[key] = currentValue && options.includes(currentValue) ? currentValue : defaults[key];
  }
  return normalized;
}
function resolveEditionType(medium: PurchaseType, offers: MediumOffers | null): CartEditionType {
  if (medium === "canvas") {
    return offers?.open_available ? "canvas_print" : "canvas_print_limited";
  }
  return offers?.open_available ? "paper_print" : "paper_print_limited";
}
function buildFinishLabel(
  card: StorefrontCard,
  selectedAttributes: Record<string, string>,
  editionType: CartEditionType,
): string {
  const selectedDetails = Object.entries(selectedAttributes).map(
    ([key, value]) => `${titleCase(key)}: ${formatAttributeValue(value)}`,
  );
  let label = card.label;
  if (selectedDetails.length) {
    label += ` (${selectedDetails.join(", ")})`;
  }
  if (editionType.endsWith("_limited")) {
    label += " - Limited Edition";
  }
  return label;
}
function buildRouteSummary(card: StorefrontCard | null, size: StorefrontSizeOption | null): string {
  const parts: string[] = [];
  if (!card) {
    return "";
  }
  if (card.fulfillment_level) {
    parts.push(titleCase(card.fulfillment_level));
  }
  if (size?.delivery_days) {
    parts.push(size.delivery_days);
  }
  if (size?.source_country) {
    parts.push(`Source ${size.source_country}`);
  }
  return parts.join(" - ");
}
function buildShippingSummary(size: StorefrontSizeOption | null): string {
  if (!size) {
    return "Select a size to see delivery details.";
  }

  const customerShipping = resolveStorefrontShippingPrice(size);
  if (customerShipping !== null && customerShipping !== undefined) {
    return customerShipping > 0
      ? "Calculated for the selected delivery country."
      : "Delivery cannot be quoted for this selection.";
  }

  return "Delivery cannot be quoted for this selection.";
}
function resolveShippingPrice(size: StorefrontSizeOption | null): number | null {
  return resolveStorefrontShippingPrice(size);
}
function buildProfileSummary(card: StorefrontCard | null): string {
  if (!card) {
    return "Production profile will appear once a format is selected.";
  }

  const profile = card.print_profile || {};
  const parts: string[] = [];
  if (profile.editor_mode) {
    parts.push(titleCase(profile.editor_mode));
  }
  if (profile.edge_extension_mode) {
    parts.push(titleCase(profile.edge_extension_mode));
  }
  if (profile.target_dpi) {
    parts.push(`${profile.target_dpi} DPI`);
  }
  if (profile.crop_strategy) {
    parts.push(titleCase(profile.crop_strategy));
  }
  return parts.length ? parts.join(" - ") : "No per-artwork print-profile overrides are active for this card yet.";
}
function buildPreflightMetrics(
  storefront: ArtworkPrintStorefront | null,
  card: StorefrontCard | null,
  size: StorefrontSizeOption | null,
) {
  if (!storefront || !card || !size) {
    return null;
  }

  const source = storefront.print_source_metadata || {};
  const widthPx = Number(source.width_px || 0);
  const heightPx = Number(source.height_px || 0);
  const parsedSize = parseSizeLabel(size.size_label || size.slot_size_label);
  if (!parsedSize) {
    return null;
  }

  const safeMarginPct = Number(card.print_profile?.safe_margin_pct || 0);
  const mountSafeMarginPct = Number(card.print_profile?.mount_safe_margin_pct || 0);
  const wrapMarginPct = Number(card.print_profile?.wrap_margin_pct || 0);
  const targetDpi = Number(card.print_profile?.target_dpi || 300);
  const minimumDpi = Number(card.print_profile?.minimum_dpi || 150);
  const printAreaWidthPx = Number(size.print_area?.width_px || 0);
  const printAreaHeightPx = Number(size.print_area?.height_px || 0);
  const frontWidthIn = parsedSize.widthCm / 2.54;
  const frontHeightIn = parsedSize.heightCm / 2.54;
  const totalWidthIn = frontWidthIn * (1 + (wrapMarginPct / 100) * 2);
  const totalHeightIn = frontHeightIn * (1 + (wrapMarginPct / 100) * 2);

  const frontDpi = widthPx > 0 && heightPx > 0 ? Math.min(widthPx / frontWidthIn, heightPx / frontHeightIn) : null;
  const totalDpi = widthPx > 0 && heightPx > 0 ? Math.min(widthPx / totalWidthIn, heightPx / totalHeightIn) : null;
  const effectiveDpi = wrapMarginPct > 0 ? totalDpi : frontDpi;

  let status: "ready" | "caution" | "insufficient" | "missing_asset" = "missing_asset";
  if (effectiveDpi !== null) {
    if (effectiveDpi >= targetDpi) {
      status = "ready";
    } else if (effectiveDpi >= minimumDpi) {
      status = "caution";
    } else {
      status = "insufficient";
    }
  }

  return {
    safeMarginPct,
    mountSafeMarginPct,
    wrapMarginPct,
    targetDpi,
    minimumDpi,
    frontDpi,
    totalDpi,
    effectiveDpi,
    status,
    hasWrap: wrapMarginPct > 0 && card.print_profile?.editor_mode === "canvas_wrap",
    widthPx,
    heightPx,
    targetPrintAreaPxLabel:
      printAreaWidthPx > 0 && printAreaHeightPx > 0 ? `${printAreaWidthPx} x ${printAreaHeightPx} px` : null,
    printAreaSource: size.print_area?.source || null,
    frontSizeLabel: `${parsedSize.widthCm} x ${parsedSize.heightCm} cm`,
    totalSizeLabel:
      wrapMarginPct > 0
        ? `${(parsedSize.widthCm * (1 + (wrapMarginPct / 100) * 2)).toFixed(1)} x ${(
            parsedSize.heightCm *
            (1 + (wrapMarginPct / 100) * 2)
          ).toFixed(1)} cm`
        : `${parsedSize.widthCm} x ${parsedSize.heightCm} cm`,
  };
}
function formatDpiValue(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }
  return `${Math.round(value)} DPI`;
}

export {
  getSizeKey,
  titleCase,
  formatAttributeValue,
  parseSizeLabel,
  formatSizeLabel,
  formatInches,
  isMountedFrame,
  isUkShippedBoxFrame,
  buildImageWindowLabel,
  resolveAllowedAttributeOptions,
  buildInitialAttributeSelection,
  normalizeAttributeSelection,
  resolveEditionType,
  buildFinishLabel,
  buildRouteSummary,
  buildShippingSummary,
  resolveShippingPrice,
  buildProfileSummary,
  buildPreflightMetrics,
  formatDpiValue,
};
export type { CartEditionType, PrintConfiguratorProps };
