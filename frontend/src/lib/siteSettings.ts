import { getApiUrl } from "@/utils";

export const EMPTY_SITE_COPY = "Content coming soon.";

export interface SiteSettings {
  about_text?: string | null;
  artist_home_heading?: string | null;
  artist_home_quote?: string | null;
  about_page_eyebrow?: string | null;
  about_page_title?: string | null;
  about_section_title?: string | null;
  about_secondary_text?: string | null;
  about_philosophy_title?: string | null;
  about_philosophy_text?: string | null;
  about_exhibitions_title?: string | null;
  about_exhibitions_text?: string | null;
  contact_email?: string | null;
  social_instagram?: string | null;
  social_telegram?: string | null;
  social_threads?: string | null;
  studio_address?: string | null;
  footer_text_discover?: string | null;
  footer_text_services?: string | null;
  footer_text_circle?: string | null;
  shipping_page_text?: string | null;
  faq_page_text?: string | null;
  terms_page_text?: string | null;
  privacy_page_text?: string | null;
  artist_home_photo_url?: string | null;
  artist_about_photo_url?: string | null;
  main_bg_desktop_url?: string | null;
  main_bg_mobile_url?: string | null;
}

export type SiteCopyField =
  | "shipping_page_text"
  | "faq_page_text"
  | "terms_page_text"
  | "privacy_page_text";

export function cleanSetting(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function settingText(
  value: string | null | undefined,
  fallback = EMPTY_SITE_COPY,
): string {
  return cleanSetting(value) || fallback;
}

export function stripLeadingHeading(value: string, headings: string[]): string {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  let index = 0;
  while (index < lines.length && !lines[index].trim()) {
    index += 1;
  }

  if (
    index < lines.length &&
    headings.some(
      (heading) => lines[index].trim().toLowerCase() === heading.toLowerCase(),
    )
  ) {
    return lines.slice(index + 1).join("\n").trim();
  }

  return value.trim();
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const response = await fetch(`${getApiUrl()}/settings`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as SiteSettings;
  } catch {
    return null;
  }
}

export function excerpt(value: string, maxLength = 160): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, maxLength - 1).trimEnd()}...`;
}
