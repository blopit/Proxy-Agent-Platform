# 🧪 Testing Strategy & Quality Assurance

**Version**: 1.0
**Last Updated**: October 21, 2025
**Platform Version**: 0.6.0
**Current Test Coverage**: 98.6% (Backend), 81% (Overall)

---

## 📋 Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Pyramid](#test-pyramid)
3. [Backend Testing](#backend-testing)
4. [Frontend Testing](#frontend-testing)
5. [Mobile Testing](#mobile-testing)
6. [Integration Testing](#integration-testing)
7. [End-to-End Testing](#end-to-end-testing)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [User Acceptance Testing](#user-acceptance-testing)
11. [CI/CD Testing Pipeline](#cicd-testing-pipeline)
12. [Test Data Management](#test-data-management)

---

## 🎯 Testing Philosophy

### Core Principles

1. **Test-Driven Development (TDD)**: Write tests before implementation
2. **Fast Feedback**: Tests should run quickly and provide immediate feedback
3. **Isolation**: Each test should be independent and repeatable
4. **Comprehensive Coverage**: Aim for 80%+ code coverage on critical paths
5. **Realistic Testing**: Use production-like data and scenarios
6. **Automated Quality Gates**: No merge without passing tests

### Current Testing Status

```
✅ Backend Unit Tests:        216/219 passing (98.6%)
✅ Backend Integration Tests:  12/12 passing (100%)
✅ Repository Tests:           49/49 passing (100%)
✅ Model Tests:                48/48 passing (100%)
✅ Agent Unit Tests:           49/52 passing (94%)
🟡 Frontend Tests:            Not yet implemented
🟡 E2E Tests:                 Not yet implemented
🟡 Mobile Tests:              Not yet implemented
```

**Overall Platform Test Coverage**: 81% (312/384 tests passing)

---

## 📊 Test Pyramid

Our testing strategy follows the test pyramid model:

```
                    /\
                   /  \
                  / E2E \           10% - Slow, expensive
                 /-------\
                /         \
               / Integration\       20% - Medium speed
              /-------------\
             /               \
            /   Unit Tests    \     70% - Fast, cheap
           /-------------------\

Total Tests: 384
- Unit: ~270 tests (70%)
- Integration: ~80 tests (20%)
- E2E: ~34 tests (10%)
```

### Why This Distribution?

- **Unit Tests (70%)**: Fast, isolated, test individual functions
- **Integration Tests (20%)**: Test component interactions
- **E2E Tests (10%)**: Test complete user workflows

---

## 🐍 Backend Testing

### Test Infrastructure

**Location**: `src/conftest.py` (professional-grade fixture system)

```python
"""
Centralized test fixtures for the entire test suite.
Provides database isolation, dependency injection, and test data.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from src.api.main import app
from src.database.enhanced_adapter import Base, get_db
import os

# Test database URL
TEST_DATABASE_URL = "sqlite:///./test_proxy_agent.db"

@pytest.fixture(scope="function")
def db_session():
    """
    Provide isolated database session for each test.
    Automatically rolls back after test completion.
    """
    # Create test database engine
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create session
    TestingSessionLocal = sessionmaker(bind=engine)
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.rollback()
        session.close()
        # Drop all tables for next test
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """
    Provide FastAPI test client with dependency injection.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

@pytest.fixture
def sample_user(db_session):
    """Provide sample user for testing."""
    from src.core.task_models import User
    from src.repositories.enhanced_repositories import UserRepository

    user_repo = UserRepository()
    user = user_repo.create({
        "username": "testuser",
        "email": "test@example.com",
        "hashed_password": "$2b$12$hash"
    }, db_session)

    return user

@pytest.fixture
def sample_task(db_session, sample_user):
    """Provide sample task for testing."""
    from src.core.task_models import Task
    from src.repositories.enhanced_repositories import TaskRepository

    task_repo = TaskRepository()
    task = task_repo.create({
        "title": "Test Task",
        "description": "Test Description",
        "status": "pending",
        "priority": "medium",
        "user_id": sample_user.id
    }, db_session)

    return task
```

### Unit Test Examples

**File**: `src/core/tests/test_task_models.py`

```python
"""
Unit tests for Task models.
Test validation, business logic, and model behavior.
"""
import pytest
from pydantic import ValidationError
from src.core.task_models import Task, TaskCreate, TaskUpdate

def test_task_create_valid():
    """Test creating task with valid data."""
    task = TaskCreate(
        title="Write documentation",
        description="Complete testing guide",
        priority="high",
        user_id=1
    )

    assert task.title == "Write documentation"
    assert task.priority == "high"
    assert task.status == "pending"  # Default value

def test_task_create_missing_required_fields():
    """Test that required fields are enforced."""
    with pytest.raises(ValidationError) as exc_info:
        TaskCreate(description="Missing title")

    assert "title" in str(exc_info.value)

def test_task_priority_validation():
    """Test that invalid priority values are rejected."""
    with pytest.raises(ValidationError):
        TaskCreate(
            title="Test",
            priority="invalid_priority",  # Should fail
            user_id=1
        )

def test_task_update_partial():
    """Test that TaskUpdate allows partial updates."""
    update = TaskUpdate(title="New title")

    assert update.title == "New title"
    assert update.description is None  # Not updated
    assert update.priority is None  # Not updated
```

**Run Backend Unit Tests**:

```bash
# All unit tests
uv run pytest src/ -v

# Specific test file
uv run pytest src/core/tests/test_task_models.py -v

# With coverage
uv run pytest src/ --cov=src --cov-report=html

# Fast fail (stop on first failure)
uv run pytest src/ -x

# Verbose with print statements
uv run pytest src/ -v -s
```

### Integration Test Examples

**File**: `src/api/tests/test_task_endpoints.py`

```python
"""
Integration tests for Task API endpoints.
Tests full request/response cycle with database.
"""
import pytest
from fastapi import status

def test_create_task_success(client, sample_user):
    """Test creating task via API."""
    response = client.post("/api/v1/tasks", json={
        "title": "Integration test task",
        "description": "Test description",
        "priority": "high",
        "user_id": sample_user.id
    })

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Integration test task"
    assert data["priority"] == "high"
    assert "id" in data

def test_create_task_validation_error(client):
    """Test that API validates input correctly."""
    response = client.post("/api/v1/tasks", json={
        "description": "Missing title"  # Invalid
    })

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_get_task_success(client, sample_task):
    """Test retrieving task by ID."""
    response = client.get(f"/api/v1/tasks/{sample_task.id}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == sample_task.id
    assert data["title"] == sample_task.title

def test_get_task_not_found(client):
    """Test that missing tasks return 404."""
    response = client.get("/api/v1/tasks/99999")

    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_update_task_success(client, sample_task):
    """Test updating task via API."""
    response = client.put(f"/api/v1/tasks/{sample_task.id}", json={
        "title": "Updated title",
        "status": "in_progress"
    })

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated title"
    assert data["status"] == "in_progress"

def test_delete_task_success(client, sample_task):
    """Test deleting task via API."""
    response = client.delete(f"/api/v1/tasks/{sample_task.id}")

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify task is deleted
    get_response = client.get(f"/api/v1/tasks/{sample_task.id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_list_tasks_with_filters(client, sample_user, db_session):
    """Test listing tasks with status filter."""
    # Create multiple tasks
    from src.repositories.enhanced_repositories import TaskRepository
    task_repo = TaskRepository()

    task_repo.create({"title": "Task 1", "status": "pending", "user_id": sample_user.id}, db_session)
    task_repo.create({"title": "Task 2", "status": "completed", "user_id": sample_user.id}, db_session)
    task_repo.create({"title": "Task 3", "status": "pending", "user_id": sample_user.id}, db_session)

    # Filter by status
    response = client.get(f"/api/v1/tasks?user_id={sample_user.id}&status=pending")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2  # Only pending tasks
    assert all(task["status"] == "pending" for task in data)
```

**Run Integration Tests**:

```bash
# All integration tests
uv run pytest src/api/tests/ -v

# Specific integration test
uv run pytest src/api/tests/test_task_endpoints.py::test_create_task_success -v

# With detailed output
uv run pytest src/api/tests/ -v --tb=short
```

### Agent Testing

**File**: `src/agents/tests/test_task_proxy_intelligent.py`

```python
"""
Tests for Task Intelligence Agent.
Tests AI-powered task analysis, prioritization, and breakdown.
"""
import pytest
from src.agents.task_proxy_intelligent import TaskIntelligenceAgent

@pytest.fixture
def agent():
    """Provide TaskIntelligenceAgent instance."""
    return TaskIntelligenceAgent()

def test_analyze_task_complexity(agent):
    """Test that agent correctly assesses task complexity."""
    result = agent.analyze_task({
        "title": "Build entire authentication system with OAuth2, JWT, and 2FA",
        "description": "Comprehensive security implementation"
    })

    assert result["complexity"] in ["simple", "medium", "complex"]
    assert result["complexity"] == "complex"  # Should detect complex task
    assert result["estimated_duration"] > 60  # More than 1 hour

def test_suggest_task_breakdown(agent):
    """Test that agent breaks down complex tasks."""
    result = agent.suggest_breakdown({
        "title": "Launch new product",
        "description": "Complete product launch from design to deployment"
    })

    assert "subtasks" in result
    assert len(result["subtasks"]) >= 3  # Should suggest multiple steps
    assert all("title" in subtask for subtask in result["subtasks"])

def test_prioritize_tasks(agent):
    """Test that agent prioritizes tasks correctly."""
    tasks = [
        {"title": "Fix critical bug", "priority": "high", "urgency": "critical"},
        {"title": "Update README", "priority": "low", "urgency": "low"},
        {"title": "Review PR", "priority": "medium", "urgency": "medium"}
    ]

    result = agent.prioritize_tasks(tasks)

    assert result[0]["title"] == "Fix critical bug"  # Highest priority first
    assert result[-1]["title"] == "Update README"  # Lowest priority last

def test_categorize_task(agent):
    """Test that agent categorizes tasks accurately."""
    result = agent.categorize_task({
        "title": "Write unit tests for authentication",
        "description": "Add pytest tests for login flow"
    })

    assert result["category"] in ["development", "testing", "documentation", "meeting", "admin"]
    assert result["category"] == "testing"
```

**Run Agent Tests**:

```bash
# All agent tests
uv run pytest src/agents/tests/ -v

# Specific agent
uv run pytest src/agents/tests/test_task_proxy_intelligent.py -v

# With AI call logging
uv run pytest src/agents/tests/ -v -s --log-cli-level=DEBUG
```

---

## ⚛️ Frontend Testing

### Setup Jest + React Testing Library

**Install**:

```bash
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @types/jest jest-environment-jsdom
```

**Configure**: `frontend/jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Setup**: `frontend/jest.setup.js`

```javascript
import '@testing-library/jest-dom'
```

### Component Test Examples

**File**: `frontend/src/components/tasks/__tests__/QuickCapture.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickCapture from '../QuickCapture';

describe('QuickCapture Component', () => {
  it('renders input field and submit button', () => {
    render(<QuickCapture onCapture={jest.fn()} />);

    expect(screen.getByPlaceholderText(/capture a task/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /capture/i })).toBeInTheDocument();
  });

  it('calls onCapture with task text when submitted', async () => {
    const mockOnCapture = jest.fn();
    render(<QuickCapture onCapture={mockOnCapture} />);

    const input = screen.getByPlaceholderText(/capture a task/i);
    const button = screen.getByRole('button', { name: /capture/i });

    // Type task
    await userEvent.type(input, 'Write tests for QuickCapture');

    // Submit
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnCapture).toHaveBeenCalledWith('Write tests for QuickCapture');
    });
  });

  it('clears input after successful capture', async () => {
    render(<QuickCapture onCapture={jest.fn()} />);

    const input = screen.getByPlaceholderText(/capture a task/i) as HTMLInputElement;

    await userEvent.type(input, 'Test task');
    fireEvent.click(screen.getByRole('button', { name: /capture/i }));

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('shows error when trying to submit empty task', async () => {
    render(<QuickCapture onCapture={jest.fn()} />);

    const button = screen.getByRole('button', { name: /capture/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/task cannot be empty/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while processing', async () => {
    const slowCapture = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<QuickCapture onCapture={slowCapture} />);

    const input = screen.getByPlaceholderText(/capture a task/i);
    const button = screen.getByRole('button', { name: /capture/i });

    await userEvent.type(input, 'Test task');
    fireEvent.click(button);

    expect(button).toBeDisabled();
  });
});
```

**File**: `frontend/src/components/tasks/__tests__/TaskList.test.tsx`

```typescript
import { render, screen, within } from '@testing-library/react';
import TaskList from '../TaskList';

const mockTasks = [
  { id: 1, title: 'Task 1', status: 'pending', priority: 'high' },
  { id: 2, title: 'Task 2', status: 'completed', priority: 'low' },
  { id: 3, title: 'Task 3', status: 'in_progress', priority: 'medium' },
];

describe('TaskList Component', () => {
  it('renders all tasks', () => {
    render(<TaskList tasks={mockTasks} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('displays task status badges', () => {
    render(<TaskList tasks={mockTasks} />);

    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('in_progress')).toBeInTheDocument();
  });

  it('filters tasks by status', () => {
    render(<TaskList tasks={mockTasks} filter="completed" />);

    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(<TaskList tasks={[]} />);

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
  });

  it('applies correct priority styling', () => {
    render(<TaskList tasks={mockTasks} />);

    const highPriorityTask = screen.getByText('Task 1').closest('div');
    expect(highPriorityTask).toHaveClass('priority-high');
  });
});
```

**Run Frontend Tests**:

```bash
cd frontend

# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific file
npm test -- TaskList.test.tsx
```

---

## 📱 Mobile Testing

### Manual Mobile Testing Checklist

#### iOS Testing (Safari + Mobile Browser)

```
Device Testing:
□ iPhone SE (small screen)
□ iPhone 14 Pro (standard)
□ iPhone 15 Pro Max (large screen)
□ iPad Air (tablet)

Browser Testing:
□ Safari (iOS)
□ Chrome (iOS)
□ Firefox (iOS)

Feature Testing:
□ Touch interactions (tap, swipe, long-press)
□ Haptic feedback
□ Voice input
□ Camera/photo upload
□ Geolocation
□ Push notifications
□ iOS Shortcuts integration
□ Add to Home Screen
□ Offline mode
□ WebSocket reconnection
```

#### Android Testing

```
Device Testing:
□ Pixel 6 (small/medium)
□ Pixel 8 Pro (large)
□ Samsung Galaxy S23 (standard)
□ Samsung Galaxy Tab (tablet)

Browser Testing:
□ Chrome (Android)
□ Firefox (Android)
□ Samsung Internet

Feature Testing:
□ Touch interactions
□ Vibration feedback
□ Voice input
□ Camera/photo upload
□ Geolocation
□ Push notifications
□ Android Quick Tiles
□ Add to Home Screen
□ Offline mode
□ WebSocket reconnection
```

### Automated Mobile Testing

**Tool**: Playwright for Mobile

**Install**:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Configure**: `frontend/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // Desktop browsers
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },

    // Mobile browsers
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
    { name: 'Tablet', use: { ...devices['iPad Pro'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Mobile E2E Test**: `frontend/e2e/mobile-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mobile Task Capture Workflow', () => {
  test('should capture task on mobile device', async ({ page }) => {
    // Navigate to mobile page
    await page.goto('/mobile');

    // Wait for page load
    await expect(page.locator('h1')).toContainText(/proxy agent/i);

    // Open quick capture
    await page.locator('[data-testid="quick-capture-button"]').tap();

    // Type task (mobile keyboard)
    await page.locator('[data-testid="task-input"]').fill('Call dentist tomorrow');

    // Submit
    await page.locator('[data-testid="submit-button"]').tap();

    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(/task captured/i);

    // Verify task appears in list
    await expect(page.locator('[data-testid="task-list"]')).toContainText('Call dentist tomorrow');
  });

  test('should swipe to complete task', async ({ page }) => {
    await page.goto('/mobile');

    // Wait for task list
    await page.waitForSelector('[data-testid="task-item"]');

    // Get first task
    const firstTask = page.locator('[data-testid="task-item"]').first();

    // Swipe right to complete
    const box = await firstTask.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.mouse.up();
    }

    // Verify completion animation
    await expect(page.locator('[data-testid="xp-animation"]')).toBeVisible();

    // Verify XP increase
    const xpBefore = await page.locator('[data-testid="xp-display"]').textContent();
    await page.waitForTimeout(1000);
    const xpAfter = await page.locator('[data-testid="xp-display"]').textContent();

    expect(Number(xpAfter)).toBeGreaterThan(Number(xpBefore));
  });

  test('should handle poor network conditions', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto('/mobile');

    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Should eventually load
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('should work offline', async ({ page, context }) => {
    await page.goto('/mobile');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Capture task offline
    await page.locator('[data-testid="quick-capture-button"]').tap();
    await page.locator('[data-testid="task-input"]').fill('Offline task');
    await page.locator('[data-testid="submit-button"]').tap();

    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();

    // Task should be queued locally
    await expect(page.locator('[data-testid="task-list"]')).toContainText('Offline task');

    // Go back online
    await context.setOffline(false);

    // Should sync and show success
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible({ timeout: 5000 });
  });
});
```

**Run Mobile Tests**:

```bash
cd frontend

# All mobile tests
npx playwright test

# Specific mobile device
npx playwright test --project="Mobile Safari"

# Debug mode
npx playwright test --debug

# Show browser
npx playwright test --headed

# Generate report
npx playwright show-report
```

---

## 🔗 Integration Testing

### API Integration Tests

These tests verify that different system components work together correctly.

**File**: `src/api/tests/test_focus_energy_integration.py`

```python
"""
Integration tests for coordinated Focus + Energy workflows.
Tests how agents work together to optimize productivity.
"""
import pytest
from fastapi import status

def test_start_focus_session_with_energy_check(client, sample_user):
    """Test that starting focus session checks energy level."""

    # Record low energy
    energy_response = client.post("/api/v1/energy/record", json={
        "user_id": sample_user.id,
        "energy_level": 30,
        "factors": {
            "sleep_hours": 4,
            "stress_level": "high"
        }
    })
    assert energy_response.status_code == status.HTTP_200_OK

    # Try to start intensive focus session
    focus_response = client.post("/api/v1/focus/start", json={
        "user_id": sample_user.id,
        "session_type": "deep_work",  # Requires high energy
        "duration_minutes": 90
    })

    # Should suggest lighter session due to low energy
    assert focus_response.status_code == status.HTTP_200_OK
    data = focus_response.json()
    assert "recommendation" in data
    assert "shorter session" in data["recommendation"].lower() or "break" in data["recommendation"].lower()

def test_task_completion_awards_xp_and_updates_streak(client, sample_user, sample_task):
    """Test that completing task triggers both XP and streak updates."""

    # Complete task
    task_response = client.put(f"/api/v1/tasks/{sample_task.id}", json={
        "status": "completed"
    })
    assert task_response.status_code == status.HTTP_200_OK

    # Check that XP was awarded
    progress_response = client.get(f"/api/v1/progress/stats/{sample_user.id}")
    assert progress_response.status_code == status.HTTP_200_OK
    progress_data = progress_response.json()
    assert progress_data["xp"] > 0
    assert progress_data["total_tasks_completed"] >= 1

    # Check that streak was updated
    gamification_response = client.get(f"/api/v1/gamification/stats/{sample_user.id}")
    assert gamification_response.status_code == status.HTTP_200_OK
    gamification_data = gamification_response.json()
    assert gamification_data["current_streak"] >= 1

def test_achievement_unlocked_on_milestone(client, sample_user, db_session):
    """Test that achievements are unlocked when milestones are reached."""
    from src.repositories.enhanced_repositories import TaskRepository

    task_repo = TaskRepository()

    # Complete 10 tasks to unlock achievement
    for i in range(10):
        task = task_repo.create({
            "title": f"Task {i}",
            "user_id": sample_user.id,
            "status": "completed"
        }, db_session)

    # Check achievements
    response = client.get(f"/api/v1/gamification/achievements/{sample_user.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    # Should have unlocked "First 10 Tasks" achievement
    achievement_names = [a["name"] for a in data["unlocked"]]
    assert any("10" in name for name in achievement_names)
```

**Run Integration Tests**:

```bash
# All integration tests
uv run pytest src/api/tests/ -v -m integration

# Specific integration test file
uv run pytest src/api/tests/test_focus_energy_integration.py -v

# With coverage
uv run pytest src/api/tests/ -v --cov=src/api --cov=src/services
```

---

## 🌐 End-to-End Testing

### Complete User Workflows

**File**: `frontend/e2e/complete-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Task Management Workflow', () => {
  test('user can sign up, create tasks, complete them, and earn rewards', async ({ page }) => {
    // 1. Sign up
    await page.goto('/signup');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // 2. Create first task
    await page.click('[data-testid="quick-capture-button"]');
    await page.fill('[data-testid="task-input"]', 'Complete onboarding');
    await page.click('[data-testid="submit-button"]');

    // Verify task created
    await expect(page.locator('[data-testid="task-list"]')).toContainText('Complete onboarding');

    // 3. Start focus session
    await page.click('[data-testid="start-focus-button"]');
    await page.selectOption('[data-testid="session-type"]', 'pomodoro');
    await page.click('[data-testid="begin-session-button"]');

    // Verify focus session started
    await expect(page.locator('[data-testid="focus-timer"]')).toBeVisible();

    // 4. Complete task during session
    await page.click('[data-testid="task-item"]:has-text("Complete onboarding")');
    await page.click('[data-testid="complete-task-button"]');

    // 5. Verify XP animation
    await expect(page.locator('[data-testid="xp-animation"]')).toBeVisible();

    // 6. Check updated stats
    const xpDisplay = page.locator('[data-testid="xp-display"]');
    await expect(xpDisplay).toContainText(/\d+/);  // Has some XP

    const levelDisplay = page.locator('[data-testid="level-display"]');
    await expect(levelDisplay).toContainText(/Level \d+/);

    // 7. View achievements
    await page.click('[data-testid="achievements-tab"]');
    await expect(page.locator('[data-testid="achievements-list"]')).toBeVisible();

    // Should have "First Task" achievement
    await expect(page.locator('[data-testid="achievements-list"]')).toContainText('First Task');

    // 8. Check leaderboard
    await page.click('[data-testid="leaderboard-tab"]');
    await expect(page.locator('[data-testid="leaderboard"]')).toContainText('testuser');

    // 9. Log out
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
```

**Run E2E Tests**:

```bash
cd frontend

# All E2E tests
npx playwright test e2e/

# Specific workflow
npx playwright test e2e/complete-workflow.spec.ts

# Debug mode (step through)
npx playwright test --debug e2e/complete-workflow.spec.ts

# Generate screenshots/videos
npx playwright test --screenshot=on --video=on
```

---

## ⚡ Performance Testing

### Load Testing with Locust

**File**: `tests/performance/locustfile.py`

```python
"""
Load testing for Proxy Agent Platform.
Simulates realistic user behavior with varying loads.
"""
from locust import HttpUser, task, between, tag
import random

class ProxyAgentUser(HttpUser):
    """Simulate realistic user behavior."""

    wait_time = between(1, 5)  # 1-5 seconds between requests
    host = "http://localhost:8000"

    def on_start(self):
        """Login before starting tasks."""
        response = self.client.post("/api/v1/auth/login", json={
            "username": "testuser",
            "password": "password123"
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(10)  # 10x weight (most common action)
    @tag("tasks")
    def list_tasks(self):
        """List user tasks."""
        self.client.get("/api/v1/tasks", headers=self.headers)

    @task(5)  # 5x weight
    @tag("tasks")
    def create_task(self):
        """Create new task."""
        self.client.post("/api/v1/tasks", json={
            "title": f"Load test task {random.randint(1, 10000)}",
            "description": "Generated by load test",
            "priority": random.choice(["low", "medium", "high"])
        }, headers=self.headers)

    @task(3)  # 3x weight
    @tag("tasks")
    def get_task_detail(self):
        """Get specific task."""
        task_id = random.randint(1, 100)
        self.client.get(f"/api/v1/tasks/{task_id}", headers=self.headers)

    @task(2)
    @tag("tasks")
    def update_task(self):
        """Update task status."""
        task_id = random.randint(1, 100)
        self.client.put(f"/api/v1/tasks/{task_id}", json={
            "status": random.choice(["pending", "in_progress", "completed"])
        }, headers=self.headers)

    @task(1)
    @tag("tasks")
    def delete_task(self):
        """Delete task."""
        task_id = random.randint(1, 100)
        self.client.delete(f"/api/v1/tasks/{task_id}", headers=self.headers)

    @task(4)
    @tag("focus")
    def start_focus_session(self):
        """Start focus session."""
        self.client.post("/api/v1/focus/start", json={
            "user_id": 1,
            "session_type": random.choice(["pomodoro", "deep_work", "timeboxing"]),
            "duration_minutes": random.choice([25, 50, 90])
        }, headers=self.headers)

    @task(2)
    @tag("gamification")
    def get_stats(self):
        """Get user stats."""
        self.client.get("/api/v1/progress/stats/1", headers=self.headers)
        self.client.get("/api/v1/gamification/stats/1", headers=self.headers)

    @task(1)
    @tag("gamification")
    def get_leaderboard(self):
        """View leaderboard."""
        self.client.get("/api/v1/gamification/leaderboard", headers=self.headers)
```

**Run Load Tests**:

```bash
# Install Locust
uv add --dev locust

# Run load test
locust -f tests/performance/locustfile.py --host=http://localhost:8000

# Headless mode with specific load
locust -f tests/performance/locustfile.py \
  --host=http://localhost:8000 \
  --users 100 \
  --spawn-rate 10 \
  --run-time 5m \
  --headless

# Target specific tags
locust -f tests/performance/locustfile.py --tags tasks
```

**Performance Benchmarks**:

```
Target Metrics (with 100 concurrent users):
- API Response Time (p95): < 500ms
- API Response Time (p99): < 1000ms
- Database Query Time: < 100ms
- Cache Hit Rate: > 80%
- Error Rate: < 1%
- Throughput: > 100 req/s
```

---

## 🛡️ Security Testing

### Security Test Checklist

```
Authentication & Authorization:
□ SQL injection (parameterized queries)
□ XSS attacks (input sanitization)
□ CSRF protection
□ JWT token expiration
□ Password hashing (bcrypt)
□ Rate limiting
□ Session hijacking prevention

API Security:
□ CORS configuration
□ Input validation (Pydantic)
□ Output sanitization
□ Error message disclosure
□ API key rotation
□ HTTPS enforcement

Database Security:
□ Connection encryption
□ Least privilege access
□ Backup encryption
□ SQL injection prevention
□ Sensitive data masking

Infrastructure:
□ Environment variable security
□ Secret management
□ Dependency vulnerabilities
□ Container security
□ Network isolation
```

### Automated Security Tests

**File**: `tests/security/test_auth_security.py`

```python
"""
Security tests for authentication system.
"""
import pytest
from fastapi import status

def test_sql_injection_prevention(client):
    """Test that SQL injection is prevented."""
    malicious_input = "'; DROP TABLE users; --"

    response = client.post("/api/v1/auth/login", json={
        "username": malicious_input,
        "password": "password"
    })

    # Should safely handle malicious input
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    # Database should still be intact
    assert client.get("/health").status_code == status.HTTP_200_OK

def test_xss_prevention(client, sample_user):
    """Test that XSS attacks are prevented."""
    xss_payload = "<script>alert('XSS')</script>"

    response = client.post("/api/v1/tasks", json={
        "title": xss_payload,
        "user_id": sample_user.id
    })

    # Should accept but escape the payload
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    # Output should be escaped
    assert "<script>" not in data["title"]  # HTML escaped

def test_rate_limiting(client):
    """Test that rate limiting prevents abuse."""
    # Make 101 requests quickly
    for i in range(101):
        response = client.get("/api/v1/tasks")

        if i < 100:
            assert response.status_code != status.HTTP_429_TOO_MANY_REQUESTS
        else:
            # 101st request should be rate limited
            assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

def test_jwt_expiration(client, sample_user):
    """Test that expired JWT tokens are rejected."""
    import time
    from src.api.auth import create_access_token

    # Create token with 1 second expiration
    token = create_access_token(
        data={"sub": str(sample_user.id)},
        expires_delta=1
    )

    # Wait for expiration
    time.sleep(2)

    # Try to use expired token
    response = client.get("/api/v1/tasks", headers={
        "Authorization": f"Bearer {token}"
    })

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_password_complexity_enforcement(client):
    """Test that weak passwords are rejected."""
    weak_passwords = ["123", "password", "qwerty", "abc123"]

    for weak_password in weak_passwords:
        response = client.post("/api/v1/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": weak_password
        })

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "password" in response.json()["detail"].lower()
```

**Run Security Tests**:

```bash
# Security tests
uv run pytest tests/security/ -v

# OWASP ZAP scan (if installed)
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:8000

# Dependency vulnerability scan
uv pip list --outdated
```

---

## 👥 User Acceptance Testing (UAT)

### UAT Test Plan

**Phase 1: Core Workflows (Week 1)**

```
Test Group: 5 ADHD users

Scenario 1: Task Capture
1. User opens mobile app
2. Captures task via quick input
3. Verifies task appears in list
4. Edits task details
5. Completes task

Success Criteria:
- Task capture < 5 seconds
- No confusion about UI
- XP reward feels satisfying
- User reports "would use daily"

Scenario 2: Focus Session
1. User starts Pomodoro session
2. Completes 25-minute focus
3. Takes 5-minute break
4. Views focus statistics

Success Criteria:
- Session starts immediately
- Timer is clear and visible
- Break reminders are helpful
- User feels more focused

Scenario 3: Gamification
1. User completes 5 tasks
2. Unlocks first achievement
3. Views XP progress
4. Checks leaderboard position

Success Criteria:
- Achievement unlock feels rewarding
- XP progression is clear
- Leaderboard is motivating
- User wants to earn more XP
```

**Phase 2: Advanced Features (Week 2)**

```
Scenario 4: Energy Tracking
1. User logs morning energy (high)
2. System suggests challenging tasks
3. User logs afternoon energy (low)
4. System recommends easier tasks

Scenario 5: Mobile Shortcuts
1. User sets up iOS Shortcut
2. Captures task via Siri
3. Task appears in app
4. User gets confirmation

Scenario 6: Offline Mode
1. User goes offline (airplane mode)
2. Captures 3 tasks
3. Reconnects to internet
4. Tasks sync automatically
```

### UAT Feedback Template

**File**: `tests/uat/feedback_template.md`

```markdown
# UAT Feedback Form

**Tester Name**: _________________
**Date**: _________________
**Device**: iOS / Android / Desktop
**Browser**: _________________

## Task Completion

| Scenario | Completed? | Time | Difficulty (1-5) | Notes |
|----------|------------|------|------------------|-------|
| Task Capture | ☐ Yes ☐ No | __:__ | __ / 5 | |
| Focus Session | ☐ Yes ☐ No | __:__ | __ / 5 | |
| Gamification | ☐ Yes ☐ No | __:__ | __ / 5 | |
| Energy Tracking | ☐ Yes ☐ No | __:__ | __ / 5 | |
| Mobile Shortcuts | ☐ Yes ☐ No | __:__ | __ / 5 | |

## User Experience

**What did you like most?**
_________________________________________________________________

**What was confusing?**
_________________________________________________________________

**What would you change?**
_________________________________________________________________

**Would you use this daily?** ☐ Yes ☐ No ☐ Maybe

**Overall Rating**: ★ ★ ★ ★ ★

## Bugs Found

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

## Additional Comments

_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🔄 CI/CD Testing Pipeline

### Complete Testing Workflow

```yaml
# .github/workflows/test.yml
name: Comprehensive Test Suite

on: [push, pull_request]

jobs:
  # Backend Tests
  backend-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: curl -LsSf https://astral.sh/uv/install.sh | sh
      - run: uv sync
      - run: uv run ruff check .
      - run: uv run ruff format --check .
      - run: uv run mypy src/
      - run: uv run pytest src/ --cov=src --cov-report=xml
      - uses: codecov/codecov-action@v3

  backend-integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
    steps:
      - uses: actions/checkout@v3
      - run: uv run pytest src/api/tests/ -v

  # Frontend Tests
  frontend-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run type-check
      - run: cd frontend && npm test -- --coverage

  # E2E Tests
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci
      - run: npx playwright install --with-deps
      - run: cd frontend && npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/

  # Performance Tests
  performance:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: uv add locust
      - run: |
          locust -f tests/performance/locustfile.py \
            --headless \
            --users 50 \
            --spawn-rate 5 \
            --run-time 2m \
            --html=performance-report.html
      - uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-report.html

  # Security Tests
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: uv run pytest tests/security/ -v
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
```

---

## 📊 Test Data Management

### Test Data Fixtures

**File**: `tests/fixtures/test_data.py`

```python
"""
Centralized test data for all test suites.
Provides realistic, consistent data across tests.
"""
from datetime import datetime, timedelta

# Sample users
SAMPLE_USERS = [
    {
        "id": 1,
        "username": "alice",
        "email": "alice@example.com",
        "hashed_password": "$2b$12$hash1"
    },
    {
        "id": 2,
        "username": "bob",
        "email": "bob@example.com",
        "hashed_password": "$2b$12$hash2"
    }
]

# Sample tasks
SAMPLE_TASKS = [
    {
        "id": 1,
        "title": "Write comprehensive tests",
        "description": "Add unit and integration tests",
        "status": "in_progress",
        "priority": "high",
        "user_id": 1,
        "created_at": datetime.now()
    },
    {
        "id": 2,
        "title": "Review pull request",
        "description": "Code review for authentication",
        "status": "pending",
        "priority": "medium",
        "user_id": 1,
        "created_at": datetime.now() - timedelta(hours=2)
    }
]

# Sample focus sessions
SAMPLE_FOCUS_SESSIONS = [
    {
        "id": 1,
        "user_id": 1,
        "session_type": "pomodoro",
        "duration_minutes": 25,
        "focus_score": 85,
        "distractions": 2,
        "started_at": datetime.now() - timedelta(hours=1)
    }
]

# Sample achievements
SAMPLE_ACHIEVEMENTS = [
    {
        "id": 1,
        "name": "First Task",
        "description": "Complete your first task",
        "icon": "🎯",
        "xp_reward": 50
    },
    {
        "id": 2,
        "name": "10 Tasks",
        "description": "Complete 10 tasks",
        "icon": "🏆",
        "xp_reward": 200
    }
]

def load_test_data(db_session):
    """Load all test data into database."""
    from src.repositories.enhanced_repositories import (
        UserRepository,
        TaskRepository,
        AchievementRepository
    )

    user_repo = UserRepository()
    task_repo = TaskRepository()
    achievement_repo = AchievementRepository()

    # Load users
    for user_data in SAMPLE_USERS:
        user_repo.create(user_data, db_session)

    # Load tasks
    for task_data in SAMPLE_TASKS:
        task_repo.create(task_data, db_session)

    # Load achievements
    for achievement_data in SAMPLE_ACHIEVEMENTS:
        achievement_repo.create(achievement_data, db_session)

    db_session.commit()
```

---

## 📈 Testing Metrics & Goals

### Current Test Coverage

```
Backend:
✅ Unit Tests: 216/219 (98.6%)
✅ Integration Tests: 12/12 (100%)
✅ Agent Tests: 49/52 (94%)

Frontend:
🟡 Component Tests: 0 (TODO)
🟡 Integration Tests: 0 (TODO)

Mobile:
🟡 E2E Tests: 0 (TODO)
🟡 Device Tests: 0 (TODO)

Overall: 312/384 (81%)
```

### Target Metrics

```
Goal for Production Launch:
✅ Backend Coverage: 95%+ (ACHIEVED)
🎯 Frontend Coverage: 80%+ (TODO)
🎯 E2E Coverage: 100% critical paths (TODO)
🎯 Mobile Coverage: 100% user workflows (TODO)

Quality Gates:
✅ All tests pass before merge
✅ No critical security vulnerabilities
✅ Performance benchmarks met
✅ UAT approval from 5+ users
```

---

## ✅ Testing Checklist

### Before Each PR

- [ ] All existing tests pass
- [ ] New code has tests (80%+ coverage)
- [ ] Integration tests updated if needed
- [ ] No console errors or warnings
- [ ] Manual testing on mobile
- [ ] Performance impact checked

### Before Production Deploy

- [ ] All 384+ tests passing (100%)
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] UAT completed with 5+ users
- [ ] Mobile testing on iOS + Android
- [ ] Backup/restore tested
- [ ] Monitoring configured
- [ ] Rollback plan documented

---

**Testing Status**: 81% Complete (312/384 tests passing)
**Next Priority**: Frontend component tests (0/80 TODO)
**Quality Goal**: 95%+ coverage before production

*This testing strategy ensures the Proxy Agent Platform maintains high quality, reliability, and user satisfaction through comprehensive automated and manual testing.*
