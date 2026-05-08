"use client";

import { OrdersDashboardHeader } from "./ordersTab.dashboardHeader";
import { OrdersList } from "./ordersTab.list";
import { useOrdersAdmin } from "./useOrdersAdmin";

export default function OrdersTab() {
  const ordersAdmin = useOrdersAdmin();

  if (ordersAdmin.loading) {
    return (
      <div className="flex items-center gap-3 py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#31323E]/20 border-t-[#31323E]" />
        <span className="text-sm font-bold uppercase tracking-wider text-[#31323E]/50">
          Loading Orders
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] font-sans text-[#31323E]">
      <OrdersDashboardHeader
        totalCount={ordersAdmin.orders.length}
        activeCount={ordersAdmin.activeCount}
        paidCount={ordersAdmin.paidCount}
        shippedCount={ordersAdmin.shippedCount}
        prodigiMode={ordersAdmin.prodigiMode}
        prodigiModeDraft={ordersAdmin.prodigiModeDraft}
        modeSaving={ordersAdmin.modeSaving}
        mainTab={ordersAdmin.mainTab}
        showAdvanced={ordersAdmin.showAdvanced}
        filterType={ordersAdmin.filterType}
        statusFilter={ordersAdmin.statusFilter}
        onProdigiModeDraftChange={ordersAdmin.setProdigiModeDraft}
        onSaveProdigiMode={ordersAdmin.updateProdigiMode}
        onMainTabChange={ordersAdmin.setMainTab}
        onShowAdvancedChange={ordersAdmin.setShowAdvanced}
        onFilterTypeChange={ordersAdmin.setFilterType}
        onStatusFilterChange={ordersAdmin.setStatusFilter}
      />
      <OrdersList
        filteredOrders={ordersAdmin.filteredOrders}
        expandedId={ordersAdmin.expandedId}
        setExpandedId={ordersAdmin.setExpandedId}
        orderDetailTabs={ordersAdmin.orderDetailTabs}
        setOrderDetailTabs={ordersAdmin.setOrderDetailTabs}
        isEditing={ordersAdmin.isEditing}
        setIsEditing={ordersAdmin.setIsEditing}
        editData={ordersAdmin.editData}
        setEditData={ordersAdmin.setEditData}
        saving={ordersAdmin.saving}
        fulfillmentSaving={ordersAdmin.fulfillmentSaving}
        paymentSaving={ordersAdmin.paymentSaving}
        prodigiFlows={ordersAdmin.prodigiFlows}
        flowLoading={ordersAdmin.flowLoading}
        prodigiSubmitting={ordersAdmin.prodigiSubmitting}
        prodigiPolling={ordersAdmin.prodigiPolling}
        loadProdigiFlow={ordersAdmin.loadProdigiFlow}
        handleFulfillmentChange={ordersAdmin.handleFulfillmentChange}
        handlePaymentOverride={ordersAdmin.handlePaymentOverride}
        handlePatch={ordersAdmin.handlePatch}
        handleDelete={ordersAdmin.handleDelete}
        runProdigiPreflight={ordersAdmin.runProdigiPreflight}
        submitOrderToProdigi={ordersAdmin.submitOrderToProdigi}
        pollProdigiStatus={ordersAdmin.pollProdigiStatus}
      />
    </div>
  );
}
