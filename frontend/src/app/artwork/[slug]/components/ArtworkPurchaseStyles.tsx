"use client";

import React from "react";

export function ArtworkPurchaseStyles() {
    return (
        <style>{`
            /* ══════════════════════════════════════
               Liquid Glass Purchase Tabs — iOS 2026
               ══════════════════════════════════════ */
            .fluid-tabs-container {
                display: flex;
                position: relative;
                z-index: 10;
                margin-bottom: -1px;
                gap: 3px;
                padding: 0 16px;
            }

            .fluid-tab {
                flex: 1;
                position: relative;
                padding: 1.1rem 0.75rem 1rem;
                font-family: 'Cormorant Garamond', Georgia, serif;
                font-weight: 400;
                font-size: 1rem;
                letter-spacing: 0.03em;
                color: rgba(26, 26, 24, 0.5);
                border: none;
                cursor: pointer;
                z-index: 1;
                text-align: center;
                white-space: nowrap;
                border-radius: 14px 14px 0 0;
                -webkit-tap-highlight-color: transparent;

                background: rgba(255, 255, 255, 0.35);
                backdrop-filter: blur(16px) saturate(1.4);
                -webkit-backdrop-filter: blur(16px) saturate(1.4);
                border: 1px solid rgba(255, 255, 255, 0.5);
                border-bottom: none;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 -1px 4px rgba(0, 0, 0, 0.02);

                transition: color 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            background 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            backdrop-filter 0.35s ease,
                            box-shadow 0.4s ease,
                            border-color 0.35s ease,
                            transform 0.25s ease;
            }

            @media (hover: hover) and (pointer: fine) {
                .fluid-tab:hover:not(.active) {
                    color: rgba(26, 26, 24, 0.68);
                    background: rgba(255, 255, 255, 0.52);
                    border-color: rgba(255, 255, 255, 0.7);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 -2px 8px rgba(0, 0, 0, 0.03);
                    transform: translateY(-1px);
                }
            }

            .fluid-tab.active {
                color: var(--color-charcoal);
                font-weight: 500;
                z-index: 10;
                background: #fff;
                backdrop-filter: none;
                -webkit-backdrop-filter: none;
                border-color: rgba(0, 0, 0, 0.06);
                box-shadow: 0 -3px 14px rgba(0, 0, 0, 0.05),
                            0 -1px 4px rgba(0, 0, 0, 0.03),
                            inset 0 2px 0 rgba(255, 255, 255, 1);
            }

            .fluid-tab.active .tab-highlight {
                position: absolute;
                top: 0;
                left: 20%;
                right: 20%;
                height: 2.5px;
                border-radius: 0 0 4px 4px;
                background: linear-gradient(90deg, #ec4899, #fb923c);
                opacity: 0.7;
                transition: opacity 0.35s ease;
            }

            .fluid-tab.active::before,
            .fluid-tab.active::after {
                content: "";
                position: absolute;
                bottom: 0;
                width: 16px;
                height: 16px;
                pointer-events: none;
                z-index: 10;
            }
            .fluid-tab.active::before {
                left: -16px;
                background: radial-gradient(circle at 0 0, transparent 15.5px, #fff 16px);
            }
            .fluid-tab.active::after {
                right: -16px;
                background: radial-gradient(circle at 100% 0, transparent 15.5px, #fff 16px);
            }

            .fluid-tab:first-child.active::before { display: none; }
            .fluid-tab:last-child.active::after  { display: none; }

            @media (max-width: 767px) {
                .fluid-tabs-container { gap: 2px; padding: 0 10px; }
                .fluid-tab { font-size: 0.85rem; padding: 0.9rem 0.2rem 0.8rem; letter-spacing: 0.01em; border-radius: 10px 10px 0 0; }
                .fluid-tab.active::before, .fluid-tab.active::after { width: 10px; height: 10px; }
                .fluid-tab.active::before { left: -10px; background: radial-gradient(circle at 0 0, transparent 9.5px, #fff 10px); }
                .fluid-tab.active::after { right: -10px; background: radial-gradient(circle at 100% 0, transparent 9.5px, #fff 10px); }
            }

            .purchase-card { transition: border-radius 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            .purchase-card-content { animation: pcFadeIn 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
            @keyframes pcFadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .pc-header { padding-bottom: 1.25rem; border-bottom: 1px solid var(--color-border); }
            .pc-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.15rem; font-weight: 500; color: var(--color-charcoal); margin: 0 0 0.3rem; letter-spacing: 0.01em; }
            .pc-subtitle { font-family: var(--font-sans); font-size: 0.68rem; color: var(--color-muted); margin: 0; letter-spacing: 0.02em; }
            .step-row { display: flex; flex-direction: column; gap: 0.6rem; }
            .step-label { display: flex; align-items: center; gap: 0.5rem; margin-left: -6px; }
            .step-number { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.65rem; font-weight: 500; color: var(--color-charcoal); line-height: 1; width: 1.6rem; flex-shrink: 0; }
            .step-text { font-family: var(--font-sans); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-muted); line-height: 1; transform: translateY(1px); }
            .step-select-wrap { position: relative; padding-left: 10px; }
            .step-trigger { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0.9rem 1.1rem; font-family: var(--font-sans); font-size: 0.85rem; font-weight: 400; color: var(--color-charcoal); background: #fff; border: 1.5px solid var(--color-border-dark); border-radius: 10px; cursor: pointer; outline: none; text-align: left; transition: border-color 0.25s ease, box-shadow 0.25s ease, border-radius 0.2s ease; -webkit-tap-highlight-color: transparent; }
            .step-trigger-content, .step-option-main { display: inline-flex; align-items: center; gap: 0.65rem; min-width: 0; }
            .step-trigger.open { border-color: var(--color-charcoal); box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.06); border-radius: 10px 10px 0 0; border-bottom-color: var(--color-border); }
            @media (hover: hover) and (pointer: fine) { .step-trigger:hover:not(.open) { border-color: rgba(17, 17, 17, 0.35); } }
            .step-chevron { width: 10px; height: 10px; border-right: 1.5px solid var(--color-muted); border-bottom: 1.5px solid var(--color-muted); transform: rotate(45deg); transition: transform 0.25s ease, border-color 0.2s ease; flex-shrink: 0; margin-left: 0.75rem; }
            .step-trigger.open .step-chevron { transform: rotate(-135deg); border-color: var(--color-charcoal); }
            .step-options { overflow: hidden; max-height: 0; opacity: 0; border: 1.5px solid transparent; border-top: none; border-radius: 0 0 10px 10px; background: #fff; transition: max-height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease, border-color 0.2s ease; }
            .step-options.open { max-height: 400px; opacity: 1; border-color: var(--color-charcoal); }
            .step-options.frame-color-options.open { max-height: 390px; }
            .step-option { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0.75rem 1.1rem; font-family: var(--font-sans); font-size: 0.82rem; font-weight: 400; color: var(--color-charcoal-mid); background: transparent; border: none; border-top: 1px solid var(--color-border); cursor: pointer; text-align: left; transition: background 0.15s ease, color 0.15s ease; -webkit-tap-highlight-color: transparent; }
            .frame-swatch { width: 2.4rem; height: 2.4rem; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; overflow: hidden; border: 1px solid rgba(17, 17, 17, 0.12); border-radius: 7px; box-shadow: 0 1px 2px rgba(17, 17, 17, 0.08); }
            .frame-swatch-img { width: 100%; height: 100%; object-fit: contain; background: #fff; display: block; }
            .frame-swatch-fallback { width: 100%; height: 100%; display: block; background: inherit; }
            .frame-color-panel { box-sizing: border-box; width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) 148px; gap: 0.75rem; padding: 0.9rem; border-top: 1px solid var(--color-border); overflow: hidden; }
            .frame-color-preview-wrap { min-width: 0; }
            .frame-color-preview { width: 100%; min-height: 236px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff; }
            .frame-color-preview-img { width: 100%; height: 100%; min-height: 236px; object-fit: contain; display: block; background: #fff; }
            .frame-color-preview-fallback { width: 100%; min-height: 236px; display: block; background: inherit; }
            .frame-color-thumb-rail { min-width: 0; display: flex; flex-direction: column; gap: 0.42rem; max-height: 286px; overflow-x: hidden; overflow-y: auto; padding-right: 2px; scrollbar-width: thin; }
            .frame-color-thumb { box-sizing: border-box; width: 100%; min-width: 0; min-height: 40px; padding: 3px 5px 3px 3px; display: flex; align-items: center; justify-content: flex-start; gap: 0.45rem; flex: 0 0 auto; background: #fff; border: 1px solid rgba(17, 17, 17, 0.12); border-radius: 8px; cursor: pointer; box-shadow: 0 1px 3px rgba(17, 17, 17, 0.06); transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease; }
            .frame-color-thumb .frame-swatch { width: 34px; height: 34px; border: none; border-radius: 5px; box-shadow: none; }
            .frame-color-thumb-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--font-sans); font-size: 0.68rem; line-height: 1.2; color: var(--color-charcoal-mid); text-align: left; }
            .frame-color-thumb.active { border-color: var(--color-charcoal); box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.08), 0 3px 10px rgba(17, 17, 17, 0.12); }
            .frame-color-thumb.active .frame-color-thumb-label { color: var(--color-charcoal); font-weight: 600; }
            .step-option:first-child { border-top: none; }
            .step-option:last-child { border-radius: 0 0 8px 8px; }
            .step-option.active { color: var(--color-charcoal); font-weight: 500; background: rgba(17, 17, 17, 0.03); }
            .step-option .opt-check { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid var(--color-border-dark); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
            .step-option.active .opt-check { border-color: var(--color-charcoal); background: var(--color-charcoal); }
            .step-option.active .opt-check::after { content: ""; width: 4px; height: 4px; border-radius: 50%; background: #fff; }
            @media (hover: hover) and (pointer: fine) { .step-option:hover:not(.active) { background: rgba(17, 17, 17, 0.02); color: var(--color-charcoal); } }
            .info-badge { display: flex; align-items: flex-start; gap: 0.7rem; padding: 0.85rem 1rem; border-radius: 8px; background: rgba(17, 17, 17, 0.03); border-left: 3px solid rgba(17, 17, 17, 0.15); }
            .info-badge-content { flex: 1; }
            .info-badge-title { font-family: var(--font-sans); font-size: 0.72rem; font-weight: 600; color: var(--color-charcoal); margin: 0 0 0.2rem; letter-spacing: 0.02em; }
            .info-badge-desc { font-family: var(--font-sans); font-size: 0.68rem; color: var(--color-charcoal-mid); margin: 0; line-height: 1.5; }
            .step-reveal { animation: stepSlideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
            @keyframes stepSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            @media (max-width: 767px) {
                .step-number { font-size: 1.45rem; width: 1.4rem; }
                .step-text { font-size: 0.72rem; }
                .step-label { margin-left: -3px; }
                .step-select-wrap { padding-left: 6px; }
                .step-trigger { font-size: 0.82rem; padding: 0.8rem 0.9rem; }
                .step-option { font-size: 0.78rem; padding: 0.7rem 0.9rem; }
                .frame-swatch { width: 2.1rem; height: 2.1rem; }
                .step-options.frame-color-options.open { max-height: 330px; overflow-x: hidden; }
                .frame-color-panel { grid-template-columns: minmax(0, 1fr) 108px; gap: 0.6rem; padding: 0.65rem; }
                .frame-color-preview, .frame-color-preview-img, .frame-color-preview-fallback { min-height: 190px; }
                .frame-color-thumb-rail { max-height: 238px; gap: 0.38rem; padding-right: 0; scrollbar-width: none; }
                .frame-color-thumb-rail::-webkit-scrollbar { width: 0; height: 0; display: none; }
                .frame-color-thumb { min-height: 36px; border-radius: 7px; gap: 0.35rem; }
                .frame-color-thumb .frame-swatch { width: 30px; height: 30px; }
                .frame-color-thumb-label { font-size: 0.62rem; }
                .pc-title { font-size: 1.05rem; }
                .info-badge { padding: 0.75rem 0.85rem; }
            }
        `}</style>
    );
}
