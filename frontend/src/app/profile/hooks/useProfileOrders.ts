"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { apiFetch, getApiUrl } from "@/utils";
import type { ProfileOrder } from "../types";

export function useProfileOrders() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    } else if (user?.is_admin) {
      router.push("/admin");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || user.is_admin) return;
    let cancelled = false;
    setDataLoading(true);
    apiFetch(`${getApiUrl()}/orders/me`)
      .then((res) => (res.ok ? res.json() : []))
      .then((items: ProfileOrder[]) => {
        if (!cancelled) setOrders(items);
      })
      .catch((err: unknown) => {
        console.error("Error fetching user data", err);
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return {
    user,
    loading,
    orders: sortedOrders,
    dataLoading,
    expandedOrder,
    setExpandedOrder,
  };
}
