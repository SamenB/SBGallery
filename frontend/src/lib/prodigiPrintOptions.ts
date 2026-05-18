import type { StorefrontCard } from "@/lib/artworkStorefront";

export const HIDDEN_STOREFRONT_CATEGORY_IDS = new Set(["canvasClassicFrame"]);

const FRAME_SWATCH_ROOT = "/prodigi/frame-swatches";

const FRAME_SWATCHES: Record<string, Record<string, string>> = {
  paperPrintBoxFramed: {
    black: `${FRAME_SWATCH_ROOT}/paper-box-black.jpg`,
    white: `${FRAME_SWATCH_ROOT}/paper-box-white.jpg`,
    natural: `${FRAME_SWATCH_ROOT}/paper-box-natural.jpg`,
    brown: `${FRAME_SWATCH_ROOT}/paper-box-brown.jpg`,
  },
  paperPrintClassicFramed: {
    black: `${FRAME_SWATCH_ROOT}/paper-classic-black.jpg`,
    white: `${FRAME_SWATCH_ROOT}/paper-classic-white.jpg`,
    natural: `${FRAME_SWATCH_ROOT}/paper-classic-natural.jpg`,
    brown: `${FRAME_SWATCH_ROOT}/paper-classic-brown.jpg`,
    gold: `${FRAME_SWATCH_ROOT}/paper-classic-antique-gold.jpg`,
    silver: `${FRAME_SWATCH_ROOT}/paper-classic-antique-silver.jpg`,
  },
  canvasFloatingFrame: {
    black: `${FRAME_SWATCH_ROOT}/canvas-floating-black.jpg`,
    white: `${FRAME_SWATCH_ROOT}/canvas-floating-white.jpg`,
    brown: `${FRAME_SWATCH_ROOT}/canvas-floating-brown.jpg`,
  },
};

const FRAME_COLOR_FALLBACKS: Record<string, string> = {
  black: "#1d1d1b",
  white: "#f4f1ea",
  natural: "#d6bc88",
  brown: "#6f4a32",
  gold: "#d3a947",
  silver: "#c9c9c4",
  "antique gold": "#c99a3d",
  "antique silver": "#b9b5aa",
};

export interface FrameColorSwatch {
  imageSrc?: string;
  fallbackColor: string;
  label: string;
}

export function getVisibleStorefrontCards(cards: StorefrontCard[] | undefined): StorefrontCard[] {
  return (cards || []).filter((card) => !HIDDEN_STOREFRONT_CATEGORY_IDS.has(card.category_id));
}

export function hasVisibleStorefrontCards(cards: StorefrontCard[] | undefined): boolean {
  return getVisibleStorefrontCards(cards).length > 0;
}

export function getFrameColorSwatch(
  card: StorefrontCard | null,
  attributeKey: string,
  value: string,
): FrameColorSwatch | null {
  if (!card || attributeKey !== "color") {
    return null;
  }

  const normalizedValue = normalizeFrameColor(value);
  const categorySwatches = FRAME_SWATCHES[card.category_id];
  const imageSrc = categorySwatches?.[normalizedValue];
  if (categorySwatches && !imageSrc) {
    return null;
  }
  return {
    imageSrc,
    fallbackColor: FRAME_COLOR_FALLBACKS[normalizedValue] || "#d8d5cc",
    label: value,
  };
}

export function filterFrameColorOptionsForSwatches(
  card: StorefrontCard | null,
  attributeKey: string,
  options: string[],
): string[] {
  if (!card || attributeKey !== "color") {
    return options;
  }
  const categorySwatches = FRAME_SWATCHES[card.category_id];
  if (!categorySwatches) {
    return options;
  }
  return options.filter((value) => Boolean(categorySwatches[normalizeFrameColor(value)]));
}

export function getFrameColorOptions(card: StorefrontCard): Array<{ value: string; swatch: FrameColorSwatch }> {
  return filterFrameColorOptionsForSwatches(card, "color", card.allowed_attribute_options.color || [])
    .map((value) => {
      const swatch = getFrameColorSwatch(card, "color", value);
      return swatch ? { value, swatch } : null;
    })
    .filter((item): item is { value: string; swatch: FrameColorSwatch } => item !== null);
}

function normalizeFrameColor(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}
