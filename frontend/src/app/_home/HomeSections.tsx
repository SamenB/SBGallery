import Link from "next/link";
import { getImageUrl } from "@/utils";
import RecentPaintingsGrid from "@/components/RecentPaintingsGrid";
import type { HomeArtwork, HomeSettings } from "./home.types";

export function RecentPaintingsSection({
  featuredWorks,
}: {
  featuredWorks: HomeArtwork[];
}) {
  return (
    <section className="premium-texture-bg mx-auto max-w-full bg-[var(--color-cream)] px-8 py-[clamp(3rem,10vh,6rem)]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-sans text-[0.65rem] font-medium uppercase tracking-[0.15em] text-[var(--color-charcoal-mid)]">
              Selected Works
            </p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-normal italic text-[var(--color-charcoal)]">
              Recent Paintings
            </h2>
          </div>
          <Link
            href="/shop"
            className="home-section-link border-b pb-0.5 font-sans text-sm font-medium uppercase tracking-[0.1em] no-underline transition-colors"
          >
            View All Works -&gt;
          </Link>
        </div>
        <style>{`.recent-paintings-scroll{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:4rem 100px;align-items:start}.recent-paintings-spacer{display:none}@media(max-width:768px){.recent-paintings-scroll{display:flex!important;overflow-x:auto!important;scroll-snap-type:x mandatory!important;margin-left:-2rem!important;margin-right:-2rem!important;padding:1rem 0 .75rem!important;gap:1rem!important;scrollbar-width:none!important;align-items:center!important;scroll-padding:0 2rem!important}.recent-paintings-scroll::-webkit-scrollbar{display:none!important}.recent-paintings-item{flex:0 0 72%!important;scroll-snap-align:start!important}.recent-paintings-spacer{display:block!important;flex:0 0 2rem!important;width:2rem!important}}`}</style>
        <RecentPaintingsGrid works={featuredWorks} />
      </div>
    </section>
  );
}

export function ArtistIntroSection({ settings }: { settings: HomeSettings }) {
  return (
    <section className="border-t border-[rgba(26,26,24,0.06)] bg-[var(--color-cream)] px-8 py-32">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-20">
        <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[2px] bg-[linear-gradient(135deg,rgba(26,26,24,0.03),rgba(26,26,24,0.08))] font-serif text-base italic text-[var(--color-muted)]">
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
        <div>
          <p className="mb-4 font-sans text-[0.65rem] font-medium uppercase tracking-[0.15em] text-[var(--color-charcoal-mid)]">
            The Artist
          </p>
          <h2 className="mb-8 font-serif text-[clamp(2rem,4vw,3.5rem)] font-normal italic leading-[1.1] text-[var(--color-charcoal)]">
            Painting the world <br /> as I feel it
          </h2>
          <p className="mb-12 max-w-[480px] font-sans text-base font-light leading-[1.8] text-[var(--color-charcoal-mid)]">
            {settings.about_text || ""}
          </p>
          <Link
            href="/about"
            className="home-about-link border-b pb-1 font-sans text-xs font-normal uppercase tracking-[0.15em] no-underline transition-colors"
          >
            Read My Story
          </Link>
        </div>
      </div>
    </section>
  );
}

export function QuoteSection() {
  return (
    <section className="bg-[var(--color-cream)] px-8 py-24 text-center">
      <blockquote className="mx-auto max-w-[700px]">
        <p className="mb-6 font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] font-normal italic leading-[1.5] text-[var(--color-charcoal)]">
          &ldquo;I paint not what I see, but what I feel when I look.&rdquo;
        </p>
        <cite className="font-sans text-xs not-italic font-normal uppercase tracking-[0.15em] text-[var(--color-charcoal-mid)]">
          - The Artist
        </cite>
      </blockquote>
    </section>
  );
}
