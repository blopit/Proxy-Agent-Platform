# Integration Testing Guide

## Purpose

Integration tests verify that different components of the system work together correctly. They test the interactions between API endpoints, services, databases, and external systems.

## Characteristics

✅ **Real interactions**: Uses actual HTTP requests, database connections
✅ **Multi-component**: Tests multiple layers working together
✅ **Medium speed**: 1-5 seconds per test
✅ **Controlled environment**: Requires running backend server
✅ **Data isolation**: Each test manages its own test data

## When to Use Integration Tests

Use integration tests when:
- Testing API endpoint behavior
- Verifying database operations
- Testing service layer interactions
- Validating request/response cycles
- Testing authentication/authorization flows
- Verifying data persistence

Don't use for:
- Testing individual functions (use unit tests)
- Testing UI components (use component tests)
- Complete user workflows (use E2E tests)

## File Organization

Integration tests live in `tests/integration/`:

```
tests/
└── integration/
    ├── __init__.py
    ├── conftest.py                  # Shared fixtures
    ├── test_onboarding_flow.py      # Onboarding API tests
    ├── test_task_routes.py          # Task API tests
    ├── test_auth_flow.py            # Authentication tests
    └── README.md                    # Integration test docs
```

## Prerequisites

### Backend Server Running

Integration tests require the backend server:

```bash
# Terminal 1: Start backend
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Run integration tests
uv run pytest tests/integration/ -v
```

### Environment Configuration

```bash
# .env or environment variables
TEST_BASE_URL=http://localhost:8000
TEST_TIMEOUT=10
DATABASE_URL=sqlite:///test_database.db
```

## Basic Test Structure

### Using Requests Library

```python
import requests
import pytest

BASE_URL = "http://localhost:8000"

def test_create_task_integration():
    """Test creating a task via API endpoint."""
    # Arrange
    task_data = {
        "title": "Integration Test Task",
        "description": "Testing API endpoint",
        "priority": "high"
    }

    # Act
    response = requests.post(
        f"{BASE_URL}/api/v1/tasks",
        json=task_data,
        headers={"Content-Type": "application/json"}
    )

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Integration Test Task"
    assert data["priority"] == "high"
    assert "id" in data
```

### Complete CRUD Flow

```python
def test_task_crud_flow(base_url, test_user_id, cleanup_tasks):
    """Test complete Create-Read-Update-Delete flow."""
    # CREATE
    create_response = requests.post(
        f"{base_url}/api/v1/tasks",
        json={"title": "Test Task", "priority": "high"}
    )
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]
    cleanup_tasks.append(task_id)

    # READ
    get_response = requests.get(f"{base_url}/api/v1/tasks/{task_id}")
    assert get_response.status_code == 200
    assert get_response.json()["title"] == "Test Task"

    # UPDATE
    update_response = requests.put(
        f"{base_url}/api/v1/tasks/{task_id}",
        json={"title": "Updated Task"}
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated Task"

    # DELETE
    delete_response = requests.delete(f"{base_url}/api/v1/tasks/{task_id}")
    assert delete_response.status_code == 204

    # VERIFY DELETED
    verify_response = requests.get(f"{base_url}/api/v1/tasks/{task_id}")
    assert verify_response.status_code == 404
```

## Shared Fixtures

### conftest.py Setup

```python
"""Shared fixtures for integration tests."""

import os
from datetime import datetime
import pytest
import requests

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8000")
TEST_TIMEOUT = int(os.getenv("TEST_TIMEOUT", "10"))


@pytest.fixture(scope="session")
def base_url():
    """Provide the base URL for API calls."""
    return BASE_URL


@pytest.fixture(scope="session")
def api_timeout():
    """Provide timeout for API calls."""
    return TEST_TIMEOUT


@pytest.fixture
def test_user_id():
    """Generate a unique test user ID for each test."""
    return f"test_user_{int(datetime.now().timestamp())}"


@pytest.fixture
def api_client(base_url, api_timeout):
    """Provide a configured requests session for API calls."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})

    def make_request(method, endpoint, **kwargs):
        """Make an API request with automatic URL construction."""
        url = f"{base_url}{endpoint}"
        kwargs.setdefault("timeout", api_timeout)
        return session.request(method, url, **kwargs)

    session.api_request = make_request
    return session


@pytest.fixture
def cleanup_tasks(base_url):
    """Cleanup fixture to remove test tasks after tests."""
    task_ids = []

    yield task_ids

    # Cleanup after test
    for task_id in task_ids:
        try:
            requests.delete(
                f"{base_url}/api/v1/tasks/{task_id}",
                timeout=TEST_TIMEOUT
            )
        except Exception:
            pass  # Ignore cleanup errors
```

## Testing API Endpoints

### Testing POST Endpoints

```python
def test_create_onboarding(base_url, test_user_id, cleanup_onboarding_data):
    """Test creating onboarding data via API."""
    # Register for cleanup
    cleanup_onboarding_data.append(test_user_id)

    payload = {
        "work_preference": "remote",
        "adhd_support_level": 7,
        "adhd_challenges": ["time_blindness", "focus"]
    }

    response = requests.put(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == test_user_id
    assert data["work_preference"] == "remote"
    assert data["adhd_support_level"] == 7
    assert len(data["adhd_challenges"]) == 2
```

### Testing GET Endpoints

```python
def test_get_tasks_list(base_url, auth_token):
    """Test retrieving list of tasks."""
    response = requests.get(
        f"{base_url}/api/v1/tasks",
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all("id" in task for task in data)
    assert all("title" in task for task in data)
```

### Testing PUT/PATCH Endpoints

```python
def test_update_task(base_url, existing_task_id):
    """Test updating a task via PUT."""
    update_data = {
        "title": "Updated Title",
        "priority": "low",
        "completed": True
    }

    response = requests.put(
        f"{base_url}/api/v1/tasks/{existing_task_id}",
        json=update_data
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["priority"] == "low"
    assert data["completed"] is True
```

### Testing DELETE Endpoints

```python
def test_delete_task(base_url, test_task_id):
    """Test deleting a task."""
    # Delete
    delete_response = requests.delete(
        f"{base_url}/api/v1/tasks/{test_task_id}"
    )
    assert delete_response.status_code == 204

    # Verify deletion
    get_response = requests.get(
        f"{base_url}/api/v1/tasks/{test_task_id}"
    )
    assert get_response.status_code == 404
```

## Testing Error Cases

### Validation Errors

```python
def test_create_task_with_invalid_priority(base_url):
    """Test that invalid priority returns 422 validation error."""
    response = requests.post(
        f"{base_url}/api/v1/tasks",
        json={
            "title": "Test Task",
            "priority": "invalid_priority"
        }
    )

    assert response.status_code == 422
    error_data = response.json()
    assert "detail" in error_data
    assert any("priority" in str(err) for err in error_data["detail"])
```

### Authentication Errors

```python
def test_protected_endpoint_without_auth(base_url):
    """Test that protected endpoint returns 401 without auth."""
    response = requests.get(f"{base_url}/api/v1/users/me")

    assert response.status_code == 401
    assert "Unauthorized" in response.json()["detail"]

def test_protected_endpoint_with_invalid_token(base_url):
    """Test that invalid token returns 401."""
    response = requests.get(
        f"{base_url}/api/v1/users/me",
        headers={"Authorization": "Bearer invalid_token"}
    )

    assert response.status_code == 401
```

### Not Found Errors

```python
def test_get_nonexistent_task(base_url):
    """Test that requesting non-existent task returns 404."""
    response = requests.get(f"{base_url}/api/v1/tasks/99999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
```

## Testing Data Persistence

### Verify Database Operations

```python
def test_task_persists_in_database(base_url, cleanup_tasks):
    """Test that created task persists across requests."""
    # Create task
    create_response = requests.post(
        f"{base_url}/api/v1/tasks",
        json={"title": "Persistent Task"}
    )
    task_id = create_response.json()["id"]
    cleanup_tasks.append(task_id)

    # Retrieve task multiple times
    for _ in range(3):
        get_response = requests.get(f"{base_url}/api/v1/tasks/{task_id}")
        assert get_response.status_code == 200
        assert get_response.json()["title"] == "Persistent Task"
```

### Testing Upsert Behavior

```python
def test_onboarding_upsert_preserves_data(base_url, test_user_id, cleanup_onboarding_data):
    """Test that upsert preserves previously saved data."""
    cleanup_onboarding_data.append(test_user_id)

    # First update - set work preference
    requests.put(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding",
        json={"work_preference": "remote"}
    )

    # Second update - set ADHD level
    requests.put(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding",
        json={"adhd_support_level": 7}
    )

    # Verify both fields are preserved
    response = requests.get(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding"
    )
    data = response.json()
    assert data["work_preference"] == "remote"
    assert data["adhd_support_level"] == 7
```

## Testing Authentication Flow

### Login Flow

```python
def test_login_flow(base_url):
    """Test complete login flow."""
    # Register user
    register_response = requests.post(
        f"{base_url}/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "SecurePassword123!",
            "name": "Test User"
        }
    )
    assert register_response.status_code == 200

    # Login
    login_response = requests.post(
        f"{base_url}/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "SecurePassword123!"
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    assert token is not None

    # Access protected endpoint
    me_response = requests.get(
        f"{base_url}/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "test@example.com"
```

## Testing Sequential Operations

### Multi-Step Workflows

```python
def test_complete_onboarding_flow(base_url, test_user_id, cleanup_onboarding_data):
    """Test complete onboarding workflow with sequential steps."""
    cleanup_onboarding_data.append(test_user_id)

    # Step 1: Work preference
    step1 = requests.put(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding",
        json={"work_preference": "remote"}
    )
    assert step1.status_code == 200
    assert step1.json()["onboarding_completed"] is False

    # Step 2: ADHD support
    step2 = requests.put(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding",
        json={
            "adhd_support_level": 7,
            "adhd_challenges": ["time_blindness", "focus"]
        }
    )
    assert step2.status_code == 200

    # Step 3: Goals
    step3 = requests.put(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding",
        json={"productivity_goals": ["reduce_overwhelm"]}
    )
    assert step3.status_code == 200

    # Step 4: Mark complete
    complete = requests.post(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding/complete",
        json={"completed": True}
    )
    assert complete.status_code == 200
    assert complete.json()["onboarding_completed"] is True
    assert complete.json()["completed_at"] is not None

    # Verify all data preserved
    verify = requests.get(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding"
    )
    data = verify.json()
    assert data["work_preference"] == "remote"
    assert data["adhd_support_level"] == 7
    assert len(data["productivity_goals"]) == 1
```

## Standalone vs Pytest

### Standalone Integration Test

```python
#!/usr/bin/env python3
"""Standalone integration test for onboarding flow."""

import requests
from datetime import datetime

BASE_URL = "http://localhost:8000"
TEST_USER_ID = f"test_{int(datetime.now().timestamp())}"


def test_onboarding_flow():
    """Test complete onboarding flow."""
    print(f"Testing user: {TEST_USER_ID}")

    # Create onboarding
    response = requests.put(
        f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding",
        json={"work_preference": "remote"}
    )

    if response.status_code == 200:
        print("✅ Onboarding created successfully")
    else:
        print(f"❌ Failed: {response.status_code}")
        return False

    return True


if __name__ == "__main__":
    success = test_onboarding_flow()
    exit(0 if success else 1)
```

Run with: `uv run python tests/integration/test_onboarding_flow.py`

### Pytest Integration Test

```python
import pytest
import requests


@pytest.mark.integration
def test_onboarding_flow(base_url, test_user_id, cleanup_onboarding_data):
    """Test complete onboarding flow with pytest."""
    cleanup_onboarding_data.append(test_user_id)

    response = requests.put(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding",
        json={"work_preference": "remote"}
    )

    assert response.status_code == 200
    assert response.json()["work_preference"] == "remote"
```

Run with: `uv run pytest tests/integration/ -v -m integration`

## Best Practices

### DO ✅

```python
# Clean up test data
@pytest.fixture
def cleanup_data(base_url):
    data_ids = []
    yield data_ids
    for data_id in data_ids:
        requests.delete(f"{base_url}/api/v1/data/{data_id}")

# Test complete workflows
def test_complete_user_journey():
    # Create → Read → Update → Delete
    pass

# Use unique identifiers
test_user_id = f"test_{int(datetime.now().timestamp())}"

# Verify error responses
assert response.status_code == 422
assert "detail" in response.json()

# Test data persistence
response1 = requests.get(url)
response2 = requests.get(url)
assert response1.json() == response2.json()
```

### DON'T ❌

```python
# Don't use production data
user_id = "real_user_123"  # DON'T

# Don't skip cleanup
def test_create_data():
    requests.post(...)  # Data left in database

# Don't hardcode URLs
requests.get("http://localhost:8000/...")  # Use base_url fixture

# Don't ignore status codes
response = requests.post(...)
data = response.json()  # Could fail if status is 400+

# Don't test without server running
# Always check server is accessible first
```

## Running Integration Tests

### Basic Execution

```bash
# Start backend first
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Run all integration tests
uv run pytest tests/integration/ -v

# Run specific test file
uv run pytest tests/integration/test_onboarding_flow.py -v

# Run standalone
uv run python tests/integration/test_onboarding_flow.py
```

### With Markers

```bash
# Run only integration tests
uv run pytest -m integration -v

# Skip integration tests (run only unit tests)
uv run pytest -m "not integration" -v

# Run slow integration tests
uv run pytest -m "integration and slow" -v
```

### CI/CD Integration

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: uv sync

      - name: Start backend
        run: |
          uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 &
          sleep 5

      - name: Run integration tests
        run: uv run pytest tests/integration/ -v --junitxml=reports/junit.xml

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-results
          path: reports/junit.xml
```

## Troubleshooting

### Server Not Running

**Error**: `ConnectionError: Connection refused`

**Solution**:
```bash
# Start backend
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Verify server is running
curl http://localhost:8000/api/v1/health
```

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uv run uvicorn src.main:app --port 8001
export TEST_BASE_URL=http://localhost:8001
```

### Tests Hanging

**Cause**: Infinite loops, slow endpoints, network issues

**Solution**:
```bash
# Use timeout
uv run pytest tests/integration/ -v --timeout=30

# Check backend logs for errors
```

## Next Steps

- **Unit Testing**: See `01_UNIT_TESTING.md`
- **E2E Testing**: See `04_E2E_TESTING.md`
- **Test Data**: See `05_TEST_DATA.md`
- **Quick Start**: See `06_QUICK_START.md`

---

**Last Updated**: November 2025
**Version**: 1.0
