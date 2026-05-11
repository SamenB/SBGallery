import { getHomeData } from "./_home/home.data";
import { HomeHero } from "./_home/HomeHero";
import {
  ArtistIntroSection,
  HomeSectionDivider,
  RecentPaintingsSection,
} from "./_home/HomeSections";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings, featuredWorks } = await getHomeData();

  return (
    <>
      <HomeHero settings={settings} />
      <HomeSectionDivider />
      <RecentPaintingsSection featuredWorks={featuredWorks} />
      <HomeSectionDivider />
      <ArtistIntroSection settings={settings} />
    </>
  );
}
