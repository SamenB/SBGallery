export type ShopGridMode = "1" | "2" | "3";

export function getShopColumnCount({ isMobile, isPhone, gridMode }: { isMobile: boolean; isPhone: boolean; gridMode: ShopGridMode }) {
  if (isMobile) {
    if (isPhone) {
      if (gridMode === "1") return 1;
      if (gridMode === "2") return 2;
      return 3;
    }

    if (gridMode === "1") return 2;
    if (gridMode === "2") return 3;
    return 4;
  }

  if (gridMode === "1") return 2;
  if (gridMode === "2") return 3;
  return 4;
}

export function getShopGridColumns(columnCount: number) {
  return columnCount === 1 ? "1fr" : `repeat(${columnCount}, minmax(0, 1fr))`;
}

export function getShopGridGap({ isMobile, isPhone, gridMode }: { isMobile: boolean; isPhone: boolean; gridMode: ShopGridMode }) {
  if (isMobile) {
    if (isPhone) {
      if (gridMode === "1") return "1.1rem 0.55rem";
      if (gridMode === "2") return "0.75rem 0.65rem";
      return "0.45rem 0.35rem";
    }

    if (gridMode === "1") return "1.4rem 0.8rem";
    if (gridMode === "2") return "0.9rem 0.65rem";
    return "0.55rem 0.4rem";
  }

  if (gridMode === "1") return "2.4rem 24px";
  if (gridMode === "2") return "1.8rem 16px";
  return "1.2rem 10px";
}

export function getShopCardMaxWidth({ isMobile, gridMode }: { isMobile: boolean; gridMode: ShopGridMode }) {
  if (isMobile) {
    return undefined;
  }

  if (gridMode === "1") return 500;
  if (gridMode === "2") return 360;
  return 270;
}
