export type OriginalStatus =
  | "available"
  | "sold"
  | "reserved"
  | "not_for_sale"
  | "on_exhibition"
  | "archived"
  | "digital";

export interface HomeArtwork {
  id: number;
  slug?: string;
  title: string;
  description: string;
  medium: string;
  size: string;
  orientation?: string;
  original_price: number;
  original_status: OriginalStatus;
  has_prints?: boolean;
  base_print_price?: number;
  images?: (
    | string
    | { thumb?: string; medium?: string; large?: string; original?: string }
  )[];
  gradientFrom?: string;
  gradientTo?: string;
}

export interface HomeSettings {
  main_bg_desktop_url?: string | null;
  main_bg_mobile_url?: string | null;
  artist_home_photo_url?: string | null;
  about_text?: string | null;
}

export type HomeArtworkPayload =
  | HomeArtwork[]
  | { items?: HomeArtwork[]; data?: HomeArtwork[] };
