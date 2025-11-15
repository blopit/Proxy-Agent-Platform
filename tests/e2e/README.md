# End-to-End (E2E) Tests for Proxy Agent Platform Backend

## Overview

This directory contains comprehensive end-to-end tests that validate complete user workflows from signup to task completion. These tests use real API calls, real databases, and optionally real LLM providers to ensure the entire backend system works correctly.

## 🎯 What Makes These E2E Tests Special

### Human Review Required
Since LLMs cannot reliably validate LLM-generated output, these tests generate **human-readable markdown reports** that require manual review. This ensures AI-generated task breakdowns, suggestions, and reasoning make sense.

### Real Everything
- ✅ **Real API calls** - No mocks, actual FastAPI endpoints
- ✅ **Real database** - Actual SQLite database operations
- ✅ **Real LLMs** - Optional real OpenAI/Anthropic API calls
- ✅ **Real OAuth** - Optional real provider connections (Gmail, Calendar, etc.)
- ✅ **Unique test users** - Each test creates isolated users using UUID/timestamps

## 📁 Directory Structure

```
tests/e2e/
├── README.md                        # This file
├── E2E_TEST_PLAN.md                # Comprehensive test plan and strategy
├── __init__.py                      # Package init
├── conftest.py                      # Shared pytest fixtures
├── test_e2e_single_task.py         # Single task workflow test
├── test_e2e_multi_task.py          # Multi-task with splitting test
├── utils/                           # Test utilities
│   ├── __init__.py
│   ├── test_user_factory.py        # Unique user generation
│   ├── report_generator.py         # Human review report generator
│   └── data_factories.py           # Test data factories
└── reports/                         # Generated human review reports
    ├── single_task_20251115_143022.md
    └── multi_task_20251115_144530.md
```

## 🧪 Available E2E Tests

### 1. Single Task Flow (`test_e2e_single_task.py`)

**Journey**: New user → Onboarding → View suggestions → Create task → Complete task

**What it tests**:
- User registration and authentication
- Onboarding with ADHD preferences
- Provider connection health check
- Task suggestion viewing
- Manual task creation
- Task completion
- Gamification (XP, pets)

**Duration**: ~30-60 seconds

**Run it**:
```bash
uv run pytest tests/e2e/test_e2e_single_task.py -v
```

### 2. Multi-Task Flow with Task Splitting (`test_e2e_multi_task.py`)

**Journey**: New user → Onboarding → Create complex project → AI task splitting → Focus session → Complete micro-steps

**What it tests**:
- High ADHD support onboarding
- Complex project creation
- Multiple task types (simple + complex)
- AI-powered task splitting into micro-steps
- Explorer view (task listing/filtering)
- Focus sessions (Pomodoro)
- Micro-step completion
- Morning ritual (top 3 tasks)
- Gamification progression

**Duration**: ~60-120 seconds (with real LLM calls)

**Run it**:
```bash
uv run pytest tests/e2e/test_e2e_multi_task.py -v
```

## 🚀 Running E2E Tests

### Quick Start

```bash
# Run all E2E tests with default settings
uv run pytest tests/e2e/ -v

# Run specific test
uv run pytest tests/e2e/test_e2e_single_task.py -v

# Run with markers
uv run pytest tests/e2e/ -m "e2e and not slow" -v

# Run only slow tests
uv run pytest tests/e2e/ -m "slow" -v
```

### With Environment Variables

```bash
# Generate human review reports (recommended!)
E2E_GENERATE_REPORTS=true uv run pytest tests/e2e/ -v

# Use real LLM calls (costs money!)
E2E_USE_REAL_LLMS=true uv run pytest tests/e2e/ -v

# Use real OAuth providers (requires credentials)
E2E_USE_REAL_PROVIDERS=true uv run pytest tests/e2e/ -v

# Cleanup test users after tests
E2E_CLEANUP_USERS=true uv run pytest tests/e2e/ -v

# Custom report directory
E2E_REPORT_DIR=./my-reports uv run pytest tests/e2e/ -v

# All together
E2E_GENERATE_REPORTS=true \
E2E_USE_REAL_LLMS=false \
E2E_USE_REAL_PROVIDERS=false \
uv run pytest tests/e2e/ -v
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_GENERATE_REPORTS` | `true` | Generate human review markdown reports |
| `E2E_REPORT_DIR` | `tests/e2e/reports` | Directory to save reports |
| `E2E_USE_REAL_LLMS` | `true` | Use real OpenAI/Anthropic API calls |
| `E2E_USE_REAL_PROVIDERS` | `false` | Use real Gmail/Calendar OAuth |
| `E2E_CLEANUP_USERS` | `false` | Delete test users after tests |
| `E2E_BASE_URL` | `http://localhost:8000` | API base URL |

### Provider Credentials (Optional)

If testing with real OAuth providers (`E2E_USE_REAL_PROVIDERS=true`):

```bash
export GMAIL_CLIENT_ID="your-client-id"
export GMAIL_CLIENT_SECRET="your-client-secret"
export GOOGLE_CALENDAR_CLIENT_ID="your-client-id"
export GOOGLE_CALENDAR_CLIENT_SECRET="your-client-secret"
```

## 📊 Human Review Reports

### Report Generation

When `E2E_GENERATE_REPORTS=true`, each test generates a markdown report in `tests/e2e/reports/`:

```markdown
# E2E Test Report: Single Task Flow
**Test ID**: abc123de
**Executed At**: 2025-11-15T14:30:22Z
**Duration**: 45.23s
**Status**: ✅ PASSED

## Test User
- User ID: test-abc123de-user123
- Username: e2e_single_task_20251115143022_abc123de
- Email: e2e_single_task_20251115143022_abc123de@e2etest.example.com

## Test Execution

### 1. Sign Up ✅
**Time**: 2025-11-15T14:30:23Z
**User ID**: test-abc123de-user123
**Username**: e2e_single_task_20251115143022_abc123de

### 2. Onboarding ✅
**ADHD Support Level**: 7
**Challenges**: ["time_blindness", "focus", "organization"]

...

## Human Verification Checklist
- [ ] User was created successfully
- [ ] All API calls returned expected status codes
- [ ] Data consistency maintained
- [ ] AI-generated content makes sense
- [ ] No unexpected errors
```

### Review Checklist

For each report, verify:

1. ✅ **User Creation** - User registered successfully
2. ✅ **Onboarding** - Preferences saved correctly
3. ✅ **Provider Connections** - OAuth flows worked (if applicable)
4. ✅ **Task Suggestions** - AI suggestions are relevant
5. ✅ **Task Splitting** - Micro-steps make sense (1-10 minutes each)
6. ✅ **AI Reasoning** - LLM explanations are logical
7. ✅ **Gamification** - XP and pet health updated correctly
8. ✅ **No Errors** - Clean execution without unhandled exceptions

## 🧩 Test Components

### Fixtures (`conftest.py`)

- `e2e_test_db` - Isolated test database
- `e2e_api_client` - FastAPI test client
- `test_user_factory` - Unique user generation
- `report_generator` - Human review report generation
- `use_real_llms` - LLM configuration
- `use_real_providers` - Provider configuration
- `generate_reports` - Report generation setting

### Utilities (`utils/`)

#### TestUserFactory
```python
factory = TestUserFactory(prefix="e2e")
user_info = factory.create_unique_user(
    test_name="my_test",
    include_onboarding=True
)
```

#### ReportGenerator
```python
report = ReportGenerator()
report.set_metadata(test_name="My Test", test_id="abc123")
report.add_section("Sign Up", status="✅", details={...})
report_path = report.save_report(test_passed=True)
```

#### Data Factories
```python
# Create test data
onboarding = create_test_onboarding_data(adhd_support_level=8)
project = create_test_project(name="My Project")
task = create_test_complex_task(title="Build feature")
focus = create_test_focus_session(task_id="task123")
ritual = create_test_morning_ritual(focus_task_ids=["t1", "t2", "t3"])
```

## 🏷️ Pytest Markers

```python
@pytest.mark.e2e              # Mark as E2E test
@pytest.mark.slow             # Slow running test (>30s)
@pytest.mark.requires_llm     # Requires real LLM API calls
@pytest.mark.requires_providers  # Requires real OAuth providers
```

**Run tests by marker**:
```bash
# Only E2E tests
pytest -m "e2e" tests/e2e/

# E2E tests that don't require LLMs
pytest -m "e2e and not requires_llm" tests/e2e/

# Only tests requiring providers
pytest -m "requires_providers" tests/e2e/
```

## 🐛 Debugging

### Verbose Output

```bash
# Maximum verbosity
uv run pytest tests/e2e/ -vv -s

# Show print statements
uv run pytest tests/e2e/ -s

# Show local variables on failure
uv run pytest tests/e2e/ -l

# Drop into debugger on failure
uv run pytest tests/e2e/ --pdb
```

### Check Reports

After test runs, check the generated reports in `tests/e2e/reports/`:

```bash
# View latest report
ls -lt tests/e2e/reports/ | head -2 | tail -1 | awk '{print $NF}' | xargs cat

# Open in editor
code tests/e2e/reports/  # VS Code
open tests/e2e/reports/  # macOS Finder
```

## 📈 Success Criteria

### Single Task Flow
- ✅ User registration successful (201)
- ✅ Onboarding completed (200)
- ✅ Provider health check works (200)
- ✅ Task created (201)
- ✅ Task completed (200/204)
- ✅ XP earned and visible
- ✅ Human review report generated
- ✅ No unhandled exceptions

### Multi-Task Flow
- ✅ Complex project created (201)
- ✅ 5+ tasks created
- ✅ At least 1 task split into micro-steps
- ✅ Micro-steps are 1-10 minutes each
- ✅ Focus session completed
- ✅ Morning ritual set
- ✅ AI reasoning documented
- ✅ Gamification progression logical
- ✅ Human review report generated
- ✅ No unhandled exceptions

## 🔍 Troubleshooting

### Test Fails with 404

**Problem**: Endpoint not implemented yet

**Solution**: Check if the endpoint exists in your API. Tests gracefully handle missing endpoints with ⚠️ warnings in reports.

### Test Fails with 401

**Problem**: Authentication issue

**Solution**: Check that JWT tokens are being generated and passed correctly. Verify `Authorization: Bearer {token}` header.

### No Reports Generated

**Problem**: `E2E_GENERATE_REPORTS` not set

**Solution**:
```bash
E2E_GENERATE_REPORTS=true uv run pytest tests/e2e/ -v
```

### LLM API Errors

**Problem**: Real LLM calls failing or expensive

**Solution**:
```bash
E2E_USE_REAL_LLMS=false uv run pytest tests/e2e/ -v
```

## 🚧 Current Limitations

1. **Provider OAuth** - Real provider testing requires OAuth credentials
2. **Events Model** - Not yet implemented (using FocusSession instead)
3. **Contacts Model** - Not yet implemented
4. **General Suggestions** - Only integration-based suggestions supported

## 🔮 Future Enhancements

- [ ] Multi-provider E2E tests (Gmail + Calendar + Notion)
- [ ] Performance benchmarking
- [ ] Load testing with concurrent users
- [ ] Mobile deep link testing
- [ ] CI/CD integration
- [ ] Screenshot/video capture
- [ ] Chaos/resilience testing

## 📚 Resources

- [E2E Test Plan](./E2E_TEST_PLAN.md) - Comprehensive strategy document
- [Backend API Docs](../../src/api/) - API endpoint documentation
- [Database Models](../../src/database/models.py) - Database schema
- [CLAUDE.md](../../CLAUDE.md) - Development guidelines

## 🤝 Contributing

When adding new E2E tests:

1. Create unique test users for isolation
2. Generate human review reports
3. Add pytest markers (`@pytest.mark.e2e`)
4. Update this README with new test description
5. Add success criteria to checklist
6. Test with both real and simulated LLMs

## 📞 Support

For issues or questions:
- Check reports in `tests/e2e/reports/`
- Review E2E Test Plan document
- Check backend logs
- Verify API endpoints exist

---

**Last Updated**: 2025-11-15
**Maintained By**: Proxy Agent Platform Team
