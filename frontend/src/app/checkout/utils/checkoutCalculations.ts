import type { CartItem } from "@/context/CartContext";
import type { CheckoutTotals } from "../types";

function resolveLineProductPrice(item: CartItem) {
  return Number(item.type === "print" ? (item.customer_product_price ?? item.prodigi_retail_eur ?? item.price) : item.price);
}

export function calculateCheckoutTotals(items: CartItem[], promoApplied: boolean): CheckoutTotals {
  const printTotal = items.filter((item) => item.type === "print").reduce((sum, item) => sum + Number(item.customer_product_price ?? item.prodigi_retail_eur ?? item.price) * item.quantity, 0);
  const shippingTotal = items.filter((item) => item.type === "print").reduce((sum, item) => sum + Number(item.customer_shipping_price || 0) * item.quantity, 0);
  const discountAmount = promoApplied ? Math.round(printTotal * 0.1) : 0;
  const checkoutCartTotal = items.reduce((sum, item) => sum + resolveLineProductPrice(item) * item.quantity, 0);

  return {
    printTotal,
    shippingTotal,
    discountAmount,
    checkoutCartTotal,
    currentTotal: checkoutCartTotal - discountAmount + shippingTotal,
  };
}
