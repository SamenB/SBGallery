from __future__ import annotations

from src.schemas.email_templates import EmailTemplate, EmailTemplateUpdate


class EmailTemplateService:
    def __init__(self, db):
        self.db = db

    async def get_all_templates(self) -> list[EmailTemplate]:
        return await self.db.email_templates.get_all()

    async def update_template(
        self,
        template_id: int,
        data: EmailTemplateUpdate,
    ) -> EmailTemplate:
        await self.db.email_templates.get_one(id=template_id)
        await self.db.email_templates.edit(data, exclude_unset=True, id=template_id)
        await self.db.commit()
        return await self.db.email_templates.get_one(id=template_id)
