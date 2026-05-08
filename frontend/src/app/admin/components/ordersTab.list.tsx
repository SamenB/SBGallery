"use client";

import {
  ORDER_DETAIL_TABS,
  PAID_STATUSES,
  SectionLabel,
  PaymentPhase,
  FulfillmentPhase,
  ProdigiFlowPanel,
  inputCls,
  orderHasPrints,
} from "./ordersTab.shared";
import type { OrderDetailTab } from "./ordersTab.shared";
import { OrderActivityPanel } from "./ordersTab.activityPanel";
import { OrderOverviewPanel } from "./ordersTab.overviewPanel";
import { OrderSummaryRow } from "./ordersTab.summaryRow";
import type {
  AdminOrder,
  FulfillmentPatchExtra,
  OrderEditData,
  ProdigiFlow,
} from "./ordersTab.types";

type OrdersListProps = {
  filteredOrders: AdminOrder[];
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
  orderDetailTabs: Record<number, OrderDetailTab>;
  setOrderDetailTabs: React.Dispatch<
    React.SetStateAction<Record<number, OrderDetailTab>>
  >;
  isEditing: number | null;
  setIsEditing: (id: number | null) => void;
  editData: OrderEditData | null;
  setEditData: (data: OrderEditData | null) => void;
  saving: boolean;
  fulfillmentSaving: number | null;
  paymentSaving: number | null;
  prodigiFlows: Record<number, ProdigiFlow>;
  flowLoading: number | null;
  prodigiSubmitting: number | null;
  prodigiPolling: number | null;
  loadProdigiFlow: (orderId: number) => void;
  handleFulfillmentChange: (
    orderId: number,
    status: string,
    extra?: FulfillmentPatchExtra,
  ) => void;
  handlePaymentOverride: (orderId: number, status: string) => void;
  handlePatch: () => void;
  handleDelete: (id: number) => void;
  runProdigiPreflight: (orderId: number) => void;
  submitOrderToProdigi: (orderId: number) => void;
  pollProdigiStatus: (orderId: number) => void;
};

export function OrdersList({
  filteredOrders,
  expandedId,
  setExpandedId,
  orderDetailTabs,
  setOrderDetailTabs,
  isEditing,
  setIsEditing,
  editData,
  setEditData,
  saving,
  fulfillmentSaving,
  paymentSaving,
  prodigiFlows,
  flowLoading,
  prodigiSubmitting,
  prodigiPolling,
  loadProdigiFlow,
  handleFulfillmentChange,
  handlePaymentOverride,
  handlePatch,
  handleDelete,
  runProdigiPreflight,
  submitOrderToProdigi,
  pollProdigiStatus,
}: OrdersListProps) {
  return (
    <>
      {/*  Order List  */}
      <div className="space-y-3">
        {" "}
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-[#31323E]/2 border border-dashed border-[#31323E]/12 rounded-2xl">
            {" "}
            <div className="text-4xl mb-3 opacity-20"></div>{" "}
            <p className="text-sm font-semibold text-[#31323E]/40">
              No orders match this filter.
            </p>{" "}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            const isThisEditing = isEditing === order.id;
            const isFulfillmentSaving = fulfillmentSaving === order.id;
            const isPaymentSaving = paymentSaving === order.id;
            const activeOrderTab = orderDetailTabs[order.id] ?? "overview";
            return (
              <div
                key={order.id}
                className={`bg-white border transition-all duration-300 overflow-hidden rounded-xl ${isExpanded ? "border-[#31323E]/25 shadow-lg" : "border-[#31323E]/10 shadow-sm hover:border-[#31323E]/20 hover:shadow-md"}`}
              >
                {" "}
                <OrderSummaryRow
                  order={order}
                  isExpanded={isExpanded}
                  setExpandedId={setExpandedId}
                  setOrderDetailTabs={setOrderDetailTabs}
                  loadProdigiFlow={loadProdigiFlow}
                />
                {/* Expanded Detail */}{" "}
                {isExpanded && (
                  <div className="px-5 py-6 bg-[#EAEAEE] border-t border-[#31323E]/15 shadow-inner">
                    {" "}
                    <div className="mb-5 rounded-xl border border-[#31323E]/10 bg-white p-2">
                      {" "}
                      <div className="grid gap-2 md:grid-cols-4">
                        {" "}
                        {ORDER_DETAIL_TABS.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setOrderDetailTabs((prev) => ({
                                ...prev,
                                [order.id]: tab.id,
                              }));
                              if (
                                tab.id === "prodigi" &&
                                orderHasPrints(order)
                              ) {
                                void loadProdigiFlow(order.id);
                              }
                            }}
                            className={`rounded-lg px-4 py-3 text-left transition-all ${activeOrderTab === tab.id ? "bg-[#31323E] text-white shadow-sm" : "bg-[#F7F7F5] text-[#31323E]/55 hover:bg-[#31323E]/6 hover:text-[#31323E]"}`}
                          >
                            {" "}
                            <span className="block text-[11px] font-bold uppercase tracking-[0.14em]">
                              {tab.label}
                            </span>{" "}
                            <span
                              className={`mt-1 block text-[10px] font-semibold leading-snug ${activeOrderTab === tab.id ? "text-white/55" : "text-[#31323E]/38"}`}
                            >
                              {tab.desc}
                            </span>{" "}
                          </button>
                        ))}{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="space-y-6">
                      {" "}
                      <OrderOverviewPanel
                        order={order}
                        active={activeOrderTab === "overview"}
                        isEditing={isThisEditing}
                        editData={editData}
                        setEditData={setEditData}
                      />
                      {/*  Col 2: Payment + Fulfillment  */}{" "}
                      <div
                        className={
                          activeOrderTab === "lifecycle"
                            ? "grid gap-6 xl:grid-cols-2"
                            : "hidden"
                        }
                      >
                        {" "}
                        {/* Phase 1 */}{" "}
                        <div className="bg-white border border-[#31323E]/10 rounded-xl p-5">
                          {" "}
                          <div className="flex items-center gap-2 mb-4">
                            {" "}
                            <span className="w-6 h-6 rounded-lg bg-[#31323E] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              1
                            </span>{" "}
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#31323E]">
                              Payment Phase
                            </h4>{" "}
                          </div>{" "}
                          <PaymentPhase
                            order={order}
                            onPaymentOverride={(status) =>
                              handlePaymentOverride(order.id, status)
                            }
                            overrideSaving={isPaymentSaving}
                          />{" "}
                        </div>{" "}
                        {/* Phase 2 */}{" "}
                        <div className="bg-white border border-[#31323E]/10 rounded-xl p-5">
                          {" "}
                          <div className="flex items-center gap-2 mb-4">
                            {" "}
                            <span
                              className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${PAID_STATUSES.has(order.payment_status) ? "bg-[#31323E] text-white" : "bg-[#31323E]/10 text-[#31323E]/40"}`}
                            >
                              2
                            </span>{" "}
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#31323E]">
                              Fulfillment Phase
                            </h4>{" "}
                          </div>{" "}
                          <FulfillmentPhase
                            order={order}
                            onStatusChange={(status, extra) =>
                              handleFulfillmentChange(order.id, status, extra)
                            }
                            saving={isFulfillmentSaving}
                          />{" "}
                        </div>{" "}
                      </div>{" "}
                      {/*  Col 3: Timeline + Print Order + Actions  */}{" "}
                      <div
                        className={
                          activeOrderTab === "prodigi" ? "space-y-6" : "hidden"
                        }
                      >
                        <div className="rounded-xl border border-[#31323E]/10 bg-white p-5">
                          {" "}
                          <SectionLabel text="Fulfillment Channel" />{" "}
                          <div className="grid gap-3 md:grid-cols-3">
                            {" "}
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                              {" "}
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                                Active
                              </p>{" "}
                              <p className="mt-1 text-sm font-bold text-emerald-900">
                                Prodigi API
                              </p>{" "}
                              <p className="mt-1 text-[11px] font-medium leading-relaxed text-emerald-800/70">
                                Paid print orders are prepared, checked, and
                                submitted through Prodigi.
                              </p>{" "}
                            </div>{" "}
                            <div className="rounded-lg border border-[#31323E]/10 bg-[#F7F7F5] p-3">
                              {" "}
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#31323E]/45">
                                Removed
                              </p>{" "}
                              <p className="mt-1 text-sm font-bold text-[#31323E]">
                                Telegram print dispatch
                              </p>{" "}
                              <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#31323E]/50">
                                Order fulfillment via Telegram is not supported
                                now, so those controls were removed.
                              </p>{" "}
                            </div>{" "}
                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                              {" "}
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                                Notifications
                              </p>{" "}
                              <p className="mt-1 text-sm font-bold text-blue-900">
                                Owner Telegram alerts
                              </p>{" "}
                              <p className="mt-1 text-[11px] font-medium leading-relaxed text-blue-800/70">
                                Managed in Admin Settings. This only notifies
                                the owner, it does not fulfill orders.
                              </p>{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>{" "}
                        <ProdigiFlowPanel
                          order={order}
                          flow={prodigiFlows[order.id]}
                          loading={flowLoading === order.id}
                          submitting={prodigiSubmitting === order.id}
                          polling={prodigiPolling === order.id}
                          onRefresh={() => runProdigiPreflight(order.id)}
                          onSubmit={() => submitOrderToProdigi(order.id)}
                          onPollStatus={() => pollProdigiStatus(order.id)}
                        />{" "}
                      </div>{" "}
                      <OrderActivityPanel
                        order={order}
                        active={activeOrderTab === "activity"}
                        isEditing={isThisEditing}
                        saving={saving}
                        setIsEditing={setIsEditing}
                        setEditData={setEditData}
                        handlePatch={handlePatch}
                        handleDelete={handleDelete}
                      />
                    </div>{" "}
                  </div>
                )}{" "}
              </div>
            );
          })
        )}{" "}
      </div>{" "}
    </>
  );
}
