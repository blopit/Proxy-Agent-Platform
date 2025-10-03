"""Create messages table

Revision ID: 001
Revises:
Create Date: 2024-10-02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create messages table adapted from Ottomator pattern
    op.create_table('messages',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('session_id', sa.String(100), nullable=False, index=True),
        sa.Column('message_type', sa.String(50), nullable=False),
        sa.Column('message_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Create index for faster queries
    op.create_index('ix_messages_session_created', 'messages', ['session_id', 'created_at'])
    op.create_index('ix_messages_type', 'messages', ['message_type'])


def downgrade() -> None:
    op.drop_table('messages')