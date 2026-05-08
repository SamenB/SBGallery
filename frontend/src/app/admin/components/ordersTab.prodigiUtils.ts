/**
 * Orders Management Tab  Two-Phase Lifecycle Dashboard.
 */

import { useState, useEffect } from "react";
import { getApiUrl, apiFetch, apiJson, getImageUrl } from "@/utils";

function formatFlowTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function compactJson(value: unknown) {
  if (!value || typeof value !== "object") return null;
  return JSON.stringify(value, null, 2);
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function formatEuro(value: unknown) {
  const amount = Number(value ?? 0);
  return `EUR ${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
}

function formatUsd(value: unknown) {
  const amount = Number(value ?? 0);
  return `$${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
}

function formatProdigiSizeBridge(item: any) {
  const slot = String(item?.prodigi_slot_size_label ?? item?.size ?? "").trim();
  const sku = String(item?.prodigi_sku ?? "");
  const match = sku.match(/(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/i);
  if (!slot || !match) return null;

  const skuWidthIn = Number(match[1]);
  const skuHeightIn = Number(match[2]);
  if (!Number.isFinite(skuWidthIn) || !Number.isFinite(skuHeightIn)) return null;

  const skuWidthCm = Math.round(skuWidthIn * 2.54);
  const skuHeightCm = Math.round(skuHeightIn * 2.54);
  const cmLabel = `${skuWidthCm}x${skuHeightCm}`;
  const reversedCmLabel = `${skuHeightCm}x${skuWidthCm}`;
  const normalizedSlot = slot.toLowerCase().replace(/\s+/g, "");
  const matchesSlot = normalizedSlot === cmLabel.toLowerCase() || normalizedSlot === reversedCmLabel.toLowerCase();

  return {
    skuSizeIn: `${Number.isInteger(skuWidthIn) ? skuWidthIn.toFixed(0) : skuWidthIn}x${
      Number.isInteger(skuHeightIn) ? skuHeightIn.toFixed(0) : skuHeightIn
    }`,
    skuSizeCm: cmLabel,
    matchesSlot,
  };
}

function prodigiItemCost(item: any) {
  return (
    Number(item.economics?.supplier_total_cost ?? item.prodigi_supplier_total_eur ?? 0) ||
    Number(item.prodigi_wholesale_eur ?? 0) + Number(item.prodigi_shipping_eur ?? 0)
  );
}

function formatPixels(value: unknown) {
  if (!Array.isArray(value) || value.length < 2) return "Unknown";
  return `${Number(value[0]).toLocaleString()} x ${Number(value[1]).toLocaleString()} px`;
}

function formatBytes(value: unknown) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function parseCmPair(label?: string | null) {
  const match = String(label ?? "").match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

function estimateDpi(px: unknown, slotLabel?: string | null) {
  if (!Array.isArray(px) || px.length < 2) return null;
  const cm = parseCmPair(slotLabel);
  if (!cm) return null;
  const widthDpi = Number(px[0]) / (cm[0] / 2.54);
  const heightDpi = Number(px[1]) / (cm[1] / 2.54);
  if (!Number.isFinite(widthDpi) || !Number.isFinite(heightDpi)) return null;
  return `${Math.round(widthDpi)} x ${Math.round(heightDpi)} DPI`;
}

function gateFor(flow: any, gateName: string, itemId?: unknown) {
  const gates = flow?.gates ?? [];
  const normalizedItemId = itemId == null ? null : Number(itemId);
  return (
    gates.find(
      (gate: any) =>
        gate.gate === gateName && (normalizedItemId == null || Number(gate.order_item_id) === normalizedItemId),
    ) ?? gates.find((gate: any) => gate.gate === gateName)
  );
}

function payloadItemOrderItemId(payloadItem: any) {
  const match = String(payloadItem?.merchantReference ?? "").match(/-item-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function buildProdigiAssetPreviews(flow: any, flowItems: any[]) {
  const latestJob = (flow?.jobs ?? [])[0];
  const payloadItems = latestJob?.request_payload?.items ?? [];
  if (!Array.isArray(payloadItems) || payloadItems.length === 0) return [];

  return payloadItems.flatMap((payloadItem: any, payloadIndex: number) => {
    const assets = Array.isArray(payloadItem?.assets) ? payloadItem.assets : [];
    const orderItemId = payloadItemOrderItemId(payloadItem);
    const flowItem =
      flowItems.find((item: any) => Number(item.id) === Number(orderItemId)) ?? flowItems[payloadIndex] ?? {};
    const renderGate = gateFor(flow, "asset_rendered", orderItemId);
    const pixelGate = gateFor(flow, "rendered_asset_pixel_match", orderItemId);
    const md5Gate = gateFor(flow, "rendered_asset_md5_ready", orderItemId);
    const publicGate = gateFor(flow, "public_asset_url_ready", orderItemId);
    const downloadGate = gateFor(flow, "public_asset_download_verified", orderItemId);
    const liveGate = gateFor(flow, "live_prodigi_pixel_contract_verified", orderItemId);
    const slotLabel = flowItem.prodigi_slot_size_label ?? payloadItem.attributes?.size;
    const actualPx = pixelGate?.measured?.actual_px;
    const expectedPx = pixelGate?.expected?.expected_px;
    const livePx = liveGate?.measured ? [liveGate.measured.width_px, liveGate.measured.height_px] : null;
    const fileSize = formatBytes(downloadGate?.measured?.content_length);

    return assets.map((asset: any, assetIndex: number) => ({
      key: `${payloadItem.merchantReference ?? payloadIndex}-${asset.printArea ?? assetIndex}`,
      title: flowItem.title || payloadItem.merchantReference || `Prodigi item ${payloadIndex + 1}`,
      sku: payloadItem.sku,
      category: flowItem.prodigi_category_id,
      slotLabel,
      printArea: asset.printArea,
      url: asset.url ?? publicGate?.measured?.asset_url,
      md5: asset.md5Hash ?? md5Gate?.measured?.md5_hash,
      actualPx,
      expectedPx,
      livePx,
      dpi: estimateDpi(actualPx ?? expectedPx, slotLabel),
      renderKind: renderGate?.measured?.derivative_kind,
      filePath: renderGate?.measured?.file_path,
      storageKey: publicGate?.measured?.storage_key,
      fileSize,
      etag: downloadGate?.measured?.etag,
      attributes: payloadItem.attributes,
    }));
  });
}

export {
  formatFlowTime,
  compactJson,
  isPlainObject,
  formatEuro,
  formatUsd,
  formatProdigiSizeBridge,
  prodigiItemCost,
  formatPixels,
  formatBytes,
  parseCmPair,
  estimateDpi,
  gateFor,
  payloadItemOrderItemId,
  buildProdigiAssetPreviews,
};
