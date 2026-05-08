"use client";

import Lightbox from "@/components/Lightbox";
import { getImageUrl } from "@/utils";
import { useArtworkDetailPage } from "../hooks/useArtworkDetailPage";
import { ArtworkDetailNav } from "./ArtworkDetailNav";
import { ArtworkDetailStyles } from "./ArtworkDetailStyles";
import { ArtworkDetailsSection } from "./ArtworkDetailsSection";
import { ArtworkImageGallery } from "./ArtworkImageGallery";
import { ArtworkMobileTitle } from "./ArtworkMobileTitle";
import { ArtworkPurchasePanel } from "./ArtworkPurchasePanel";
import { ArtworkPurchaseStyles } from "./ArtworkPurchaseStyles";
import { AuthPromptModal } from "./AuthPromptModal";

export function ArtworkDetailPageContent() {
  const page = useArtworkDetailPage();

  if (page.loading) {
    return <div className="page-center-state">Loading artwork...</div>;
  }

  if (!page.work) {
    return <div className="page-center-state">Artwork not found.</div>;
  }

  return (
    <div className="w-full relative" style={{ maxWidth: "100%", overflowX: "clip" }}>
      <ArtworkDetailStyles />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 2rem 6rem" }}>
        {page.images.length > 0 && (
          <link
            rel="preload"
            as="image"
            href={getImageUrl(page.images[page.selectedImageIndex], "medium")}
          />
        )}
        <ArtworkDetailNav
          prevSlug={page.prevSlug}
          nextSlug={page.nextSlug}
          isMobile={page.layoutMetrics.winW < 768}
        />
        <ArtworkMobileTitle
          title={page.work.title}
          liked={page.effectiveLiked}
          animating={page.likeAnimating}
          onToggleLike={page.toggleLike}
        />
        <div
          className={`grid grid-cols-1 items-start gap-12 lg:gap-16 ${
            page.work.orientation === "horizontal"
              ? "md:grid-cols-2"
              : "md:grid-cols-[1.25fr_1fr]"
          }`}
        >
          <ArtworkImageGallery
            work={page.work}
            images={page.images}
            selectedImageIndex={page.selectedImageIndex}
            onSelectedImageIndexChange={page.setSelectedImageIndex}
            layoutMetrics={page.layoutMetrics}
            imageAspectRatios={page.imageAspectRatios}
            boxRef={page.boxRef}
            imageFrameRef={page.imageFrameRef}
            swipeRef={page.swipeRef}
            hasTouchRef={page.hasTouchRef}
            zoomPos={page.zoomPos}
            isZooming={page.isZooming}
            setIsZooming={page.setIsZooming}
            onPointerMove={page.handlePointerMove}
            onImageDimensions={page.handleImageDimensions}
            onOpenFullSize={() => page.setFullSizeOpen(true)}
          />
          <ArtworkPurchaseStyles />
          <ArtworkPurchasePanel
            work={page.work}
            layoutMetrics={page.layoutMetrics}
            effectiveLiked={page.effectiveLiked}
            setLiked={page.setLiked}
            user={page.user}
            addPendingLike={page.addPendingLike}
            removePendingLike={page.removePendingLike}
            incrementUnauthLikeCount={page.incrementUnauthLikeCount}
            unauthLikeCount={page.unauthLikeCount}
            setShowAuthPrompt={page.setShowAuthPrompt}
            resolvedPurchaseType={page.resolvedPurchaseType}
            hasCanvasOffers={page.hasCanvasOffers}
            hasPaperOffers={page.hasPaperOffers}
            updateRouteState={page.updateRouteState}
            activeCountryCode={page.activeCountryCode}
            convertPrice={page.convertPrice}
            addItem={page.addItem}
            units={page.units}
            storefront={page.storefront}
            storefrontLoading={page.storefrontLoading}
            storefrontError={page.storefrontError}
          />
        </div>
        <ArtworkDetailsSection work={page.work} layoutMetrics={page.layoutMetrics} />
        {page.fullSizeOpen && (
          <Lightbox
            works={[page.work]}
            startImageIndex={page.selectedImageIndex}
            onClose={() => page.setFullSizeOpen(false)}
          />
        )}
        <AuthPromptModal
          isOpen={page.showAuthPrompt}
          onClose={() => page.setShowAuthPrompt(false)}
        />
      </div>
    </div>
  );
}
