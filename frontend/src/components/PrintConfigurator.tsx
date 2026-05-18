"use client";

import { useEffect, useMemo, useState } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import type { StorefrontSizeOption } from "@/lib/artworkStorefront";
import {
  resolveRoundedCustomerPriceParts,
  resolveStorefrontCustomerTotal,
  resolveStorefrontProductPrice,
} from "@/lib/artworkStorefront";
import {
  getFrameColorSwatch,
  getVisibleStorefrontCards,
} from "@/lib/prodigiPrintOptions";
import { FrameColorOptionsPanel, FrameSwatch } from "./printConfigurator.frameColor";
import { PrintConfiguratorHeader } from "./printConfigurator.header";
import {
  buildFinishLabel,
  buildImageWindowLabel,
  buildInitialAttributeSelection,
  formatAttributeValue,
  formatSizeLabel,
  getSizeKey,
  isUkShippedBoxFrame,
  normalizeAttributeSelection,
  resolveAllowedAttributeOptions,
  resolveEditionType,
  resolveShippingPrice,
  titleCase,
} from "./printConfigurator.shared";
import type { PrintConfiguratorProps } from "./printConfigurator.shared";

export default function PrintConfigurator({
  artworkId,
  artworkTitle,
  purchaseType,
  units,
  isSmall,
  onAddToCart,
  imageGradientFrom,
  imageGradientTo,
  imageUrl,
  hasHighResAsset = false,
  storefront,
  storefrontLoading,
  storefrontError,
}: PrintConfiguratorProps) {
  const { convertPrice } = usePreferences();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedSizeKeys, setSelectedSizeKeys] = useState<Record<string, string>>({});
  const [attributeSelections, setAttributeSelections] = useState<Record<string, Record<string, string>>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const mediumOffers = storefront?.mediums?.[purchaseType] || null;
  const rawCards = useMemo(() => mediumOffers?.cards || [], [mediumOffers]);
  const cards = useMemo(() => getVisibleStorefrontCards(rawCards), [rawCards]);

  const selectedCard = useMemo(() => {
    if (!cards.length) {
      return null;
    }
    return cards.find((card) => card.category_id === selectedCardId) || cards[0];
  }, [cards, selectedCardId]);

  const selectedCardKey = selectedCard?.category_id || "";

  const selectedSize = useMemo<StorefrontSizeOption | null>(() => {
    if (!selectedCard?.size_options?.length) {
      return null;
    }
    const selectedSizeKey = selectedSizeKeys[selectedCardKey];
    return (
      selectedCard.size_options.find((size) => getSizeKey(size) === selectedSizeKey) ||
      selectedCard.size_options[0]
    );
  }, [selectedCard, selectedCardKey, selectedSizeKeys]);

  const selectedAttributes = useMemo(() => {
    if (!selectedCard) {
      return {};
    }
    return normalizeAttributeSelection(
      selectedCard,
      selectedSize,
      attributeSelections[selectedCardKey] || buildInitialAttributeSelection(selectedCard, selectedSize),
    );
  }, [attributeSelections, selectedCard, selectedCardKey, selectedSize]);

  useEffect(() => {
    if (!selectedCard) {
      return;
    }
    setAttributeSelections((prev) => {
      const current = prev[selectedCardKey] || {};
      const normalized = normalizeAttributeSelection(selectedCard, selectedSize, current);
      if (JSON.stringify(current) === JSON.stringify(normalized)) {
        return prev;
      }
      return {
        ...prev,
        [selectedCardKey]: normalized,
      };
    });
  }, [selectedCard, selectedCardKey, selectedSize]);

  const configurableAttributes = useMemo(() => {
    return Object.entries(resolveAllowedAttributeOptions(selectedCard, selectedSize)).filter(([, options]) => options.length > 1);
  }, [selectedCard, selectedSize]);

  const finalAttributes = useMemo(() => {
    return {
      ...(selectedSize?.provider_attributes || {}),
      ...(selectedCard?.default_prodigi_attributes || {}),
      ...selectedAttributes,
    };
  }, [selectedAttributes, selectedCard, selectedSize]);

  const editionType = resolveEditionType(purchaseType, mediumOffers);
  const productPrice = resolveStorefrontProductPrice(selectedSize);
  const shippingPrice = resolveShippingPrice(selectedSize);
  const roundedPriceParts = resolveRoundedCustomerPriceParts(selectedSize);
  const totalPrice = roundedPriceParts?.total ?? resolveStorefrontCustomerTotal(selectedSize);
  const displayProductPrice = roundedPriceParts?.product ?? productPrice;
  const displayShippingPrice = roundedPriceParts?.shipping ?? shippingPrice;
  const hasShippingQuote = shippingPrice !== null && totalPrice !== null;
  const formattedSize = selectedSize ? formatSizeLabel(selectedSize.size_label || selectedSize.slot_size_label, units) : "Select...";
  const imageWindowLabel = buildImageWindowLabel(selectedCard, selectedSize, units);
  const ukBoxNotice = isUkShippedBoxFrame(selectedCard, storefront?.country_code);
  const finishLabel = selectedCard
    ? buildFinishLabel(selectedCard, selectedAttributes, editionType)
    : purchaseType === "canvas"
      ? "Canvas Print"
      : "Paper Print";

  if (storefrontLoading) {
    return (
      <div style={{ padding: "2rem", color: "var(--color-muted)", textAlign: "center" }}>
        Loading print offers...
      </div>
    );
  }

  if (storefrontError) {
    return <div style={{ padding: "2rem", color: "#C87070", textAlign: "center" }}>{storefrontError}</div>;
  }

  if (!storefront || !cards.length) {
    return (
      <div style={{ padding: "2rem", color: "var(--color-muted)", textAlign: "center" }}>
        {storefront?.message || "Prints are currently unavailable for this region."}
      </div>
    );
  }

  return (
    <div className="print-configurator-inner">
      <PrintConfiguratorHeader
        purchaseType={purchaseType}
        storefront={storefront}
        mediumOffers={mediumOffers}
        hasHighResAsset={hasHighResAsset}
      />

      {cards.length > 1 && (
        <div className="step-row">
          <div className="step-label">
            <span className="step-number">1</span>
            <span className="step-text">Select Format</span>
          </div>
          <div className="step-select-wrap">
            <button
              className={`step-trigger ${openDropdown === "format" ? "open" : ""}`}
              onClick={() => setOpenDropdown(openDropdown === "format" ? null : "format")}
              type="button"
            >
              <span>{selectedCard?.label || "Select..."}</span>
              <span className="step-chevron" />
            </button>
            <div className={`step-options ${openDropdown === "format" ? "open" : ""}`}>
              {cards.map((card) => (
                <button
                  key={card.category_id}
                  type="button"
                  className={`step-option ${selectedCard?.category_id === card.category_id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCardId(card.category_id);
                    setOpenDropdown(null);
                  }}
                >
                  <span>{card.label}</span>
                  <span className="opt-check" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="step-row">
        <div className="step-label">
          <span className="step-number">{cards.length > 1 ? 2 : 1}</span>
          <span className="step-text">Select Size</span>
        </div>
        <div className="step-select-wrap">
          <button
            className={`step-trigger ${openDropdown === "size" ? "open" : ""}`}
            onClick={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
            type="button"
          >
            <span>
              {formattedSize}{" "}
              {roundedPriceParts !== null ? (
                <>
                  {" "}
                  - <span className="font-price font-medium">{convertPrice(roundedPriceParts.total)}</span>
                </>
              ) : null}
            </span>
            <span className="step-chevron" />
          </button>
          <div className={`step-options ${openDropdown === "size" ? "open" : ""}`}>
            {selectedCard?.size_options.map((size) => {
              const sizeTotal = resolveRoundedCustomerPriceParts(size)?.total ?? null;
              return (
                <button
                  key={getSizeKey(size)}
                  type="button"
                  className={`step-option ${selectedSize && getSizeKey(selectedSize) === getSizeKey(size) ? "active" : ""}`}
                  onClick={() => {
                    setSelectedSizeKeys((prev) => ({
                      ...prev,
                      [selectedCardKey]: getSizeKey(size),
                    }));
                    setOpenDropdown(null);
                  }}
                >
                  <span>
                    {formatSizeLabel(size.size_label || size.slot_size_label, units)}
                    {sizeTotal !== null ? (
                      <>
                        {" "}
                        - <span className="font-price font-medium">{convertPrice(sizeTotal)}</span>
                      </>
                    ) : null}
                  </span>
                  <span className="opt-check" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {configurableAttributes.map(([key, options], index) => {
        const stepNumber = cards.length > 1 ? index + 3 : index + 2;
        const selectedValue = selectedAttributes[key] || options[0];
        const selectedSwatch = getFrameColorSwatch(selectedCard, key, selectedValue);
        const isFrameColorDropdown = key === "color";
        const selectAttribute = (value: string) => {
          setAttributeSelections((prev) => ({
            ...prev,
            [selectedCardKey]: {
              ...selectedAttributes,
              [key]: value,
            },
          }));
        };

        return (
          <div className="step-row step-reveal" key={key}>
            <div className="step-label">
              <span className="step-number">{stepNumber}</span>
              <span className="step-text">{titleCase(key)}</span>
            </div>
            <div className="step-select-wrap">
              <button
                className={`step-trigger ${openDropdown === key ? "open" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                type="button"
              >
                <span className="step-trigger-content">
                  {selectedSwatch && <FrameSwatch swatch={selectedSwatch} />}
                  <span>{formatAttributeValue(selectedValue)}</span>
                </span>
                <span className="step-chevron" />
              </button>
              <div className={`step-options ${isFrameColorDropdown ? "frame-color-options" : ""} ${openDropdown === key ? "open" : ""}`}>
                {isFrameColorDropdown ? (
                  <FrameColorOptionsPanel
                    options={options}
                    selectedValue={selectedValue}
                    selectedCard={selectedCard}
                    formatValue={formatAttributeValue}
                    onSelect={selectAttribute}
                  />
                ) : (
                  options.map((value) => {
                    const optionSwatch = getFrameColorSwatch(selectedCard, key, value);
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`step-option ${selectedValue === value ? "active" : ""}`}
                        onClick={() => {
                          selectAttribute(value);
                          setOpenDropdown(null);
                        }}
                      >
                        <span className="step-option-main">
                          {optionSwatch && <FrameSwatch swatch={optionSwatch} />}
                          <span>{formatAttributeValue(value)}</span>
                        </span>
                        <span className="opt-check" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })}

      {imageWindowLabel && (
        <div className="info-badge" style={{ marginTop: "0.85rem" }}>
          <div className="info-badge-content">
            <p className="info-badge-title">Mounted Image Window</p>
            <p className="info-badge-desc">
              Customer size is the frame/glaze size ({formattedSize}). The production image target is {imageWindowLabel}.
            </p>
          </div>
        </div>
      )}

      {ukBoxNotice && (
        <div
          className="info-badge"
          style={{ marginTop: "0.85rem", background: "#F8FAFC", borderColor: "rgba(15, 23, 42, 0.12)" }}
        >
          <div className="info-badge-content">
            <p className="info-badge-title">UK Fulfillment</p>
            <p className="info-badge-desc">
              This box frame ships from the UK. Delivery can take longer, and import duties or local taxes may apply.
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#F8F7F5",
          margin: isSmall ? "1rem -1.25rem -2rem" : "1rem -2rem -2rem",
          padding: isSmall ? "1.25rem 1.25rem" : "1.25rem 2rem",
          borderRadius: isSmall ? "0" : "0 0 24px 24px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "0.75rem" }}>
          <div>
            <span
              className="font-price"
              style={{
                fontSize: isSmall ? "2rem" : "2.2rem",
                fontWeight: 700,
                color: "var(--color-charcoal)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {totalPrice !== null ? convertPrice(totalPrice) : "-"}
            </span>
          </div>
          <div style={{ textAlign: "right", paddingBottom: "0.15rem" }}>
            {displayProductPrice !== null && (
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.68rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.4,
                }}
              >
                Print <span className="font-price" style={{ fontWeight: 500 }}>{convertPrice(displayProductPrice)}</span>
                {hasShippingQuote ? (
                  <>
                    {" + Delivery "}
                    <span className="font-price" style={{ fontWeight: 500 }}>
                      {convertPrice(displayShippingPrice!)}
                    </span>
                  </>
                ) : null}
              </p>
            )}
            {!hasShippingQuote && productPrice !== null && (
              <p
                style={{
                  margin: "0.15rem 0 0",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.62rem",
                  color: "#B42318",
                  lineHeight: 1.3,
                }}
              >
                Delivery not available
              </p>
            )}
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            color: "var(--color-muted)",
            lineHeight: 1.4,
          }}
        >
          Delivery to {storefront.country_name || storefront.country_code}
        </p>
        <button
          className="premium-cta-btn"
          disabled={!selectedCard || !selectedSize || productPrice === null || totalPrice === null || !hasShippingQuote}
          onClick={() => {
            if (!selectedCard || !selectedSize || productPrice === null || totalPrice === null || roundedPriceParts === null || !hasShippingQuote) {
              return;
            }
            const cartId = [
              artworkId,
              purchaseType,
              selectedCard.category_id,
              getSizeKey(selectedSize),
              storefront.country_code?.toUpperCase() || "XX",
              ...Object.entries(finalAttributes)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([key, value]) => `${key}:${value}`),
            ].join("-");

            onAddToCart({
              id: cartId,
              slug: String(artworkId),
              title: artworkTitle,
              type: "print",
              imageGradientFrom,
              imageGradientTo,
              imageUrl,
              price: roundedPriceParts.total,
              customer_product_price: roundedPriceParts.product,
              customer_shipping_price: roundedPriceParts.shipping,
              customer_line_total: roundedPriceParts.total,
              customer_currency: "USD",
              finish: finishLabel,
              size: formatSizeLabel(selectedSize.size_label || selectedSize.slot_size_label, units),
              edition_type: editionType,
              prodigi_sku: selectedSize.sku || undefined,
              prodigi_storefront_offer_size_id: selectedSize.id || undefined,
              prodigi_category_id: selectedCard.category_id,
              prodigi_slot_size_label: selectedSize.slot_size_label || selectedSize.size_label,
              prodigi_attributes: finalAttributes,
              prodigi_shipping_method:
                selectedSize.shipping_support?.chosen_shipping_method ||
                selectedSize.shipping_support?.chosen_tier ||
                selectedSize.shipping_method ||
                selectedSize.default_shipping_tier ||
                "Standard",
              prodigi_wholesale_eur: selectedSize.supplier_product_price || undefined,
              prodigi_shipping_eur: selectedSize.supplier_shipping_price || undefined,
              prodigi_supplier_total_eur: selectedSize.supplier_total_cost || undefined,
              prodigi_retail_eur: productPrice,
              prodigi_supplier_currency: selectedSize.currency || "EUR",
              prodigi_destination_country_code: storefront.country_code?.toUpperCase() || undefined,
            });
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
