"""add_user_pets_table

Revision ID: 611721845764
Revises: cbcf4b8c38ea
Create Date: 2025-11-05 16:01:27.721374

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '611721845764'
down_revision: Union[str, Sequence[str], None] = 'cbcf4b8c38ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create user_pets table for BE-02: User Pets Service.

    Simple pet system where completing tasks feeds pets with XP.
    """
    op.create_table(
        'user_pets',
        sa.Column('pet_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('species', sa.String(50), nullable=False),  # 'dog', 'cat', 'dragon', 'owl', 'fox'
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('xp', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('hunger', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('happiness', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('evolution_stage', sa.Integer(), nullable=False, server_default='1'),  # 1=baby, 2=teen, 3=adult
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('last_fed_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('pet_id'),
        sa.UniqueConstraint('user_id', name='uq_user_pets_user_id'),
        sa.CheckConstraint('level >= 1 AND level <= 10', name='ck_user_pets_level'),
        sa.CheckConstraint('hunger >= 0 AND hunger <= 100', name='ck_user_pets_hunger'),
        sa.CheckConstraint('happiness >= 0 AND happiness <= 100', name='ck_user_pets_happiness'),
        sa.CheckConstraint('evolution_stage >= 1 AND evolution_stage <= 3', name='ck_user_pets_evolution_stage')
    )

    # Create index for user_id lookups
    op.create_index('idx_user_pets_user_id', 'user_pets', ['user_id'])


def downgrade() -> None:
    """Drop user_pets table."""
    op.drop_index('idx_user_pets_user_id', table_name='user_pets')
    op.drop_table('user_pets')
