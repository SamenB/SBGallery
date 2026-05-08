"""
API endpoints for contact form submissions.
Handles sending emails to both the user and the administrator.
Templates are loaded from the database, making the content editable via Admin panel.
"""

from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel, EmailStr

from src.api.dependencies import DBDep
from src.services.contact import ContactService

router = APIRouter(prefix="/contact", tags=["Contact"])


class ContactRequest(BaseModel):
    """
    Schema for the contact form submission request.
    """

    name: str
    email: EmailStr
    message: str


@router.post("")
async def submit_contact_form(
    payload: ContactRequest, background_tasks: BackgroundTasks, db: DBDep
):
    """
    Processes a contact form submission.
    Loads email templates from the database and offloads email sending to a background task.
    """
    return await ContactService(db).submit_contact_form(
        name=payload.name,
        email=str(payload.email),
        message=payload.message,
        background_tasks=background_tasks,
    )
