from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from src.config import settings
from src.exeptions import ProdigiWebhookVerificationException
from src.integrations.prodigi.fulfillment.status import (
    apply_order_status_to_job,
    apply_prodigi_items_to_local_items,
    extract_order_data,
    extract_stage,
    find_job_for_prodigi_order,
    format_item_status,
    persist_shipments,
    webhook_event_exists,
)
from src.models.orders import OrderItemOrm, OrdersOrm
from src.models.prodigi_fulfillment import ProdigiFulfillmentEventOrm

log = logging.getLogger(__name__)


class ProdigiCallbackService:
    def __init__(self, db):
        self.db = db

    async def process_webhook(
        self,
        *,
        event: dict[str, Any],
        supplied_secret: str | None,
    ) -> dict:
        if settings.PRODIGI_WEBHOOK_SECRET and supplied_secret != settings.PRODIGI_WEBHOOK_SECRET:
            log.warning("Rejected Prodigi webhook with invalid or missing shared secret.")
            raise ProdigiWebhookVerificationException()

        log.info("Received Prodigi webhook event: %s", event)
        event_uid = str(event.get("id") or "") or None
        if await webhook_event_exists(self.db.session, event_uid):
            log.info("Skipping duplicate Prodigi webhook event: %s", event_uid)
            return {"status": "ok", "duplicate": True}

        self._add_received_event(event=event, event_uid=event_uid)

        if not self._is_order_event(event):
            try:
                await self.db.commit()
            except IntegrityError:
                await self.db.rollback()
                log.info(
                    "Skipping duplicate Prodigi webhook event after insert race: %s", event_uid
                )
                return {"status": "ok", "duplicate": True}
            return {"status": "ok"}

        try:
            return await self._process_order_event(event)
        except IntegrityError:
            await self.db.rollback()
            log.info("Skipping duplicate Prodigi webhook event after insert race: %s", event_uid)
            return {"status": "ok", "duplicate": True}

    def _add_received_event(self, *, event: dict[str, Any], event_uid: str | None) -> None:
        self.db.session.add(
            ProdigiFulfillmentEventOrm(
                order_id=None,
                event_uid=event_uid,
                event_type="webhook",
                stage="received",
                status="received",
                response_payload=event,
                metadata_json={"source": "prodigi"},
            )
        )

    async def _process_order_event(self, event: dict[str, Any]) -> dict:
        order_data = extract_order_data(event)
        ord_id = order_data.get("id") or event.get("subject")
        status_data = order_data.get("status") if isinstance(order_data.get("status"), dict) else {}
        stage = extract_stage(event, order_data)

        if not ord_id or not stage:
            log.error("Missing order id or stage in Prodigi webhook payload")
            await self.db.commit()
            return {"status": "error"}

        job = await find_job_for_prodigi_order(self.db.session, str(ord_id))
        item = await self._find_order_item(str(ord_id))
        order = item.order if item else await self._load_job_order(job)

        if not item and order is None:
            log.warning("Received Prodigi update for unknown order_id: %s", ord_id)
            self.db.session.add(
                ProdigiFulfillmentEventOrm(
                    job_id=getattr(job, "id", None),
                    event_uid=None,
                    event_type="webhook",
                    stage=stage,
                    status="unknown_external_order",
                    external_id=ord_id,
                    response_payload=event,
                )
            )
            await self.db.commit()
            return {"status": "ok"}

        issues = status_data.get("issues") or []
        if item is not None:
            item.prodigi_status = format_item_status(stage, issues)
        if job is not None:
            apply_order_status_to_job(job=job, order_data=order_data, response_payload=event)
        if order is not None:
            apply_prodigi_items_to_local_items(order, order_data)
            await persist_shipments(
                db_session=self.db.session,
                job=job,
                order=order,
                order_data=order_data,
            )
        self._add_status_event(
            event=event,
            job=job,
            item=item,
            order=order,
            stage=stage,
            ord_id=ord_id,
            issues=issues,
        )
        await self.db.commit()

        log.info("Processed Prodigi webhook for order_id=%s stage=%s", ord_id, stage)
        return {"status": "ok"}

    def _add_status_event(
        self,
        *,
        event: dict[str, Any],
        job,
        item,
        order,
        stage: str,
        ord_id,
        issues: list,
    ) -> None:
        self.db.session.add(
            ProdigiFulfillmentEventOrm(
                job_id=getattr(job, "id", None),
                order_id=getattr(order, "id", None),
                order_item_id=getattr(item, "id", None),
                user_id=getattr(order, "user_id", None),
                event_type="webhook",
                stage=stage,
                status="passed" if not issues else "issue",
                external_id=ord_id,
                event_uid=None,
                response_payload=event,
                metadata_json={
                    "prodigi_status": getattr(item, "prodigi_status", None),
                    "issues": issues,
                    "tracking_number": getattr(order, "tracking_number", None),
                    "carrier": getattr(order, "carrier", None),
                    "tracking_url": getattr(order, "tracking_url", None),
                },
            )
        )

    async def _find_order_item(self, prodigi_order_id: str):
        result = await self.db.session.execute(
            select(OrderItemOrm)
            .where(OrderItemOrm.prodigi_order_id == prodigi_order_id)
            .options(selectinload(OrderItemOrm.order))
        )
        return result.scalars().first()

    async def _load_job_order(self, job) -> OrdersOrm | None:
        if job is None:
            return None
        result = await self.db.session.execute(
            select(OrdersOrm)
            .where(OrdersOrm.id == job.order_id)
            .options(selectinload(OrdersOrm.items))
            .limit(1)
        )
        return result.scalar_one_or_none()

    def _is_order_event(self, event: dict[str, Any]) -> bool:
        event_type = str(event.get("type") or "")
        return (
            event_type == "OrderStatusChanged"
            or event_type.startswith("com.prodigi.order.")
            or bool(extract_order_data(event).get("id"))
        )
