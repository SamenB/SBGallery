import Link from "next/link";
import { getImageUrl } from "@/utils";
import RecentPaintingsGrid from "@/components/RecentPaintingsGrid";
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
    <section className="premium-texture-bg mx-auto max-w-full bg-[var(--color-cream)] px-8 py-[clamp(3rem,10vh,6rem)]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-1">
          <p className="mb-2 font-sans text-[0.65rem] font-medium uppercase tracking-[0.15em] text-[var(--color-charcoal-mid)]">
            Selected Works
          </p>
          <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-normal italic text-[var(--color-charcoal)]">
            Recent Artworks
          </h2>
        </div>
        <style>{`@media(max-width:768px){.recent-paintings-scroll{display:flex!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x mandatory!important;margin-left:-1.25rem!important;margin-right:-1.25rem!important;padding:0.25rem 0!important;gap:1rem!important;scrollbar-width:none!important;align-items:center!important;scroll-padding:0 1.25rem!important}.recent-paintings-scroll::-webkit-scrollbar{display:none!important}.recent-paintings-item{flex:0 0 75%!important;scroll-snap-align:start!important}.recent-paintings-spacer{display:block!important;flex:0 0 1.25rem!important;width:1.25rem!important}}`}</style>
        <RecentPaintingsGrid works={featuredWorks} />
        <div className="mt-3 text-center md:mt-10 md:text-right">
          <Link
            href="/shop"
            className="text-shine border-shine border-b pb-0.5 font-sans text-sm font-medium uppercase tracking-[0.1em] text-[var(--color-charcoal)] no-underline transition-colors hover:text-[var(--color-charcoal-mid)]"
          >
            View All Artworks -&gt;
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ArtistIntroSection({ settings }: { settings: HomeSettings }) {
  const artistHeading = settings.artist_home_heading?.trim() || "The Artist";
  const artistQuote =
    settings.artist_home_quote?.trim() ||
    "I paint not what I see, but what I feel when I look.";

  return (
    <section className="bg-[var(--color-cream)] px-8 py-16 md:py-32">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 md:grid md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] md:items-center md:gap-20">
        
        {/* Mobile Heading */}
        <div className="order-1 md:hidden">
          <p className="font-sans text-[clamp(0.85rem,1.2vw,1rem)] font-normal uppercase tracking-[0.16em] text-[var(--color-charcoal-mid)]">
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
            "Artist Photo"
          )}
        </div>

        {/* Text Content */}
        <div className="order-3 flex flex-col md:order-2">
          <p className="mb-4 hidden font-sans text-[clamp(0.85rem,1.2vw,1rem)] font-normal uppercase tracking-[0.16em] text-[var(--color-charcoal-mid)] md:block">
            {artistHeading}
          </p>
          <blockquote className="mb-12 max-w-[540px]">
            <p className="font-serif text-[clamp(1.4rem,5.6vw,1.8rem)] font-normal italic leading-relaxed text-[var(--color-charcoal)] md:text-[clamp(1.8rem,3vw,2.6rem)]">
              &ldquo;{artistQuote}&rdquo;
            </p>
          </blockquote>
          <div className="text-right">
            <Link
              href="/about"
              className="text-shine border-shine border-b pb-1 font-sans text-xs font-normal uppercase tracking-[0.15em] text-[var(--color-charcoal)] no-underline transition-colors hover:text-[var(--color-charcoal-mid)]"
            >
              Read My Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

