# Testing System Overview

## ⚠️ Migration Notice (November 2025)

**Breaking Change**: Tests have been migrated from vertical slice architecture (tests next to code) to centralized structure (all tests in `/tests/`).

**Old Location**: `src/services/tests/test_task_service.py`
**New Location**: `tests/unit/services/test_task_service.py`

See [TEST_MIGRATION_REPORT.md](../../TEST_MIGRATION_REPORT.md) for complete details.

---

## Purpose

The testing system ensures code quality, reliability, and maintainability through comprehensive test coverage following Test-Driven Development (TDD) principles.

## Testing Philosophy

### Test-Driven Development (TDD)

Following CLAUDE.md guidelines, we practice strict TDD:

```
1. Write the test first → Define expected behavior
2. Watch it fail → Ensure test actually tests something
3. Write minimal code → Just enough to make test pass
4. Refactor → Improve code while keeping tests green
5. Repeat → One test at a time
```

**Benefits**:
- Better designed code
- Higher test coverage
- Fewer bugs
- Living documentation
- Confident refactoring

### Core Principles

**KISS (Keep It Simple, Stupid)**
- Simple tests are easier to understand and maintain
- One assertion per test when possible
- Clear, descriptive test names

**YAGNI (You Aren't Gonna Need It)**
- Don't test implementation details
- Test behavior, not internal state
- Avoid over-mocking

**Fail Fast**
- Tests fail immediately on errors
- Clear error messages
- Fast feedback loop

## Testing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Testing Pyramid                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    E2E Tests (Few)                          │
│                  ┌─────────────┐                            │
│                  │  User Flows │                            │
│                  └─────────────┘                            │
│                                                             │
│              Integration Tests (Some)                       │
│            ┌───────────────────────┐                        │
│            │  API → Service → DB   │                        │
│            └───────────────────────┘                        │
│                                                             │
│           Unit Tests (Many - 70-80%)                        │
│      ┌─────────────────────────────────┐                   │
│      │  Functions, Classes, Methods    │                   │
│      └─────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Test Levels

| Level | Purpose | Speed | Scope | Location |
|-------|---------|-------|-------|----------|
| **Unit** | Test individual functions/methods | Fast (<1s) | Isolated | Next to code |
| **Integration** | Test component interactions | Medium (1-5s) | Multiple components | `tests/integration/` |
| **E2E** | Test complete user workflows | Slow (5-30s) | Full system | `tests/e2e/` |

## Test Organization

### Centralized Testing Architecture

All tests are centralized in the `/tests/` directory:

```
tests/
├── unit/                                  # Unit tests (70-80%)
│   ├── agents/
│   │   └── test_split_proxy_agent.py
│   ├── api/
│   │   └── test_task_endpoints.py
│   ├── services/
│   │   └── test_task_service.py
│   └── ...
│
├── integration/                           # Integration tests
│   ├── api/
│   │   └── test_onboarding_flow.py
│   └── database/
│       └── test_relationships.py
│
└── e2e/                                   # E2E tests
    └── test_complete_user_journey.py

src/                                       # No tests here
├── agents/
│   └── split_proxy_agent.py
├── api/
│   └── routes/
│       └── tasks.py
└── services/
    └── task_service.py
```

**Benefits**:
- ✅ Clear separation of production and test code
- ✅ Easier test discovery
- ✅ Consistent import patterns
- ✅ Standard Python project structure
- ✅ Simpler CI/CD configuration

### Test File Naming

```python
# Source file
src/services/task_service.py

# Test file (in tests/unit directory)
tests/unit/services/test_task_service.py

# Test classes
class TestTaskService:
    def test_create_task_with_valid_data(self):
        """Test that tasks can be created with valid data."""
        pass

    def test_create_task_fails_with_invalid_data(self):
        """Test that invalid data raises ValidationError."""
        pass
```

**Naming Convention**:
- File: `tests/unit/<module>/test_<module_name>.py`
- Class: `Test<ClassName>`
- Function: `test_<what_is_tested>_<expected_behavior>`
- Imports: Use absolute imports (`from src.services import TaskService`)

## Test Coverage Goals

### Coverage Targets

```
Overall Coverage:        80%+
Critical Paths:          95%+
API Endpoints:           90%+
Service Layer:           85%+
Database Repositories:   80%+
Utilities:               70%+
```

### What to Test

✅ **Always Test**:
- Public APIs and endpoints
- Business logic
- Data validation
- Error handling
- Edge cases
- Critical user workflows

❌ **Don't Test**:
- Third-party libraries
- Framework internals
- Trivial getters/setters
- Auto-generated code

### Measuring Coverage

```bash
# Run tests with coverage
uv run pytest --cov=src --cov-report=html:Agent_Resources/reports/coverage-html

# View coverage report
open Agent_Resources/reports/coverage-html/index.html

# Terminal report
uv run pytest --cov=src --cov-report=term-missing
```

## Testing Stack

### Backend (Python)

| Tool | Purpose | Documentation |
|------|---------|---------------|
| **pytest** | Test framework | https://docs.pytest.org/ |
| **pytest-asyncio** | Async test support | https://pytest-asyncio.readthedocs.io/ |
| **pytest-cov** | Coverage reporting | https://pytest-cov.readthedocs.io/ |
| **pytest-mock** | Mocking utilities | https://pytest-mock.readthedocs.io/ |
| **Faker** | Test data generation | https://faker.readthedocs.io/ |
| **FastAPI TestClient** | API testing | https://fastapi.tiangolo.com/tutorial/testing/ |

### Frontend (React Native/Expo)

| Tool | Purpose | Documentation |
|------|---------|---------------|
| **Jest** | Test framework | https://jestjs.io/ |
| **React Native Testing Library** | Component testing | https://callstack.github.io/react-native-testing-library/ |
| **@testing-library/react-hooks** | Hook testing | https://react-hooks-testing-library.com/ |
| **MSW** | API mocking | https://mswjs.io/ |

## Test Structure

### AAA Pattern (Arrange-Act-Assert)

```python
def test_create_task_success():
    """Test that tasks are created successfully with valid data."""
    # Arrange - Set up test data and preconditions
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "priority": "high"
    }
    service = TaskService()

    # Act - Execute the behavior being tested
    result = service.create_task(task_data)

    # Assert - Verify the outcome
    assert result.title == "Test Task"
    assert result.priority == "high"
    assert result.id is not None
```

### Given-When-Then (BDD Style)

```python
def test_user_completes_onboarding():
    """
    Given a new user starts onboarding
    When they complete all steps
    Then their onboarding status should be marked complete
    """
    # Given
    user = create_test_user()
    onboarding_data = get_complete_onboarding_data()

    # When
    service = OnboardingService()
    result = service.complete_onboarding(user.id, onboarding_data)

    # Then
    assert result.onboarding_completed is True
    assert result.completed_at is not None
```

## Test Isolation

### Independent Tests

```python
# ❌ BAD - Tests depend on each other
def test_1_create_user():
    global test_user
    test_user = create_user("test@example.com")

def test_2_update_user():
    test_user.update_email("new@example.com")

# ✅ GOOD - Each test is independent
@pytest.fixture
def test_user():
    return create_user("test@example.com")

def test_create_user(test_user):
    assert test_user.email == "test@example.com"

def test_update_user(test_user):
    test_user.update_email("new@example.com")
    assert test_user.email == "new@example.com"
```

### Database Isolation

```python
@pytest.fixture
def db_session():
    """Provide a transactional database session for testing."""
    # Create session
    session = SessionLocal()

    # Start transaction
    transaction = session.begin()

    yield session

    # Rollback after test
    transaction.rollback()
    session.close()
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: uv sync

      - name: Run unit tests
        run: uv run pytest src/ -v --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

## Test Execution Strategy

### Development Workflow

```bash
# 1. Write failing test
uv run pytest src/services/tests/test_new_feature.py::test_my_new_feature

# 2. Implement feature
# ... write code ...

# 3. Run test again (should pass)
uv run pytest src/services/tests/test_new_feature.py::test_my_new_feature

# 4. Run related tests
uv run pytest src/services/tests/

# 5. Run full suite before commit
uv run pytest
```

### Pre-Commit Checks

```bash
# Run fast tests
uv run pytest -m "not slow" -v

# Check coverage
uv run pytest --cov=src --cov-report=term-missing --cov-fail-under=80

# Lint and format
uv run ruff check .
uv run ruff format .
```

### CI/CD Pipeline

```
1. Lint & Format Check → Ruff
2. Unit Tests → pytest src/ -v
3. Integration Tests → pytest tests/integration/ -v
4. Coverage Check → --cov-fail-under=80
5. E2E Tests → pytest tests/e2e/ -v (optional)
```

## Performance Considerations

### Test Speed Targets

```
Unit test:              < 1 second
Integration test:       < 5 seconds
E2E test:              < 30 seconds
Full suite:            < 5 minutes
```

### Speed Optimization

```python
# Use markers for slow tests
@pytest.mark.slow
def test_large_data_processing():
    pass

# Skip slow tests in development
uv run pytest -m "not slow"

# Parallel execution
uv run pytest -n auto  # Requires pytest-xdist
```

## Documentation Structure

- **00_OVERVIEW.md** (this file) - Testing philosophy and architecture
- **01_UNIT_TESTING.md** - Writing unit tests, fixtures, mocking
- **02_INTEGRATION_TESTING.md** - API and integration testing
- **03_FRONTEND_TESTING.md** - React Native component testing
- **04_E2E_TESTING.md** - End-to-end user workflows
- **05_TEST_DATA.md** - Test data factories and fixtures
- **06_QUICK_START.md** - Quick reference guide

## Best Practices Summary

✅ **DO**:
- Write tests first (TDD)
- Keep tests simple and focused
- Use descriptive names
- Test behavior, not implementation
- Aim for 80%+ coverage
- Keep tests fast
- Use fixtures for setup
- Clean up after tests

❌ **DON'T**:
- Test implementation details
- Make tests depend on each other
- Mock everything
- Write tests after code (when possible)
- Ignore failing tests
- Commit without running tests
- Leave commented-out tests

## Next Steps

- **Unit Testing**: See `01_UNIT_TESTING.md`
- **Integration Testing**: See `02_INTEGRATION_TESTING.md`
- **Frontend Testing**: See `03_FRONTEND_TESTING.md`
- **Quick Start**: See `06_QUICK_START.md`

---

**Last Updated**: November 2025
**Version**: 1.0
