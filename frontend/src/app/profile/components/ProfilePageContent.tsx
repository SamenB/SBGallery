"use client";

import Link from "next/link";
import { usePreferences } from "@/context/PreferencesContext";
import { PUBLIC_ROUTES } from "@/lib/publicRoutes";
import { useProfileOrders } from "../hooks/useProfileOrders";
import { ProfileOrderCard } from "./ProfileOrderCard";

export function ProfilePageContent() {
  const { convertPrice } = usePreferences();
  const { user, loading, orders, dataLoading, expandedOrder, setExpandedOrder } =
    useProfileOrders();

  if (loading || (!user && !loading)) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] pt-[150px] text-center text-[var(--color-charcoal)]">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pb-24 font-sans text-[var(--color-charcoal)] selection:bg-[#31323E] selection:text-white">
      <div className="w-full bg-[#31323E] px-6 pb-24 pt-[150px] lg:px-12">
        <div className="mx-auto max-w-[1000px]">
          <h1 className="mb-4 font-serif text-4xl italic tracking-widest text-white lg:text-5xl">
            My Orders
          </h1>
          <p className="font-mono text-[0.8rem] uppercase tracking-widest text-white/60">
            Welcome back, {user?.username}
          </p>
        </div>
      </div>

      <main className="relative z-10 mx-auto -mt-12 max-w-[1000px] px-6 lg:px-12">
        {dataLoading ? (
          <div className="py-20 text-center font-mono text-sm tracking-widest text-[rgba(26,26,24,0.4)] animate-pulse">
            Synchronizing order data...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[rgba(26,26,24,0.06)] bg-[rgba(26,26,24,0.02)] py-20 text-center">
            <p className="mb-4 font-serif text-xl italic text-[rgba(26,26,24,0.4)]">
              No completed orders yet.
            </p>
            <Link href={PUBLIC_ROUTES.originalsAndPrints} className="font-sans text-sm uppercase tracking-widest text-[rgba(26,26,24,0.5)] underline underline-offset-4 transition-colors hover:text-[var(--color-charcoal)]">
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <ProfileOrderCard
                key={order.id}
                order={order}
                isExpanded={expandedOrder === order.id}
                onToggle={() =>
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
                convertPrice={convertPrice}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
