# End-to-End Test Plan for Backend

## Overview

This document outlines the comprehensive E2E testing strategy for the Proxy Agent Platform backend, testing the complete user journey from signup to task management with real LLMs and providers.

## Test Philosophy

- **Real Everything**: Use actual backend API, real database, real LLM calls
- **Human Review**: Generate human-readable reports for manual verification
- **Unique Test Users**: Each test creates unique users using UUID/timestamps
- **Full Coverage**: Test all major tabs and workflows

## E2E Test Flows

### Test 1: Single Task Flow

**Journey**: New user → Onboarding → Connect Gmail → Get suggestions → Create task → Complete task

**Steps**:
1. **Sign Up**: Create new test user via `/api/v1/auth/register`
2. **Onboarding**: Complete onboarding via `/api/v1/users/{user_id}/onboarding`
3. **Capture - Connect**: Initiate Gmail OAuth (simulated or real test account)
4. **Capture - Suggestions**: Fetch suggested tasks from `/api/v1/integrations/suggested-tasks`
5. **Capture - Add**: Manually create a task via `/api/v1/tasks`
6. **Explorer**: View tasks via task listing endpoints
7. **Complete**: Mark task as done and verify gamification (XP, pets)

**Human Review Output**:
- Test execution summary with timestamps
- User credentials and ID
- Created tasks with AI reasoning
- Final state snapshot (tasks, XP, achievements)

### Test 2: Multi-Task Flow with Task Splitting

**Journey**: New user → Onboarding → Create complex project → Split tasks → Focus session → Complete micro-steps

**Steps**:
1. **Sign Up**: Create new test user
2. **Onboarding**: Complete onboarding with ADHD support settings
3. **Capture - Add**: Create a complex project with multiple tasks
4. **Task Splitting**: Use AI to split complex tasks into micro-steps
5. **Explorer**: View organized tasks by priority/CompassZone
6. **Focus Session**: Start Pomodoro session on first task
7. **Complete Micro-Steps**: Complete micro-steps sequentially
8. **Morning Ritual**: Set top 3 focus tasks for next day
9. **Verify Gamification**: Check XP, pet progress, achievements

**Human Review Output**:
- Complete task hierarchy (project → tasks → micro-steps)
- AI-generated task breakdowns with reasoning
- Energy/focus session data
- Gamification progression report

## Current Backend Capabilities

### ✅ Implemented Features

| Feature | Endpoint | Status |
|---------|----------|--------|
| User Registration | `POST /api/v1/auth/register` | ✅ |
| User Login | `POST /api/v1/auth/login` | ✅ |
| Profile Access | `GET /api/v1/auth/profile` | ✅ |
| Onboarding | `PUT /api/v1/users/{user_id}/onboarding` | ✅ |
| Provider OAuth | `POST /api/v1/integrations/{provider}/authorize` | ✅ |
| OAuth Callback | `GET /api/v1/integrations/{provider}/callback` | ✅ |
| List Integrations | `GET /api/v1/integrations/` | ✅ |
| Trigger Sync | `POST /api/v1/integrations/{integration_id}/sync` | ✅ |
| Task Suggestions | `GET /api/v1/integrations/suggested-tasks` | ✅ |
| Approve Suggestion | `POST /api/v1/integrations/tasks/{id}/approve` | ✅ |
| Dismiss Suggestion | `POST /api/v1/integrations/tasks/{id}/dismiss` | ✅ |
| Task Management | Various `/api/v1/tasks` endpoints | ✅ |
| Task Splitting | Task splitting API | ✅ |
| Focus Sessions | Focus session endpoints | ✅ |
| Gamification | Pets, XP, achievements | ✅ |

### ❌ Missing for Full E2E (To Be Built or Worked Around)

| Feature | Needed For | Workaround |
|---------|------------|------------|
| Events Model | Calendar-style events | Use FocusSession or skip |
| Contacts Model | Contact management | Skip for now |
| General Suggestions | Non-integration suggestions | Use integration suggestions only |
| Explorer Tab API | Organized view of all data | Use existing task listing |

## Data Models for E2E Tests

### Test User Profile
```python
{
    "user_id": "test-{uuid}",
    "username": f"testuser_{timestamp}",
    "email": f"test_{timestamp}@example.com",
    "full_name": "E2E Test User",
    "password": "E2ETestPassword123!"
}
```

### Test Onboarding Data
```python
{
    "work_preference": "hybrid",
    "adhd_support_level": 8,
    "adhd_challenges": ["time_blindness", "focus", "organization"],
    "productivity_goals": ["reduce_overwhelm", "increase_focus"],
    "daily_schedule": {
        "time_preference": "morning",
        "flexible_enabled": True
    }
}
```

### Test Project
```python
{
    "name": "E2E Test Project - Website Redesign",
    "description": "Complete website redesign with modern UI/UX",
    "start_date": "2025-11-15T09:00:00Z"
}
```

### Test Complex Task (for splitting)
```python
{
    "title": "Design and implement user authentication system",
    "description": "Create secure authentication with OAuth, JWT, and password recovery",
    "priority": "high",
    "estimated_hours": 12,
    "scope": "complex"
}
```

## Human Review Report Format

### Report Structure
```markdown
# E2E Test Report: {test_name}
**Test ID**: {uuid}
**Executed At**: {timestamp}
**Duration**: {duration_seconds}s
**Status**: ✅ PASSED / ❌ FAILED

## Test User
- User ID: {user_id}
- Username: {username}
- Email: {email}
- Token: {access_token[:50]}...

## Test Execution

### 1. Sign Up ✅
- Time: {timestamp}
- Status Code: 201
- Response: Created user successfully

### 2. Onboarding ✅
- Time: {timestamp}
- ADHD Support Level: 8/10
- Challenges: time_blindness, focus, organization

### 3. Provider Connection ✅
- Provider: gmail
- Integration ID: {integration_id}
- Status: connected
- Scopes: {scopes}

### 4. Task Suggestions ✅
- Suggestions Fetched: {count}
- AI Confidence Average: {avg_confidence}

**Sample Suggestion**:
```json
{
    "title": "...",
    "ai_reasoning": "...",
    "confidence": 0.85
}
```

### 5. Task Creation ✅
- Tasks Created: {count}
- Task IDs: [{task_ids}]

### 6. Task Splitting ✅
- Complex Tasks Split: {count}
- Micro-Steps Generated: {count}

**AI Breakdown**:
Task: "Design authentication system"
→ Step 1: Research OAuth providers (5 min)
→ Step 2: Set up JWT library (8 min)
→ Step 3: Create user model (10 min)
...

### 7. Focus Session ✅
- Duration: 25 min
- Completed: Yes
- Interruptions: 0

### 8. Gamification ✅
- XP Earned: {xp}
- Level: {level}
- Pet Name: {pet_name}
- Pet Health: {pet_health}

## Final State

### Tasks
- Total: {count}
- Completed: {count}
- Pending: {count}

### Data Snapshot
```json
{
    "user": {...},
    "projects": [{...}],
    "tasks": [{...}],
    "achievements": [{...}]
}
```

## Human Verification Checklist

- [ ] User was created successfully
- [ ] Onboarding data matches expectations
- [ ] Provider connection worked
- [ ] Task suggestions are relevant
- [ ] AI reasoning makes sense
- [ ] Task splitting created logical micro-steps
- [ ] Micro-step durations are 1-10 minutes
- [ ] Focus session tracked correctly
- [ ] XP and gamification updated
- [ ] No errors in logs

## Errors/Warnings
{errors if any}

---
Generated by E2E Test Suite v1.0
```

## Test Implementation Structure

```
src/api/tests/
├── e2e/
│   ├── __init__.py
│   ├── conftest.py                 # Shared fixtures
│   ├── test_e2e_single_task.py     # Single task flow
│   ├── test_e2e_multi_task.py      # Multi-task flow
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── test_user_factory.py    # Generate unique test users
│   │   ├── report_generator.py     # Human review report generation
│   │   ├── assertions.py           # Custom E2E assertions
│   │   └── data_factories.py       # Test data generators
│   └── reports/                    # Generated human review reports
│       ├── single_task_20251115_143022.md
│       └── multi_task_20251115_144530.md
```

## Running E2E Tests

```bash
# Run all E2E tests
uv run pytest src/api/tests/e2e/ -v

# Run single test
uv run pytest src/api/tests/e2e/test_e2e_single_task.py -v

# Run with human review reports
uv run pytest src/api/tests/e2e/ -v --generate-reports

# Run against specific environment
TEST_ENV=staging uv run pytest src/api/tests/e2e/ -v
```

## Environment Variables

```bash
# E2E Test Configuration
E2E_GENERATE_REPORTS=true          # Generate human review reports
E2E_REPORT_DIR=src/api/tests/e2e/reports
E2E_USE_REAL_LLMS=true             # Use real OpenAI/Anthropic calls
E2E_USE_REAL_PROVIDERS=false       # Use real Gmail/Calendar (requires creds)
E2E_CLEANUP_USERS=true             # Delete test users after tests
E2E_BASE_URL=http://localhost:8000 # API base URL

# Provider Credentials (if testing real integrations)
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...
```

## Success Criteria

### Single Task Flow
- ✅ User registration successful
- ✅ Onboarding completed
- ✅ Provider connected (or simulated)
- ✅ At least 1 task suggestion generated
- ✅ Task created and completed
- ✅ XP earned and reflected in profile
- ✅ Human review report generated
- ✅ No unhandled exceptions

### Multi-Task Flow
- ✅ Complex project created with 5+ tasks
- ✅ At least 1 task split into micro-steps
- ✅ Micro-steps are 1-10 minutes each
- ✅ Focus session completed
- ✅ Morning ritual set
- ✅ CompassZones utilized
- ✅ Pet health/XP progression logical
- ✅ AI reasoning documented in reports
- ✅ No unhandled exceptions

## Future Enhancements

1. **Multi-Provider Testing**: Test Gmail + Calendar + Notion together
2. **Performance Benchmarks**: Track API response times
3. **Load Testing**: Run E2E with concurrent users
4. **Mobile Integration**: Test deep links and mobile OAuth flows
5. **Real Provider Integration**: Set up test Google/Microsoft accounts
6. **CI/CD Integration**: Run E2E tests on every release
7. **Screenshot/Video**: Capture visual state for human review
8. **Chaos Testing**: Inject random failures to test resilience

## Notes

- E2E tests are **slow** (~2-5 minutes each due to real LLM calls)
- Tests should be **idempotent** (can run multiple times safely)
- Each test creates **isolated test data** (no shared state)
- Human review is **mandatory** for LLM output validation
- Tests use **timestamped users** to avoid conflicts
- Cleanup should **always run** even if tests fail
