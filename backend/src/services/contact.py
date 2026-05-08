from __future__ import annotations

from fastapi import BackgroundTasks

from src.exeptions import ArtShopExeption
from src.services.email import send_contact_emails


class ContactService:
    def __init__(self, db):
        self.db = db

    async def submit_contact_form(
        self,
        *,
        name: str,
        email: str,
        message: str,
        background_tasks: BackgroundTasks,
    ) -> dict:
        try:
            settings_obj = await self.db.site_settings.get_or_create()
            admin_email = settings_obj.contact_email if settings_obj else None

            admin_tpl = await self.db.email_templates.get_by_key("contact_admin")
            autoreply_tpl = await self.db.email_templates.get_by_key("contact_autoreply")

            admin_subject = admin_tpl.subject if admin_tpl and admin_tpl.is_active else None
            admin_body = admin_tpl.body if admin_tpl and admin_tpl.is_active else None
            autoreply_subject = (
                autoreply_tpl.subject if autoreply_tpl and autoreply_tpl.is_active else None
            )
            autoreply_body = (
                autoreply_tpl.body if autoreply_tpl and autoreply_tpl.is_active else None
            )

            background_tasks.add_task(
                send_contact_emails,
                name,
                email,
                message,
                admin_email,
                admin_subject,
                admin_body,
                autoreply_subject,
                autoreply_body,
            )
            return {"message": "Success"}
        except Exception as exc:
            raise ArtShopExeption(
                detail="Failed to process contact request.",
                status_code=500,
            ) from exc
