"""
Client-side error reports from the browser.

The frontend container does not see exceptions thrown in users' browsers, so this
thin endpoint gives those crashes a path into the normal backend logs.
"""

from fastapi import APIRouter, Request
from loguru import logger
from pydantic import BaseModel, Field

router = APIRouter(prefix="/client-errors", tags=["Client Errors"])


class ClientErrorReport(BaseModel):
    kind: str = Field(default="error", max_length=80)
    message: str = Field(..., max_length=1000)
    source: str | None = Field(default=None, max_length=500)
    lineno: int | None = Field(default=None, ge=0)
    colno: int | None = Field(default=None, ge=0)
    stack: str | None = Field(default=None, max_length=6000)
    url: str | None = Field(default=None, max_length=1000)
    path: str | None = Field(default=None, max_length=500)
    user_agent: str | None = Field(default=None, max_length=500)


@router.post("")
async def report_client_error(payload: ClientErrorReport, request: Request):
    client_host = request.client.host if request.client else None
    logger.error(
        "Client-side error reported: kind={} path={} message={} source={} "
        "line={} col={} client_host={} origin={} referer={} user_agent={} stack={}",
        payload.kind,
        payload.path,
        payload.message,
        payload.source,
        payload.lineno,
        payload.colno,
        client_host,
        request.headers.get("origin"),
        request.headers.get("referer"),
        payload.user_agent,
        payload.stack,
    )
    return {"status": "ok"}
