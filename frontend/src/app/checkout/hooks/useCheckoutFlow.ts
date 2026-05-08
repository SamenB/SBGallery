"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CredentialResponse } from "@react-oauth/google";
import { countries, getPostalLabel, getStateLabel } from "@/countries";
import type { CartItem } from "@/context/CartContext";
import { detectDeliveryCountry, storeDeliveryCountry } from "@/lib/deliveryCountry";
import { apiFetch, apiJson, getApiUrl } from "@/utils";
import { calculateCheckoutTotals } from "../utils/checkoutCalculations";
import { buildOrderRequest } from "../utils/checkoutPayload";
import { resolvePrintQuoteForCountry } from "../utils/printQuotes";
import { DEFAULT_CHECKOUT_FORM, type CheckoutFieldName, type CheckoutFormData, type CheckoutStep, type PrintQuoteState, type PromoMessage } from "../types";

const REQUIRED_FIELDS: CheckoutFieldName[] = ["firstName", "lastName", "email", "phone", "countryCode", "city", "addressLine1", "postalCode"];

function validateCheckoutField(name: CheckoutFieldName, data: CheckoutFormData, postalLabel: string): string {
  const value = data[name];
  switch (name) {
    case "firstName":
      return value.trim() ? "" : "First name is required";
    case "lastName":
      return value.trim() ? "" : "Last name is required";
    case "email":
      if (!value.trim()) return "Email is required";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? "" : "Enter a valid email address";
    case "phone":
      if (!value.trim()) return "Phone number is required";
      return value.replace(/\D/g, "").length >= 7 ? "" : "Enter a valid phone number (min 7 digits)";
    case "countryCode":
      return value ? "" : "Please select a country";
    case "city":
      return value.trim() ? "" : "City is required";
    case "addressLine1":
      return value.trim() ? "" : "Street address is required";
    case "postalCode":
      if (!value.trim()) return `${postalLabel} is required`;
      return value.trim().length >= 3 ? "" : `${postalLabel} is too short`;
    default:
      return "";
  }
}

export function useCheckoutFlow({ items, clearCart, user, refreshUser }: { items: CartItem[]; clearCart: () => void; user: { username?: string | null; email?: string | null } | null; refreshUser: () => Promise<void> }) {
  const [step, setStep] = useState<CheckoutStep>(1);
  const [formData, setFormData] = useState<CheckoutFormData>(DEFAULT_CHECKOUT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState<PromoMessage>({ text: "", isError: false });
  const [printQuotes, setPrintQuotes] = useState<Record<string, PrintQuoteState>>({});
  const formRef = useRef<HTMLDivElement>(null);

  const hasPrintItems = items.some((item) => item.type === "print");
  const initialPrintCountryCode = useMemo(() => {
    const country = items.find((item) => item.type === "print" && item.prodigi_destination_country_code)?.prodigi_destination_country_code;
    return country?.toUpperCase() || "";
  }, [items]);

  const checkoutItems = useMemo(
    () =>
      items.map((item) => {
        const quote = printQuotes[item.id];
        return item.type === "print" && quote?.status === "ready" && quote.item ? { ...item, ...quote.item } : item;
      }),
    [items, printQuotes],
  );

  const printQuoteIssue = useMemo(() => Object.values(printQuotes).find((entry) => entry.status === "unavailable" || entry.status === "error")?.message || "", [printQuotes]);
  const printQuotesLoading = Object.values(printQuotes).some((entry) => entry.status === "loading");
  const hasUnresolvedPrintQuotes =
    hasPrintItems &&
    checkoutItems.some((item) => item.type === "print" && item.prodigi_destination_country_code?.toUpperCase() !== formData.countryCode.toUpperCase());
  const selectedCountry = useMemo(() => countries.find((country) => country.code === formData.countryCode), [formData.countryCode]);
  const stateLabel = getStateLabel(formData.countryCode);
  const postalLabel = getPostalLabel(formData.countryCode);
  const totals = useMemo(() => calculateCheckoutTotals(checkoutItems, promoApplied), [checkoutItems, promoApplied]);

  useEffect(() => {
    let cancelled = false;
    detectDeliveryCountry()
      .then((code) => {
        if (!cancelled) setFormData((prev) => ({ ...prev, countryCode: prev.countryCode || initialPrintCountryCode || code }));
      })
      .catch(() => {
        if (!cancelled) setFormData((prev) => ({ ...prev, countryCode: prev.countryCode || initialPrintCountryCode || "US" }));
      });
    return () => {
      cancelled = true;
    };
  }, [initialPrintCountryCode]);

  useEffect(() => {
    if (formData.countryCode) storeDeliveryCountry(formData.countryCode);
  }, [formData.countryCode]);

  useEffect(() => {
    if (!formData.countryCode || !hasPrintItems) {
      setPrintQuotes({});
      return;
    }

    let cancelled = false;
    const printItems = items.filter((item) => item.type === "print");
    setPrintQuotes((prev) => {
      const next = { ...prev };
      for (const item of printItems) next[item.id] = { status: "loading" };
      return next;
    });

    void Promise.all(printItems.map((item) => resolvePrintQuoteForCountry(item, formData.countryCode))).then((results) => {
      if (!cancelled) setPrintQuotes(Object.fromEntries(results));
    });

    return () => {
      cancelled = true;
    };
  }, [formData.countryCode, hasPrintItems, items]);

  useEffect(() => {
    if (!user) return;
    const [first, ...rest] = (user.username || "").split(" ");
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || first || "",
      lastName: prev.lastName || rest.join(" ") || "",
      email: prev.email || user.email || "",
    }));
  }, [user, user?.username, user?.email]);

  const validateField = useCallback((name: CheckoutFieldName, data: CheckoutFormData) => validateCheckoutField(name, data, postalLabel), [postalLabel]);

  const handleGoogleSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      try {
        const response = await fetch(`${getApiUrl()}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credentialResponse.credential }),
          credentials: "include",
        });
        if (response.ok) await refreshUser();
      } catch (err) {
        console.error("Google Auth failed:", err);
      }
    },
    [refreshUser],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const name = event.target.name as CheckoutFieldName;
      setTouched((prev) => ({ ...prev, [name]: true }));
      setFormData((current) => {
        setErrors((prev) => ({ ...prev, [name]: validateField(name, current) }));
        return current;
      });
    },
    [validateField],
  );

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const name = event.target.name as CheckoutFieldName;
      const { value } = event.target;
      setFormData((prev) => {
        const next = { ...prev, [name]: value };
        if (touched[name]) setErrors((current) => ({ ...current, [name]: validateField(name, next) }));
        else if (errors[name]) setErrors((current) => ({ ...current, [name]: "" }));
        return next;
      });
    },
    [errors, touched, validateField],
  );

  const setFieldValue = useCallback((name: CheckoutFieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePlaceSelect = useCallback((place: { address: string; city: string; state: string; postalCode: string; countryCode: string }) => {
    setFormData((prev) => ({
      ...prev,
      addressLine1: place.address || prev.addressLine1,
      city: place.city || prev.city,
      state: place.state || prev.state,
      postalCode: place.postalCode || prev.postalCode,
      countryCode: place.countryCode || prev.countryCode,
    }));
    setErrors((prev) => ({ ...prev, addressLine1: "", city: "", postalCode: "", countryCode: "" }));
  }, []);

  const validateStep1 = useCallback(() => {
    const nextTouched = Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, true]));
    const nextErrors: Record<string, string> = {};
    for (const field of REQUIRED_FIELDS) {
      const error = validateField(field, formData);
      if (error) nextErrors[field] = error;
    }
    if (printQuotesLoading || hasUnresolvedPrintQuotes) nextErrors.countryCode = "Print pricing is still being recalculated for this country.";
    else if (printQuoteIssue) nextErrors.countryCode = printQuoteIssue;
    setTouched((prev) => ({ ...prev, ...nextTouched }));
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData, hasUnresolvedPrintQuotes, printQuoteIssue, printQuotesLoading, validateField]);

  const goToStep2 = useCallback(() => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    requestAnimationFrame(() => {
      const firstError = formRef.current?.querySelector('[data-error="true"]') as HTMLElement | null;
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [validateStep1]);

  const applyPromo = useCallback(() => {
    if (formData.promoCode.toUpperCase() === "ART10") {
      setPromoApplied(true);
      setPromoMessage({ text: "10% discount applied to prints!", isError: false });
    } else {
      setPromoMessage({ text: "Invalid promo code.", isError: true });
    }
  }, [formData.promoCode]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      if (printQuotesLoading || hasUnresolvedPrintQuotes || printQuoteIssue) {
        setSubmitError(printQuoteIssue || "Print pricing is still being recalculated. Please try again in a moment.");
        return;
      }
      const orderRes = await apiFetch(`${getApiUrl()}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildOrderRequest({ formData, items: checkoutItems, promoApplied })),
      });
      const orderData = await apiJson<{ data?: { id?: number; total_price?: number } }>(orderRes);
      const orderId = orderData.data?.id;
      if (!orderId) {
        setSubmitError("Order created but no ID returned. Please contact support.");
        return;
      }
      const paymentRes = await apiFetch(`${getApiUrl()}/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, currency: "UAH" }),
      });
      const paymentData = await apiJson<{ payment_url: string }>(paymentRes);
      clearCart();
      window.location.href = paymentData.payment_url;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Connection error. Please check your internet and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [checkoutItems, clearCart, formData, hasUnresolvedPrintQuotes, printQuoteIssue, printQuotesLoading, promoApplied]);

  return {
    step,
    setStep,
    formData,
    setFormData,
    errors,
    setErrors,
    touched,
    setTouched,
    isSubmitting,
    submitError,
    setSubmitError,
    promoApplied,
    promoMessage,
    formRef,
    hasPrintItems,
    checkoutItems,
    printQuoteIssue,
    printQuotesLoading,
    selectedCountry,
    stateLabel,
    postalLabel,
    totals,
    validateField,
    handleGoogleSuccess,
    handleBlur,
    handleInput,
    setFieldValue,
    handlePlaceSelect,
    goToStep2,
    applyPromo,
    handleSubmit,
  };
}
