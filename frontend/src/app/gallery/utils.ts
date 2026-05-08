import { DEFAULT_GRADIENTS } from "./constants";
import {
  Artwork,
  GalleryGridMode,
  GalleryGroup,
  GalleryGroupBy,
  SortKey,
} from "./types";
import type { LightboxArtwork } from "@/components/lightbox.types";

export const sortWorks = (works: Artwork[], key: SortKey): Artwork[] => {
  const c = [...works];
  if (key === "year") c.sort((a, b) => b.id - a.id);
  if (key === "title") c.sort((a, b) => a.title.localeCompare(b.title));
  if (key === "available") {
    c.sort(
      (a, b) =>
        (a.original_status === "available" ? 0 : 1) -
        (b.original_status === "available" ? 0 : 1),
    );
  }
  return c;
};

export const mapGalleryArtwork = (item: Artwork, idx: number): Artwork => ({
  ...item,
  gradientFrom: DEFAULT_GRADIENTS[idx % DEFAULT_GRADIENTS.length][0],
  gradientTo: DEFAULT_GRADIENTS[idx % DEFAULT_GRADIENTS.length][1],
});

const getGroupName = (
  artwork: Artwork,
  groupBy: GalleryGroupBy,
): { name: string; id?: number } => {
  if (groupBy === "collection") {
    const label = artwork.labels?.find(
      (l) => l.category?.title === "Collections" || l.category_id === 3,
    );
    return {
      name: label?.title || "Original Paintings",
      id: label?.id,
    };
  }

  if (groupBy === "year") {
    if (artwork.year) return { name: String(artwork.year) };
    if (artwork.created_at) {
      return { name: new Date(artwork.created_at).getFullYear().toString() };
    }
    const slugYear = artwork.slug?.match(/(?:19|20)\d{2}/)?.[0];
    return { name: slugYear || "Unknown Year" };
  }

  const firstLabel = artwork.labels?.[0];
  const rawName = firstLabel?.title || artwork.medium || artwork.style || "Other";
  return {
    name: rawName === "Other" ? rawName : rawName.charAt(0).toUpperCase() + rawName.slice(1),
  };
};

export const groupGalleryWorks = (
  artworks: Artwork[],
  groupBy: GalleryGroupBy,
): Record<string, { id?: number; works: Artwork[] }> => {
  return artworks.reduce<Record<string, { id?: number; works: Artwork[] }>>(
    (acc, artwork) => {
      const group = getGroupName(artwork, groupBy);
      if (!acc[group.name]) acc[group.name] = { id: group.id, works: [] };
      acc[group.name].works.push(artwork);
      return acc;
    },
    {},
  );
};

export const getVisibleGalleryGroups = (
  artworks: Artwork[],
  groupBy: GalleryGroupBy,
  sortKey: SortKey,
  visibleCount: number,
): GalleryGroup[] => {
  const groups = Object.entries(groupGalleryWorks(artworks, groupBy)).map(
    ([name, data]) => ({
      name,
      id: data.id,
      works: sortWorks(data.works, sortKey),
    }),
  );

  if (groupBy === "year") {
    groups.sort((a, b) => {
      if (a.name === "Unknown Year") return 1;
      if (b.name === "Unknown Year") return -1;
      return (parseInt(b.name) || 0) - (parseInt(a.name) || 0);
    });
  } else if (groupBy === "medium") {
    groups.sort((a, b) => a.name.localeCompare(b.name));
  }

  let remaining = visibleCount;
  return groups
    .map((group) => {
      const works = remaining > 0 ? group.works.slice(0, remaining) : [];
      remaining -= works.length;
      return {
        name: group.name,
        id: group.id,
        works,
        totalInGroup: group.works.length,
      };
    })
    .filter((group) => group.works.length > 0);
};

export const getGalleryColumnCount = (
  gridMode: GalleryGridMode,
  isMobile: boolean,
  isPhone: boolean,
): number => {
  if (isMobile) {
    if (isPhone) return gridMode === "1" ? 1 : gridMode === "2" ? 2 : 3;
    return gridMode === "1" ? 2 : gridMode === "2" ? 3 : 4;
  }
  return gridMode === "1" ? 2 : gridMode === "2" ? 3 : 4;
};

export const getGalleryGridColumns = (columnCount: number): string =>
  columnCount === 1 ? "1fr" : `repeat(${columnCount}, 1fr)`;

export const getGalleryGridGap = (
  gridMode: GalleryGridMode,
  isMobile: boolean,
): string => {
  if (isMobile) {
    if (gridMode === "1") return "1rem 1rem";
    if (gridMode === "2") return "0.5rem 1.25rem";
    return "0.25rem 0.5rem";
  }
  if (gridMode === "1") return "1.25rem 24px";
  if (gridMode === "2") return "0.9rem 16px";
  return "0.65rem 10px";
};

export const toLightboxWorks = (works: Artwork[]): LightboxArtwork[] =>
  works.map((work) => ({
    ...work,
    medium: work.medium || "",
    original_status: work.original_status,
  }));
