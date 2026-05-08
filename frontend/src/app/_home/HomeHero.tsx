import Link from "next/link";
import { getImageUrl } from "@/utils";
import type { HomeSettings } from "./home.types";

export function HomeHero({ settings }: { settings: HomeSettings }) {
  const backgroundUrl =
    settings.main_bg_desktop_url || settings.main_bg_mobile_url;

  return (
    <section
      className="relative flex flex-col items-center justify-start overflow-hidden pt-[clamp(2rem,10vh,5rem)]"
      style={{ height: "calc(100vh - clamp(63px, 42px + 2vw, 117px))" }}
    >
      {backgroundUrl ? (
        <picture>
          {settings.main_bg_mobile_url ? (
            <source
              media="(max-width: 768px)"
              srcSet={getImageUrl(settings.main_bg_mobile_url, "medium")}
            />
          ) : null}
          <img
            src={getImageUrl(backgroundUrl, "original")}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(135deg,#0A1A1C_0%,#1A3638_40%,#254D4F_70%,#0A1A1C_100%)]"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(160,210,200,0.1)_0%,transparent_65%)]"
      />

      <div className="relative z-[2] flex w-full flex-col items-center gap-[clamp(1.5rem,3vh,2.5rem)] px-8">
        <div className="max-w-[900px] text-center">
          <div className="animate-fade-up mb-2 [animation-delay:0.15s] [animation-fill-mode:forwards]">
            <p className="font-serif text-[clamp(1.5rem,3.2vw,2.5rem)] font-normal italic leading-[1.6] tracking-[0.06em] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.5)]">
              Original Paintings &amp; Fine Art Prints
            </p>
          </div>
          <div className="animate-fade-up mx-auto mt-4 max-w-[600px] [animation-delay:0.3s] [animation-fill-mode:forwards]">
            <p className="font-sans text-[clamp(0.95rem,1.5vw,1.2rem)] font-normal leading-[1.8] tracking-[0.05em] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.5)]">
              Discover a collection of original works painted with passion. Each
              piece is a story waiting to hang on your wall.
            </p>
          </div>
        </div>

        <div className="animate-fade-up flex justify-center gap-8 whitespace-nowrap [animation-delay:0.5s] [animation-fill-mode:forwards]">
          <Link
            href="/gallery"
            className="hero-link border-b pb-1 font-sans text-xs font-normal uppercase tracking-[0.15em] no-underline transition-colors"
          >
            Explore Gallery
          </Link>
          <Link
            href="/shop"
            className="hero-shop-link border-b pb-1 font-sans text-xs font-light uppercase tracking-[0.15em] no-underline transition-colors"
          >
            Shop Prints
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-sans text-[0.7rem] uppercase tracking-[0.15em] text-[rgba(250,250,247,0.4)]">
        <span>Scroll</span>
        <span className="block h-10 w-px animate-[scrollPulse_1.5s_ease-in-out_infinite] bg-[rgba(200,150,90,0.5)]" />
      </div>
    </section>
  );
}
