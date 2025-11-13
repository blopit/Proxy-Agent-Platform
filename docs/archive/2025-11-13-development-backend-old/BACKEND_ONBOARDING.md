# Backend Developer Onboarding

Welcome to the Proxy Agent Platform backend team! This checklist will guide you through your first week and help you become productive quickly.

## Overview

**Estimated Time**: 1-3 days for complete setup
**Goal**: Have a fully functional development environment and make your first contribution

## Pre-Onboarding (Before Day 1)

### Access & Accounts

- [ ] GitHub account added to organization
- [ ] Access to project repository
- [ ] Slack/Discord workspace access (if applicable)
- [ ] Development environment access (staging, dev databases)
- [ ] API keys for development (OpenAI, Anthropic, etc.)

### Hardware/Software Requirements

- [ ] Development machine meets requirements:
  - macOS, Linux, or Windows with WSL2
  - 8GB+ RAM (16GB recommended)
  - 20GB+ free disk space
  - Internet connection

---

## Day 1: Setup & Orientation

### Morning: Environment Setup (2-3 hours)

#### 1. Install Prerequisites

**Python 3.11+**
```bash
# macOS (using Homebrew)
brew install python@3.11

# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv

# Windows (WSL2)
sudo apt update
sudo apt install python3.11 python3.11-venv

# Verify
python3.11 --version
```
- [ ] Python 3.11+ installed
- [ ] Verify with `python3.11 --version`

**UV Package Manager**
```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify
uv --version
```
- [ ] UV installed
- [ ] Verify with `uv --version`

**PostgreSQL**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt install postgresql-15

# Verify
psql --version
```
- [ ] PostgreSQL installed
- [ ] PostgreSQL service running
- [ ] Can connect with `psql postgres`

**Git**
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt install git

# Configure
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```
- [ ] Git installed
- [ ] Git configured with name and email

#### 2. Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/proxy-agent-platform.git
cd proxy-agent-platform

# Verify
ls -la
```
- [ ] Repository cloned
- [ ] Can see `src/`, `docs/`, `tests/` directories

#### 3. Set Up Python Environment

```bash
# Create virtual environment
uv venv

# Activate (macOS/Linux)
source .venv/bin/activate

# Activate (Windows WSL2)
source .venv/bin/activate

# Install dependencies
uv sync

# Verify
which python  # Should point to .venv/bin/python
```
- [ ] Virtual environment created
- [ ] Virtual environment activated
- [ ] Dependencies installed
- [ ] Python points to `.venv/bin/python`

#### 4. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Minimum .env configuration**:
```bash
# Database (use SQLite for local development)
DATABASE_URL=sqlite:///./proxy_agent.db

# Redis (optional for local dev)
REDIS_URL=redis://localhost:6379

# AI Provider (get from team lead)
OPENAI_API_KEY=sk-your-key-here

# Application
DEBUG=true
SECRET_KEY=your-secret-key-for-development
```

- [ ] `.env` file created
- [ ] Database URL configured
- [ ] At least one AI provider API key configured
- [ ] Secret key set

#### 5. Initialize Database

```bash
# Run migrations
uv run alembic upgrade head

# Verify
uv run alembic current

# Optional: seed test data
uv run python src/database/seed_data.py
```
- [ ] Database migrations applied
- [ ] Current migration version shown
- [ ] Test data seeded (optional)

#### 6. Run Tests

```bash
# Run all tests
uv run pytest

# Should see all tests passing
```
- [ ] All tests run successfully
- [ ] No test failures
- [ ] Tests complete in reasonable time (< 30 seconds)

**If tests fail**: Don't panic! Common issues:
- Database not initialized: `uv run alembic upgrade head`
- Missing dependencies: `uv sync`
- Environment variables: Check `.env` file

#### 7. Start Development Server

```bash
# Terminal 1: Start backend server
uv run uvicorn src.api.main:app --reload --port 8000

# Should see:
# INFO:     Uvicorn running on http://127.0.0.1:8000
```
- [ ] Server starts without errors
- [ ] Can access http://localhost:8000
- [ ] See "Uvicorn running" message

#### 8. Test API

```bash
# Terminal 2: Test API endpoints
curl http://localhost:8000/api/v1/health

# Should return: {"status":"healthy"}

# Or open in browser
open http://localhost:8000/docs
```
- [ ] Health endpoint returns success
- [ ] Swagger UI accessible at http://localhost:8000/docs
- [ ] Can see all API endpoints in docs

**Checkpoint**: You now have a working development environment! 🎉

---

### Afternoon: Codebase Orientation (2-3 hours)

#### 9. Read Essential Documentation

**Priority 1 (Must Read Today)**:
- [ ] [README.md](README.md) - 15 minutes - Project overview
- [ ] [CLAUDE.md](CLAUDE.md) - 30 minutes - **CRITICAL: Development standards**
- [ ] [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) - 20 minutes - Naming standards

**Priority 2 (Read Today)**:
- [ ] [BACKEND_GUIDE.md](BACKEND_GUIDE.md) - 30 minutes - Backend architecture
- [ ] [docs/TECH_STACK.md](docs/TECH_STACK.md) - 15 minutes - Technology decisions

**Priority 3 (Read This Week)**:
- [ ] [BACKEND_RESOURCES.md](BACKEND_RESOURCES.md) - Reference material
- [ ] [docs/architecture/system-overview.md](docs/architecture/system-overview.md) - System architecture
- [ ] [docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md) - API documentation

#### 10. Explore the Codebase

```bash
# View project structure
ls -la src/

# Key directories to understand
ls -la src/api/        # API endpoints
ls -la src/agents/     # AI agents
ls -la src/services/   # Business logic
ls -la src/repositories/  # Data access
ls -la src/core/       # Domain models
ls -la src/database/   # Database layer
```

**Scavenger Hunt** (helps you navigate the code):
- [ ] Find the main FastAPI app: `src/api/main.py`
- [ ] Find task creation endpoint: `src/api/routes/tasks.py`
- [ ] Find task model: `src/core/task_models.py`
- [ ] Find task repository: `src/repositories/task_repository.py`
- [ ] Find task service: `src/services/task_service.py`
- [ ] Find task tests: `src/services/tests/test_task_service.py`

#### 11. Run Your First Commands

```bash
# Format code
uv run ruff format .

# Check linting
uv run ruff check .

# Type check
uv run mypy src/

# View database
uv run alembic current
```
- [ ] Ruff format runs without errors
- [ ] Ruff check runs without errors
- [ ] MyPy runs (may have some warnings - that's okay)
- [ ] Alembic shows current migration version

#### 12. Set Up Your IDE

**VSCode** (Recommended):
```bash
# Install recommended extensions
code --install-extension ms-python.python
code --install-extension charliermarsh.ruff
code --install-extension ms-python.mypy-type-checker

# Open project
code .
```

- [ ] Python extension installed
- [ ] Ruff extension installed
- [ ] MyPy extension installed
- [ ] Python interpreter points to `.venv/bin/python`
- [ ] Format on save enabled

**PyCharm**:
- [ ] Open project
- [ ] Set Python interpreter to `.venv/bin/python`
- [ ] Enable Ruff as formatter
- [ ] Configure Pytest as test runner

---

## Day 2: First Contribution

### Morning: Learn by Example (2 hours)

#### 13. Understand the Architecture

Read and trace through a complete feature:

**Example: Task Creation Flow**

1. **API Endpoint** (`src/api/routes/tasks.py`):
   ```python
   @router.post("/", response_model=TaskResponse)
   async def create_task(...):
   ```
   - [ ] Find the endpoint
   - [ ] Understand request validation
   - [ ] See how dependencies are injected

2. **Service Layer** (`src/services/task_service.py`):
   ```python
   class TaskService:
       async def create_task(...):
   ```
   - [ ] Find the service method
   - [ ] Understand business logic
   - [ ] See how it coordinates repositories

3. **Repository Layer** (`src/repositories/task_repository.py`):
   ```python
   class TaskRepository(BaseRepository[Task]):
       def create(self, task: Task) -> Task:
   ```
   - [ ] Find the repository
   - [ ] Understand data access
   - [ ] See how it uses BaseRepository

4. **Model** (`src/core/task_models.py`):
   ```python
   class Task(BaseModel):
       task_id: UUID
       title: str
   ```
   - [ ] Find the model
   - [ ] Understand validation
   - [ ] See Pydantic in action

5. **Tests** (`src/services/tests/test_task_service.py`):
   ```python
   def test_create_task_with_valid_data():
   ```
   - [ ] Find the tests
   - [ ] Understand test structure
   - [ ] See TDD in practice

**Exercise**: Draw a diagram showing the flow from API → Service → Repository → Database

#### 14. Write Your First Test

Follow TDD process:

```bash
# Create a test file (or use existing)
# src/services/tests/test_my_first_feature.py
```

```python
import pytest
from uuid import uuid4
from src.core.task_models import Task, TaskStatus

def test_my_first_test():
    """My first test - verify I can create a task object."""
    # Arrange
    task_id = uuid4()
    user_id = uuid4()

    # Act
    task = Task(
        task_id=task_id,
        user_id=user_id,
        title="My First Task",
        status=TaskStatus.PENDING
    )

    # Assert
    assert task.task_id == task_id
    assert task.user_id == user_id
    assert task.title == "My First Task"
    assert task.status == TaskStatus.PENDING
```

```bash
# Run your test
uv run pytest src/services/tests/test_my_first_feature.py -v
```

- [ ] Test file created
- [ ] Test written with Arrange-Act-Assert pattern
- [ ] Test runs and passes
- [ ] Understand test output

### Afternoon: Make Your First Change (2-3 hours)

#### 15. Pick a Starter Issue

Find a "good first issue" or create a simple improvement:

**Suggestions**:
1. Add a new field to an existing model
2. Add a new query method to a repository
3. Add a new validation rule
4. Improve documentation
5. Add a new test case

**For this onboarding**:
Let's add a `notes` field to the Task model:

```bash
# Create feature branch
git checkout -b onboarding/add-task-notes-field
```
- [ ] Feature branch created
- [ ] Branch name follows convention: `onboarding/description`

#### 16. Follow TDD Process

**Step 1: Write the Test (RED)**

```python
# src/core/tests/test_task_models.py

def test_task_can_have_optional_notes():
    """Test that tasks can have optional notes field."""
    task = Task(
        user_id=uuid4(),
        title="Test Task",
        notes="These are my notes"
    )
    assert task.notes == "These are my notes"

def test_task_notes_default_to_none():
    """Test that notes default to None if not provided."""
    task = Task(
        user_id=uuid4(),
        title="Test Task"
    )
    assert task.notes is None
```

```bash
# Run test - should FAIL
uv run pytest src/core/tests/test_task_models.py::test_task_can_have_optional_notes -v
```
- [ ] Test written
- [ ] Test fails (expected)

**Step 2: Make it Pass (GREEN)**

```python
# src/core/task_models.py

class Task(BaseModel):
    task_id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    title: str
    description: str | None = None
    notes: str | None = None  # <-- Add this line
    status: TaskStatus = TaskStatus.PENDING
    # ... rest of fields
```

```bash
# Run test - should PASS
uv run pytest src/core/tests/test_task_models.py::test_task_can_have_optional_notes -v
```
- [ ] Code changed
- [ ] Test passes

**Step 3: Create Database Migration**

```bash
# Create migration
uv run alembic revision -m "add_notes_field_to_tasks"
```

Edit the generated file:
```python
# src/database/migrations/versions/xxxx_add_notes_field_to_tasks.py

def upgrade():
    op.add_column('tasks', sa.Column('notes', sa.String(), nullable=True))

def downgrade():
    op.drop_column('tasks', 'notes')
```

```bash
# Apply migration
uv run alembic upgrade head

# Verify
uv run alembic current
```
- [ ] Migration created
- [ ] Migration applied
- [ ] Database updated

**Step 4: Run All Tests**

```bash
# Run entire test suite
uv run pytest

# Should still pass
```
- [ ] All tests pass
- [ ] No regressions

**Step 5: Format and Lint**

```bash
# Format code
uv run ruff format .

# Fix linting issues
uv run ruff check --fix .

# Type check
uv run mypy src/
```
- [ ] Code formatted
- [ ] No linting errors
- [ ] Type checking passes

#### 17. Commit Your Changes

```bash
# Check status
git status

# Add files
git add src/core/task_models.py
git add src/core/tests/test_task_models.py
git add src/database/migrations/versions/

# Commit with proper format
git commit -m "feat(tasks): add optional notes field to Task model

Add notes field to support user annotations on tasks.
Includes database migration and tests.

Closes #onboarding"

# Push to your branch
git push origin onboarding/add-task-notes-field
```
- [ ] Changes committed
- [ ] Commit message follows format
- [ ] Changes pushed to remote

#### 18. Create Pull Request

1. Go to GitHub repository
2. Click "Pull Requests" → "New Pull Request"
3. Select your branch
4. Fill in PR template:

```markdown
## Description
Add optional `notes` field to Task model to allow users to add annotations.

## Changes
- Added `notes` field to Task model
- Added database migration for `notes` column
- Added tests for notes field

## Testing
- [ ] Tests pass locally
- [ ] Database migration runs successfully
- [ ] Code formatted and linted

## Checklist
- [x] Followed TDD process
- [x] Tests written and passing
- [x] Code formatted with Ruff
- [x] Database migration included
- [x] Documentation updated (if needed)
```

- [ ] Pull request created
- [ ] PR description filled out
- [ ] Tests are passing in CI
- [ ] Requested review from team lead

**Checkpoint**: You've made your first contribution! 🎉

---

## Day 3-5: Deep Dive

### 19. Deep Dive into Core Concepts

**Day 3: Repository Pattern**
- [ ] Read `src/repositories/base_repository.py`
- [ ] Understand how auto-derivation works
- [ ] Review existing repositories
- [ ] Understand entity-specific primary keys
- [ ] Write a test using a repository

**Day 4: Service Layer**
- [ ] Read multiple service files
- [ ] Understand business logic organization
- [ ] See how services coordinate repositories
- [ ] Understand async patterns
- [ ] Write a test for a service method

**Day 5: Agents (PydanticAI)**
- [ ] Read `src/agents/base.py`
- [ ] Understand agent pattern
- [ ] Review existing agents
- [ ] Understand system prompts
- [ ] Run an agent locally

### 20. Make Meaningful Contributions

**Week 1 Goals**:
- [ ] Complete at least 2-3 small PRs
- [ ] Review code from other developers
- [ ] Participate in code review discussions
- [ ] Ask questions when stuck
- [ ] Update documentation if you find gaps

**Suggested Tasks**:
1. Add a new API endpoint (following existing patterns)
2. Add a new repository method
3. Improve test coverage
4. Add validation to a model
5. Fix a bug (start with "good first issue" label)

---

## Week 1 Checklist Summary

### Setup Complete
- [ ] Development environment fully functional
- [ ] Can run tests, server, and database
- [ ] IDE configured properly
- [ ] All essential docs read

### Knowledge Acquired
- [ ] Understand project architecture
- [ ] Know TDD workflow
- [ ] Familiar with naming conventions
- [ ] Can navigate codebase confidently

### First Contributions
- [ ] Made first commit
- [ ] Created first PR
- [ ] PR merged (or pending review)
- [ ] Comfortable with git workflow

### Team Integration
- [ ] Met team members
- [ ] Joined communication channels
- [ ] Know who to ask for help
- [ ] Understand review process

---

## Common Pitfalls & Solutions

### Issue: Virtual Environment Not Activated
**Symptom**: `python` points to system Python
**Solution**:
```bash
source .venv/bin/activate
which python  # Should show .venv path
```

### Issue: Database Migration Errors
**Symptom**: Migration fails or out of sync
**Solution**:
```bash
# Check current state
uv run alembic current

# Reset and reapply
uv run alembic downgrade base
uv run alembic upgrade head
```

### Issue: Tests Failing
**Symptom**: Tests that should pass are failing
**Solutions**:
```bash
# Clear pytest cache
uv run pytest --cache-clear

# Run specific test with output
uv run pytest path/to/test.py::test_name -v -s

# Check database state
uv run alembic current
```

### Issue: Import Errors
**Symptom**: `ModuleNotFoundError`
**Solution**:
```bash
# Ensure venv is activated
source .venv/bin/activate

# Reinstall dependencies
uv sync

# Check PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Issue: API Server Won't Start
**Symptom**: Errors when running uvicorn
**Solutions**:
```bash
# Check port is free
lsof -i :8000

# Check .env file exists
cat .env

# Check database is accessible
uv run alembic current
```

---

## Getting Help

### Resources
1. **Documentation**: Start with docs listed above
2. **Code Examples**: Search codebase for patterns
3. **Tests**: Tests often show usage examples
4. **Git History**: `git log -p filename` shows why code was written

### Who to Ask
- **Architecture Questions**: Team Lead
- **Test Questions**: QA Lead
- **DevOps Questions**: DevOps Engineer
- **Domain Questions**: Product Owner
- **Stuck on Anything**: Don't hesitate to ask!

### Communication Channels
- **Slack/Discord**: Day-to-day questions
- **GitHub Discussions**: Technical discussions
- **GitHub Issues**: Bug reports, feature requests
- **Pull Requests**: Code review questions

---

## Next Steps After Onboarding

### Week 2-4: Build Expertise
- [ ] Take on medium-sized features
- [ ] Start reviewing other PRs
- [ ] Contribute to documentation
- [ ] Help onboard next new developer

### Month 2-3: Become Productive
- [ ] Own complete features end-to-end
- [ ] Participate in architecture discussions
- [ ] Mentor new developers
- [ ] Contribute to project improvements

### Month 4+: Senior Contributor
- [ ] Lead feature development
- [ ] Make architectural decisions
- [ ] Review major changes
- [ ] Shape project direction

---

## Onboarding Feedback

After completing onboarding, please provide feedback:

**What Went Well**:
-

**What Could Be Better**:
-

**Suggestions for Future Onboarding**:
-

**Time Spent**:
- Setup: ___ hours
- Documentation: ___ hours
- First contribution: ___ hours
- Total: ___ hours

---

**Welcome to the team! We're excited to have you. Don't hesitate to ask questions - we're here to help you succeed!**

*Last updated: 2025-10-25*
