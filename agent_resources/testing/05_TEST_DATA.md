# Test Data Management Guide

## Purpose

Effective test data management ensures tests are reliable, maintainable, and isolated. This guide covers fixtures, factories, and test data patterns.

## Principles

✅ **Isolated**: Each test creates its own data
✅ **Realistic**: Data represents real-world scenarios
✅ **Minimal**: Only create what's needed
✅ **Clean**: Remove test data after tests
✅ **Repeatable**: Same data every time

## Pytest Fixtures

### Basic Fixtures

```python
# conftest.py
import pytest
from datetime import datetime, UTC
from uuid import uuid4

@pytest.fixture
def test_user_id():
    """Generate unique user ID for testing."""
    return f"test_user_{int(datetime.now(UTC).timestamp())}"

@pytest.fixture
def sample_task_data():
    """Provide sample task data."""
    return {
        "title": "Test Task",
        "description": "Test description",
        "priority": "high",
        "tags": ["work", "urgent"]
    }

@pytest.fixture
def sample_onboarding_data():
    """Provide complete onboarding data."""
    return {
        "work_preference": "remote",
        "adhd_support_level": 7,
        "adhd_challenges": ["time_blindness", "focus"],
        "daily_schedule": {
            "time_preference": "morning",
            "flexible_enabled": False,
            "week_grid": {
                "monday": "8-17",
                "tuesday": "8-17",
                "wednesday": "8-17",
                "thursday": "8-17",
                "friday": "8-17",
                "saturday": "off",
                "sunday": "off",
            },
        },
        "productivity_goals": ["reduce_overwhelm", "increase_focus"]
    }
```

### Fixture Scopes

```python
@pytest.fixture(scope="function")  # Default - new instance per test
def task_data():
    return {"title": "Test Task"}

@pytest.fixture(scope="class")  # One instance per test class
def shared_service():
    service = TaskService()
    return service

@pytest.fixture(scope="module")  # One instance per test file
def db_connection():
    conn = create_connection()
    yield conn
    conn.close()

@pytest.fixture(scope="session")  # One instance for entire test run
def app_config():
    return load_config()
```

### Fixture Composition

```python
@pytest.fixture
def db_session():
    """Provide database session."""
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture
def task_repository(db_session):
    """Provide task repository with DB session."""
    return TaskRepository(db_session)

@pytest.fixture
def task_service(task_repository):
    """Provide task service with repository."""
    return TaskService(task_repository)

# Use in test
def test_create_task(task_service, sample_task_data):
    """Test uses composed fixtures."""
    task = task_service.create_task(sample_task_data)
    assert task.id is not None
```

### Parametrized Fixtures

```python
@pytest.fixture(params=["high", "medium", "low"])
def priority_level(request):
    """Provide all priority levels."""
    return request.param

def test_task_with_all_priorities(priority_level, task_service):
    """Test runs 3 times, once for each priority."""
    task = task_service.create_task(
        {"title": "Test", "priority": priority_level}
    )
    assert task.priority == priority_level

@pytest.fixture(params=[
    {"work_preference": "remote"},
    {"work_preference": "hybrid"},
    {"work_preference": "office"},
])
def onboarding_scenarios(request):
    """Provide different onboarding scenarios."""
    return request.param
```

## Test Data Factories

### Using Faker

```python
# conftest.py
import pytest
from faker import Faker

fake = Faker()

@pytest.fixture
def random_user_data():
    """Generate random user data."""
    return {
        "name": fake.name(),
        "email": fake.email(),
        "phone": fake.phone_number(),
        "address": fake.address(),
        "company": fake.company(),
    }

@pytest.fixture
def random_task_data():
    """Generate random task data."""
    return {
        "title": fake.sentence(nb_words=5),
        "description": fake.paragraph(),
        "priority": fake.random_element(["high", "medium", "low"]),
        "due_date": fake.future_date(),
        "tags": fake.words(nb=3),
    }
```

### Factory Pattern

```python
# tests/factories.py
from typing import Dict, Any
from datetime import datetime, timedelta
import random

class TaskFactory:
    """Factory for creating test tasks."""

    @staticmethod
    def create(**overrides: Any) -> Dict[str, Any]:
        """Create task data with optional overrides."""
        task_data = {
            "title": "Test Task",
            "description": "Test description",
            "priority": "medium",
            "completed": False,
            "tags": [],
            "created_at": datetime.now(),
        }
        task_data.update(overrides)
        return task_data

    @staticmethod
    def create_batch(count: int, **overrides: Any) -> list[Dict[str, Any]]:
        """Create multiple tasks."""
        return [TaskFactory.create(**overrides) for _ in range(count)]

    @staticmethod
    def create_high_priority(**overrides: Any) -> Dict[str, Any]:
        """Create high priority task."""
        defaults = {"priority": "high", "tags": ["urgent"]}
        defaults.update(overrides)
        return TaskFactory.create(**defaults)

    @staticmethod
    def create_overdue(**overrides: Any) -> Dict[str, Any]:
        """Create overdue task."""
        defaults = {
            "due_date": datetime.now() - timedelta(days=2),
            "completed": False,
        }
        defaults.update(overrides)
        return TaskFactory.create(**defaults)

# Usage in tests
def test_create_task():
    task_data = TaskFactory.create(title="Custom Task")
    task = create_task(task_data)
    assert task.title == "Custom Task"

def test_multiple_tasks():
    tasks_data = TaskFactory.create_batch(5, priority="high")
    tasks = [create_task(data) for data in tasks_data]
    assert len(tasks) == 5
    assert all(t.priority == "high" for t in tasks)
```

### User Factory

```python
class UserFactory:
    """Factory for creating test users."""

    _counter = 0

    @classmethod
    def create(cls, **overrides: Any) -> Dict[str, Any]:
        """Create unique user data."""
        cls._counter += 1
        user_data = {
            "id": cls._counter,
            "email": f"test{cls._counter}@example.com",
            "name": f"Test User {cls._counter}",
            "created_at": datetime.now(),
        }
        user_data.update(overrides)
        return user_data

    @classmethod
    def reset(cls):
        """Reset counter (call in test teardown)."""
        cls._counter = 0

# Usage
def test_user_creation():
    user1 = UserFactory.create()
    user2 = UserFactory.create()
    assert user1["email"] != user2["email"]  # Unique emails
```

### Onboarding Factory

```python
class OnboardingFactory:
    """Factory for onboarding test data."""

    @staticmethod
    def create_minimal() -> Dict[str, Any]:
        """Create minimal onboarding data."""
        return {
            "work_preference": "remote",
        }

    @staticmethod
    def create_complete() -> Dict[str, Any]:
        """Create complete onboarding data."""
        return {
            "work_preference": "remote",
            "adhd_support_level": 7,
            "adhd_challenges": ["time_blindness", "task_initiation"],
            "daily_schedule": {
                "time_preference": "morning",
                "flexible_enabled": False,
                "week_grid": {
                    "monday": "8-17",
                    "tuesday": "8-17",
                    "wednesday": "8-17",
                    "thursday": "8-17",
                    "friday": "8-17",
                    "saturday": "off",
                    "sunday": "off",
                },
            },
            "productivity_goals": ["reduce_overwhelm", "increase_focus"],
        }

    @staticmethod
    def create_in_progress(completed_steps: int = 3) -> Dict[str, Any]:
        """Create partially completed onboarding."""
        data = {}
        if completed_steps >= 1:
            data["work_preference"] = "remote"
        if completed_steps >= 2:
            data["adhd_support_level"] = 7
        if completed_steps >= 3:
            data["adhd_challenges"] = ["time_blindness"]
        return data
```

## Database Test Data

### Transaction-Based Isolation

```python
@pytest.fixture
def db_session():
    """Provide transactional database session."""
    # Create session
    session = SessionLocal()

    # Begin transaction
    transaction = session.begin()

    yield session

    # Rollback after test (cleanup)
    transaction.rollback()
    session.close()

def test_with_rollback(db_session):
    """Changes are rolled back after test."""
    user = User(email="test@example.com")
    db_session.add(user)
    db_session.commit()

    # User exists in test
    assert db_session.query(User).count() == 1

    # But will be rolled back after test
```

### Test Database Setup

```python
# conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database.models import Base

TEST_DATABASE_URL = "sqlite:///test.db"

@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine."""
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)

@pytest.fixture
def db_session(test_engine):
    """Provide clean database session for each test."""
    Session = sessionmaker(bind=test_engine)
    session = Session()

    yield session

    session.rollback()
    session.close()
```

### Seeding Test Data

```python
@pytest.fixture
def seed_users(db_session):
    """Seed database with test users."""
    users = [
        User(email=f"user{i}@example.com", name=f"User {i}")
        for i in range(5)
    ]
    db_session.add_all(users)
    db_session.commit()
    return users

def test_with_seeded_data(db_session, seed_users):
    """Test uses pre-seeded users."""
    users = db_session.query(User).all()
    assert len(users) == 5
```

## Cleanup Patterns

### Fixture Cleanup (Setup/Teardown)

```python
@pytest.fixture
def temp_file():
    """Create temporary file and clean up."""
    # Setup
    file_path = "/tmp/test_file.txt"
    with open(file_path, "w") as f:
        f.write("test data")

    yield file_path

    # Teardown
    if os.path.exists(file_path):
        os.remove(file_path)

@pytest.fixture
def test_task(task_service):
    """Create task and clean up."""
    # Setup
    task = task_service.create_task({"title": "Test"})

    yield task

    # Teardown
    task_service.delete_task(task.id)
```

### Cleanup Lists Pattern

```python
# Integration test cleanup
@pytest.fixture
def cleanup_onboarding_data(base_url):
    """Track and cleanup onboarding data."""
    user_ids_to_cleanup = []

    yield user_ids_to_cleanup

    # Cleanup after test
    for user_id in user_ids_to_cleanup:
        try:
            requests.delete(
                f"{base_url}/api/v1/users/{user_id}/onboarding",
                timeout=10
            )
        except Exception:
            pass  # Ignore cleanup errors

# Usage
def test_onboarding(cleanup_onboarding_data, test_user_id):
    cleanup_onboarding_data.append(test_user_id)
    # ... test code ...
    # Cleanup happens automatically
```

## API Test Data

### Mock Response Data

```python
@pytest.fixture
def mock_github_response():
    """Provide mock GitHub API response."""
    return {
        "name": "test-repo",
        "full_name": "owner/test-repo",
        "description": "Test repository",
        "stars": 100,
        "forks": 50,
        "language": "Python",
        "url": "https://github.com/owner/test-repo"
    }

def test_github_integration(mocker, mock_github_response):
    """Test with mock API response."""
    mock_get = mocker.patch('requests.get')
    mock_get.return_value.json.return_value = mock_github_response

    repo = get_github_repo("owner/test-repo")
    assert repo["stars"] == 100
```

### Request/Response Builders

```python
class RequestBuilder:
    """Builder for test HTTP requests."""

    def __init__(self):
        self.data = {}
        self.headers = {"Content-Type": "application/json"}

    def with_auth(self, token: str):
        self.headers["Authorization"] = f"Bearer {token}"
        return self

    def with_data(self, **data):
        self.data.update(data)
        return self

    def build(self):
        return {"json": self.data, "headers": self.headers}

# Usage
def test_authenticated_request():
    request = (
        RequestBuilder()
        .with_auth("test_token")
        .with_data(title="Test Task", priority="high")
        .build()
    )

    response = requests.post(url, **request)
    assert response.status_code == 200
```

## Best Practices

### DO ✅

```python
# Use fixtures for common data
@pytest.fixture
def task_data():
    return {"title": "Test", "priority": "high"}

# Create minimal data
task = TaskFactory.create(title="Test")  # Only what's needed

# Use factories for variations
high_priority = TaskFactory.create_high_priority()
overdue = TaskFactory.create_overdue()

# Clean up after tests
@pytest.fixture
def temp_data():
    data = create_data()
    yield data
    cleanup_data(data)

# Use unique identifiers
user_id = f"test_{int(time.time())}"
```

### DON'T ❌

```python
# Don't hardcode data in tests
def test_task():
    task = {"title": "Hardcoded", "priority": "high"}  # Bad

# Don't share mutable data
SHARED_DATA = {"title": "Shared"}  # Bad - mutated by tests
def test_1():
    SHARED_DATA["title"] = "Changed"  # Affects other tests

# Don't leave test data in database
def test_create_user():
    create_user("test@example.com")
    # No cleanup - pollutes database

# Don't use production data
user = get_user("real_user@company.com")  # Never use real data
```

## Organizing Test Data

### Directory Structure

```
tests/
├── fixtures/
│   ├── __init__.py
│   ├── task_fixtures.py
│   ├── user_fixtures.py
│   └── onboarding_fixtures.py
│
├── factories/
│   ├── __init__.py
│   ├── task_factory.py
│   └── user_factory.py
│
└── data/
    ├── sample_tasks.json
    ├── sample_users.json
    └── test_config.yaml
```

### Loading Test Data Files

```python
import json
from pathlib import Path

@pytest.fixture
def sample_tasks():
    """Load sample tasks from JSON file."""
    data_file = Path(__file__).parent / "data" / "sample_tasks.json"
    with open(data_file) as f:
        return json.load(f)

def test_with_file_data(sample_tasks):
    """Test uses data from file."""
    assert len(sample_tasks) > 0
    assert all("title" in task for task in sample_tasks)
```

## Next Steps

- **Unit Testing**: See `01_UNIT_TESTING.md`
- **Integration Testing**: See `02_INTEGRATION_TESTING.md`
- **Quick Start**: See `06_QUICK_START.md`

---

**Last Updated**: November 2025
**Version**: 1.0
