"""limit canvas floating colors to swatch-backed options

Revision ID: a4b7c2d9e130
Revises: e2a9c8d7f610
Create Date: 2026-05-18 01:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a4b7c2d9e130"
down_revision: Union[str, Sequence[str], None] = "e2a9c8d7f610"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CANVAS_FLOATING_CATEGORY_ID = "canvasFloatingFrame"
CANVAS_FLOATING_SWATCH_COLORS = ["black", "white", "brown"]
PAYLOAD_POLICY_VERSION = "print_shipping_passthrough_v3_floating_swatches"


def upgrade() -> None:
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
        floating_policy = dict(category_policy.get(CANVAS_FLOATING_CATEGORY_ID) or {})
        allowed_attributes = dict(floating_policy.get("allowed_attributes") or {})
        allowed_attributes["color"] = list(CANVAS_FLOATING_SWATCH_COLORS)
        floating_policy["allowed_attributes"] = allowed_attributes
        category_policy[CANVAS_FLOATING_CATEGORY_ID] = floating_policy
        connection.execute(
            settings_table.update()
            .where(settings_table.c.id == row["id"])
            .values(
                category_policy=category_policy,
                payload_policy_version=PAYLOAD_POLICY_VERSION,
            )
        )


def downgrade() -> None:
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
        floating_policy = dict(category_policy.get(CANVAS_FLOATING_CATEGORY_ID) or {})
        allowed_attributes = dict(floating_policy.get("allowed_attributes") or {})
        allowed_attributes["color"] = ["black", "white", "natural", "brown", "gold", "silver"]
        floating_policy["allowed_attributes"] = allowed_attributes
        category_policy[CANVAS_FLOATING_CATEGORY_ID] = floating_policy
        connection.execute(
            settings_table.update()
            .where(settings_table.c.id == row["id"])
            .values(category_policy=category_policy)
        )
