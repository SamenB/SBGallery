import type { Dispatch, SetStateAction } from "react";
import { Database, Play } from "lucide-react";
import {
  fallbackModes,
  formatDecision,
  formatNumber,
  joinList,
  splitList,
  tierOptions,
} from "./prodigiStorefrontSettings.shared";
import type {
  CategoryDraft,
  ProductionPrepareDecision,
  ShippingPolicy,
  SnapshotDefaults,
  StorefrontSettingsPayload,
} from "./prodigiStorefrontSettings.shared";
import {
  FieldLabel,
  JsonField,
  StatusMetric,
} from "./prodigiStorefrontSettings.ui";

export function ActivePayloadStatus({
  payload,
}: {
  payload: StorefrontSettingsPayload;
}) {
  const activeBake = payload.status.active_bake;
  return (
    <section className="rounded-lg border border-[#31323E]/10 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Active Payload Status</h3>
          <p className="text-xs font-semibold text-[#31323E]/45">
            Policy version {payload.effective.payload_policy_version}
          </p>
        </div>
        <div className="text-right text-xs font-bold text-[#31323E]/55">
          <div>
            {payload.status.materialized_payload_count} materialized payloads
          </div>
          <div>
            {payload.settings.updated_at
              ? `Updated ${payload.settings.updated_at}`
              : "Not saved yet"}
          </div>
        </div>
      </div>
      {activeBake ? (
        <div className="grid gap-3 text-sm md:grid-cols-4">
          <StatusMetric label="Bake" value={`#${activeBake.id}`} />
          <StatusMetric label="Paper" value={activeBake.paper_material} />
          <StatusMetric
            label="Countries"
            value={String(activeBake.country_count)}
          />
          <StatusMetric
            label="Offer sizes"
            value={String(activeBake.offer_size_count)}
          />
        </div>
      ) : (
        <p className="text-sm font-semibold text-[#31323E]/50">
          No active bake exists yet.
        </p>
      )}
    </section>
  );
}

export function ProductionPreparePanel({
  busyAction,
  productionDecision,
  includeApiChecks,
  setIncludeApiChecks,
  includeQuotes,
  setIncludeQuotes,
  runProductionPrepare,
}: {
  busyAction: string | null;
  productionDecision: ProductionPrepareDecision | null;
  includeApiChecks: boolean;
  setIncludeApiChecks: Dispatch<SetStateAction<boolean>>;
  includeQuotes: boolean;
  setIncludeQuotes: Dispatch<SetStateAction<boolean>>;
  runProductionPrepare: (force: boolean) => void;
}) {
  return (
    <section className="rounded-lg border border-[#31323E]/10 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Production Prepare</h3>
          <p className="mt-1 text-xs font-semibold text-[#31323E]/45">
            Curated CSV fingerprint, active bake, materialized payloads,
            validation, and cache clear.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runProductionPrepare(false)}
            disabled={busyAction !== null}
            className="inline-flex items-center gap-2 rounded-md bg-[#31323E] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-45"
          >
            <Play size={15} />
            {busyAction === "prepare" ? "Running" : "Run If Needed"}
          </button>
          <button
            type="button"
            onClick={() => runProductionPrepare(true)}
            disabled={busyAction !== null}
            className="inline-flex items-center gap-2 rounded-md border border-[#31323E]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#31323E] disabled:opacity-45"
          >
            <Database size={15} />
            {busyAction === "prepare-force" ? "Running" : "Force Rebuild"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-4">
        <StatusMetric
          label="Decision"
          value={formatDecision(productionDecision)}
        />
        <StatusMetric
          label="Reasons"
          value={
            productionDecision?.reasons.length
              ? productionDecision.reasons.join(", ")
              : "None"
          }
        />
        <StatusMetric
          label="CSV Rows"
          value={formatNumber(productionDecision?.source?.rows_seen)}
        />
        <StatusMetric
          label="Payloads"
          value={formatNumber(productionDecision?.materialized_payload_count)}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-md border border-[#31323E]/10 px-3 py-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={includeApiChecks}
            onChange={(event) => setIncludeApiChecks(event.target.checked)}
          />
          Cross-check product details with Prodigi API
        </label>
        <label className="flex items-center gap-3 rounded-md border border-[#31323E]/10 px-3 py-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={includeQuotes}
            onChange={(event) => setIncludeQuotes(event.target.checked)}
          />
          Include Prodigi quote checks
        </label>
      </div>

      {productionDecision ? (
        <div className="mt-4 grid gap-3 text-xs font-semibold text-[#31323E]/55 md:grid-cols-2">
          <div className="rounded-md bg-[#F7F7F5] px-3 py-2">
            <div className="font-bold text-[#31323E]/70">Expected</div>
            <div>
              Pipeline{" "}
              {productionDecision.expected.pipeline_version || "unknown"}
            </div>
            <div>
              Policy {productionDecision.expected.policy_version || "unknown"}
            </div>
          </div>
          <div className="rounded-md bg-[#F7F7F5] px-3 py-2">
            <div className="font-bold text-[#31323E]/70">Active Bake</div>
            <div>
              {productionDecision.active_bake?.bake_key || "No active bake"}
            </div>
            <div>
              {productionDecision.active_bake?.offer_group_count || 0} groups /{" "}
              {productionDecision.active_bake?.offer_size_count || 0} sizes
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function PolicyDefaultsPanel({
  shippingPolicy,
  setShippingPolicy,
  snapshotDefaults,
  setSnapshotDefaults,
  payloadPolicyVersion,
  setPayloadPolicyVersion,
}: {
  shippingPolicy: ShippingPolicy;
  setShippingPolicy: Dispatch<SetStateAction<ShippingPolicy | null>>;
  snapshotDefaults: SnapshotDefaults;
  setSnapshotDefaults: Dispatch<SetStateAction<SnapshotDefaults | null>>;
  payloadPolicyVersion: string;
  setPayloadPolicyVersion: Dispatch<SetStateAction<string>>;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-[#31323E]/10 p-4">
        <h3 className="text-lg font-bold">Shipping Policy</h3>
        <div className="mt-4 grid gap-3">
          <FieldLabel label="Checkout Cap">
            <input
              type="number"
              min={0}
              step="0.01"
              value={shippingPolicy.checkout_shipping_cap}
              onChange={(event) =>
                setShippingPolicy({
                  ...shippingPolicy,
                  checkout_shipping_cap: Number(event.target.value),
                })
              }
              className="w-full rounded-md border border-[#31323E]/15 px-3 py-2 text-sm font-semibold"
            />
          </FieldLabel>
          <FieldLabel label="Preferred Tier Order">
            <input
              value={joinList(shippingPolicy.preferred_tier_order)}
              onChange={(event) =>
                setShippingPolicy({
                  ...shippingPolicy,
                  preferred_tier_order: splitList(event.target.value),
                })
              }
              className="w-full rounded-md border border-[#31323E]/15 px-3 py-2 text-sm font-semibold"
            />
          </FieldLabel>
          <div className="grid gap-3 md:grid-cols-2">
            <FieldLabel label="Fallback Mode">
              <select
                value={shippingPolicy.fallback_when_none_under_cap}
                onChange={(event) =>
                  setShippingPolicy({
                    ...shippingPolicy,
                    fallback_when_none_under_cap: event.target.value,
                  })
                }
                className="w-full rounded-md border border-[#31323E]/15 bg-white px-3 py-2 text-sm font-semibold"
              >
                {fallbackModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </FieldLabel>
            <FieldLabel label="Fallback Tier">
              <select
                value={shippingPolicy.fallback_tier}
                onChange={(event) =>
                  setShippingPolicy({
                    ...shippingPolicy,
                    fallback_tier: event.target.value,
                  })
                }
                className="w-full rounded-md border border-[#31323E]/15 bg-white px-3 py-2 text-sm font-semibold"
              >
                {tierOptions.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </FieldLabel>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#31323E]/10 p-4">
        <h3 className="text-lg font-bold">Snapshot Defaults</h3>
        <div className="mt-4 grid gap-3">
          <FieldLabel label="Paper Material">
            <input
              value={snapshotDefaults.paper_material}
              onChange={(event) =>
                setSnapshotDefaults({
                  ...snapshotDefaults,
                  paper_material: event.target.value,
                })
              }
              className="w-full rounded-md border border-[#31323E]/15 px-3 py-2 text-sm font-semibold"
            />
          </FieldLabel>
          <FieldLabel label="Payload Policy Version">
            <input
              value={payloadPolicyVersion}
              onChange={(event) => setPayloadPolicyVersion(event.target.value)}
              className="w-full rounded-md border border-[#31323E]/15 px-3 py-2 text-sm font-semibold"
            />
          </FieldLabel>
          <label className="flex items-center gap-3 rounded-md border border-[#31323E]/10 px-3 py-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={snapshotDefaults.include_notice_level}
              onChange={(event) =>
                setSnapshotDefaults({
                  ...snapshotDefaults,
                  include_notice_level: event.target.checked,
                })
              }
            />
            Include notice-level cross-border categories
          </label>
        </div>
      </div>
    </section>
  );
}
