# Integration Tests

Integration tests for the Proxy Agent Platform that verify end-to-end functionality.

## Overview

These tests verify the complete interaction between:
- Mobile app → API endpoints → Services → Database
- Real HTTP requests (not mocked)
- Actual database operations
- Full request-response cycles

## Requirements

### Running Backend

Integration tests require the backend server to be running:

```bash
# Terminal 1: Start backend
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Environment

- Python 3.11+
- UV package manager
- SQLite database (created automatically)
- `requests` library

## Available Tests

### test_onboarding_flow.py

**Purpose**: Complete mobile-backend integration test for onboarding flow

**What it tests**:
1. Create onboarding (work preference)
2. Get onboarding data
3. Update ADHD support level (upsert preserves previous data)
4. Update daily schedule
5. Update productivity goals
6. Mark onboarding complete
7. Verify all data integrity
8. Test skip onboarding flow
9. Delete onboarding data

**Run standalone**:
```bash
uv run python tests/integration/test_onboarding_flow.py
```

**Run with pytest**:
```bash
uv run pytest tests/integration/test_onboarding_flow.py -v
```

**Expected output**:
```
🚀 MOBILE-BACKEND INTEGRATION TEST SUITE
=========================================================
Testing user: mobile_test_1731283920
Backend URL: http://localhost:8000

✅ Create onboarding
✅ Get onboarding
✅ Update ADHD level
✅ Update schedule
✅ Update goals
✅ Mark complete
✅ Verify data
✅ Test skip flow
✅ Delete data

9/9 tests passed (100.0%)
🎉 ALL TESTS PASSED
```

### test_onboarding_quick.py

**Purpose**: Quick validation of onboarding API endpoints

**What it tests**:
1. Create onboarding with all fields
2. Retrieve onboarding
3. Update ADHD level
4. Add ChatGPT export prompt
5. Mark complete
6. Delete onboarding
7. Verify deletion

**Run standalone**:
```bash
uv run python tests/integration/test_onboarding_quick.py
```

**Expected output**:
```
🧪 Testing User Onboarding API

1️⃣ Creating onboarding data...
✅ Created successfully
   User ID: test_user_demo
   Work Preference: remote
   ADHD Support Level: 7
   ...

🎉 All tests passed!
```

## Running Tests

### All Integration Tests

```bash
# With pytest
uv run pytest tests/integration/ -v

# Standalone (more readable output)
uv run python tests/integration/test_onboarding_flow.py
uv run python tests/integration/test_onboarding_quick.py
```

### With Markers

```bash
# Run only integration tests
uv run pytest -m integration -v

# Skip integration tests
uv run pytest -m "not integration" -v
```

### With Coverage

```bash
uv run pytest tests/integration/ --cov=src --cov-report=term-missing
```

## Test Fixtures

Shared fixtures are defined in `conftest.py`:

### Available Fixtures

- `base_url`: API base URL (default: http://localhost:8000)
- `api_timeout`: Request timeout (default: 10 seconds)
- `test_user_id`: Unique user ID per test
- `api_client`: Configured requests session with helper methods
- `sample_onboarding_data`: Complete sample onboarding data
- `cleanup_onboarding_data`: Automatic cleanup after tests

### Environment Variables

Configure tests via environment variables:

```bash
# Custom API URL
export TEST_BASE_URL=http://localhost:9000

# Custom timeout
export TEST_TIMEOUT=30

# Run tests
uv run pytest tests/integration/ -v
```

## Writing New Integration Tests

### Template

```python
import pytest
import requests

def test_my_integration(base_url, test_user_id, cleanup_onboarding_data):
    """
    Test description.

    This integration test verifies that...
    """
    # Register for cleanup
    cleanup_onboarding_data.append(test_user_id)

    # Test implementation
    response = requests.post(
        f"{base_url}/api/v1/endpoint",
        json={"data": "value"}
    )

    assert response.status_code == 200
    assert response.json()["field"] == "expected"
```

### Best Practices

1. **Descriptive names**: `test_complete_onboarding_preserves_all_data`
2. **Clear assertions**: One logical assertion per test when possible
3. **Cleanup**: Use `cleanup_onboarding_data` fixture
4. **Independence**: Tests should not depend on each other
5. **Documentation**: Add docstrings explaining what's being tested

## Troubleshooting

### Error: Cannot connect to API server

**Cause**: Backend not running

**Solution**:
```bash
# Start backend first
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Then run tests
uv run pytest tests/integration/ -v
```

### Error: Database table doesn't exist

**Cause**: Migrations not run

**Solution**:
```bash
# Run migrations
sqlite3 proxy_agents_enhanced.db < src/database/migrations/024_create_user_onboarding.sql

# Or restart backend to auto-migrate
uv run uvicorn src.main:app --reload
```

### Tests are slow

**Cause**: Network latency, database operations

**Expected**: Integration tests are slower than unit tests (1-5 seconds each)

**Optimization**:
- Run unit tests for development: `uv run pytest src/ -v`
- Run integration tests before commits: `uv run pytest tests/integration/ -v`

### Hanging tests

**Cause**: Backend not responding, infinite loops

**Solution**:
```bash
# Kill hanging pytest
Ctrl+C

# Check backend logs
# Restart backend if needed

# Run with timeout
uv run pytest tests/integration/ -v --timeout=30
```

## CI/CD Integration

### GitHub Actions Example

```yaml
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
          sleep 5  # Wait for server to start

      - name: Run integration tests
        run: uv run pytest tests/integration/ -v --junitxml=reports/junit.xml

      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: reports/junit.xml
```

## Related Documentation

- **Project Tests**: `tests/README.md` - Overall test organization
- **Unit Tests**: Individual `src/*/tests/` directories
- **Test Reports**: `Agent_Resources/reports/` - Test execution reports
- **CLAUDE.md**: Testing guidelines and TDD principles

---

**Last Updated**: November 2025
