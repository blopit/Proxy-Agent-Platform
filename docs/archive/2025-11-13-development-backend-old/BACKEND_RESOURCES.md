# Backend Resources

Comprehensive resource guide for backend development on the Proxy Agent Platform. This document catalogs all tools, libraries, frameworks, and learning resources you'll need.

## Table of Contents

- [Core Technologies](#core-technologies)
- [Development Tools](#development-tools)
- [Testing Tools](#testing-tools)
- [Database Tools](#database-tools)
- [AI/ML Libraries](#aiml-libraries)
- [Utilities & Helpers](#utilities--helpers)
- [Learning Resources](#learning-resources)
- [VSCode Extensions](#vscode-extensions)
- [Useful Commands](#useful-commands)

## Core Technologies

### Python 3.11+

**What it is**: Primary programming language for the backend
**Why we use it**: Modern features, excellent async support, rich ecosystem
**Key Features**:
- Type hints and type checking
- Async/await for concurrent operations
- Pattern matching (3.10+)
- Better error messages

**Resources**:
- [Official Docs](https://docs.python.org/3.11/)
- [What's New in 3.11](https://docs.python.org/3.11/whatsnew/3.11.html)
- [Type Hints Cheat Sheet](https://mypy.readthedocs.io/en/stable/cheat_sheet_py3.html)

**Common Patterns**:
```python
# Type hints
from typing import Optional, List, Dict, Any
from uuid import UUID

def get_tasks(user_id: UUID, limit: int = 100) -> list[Task]:
    """Modern Python 3.11+ syntax."""
    pass

# Pattern matching (3.10+)
match task.status:
    case TaskStatus.PENDING:
        handle_pending()
    case TaskStatus.COMPLETED:
        handle_completed()
    case _:
        handle_other()
```

---

### FastAPI

**What it is**: Modern, high-performance web framework for building APIs
**Why we use it**: Fast, automatic validation, excellent async support, auto-generated docs
**Version**: Latest stable

**Resources**:
- [Official Docs](https://fastapi.tiangolo.com/)
- [Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Advanced User Guide](https://fastapi.tiangolo.com/advanced/)
- [Deployment Guide](https://fastapi.tiangolo.com/deployment/)

**Key Features**:
- Automatic API documentation (Swagger UI)
- Request validation via Pydantic
- Dependency injection
- WebSocket support
- Background tasks

**Common Patterns**:
```python
from fastapi import FastAPI, Depends, HTTPException, status
from typing import Annotated

app = FastAPI(title="Proxy Agent Platform")

# Dependency injection
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

# Route with dependencies
@app.get("/tasks")
async def list_tasks(
    current_user: Annotated[User, Depends(get_current_user)]
) -> list[Task]:
    return await task_service.get_tasks(current_user.user_id)
```

---

### Pydantic v2

**What it is**: Data validation and settings management using Python type hints
**Why we use it**: Type safety, automatic validation, serialization
**Version**: 2.x (v2 only)

**Resources**:
- [Official Docs](https://docs.pydantic.dev/latest/)
- [Migration Guide (v1 to v2)](https://docs.pydantic.dev/latest/migration/)
- [Performance Tips](https://docs.pydantic.dev/latest/concepts/performance/)

**Key Features**:
- Automatic validation
- JSON serialization
- Settings management
- Custom validators
- Computed fields

**Common Patterns**:
```python
from pydantic import BaseModel, Field, validator, computed_field
from pydantic_settings import BaseSettings

# Data model
class Task(BaseModel):
    task_id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., min_length=1, max_length=255)
    priority: int = Field(default=3, ge=1, le=5)

    @validator('title')
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

    @computed_field
    @property
    def is_high_priority(self) -> bool:
        return self.priority >= 4

# Settings management
class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://localhost:6379"
    debug: bool = False

    class Config:
        env_file = ".env"
```

---

### PydanticAI

**What it is**: AI agent framework built on Pydantic
**Why we use it**: Type-safe AI agents, structured outputs, multi-provider support
**Version**: Latest

**Resources**:
- [Official Docs](https://ai.pydantic.dev/)
- [Examples](https://github.com/pydantic/pydantic-ai/tree/main/examples)
- [Agent Guide](https://ai.pydantic.dev/agents/)

**Supported Providers**:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Groq
- Ollama (local)

**Common Patterns**:
```python
from pydantic_ai import Agent

# Create agent
task_agent = Agent(
    model="openai:gpt-4",
    system_prompt="You are a task management assistant."
)

# Run agent
result = await task_agent.run(
    "Help me break down this task: Build authentication system"
)

# Structured output
class TaskBreakdown(BaseModel):
    subtasks: list[str]
    estimated_hours: float

result = await task_agent.run(
    "Break down this task",
    result_type=TaskBreakdown
)
```

---

### PostgreSQL 13+

**What it is**: Advanced open-source relational database
**Why we use it**: ACID compliance, JSON support, full-text search, scalability
**Version**: 13+ (recommended 15+)

**Resources**:
- [Official Docs](https://www.postgresql.org/docs/)
- [Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)

**Key Features**:
- JSONB data type
- Full-text search
- Window functions
- CTEs (Common Table Expressions)
- UUID support

**Common Patterns**:
```sql
-- JSONB queries
SELECT * FROM tasks
WHERE metadata->>'category' = 'work';

-- Full-text search
SELECT * FROM tasks
WHERE to_tsvector('english', title || ' ' || description)
@@ to_tsquery('productivity & management');

-- Window functions
SELECT
    task_id,
    title,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as task_rank
FROM tasks;
```

---

### Alembic

**What it is**: Database migration tool for SQLAlchemy
**Why we use it**: Version control for database schema
**Version**: Latest

**Resources**:
- [Official Docs](https://alembic.sqlalchemy.org/)
- [Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [Auto-generate Migrations](https://alembic.sqlalchemy.org/en/latest/autogenerate.html)

**Common Commands**:
```bash
# Create new migration
uv run alembic revision -m "add_task_splitting_fields"

# Auto-generate migration from models
uv run alembic revision --autogenerate -m "sync_with_models"

# Apply migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1

# View history
uv run alembic history

# Check current version
uv run alembic current
```

---

## Development Tools

### UV Package Manager

**What it is**: Blazing-fast Python package manager (written in Rust)
**Why we use it**: 10-100x faster than pip, better dependency resolution
**Installation**: `curl -LsSf https://astral.sh/uv/install.sh | sh`

**Resources**:
- [Official Docs](https://github.com/astral-sh/uv)
- [User Guide](https://github.com/astral-sh/uv#usage)

**Common Commands**:
```bash
# Create virtual environment
uv venv

# Sync dependencies from pyproject.toml
uv sync

# Add package
uv add fastapi

# Add dev dependency
uv add --dev pytest

# Remove package
uv remove requests

# Run command in environment
uv run python script.py
uv run pytest

# Install specific Python version
uv python install 3.11
```

---

### Ruff

**What it is**: Extremely fast Python linter and formatter (Rust-based)
**Why we use it**: 10-100x faster than flake8/black, all-in-one tool
**Configuration**: `pyproject.toml`

**Resources**:
- [Official Docs](https://docs.astral.sh/ruff/)
- [Rules Reference](https://docs.astral.sh/ruff/rules/)
- [Configuration](https://docs.astral.sh/ruff/configuration/)

**Common Commands**:
```bash
# Format code
uv run ruff format .

# Check linting
uv run ruff check .

# Fix linting issues
uv run ruff check --fix .

# Check specific file
uv run ruff check src/services/task_service.py

# Watch mode
uv run ruff check --watch .
```

**Configuration** (`pyproject.toml`):
```toml
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]
ignore = ["E501"]  # Line too long

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

---

### MyPy

**What it is**: Static type checker for Python
**Why we use it**: Catch type errors before runtime
**Configuration**: `pyproject.toml`

**Resources**:
- [Official Docs](https://mypy.readthedocs.io/)
- [Type Hints Cheat Sheet](https://mypy.readthedocs.io/en/stable/cheat_sheet_py3.html)
- [Common Issues](https://mypy.readthedocs.io/en/stable/common_issues.html)

**Common Commands**:
```bash
# Type check entire project
uv run mypy src/

# Check specific file
uv run mypy src/services/task_service.py

# Show error codes
uv run mypy --show-error-codes src/

# Generate coverage report
uv run mypy --html-report mypy-report src/
```

**Configuration** (`pyproject.toml`):
```toml
[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

---

### Pre-commit

**What it is**: Git hook framework for running checks before commits
**Why we use it**: Enforce code quality automatically
**Configuration**: `.pre-commit-config.yaml`

**Resources**:
- [Official Docs](https://pre-commit.com/)
- [Supported Hooks](https://pre-commit.com/hooks.html)

**Setup**:
```bash
# Install hooks
uv run pre-commit install

# Run on all files
uv run pre-commit run --all-files

# Run specific hook
uv run pre-commit run ruff --all-files

# Update hooks
uv run pre-commit autoupdate
```

**Example Configuration**:
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.6
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.1
    hooks:
      - id: mypy
        additional_dependencies: [pydantic]
```

---

## Testing Tools

### Pytest

**What it is**: Full-featured Python testing framework
**Why we use it**: Powerful, flexible, excellent plugin ecosystem
**Version**: Latest

**Resources**:
- [Official Docs](https://docs.pytest.org/)
- [Good Integration Practices](https://docs.pytest.org/en/stable/goodpractices.html)
- [Fixtures](https://docs.pytest.org/en/stable/fixture.html)

**Common Commands**:
```bash
# Run all tests
uv run pytest

# Run specific file
uv run pytest src/services/tests/test_task_service.py

# Run specific test
uv run pytest src/services/tests/test_task_service.py::test_create_task

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run in parallel
uv run pytest -n auto

# Run only failed tests
uv run pytest --lf

# Verbose output
uv run pytest -v

# Show print statements
uv run pytest -s

# Watch mode
uv run pytest-watch
```

**Useful Plugins**:
```bash
# Install testing plugins
uv add --dev pytest-asyncio  # Async test support
uv add --dev pytest-cov      # Coverage reporting
uv add --dev pytest-xdist    # Parallel execution
uv add --dev pytest-mock     # Mocking support
uv add --dev pytest-watch    # Watch mode
```

---

### pytest-asyncio

**What it is**: Pytest plugin for testing async code
**Why we use it**: Test async/await functions

**Resources**:
- [Official Docs](https://pytest-asyncio.readthedocs.io/)

**Usage**:
```python
import pytest

@pytest.mark.asyncio
async def test_async_task_creation():
    """Test async task creation."""
    task = await task_service.create_task(request)
    assert task.task_id is not None

# Async fixtures
@pytest.fixture
async def async_client():
    """Provide async test client."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
```

---

### pytest-cov

**What it is**: Coverage reporting plugin for pytest
**Why we use it**: Measure test coverage

**Resources**:
- [Official Docs](https://pytest-cov.readthedocs.io/)

**Usage**:
```bash
# Generate coverage report
uv run pytest --cov=src --cov-report=html

# Minimum coverage requirement
uv run pytest --cov=src --cov-fail-under=80

# Show missing lines
uv run pytest --cov=src --cov-report=term-missing
```

---

## Database Tools

### pgAdmin

**What it is**: PostgreSQL GUI administration tool
**Installation**: [Download](https://www.pgadmin.org/download/)

**Alternatives**:
- DBeaver (free, multi-database)
- DataGrip (JetBrains, paid)
- Postico (macOS only)

---

### psql

**What it is**: PostgreSQL command-line interface
**Comes with**: PostgreSQL installation

**Common Commands**:
```bash
# Connect to database
psql $DATABASE_URL

# List databases
\l

# Connect to database
\c database_name

# List tables
\dt

# Describe table
\d table_name

# Execute SQL file
\i script.sql

# Export query results
\o output.txt
SELECT * FROM tasks;
\o
```

---

## AI/ML Libraries

### OpenAI Python SDK

**What it is**: Official OpenAI API client
**Installation**: `uv add openai`

**Resources**:
- [Official Docs](https://platform.openai.com/docs/api-reference)
- [Python SDK](https://github.com/openai/openai-python)

**Usage**:
```python
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = await client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Break down this task"}
    ]
)
```

---

### Anthropic SDK

**What it is**: Official Anthropic (Claude) API client
**Installation**: `uv add anthropic`

**Resources**:
- [Official Docs](https://docs.anthropic.com/)
- [Python SDK](https://github.com/anthropics/anthropic-sdk-python)

---

### Google Generative AI

**What it is**: Google's Gemini API client
**Installation**: `uv add google-generativeai`

**Resources**:
- [Official Docs](https://ai.google.dev/docs)

---

## Utilities & Helpers

### httpx

**What it is**: Async HTTP client (better than requests)
**Installation**: `uv add httpx`

**Resources**:
- [Official Docs](https://www.python-httpx.org/)

**Usage**:
```python
import httpx

# Sync
response = httpx.get("https://api.example.com/tasks")

# Async
async with httpx.AsyncClient() as client:
    response = await client.get("https://api.example.com/tasks")
```

---

### python-dotenv

**What it is**: Load environment variables from .env files
**Installation**: `uv add python-dotenv`

**Usage**:
```python
from dotenv import load_dotenv
import os

load_dotenv()
database_url = os.getenv("DATABASE_URL")
```

---

### loguru

**What it is**: Better logging for Python
**Installation**: `uv add loguru`

**Resources**:
- [Official Docs](https://loguru.readthedocs.io/)

**Usage**:
```python
from loguru import logger

logger.info("Task created", task_id=task.task_id)
logger.error("Failed to create task", error=str(e))
```

---

### Rich

**What it is**: Rich text and formatting for terminal
**Installation**: `uv add rich`

**Resources**:
- [Official Docs](https://rich.readthedocs.io/)

**Usage**:
```python
from rich.console import Console
from rich.table import Table

console = Console()
console.print("[bold green]Success![/bold green]")

# Pretty print objects
console.print(task)

# Tables
table = Table(title="Tasks")
table.add_column("ID")
table.add_column("Title")
table.add_row("1", "Build API")
console.print(table)
```

---

## Learning Resources

### Official Documentation

- **Python**: https://docs.python.org/3.11/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Pydantic**: https://docs.pydantic.dev/
- **PydanticAI**: https://ai.pydantic.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Pytest**: https://docs.pytest.org/

### Books

#### Python
- "Fluent Python" by Luciano Ramalho (2nd Edition)
- "Python Concurrency with asyncio" by Matthew Fowler
- "Effective Python" by Brett Slatkin (2nd Edition)

#### FastAPI & Web Development
- "Building Python Microservices with FastAPI" by Sherwin John C. Tragura
- "FastAPI Web Development" by Abdulazeez Abdulazeez Adeshina

#### Testing
- "Python Testing with pytest" by Brian Okken (2nd Edition)
- "Test Driven Development with Python" by Harry Percival

### Online Courses

#### Free
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/) - Official
- [Real Python](https://realpython.com/) - Python tutorials
- [Full Stack FastAPI](https://github.com/tiangolo/full-stack-fastapi-template) - Template project

#### Paid
- [TestDriven.io](https://testdriven.io/) - TDD with Python
- [ArjanCodes](https://www.arjancodes.com/) - Software design patterns

### YouTube Channels

- **ArjanCodes**: Software design and architecture
- **mCoding**: Advanced Python topics
- **Tech With Tim**: FastAPI tutorials
- **Corey Schafer**: Python fundamentals

### Blogs & Articles

- [Real Python](https://realpython.com/)
- [FastAPI Blog](https://fastapi.tiangolo.com/blog/)
- [Pydantic Blog](https://docs.pydantic.dev/blog/)
- [Python Speed](https://pythonspeed.com/) - Performance tips

### Community

- **FastAPI Discord**: https://discord.gg/fastapi
- **Python Discord**: https://discord.gg/python
- **r/Python**: https://reddit.com/r/Python
- **r/FastAPI**: https://reddit.com/r/FastAPI

---

## VSCode Extensions

### Essential

```json
{
  "recommendations": [
    "ms-python.python",              // Python support
    "ms-python.vscode-pylance",      // Fast Python language server
    "charliermarsh.ruff",            // Ruff linting/formatting
    "ms-python.mypy-type-checker",   // MyPy integration
    "tamasfe.even-better-toml",      // TOML support
    "ms-azuretools.vscode-docker",   // Docker support
    "humao.rest-client",             // HTTP client
    "GitHub.copilot",                // AI pair programmer
    "eamodio.gitlens",               // Git supercharged
    "donjayamanne.githistory"        // Git history
  ]
}
```

### Recommended Settings

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "python.testing.pytestEnabled": true,
  "python.testing.unittestEnabled": false,
  "python.linting.enabled": true,
  "python.formatting.provider": "none",
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true,
      "source.fixAll": true
    }
  },
  "ruff.lint.args": ["--config=pyproject.toml"],
  "ruff.format.args": ["--config=pyproject.toml"]
}
```

---

## Useful Commands

### Development Workflow

```bash
# Daily workflow
git pull origin main
uv sync
uv run pytest
uv run ruff check .
uv run mypy src/

# Before commit
uv run ruff format .
uv run ruff check --fix .
uv run pytest
uv run mypy src/
git add .
git commit -m "feat(tasks): add task splitting"

# Database workflow
uv run alembic revision -m "add_new_table"
# Edit migration file
uv run alembic upgrade head
uv run pytest src/database/tests/
```

### Debugging

```bash
# Run with debugger
uv run python -m pdb src/api/main.py

# Interactive shell with imports
uv run python -i -c "from src.services.task_service import *"

# Profile code
uv run python -m cProfile -o profile.stats script.py

# Memory profiling
uv add --dev memory-profiler
uv run python -m memory_profiler script.py
```

### Database Utilities

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql

# Reset database
uv run alembic downgrade base
uv run alembic upgrade head

# Seed data
uv run python src/database/seed_data.py
```

---

## Quick Reference

### Project Commands Cheat Sheet

```bash
# Environment
uv venv                          # Create venv
source .venv/bin/activate        # Activate venv
uv sync                          # Install dependencies

# Code Quality
uv run ruff format .             # Format code
uv run ruff check --fix .        # Fix linting
uv run mypy src/                 # Type check
uv run pre-commit run --all-files # Run hooks

# Testing
uv run pytest                    # Run all tests
uv run pytest -v                 # Verbose
uv run pytest -s                 # Show prints
uv run pytest --cov=src          # With coverage
uv run pytest -n auto            # Parallel

# Database
uv run alembic upgrade head      # Apply migrations
uv run alembic downgrade -1      # Rollback one
uv run alembic revision -m "msg" # Create migration

# Running
uv run uvicorn src.api.main:app --reload  # Dev server
uv run python -m src.cli.main    # CLI tool
```

---

## Additional Resources

### Project Documentation

- [CLAUDE.md](CLAUDE.md) - Development standards
- [BACKEND_GUIDE.md](BACKEND_GUIDE.md) - Backend developer guide
- [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) - Naming standards
- [docs/TECH_STACK.md](docs/TECH_STACK.md) - Tech stack details
- [docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md) - API reference

### External Resources

- [Awesome FastAPI](https://github.com/mjhea0/awesome-fastapi)
- [Awesome Python](https://github.com/vinta/awesome-python)
- [Python Patterns](https://python-patterns.guide/)
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)

---

**This resource guide is maintained by the backend team. Last updated: 2025-10-25**
