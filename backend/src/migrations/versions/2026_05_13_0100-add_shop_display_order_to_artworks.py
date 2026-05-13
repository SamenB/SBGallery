"""add shop display order to artworks

Revision ID: c8f1a2b3d4e5
Revises: b7e9d4a1c530
Create Date: 2026-05-13 01:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c8f1a2b3d4e5"
down_revision: Union[str, Sequence[str], None] = "b7e9d4a1c530"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("artworks", sa.Column("shop_display_order", sa.Integer(), nullable=True))
    op.create_index(
        "ix_artworks_shop_display_order",
        "artworks",
        ["shop_display_order"],
        unique=False,
    )
    op.execute(
        """
        WITH ranked AS (
            SELECT id, row_number() OVER (ORDER BY id DESC) AS position
            FROM artworks
        )
        UPDATE artworks
        SET shop_display_order = ranked.position
        FROM ranked
        WHERE artworks.id = ranked.id
        """
    )


def downgrade() -> None:
    op.drop_index("ix_artworks_shop_display_order", table_name="artworks")
    op.drop_column("artworks", "shop_display_order")
