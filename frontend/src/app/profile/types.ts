export interface ProfileOrderItem {
  id: number;
  artwork_id: number;
  edition_type: string;
  finish: string;
  size: string | null;
  price: number;
  artwork?: {
    id: number;
    title: string;
    images?: (string | { thumb: string; medium: string; original: string })[];
  };
}

export interface ProfileOrder {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  total_price: number;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_country_code: string | null;
  tracking_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  confirmed_at: string | null;
  print_ordered_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  items: ProfileOrderItem[];
}
