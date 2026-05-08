/**
 * Orders Management Tab  Two-Phase Lifecycle Dashboard.
 */

import { useState, useEffect } from "react";
import { getApiUrl, apiFetch, apiJson, getImageUrl } from "@/utils";
import { SectionLabel, orderHasPrints } from "./ordersTab.constants";
import {
  buildProdigiAssetPreviews,
  compactJson,
  formatEuro,
  formatFlowTime,
  formatPixels,
  formatProdigiSizeBridge,
  formatUsd,
  isPlainObject,
  prodigiItemCost,
} from "./ordersTab.prodigiUtils";

//  Main Component

function FlowStatusPill({ status }: { status: string }) {
  const normalized = String(status || "pending");
  const normalizedKey = normalized.toLowerCase().replace(/[\s-]+/g, "_");
  const cls = ["passed", "submitted", "complete", "completed", "shipped", "delivered"].includes(normalizedKey)
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : ["failed", "blocked", "cancelled", "canceled", "issue"].includes(normalizedKey)
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : normalizedKey === "skipped"
        ? "border-[#31323E]/10 bg-[#31323E]/4 text-[#31323E]/45"
        : "border-amber-200 bg-amber-50 text-amber-700";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${cls}`}
    >
      {["passed", "submitted", "complete", "completed", "shipped", "delivered"].includes(normalizedKey) ? "OK " : ""}
      {normalized}
    </span>
  );
}

function ProdigiFlowStepRow({ step }: { step: any }) {
  const isBad = step.status === "failed" || step.status === "blocked";
  const isPassed = step.status === "passed";
  const expectedJson = compactJson(step.expected);
  const measuredJson = compactJson(step.measured);
  const requestPayloadJson = compactJson(step.request_payload);
  return (
    <details
      className={`group rounded-lg border bg-white ${
        isBad ? "border-rose-200" : isPassed ? "border-emerald-100" : "border-[#31323E]/8"
      }`}
    >
      <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-[10px] font-bold text-[#31323E]/35 group-open:rotate-90">{">"}</span>
            <p className="truncate text-sm font-bold text-[#31323E]">{step.label}</p>
            {step.timestamp && (
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-[#31323E]/30 md:inline">
                {formatFlowTime(step.timestamp)}
              </span>
            )}
          </div>
          <p className={`mt-1 truncate text-[11px] font-medium ${isBad ? "text-rose-700" : "text-[#31323E]/50"}`}>
            {step.error || step.detail || step.purpose}
          </p>
        </div>
        <FlowStatusPill status={step.status} />
      </summary>

      <div className="border-t border-[#31323E]/8 px-3 pb-3 pt-2">
        {step.purpose && <p className="text-[11px] font-semibold leading-relaxed text-[#31323E]/70">{step.purpose}</p>}
        {step.detail && <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#31323E]/50">{step.detail}</p>}
        {step.error && (
          <p className="mt-2 rounded-md bg-rose-50 p-2 text-[11px] font-semibold leading-relaxed text-rose-700">
            {step.error}
          </p>
        )}
        {step.next_action && step.status !== "passed" && (
          <p className="mt-2 rounded-md bg-amber-50 p-2 text-[11px] font-semibold leading-relaxed text-amber-800">
            Next: {step.next_action}
          </p>
        )}
        {requestPayloadJson && (
          <details
            open={step.key === "prodigi_submit" && step.status !== "passed"}
            className="mt-2 rounded-md bg-[#121212] p-2 text-[10px] text-emerald-300"
          >
            <summary className="cursor-pointer font-bold uppercase tracking-[0.12em] text-white">
              Exact Prodigi submit payload
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto leading-relaxed">{requestPayloadJson}</pre>
          </details>
        )}
        {(expectedJson || measuredJson) && (
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {expectedJson && (
              <details className="rounded-md bg-[#F7F7F5] p-2 text-[10px] text-[#31323E]/65">
                <summary className="cursor-pointer font-bold uppercase tracking-[0.12em] text-[#31323E]/45">
                  Expected
                </summary>
                <pre className="mt-2 max-h-36 overflow-auto leading-relaxed">{expectedJson}</pre>
              </details>
            )}
            {measuredJson && (
              <details open={isBad} className="rounded-md bg-[#F7F7F5] p-2 text-[10px] text-[#31323E]/65">
                <summary className="cursor-pointer font-bold uppercase tracking-[0.12em] text-[#31323E]/45">
                  Measured
                </summary>
                <pre className="mt-2 max-h-36 overflow-auto leading-relaxed">{measuredJson}</pre>
              </details>
            )}
          </div>
        )}
        {step.timestamp && (
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#31323E]/35 md:hidden">
            {formatFlowTime(step.timestamp)}
          </p>
        )}
      </div>
    </details>
  );
}

function ProdigiAssetPreviewPanel({ flow, flowItems }: { flow: any; flowItems: any[] }) {
  const previews = buildProdigiAssetPreviews(flow, flowItems);
  const [loadedUrls, setLoadedUrls] = useState<Record<string, boolean>>({});
  const [imageSizes, setImageSizes] = useState<Record<string, string>>({});

  if (previews.length === 0) return null;

  return (
    <details className="rounded-lg border border-[#31323E]/8 bg-white p-3 text-xs">
      <summary className="cursor-pointer font-bold text-[#31323E]">
        Prodigi asset preview{" "}
        <span className="text-[#31323E]/45">
          {previews.length} rendered file{previews.length === 1 ? "" : "s"}
        </span>
      </summary>
      <div className="mt-3 space-y-3">
        {previews.map((asset: any) => {
          const canLoad = Boolean(asset.url);
          return (
            <div key={asset.key} className="rounded-lg border border-[#31323E]/8 bg-[#F7F7F5] p-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="min-w-0">
                  <p className="font-bold text-[#31323E]">{asset.title}</p>
                  <p className="mt-1 break-all text-[11px] font-medium leading-relaxed text-[#31323E]/55">
                    {asset.sku} / {asset.category || "category"} / {asset.slotLabel || "size"} /{" "}
                    {asset.printArea || "print area"}
                  </p>
                  <div className="mt-3 grid gap-2 text-[11px] md:grid-cols-2">
                    <div className="rounded-md bg-white p-2">
                      <p className="font-bold uppercase tracking-[0.12em] text-[#31323E]/35">Expected</p>
                      <p className="mt-1 font-semibold text-[#31323E]">{formatPixels(asset.expectedPx)}</p>
                    </div>
                    <div className="rounded-md bg-white p-2">
                      <p className="font-bold uppercase tracking-[0.12em] text-[#31323E]/35">Rendered</p>
                      <p className="mt-1 font-semibold text-[#31323E]">{formatPixels(asset.actualPx)}</p>
                    </div>
                    <div className="rounded-md bg-white p-2">
                      <p className="font-bold uppercase tracking-[0.12em] text-[#31323E]/35">Live Prodigi</p>
                      <p className="mt-1 font-semibold text-[#31323E]">{formatPixels(asset.livePx)}</p>
                    </div>
                    <div className="rounded-md bg-white p-2">
                      <p className="font-bold uppercase tracking-[0.12em] text-[#31323E]/35">Effective DPI</p>
                      <p className="mt-1 font-semibold text-[#31323E]">{asset.dpi || "Unknown"}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-[10px] text-[#31323E]/55 md:grid-cols-2">
                    <p className="truncate">
                      <span className="font-bold text-[#31323E]/45">MD5:</span> {asset.md5 || "missing"}
                    </p>
                    <p className="truncate">
                      <span className="font-bold text-[#31323E]/45">ETag:</span> {asset.etag || "not checked"}
                    </p>
                    <p className="truncate">
                      <span className="font-bold text-[#31323E]/45">Size:</span> {asset.fileSize || "unknown"}
                    </p>
                    <p className="truncate">
                      <span className="font-bold text-[#31323E]/45">Render:</span> {asset.renderKind || "PNG"}
                    </p>
                  </div>
                  {asset.url && (
                    <p className="mt-2 break-all text-[10px] font-medium leading-relaxed text-[#31323E]/45">
                      {asset.url}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!canLoad}
                      onClick={() => setLoadedUrls((prev) => ({ ...prev, [asset.key]: true }))}
                      className="rounded-md border border-[#31323E]/15 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#31323E]/65 disabled:opacity-40"
                    >
                      Load preview
                    </button>
                    {asset.url && (
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-[#31323E]/15 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#31323E]/65"
                      >
                        Open original
                      </a>
                    )}
                  </div>
                  {imageSizes[asset.key] && (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                      Browser loaded: {imageSizes[asset.key]}
                    </p>
                  )}
                </div>

                <div className="flex min-h-[160px] items-center justify-center rounded-md border border-[#31323E]/10 bg-white">
                  {loadedUrls[asset.key] && asset.url ? (
                    <img
                      src={asset.url}
                      alt={`Rendered Prodigi asset for ${asset.title}`}
                      loading="lazy"
                      onLoad={(event) => {
                        const img = event.currentTarget;
                        setImageSizes((prev) => ({
                          ...prev,
                          [asset.key]: `${img.naturalWidth.toLocaleString()} x ${img.naturalHeight.toLocaleString()} px`,
                        }));
                      }}
                      className="max-h-[360px] w-full object-contain"
                    />
                  ) : (
                    <p className="px-4 text-center text-[11px] font-semibold leading-relaxed text-[#31323E]/40">
                      Preview is lazy-loaded because print PNGs can be large.
                    </p>
                  )}
                </div>
              </div>
              {isPlainObject(asset.attributes) && (
                <details className="mt-3 rounded-md bg-white p-2 text-[10px] text-[#31323E]/60">
                  <summary className="cursor-pointer font-bold uppercase tracking-[0.12em] text-[#31323E]/45">
                    Payload attributes
                  </summary>
                  <pre className="mt-2 max-h-28 overflow-auto leading-relaxed">{compactJson(asset.attributes)}</pre>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </details>
  );
}

function ProdigiWebhookStatusPanel({
  flow,
  latestJob,
  canSubmit,
  submitting,
  polling,
  loading,
  submitLabel,
  onRefresh,
  onSubmit,
  onRequestStatus,
}: {
  flow: any;
  latestJob: any;
  canSubmit: boolean;
  submitting: boolean;
  polling: boolean;
  loading: boolean;
  submitLabel: string;
  onRefresh: () => void;
  onSubmit: () => void;
  onRequestStatus: () => void;
}) {
  const webhookStatus = flow?.webhook_status ?? {};
  const readiness = flow?.webhook_readiness ?? {};
  const webhookJson = compactJson(flow?.latest_webhook_event?.response_payload);
  const requestJson = compactJson(flow?.latest_status_poll_event?.response_payload);
  const submitPayloadJson = compactJson(latestJob?.request_payload);
  const hasProdigiOrder = Boolean(latestJob?.prodigi_order_id);
  const remoteStatus =
    webhookStatus.status_stage ||
    latestJob?.status_stage ||
    webhookStatus.job_status ||
    latestJob?.status ||
    (hasProdigiOrder ? "pending" : "No Prodigi order yet");
  const readinessRows = [
    ["Mode", readiness.prodigi_api_mode ?? flow?.settings?.prodigi_api_mode],
    ["Public URL", readiness.public_base_url_present ? readiness.public_base_url : "Missing"],
    ["HTTPS", readiness.public_base_url_is_https ? "Ready" : "Not public HTTPS"],
    ["Secret", readiness.webhook_secret_configured ? "Configured" : "Missing"],
  ];

  return (
    <div className="rounded-xl border border-[#31323E]/10 bg-white p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="min-w-0">
          <SectionLabel text="Webhook / Status" />
          <div className="flex flex-wrap items-center gap-2">
            <FlowStatusPill status={remoteStatus} />
            <p className="text-sm font-bold text-[#31323E]">{remoteStatus}</p>
            {webhookStatus.latest_event_at && (
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#31323E]/35">
                {formatFlowTime(webhookStatus.latest_event_at)}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs font-medium leading-relaxed text-[#31323E]/55">
            {hasProdigiOrder
              ? `${webhookStatus.state || "Awaiting webhook"} for Prodigi order ${latestJob.prodigi_order_id}.`
              : "Submit creates a Prodigi order first; webhook and manual status requests appear after that."}
          </p>
          {readiness.callback_url && (
            <p className="mt-2 break-all rounded-md bg-[#F7F7F5] p-2 text-[10px] font-medium leading-relaxed text-[#31323E]/45">
              {readiness.callback_url}
            </p>
          )}
          <div className="mt-3 grid gap-2 text-[11px] md:grid-cols-2">
            {readinessRows.map(([label, value]) => (
              <div key={label} className="rounded-md border border-[#31323E]/8 bg-[#F7F7F5] p-2">
                <p className="font-bold uppercase tracking-[0.12em] text-[#31323E]/35">{label}</p>
                <p className="mt-1 break-all font-semibold text-[#31323E]">{String(value ?? "-")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="w-full rounded-xl border border-[#31323E]/15 bg-white py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#31323E]/65 transition-all disabled:opacity-40"
          >
            {loading ? "Refreshing Preflight..." : "Refresh Preflight"}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            className="w-full rounded-xl bg-[#31323E] py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all disabled:opacity-35"
          >
            {submitting ? "Submitting to Prodigi..." : submitLabel}
          </button>
          <button
            type="button"
            onClick={onRequestStatus}
            disabled={!hasProdigiOrder || polling}
            className="w-full rounded-xl border border-[#31323E]/15 bg-white py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#31323E]/65 transition-all disabled:opacity-40"
          >
            {polling ? "Requesting Status..." : "Request Status"}
          </button>
        </div>
      </div>

      {submitPayloadJson ? (
        <details className="mt-3 rounded-lg border border-[#31323E]/8 bg-[#121212] p-3 text-xs">
          <summary className="cursor-pointer font-bold text-white">
            Exact Prodigi submit payload{" "}
            <span className="text-white/45">{latestJob?.request_payload?.merchantReference}</span>
          </summary>
          <pre className="mt-2 max-h-96 overflow-auto text-[10px] leading-relaxed text-emerald-300">
            {submitPayloadJson}
          </pre>
        </details>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed border-[#31323E]/12 bg-[#F7F7F5] p-3 text-[11px] font-semibold leading-relaxed text-[#31323E]/45">
          No Prodigi submit payload has been prepared yet. Run Refresh Preflight to build it.
        </div>
      )}

      {(webhookJson || requestJson) && (
        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          {webhookJson && (
            <details className="rounded-lg border border-[#31323E]/8 bg-[#121212] p-3 text-xs">
              <summary className="cursor-pointer font-bold text-white">Last webhook JSON</summary>
              <pre className="mt-2 max-h-72 overflow-auto text-[10px] leading-relaxed text-emerald-300">
                {webhookJson}
              </pre>
            </details>
          )}
          {requestJson && (
            <details className="rounded-lg border border-[#31323E]/8 bg-[#121212] p-3 text-xs">
              <summary className="cursor-pointer font-bold text-white">Last request JSON</summary>
              <pre className="mt-2 max-h-72 overflow-auto text-[10px] leading-relaxed text-emerald-300">
                {requestJson}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export { FlowStatusPill, ProdigiFlowStepRow, ProdigiAssetPreviewPanel, ProdigiWebhookStatusPanel };
