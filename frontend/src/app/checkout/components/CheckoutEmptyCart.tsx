"use client";

import Link from "next/link";

export function CheckoutEmptyCart() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "1rem", fontStyle: "italic" }}>Your cart is empty</h2>
        <Link href="/shop" style={{ color: "#ec4899", textDecoration: "underline", fontFamily: "var(--font-sans)" }}>
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
