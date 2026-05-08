import logging

from fastapi import APIRouter, Request

from src.api.dependencies import DBDep
from src.integrations.prodigi.services.prodigi_callbacks import ProdigiCallbackService

log = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/webhooks", tags=["Webhooks"])


@router.post("/prodigi")
async def prodigi_callback(request: Request, db: DBDep):
    supplied_secret = request.query_params.get("token") or request.headers.get(
        "X-Prodigi-Webhook-Secret"
    )
    try:
        event = await request.json()
    except Exception as exc:
        log.error("Invalid JSON payload for Prodigi webhook: %s", exc)
        return {"status": "error", "message": "invalid payload"}

    return await ProdigiCallbackService(db).process_webhook(
        event=event,
        supplied_secret=supplied_secret,
    )
