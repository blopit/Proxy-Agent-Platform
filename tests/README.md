# Test Suite Organization

This directory contains the project's test suite, organized following the vertical slice architecture principle from CLAUDE.md.

## Directory Structure

```
tests/
├── integration/              # Integration tests (full stack)
│   ├── conftest.py          # Shared integration test fixtures
│   ├── test_onboarding_flow.py   # Complete onboarding flow test
│   ├── test_onboarding_quick.py  # Quick onboarding API validation
│   └── test_task_routes.py  # Task API integration tests
├── unit/                    # Legacy unit tests (being migrated)
└── test_*.py               # Top-level tests (CLI, database models)
```

## Test Categories

### Unit Tests

Unit tests should live **next to the code they test** following vertical slice architecture:

```
src/
├── api/
│   └── routes/
│       ├── onboarding.py
│       └── tests/
│           └── test_onboarding.py    # Unit tests for routes
├── services/
│   ├── onboarding_service.py
│   └── tests/
│       └── test_onboarding_service.py  # Unit tests for service
```

**Characteristics**:
- Use FastAPI TestClient (not real HTTP requests)
- Mock external dependencies
- Fast execution (< 1 second per test)
- Test individual functions/methods in isolation

**Run with**:
```bash
uv run pytest src/ -v
```

### Integration Tests

Integration tests live in `tests/integration/` and test component interactions:

```
tests/integration/
├── test_onboarding_flow.py      # Mobile → API → Database
├── test_onboarding_quick.py     # Quick API validation
└── test_task_routes.py          # Task API workflows
```

**Characteristics**:
- Use real HTTP requests (`requests` library)
- Require backend server running
- Test full request-response cycles
- Verify data persistence
- Slower execution (1-5 seconds per test)

**Run with**:
```bash
# Start backend first
uv run uvicorn src.main:app --reload

# In another terminal
uv run pytest tests/integration/ -v

# Or run standalone
uv run python tests/integration/test_onboarding_flow.py
```

### End-to-End Tests

E2E tests would go in `tests/e2e/` (not yet implemented):

```
tests/e2e/
├── test_complete_user_journey.py
└── test_mobile_app_flows.py
```

## Running Tests

### All Tests

```bash
# Run everything
uv run pytest -v

# With coverage
uv run pytest --cov=src --cov-report=html:Agent_Resources/reports/coverage-html

# Run specific test file
uv run pytest src/api/routes/tests/test_onboarding.py -v

# Run specific test function
uv run pytest src/api/routes/tests/test_onboarding.py::test_create_onboarding -v
```

### Integration Tests Only

```bash
# Run all integration tests
uv run pytest tests/integration/ -v

# Run specific integration test
uv run python tests/integration/test_onboarding_flow.py
```

### Unit Tests Only

```bash
# Run unit tests (exclude integration)
uv run pytest src/ -v -m "not integration"
```

## Test Fixtures

### Shared Fixtures

- **Unit tests**: `conftest.py` files next to the code
- **Integration tests**: `tests/integration/conftest.py`
- **Global fixtures**: `tests/conftest.py` (if needed)

### Common Fixtures

```python
# Integration test fixtures (tests/integration/conftest.py)
- base_url: API base URL
- api_client: Configured requests session
- test_user_id: Unique user ID for each test
- sample_onboarding_data: Sample data for testing
- cleanup_onboarding_data: Cleanup after tests

# Unit test fixtures (in module conftest.py)
- db_session: Database session
- mock_client: Mocked API client
- sample_user: Test user object
```

## Writing Tests

### Unit Test Example

```python
# src/services/tests/test_onboarding_service.py
import pytest
from src.services.onboarding_service import OnboardingService

@pytest.fixture
def onboarding_service():
    """Provide onboarding service instance."""
    return OnboardingService()

def test_create_onboarding(onboarding_service, sample_user_id):
    """Test creating onboarding data."""
    data = {"work_preference": "remote"}
    result = onboarding_service.create(sample_user_id, data)

    assert result.user_id == sample_user_id
    assert result.work_preference == "remote"
```

### Integration Test Example

```python
# tests/integration/test_onboarding_flow.py
import requests

def test_complete_onboarding_flow(base_url, test_user_id):
    """Test complete onboarding workflow."""
    # Create
    response = requests.put(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding",
        json={"work_preference": "remote"}
    )
    assert response.status_code == 200

    # Verify
    response = requests.get(
        f"{base_url}/api/v1/users/{test_user_id}/onboarding"
    )
    assert response.json()["work_preference"] == "remote"
```

## Test Reports

Test results and coverage reports are saved to `Agent_Resources/reports/`:

```bash
# Generate coverage report
uv run pytest --cov=src --cov-report=html:Agent_Resources/reports/coverage-html

# View coverage
open Agent_Resources/reports/coverage-html/index.html
```

## Best Practices

Following CLAUDE.md guidelines:

1. **Test-Driven Development (TDD)**:
   - Write test first
   - Watch it fail
   - Write minimal code to pass
   - Refactor
   - Repeat

2. **Test Organization**:
   - Keep tests next to code (vertical slice)
   - Use descriptive test names
   - One assertion per test (when possible)

3. **Test Isolation**:
   - Tests should not depend on each other
   - Clean up test data
   - Use fixtures for setup/teardown

4. **Coverage Goals**:
   - Aim for 80%+ coverage
   - Focus on critical paths
   - Don't just chase numbers

5. **Test Speed**:
   - Unit tests: < 1 second
   - Integration tests: < 5 seconds
   - Use `@pytest.mark.slow` for slow tests

## Migration Plan

Currently migrating from:
- ❌ Tests in root directory
- ❌ Mixed unit/integration tests

To:
- ✅ Unit tests next to code
- ✅ Integration tests in `tests/integration/`
- ✅ Clear separation of concerns

## Additional Resources

- **Pytest docs**: https://docs.pytest.org/
- **FastAPI testing**: https://fastapi.tiangolo.com/tutorial/testing/
- **Coverage.py**: https://coverage.readthedocs.io/
- **CLAUDE.md**: Project testing guidelines

---

**Last Updated**: November 2025
