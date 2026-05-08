from __future__ import annotations

from sqlalchemy import func, select

from src.models.prodigi_fulfillment import (
    ProdigiFulfillmentEventOrm,
    ProdigiFulfillmentGateResultOrm,
    ProdigiFulfillmentJobOrm,
    ProdigiFulfillmentShipmentOrm,
)
from src.repositories.mappers.mappers import (
    ProdigiFulfillmentEventMapper,
    ProdigiFulfillmentGateResultMapper,
    ProdigiFulfillmentJobMapper,
    ProdigiFulfillmentShipmentMapper,
)
from src.schemas.prodigi_fulfillment import (
    ProdigiFulfillmentEventRead,
    ProdigiFulfillmentGateResultRead,
    ProdigiFulfillmentJobRead,
    ProdigiFulfillmentShipmentRead,
)


class ProdigiFulfillmentRepository:
    def __init__(self, session):
        self.session = session

    async def get_jobs_for_order(self, order_id: int) -> list[ProdigiFulfillmentJobRead]:
        result = await self.session.execute(
            select(ProdigiFulfillmentJobOrm)
            .where(ProdigiFulfillmentJobOrm.order_id == order_id)
            .order_by(ProdigiFulfillmentJobOrm.created_at.desc())
        )
        return [ProdigiFulfillmentJobMapper.map_to_schema(model) for model in result.scalars()]

    async def get_jobs(
        self,
        *,
        status: str | None = None,
        limit: int = 50,
    ) -> list[ProdigiFulfillmentJobRead]:
        stmt = select(ProdigiFulfillmentJobOrm).order_by(ProdigiFulfillmentJobOrm.updated_at.desc())
        if status:
            stmt = stmt.where(ProdigiFulfillmentJobOrm.status == status)
        result = await self.session.execute(stmt.limit(limit))
        return [ProdigiFulfillmentJobMapper.map_to_schema(model) for model in result.scalars()]

    async def get_status_counts(self) -> dict[str, int]:
        result = await self.session.execute(
            select(ProdigiFulfillmentJobOrm.status, func.count())
            .group_by(ProdigiFulfillmentJobOrm.status)
            .order_by(ProdigiFulfillmentJobOrm.status)
        )
        return {row[0]: int(row[1]) for row in result.all()}

    async def get_latest_job_for_order(
        self,
        order_id: int,
    ) -> ProdigiFulfillmentJobRead | None:
        model = await self.get_latest_job_orm_for_order(order_id)
        if model is None:
            return None
        return ProdigiFulfillmentJobMapper.map_to_schema(model)

    async def get_job_by_id(self, job_id: int) -> ProdigiFulfillmentJobRead | None:
        result = await self.session.execute(
            select(ProdigiFulfillmentJobOrm).where(ProdigiFulfillmentJobOrm.id == job_id).limit(1)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return ProdigiFulfillmentJobMapper.map_to_schema(model)

    async def get_latest_job_orm_for_order(
        self,
        order_id: int,
    ) -> ProdigiFulfillmentJobOrm | None:
        result = await self.session.execute(
            select(ProdigiFulfillmentJobOrm)
            .where(ProdigiFulfillmentJobOrm.order_id == order_id)
            .order_by(ProdigiFulfillmentJobOrm.id.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_reusable_preflight_job(
        self,
        order_id: int,
        mode: str,
    ) -> ProdigiFulfillmentJobRead | None:
        job = await self.get_latest_job_for_order(order_id)
        if (
            job is not None
            and job.status == "preflight_passed"
            and job.mode == mode
            and bool(job.request_payload)
            and bool(job.payload_hash)
        ):
            return job
        return None

    async def get_gates_for_order(
        self,
        order_id: int,
    ) -> list[ProdigiFulfillmentGateResultRead]:
        result = await self.session.execute(
            select(ProdigiFulfillmentGateResultOrm)
            .where(ProdigiFulfillmentGateResultOrm.order_id == order_id)
            .order_by(ProdigiFulfillmentGateResultOrm.created_at.asc())
        )
        return [
            ProdigiFulfillmentGateResultMapper.map_to_schema(model) for model in result.scalars()
        ]

    async def get_gates_for_job(
        self,
        job_id: int,
    ) -> list[ProdigiFulfillmentGateResultRead]:
        result = await self.session.execute(
            select(ProdigiFulfillmentGateResultOrm)
            .where(ProdigiFulfillmentGateResultOrm.job_id == job_id)
            .order_by(ProdigiFulfillmentGateResultOrm.created_at.asc())
        )
        return [
            ProdigiFulfillmentGateResultMapper.map_to_schema(model) for model in result.scalars()
        ]

    async def get_events_for_order(
        self,
        order_id: int,
    ) -> list[ProdigiFulfillmentEventRead]:
        result = await self.session.execute(
            select(ProdigiFulfillmentEventOrm)
            .where(ProdigiFulfillmentEventOrm.order_id == order_id)
            .order_by(ProdigiFulfillmentEventOrm.created_at.asc())
        )
        return [ProdigiFulfillmentEventMapper.map_to_schema(model) for model in result.scalars()]

    async def get_events_for_job(
        self,
        job_id: int,
    ) -> list[ProdigiFulfillmentEventRead]:
        result = await self.session.execute(
            select(ProdigiFulfillmentEventOrm)
            .where(ProdigiFulfillmentEventOrm.job_id == job_id)
            .order_by(ProdigiFulfillmentEventOrm.created_at.asc())
        )
        return [ProdigiFulfillmentEventMapper.map_to_schema(model) for model in result.scalars()]

    async def get_shipments_for_order(
        self,
        order_id: int,
    ) -> list[ProdigiFulfillmentShipmentRead]:
        result = await self.session.execute(
            select(ProdigiFulfillmentShipmentOrm)
            .where(ProdigiFulfillmentShipmentOrm.order_id == order_id)
            .order_by(ProdigiFulfillmentShipmentOrm.created_at.asc())
        )
        return [ProdigiFulfillmentShipmentMapper.map_to_schema(model) for model in result.scalars()]
