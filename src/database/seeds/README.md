# Database Seed Scripts

This directory contains seed scripts for populating the database with initial data for testing and dogfooding.

## Available Seed Scripts

### 1. Dogfooding Tasks (`seed_dogfooding_tasks.py`)

Seeds the database with **real-world tasks** for dogfooding the task management system. This includes:

- **BE-00 Tasks** (10 tasks): Task Delegation System implementation broken down into subtasks
- **Core Services** (3 tasks): Task Templates Service, ChevronTaskFlow Component, Focus Sessions Service
- **LION motel** (2 tasks): Real personal tasks with due dates
- **Personal** (1 task): Birthday reminder with due date
- **Weekly Review** (1 task): Planning and review task

**Total: 17 real-world tasks**

#### Usage

```bash
# Basic usage - seed tasks into existing database
uv run python -m src.database.seeds.seed_dogfooding_tasks

# Reset database and seed (with confirmation)
uv run python -m src.database.seeds.seed_dogfooding_tasks --reset

# Reset and seed without confirmation (automation)
uv run python -m src.database.seeds.seed_dogfooding_tasks --reset --yes

# Use custom database path
uv run python -m src.database.seeds.seed_dogfooding_tasks --db-path custom.db
```

#### What Gets Seeded

Each task includes:
- Unique task ID (e.g., `BE-00-1`, `LION-1`)
- Title and description
- Delegation mode (`do`, `do_with_me`, `delegate`)
- Estimated hours
- Tags (for filtering and organization)
- Category (backend, frontend, personal, planning)
- Priority (high, medium, low)
- Due date (for time-sensitive tasks)
- Status (todo, in_progress, completed)

### 2. Development Tasks (`seed_development_tasks.py`)

Seeds the database with **36 development tasks** representing the full feature roadmap. These are organized into 6 waves:

- **Wave 1**: Foundation (Task Delegation System)
- **Wave 2**: Core Services (Backend + Frontend)
- **Wave 3**: Advanced Backend + Enhanced UX
- **Wave 4**: Creature & ML Features
- **Wave 5**: Advanced Features
- **Wave 6**: Polish & Quality

**Total: 36 development tasks**

#### Usage

```bash
# Seed development roadmap tasks
uv run python -m src.database.seeds.seed_development_tasks

# With reset
uv run python -m src.database.seeds.seed_development_tasks --reset --yes
```

## Database Schema

Tasks are stored in the `tasks` table with the following key fields:

```sql
CREATE TABLE tasks (
    task_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    project_id TEXT NOT NULL,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    estimated_hours DECIMAL(10,2),
    tags TEXT DEFAULT '[]',  -- JSON array
    delegation_mode TEXT DEFAULT 'do',
    due_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    ...
)
```

## Dogfooding Philosophy

The dogfooding seed script demonstrates the system managing its own development:

1. **Meta-work**: Using the task system to build the task system
2. **Real deadlines**: Includes actual personal tasks with due dates
3. **Delegation modes**: Shows all 3 modes in action:
   - `do`: Do it yourself
   - `do_with_me`: Collaborate with AI
   - `delegate`: Fully delegate to AI agent
4. **Progressive disclosure**: BE-00 broken into 10 manageable subtasks

## Adding New Tasks

To add your own tasks to the dogfooding script:

1. Edit `seed_dogfooding_tasks.py`
2. Add task dictionaries to the `DOGFOODING_TASKS` list:

```python
{
    "task_id": "CUSTOM-1",
    "title": "Your task title",
    "description": "Detailed description",
    "delegation_mode": "do",  # do, do_with_me, or delegate
    "estimated_hours": 2.0,
    "tags": ["your-tag"],
    "category": "personal",  # backend, frontend, personal, planning
    "priority": "high",  # high, medium, low
    "due_date": "2025-11-15",  # YYYY-MM-DD or None
    "status": "todo",  # todo, in_progress, completed
},
```

3. Run the seed script

## Testing

Both scripts support dry-run testing with a custom database:

```bash
# Test without affecting main database
uv run python -m src.database.seeds.seed_dogfooding_tasks --db-path test.db --reset --yes

# Inspect the test database
sqlite3 test.db "SELECT task_id, title, status FROM tasks;"

# Clean up
rm test.db test.db-shm test.db-wal
```

## Integration with Task API

After seeding, tasks can be accessed via:

```bash
# List all tasks
curl http://localhost:8000/api/v1/tasks

# Filter by project
curl http://localhost:8000/api/v1/tasks?project_id=dogfooding

# Filter by tags
curl http://localhost:8000/api/v1/tasks?tags=BE-00

# Get tasks with due dates
curl http://localhost:8000/api/v1/tasks?has_due_date=true
```

## Notes

- All timestamps use UTC
- Tags are stored as JSON arrays for flexible querying
- Task IDs are UUIDs in the database, but display IDs (like `BE-00-1`) are used for human readability
- The `is_meta_task` flag distinguishes between roadmap tasks and real tasks
