import type { Metadata } from "next";
import { getImageUrl } from "@/utils";
import {
  EMPTY_SITE_COPY,
  cleanSetting,
  excerpt,
  fetchSiteSettings,
  settingText,
  stripLeadingHeading,
} from "@/lib/siteSettings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const aboutBody = stripLeadingHeading(cleanSetting(settings?.about_text), [
    "About the Artist",
  ]);
  const title = settingText(settings?.about_page_eyebrow, "About the Artist");
  const descriptionSource =
    aboutBody ||
    cleanSetting(settings?.about_philosophy_text) ||
    EMPTY_SITE_COPY;
  const description = excerpt(descriptionSource);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
    },
  };
}

export default async function AboutPage() {
  const settings = await fetchSiteSettings();
  const aboutBody = stripLeadingHeading(cleanSetting(settings?.about_text), [
    "About the Artist",
  ]);

  const eyebrow = settingText(settings?.about_page_eyebrow, "About the Artist");
  const pageTitle = cleanSetting(settings?.about_page_title);
  const sectionTitle = settingText(settings?.about_section_title, "About");
  const aboutText = aboutBody || EMPTY_SITE_COPY;
  const secondaryText = cleanSetting(settings?.about_secondary_text);
  const philosophyTitle = settingText(
    settings?.about_philosophy_title,
    "Philosophy",
  );
  const philosophyText = settingText(settings?.about_philosophy_text);
  const exhibitionsTitle = settingText(
    settings?.about_exhibitions_title,
    "Selected Exhibitions",
  );
  const exhibitions =
    settings?.about_exhibitions_text
      ?.split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean) || [];
  const artistPhoto = getImageUrl(settings?.artist_about_photo_url);

  return (
    <div
      className="about-page-shell"
      style={{
        backgroundColor: "var(--color-cream)",
        minHeight: "100svh",
        paddingTop: "120px",
        paddingBottom: "100px",
      }}
    >
      <style>{`
        .about-page-shell {
          padding-top: 120px;
        }

        .about-page-container {
          padding: 0 2rem;
        }

        .about-page-header {
          margin-bottom: 56px;
          text-align: left;
        }

        .about-page-eyebrow {
          font-size: clamp(1.08rem, 1.35vw, 1.29rem);
        }

        @media (max-width: 768px) {
          .about-page-shell {
            padding-top: 72px !important;
          }

          .about-page-container {
            padding: 0 1.25rem !important;
          }

          .about-page-header {
            margin-bottom: 34px !important;
            text-align: center !important;
          }

          .about-page-eyebrow {
            font-size: 1.29rem !important;
          }
        }
      `}</style>
      <div
        className="about-page-container"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}
      >
        <header className="about-page-header">
          <p
            className="about-page-eyebrow"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(1.08rem, 1.35vw, 1.29rem)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--color-charcoal-mid)",
              margin: "0 0 1rem",
              fontWeight: 400,
            }}
          >
            {eyebrow}
          </p>
          {pageTitle ? (
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontWeight: 400,
                color: "var(--color-charcoal)",
                lineHeight: 1,
                margin: 0,
              }}
            >
              {pageTitle}
            </h1>
          ) : null}
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "80px",
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                aspectRatio: "3/4",
                backgroundColor: "var(--color-cream-dark)",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow:
                  "2px 10px 28px rgba(28,25,22,0.48), 0 3px 8px rgba(28,25,22,0.25)",
              }}
            >
              {artistPhoto ? (
                <img
                  src={artistPhoto}
                  alt="Artist in studio"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    textAlign: "center",
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    color: "var(--color-muted)",
                  }}
                >
                  Artist photo coming soon.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            <div>
              <h2
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
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  color: "var(--color-charcoal-mid)",
                  lineHeight: 1.8,
                  marginBottom: secondaryText ? "1.5rem" : 0,
                  fontWeight: 300,
                  whiteSpace: "pre-wrap",
                }}
              >
                {aboutText}
              </p>
              {secondaryText ? (
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
              ) : null}
            </div>

            {exhibitions.length > 0 ? (
              <>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "var(--color-border)",
                  }}
                />
                <div style={{ marginTop: "10px" }}>
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
              </>
            ) : null}
          </div>
        </div>
        <div style={{ marginTop: "80px" }}>
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--color-border)",
              marginBottom: "40px",
            }}
          />
          <h2
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
          </h2>
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
      </div>
    </div>
  );
}
