"""add_completed_column_for_epic7

Revision ID: 6818e2908d5f
Revises: 157ba09d2749
Create Date: 2025-11-03 01:37:49.879757

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6818e2908d5f'
down_revision: Union[str, Sequence[str], None] = '157ba09d2749'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add completed column to tasks and micro_steps tables for Epic 7."""
    # Add completed column to tasks table (default FALSE)
    op.add_column('tasks', sa.Column('completed', sa.Boolean(), nullable=True, server_default='0'))

    # Add completed column to micro_steps table (default FALSE)
    op.add_column('micro_steps', sa.Column('completed', sa.Boolean(), nullable=True, server_default='0'))


def downgrade() -> None:
    """Downgrade schema - Remove completed column from tasks and micro_steps tables."""
    # Remove completed column from tables
    op.drop_column('tasks', 'completed')
    op.drop_column('micro_steps', 'completed')
