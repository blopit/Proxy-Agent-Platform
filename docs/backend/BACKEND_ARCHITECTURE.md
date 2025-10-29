# Backend Architecture Documentation

**Last Updated**: October 28, 2025
**Version**: 0.1.0
**Status**: Active Development

---

## Table of Contents

- [Overview](#overview)
- [Architecture Layers](#architecture-layers)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [Core Systems](#core-systems)
- [Design Patterns](#design-patterns)
- [Data Flow](#data-flow)
- [Security](#security)
- [Performance](#performance)

---

## Overview

The Proxy Agent Platform backend is a **FastAPI-based Python application** designed for ADHD-optimized productivity. It follows a **clean, layered architecture** with strict separation of concerns.

### Key Characteristics

- **Language**: Python 3.11+
- **Package Manager**: UV (blazing-fast)
- **Framework**: FastAPI (async-first)
- **Database**: PostgreSQL (prod) / SQLite (dev)
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **AI Integration**: PydanticAI
- **Testing**: pytest with 95%+ coverage goal
- **Code Quality**: Ruff (formatter + linter), mypy (type checking)

### Architecture Philosophy

1. **KISS** (Keep It Simple, Stupid) - Simple solutions over complex ones
2. **YAGNI** (You Aren't Gonna Need It) - Build only what's needed now
3. **TDD** (Test-Driven Development) - Tests first, implementation second
4. **DDD** (Domain-Driven Design) - Models represent business domain
5. **SOLID Principles** - Especially Dependency Inversion and Single Responsibility

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (FastAPI)                     │
│  • REST endpoints (JSON)                                    │
│  • WebSocket connections (real-time)                        │
│  • Request validation (Pydantic schemas)                    │
│  • Response serialization                                   │
│  • Authentication & authorization                           │
│  • Error handling & logging                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Services Layer                           │
│  • Business logic implementation                            │
│  • Workflow orchestration                                   │
│  • Multi-repository coordination                            │
│  • Cross-cutting concerns (caching, events)                 │
│  • External service integration                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                Agents Layer (PydanticAI)                    │
│  • Task Proxy Agent (task intelligence)                    │
│  • Focus Proxy Agent (session management)                  │
│  • Energy Proxy Agent (burnout prevention)                 │
│  • Progress Proxy Agent (achievements)                     │
│  • AI-powered decision making                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                Repositories Layer                           │
│  • Data access abstraction (Repository Pattern)            │
│  • CRUD operations (Create, Read, Update, Delete)          │
│  • Query building                                           │
│  • Transaction management                                   │
│  • Entity-specific primary keys (task_id, user_id, etc.)   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  Database Layer                             │
│  • PostgreSQL (production)                                  │
│  • SQLite (development)                                     │
│  • SQLAlchemy ORM                                           │
│  • Alembic migrations                                       │
│  • Connection pooling                                       │
└─────────────────────────────────────────────────────────────┘

Supporting Layers:

┌─────────────────────────────────────────────────────────────┐
│                    Memory Layer (mem0ai)                    │
│  • Long-term memory storage                                 │
│  • User context persistence                                 │
│  • Pattern recognition                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Knowledge Layer (Future: Neo4j)                │
│  • Knowledge graph storage                                  │
│  • Relationship mapping                                     │
│  • Context retrieval                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Language** | Python | 3.11+ | Backend implementation |
| **Package Manager** | UV | Latest | Dependency management |
| **Web Framework** | FastAPI | 0.104+ | HTTP/WebSocket API |
| **ORM** | SQLAlchemy | 2.0+ | Database abstraction |
| **Migrations** | Alembic | 1.12+ | Schema versioning |
| **Validation** | Pydantic | 2.0+ | Data validation |
| **AI Framework** | PydanticAI | 0.0.14+ | AI agent orchestration |
| **Testing** | pytest | 8.4+ | Test framework |
| **Linting** | Ruff | Latest | Code formatting & linting |
| **Type Checking** | mypy | 1.6+ | Static type analysis |

### AI Providers

| Provider | Use Case | Models |
|----------|----------|---------|
| **OpenAI** | Task processing, NLP | GPT-4, GPT-3.5-turbo |
| **Anthropic** | Complex reasoning | Claude 3 Opus, Sonnet |
| **Google** | Alternative LLM | Gemini Pro |
| **Ollama** | Local inference | Llama 2, Mistral |

### Databases

| Database | Environment | Purpose |
|----------|-------------|---------|
| **PostgreSQL** | Production | Primary data store |
| **SQLite** | Development | Local development |
| **Redis** | All | Caching, real-time features |

### Supporting Services

- **mem0ai**: Long-term memory for agents
- **Celery**: Background task processing
- **Redis**: Caching and pub/sub
- **Structlog**: Structured logging

---

## Directory Structure

```
src/
├── __init__.py                   # Package initialization
├── conftest.py                   # Pytest shared fixtures
│
├── api/                          # 🌐 API Layer (HTTP/WebSocket)
│   ├── main.py                   # FastAPI app factory, CORS, lifespan
│   ├── auth.py                   # Authentication endpoints
│   ├── basic_tasks.py            # Legacy basic task endpoints
│   ├── capture.py                # Brain dump capture system
│   ├── compass.py                # Compass zones (Work/Life/Self)
│   ├── energy.py                 # Energy level tracking
│   ├── focus.py                  # Pomodoro/focus sessions
│   ├── gamification.py           # XP, achievements
│   ├── progress.py               # Progress tracking
│   ├── rewards.py                # Dopamine reward system
│   ├── ritual.py                 # Morning ritual
│   ├── secretary.py              # Intelligent organization
│   ├── simple_tasks.py           # Legacy simple tasks
│   ├── tasks.py                  # Comprehensive task API (v1)
│   ├── websocket.py              # Real-time WebSocket manager
│   ├── routes/                   # 📁 Organized route modules
│   │   ├── __init__.py
│   │   ├── tasks_v2.py          # NEW: v2 Task API with DI
│   │   └── schemas/              # Request/response schemas
│   └── tests/                    # API integration tests
│
├── agents/                       # 🤖 AI Agents Layer (PydanticAI)
│   ├── base.py                   # Base agent interface
│   ├── focus_agent.py            # Focus session agent
│   ├── task_agent.py             # Task processing agent
│   ├── registry.py               # Agent registry/factory
│   └── tests/                    # Agent unit tests
│
├── services/                     # 💼 Services Layer (Business Logic)
│   ├── cache_service.py          # Caching abstraction
│   ├── champs_tag_service.py     # CHAMPS framework tagging
│   ├── database_optimizer.py     # Query optimization
│   ├── dopamine_reward_service.py # Reward calculations
│   ├── llm_capture_service.py    # LLM-powered capture
│   ├── micro_step_service.py     # Micro-step generation
│   ├── performance_service.py    # Performance monitoring
│   ├── quick_capture_service.py  # 2-second task capture
│   ├── secretary_service.py      # Intelligent organization
│   ├── task_queue_service.py     # Background task queue
│   ├── task_service.py           # Task business logic (v1)
│   ├── task_service_v2.py        # Task business logic (v2 with DI)
│   └── tests/                    # Service unit tests
│
├── repositories/                 # 🗄️ Repositories Layer (Data Access)
│   ├── enhanced_repositories.py  # Base repository with auto-derivation
│   ├── enhanced_repositories_extensions.py # Repository extensions
│   ├── goal_repository.py        # Goal data access
│   ├── habit_repository.py       # Habit tracking data access
│   ├── interfaces.py             # Repository interfaces
│   ├── project_repository_v2.py  # Project data access
│   ├── shopping_list_repository.py # Shopping list data access
│   ├── task_repository.py        # Task data access (v1)
│   ├── task_repository_v2.py     # Task data access (v2)
│   └── tests/                    # Repository unit tests
│
├── core/                         # 🎯 Core Domain Models
│   ├── models.py                 # Shared Pydantic models
│   └── tests/                    # Model unit tests
│
├── database/                     # 💾 Database Layer
│   ├── adapter.py                # Database connection adapter
│   ├── connection.py             # Connection management (SQLAlchemy)
│   ├── enhanced_adapter.py       # Extended adapter with optimizations
│   ├── models.py                 # SQLAlchemy ORM models
│   ├── seed_data.py              # Database seeding script
│   ├── migrations/               # Alembic migrations
│   │   ├── env.py               # Alembic environment
│   │   ├── script.py.mako       # Migration template
│   │   └── versions/            # Migration versions
│   └── tests/                    # Database tests
│
├── memory/                       # 🧠 Memory Layer (mem0ai)
│   ├── client.py                 # Memory client wrapper
│   └── tests/                    # Memory tests
│
├── knowledge/                    # 🔗 Knowledge Graph Layer (Future)
│   └── tests/                    # Knowledge graph tests
│
├── cli/                          # 🖥️ CLI Layer
│   ├── main.py                   # CLI entry point
│   └── tests/                    # CLI tests
│
└── mcp/                          # 🔌 MCP Integration (Model Context Protocol)
    └── tests/                    # MCP tests
```

### Key Files by Purpose

#### Application Entry Points
- `src/api/main.py` - FastAPI application
- `src/cli/main.py` - CLI commands
- `simple_cli.py` - Simple CLI wrapper

#### Configuration
- `pyproject.toml` - Project metadata, dependencies, tool config
- `.env` - Environment variables (not in repo)
- `CLAUDE.md` - Development standards and guidelines

#### Core Business Logic
- `src/services/task_service_v2.py` - Main task management
- `src/services/micro_step_service.py` - ADHD task splitting
- `src/services/quick_capture_service.py` - 2-second capture

#### Data Models
- `src/database/models.py` - SQLAlchemy ORM models
- `src/core/models.py` - Pydantic domain models
- `src/api/routes/schemas/` - API request/response schemas

---

## Core Systems

### 1. Task Management System

**Purpose**: ADHD-optimized task capture, splitting, and execution

**Key Components**:
- `Task` model with Epic 7 task splitting fields
- `MicroStep` model (1-10 minute chunks)
- Task delegation system (DO/DO_WITH_ME/DELEGATE/DELETE)
- Recursive task decomposition

**Database Tables**:
- `tasks` - Main task table
- `micro_steps` - Sub-task steps (1-10 min)
- `task_comments` - Task discussions
- `projects` - Task grouping

**API Endpoints**:
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - List tasks
- `PUT /api/v1/tasks/{task_id}` - Update task
- `POST /api/v1/tasks/{task_id}/split` - Split into micro-steps
- `POST /api/v1/tasks/{task_id}/complete` - Mark complete

### 2. Compass Zone System

**Purpose**: Organize tasks by life area (Work/Life/Self)

**Key Components**:
- `CompassZone` model
- User-customizable zones
- Visual color coding
- Simple goal setting per zone

**Database Tables**:
- `compass_zones` - Zone definitions

**API Endpoints**:
- `GET /api/v1/compass/zones` - List zones
- `POST /api/v1/compass/zones` - Create zone
- `PUT /api/v1/compass/zones/{zone_id}` - Update zone

### 3. Gamification System

**Purpose**: ADHD-friendly motivation through XP, achievements, and rewards

**Key Components**:
- XP per task completion (10-100 XP)
- Achievements and badges
- Streak tracking
- Dopamine reward system

**Database Tables**:
- `achievements` - Achievement definitions
- `user_achievements` - Unlocked achievements
- (XP tracked in user preferences)

**API Endpoints**:
- `GET /api/v1/gamification/xp` - Get XP balance
- `GET /api/v1/gamification/achievements` - List achievements
- `POST /api/v1/gamification/unlock` - Unlock achievement

### 4. Focus Session System

**Purpose**: Pomodoro-style focus tracking with interruption logging

**Key Components**:
- `FocusSession` model
- Timer functionality
- Interruption counter
- Task association

**Database Tables**:
- `focus_sessions` - Focus session records

**API Endpoints**:
- `POST /api/v1/focus/sessions` - Start session
- `PUT /api/v1/focus/sessions/{session_id}/complete` - End session
- `GET /api/v1/focus/sessions/stats` - Session statistics

### 5. Energy Tracking System

**Purpose**: Manual energy level logging for burnout prevention

**Key Components**:
- `EnergySnapshot` model
- 3-level energy (Low/Medium/High)
- Time-of-day tracking
- Pattern analysis

**Database Tables**:
- `energy_snapshots` - Energy records

**API Endpoints**:
- `POST /api/v1/energy/snapshots` - Log energy
- `GET /api/v1/energy/snapshots` - Get history
- `GET /api/v1/energy/patterns` - Analyze patterns

### 6. Capture System

**Purpose**: 2-second brain dump for ADHD users

**Key Components**:
- LLM-powered parsing
- Fuzzy intent matching
- Quick task/thought capture
- Minimal friction UX

**API Endpoints**:
- `POST /api/v1/capture` - Quick capture
- `POST /api/quick-capture` - Legacy endpoint

### 7. Morning Ritual System

**Purpose**: Daily planning with 3-task focus selection

**Key Components**:
- `MorningRitual` model
- 3 focus tasks per day
- Completion tracking
- Skip functionality

**Database Tables**:
- `morning_rituals` - Daily ritual records

**API Endpoints**:
- `POST /api/v1/ritual/complete` - Complete ritual
- `GET /api/v1/ritual/today` - Today's ritual

### 8. WebSocket System

**Purpose**: Real-time updates across devices

**Key Components**:
- Connection manager
- Channel-based broadcasting
- User-specific notifications
- Connection statistics

**WebSocket Endpoints**:
- `WS /ws/{user_id}` - User connection
- Channels: `tasks`, `focus`, `energy`, `progress`

---

## Design Patterns

### 1. Repository Pattern

**Enhanced BaseRepository** with auto-derivation:

```python
class TaskRepository(BaseRepository[Task]):
    def __init__(self):
        super().__init__()  # Auto-derives "tasks" table and "task_id" primary key
```

**Benefits**:
- Consistent data access
- Easy mocking for tests
- Centralized query logic
- Type-safe operations

**Naming Convention**:
- Table: `{entity}s` (plural)
- Primary key: `{entity}_id`
- Foreign key: `{referenced_entity}_id`

### 2. Dependency Injection

**FastAPI-based DI**:

```python
def get_task_service(
    repo: TaskRepository = Depends(get_task_repository)
) -> TaskService:
    return TaskService(repo)

@router.post("/tasks")
async def create_task(
    request: TaskCreate,
    service: TaskService = Depends(get_task_service)
):
    return await service.create_task(request)
```

### 3. Service Layer Pattern

**Business logic separation**:

```python
class TaskService:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    async def create_task(self, request: TaskCreate) -> Task:
        # Business logic
        # Validation
        # Side effects (events, cache)
        return task
```

### 4. Agent Pattern (PydanticAI)

**AI-powered intelligence**:

```python
class TaskAgent:
    def __init__(self):
        self.agent = Agent(
            model="openai:gpt-4",
            system_prompt="You are a task assistant..."
        )

    async def analyze_task(self, task: Task) -> dict:
        return await self.agent.run(f"Analyze: {task.title}")
```

---

## Data Flow

### Request Flow Example: Create Task

```
1. HTTP Request
   POST /api/v1/tasks
   Body: { "title": "Write docs", "description": "Backend docs" }
   ↓
2. FastAPI Route Handler (src/api/routes/tasks_v2.py)
   - Request validation (Pydantic)
   - Dependency injection
   ↓
3. Service Layer (src/services/task_service_v2.py)
   - Business logic
   - Validation
   - Call AI agent (optional)
   ↓
4. Repository Layer (src/repositories/task_repository_v2.py)
   - Build SQL query
   - Execute transaction
   ↓
5. Database Layer (src/database/connection.py)
   - SQLAlchemy ORM
   - PostgreSQL/SQLite
   ↓
6. Response Flow (reverse)
   Database → Repository → Service → API → HTTP Response
   ↓
7. Side Effects (async)
   - Emit WebSocket event
   - Update cache
   - Log activity
```

---

## Security

### Authentication

- **JWT tokens** for user authentication
- **Password hashing** with bcrypt
- **Email validation** with email-validator

### Authorization

- **User-scoped queries** (can only access own tasks)
- **API key protection** for external services
- **CORS middleware** with allowed origins

### Data Protection

- **Environment variables** for secrets
- **Pydantic validation** for all inputs
- **SQL injection prevention** via parameterized queries
- **Rate limiting** (future: via middleware)

---

## Performance

### Database Optimizations

1. **Indexes** on frequently queried fields:
   - `tasks.user_id`
   - `tasks.status`
   - `tasks.due_date`
   - `tasks.zone_id`

2. **Connection Pooling**:
   - PostgreSQL: QueuePool (10 connections + 20 overflow)
   - SQLite: NullPool (no pooling)

3. **Query Optimization**:
   - Eager loading for relationships
   - Pagination for large result sets
   - Projection (select only needed fields)

### Caching Strategy

- **Redis** for frequently accessed data
- **Cache invalidation** on updates
- **TTL-based expiration**

### Async/Await

- **Async routes** for I/O-bound operations
- **Background tasks** with Celery
- **Concurrent operations** with asyncio.gather()

---

## Next Steps

1. **Read**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Full schema documentation
2. **Read**: [API_REFERENCE.md](./API_REFERENCE.md) - Complete API documentation
3. **Read**: [SERVICES_GUIDE.md](./SERVICES_GUIDE.md) - Service layer deep dive
4. **Implement**: Task Delegation System (BE-00) - See [docs/tasks/backend/00_task_delegation_system.md](../tasks/backend/00_task_delegation_system.md)

---

**Questions?** See [BACKEND_GUIDE.md](../development/BACKEND_GUIDE.md) or ask in the team chat.
