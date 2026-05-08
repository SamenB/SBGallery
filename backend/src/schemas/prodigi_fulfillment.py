from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ProdigiFulfillmentJobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    provider_key: str = "prodigi"
    status: str
    mode: str
    merchant_reference: str
    idempotency_key: str
    prodigi_order_id: str | None = None
    attempt_count: int = 0
    item_ids: list[int] = Field(default_factory=list)
    request_payload: dict[str, Any] | None = None
    response_payload: dict[str, Any] | None = None
    latest_status_payload: dict[str, Any] | None = None
    trace_parent: str | None = None
    submitted_at: datetime | None = None
    status_stage: str | None = None
    status_details: dict[str, Any] | None = None
    issues: list[dict[str, Any]] | None = None
    submission_revision: int = 1
    payload_hash: str | None = None
    last_error: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ProdigiFulfillmentEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int | None = None
    order_id: int | None = None
    order_item_id: int | None = None
    user_id: int | None = None
    event_type: str
    event_uid: str | None = None
    stage: str
    status: str
    external_id: str | None = None
    request_payload: dict[str, Any] | None = None
    response_payload: dict[str, Any] | None = None
    metadata_json: dict[str, Any] | None = None
    error: str | None = None
    created_at: datetime | None = None


class ProdigiFulfillmentGateResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int | None = None
    order_id: int
    order_item_id: int | None = None
    gate: str
    status: str
    measured: dict[str, Any] | None = None
    expected: dict[str, Any] | None = None
    error: str | None = None
    created_at: datetime | None = None


class ProdigiFulfillmentShipmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int | None = None
    order_id: int | None = None
    prodigi_order_id: str | None = None
    prodigi_shipment_id: str
    status: str | None = None
    carrier: str | None = None
    tracking_number: str | None = None
    tracking_url: str | None = None
    payload: dict[str, Any] | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
