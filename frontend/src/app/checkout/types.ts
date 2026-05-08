import type { CartItem } from "@/context/CartContext";

export type CheckoutStep = 1 | 2;

export type CheckoutFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  countryCode: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  deliveryPhone: string;
  deliveryNotes: string;
  newsletter: "yes" | "no";
  discovery: string;
  promoCode: string;
};

export type CheckoutFieldName = keyof CheckoutFormData;

export type PrintQuoteState = {
  status: "loading" | "ready" | "unavailable" | "error";
  message?: string;
  item?: Partial<CartItem>;
};

export type PlaceSuggestion = {
  placePrediction: {
    placeId: string;
    text?: { text?: string };
    toPlace: () => {
      fetchFields: (args: { fields: string[] }) => Promise<void>;
      addressComponents?: {
        types?: string[];
        longText?: string;
        long_name?: string;
        shortText?: string;
        short_name?: string;
      }[];
      formattedAddress?: string;
    };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
};

export type PromoMessage = {
  text: string;
  isError: boolean;
};

export type CheckoutTotals = {
  printTotal: number;
  shippingTotal: number;
  discountAmount: number;
  checkoutCartTotal: number;
  currentTotal: number;
};

export const DEFAULT_CHECKOUT_FORM: CheckoutFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  countryCode: "",
  state: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  deliveryPhone: "",
  deliveryNotes: "",
  newsletter: "yes",
  discovery: "",
  promoCode: "",
};
