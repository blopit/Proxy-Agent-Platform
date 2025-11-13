# Database Schema Documentation

**Last Updated**: January 13, 2025
**Version**: 0.1.0
**Database**: PostgreSQL 13+ (prod) / SQLite 3+ (dev)

---

## Table of Contents

- [Overview](#overview)
- [Naming Conventions](#naming-conventions)
- [Schema Diagram](#schema-diagram)
- [Core Tables](#core-tables)
- [Indexes](#indexes)
- [Migrations](#migrations)

---

## Overview

The Proxy Agent Platform uses a **relational database** with entity-specific primary keys for clarity and consistency.

### Database Engines

| Environment | Engine | Version | Connection |
|-------------|--------|---------|------------|
| **Production** | PostgreSQL | 13+ | Connection pooling (10+20) |
| **Development** | SQLite | 3+ | WAL mode, foreign keys ON |
| **Testing** | SQLite | 3+ | In-memory |

### Key Characteristics

- **Entity-specific primary keys**: `task_id`, `user_id`, `project_id` (not generic `id`)
- **UUID primary keys**: All IDs are UUIDs (except SQLite uses strings)
- **Timestamp tracking**: `created_at`, `updated_at` on most tables
- **Soft deletes**: `is_active` flags (no hard deletes for important data)
- **Foreign key constraints**: Enforced with `ON DELETE CASCADE` or `SET NULL`
- **JSON columns**: Stored as TEXT, parsed in application layer

---

## Naming Conventions

Following [NAMING_CONVENTIONS.md](../design/NAMING_CONVENTIONS.md):

### Tables
- **Plural entity names**: `tasks`, `users`, `projects`, `compass_zones`

### Primary Keys
- **Pattern**: `{entity}_id` (e.g., `task_id`, `user_id`, `project_id`)
- **Type**: UUID (string in SQLite)

### Foreign Keys
- **Pattern**: `{referenced_entity}_id`
- **Example**: `task.project_id` → `projects.project_id`

### Timestamps
- **Created**: `created_at` (UTC, auto-set)
- **Updated**: `updated_at` (UTC, auto-updated)
- **Completed**: `completed_at` (UTC, manual)
- **Expired**: `expires_at` (UTC, manual)

### Booleans
- **Pattern**: `is_{state}` (e.g., `is_active`, `is_completed`, `is_leaf`)

### Counts
- **Pattern**: `{entity}_count` (e.g., `message_count`, `lead_count`)

### Durations
- **Pattern**: `{property}_{unit}` (e.g., `duration_seconds`, `timeout_minutes`)

---

## Schema Diagram

```
┌─────────────┐
│    users    │
│─────────────│
│ user_id PK  │──┐
│ username    │  │
│ email       │  │
│ ...         │  │
└─────────────┘  │
                 │
    ┌────────────┴─────────────┬──────────────┐
    │                          │              │
    ▼                          ▼              ▼
┌─────────────┐        ┌──────────────┐  ┌─────────────────┐
│  projects   │        │compass_zones │  │morning_rituals  │
│─────────────│        │──────────────│  │─────────────────│
│ project_id PK│──┐    │ zone_id PK   │  │ ritual_id PK    │
│ owner_id FK  │  │    │ user_id FK   │  │ user_id FK      │
│ name        │  │    │ name         │  │ completion_date │
│ ...         │  │    │ icon         │  │ focus_task_1_id │
└─────────────┘  │    │ ...          │  │ ...             │
                 │    └──────────────┘  └─────────────────┘
                 │
                 │    ┌───────────────┐
                 └───▶│     tasks     │
                      │───────────────│
                      │ task_id PK    │──┐
                      │ project_id FK │  │
                      │ parent_id FK  │◀─┘ (self-reference)
                      │ assignee_id FK│
                      │ zone_id FK    │
                      │ title         │
                      │ description   │
                      │ status        │
                      │ priority      │
                      │ ...           │
                      └───────┬───────┘
                              │
                 ┌────────────┴────────────┬──────────────┐
                 │                         │              │
                 ▼                         ▼              ▼
         ┌──────────────┐        ┌──────────────┐  ┌─────────────┐
         │ micro_steps  │        │task_comments │  │focus_sessions│
         │──────────────│        │──────────────│  │─────────────│
         │ step_id PK   │        │ comment_id PK│  │session_id PK│
         │ parent_task_id FK│    │ task_id FK   │  │ task_id FK  │
         │ step_number  │        │ author_id FK │  │ user_id FK  │
         │ description  │        │ content      │  │ duration_min│
         │ ...          │        │ ...          │  │ ...         │
         └──────────────┘        └──────────────┘  └─────────────┘

┌───────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  achievements │◀────▶│user_achievements │      │energy_snapshots │
│───────────────│      │──────────────────│      │─────────────────│
│achievement_id PK│    │user_achievement_id PK│  │ snapshot_id PK  │
│ name          │      │ user_id FK       │      │ user_id FK      │
│ description   │      │achievement_id FK │      │ energy_level    │
│ xp_reward     │      │ unlocked_at      │      │ recorded_at     │
│ ...           │      └──────────────────┘      │ ...             │
└───────────────┘                                 └─────────────────┘

┌───────────────┐      ┌──────────────────┐
│     goals     │      │     habits       │
│───────────────│      │──────────────────│
│ goal_id PK    │      │ habit_id PK      │
│ user_id FK    │      │ user_id FK       │
│ title         │      │ name             │
│ target_date   │      │ frequency        │
│ ...           │      │ streak           │
└───────────────┘      │ ...              │
                       └──────────────────┘
```

---

## Core Tables

### 1. `users`

**Purpose**: User accounts and profiles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID/STRING | PRIMARY KEY | Unique user identifier |
| `username` | VARCHAR(255) | UNIQUE, NOT NULL | Unique username |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| `password_hash` | VARCHAR(255) | NULLABLE | Hashed password (bcrypt) |
| `full_name` | VARCHAR(255) | NULLABLE | Full display name |
| `timezone` | VARCHAR(50) | DEFAULT 'UTC' | User timezone |
| `avatar_url` | VARCHAR(512) | NULLABLE | Profile picture URL |
| `bio` | TEXT | NULLABLE | User bio |
| `preferences` | TEXT | DEFAULT '{}' | JSON preferences |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active flag |
| `last_login` | TIMESTAMP | NULLABLE | Last login timestamp |
| `created_at` | TIMESTAMP | NOT NULL | Account creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last update time |

**Indexes**:
- `idx_users_username` on `username`
- `idx_users_email` on `email`

---

### 2. `projects`

**Purpose**: Task grouping containers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `project_id` | UUID/STRING | PRIMARY KEY | Unique project identifier |
| `name` | VARCHAR(255) | NOT NULL | Project name |
| `description` | TEXT | NOT NULL | Project description |
| `owner_id` | UUID/STRING | FK → users(user_id) ON DELETE CASCADE | Project owner |
| `team_members` | TEXT | DEFAULT '[]' | JSON array of user IDs |
| `is_active` | BOOLEAN | DEFAULT TRUE | Project active flag |
| `start_date` | TIMESTAMP | NULLABLE | Project start date |
| `end_date` | TIMESTAMP | NULLABLE | Project end date |
| `settings` | TEXT | DEFAULT '{}' | JSON project settings |
| `metadata` | TEXT | DEFAULT '{}' | JSON metadata |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last update time |

**Indexes**:
- `idx_projects_owner` on `owner_id`

---

### 3. `tasks`

**Purpose**: Core task entity with Epic 7 task splitting fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `task_id` | UUID/STRING | PRIMARY KEY | Unique task identifier |
| `title` | VARCHAR(255) | NOT NULL | Task title |
| `description` | TEXT | NOT NULL | Task description |
| `project_id` | UUID/STRING | FK → projects(project_id) ON DELETE CASCADE | Parent project |
| `parent_id` | UUID/STRING | FK → tasks(task_id) ON DELETE CASCADE, NULLABLE | Parent task (for subtasks) |
| `capture_type` | VARCHAR(50) | DEFAULT 'task' | Capture category |
| `status` | VARCHAR(50) | DEFAULT 'todo' | Task status |
| `priority` | VARCHAR(50) | DEFAULT 'medium' | Priority level |
| `estimated_hours` | NUMERIC(10,2) | NULLABLE | Estimated effort |
| `actual_hours` | NUMERIC(10,2) | DEFAULT 0.0 | Actual effort |
| `tags` | TEXT | DEFAULT '[]' | JSON tag array |
| `assignee_id` | UUID/STRING | FK → users(user_id) ON DELETE SET NULL | Assigned user |
| `due_date` | TIMESTAMP | NULLABLE | Due date |
| `started_at` | TIMESTAMP | NULLABLE | Start timestamp |
| `completed_at` | TIMESTAMP | NULLABLE | Completion timestamp |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last update time |
| `metadata` | TEXT | DEFAULT '{}' | JSON metadata |
| **Epic 7 Fields** | | | |
| `scope` | VARCHAR(50) | DEFAULT 'simple' | Task scope (simple/medium/complex) |
| `delegation_mode` | VARCHAR(20) | DEFAULT 'do' | Delegation mode (do/do_with_me/delegate/delete) |
| `is_micro_step` | BOOLEAN | DEFAULT FALSE | Is this a micro-step? |
| `micro_steps` | TEXT | DEFAULT '[]' | JSON micro-step array (legacy) |
| `level` | INTEGER | DEFAULT 0 | Decomposition tree level |
| `custom_emoji` | VARCHAR(10) | NULLABLE | Custom task emoji |
| `decomposition_state` | VARCHAR(50) | DEFAULT 'stub' | Decomposition state |
| `children_ids` | TEXT | DEFAULT '[]' | JSON child task IDs |
| `total_minutes` | INTEGER | DEFAULT 0 | Total estimated minutes |
| `is_leaf` | BOOLEAN | DEFAULT FALSE | Is this a leaf node? |
| `leaf_type` | VARCHAR(50) | NULLABLE | Leaf type (digital/physical/social) |
| `zone_id` | UUID/STRING | FK → compass_zones(zone_id), NULLABLE | Compass zone |

**Indexes**:
- `idx_tasks_project` on `project_id`
- `idx_tasks_status` on `status`
- `idx_tasks_priority` on `priority`
- `idx_tasks_assignee` on `assignee_id`
- `idx_tasks_due_date` on `due_date`
- `idx_tasks_parent` on `parent_id`
- `idx_tasks_zone` on `zone_id`

**Status Values**: `todo`, `in_progress`, `blocked`, `done`
**Priority Values**: `low`, `medium`, `high`, `urgent`
**Delegation Modes**: `do`, `do_with_me`, `delegate`, `delete`
**Leaf Types**: `digital`, `physical`, `social`

---

### 4. `micro_steps`

**Purpose**: ADHD-optimized 1-10 minute task steps

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `step_id` | UUID/STRING | PRIMARY KEY | Unique step identifier |
| `parent_task_id` | UUID/STRING | FK → tasks(task_id) ON DELETE CASCADE | Parent task |
| `step_number` | INTEGER | NOT NULL | Step order (1, 2, 3...) |
| `description` | TEXT | NOT NULL | Step description |
| `estimated_minutes` | INTEGER | NOT NULL, CHECK (1-10) | Estimated time (1-10 min) |
| `delegation_mode` | VARCHAR(20) | DEFAULT 'do' | Delegation mode |
| `emoji` | VARCHAR(10) | NULLABLE | Step emoji |
| `is_completed` | BOOLEAN | DEFAULT FALSE | Completion flag |
| `completed_at` | TIMESTAMP | NULLABLE | Completion time |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |

**Indexes**:
- `idx_micro_steps_parent` on `parent_task_id`

**Constraints**:
- `CHECK (estimated_minutes >= 1 AND estimated_minutes <= 10)`

---

### 5. `task_comments`

**Purpose**: Task discussions and notes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `comment_id` | UUID/STRING | PRIMARY KEY | Unique comment identifier |
| `task_id` | UUID/STRING | FK → tasks(task_id) ON DELETE CASCADE | Parent task |
| `author_id` | UUID/STRING | FK → users(user_id) ON DELETE CASCADE | Comment author |
| `content` | TEXT | NOT NULL | Comment content |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NULLABLE | Last edit time |
| `is_edited` | BOOLEAN | DEFAULT FALSE | Edit flag |

**Indexes**:
- `idx_task_comments_task` on `task_id`

---

### 6. `compass_zones`

**Purpose**: Life area organization (Work/Life/Self)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `zone_id` | UUID/STRING | PRIMARY KEY | Unique zone identifier |
| `user_id` | UUID/STRING | FK → users(user_id) ON DELETE CASCADE | Zone owner |
| `name` | VARCHAR(255) | NOT NULL | Zone name (e.g., "Work") |
| `icon` | VARCHAR(50) | NOT NULL | Zone icon (emoji or icon name) |
| `simple_goal` | TEXT | NULLABLE | Simple zone goal |
| `color` | VARCHAR(7) | DEFAULT '#3b82f6' | Zone color (hex) |
| `sort_order` | INTEGER | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active flag |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last update time |

**Indexes**:
- `idx_compass_zones_user` on `user_id`

---

### 7. `morning_rituals`

**Purpose**: Daily 3-task focus planning

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `ritual_id` | UUID/STRING | PRIMARY KEY | Unique ritual identifier |
| `user_id` | UUID/STRING | FK → users(user_id) ON DELETE CASCADE | User |
| `completion_date` | VARCHAR(10) | NOT NULL | Date in YYYY-MM-DD format |
| `focus_task_1_id` | UUID/STRING | NULLABLE | First focus task ID |
| `focus_task_2_id` | UUID/STRING | NULLABLE | Second focus task ID |
| `focus_task_3_id` | UUID/STRING | NULLABLE | Third focus task ID |
| `completed_at` | TIMESTAMP | NOT NULL | Ritual completion time |
| `skipped` | BOOLEAN | DEFAULT FALSE | Ritual skipped flag |

**Indexes**:
- `idx_morning_rituals_user` on `user_id`

---

### 8. `energy_snapshots`

**Purpose**: Manual energy level tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `snapshot_id` | UUID/STRING | PRIMARY KEY | Unique snapshot identifier |
| `user_id` | UUID/STRING | FK → users(user_id) ON DELETE CASCADE | User |
| `energy_level` | INTEGER | NOT NULL, CHECK (1-3) | Energy level (1=Low, 2=Med, 3=High) |
| `recorded_at` | TIMESTAMP | NOT NULL | Recording time |
| `time_of_day` | VARCHAR(20) | NULLABLE | Time category (morning/afternoon/evening) |
| `notes` | TEXT | NULLABLE | Optional notes |

**Indexes**:
- `idx_energy_snapshots_user` on `user_id`

**Constraints**:
- `CHECK (energy_level >= 1 AND energy_level <= 3)`

---

### 9. `focus_sessions`

**Purpose**: Pomodoro/focus session tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `session_id` | UUID/STRING | PRIMARY KEY | Unique session identifier |
| `user_id` | UUID/STRING | FK → users(user_id) ON DELETE CASCADE | User |
| `task_id` | UUID/STRING | FK → tasks(task_id) ON DELETE CASCADE, NULLABLE | Associated task |
| `duration_minutes` | INTEGER | DEFAULT 25 | Session duration |
| `started_at` | TIMESTAMP | NOT NULL | Start time |
| `ended_at` | TIMESTAMP | NULLABLE | End time |
| `is_completed` | BOOLEAN | DEFAULT FALSE | Completion flag |
| `interruptions` | INTEGER | DEFAULT 0 | Interruption count |
| `notes` | TEXT | NULLABLE | Session notes |

**Indexes**:
- `idx_focus_sessions_user` on `user_id`
- `idx_focus_sessions_task` on `task_id`

---

### 10. `goals`

**Purpose**: Long-term goal tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `goal_id` | UUID/STRING | PRIMARY KEY | Unique goal identifier |
| `user_id` | UUID/STRING | FK → users(user_id) ON DELETE CASCADE | User |
| `title` | VARCHAR(255) | NOT NULL | Goal title |
| `description` | TEXT | NULLABLE | Goal description |
| `target_date` | TIMESTAMP | NULLABLE | Target completion date |
| `is_completed` | BOOLEAN | DEFAULT FALSE | Completion flag |
| `completed_at` | TIMESTAMP | NULLABLE | Completion time |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |

**Indexes**:
- `idx_goals_user` on `user_id`

---

### 11. `habits`

**Purpose**: Habit tracking and streaks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `habit_id` | UUID/STRING | PRIMARY KEY | Unique habit identifier |
| `user_id` | UUID/STRING | FK → users(user_id) ON DELETE CASCADE | User |
| `name` | VARCHAR(255) | NOT NULL | Habit name |
| `description` | TEXT | NULLABLE | Habit description |
| `frequency` | VARCHAR(50) | DEFAULT 'daily' | Frequency (daily/weekly/custom) |
| `streak` | INTEGER | DEFAULT 0 | Current streak count |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active flag |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |

**Indexes**:
- `idx_habits_user` on `user_id`

---

### 12. `achievements`

**Purpose**: Gamification achievement definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `achievement_id` | UUID/STRING | PRIMARY KEY | Unique achievement identifier |
| `name` | VARCHAR(255) | NOT NULL | Achievement name |
| `description` | TEXT | NULLABLE | Achievement description |
| `icon` | VARCHAR(50) | NULLABLE | Icon name/emoji |
| `xp_reward` | INTEGER | DEFAULT 0 | XP reward amount |
| `criteria` | TEXT | DEFAULT '{}' | JSON unlock criteria |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |

---

### 13. `user_achievements`

**Purpose**: User-unlocked achievements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_achievement_id` | UUID/STRING | PRIMARY KEY | Unique record identifier |
| `user_id` | UUID/STRING | FK → users(user_id) ON DELETE CASCADE | User |
| `achievement_id` | UUID/STRING | FK → achievements(achievement_id) ON DELETE CASCADE | Achievement |
| `unlocked_at` | TIMESTAMP | NOT NULL | Unlock time |

**Indexes**:
- `idx_user_achievements_user` on `user_id`

---

### 14. `refresh_tokens`

**Purpose**: JWT refresh token storage for secure token rotation
**Migration**: 026_create_refresh_tokens_table.sql (Created: 2025-01-09)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `token_id` | TEXT | PRIMARY KEY | Unique token identifier |
| `user_id` | TEXT | FK → users(user_id) ON DELETE CASCADE, NOT NULL | Token owner |
| `token_hash` | TEXT | NOT NULL | Hashed refresh token (bcrypt) |
| `expires_at` | TIMESTAMP | NOT NULL | Token expiration time |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| `revoked` | BOOLEAN | DEFAULT 0 (FALSE) | Revocation flag |
| `revoked_at` | TIMESTAMP | NULLABLE | Revocation timestamp |

**Indexes**:
- `idx_refresh_tokens_user_id` on `user_id` - Efficient user lookup
- `idx_refresh_tokens_expires_at` on `expires_at` - Token cleanup queries
- `idx_refresh_tokens_revoked` on `revoked` - Revoked token filtering

**Security Features**:
- Tokens are hashed before storage (bcrypt)
- Automatic cleanup of expired tokens
- Revocation support for security incidents
- CASCADE delete when user is deleted

---

## Indexes

### Performance Indexes

**High-frequency queries**:

```sql
-- Task queries
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_zone ON tasks(zone_id);

-- User lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Micro-steps
CREATE INDEX idx_micro_steps_parent ON micro_steps(parent_task_id);

-- Comments
CREATE INDEX idx_task_comments_task ON task_comments(task_id);

-- Compass zones
CREATE INDEX idx_compass_zones_user ON compass_zones(user_id);

-- Sessions
CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task ON focus_sessions(task_id);

-- Energy snapshots
CREATE INDEX idx_energy_snapshots_user ON energy_snapshots(user_id);
```

---

## Migrations

### Alembic Setup

**Migration files**: `src/database/migrations/versions/`

**Common commands**:

```bash
# Create migration
uv run alembic revision -m "add_task_delegation_fields"

# Apply migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1

# View history
uv run alembic history

# Check current version
uv run alembic current
```

### Migration Template

```python
"""add_task_delegation_fields

Revision ID: xxxxxxxxxxxxx
Revises: yyyyyyyyyyyyyyy
Create Date: 2025-10-28 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'xxxxxxxxxxxxx'
down_revision = 'yyyyyyyyyyyyyyy'
branch_labels = None
depends_on = None

def upgrade():
    # Add columns
    op.add_column('tasks',
        sa.Column('delegation_mode', sa.String(20), server_default='do')
    )
    op.add_column('tasks',
        sa.Column('assigned_to', sa.String(255), nullable=True)
    )

    # Create index
    op.create_index(
        'idx_tasks_delegation',
        'tasks',
        ['delegation_mode', 'assigned_to']
    )

def downgrade():
    # Remove index
    op.drop_index('idx_tasks_delegation', 'tasks')

    # Remove columns
    op.drop_column('tasks', 'assigned_to')
    op.drop_column('tasks', 'delegation_mode')
```

---

## Entity Relationship Summary

```
users (1) ────── (M) projects
users (1) ────── (M) tasks (assignee)
users (1) ────── (M) compass_zones
users (1) ────── (M) morning_rituals
users (1) ────── (M) energy_snapshots
users (1) ────── (M) focus_sessions
users (1) ────── (M) goals
users (1) ────── (M) habits
users (1) ────── (M) user_achievements
users (1) ────── (M) refresh_tokens

projects (1) ─── (M) tasks

tasks (1) ──────── (M) tasks (parent-child)
tasks (1) ──────── (M) micro_steps
tasks (1) ──────── (M) task_comments
tasks (1) ──────── (M) focus_sessions
tasks (M) ──────── (1) compass_zones

achievements (1) ─ (M) user_achievements
```

---

## Next Steps

1. **Review**: [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) - System architecture
2. **Review**: [API_REFERENCE.md](./API_REFERENCE.md) - API endpoints
3. **Implement**: Database migrations for new features
4. **Optimize**: Add indexes for slow queries

---

**Questions?** See [BACKEND_GUIDE.md](../development/BACKEND_GUIDE.md) or check the team chat.
