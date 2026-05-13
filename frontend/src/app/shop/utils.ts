import { Product, SortKey } from "./types";
import { artworkUrl } from "@/utils";

export const getStorefrontSummary = (product: Product) => product.storefront_summary;

export const buildArtworkHref = (product: Product, countryCode?: string): string => {
    const href = artworkUrl(product.slug || product.id);
    const params = new URLSearchParams();
    const storefrontSummary = getStorefrontSummary(product);

    if (countryCode) {
        params.set("country", countryCode);
    }
    if (storefrontSummary?.default_medium) {
        params.set("view", storefrontSummary.default_medium);
    }

    return params.size > 0 ? `${href}?${params.toString()}` : href;
};

export const getLongestSide = (p: Product): number => Math.max(p.width_cm || 0, p.height_cm || 0);

export const getArea = (p: Product) => (p.width_cm || 0) * (p.height_cm || 0);

export interface AspectRatioRange {
    min: number;
    max: number;
    containerWidth?: number;
}

type ArtworkAspectRatioSource = Pick<Product, "width_cm" | "height_cm" | "width_in" | "height_in">;

export const getProductAspectRatio = (product: ArtworkAspectRatioSource, naturalAspectRatio?: number): number | null => {
    if (naturalAspectRatio && Number.isFinite(naturalAspectRatio) && naturalAspectRatio > 0) {
        return naturalAspectRatio;
    }

    const sourceWidth = product.width_cm || product.width_in || 0;
    const sourceHeight = product.height_cm || product.height_in || 0;
    const ratio = sourceWidth > 0 && sourceHeight > 0 ? sourceWidth / sourceHeight : 0;

    return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
};

export const getEffectiveStartingPrice = (p: Product, fallbackPrintPrice: number): number => {
    return (
        p.original_price ||
        p.storefront_summary?.min_print_price ||
        p.base_print_price ||
        fallbackPrintPrice
    );
};

export const getOrientation = (p: Product): "horizontal" | "vertical" | "square" | null => {
    if (p.orientation) return p.orientation.toLowerCase() as any;
    if (!p.width_cm || !p.height_cm) return null;
    const ratio = p.width_cm / p.height_cm;
    if (ratio >= 1.1) return "horizontal";
    if (ratio <= 0.9) return "vertical";
    return "square";
};

export const getSizeCategory = (p: Product): "small" | "medium" | "large" | null => {
    const area = getArea(p);
    if (!area) return null;
    if (area < 900) return "small";
    if (area <= 3600) return "medium";
    return "large";
};

export function getEqualAreaImageSize({
    product,
    containerWidth,
    zoneHeight,
    isMobile,
    rowAspectRatioRange,
    naturalAspectRatio,
    maxWidthRatio = 0.78,
    maxHeightRatio = 0.92,
}: {
    product: ArtworkAspectRatioSource;
    containerWidth: number;
    zoneHeight: number;
    isMobile: boolean;
    rowAspectRatioRange?: AspectRatioRange;
    naturalAspectRatio?: number;
    maxWidthRatio?: number;
    maxHeightRatio?: number;
}): { width: number; height: number } | null {
    const ratio = getProductAspectRatio(product, naturalAspectRatio);

    if (!ratio || containerWidth <= 0 || zoneHeight <= 0) {
        return null;
    }

    const rowContainerWidth = rowAspectRatioRange?.containerWidth || containerWidth;
    const maxWidth = Math.min(containerWidth, rowContainerWidth) * (isMobile ? 1 : maxWidthRatio);
    const maxHeight = zoneHeight * maxHeightRatio;
    const minRowRatio = rowAspectRatioRange?.min || ratio;
    const maxRowRatio = rowAspectRatioRange?.max || ratio;
    const targetArea = Math.min(
        (maxWidth * maxWidth) / maxRowRatio,
        maxHeight * maxHeight * minRowRatio,
    );

    const rawWidth = Math.sqrt(targetArea * ratio);
    const rawHeight = Math.sqrt(targetArea / ratio);
    const scale = Math.min(1, maxWidth / rawWidth, maxHeight / rawHeight);

    return {
        width: Math.round(rawWidth * scale),
        height: Math.round(rawHeight * scale),
    };
}

export function sortProducts(products: Product[], key: SortKey, globalPrintPrice: number) {
    const c = [...products];
    switch (key) {
        case "curated": break;
        case "newest": c.sort((a, b) => b.id - a.id); break;
        case "price-low": c.sort((a, b) => getEffectiveStartingPrice(a, globalPrintPrice) - getEffectiveStartingPrice(b, globalPrintPrice)); break;
        case "price-high": c.sort((a, b) => getEffectiveStartingPrice(b, globalPrintPrice) - getEffectiveStartingPrice(a, globalPrintPrice)); break;
        case "size-small": c.sort((a, b) => getArea(a) - getArea(b)); break;
        case "size-large": c.sort((a, b) => getArea(b) - getArea(a)); break;
    }
    return c;
}
