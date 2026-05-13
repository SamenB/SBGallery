import { fetchSiteSettings } from "@/lib/siteSettings";
import FooterClient from "./FooterClient";

export default async function Footer() {
  const settings = await fetchSiteSettings();

  return <FooterClient initialSettings={settings} />;
}
