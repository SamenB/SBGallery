"use client";

import type { ReactNode } from "react";

type ShopDesktopFiltersSidebarProps = {
  collapsed: boolean;
  activeFilterCount: number;
  onClearAll: () => void;
  children: ReactNode;
};

export function ShopDesktopFiltersSidebar({
  collapsed,
  activeFilterCount,
  onClearAll,
  children,
}: ShopDesktopFiltersSidebarProps) {
  return (
    <div className={`shop-sidebar-shell${collapsed ? " is-collapsed" : ""}`}>
      <aside
        id="shop-desktop-filters"
        className="shop-desktop-sidebar"
        aria-hidden={collapsed}
        inert={collapsed ? true : undefined}
      >
        <button
          type="button"
          className="shop-clear-filters"
          onClick={onClearAll}
          disabled={activeFilterCount === 0}
        >
          Clear all
        </button>
        {children}
      </aside>
    </div>
  );
}
