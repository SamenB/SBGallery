"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseInfiniteVisibleCountOptions = {
  totalCount: number;
  pageSize: number;
  resetKey?: string | number;
  preloadDistance?: number;
  enabled?: boolean;
};

export function useInfiniteVisibleCount<T extends Element = HTMLDivElement>({
  totalCount,
  pageSize,
  resetKey = "default",
  preloadDistance = 900,
  enabled = true,
}: UseInfiniteVisibleCountOptions) {
  const normalizedPageSize = Math.max(1, pageSize);
  const [visibleCount, setVisibleCount] = useState(normalizedPageSize);
  const [sentinelNode, setSentinelNode] = useState<T | null>(null);
  const totalRef = useRef(totalCount);
  const pageSizeRef = useRef(normalizedPageSize);
  const visibleCountRef = useRef(visibleCount);
  const enabledRef = useRef(enabled);
  const preloadDistanceRef = useRef(preloadDistance);
  const frameRef = useRef<number | null>(null);

  totalRef.current = totalCount;
  pageSizeRef.current = normalizedPageSize;
  visibleCountRef.current = visibleCount;
  enabledRef.current = enabled;
  preloadDistanceRef.current = preloadDistance;

  const loadMoreRef = useCallback((node: T | null) => {
    setSentinelNode(node);
  }, []);

  const revealMore = useCallback(() => {
    if (!enabledRef.current) return;

    setVisibleCount((previous) => {
      const total = totalRef.current;
      if (previous >= total) return previous;
      return Math.min(total, previous + pageSizeRef.current);
    });
  }, []);

  const isNearEnd = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (!enabledRef.current || visibleCountRef.current >= totalRef.current) {
      return false;
    }

    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight || 0;
    const preload = preloadDistanceRef.current;

    if (sentinelNode) {
      const rect = sentinelNode.getBoundingClientRect();
      if (rect.top <= viewportHeight + preload) {
        return true;
      }
    }

    const documentElement = document.documentElement;
    const body = document.body;
    const scrollTop =
      window.scrollY || window.pageYOffset || documentElement.scrollTop || 0;
    const scrollHeight = Math.max(
      documentElement.scrollHeight,
      body?.scrollHeight || 0,
    );
    const remaining = scrollHeight - scrollTop - viewportHeight;

    return remaining <= preload;
  }, [sentinelNode]);

  const checkNow = useCallback(() => {
    if (isNearEnd()) {
      revealMore();
    }
  }, [isNearEnd, revealMore]);

  const scheduleCheck = useCallback(() => {
    if (typeof window === "undefined" || frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      checkNow();
    });
  }, [checkNow]);

  useEffect(() => {
    setVisibleCount(normalizedPageSize);
  }, [normalizedPageSize, resetKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return undefined;

    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck);
    scheduleCheck();

    return () => {
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [enabled, scheduleCheck]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !enabled ||
      !sentinelNode ||
      !("IntersectionObserver" in window)
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          revealMore();
        }
      },
      { rootMargin: `${preloadDistance}px 0px` },
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [enabled, preloadDistance, revealMore, sentinelNode]);

  useEffect(() => {
    scheduleCheck();
  }, [normalizedPageSize, scheduleCheck, totalCount, visibleCount]);

  return { visibleCount, loadMoreRef };
}
