"use client";
import { Suspense } from "react";
import { ShopPageContent } from "./components/ShopPageContent";

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <ShopPageContent />
    </Suspense>
  );
}
