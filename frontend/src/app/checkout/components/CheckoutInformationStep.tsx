"use client";

import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { inputBase, labelStyle, sectionTitle } from "../styles";
import type { CheckoutFieldName, CheckoutFormData } from "../types";
import { AddressInput } from "./AddressInput";
import { CountrySelect } from "./CountrySelect";
import { PhoneInput } from "./PhoneInput";
import { SmartInput } from "./SmartInput";

type CheckoutInformationStepProps = {
  userEmail?: string | null;
  formRef: RefObject<HTMLDivElement | null>;
  formData: CheckoutFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  hasPrintItems: boolean;
  printQuotesLoading: boolean;
  printQuoteIssue: string;
  stateLabel: string;
  postalLabel: string;
  setFormData: Dispatch<SetStateAction<CheckoutFormData>>;
  setErrors: Dispatch<SetStateAction<Record<string, string>>>;
  setTouched: Dispatch<SetStateAction<Record<string, boolean>>>;
  setSubmitError: (value: string) => void;
  validateField: (name: CheckoutFieldName, data: CheckoutFormData) => string;
  handleInput: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handlePlaceSelect: (place: { address: string; city: string; state: string; postalCode: string; countryCode: string }) => void;
  handleGoogleSuccess: (credentialResponse: CredentialResponse) => void;
  goToStep2: () => void;
};

export function CheckoutInformationStep({
  userEmail,
  formRef,
  formData,
  errors,
  touched,
  hasPrintItems,
  printQuotesLoading,
  printQuoteIssue,
  stateLabel,
  postalLabel,
  setFormData,
  setErrors,
  setTouched,
  setSubmitError,
  validateField,
  handleInput,
  handleBlur,
  handlePlaceSelect,
  handleGoogleSuccess,
  goToStep2,
}: CheckoutInformationStepProps) {
  return (
    <div ref={formRef} style={{ display: "flex", flexDirection: "column", gap: "2.5rem", animation: "fadeIn 0.3s ease" }}>
      {!userEmail ? (
        <div style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.04), rgba(251,146,60,0.04))", padding: "1.5rem 2rem", borderRadius: "12px", border: "1px solid rgba(236,72,153,0.12)", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", color: "#666" }}>Quick Checkout</h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log("Login Failed")} theme="outline" size="large" text="signin_with" />
          </div>
          <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#999" }}>Sign in to auto-fill your details</p>
        </div>
      ) : (
        <div style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.04), rgba(251,146,60,0.04))", padding: "1rem 1.5rem", borderRadius: "12px", border: "1px solid rgba(236,72,153,0.12)", fontSize: "0.85rem" }}>
          <p style={{ color: "#555" }}>
            Signed in as <strong>{userEmail}</strong>
          </p>
        </div>
      )}

      <ContactFields formData={formData} errors={errors} touched={touched} effectiveCountryCode={formData.countryCode} setFormData={setFormData} setErrors={setErrors} validateField={validateField} handleInput={handleInput} handleBlur={handleBlur} />
      <ShippingFields
        formData={formData}
        errors={errors}
        touched={touched}
        hasPrintItems={hasPrintItems}
        printQuotesLoading={printQuotesLoading}
        printQuoteIssue={printQuoteIssue}
        stateLabel={stateLabel}
        postalLabel={postalLabel}
        setFormData={setFormData}
        setErrors={setErrors}
        setTouched={setTouched}
        setSubmitError={setSubmitError}
        validateField={validateField}
        handleInput={handleInput}
        handleBlur={handleBlur}
        handlePlaceSelect={handlePlaceSelect}
      />

      <NewsletterSignup formData={formData} handleInput={handleInput} />
      <SmartInput label="How did you discover us?" name="discovery" placeholder="Instagram, Google, friend, gallery..." value={formData.discovery} onChange={handleInput} />
      <button type="button" onClick={goToStep2} className="premium-cta-btn" style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}>
        Continue to Review
      </button>
    </div>
  );
}

function ContactFields({
  formData,
  errors,
  touched,
  effectiveCountryCode,
  setFormData,
  setErrors,
  validateField,
  handleInput,
  handleBlur,
}: Pick<CheckoutInformationStepProps, "formData" | "errors" | "touched" | "setFormData" | "setErrors" | "validateField" | "handleInput" | "handleBlur"> & { effectiveCountryCode: string }) {
  return (
    <div>
      <h2 style={sectionTitle}>Contact Information</h2>
      <div className="checkout-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <SmartInput label="First Name" name="firstName" required placeholder="John" value={formData.firstName} onChange={handleInput} onBlur={handleBlur} error={touched.firstName ? errors.firstName : undefined} valid={formData.firstName.trim().length >= 1 && !errors.firstName} data-error={!!(touched.firstName && errors.firstName)} />
        <SmartInput label="Last Name" name="lastName" required placeholder="Doe" value={formData.lastName} onChange={handleInput} onBlur={handleBlur} error={touched.lastName ? errors.lastName : undefined} valid={formData.lastName.trim().length >= 1 && !errors.lastName} data-error={!!(touched.lastName && errors.lastName)} />
        <SmartInput label="Email" name="email" type="email" required placeholder="john@example.com" value={formData.email} onChange={handleInput} onBlur={handleBlur} error={touched.email ? errors.email : undefined} valid={/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim()) && !errors.email} data-error={!!(touched.email && errors.email)} />
        <PhoneInput
          label="Phone"
          required
          value={formData.phone}
          onChange={(val) => {
            setFormData((prev) => {
              const next = { ...prev, phone: val };
              setErrors((current) => ({ ...current, phone: touched.phone ? validateField("phone", next) : current.phone ? "" : current.phone }));
              return next;
            });
          }}
          countryCode={effectiveCountryCode}
          onChangeCountry={(code) => setFormData((prev) => ({ ...prev, countryCode: code }))}
          error={touched.phone ? errors.phone : undefined}
          placeholder="Phone number"
        />
      </div>
    </div>
  );
}

function ShippingFields(props: Pick<CheckoutInformationStepProps, "formData" | "errors" | "touched" | "hasPrintItems" | "printQuotesLoading" | "printQuoteIssue" | "stateLabel" | "postalLabel" | "setFormData" | "setErrors" | "setTouched" | "setSubmitError" | "validateField" | "handleInput" | "handleBlur" | "handlePlaceSelect">) {
  const { formData, errors, touched, hasPrintItems, printQuotesLoading, printQuoteIssue, stateLabel, postalLabel, setFormData, setErrors, setTouched, setSubmitError, handleInput, handleBlur, handlePlaceSelect } = props;
  return (
    <div>
      <h2 style={sectionTitle}>Shipping Address</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <CountrySelect
          value={formData.countryCode}
          onChange={(code) => {
            setFormData((prev) => ({ ...prev, countryCode: code }));
            setTouched((prev) => ({ ...prev, countryCode: true }));
            setErrors((prev) => ({ ...prev, countryCode: "" }));
            setSubmitError("");
          }}
          error={touched.countryCode ? errors.countryCode : undefined}
        />
        {hasPrintItems && (printQuotesLoading || printQuoteIssue) && <p style={{ margin: "-0.45rem 0 0", fontFamily: "var(--font-sans)", fontSize: "0.76rem", lineHeight: 1.5, color: printQuoteIssue ? "#C53030" : "#777" }}>{printQuotesLoading ? "Recalculating print price and delivery for this country..." : printQuoteIssue}</p>}
        <AddressInput
          label="Address Line 1"
          value={formData.addressLine1}
          onChange={handleInput}
          onPlaceSelect={(place) => {
            handlePlaceSelect(place);
            setTouched((prev) => ({ ...prev, addressLine1: true, city: true, postalCode: true, countryCode: true }));
          }}
          countryCode={formData.countryCode}
          required
          placeholder="Start typing your address..."
          error={touched.addressLine1 ? errors.addressLine1 : undefined}
          valid={formData.addressLine1.length > 5 && !errors.addressLine1}
        />
        <div className="checkout-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <SmartInput label="City" name="city" required placeholder="City / Town" value={formData.city} onChange={handleInput} onBlur={handleBlur} error={touched.city ? errors.city : undefined} valid={formData.city.length > 1 && !errors.city} data-error={!!(touched.city && errors.city)} />
          <SmartInput label={stateLabel} name="state" placeholder={stateLabel} value={formData.state} onChange={handleInput} valid={formData.state.length > 1} />
        </div>
        <div className="checkout-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <SmartInput label={postalLabel} name="postalCode" required placeholder={postalLabel} value={formData.postalCode} onChange={handleInput} onBlur={handleBlur} error={touched.postalCode ? errors.postalCode : undefined} valid={formData.postalCode.length > 2 && !errors.postalCode} data-error={!!(touched.postalCode && errors.postalCode)} />
          <SmartInput label="Delivery Phone" name="deliveryPhone" type="tel" placeholder="If different from contact" value={formData.deliveryPhone} onChange={handleInput} valid={formData.deliveryPhone.length > 5} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Delivery Notes</label>
          <textarea name="deliveryNotes" placeholder="Gate code, building entrance, special instructions... (optional)" value={formData.deliveryNotes} onChange={handleInput} rows={3} style={{ ...inputBase, resize: "vertical", minHeight: "80px" }} />
        </div>
      </div>
    </div>
  );
}

function NewsletterSignup({ formData, handleInput }: Pick<CheckoutInformationStepProps, "formData" | "handleInput">) {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.04), rgba(251,146,60,0.04))", padding: "1.5rem 2rem", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
      <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", fontStyle: "italic", color: "var(--color-charcoal)" }}>Sign up for the email newsletter?</span>
      <div style={{ display: "flex", gap: "2rem" }}>
        {(["yes", "no"] as const).map((value) => (
          <label key={value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.9rem" }}>
            <input type="radio" name="newsletter" value={value} checked={formData.newsletter === value} onChange={handleInput} />
            {value === "yes" ? "Yes" : "No"}
          </label>
        ))}
      </div>
    </div>
  );
}
