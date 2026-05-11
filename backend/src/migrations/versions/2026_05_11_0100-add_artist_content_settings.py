"""add artist content settings

Revision ID: b7e9d4a1c530
Revises: d91e8f4a6c20
Create Date: 2026-05-11 01:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b7e9d4a1c530"
down_revision: Union[str, Sequence[str], None] = "d91e8f4a6c20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("artist_home_heading", sa.String(length=200), nullable=True))
    op.add_column("site_settings", sa.Column("artist_home_quote", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("about_page_eyebrow", sa.String(length=200), nullable=True))
    op.add_column("site_settings", sa.Column("about_page_title", sa.String(length=300), nullable=True))
    op.add_column("site_settings", sa.Column("about_section_title", sa.String(length=200), nullable=True))
    op.add_column("site_settings", sa.Column("about_secondary_text", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("about_philosophy_title", sa.String(length=200), nullable=True))
    op.add_column("site_settings", sa.Column("about_philosophy_text", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("about_exhibitions_title", sa.String(length=200), nullable=True))
    op.add_column("site_settings", sa.Column("about_exhibitions_text", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("site_settings", "about_exhibitions_text")
    op.drop_column("site_settings", "about_exhibitions_title")
    op.drop_column("site_settings", "about_philosophy_text")
    op.drop_column("site_settings", "about_philosophy_title")
    op.drop_column("site_settings", "about_secondary_text")
    op.drop_column("site_settings", "about_section_title")
    op.drop_column("site_settings", "about_page_title")
    op.drop_column("site_settings", "about_page_eyebrow")
    op.drop_column("site_settings", "artist_home_quote")
    op.drop_column("site_settings", "artist_home_heading")
