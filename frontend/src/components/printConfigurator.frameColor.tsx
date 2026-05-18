"use client";

import type { StorefrontCard } from "@/lib/artworkStorefront";
import {
  getFrameColorSwatch,
  type FrameColorSwatch,
} from "@/lib/prodigiPrintOptions";

export function FrameSwatch({ swatch }: { swatch: FrameColorSwatch }) {
  return (
    <span
      className="frame-swatch"
      style={{ backgroundColor: swatch.fallbackColor }}
      aria-hidden="true"
    >
      {swatch.imageSrc ? (
        <img className="frame-swatch-img" src={swatch.imageSrc} alt="" loading="lazy" />
      ) : (
        <span className="frame-swatch-fallback" />
      )}
    </span>
  );
}

export function FrameColorOptionsPanel({
  options,
  selectedValue,
  selectedCard,
  formatValue,
  onSelect,
}: {
  options: string[];
  selectedValue: string;
  selectedCard: StorefrontCard | null;
  formatValue: (value: string) => string;
  onSelect: (value: string) => void;
}) {
  const selectedSwatch = getFrameColorSwatch(selectedCard, "color", selectedValue);

  return (
    <div className="frame-color-panel" role="radiogroup" aria-label="Frame color">
      <div className="frame-color-preview-wrap">
        <div
          className="frame-color-preview"
          style={{ backgroundColor: selectedSwatch?.fallbackColor || "#f6f4ef" }}
        >
          {selectedSwatch?.imageSrc ? (
            <img
              src={selectedSwatch.imageSrc}
              alt=""
              loading="lazy"
              className="frame-color-preview-img"
            />
          ) : (
            <span className="frame-color-preview-fallback" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="frame-color-thumb-rail" aria-label="Available frame colors">
        {options.map((value) => {
          const swatch = getFrameColorSwatch(selectedCard, "color", value);
          const isSelected = selectedValue === value;

          return (
            <button
              key={value}
              type="button"
              className={`frame-color-thumb ${isSelected ? "active" : ""}`}
              onClick={() => onSelect(value)}
              aria-label={formatValue(value)}
              aria-pressed={isSelected}
              title={formatValue(value)}
            >
              {swatch ? <FrameSwatch swatch={swatch} /> : <span className="frame-swatch" />}
              <span className="frame-color-thumb-label">{formatValue(value)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
