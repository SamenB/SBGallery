export type HubMode = "preview" | "probe" | "fulfillment";
export interface ProbeResult {
  sku: string;
  description: string;
  aspect_ratio: string;
  width_in: number;
  height_in: number;
  applied_attributes: Record<string, string>;
  shipping_tiers: Array<{
    method: string;
    wholesale_cost_eur: number;
    shipping_cost_eur: number;
    delivery_estimate: string;
  }>;
  quote_outcome: string;
  quote_issues: Array<{ description?: string }>;
  is_ideal_match: boolean;
  raw_quote: unknown;
}
export interface PreviewRatio {
  label: string;
  title: string;
  description: string;
  sort_order: number;
}
export interface PreviewCategory {
  id: string;
  label: string;
  short_label: string;
  material_label: string;
  frame_label: string;
  sort_order: number;
}
export interface PreviewRatioCard {
  ratio: string;
  title: string;
  description: string;
  available_category_count: number;
  country_count: number;
  full_country_count: number;
  partial_country_count: number;
}
export interface PreviewPaperMaterial {
  id: string;
  label: string;
  description: string;
  is_default: boolean;
}
export interface PreviewCountryOption {
  country_code: string;
  country_name: string;
}
export interface PreviewCountryCell {
  category_id: string;
  status: "available" | "missing";
  size_count: number;
  fulfillment: PreviewFulfillmentPolicy;
}
export interface PreviewCountryRow {
  country_code: string;
  country_name: string;
  available_category_count: number;
  completion_status: "full" | "partial" | "missing";
  completion_percent: number;
  total_size_count: number;
  primary_category_count: number;
  notice_category_count: number;
  cells: PreviewCountryCell[];
}
export interface PreviewSizeSlot {
  recommended_size_label: string;
  strongest_size_label: string;
  centroid_size_label: string;
  member_size_labels: string[];
  country_count: number;
  score: number;
  row_count: number;
}
export interface PreviewCategoryOverview {
  category_id: string;
  label: string;
  short_label: string;
  material_label: string;
  frame_label: string;
  available: boolean;
  available_size_count: number;
  country_coverage_count: number;
  source_countries: string[];
  storefront_policy?: PreviewStorefrontPolicy | null;
  fulfillment_summary: PreviewFulfillmentSummary;
  recommended_size_labels: string[];
  size_slots: PreviewSizeSlot[];
}
export interface PreviewFulfillmentSummary {
  local_country_count: number;
  regional_country_count: number;
  cross_border_country_count: number;
  unsupported_country_count: number;
  domestic_geography_country_count: number;
  europe_geography_country_count: number;
  international_geography_country_count: number;
  no_geography_country_count: number;
  low_tax_country_count: number;
  elevated_tax_country_count: number;
  no_tax_country_count: number;
  show_country_count: number;
  notice_country_count: number;
  hidden_country_count: number;
}
export interface PreviewStorefrontPolicy {
  label: string;
  fixed_attributes: Record<string, string>;
  allowed_attributes: Record<string, string[]>;
  recommended_defaults: Record<string, string>;
  shipping: {
    visible_methods: string[];
    preferred_order: string[];
    default_method?: string | null;
  };
  notes: string[];
  kept_route_count: number;
  removed_route_count: number;
}
export interface PreviewFulfillmentPolicy {
  fulfillment_level: "local" | "regional" | "cross_border" | "unsupported";
  geography_scope: "domestic" | "europe" | "international" | "none";
  storefront_action: "show" | "show_with_notice" | "hide";
  source_countries: string[];
  tax_risk: "low" | "elevated" | "none";
  row_count: number;
  fastest_delivery_days?: string | null;
  note: string;
}
export interface PreviewOffer {
  sku: string;
  source_country?: string | null;
  product_price: number;
  shipping_price: number;
  total_cost: number;
  currency: string;
  delivery_days?: string | null;
  shipping_method?: string | null;
  service_name?: string | null;
  service_level?: string | null;
  default_shipping_tier?: string | null;
  available_shipping_tiers?: string[];
  shipping_profiles?: Array<{
    tier: string;
    shipping_method?: string | null;
    service_name?: string | null;
    service_level?: string | null;
    source_country?: string | null;
    currency?: string | null;
    total_cost?: number | null;
    delivery_days?: string | null;
  }>;
}
export interface PreviewSizeCell {
  slot_size_label: string;
  size_label: string;
  available: boolean;
  is_exact_match: boolean;
  centroid_size_label: string;
  member_size_labels: string[];
  offer?: PreviewOffer | null;
}
export interface PreviewCountryCategoryRow {
  category_id: string;
  label: string;
  short_label: string;
  material_label: string;
  frame_label: string;
  fulfillment_policy: PreviewFulfillmentPolicy;
  baseline_sizes: string[];
  available_size_count: number;
  size_cells: PreviewSizeCell[];
  sample_offers: PreviewOffer[];
}
export interface SelectedCountryPreview {
  ratio?: string;
  country_code: string;
  country_name: string;
  category_rows: PreviewCountryCategoryRow[];
}
export interface SelectedRatioPreview {
  ratio: string;
  ratio_meta: PreviewRatio;
  available_category_count: number;
  countries: PreviewCountryOption[];
  country_rows: PreviewCountryRow[];
  category_previews: PreviewCategoryOverview[];
  full_country_count: number;
  partial_country_count: number;
}
export interface CatalogPreviewResponse {
  selected_ratio: string;
  selected_country: string;
  selected_paper_material: string;
  storefront_mode?: "primary_only" | "include_notice_level";
  ratios: PreviewRatio[];
  paper_materials: PreviewPaperMaterial[];
  categories: PreviewCategory[];
  ratio_cards: PreviewRatioCard[];
  selected_ratio_preview: SelectedRatioPreview;
  selected_country_preview: SelectedCountryPreview;
  selected_country_storefront_preview?: SelectedCountryStorefrontPreview;
  country_count: number;
  generated_from_curated_routes: number;
  policy_filtered_out_routes: number;
}
export interface StorefrontCardSize {
  slot_size_label: string;
  size_label: string;
  is_exact_match: boolean;
  source_country?: string | null;
  currency?: string | null;
  total_cost?: number | null;
  delivery_days?: string | null;
  sku?: string | null;
  shipping_method?: string | null;
  service_name?: string | null;
  service_level?: string | null;
  default_shipping_tier?: string | null;
  shipping_profiles?: Array<{
    tier: string;
    shipping_method?: string | null;
    service_name?: string | null;
    service_level?: string | null;
    source_country?: string | null;
    currency?: string | null;
    total_cost?: number | null;
    delivery_days?: string | null;
  }>;
  shipping_support: {
    status: "covered" | "blocked" | "unavailable";
    chosen_tier?: string | null;
    chosen_shipping_price?: number | null;
    chosen_delivery_days?: string | null;
    note: string;
  };
}
export interface StorefrontCardPreview {
  category_id: string;
  label: string;
  short_label: string;
  material_label: string;
  frame_label: string;
  storefront_action: "show" | "show_with_notice" | "hide";
  fulfillment_level: PreviewFulfillmentPolicy["fulfillment_level"];
  geography_scope: PreviewFulfillmentPolicy["geography_scope"];
  tax_risk: PreviewFulfillmentPolicy["tax_risk"];
  source_countries: string[];
  fastest_delivery_days?: string | null;
  note: string;
  storefront_policy: {
    fixed_attributes: Record<string, string>;
    recommended_defaults: Record<string, string>;
    allowed_attributes: Record<string, string[]>;
  };
  available_shipping_tiers?: string[];
  default_shipping_tier?: string | null;
  shipping_support: {
    status: "covered" | "blocked" | "unavailable";
    covered_size_count: number;
    review_size_count: number;
    blocked_size_count: number;
    unavailable_size_count: number;
    dominant_tier?: string | null;
    min_supported_shipping_price?: number | null;
    max_supported_shipping_price?: number | null;
  };
  available_size_count: number;
  size_labels: string[];
  price_range: {
    currency?: string | null;
    min_total?: number | null;
    max_total?: number | null;
  };
  size_options: StorefrontCardSize[];
}
export interface HiddenStorefrontCard {
  category_id: string;
  label: string;
  reason: string;
  storefront_action: "show" | "show_with_notice" | "hide";
  fulfillment_level: PreviewFulfillmentPolicy["fulfillment_level"];
  geography_scope: PreviewFulfillmentPolicy["geography_scope"];
  tax_risk: PreviewFulfillmentPolicy["tax_risk"];
}
export interface SelectedCountryStorefrontPreview {
  storefront_mode: "primary_only" | "include_notice_level";
  country_code: string;
  country_name: string;
  ratio: string;
  visible_cards: StorefrontCardPreview[];
  hidden_cards: HiddenStorefrontCard[];
}
export interface FulfillmentJob {
  id: number;
  order_id: number;
  status: string;
  mode: string;
  merchant_reference: string;
  idempotency_key: string;
  prodigi_order_id?: string | null;
  attempt_count: number;
  item_ids: number[];
  last_error?: string | null;
  updated_at?: string;
}
export interface FulfillmentJobsResponse {
  mode: string;
  webhook_secret_configured: boolean;
  counts: Record<string, number>;
  jobs: FulfillmentJob[];
}
export interface FulfillmentJobDetail {
  job: FulfillmentJob;
  gates: Array<{
    id: number;
    gate: string;
    status: string;
    measured?: unknown;
    expected?: unknown;
    error?: string | null;
    created_at?: string;
  }>;
  events: Array<{
    id: number;
    event_type: string;
    event_uid?: string | null;
    stage: string;
    status: string;
    external_id?: string | null;
    request_payload?: unknown;
    response_payload?: unknown;
    metadata?: unknown;
    error?: string | null;
    created_at?: string;
  }>;
}
