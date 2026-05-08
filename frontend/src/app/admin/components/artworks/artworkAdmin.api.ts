import { apiFetch, apiJson, getApiUrl } from "@/utils";
import type {
  AspectRatio,
  Artwork,
  ArtworkPrintWorkflowPayload,
  ImageEntry,
  Label,
  LabelCategory,
} from "./types";
import type { RefreshPayload } from "./artworkAdmin.mappers";

export async function fetchArtworkAdminData() {
  const [artworksRes, categoriesRes, labelsRes, ratiosRes] = await Promise.all([
    apiFetch(`${getApiUrl()}/artworks/admin/list?limit=200`),
    apiFetch(`${getApiUrl()}/labels/categories`),
    apiFetch(`${getApiUrl()}/labels`),
    apiFetch(`${getApiUrl()}/print-pricing/aspect-ratios`),
  ]);
  return {
    artworks: artworksRes.ok ? await apiJson<Artwork[]>(artworksRes) : null,
    categories: categoriesRes.ok
      ? await apiJson<LabelCategory[]>(categoriesRes)
      : null,
    labels: labelsRes.ok ? await apiJson<Label[]>(labelsRes) : null,
    aspectRatios: ratiosRes.ok ? await apiJson<AspectRatio[]>(ratiosRes) : null,
  };
}

export async function fetchArtworkReadinessSummaries() {
  const response = await apiFetch(
    `${getApiUrl()}/artworks/admin/list?limit=200&include_print_readiness=true`,
  );
  if (!response.ok)
    throw new Error(`Readiness request failed with ${response.status}`);
  return apiJson<Artwork[]>(response);
}

export async function fetchArtworkWorkflow(artworkId: number) {
  const response = await apiFetch(
    `${getApiUrl()}/artworks/${artworkId}/print-workflow?t=${Date.now()}`,
  );
  if (!response.ok)
    throw new Error(`Workflow request failed with ${response.status}`);
  return apiJson<ArtworkPrintWorkflowPayload>(response);
}

export async function refreshArtworkStorefrontPayloads() {
  const response = await apiFetch(
    `${getApiUrl()}/v1/admin/prodigi/refresh-artwork-payloads`,
    { method: "POST" },
  );
  const payload: RefreshPayload = await apiJson<RefreshPayload>(response).catch(
    () => ({}),
  );
  if (!response.ok)
    throw new Error(
      payload.detail ||
        payload.message ||
        "Could not refresh artwork payloads.",
    );
  return payload;
}

export async function fetchArtworkDetails(artworkId: number) {
  const response = await apiFetch(`${getApiUrl()}/artworks/${artworkId}`);
  if (!response.ok)
    throw new Error(`Artwork request failed with ${response.status}`);
  return apiJson<Artwork>(response);
}

export async function saveArtworkDraft(
  artworkId: number | null,
  payload: Record<string, unknown>,
) {
  const response = await apiFetch(
    artworkId
      ? `${getApiUrl()}/artworks/${artworkId}`
      : `${getApiUrl()}/artworks`,
    {
      method: artworkId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    const errorPayload = await apiJson<unknown>(response).catch(() => ({}));
    throw new Error(
      `Save failed: ${response.status} ${JSON.stringify(errorPayload)}`,
    );
  }
  return apiJson<{ data?: { id?: number } }>(response);
}

export async function patchArtworkImages(
  artworkId: number,
  images: (ImageEntry | undefined)[],
) {
  await apiFetch(`${getApiUrl()}/artworks/${artworkId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images }),
  });
}

export async function uploadArtworkImages(artworkId: number, files: File[]) {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const response = await apiFetch(
    `${getApiUrl()}/artworks/${artworkId}/images`,
    { method: "POST", body },
  );
  return apiJson<{ images?: ImageEntry[] }>(response);
}

export async function deleteArtwork(artworkId: number) {
  const response = await apiFetch(`${getApiUrl()}/artworks/${artworkId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Delete failed.");
}

export async function deleteArtworkPrintAsset(
  artworkId: number,
  assetId: number,
) {
  const response = await apiFetch(
    `${getApiUrl()}/artworks/${artworkId}/print-assets/${assetId}`,
    { method: "DELETE" },
  );
  if (!response.ok) throw new Error("Could not delete asset.");
}
