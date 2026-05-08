import { apiFetch, apiJson, getApiUrl } from "@/utils";
import type {
  AdminOrder,
  FulfillmentPatchExtra,
  OrderEditData,
  ProdigiFlow,
  ProdigiMode,
} from "./ordersTab.types";

export async function fetchOrdersList() {
  const response = await apiFetch(`${getApiUrl()}/orders`);
  return apiJson<AdminOrder[]>(response);
}

export async function fetchProdigiFulfillmentMode() {
  const response = await apiFetch(
    `${getApiUrl()}/orders/prodigi/fulfillment-mode`,
  );
  const payload = await apiJson<{ mode?: string }>(response);
  return payload.mode === "manual" ? "manual" : "automatic";
}

export async function updateProdigiFulfillmentMode(mode: ProdigiMode) {
  const response = await apiFetch(
    `${getApiUrl()}/orders/prodigi/fulfillment-mode`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    },
  );
  if (!response.ok) throw new Error("Failed to save Prodigi mode.");
}

export async function fetchProdigiFlow(orderId: number) {
  const response = await apiFetch(
    `${getApiUrl()}/orders/${orderId}/prodigi-flow`,
  );
  return apiJson<ProdigiFlow>(response);
}

export async function runProdigiPreflightRequest(orderId: number) {
  const response = await apiFetch(
    `${getApiUrl()}/orders/${orderId}/prodigi-preflight`,
    { method: "POST" },
  );
  return apiJson<ProdigiFlow>(response);
}

export async function submitProdigiOrderRequest(orderId: number) {
  const response = await apiFetch(
    `${getApiUrl()}/orders/${orderId}/prodigi-submit`,
    { method: "POST" },
  );
  return apiJson<ProdigiFlow>(response);
}

export async function pollProdigiStatusRequest(orderId: number) {
  const response = await apiFetch(
    `${getApiUrl()}/orders/${orderId}/prodigi-status-poll`,
    { method: "POST" },
  );
  return apiJson<ProdigiFlow>(response);
}

export async function patchOrderFulfillment(
  orderId: number,
  status: string,
  extra?: FulfillmentPatchExtra,
) {
  const body: Record<string, string> = { fulfillment_status: status };
  if (extra?.tracking_number) body.tracking_number = extra.tracking_number;
  if (extra?.carrier) body.carrier = extra.carrier;
  if (extra?.notes) body.notes = extra.notes;

  const response = await apiFetch(
    `${getApiUrl()}/orders/${orderId}/fulfillment`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw new Error("Fulfillment update failed.");
}

export async function patchOrder(
  orderId: number,
  payload: Partial<AdminOrder> | OrderEditData,
) {
  const response = await apiFetch(`${getApiUrl()}/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Order update failed.");
}

export async function deleteOrder(orderId: number) {
  const response = await apiFetch(`${getApiUrl()}/orders/${orderId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Order delete failed.");
}
