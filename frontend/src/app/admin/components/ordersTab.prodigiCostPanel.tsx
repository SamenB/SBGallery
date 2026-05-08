import { SectionLabel } from "./ordersTab.constants";
import {
  compactJson,
  formatEuro,
  formatProdigiSizeBridge,
  formatUsd,
  prodigiItemCost,
} from "./ordersTab.prodigiUtils";
import type { ProdigiRecord } from "./ordersTab.types";

export function ProdigiCostItemsPanel({
  flowItems,
}: {
  flowItems: ProdigiRecord[];
}) {
  return (
    <div className="space-y-3">
      <SectionLabel text="Prodigi Items And Cost Check" />
      {flowItems.map((item) => (
        <ProdigiCostItem key={String(item.id)} item={item} />
      ))}
    </div>
  );
}

function ProdigiCostItem({ item }: { item: ProdigiRecord }) {
  const economics = (item.economics ?? {}) as ProdigiRecord;
  const customerProduct = Number(
    economics.customer_product_price ?? item.customer_product_price ?? 0,
  );
  const customerDelivery = Number(
    economics.customer_shipping_price ?? item.customer_shipping_price ?? 0,
  );
  const customerLine = Number(
    economics.customer_line_total ??
      item.customer_line_total ??
      item.price ??
      0,
  );
  const supplierProduct = Number(
    economics.supplier_product_cost ?? item.prodigi_wholesale_eur ?? 0,
  );
  const supplierDelivery = Number(
    economics.supplier_shipping_cost ?? item.prodigi_shipping_eur ?? 0,
  );
  const supplierLine = Number(
    economics.supplier_total_cost ?? prodigiItemCost(item),
  );
  const productMargin = Number(
    economics.product_margin ?? customerProduct - supplierProduct,
  );
  const deliveryMargin = Number(
    economics.shipping_margin ?? customerDelivery - supplierDelivery,
  );
  const totalMargin = Number(
    economics.total_margin ?? customerLine - supplierLine,
  );
  const sizeBridge = formatProdigiSizeBridge(item);

  return (
    <div className="rounded-lg border border-[#31323E]/8 bg-[#F7F7F5] p-3 text-xs">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-bold text-[#31323E]">
            {String(item.title || `Item #${item.id}`)}
          </p>
          <p className="mt-1 text-[#31323E]/50">
            {String(item.prodigi_sku ?? "")} /{" "}
            {String(item.prodigi_category_id ?? "")} /{" "}
            {String(item.prodigi_slot_size_label ?? "")}
          </p>
          {sizeBridge && (
            <p
              className={`mt-1 text-[11px] font-semibold ${sizeBridge.matchesSlot ? "text-emerald-700" : "text-rose-700"}`}
            >
              Customer size {String(item.prodigi_slot_size_label ?? "")} cm /
              Prodigi SKU {sizeBridge.skuSizeIn} in = {sizeBridge.skuSizeCm} cm
            </p>
          )}
          <p className="text-[#31323E]/50">
            {String(item.prodigi_shipping_method || "Standard")} shipping /
            customer paid {formatUsd(customerLine)}
          </p>
        </div>
        <CostBreakdown
          customerProduct={customerProduct}
          customerDelivery={customerDelivery}
          customerLine={customerLine}
          supplierProduct={supplierProduct}
          supplierDelivery={supplierDelivery}
          supplierLine={supplierLine}
          productMargin={productMargin}
          deliveryMargin={deliveryMargin}
          totalMargin={totalMargin}
        />
      </div>
      {compactJson(item.prodigi_attributes) && (
        <details className="mt-2 rounded-md bg-white p-2 text-[10px] text-[#31323E]/60">
          <summary className="cursor-pointer font-bold uppercase tracking-[0.12em] text-[#31323E]/45">
            Prodigi attributes
          </summary>
          <pre className="mt-2 max-h-28 overflow-auto leading-relaxed">
            {compactJson(item.prodigi_attributes)}
          </pre>
        </details>
      )}
    </div>
  );
}

function CostBreakdown({
  customerProduct,
  customerDelivery,
  customerLine,
  supplierProduct,
  supplierDelivery,
  supplierLine,
  productMargin,
  deliveryMargin,
  totalMargin,
}: Record<string, number>) {
  return (
    <div className="min-w-[320px] rounded-md border border-[#31323E]/10 bg-white p-3 text-[#31323E]">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-1 text-right">
        <span className="text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#31323E]/40">
          Line
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#31323E]/40">
          Customer
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#31323E]/40">
          Prodigi
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#31323E]/40">
          Margin
        </span>
        <CostRow
          label="Product"
          customer={formatUsd(customerProduct)}
          supplier={formatEuro(supplierProduct)}
          margin={productMargin}
        />
        <CostRow
          label="Delivery"
          customer={formatUsd(customerDelivery)}
          supplier={formatEuro(supplierDelivery)}
          margin={deliveryMargin}
        />
        <CostRow
          label="Total"
          customer={formatUsd(customerLine)}
          supplier={formatEuro(supplierLine)}
          margin={totalMargin}
          total
        />
      </div>
      <p className="mt-2 text-[10px] font-medium leading-relaxed text-[#31323E]/45">
        Prodigi costs are supplier charges in EUR. Margin is an estimate before
        FX conversion and payment fees.
      </p>
    </div>
  );
}

function CostRow({
  label,
  customer,
  supplier,
  margin,
  total,
}: {
  label: string;
  customer: string;
  supplier: string;
  margin: number;
  total?: boolean;
}) {
  const borderClass = total ? "border-t border-[#31323E]/10 pt-2 " : "";
  return (
    <>
      <span
        className={`${borderClass}text-left ${total ? "font-bold" : "font-semibold text-[#31323E]/60"}`}
      >
        {label}
      </span>
      <span className={`${borderClass}font-bold`}>{customer}</span>
      <span className={`${borderClass}font-bold`}>{supplier}</span>
      <span
        className={`${borderClass}font-bold ${margin >= 0 ? "text-emerald-700" : "text-rose-700"}`}
      >
        {formatUsd(margin)}
      </span>
    </>
  );
}
