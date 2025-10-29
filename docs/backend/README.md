# Backend Documentation

**Last Updated**: October 28, 2025
**Version**: 0.1.0

Welcome to the Proxy Agent Platform backend documentation! This directory contains comprehensive documentation for all backend systems, APIs, and development workflows.

---

## 📚 Documentation Index

### 🚀 Getting Started

| Document | Description | Who Should Read |
|----------|-------------|-----------------|
| **[BACKEND_ONBOARDING.md](./BACKEND_ONBOARDING.md)** | Complete onboarding guide (0 to productive in 2 hours) | New developers |
| **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)** | System architecture and design patterns | All backend developers |
| **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** | Complete database schema documentation | Backend developers, DBAs |
| **[API_COMPLETE_REFERENCE.md](./API_COMPLETE_REFERENCE.md)** | Full API endpoint reference | Backend + Frontend developers |

---

## 🎯 Quick Links by Role

### New Backend Developer
Start here and follow in order:

1. **[BACKEND_ONBOARDING.md](./BACKEND_ONBOARDING.md)** - Day 1 setup (30 min)
2. **[CLAUDE.md](../../CLAUDE.md)** - Development standards (15 min read)
3. **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)** - Architecture overview (30 min read)
4. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database reference (20 min read)
5. **[API_COMPLETE_REFERENCE.md](./API_COMPLETE_REFERENCE.md)** - API reference (as needed)

**Total onboarding time**: 2-3 hours to productive

---

### Experienced Backend Developer
Quick reference:

- **Architecture**: [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md#architecture-layers)
- **Database**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md#core-tables)
- **API Docs**: [API_COMPLETE_REFERENCE.md](./API_COMPLETE_REFERENCE.md)
- **Standards**: [CLAUDE.md](../../CLAUDE.md#code-structure--modularity)
- **Naming**: [NAMING_CONVENTIONS.md](../design/NAMING_CONVENTIONS.md)

---

### Frontend Developer
What you need to know:

- **API Reference**: [API_COMPLETE_REFERENCE.md](./API_COMPLETE_REFERENCE.md)
  - Authentication endpoints
  - Task management
  - Real-time WebSocket
  - Error handling

- **Data Models**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md#schema-diagram)
  - Understand task structure
  - Compass zones
  - Gamification system

---

### DevOps / Infrastructure
Infrastructure documentation:

- **Database**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
  - Schema and indexes
  - Migrations
  - Connection pooling

- **Architecture**: [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md#technology-stack)
  - Tech stack
  - Performance considerations
  - Deployment requirements

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          API Layer (FastAPI)                    │
│  • 10+ route modules                            │
│  • WebSocket support                            │
│  • Pydantic validation                          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Services Layer                          │
│  • 12+ service modules                          │
│  • Business logic                               │
│  • Multi-repository coordination                │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      Repositories Layer                         │
│  • Enhanced BaseRepository                      │
│  • Auto-derived table/PK names                  │
│  • Type-safe data access                        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Database Layer                          │
│  • PostgreSQL (prod) / SQLite (dev)             │
│  • SQLAlchemy ORM                               │
│  • Alembic migrations                           │
└─────────────────────────────────────────────────┘
```

**[Full architecture docs →](./BACKEND_ARCHITECTURE.md)**

---

## 💾 Database at a Glance

### Core Tables

- **`users`** - User accounts and profiles
- **`tasks`** - Core task entity with Epic 7 fields
- **`micro_steps`** - ADHD-optimized 1-10 min steps
- **`projects`** - Task grouping
- **`compass_zones`** - Life areas (Work/Life/Self)
- **`morning_rituals`** - Daily 3-task focus
- **`focus_sessions`** - Pomodoro tracking
- **`energy_snapshots`** - Energy level logging

### Naming Convention

- **Table names**: Plural (e.g., `tasks`, `users`)
- **Primary keys**: `{entity}_id` (e.g., `task_id`, `user_id`)
- **Foreign keys**: `{referenced_entity}_id`
- **Timestamps**: `created_at`, `updated_at`, `completed_at`

**[Full schema docs →](./DATABASE_SCHEMA.md)**

---

## 🌐 API Highlights

### Main API Modules

| Module | Prefix | Endpoints | Description |
|--------|--------|-----------|-------------|
| **Tasks v2** | `/api/v2/tasks` | 8 | Modern task management |
| **Capture** | `/api/capture` | 4 | 2-second brain dump |
| **Compass** | `/api/compass` | 4 | Zone management |
| **Focus** | `/api/focus` | 3 | Pomodoro sessions |
| **Energy** | `/api/energy` | 3 | Energy tracking |
| **Ritual** | `/api/ritual` | 4 | Morning ritual |
| **Gamification** | `/api/gamification` | 3 | XP and achievements |
| **Auth** | `/api/auth` | 5 | Authentication |

### WebSocket

- **Endpoint**: `ws://{host}/ws/{user_id}`
- **Events**: Task updates, XP gains, achievements, focus sessions

**[Full API docs →](./API_COMPLETE_REFERENCE.md)**

---

## 🛠️ Development Workflow

### Setup (One-time)

```bash
# 1. Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Clone repo
git clone git@github.com:yourusername/proxy-agent-platform.git
cd proxy-agent-platform

# 3. Setup environment
uv venv && source .venv/bin/activate
uv sync --group dev

# 4. Configure .env
cp .env.example .env
# Edit .env with your API keys

# 5. Initialize database
uv run python -c "from src.database.connection import init_db; init_db()"

# 6. Run tests
uv run pytest
```

### Daily Development

```bash
# Start server
uv run uvicorn src.api.main:app --reload --port 8000

# Run tests
uv run pytest

# Format code
uv run ruff format .

# Lint
uv run ruff check --fix .
```

**[Full onboarding guide →](./BACKEND_ONBOARDING.md)**

---

## 🧪 Testing

### Test Organization

```
src/
├── api/tests/           # API integration tests
├── services/tests/      # Service unit tests
├── repositories/tests/  # Repository tests
└── conftest.py          # Shared fixtures
```

### Running Tests

```bash
# All tests
uv run pytest

# Specific module
uv run pytest src/api/tests/

# With coverage
uv run pytest --cov=src --cov-report=html

# Watch mode (TDD)
uv run pytest-watch
```

### Test Coverage Goals

- **Overall**: 95%+
- **Services**: 90%+
- **Repositories**: 85%+
- **API Routes**: 80%+

---

## 📋 Current Development Status

### Completed ✅

- ✅ Core task management system
- ✅ Compass zone system
- ✅ Focus session tracking
- ✅ Energy level logging
- ✅ Gamification (XP, achievements)
- ✅ Morning ritual system
- ✅ WebSocket real-time updates
- ✅ Authentication system
- ✅ Quick capture system
- ✅ Comprehensive backend documentation

### In Progress 🟡

- 🟡 Task delegation system (BE-00) - **CRITICAL PRIORITY**
- 🟡 Task template service (BE-01)
- 🟡 Virtual pet system (BE-02)
- 🟡 Enhanced focus sessions (BE-03)

### Planned 📋

- 📋 Knowledge graph integration
- 📋 Advanced analytics
- 📋 Mobile-optimized endpoints
- 📋 Rate limiting
- 📋 API versioning

---

## 🎯 Next Priority: Task Delegation System

**Epic Task**: [BE-00: Task Delegation System](../tasks/backend/00_task_delegation_system.md)

### Why This Matters

This is the **foundation** for all backend development:

1. **Meta-task management**: Use the app to build the app (dogfooding)
2. **4D Delegation**: DO / DO_WITH_ME / DELEGATE / DELETE
3. **Agent coordination**: Assign tasks to AI agents or humans
4. **Visible progress**: Track development in the app itself

### What Needs to be Built

- [ ] Database schema (delegation fields, task_assignments, agent_capabilities)
- [ ] Pydantic models for delegation
- [ ] TaskDelegationRepository
- [ ] Delegation API routes
- [ ] 15+ TDD tests
- [ ] Seed script for 11 development tasks

**Estimated effort**: 8-10 hours
**Priority**: CRITICAL
**Status**: Not started

**[View full specification →](../tasks/backend/00_task_delegation_system.md)**

---

## 🔗 Related Documentation

### Development Guides

- **[BACKEND_GUIDE.md](../development/BACKEND_GUIDE.md)** - Comprehensive development guide
- **[BACKEND_REFACTORING_PLAN.md](../development/BACKEND_REFACTORING_PLAN.md)** - Refactoring strategy
- **[TESTING_STRATEGY.md](../testing/TESTING_STRATEGY.md)** - Testing best practices

### Design Documents

- **[NAMING_CONVENTIONS.md](../design/NAMING_CONVENTIONS.md)** - Database and code naming
- **[ARCHITECTURE_DEEP_DIVE.md](../design/ARCHITECTURE_DEEP_DIVE.md)** - Detailed architecture
- **[CHAMPS_FRAMEWORK.md](../design/CHAMPS_FRAMEWORK.md)** - ADHD-focused design

### API Documentation

- **[API_REFERENCE.md](../api/API_REFERENCE.md)** - Legacy API docs
- **[TASK_API_SPEC_V2.md](../api/TASK_API_SPEC_V2.md)** - Task API v2 spec

---

## 🤝 Contributing

### Before You Start

1. Read **[CLAUDE.md](../../CLAUDE.md)** - Required reading
2. Complete **[BACKEND_ONBOARDING.md](./BACKEND_ONBOARDING.md)**
3. Review **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)**

### Development Process

1. **Create branch**: `git checkout -b feature/your-feature`
2. **Write tests first** (TDD RED phase)
3. **Implement feature** (GREEN phase)
4. **Refactor** (REFACTOR phase)
5. **Format + Lint**: `uv run ruff format . && uv run ruff check --fix .`
6. **Run tests**: `uv run pytest`
7. **Commit**: Follow conventional commits
8. **Push + PR**: Get code review

### Code Review Standards

- All tests must pass
- 95%+ test coverage for new code
- Ruff formatting applied
- Type hints on all functions
- Docstrings on public functions
- No breaking changes without migration

---

## 📞 Getting Help

### Documentation

1. **Search docs first**: Use `grep -r "keyword" docs/`
2. **Check examples**: Look at existing similar code
3. **Read tests**: Tests often serve as documentation

### Team Support

- **Slack**: #backend-dev channel
- **GitHub**: Create discussion or issue
- **Standups**: Daily 10:00 AM ET
- **Office Hours**: Tuesdays 3:00 PM ET

### Common Issues

**Database errors**:
- Check `.env` has correct `DATABASE_URL`
- Run `uv run python -c "from src.database.connection import init_db; init_db()"`

**Import errors**:
- Activate venv: `source .venv/bin/activate`
- Reinstall: `uv sync`

**Test failures**:
- Clear cache: `uv run pytest --cache-clear`
- Run single test: `uv run pytest -k test_name -v`

---

## 📝 Changelog

### v0.1.0 (2025-10-28)
- ✅ Complete backend documentation created
- ✅ Architecture documentation ([BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md))
- ✅ Database schema documentation ([DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md))
- ✅ API reference documentation ([API_COMPLETE_REFERENCE.md](./API_COMPLETE_REFERENCE.md))
- ✅ Onboarding guide ([BACKEND_ONBOARDING.md](./BACKEND_ONBOARDING.md))
- 📋 Task delegation system (planned)

---

**Questions?** Check the docs above or reach out to the team!

**Happy coding!** 🚀

*Last updated: October 28, 2025*
