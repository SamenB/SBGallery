import type { CartItem } from "@/context/CartContext";
import { countries } from "@/countries";
import type { CheckoutFormData } from "../types";

export function buildOrderRequest({ formData, items, promoApplied }: { formData: CheckoutFormData; items: CartItem[]; promoApplied: boolean }) {
  const checkoutCountryCode = formData.countryCode;
  const checkoutCountry = countries.find((country) => country.code === checkoutCountryCode);

  return {
    first_name: formData.firstName.trim(),
    last_name: formData.lastName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    shipping_country: checkoutCountry?.name || checkoutCountryCode,
    shipping_country_code: checkoutCountryCode,
    shipping_state: formData.state.trim() || null,
    shipping_city: formData.city.trim(),
    shipping_address_line1: formData.addressLine1.trim(),
    shipping_address_line2: null,
    shipping_postal_code: formData.postalCode.trim(),
    shipping_phone: formData.deliveryPhone.trim() || null,
    shipping_notes: formData.deliveryNotes.trim() || null,
    newsletter_opt_in: formData.newsletter === "yes",
    discovery_source: formData.discovery || null,
    promo_code: promoApplied ? formData.promoCode : null,
    items: items.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        artwork_id: parseInt(item.slug) || 1,
        edition_type: item.edition_type || (item.type === "original" ? "original" : item.finish?.toLowerCase().includes("canvas") ? "canvas_print" : "paper_print"),
        finish: item.finish || "Original",
        size: item.size,
        price: Math.round(item.price),
        prodigi_sku: item.prodigi_sku,
        prodigi_storefront_offer_size_id: item.prodigi_storefront_offer_size_id,
        prodigi_category_id: item.prodigi_category_id,
        prodigi_slot_size_label: item.prodigi_slot_size_label,
        prodigi_attributes: item.prodigi_attributes,
        prodigi_shipping_method: item.prodigi_shipping_method,
        prodigi_destination_country_code: item.prodigi_destination_country_code,
      })),
    ),
  };
}
