"use client";

import SimpleArtworkCropperModal from "./SimpleArtworkCropperModal";
import { ArtworkAdminHeader, ArtworkNotice } from "./artworks/ArtworkAdminHeader";
import { ArtworkEditorShell } from "./artworks/ArtworkEditorShell";
import { ArtworkGrid } from "./artworks/ArtworkGrid";
import { ArtworkShopOrderGrid } from "./artworks/ArtworkShopOrderGrid";
import { useArtworkAdmin } from "./artworks/useArtworkAdmin";

export default function ArtworksTab() {
  const admin = useArtworkAdmin();

  if (admin.loading) {
    return (
      <div className="flex items-center gap-3 py-10">
        <div className="w-5 h-5 border-2 border-[#31323E]/20 border-t-[#31323E] rounded-full animate-spin" />
        <span className="text-sm font-semibold text-[#31323E]/50 uppercase tracking-[0.14em]">Loading artworks</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[#31323E]">
      <ArtworkAdminHeader
        artworkCount={admin.artworks.length}
        isFormOpen={admin.isFormOpen}
        isOrderingShop={admin.isOrderingShop}
        payloadRefreshLoading={admin.payloadRefreshLoading}
        onRefreshPayloads={() => void admin.refreshArtworkPayloads()}
        onToggleShopOrder={admin.toggleShopOrder}
        onToggleEditor={admin.isFormOpen ? admin.resetEditor : admin.openNewEditor}
      />

      <ArtworkNotice message={admin.payloadRefreshMessage} tone="success" />
      <ArtworkNotice message={admin.payloadRefreshError} tone="error" />

      {admin.isOrderingShop ? (
        <ArtworkShopOrderGrid
          artworks={admin.shopOrderDraft}
          saving={admin.savingShopOrder}
          dirty={admin.shopOrderDirty}
          message={admin.shopOrderMessage}
          error={admin.shopOrderError}
          onReorder={admin.setShopOrderDraft}
          onSave={() => void admin.saveShopOrder()}
          onCancel={admin.closeShopOrder}
        />
      ) : admin.isFormOpen ? (
        <ArtworkEditorShell
          formData={admin.formData}
          setFormData={admin.setFormData}
          aspectRatios={admin.aspectRatios}
          categories={admin.categories}
          labels={admin.labels}
          imageItems={admin.imageItems}
          setImageItems={admin.setImageItems}
          setCropImageIndex={admin.setCropImageIndex}
          editingWhiteBorder={admin.editingWhiteBorder}
          setEditingWhiteBorder={admin.setEditingWhiteBorder}
          whiteBorderDraft={admin.whiteBorderDraft}
          setWhiteBorderDraft={admin.setWhiteBorderDraft}
          editingId={admin.editingId}
          workflowData={admin.workflowData}
          workflowLoading={admin.workflowLoading}
          workflowError={admin.workflowError}
          assetUploadingSlot={admin.assetUploadingSlot}
          assetUploadProgress={admin.assetUploadProgress}
          notice={admin.notice}
          savingArtwork={admin.savingArtwork}
          headerReadiness={admin.headerReadiness}
          onResetEditor={admin.resetEditor}
          onSaveArtwork={() => void admin.saveArtwork()}
          onUploadMasterAsset={admin.uploadMasterAsset}
          onDeleteMasterAsset={admin.deleteMasterAsset}
        />
      ) : null}

      {!admin.isOrderingShop ? (
        <ArtworkGrid artworks={admin.artworks} readinessRefreshing={admin.readinessRefreshing} handleEditClick={admin.handleEditClick} handleDelete={admin.handleDelete} />
      ) : null}
      <SimpleArtworkCropperModal isOpen={admin.cropImageIndex !== null} imageSrc={admin.cropImageIndex !== null ? admin.imageItems[admin.cropImageIndex]?.url || "" : ""} onClose={() => admin.setCropImageIndex(null)} onSaveCrop={admin.handleSaveCrop} />
    </div>
  );
}
