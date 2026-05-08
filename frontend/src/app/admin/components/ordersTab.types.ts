type OrderDetailTab = "overview" | "lifecycle" | "prodigi" | "activity";

type ProdigiMode = "automatic" | "manual";
type MainOrdersTab = "active" | "completed" | "advanced";
type OrderFilterType = "payment" | "fulfillment";

interface OrderArtworkImage {
  thumb?: string;
  medium?: string;
  large?: string;
  original?: string;
}

type OrderImage = string | OrderArtworkImage;

interface AdminOrderItem {
  id?: number;
  edition_type?: string;
  price?: number | string | null;
  artwork?: {
    title?: string | null;
    images?: OrderImage[];
  } | null;
  [key: string]: unknown;
}

interface AdminOrder {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  country?: string | null;
  postal_code?: string | null;
  notes?: string | null;
  created_at: string;
  total_price?: number | string | null;
  payment_status: string;
  fulfillment_status: string;
  checkout_segment?: string | null;
  items?: AdminOrderItem[];
  tracking_number?: string | null;
  carrier?: string | null;
  [key: string]: unknown;
}

type OrderEditData = Partial<AdminOrder> & { id: number };
type ProdigiRecord = Record<string, any>;

interface ProdigiFlow {
  items?: ProdigiRecord[];
  jobs?: ProdigiRecord[];
  gates?: ProdigiRecord[];
  events?: ProdigiRecord[];
  summary?: ProdigiRecord[];
  settings?: {
    fulfillment_mode?: string;
    prodigi_api_mode?: string;
    [key: string]: unknown;
  };
  preflight_status?: string;
  manual_submit_blocker?: string;
  can_submit_manually?: boolean;
  webhook_status?: ProdigiRecord;
  webhook_readiness?: ProdigiRecord;
  latest_webhook_event?: ProdigiRecord;
  latest_status_poll_event?: ProdigiRecord;
  [key: string]: unknown;
}

interface FulfillmentPatchExtra {
  tracking_number?: string;
  carrier?: string;
  notes?: string;
}

export type {
  AdminOrder,
  AdminOrderItem,
  FulfillmentPatchExtra,
  MainOrdersTab,
  OrderDetailTab,
  OrderEditData,
  OrderFilterType,
  ProdigiFlow,
  ProdigiRecord,
  ProdigiMode,
};
