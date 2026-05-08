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
        }
        .artwork-img-area {
          flex: unset;
          position: relative;
          width: calc(100% + 4rem);
          margin-left: -2rem;
          margin-top: 2rem;
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
          width: 100%;
        }
        @media (min-width: 768px) {
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
            height: calc(100% + 1rem);
            align-items: flex-start;
            flex: 1;
          }
          .artwork-slider-wrap { height: calc(100% - 130px); }
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
