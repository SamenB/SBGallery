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
  return columnCount === 1 ? "1fr" : `repeat(${columnCount}, 1fr)`;
}

export function getShopGridGap({ isMobile, isPhone, gridMode }: { isMobile: boolean; isPhone: boolean; gridMode: ShopGridMode }) {
  if (isMobile) {
    if (isPhone) {
      if (gridMode === "1") return "1.35rem 1rem";
      if (gridMode === "2") return "0.9rem 1.25rem";
      return "0.4rem 0.5rem";
    }

    if (gridMode === "1") return "1.8rem 1.5rem";
    if (gridMode === "2") return "1.2rem 1rem";
    return "0.65rem 0.5rem";
  }

  if (gridMode === "1") return "2.4rem 24px";
  if (gridMode === "2") return "1.8rem 16px";
  return "1.2rem 10px";
}
