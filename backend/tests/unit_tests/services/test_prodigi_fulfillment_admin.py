from datetime import datetime, timedelta

import pytest

from src.exeptions import InvalidDataException
from src.integrations.prodigi.services.prodigi_fulfillment_admin import (
    ProdigiFulfillmentAdminService,
    latest_prodigi_event,
    serialize_event,
    serialize_webhook_readiness,
    serialize_webhook_status,
)
from src.schemas.prodigi_fulfillment import (
    ProdigiFulfillmentEventRead,
    ProdigiFulfillmentJobRead,
)


def _event(
    *,
    event_id: int,
    event_type: str,
    stage: str,
    created_at: datetime,
    status: str = "passed",
    response_payload: dict | None = None,
) -> ProdigiFulfillmentEventRead:
    return ProdigiFulfillmentEventRead(
        id=event_id,
        job_id=7,
        order_id=101,
        event_type=event_type,
        event_uid=f"evt-{event_id}",
        stage=stage,
        status=status,
        external_id="prodigi-123",
        response_payload=response_payload or {"order": {"id": "prodigi-123"}},
        created_at=created_at,
    )


def _job(*, status: str = "in_progress", status_stage: str = "inProgress"):
    return ProdigiFulfillmentJobRead(
        id=7,
        order_id=101,
        status=status,
        mode="sandbox",
        merchant_reference="artshop-order-101",
        idempotency_key="artshop-order-101-fulfillment-v1",
        prodigi_order_id="prodigi-123",
        item_ids=[11],
        status_stage=status_stage,
    )


def test_prodigi_flow_distinguishes_latest_webhook_and_status_poll():
    now = datetime(2026, 5, 6, 12, 0, 0)
    received = _event(
        event_id=1,
        event_type="webhook",
        stage="received",
        created_at=now,
    )
    webhook = _event(
        event_id=2,
        event_type="webhook",
        stage="inProgress",
        created_at=now + timedelta(minutes=1),
    )
    poll = _event(
        event_id=3,
        event_type="api_response",
        stage="status_poll",
        created_at=now + timedelta(minutes=2),
    )

    latest_webhook = latest_prodigi_event(
        [received, webhook, poll],
        event_type="webhook",
        exclude_stages={"received"},
    )
    latest_poll = latest_prodigi_event(
        [received, webhook, poll],
        event_type="api_response",
        stages={"status_poll"},
    )

    assert latest_webhook is webhook
    assert latest_poll is poll

    status = serialize_webhook_status(
        latest_job=_job(),
        latest_webhook_event=latest_webhook,
        latest_status_poll_event=latest_poll,
    )

    assert status["state"] == "Manual request received"
    assert status["source"] == "status_poll"
    assert status["latest_event_id"] == 3


def test_prodigi_flow_reports_webhook_when_it_is_newer_than_poll():
    now = datetime(2026, 5, 6, 12, 0, 0)
    poll = _event(
        event_id=1,
        event_type="api_response",
        stage="status_poll",
        created_at=now,
    )
    webhook = _event(
        event_id=2,
        event_type="webhook",
        stage="complete",
        created_at=now + timedelta(minutes=1),
    )

    status = serialize_webhook_status(
        latest_job=_job(status="complete", status_stage="complete"),
        latest_webhook_event=webhook,
        latest_status_poll_event=poll,
    )

    assert status["state"] == "Webhook received"
    assert status["source"] == "webhook"
    assert status["latest_event_id"] == 2


def test_prodigi_event_serializer_exposes_raw_payloads_and_event_uid():
    created_at = datetime(2026, 5, 6, 12, 0, 0)
    event = _event(
        event_id=9,
        event_type="webhook",
        stage="complete",
        created_at=created_at,
        response_payload={"raw": True},
    ).model_copy(
        update={"request_payload": {"request": True}, "metadata_json": {"source": "prodigi"}}
    )

    payload = serialize_event(event)

    assert payload["event_uid"] == "evt-9"
    assert payload["external_id"] == "prodigi-123"
    assert payload["request_payload"] == {"request": True}
    assert payload["response_payload"] == {"raw": True}
    assert payload["metadata"] == {"source": "prodigi"}


def test_prodigi_webhook_readiness_exposes_callback_configuration(monkeypatch):
    monkeypatch.setattr(
        "src.integrations.prodigi.services.prodigi_fulfillment_admin.settings.PUBLIC_BASE_URL",
        "https://shop.example.test",
    )
    monkeypatch.setattr(
        "src.integrations.prodigi.services.prodigi_fulfillment_admin.settings.PRODIGI_WEBHOOK_SECRET",
        "secret",
    )
    monkeypatch.setattr(
        "src.integrations.prodigi.services.prodigi_fulfillment_admin.settings.PRODIGI_SANDBOX",
        True,
    )

    payload = serialize_webhook_readiness()

    assert payload["prodigi_api_mode"] == "sandbox"
    assert payload["public_base_url_present"] is True
    assert payload["public_base_url_is_https"] is True
    assert payload["webhook_secret_configured"] is True
    assert payload["callback_url"] == (
        "https://shop.example.test/api/v1/webhooks/prodigi?token=secret"
    )


@pytest.mark.asyncio
async def test_update_fulfillment_mode_uses_domain_exception_for_invalid_mode():
    class _DB:
        session = object()

    service = ProdigiFulfillmentAdminService(db=_DB())

    with pytest.raises(InvalidDataException) as exc_info:
        await service.update_fulfillment_mode("semi-auto")

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "mode must be automatic or manual"


@pytest.mark.asyncio
async def test_request_status_uses_domain_exception_before_prodigi_submit():
    class _Repository:
        async def get_latest_job_orm_for_order(self, order_id: int):
            return None

    class _DB:
        session = object()
        prodigi_fulfillment = _Repository()

    service = ProdigiFulfillmentAdminService(db=_DB())

    with pytest.raises(InvalidDataException) as exc_info:
        await service.request_status(101)

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == "This order has not been submitted to Prodigi yet."
