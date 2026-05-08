"use client";

import { countryCodeToFlag } from "@/countries";
import { inputBase, sectionTitle } from "../styles";
import type { CheckoutFormData, PromoMessage } from "../types";
import { PaymentBadges } from "./PaymentBadges";

type CheckoutReviewStepProps = {
  formData: CheckoutFormData;
  selectedCountryName?: string;
  promoMessage: PromoMessage;
  submitError: string;
  isSubmitting: boolean;
  currentTotal: number;
  convertPrice: (usdPrice: number) => string;
  onBack: () => void;
  onInput: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onApplyPromo: () => void;
  onSubmit: () => void;
};

export function CheckoutReviewStep({ formData, selectedCountryName, promoMessage, submitError, isSubmitting, currentTotal, convertPrice, onBack, onInput, onApplyPromo, onSubmit }: CheckoutReviewStepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", animation: "fadeIn 0.3s ease" }}>
      <ShippingReview formData={formData} selectedCountryName={selectedCountryName} onBack={onBack} />
      <PromoCode value={formData.promoCode} promoMessage={promoMessage} onInput={onInput} onApplyPromo={onApplyPromo} />
      {submitError && <div style={{ background: "rgba(229,62,62,0.06)", border: "1px solid rgba(229,62,62,0.2)", borderRadius: "8px", padding: "1rem 1.5rem", color: "#C53030", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>{submitError}</div>}
      <button type="button" onClick={onSubmit} disabled={isSubmitting} className="premium-cta-btn" style={{ width: "100%", padding: "1.1rem", fontSize: "1.05rem" }}>
        {isSubmitting ? (
          "Processing..."
        ) : (
          <>
            Pay <span className="font-price">{convertPrice(currentTotal)}</span>
          </>
        )}
      </button>
      <PaymentBadges />
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "#999", textAlign: "center", lineHeight: 1.5 }}>You will be redirected to a secure Monobank payment page. Your financial information is never stored on our servers.</p>
    </div>
  );
}

function ShippingReview({ formData, selectedCountryName, onBack }: { formData: CheckoutFormData; selectedCountryName?: string; onBack: () => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={sectionTitle}>Shipping To</h2>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "#ec4899", fontFamily: "var(--font-sans)", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", padding: "0.25rem" }}>
          Change
        </button>
      </div>
      <div style={{ background: "#FAFAF8", border: "1px solid rgba(17,17,17,0.08)", borderRadius: "12px", padding: "1.5rem", fontFamily: "var(--font-sans)", fontSize: "0.9rem", lineHeight: 1.7, color: "#444" }}>
        <p style={{ fontWeight: 600, color: "#111", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {formData.firstName} {formData.lastName}
          {formData.countryCode && <span style={{ fontSize: "1.1rem" }}>{countryCodeToFlag(formData.countryCode)}</span>}
        </p>
        <p>{formData.addressLine1}</p>
        <p>
          {formData.city} {formData.state ? `, ${formData.state}` : ""} {formData.postalCode}
        </p>
        <p>{selectedCountryName || formData.countryCode}</p>
        <p style={{ color: "#888", marginTop: "0.5rem" }}>
          {formData.email} · {formData.phone}
        </p>
        {formData.deliveryNotes && <p style={{ marginTop: "0.5rem", fontStyle: "italic", color: "#888" }}>{formData.deliveryNotes}</p>}
      </div>
    </div>
  );
}

function PromoCode({ value, promoMessage, onInput, onApplyPromo }: { value: string; promoMessage: PromoMessage; onInput: CheckoutReviewStepProps["onInput"]; onApplyPromo: () => void }) {
  return (
    <div>
      <h2 style={sectionTitle}>Promo Code</h2>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input type="text" name="promoCode" placeholder="Enter code" value={value} onChange={onInput} style={{ ...inputBase, flex: 1 }} />
        <button type="button" onClick={onApplyPromo} className="premium-cta-btn" style={{ padding: "0.85rem 1.5rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
          Apply
        </button>
      </div>
      {promoMessage.text && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", marginTop: "0.5rem", color: promoMessage.isError ? "#E53E3E" : "#38A169", fontWeight: 500 }}>{promoMessage.text}</p>}
    </div>
  );
}
