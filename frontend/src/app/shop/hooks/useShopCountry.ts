"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { detectDeliveryCountry, storeDeliveryCountry } from "@/lib/deliveryCountry";

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

export function useShopCountry() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const urlCountry = (searchParams.get("country") || "").toUpperCase();
  const [userCountryCode, setUserCountryCode] = useState("");
  const activeCountryCode = COUNTRY_CODE_PATTERN.test(urlCountry) ? urlCountry : userCountryCode;

  useEffect(() => {
    detectDeliveryCountry()
      .then(setUserCountryCode)
      .catch(() => setUserCountryCode("US"));
  }, []);

  useEffect(() => {
    if (COUNTRY_CODE_PATTERN.test(urlCountry) || !COUNTRY_CODE_PATTERN.test(userCountryCode)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("country", userCountryCode);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, urlCountry, userCountryCode]);

  useEffect(() => {
    if (COUNTRY_CODE_PATTERN.test(urlCountry)) {
      storeDeliveryCountry(urlCountry);
    }
  }, [urlCountry]);

  return { activeCountryCode, searchParams };
}
