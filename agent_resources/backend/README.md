# Backend Agent - Quick Start

**Your Mission**: Develop and maintain the Python/FastAPI backend, database, and API services

**Last Updated**: November 10, 2025

---

## 🎯 Essential Reading (10 minutes)

**Read these first** before starting any backend work:

1. **[CLAUDE.md](../../CLAUDE.md)** (5 min) - REQUIRED: Python standards, TDD, UV package management
2. **[Backend Architecture](../../docs/backend/BACKEND_ARCHITECTURE.md)** (3 min) - System overview
3. **[Database Schema](../../docs/backend/DATABASE_SCHEMA.md)** (2 min) - Current schema

## 🚀 Quick Start Commands

```bash
# Activate environment
source .venv/bin/activate

# Run backend server
uv run uvicorn src.api.main:app --reload --port 8000

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src --cov-report=html

# Database migrations
uv run alembic upgrade head

# Lint and format
uv run ruff check src/
uv run ruff format src/
uv run mypy src/
```

## 📋 Common Tasks

### Task 1: Add a New API Endpoint
**Read**: [API Reference](../../docs/backend/API_COMPLETE_REFERENCE.md)
**Do**:
1. Create endpoint in `src/api/routes/`
2. Write tests first (TDD) in `src/api/routes/tests/`
3. Implement service logic in `src/services/`
4. Update API docs

### Task 2: Database Migration
**Read**: [Database Schema](../../docs/backend/DATABASE_SCHEMA.md)
**Do**:
1. Create migration: `uv run alembic revision -m "description"`
2. Edit migration file in `src/database/migrations/`
3. Test migration: `uv run alembic upgrade head`
4. Test rollback: `uv run alembic downgrade -1`
5. Update DATABASE_SCHEMA.md

### Task 3: Add a New Service
**Read**: [Backend TDD Guide](../../docs/backend/BACKEND_TDD_GUIDE.md)
**Do**:
1. Create service directory: `src/services/new_service/`
2. Write tests first: `src/services/new_service/tests/test_new_service.py`
3. Implement service: `src/services/new_service/service.py`
4. Add to dependency injection
5. Document in backend docs

## 📚 Full Documentation

### Architecture & Design
- [Backend Architecture](../../docs/backend/BACKEND_ARCHITECTURE.md) - System overview
- [Database Schema](../../docs/backend/DATABASE_SCHEMA.md) - Complete schema
- [Naming Conventions](../architecture/design/NAMING_CONVENTIONS.md) - Entity-specific PKs

### API & Services
- [API Complete Reference](../../docs/backend/API_COMPLETE_REFERENCE.md) - All endpoints
- [API Reference](./api/API_REFERENCE.md) - API documentation
- [API Schemas](./api/schemas/) - Request/response models
- [Task API Spec V2](./api/TASK_API_SPEC_V2.md) - Task endpoints

### Development Guides
- [Backend Onboarding](../../docs/backend/BACKEND_ONBOARDING.md) - Getting started
- [Backend TDD Guide](../../docs/backend/BACKEND_TDD_GUIDE.md) - Test-driven development
- [Backend Tasks](../../docs/backend/BACKEND_TASKS.md) - Task list

### Current Status
- [Backend Status Analysis](../../docs/backend/BACKEND_STATUS_ANALYSIS.md) - Current state
- [Technical Debt](../../docs/status/TECHNICAL_DEBT.md) - TODOs and issues
- [Backend Task Specs](../../docs/tasks/backend/) - Specific tasks (16 files)

### DevOps & Deployment
- [Docker Guide](../../docs/devops/docker.md) - Containerization
- [Deployment](../../docs/devops/) - Deployment guides

## 📝 Quick Reference

### Key Directories
```
src/
├── api/              # API endpoints and routes
│   ├── routes/       # Route definitions
│   └── main.py       # FastAPI app
├── services/         # Business logic services
├── database/         # Database models and migrations
│   └── migrations/   # Alembic migrations
├── core/             # Core models and settings
└── integrations/     # External service integrations
```

### Key Files
- `src/api/main.py` - FastAPI application entry point
- `src/core/settings.py` - Application settings
- `src/core/task_models.py` - Task data models
- `pyproject.toml` - Python dependencies
- `alembic.ini` - Database migration config

### Standards (from CLAUDE.md)
- **Max 500 lines** per file
- **Max 50 lines** per function
- **Max 100 characters** per line
- **Type hints** required everywhere
- **Google-style docstrings** required
- **80%+ test coverage** required

## 🔍 When You're Stuck

1. **Search docs**: `rg "keyword" docs/backend docs/api`
2. **Check existing code**: Look in `src/services/` for patterns
3. **Read tests**: `src/*/tests/` shows usage examples
4. **Review API**: `docs/backend/API_COMPLETE_REFERENCE.md`

## ⚠️ Important Notes

- **Database paths**: Use `.data/databases/` (see CLAUDE.md)
- **Entity-specific PKs**: `session_id`, `lead_id`, etc. (not generic `id`)
- **TDD required**: Write tests first, always
- **UV for dependencies**: Never edit pyproject.toml directly, use `uv add`

## 📊 Current Backend Status

**Completion**: ~60% (core CRUD working)
- ✅ Task management APIs
- ✅ OAuth authentication (Google, Apple, GitHub)
- ✅ Database layer (11 tables)
- ✅ Delegation system (BE-00 complete)
- 🟡 AI agents (framework solid, limited intelligence)
- ❌ Real-time WebSocket (stubs only)

**Active Development**:
- Task templates service (BE-01)
- Task splitting service (BE-05)
- Integration tests (BE-15)

See [Backend Status Analysis](../../docs/backend/BACKEND_STATUS_ANALYSIS.md) for details.

---

**Navigation**: [↑ Agent Resources](../README.md) | [📚 Docs Index](../../docs/INDEX.md) | [🎯 Project Root](../../README.md)
