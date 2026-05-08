"use client";

import GoogleLoginButton from "@/components/GoogleLoginButton";

interface GalleryAuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GalleryAuthPrompt({ isOpen, onClose }: GalleryAuthPromptProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10,10,10,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "2.5rem 2rem",
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem",
            color: "#999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>Love</div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.5rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: "#1a1a18",
            marginBottom: "0.5rem",
          }}
        >
          Save to your collection
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: "#777",
            lineHeight: 1.6,
            marginBottom: "1.75rem",
          }}
        >
          Sign in to save artworks you love and revisit them anytime from your
          profile.
        </p>
        <GoogleLoginButton onSuccess={onClose} containerStyle={{ marginBottom: "1rem" }} />
        <button
          onClick={onClose}
          style={{
            marginTop: "1rem",
            background: "none",
            border: "none",
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            color: "#999",
            cursor: "pointer",
            letterSpacing: "0.05em",
          }}
        >
          Continue browsing
        </button>
      </div>
    </div>
  );
}
