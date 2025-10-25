# Naming Conventions

Comprehensive naming standards for the Proxy Agent Platform. These conventions ensure consistency, clarity, and maintainability across the entire codebase.

## Table of Contents

- [Database Naming Standards](#database-naming-standards)
- [Python Code Naming](#python-code-naming)
- [API Naming](#api-naming)
- [File and Directory Naming](#file-and-directory-naming)
- [Testing Conventions](#testing-conventions)
- [Git Conventions](#git-conventions)

## Database Naming Standards

### Entity-Specific Primary Keys

All database tables use entity-specific primary keys for clarity and consistency:

```sql
-- ✅ STANDARDIZED: Entity-specific primary keys
sessions.session_id UUID PRIMARY KEY
leads.lead_id UUID PRIMARY KEY
messages.message_id UUID PRIMARY KEY
daily_metrics.daily_metric_id UUID PRIMARY KEY
agencies.agency_id UUID PRIMARY KEY
tasks.task_id UUID PRIMARY KEY
users.user_id UUID PRIMARY KEY
```

### Table Names

- **Use plural form**: `tasks`, `users`, `sessions`, `messages`
- **Use snake_case**: `daily_metrics`, `focus_sessions`, `energy_logs`
- **Avoid abbreviations**: `notifications` not `notifs`, `achievements` not `achieves`
- **Be descriptive**: `task_completion_history` not `task_hist`

```sql
-- ✅ Good table names
tasks
users
focus_sessions
energy_logs
task_dependencies
user_achievements
daily_metrics

-- ❌ Avoid
task
usr
focusSessions
energyLog
task_deps
user_achieve
```

### Field Naming Conventions

#### Primary Keys
Format: `{entity}_id`

```sql
-- ✅ Entity-specific primary keys
session_id, lead_id, message_id, task_id, user_id
```

#### Foreign Keys
Format: `{referenced_entity}_id`

```sql
-- ✅ Clear foreign key relationships
session_id REFERENCES sessions(session_id)
agency_id REFERENCES agencies(agency_id)
task_id REFERENCES tasks(task_id)
user_id REFERENCES users(user_id)
parent_task_id REFERENCES tasks(task_id)
```

#### Timestamps
Format: `{action}_at`

```sql
-- ✅ Timestamp naming
created_at
updated_at
started_at
completed_at
expires_at
deleted_at
last_accessed_at
scheduled_at
```

#### Booleans
Format: `is_{state}` or `has_{attribute}`

```sql
-- ✅ Boolean naming
is_connected
is_active
is_qualified
is_completed
is_archived
has_dependencies
has_attachments
can_be_split
```

#### Counts
Format: `{entity}_count` or `total_{entity}`

```sql
-- ✅ Count naming
message_count
lead_count
notification_count
total_tasks
total_completed
subtask_count
```

#### Durations
Format: `{property}_{unit}`

```sql
-- ✅ Duration naming
duration_seconds
timeout_minutes
session_length_minutes
estimated_hours
actual_hours
```

#### JSON/JSONB Fields
Format: `{content}_data` or `{content}_metadata`

```sql
-- ✅ JSON field naming
settings_data
config_metadata
custom_fields
properties_data
context_data
```

### Index Naming

Format: `idx_{table}_{column(s)}` or `idx_{table}_{purpose}`

```sql
-- ✅ Index naming
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status_created ON tasks(status, created_at);
CREATE INDEX idx_sessions_active ON sessions(is_active) WHERE is_active = true;
```

### Constraint Naming

```sql
-- ✅ Constraint naming
-- Primary key: pk_{table}
CONSTRAINT pk_tasks PRIMARY KEY (task_id)

-- Foreign key: fk_{table}_{referenced_table}
CONSTRAINT fk_tasks_users FOREIGN KEY (user_id) REFERENCES users(user_id)

-- Unique: uq_{table}_{column(s)}
CONSTRAINT uq_users_email UNIQUE (email)

-- Check: ck_{table}_{description}
CONSTRAINT ck_tasks_priority_range CHECK (priority BETWEEN 1 AND 5)
```

## Python Code Naming

### Variables and Functions

Use `snake_case` for all variables and functions:

```python
# ✅ Good variable names
user_id = "123"
task_count = 10
is_completed = False
created_at = datetime.now()
max_retry_attempts = 3

# ✅ Good function names
def calculate_total_score(tasks: list[Task]) -> float:
    pass

def get_user_by_id(user_id: str) -> User:
    pass

def is_task_overdue(task: Task) -> bool:
    pass

def process_pending_notifications() -> None:
    pass

# ❌ Avoid
def calcScore(tasks):  # Use snake_case, not camelCase
    pass

def get_usr(id):  # Don't abbreviate
    pass

def check(task):  # Be specific
    pass
```

### Classes

Use `PascalCase` for class names:

```python
# ✅ Good class names
class TaskRepository:
    pass

class EnergyTracker:
    pass

class FocusSessionManager:
    pass

class UserAchievement:
    pass

# ❌ Avoid
class task_repository:  # Use PascalCase
    pass

class energyTrkr:  # Don't abbreviate
    pass

class Manager:  # Be specific
    pass
```

### Constants

Use `UPPER_SNAKE_CASE` for constants:

```python
# ✅ Good constants
MAX_TASK_DEPTH = 5
DEFAULT_TIMEOUT_SECONDS = 30
API_VERSION = "v1"
DATABASE_POOL_SIZE = 10
CACHE_TTL_MINUTES = 60

# ❌ Avoid
maxTaskDepth = 5
default_timeout = 30
api_ver = "v1"
```

### Private Attributes/Methods

Use single leading underscore for private members:

```python
class TaskProcessor:
    def __init__(self):
        self._cache = {}  # Private attribute
        self.public_data = []  # Public attribute

    def _validate_task(self, task: Task) -> bool:  # Private method
        pass

    def process_task(self, task: Task) -> None:  # Public method
        if self._validate_task(task):
            pass
```

### Type Aliases

Use `PascalCase` for type aliases:

```python
# ✅ Good type aliases
TaskId = UUID
UserId = str
Timestamp = datetime
JsonData = dict[str, Any]
TaskFilter = Callable[[Task], bool]

# Usage
def get_task(task_id: TaskId) -> Task:
    pass
```

### Enums

Use `PascalCase` for enum class names and `UPPER_SNAKE_CASE` for values:

```python
from enum import Enum

class TaskStatus(Enum):
    """Task status enumeration."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    BLOCKED = "blocked"

class Priority(Enum):
    """Task priority levels."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4
```

### Model Fields (Pydantic)

Mirror database field names exactly:

```python
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime

class Task(BaseModel):
    """Task model matching database schema."""
    # ✅ Field names match database exactly
    task_id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    title: str
    description: str | None = None
    status: TaskStatus
    priority: int
    is_completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime | None = None
    completed_at: datetime | None = None

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
        alias_generator=None  # Use exact field names
    )
```

## API Naming

### Endpoint Routes

Follow RESTful conventions with consistent parameter naming:

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

# ✅ RESTful routes with entity-specific parameters
@router.get("/{task_id}")           # GET /api/v1/tasks/{task_id}
@router.put("/{task_id}")           # PUT /api/v1/tasks/{task_id}
@router.delete("/{task_id}")        # DELETE /api/v1/tasks/{task_id}

# Sub-resources
@router.get("/{task_id}/subtasks")      # GET /api/v1/tasks/{task_id}/subtasks
@router.post("/{task_id}/complete")     # POST /api/v1/tasks/{task_id}/complete
@router.get("/user/{user_id}")          # GET /api/v1/tasks/user/{user_id}
```

### Query Parameters

Use `snake_case` for query parameters:

```python
@router.get("/")
async def list_tasks(
    user_id: UUID,
    status: TaskStatus | None = None,
    priority_min: int | None = None,
    created_after: datetime | None = None,
    limit: int = 100,
    offset: int = 0
) -> list[Task]:
    pass
```

### Request/Response Models

Use descriptive, action-oriented names:

```python
# ✅ Good request/response model names
class TaskCreateRequest(BaseModel):
    pass

class TaskUpdateRequest(BaseModel):
    pass

class TaskResponse(BaseModel):
    pass

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total_count: int
    has_more: bool

# ❌ Avoid
class TaskInput(BaseModel):  # Less clear
    pass

class TaskOut(BaseModel):  # Use full words
    pass
```

## File and Directory Naming

### Python Files

Use `snake_case` for Python files:

```
✅ Good file names
task_repository.py
focus_session_manager.py
energy_tracker.py
database_adapter.py
authentication.py

❌ Avoid
TaskRepository.py
focusSessionMgr.py
energyTrkr.py
db.py
auth.py
```

### Directory Structure

Use `snake_case` for directories:

```
✅ Good directory structure
src/
  agents/
  api/
    routes/
  core/
  database/
    migrations/
  repositories/
  services/
  tests/

❌ Avoid
src/
  Agents/
  API/
  Core/
  db/
```

### Test Files

Prefix with `test_` and mirror the file being tested:

```
✅ Good test file names
tests/
  test_task_repository.py
  test_focus_session_manager.py
  test_energy_tracker.py

Source files:
src/
  repositories/
    task_repository.py
  services/
    focus_session_manager.py
    energy_tracker.py
```

## Testing Conventions

### Test Function Names

Use descriptive names starting with `test_`:

```python
import pytest

# ✅ Good test names
def test_user_can_create_task_with_valid_data():
    pass

def test_task_creation_fails_with_invalid_user_id():
    pass

def test_completed_tasks_are_excluded_from_active_list():
    pass

def test_energy_level_updates_correctly_after_focus_session():
    pass

# ❌ Avoid
def test_create():  # Too vague
    pass

def test_task_1():  # Not descriptive
    pass

def testUserTask():  # Use underscores
    pass
```

### Test Fixtures

Use descriptive fixture names:

```python
@pytest.fixture
def sample_user() -> User:
    """Provide a sample user for testing."""
    return User(user_id=uuid4(), email="test@example.com")

@pytest.fixture
def sample_task() -> Task:
    """Provide a sample task for testing."""
    return Task(
        task_id=uuid4(),
        title="Test Task",
        status=TaskStatus.PENDING
    )

@pytest.fixture
def mock_database_session():
    """Provide a mock database session."""
    pass
```

## Git Conventions

### Branch Names

Use descriptive branch names with prefixes:

```bash
# ✅ Good branch names
feature/task-splitting-api
fix/energy-calculation-bug
docs/api-documentation-update
refactor/repository-pattern
test/integration-test-suite
chore/dependency-updates

# ❌ Avoid
new-feature
bugfix
my-branch
dev
```

### Commit Messages

Follow conventional commit format:

```bash
# Format
<type>(<scope>): <subject>

<body>

<footer>

# Types
feat, fix, docs, style, refactor, test, chore

# ✅ Good commit messages
feat(tasks): add task splitting API endpoint

Implement POST /api/v1/tasks/{task_id}/split endpoint with
automatic micro-step generation and dependency linking.

Closes #123

---

fix(energy): correct energy level calculation

Fix bug where energy levels were not properly normalized
after focus sessions completed.

---

docs(api): update API reference with new endpoints

Add documentation for task splitting and energy tracking
endpoints with examples.

---

refactor(repositories): standardize repository pattern

Update all repositories to use entity-specific primary keys
and remove manual field mapping.

# ❌ Avoid
"updated files"
"fixes"
"WIP"
"asdf"
```

### Tag Names

Use semantic versioning:

```bash
# ✅ Good tag names
v1.0.0
v1.2.3
v2.0.0-beta.1

# ❌ Avoid
release-1
v1
production
```

## Repository Pattern Standards

### Auto-Derivation

The BaseRepository automatically derives table names and primary keys:

```python
# ✅ STANDARDIZED: Convention-based repositories
class LeadRepository(BaseRepository[Lead]):
    def __init__(self):
        super().__init__()  # Auto-derives "leads" and "lead_id"

class SessionRepository(BaseRepository[AvatarSession]):
    def __init__(self):
        super().__init__()  # Auto-derives "sessions" and "session_id"

class TaskRepository(BaseRepository[Task]):
    def __init__(self):
        super().__init__()  # Auto-derives "tasks" and "task_id"
```

### Repository Method Naming

Use consistent CRUD operation names:

```python
class TaskRepository(BaseRepository[Task]):
    """Repository for task management."""

    # ✅ Standard CRUD operations (inherited from BaseRepository)
    # - create(entity: Task) -> Task
    # - get_by_id(task_id: UUID) -> Task | None
    # - update(entity: Task) -> Task
    # - delete(task_id: UUID) -> bool
    # - list_all() -> list[Task]

    # ✅ Additional query methods
    def find_by_user_id(self, user_id: UUID) -> list[Task]:
        pass

    def find_by_status(self, status: TaskStatus) -> list[Task]:
        pass

    def find_overdue_tasks(self) -> list[Task]:
        pass

    def count_by_user_id(self, user_id: UUID) -> int:
        pass
```

## Summary Checklist

### Database
- [ ] Table names are plural and snake_case
- [ ] Primary keys use entity-specific format: `{entity}_id`
- [ ] Foreign keys reference entity name: `{referenced_entity}_id`
- [ ] Timestamps end with `_at`
- [ ] Booleans start with `is_` or `has_`
- [ ] Counts use `{entity}_count` format

### Python Code
- [ ] Variables and functions use snake_case
- [ ] Classes use PascalCase
- [ ] Constants use UPPER_SNAKE_CASE
- [ ] Private members have single leading underscore
- [ ] Type aliases use PascalCase
- [ ] Model fields match database exactly

### API
- [ ] Routes follow RESTful conventions
- [ ] Path parameters use entity-specific names
- [ ] Query parameters use snake_case
- [ ] Request/Response models are descriptive

### Files
- [ ] Python files use snake_case
- [ ] Test files prefixed with `test_`
- [ ] Directory names use snake_case

### Git
- [ ] Branch names use prefix/description format
- [ ] Commit messages follow conventional format
- [ ] Tags use semantic versioning

## References

- [CLAUDE.md](CLAUDE.md) - Full development guidelines
- [PEP 8](https://pep8.org/) - Python style guide
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message format
- [REST API Naming Best Practices](https://restfulapi.net/resource-naming/)

---

**Note**: These conventions are enforced through:
- Ruff linting (`pyproject.toml`)
- Pre-commit hooks
- Code review process
- Automated testing

**Consistency is key** - when in doubt, follow existing patterns in the codebase.
