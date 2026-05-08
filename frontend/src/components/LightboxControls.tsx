export function LightboxCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute right-[1.1rem] top-[1.1rem] z-30 flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/20 text-[rgba(30,30,28,0.75)] shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-colors hover:bg-white/85 hover:text-[rgba(20,20,18,0.9)]"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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
      className={`lb-arrow absolute top-1/2 z-[25] hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-white/20 text-[rgba(30,30,28,0.7)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl transition hover:scale-105 hover:bg-white/80 ${sideClass}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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
      .lb-title { font-size: min(9vw, 2.4rem); }
      @media (min-width: 768px) {
        .lb-header {
          top: 2.5rem !important;
          left: 2.5rem !important;
          right: auto;
          justify-content: flex-start;
          width: 320px;
          padding: 0 !important;
        }
        .lb-title { font-size: 2.4rem; }
      }
    `}</style>
  );
}
