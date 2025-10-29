# Backend Developer Onboarding Guide

**Welcome to the Proxy Agent Platform Backend Team!** 🎉

This guide will get you from zero to productive in **under 2 hours**.

---

## Table of Contents

- [Day 1: Environment Setup (30 min)](#day-1-environment-setup-30-min)
- [Day 1: First Code Contribution (1 hour)](#day-1-first-code-contribution-1-hour)
- [Week 1: Core Concepts](#week-1-core-concepts)
- [Week 2: Advanced Topics](#week-2-advanced-topics)
- [Reference Materials](#reference-materials)

---

## Day 1: Environment Setup (30 min)

### Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Python 3.11+** installed (`python --version`)
- [ ] **Git** configured with SSH keys
- [ ] **UV** package manager installed
- [ ] **PostgreSQL 13+** or **SQLite** for local dev
- [ ] **Code editor** (VS Code, PyCharm, or similar)
- [ ] **Terminal** (iTerm2, Warp, or built-in)

---

### Step 1: Clone Repository (2 min)

```bash
# Clone via SSH (recommended)
git clone git@github.com:yourusername/proxy-agent-platform.git
cd proxy-agent-platform

# Or via HTTPS
git clone https://github.com/yourusername/proxy-agent-platform.git
cd proxy-agent-platform
```

---

### Step 2: Install UV (2 min)

UV is our blazing-fast Python package manager (10-100x faster than pip).

```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify installation
uv --version
```

---

### Step 3: Setup Python Environment (5 min)

```bash
# Create virtual environment
uv venv

# Activate virtual environment
# macOS/Linux:
source .venv/bin/activate

# Windows:
.venv\Scripts\activate

# Install all dependencies
uv sync

# Install development dependencies
uv sync --group dev
```

**Expected output**:
```
✓ Created virtual environment
✓ Installed 67 packages
```

---

### Step 4: Configure Environment Variables (3 min)

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your editor
```

**Minimal .env for local development**:
```bash
# Database (SQLite for local dev)
DATABASE_URL=sqlite:///./proxy_agents_enhanced.db

# AI Providers (at least one required)
OPENAI_API_KEY=sk-your-key-here
# ANTHROPIC_API_KEY=your-key-here  # Optional
# GOOGLE_API_KEY=your-key-here     # Optional

# Application
DEBUG=true
SECRET_KEY=your-secret-key-change-in-production
```

---

### Step 5: Initialize Database (5 min)

```bash
# Initialize database with latest schema
uv run python -c "from src.database.connection import init_db; init_db()"

# Verify database created
ls -lh *.db

# Expected output:
# proxy_agents_enhanced.db
```

**Optional**: Seed sample data

```bash
uv run python src/database/seed_data.py
```

---

### Step 6: Run Tests (5 min)

```bash
# Run full test suite
uv run pytest

# Expected output:
# ===== XX passed in X.XXs =====
```

**If tests fail**, check:
- Virtual environment is activated
- Dependencies installed (`uv sync`)
- Database initialized

---

### Step 7: Start Development Server (3 min)

```bash
# Start FastAPI server with hot reload
uv run uvicorn src.api.main:app --reload --port 8000

# Expected output:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

**Verify it works**:

Open browser to:
- http://localhost:8000 - API root
- http://localhost:8000/docs - Swagger UI
- http://localhost:8000/health - Health check

---

### Step 8: Configure Your Editor (5 min)

#### VS Code Setup

Install recommended extensions:

```bash
# Install extensions (if using VS Code)
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension charliermarsh.ruff
code --install-extension tamasfe.even-better-toml
```

**Workspace settings** (`.vscode/settings.json`):
```json
{
  "python.defaultInterpreterPath": ".venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "python.formatting.provider": "ruff",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### PyCharm Setup

1. **File** → **Settings** → **Project** → **Python Interpreter**
2. Select `.venv/bin/python`
3. Enable **Ruff** for linting
4. Enable **Format on save**

---

### Checkpoint ✅

You should now have:

- [x] Repository cloned
- [x] UV installed
- [x] Virtual environment activated
- [x] Dependencies installed
- [x] Environment variables configured
- [x] Database initialized
- [x] Tests passing
- [x] Dev server running
- [x] Editor configured

**Total time**: ~30 minutes

---

## Day 1: First Code Contribution (1 hour)

### Your First Task: Add a Health Check Enhancement

**Goal**: Add a database health check to the `/health` endpoint.

**Estimated time**: 60 minutes (including learning)

---

### Step 1: Understand the Current Code (10 min)

**Read**: `src/api/main.py` - Find the `/health` endpoint

```python
@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}
```

**Current behavior**: Always returns `{"status": "healthy"}`

**Your task**: Add database connectivity check.

---

### Step 2: Write the Test First (TDD) (15 min)

Create or edit: `src/api/tests/test_health.py`

```python
"""Tests for health check endpoint"""
import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_health_endpoint_returns_healthy_when_db_connected():
    """
    Test that health endpoint returns healthy status when database is connected.

    RED phase: This test will fail because we haven't implemented it yet.
    """
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "healthy"
    assert "database" in data
    assert data["database"]["connected"] is True
    assert "version" in data["database"]


def test_health_endpoint_includes_timestamp():
    """Test that health check includes current timestamp."""
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()

    assert "timestamp" in data
    assert isinstance(data["timestamp"], str)
```

**Run the test** (it should fail):
```bash
uv run pytest src/api/tests/test_health.py -v

# Expected: FAILED (database key not in response)
```

---

### Step 3: Implement the Feature (GREEN) (20 min)

Edit: `src/api/main.py`

```python
from datetime import datetime, timezone
from src.database.connection import get_db_session

@app.get("/health")
async def health():
    """
    Health check endpoint with database connectivity test.

    Returns:
        Health status including database connectivity
    """
    # Check database connectivity
    db_connected = False
    db_version = None

    try:
        # Test database connection
        db = next(get_db_session())
        # Query database version (works for both PostgreSQL and SQLite)
        result = db.execute("SELECT 1").scalar()
        db_connected = result == 1
        db_version = "sqlite" if "sqlite" in str(db.bind.url) else "postgresql"
        db.close()
    except Exception as e:
        print(f"Database health check failed: {e}")
        db_connected = False

    return {
        "status": "healthy" if db_connected else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "connected": db_connected,
            "version": db_version
        }
    }
```

**Run the test** (it should pass):
```bash
uv run pytest src/api/tests/test_health.py -v

# Expected: PASSED
```

---

### Step 4: Refactor (15 min)

Extract database check to a service:

Create: `src/services/health_service.py`

```python
"""Health check service"""
from typing import Dict, Any
from src.database.connection import get_db_session


class HealthService:
    """Service for system health checks"""

    @staticmethod
    def check_database() -> Dict[str, Any]:
        """
        Check database connectivity.

        Returns:
            Dictionary with connection status and version
        """
        try:
            db = next(get_db_session())
            result = db.execute("SELECT 1").scalar()
            connected = result == 1
            version = "sqlite" if "sqlite" in str(db.bind.url) else "postgresql"
            db.close()

            return {
                "connected": connected,
                "version": version
            }
        except Exception as e:
            return {
                "connected": False,
                "version": None,
                "error": str(e)
            }
```

Update: `src/api/main.py`

```python
from datetime import datetime, timezone
from src.services.health_service import HealthService

health_service = HealthService()

@app.get("/health")
async def health():
    """
    Health check endpoint with database connectivity test.

    Returns:
        Health status including database connectivity
    """
    db_status = health_service.check_database()

    return {
        "status": "healthy" if db_status["connected"] else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_status
    }
```

**Run tests again**:
```bash
uv run pytest src/api/tests/test_health.py -v

# Expected: PASSED
```

---

### Step 5: Format and Lint (5 min)

```bash
# Format code
uv run ruff format .

# Check linting
uv run ruff check .

# Fix auto-fixable issues
uv run ruff check --fix .

# Type checking
uv run mypy src/services/health_service.py
```

---

### Step 6: Commit Your Changes (5 min)

```bash
# Check what changed
git status

# Add your changes
git add src/api/main.py
git add src/api/tests/test_health.py
git add src/services/health_service.py

# Commit with descriptive message
git commit -m "feat(health): add database connectivity check

- Add HealthService for database health checks
- Update /health endpoint to include DB status
- Add tests for health endpoint
- Extract health logic to service layer

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to your feature branch
git push origin feature/health-check-enhancement
```

---

### Checkpoint ✅

You've completed your first contribution! 🎉

- [x] Wrote tests first (TDD RED phase)
- [x] Implemented feature (GREEN phase)
- [x] Refactored code (REFACTOR phase)
- [x] Formatted and linted code
- [x] Committed changes with good message
- [x] Pushed to remote branch

**Next**: Create a pull request and get code review!

---

## Week 1: Core Concepts

### Day 2: Repository Pattern

**Read**: `src/repositories/enhanced_repositories.py`

**Task**: Create a simple repository for a new entity

**Time**: 1 hour

---

### Day 3: Service Layer

**Read**: `src/services/task_service_v2.py`

**Task**: Add a new service method

**Time**: 1 hour

---

### Day 4: API Routes

**Read**: `src/api/routes/tasks_v2.py`

**Task**: Add a new API endpoint

**Time**: 1 hour

---

### Day 5: PydanticAI Agents

**Read**: `src/agents/task_agent.py`

**Task**: Create a simple AI agent

**Time**: 2 hours

---

## Week 2: Advanced Topics

### Day 6: Database Migrations

**Read**: `src/database/migrations/`

**Task**: Create and apply a migration

**Time**: 1 hour

---

### Day 7: WebSocket Real-time

**Read**: `src/api/websocket.py`

**Task**: Add a WebSocket event

**Time**: 2 hours

---

### Day 8: Testing Strategies

**Read**: `docs/testing/TESTING_STRATEGY.md`

**Task**: Write integration tests

**Time**: 2 hours

---

### Day 9: Performance Optimization

**Read**: `src/services/database_optimizer.py`

**Task**: Optimize a slow query

**Time**: 2 hours

---

### Day 10: Code Review

**Read**: Pull requests from team members

**Task**: Review 2-3 PRs with thoughtful feedback

**Time**: 2 hours

---

## Reference Materials

### Essential Reading (Priority Order)

1. **[CLAUDE.md](../../CLAUDE.md)** - Development standards (MUST READ)
2. **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)** - System architecture
3. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database schema
4. **[API_COMPLETE_REFERENCE.md](./API_COMPLETE_REFERENCE.md)** - API documentation
5. **[NAMING_CONVENTIONS.md](../design/NAMING_CONVENTIONS.md)** - Naming standards

### Code Examples

**Repository Example**:
```python
from src.repositories.enhanced_repositories import BaseRepository
from src.core.models import Task

class TaskRepository(BaseRepository[Task]):
    def __init__(self):
        super().__init__()  # Auto-derives "tasks" and "task_id"
```

**Service Example**:
```python
class TaskService:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    async def create_task(self, request: TaskCreate) -> Task:
        # Business logic here
        return self.task_repo.create(task)
```

**API Route Example**:
```python
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api/v2/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse)
async def create_task(
    request: TaskCreate,
    service: TaskService = Depends(get_task_service)
):
    return await service.create_task(request)
```

---

### Common Commands

```bash
# Development
uv run uvicorn src.api.main:app --reload --port 8000

# Testing
uv run pytest                        # All tests
uv run pytest src/api/tests/         # API tests only
uv run pytest -v                     # Verbose
uv run pytest --cov=src              # With coverage
uv run pytest -k test_health         # Specific test

# Code Quality
uv run ruff format .                 # Format
uv run ruff check .                  # Lint
uv run ruff check --fix .            # Auto-fix
uv run mypy src/                     # Type check

# Database
uv run alembic upgrade head          # Apply migrations
uv run alembic revision -m "..."     # Create migration
uv run alembic downgrade -1          # Rollback one

# Dependencies
uv add requests                      # Add package
uv add --dev pytest                  # Add dev package
uv sync                              # Install all
```

---

### Getting Help

1. **Check documentation first**:
   - [docs/backend/](.)
   - [docs/api/](../api/)
   - [docs/development/](../development/)

2. **Search codebase**:
   ```bash
   # Find similar implementations
   rg "class.*Repository" src/

   # Find usage examples
   rg "TaskService" src/
   ```

3. **Ask the team**:
   - Slack: #backend-dev
   - GitHub Discussions
   - Team standups

4. **Debugging**:
   ```python
   # Add breakpoint
   import ipdb; ipdb.set_trace()

   # Print debug info
   print(f"Debug: {variable}")
   ```

---

## Next Steps After Onboarding

### Week 3: Pick Your First Real Task

Browse the task board and pick a task labeled:
- `good-first-issue`
- `backend`
- `help-wanted`

### Week 4: Implement Task Delegation System

**Epic Task**: [BE-00: Task Delegation System](../tasks/backend/00_task_delegation_system.md)

This is the **foundation** for the entire backend:
- Build the 4D delegation model (DO/DO_WITH_ME/DELEGATE/DELETE)
- Implement agent assignment system
- Create task delegation API
- Write comprehensive tests

**Estimated time**: 8-10 hours
**Priority**: CRITICAL
**Status**: Not started

---

## Welcome Again! 🚀

You're now ready to contribute to the Proxy Agent Platform backend!

**Questions?** Reach out to the team or check the docs.

**Happy coding!** 💻
