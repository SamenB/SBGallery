"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCart } from "@/context/CartContext";
import { usePreferences } from "@/context/PreferencesContext";
import { useUser } from "@/context/UserContext";
import {
  buildArtworkStorefrontKey,
  loadArtworkStorefront,
  type ArtworkPrintStorefront,
} from "@/lib/artworkStorefront";
import {
  detectDeliveryCountry,
  storeDeliveryCountry,
} from "@/lib/deliveryCountry";
import { apiFetch, getApiUrl } from "@/utils";
import { DEFAULT_GRADIENTS } from "../constants";
import type { Artwork } from "../types";

export type PurchaseType = "original" | "canvas" | "paper";

export interface ArtworkLayoutMetrics {
  boxW: number;
  boxH: number;
  imgH: number;
  winW: number;
}

interface ArtworkResponse {
  data?: Artwork;
}

interface SlugResponse {
  data?: { slug?: string }[];
  items?: { slug?: string }[];
}

const isCountryCode = (value: string): boolean => /^[A-Z]{2}$/.test(value);
const isPurchaseType = (value: string | null): value is PurchaseType =>
  value === "original" || value === "canvas" || value === "paper";

const readArtworkResponse = (payload: ArtworkResponse | Artwork): Artwork =>
  "data" in payload && payload.data ? payload.data : (payload as Artwork);

export function useArtworkDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const { units, convertPrice, pendingLikes, addPendingLike, removePendingLike, unauthLikeCount, incrementUnauthLikeCount } =
    usePreferences();
  const { addItem } = useCart();
  const { user } = useUser();
  const [work, setWork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fullSizeOpen, setFullSizeOpen] = useState(false);
  const [allSlugs, setAllSlugs] = useState<string[]>([]);
  const [userCountryCode, setUserCountryCode] = useState("");
  const [storefrontState, setStorefrontState] = useState<{
    requestKey: string;
    storefront: ArtworkPrintStorefront | null;
    error: string | null;
  } | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [layoutMetrics, setLayoutMetrics] = useState<ArtworkLayoutMetrics>({
    boxW: 0,
    boxH: 0,
    imgH: 0,
    winW: 0,
  });
  const [imageAspectRatios, setImageAspectRatios] = useState<
    Record<number, number>
  >({});
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const swipeRef = useRef<number | null>(null);
  const hasTouchRef = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<(HTMLDivElement | null)[]>([]);
  const urlCountry = (searchParams.get("country") || "").toUpperCase();
  const urlView = searchParams.get("view");
  const activeCountryCode = isCountryCode(urlCountry)
    ? urlCountry
    : userCountryCode;

  const updateMetrics = useCallback(() => {
    const boxNode = boxRef.current;
    if (!boxNode) return;
    const imgNode = imageFrameRef.current[selectedImageIndex];
    setLayoutMetrics({
      boxW: boxNode.clientWidth,
      boxH: boxNode.clientHeight,
      imgH: imgNode ? imgNode.clientHeight : 0,
      winW: window.innerWidth,
    });
  }, [selectedImageIndex]);

  useEffect(() => {
    detectDeliveryCountry()
      .then(setUserCountryCode)
      .catch(() => setUserCountryCode("US"));
  }, []);

  useEffect(() => {
    if (isCountryCode(urlCountry)) storeDeliveryCountry(urlCountry);
  }, [urlCountry]);

  useEffect(() => {
    if (isCountryCode(urlCountry) || !isCountryCode(userCountryCode)) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("country", userCountryCode);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, urlCountry, userCountryCode]);

  useEffect(() => {
    const boxNode = boxRef.current;
    const imgNode = imageFrameRef.current[selectedImageIndex];
    if (!boxNode) return;
    const observer = new ResizeObserver(updateMetrics);
    observer.observe(boxNode);
    if (imgNode) observer.observe(imgNode);
    updateMetrics();
    return () => observer.disconnect();
  }, [selectedImageIndex, updateMetrics, work?.images?.length]);

  useEffect(() => {
    if (!slug) return;
    const params = new URLSearchParams();
    if (activeCountryCode) params.set("country", activeCountryCode);

    apiFetch(
      `${getApiUrl()}/artworks/${slug}${params.size ? `?${params.toString()}` : ""}`,
    )
      .then((res) => res.json())
      .then((data: ArtworkResponse | Artwork) => {
        const item = readArtworkResponse(data);
        setWork({
          ...item,
          gradientFrom: DEFAULT_GRADIENTS[item.id % DEFAULT_GRADIENTS.length][0],
          gradientTo: DEFAULT_GRADIENTS[item.id % DEFAULT_GRADIENTS.length][1],
        });
        if (item.print_storefront && activeCountryCode) {
          setStorefrontState({
            requestKey: buildArtworkStorefrontKey(slug, activeCountryCode),
            storefront: item.print_storefront,
            error: null,
          });
        }
      })
      .catch(() => console.warn("Backend unavailable"))
      .finally(() => setLoading(false));
  }, [activeCountryCode, slug]);

  useEffect(() => {
    if (!slug || !activeCountryCode || loading) return;
    const requestKey = buildArtworkStorefrontKey(slug, activeCountryCode);
    if (work?.print_storefront?.country_code === activeCountryCode) return;
    if (storefrontState?.requestKey === requestKey && storefrontState.storefront) return;

    let cancelled = false;
    loadArtworkStorefront(slug, activeCountryCode)
      .then((data) => {
        if (!cancelled) setStorefrontState({ requestKey, storefront: data, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStorefrontState({
            requestKey,
            storefront: null,
            error: err instanceof Error ? err.message : "Unable to load print offers.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeCountryCode, loading, slug, storefrontState, work]);

  useEffect(() => {
    apiFetch(`${getApiUrl()}/artworks?limit=500&fields=slug`)
      .then((res) => res.json())
      .then((data: SlugResponse | { slug?: string }[]) => {
        const items = Array.isArray(data) ? data : data.data || data.items || [];
        setAllSlugs(items.map((a) => a.slug).filter((value): value is string => Boolean(value)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user || !work) return;
    apiFetch(`${getApiUrl()}/users/me/likes`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { id: number }[]) => setLiked(data.some((a) => a.id === work.id)))
      .catch(() => setLiked(false));
  }, [user, work]);

  useEffect(() => {
    if (!fullSizeOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullSizeOpen]);

  const handleImageDimensions = (
    idx: number,
    naturalWidth: number,
    naturalHeight: number,
  ) => {
    if (naturalWidth > 0 && naturalHeight > 0) {
      const nextRatio = naturalWidth / naturalHeight;
      setImageAspectRatios((prev) =>
        prev[idx] === nextRatio ? prev : { ...prev, [idx]: nextRatio },
      );
    }
    updateMetrics();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (hasTouchRef.current || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const updateRouteState = (next: { country?: string; view?: PurchaseType }) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const nextCountry = (next.country || activeCountryCode || userCountryCode).toUpperCase();
    if (!isCountryCode(nextCountry)) return;
    nextParams.set("country", nextCountry);
    if (next.view) nextParams.set("view", next.view);
    else nextParams.delete("view");
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const toggleLike = async () => {
    if (!work) return;
    const newState = !effectiveLiked;
    setLiked(newState);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);

    if (!user) {
      if (newState) addPendingLike(work.id);
      else removePendingLike(work.id);
      incrementUnauthLikeCount();
      if (unauthLikeCount % 3 === 0) {
        setTimeout(() => setShowAuthPrompt(true), 1000);
      }
      return;
    }

    try {
      await apiFetch(`${getApiUrl()}/users/me/likes/${work.id}`, {
        method: newState ? "POST" : "DELETE",
      });
    } catch {}
  };

  const images = work?.images || [];
  const currentSlugIdx = allSlugs.indexOf(slug);
  const prevSlug = currentSlugIdx > 0 ? allSlugs[currentSlugIdx - 1] : null;
  const nextSlug =
    currentSlugIdx !== -1 && currentSlugIdx < allSlugs.length - 1
      ? allSlugs[currentSlugIdx + 1]
      : null;
  const storefrontRequestKey = buildArtworkStorefrontKey(slug, activeCountryCode);
  const embeddedStorefront =
    work?.print_storefront?.country_code === activeCountryCode ? work.print_storefront : null;
  const storefront =
    embeddedStorefront ||
    (storefrontState?.requestKey === storefrontRequestKey
      ? storefrontState.storefront
      : null);
  const storefrontError = embeddedStorefront
    ? null
    : storefrontState?.requestKey === storefrontRequestKey
      ? storefrontState.error
      : null;
  const storefrontLoading =
    !embeddedStorefront && storefrontState?.requestKey !== storefrontRequestKey;
  const hasCanvasOffers = storefront
    ? Boolean(storefront.mediums?.canvas?.cards?.length)
    : Boolean(work?.has_canvas_print || work?.has_canvas_print_limited);
  const hasPaperOffers = storefront
    ? Boolean(storefront.mediums?.paper?.cards?.length)
    : Boolean(work?.has_paper_print || work?.has_paper_print_limited);
  const defaultPurchaseType: PurchaseType =
    work?.original_status === "available"
      ? "original"
      : work?.has_canvas_print || work?.has_canvas_print_limited
        ? "canvas"
        : work?.has_paper_print || work?.has_paper_print_limited
          ? "paper"
          : "original";
  const resolvedPurchaseType = isPurchaseType(urlView) ? urlView : defaultPurchaseType;
  const effectiveLiked = work ? (user ? liked : pendingLikes.includes(work.id)) : false;

  return {
    slug,
    work,
    loading,
    user,
    units,
    convertPrice,
    addItem,
    images,
    selectedImageIndex,
    setSelectedImageIndex,
    fullSizeOpen,
    setFullSizeOpen,
    prevSlug,
    nextSlug,
    activeCountryCode,
    layoutMetrics,
    imageAspectRatios,
    boxRef,
    imageFrameRef,
    swipeRef,
    hasTouchRef,
    zoomPos,
    isZooming,
    setIsZooming,
    handlePointerMove,
    handleImageDimensions,
    effectiveLiked,
    likeAnimating,
    toggleLike,
    setLiked,
    pendingLikes,
    addPendingLike,
    removePendingLike,
    unauthLikeCount,
    incrementUnauthLikeCount,
    showAuthPrompt,
    setShowAuthPrompt,
    resolvedPurchaseType,
    hasCanvasOffers,
    hasPaperOffers,
    updateRouteState,
    storefront,
    storefrontLoading,
    storefrontError,
  };
}
