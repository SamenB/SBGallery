/**
 * Root Layout for the ArtShop frontend.
 * This server component serves as the global application shell,
 * providing the HTML structure, global navigation, and context providers.
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientProviders from "@/components/ClientProviders";
import CartDrawer from "@/components/CartDrawer";
import ImagePreloader from "@/components/ImagePreloader";
import {
  EMPTY_SITE_COPY,
  cleanSetting,
  excerpt,
  fetchSiteSettings,
  stripLeadingHeading,
} from "@/lib/siteSettings";

/**
 * Global SEO metadata uses the same editable settings as the public pages.
 * This keeps crawlers from receiving obsolete hardcoded artist copy.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const aboutBody = stripLeadingHeading(cleanSetting(settings?.about_text), [
    "About the Artist",
  ]);
  const descriptionSource =
    aboutBody ||
    cleanSetting(settings?.artist_home_quote) ||
    EMPTY_SITE_COPY;
  const description = excerpt(descriptionSource);

  return {
    title: {
      template: "%s | Samen Bondarenko Gallery",
      default: "Samen Bondarenko Gallery - Original Paintings & Fine Art Prints",
    },
    description,
    keywords: [
      "art",
      "painter",
      "gallery",
      "original paintings",
      "fine art prints",
      "collection",
    ],
    openGraph: {
      type: "website",
      siteName: "Samen Bondarenko Gallery",
      locale: "en_US",
      description,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProviders>
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
            <CartDrawer />
            <ImagePreloader />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
