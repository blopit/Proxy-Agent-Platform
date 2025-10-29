"""add_delegation_system_tables

Revision ID: 157ba09d2749
Revises: 33d9c3a5619f
Create Date: 2025-10-29 12:28:21.920780

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '157ba09d2749'
down_revision: Union[str, Sequence[str], None] = '33d9c3a5619f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add delegation fields to tasks table
    op.add_column('tasks', sa.Column('assigned_to', sa.String, nullable=True))
    op.add_column('tasks', sa.Column('agent_type', sa.String, nullable=True))
    op.add_column('tasks', sa.Column('is_meta_task', sa.Boolean, default=False))

    # Create task_assignments table
    op.create_table(
        'task_assignments',
        sa.Column('assignment_id', sa.String, primary_key=True),
        sa.Column('task_id', sa.String, sa.ForeignKey('tasks.task_id'), nullable=False),
        sa.Column('assignee_id', sa.String, nullable=False),
        sa.Column('assignee_type', sa.String, nullable=False),
        sa.Column('status', sa.String, default='pending'),
        sa.Column('assigned_at', sa.DateTime, nullable=False),
        sa.Column('accepted_at', sa.DateTime, nullable=True),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('estimated_hours', sa.Float, nullable=True),
        sa.Column('actual_hours', sa.Float, nullable=True),
    )

    # Create agent_capabilities table
    op.create_table(
        'agent_capabilities',
        sa.Column('capability_id', sa.String, primary_key=True),
        sa.Column('agent_id', sa.String, nullable=False),
        sa.Column('agent_name', sa.String, nullable=False),
        sa.Column('agent_type', sa.String, nullable=False),
        sa.Column('skills', sa.Text, nullable=False),
        sa.Column('max_concurrent_tasks', sa.Integer, default=1),
        sa.Column('current_task_count', sa.Integer, default=0),
        sa.Column('is_available', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables
    op.drop_table('agent_capabilities')
    op.drop_table('task_assignments')

    # Remove delegation fields from tasks table
    op.drop_column('tasks', 'is_meta_task')
    op.drop_column('tasks', 'agent_type')
    op.drop_column('tasks', 'assigned_to')
