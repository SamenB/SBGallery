"""retire canvas classic frame and add size attributes

Revision ID: e2a9c8d7f610
Revises: c8f1a2b3d4e5
Create Date: 2026-05-15 01:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e2a9c8d7f610"
down_revision: Union[str, Sequence[str], None] = "c8f1a2b3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

RETIRED_CATEGORY_ID = "canvasClassicFrame"
PAYLOAD_POLICY_VERSION = "print_shipping_passthrough_v2_size_attrs"


def _has_column(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    if not _has_column("prodigi_storefront_offer_sizes", "allowed_attributes"):
        op.add_column(
            "prodigi_storefront_offer_sizes",
            sa.Column("allowed_attributes", sa.JSON(), nullable=True),
        )

    settings_table = sa.table(
        "prodigi_storefront_settings",
        sa.column("id", sa.Integer),
        sa.column("category_policy", sa.JSON),
        sa.column("payload_policy_version", sa.String(length=120)),
    )
    connection = op.get_bind()
    for row in connection.execute(
        sa.select(settings_table.c.id, settings_table.c.category_policy)
    ).mappings():
        category_policy = dict(row["category_policy"] or {})
        category_policy.pop(RETIRED_CATEGORY_ID, None)
        connection.execute(
            settings_table.update()
            .where(settings_table.c.id == row["id"])
            .values(
                category_policy=category_policy,
                payload_policy_version=PAYLOAD_POLICY_VERSION,
            )
        )

    op.execute(
        sa.text(
            "DELETE FROM print_pricing_region_multipliers WHERE category_id = :category_id"
        ).bindparams(category_id=RETIRED_CATEGORY_ID)
    )


def downgrade() -> None:
    if _has_column("prodigi_storefront_offer_sizes", "allowed_attributes"):
        op.drop_column("prodigi_storefront_offer_sizes", "allowed_attributes")
