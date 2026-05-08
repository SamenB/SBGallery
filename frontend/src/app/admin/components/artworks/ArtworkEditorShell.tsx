import type { Dispatch, SetStateAction } from "react";
import { ArtworkBasicsForm } from "./ArtworkBasicsForm";
import { ArtworkMediaForm } from "./ArtworkMediaForm";
import { ArtworkOfferingsForm } from "./ArtworkOfferingsForm";
import { ArtworkPipelineForm } from "./ArtworkPipelineForm";
import type {
  AspectRatio,
  ArtworkFormState,
  ArtworkPrintWorkflowPayload,
  DragItem,
  Label,
  LabelCategory,
  PrintReadinessSummary,
} from "./types";
import { StatusBadge } from "./ui";
import { hasPrintOfferings } from "./utils";

interface ArtworkEditorShellProps {
  formData: ArtworkFormState;
  setFormData: Dispatch<SetStateAction<ArtworkFormState>>;
  aspectRatios: AspectRatio[];
  categories: LabelCategory[];
  labels: Label[];
  imageItems: DragItem[];
  setImageItems: Dispatch<SetStateAction<DragItem[]>>;
  setCropImageIndex: Dispatch<SetStateAction<number | null>>;
  editingWhiteBorder: boolean;
  setEditingWhiteBorder: Dispatch<SetStateAction<boolean>>;
  whiteBorderDraft: string;
  setWhiteBorderDraft: Dispatch<SetStateAction<string>>;
  editingId: number | null;
  workflowData: ArtworkPrintWorkflowPayload | null;
  workflowLoading: boolean;
  workflowError: string | null;
  assetUploadingSlot: string | null;
  assetUploadProgress: Record<string, number>;
  notice: string | null;
  savingArtwork: boolean;
  headerReadiness: Pick<PrintReadinessSummary, "status" | "message"> | null;
  onResetEditor: () => void;
  onSaveArtwork: () => void;
  onUploadMasterAsset: (
    slotId: string,
    assetRole: string,
    file: File,
  ) => Promise<void>;
  onDeleteMasterAsset: (assetId: number) => Promise<void>;
}

export function ArtworkEditorShell({
  formData,
  setFormData,
  aspectRatios,
  categories,
  labels,
  imageItems,
  setImageItems,
  setCropImageIndex,
  editingWhiteBorder,
  setEditingWhiteBorder,
  whiteBorderDraft,
  setWhiteBorderDraft,
  editingId,
  workflowData,
  workflowLoading,
  workflowError,
  assetUploadingSlot,
  assetUploadProgress,
  notice,
  savingArtwork,
  headerReadiness,
  onResetEditor,
  onSaveArtwork,
  onUploadMasterAsset,
  onDeleteMasterAsset,
}: ArtworkEditorShellProps) {
  const editorPreviewUrl = imageItems[0]?.url || null;
  const editorTitle =
    formData.title.trim() || (editingId ? "Untitled artwork" : "New artwork");

  return (
    <div className="bg-[#FCFBF8] border border-[#31323E]/10 rounded-[28px] shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-[#31323E]/8 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 flex-1 items-start gap-5">
            <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-2xl border border-[#31323E]/10 bg-[#31323E]/5">
              {editorPreviewUrl ? (
                <img
                  src={editorPreviewUrl}
                  alt={editorTitle}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#31323E]/35">
                  No image
                </div>
              )}
            </div>
            <div className="min-w-0 pt-1">
              <h3 className="text-xl font-bold text-[#31323E]">
                {editorTitle}
              </h3>
              <p className="text-sm font-medium text-[#31323E]/45 mt-1">
                {editingId
                  ? "Editing artwork details, gallery media, storefront settings, and print masters."
                  : "Create the artwork draft, then continue through media, storefront settings, and print masters."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#31323E]/45">
                {formData.show_in_gallery ? (
                  <span className="rounded-full bg-[#31323E]/6 px-2.5 py-1">
                    Gallery
                  </span>
                ) : null}
                {formData.show_in_shop ? (
                  <span className="rounded-full bg-[#31323E]/6 px-2.5 py-1">
                    Shop
                  </span>
                ) : null}
                {hasPrintOfferings(formData) ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    Print enabled
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          {headerReadiness ? (
            <div className="text-right">
              <StatusBadge
                status={headerReadiness.status}
                label={headerReadiness.message}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-10 px-8 py-8 bg-white/50">
        {notice ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {notice}
          </div>
        ) : null}
        <ArtworkBasicsForm
          formData={formData}
          setFormData={setFormData}
          aspectRatios={aspectRatios}
        />
        <ArtworkMediaForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          labels={labels}
          imageItems={imageItems}
          setImageItems={setImageItems}
          setCropImageIndex={setCropImageIndex}
        />
        <ArtworkOfferingsForm
          formData={formData}
          setFormData={setFormData}
          editingWhiteBorder={editingWhiteBorder}
          setEditingWhiteBorder={setEditingWhiteBorder}
          whiteBorderDraft={whiteBorderDraft}
          setWhiteBorderDraft={setWhiteBorderDraft}
        />
        <ArtworkPipelineForm
          formData={formData}
          editingId={editingId}
          workflowData={workflowData}
          workflowLoading={workflowLoading}
          workflowError={workflowError}
          assetUploadingSlot={assetUploadingSlot}
          assetUploadProgress={assetUploadProgress}
          uploadMasterAsset={onUploadMasterAsset}
          deleteMasterAsset={onDeleteMasterAsset}
        />
      </div>

      <div className="px-8 py-5 border-t border-[#31323E]/8 bg-[#FCFBF8] flex items-center justify-end gap-3 sticky bottom-0 z-20">
        <span className="text-xs font-semibold text-[#31323E]/45 mr-3">
          {editingId ? "Editing existing artwork" : "Creating new artwork"}
        </span>
        <button
          type="button"
          onClick={onResetEditor}
          className="px-5 py-2.5 rounded-xl border border-[#31323E]/15 bg-white text-[#31323E] text-sm font-bold uppercase tracking-[0.14em]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSaveArtwork}
          disabled={savingArtwork}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold uppercase tracking-[0.14em] shadow-sm hover:bg-emerald-600 disabled:opacity-50"
        >
          {savingArtwork ? "Saving..." : "Save Draft & Calculate Requirements"}
        </button>
      </div>
    </div>
  );
}
