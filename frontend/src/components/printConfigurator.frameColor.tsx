"use client";

import { memo, useMemo } from "react";
import type { StorefrontCard } from "@/lib/artworkStorefront";
import {
  getFrameColorSwatch,
  type FrameColorSwatch,
} from "@/lib/prodigiPrintOptions";

export const FrameSwatch = memo(function FrameSwatch({
  swatch,
  eager = false,
}: {
  swatch: FrameColorSwatch;
  eager?: boolean;
}) {
  return (
    <span
      className="frame-swatch"
      style={{ backgroundColor: swatch.fallbackColor }}
      aria-hidden="true"
    >
      {swatch.imageSrc ? (
        <img
          className="frame-swatch-img"
          src={swatch.imageSrc}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          style={{ transform: `scale(${swatch.displayScale || 1})` }}
        />
      ) : (
        <span className="frame-swatch-fallback" />
      )}
    </span>
  );
});

export const FrameColorOptionsPanel = memo(function FrameColorOptionsPanel({
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
  const swatchOptions = useMemo(
    () =>
      options.map((value) => ({
        value,
        label: formatValue(value),
        swatch: getFrameColorSwatch(selectedCard, "color", value),
      })),
    [formatValue, options, selectedCard],
  );
  const selectedSwatch =
    swatchOptions.find((option) => option.value === selectedValue)?.swatch || null;

  return (
    <div className="frame-color-panel" role="radiogroup" aria-label="Frame color">
      <div className="frame-color-preview-wrap">
        <div
          className="frame-color-preview"
          style={{ backgroundColor: selectedSwatch?.fallbackColor || "#f6f4ef" }}
        >
          {swatchOptions.map(({ value, swatch }) =>
            swatch?.imageSrc ? (
              <img
                key={value}
                src={swatch.imageSrc}
                alt=""
                loading="eager"
                decoding="async"
                draggable={false}
                className={`frame-color-preview-img ${selectedValue === value ? "active" : ""}`}
                aria-hidden="true"
                style={{ transform: `scale(${swatch.displayScale || 1})` }}
              />
            ) : null,
          )}
          {!selectedSwatch?.imageSrc && (
            <span className="frame-color-preview-fallback" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="frame-color-thumb-rail" aria-label="Available frame colors">
        {swatchOptions.map(({ value, label, swatch }) => {
          const isSelected = selectedValue === value;

          return (
            <button
              key={value}
              type="button"
              className={`frame-color-thumb ${isSelected ? "active" : ""}`}
              onClick={() => onSelect(value)}
              aria-label={label}
              aria-pressed={isSelected}
              title={label}
            >
              {swatch ? <FrameSwatch swatch={swatch} eager /> : <span className="frame-swatch" />}
              <span className="frame-color-thumb-label">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
