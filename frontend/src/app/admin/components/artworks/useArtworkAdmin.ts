import { useCallback, useEffect, useState } from "react";
import type {
  AspectRatio,
  Artwork,
  ArtworkFormState,
  ArtworkPrintWorkflowPayload,
  DragItem,
  Label,
  LabelCategory,
} from "./types";
import {
  deleteArtwork,
  fetchArtworkAdminData,
  fetchArtworkDetails,
  fetchArtworkReadinessSummaries,
  fetchArtworkWorkflow,
  patchArtworkImages,
  refreshArtworkStorefrontPayloads,
  saveArtworkDraft,
  uploadArtworkImages,
} from "./artworkAdmin.api";
import {
  buildRefreshSummary,
  mapArtworkToFormState,
  mapImagesToDragItems,
} from "./artworkAdmin.mappers";
import {
  buildFormPayload,
  createDefaultFormState,
  hasCanvasOfferings,
  hasMissingPrintRatio,
  hasPrintOfferings,
  resolveImageUrl,
} from "./utils";
import { useArtworkAssetActions } from "./useArtworkAssetActions";

export function useArtworkAdmin() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<LabelCategory[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [aspectRatios, setAspectRatios] = useState<AspectRatio[]>([]);
  const [loading, setLoading] = useState(true);
  const [readinessRefreshing, setReadinessRefreshing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [savingArtwork, setSavingArtwork] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageItems, setImageItems] = useState<DragItem[]>([]);
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
  const [workflowData, setWorkflowData] =
    useState<ArtworkPrintWorkflowPayload | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [editingWhiteBorder, setEditingWhiteBorder] = useState(false);
  const [whiteBorderDraft, setWhiteBorderDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [payloadRefreshLoading, setPayloadRefreshLoading] = useState(false);
  const [payloadRefreshMessage, setPayloadRefreshMessage] = useState<
    string | null
  >(null);
  const [payloadRefreshError, setPayloadRefreshError] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState<ArtworkFormState>(
    createDefaultFormState(),
  );

  const refreshReadinessSummaries = useCallback(async () => {
    setReadinessRefreshing(true);
    try {
      const readinessArtworks = await fetchArtworkReadinessSummaries();
      const summariesByArtworkId = new Map(
        readinessArtworks.map((artwork) => [
          artwork.id,
          artwork.print_readiness_summary,
        ]),
      );
      setArtworks((previous) =>
        previous.map((artwork) =>
          summariesByArtworkId.has(artwork.id)
            ? {
                ...artwork,
                print_readiness_summary:
                  summariesByArtworkId.get(artwork.id) ?? null,
              }
            : artwork,
        ),
      );
    } catch (error) {
      console.warn("Failed to refresh artwork readiness summaries", error);
    } finally {
      setReadinessRefreshing(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchArtworkAdminData();
      if (data.artworks) {
        setArtworks(data.artworks);
        void refreshReadinessSummaries();
      }
      if (data.categories) setCategories(data.categories);
      if (data.labels) setLabels(data.labels);
      if (data.aspectRatios) setAspectRatios(data.aspectRatios);
    } catch (error) {
      console.error("Failed to fetch artwork admin data", error);
    } finally {
      setLoading(false);
    }
  }, [refreshReadinessSummaries]);

  const fetchWorkflow = useCallback(async (artworkId: number) => {
    setWorkflowLoading(true);
    setWorkflowError(null);
    try {
      setWorkflowData(await fetchArtworkWorkflow(artworkId));
    } catch (error) {
      console.error(error);
      setWorkflowData(null);
      setWorkflowError("Could not load print workflow yet.");
    } finally {
      setWorkflowLoading(false);
    }
  }, []);

  const refreshArtworkPayloads = useCallback(async () => {
    setPayloadRefreshLoading(true);
    setPayloadRefreshMessage(null);
    setPayloadRefreshError(null);
    try {
      const payload = await refreshArtworkStorefrontPayloads();
      await fetchData();
      if (editingId) await fetchWorkflow(editingId);

      setPayloadRefreshMessage(buildRefreshSummary(payload));
    } catch (error) {
      console.error(error);
      setPayloadRefreshError(
        error instanceof Error
          ? error.message
          : "Could not refresh artwork payloads.",
      );
    } finally {
      setPayloadRefreshLoading(false);
    }
  }, [editingId, fetchData, fetchWorkflow]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const resetEditor = useCallback(() => {
    setFormData(createDefaultFormState());
    setImageItems([]);
    setEditingId(null);
    setWorkflowData(null);
    setWorkflowError(null);
    setNotice(null);
    setIsFormOpen(false);
  }, []);

  const openNewEditor = useCallback(() => {
    setFormData(createDefaultFormState());
    setImageItems([]);
    setEditingId(null);
    setWorkflowData(null);
    setWorkflowError(null);
    setNotice(null);
    setIsFormOpen(true);
    window.requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }, []);

  const handleSaveCrop = useCallback(
    async (croppedBlob: Blob) => {
      if (cropImageIndex === null) return;
      const file = new File([croppedBlob], `cropped-${Date.now()}.webp`, {
        type: "image/webp",
      });
      setImageItems((previous) => {
        const next = [...previous];
        next[cropImageIndex] = {
          type: "new",
          url: URL.createObjectURL(file),
          file,
        };
        return next;
      });
      setCropImageIndex(null);
    },
    [cropImageIndex],
  );

  const saveArtwork = useCallback(async () => {
    if (!formData.title.trim()) {
      window.alert("Title is required.");
      return null;
    }
    if (hasPrintOfferings(formData) && !formData.print_aspect_ratio_id) {
      window.alert(
        "Please choose a print aspect ratio in the Basics section before enabling print offerings.",
      );
      return null;
    }
    if (
      formData.show_in_shop &&
      hasCanvasOfferings(formData) &&
      !formData.canvas_wrap_style
    ) {
      window.alert(
        "Please choose a canvas wrap in Offerings before saving canvas prints.",
      );
      return null;
    }
    if (
      formData.has_original &&
      formData.original_status === "available" &&
      Number(formData.original_price || 0) <= 0
    ) {
      window.alert(
        "Original price must be greater than zero when the original is sellable.",
      );
      return null;
    }

    setSavingArtwork(true);
    setNotice(null);
    try {
      const data = await saveArtworkDraft(
        editingId,
        buildFormPayload(formData),
      );
      const targetId = editingId || data.data?.id;
      if (!targetId) throw new Error("Artwork ID was not returned after save.");

      if (editingId) {
        const existingOrdered = imageItems
          .filter((item) => item.type === "existing")
          .map((item) => item.existingData);
        await patchArtworkImages(editingId, existingOrdered);
      }

      const newFiles = imageItems
        .filter((item) => item.type === "new" && item.file)
        .map((item) => item.file as File);
      if (newFiles.length > 0) {
        const uploadPayload = await uploadArtworkImages(targetId, newFiles);
        const uploadedImages = uploadPayload.images || [];
        if (uploadedImages.length > 0) {
          setImageItems([
            ...imageItems.filter((item) => item.type === "existing"),
            ...uploadedImages.map((image) => ({
              type: "existing" as const,
              url: resolveImageUrl(image),
              existingData: image,
            })),
          ]);
        }
      }

      setEditingId(targetId);
      setIsFormOpen(true);
      setNotice(
        editingId
          ? "Artwork updated. Draft state and print workflow were refreshed."
          : "Artwork draft created. You can continue through the print workflow now.",
      );
      await fetchData();
      if (hasPrintOfferings(formData)) await fetchWorkflow(targetId);
      else setWorkflowData(null);
      return targetId;
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Network error while saving the artwork.",
      );
      return null;
    } finally {
      setSavingArtwork(false);
    }
  }, [editingId, fetchData, fetchWorkflow, formData, imageItems]);

  const handleEditClick = useCallback(
    async (artwork: Artwork) => {
      setNotice(null);
      setWorkflowError(null);
      try {
        const full = await fetchArtworkDetails(artwork.id);
        setFormData(mapArtworkToFormState(full));
        setImageItems(mapImagesToDragItems(full.images));
        setEditingId(full.id);
        setIsFormOpen(true);
        window.requestAnimationFrame(() =>
          window.scrollTo({ top: 0, behavior: "smooth" }),
        );

        if (
          full.has_canvas_print ||
          full.has_canvas_print_limited ||
          full.has_paper_print ||
          full.has_paper_print_limited
        )
          await fetchWorkflow(full.id);
        else setWorkflowData(null);
      } catch (error) {
        console.error(error);
        window.alert("Error loading artwork details.");
      }
    },
    [fetchWorkflow],
  );

  const handleDelete = useCallback(
    async (artworkId: number) => {
      if (!window.confirm("Delete this artwork?")) return;
      try {
        await deleteArtwork(artworkId);
      } catch {
        window.alert("Delete failed.");
        return;
      }
      setArtworks((previous) =>
        previous.filter((artwork) => artwork.id !== artworkId),
      );
      if (editingId === artworkId) resetEditor();
    },
    [editingId, resetEditor],
  );

  const {
    assetUploadingSlot,
    assetUploadProgress,
    uploadMasterAsset,
    deleteMasterAsset,
  } = useArtworkAssetActions({
    editingId,
    formData,
    fetchWorkflow,
    fetchData,
    setNotice,
    setWorkflowError,
  });

  return {
    artworks,
    categories,
    labels,
    aspectRatios,
    loading,
    readinessRefreshing,
    isFormOpen,
    savingArtwork,
    editingId,
    imageItems,
    cropImageIndex,
    workflowData,
    workflowLoading,
    workflowError,
    editingWhiteBorder,
    whiteBorderDraft,
    assetUploadingSlot,
    assetUploadProgress,
    notice,
    payloadRefreshLoading,
    payloadRefreshMessage,
    payloadRefreshError,
    formData,
    setFormData,
    setImageItems,
    setCropImageIndex,
    setEditingWhiteBorder,
    setWhiteBorderDraft,
    refreshArtworkPayloads,
    resetEditor,
    openNewEditor,
    handleSaveCrop,
    saveArtwork,
    handleEditClick,
    handleDelete,
    uploadMasterAsset,
    deleteMasterAsset,
    headerReadiness: hasPrintOfferings(formData)
      ? hasMissingPrintRatio(formData)
        ? {
            status: "blocked" as const,
            message: "Choose a print aspect ratio in Basics.",
          }
        : workflowData?.readiness_summary || null
      : null,
  };
}
