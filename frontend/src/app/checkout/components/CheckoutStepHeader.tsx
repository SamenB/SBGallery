"use client";

import type { CheckoutStep } from "../types";
import { StepIndicator } from "./StepIndicator";

export function CheckoutStepHeader({ step, onStepChange }: { step: CheckoutStep; onStepChange: (step: CheckoutStep) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "3rem", marginTop: "1rem" }}>
      <StepIndicator num={1} label="Information" active={step === 1} done={step > 1} onClick={() => onStepChange(1)} />
      <div style={{ width: "60px", height: "2px", backgroundColor: step > 1 ? "#ec4899" : "rgba(17,17,17,0.1)", borderRadius: "1px", transition: "background-color 0.3s" }} />
      <StepIndicator num={2} label="Review & Pay" active={step === 2} done={false} />
    </div>
  );
}
