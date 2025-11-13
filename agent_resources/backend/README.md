# Backend Agent - Quick Start

**Your Mission**: Build Python/FastAPI backend, manage database, implement APIs

**Last Updated**: November 13, 2025

---

## 🎯 Essential Reading (10 minutes)

1. **[API Reference](./api/API_REFERENCE.md)** (5 min) - All backend API endpoints
2. **[Integration Guide](./INTEGRATION_GUIDE.md)** (3 min) - Integration patterns
3. **[CLAUDE.md](../../CLAUDE.md)** (2 min) - Python coding standards

## 📚 Core Documentation

### API Documentation
- **[API Reference](./api/API_REFERENCE.md)** - Complete endpoint documentation
- **[API Implementation Summary](./api/IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[Task API Spec V2](./api/TASK_API_SPEC_V2.md)** - Task API specification
- **[OpenAPI Specification](./api/openapi.yaml)** - OpenAPI 3.0 spec

### Schemas & Models
- **[Energy System](./api/schemas/04-energy.md)** - Energy estimation schemas
- **[Gamification System](./api/schemas/05-gamification.md)** - Gamification schemas
- **[Capture System](./api/schemas/10-capture.md)** - Task capture schemas
- **[Services Catalog](./api/schemas/SERVICES_CATALOG.md)** - Service inventory

### Integration
- **[Integration Guide](./INTEGRATION_GUIDE.md)** - Integration patterns
- **[Deprecation Notice](./DEPRECATION_NOTICE.md)** - Deprecated features

---

## 🎯 Your Responsibilities

1. **Develop APIs**: FastAPI endpoints, request/response models
2. **Manage Database**: Schema design, migrations, queries
3. **Implement Services**: Business logic, data processing
4. **Write Tests**: Unit tests, integration tests, TDD approach
5. **Maintain Docs**: Keep API documentation current

---

## 📊 Tech Stack

**Backend**: Python 3.11+, FastAPI, Pydantic v2, UV package manager

**Database**: PostgreSQL with entity-specific primary keys

**Testing**: Pytest, fixtures, async testing

**Code Quality**: Ruff (lint+format), MyPy (type checking)

---

## 🚀 Quick Start

### Setup

```bash
# Install dependencies
uv sync

# Run tests
uv run pytest

# Start development server
uv run python -m src.main

# Check code quality
uv run ruff check .
uv run ruff format .
uv run mypy src/
```

### Development Workflow

1. **Check current work**: `cat ../status/backend/`
2. **Write test first**: Follow TDD (RED → GREEN → REFACTOR)
3. **Implement feature**: Follow patterns in existing code
4. **Run tests**: `uv run pytest -v`
5. **Update docs**: Keep API docs current

### Common Tasks

```bash
# Run specific test file
uv run pytest src/agents/tests/test_base_agent.py -v

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Type check
uv run mypy src/

# Format code
uv run ruff format .

# Fix linting issues
uv run ruff check --fix .
```

---

## 📖 Database Standards

### Entity-Specific Primary Keys

All tables use entity-specific primary keys for clarity:

```sql
-- ✅ STANDARDIZED
sessions.session_id UUID PRIMARY KEY
leads.lead_id UUID PRIMARY KEY
messages.message_id UUID PRIMARY KEY
```

### Naming Conventions

- **Primary keys**: `{entity}_id`
- **Foreign keys**: `{referenced_entity}_id`
- **Timestamps**: `{action}_at` (created_at, updated_at)
- **Booleans**: `is_{state}` (is_active, is_connected)
- **Counts**: `{entity}_count`

See [NAMING_CONVENTIONS.md](../architecture/design/NAMING_CONVENTIONS.md) for complete standards.

---

## 🔄 Repository Pattern

Use the enhanced BaseRepository for database operations:

```python
from src.repositories.base import BaseRepository
from src.core.models import Lead

class LeadRepository(BaseRepository[Lead]):
    def __init__(self):
        super().__init__()  # Auto-derives "leads" and "lead_id"
```

---

## 🧪 Testing

### TDD Approach

1. Write test first
2. Watch it fail
3. Write minimal code
4. Refactor
5. Repeat

### Test Organization

Tests live next to the code they test:

```
src/
  agents/
    base_agent.py
    tests/
      test_base_agent.py
```

See [Testing Guide](../testing/README.md) for comprehensive testing documentation.

---

## 📝 API Development

### FastAPI Patterns

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/leads", tags=["leads"])

@router.get("/{lead_id}")
async def get_lead(lead_id: str):
    # Implementation
    pass
```

### Response Models

Use Pydantic v2 models:

```python
from pydantic import BaseModel, Field
from datetime import datetime

class LeadResponse(BaseModel):
    lead_id: str
    name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

---

## 🛠️ Current Status

Check implementation status:

- **[Focus Sessions](../status/backend/BE-03_FOCUS_SESSIONS_STATUS.md)** - 95% complete
- **[Integration Tests](../status/backend/BE-15_INTEGRATION_TESTS_STATUS.md)** - Not started

See [../status/README.md](../status/README.md) for all backend status docs.

---

## 🗺️ Roadmap

Check current priorities:

- **[Current Sprint](../planning/current_sprint.md)** - This week's work
- **[Next 5 Tasks](../planning/next_5_tasks.md)** - Upcoming priorities

---

## 📚 Related Documentation

### Architecture & Design
- **[System Overview](../architecture/system-overview.md)** - Complete system architecture
- **[Naming Conventions](../architecture/design/NAMING_CONVENTIONS.md)** - Database standards
- **[Architecture Deep Dive](../architecture/design/ARCHITECTURE_DEEP_DIVE.md)** - Technical details

### Testing
- **[Testing Overview](../testing/00_OVERVIEW.md)** - Testing strategy
- **[Unit Testing Guide](../testing/01_UNIT_TESTING.md)** - Writing unit tests
- **[Integration Testing Guide](../testing/02_INTEGRATION_TESTING.md)** - Integration tests

### Getting Started
- **[Installation Guide](../docs/getting-started/installation.md)** - Complete setup
- **[Backend Developer Start](../docs/getting-started/BACKEND_DEVELOPER_START.md)** - Backend onboarding

---

## 🆘 Need Help?

### Common Issues

- **Import errors**: Run `uv sync` to install dependencies
- **Test failures**: Check [Testing Quick Start](../testing/06_QUICK_START.md)
- **Database errors**: Review [Naming Conventions](../architecture/design/NAMING_CONVENTIONS.md)
- **Type errors**: Run `uv run mypy src/` to see all issues

### Documentation

- **CLAUDE.md**: Python coding standards and TDD philosophy
- **API Docs**: Complete endpoint reference in [./api/](./api/)
- **Testing**: Comprehensive guides in [../testing/](../testing/)

---

**Navigation**: [↑ Agent Resources](../README.md) | [📚 Docs Index](../docs/README.md) | [🎯 Tasks](../tasks/README.md)
