"""Initial schema for Proxy Agent Platform

Revision ID: 001
Revises:
Create Date: 2024-01-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create custom enum types
    task_status_enum = postgresql.ENUM('pending', 'in_progress', 'completed', 'cancelled', name='taskstatus')
    task_priority_enum = postgresql.ENUM('low', 'medium', 'high', 'urgent', name='taskpriority')
    energy_level_enum = postgresql.ENUM('very_low', 'low', 'medium', 'high', 'very_high', name='energylevel')
    agent_type_enum = postgresql.ENUM('task', 'focus', 'energy', 'progress', name='agenttype')

    task_status_enum.create(op.get_bind())
    task_priority_enum.create(op.get_bind())
    energy_level_enum.create(op.get_bind())
    agent_type_enum.create(op.get_bind())

    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=True),
        sa.Column('total_xp', sa.Integer(), server_default=sa.text('0'), nullable=True),
        sa.Column('current_level', sa.Integer(), server_default=sa.text('1'), nullable=True),
        sa.Column('current_streak', sa.Integer(), server_default=sa.text('0'), nullable=True),
        sa.Column('longest_streak', sa.Integer(), server_default=sa.text('0'), nullable=True),
        sa.Column('last_activity_date', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create tasks table
    op.create_table('tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', task_status_enum, server_default=sa.text("'pending'"), nullable=True),
        sa.Column('priority', task_priority_enum, server_default=sa.text("'medium'"), nullable=True),
        sa.Column('estimated_duration', sa.Integer(), nullable=True),
        sa.Column('actual_duration', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('ai_suggested', sa.Boolean(), server_default=sa.text('false'), nullable=True),
        sa.Column('ai_priority_score', sa.Float(), nullable=True),
        sa.Column('ai_tags', sa.JSON(), nullable=True),
        sa.Column('xp_reward', sa.Integer(), server_default=sa.text('50'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)

    # Create focus_sessions table
    op.create_table('focus_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('planned_duration', sa.Integer(), nullable=False),
        sa.Column('actual_duration', sa.Integer(), nullable=True),
        sa.Column('started_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('ended_at', sa.DateTime(), nullable=True),
        sa.Column('interruptions', sa.Integer(), server_default=sa.text('0'), nullable=True),
        sa.Column('productivity_rating', sa.Integer(), nullable=True),
        sa.Column('focus_score', sa.Float(), nullable=True),
        sa.Column('ai_recommended_duration', sa.Integer(), nullable=True),
        sa.Column('ai_optimal_time_slot', sa.JSON(), nullable=True),
        sa.Column('xp_reward', sa.Integer(), server_default=sa.text('100'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_focus_sessions_id'), 'focus_sessions', ['id'], unique=False)

    # Create energy_logs table
    op.create_table('energy_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('energy_level', energy_level_enum, nullable=False),
        sa.Column('mood_rating', sa.Integer(), nullable=True),
        sa.Column('stress_level', sa.Integer(), nullable=True),
        sa.Column('sleep_hours', sa.Float(), nullable=True),
        sa.Column('activity', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('weather', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('logged_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('ai_energy_prediction', sa.Float(), nullable=True),
        sa.Column('ai_recommendations', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_energy_logs_id'), 'energy_logs', ['id'], unique=False)

    # Create achievements table
    op.create_table('achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('xp_reward', sa.Integer(), server_default=sa.text('100'), nullable=True),
        sa.Column('criteria', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_achievements_id'), 'achievements', ['id'], unique=False)

    # Create user_achievements table
    op.create_table('user_achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('achievement_id', sa.Integer(), nullable=False),
        sa.Column('earned_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('progress', sa.Float(), server_default=sa.text('0.0'), nullable=True),
        sa.ForeignKeyConstraint(['achievement_id'], ['achievements.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_achievements_id'), 'user_achievements', ['id'], unique=False)

    # Create agent_activities table
    op.create_table('agent_activities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('agent_type', agent_type_enum, nullable=False),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('context', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_activities_id'), 'agent_activities', ['id'], unique=False)


def downgrade() -> None:
    # Drop tables
    op.drop_index(op.f('ix_agent_activities_id'), table_name='agent_activities')
    op.drop_table('agent_activities')
    op.drop_index(op.f('ix_user_achievements_id'), table_name='user_achievements')
    op.drop_table('user_achievements')
    op.drop_index(op.f('ix_achievements_id'), table_name='achievements')
    op.drop_table('achievements')
    op.drop_index(op.f('ix_energy_logs_id'), table_name='energy_logs')
    op.drop_table('energy_logs')
    op.drop_index(op.f('ix_focus_sessions_id'), table_name='focus_sessions')
    op.drop_table('focus_sessions')
    op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
    op.drop_table('tasks')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

    # Drop enum types
    postgresql.ENUM(name='agenttype').drop(op.get_bind())
    postgresql.ENUM(name='energylevel').drop(op.get_bind())
    postgresql.ENUM(name='taskpriority').drop(op.get_bind())
    postgresql.ENUM(name='taskstatus').drop(op.get_bind())