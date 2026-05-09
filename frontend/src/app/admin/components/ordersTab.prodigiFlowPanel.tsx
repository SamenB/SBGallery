import { SectionLabel, orderHasPrints } from "./ordersTab.constants";
import {
  formatEuro,
  formatUsd,
  prodigiItemCost,
} from "./ordersTab.prodigiUtils";
import {
  ProdigiFlowStepRow,
  ProdigiWebhookStatusPanel,
} from "./ordersTab.prodigiAtoms";
import { ProdigiCostItemsPanel } from "./ordersTab.prodigiCostPanel";
import { ProdigiEventsPanel } from "./ordersTab.prodigiEventsPanel";
import type { AdminOrder, ProdigiFlow } from "./ordersTab.types";

function ProdigiFlowPanel({
  order,
  flow,
  loading,
  submitting,
  polling,
  onRefresh,
  onSubmit,
  onPollStatus,
}: {
  order: AdminOrder;
  flow: ProdigiFlow | undefined;
  loading: boolean;
  submitting: boolean;
  polling: boolean;
  onRefresh: () => void;
  onSubmit: () => void;
  onPollStatus: () => void;
}) {
  const hasPrints = orderHasPrints(order);
  const flowItems = flow?.items ?? [];
  const supplierTotal = flowItems.reduce(
    (sum: number, item: any) => sum + prodigiItemCost(item),
    0,
  );
  const customerPaid = Number(order.total_price ?? 0);
  const costGate = (flow?.gates ?? []).find(
    (gate: any) => gate.gate === "cost_covered",
  );
  const costMeasured = costGate?.measured ?? {};
  const comparablePaid = Number(
    costMeasured.customer_paid_eur ?? customerPaid,
  );
  const customerPaidUsd = Number(costMeasured.customer_paid ?? customerPaid);
  const usdToEurRate = Number(costMeasured.usd_to_eur_rate ?? 0);
  const costCoveredByBackend =
    typeof costMeasured.covered === "boolean"
      ? costMeasured.covered
      : costGate?.status === "passed";
  const isUnderpaid =
    costGate !== undefined
      ? !costCoveredByBackend
      : supplierTotal > 0 && supplierTotal > comparablePaid;
  const margin = comparablePaid - supplierTotal;
  const latestJob = (flow?.jobs ?? [])[0];
  const preflightPassed = flow?.preflight_status === "passed";
  const submitBlocker = isUnderpaid
    ? "Prodigi submit is blocked by the cost check."
    : flow?.manual_submit_blocker;
  const canSubmit = Boolean(
    flow?.can_submit_manually && !isUnderpaid && preflightPassed,
  );
  const submitLabel = isUnderpaid
    ? "Prodigi Submit Blocked By Cost Check"
    : submitBlocker
      ? submitBlocker
      : "Submit This Order To Prodigi";
  return (
    <div className="bg-white border border-[#31323E]/10 rounded-xl p-5">
      <div className="mb-4">
        <div>
          <SectionLabel text="Prodigi API Flow" />
          <p className="text-xs font-medium leading-relaxed text-[#31323E]/50">
            Payment confirmation creates permission to fulfill. Prodigi
            submission either runs automatically or waits for the manual button
            here.
          </p>
        </div>
      </div>

      {!hasPrints ? (
        <div className="rounded-lg border border-[#31323E]/10 bg-[#31323E]/3 p-4 text-xs font-semibold text-[#31323E]/50">
          This order has no Prodigi-backed print items.
        </div>
      ) : !flow ? (
        <div className="rounded-lg border border-[#31323E]/10 bg-[#31323E]/3 p-4 text-xs font-semibold text-[#31323E]/50">
          {loading
            ? "Loading Prodigi flow..."
            : "Open the Prodigi tab to load the fulfillment flow."}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
            <div className="rounded-lg border border-[#31323E]/10 bg-[#F7F7F5] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#31323E]/40">
                Execution
              </p>
              <p className="mt-1 font-bold text-[#31323E]">
                {flow.settings?.fulfillment_mode}
              </p>
            </div>
            <div className="rounded-lg border border-[#31323E]/10 bg-[#F7F7F5] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#31323E]/40">
                Prodigi API
              </p>
              <p className="mt-1 font-bold text-[#31323E]">
                {flow.settings?.prodigi_api_mode}
              </p>
            </div>
            <div className="rounded-lg border border-[#31323E]/10 bg-[#F7F7F5] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#31323E]/40">
                Paid
              </p>
              <p className="mt-1 font-bold text-[#31323E]">
                ${Number(order.total_price ?? 0).toFixed(0)}
              </p>
            </div>
            <div className="rounded-lg border border-[#31323E]/10 bg-[#F7F7F5] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#31323E]/40">
                Prodigi Cost
              </p>
              <p className="mt-1 font-bold text-[#31323E]">
                {formatEuro(supplierTotal)}
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isUnderpaid
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">
                  {isUnderpaid ? "Cost check failed" : "Cost check passed"}
                </p>
                <p className="mt-1 text-xs font-medium leading-relaxed opacity-80">
                  Customer paid ${customerPaidUsd.toFixed(2)}
                  {usdToEurRate > 0
                    ? ` (${formatEuro(comparablePaid)} at USD/EUR ${usdToEurRate.toFixed(4)})`
                    : ""}.
                  Prodigi supplier total is {formatEuro(supplierTotal)}.
                </p>
              </div>
              <span className="rounded-md border border-current/20 bg-white/55 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                {isUnderpaid
                  ? `Under by ${formatEuro(Math.abs(margin))}`
                  : `Margin ${formatEuro(margin)}`}
              </span>
            </div>
            {isUnderpaid ? (
              <p className="mt-3 rounded-lg bg-white/70 p-3 text-xs font-semibold leading-relaxed">
                Prodigi submit is blocked. Fix the storefront price, collect an
                adjustment, or recreate the order with the current baked price
                before sending it to production.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <ProdigiWebhookStatusPanel
              flow={flow}
              latestJob={latestJob}
              canSubmit={canSubmit}
              submitting={submitting}
              polling={polling}
              loading={loading}
              submitLabel={submitLabel}
              onRefresh={onRefresh}
              onSubmit={onSubmit}
              onRequestStatus={onPollStatus}
            />

            {(flow.summary ?? []).map((step: any) => (
              <ProdigiFlowStepRow key={step.key} step={step} />
            ))}
          </div>

          <ProdigiCostItemsPanel flowItems={flowItems} />
          <ProdigiEventsPanel flow={flow} flowItems={flowItems} />
        </div>
      )}
    </div>
  );
}

export { ProdigiFlowPanel };
