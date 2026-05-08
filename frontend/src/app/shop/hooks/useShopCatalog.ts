"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiJson, getApiUrl } from "@/utils";
import { DEFAULT_GRADIENTS } from "../constants";
import type { Label, LabelCategory, Product } from "../types";

type ArtworkListPayload = Product[] | { items?: Product[]; data?: Product[] };

function getArtworkItems(payload: ArtworkListPayload): Product[] | null {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  return null;
}

export function useShopCatalog(countryCode: string) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<LabelCategory[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) {
      return;
    }

    const apiUrl = getApiUrl();
    const abortController = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      apiFetch(`${apiUrl}/artworks?limit=1000&surface=shop&country=${countryCode}`, { signal: abortController.signal }).then((response) => apiJson<ArtworkListPayload>(response)),
      apiFetch(`${apiUrl}/labels/categories`, { signal: abortController.signal }).then((response) => apiJson<LabelCategory[]>(response)),
      apiFetch(`${apiUrl}/labels`, { signal: abortController.signal }).then((response) => apiJson<Label[]>(response)),
    ])
      .then(([artData, catData, lblData]) => {
        if (cancelled) return;

        const rawData = getArtworkItems(artData);
        if (rawData) {
          setAllProducts(
            rawData.map((item, index) => ({
              ...item,
              gradientFrom: DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length][0],
              gradientTo: DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length][1],
            })),
          );
        } else {
          setError("Failed to load artworks.");
        }

        if (Array.isArray(catData)) setCategories(catData);
        if (Array.isArray(lblData)) setLabels(lblData);
      })
      .catch((err: unknown) => {
        if (cancelled || abortController.signal.aborted) return;

        console.error("Shop initialization failed:", err);
        setError(err instanceof Error ? err.message : "Network error.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [countryCode]);

  return { allProducts, categories, labels, loading, error };
}
