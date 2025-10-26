# Testing Strategy for Backend Refactoring
**Comprehensive testing approach to ensure quality and reliability**

**Version**: 1.0
**Date**: 2025-10-25
**Target Coverage**: 80%+ overall, 95%+ critical paths

---

## Executive Summary

This testing strategy ensures:
- ✅ **Zero regressions** during refactoring
- ✅ **80%+ code coverage** across all modules
- ✅ **Fast feedback** (<2 minutes for full test suite)
- ✅ **Confidence** in production deployments

### Test Pyramid

```
         /\
        /  \  E2E (5%)
       /____\
      /      \
     / Integr \  Integration (20%)
    /  ation   \
   /____________\
  /              \
 /   Unit Tests   \  Unit (75%)
/__________________\

Total Tests: ~500-1000
Execution Time: <2 minutes
Coverage Target: 80%+
```

---

## Test Categories

### 1. Unit Tests (75% of test suite)

**Goal**: Test individual functions/methods in isolation

**Characteristics**:
- Fast (<1ms per test)
- No database or external dependencies
- Use mocks extensively
- Highest coverage target (90%+)

**Frameworks**:
```python
# pyproject.toml
[project.optional-dependencies]
test = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.0.0",
    "pytest-mock>=3.11.0",
    "freezegun>=1.2.0",      # Time mocking
    "faker>=20.0.0",          # Test data generation
]
```

**Example Structure**:
```
tests/
├── unit/
│   ├── test_services/
│   │   ├── test_task_service.py
│   │   ├── test_project_service.py
│   │   └── test_gamification_service.py
│   ├── test_repositories/
│   │   ├── test_task_repository.py
│   │   └── test_project_repository.py
│   └── test_models/
│       ├── test_task_models.py
│       └── test_validators.py
└── conftest.py
```

**Example Unit Test**:
```python
# tests/unit/test_services/test_task_service.py

import pytest
from unittest.mock import Mock, MagicMock
from datetime import datetime, timezone
from freezegun import freeze_time

from src.services.task_service_v2 import TaskService, TaskNotFoundError
from src.core.task_models import Task, TaskStatus, TaskPriority

@pytest.fixture
def mock_task_repo():
    """Mock task repository"""
    return Mock()

@pytest.fixture
def mock_project_repo():
    """Mock project repository"""
    return Mock()

@pytest.fixture
def task_service(mock_task_repo, mock_project_repo):
    """Task service with mocked dependencies"""
    return TaskService(
        task_repo=mock_task_repo,
        project_repo=mock_project_repo
    )

class TestTaskCreation:
    """Test suite for task creation"""

    def test_create_task_success(self, task_service, mock_task_repo, mock_project_repo):
        """Should create task when project exists"""
        # Arrange
        mock_project = Mock(project_id="proj_123")
        mock_project_repo.get_by_id.return_value = mock_project

        expected_task = Task(
            task_id="task_456",
            title="Test Task",
            description="Test Description",
            project_id="proj_123",
            status=TaskStatus.TODO,
            priority=TaskPriority.HIGH
        )
        mock_task_repo.create.return_value = expected_task

        # Act
        result = task_service.create_task(
            title="Test Task",
            description="Test Description",
            project_id="proj_123",
            priority=TaskPriority.HIGH
        )

        # Assert
        assert result.task_id == "task_456"
        assert result.status == TaskStatus.TODO
        mock_project_repo.get_by_id.assert_called_once_with("proj_123")
        mock_task_repo.create.assert_called_once()

    def test_create_task_project_not_found(self, task_service, mock_project_repo):
        """Should raise ProjectNotFoundError when project doesn't exist"""
        # Arrange
        mock_project_repo.get_by_id.return_value = None

        # Act & Assert
        with pytest.raises(ProjectNotFoundError, match="Project proj_999 not found"):
            task_service.create_task(
                title="Test Task",
                description="Test",
                project_id="proj_999"
            )

    @freeze_time("2025-01-15 10:00:00")
    def test_create_task_sets_created_at(self, task_service, mock_task_repo, mock_project_repo):
        """Should set created_at timestamp"""
        # Arrange
        mock_project_repo.get_by_id.return_value = Mock()

        # Act
        task_service.create_task(
            title="Test",
            description="Test",
            project_id="proj_1"
        )

        # Assert
        call_args = mock_task_repo.create.call_args[0][0]
        assert call_args.created_at == datetime(2025, 1, 15, 10, 0, 0, tzinfo=timezone.utc)

class TestTaskStatusUpdate:
    """Test suite for task status updates"""

    def test_complete_task_sets_completed_at(self, task_service, mock_task_repo):
        """Should set completed_at when status changes to COMPLETED"""
        # Arrange
        existing_task = Task(
            task_id="task_1",
            title="Test",
            description="Test",
            project_id="proj_1",
            status=TaskStatus.IN_PROGRESS
        )
        mock_task_repo.get_by_id.return_value = existing_task

        updated_task = existing_task.copy(update={"status": TaskStatus.COMPLETED})
        mock_task_repo.update.return_value = updated_task

        # Act
        with freeze_time("2025-01-15 12:00:00"):
            result = task_service.update_task_status("task_1", TaskStatus.COMPLETED)

        # Assert
        update_call = mock_task_repo.update.call_args[0][1]
        assert update_call["status"] == TaskStatus.COMPLETED.value
        assert "completed_at" in update_call

    def test_start_task_sets_started_at_only_once(self, task_service, mock_task_repo):
        """Should set started_at only on first transition to IN_PROGRESS"""
        # Arrange
        task_without_started = Task(
            task_id="task_1",
            title="Test",
            description="Test",
            project_id="proj_1",
            status=TaskStatus.TODO,
            started_at=None
        )
        mock_task_repo.get_by_id.return_value = task_without_started

        # Act
        task_service.update_task_status("task_1", TaskStatus.IN_PROGRESS)

        # Assert - started_at should be set
        update_call = mock_task_repo.update.call_args[0][1]
        assert "started_at" in update_call

        # Now test with already-started task
        task_with_started = task_without_started.copy(
            update={"started_at": datetime(2025, 1, 15, 10, 0, 0, tzinfo=timezone.utc)}
        )
        mock_task_repo.get_by_id.return_value = task_with_started

        # Act again
        task_service.update_task_status("task_1", TaskStatus.IN_PROGRESS)

        # Assert - started_at should NOT be updated
        update_call = mock_task_repo.update.call_args[0][1]
        assert "started_at" not in update_call

# Run with:
# pytest tests/unit/test_services/test_task_service.py -v --cov=src/services
```

**Coverage Targets by Module**:

| Module | Target | Critical? |
|--------|--------|-----------|
| Services | 90% | ✅ Yes |
| Repositories | 85% | ✅ Yes |
| Models | 95% | ✅ Yes |
| API Routes | 80% | ✅ Yes |
| Utils | 70% | No |

---

### 2. Integration Tests (20% of test suite)

**Goal**: Test component interactions with real database

**Characteristics**:
- Slower (10-100ms per test)
- Use test database (in-memory SQLite or PostgreSQL)
- Real ORM interactions
- Test database queries

**Example Structure**:
```
tests/
└── integration/
    ├── test_task_workflows.py
    ├── test_repository_integration.py
    ├── test_service_integration.py
    └── test_database_migrations.py
```

**Example Integration Test**:
```python
# tests/integration/test_task_workflows.py

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database.models import Base, Task as TaskModel, Project as ProjectModel
from src.repositories.task_repository_v2 import TaskRepository
from src.repositories.project_repository_v2 import ProjectRepository
from src.services.task_service_v2 import TaskService

@pytest.fixture(scope="function")
def test_db():
    """Create test database"""
    # Use in-memory SQLite for speed
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    TestSessionLocal = sessionmaker(bind=engine)
    session = TestSessionLocal()

    yield session

    session.close()
    Base.metadata.drop_all(engine)

@pytest.fixture
def task_repo(test_db):
    return TaskRepository(test_db)

@pytest.fixture
def project_repo(test_db):
    return ProjectRepository(test_db)

@pytest.fixture
def task_service(task_repo, project_repo):
    return TaskService(task_repo, project_repo)

class TestTaskCreationWorkflow:
    """Integration test for full task creation workflow"""

    def test_create_project_and_tasks(self, test_db, task_service, project_repo):
        """Should create project and multiple tasks"""
        # Create project
        project = ProjectModel(
            project_id="proj_1",
            name="Test Project",
            description="Integration test project"
        )
        test_db.add(project)
        test_db.commit()

        # Create tasks
        task1 = task_service.create_task(
            title="Task 1",
            description="First task",
            project_id="proj_1"
        )
        task2 = task_service.create_task(
            title="Task 2",
            description="Second task",
            project_id="proj_1"
        )

        # Verify in database
        tasks_in_db = test_db.query(TaskModel).filter(
            TaskModel.project_id == "proj_1"
        ).all()

        assert len(tasks_in_db) == 2
        assert {t.title for t in tasks_in_db} == {"Task 1", "Task 2"}

    def test_task_with_parent_hierarchy(self, test_db, task_service, project_repo):
        """Should maintain parent-child relationships"""
        # Setup project
        project = ProjectModel(project_id="proj_1", name="Test", description="Test")
        test_db.add(project)
        test_db.commit()

        # Create parent task
        parent = task_service.create_task(
            title="Parent Task",
            description="Parent",
            project_id="proj_1"
        )

        # Create child task
        child = task_service.create_task(
            title="Child Task",
            description="Child",
            project_id="proj_1",
            parent_id=parent.task_id
        )

        # Verify hierarchy
        child_from_db = test_db.query(TaskModel).filter(
            TaskModel.task_id == child.task_id
        ).first()

        assert child_from_db.parent_id == parent.task_id

class TestDatabaseConstraints:
    """Test database-level constraints"""

    def test_foreign_key_cascade_delete(self, test_db, task_service):
        """Should cascade delete tasks when project is deleted"""
        # Create project and task
        project = ProjectModel(project_id="proj_1", name="Test", description="Test")
        test_db.add(project)
        test_db.commit()

        task = TaskModel(
            task_id="task_1",
            title="Test",
            description="Test",
            project_id="proj_1"
        )
        test_db.add(task)
        test_db.commit()

        # Delete project
        test_db.delete(project)
        test_db.commit()

        # Task should be deleted (cascade)
        remaining_tasks = test_db.query(TaskModel).filter(
            TaskModel.task_id == "task_1"
        ).all()

        assert len(remaining_tasks) == 0

# Run with:
# pytest tests/integration/ -v --cov=src
```

---

### 3. API Tests (15% of test suite)

**Goal**: Test HTTP endpoints end-to-end

**Characteristics**:
- Test full request/response cycle
- Validate request/response schemas
- Test error handling
- Use TestClient (no real HTTP)

**Example Structure**:
```
tests/
└── api/
    ├── test_task_endpoints.py
    ├── test_project_endpoints.py
    ├── test_authentication.py
    └── test_error_handling.py
```

**Example API Test**:
```python
# tests/api/test_task_endpoints.py

import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.database.connection import get_db
from tests.integration.conftest import test_db

# Override dependency for testing
def override_get_db():
    db = test_db()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

class TestTaskAPI:
    """API tests for task endpoints"""

    def test_create_task_success(self, test_db):
        """POST /api/v1/tasks should create task"""
        # Create project first
        project_response = client.post("/api/v1/projects", json={
            "name": "Test Project",
            "description": "API test project"
        })
        assert project_response.status_code == 201
        project_id = project_response.json()["project_id"]

        # Create task
        response = client.post("/api/v1/tasks", json={
            "title": "API Test Task",
            "description": "Testing API",
            "project_id": project_id,
            "priority": "high"
        })

        # Assert response
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "API Test Task"
        assert data["priority"] == "high"
        assert "task_id" in data
        assert "created_at" in data

    def test_create_task_invalid_project(self):
        """POST /api/v1/tasks with invalid project should return 404"""
        response = client.post("/api/v1/tasks", json={
            "title": "Test",
            "description": "Test",
            "project_id": "invalid_project_id"
        })

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_create_task_validation_error(self):
        """POST /api/v1/tasks with invalid data should return 422"""
        response = client.post("/api/v1/tasks", json={
            "title": "",  # Empty title (invalid)
            "description": "Test"
        })

        assert response.status_code == 422

    def test_get_task(self, test_db):
        """GET /api/v1/tasks/{task_id} should return task"""
        # Create project and task
        project_res = client.post("/api/v1/projects", json={
            "name": "Test", "description": "Test"
        })
        project_id = project_res.json()["project_id"]

        task_res = client.post("/api/v1/tasks", json={
            "title": "Test Task",
            "description": "Test",
            "project_id": project_id
        })
        task_id = task_res.json()["task_id"]

        # Get task
        response = client.get(f"/api/v1/tasks/{task_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == task_id
        assert data["title"] == "Test Task"

    def test_get_task_not_found(self):
        """GET /api/v1/tasks/{task_id} with invalid ID should return 404"""
        response = client.get("/api/v1/tasks/nonexistent_id")

        assert response.status_code == 404

    def test_update_task(self, test_db):
        """PATCH /api/v1/tasks/{task_id} should update task"""
        # Create task
        project_res = client.post("/api/v1/projects", json={
            "name": "Test", "description": "Test"
        })
        task_res = client.post("/api/v1/tasks", json={
            "title": "Original Title",
            "description": "Test",
            "project_id": project_res.json()["project_id"]
        })
        task_id = task_res.json()["task_id"]

        # Update task
        response = client.patch(f"/api/v1/tasks/{task_id}", json={
            "title": "Updated Title",
            "priority": "urgent"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["priority"] == "urgent"

    def test_delete_task(self, test_db):
        """DELETE /api/v1/tasks/{task_id} should delete task"""
        # Create task
        project_res = client.post("/api/v1/projects", json={
            "name": "Test", "description": "Test"
        })
        task_res = client.post("/api/v1/tasks", json={
            "title": "To Delete",
            "description": "Test",
            "project_id": project_res.json()["project_id"]
        })
        task_id = task_res.json()["task_id"]

        # Delete task
        response = client.delete(f"/api/v1/tasks/{task_id}")

        assert response.status_code == 204

        # Verify deletion
        get_response = client.get(f"/api/v1/tasks/{task_id}")
        assert get_response.status_code == 404

    def test_list_tasks_pagination(self, test_db):
        """GET /api/v1/tasks should support pagination"""
        # Create project and multiple tasks
        project_res = client.post("/api/v1/projects", json={
            "name": "Test", "description": "Test"
        })
        project_id = project_res.json()["project_id"]

        for i in range(25):
            client.post("/api/v1/tasks", json={
                "title": f"Task {i}",
                "description": "Test",
                "project_id": project_id
            })

        # Get first page
        response = client.get("/api/v1/tasks?page=1&page_size=10")
        data = response.json()

        assert response.status_code == 200
        assert len(data["tasks"]) == 10
        assert data["total"] == 25
        assert data["has_more"] is True

        # Get last page
        response = client.get("/api/v1/tasks?page=3&page_size=10")
        data = response.json()

        assert len(data["tasks"]) == 5
        assert data["has_more"] is False

# Run with:
# pytest tests/api/ -v
```

---

### 4. E2E Tests (5% of test suite)

**Goal**: Test critical user workflows end-to-end

**Characteristics**:
- Slowest tests (100ms-1s)
- Test complete scenarios
- Minimal mocking
- Focus on happy paths + critical edge cases

**Example E2E Test**:
```python
# tests/e2e/test_task_lifecycle.py

import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

class TestCompleteTaskLifecycle:
    """End-to-end test for complete task lifecycle"""

    def test_user_creates_and_completes_task(self):
        """
        Complete user workflow:
        1. Create project
        2. Create task
        3. Start task
        4. Complete task
        5. Verify achievements awarded
        """
        # Step 1: Create user
        user_response = client.post("/api/v1/users", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "SecurePass123!"
        })
        assert user_response.status_code == 201
        user_id = user_response.json()["user_id"]

        # Step 2: Create project
        project_response = client.post("/api/v1/projects", json={
            "name": "My First Project",
            "description": "E2E test project",
            "owner_id": user_id
        })
        assert project_response.status_code == 201
        project_id = project_response.json()["project_id"]

        # Step 3: Create task
        task_response = client.post("/api/v1/tasks", json={
            "title": "Complete onboarding",
            "description": "Finish user onboarding process",
            "project_id": project_id,
            "priority": "high",
            "assignee_id": user_id
        })
        assert task_response.status_code == 201
        task_id = task_response.json()["task_id"]

        # Step 4: Start task
        start_response = client.patch(f"/api/v1/tasks/{task_id}", json={
            "status": "in_progress"
        })
        assert start_response.status_code == 200
        assert start_response.json()["status"] == "in_progress"
        assert start_response.json()["started_at"] is not None

        # Step 5: Complete task
        complete_response = client.patch(f"/api/v1/tasks/{task_id}", json={
            "status": "completed"
        })
        assert complete_response.status_code == 200
        assert complete_response.json()["status"] == "completed"
        assert complete_response.json()["completed_at"] is not None

        # Step 6: Verify achievement awarded
        achievements_response = client.get(f"/api/v1/users/{user_id}/achievements")
        assert achievements_response.status_code == 200
        achievements = achievements_response.json()
        assert any(a["name"] == "First Task Completed" for a in achievements)

        # Step 7: Verify XP awarded
        user_progress = client.get(f"/api/v1/users/{user_id}/progress")
        assert user_progress.json()["total_xp"] > 0

# Run with:
# pytest tests/e2e/ -v -s
```

---

## Test Data Management

### Fixtures and Factories

```python
# tests/conftest.py

import pytest
from faker import Faker
from datetime import datetime, timezone
from src.core.task_models import Task, Project, TaskStatus, TaskPriority

fake = Faker()

@pytest.fixture
def fake_task_data():
    """Generate fake task data"""
    def _create_task_data(**overrides):
        data = {
            "title": fake.sentence(),
            "description": fake.text(),
            "project_id": f"proj_{fake.uuid4()}",
            "priority": TaskPriority.MEDIUM,
            "status": TaskStatus.TODO,
            "created_at": datetime.now(timezone.utc)
        }
        data.update(overrides)
        return data
    return _create_task_data

@pytest.fixture
def fake_project_data():
    """Generate fake project data"""
    def _create_project_data(**overrides):
        data = {
            "project_id": f"proj_{fake.uuid4()}",
            "name": fake.catch_phrase(),
            "description": fake.text(),
            "created_at": datetime.now(timezone.utc)
        }
        data.update(overrides)
        return data
    return _create_project_data

# Usage in tests:
def test_create_task(fake_task_data):
    task_data = fake_task_data(title="Specific Title", priority=TaskPriority.HIGH)
    # ... test
```

---

## Coverage Reporting

### pytest-cov Configuration

```toml
# pyproject.toml

[tool.pytest.ini_options]
addopts = [
    "--cov=src",
    "--cov-report=term-missing",
    "--cov-report=html:htmlcov",
    "--cov-report=xml:coverage.xml",
    "--cov-fail-under=80",  # Fail if coverage < 80%
]

[tool.coverage.run]
source = ["src"]
omit = [
    "*/tests/*",
    "*/__pycache__/*",
    "*/conftest.py"
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
    "if TYPE_CHECKING:",
]
```

### Running Coverage

```bash
# Run all tests with coverage
uv run pytest --cov

# HTML report
uv run pytest --cov --cov-report=html
open htmlcov/index.html

# Check specific module
uv run pytest tests/unit/test_services/ --cov=src/services

# Coverage diff (shows uncovered lines)
uv run pytest --cov --cov-report=term-missing
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml

name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: uv sync --all-extras

      - name: Run linting
        run: |
          uv run ruff check src/
          uv run mypy src/

      - name: Run unit tests
        run: uv run pytest tests/unit/ -v --cov=src --cov-report=xml

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: uv run pytest tests/integration/ -v

      - name: Run API tests
        run: uv run pytest tests/api/ -v

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
          fail_ci_if_error: true

      - name: Check coverage threshold
        run: |
          coverage report --fail-under=80

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          curl -LsSf https://astral.sh/uv/install.sh | sh
          uv sync --all-extras

      - name: Run E2E tests
        run: uv run pytest tests/e2e/ -v --maxfail=1

  performance:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Run load tests
        run: |
          pip install locust
          locust -f tests/performance/locustfile.py --headless -u 100 -r 10 --run-time 2m
```

---

## Performance Testing

### Load Testing with Locust

```python
# tests/performance/locustfile.py

from locust import HttpUser, task, between
import random

class ProxyAgentUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Setup: Create project"""
        response = self.client.post("/api/v1/projects", json={
            "name": "Load Test Project",
            "description": "Performance testing"
        })
        self.project_id = response.json()["project_id"]

    @task(3)
    def create_task(self):
        """Create a task (weighted 3x)"""
        self.client.post("/api/v1/tasks", json={
            "title": f"Task {random.randint(1, 10000)}",
            "description": "Load test task",
            "project_id": self.project_id,
            "priority": random.choice(["low", "medium", "high"])
        })

    @task(2)
    def list_tasks(self):
        """List tasks (weighted 2x)"""
        self.client.get(f"/api/v1/tasks?project_id={self.project_id}&page_size=50")

    @task(1)
    def update_task(self):
        """Update task (weighted 1x)"""
        # Assume we have task IDs from previous creates
        if hasattr(self, 'last_task_id'):
            self.client.patch(f"/api/v1/tasks/{self.last_task_id}", json={
                "status": "in_progress"
            })

# Run with:
# locust -f tests/performance/locustfile.py
```

---

## Test Execution Strategy

### Local Development

```bash
# Quick unit tests (during development)
uv run pytest tests/unit/ -v --ff --maxfail=1

# Full test suite
uv run pytest -v

# Watch mode (re-run on file change)
uv run pytest-watch

# Specific test
uv run pytest tests/unit/test_services/test_task_service.py::TestTaskCreation::test_create_task_success -v
```

### Pre-Commit Hooks

```yaml
# .pre-commit-config.yaml

repos:
  - repo: local
    hooks:
      - id: pytest-quick
        name: Quick Unit Tests
        entry: uv run pytest tests/unit/ --maxfail=3
        language: system
        pass_filenames: false
        always_run: true

      - id: ruff
        name: Ruff Linting
        entry: uv run ruff check
        language: system
        types: [python]

      - id: mypy
        name: Type Checking
        entry: uv run mypy
        language: system
        types: [python]
```

---

## Test Maintenance

### Flaky Test Detection

```python
# pytest.ini or pyproject.toml
[tool.pytest.ini_options]
markers = [
    "flaky: mark test as flaky (may fail intermittently)"
]

# Use pytest-flakefinder
# uv add --dev pytest-flakefinder
# pytest --flake-finder --flake-runs=10
```

### Test Ownership

```python
# tests/unit/test_services/test_task_service.py

"""
Task Service Tests

Owner: @backend-team
Reviewers: @senior-backend-engineers
Last Updated: 2025-10-25
Coverage: 92%
"""
```

---

## Quality Gates

### Required for Merge

- [ ] All tests pass (100%)
- [ ] Code coverage ≥80% (overall)
- [ ] Critical paths ≥95% coverage
- [ ] No flaky tests
- [ ] Performance tests pass
- [ ] Linting passes (ruff, mypy)

### Sprint Quality Goals

| Sprint | Tests | Coverage | Performance |
|--------|-------|----------|-------------|
| 1.1 | 50 tests | 60% | N/A |
| 1.2 | 150 tests | 70% | N/A |
| 1.3 | 250 tests | 75% | <300ms p95 |
| 2.1 | 350 tests | 78% | <250ms p95 |
| 2.2 | 450 tests | 80% | <220ms p95 |
| 2.3 | 600 tests | 85% | <200ms p95 |

---

## Appendix: Testing Checklist

### Before Starting Sprint

- [ ] Test environment configured
- [ ] Test database available
- [ ] pytest.ini configured
- [ ] Coverage thresholds set
- [ ] CI/CD pipeline ready

### During Sprint

- [ ] Write tests BEFORE code (TDD)
- [ ] Run tests locally before committing
- [ ] Review coverage report
- [ ] Fix flaky tests immediately
- [ ] Update test documentation

### Before Sprint End

- [ ] All tests passing
- [ ] Coverage targets met
- [ ] No skipped tests (unless documented)
- [ ] Performance tests run
- [ ] CI/CD green

---

**This testing strategy ensures:**
- 🧪 **Comprehensive coverage** (unit, integration, API, E2E)
- ⚡ **Fast feedback** (<2 minutes for full suite)
- 🔒 **Quality gates** (80%+ coverage required)
- 🚀 **CI/CD integration** (automated on every PR)

**Ready to test!** 🧪
