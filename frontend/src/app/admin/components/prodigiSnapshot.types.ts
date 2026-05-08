export interface SnapshotBake {
  id: number;
  bake_key: string;
  paper_material: string;
  include_notice_level: boolean;
  status: string;
  ratio_count: number;
  country_count: number;
  offer_group_count: number;
  offer_size_count: number;
  created_at?: string | null;
}
export interface SnapshotRatio {
  ratio_label: string;
  ratio_title?: string | null;
  group_count: number;
  country_count: number;
}
export interface SnapshotCategory {
  category_id: string;
  label: string;
  material_label?: string | null;
  frame_label?: string | null;
  baseline_size_labels: string[];
  fixed_attributes: Record<string, string>;
  recommended_defaults: Record<string, string>;
  allowed_attributes: Record<string, string[]>;
}
export interface SnapshotSizeEntry {
  slot_size_label: string;
  size_label: string;
  available: boolean;
  source_country?: string | null;
  currency?: string | null;
  total_cost?: number | null;
  delivery_days?: string | null;
  default_shipping_tier?: string | null;
  shipping_method?: string | null;
  service_name?: string | null;
  service_level?: string | null;
  shipping_profiles: Array<{
    tier: string;
    shipping_method?: string | null;
    service_name?: string | null;
    service_level?: string | null;
    source_country?: string | null;
    currency?: string | null;
    shipping_price?: number | null;
    total_cost?: number | null;
    delivery_days?: string | null;
  }>;
  shipping_support: {
    status: "covered" | "blocked" | "unavailable";
    chosen_tier?: string | null;
    chosen_shipping_method?: string | null;
    chosen_shipping_price?: number | null;
    chosen_product_price?: number | null;
    chosen_currency?: string | null;
    chosen_delivery_days?: string | null;
    eligible_tiers?: string[];
    available_tiers?: string[];
    available_profiles?: Array<{
      tier: string;
      shipping_method?: string | null;
      service_name?: string | null;
      service_level?: string | null;
      source_country?: string | null;
      currency?: string | null;
      product_price?: number | null;
      shipping_price?: number | null;
      total_cost?: number | null;
      delivery_days?: string | null;
    }>;
    cheapest_tier?: string | null;
    cheapest_shipping_price?: number | null;
    note: string;
    reason?: string | null;
  };
  business_policy: {
    shipping_mode: "included" | "pass_through" | "hide";
    policy_family:
      | "print_shipping_at_checkout"
      | "shipping_at_checkout"
      | "unknown";
    markup_multiplier?: number | null;
    retail_product_price?: number | null;
    customer_shipping_price?: number | null;
    shipping_price_for_margin?: number | null;
    shipping_reference_price?: number | null;
    shipping_credit_applied?: number | null;
    reason: string;
  };
}
export interface SnapshotCell {
  category_id: string;
  available: boolean;
  storefront_action: "show" | "show_with_notice" | "hide";
  fulfillment_level: "local" | "regional" | "cross_border" | "unsupported";
  geography_scope: "domestic" | "europe" | "international" | "none";
  tax_risk: "low" | "elevated" | "none";
  effective_fulfillment_level:
    | "local"
    | "regional"
    | "cross_border"
    | "mixed"
    | "unsupported";
  effective_geography_scope:
    | "domestic"
    | "europe"
    | "international"
    | "mixed"
    | "none";
  effective_tax_risk: "low" | "elevated" | "none";
  source_mix:
    | "local_only"
    | "regional_only"
    | "cross_border_only"
    | "mixed"
    | "none";
  source_countries: string[];
  fastest_delivery_days?: string | null;
  available_shipping_tiers?: string[];
  default_shipping_tier?: string | null;
  shipping_support: {
    status: "covered" | "blocked" | "unavailable";
    covered_size_count: number;
    review_size_count: number;
    blocked_size_count: number;
    unavailable_size_count: number;
    dominant_tier?: string | null;
    chosen_tier_counts?: Record<string, number>;
    min_supported_shipping_price?: number | null;
    max_supported_shipping_price?: number | null;
  };
  business_summary: {
    policy_family: "print_shipping_at_checkout" | "shipping_at_checkout";
    default_shipping_mode: "included" | "pass_through" | "hide";
    included_size_count: number;
    pass_through_size_count: number;
    hidden_size_count: number;
    available_size_count: number;
  };
  available_size_count: number;
  price_range: {
    currency?: string | null;
    min_total?: number | null;
    max_total?: number | null;
  };
  fixed_attributes: Record<string, string>;
  recommended_defaults: Record<string, string>;
  allowed_attributes: Record<string, string[]>;
  shipping_metrics: {
    currency?: string | null;
    avg_covered_shipping_price?: number | null;
    median_covered_shipping_price?: number | null;
  };
  size_entries: SnapshotSizeEntry[];
}
export interface SnapshotCountry {
  country_code: string;
  country_name: string;
  market_priority: {
    rank: number;
    segment: "core" | "focus" | "expansion" | "long_tail";
    is_priority: boolean;
  };
  shipping_summary: {
    currency?: string | null;
    mixed_currency?: boolean;
    avg_covered_shipping_price?: number | null;
    median_covered_shipping_price?: number | null;
    suggested_badge_cap?: number | null;
    covered_category_count: number;
    category_summaries: Array<{
      category_id: string;
      currency?: string | null;
      avg_covered_shipping_price?: number | null;
      median_covered_shipping_price?: number | null;
      covered_size_count: number;
      blocked_size_count: number;
      available_size_count: number;
      shipping_mode?: "included" | "pass_through" | "hide";
      included_size_count: number;
      pass_through_size_count: number;
      hidden_size_count: number;
    }>;
  };
  entry_promo: {
    overall: {
      eligible: boolean;
      note: string;
      missing_categories: string[];
      blocked_categories: string[];
    };
    paper_print: {
      eligible: boolean;
      note: string;
      missing_categories: string[];
      blocked_categories: string[];
    };
    canvas: {
      eligible: boolean;
      note: string;
      missing_categories: string[];
      blocked_categories: string[];
    };
  };
  category_cells: SnapshotCell[];
}
export interface SnapshotResponse {
  has_active_bake: boolean;
  message: string;
  bake?: SnapshotBake;
  ratios: SnapshotRatio[];
  selected_ratio?: string | null;
  shipping_support_policy?: {
    checkout_shipping_cap: number;
    preferred_tier_order: string[];
  };
  business_policy?: {
    entry_badge_category_groups: Record<string, string[]>;
    print_shipping_at_checkout_categories: string[];
    print_delivery_subsidy_budget: number;
    policy_note: string;
  };
  categories: SnapshotCategory[];
  countries: SnapshotCountry[];
  entry_promo_summary?: {
    eligible_country_count: number;
    ineligible_country_count: number;
    eligible_country_codes: string[];
    paper_eligible_country_count: number;
    canvas_eligible_country_count: number;
    paper_eligible_country_codes: string[];
    canvas_eligible_country_codes: string[];
  };
  priority_market_summary?: {
    strategy_note: string;
    focus_countries: Array<{
      country_code: string;
      country_name: string;
      market_rank: number;
      market_segment: "core" | "focus" | "expansion" | "long_tail";
      currency?: string | null;
      mixed_currency?: boolean;
      avg_covered_shipping_price?: number | null;
      median_covered_shipping_price?: number | null;
      suggested_badge_cap?: number | null;
      entry_badge_eligible: boolean;
      entry_badge_note: string;
      paper_entry_badge_eligible: boolean;
      paper_entry_badge_note: string;
      canvas_entry_badge_eligible: boolean;
      canvas_entry_badge_note: string;
      covered_category_count: number;
      category_summaries: Array<{
        category_id: string;
        category_label: string;
        currency?: string | null;
        avg_covered_shipping_price?: number | null;
        median_covered_shipping_price?: number | null;
        covered_size_count: number;
        blocked_size_count: number;
        available_size_count: number;
        shipping_mode?: "included" | "pass_through" | "hide";
        included_size_count: number;
        pass_through_size_count: number;
        hidden_size_count: number;
      }>;
    }>;
  };
}
