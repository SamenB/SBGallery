import { useCallback, useState } from "react";
import { getApiUrl } from "@/utils";
import type { ArtworkFormState } from "./types";
import { deleteArtworkPrintAsset } from "./artworkAdmin.api";
import { hasCanvasOfferings } from "./utils";
import { uploadFormDataWithProgress } from "./utils";

export function useArtworkAssetActions({
  editingId,
  formData,
  fetchWorkflow,
  fetchData,
  setNotice,
  setWorkflowError,
}: {
  editingId: number | null;
  formData: ArtworkFormState;
  fetchWorkflow: (artworkId: number) => Promise<void>;
  fetchData: () => Promise<void>;
  setNotice: (notice: string | null) => void;
  setWorkflowError: (error: string | null) => void;
}) {
  const [assetUploadingSlot, setAssetUploadingSlot] = useState<string | null>(
    null,
  );
  const [assetUploadProgress, setAssetUploadProgress] = useState<
    Record<string, number>
  >({});

  const uploadMasterAsset = useCallback(
    async (slotId: string, assetRole: string, file: File) => {
      if (!editingId) return;
      if (
        assetRole === "master" &&
        hasCanvasOfferings(formData) &&
        !formData.canvas_wrap_style
      ) {
        setWorkflowError(
          "Choose a canvas wrap and save the artwork draft before uploading the master.",
        );
        return;
      }

      setAssetUploadingSlot(slotId);
      setAssetUploadProgress((previous) => ({ ...previous, [slotId]: 0 }));
      setWorkflowError(null);
      try {
        const body = new FormData();
        body.append("file", file);
        body.append("asset_role", assetRole);
        body.append("category_id", slotId);
        const payload = await uploadFormDataWithProgress<{
          generated_assets?: unknown[];
          derivatives_scheduled?: boolean;
        }>(
          `${getApiUrl()}/artworks/${editingId}/print-assets`,
          body,
          (progress) =>
            setAssetUploadProgress((previous) => ({
              ...previous,
              [slotId]: progress,
            })),
        );
        await fetchWorkflow(editingId);
        const generatedCount = Array.isArray(payload.generated_assets)
          ? payload.generated_assets.length
          : 0;
        setNotice(
          payload.derivatives_scheduled
            ? `Master uploaded for ${slotId}. Provider-ready files are being generated in the background.`
            : generatedCount > 0
              ? `Master uploaded for ${slotId}. ${generatedCount} derivatives generated automatically.`
              : `Master uploaded for ${slotId}.`,
        );
        if (payload.derivatives_scheduled)
          window.setTimeout(() => void fetchWorkflow(editingId), 2500);
      } catch (error) {
        console.error(error);
        setWorkflowError(
          error instanceof Error ? error.message : "Upload failed.",
        );
      } finally {
        setAssetUploadingSlot(null);
        window.setTimeout(() => {
          setAssetUploadProgress((previous) => {
            const next = { ...previous };
            delete next[slotId];
            return next;
          });
        }, 800);
      }
    },
    [editingId, fetchWorkflow, formData, setNotice, setWorkflowError],
  );

  const deleteMasterAsset = useCallback(
    async (assetId: number) => {
      if (!editingId) return;
      try {
        await deleteArtworkPrintAsset(editingId, assetId);
      } catch {
        window.alert("Could not delete asset.");
        return;
      }
      await fetchWorkflow(editingId);
      await fetchData();
    },
    [editingId, fetchData, fetchWorkflow],
  );

  return {
    assetUploadingSlot,
    assetUploadProgress,
    uploadMasterAsset,
    deleteMasterAsset,
  };
}
