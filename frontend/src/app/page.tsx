import { getHomeData } from "./_home/home.data";
import { HomeHero } from "./_home/HomeHero";
import {
  ArtistIntroSection,
  QuoteSection,
  RecentPaintingsSection,
} from "./_home/HomeSections";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings, featuredWorks } = await getHomeData();

  return (
    <>
      <HomeHero settings={settings} />
      <RecentPaintingsSection featuredWorks={featuredWorks} />
      <ArtistIntroSection settings={settings} />
      <QuoteSection />
    </>
  );
}
