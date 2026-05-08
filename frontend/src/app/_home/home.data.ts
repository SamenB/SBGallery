import { getApiUrl } from "@/utils";
import type {
  HomeArtwork,
  HomeArtworkPayload,
  HomeSettings,
} from "./home.types";

const DEFAULT_GRADIENTS = [
  ["#6A9FB5", "#3A6E85"],
  ["#2A5F7A", "#1A3A55"],
  ["#8A7AB5", "#4A5A8A"],
  ["#5A8A8A", "#2A5A5A"],
  ["#D4905A", "#8A5030"],
];

export async function getHomeData() {
  const [settings, featuredWorks] = await Promise.all([
    fetchSettings(),
    fetchFeaturedWorks(),
  ]);
  return { settings, featuredWorks };
}

async function fetchSettings(): Promise<HomeSettings> {
  const response = await fetch(`${getApiUrl()}/settings`, {
    next: { revalidate: 60 },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch settings: ${response.status}`);
  return (await response.json()) as HomeSettings;
}

async function fetchFeaturedWorks(): Promise<HomeArtwork[]> {
  const response = await fetch(`${getApiUrl()}/artworks?limit=3`, {
    next: { revalidate: 60 },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch artworks: ${response.status}`);
  const payload = (await response.json()) as HomeArtworkPayload;
  const items = Array.isArray(payload)
    ? payload
    : payload.items || payload.data || [];
  return items.map((item, index) => ({
    ...item,
    gradientFrom: DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length][0],
    gradientTo: DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length][1],
  }));
}
