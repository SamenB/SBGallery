"""add artwork shop sort order

Revision ID: a6b7c8d9e010
Revises: d91e8f4a6c20
Create Date: 2026-05-05 01:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a6b7c8d9e010"
down_revision: Union[str, Sequence[str], None] = "d91e8f4a6c20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "artworks",
        sa.Column("shop_sort_order", sa.Integer(), server_default="0", nullable=False),
    )
    op.execute(
        """
        WITH ranked AS (
            SELECT id, row_number() OVER (ORDER BY id DESC) * 100 AS sort_order
            FROM artworks
        )
        UPDATE artworks
        SET shop_sort_order = ranked.sort_order
        FROM ranked
        WHERE artworks.id = ranked.id
        """
    )


def downgrade() -> None:
    op.drop_column("artworks", "shop_sort_order")
