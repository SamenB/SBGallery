"""
API endpoints for managing email templates.
Allows admin to view and update the content of all transactional emails
without modifying application code.
"""

from fastapi import APIRouter

from src.api.dependencies import AdminDep, DBDep
from src.schemas.email_templates import EmailTemplate, EmailTemplateUpdate
from src.services.email_templates import EmailTemplateService

router = APIRouter(prefix="/email-templates", tags=["Email Templates"])


@router.get("", response_model=list[EmailTemplate])
async def get_email_templates(admin_id: AdminDep, db: DBDep):
    """
    Returns all email templates. Requires admin privileges.
    """
    return await EmailTemplateService(db).get_all_templates()


@router.put("/{template_id}", response_model=EmailTemplate)
async def update_email_template(
    template_id: int,
    data: EmailTemplateUpdate,
    admin_id: AdminDep,
    db: DBDep,
):
    """
    Updates the mutable fields of an email template (subject, body, is_active, note).
    The key and trigger_event fields are immutable and cannot be changed via this endpoint.
    Requires admin privileges.
    """
    return await EmailTemplateService(db).update_template(template_id, data)
