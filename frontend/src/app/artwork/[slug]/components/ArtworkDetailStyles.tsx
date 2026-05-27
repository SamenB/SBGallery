"use client";

export function ArtworkDetailStyles() {
  return (
    <>
      <style>{`
        @keyframes subtlePulse {
          0% { box-shadow: 0 0 0 0 rgba(100, 116, 139, 0.15); border-color: rgba(100, 116, 139, 0.2); }
          50% { box-shadow: 0 0 0 4px rgba(100, 116, 139, 0); border-color: rgba(100, 116, 139, 0.4); }
          100% { box-shadow: 0 0 0 0 rgba(100, 116, 139, 0); border-color: rgba(100, 116, 139, 0.2); }
        }
      `}</style>
      <style>{`
        .artwork-img-col {
          display: flex;
          flex-direction: column;
          position: relative;
          height: auto;
          min-width: 0;
        }
        .artwork-detail-shell {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem 2rem 6rem;
          box-sizing: border-box;
        }
        .artwork-detail-grid {
          grid-template-columns: minmax(0, 1fr);
          min-width: 0;
        }
        .artwork-img-area {
          flex: unset;
          position: relative;
          width: min(calc(100vw - 28px), 720px);
          margin-left: calc(50% + 8px);
          margin-top: 1rem;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        .artwork-frame { max-width: 95vw; }
        .artwork-slider-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          position: relative;
          width: 100%;
          min-width: 0;
        }
        @media (min-width: 768px) {
          .artwork-detail-shell {
            max-width: min(1360px, 100%);
          }
          .artwork-detail-grid {
            grid-template-columns: minmax(0, 1.18fr) minmax(390px, 0.82fr);
            gap: 2.5rem !important;
          }
          .artwork-img-col {
            top: 10px;
            height: calc(100vh - 40px);
            pointer-events: none;
          }
          .artwork-img-col * { pointer-events: auto; }
          .artwork-img-area {
            margin-left: 0;
            margin-right: 0;
            margin-top: -1rem;
            width: 100%;
            transform: none;
            height: calc(100% + 1rem);
            align-items: flex-start;
            flex: 1;
          }
          .artwork-slider-wrap { min-height: 520px; }
        }
        @media (min-width: 1024px) {
          .artwork-img-col { transform: translateX(-24px); }
        }
        @media (min-width: 1280px) {
          .artwork-img-col { transform: translateX(-32px); }
        }
        .mobile-title-row { display: flex; }
        .desktop-title-row { display: none; }
        @media (min-width: 768px) {
          .mobile-title-row { display: none; }
          .desktop-title-row { display: flex; }
        }
      `}</style>
    </>
  );
}
