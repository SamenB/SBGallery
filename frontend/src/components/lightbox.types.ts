export interface LightboxArtwork {
  id: number;
  slug?: string;
  title: string;
  medium: string;
  size: string;
  original_status: string;
  description?: string;
  images?: (
    | string
    | { thumb?: string; medium?: string; large?: string; original?: string }
  )[];
  gradientFrom?: string;
  gradientTo?: string;
}

export interface Point {
  x: number;
  y: number;
}
