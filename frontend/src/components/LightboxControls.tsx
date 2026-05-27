export function LightboxCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close image viewer"
      className="absolute right-[1.1rem] top-[1.1rem] z-30 flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-white/30 bg-[rgba(8,10,18,0.55)] text-white/90 shadow-[0_6px_18px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-white/55 hover:bg-[rgba(255,255,255,0.18)] hover:text-white"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      >
        <line x1="1" y1="1" x2="11" y2="11" />
        <line x1="11" y1="1" x2="1" y2="11" />
      </svg>
    </button>
  );
}

export function LightboxArrowButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const sideClass = direction === "prev" ? "left-5" : "right-5";
  const points = direction === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6";

  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={direction === "prev" ? "Previous image" : "Next image"}
      className={`lb-arrow absolute top-1/2 z-[25] hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/28 bg-[rgba(8,10,18,0.5)] text-white/85 shadow-[0_6px_18px_rgba(0,0,0,0.3)] backdrop-blur-xl transition hover:scale-105 hover:border-white/55 hover:bg-[rgba(255,255,255,0.16)] hover:text-white ${sideClass}`}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points={points} />
      </svg>
    </button>
  );
}

export function LightboxStyles() {
  return (
    <style>{`
      @media (hover: hover) and (pointer: fine) {
        .lb-arrow { display: flex !important; }
      }
      .lb-header {
        position: absolute;
        top: 2.5rem;
        left: 0;
        right: 0;
        z-index: 25;
        padding: 0 1.5rem;
        display: flex;
        justify-content: center;
        pointer-events: none;
      }
      .lb-title {
        font-size: min(7.5vw, 1.95rem);
        line-height: 1.08;
      }
      .lb-artwork-visual {
        max-width: 94vw;
        max-height: 94vh;
      }
      div.lb-artwork-visual {
        width: 94vw;
        max-width: 800px;
      }
      @media (max-width: 767px) {
        .lb-artwork-visual {
          width: 100vw;
          max-width: 100vw;
          max-height: none;
        }
        div.lb-artwork-visual {
          width: 100vw;
          max-width: 100vw;
        }
      }
      @media (min-width: 768px) {
        .lb-header {
          top: 2.5rem !important;
          left: 2.5rem !important;
          right: auto;
          justify-content: flex-start;
          width: 320px;
          padding: 0 !important;
        }
        .lb-title { font-size: 2rem; }
      }
    `}</style>
  );
}
