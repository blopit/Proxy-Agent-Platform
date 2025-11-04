"""add_zone_id_column_to_tasks

Revision ID: cbcf4b8c38ea
Revises: 6818e2908d5f
Create Date: 2025-11-04 00:10:54.385320

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cbcf4b8c38ea'
down_revision: Union[str, Sequence[str], None] = '6818e2908d5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add zone_id column to tasks table."""
    # Add zone_id column to tasks table (nullable, references compass_zones)
    op.add_column('tasks', sa.Column('zone_id', sa.String(), nullable=True))

    # Add foreign key constraint to compass_zones table
    op.create_foreign_key(
        'fk_tasks_zone_id',
        'tasks',
        'compass_zones',
        ['zone_id'],
        ['zone_id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    """Downgrade schema - Remove zone_id column from tasks table."""
    # Remove foreign key constraint first
    op.drop_constraint('fk_tasks_zone_id', 'tasks', type_='foreignkey')

    # Remove zone_id column
    op.drop_column('tasks', 'zone_id')
