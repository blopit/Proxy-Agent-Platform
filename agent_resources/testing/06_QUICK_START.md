# Testing Quick Start Guide

## 5-Minute Quick Start

### Prerequisites

```bash
# Ensure UV is installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Navigate to project root
cd /path/to/Proxy-Agent-Platform

# Sync dependencies
uv sync
```

### Run All Tests

```bash
# Run complete test suite
uv run pytest -v

# Run with coverage
uv run pytest --cov=src --cov-report=html:Agent_Resources/reports/coverage-html

# View coverage
open Agent_Resources/reports/coverage-html/index.html
```

## Test Types Overview

| Type | Command | Speed | Location |
|------|---------|-------|----------|
| **Unit** | `uv run pytest src/` | Fast | Next to code |
| **Integration** | `uv run pytest tests/integration/` | Medium | tests/integration/ |
| **Frontend** | `cd mobile && npm test` | Fast | mobile/ |
| **E2E** | `detox test` (planned) | Slow | tests/e2e/ |

## Running Specific Tests

### Unit Tests

```bash
# All unit tests
uv run pytest src/ -v

# Specific module
uv run pytest src/services/tests/ -v

# Specific file
uv run pytest src/services/tests/test_task_service.py -v

# Specific test function
uv run pytest src/services/tests/test_task_service.py::test_create_task -v

# Specific class
uv run pytest src/services/tests/test_task_service.py::TestTaskService -v
```

### Integration Tests

```bash
# Start backend first!
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Then in another terminal:

# All integration tests
uv run pytest tests/integration/ -v

# Specific integration test
uv run python tests/integration/test_onboarding_flow.py

# With pytest
uv run pytest tests/integration/test_onboarding_flow.py -v
```

### Frontend Tests

```bash
cd mobile

# All tests
npm test

# Watch mode (re-runs on file changes)
npm test -- --watch

# Specific test file
npm test work-preferences.test.tsx

# With coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```

## Common Commands

### Running Tests

```bash
# Run all tests
uv run pytest

# Verbose output
uv run pytest -v

# Very verbose (show test docstrings)
uv run pytest -vv

# Run failed tests only
uv run pytest --lf

# Run failed tests first, then rest
uv run pytest --ff

# Stop at first failure
uv run pytest -x

# Run tests matching pattern
uv run pytest -k "create_task"

# Run tests with marker
uv run pytest -m integration
uv run pytest -m "not slow"
```

### Coverage

```bash
# Run with coverage
uv run pytest --cov=src

# Coverage with missing lines
uv run pytest --cov=src --cov-report=term-missing

# HTML coverage report
uv run pytest --cov=src --cov-report=html:Agent_Resources/reports/coverage-html

# Fail if coverage below threshold
uv run pytest --cov=src --cov-fail-under=80

# Coverage for specific module
uv run pytest src/services/tests/ --cov=src/services
```

### Debugging

```bash
# Drop into debugger on failure
uv run pytest --pdb

# Drop into debugger at start of test
uv run pytest --trace

# Show print statements
uv run pytest -s

# Show local variables on failure
uv run pytest -l

# Detailed traceback
uv run pytest --tb=long

# Short traceback
uv run pytest --tb=short

# No traceback
uv run pytest --tb=no
```

## Writing Your First Test

### 1. Unit Test

```python
# src/services/tests/test_my_service.py
import pytest
from src.services.my_service import MyService

class TestMyService:
    """Tests for MyService."""

    def test_my_function_returns_expected_value(self):
        """Test that my_function returns correct result."""
        # Arrange
        service = MyService()
        input_data = {"value": 42}

        # Act
        result = service.my_function(input_data)

        # Assert
        assert result == 42

# Run it
# uv run pytest src/services/tests/test_my_service.py -v
```

### 2. Integration Test

```python
# tests/integration/test_my_endpoint.py
import pytest
import requests

def test_my_endpoint(base_url, test_user_id):
    """Test my API endpoint."""
    # Arrange
    payload = {"name": "Test"}

    # Act
    response = requests.post(
        f"{base_url}/api/v1/my-endpoint",
        json=payload
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["name"] == "Test"

# Run it (with backend running)
# uv run pytest tests/integration/test_my_endpoint.py -v
```

### 3. Frontend Test

```typescript
// mobile/src/components/__tests__/MyComponent.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('handles button press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MyComponent onPress={onPress} />);

    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalled();
  });
});

// Run it
// cd mobile && npm test MyComponent.test.tsx
```

## TDD Workflow

### Red-Green-Refactor Cycle

```bash
# 1. RED - Write failing test
uv run pytest src/services/tests/test_new_feature.py::test_new_function
# Test fails (as expected)

# 2. GREEN - Write minimal code to pass
# ... edit src/services/my_service.py ...

uv run pytest src/services/tests/test_new_feature.py::test_new_function
# Test passes!

# 3. REFACTOR - Improve code while keeping tests green
# ... refactor code ...

uv run pytest src/services/tests/test_new_feature.py::test_new_function
# Test still passes

# 4. REPEAT - Add next test
```

## Common Test Patterns

### Testing Expected Exceptions

```python
import pytest
from src.exceptions import ValidationError

def test_raises_validation_error():
    """Test that invalid input raises ValidationError."""
    with pytest.raises(ValidationError) as exc_info:
        do_something_invalid()

    assert "Invalid input" in str(exc_info.value)
```

### Testing Async Functions

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    """Test async function."""
    result = await my_async_function()
    assert result == expected_value
```

### Parametrized Tests

```python
@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
])
def test_double(input, expected):
    """Test doubling numbers."""
    assert double(input) == expected
```

### Using Fixtures

```python
@pytest.fixture
def sample_data():
    """Provide test data."""
    return {"key": "value"}

def test_with_fixture(sample_data):
    """Test uses fixture data."""
    assert sample_data["key"] == "value"
```

### Mocking

```python
def test_with_mock(mocker):
    """Test with mocked dependency."""
    mock_service = mocker.Mock()
    mock_service.get_data.return_value = "mocked data"

    result = use_service(mock_service)

    assert result == "mocked data"
    mock_service.get_data.assert_called_once()
```

## Troubleshooting

### Tests Not Found

**Problem**: `pytest` doesn't find tests

**Solution**:
```bash
# Check pytest discovers tests
uv run pytest --collect-only

# Ensure file naming:
# - Files: test_*.py or *_test.py
# - Functions: test_*
# - Classes: Test*
```

### Import Errors

**Problem**: `ModuleNotFoundError`

**Solution**:
```bash
# Run with uv
uv run pytest  # Not just `pytest`

# Check PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/path/to/project"

# Install in editable mode
uv pip install -e .
```

### Integration Tests Fail

**Problem**: Connection refused

**Solution**:
```bash
# Start backend first
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Verify server running
curl http://localhost:8000/api/v1/health

# Then run tests
uv run pytest tests/integration/ -v
```

### Coverage Not Working

**Problem**: No coverage data

**Solution**:
```bash
# Install pytest-cov
uv add --dev pytest-cov

# Use --cov flag
uv run pytest --cov=src

# Check .coveragerc or pyproject.toml configuration
```

### Slow Tests

**Problem**: Tests take too long

**Solution**:
```bash
# Skip slow tests
uv run pytest -m "not slow"

# Run in parallel (install pytest-xdist)
uv add --dev pytest-xdist
uv run pytest -n auto

# Profile slow tests
uv run pytest --durations=10
```

## Pre-Commit Checklist

Before committing code:

```bash
# 1. Run relevant tests
uv run pytest src/services/tests/ -v

# 2. Check coverage
uv run pytest --cov=src --cov-report=term-missing

# 3. Lint code
uv run ruff check .

# 4. Format code
uv run ruff format .

# 5. Type check
uv run mypy src/

# 6. Run full suite (if time permits)
uv run pytest
```

## CI/CD Integration

### Local Simulation

```bash
# Run same checks as CI
uv run pytest --cov=src --cov-fail-under=80
uv run ruff check .
uv run mypy src/

# Generate reports
uv run pytest --junitxml=reports/junit.xml --cov-report=xml
```

## Useful Pytest Plugins

```bash
# Install common plugins
uv add --dev \
  pytest-cov \
  pytest-asyncio \
  pytest-mock \
  pytest-xdist \
  pytest-timeout \
  pytest-benchmark

# pytest-cov: Coverage reporting
uv run pytest --cov=src

# pytest-asyncio: Async test support
@pytest.mark.asyncio
async def test_async():
    pass

# pytest-mock: Mocking utilities
def test_with_mock(mocker):
    pass

# pytest-xdist: Parallel execution
uv run pytest -n auto

# pytest-timeout: Prevent hanging tests
@pytest.mark.timeout(5)
def test_with_timeout():
    pass

# pytest-benchmark: Performance testing
def test_benchmark(benchmark):
    result = benchmark(my_function)
```

## Test Reports

### Generate Reports

```bash
# Terminal report
uv run pytest -v > Agent_Resources/reports/test-results.txt

# HTML report
uv run pytest --html=Agent_Resources/reports/report.html

# JUnit XML (for CI/CD)
uv run pytest --junitxml=Agent_Resources/reports/junit.xml

# Coverage HTML
uv run pytest --cov=src --cov-report=html:Agent_Resources/reports/coverage-html
```

### View Reports

```bash
# View coverage
open Agent_Resources/reports/coverage-html/index.html

# View HTML report
open Agent_Resources/reports/report.html
```

## Cheat Sheet

```bash
# Common commands
uv run pytest                     # Run all tests
uv run pytest -v                  # Verbose
uv run pytest -x                  # Stop at first failure
uv run pytest --lf                # Run last failed
uv run pytest -k "pattern"        # Run matching pattern
uv run pytest -m marker           # Run with marker

# Coverage
uv run pytest --cov=src           # Basic coverage
uv run pytest --cov=src --cov-report=html  # HTML report

# Debugging
uv run pytest --pdb               # Debugger on failure
uv run pytest -s                  # Show prints
uv run pytest -l                  # Show locals

# Performance
uv run pytest -n auto             # Parallel execution
uv run pytest --durations=10      # Show slowest tests

# Integration tests (backend must be running)
uv run uvicorn src.main:app --reload &
uv run pytest tests/integration/ -v

# Frontend tests
cd mobile && npm test
```

## Next Steps

- **Detailed Guides**:
  - Unit Testing: `01_UNIT_TESTING.md`
  - Integration Testing: `02_INTEGRATION_TESTING.md`
  - Frontend Testing: `03_FRONTEND_TESTING.md`
  - E2E Testing: `04_E2E_TESTING.md`
  - Test Data: `05_TEST_DATA.md`

- **Project Documentation**:
  - CLAUDE.md: Testing philosophy and TDD approach
  - tests/README.md: Test organization
  - tests/integration/README.md: Integration test specifics

---

**Last Updated**: November 2025
**Version**: 1.0
