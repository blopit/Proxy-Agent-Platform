# BE-15: Integration Test Suite - Implementation Status

**Last Updated**: November 13, 2025
**Status**: ⏳ NOT STARTED (0% Complete)
**Priority**: HIGH
**Estimated Time**: 4-6 hours
**TDD Approach**: RED → GREEN → REFACTOR

---

## 📊 Current Status

### ✅ COMPLETED (20%)
1. **Existing Integration Tests** - Some tests already exist
   ```
   tests/integration/
   ├── __init__.py
   ├── conftest.py              (has basic fixtures)
   ├── test_task_routes.py      (basic task API tests)
   ├── test_onboarding_flow.py  (onboarding integration)
   └── test_onboarding_quick.py (quick onboarding tests)
   ```

### 🔄 NEEDED - Multi-Service Integration Tests

According to BE-15 spec, we need tests that span MULTIPLE services:

1. **Task Lifecycle Test** - Create task → Split → Complete → Earn XP → Level up
2. **Gamification Flow** - Tasks → XP → Achievements → Leaderboard
3. **Creature System** - Create pet → Complete tasks → Pet evolves
4. **Analytics Pipeline** - Tasks → Metrics → Insights
5. **Delegation Workflow** - Human → Agent → Complete → Review
6. **Performance Tests** - Concurrent operations, load testing

---

## 🎯 Implementation Plan

### Phase 1: Task Lifecycle Integration (1-2 hours)

**File**: `tests/integration/test_complete_task_lifecycle.py`

**Test Scenario**: Full journey from task creation to completion
```python
async def test_complete_task_lifecycle(test_client, db_session):
    """
    Integration test: Create task → split into steps → complete → earn XP → level up.

    Services involved:
    - Task service (create task)
    - Task splitting service (BE-05)
    - Micro-step service (complete steps)
    - Gamification service (XP calculation)
    - Progress service (level up)

    Flow:
    1. Create a task via POST /api/v1/tasks/
    2. AI split task via POST /api/v1/tasks/{id}/split
    3. Complete each micro-step
    4. Complete main task
    5. Verify XP earned
    6. Verify analytics updated
    """
```

**Dependencies**:
- Task API (exists)
- Task splitting API (BE-05 - exists)
- Gamification API (exists)
- Progress API (exists)

### Phase 2: Focus Sessions Integration (1 hour)

**File**: `tests/integration/test_focus_session_flow.py`

**Test Scenario**: Focus session with task completion
```python
async def test_focus_session_with_task_completion(test_client):
    """
    Integration test: Start focus → Complete task → Track metrics.

    Services involved:
    - Focus sessions (BE-03)
    - Task service
    - Analytics service

    Flow:
    1. Start focus session with task link
    2. Complete task during session
    3. End focus session
    4. Verify analytics updated with focus time
    """
```

**Dependencies**:
- BE-03 Focus Sessions (IN PROGRESS)
- Task API (exists)
- Analytics API (exists)

### Phase 3: Templates Integration (30 min)

**File**: `tests/integration/test_template_workflow.py`

**Test Scenario**: Template instantiation to task completion
```python
async def test_template_to_task_completion(test_client):
    """
    Integration test: Use template → Create task → Complete steps.

    Services involved:
    - Templates service (BE-01)
    - Task service
    - Micro-step service

    Flow:
    1. Get template from library
    2. Instantiate template to create task
    3. Task auto-populated with template steps
    4. Complete each step
    5. Complete task
    """
```

**Dependencies**:
- BE-01 Templates (COMPLETE)
- Task API (exists)

### Phase 4: Analytics Pipeline (1 hour)

**File**: `tests/integration/test_analytics_pipeline.py`

**Test Scenario**: Data flows to analytics correctly
```python
async def test_analytics_pipeline_integration(test_client):
    """
    Integration test: Complete tasks → metrics updated → insights generated.

    Services involved:
    - Task service
    - Completion tracking
    - Analytics service
    - Insights generation

    Flow:
    1. Complete 5 tasks at different times of day
    2. Verify daily metrics updated
    3. Verify productivity patterns learned
    4. Verify insights generated
    """
```

**Dependencies**:
- Task API (exists)
- Analytics API (exists)
- Time mocking (freezegun)

### Phase 5: Performance & Concurrency (1-2 hours)

**File**: `tests/integration/test_performance.py`

**Test Scenarios**:
- 50 concurrent task completions
- Bulk operations (create 100 tasks)
- Database connection pool stress test
- Response time benchmarks

---

## 🧪 Test Organization

### Recommended Structure

```
tests/integration/
├── __init__.py
├── conftest.py                          (shared fixtures)
│
├── workflows/
│   ├── test_complete_task_lifecycle.py  (Phase 1)
│   ├── test_focus_session_flow.py       (Phase 2)
│   ├── test_template_workflow.py        (Phase 3)
│   └── test_gamification_flow.py
│
├── pipelines/
│   ├── test_analytics_pipeline.py       (Phase 4)
│   └── test_data_flow.py
│
├── performance/
│   ├── test_concurrency.py              (Phase 5)
│   ├── test_load.py
│   └── test_benchmarks.py
│
└── README.md                            (test documentation)
```

---

## 📦 Required Fixtures (conftest.py)

```python
# tests/integration/conftest.py
import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from freezegun import freeze_time

from src.api.main import app
from src.database.enhanced_adapter import EnhancedDatabaseAdapter


@pytest.fixture
async def test_client():
    """FastAPI test client for integration tests."""
    return TestClient(app)


@pytest.fixture
async def db_session():
    """Database session with transaction rollback."""
    db = EnhancedDatabaseAdapter()
    conn = db.get_connection()

    # Start transaction
    conn.execute("BEGIN")

    yield conn

    # Rollback after test
    conn.execute("ROLLBACK")


@pytest.fixture
def sample_user():
    """Create sample user for testing."""
    user_id = "integration-test-user"
    # Create user in database
    # ...
    yield user_id
    # Cleanup after test
    # ...


@pytest.fixture
def clear_test_data():
    """Clear test data between tests."""
    db = EnhancedDatabaseAdapter()
    conn = db.get_connection()

    # Clear test user data
    conn.execute("DELETE FROM tasks WHERE user_id LIKE 'test-%'")
    conn.execute("DELETE FROM focus_sessions WHERE user_id LIKE 'test-%'")
    conn.commit()
```

---

## 🎯 Success Criteria

### Must Have
- [ ] 5+ multi-service workflow tests
- [ ] All tests pass consistently (no flaky tests)
- [ ] Test coverage >85% for integration scenarios
- [ ] Tests run in <5 minutes total
- [ ] Clear test failure messages

### Nice to Have
- [ ] Performance benchmarks documented
- [ ] Load testing scenarios (100+ concurrent users)
- [ ] Database transaction rollback per test
- [ ] Parallel test execution
- [ ] Test data generators/factories

---

## 🚀 Getting Started

### Step 1: Set Up Test Environment

```bash
# Install test dependencies
source .venv/bin/activate
uv add --dev pytest-asyncio freezegun faker

# Verify existing tests run
python -m pytest tests/integration/ -v
```

### Step 2: Write First Integration Test (RED)

```bash
# Create file
touch tests/integration/workflows/test_complete_task_lifecycle.py

# Write test (it will fail - RED phase)
# See Phase 1 example above
```

### Step 3: Ensure Services Exist (GREEN)

- Verify all required services are implemented
- If missing, implement service first
- Then re-run integration test

### Step 4: Fix & Optimize (REFACTOR)

- Optimize slow queries
- Add proper error handling
- Improve test reliability

---

## 📝 Example: Complete Task Lifecycle Test

```python
# tests/integration/workflows/test_complete_task_lifecycle.py
import pytest
from datetime import datetime


class TestCompleteTaskLifecycle:
    """Integration test for complete task lifecycle."""

    @pytest.mark.asyncio
    async def test_task_creation_to_completion_earns_xp(
        self, test_client, sample_user, clear_test_data
    ):
        """
        Test full task lifecycle:
        1. Create task
        2. Split into micro-steps (ADHD mode)
        3. Complete each step
        4. Complete task
        5. Earn XP
        6. Verify level progression
        """
        user_id = sample_user

        # 1. Get initial XP
        initial_stats = test_client.get(
            f"/api/v1/gamification/user-stats?user_id={user_id}"
        )
        assert initial_stats.status_code == 200
        initial_xp = initial_stats.json()["engagement_score"]

        # 2. Create a task
        task_response = test_client.post(
            "/api/v1/tasks/",
            json={
                "title": "Complete homework assignment",
                "category": "Academic",
                "priority": "high",
                "user_id": user_id,
            },
        )
        assert task_response.status_code == 201
        task_id = task_response.json()["task_id"]

        # 3. AI split task into micro-steps
        split_response = test_client.post(
            f"/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd"},
        )
        assert split_response.status_code == 200
        steps = split_response.json()["micro_steps"]
        assert len(steps) >= 3, "ADHD mode should create 3+ micro-steps"

        # 4. Complete each micro-step
        for step in steps:
            complete_response = test_client.post(
                f"/api/v1/micro-steps/{step['step_id']}/complete"
            )
            assert complete_response.status_code == 200

        # 5. Complete main task
        task_complete = test_client.post(f"/api/v1/tasks/{task_id}/complete")
        assert task_complete.status_code == 200

        # 6. Verify XP earned
        final_stats = test_client.get(
            f"/api/v1/gamification/user-stats?user_id={user_id}"
        )
        assert final_stats.status_code == 200
        final_xp = final_stats.json()["engagement_score"]

        assert final_xp > initial_xp, "User should earn XP for task completion"

        # 7. Verify analytics updated
        analytics = test_client.get(f"/api/v1/analytics/dashboard?user_id={user_id}")
        assert analytics.status_code == 200
        assert analytics.json()["today"]["tasks_completed"] >= 1


    @pytest.mark.asyncio
    async def test_focus_session_during_task(self, test_client, sample_user):
        """Test starting focus session while working on task."""
        user_id = sample_user

        # 1. Create task
        task_response = test_client.post(
            "/api/v1/tasks/",
            json={"title": "Deep work session", "user_id": user_id},
        )
        task_id = task_response.json()["task_id"]

        # 2. Start focus session linked to task
        session_response = test_client.post(
            "/api/v1/focus/sessions",
            json={
                "user_id": user_id,
                "step_id": task_id,
                "duration_minutes": 25,
            },
        )
        assert session_response.status_code == 201
        session_id = session_response.json()["session_id"]

        # 3. Complete task during session
        test_client.post(f"/api/v1/tasks/{task_id}/complete")

        # 4. End focus session
        end_response = test_client.put(
            f"/api/v1/focus/sessions/{session_id}",
            json={"completed": True, "interruptions": 0},
        )
        assert end_response.status_code == 200

        # 5. Verify analytics show focus time
        analytics = test_client.get(
            f"/api/v1/focus/sessions/analytics/{user_id}"
        )
        assert analytics.json()["total_focus_minutes"] >= 25
```

---

## 🔍 Debugging Integration Tests

### Common Issues

1. **Database state contamination**
   - Use `clear_test_data` fixture
   - Or use transactions with rollback

2. **Service dependencies**
   - Ensure all required services are running
   - Check service registration in main.py

3. **Timing issues**
   - Use `freezegun` for time-dependent tests
   - Add small delays for async operations

4. **Flaky tests**
   - Use explicit waits instead of sleeps
   - Avoid hard-coded IDs
   - Use proper fixtures for test data

---

## 📊 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install uv
          uv sync

      - name: Run integration tests
        run: |
          uv run pytest tests/integration/ -v --tb=short

      - name: Generate coverage report
        run: |
          uv run pytest tests/integration/ --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📈 Progress Tracking

### Implementation Checklist

- [ ] Phase 1: Task lifecycle test (2 hours)
- [ ] Phase 2: Focus session integration (1 hour)
- [ ] Phase 3: Template workflow (30 min)
- [ ] Phase 4: Analytics pipeline (1 hour)
- [ ] Phase 5: Performance tests (1-2 hours)
- [ ] CI/CD integration (30 min)
- [ ] Documentation (30 min)

### Test Coverage Goals

- [ ] 85%+ coverage for integration scenarios
- [ ] All critical user workflows tested
- [ ] Performance benchmarks established
- [ ] No flaky tests (99%+ reliability)

---

## 🔗 Related Tasks

- **BE-01**: Task Templates (COMPLETE) - Test template instantiation
- **BE-03**: Focus Sessions (IN PROGRESS) - Test focus + task completion
- **BE-05**: Task Splitting (COMPLETE) - Test splitting in lifecycle
- **Epic 7**: ADHD features - Integration test for micro-steps

---

## 📝 Notes for Future Agents

1. **Start Small**: Begin with Phase 1 (task lifecycle), then expand
2. **Test Isolation**: Each test should be independent and repeatable
3. **Real Services**: Use actual services, not mocks (this is integration testing)
4. **Database**: Tests use production DB - need transaction rollback
5. **Performance**: Track test execution time - keep under 5 minutes total

---

**Next Agent**: Start with Phase 1 - write the task lifecycle integration test, ensure it fails (RED), then verify services work together (GREEN).
