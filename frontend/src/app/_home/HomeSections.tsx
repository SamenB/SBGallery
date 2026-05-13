import Link from "next/link";
import { getImageUrl } from "@/utils";
import RecentPaintingsGrid from "@/components/RecentPaintingsGrid";
import { EMPTY_SITE_COPY, settingText } from "@/lib/siteSettings";
import type { HomeArtwork, HomeSettings } from "./home.types";

export function HomeSectionDivider() {
  return (
    <div aria-hidden="true" className="bg-[var(--color-cream)] px-8">
      <div className="mx-auto h-px max-w-[1280px] bg-[rgba(17,17,17,0.22)]" />
    </div>
  );
}

export function RecentPaintingsSection({
  featuredWorks,
}: {
  featuredWorks: HomeArtwork[];
}) {
  return (
    <section className="premium-texture-bg mx-auto max-w-full bg-[var(--color-cream)] px-5 py-[clamp(2.15rem,7vh,4.5rem)] md:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-3 md:mb-4">
          <h2 className="font-serif text-[clamp(1.75rem,3.6vw,2.65rem)] font-normal leading-tight tracking-[0.01em] text-[var(--color-charcoal-mid)]">
            Recent Artworks
          </h2>
        </div>
        <style>{`@media(max-width:768px){.recent-paintings-scroll{display:flex!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x mandatory!important;margin-left:-1rem!important;margin-right:-1rem!important;margin-top:-1.25rem!important;margin-bottom:-1.25rem!important;padding:1.5rem 0!important;gap:0.7rem!important;scrollbar-width:none!important;align-items:flex-start!important;scroll-padding:0 1rem!important}.recent-paintings-scroll::-webkit-scrollbar{display:none!important}.recent-paintings-item{flex:0 0 78%!important;scroll-snap-align:start!important}.recent-paintings-spacer{display:block!important;flex:0 0 1rem!important;width:1rem!important}}`}</style>
        <RecentPaintingsGrid works={featuredWorks} />
        <div className="mt-3 text-center md:mt-10 md:text-right">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border-b border-[rgba(17,17,17,0.42)] pb-0.5 font-sans text-[0.82rem] font-medium uppercase tracking-[0.12em] text-[var(--color-charcoal)] no-underline transition-colors hover:text-[var(--color-charcoal-mid)]"
          >
            <span>View All Artworks</span>
            <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ArtistIntroSection({ settings }: { settings: HomeSettings }) {
  const artistHeading = settingText(settings.artist_home_heading, "About the Artist");
  const artistQuote = settingText(settings.artist_home_quote);

  return (
    <section className="bg-[var(--color-cream)] px-5 py-14 md:px-8 md:py-28">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:grid md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] md:items-center md:gap-16">
        
        {/* Mobile Heading */}
        <div className="order-1 md:hidden">
          <p className="font-sans text-[0.86rem] font-normal uppercase tracking-[0.14em] text-[var(--color-charcoal-mid)]">
            {artistHeading}
          </p>
        </div>

        {/* Photo */}
        <div className="order-2 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[12px] bg-[linear-gradient(135deg,rgba(26,26,24,0.03),rgba(26,26,24,0.08))] font-serif text-base italic text-[var(--color-muted)] md:order-1" style={{ boxShadow: "2px 10px 28px rgba(28,25,22,0.48), 0 3px 8px rgba(28,25,22,0.25)" }}>
          {settings.artist_home_photo_url ? (
            <img
              src={getImageUrl(settings.artist_home_photo_url, "original")}
              alt="Samen Bondarenko"
              className="h-full w-full object-cover"
            />
          ) : (
            EMPTY_SITE_COPY
          )}
        </div>

        {/* Text Content */}
        <div className="order-3 flex flex-col md:order-2">
          <p className="mb-4 hidden font-sans text-[0.9rem] font-normal uppercase tracking-[0.14em] text-[var(--color-charcoal-mid)] md:block">
            {artistHeading}
          </p>
          <blockquote className="mb-8 max-w-[540px] md:mb-10">
            <p className="font-serif text-[clamp(1.35rem,5.2vw,1.7rem)] font-normal italic leading-relaxed text-[var(--color-charcoal)] md:text-[clamp(1.75rem,2.8vw,2.35rem)]">
              &ldquo;{artistQuote}&rdquo;
            </p>
          </blockquote>
          <div className="text-right">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border-b border-[rgba(17,17,17,0.42)] pb-1 font-sans text-xs font-normal uppercase tracking-[0.15em] text-[var(--color-charcoal)] no-underline transition-colors hover:text-[var(--color-charcoal-mid)]"
            >
              <span>Read My Story</span>
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
