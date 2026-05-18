"use client";

import Lightbox from "@/components/Lightbox";
import { useGalleryPage } from "../hooks/useGalleryPage";
import { toLightboxWorks } from "../utils";
import { GalleryAuthPrompt } from "./GalleryAuthPrompt";
import { GallerySections } from "./GallerySections";
import { GalleryToolbar } from "./GalleryToolbar";

export function GalleryPageContent() {
  const gallery = useGalleryPage();

  if (gallery.loading) {
    return (
      <div className="page-center-state">
        Loading archive...
      </div>
    );
  }

  if (gallery.error) {
    return <div className="page-center-state">{gallery.error}</div>;
  }

  return (
    <div style={{ overflowX: "clip", maxWidth: "100vw", width: "100%" }}>
      {gallery.lightbox && (
        <Lightbox
          works={toLightboxWorks(gallery.lightbox.works)}
          startWorkIndex={gallery.lightbox.index}
          onClose={() => gallery.setLightbox(null)}
        />
      )}
      <GalleryToolbar
        artworkCount={gallery.allArtworks.length}
        groupBy={gallery.groupBy}
        onGroupByChange={gallery.setGroupBy}
        sortKey={gallery.sortKey}
        onSortKeyChange={gallery.setSortKey}
        gridMode={gallery.gridMode}
        onGridModeChange={gallery.handleSetGridMode}
        isMobile={gallery.isMobile}
      />
      <GallerySections
        groups={gallery.visibleGroups}
        gridMode={gallery.gridMode}
        imageZone={gallery.imageZone}
        isMobile={gallery.isMobile}
        gridColumns={gallery.gridColumns}
        gridGap={gallery.gridGap}
        likedIds={gallery.effectiveLikedIds}
        visibleCount={gallery.visibleCount}
        totalCount={gallery.allArtworks.length}
        loadMoreRef={gallery.loadMoreRef}
        onOpenLightbox={(works, index) => gallery.setLightbox({ works, index })}
        onLike={gallery.handleLike}
        onAuthRequired={gallery.handleAuthRequired}
        onNaturalAspectRatio={gallery.handleNaturalAspectRatio}
        onContainerWidthChange={gallery.handleContainerWidthChange}
        getRowAspectRatioRange={gallery.getRowAspectRatioRange}
        getRowImageStageHeight={gallery.getRowImageStageHeight}
      />
      <GalleryAuthPrompt
        isOpen={gallery.showAuthPrompt}
        onClose={() => gallery.setShowAuthPrompt(false)}
      />
    </div>
  );
}
