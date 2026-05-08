"use client";

import { useEffect, useState } from "react";

export function useShopViewport() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsPhone(window.innerWidth < 768);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return { isMobile, isPhone };
}
