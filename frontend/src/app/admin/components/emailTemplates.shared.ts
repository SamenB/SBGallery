export interface EmailTemplate {
  id: number;
  key: string;
  trigger_event: string;
  send_to_customer: boolean;
  is_active: boolean;
  subject: string;
  body: string;
  note: string | null;
}

export const EVENT_GROUP_LABELS: Record<
  string,
  { label: string; desc: string }
> = {
  fulfillment: {
    label: "Order Fulfillment",
    desc: "Emails sent during order processing and shipping",
  },
  contact: {
    label: "Contact Form",
    desc: "Emails triggered by customer contact submissions",
  },
};

// ── Per-template metadata — trigger conditions and behaviour ──────────────────

export type TemplateMeta = {
  triggerDesc: string; // one-liner: when does this fire?
  triggeredBy: "auto" | "admin" | "customer"; // who causes the trigger
  triggerLabel: string; // short actor label
  warning?: string; // optional caution note
  infoTags?: string[]; // small pill badges shown on card
};

export const TEMPLATE_META: Record<string, TemplateMeta> = {
  fulfillment_confirmed: {
    triggerDesc:
      "Fires automatically when Monobank confirms payment via webhook. The admin cannot trigger this manually — it is sent as soon as payment.status transitions to 'paid'.",
    triggeredBy: "auto",
    triggerLabel: "Auto — Monobank webhook",
    infoTags: ["Payment confirmed", "No admin action needed"],
  },
  fulfillment_print_ordered: {
    triggerDesc:
      "Fires when admin advances the order to 'Print Ordered' step in the Orders tab. Notifies the customer that production has started.",
    triggeredBy: "admin",
    triggerLabel: "Admin → Orders tab → Advance to Print Ordered",
    infoTags: ["Admin action required"],
  },
  fulfillment_print_received: {
    triggerDesc:
      "This status is marked as SILENT — no email is sent. It is an internal pipeline step (print returned from studio) that is not visible to the customer.",
    triggeredBy: "admin",
    triggerLabel: "Admin → Orders tab → Advance to Print Received",
    warning:
      "Email is suppressed for this status regardless of this template's Active toggle. This is hardcoded in the backend (_SILENT_FULFILLMENT_STATUSES).",
    infoTags: ["Silent — no email sent", "Internal step only"],
  },
  fulfillment_packaging: {
    triggerDesc:
      "This status is marked as SILENT — no email is sent. It is an internal pipeline step (packaging) not communicated to the customer.",
    triggeredBy: "admin",
    triggerLabel: "Admin → Orders tab → Advance to Packaging",
    warning:
      "Email is suppressed for this status regardless of this template's Active toggle. This is hardcoded in the backend (_SILENT_FULFILLMENT_STATUSES).",
    infoTags: ["Silent — no email sent", "Internal step only"],
  },
  fulfillment_shipped: {
    triggerDesc:
      "Fires when admin marks order as 'Shipped' in the Orders tab. Includes tracking number, carrier name, and tracking URL if provided.",
    triggeredBy: "admin",
    triggerLabel: "Admin → Orders tab → Mark as Shipped",
    infoTags: ["Admin action required", "Tracking data included"],
  },
  fulfillment_delivered: {
    triggerDesc:
      "Fires when admin marks order as 'Delivered' in the Orders tab. Final notification in the fulfillment pipeline.",
    triggeredBy: "admin",
    triggerLabel: "Admin → Orders tab → Advance to Delivered",
    infoTags: ["Admin action required"],
  },
  fulfillment_cancelled: {
    triggerDesc:
      "Fires when an order is cancelled. Can happen: (1) admin manually cancels in Orders tab, (2) payment fails or is refunded — cancellation is automatic in that case.",
    triggeredBy: "auto",
    triggerLabel: "Admin manual cancel OR auto on payment failure/refund",
    infoTags: ["Auto OR manual", "Inventory auto-released"],
  },
  contact_autoreply: {
    triggerDesc:
      "Fires when a visitor submits the Contact Form on the site. This copy goes to the customer — a confirmation that their message was received.",
    triggeredBy: "customer",
    triggerLabel: "Customer submits Contact Form",
    infoTags: ["Customer copy"],
  },
  contact_admin: {
    triggerDesc:
      "Fires when a visitor submits the Contact Form on the site. This copy goes to the admin inbox with all message details.",
    triggeredBy: "customer",
    triggerLabel: "Customer submits Contact Form",
    infoTags: ["Admin inbox copy"],
  },
};

// ── Shared Styles ─────────────────────────────────────────────────────────────

export const emailTemplateInputClass =
  "w-full bg-white border border-[#31323E]/15 rounded-lg px-3.5 py-2.5 text-sm text-[#31323E] font-medium focus:outline-none focus:border-[#31323E]/50 focus:ring-2 focus:ring-[#31323E]/10 placeholder-[#31323E]/30 transition-all";

// ── Template Editor ───────────────────────────────────────────────────────────
