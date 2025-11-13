# Backend Developer Guide

A comprehensive guide for backend developers working on the Proxy Agent Platform. This guide will help you understand the architecture, patterns, and workflows used in the backend codebase.

## Table of Contents

- [Quick Start](#quick-start)
- [Backend Architecture](#backend-architecture)
- [Directory Structure](#directory-structure)
- [Core Concepts](#core-concepts)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

Before you begin, ensure you have:

- Python 3.11+
- UV package manager
- PostgreSQL 13+ (or SQLite for local dev)
- Basic understanding of FastAPI, Pydantic, and async Python

### Initial Setup

```bash
# Clone and navigate to repository
cd proxy-agent-platform

# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install all dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
uv run alembic upgrade head

# Run tests to verify setup
uv run pytest
```

### First Backend Task

```bash
# Start the development server
uv run uvicorn src.api.main:app --reload --port 8000

# In another terminal, test the API
curl http://localhost:8000/api/v1/health

# View interactive API docs
open http://localhost:8000/docs
```

### Essential Reading Order

1. **[CLAUDE.md](CLAUDE.md)** - Development standards (MUST READ)
2. **[NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md)** - Naming standards
3. **[docs/TECH_STACK.md](docs/TECH_STACK.md)** - Technology decisions
4. **[docs/architecture/system-overview.md](docs/architecture/system-overview.md)** - System architecture
5. This guide - Backend specifics

## Backend Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              API Layer (FastAPI)                │
│  - REST endpoints                               │
│  - WebSocket handlers                           │
│  - Request validation                           │
│  - Response serialization                       │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│           Services Layer                        │
│  - Business logic                               │
│  - Workflow orchestration                       │
│  - Cross-cutting concerns                       │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│          Agents Layer (PydanticAI)              │
│  - Task Proxy                                   │
│  - Focus Proxy                                  │
│  - Energy Proxy                                 │
│  - Progress Proxy                               │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│       Repositories Layer                        │
│  - Data access abstraction                      │
│  - CRUD operations                              │
│  - Query building                               │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┘
│         Database Layer                          │
│  - PostgreSQL / SQLite                          │
│  - Alembic migrations                           │
└─────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### API Layer (`src/api/`)
- **Purpose**: HTTP interface to the application
- **Responsibilities**:
  - Route handling and request validation
  - Authentication and authorization
  - Response formatting
  - Error handling
- **Technologies**: FastAPI, Pydantic
- **Key Files**:
  - `main.py` - Application factory and configuration
  - `routes/` - Endpoint definitions by domain

#### Services Layer (`src/services/`)
- **Purpose**: Business logic and workflow orchestration
- **Responsibilities**:
  - Complex business operations
  - Multi-repository coordination
  - Event emission
  - External service integration
- **Technologies**: Pure Python, async/await
- **Key Files**:
  - `task_service.py` - Task management logic
  - `focus_service.py` - Focus session management
  - `energy_service.py` - Energy tracking logic

#### Agents Layer (`src/agents/`)
- **Purpose**: AI-powered decision making and automation
- **Responsibilities**:
  - Natural language understanding
  - Intelligent task processing
  - Contextual recommendations
  - Learning and adaptation
- **Technologies**: PydanticAI, OpenAI/Anthropic/Google
- **Key Files**:
  - `base.py` - Base agent interface
  - `task_proxy.py` - Task processing agent
  - `focus_proxy.py` - Focus management agent

#### Repositories Layer (`src/repositories/`)
- **Purpose**: Data access abstraction
- **Responsibilities**:
  - CRUD operations
  - Query building
  - Database transaction management
  - Data mapping
- **Technologies**: Custom BaseRepository pattern
- **Key Files**:
  - `base_repository.py` - Generic repository base
  - `task_repository.py` - Task data access
  - `user_repository.py` - User data access

#### Database Layer (`src/database/`)
- **Purpose**: Data persistence and schema management
- **Responsibilities**:
  - Database connection management
  - Schema migrations
  - Connection pooling
- **Technologies**: PostgreSQL/SQLite, Alembic
- **Key Files**:
  - `adapter.py` - Database connection adapter
  - `migrations/` - Alembic migration files

## Directory Structure

```
src/
├── __init__.py                   # Package marker
├── conftest.py                   # Pytest configuration
│
├── api/                          # HTTP API Layer
│   ├── main.py                   # FastAPI application factory
│   ├── dependencies.py           # Dependency injection
│   ├── middleware.py             # Custom middleware
│   ├── routes/                   # API route modules
│   │   ├── tasks.py             # Task endpoints
│   │   ├── focus.py             # Focus endpoints
│   │   ├── energy.py            # Energy endpoints
│   │   ├── auth.py              # Authentication
│   │   └── health.py            # Health checks
│   └── tests/                    # API layer tests
│
├── agents/                       # AI Agents Layer
│   ├── base.py                   # Base agent interface
│   ├── task_proxy.py             # Task processing agent
│   ├── focus_proxy.py            # Focus management agent
│   ├── energy_proxy.py           # Energy tracking agent
│   ├── progress_proxy.py         # Progress tracking agent
│   └── tests/                    # Agent tests
│
├── services/                     # Business Logic Layer
│   ├── task_service.py           # Task management
│   ├── focus_service.py          # Focus sessions
│   ├── energy_service.py         # Energy tracking
│   ├── progress_service.py       # Progress tracking
│   ├── gamification_service.py   # XP and achievements
│   └── tests/                    # Service layer tests
│
├── repositories/                 # Data Access Layer
│   ├── base_repository.py        # Generic repository
│   ├── task_repository.py        # Task data access
│   ├── user_repository.py        # User data access
│   ├── session_repository.py     # Session data access
│   └── tests/                    # Repository tests
│
├── core/                         # Core Domain Models
│   ├── models.py                 # Shared data models
│   ├── task_models.py            # Task domain models
│   ├── capture_models.py         # Capture models
│   ├── creature_models.py        # Gamification models
│   ├── settings.py               # Application settings
│   └── tests/                    # Model tests
│
├── database/                     # Database Layer
│   ├── adapter.py                # Database connection
│   ├── enhanced_adapter.py       # Extended adapter
│   ├── seed_data.py              # Database seeding
│   ├── migrations/               # Alembic migrations
│   │   ├── env.py
│   │   └── versions/
│   └── tests/                    # Database tests
│
├── memory/                       # Memory & Context Layer
│   ├── client.py                 # Memory client
│   └── tests/                    # Memory tests
│
├── knowledge/                    # Knowledge Graph Layer
│   └── tests/                    # Knowledge tests
│
├── cli/                          # Command-Line Interface
│   ├── main.py                   # CLI entry point
│   └── tests/                    # CLI tests
│
└── mcp/                          # MCP Integration
    └── tests/                    # MCP tests
```

## Core Concepts

### 1. Repository Pattern

All data access goes through repositories that extend `BaseRepository`:

```python
from src.repositories.base_repository import BaseRepository
from src.core.task_models import Task
from uuid import UUID

class TaskRepository(BaseRepository[Task]):
    """Repository for task data access."""

    def __init__(self):
        # Auto-derives table name "tasks" and primary key "task_id"
        super().__init__()

    def find_by_user_id(self, user_id: UUID) -> list[Task]:
        """Find all tasks for a specific user."""
        query = "SELECT * FROM tasks WHERE user_id = ?"
        return self._fetch_many(query, (user_id,))

    def find_overdue_tasks(self) -> list[Task]:
        """Find all overdue incomplete tasks."""
        query = """
            SELECT * FROM tasks
            WHERE is_completed = false
            AND due_date < CURRENT_TIMESTAMP
        """
        return self._fetch_many(query)
```

**Benefits**:
- Consistent data access patterns
- Easy to test (mockable)
- Centralized query logic
- Type-safe operations

### 2. Service Layer Pattern

Business logic is centralized in service classes:

```python
from src.repositories.task_repository import TaskRepository
from src.core.task_models import Task, TaskCreateRequest
from uuid import UUID

class TaskService:
    """Service for task management operations."""

    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    async def create_task(
        self,
        user_id: UUID,
        request: TaskCreateRequest
    ) -> Task:
        """Create a new task with validation and side effects."""
        # Business logic: validate, process, create
        task = Task(
            user_id=user_id,
            title=request.title,
            description=request.description,
            priority=request.priority
        )

        # Persist via repository
        created_task = self.task_repo.create(task)

        # Side effects: emit events, update caches, etc.
        await self._emit_task_created_event(created_task)

        return created_task

    async def _emit_task_created_event(self, task: Task) -> None:
        """Emit task created event for other systems."""
        # Event emission logic
        pass
```

**Benefits**:
- Business logic separated from HTTP and data layers
- Easier to test business rules
- Reusable across different interfaces (API, CLI, etc.)
- Clear transaction boundaries

### 3. Dependency Injection

Use FastAPI's dependency injection for clean, testable code:

```python
from fastapi import Depends, APIRouter
from src.repositories.task_repository import TaskRepository
from src.services.task_service import TaskService
from src.database.adapter import get_db_session

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

# Dependency factories
def get_task_repository(db = Depends(get_db_session)) -> TaskRepository:
    """Provide task repository instance."""
    return TaskRepository(db)

def get_task_service(
    repo: TaskRepository = Depends(get_task_repository)
) -> TaskService:
    """Provide task service instance."""
    return TaskService(repo)

# Use in routes
@router.post("/")
async def create_task(
    request: TaskCreateRequest,
    service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """Create a new task."""
    task = await service.create_task(request)
    return TaskResponse.from_orm(task)
```

### 4. Agent Pattern (PydanticAI)

AI agents handle intelligent processing:

```python
from pydantic_ai import Agent
from src.core.task_models import Task

class TaskProcessingAgent:
    """Agent for intelligent task processing."""

    def __init__(self):
        self.agent = Agent(
            model="openai:gpt-4",
            system_prompt="""
            You are a task processing assistant. Help users by:
            - Breaking down complex tasks
            - Suggesting priorities
            - Identifying dependencies
            """
        )

    async def analyze_task(self, task: Task) -> dict:
        """Analyze a task and provide recommendations."""
        result = await self.agent.run(
            f"Analyze this task: {task.title}\n{task.description}"
        )
        return result.data
```

### 5. Pydantic Models

All data structures use Pydantic for validation:

```python
from pydantic import BaseModel, Field, validator
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    """Task status enumeration."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Task(BaseModel):
    """Task domain model."""
    task_id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus = TaskStatus.PENDING
    priority: int = Field(default=3, ge=1, le=5)
    is_completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('title')
    def title_must_not_be_empty(cls, v: str) -> str:
        """Ensure title is not just whitespace."""
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

    model_config = ConfigDict(
        from_attributes=True,  # Enable ORM mode
        use_enum_values=True
    )
```

## Development Workflow

### Test-Driven Development (TDD)

We follow strict TDD practices:

```python
# 1. Write the test first (RED)
def test_user_can_create_task_with_valid_data():
    """Test that users can create tasks with valid data."""
    # Arrange
    user_id = uuid4()
    request = TaskCreateRequest(
        title="Test Task",
        description="Test Description"
    )

    # Act
    task = task_service.create_task(user_id, request)

    # Assert
    assert task.task_id is not None
    assert task.user_id == user_id
    assert task.title == "Test Task"
    assert task.status == TaskStatus.PENDING

# 2. Make the test pass (GREEN)
# Implement the minimal code to make test pass

# 3. Refactor (REFACTOR)
# Clean up code while keeping tests green
```

### Development Commands

```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest src/services/tests/test_task_service.py

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Watch mode for TDD
uv run pytest-watch

# Format code
uv run ruff format .

# Lint code
uv run ruff check .

# Fix linting issues
uv run ruff check --fix .

# Type checking
uv run mypy src/

# Run pre-commit hooks
uv run pre-commit run --all-files
```

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/task-splitting-api

# 2. Write tests first
# Edit: src/services/tests/test_task_service.py

# 3. Run tests (should fail)
uv run pytest src/services/tests/test_task_service.py

# 4. Implement feature
# Edit: src/services/task_service.py

# 5. Run tests (should pass)
uv run pytest src/services/tests/test_task_service.py

# 6. Run full test suite
uv run pytest

# 7. Format and lint
uv run ruff format .
uv run ruff check --fix .

# 8. Commit changes
git add .
git commit -m "feat(tasks): add task splitting functionality"

# 9. Push and create PR
git push origin feature/task-splitting-api
```

### Database Migrations

```bash
# Create a new migration
uv run alembic revision -m "add_task_splitting_fields"

# Edit the generated migration file in src/database/migrations/versions/

# Apply migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1

# View migration history
uv run alembic history

# Check current version
uv run alembic current
```

## Common Tasks

### Adding a New API Endpoint

```python
# 1. Define the Pydantic models (src/core/task_models.py)
class TaskSplitRequest(BaseModel):
    """Request to split a task into subtasks."""
    max_subtasks: int = Field(default=5, ge=2, le=10)
    auto_generate: bool = True

class TaskSplitResponse(BaseModel):
    """Response for task splitting."""
    parent_task: Task
    subtasks: list[Task]
    total_subtasks: int

# 2. Add repository method (src/repositories/task_repository.py)
class TaskRepository(BaseRepository[Task]):
    def create_subtasks(
        self,
        parent_task_id: UUID,
        subtasks: list[Task]
    ) -> list[Task]:
        """Create multiple subtasks for a parent task."""
        # Implementation
        pass

# 3. Add service method (src/services/task_service.py)
class TaskService:
    async def split_task(
        self,
        task_id: UUID,
        request: TaskSplitRequest
    ) -> TaskSplitResponse:
        """Split a task into subtasks."""
        # Business logic
        pass

# 4. Add API endpoint (src/api/routes/tasks.py)
@router.post("/{task_id}/split", response_model=TaskSplitResponse)
async def split_task(
    task_id: UUID,
    request: TaskSplitRequest,
    service: TaskService = Depends(get_task_service)
) -> TaskSplitResponse:
    """
    Split a task into smaller subtasks.

    - **task_id**: ID of the task to split
    - **max_subtasks**: Maximum number of subtasks to create
    - **auto_generate**: Whether to use AI to generate subtasks
    """
    return await service.split_task(task_id, request)

# 5. Write tests (src/api/tests/test_tasks.py)
def test_split_task_returns_subtasks():
    """Test task splitting returns correct subtasks."""
    # Test implementation
    pass
```

### Adding a New Database Table

```bash
# 1. Create migration
uv run alembic revision -m "add_task_dependencies_table"

# 2. Edit migration file (src/database/migrations/versions/xxxxx_add_task_dependencies_table.py)
def upgrade():
    op.create_table(
        'task_dependencies',
        sa.Column('dependency_id', sa.UUID(), primary_key=True),
        sa.Column('task_id', sa.UUID(), sa.ForeignKey('tasks.task_id')),
        sa.Column('depends_on_task_id', sa.UUID(), sa.ForeignKey('tasks.task_id')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )

def downgrade():
    op.drop_table('task_dependencies')

# 3. Create model (src/core/task_models.py)
class TaskDependency(BaseModel):
    dependency_id: UUID = Field(default_factory=uuid4)
    task_id: UUID
    depends_on_task_id: UUID
    created_at: datetime = Field(default_factory=datetime.utcnow)

# 4. Create repository (src/repositories/task_dependency_repository.py)
class TaskDependencyRepository(BaseRepository[TaskDependency]):
    pass

# 5. Apply migration
uv run alembic upgrade head
```

### Adding a New Agent

```python
# 1. Create agent file (src/agents/priority_agent.py)
from pydantic_ai import Agent
from src.core.task_models import Task

class PriorityAgent:
    """Agent for intelligent priority assignment."""

    def __init__(self):
        self.agent = Agent(
            model="openai:gpt-4",
            system_prompt="You assign task priorities based on urgency and importance."
        )

    async def suggest_priority(self, task: Task) -> int:
        """Suggest a priority level for a task."""
        result = await self.agent.run(
            f"Suggest priority (1-5) for: {task.title}\n{task.description}"
        )
        return int(result.data)

# 2. Add agent tests (src/agents/tests/test_priority_agent.py)
import pytest
from src.agents.priority_agent import PriorityAgent

@pytest.mark.asyncio
async def test_priority_agent_suggests_high_priority_for_urgent_task():
    """Test that urgent tasks get high priority."""
    agent = PriorityAgent()
    task = Task(title="Fix production outage", description="Critical bug")
    priority = await agent.suggest_priority(task)
    assert priority >= 4

# 3. Integrate in service (src/services/task_service.py)
class TaskService:
    def __init__(
        self,
        task_repo: TaskRepository,
        priority_agent: PriorityAgent
    ):
        self.task_repo = task_repo
        self.priority_agent = priority_agent

    async def create_task_with_smart_priority(
        self,
        request: TaskCreateRequest
    ) -> Task:
        """Create task with AI-suggested priority."""
        suggested_priority = await self.priority_agent.suggest_priority(
            Task(**request.dict())
        )
        task = Task(**request.dict(), priority=suggested_priority)
        return self.task_repo.create(task)
```

## Best Practices

### 1. Always Use Type Hints

```python
# ✅ Good: Full type hints
def process_tasks(
    tasks: list[Task],
    user_id: UUID,
    include_completed: bool = False
) -> dict[str, Any]:
    """Process tasks for a user."""
    pass

# ❌ Bad: No type hints
def process_tasks(tasks, user_id, include_completed=False):
    pass
```

### 2. Write Descriptive Docstrings

```python
# ✅ Good: Google-style docstring
def calculate_completion_rate(user_id: UUID, days: int = 30) -> float:
    """
    Calculate task completion rate for a user.

    Args:
        user_id: ID of the user
        days: Number of days to analyze (default: 30)

    Returns:
        Completion rate as percentage (0.0 to 100.0)

    Raises:
        ValueError: If days is less than 1
        UserNotFoundError: If user doesn't exist

    Example:
        >>> rate = calculate_completion_rate(user_id, days=7)
        >>> print(f"Completion rate: {rate:.1f}%")
        Completion rate: 85.5%
    """
    if days < 1:
        raise ValueError("Days must be at least 1")
    # Implementation
```

### 3. Use Dependency Injection

```python
# ✅ Good: Dependency injection
class TaskService:
    def __init__(
        self,
        task_repo: TaskRepository,
        user_repo: UserRepository,
        event_bus: EventBus
    ):
        self.task_repo = task_repo
        self.user_repo = user_repo
        self.event_bus = event_bus

# ❌ Bad: Hard-coded dependencies
class TaskService:
    def __init__(self):
        self.task_repo = TaskRepository()  # Hard to test
        self.user_repo = UserRepository()  # Hard to test
```

### 4. Keep Functions Small

```python
# ✅ Good: Small, focused function
def validate_task_title(title: str) -> str:
    """Validate and clean task title."""
    if not title.strip():
        raise ValueError("Title cannot be empty")
    return title.strip()

def create_task(user_id: UUID, title: str, description: str) -> Task:
    """Create a new task."""
    validated_title = validate_task_title(title)
    task = Task(user_id=user_id, title=validated_title, description=description)
    return task_repo.create(task)

# ❌ Bad: Large function doing too much
def create_task(user_id, title, description):
    # Validation
    if not title.strip():
        raise ValueError("Title cannot be empty")
    # Creation
    task = Task(...)
    # Persistence
    task_repo.create(task)
    # Event emission
    event_bus.emit(...)
    # Cache update
    cache.set(...)
    # Notification
    send_notification(...)
    return task
```

### 5. Handle Errors Gracefully

```python
from fastapi import HTTPException, status

# ✅ Good: Specific error handling
@router.get("/{task_id}")
async def get_task(
    task_id: UUID,
    service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """Get a task by ID."""
    task = await service.get_task_by_id(task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )
    return TaskResponse.from_orm(task)

# ❌ Bad: Generic error handling
@router.get("/{task_id}")
async def get_task(task_id, service):
    try:
        return service.get_task_by_id(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 6. Use Async/Await Properly

```python
# ✅ Good: Async for I/O operations
async def get_user_tasks(user_id: UUID) -> list[Task]:
    """Get all tasks for a user (async I/O)."""
    tasks = await task_repo.find_by_user_id(user_id)
    return tasks

# ✅ Good: Sync for CPU-bound operations
def calculate_priority_score(task: Task) -> float:
    """Calculate priority score (CPU-bound)."""
    # Complex calculation
    return score

# ❌ Bad: Unnecessary async
async def add_numbers(a: int, b: int) -> int:
    """Add two numbers (doesn't need async)."""
    return a + b
```

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Problem: Database connection refused
# Solution: Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql

# Check database URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

#### Migration Errors

```bash
# Problem: Migration out of sync
# Solution: Check current state
uv run alembic current
uv run alembic history

# Stamp database to specific version
uv run alembic stamp head

# Or reset and reapply
uv run alembic downgrade base
uv run alembic upgrade head
```

#### Import Errors

```python
# Problem: ModuleNotFoundError
# Solution 1: Ensure virtual environment is activated
source .venv/bin/activate

# Solution 2: Reinstall dependencies
uv sync

# Solution 3: Check PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

#### Test Failures

```bash
# Problem: Tests failing unexpectedly
# Solution 1: Run single test with verbose output
uv run pytest src/services/tests/test_task_service.py::test_specific_test -v

# Solution 2: Clear pytest cache
uv run pytest --cache-clear

# Solution 3: Check test database is clean
uv run pytest --create-db

# Solution 4: Print output for debugging
uv run pytest -s  # Don't capture output
```

#### Type Checking Errors

```bash
# Problem: mypy type errors
# Solution 1: Ignore specific line (last resort)
result = problematic_function()  # type: ignore

# Solution 2: Add type hint
result: str = problematic_function()

# Solution 3: Update mypy configuration (pyproject.toml)
[tool.mypy]
strict = false
```

### Getting Help

1. **Check documentation**:
   - [CLAUDE.md](CLAUDE.md) for development standards
   - [docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md) for API details
   - [docs/architecture/system-overview.md](docs/architecture/system-overview.md) for architecture

2. **Search codebase**:
   ```bash
   # Find similar implementations
   rg "class.*Repository" src/repositories/

   # Find usage examples
   rg "TaskService" src/

   # Find tests
   rg "def test.*task" src/
   ```

3. **Run tests**:
   ```bash
   # Tests often serve as documentation
   uv run pytest src/ -v
   ```

4. **Check git history**:
   ```bash
   # See why code was written
   git log -p src/services/task_service.py

   # Find who wrote it
   git blame src/services/task_service.py
   ```

## Next Steps

After completing this guide:

1. **Set up your development environment** using the Quick Start
2. **Read the essential documentation** in the recommended order
3. **Run the test suite** to ensure everything works
4. **Pick a small task** and follow the TDD workflow
5. **Review a few pull requests** to understand code review standards
6. **Ask questions** when you're stuck

## Additional Resources

- [BACKEND_RESOURCES.md](BACKEND_RESOURCES.md) - Tools, libraries, and references
- [docs/api/README.md](docs/api/README.md) - API documentation
- [src/agents/README.md](src/agents/README.md) - Agent system documentation
- [src/memory/README.md](src/memory/README.md) - Memory system documentation

---

**Welcome to the team! Happy coding!**
