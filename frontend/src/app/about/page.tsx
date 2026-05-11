"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiJson, getApiUrl, getImageUrl } from "@/utils";

interface AboutSettings {
  about_text?: string | null;
  about_page_eyebrow?: string | null;
  about_page_title?: string | null;
  about_section_title?: string | null;
  about_secondary_text?: string | null;
  about_philosophy_title?: string | null;
  about_philosophy_text?: string | null;
  about_exhibitions_title?: string | null;
  about_exhibitions_text?: string | null;
  artist_about_photo_url?: string | null;
}

const DEFAULT_ABOUT_TEXT =
  "Based on the belief that art is a bridge between the seen and the felt, my work focuses on the subtle interplay of light and texture. Born from a fascination with the natural world, each painting is an exploration of memory and atmosphere.";
const DEFAULT_SECONDARY_TEXT =
  "I work primarily with oils, enjoying the slow pace and depth that the medium allows. My process is intuitive, often starting with a singular emotion or a specific quality of light observed at dawn or dusk.";
const DEFAULT_PHILOSOPHY_TEXT =
  "I don't believe in perfection. I believe in the honest mark - the visible brushstroke that tells the story of its creation. My goal is not to replicate reality, but to invite the viewer into a space where they can find their own reflections.";

function settingText(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    apiFetch(`${getApiUrl()}/settings`)
      .then((res) => apiJson<AboutSettings>(res))
      .then((data) => {
        setSettings(data);
        setImgError(false);
      })
      .catch(() => console.warn("Backend unavailable"));
  }, []);

  const eyebrow = settingText(settings?.about_page_eyebrow, "About the Artist");
  const sectionTitle = settingText(settings?.about_section_title, "The Journey");
  const aboutText = settingText(settings?.about_text, DEFAULT_ABOUT_TEXT);
  const secondaryText = settingText(
    settings?.about_secondary_text,
    DEFAULT_SECONDARY_TEXT,
  );
  const philosophyTitle = settingText(
    settings?.about_philosophy_title,
    "Philosophy",
  );
  const philosophyText = settingText(
    settings?.about_philosophy_text,
    DEFAULT_PHILOSOPHY_TEXT,
  );
  const exhibitionsTitle =
    settings?.about_exhibitions_title?.trim() || "Selected Exhibitions";
  const exhibitions =
    settings?.about_exhibitions_text
      ?.split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean) || [];

  return (
    <div
      style={{
        backgroundColor: "var(--color-cream)",
        minHeight: "100svh",
        paddingTop: "120px",
        paddingBottom: "100px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <header
          style={{
            marginBottom: "56px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 1s ease, transform 1s ease",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.72rem, 0.9vw, 0.86rem)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-charcoal-mid)",
              marginBottom: "1rem",
              fontWeight: 400,
            }}
          >
            {eyebrow}
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "80px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 1.2s ease 0.3s",
            }}
          >
            <div
              style={{
                aspectRatio: "3/4",
                backgroundColor: "var(--color-cream-dark)",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow:
                  "2px 10px 28px rgba(28,25,22,0.48), 0 3px 8px rgba(28,25,22,0.25)",
                background: imgError
                  ? "linear-gradient(135deg, var(--color-cream-dark), var(--color-border))"
                  : undefined,
              }}
            >
              {!imgError && (
                <img
                  src={
                    settings?.artist_about_photo_url
                      ? getImageUrl(settings.artist_about_photo_url)
                      : "/artist_studio_portrait.png"
                  }
                  alt="Artist in studio"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setImgError(true)}
                />
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "40px",
              opacity: isVisible ? 1 : 0,
              transition: "opacity 1.2s ease 0.6s",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--color-charcoal)",
                  marginBottom: "1.5rem",
                }}
              >
                {sectionTitle}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  color: "var(--color-charcoal-mid)",
                  lineHeight: 1.8,
                  marginBottom: "1.5rem",
                  fontWeight: 300,
                  whiteSpace: "pre-wrap",
                }}
              >
                {aboutText}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  color: "var(--color-charcoal-mid)",
                  lineHeight: 1.8,
                  fontWeight: 300,
                  whiteSpace: "pre-wrap",
                }}
              >
                {secondaryText}
              </p>
            </div>

            <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />

            <div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--color-charcoal)",
                  marginBottom: "1.5rem",
                }}
              >
                {philosophyTitle}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  color: "var(--color-charcoal-mid)",
                  lineHeight: 1.8,
                  fontWeight: 300,
                  whiteSpace: "pre-wrap",
                }}
              >
                {philosophyText}
              </p>
            </div>

            {exhibitions.length > 0 ? (
              <div style={{ marginTop: "20px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--color-muted)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {exhibitionsTitle}
                </span>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    marginTop: "15px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {exhibitions.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        color: "var(--color-charcoal-mid)",
                        opacity: 0.7,
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
