"use client";

import { useCart } from "@/context/CartContext";
import { usePreferences } from "@/context/PreferencesContext";
import { useUser } from "@/context/UserContext";
import { useCheckoutFlow } from "../hooks/useCheckoutFlow";
import { CheckoutEmptyCart } from "./CheckoutEmptyCart";
import { CheckoutInformationStep } from "./CheckoutInformationStep";
import { CheckoutResponsiveStyles } from "./CheckoutResponsiveStyles";
import { CheckoutReviewStep } from "./CheckoutReviewStep";
import { CheckoutStepHeader } from "./CheckoutStepHeader";
import { OrderSummary } from "./OrderSummary";

export function CheckoutPageContent() {
  const { items, clearCart } = useCart();
  const { convertPrice } = usePreferences();
  const { user, refreshUser } = useUser();
  const checkout = useCheckoutFlow({ items, clearCart, user, refreshUser });

  if (items.length === 0) {
    return <CheckoutEmptyCart />;
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem 4rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <CheckoutStepHeader step={checkout.step} onStepChange={checkout.setStep} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }}>
          <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: "4rem" }}>
            <div>
              {checkout.step === 1 && (
                <CheckoutInformationStep
                  userEmail={user?.email}
                  formRef={checkout.formRef}
                  formData={checkout.formData}
                  errors={checkout.errors}
                  touched={checkout.touched}
                  hasPrintItems={checkout.hasPrintItems}
                  printQuotesLoading={checkout.printQuotesLoading}
                  printQuoteIssue={checkout.printQuoteIssue}
                  stateLabel={checkout.stateLabel}
                  postalLabel={checkout.postalLabel}
                  setFormData={checkout.setFormData}
                  setErrors={checkout.setErrors}
                  setTouched={checkout.setTouched}
                  setSubmitError={checkout.setSubmitError}
                  validateField={checkout.validateField}
                  handleInput={checkout.handleInput}
                  handleBlur={checkout.handleBlur}
                  handlePlaceSelect={checkout.handlePlaceSelect}
                  handleGoogleSuccess={checkout.handleGoogleSuccess}
                  goToStep2={checkout.goToStep2}
                />
              )}
              {checkout.step === 2 && (
                <CheckoutReviewStep
                  formData={checkout.formData}
                  selectedCountryName={checkout.selectedCountry?.name}
                  promoMessage={checkout.promoMessage}
                  submitError={checkout.submitError}
                  isSubmitting={checkout.isSubmitting}
                  currentTotal={checkout.totals.currentTotal}
                  convertPrice={convertPrice}
                  onBack={() => checkout.setStep(1)}
                  onInput={checkout.handleInput}
                  onApplyPromo={checkout.applyPromo}
                  onSubmit={checkout.handleSubmit}
                />
              )}
            </div>
            <OrderSummary
              items={checkout.checkoutItems}
              promoApplied={checkout.promoApplied}
              discountAmount={checkout.totals.discountAmount}
              cartTotal={checkout.totals.checkoutCartTotal}
              shippingTotal={checkout.totals.shippingTotal}
              currentTotal={checkout.totals.currentTotal}
              convertPrice={convertPrice}
            />
          </div>
        </div>
      </div>
      <CheckoutResponsiveStyles />
    </div>
  );
}
