import Link from "next/link";
import { getImageUrl } from "@/utils";
import type { HomeSettings } from "./home.types";

const HERO_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About the Artist" },
];

export function HomeHero({ settings }: { settings: HomeSettings }) {
  const backgroundUrl =
    settings.main_bg_desktop_url || settings.main_bg_mobile_url;

  return (
    <section
      className="home-hero relative flex flex-col items-center justify-start overflow-hidden pt-[clamp(1rem,5vh,2.5rem)] md:pt-[clamp(2rem,10vh,5rem)]"
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
            className="absolute inset-0 h-full w-full object-cover object-left-bottom md:object-center"
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

      <div className="relative z-[2] flex h-full w-full flex-col items-center gap-[clamp(1.5rem,3vh,2.5rem)] px-8">
        <div className="animate-fade-up absolute left-1/2 bottom-[20%] flex -translate-x-1/2 flex-col items-center gap-4 whitespace-nowrap px-8 scale-[0.7] md:scale-[0.8] [animation-delay:0.5s] [animation-fill-mode:forwards]">
          {HERO_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="home-hero-text-link"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-[rgba(250,250,247,0.68)] [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]">
        <span>Scroll</span>
        <span className="block h-12 w-px animate-[scrollPulse_1.5s_ease-in-out_infinite] bg-[rgba(255,255,255,0.72)]" />
      </div>
    </section>
  );
}
