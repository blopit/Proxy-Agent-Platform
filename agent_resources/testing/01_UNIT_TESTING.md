# Unit Testing Guide

## Purpose

Unit tests verify individual functions, methods, and classes in isolation. They are the foundation of the testing pyramid and should comprise 70-80% of your test suite.

## Characteristics

✅ **Fast**: < 1 second per test
✅ **Isolated**: No external dependencies (database, network, filesystem)
✅ **Focused**: Test one thing at a time
✅ **Deterministic**: Same input always produces same output
✅ **Independent**: Can run in any order

## File Organization

### Vertical Slice Architecture

Tests live **next to the code they test**:

```
src/
├── services/
│   ├── task_service.py          # Source code
│   ├── __init__.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py          # Shared fixtures
│       └── test_task_service.py # Unit tests
```

### Naming Conventions

```python
# File: test_<module_name>.py
test_task_service.py
test_onboarding_service.py
test_user_repository.py

# Class: Test<ClassName> or Test<Feature>
class TestTaskService:
    pass

class TestTaskCreation:
    pass

# Function: test_<action>_<expected_behavior>
def test_create_task_with_valid_data():
    pass

def test_create_task_fails_with_missing_title():
    pass
```

## Basic Test Structure

### AAA Pattern (Arrange-Act-Assert)

```python
import pytest
from src.services.task_service import TaskService
from src.models.task import Task

def test_create_task_success():
    """Test creating a task with valid data."""
    # Arrange - Set up test data and dependencies
    service = TaskService()
    task_data = {
        "title": "Write unit tests",
        "description": "Comprehensive testing guide",
        "priority": "high"
    }

    # Act - Execute the function being tested
    result = service.create_task(task_data)

    # Assert - Verify the expected outcome
    assert isinstance(result, Task)
    assert result.title == "Write unit tests"
    assert result.priority == "high"
    assert result.id is not None
```

### Test Class Organization

```python
class TestTaskService:
    """Tests for TaskService class."""

    def test_create_task_success(self):
        """Test creating a task with valid data."""
        service = TaskService()
        task_data = {"title": "Test", "priority": "high"}

        result = service.create_task(task_data)

        assert result.title == "Test"

    def test_create_task_validates_priority(self):
        """Test that invalid priority raises ValidationError."""
        service = TaskService()
        task_data = {"title": "Test", "priority": "invalid"}

        with pytest.raises(ValidationError) as exc_info:
            service.create_task(task_data)

        assert "Invalid priority" in str(exc_info.value)

    def test_create_task_requires_title(self):
        """Test that missing title raises ValidationError."""
        service = TaskService()
        task_data = {"priority": "high"}

        with pytest.raises(ValidationError) as exc_info:
            service.create_task(task_data)

        assert "title" in str(exc_info.value).lower()
```

## Using Fixtures

### Basic Fixtures

```python
# conftest.py in same directory
import pytest
from src.services.task_service import TaskService

@pytest.fixture
def task_service():
    """Provide a TaskService instance for testing."""
    return TaskService()

@pytest.fixture
def sample_task_data():
    """Provide sample task data for testing."""
    return {
        "title": "Sample Task",
        "description": "Sample description",
        "priority": "medium",
        "tags": ["work", "urgent"]
    }

# test_task_service.py
def test_create_task(task_service, sample_task_data):
    """Test task creation with fixture data."""
    result = task_service.create_task(sample_task_data)

    assert result.title == sample_task_data["title"]
    assert result.priority == sample_task_data["priority"]
```

### Fixture Scopes

```python
@pytest.fixture(scope="function")  # Default - new instance per test
def task_service():
    return TaskService()

@pytest.fixture(scope="class")  # One instance per test class
def shared_service():
    return TaskService()

@pytest.fixture(scope="module")  # One instance per test module
def db_connection():
    conn = create_connection()
    yield conn
    conn.close()

@pytest.fixture(scope="session")  # One instance for entire test session
def app_config():
    return load_config()
```

### Fixture Teardown

```python
@pytest.fixture
def temp_file():
    """Create a temporary file and clean up after test."""
    # Setup
    file_path = "/tmp/test_file.txt"
    with open(file_path, "w") as f:
        f.write("test data")

    # Provide to test
    yield file_path

    # Teardown
    if os.path.exists(file_path):
        os.remove(file_path)
```

## Mocking External Dependencies

### Using pytest-mock

```python
import pytest
from src.services.notification_service import NotificationService

def test_send_notification_calls_email_service(mocker):
    """Test that send_notification calls the email service."""
    # Mock the email service
    mock_email = mocker.patch('src.services.email_service.send_email')

    # Execute
    service = NotificationService()
    service.send_notification("user@example.com", "Hello!")

    # Verify mock was called
    mock_email.assert_called_once_with(
        to="user@example.com",
        message="Hello!"
    )

def test_send_notification_handles_email_failure(mocker):
    """Test notification service handles email failures gracefully."""
    # Mock email service to raise exception
    mock_email = mocker.patch(
        'src.services.email_service.send_email',
        side_effect=EmailError("SMTP connection failed")
    )

    service = NotificationService()

    # Should not raise exception
    result = service.send_notification("user@example.com", "Hello!")

    assert result.success is False
    assert "SMTP connection failed" in result.error_message
```

### Mocking Database Calls

```python
def test_get_user_by_id(mocker):
    """Test getting user by ID without hitting database."""
    # Mock the repository
    mock_repo = mocker.Mock()
    mock_repo.get_by_id.return_value = User(
        id=123,
        name="Test User",
        email="test@example.com"
    )

    # Use mock in service
    service = UserService(repository=mock_repo)
    user = service.get_user(123)

    # Verify
    assert user.name == "Test User"
    mock_repo.get_by_id.assert_called_once_with(123)
```

### Mocking API Calls

```python
import pytest
import requests
from src.integrations.github_client import GitHubClient

def test_get_repo_info(mocker):
    """Test GitHub API call without hitting actual API."""
    # Mock requests.get
    mock_response = mocker.Mock()
    mock_response.json.return_value = {
        "name": "test-repo",
        "stars": 100,
        "forks": 50
    }
    mock_response.status_code = 200

    mocker.patch('requests.get', return_value=mock_response)

    # Execute
    client = GitHubClient()
    repo = client.get_repo("owner/test-repo")

    # Verify
    assert repo["name"] == "test-repo"
    assert repo["stars"] == 100
```

## Testing Async Code

### Async Test Functions

```python
import pytest
from src.services.async_task_service import AsyncTaskService

@pytest.mark.asyncio
async def test_async_create_task():
    """Test async task creation."""
    service = AsyncTaskService()
    task_data = {"title": "Async Task", "priority": "high"}

    result = await service.create_task(task_data)

    assert result.title == "Async Task"

@pytest.mark.asyncio
async def test_async_task_with_timeout():
    """Test async task with timeout."""
    service = AsyncTaskService()

    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(
            service.slow_operation(),
            timeout=1.0
        )
```

### Async Fixtures

```python
@pytest.fixture
async def async_db_session():
    """Provide an async database session."""
    session = await create_async_session()
    yield session
    await session.close()

@pytest.mark.asyncio
async def test_with_async_fixture(async_db_session):
    """Test using async fixture."""
    result = await async_db_session.query(User).all()
    assert isinstance(result, list)
```

## Testing Exceptions

### Expected Exceptions

```python
import pytest
from src.services.task_service import TaskService
from src.exceptions import ValidationError, NotFoundError

def test_create_task_raises_validation_error():
    """Test that invalid data raises ValidationError."""
    service = TaskService()

    with pytest.raises(ValidationError) as exc_info:
        service.create_task({"priority": "invalid"})

    assert "Invalid priority" in str(exc_info.value)
    assert exc_info.value.field == "priority"

def test_get_task_raises_not_found():
    """Test that non-existent task raises NotFoundError."""
    service = TaskService()

    with pytest.raises(NotFoundError) as exc_info:
        service.get_task(99999)

    assert "Task not found" in str(exc_info.value)
```

### Multiple Exception Types

```python
@pytest.mark.parametrize("invalid_data,expected_error", [
    ({"priority": "invalid"}, ValidationError),
    ({"title": ""}, ValidationError),
    ({}, ValidationError),
    (None, TypeError),
])
def test_create_task_validation(invalid_data, expected_error):
    """Test various invalid inputs raise appropriate errors."""
    service = TaskService()

    with pytest.raises(expected_error):
        service.create_task(invalid_data)
```

## Parametrized Tests

### Basic Parametrization

```python
@pytest.mark.parametrize("priority,expected", [
    ("high", 3),
    ("medium", 2),
    ("low", 1),
])
def test_priority_to_number(priority, expected):
    """Test priority conversion to numeric value."""
    result = convert_priority_to_number(priority)
    assert result == expected
```

### Multiple Parameters

```python
@pytest.mark.parametrize("title,priority,expected_valid", [
    ("Valid Task", "high", True),
    ("Another Task", "medium", True),
    ("", "high", False),         # Empty title
    ("Valid", "invalid", False),  # Invalid priority
    (None, "high", False),        # None title
])
def test_task_validation(title, priority, expected_valid):
    """Test task validation with various inputs."""
    is_valid = validate_task(title, priority)
    assert is_valid == expected_valid
```

### Parametrized Fixtures

```python
@pytest.fixture(params=["high", "medium", "low"])
def priority_level(request):
    """Provide different priority levels."""
    return request.param

def test_task_with_all_priorities(priority_level):
    """Test task creation with all priority levels."""
    # This test runs 3 times, once for each priority
    task = create_task(priority=priority_level)
    assert task.priority == priority_level
```

## Testing Pydantic Models

### Model Validation

```python
import pytest
from pydantic import ValidationError
from src.models.task import Task

def test_task_model_valid_data():
    """Test Task model accepts valid data."""
    task = Task(
        title="Test Task",
        description="Test Description",
        priority="high",
        tags=["work", "urgent"]
    )

    assert task.title == "Test Task"
    assert task.priority == "high"
    assert len(task.tags) == 2

def test_task_model_validates_priority():
    """Test Task model rejects invalid priority."""
    with pytest.raises(ValidationError) as exc_info:
        Task(title="Test", priority="invalid")

    errors = exc_info.value.errors()
    assert any(e["loc"] == ("priority",) for e in errors)

def test_task_model_default_values():
    """Test Task model applies default values."""
    task = Task(title="Test Task")

    assert task.priority == "medium"  # Default
    assert task.tags == []             # Default
    assert task.completed is False     # Default
```

## Testing FastAPI Routes

### Using TestClient

```python
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_create_task_endpoint():
    """Test POST /api/v1/tasks endpoint."""
    response = client.post(
        "/api/v1/tasks",
        json={
            "title": "Test Task",
            "priority": "high"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Task"
    assert "id" in data

def test_get_task_endpoint():
    """Test GET /api/v1/tasks/{task_id} endpoint."""
    # Create task first
    create_response = client.post(
        "/api/v1/tasks",
        json={"title": "Test Task"}
    )
    task_id = create_response.json()["id"]

    # Get task
    response = client.get(f"/api/v1/tasks/{task_id}")

    assert response.status_code == 200
    assert response.json()["id"] == task_id

def test_get_nonexistent_task():
    """Test GET for non-existent task returns 404."""
    response = client.get("/api/v1/tasks/99999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
```

### Mocking Dependencies

```python
from fastapi import Depends
from src.api.deps import get_current_user

def override_get_current_user():
    """Mock authentication for testing."""
    return User(id=1, email="test@example.com")

# Override dependency
app.dependency_overrides[get_current_user] = override_get_current_user

def test_protected_endpoint():
    """Test endpoint that requires authentication."""
    response = client.get("/api/v1/users/me")

    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

# Clean up
app.dependency_overrides.clear()
```

## Best Practices

### DO ✅

```python
# Clear, descriptive names
def test_create_task_requires_title():
    pass

# One assertion per test (when possible)
def test_task_has_created_timestamp():
    task = create_task()
    assert task.created_at is not None

# Use fixtures for setup
@pytest.fixture
def sample_task():
    return Task(title="Test")

# Test edge cases
def test_empty_title_raises_error():
    with pytest.raises(ValidationError):
        Task(title="")

# Use parametrize for similar tests
@pytest.mark.parametrize("priority", ["high", "medium", "low"])
def test_all_priorities(priority):
    task = Task(title="Test", priority=priority)
    assert task.priority == priority
```

### DON'T ❌

```python
# Vague names
def test_task():
    pass

# Testing implementation details
def test_internal_cache_structure():
    service = TaskService()
    assert service._cache == {}  # Don't test private attributes

# Multiple unrelated assertions
def test_everything():
    task = create_task()
    assert task.title == "Test"
    assert task.priority == "high"
    assert task.tags == []
    assert task.completed is False  # Too many things

# Hard-coded sleeps
def test_async_operation():
    start_operation()
    time.sleep(5)  # Don't use sleep
    assert is_complete()

# Depending on external services
def test_real_api_call():
    response = requests.get("https://api.example.com")  # Don't hit real APIs
```

## Coverage Analysis

### Running Coverage

```bash
# Run tests with coverage
uv run pytest src/services/tests/ --cov=src/services --cov-report=term-missing

# HTML report
uv run pytest --cov=src --cov-report=html:Agent_Resources/reports/coverage-html

# View coverage
open Agent_Resources/reports/coverage-html/index.html
```

### Interpreting Results

```
Name                          Stmts   Miss  Cover   Missing
-----------------------------------------------------------
src/services/task_service.py     45      3    93%   34-36
src/services/user_service.py     38      8    79%   12, 45-51
-----------------------------------------------------------
TOTAL                            83     11    87%
```

**Coverage Goals**:
- Service layer: 85%+
- Critical paths: 95%+
- Overall: 80%+

## Common Patterns

### Testing Repository Methods

```python
def test_create_record(db_session):
    """Test creating a database record."""
    repo = TaskRepository(db_session)
    task_data = {"title": "Test", "priority": "high"}

    result = repo.create(task_data)

    assert result.id is not None
    assert result.title == "Test"

    # Verify in database
    saved = repo.get_by_id(result.id)
    assert saved.title == "Test"
```

### Testing Service Layer

```python
def test_service_orchestration(mocker):
    """Test service coordinates multiple operations."""
    # Mock repositories
    mock_task_repo = mocker.Mock()
    mock_user_repo = mocker.Mock()

    # Setup
    service = TaskService(
        task_repo=mock_task_repo,
        user_repo=mock_user_repo
    )

    # Execute
    service.assign_task(task_id=1, user_id=2)

    # Verify orchestration
    mock_task_repo.update.assert_called_once()
    mock_user_repo.get_by_id.assert_called_once_with(2)
```

## Running Tests

```bash
# Run all unit tests in a module
uv run pytest src/services/tests/ -v

# Run specific test file
uv run pytest src/services/tests/test_task_service.py -v

# Run specific test
uv run pytest src/services/tests/test_task_service.py::test_create_task -v

# Run tests matching pattern
uv run pytest -k "create_task" -v

# Run with coverage
uv run pytest src/services/tests/ --cov=src/services --cov-report=term-missing
```

## Next Steps

- **Integration Testing**: See `02_INTEGRATION_TESTING.md`
- **Test Data Management**: See `05_TEST_DATA.md`
- **Quick Start**: See `06_QUICK_START.md`

---

**Last Updated**: November 2025
**Version**: 1.0
