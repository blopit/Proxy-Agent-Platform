# 🔧 Backend Developer - Quick Start

**Goal**: Pick up a backend task and start implementing with TDD
**Time to first commit**: 30 minutes
**Approach**: RED → GREEN → REFACTOR

---

## ⚡ 5-Minute Setup

### 1. Clone & Install
```bash
cd /path/to/Proxy-Agent-Platform
uv sync                    # Install all dependencies
source .venv/bin/activate  # Or: .venv\Scripts\activate on Windows
```

### 2. Verify Setup
```bash
uv run pytest              # Should see existing tests pass
uv run ruff check .        # Linting should pass
```

### 3. Database Setup
```bash
# If using SQLite (default for dev)
python -m src.database.init_db

# If using PostgreSQL
export DATABASE_URL="postgresql://user:pass@localhost/adhd_app"
alembic upgrade head
```

---

## 📋 Choose Your Task

### Start Here: Critical Foundation
- **BE-00**: Task Delegation System (**DO_WITH_ME** - work with human)
  - File: `docs/tasks/backend/00_task_delegation_system.md`
  - **START WITH THIS** - enables dogfooding for all other tasks!

### Wave 2: Core Services (Pick Any)
- **BE-01**: Task Templates (6 hours) - CRUD for reusable templates
- **BE-02**: User Pets (8 hours) - Virtual pet system
- **BE-03**: Focus Sessions (4 hours) - Pomodoro tracking
- **BE-04**: Gamification (5 hours) - XP, badges, levels

### Wave 3: Advanced Backend (After Wave 2)
- **BE-05**: Task Splitting (10 hours) - Epic 7, AI-powered
- **BE-06**: Analytics (8 hours) - Insights and dashboards
- **BE-07**: Notifications (6 hours) - Reminders and alerts
- **BE-08**: Social Sharing (5 hours) - Share achievements
- **BE-09**: Export/Import (4 hours) - Data portability
- **BE-10**: Webhooks (5 hours) - Third-party integrations

### Wave 4: Creature & ML (After BE-02, BE-04)
- **BE-11**: Creature Leveling (6 hours) - Pet XP and evolution
- **BE-12**: AI Creature Generation (7 hours) - Personality AI
- **BE-13**: ML Pipeline (8 hours) - Energy predictions

### Wave 6: Quality (After all features)
- **BE-14**: Performance Monitoring (5 hours) - Metrics and health
- **BE-15**: Integration Tests (7 hours) - End-to-end scenarios

**Full task list**: `docs/tasks/README.md`

---

## 🔴 TDD Workflow: RED → GREEN → REFACTOR

### Example: BE-01 Task Templates

**Step 1: RED (Write Failing Tests First)**
```bash
# Read the task spec
cat docs/tasks/backend/01_task_templates_service.md

# Create test file
touch src/services/task_templates/tests/test_task_templates_service.py
```

Write tests from the spec:
```python
# src/services/task_templates/tests/test_task_templates_service.py
import pytest
from uuid import uuid4

def test_create_template_success(test_client):
    """RED: Should create a task template with steps."""
    payload = {
        "name": "Homework Assignment",
        "category": "Academic",
        "steps": [
            {"step_order": 1, "description": "Research topic", "estimated_minutes": 5},
            {"step_order": 2, "description": "Write draft", "estimated_minutes": 15}
        ]
    }

    response = test_client.post("/api/v1/task-templates/", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Homework Assignment"
    assert len(data["steps"]) == 2

# Run test - should FAIL (RED)
uv run pytest src/services/task_templates/tests/ -v
```

**Step 2: GREEN (Make It Pass)**
```bash
# Create the implementation files
mkdir -p src/services/task_templates
touch src/services/task_templates/__init__.py
touch src/services/task_templates/models.py
touch src/services/task_templates/repository.py
touch src/services/task_templates/routes.py
```

Implement just enough to pass:
```python
# src/services/task_templates/models.py
from pydantic import BaseModel
from typing import List

class TemplateStepCreate(BaseModel):
    step_order: int
    description: str
    estimated_minutes: int

class TaskTemplateCreate(BaseModel):
    name: str
    category: str
    steps: List[TemplateStepCreate]

# src/services/task_templates/routes.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/task-templates", tags=["task-templates"])

@router.post("/", status_code=201)
async def create_template(template: TaskTemplateCreate):
    # Minimal implementation to pass test
    return {
        "template_id": str(uuid4()),
        "name": template.name,
        "category": template.category,
        "steps": [s.dict() for s in template.steps]
    }
```

```bash
# Run test - should PASS (GREEN)
uv run pytest src/services/task_templates/tests/ -v
```

**Step 3: REFACTOR (Improve Code Quality)**
- Add database integration (repository pattern)
- Add validation (Pydantic validators)
- Extract common logic
- Improve naming
- Keep tests passing!

```bash
# Run tests after each refactor
uv run pytest src/services/task_templates/tests/ -v
```

---

## 📂 Project Structure

```
src/
├── database/
│   ├── models.py           # SQLAlchemy models
│   └── connection.py       # Database connection
├── repository/
│   └── base.py            # BaseRepository pattern
├── services/
│   └── your_service/      # Create this!
│       ├── __init__.py
│       ├── models.py      # Pydantic models
│       ├── repository.py  # Database layer
│       ├── routes.py      # FastAPI routes
│       └── tests/
│           └── test_*.py  # TDD tests
└── main.py                # FastAPI app (register routes here)
```

---

## 🧪 Testing Commands

```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest src/services/task_templates/tests/test_repository.py -v

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Watch mode (re-run on file change)
uv run pytest-watch

# Run only failed tests from last run
uv run pytest --lf
```

---

## ✅ Task Completion Checklist

Before marking your task complete:

- [ ] All tests pass (`uv run pytest`)
- [ ] 95%+ code coverage for your service
- [ ] Linting passes (`uv run ruff check .`)
- [ ] Type checking passes (`uv run mypy src/`)
- [ ] Database migration created (if schema changes)
- [ ] API routes registered in `main.py`
- [ ] Seed data script created (if applicable)
- [ ] Acceptance criteria met (see task spec)

---

## 🔗 Key Files to Reference

### Task Specifications
- **Your task**: `docs/tasks/backend/XX_your_task.md`
- **All backend tasks**: `docs/tasks/backend/`

### Code Standards
- **CLAUDE.md**: Python style guide, TDD workflow, naming conventions
- **Repository pattern**: `src/repository/base.py`
- **Existing models**: `src/database/models.py`
- **Test examples**: `src/agents/tests/` (98.7% coverage!)

### Documentation
- **Full agent entry point**: `docs/AGENT_DEVELOPMENT_ENTRY_POINT.md`
- **Wave execution plan**: `docs/WAVE_EXECUTION_PLAN.md`
- **Human-agent workflow**: `docs/HUMAN_AGENT_WORKFLOW.md`

---

## 🚨 Common Issues

### Database Connection Errors
```bash
# SQLite (default)
export DATABASE_URL="sqlite:///./adhd_app.db"

# PostgreSQL
export DATABASE_URL="postgresql://user:pass@localhost/adhd_app"
```

### Import Errors
```bash
# Make sure you're in venv
source .venv/bin/activate

# Reinstall if needed
uv sync
```

### Test Fixtures Not Found
```python
# Add conftest.py in your tests/ directory
# See existing examples in src/agents/tests/conftest.py
```

---

## 💡 Tips for Success

1. **Read the task spec thoroughly** - It has database schema, models, tests, everything!
2. **Start with ONE test** - Don't write all tests at once
3. **Make it fail first** - Confirm the test actually tests something (RED)
4. **Simplest implementation** - Just make it pass (GREEN)
5. **Then improve** - Refactor with confidence (REFACTOR)
6. **Check coverage often** - `uv run pytest --cov=src/services/your_service`
7. **Commit frequently** - After each RED-GREEN-REFACTOR cycle

---

## 🎯 Your First Task: BE-00

If you're the first developer, **start with BE-00**:

```bash
# 1. Read the spec
cat docs/tasks/backend/00_task_delegation_system.md

# 2. This is DO_WITH_ME mode - coordinate with team
# Human: Design API contracts
# Agent: Implement with TDD

# 3. Create the service structure
mkdir -p src/services/delegation/{tests,}
touch src/services/delegation/{__init__.py,models.py,repository.py,routes.py}
touch src/services/delegation/tests/{__init__.py,test_delegation.py}

# 4. Start with RED
# Write first test in test_delegation.py

# 5. Make it GREEN
# Implement just enough to pass

# 6. REFACTOR
# Improve and repeat
```

**Why BE-00 is critical**: It creates the task delegation system so we can use the app to manage building the app (dogfooding)!

---

## 🌊 Wave-Based Development

You're part of a **wave-based parallel development** system:

- **Wave 1** (Week 1): BE-00 only (foundation)
- **Wave 2** (Weeks 2-3): BE-01 to BE-04 (pick any, they're parallel!)
- **Wave 3** (Weeks 4-5): BE-05 to BE-10 (advanced features)
- **Wave 4** (Weeks 6-7): BE-11 to BE-13 (creature & ML)
- **Wave 6** (Weeks 10-11): BE-14 to BE-15 (quality)

**Check dependencies** in the task spec before starting!

---

**Ready?** Pick a task from `docs/tasks/backend/`, read the spec, and start with RED! 🔴🟢🔵

Questions? Check `docs/AGENT_DEVELOPMENT_ENTRY_POINT.md` or `CLAUDE.md` for detailed guidance.
