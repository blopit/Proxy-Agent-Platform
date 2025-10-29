# BE-15: Integration Test Suite

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 6-7 hours
**Dependencies**: All backend services
**Agent Type**: backend-tdd

## 📋 Overview
Comprehensive integration tests covering multi-service workflows and end-to-end user journeys.

## 🧪 Test Organization
```
tests/integration/
├── test_task_lifecycle.py        # Full task creation → completion
├── test_gamification_flow.py     # XP → levels → badges
├── test_creature_system.py       # Pet creation → interaction → evolution
├── test_analytics_pipeline.py    # Data collection → insights
├── test_delegation_workflow.py   # Human/agent collaboration
└── conftest.py                    # Shared fixtures
```

## 🏗️ Key Test Scenarios

### 1. Complete Task Lifecycle
```python
async def test_complete_task_lifecycle(test_client, db_session):
    """
    Integration test: Create task → split into steps → complete → earn XP → level up.
    """
    # 1. Create task
    task_response = await test_client.post("/api/v1/tasks/", json={
        "title": "Complete homework",
        "category": "Academic",
        "priority": "high"
    })
    task_id = task_response.json()["task_id"]

    # 2. AI split task
    split_response = await test_client.post("/api/v1/task-splitting/split", json={
        "task_id": task_id,
        "task_description": "Complete homework",
        "current_energy_level": "medium",
        "use_ai": True
    })

    steps = split_response.json()["suggested_steps"]
    assert len(steps) >= 3

    # 3. Complete each step
    initial_xp = get_user_xp(test_client, "user-123")

    for step in steps:
        await test_client.post(f"/api/v1/micro-steps/{step['step_id']}/complete")

    # 4. Complete task
    await test_client.post(f"/api/v1/tasks/{task_id}/complete")

    # 5. Verify XP earned
    final_xp = get_user_xp(test_client, "user-123")
    assert final_xp > initial_xp

    # 6. Verify analytics updated
    analytics = await test_client.get("/api/v1/analytics/dashboard?user_id=user-123")
    assert analytics.json()["today"]["tasks_completed"] >= 1
```

### 2. Creature Evolution Flow
```python
async def test_creature_evolution_flow(test_client):
    """
    Integration test: Create pet → gain XP → evolve.
    """
    # 1. Create pet
    pet_response = await test_client.post("/api/v1/pets/", json={
        "user_id": "user-123",
        "species": "dragon"
    })
    pet_id = pet_response.json()["pet_id"]

    # 2. Complete tasks to earn XP
    for i in range(10):
        task_resp = await test_client.post("/api/v1/tasks/", json={
            "title": f"Task {i}",
            "category": "Work"
        })
        await test_client.post(f"/api/v1/tasks/{task_resp.json()['task_id']}/complete")

    # 3. Check if pet can evolve
    status = await test_client.get(f"/api/v1/creatures/{pet_id}/status")
    assert status.json()["can_evolve"] is True

    # 4. Evolve pet
    evolve_resp = await test_client.post(f"/api/v1/creatures/{pet_id}/evolve")
    assert evolve_resp.json()["evolution_stage"] == 2
```

### 3. Delegation Workflow
```python
async def test_human_agent_delegation(test_client):
    """
    Integration test: Create task → delegate to agent → agent completes → human reviews.
    """
    # 1. Human creates task
    task_resp = await test_client.post("/api/v1/tasks/", json={
        "title": "BE-01: Task Templates Service",
        "is_meta_task": True,
        "delegation_mode": "DELEGATE"
    })
    task_id = task_resp.json()["task_id"]

    # 2. Delegate to agent
    delegate_resp = await test_client.post("/api/v1/delegation/delegate", json={
        "task_id": task_id,
        "delegation_mode": "DELEGATE",
        "prefer_agent_type": "backend-tdd"
    })

    assignment_id = delegate_resp.json()["assignment"]["assignment_id"]
    agent_id = delegate_resp.json()["assigned_agent"]["agent_id"]

    # 3. Agent claims task
    await test_client.post(f"/api/v1/delegation/assignments/{assignment_id}/accept")

    # 4. Agent starts work
    await test_client.post(f"/api/v1/delegation/assignments/{assignment_id}/start")

    # 5. Agent completes steps
    steps_resp = await test_client.get(f"/api/v1/tasks/{task_id}/steps")
    for step in steps_resp.json():
        await test_client.post(f"/api/v1/micro-steps/{step['step_id']}/complete")

    # 6. Agent completes task
    complete_resp = await test_client.post(f"/api/v1/delegation/assignments/{assignment_id}/complete")

    assert complete_resp.json()["status"] == "completed"

    # 7. Verify agent is now idle
    agent_status = await test_client.get(f"/api/v1/delegation/agents/{agent_id}")
    assert agent_status.json()["status"] == "idle"
```

### 4. Analytics Pipeline
```python
async def test_analytics_pipeline_integration(test_client):
    """
    Integration test: Complete tasks → metrics updated → insights generated.
    """
    user_id = "user-123"

    # 1. Complete 5 tasks at different times
    for hour in [9, 10, 14, 15, 20]:
        # Mock current time to specific hour
        with freeze_time(f"2025-01-28 {hour}:00:00"):
            task_resp = await test_client.post("/api/v1/tasks/", json={
                "title": f"Task at {hour}:00",
                "category": "Work"
            })
            await test_client.post(
                f"/api/v1/tasks/{task_resp.json()['task_id']}/complete",
                json={"energy_level": "high" if 9 <= hour <= 15 else "low"}
            )

    # 2. Verify daily metrics updated
    dashboard = await test_client.get(f"/api/v1/analytics/dashboard?user_id={user_id}")
    assert dashboard.json()["today"]["tasks_completed"] == 5

    # 3. Verify productivity patterns learned
    patterns = await test_client.get(f"/api/v1/analytics/patterns?user_id={user_id}")
    patterns_data = patterns.json()

    # Should have learned that morning (9-15) is high productivity
    morning_pattern = next(
        (p for p in patterns_data if "09:00" in p["pattern_key"] or "10:00" in p["pattern_key"]),
        None
    )
    assert morning_pattern is not None
    assert morning_pattern["success_count"] > 0

    # 4. Verify insights generated
    insights = await test_client.get(f"/api/v1/analytics/insights?user_id={user_id}")
    assert len(insights.json()) > 0
```

### 5. Performance Under Load
```python
async def test_concurrent_task_completions(test_client):
    """
    Integration test: Simulate 50 concurrent task completions.
    """
    import asyncio

    tasks = []
    for i in range(50):
        task_resp = await test_client.post("/api/v1/tasks/", json={
            "title": f"Concurrent task {i}",
            "category": "Work"
        })
        tasks.append(task_resp.json()["task_id"])

    # Complete all tasks concurrently
    async def complete_task(task_id):
        await test_client.post(f"/api/v1/tasks/{task_id}/complete")

    await asyncio.gather(*[complete_task(tid) for tid in tasks])

    # Verify all completed
    dashboard = await test_client.get("/api/v1/analytics/dashboard?user_id=user-123")
    assert dashboard.json()["today"]["tasks_completed"] >= 50
```

## 🏗️ Test Fixtures
```python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
async def test_client():
    """Test client with in-memory database."""
    app = create_app()
    client = TestClient(app)
    yield client

@pytest.fixture
async def db_session():
    """Database session for integration tests."""
    engine = create_engine("sqlite:///:memory:")
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@pytest.fixture
async def sample_user():
    """Create sample user with initial data."""
    user = create_user("user-123")
    yield user
    cleanup_user("user-123")
```

## 🌐 CI/CD Integration
```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install uv
          uv sync

      - name: Run integration tests
        run: |
          uv run pytest tests/integration/ -v --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🧪 Test Execution
```bash
# Run all integration tests
uv run pytest tests/integration/ -v

# Run specific test file
uv run pytest tests/integration/test_task_lifecycle.py -v

# Run with coverage
uv run pytest tests/integration/ --cov=src --cov-report=html

# Run performance tests
uv run pytest tests/integration/test_performance.py -v --benchmark
```

## ✅ Acceptance Criteria
- [ ] 15+ integration test scenarios
- [ ] All multi-service workflows tested
- [ ] Concurrent operations tested
- [ ] CI/CD pipeline runs tests automatically
- [ ] Test coverage reports generated
- [ ] All tests pass consistently
- [ ] Performance benchmarks documented

## 🎯 Success Metrics
- **Test Coverage**: 85%+ for integration tests
- **Test Speed**: Full suite completes in <5 minutes
- **Reliability**: 0 flaky tests
- **CI/CD**: All PRs require passing tests
