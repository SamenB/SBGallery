import { useEffect, useMemo, useState } from "react";
import {
  deleteOrder,
  fetchOrdersList,
  fetchProdigiFlow,
  fetchProdigiFulfillmentMode,
  patchOrder,
  patchOrderFulfillment,
  pollProdigiStatusRequest,
  runProdigiPreflightRequest,
  submitProdigiOrderRequest,
  updateProdigiFulfillmentMode,
} from "./ordersTab.api";
import { PAID_STATUSES, orderHasPrints } from "./ordersTab.shared";
import type {
  AdminOrder,
  FulfillmentPatchExtra,
  MainOrdersTab,
  OrderDetailTab,
  OrderEditData,
  OrderFilterType,
  ProdigiFlow,
  ProdigiMode,
} from "./ordersTab.types";

export function useOrdersAdmin() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [orderDetailTabs, setOrderDetailTabs] = useState<
    Record<number, OrderDetailTab>
  >({});
  const [mainTab, setMainTab] = useState<MainOrdersTab>("active");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterType, setFilterType] = useState<OrderFilterType>("fulfillment");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<OrderEditData | null>(null);
  const [saving, setSaving] = useState(false);
  const [fulfillmentSaving, setFulfillmentSaving] = useState<number | null>(
    null,
  );
  const [paymentSaving, setPaymentSaving] = useState<number | null>(null);
  const [prodigiMode, setProdigiMode] = useState<ProdigiMode>("automatic");
  const [prodigiModeDraft, setProdigiModeDraft] =
    useState<ProdigiMode>("automatic");
  const [modeSaving, setModeSaving] = useState(false);
  const [prodigiFlows, setProdigiFlows] = useState<Record<number, ProdigiFlow>>(
    {},
  );
  const [flowLoading, setFlowLoading] = useState<number | null>(null);
  const [prodigiSubmitting, setProdigiSubmitting] = useState<number | null>(
    null,
  );
  const [prodigiPolling, setProdigiPolling] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setOrders(await fetchOrdersList());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProdigiMode = async () => {
    try {
      const mode = await fetchProdigiFulfillmentMode();
      setProdigiMode(mode);
      setProdigiModeDraft(mode);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProdigiMode = async () => {
    setModeSaving(true);
    try {
      await updateProdigiFulfillmentMode(prodigiModeDraft);
      setProdigiMode(prodigiModeDraft);
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Failed to save Prodigi mode.",
      );
    } finally {
      setModeSaving(false);
    }
  };

  const loadProdigiFlow = async (
    orderId: number,
    options: { showLoading?: boolean } = {},
  ) => {
    const showLoading = options.showLoading ?? true;
    if (showLoading) setFlowLoading(orderId);
    try {
      const data = await fetchProdigiFlow(orderId);
      setProdigiFlows((previous) => ({ ...previous, [orderId]: data }));
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoading)
        setFlowLoading((current) => (current === orderId ? null : current));
    }
  };

  const runProdigiPreflight = async (orderId: number) => {
    setFlowLoading(orderId);
    try {
      const data = await runProdigiPreflightRequest(orderId);
      setProdigiFlows((previous) => ({ ...previous, [orderId]: data }));
      await fetchOrders();
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Prodigi preflight failed.",
      );
    } finally {
      setFlowLoading(null);
    }
  };

  const submitOrderToProdigi = async (orderId: number) => {
    if (!window.confirm("Submit this paid order to Prodigi now?")) return;
    setProdigiSubmitting(orderId);
    try {
      const data = await submitProdigiOrderRequest(orderId);
      setProdigiFlows((previous) => ({ ...previous, [orderId]: data }));
      await fetchOrders();
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Prodigi submit failed.",
      );
    } finally {
      setProdigiSubmitting(null);
    }
  };

  const pollProdigiStatus = async (orderId: number) => {
    setProdigiPolling(orderId);
    try {
      const data = await pollProdigiStatusRequest(orderId);
      setProdigiFlows((previous) => ({ ...previous, [orderId]: data }));
      await fetchOrders();
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Prodigi status poll failed.",
      );
    } finally {
      setProdigiPolling(null);
    }
  };

  useEffect(() => {
    void fetchOrders();
    void fetchProdigiMode();
  }, []);

  useEffect(() => {
    if (!expandedId) return;
    const activeTab = orderDetailTabs[expandedId] ?? "overview";
    if (activeTab !== "prodigi") return;
    const expandedOrder = orders.find((order) => order.id === expandedId);
    if (!expandedOrder || !orderHasPrints(expandedOrder)) return;
    const intervalId = window.setInterval(() => {
      void loadProdigiFlow(expandedId, { showLoading: false });
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [expandedId, orderDetailTabs, orders]);

  const handleFulfillmentChange = async (
    orderId: number,
    status: string,
    extra?: FulfillmentPatchExtra,
  ) => {
    setFulfillmentSaving(orderId);
    try {
      await patchOrderFulfillment(orderId, status, extra);
      await fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setFulfillmentSaving(null);
    }
  };

  const handlePaymentOverride = async (
    orderId: number,
    payment_status: string,
  ) => {
    setPaymentSaving(orderId);
    try {
      await patchOrder(orderId, { payment_status });
      await fetchOrders();
    } catch (error) {
      console.error("Payment override failed:", error);
    } finally {
      setPaymentSaving(null);
    }
  };

  const handlePatch = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      await patchOrder(editData.id, editData);
      await fetchOrders();
      setIsEditing(null);
      setEditData(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Permanently delete this order? This cannot be undone.\n\nOriginal artworks will be returned to inventory.",
      )
    )
      return;
    try {
      await deleteOrder(id);
      setOrders((previous) => previous.filter((order) => order.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [orders],
  );
  const filteredOrders = useMemo(() => {
    if (mainTab === "active")
      return sortedOrders.filter(
        (order) =>
          !["delivered", "cancelled"].includes(order.fulfillment_status),
      );
    if (mainTab === "completed")
      return sortedOrders.filter((order) =>
        ["delivered", "cancelled"].includes(order.fulfillment_status),
      );
    if (statusFilter === "all") return sortedOrders;
    return sortedOrders.filter((order) =>
      filterType === "payment"
        ? order.payment_status === statusFilter
        : order.fulfillment_status === statusFilter,
    );
  }, [filterType, mainTab, sortedOrders, statusFilter]);

  const paidCount = orders.filter((order) =>
    PAID_STATUSES.has(order.payment_status),
  ).length;
  const shippedCount = orders.filter((order) =>
    ["shipped", "delivered"].includes(order.fulfillment_status),
  ).length;
  const activeCount = orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.fulfillment_status),
  ).length;

  return {
    orders,
    loading,
    expandedId,
    setExpandedId,
    orderDetailTabs,
    setOrderDetailTabs,
    mainTab,
    setMainTab,
    showAdvanced,
    setShowAdvanced,
    filterType,
    setFilterType,
    statusFilter,
    setStatusFilter,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    saving,
    fulfillmentSaving,
    paymentSaving,
    prodigiMode,
    prodigiModeDraft,
    setProdigiModeDraft,
    modeSaving,
    prodigiFlows,
    flowLoading,
    prodigiSubmitting,
    prodigiPolling,
    filteredOrders,
    paidCount,
    shippedCount,
    activeCount,
    updateProdigiMode,
    loadProdigiFlow,
    handleFulfillmentChange,
    handlePaymentOverride,
    handlePatch,
    handleDelete,
    runProdigiPreflight,
    submitOrderToProdigi,
    pollProdigiStatus,
  };
}
