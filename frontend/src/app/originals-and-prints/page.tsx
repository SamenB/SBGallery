"use client";

import { Suspense } from "react";
import { ShopPageContent } from "../shop/components/ShopPageContent";

export default function OriginalsAndPrintsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <ShopPageContent />
    </Suspense>
  );
}
