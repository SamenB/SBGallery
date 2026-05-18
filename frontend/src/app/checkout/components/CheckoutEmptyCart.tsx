"use client";

import Link from "next/link";
import { PUBLIC_ROUTES } from "@/lib/publicRoutes";

export function CheckoutEmptyCart() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "1rem", fontStyle: "italic" }}>Your cart is empty</h2>
        <Link href={PUBLIC_ROUTES.originalsAndPrints} style={{ color: "#ec4899", textDecoration: "underline", fontFamily: "var(--font-sans)" }}>
          Back to Originals &amp; Prints
        </Link>
      </div>
    </div>
  );
}
