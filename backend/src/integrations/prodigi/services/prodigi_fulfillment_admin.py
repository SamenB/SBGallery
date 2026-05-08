from __future__ import annotations

from src.config import settings
from src.exeptions import InvalidDataException
from src.integrations.prodigi.fulfillment.contract import callback_url as prodigi_callback_url
from src.integrations.prodigi.fulfillment.gates import aggregate_gate_status
from src.integrations.prodigi.fulfillment.workflow import ProdigiFulfillmentWorkflow
from src.integrations.prodigi.repositories.prodigi_fulfillment import (
    ProdigiFulfillmentRepository,
)
from src.models.site_settings import SiteSettingsOrm
from src.schemas.prodigi_fulfillment import (
    ProdigiFulfillmentEventRead,
    ProdigiFulfillmentGateResultRead,
    ProdigiFulfillmentJobRead,
)
from src.services.orders import OrderService

PRODIGI_SUBMITTED_STATUSES = {
    "submitted",
    "in_progress",
    "on_hold",
    "issue",
    "complete",
    "cancelled",
}


class ProdigiFulfillmentAdminService:
    def __init__(self, db):
        self.db = db
        self.repository = getattr(
            db,
            "prodigi_fulfillment",
            ProdigiFulfillmentRepository(db.session),
        )

    async def get_fulfillment_mode(self) -> dict:
        settings_obj = await self._get_or_create_settings()
        return {
            "mode": settings_obj.prodigi_fulfillment_mode,
            "prodigi_api_mode": self._prodigi_api_mode(),
            "auto_submit_enabled": settings_obj.prodigi_fulfillment_mode == "automatic",
        }

    async def update_fulfillment_mode(self, mode: str) -> dict:
        if mode not in {"automatic", "manual"}:
            raise InvalidDataException(detail="mode must be automatic or manual")
        settings_obj = await self._get_or_create_settings()
        settings_obj.prodigi_fulfillment_mode = mode
        await self.db.commit()
        return {
            "status": "OK",
            "mode": mode,
            "auto_submit_enabled": mode == "automatic",
        }

    async def get_order_flow(self, order_id: int) -> dict:
        order = await self.db.orders.get_one(id=order_id)
        settings_obj = await self._get_or_create_settings()
        jobs = await self.repository.get_jobs_for_order(order_id)
        gates = await self.repository.get_gates_for_order(order_id)
        events = await self.repository.get_events_for_order(order_id)

        latest_job = jobs[0] if jobs else None
        visible_gates = [gate for gate in gates if latest_job and gate.job_id == latest_job.id]
        if not latest_job:
            visible_gates = gates
        visible_events = [event for event in events if latest_job and event.job_id == latest_job.id]
        if not latest_job:
            visible_events = events

        latest_webhook_event = latest_prodigi_event(
            visible_events,
            event_type="webhook",
            exclude_stages={"received"},
        )
        latest_status_poll_event = latest_prodigi_event(
            visible_events,
            event_type="api_response",
            stages={"status_poll"},
        )
        print_items = [item for item in (order.items or []) if item.prodigi_sku]
        preflight_status = preflight_status_for_job(latest_job, visible_gates)
        already_submitted = job_has_been_submitted(latest_job)
        can_submit = (
            order.payment_status in {"paid", "mock_paid"}
            and bool(print_items)
            and preflight_status == "passed"
            and not already_submitted
        )

        return {
            "order": {
                "id": order.id,
                "payment_status": order.payment_status,
                "fulfillment_status": order.fulfillment_status,
                "confirmed_at": order.confirmed_at,
                "created_at": order.created_at,
            },
            "settings": {
                "fulfillment_mode": settings_obj.prodigi_fulfillment_mode,
                "prodigi_api_mode": self._prodigi_api_mode(),
                "webhook_secret_configured": bool(settings.PRODIGI_WEBHOOK_SECRET),
                "public_base_url": settings.PUBLIC_BASE_URL,
            },
            "webhook_status": serialize_webhook_status(
                latest_job=latest_job,
                latest_webhook_event=latest_webhook_event,
                latest_status_poll_event=latest_status_poll_event,
            ),
            "webhook_readiness": serialize_webhook_readiness(),
            "latest_webhook_event": serialize_event(latest_webhook_event)
            if latest_webhook_event
            else None,
            "latest_status_poll_event": serialize_event(latest_status_poll_event)
            if latest_status_poll_event
            else None,
            "can_submit_manually": can_submit,
            "manual_submit_blocker": manual_submit_blocker(
                order,
                print_items,
                preflight_status,
                latest_job,
            ),
            "preflight_status": preflight_status,
            "latest_job_id": latest_job.id if latest_job else None,
            "summary": build_prodigi_flow_summary(
                order, latest_job, print_items, visible_gates, visible_events
            ),
            "items": [serialize_prodigi_item(item) for item in print_items],
            "jobs": [serialize_job(job) for job in jobs],
            "gates": [serialize_gate(gate) for gate in visible_gates],
            "events": [serialize_event(event) for event in visible_events],
            "job_ids": [job.id for job in jobs],
        }

    async def run_preflight(self, order_id: int) -> dict:
        order = await self.db.orders.get_one(id=order_id)
        reusable_job = await self.repository.get_reusable_preflight_job(
            order_id,
            self._prodigi_api_mode(),
        )
        if reusable_job is None:
            await ProdigiFulfillmentWorkflow(self.db.session).run_preflight(order)
        return await self.get_order_flow(order_id)

    async def submit_order(self, order_id: int) -> dict:
        latest_job = await self.repository.get_latest_job_for_order(order_id)
        if not job_has_been_submitted(latest_job):
            await OrderService(self.db).submit_order_to_print_provider(order_id)
        return await self.get_order_flow(order_id)

    async def request_status(self, order_id: int) -> dict:
        latest_job = await self.repository.get_latest_job_orm_for_order(order_id)
        if latest_job is None or not latest_job.prodigi_order_id:
            raise InvalidDataException(
                detail="This order has not been submitted to Prodigi yet.",
                status_code=409,
            )
        await ProdigiFulfillmentWorkflow(self.db.session).poll_status(latest_job)
        return await self.get_order_flow(order_id)

    async def _get_or_create_settings(self) -> SiteSettingsOrm:
        settings_obj = await self.db.session.get(SiteSettingsOrm, 1)
        if not settings_obj:
            settings_obj = SiteSettingsOrm(id=1)
            self.db.session.add(settings_obj)
            await self.db.commit()
            await self.db.session.refresh(settings_obj)
        return settings_obj

    def _prodigi_api_mode(self) -> str:
        return "sandbox" if settings.PRODIGI_SANDBOX else "live"


def build_prodigi_flow_summary(
    order,
    latest_job: ProdigiFulfillmentJobRead | None,
    print_items: list,
    gates: list[ProdigiFulfillmentGateResultRead],
    events: list[ProdigiFulfillmentEventRead],
) -> list[dict]:
    gate_statuses = {gate.gate: gate.status for gate in gates}
    has_status_update = any(
        (
            event.event_type == "webhook"
            and event.stage not in {"received"}
            and event.status in {"passed", "issue"}
        )
        or (
            event.event_type == "api_response"
            and event.stage in {"submit_order", "status_poll"}
            and event.status == "passed"
            and latest_job is not None
            and bool(latest_job.status_stage)
        )
        for event in events
    )

    paid = order.payment_status in {"paid", "mock_paid"}
    has_prints = bool(print_items)
    submitted = job_has_been_submitted(latest_job)
    failed = latest_job is not None and latest_job.status in {"failed", "blocked"}

    steps = [
        flow_step_from_gates(
            key="payment_confirmed",
            label="Payment confirmed",
            purpose="Confirms the order is legally allowed to enter fulfillment.",
            gate_names=["payment_confirmed"],
            gates=gates,
            fallback_status="passed" if paid else "pending",
            fallback_detail=(
                "Monobank payment is confirmed." if paid else "Waiting for Monobank success."
            ),
            fallback_measured={"payment_status": order.payment_status},
            fallback_expected={"payment_status": ["paid", "mock_paid"]},
            next_action="Wait for payment callback or mark the test order as mock_paid.",
            timestamp=order.confirmed_at,
        ),
        flow_step_from_gates(
            key="print_items_detected",
            label="Print items detected",
            purpose="Finds local order items that must be fulfilled through Prodigi.",
            gate_names=["print_items_detected"],
            gates=gates,
            fallback_status="passed" if has_prints else "skipped",
            fallback_detail=f"{len(print_items)} Prodigi-backed print item(s) in this order.",
            fallback_measured={"count": len(print_items)},
            fallback_expected={"count": ">=1"},
            next_action="Recreate the order with a Prodigi-backed print item.",
        ),
        flow_step_from_gates(
            key="cost_covered",
            label="Cost covered",
            purpose="Blocks accidental loss-making fulfillment from persisted checkout economics.",
            gate_names=["cost_covered"],
            gates=gates,
            fallback_status="pending",
            fallback_detail="Run Refresh to compare paid total against Prodigi supplier cost.",
            fallback_measured=None,
            fallback_expected={"customer_paid": ">= supplier_total"},
            next_action="Fix storefront pricing, collect adjustment, or recreate the order.",
        ),
        flow_step_from_gates(
            key="job_created",
            label="Fulfillment job created",
            purpose="Creates the durable local lifecycle record for this Prodigi submission attempt.",
            gate_names=["job_created"],
            gates=gates,
            fallback_status="passed"
            if latest_job
            else ("pending" if paid and has_prints else "skipped"),
            fallback_detail=(
                f"Job #{latest_job.id}, status {latest_job.status}."
                if latest_job
                else "No Prodigi job has been created yet."
            ),
            fallback_measured=(
                {
                    "job_id": latest_job.id,
                    "revision": latest_job.submission_revision,
                    "idempotency_key": latest_job.idempotency_key,
                }
                if latest_job
                else None
            ),
            fallback_expected={"job": "persisted"},
            next_action="Run Refresh to create a preflight job.",
            timestamp=latest_job.created_at if latest_job else None,
        ),
        flow_step_from_gates(
            key="recipient_ready",
            label="Recipient ready",
            purpose="Validates the exact shipping identity and address fields Prodigi receives.",
            gate_names=["recipient_ready"],
            gates=gates,
            fallback_status="pending",
            fallback_detail="Run Refresh to validate recipient fields.",
            fallback_measured=None,
            fallback_expected={"address": "Prodigi required fields present"},
            next_action="Edit the order shipping address fields.",
        ),
        flow_step_from_gates(
            key="storefront_rehydrated",
            label="Storefront rehydrated",
            purpose="Re-checks SKU, category, country, slot, attributes, shipping, and cost basis from the active bake.",
            gate_names=["storefront_rehydrated"],
            gates=gates,
            fallback_status="pending",
            fallback_detail="Run Refresh to rehydrate each item from the active Prodigi bake.",
            fallback_measured=None,
            fallback_expected={"source": "active_prodigi_storefront_bake"},
            next_action="Rebuild the active bake or recreate the order from current storefront offers.",
        ),
        flow_step_from_gates(
            key="pixel_contract",
            label="Live pixel contract",
            purpose="Checks live Prodigi print-area pixels against our baked target within 2px.",
            gate_names=[
                "live_prodigi_pixel_contract_verified",
                "live_prodigi_aspect_compatible",
            ],
            gates=gates,
            fallback_status=gate_statuses.get("live_prodigi_pixel_contract_verified", "pending"),
            fallback_detail="Prodigi pixel dimensions checked against our baked target.",
            fallback_measured=None,
            fallback_expected={"allowed_drift_px": 2},
            next_action="Refresh the bake or inspect the SKU/Product Details response.",
        ),
        flow_step_from_gates(
            key="quote_check",
            label="Prodigi quote check",
            purpose="Confirms Prodigi accepts SKU, attributes, print area, country, and shipping method before order creation.",
            gate_names=["prodigi_quote_check"],
            gates=gates,
            fallback_status="pending",
            fallback_detail="Run Refresh to call the Prodigi Quote endpoint.",
            fallback_measured=None,
            fallback_expected={"quote_outcome": "Created|Ok"},
            next_action="Fix SKU, attributes, destination country, or shipping method.",
        ),
        flow_step_from_gates(
            key="asset_rendered",
            label="Order asset rendered",
            purpose="Renders the PNG that Prodigi will download and checks exact output pixels.",
            gate_names=[
                "asset_rendered",
                "rendered_asset_pixel_match",
                "rendered_asset_md5_ready",
            ],
            gates=gates,
            fallback_status=gate_statuses.get("rendered_asset_pixel_match", "pending"),
            fallback_detail="Rendered file is checked pixel-for-pixel before submit.",
            fallback_measured=None,
            fallback_expected={"format": "PNG", "pixels": "exact target"},
            next_action="Upload/fix the master asset or inspect render dimensions.",
        ),
        flow_step_from_gates(
            key="asset_public_url",
            label="Asset public URL",
            purpose="Ensures Prodigi can download the rendered PNG through a public HTTPS URL.",
            gate_names=["public_asset_url_ready", "public_asset_download_verified"],
            gates=gates,
            fallback_status="pending",
            fallback_detail="Run Refresh to verify the public asset URL and md5 hash.",
            fallback_measured=None,
            fallback_expected={"external_https": True, "md5": "present"},
            next_action=(
                "Configure PRINT_ASSET_STORAGE_BACKEND=s3_compatible and a public "
                "PRINT_ASSET_PUBLIC_BASE_URL, then run Refresh again."
            ),
        ),
        flow_step_from_gates(
            key="payload_valid",
            label="Payload valid",
            purpose="Builds and validates the exact order JSON that will be sent to Prodigi.",
            gate_names=["payload_valid"],
            gates=gates,
            fallback_status="pending",
            fallback_detail="Run Refresh to build the Prodigi payload preview.",
            fallback_measured=None,
            fallback_expected={"prodigi_order_payload": "valid"},
            next_action="Fix the failed measured field before submitting.",
        ),
    ]
    steps.extend(
        [
            {
                "key": "prodigi_submit",
                "label": "Submit to Prodigi",
                "purpose": "Creates the Prodigi order with POST /orders after preflight is green.",
                "status": "passed" if submitted else ("failed" if failed else "pending"),
                "detail": (
                    f"Prodigi order {latest_job.prodigi_order_id}."
                    if submitted
                    else latest_job.last_error
                    if failed
                    else "Not submitted yet."
                ),
                "expected": {
                    "prodigi_response_outcome": "Created|OnHold|CreatedWithIssues|AlreadyExists"
                },
                "measured": {
                    "prodigi_order_id": latest_job.prodigi_order_id if latest_job else None,
                    "job_status": latest_job.status if latest_job else None,
                    "last_error": latest_job.last_error if latest_job else None,
                },
                "request_payload": latest_job.request_payload if latest_job else None,
                "error": latest_job.last_error if failed and latest_job else None,
                "next_action": "Fix red preflight gates, then submit again.",
                "timestamp": latest_job.updated_at if latest_job else None,
            },
            {
                "key": "prodigi_callback",
                "label": "Prodigi callback/status",
                "purpose": "Persists Prodigi webhook or immediate status-poll data after order creation.",
                "status": "passed" if has_status_update else "pending",
                "detail": (
                    f"Latest Prodigi stage: {latest_job.status_stage}."
                    if has_status_update and latest_job and latest_job.status_stage
                    else "Awaiting status updates from Prodigi after order creation."
                ),
                "expected": {"status_update": "webhook or GET /orders/{id} snapshot persisted"},
                "measured": {
                    "status_stage": latest_job.status_stage if latest_job else None,
                    "status_details": latest_job.status_details if latest_job else None,
                    "issues": latest_job.issues if latest_job else None,
                },
                "next_action": "Wait for webhook or poll Prodigi status.",
            },
        ]
    )
    return steps


def preflight_status_for_job(
    latest_job: ProdigiFulfillmentJobRead | None,
    gates: list[ProdigiFulfillmentGateResultRead],
) -> str:
    if latest_job is None:
        return "pending"
    if latest_job.status == "preflight_passed":
        return "passed"
    if latest_job.status in {"blocked", "failed"}:
        return "failed"
    return aggregate_gate_status(gate.status for gate in gates)


def job_has_been_submitted(latest_job: ProdigiFulfillmentJobRead | None) -> bool:
    return bool(
        latest_job is not None
        and latest_job.prodigi_order_id
        and latest_job.status in PRODIGI_SUBMITTED_STATUSES
    )


def latest_prodigi_event(
    events: list[ProdigiFulfillmentEventRead],
    *,
    event_type: str,
    stages: set[str] | None = None,
    exclude_stages: set[str] | None = None,
) -> ProdigiFulfillmentEventRead | None:
    matched = []
    for event in events:
        if event.event_type != event_type:
            continue
        if stages is not None and event.stage not in stages:
            continue
        if exclude_stages is not None and event.stage in exclude_stages:
            continue
        matched.append(event)
    return max(matched, key=lambda event: event.created_at) if matched else None


def serialize_webhook_readiness() -> dict:
    public_base_url = settings.PUBLIC_BASE_URL
    normalized_public_url = (public_base_url or "").strip().lower()
    return {
        "prodigi_api_mode": "sandbox" if settings.PRODIGI_SANDBOX else "live",
        "public_base_url": public_base_url,
        "public_base_url_present": bool(public_base_url),
        "public_base_url_is_https": normalized_public_url.startswith("https://"),
        "webhook_secret_configured": bool(settings.PRODIGI_WEBHOOK_SECRET),
        "callback_url": prodigi_callback_url(),
    }


def serialize_webhook_status(
    *,
    latest_job: ProdigiFulfillmentJobRead | None,
    latest_webhook_event: ProdigiFulfillmentEventRead | None,
    latest_status_poll_event: ProdigiFulfillmentEventRead | None,
) -> dict:
    if latest_job is None or not latest_job.prodigi_order_id:
        state = "No Prodigi order yet"
        source = None
        latest_event = None
    elif latest_webhook_event is not None and (
        latest_status_poll_event is None
        or latest_webhook_event.created_at >= latest_status_poll_event.created_at
    ):
        state = "Webhook received"
        source = "webhook"
        latest_event = latest_webhook_event
    elif latest_status_poll_event is not None:
        state = "Manual request received"
        source = "status_poll"
        latest_event = latest_status_poll_event
    else:
        state = "Awaiting webhook"
        source = None
        latest_event = None

    return {
        "state": state,
        "source": source,
        "prodigi_order_id": latest_job.prodigi_order_id if latest_job else None,
        "status_stage": latest_job.status_stage if latest_job else None,
        "job_status": latest_job.status if latest_job else None,
        "latest_event_id": latest_event.id if latest_event else None,
        "latest_event_at": latest_event.created_at if latest_event else None,
    }


def manual_submit_blocker(
    order,
    print_items: list,
    preflight_status: str,
    latest_job: ProdigiFulfillmentJobRead | None,
) -> str | None:
    if job_has_been_submitted(latest_job):
        return "This order has already been submitted to Prodigi."
    if order.payment_status not in {"paid", "mock_paid"}:
        return "Payment must be confirmed before Prodigi submit."
    if not print_items:
        return "No Prodigi-backed print items were detected."
    if preflight_status != "passed":
        return "Run Refresh and fix every failed preflight gate before submitting."
    return None


def flow_step_from_gates(
    *,
    key: str,
    label: str,
    purpose: str,
    gate_names: list[str],
    gates: list[ProdigiFulfillmentGateResultRead],
    fallback_status: str,
    fallback_detail: str,
    fallback_measured,
    fallback_expected,
    next_action: str,
    timestamp=None,
) -> dict:
    matched = [gate for gate in gates if gate.gate in set(gate_names)]
    if not matched:
        return {
            "key": key,
            "label": label,
            "purpose": purpose,
            "status": fallback_status,
            "detail": fallback_detail,
            "expected": fallback_expected,
            "measured": fallback_measured,
            "error": None,
            "next_action": next_action if fallback_status != "passed" else None,
            "timestamp": timestamp,
        }

    status = aggregate_gate_status(gate.status for gate in matched)
    failed = [gate for gate in matched if gate.status in {"failed", "blocked"}]
    passed_count = sum(1 for gate in matched if gate.status in {"passed", "skipped"})
    first_error = next((gate.error for gate in failed if gate.error), None)
    if len(matched) == 1:
        measured = matched[0].measured
        expected = matched[0].expected
    else:
        measured = {
            "passed": passed_count,
            "total": len(matched),
            "gates": [
                {
                    "gate": gate.gate,
                    "status": gate.status,
                    "order_item_id": gate.order_item_id,
                    "measured": gate.measured,
                    "error": gate.error,
                }
                for gate in matched
            ],
        }
        expected = {
            "all_gates": "passed or skipped",
            "gates": [
                {"gate": gate.gate, "order_item_id": gate.order_item_id, "expected": gate.expected}
                for gate in matched
            ],
        }
    blocked_or_failed = status in {"failed", "blocked"}
    return {
        "key": key,
        "label": label,
        "purpose": purpose,
        "status": status,
        "detail": (
            f"{passed_count}/{len(matched)} check(s) passed."
            if not blocked_or_failed
            else first_error or f"{len(failed)} check(s) failed."
        ),
        "expected": expected,
        "measured": measured,
        "error": first_error,
        "next_action": next_action if status != "passed" else None,
        "timestamp": timestamp or max((gate.created_at for gate in matched), default=None),
    }


def float_or_none(value) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def resolve_prodigi_item_economics(item) -> dict:
    customer_line = float_or_none(item.customer_line_total)
    if customer_line is None:
        customer_line = float_or_none(item.price) or 0.0

    customer_product = float_or_none(item.customer_product_price)
    if customer_product is None:
        customer_product = float_or_none(item.prodigi_retail_eur)
    if customer_product is None:
        customer_product = customer_line

    customer_shipping = float_or_none(item.customer_shipping_price)
    if customer_shipping is None:
        customer_shipping = max(customer_line - customer_product, 0.0)

    if abs((customer_product + customer_shipping) - customer_line) > 0.01:
        customer_shipping = max(customer_line - customer_product, 0.0)

    supplier_product = float_or_none(item.prodigi_wholesale_eur) or 0.0
    supplier_shipping = float_or_none(item.prodigi_shipping_eur) or 0.0
    supplier_total = float_or_none(item.prodigi_supplier_total_eur)
    if supplier_total is None:
        supplier_total = supplier_product + supplier_shipping

    return {
        "customer_product_price": customer_product,
        "customer_shipping_price": customer_shipping,
        "customer_line_total": customer_line,
        "customer_currency": item.customer_currency or "USD",
        "supplier_product_cost": supplier_product,
        "supplier_shipping_cost": supplier_shipping,
        "supplier_total_cost": supplier_total,
        "supplier_currency": item.prodigi_supplier_currency or "EUR",
        "storefront_bake_id": item.prodigi_storefront_bake_id,
        "storefront_policy_version": item.prodigi_storefront_policy_version,
        "selected_shipping_tier": item.prodigi_shipping_tier,
        "selected_shipping_method": item.prodigi_shipping_method,
        "selected_delivery_days": item.prodigi_delivery_days,
        "product_margin": customer_product - supplier_product,
        "shipping_margin": customer_shipping - supplier_shipping,
        "total_margin": customer_line - supplier_total,
    }


def serialize_prodigi_item(item) -> dict:
    economics = resolve_prodigi_item_economics(item)
    return {
        "id": item.id,
        "artwork_id": item.artwork_id,
        "title": getattr(getattr(item, "artwork", None), "title", None),
        "edition_type": item.edition_type,
        "finish": item.finish,
        "size": item.size,
        "price": item.price,
        "customer_product_price": economics["customer_product_price"],
        "customer_shipping_price": economics["customer_shipping_price"],
        "customer_line_total": economics["customer_line_total"],
        "customer_currency": economics["customer_currency"],
        "prodigi_storefront_offer_size_id": item.prodigi_storefront_offer_size_id,
        "prodigi_sku": item.prodigi_sku,
        "prodigi_category_id": item.prodigi_category_id,
        "prodigi_slot_size_label": item.prodigi_slot_size_label,
        "prodigi_attributes": item.prodigi_attributes,
        "prodigi_storefront_bake_id": item.prodigi_storefront_bake_id,
        "prodigi_storefront_policy_version": item.prodigi_storefront_policy_version,
        "prodigi_shipping_tier": item.prodigi_shipping_tier,
        "prodigi_shipping_method": item.prodigi_shipping_method,
        "prodigi_delivery_days": item.prodigi_delivery_days,
        "prodigi_order_id": item.prodigi_order_id,
        "prodigi_status": item.prodigi_status,
        "prodigi_wholesale_eur": item.prodigi_wholesale_eur,
        "prodigi_shipping_eur": item.prodigi_shipping_eur,
        "prodigi_supplier_total_eur": item.prodigi_supplier_total_eur,
        "prodigi_retail_eur": item.prodigi_retail_eur,
        "prodigi_supplier_currency": item.prodigi_supplier_currency,
        "prodigi_destination_country_code": item.prodigi_destination_country_code,
        "economics": economics,
    }


def serialize_job(job: ProdigiFulfillmentJobRead) -> dict:
    return {
        "id": job.id,
        "status": job.status,
        "mode": job.mode,
        "merchant_reference": job.merchant_reference,
        "idempotency_key": job.idempotency_key,
        "prodigi_order_id": job.prodigi_order_id,
        "attempt_count": job.attempt_count,
        "payload_hash": job.payload_hash,
        "status_stage": job.status_stage,
        "status_details": job.status_details,
        "issues": job.issues,
        "submitted_at": job.submitted_at,
        "submission_revision": job.submission_revision,
        "request_payload": job.request_payload,
        "response_payload": job.response_payload,
        "latest_status_payload": job.latest_status_payload,
        "last_error": job.last_error,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }


def serialize_gate(gate: ProdigiFulfillmentGateResultRead) -> dict:
    return {
        "id": gate.id,
        "job_id": gate.job_id,
        "order_item_id": gate.order_item_id,
        "gate": gate.gate,
        "status": gate.status,
        "measured": gate.measured,
        "expected": gate.expected,
        "error": gate.error,
        "created_at": gate.created_at,
    }


def serialize_event(event: ProdigiFulfillmentEventRead) -> dict:
    return {
        "id": event.id,
        "job_id": event.job_id,
        "order_item_id": event.order_item_id,
        "event_type": event.event_type,
        "event_uid": event.event_uid,
        "stage": event.stage,
        "status": event.status,
        "external_id": event.external_id,
        "request_payload": event.request_payload,
        "response_payload": event.response_payload,
        "metadata": event.metadata_json,
        "error": event.error,
        "created_at": event.created_at,
    }
