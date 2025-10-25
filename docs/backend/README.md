# Backend Documentation Hub

Central hub for all backend development documentation for the Proxy Agent Platform.

## 🚀 Quick Start

**New to the backend team?** Start here:

1. **[Backend Onboarding](../../BACKEND_ONBOARDING.md)** - Complete setup guide for new developers
2. **[CLAUDE.md](../../CLAUDE.md)** - Development standards and philosophy (CRITICAL READ)
3. **[Backend Guide](../../BACKEND_GUIDE.md)** - Comprehensive backend developer guide
4. **[Naming Conventions](../../NAMING_CONVENTIONS.md)** - Naming standards across the stack

**Estimated time**: 1-3 days to complete onboarding and make your first contribution.

---

## 📚 Documentation Index

### Essential Documentation

**Must read for all backend developers:**

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| [BACKEND_ONBOARDING.md](../../BACKEND_ONBOARDING.md) | Complete onboarding checklist | 1-3 days |
| [CLAUDE.md](../../CLAUDE.md) | Development standards, TDD, style guide | 30 min |
| [BACKEND_GUIDE.md](../../BACKEND_GUIDE.md) | Architecture, patterns, workflows | 45 min |
| [NAMING_CONVENTIONS.md](../../NAMING_CONVENTIONS.md) | Naming standards for all code | 20 min |
| [BACKEND_RESOURCES.md](../../BACKEND_RESOURCES.md) | Tools, libraries, learning resources | Reference |

### Architecture Documentation

**Understand the system design:**

| Document | Description |
|----------|-------------|
| [System Overview](../architecture/system-overview.md) | High-level architecture and design principles |
| [Tech Stack](../TECH_STACK.md) | Technology decisions (LOCKED) |
| [Repository Structure](../REPOSITORY_STRUCTURE.md) | Codebase organization |

### API Documentation

**Working with APIs:**

| Document | Description |
|----------|-------------|
| [API Documentation](../api/README.md) | API overview and quick links |
| [API Reference](../api/API_REFERENCE.md) | Complete endpoint documentation (86 endpoints) |
| [OpenAPI Spec](../api/openapi.yaml) | Machine-readable API specification |

### Component Documentation

**Deep dives into specific systems:**

| Component | Documentation |
|-----------|---------------|
| **Agents** | [src/agents/README.md](../../src/agents/README.md) |
| **Memory** | [src/memory/README.md](../../src/memory/README.md) |
| **Database** | See Database section below |
| **API Routes** | See API Documentation above |

---

## 🏗️ Backend Architecture

### Layer Overview

```
┌─────────────────────────────────────────────────┐
│              API Layer (FastAPI)                │
│  - REST endpoints                               │
│  - WebSocket handlers                           │
│  - Request validation                           │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│           Services Layer                        │
│  - Business logic                               │
│  - Workflow orchestration                       │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│          Agents Layer (PydanticAI)              │
│  - AI-powered processing                        │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│       Repositories Layer                        │
│  - Data access abstraction                      │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│         Database Layer                          │
│  - PostgreSQL / SQLite                          │
└─────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── api/                      # HTTP API Layer
│   ├── main.py              # FastAPI application
│   ├── routes/              # API endpoints
│   └── tests/               # API tests
│
├── agents/                   # AI Agents Layer
│   ├── base.py              # Base agent interface
│   ├── *_proxy.py           # Agent implementations
│   └── tests/               # Agent tests
│
├── services/                 # Business Logic Layer
│   ├── *_service.py         # Service implementations
│   └── tests/               # Service tests
│
├── repositories/             # Data Access Layer
│   ├── base_repository.py   # Generic repository
│   ├── *_repository.py      # Repository implementations
│   └── tests/               # Repository tests
│
├── core/                     # Core Domain Models
│   ├── models.py            # Shared models
│   ├── *_models.py          # Domain models
│   ├── settings.py          # Configuration
│   └── tests/               # Model tests
│
├── database/                 # Database Layer
│   ├── adapter.py           # Database connection
│   ├── migrations/          # Alembic migrations
│   └── tests/               # Database tests
│
└── memory/                   # Memory & Context
    ├── client.py            # Memory client
    └── tests/               # Memory tests
```

---

## 🛠️ Development Setup

### Prerequisites

- Python 3.11+
- UV package manager
- PostgreSQL 13+ (or SQLite for local dev)
- Git

### Quick Setup

```bash
# Clone repository
git clone https://github.com/yourusername/proxy-agent-platform.git
cd proxy-agent-platform

# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create environment and install dependencies
uv venv
source .venv/bin/activate
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Initialize database
uv run alembic upgrade head

# Run tests
uv run pytest

# Start dev server
uv run uvicorn src.api.main:app --reload --port 8000
```

See [BACKEND_ONBOARDING.md](../../BACKEND_ONBOARDING.md) for detailed setup instructions.

---

## 📖 Core Concepts

### 1. Repository Pattern

All data access goes through repositories extending `BaseRepository`:

```python
class TaskRepository(BaseRepository[Task]):
    """Repository for task data access."""
    def __init__(self):
        super().__init__()  # Auto-derives table and primary key
```

**Learn more**: [BACKEND_GUIDE.md - Repository Pattern](../../BACKEND_GUIDE.md#1-repository-pattern)

### 2. Service Layer Pattern

Business logic is centralized in service classes:

```python
class TaskService:
    """Service for task management."""
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    async def create_task(self, request: TaskCreateRequest) -> Task:
        # Business logic here
        pass
```

**Learn more**: [BACKEND_GUIDE.md - Service Layer](../../BACKEND_GUIDE.md#2-service-layer-pattern)

### 3. Dependency Injection

FastAPI's DI system for clean, testable code:

```python
@router.post("/tasks")
async def create_task(
    service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    return await service.create_task(request)
```

**Learn more**: [BACKEND_GUIDE.md - Dependency Injection](../../BACKEND_GUIDE.md#3-dependency-injection)

### 4. Agent Pattern (PydanticAI)

AI agents for intelligent processing:

```python
agent = Agent(
    model="openai:gpt-4",
    system_prompt="You are a task processing assistant."
)
result = await agent.run("Break down this task")
```

**Learn more**: [BACKEND_GUIDE.md - Agent Pattern](../../BACKEND_GUIDE.md#4-agent-pattern-pydanticai)

### 5. Test-Driven Development

Strict TDD workflow:

1. Write test (RED)
2. Make it pass (GREEN)
3. Refactor (REFACTOR)

**Learn more**: [CLAUDE.md - TDD Section](../../CLAUDE.md#-testing-strategy)

---

## 🗄️ Database

### Schema Management

- **Migrations**: Alembic for version control
- **Naming**: Entity-specific primary keys (`task_id`, `user_id`)
- **Conventions**: See [NAMING_CONVENTIONS.md](../../NAMING_CONVENTIONS.md#database-naming-standards)

### Common Commands

```bash
# Create migration
uv run alembic revision -m "add_new_table"

# Apply migrations
uv run alembic upgrade head

# Rollback
uv run alembic downgrade -1

# View history
uv run alembic history
```

### Database Patterns

**Entity-Specific Primary Keys**:
```sql
tasks.task_id UUID PRIMARY KEY
users.user_id UUID PRIMARY KEY
sessions.session_id UUID PRIMARY KEY
```

**Foreign Keys**:
```sql
task_id REFERENCES tasks(task_id)
user_id REFERENCES users(user_id)
```

**Timestamps**:
```sql
created_at, updated_at, completed_at
```

---

## 🧪 Testing

### Test Strategy

- **Target Coverage**: 80%+ code coverage
- **Methodology**: Test-Driven Development (TDD)
- **Framework**: Pytest with pytest-asyncio
- **Location**: Tests next to code they test

### Running Tests

```bash
# All tests
uv run pytest

# Specific file
uv run pytest src/services/tests/test_task_service.py

# With coverage
uv run pytest --cov=src --cov-report=html

# Parallel execution
uv run pytest -n auto

# Watch mode
uv run pytest-watch
```

### Writing Tests

```python
import pytest
from uuid import uuid4

def test_user_can_create_task_with_valid_data():
    """Test that users can create tasks with valid data."""
    # Arrange
    user_id = uuid4()
    request = TaskCreateRequest(title="Test Task")

    # Act
    task = task_service.create_task(user_id, request)

    # Assert
    assert task.task_id is not None
    assert task.user_id == user_id
    assert task.title == "Test Task"
```

**Learn more**: [BACKEND_GUIDE.md - Testing](../../BACKEND_GUIDE.md#development-workflow)

---

## 🔧 Tools & Technologies

### Core Stack

- **Language**: Python 3.11+
- **Web Framework**: FastAPI
- **Validation**: Pydantic v2
- **AI Framework**: PydanticAI
- **Database**: PostgreSQL 13+ / SQLite
- **Migrations**: Alembic
- **Package Manager**: UV
- **Linter/Formatter**: Ruff
- **Type Checker**: MyPy
- **Testing**: Pytest

### Development Tools

- **Git**: Version control
- **Pre-commit**: Git hooks
- **VSCode/PyCharm**: IDEs
- **Docker**: Containerization (optional)

**Complete tool reference**: [BACKEND_RESOURCES.md](../../BACKEND_RESOURCES.md)

---

## 📝 Coding Standards

### Python Style

- **Style Guide**: PEP 8
- **Line Length**: 100 characters
- **Quotes**: Double quotes
- **Type Hints**: Required for all functions
- **Docstrings**: Google-style for all public functions

### Naming Conventions

- **Variables/Functions**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private**: `_leading_underscore`

**Complete standards**: [CLAUDE.md](../../CLAUDE.md) and [NAMING_CONVENTIONS.md](../../NAMING_CONVENTIONS.md)

---

## 🚀 Common Tasks

### Adding a New API Endpoint

1. Define Pydantic models (`src/core/`)
2. Add repository method (`src/repositories/`)
3. Add service method (`src/services/`)
4. Add API endpoint (`src/api/routes/`)
5. Write tests (all layers)

**Step-by-step guide**: [BACKEND_GUIDE.md - Adding Endpoint](../../BACKEND_GUIDE.md#adding-a-new-api-endpoint)

### Adding a Database Table

1. Create migration: `uv run alembic revision -m "add_table"`
2. Edit migration file
3. Create Pydantic model
4. Create repository
5. Apply migration: `uv run alembic upgrade head`

**Step-by-step guide**: [BACKEND_GUIDE.md - Adding Table](../../BACKEND_GUIDE.md#adding-a-new-database-table)

### Adding an Agent

1. Create agent file (`src/agents/`)
2. Define system prompt
3. Add tests
4. Integrate in service layer

**Step-by-step guide**: [BACKEND_GUIDE.md - Adding Agent](../../BACKEND_GUIDE.md#adding-a-new-agent)

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**:
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL
echo $DATABASE_URL
```

**Import Errors**:
```bash
# Activate venv
source .venv/bin/activate

# Reinstall dependencies
uv sync
```

**Test Failures**:
```bash
# Clear cache
uv run pytest --cache-clear

# Run with output
uv run pytest -v -s
```

**Complete troubleshooting guide**: [BACKEND_GUIDE.md - Troubleshooting](../../BACKEND_GUIDE.md#troubleshooting)

---

## 📚 Learning Resources

### Official Documentation

- [Python 3.11](https://docs.python.org/3.11/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Pydantic](https://docs.pydantic.dev/)
- [PydanticAI](https://ai.pydantic.dev/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Pytest](https://docs.pytest.org/)

### Books

- "Fluent Python" by Luciano Ramalho
- "Python Testing with pytest" by Brian Okken
- "FastAPI Web Development" (various authors)

### Online Courses

- [Real Python](https://realpython.com/)
- [TestDriven.io](https://testdriven.io/)
- [ArjanCodes](https://www.arjancodes.com/)

**Complete resource list**: [BACKEND_RESOURCES.md](../../BACKEND_RESOURCES.md#learning-resources)

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Write tests first (TDD)
3. Implement feature
4. Run tests: `uv run pytest`
5. Format/lint: `uv run ruff format . && uv run ruff check --fix .`
6. Commit: Follow conventional commits format
7. Push and create PR

### Code Review

- All code must be reviewed before merge
- PRs should be small and focused
- Tests must pass
- Code coverage should not decrease

### Git Conventions

**Branch naming**:
```
feature/task-splitting-api
fix/energy-calculation-bug
docs/api-documentation
refactor/repository-pattern
```

**Commit messages**:
```
feat(tasks): add task splitting API
fix(energy): correct calculation formula
docs(api): update endpoint documentation
```

**Learn more**: [NAMING_CONVENTIONS.md - Git Conventions](../../NAMING_CONVENTIONS.md#git-conventions)

---

## 🆘 Getting Help

### Where to Ask

1. **Documentation**: Start here
2. **Code Examples**: Search codebase with `rg "pattern"`
3. **Tests**: Tests show usage examples
4. **Team**: Ask in Slack/Discord
5. **Issues**: GitHub Issues for bugs

### Who to Ask

- **Architecture**: Team Lead
- **Testing**: QA Lead
- **DevOps**: DevOps Engineer
- **Domain**: Product Owner

---

## 📊 Project Status

### Current State

- **API Endpoints**: 86 documented endpoints
- **Test Coverage**: Target 80%+
- **Documentation**: 100% API coverage
- **Active Epics**: See [AGENT_ENTRY_POINT.md](../../AGENT_ENTRY_POINT.md)

### Next Priorities

See [docs/MASTER_TASK_LIST.md](../MASTER_TASK_LIST.md) for current priorities.

---

## 📄 Document Index

### Root Documentation
- [README.md](../../README.md) - Project overview
- [CLAUDE.md](../../CLAUDE.md) - Development standards
- [BACKEND_GUIDE.md](../../BACKEND_GUIDE.md) - Backend guide
- [BACKEND_RESOURCES.md](../../BACKEND_RESOURCES.md) - Resources
- [BACKEND_ONBOARDING.md](../../BACKEND_ONBOARDING.md) - Onboarding
- [NAMING_CONVENTIONS.md](../../NAMING_CONVENTIONS.md) - Naming standards

### Docs Directory
- [docs/TECH_STACK.md](../TECH_STACK.md) - Technology stack
- [docs/REPOSITORY_STRUCTURE.md](../REPOSITORY_STRUCTURE.md) - Structure
- [docs/installation.md](../installation.md) - Installation guide
- [docs/api/](../api/) - API documentation
- [docs/architecture/](../architecture/) - Architecture docs

### Source Documentation
- [src/agents/README.md](../../src/agents/README.md) - Agents
- [src/memory/README.md](../../src/memory/README.md) - Memory system

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Development
uv run uvicorn src.api.main:app --reload  # Start server
uv run pytest                              # Run tests
uv run ruff format .                       # Format code
uv run ruff check --fix .                  # Fix linting
uv run mypy src/                           # Type check

# Database
uv run alembic upgrade head                # Apply migrations
uv run alembic revision -m "msg"           # Create migration

# Environment
uv venv                                    # Create venv
source .venv/bin/activate                  # Activate
uv sync                                    # Install deps
```

### Key Files

- `src/api/main.py` - FastAPI app
- `src/core/settings.py` - Configuration
- `pyproject.toml` - Project config
- `.env` - Environment variables
- `alembic.ini` - Migration config

---

**Welcome to the backend team! Start with [BACKEND_ONBOARDING.md](../../BACKEND_ONBOARDING.md) and happy coding!**

*Last updated: 2025-10-25*
