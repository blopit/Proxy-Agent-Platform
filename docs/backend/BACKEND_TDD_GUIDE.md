# Backend TDD Guide

**Test-Driven Development for Proxy Agent Platform Backend**

**Last Updated**: October 28, 2025
**Version**: 0.1.0

---

## Table of Contents

- [Overview](#overview)
- [TDD Philosophy](#tdd-philosophy)
- [TDD Workflow](#tdd-workflow)
- [Testing Layers](#testing-layers)
- [Repository Testing](#repository-testing)
- [Service Testing](#service-testing)
- [API Testing](#api-testing)
- [Agent Testing](#agent-testing)
- [Database Testing](#database-testing)
- [Integration Testing](#integration-testing)
- [Test Fixtures](#test-fixtures)
- [Mocking Strategies](#mocking-strategies)
- [Code Coverage](#code-coverage)
- [Best Practices](#best-practices)

---

## Overview

Test-Driven Development (TDD) is **mandatory** for all backend code in the Proxy Agent Platform. This guide provides comprehensive patterns and examples for writing tests first.

### Why TDD?

- **Design First**: Tests force you to think about API design before implementation
- **Confidence**: High test coverage means confident refactoring
- **Documentation**: Tests serve as executable documentation
- **Regression Prevention**: Catch bugs before they reach production
- **ADHD-Friendly**: Small, focused iterations reduce cognitive load

### Coverage Goals

| Layer | Target Coverage | Current |
|-------|----------------|---------|
| **Overall** | 95%+ | 🎯 Target |
| **Services** | 90%+ | 🎯 Target |
| **Repositories** | 85%+ | 🎯 Target |
| **API Routes** | 80%+ | 🎯 Target |
| **Agents** | 75%+ | 🎯 Target |

---

## TDD Philosophy

### RED-GREEN-REFACTOR Cycle

```
┌─────────────────────────────────────────┐
│  1. RED: Write failing test             │
│  • Think about API design                │
│  • Write test for desired behavior       │
│  • Run test (should FAIL)                │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  2. GREEN: Make test pass                │
│  • Write minimal code to pass            │
│  • Don't worry about elegance yet        │
│  • Run test (should PASS)                │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  3. REFACTOR: Improve code               │
│  • Clean up implementation               │
│  • Remove duplication                    │
│  • Keep tests passing                    │
└────────────────┬────────────────────────┘
                 │
                 └──────┐
                        │
                 ┌──────▼─────┐
                 │   Repeat   │
                 └────────────┘
```

### Core Principles

1. **Write tests before code** - Always
2. **One test at a time** - Focus on one behavior
3. **Small steps** - Incremental progress (ADHD-friendly)
4. **Refactor continuously** - Keep code clean
5. **Tests must be fast** - < 30 seconds for full suite

---

## TDD Workflow

### Step-by-Step Process

#### 1. RED Phase: Write Failing Test

```python
# tests/test_task_service.py
import pytest
from uuid import uuid4
from src.services.task_service_v2 import TaskService
from src.core.models import TaskCreate, TaskStatus

def test_user_can_create_task_with_valid_data():
    """
    RED: Test that users can create tasks with valid data.

    This test will fail because create_task() doesn't exist yet.
    """
    # Arrange
    user_id = uuid4()
    task_data = TaskCreate(
        title="Write comprehensive tests",
        description="Complete TDD guide with examples",
        priority="high"
    )
    service = TaskService()

    # Act
    task = service.create_task(user_id, task_data)

    # Assert
    assert task.task_id is not None
    assert task.user_id == user_id
    assert task.title == "Write comprehensive tests"
    assert task.status == TaskStatus.TODO
    assert task.created_at is not None
```

**Run the test**:
```bash
uv run pytest tests/test_task_service.py::test_user_can_create_task_with_valid_data -v

# Expected output:
# FAILED - AttributeError: 'TaskService' has no attribute 'create_task'
```

✅ **Good!** The test fails for the right reason.

---

#### 2. GREEN Phase: Make Test Pass

```python
# src/services/task_service_v2.py
from uuid import UUID, uuid4
from datetime import datetime, timezone
from src.core.models import Task, TaskCreate, TaskStatus
from src.repositories.task_repository_v2 import TaskRepository

class TaskService:
    """Service for task management operations."""

    def __init__(self, task_repo: TaskRepository = None):
        self.task_repo = task_repo or TaskRepository()

    def create_task(self, user_id: UUID, task_data: TaskCreate) -> Task:
        """
        Create a new task.

        Args:
            user_id: ID of the user creating the task
            task_data: Task creation data

        Returns:
            Created task
        """
        # Create task entity
        task = Task(
            task_id=uuid4(),
            user_id=user_id,
            title=task_data.title,
            description=task_data.description or "",
            priority=task_data.priority or "medium",
            status=TaskStatus.TODO,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        # Persist task
        created_task = self.task_repo.create(task)

        return created_task
```

**Run the test**:
```bash
uv run pytest tests/test_task_service.py::test_user_can_create_task_with_valid_data -v

# Expected output:
# PASSED ✓
```

✅ **Green!** Test passes.

---

#### 3. REFACTOR Phase: Clean Up

```python
# src/services/task_service_v2.py (refactored)
from uuid import UUID, uuid4
from datetime import datetime, timezone
from src.core.models import Task, TaskCreate, TaskStatus
from src.repositories.task_repository_v2 import TaskRepository

class TaskService:
    """Service for task management operations."""

    def __init__(self, task_repo: TaskRepository = None):
        self.task_repo = task_repo or TaskRepository()

    def create_task(self, user_id: UUID, task_data: TaskCreate) -> Task:
        """
        Create a new task.

        Args:
            user_id: ID of the user creating the task
            task_data: Task creation data

        Returns:
            Created task

        Raises:
            ValueError: If task_data is invalid
        """
        # Validate input
        self._validate_task_data(task_data)

        # Build task entity
        task = self._build_task_entity(user_id, task_data)

        # Persist and return
        return self.task_repo.create(task)

    def _validate_task_data(self, task_data: TaskCreate) -> None:
        """Validate task creation data."""
        if not task_data.title.strip():
            raise ValueError("Task title cannot be empty")

    def _build_task_entity(self, user_id: UUID, task_data: TaskCreate) -> Task:
        """Build task entity from creation data."""
        return Task(
            task_id=uuid4(),
            user_id=user_id,
            title=task_data.title.strip(),
            description=task_data.description or "",
            priority=task_data.priority or "medium",
            status=TaskStatus.TODO,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
```

**Run tests again**:
```bash
uv run pytest tests/test_task_service.py -v

# All tests should still pass
```

✅ **Refactored!** Code is cleaner and tests still pass.

---

## Testing Layers

### Test Pyramid

```
        ┌─────────────┐
        │ Integration │  ← Few, slow, end-to-end
        │   Tests     │
        └──────┬──────┘
               │
         ┌─────▼──────┐
         │  Service   │  ← Some, medium speed
         │   Tests    │
         └─────┬──────┘
               │
          ┌────▼─────┐
          │   Unit   │  ← Many, fast, isolated
          │  Tests   │
          └──────────┘
```

### Test Distribution

- **70% Unit Tests** - Fast, isolated, many
- **20% Integration Tests** - Medium speed, test integration
- **10% End-to-End Tests** - Slow, full workflow

---

## Repository Testing

### Basic CRUD Tests

```python
# src/repositories/tests/test_task_repository.py
import pytest
from uuid import uuid4
from src.repositories.task_repository_v2 import TaskRepository
from src.core.models import Task, TaskStatus

class TestTaskRepository:
    """Test suite for TaskRepository."""

    @pytest.fixture
    def repo(self):
        """Provide clean repository instance."""
        return TaskRepository()

    @pytest.fixture
    def sample_task(self):
        """Provide sample task for testing."""
        return Task(
            task_id=uuid4(),
            user_id=uuid4(),
            title="Test task",
            description="Test description",
            status=TaskStatus.TODO,
            priority="medium"
        )

    def test_create_task_returns_task_with_id(self, repo, sample_task):
        """RED: Test creating task returns task with ID."""
        # Act
        created_task = repo.create(sample_task)

        # Assert
        assert created_task.task_id == sample_task.task_id
        assert created_task.title == "Test task"

    def test_get_by_id_returns_task(self, repo, sample_task):
        """RED: Test retrieving task by ID."""
        # Arrange
        repo.create(sample_task)

        # Act
        found_task = repo.get_by_id(sample_task.task_id)

        # Assert
        assert found_task is not None
        assert found_task.task_id == sample_task.task_id

    def test_get_by_id_returns_none_when_not_found(self, repo):
        """RED: Test get_by_id returns None for non-existent ID."""
        # Act
        result = repo.get_by_id(uuid4())

        # Assert
        assert result is None

    def test_update_task_changes_fields(self, repo, sample_task):
        """RED: Test updating task modifies fields."""
        # Arrange
        repo.create(sample_task)
        sample_task.title = "Updated title"
        sample_task.status = TaskStatus.IN_PROGRESS

        # Act
        updated_task = repo.update(sample_task.task_id, sample_task)

        # Assert
        assert updated_task.title == "Updated title"
        assert updated_task.status == TaskStatus.IN_PROGRESS

    def test_delete_task_removes_from_database(self, repo, sample_task):
        """RED: Test deleting task removes it."""
        # Arrange
        repo.create(sample_task)

        # Act
        repo.delete(sample_task.task_id)
        result = repo.get_by_id(sample_task.task_id)

        # Assert
        assert result is None

    def test_find_by_user_id_returns_user_tasks(self, repo):
        """RED: Test finding tasks by user ID."""
        # Arrange
        user_id = uuid4()
        task1 = Task(task_id=uuid4(), user_id=user_id, title="Task 1")
        task2 = Task(task_id=uuid4(), user_id=user_id, title="Task 2")
        task3 = Task(task_id=uuid4(), user_id=uuid4(), title="Task 3")

        repo.create(task1)
        repo.create(task2)
        repo.create(task3)

        # Act
        user_tasks = repo.find_by_user_id(user_id)

        # Assert
        assert len(user_tasks) == 2
        assert all(t.user_id == user_id for t in user_tasks)
```

### Custom Query Tests

```python
def test_find_overdue_tasks_returns_only_overdue(self, repo):
    """RED: Test finding overdue tasks."""
    # Arrange
    from datetime import datetime, timedelta, timezone

    overdue_task = Task(
        task_id=uuid4(),
        user_id=uuid4(),
        title="Overdue task",
        due_date=datetime.now(timezone.utc) - timedelta(days=1),
        is_completed=False
    )

    future_task = Task(
        task_id=uuid4(),
        user_id=uuid4(),
        title="Future task",
        due_date=datetime.now(timezone.utc) + timedelta(days=1),
        is_completed=False
    )

    repo.create(overdue_task)
    repo.create(future_task)

    # Act
    overdue_tasks = repo.find_overdue_tasks()

    # Assert
    assert len(overdue_tasks) == 1
    assert overdue_tasks[0].task_id == overdue_task.task_id
```

---

## Service Testing

### Business Logic Tests

```python
# src/services/tests/test_task_service.py
import pytest
from uuid import uuid4
from unittest.mock import Mock, patch
from src.services.task_service_v2 import TaskService
from src.core.models import Task, TaskCreate, TaskStatus

class TestTaskService:
    """Test suite for TaskService."""

    @pytest.fixture
    def mock_repo(self):
        """Provide mock repository."""
        return Mock()

    @pytest.fixture
    def service(self, mock_repo):
        """Provide service with mock repository."""
        return TaskService(task_repo=mock_repo)

    def test_create_task_calls_repository_create(self, service, mock_repo):
        """RED: Test create_task calls repository."""
        # Arrange
        user_id = uuid4()
        task_data = TaskCreate(title="Test task", description="Test")

        expected_task = Task(
            task_id=uuid4(),
            user_id=user_id,
            title="Test task",
            description="Test",
            status=TaskStatus.TODO
        )
        mock_repo.create.return_value = expected_task

        # Act
        result = service.create_task(user_id, task_data)

        # Assert
        mock_repo.create.assert_called_once()
        assert result.title == "Test task"

    def test_create_task_raises_error_for_empty_title(self, service):
        """RED: Test validation rejects empty title."""
        # Arrange
        user_id = uuid4()
        task_data = TaskCreate(title="   ", description="Test")

        # Act & Assert
        with pytest.raises(ValueError, match="title cannot be empty"):
            service.create_task(user_id, task_data)

    def test_create_task_strips_whitespace_from_title(self, service, mock_repo):
        """RED: Test title whitespace is stripped."""
        # Arrange
        user_id = uuid4()
        task_data = TaskCreate(title="  Test task  ", description="Test")

        mock_repo.create.return_value = Mock()

        # Act
        service.create_task(user_id, task_data)

        # Assert
        call_args = mock_repo.create.call_args[0][0]
        assert call_args.title == "Test task"  # Whitespace stripped

    def test_complete_task_updates_status_and_completion_time(self, service, mock_repo):
        """RED: Test completing task sets status and timestamp."""
        # Arrange
        task_id = uuid4()
        existing_task = Task(
            task_id=task_id,
            user_id=uuid4(),
            title="Test",
            status=TaskStatus.IN_PROGRESS
        )

        mock_repo.get_by_id.return_value = existing_task
        mock_repo.update.return_value = existing_task

        # Act
        result = service.complete_task(task_id)

        # Assert
        assert result.status == TaskStatus.DONE
        assert result.completed_at is not None
        mock_repo.update.assert_called_once()

    def test_complete_task_raises_error_when_task_not_found(self, service, mock_repo):
        """RED: Test completing non-existent task raises error."""
        # Arrange
        task_id = uuid4()
        mock_repo.get_by_id.return_value = None

        # Act & Assert
        with pytest.raises(ValueError, match="Task .* not found"):
            service.complete_task(task_id)
```

### Async Service Tests

```python
import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_create_task_async_calls_repository(service, mock_repo):
    """RED: Test async create_task calls repository."""
    # Arrange
    user_id = uuid4()
    task_data = TaskCreate(title="Async task")

    expected_task = Task(task_id=uuid4(), title="Async task")
    mock_repo.create = AsyncMock(return_value=expected_task)

    # Act
    result = await service.create_task_async(user_id, task_data)

    # Assert
    mock_repo.create.assert_called_once()
    assert result.title == "Async task"
```

---

## API Testing

### FastAPI Route Tests

```python
# src/api/tests/test_tasks_v2.py
import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from src.api.main import app

client = TestClient(app)

class TestTasksAPI:
    """Test suite for Tasks API v2."""

    def test_create_task_returns_201_with_valid_data(self):
        """RED: Test POST /api/v2/tasks returns 201."""
        # Arrange
        task_data = {
            "title": "New task",
            "description": "Task description",
            "priority": "high"
        }

        # Act
        response = client.post("/api/v2/tasks", json=task_data)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New task"
        assert data["status"] == "todo"
        assert "task_id" in data

    def test_create_task_returns_422_with_invalid_data(self):
        """RED: Test validation error for invalid data."""
        # Arrange
        task_data = {
            "title": "",  # Empty title should fail validation
            "description": "Test"
        }

        # Act
        response = client.post("/api/v2/tasks", json=task_data)

        # Assert
        assert response.status_code == 422

    def test_get_task_returns_200_with_existing_task(self):
        """RED: Test GET /api/v2/tasks/{task_id} returns task."""
        # Arrange - Create a task first
        create_response = client.post("/api/v2/tasks", json={
            "title": "Test task",
            "description": "Test"
        })
        task_id = create_response.json()["task_id"]

        # Act
        response = client.get(f"/api/v2/tasks/{task_id}")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == task_id
        assert data["title"] == "Test task"

    def test_get_task_returns_404_when_not_found(self):
        """RED: Test 404 for non-existent task."""
        # Arrange
        fake_id = str(uuid4())

        # Act
        response = client.get(f"/api/v2/tasks/{fake_id}")

        # Assert
        assert response.status_code == 404

    def test_update_task_returns_200_with_updated_data(self):
        """RED: Test PUT /api/v2/tasks/{task_id} updates task."""
        # Arrange - Create task
        create_response = client.post("/api/v2/tasks", json={
            "title": "Original title"
        })
        task_id = create_response.json()["task_id"]

        # Act
        update_response = client.put(
            f"/api/v2/tasks/{task_id}",
            json={"title": "Updated title"}
        )

        # Assert
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["title"] == "Updated title"

    def test_delete_task_returns_204(self):
        """RED: Test DELETE /api/v2/tasks/{task_id} deletes task."""
        # Arrange - Create task
        create_response = client.post("/api/v2/tasks", json={
            "title": "Task to delete"
        })
        task_id = create_response.json()["task_id"]

        # Act
        delete_response = client.delete(f"/api/v2/tasks/{task_id}")

        # Assert
        assert delete_response.status_code == 204

        # Verify it's deleted
        get_response = client.get(f"/api/v2/tasks/{task_id}")
        assert get_response.status_code == 404

    def test_list_tasks_returns_paginated_results(self):
        """RED: Test GET /api/v2/tasks returns paginated list."""
        # Arrange - Create multiple tasks
        for i in range(5):
            client.post("/api/v2/tasks", json={"title": f"Task {i}"})

        # Act
        response = client.get("/api/v2/tasks?limit=3&offset=0")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert len(data["tasks"]) <= 3
        assert "total" in data
        assert "has_more" in data
```

### Authentication Tests

```python
def test_create_task_requires_authentication(self):
    """RED: Test endpoint requires auth token."""
    # Act - No auth token
    response = client.post("/api/v2/tasks", json={"title": "Test"})

    # Assert
    assert response.status_code == 401

def test_create_task_succeeds_with_valid_token(self):
    """RED: Test endpoint works with valid token."""
    # Arrange
    token = "valid_token_here"  # From fixture
    headers = {"Authorization": f"Bearer {token}"}

    # Act
    response = client.post(
        "/api/v2/tasks",
        json={"title": "Test"},
        headers=headers
    )

    # Assert
    assert response.status_code == 201
```

---

## Agent Testing

### PydanticAI Agent Tests

```python
# src/agents/tests/test_task_agent.py
import pytest
from unittest.mock import Mock, patch
from src.agents.task_agent import TaskAgent
from src.core.models import Task

class TestTaskAgent:
    """Test suite for TaskAgent."""

    @pytest.fixture
    def agent(self):
        """Provide TaskAgent instance."""
        return TaskAgent()

    @pytest.mark.asyncio
    async def test_analyze_task_returns_breakdown(self, agent):
        """RED: Test agent analyzes and breaks down task."""
        # Arrange
        task = Task(
            title="Build authentication system",
            description="Implement JWT-based auth with refresh tokens"
        )

        # Act
        result = await agent.analyze_task(task)

        # Assert
        assert "breakdown" in result
        assert len(result["breakdown"]) > 0
        assert all("step" in item for item in result["breakdown"])

    @pytest.mark.asyncio
    @patch('src.agents.task_agent.Agent')
    async def test_analyze_task_calls_ai_model(self, mock_agent_class, agent):
        """RED: Test agent calls AI model."""
        # Arrange
        mock_agent = Mock()
        mock_agent.run.return_value = Mock(data={"breakdown": []})
        mock_agent_class.return_value = mock_agent

        task = Task(title="Test task")

        # Act
        await agent.analyze_task(task)

        # Assert
        mock_agent.run.assert_called_once()
```

---

## Database Testing

### Migration Tests

```python
# src/database/tests/test_migrations.py
import pytest
from alembic.config import Config
from alembic import command
from sqlalchemy import create_engine, inspect

class TestMigrations:
    """Test database migrations."""

    def test_migrations_run_without_errors(self, test_db_url):
        """RED: Test all migrations apply successfully."""
        # Arrange
        config = Config("alembic.ini")
        config.set_main_option("sqlalchemy.url", test_db_url)

        # Act & Assert - Should not raise
        command.upgrade(config, "head")

    def test_migration_creates_expected_tables(self, test_db_url):
        """RED: Test migration creates all tables."""
        # Arrange
        engine = create_engine(test_db_url)
        inspector = inspect(engine)

        # Act
        command.upgrade(Config("alembic.ini"), "head")
        tables = inspector.get_table_names()

        # Assert
        expected_tables = [
            "users", "tasks", "projects", "micro_steps",
            "compass_zones", "morning_rituals"
        ]
        for table in expected_tables:
            assert table in tables
```

---

## Integration Testing

### Full Workflow Tests

```python
# src/tests/integration/test_task_workflow.py
import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

class TestTaskWorkflow:
    """Integration tests for complete task workflows."""

    def test_complete_task_creation_workflow(self):
        """
        RED: Test complete task creation workflow.

        Workflow:
        1. Create user
        2. Create project
        3. Create task in project
        4. Split task into micro-steps
        5. Complete micro-steps
        6. Complete task
        7. Verify XP earned
        """
        # 1. Create user (or login)
        auth_response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "SecurePass123!"
        })
        assert auth_response.status_code == 201
        token = auth_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create project
        project_response = client.post(
            "/api/v1/projects",
            json={"name": "Test Project", "description": "Test"},
            headers=headers
        )
        assert project_response.status_code == 201
        project_id = project_response.json()["project_id"]

        # 3. Create task
        task_response = client.post(
            "/api/v2/tasks",
            json={
                "title": "Implement feature",
                "description": "Build new feature",
                "project_id": project_id
            },
            headers=headers
        )
        assert task_response.status_code == 201
        task_id = task_response.json()["task_id"]

        # 4. Split into micro-steps
        split_response = client.post(
            f"/api/v1/tasks/{task_id}/split",
            json={"max_steps": 5},
            headers=headers
        )
        assert split_response.status_code == 200
        micro_steps = split_response.json()["micro_steps"]
        assert len(micro_steps) > 0

        # 5. Complete first micro-step
        step_id = micro_steps[0]["step_id"]
        step_complete_response = client.patch(
            f"/api/v1/micro-steps/{step_id}/complete",
            headers=headers
        )
        assert step_complete_response.status_code == 200
        assert step_complete_response.json()["xp_earned"] > 0

        # 6. Complete task
        task_complete_response = client.patch(
            f"/api/v2/tasks/{task_id}/status",
            json={"status": "done"},
            headers=headers
        )
        assert task_complete_response.status_code == 200

        # 7. Verify XP earned
        xp_data = task_complete_response.json()
        assert "xp_earned" in xp_data
        assert xp_data["xp_earned"] > 0
```

---

## Test Fixtures

### Shared Fixtures (conftest.py)

```python
# src/conftest.py
import pytest
from uuid import uuid4
from datetime import datetime, timezone
from src.core.models import Task, User, Project, TaskStatus
from src.database.connection import get_db_session, init_db

@pytest.fixture(scope="session")
def test_db():
    """Initialize test database."""
    init_db()
    yield
    # Cleanup after all tests

@pytest.fixture
def db_session(test_db):
    """Provide database session for tests."""
    session = next(get_db_session())
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def sample_user():
    """Provide sample user."""
    return User(
        user_id=uuid4(),
        username="testuser",
        email="test@example.com",
        created_at=datetime.now(timezone.utc)
    )

@pytest.fixture
def sample_project(sample_user):
    """Provide sample project."""
    return Project(
        project_id=uuid4(),
        name="Test Project",
        description="Test project description",
        owner_id=sample_user.user_id,
        created_at=datetime.now(timezone.utc)
    )

@pytest.fixture
def sample_task(sample_user, sample_project):
    """Provide sample task."""
    return Task(
        task_id=uuid4(),
        user_id=sample_user.user_id,
        project_id=sample_project.project_id,
        title="Sample task",
        description="Sample description",
        status=TaskStatus.TODO,
        priority="medium",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

@pytest.fixture
def completed_task(sample_task):
    """Provide completed task."""
    sample_task.status = TaskStatus.DONE
    sample_task.completed_at = datetime.now(timezone.utc)
    return sample_task
```

---

## Mocking Strategies

### Mock External Dependencies

```python
from unittest.mock import Mock, patch, AsyncMock

# Mock repository
@pytest.fixture
def mock_task_repo():
    repo = Mock()
    repo.create.return_value = Mock(task_id=uuid4())
    repo.get_by_id.return_value = None
    return repo

# Mock AI agent
@pytest.fixture
def mock_ai_agent():
    with patch('src.agents.task_agent.Agent') as mock:
        agent_instance = Mock()
        agent_instance.run = AsyncMock(return_value=Mock(data={}))
        mock.return_value = agent_instance
        yield mock

# Mock database session
@pytest.fixture
def mock_db_session():
    with patch('src.database.connection.get_db_session') as mock:
        session = Mock()
        mock.return_value = iter([session])
        yield session
```

---

## Code Coverage

### Running Coverage

```bash
# Run tests with coverage
uv run pytest --cov=src --cov-report=html --cov-report=term

# View HTML report
open htmlcov/index.html

# Coverage for specific module
uv run pytest --cov=src/services/task_service_v2 --cov-report=term
```

### Coverage Configuration

```toml
# pyproject.toml
[tool.coverage.run]
source = ["src"]
omit = [
    "*/tests/*",
    "*/test_*.py",
    "*/__init__.py",
    "*/conftest.py"
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "if TYPE_CHECKING:",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
]
```

---

## Best Practices

### 1. Test Naming

```python
# ✅ Good: Descriptive test names
def test_user_can_create_task_with_valid_data():
    pass

def test_create_task_raises_error_for_empty_title():
    pass

# ❌ Bad: Vague test names
def test_task():
    pass

def test_error():
    pass
```

### 2. Arrange-Act-Assert (AAA)

```python
def test_example():
    # Arrange: Set up test data
    user_id = uuid4()
    task_data = TaskCreate(title="Test")

    # Act: Execute the code under test
    result = service.create_task(user_id, task_data)

    # Assert: Verify the outcome
    assert result.title == "Test"
```

### 3. One Assertion Per Test (When Possible)

```python
# ✅ Good: Focused test
def test_create_task_returns_task_with_correct_title():
    result = service.create_task(user_id, task_data)
    assert result.title == "Expected title"

# ✅ Also good: Related assertions
def test_create_task_sets_all_required_fields():
    result = service.create_task(user_id, task_data)
    assert result.task_id is not None
    assert result.created_at is not None
    assert result.status == TaskStatus.TODO
```

### 4. Test Edge Cases

```python
def test_create_task_with_very_long_title():
    """Test handling of maximum title length."""
    long_title = "a" * 1000
    with pytest.raises(ValueError, match="Title too long"):
        service.create_task(user_id, TaskCreate(title=long_title))

def test_create_task_with_special_characters():
    """Test handling of special characters in title."""
    special_title = "Task with émojis 🎉 and symbols @#$%"
    result = service.create_task(user_id, TaskCreate(title=special_title))
    assert result.title == special_title
```

### 5. Fast Tests

```python
# ✅ Good: Mock slow operations
@patch('src.services.task_service.send_email_notification')
def test_task_completion_sends_notification(mock_send_email):
    service.complete_task(task_id)
    mock_send_email.assert_called_once()

# ❌ Bad: Actually send email (slow)
def test_task_completion_sends_notification():
    service.complete_task(task_id)  # Actually sends email
```

---

## Summary

### TDD Workflow Checklist

- [ ] Write failing test first (RED)
- [ ] Run test to ensure it fails
- [ ] Write minimal code to pass (GREEN)
- [ ] Run test to ensure it passes
- [ ] Refactor code (REFACTOR)
- [ ] Run tests again to ensure they still pass
- [ ] Commit changes
- [ ] Repeat for next feature

### Coverage Goals

- **Overall**: 95%+
- **New code**: 100%
- **Critical paths**: 100%
- **Edge cases**: Covered

### Test Speed Goals

- **Unit tests**: < 0.1s each
- **Integration tests**: < 1s each
- **Full suite**: < 30s

---

**Questions?** Check examples above or ask the team!

**Happy testing!** 🧪
