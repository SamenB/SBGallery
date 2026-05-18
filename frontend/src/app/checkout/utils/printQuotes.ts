import type { CartItem } from "@/context/CartContext";
import {
  loadArtworkStorefront,
  resolveRoundedCustomerPriceParts,
  resolveStorefrontCustomerTotal,
  resolveStorefrontProductPrice,
  resolveStorefrontShippingPrice,
  type StorefrontCard,
  type StorefrontSizeOption,
} from "@/lib/artworkStorefront";
import type { PrintQuoteState } from "../types";

type ArtworkStorefront = Awaited<ReturnType<typeof loadArtworkStorefront>>;
type MatchingPrintSelection = {
  card: StorefrontCard;
  size: StorefrontSizeOption;
};

function findMatchingPrintSelection(item: CartItem, storefront: ArtworkStorefront): MatchingPrintSelection | null {
  const cards = [...(storefront.mediums.paper?.cards || []), ...(storefront.mediums.canvas?.cards || [])];
  const card = cards.find((candidate) => candidate.category_id === item.prodigi_category_id);
  if (!card) return null;

  const size =
    card.size_options.find((size) => {
      const slotMatch = Boolean(item.prodigi_slot_size_label) && (size.slot_size_label === item.prodigi_slot_size_label || size.size_label === item.prodigi_slot_size_label);
      const displayMatch = Boolean(item.size) && size.size_label === item.size;
      return slotMatch || displayMatch;
    }) || null;

  return size ? { card, size } : null;
}

function resolveAllowedAttributes(card: StorefrontCard, size: StorefrontSizeOption): Record<string, string[]> {
  if (size.allowed_attribute_options && Object.keys(size.allowed_attribute_options).length > 0) {
    return size.allowed_attribute_options;
  }
  return card.allowed_attribute_options || {};
}

function validatePrintAttributes(item: CartItem, card: StorefrontCard, size: StorefrontSizeOption): boolean {
  const allowed = resolveAllowedAttributes(card, size);
  for (const [key, value] of Object.entries(item.prodigi_attributes || {})) {
    if (value === null || value === undefined || value === "" || !(key in allowed)) {
      continue;
    }
    if (!allowed[key].map(String).includes(String(value))) {
      return false;
    }
  }
  return true;
}

export async function resolvePrintQuoteForCountry(item: CartItem, countryCode: string): Promise<[string, PrintQuoteState]> {
  if (!item.prodigi_category_id || !item.prodigi_slot_size_label) {
    return [item.id, { status: "unavailable", message: "This print is missing its storefront selection. Please remove it and add it again from the product page." }];
  }

  try {
    const storefront = await loadArtworkStorefront(item.slug, countryCode);
    if (!storefront.country_supported) {
      return [item.id, { status: "unavailable", message: `Sorry, this print is not available for delivery to ${countryCode}.` }];
    }

    const selection = findMatchingPrintSelection(item, storefront);
    const size = selection?.size || null;
    const productPrice = size ? resolveStorefrontProductPrice(size) : null;
    const shippingPrice = size ? resolveStorefrontShippingPrice(size) : null;
    const totalPrice = size ? resolveStorefrontCustomerTotal(size) : null;
    const roundedPriceParts = size ? resolveRoundedCustomerPriceParts(size) : null;

    if (!size || productPrice === null || shippingPrice === null || totalPrice === null || roundedPriceParts === null) {
      return [item.id, { status: "unavailable", message: "This selected print format is not available for the new delivery country." }];
    }

    if (!selection || !validatePrintAttributes(item, selection.card, selection.size)) {
      return [item.id, { status: "unavailable", message: "This selected print color is not available for the new delivery country." }];
    }

    return [
      item.id,
      {
        status: "ready",
        item: {
          price: roundedPriceParts.total,
          customer_product_price: roundedPriceParts.product,
          customer_shipping_price: roundedPriceParts.shipping,
          customer_line_total: roundedPriceParts.total,
          customer_currency: "USD",
          prodigi_storefront_offer_size_id: size.id || undefined,
          prodigi_sku: size.sku || undefined,
          prodigi_shipping_method: size.shipping_support?.chosen_shipping_method || size.shipping_support?.chosen_tier || size.shipping_method || size.default_shipping_tier || item.prodigi_shipping_method,
          prodigi_wholesale_eur: size.supplier_product_price || undefined,
          prodigi_shipping_eur: size.supplier_shipping_price || undefined,
          prodigi_supplier_total_eur: size.supplier_total_cost || undefined,
          prodigi_retail_eur: productPrice,
          prodigi_supplier_currency: size.currency || "EUR",
          prodigi_destination_country_code: countryCode,
        },
      },
    ];
  } catch (error) {
    return [item.id, { status: "error", message: error instanceof Error ? error.message : "Unable to recalculate print pricing for this delivery country." }];
  }
}
