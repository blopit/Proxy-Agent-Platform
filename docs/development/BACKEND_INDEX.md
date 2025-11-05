# 🗂️ Backend Documentation Index

**Quick navigation for all backend documentation**

---

## 🚀 Getting Started (Read in Order)

1. **[START_HERE.md](../../START_HERE.md)** ⭐ (5 min)
   - Project overview and quick start

2. **[BACKEND_ONBOARDING.md](./BACKEND_ONBOARDING.md)** ⭐ (2-3 hours)
   - Complete setup checklist
   - First PR walkthrough
   - Day 1-5 guide

3. **[CLAUDE.md](../../CLAUDE.md)** ⭐⭐⭐ **REQUIRED** (30 min)
   - Development standards
   - TDD methodology
   - Code style and conventions

4. **[BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md)** ⭐ (20 min)
   - All services explained
   - What's active vs deprecated
   - Quick reference tables

5. **[BACKEND_GUIDE.md](./BACKEND_GUIDE.md)** (45 min)
   - Architecture deep dive
   - Layer responsibilities
   - Development workflow

---

## 📖 Core Documentation

### Architecture
- **[System Overview](../architecture/system-overview.md)** - High-level architecture
- **[BACKEND_GUIDE.md](./BACKEND_GUIDE.md)** - Backend-specific architecture
- **[NAMING_CONVENTIONS.md](../design/NAMING_CONVENTIONS.md)** - Database and code naming

### Services
- **[BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md)** ⭐ - Complete services reference
  - Active services (use these)
  - Deprecated services (don't use)
  - Migration guides

### API
- **[API Reference](../api/API_REFERENCE.md)** - All 86 endpoints documented
- **[API README](../api/README.md)** - API overview and examples
- **[API Patterns](../../frontend/API_PATTERNS.md)** - Frontend integration

### Testing
- **[TESTING_STRATEGY.md](../testing/TESTING_STRATEGY.md)** - Testing approach
- **[TEST_SUITE_IMPROVEMENTS.md](../../TEST_SUITE_IMPROVEMENTS.md)** - Current test status

---

## 🎯 Feature Implementation Guides

### Epic 7: Task Splitting & Delegation
- **[BE-00: Task Delegation System](../tasks/backend/00_task_delegation_system.md)** - Delegation system (CRITICAL)
- **[BE-01: Task Templates](../tasks/backend/01_task_templates_service.md)** - Template system
- **[BE-02: User Pets Service](../tasks/backend/02_user_pets_service.md)** - Gamification pets
- **[BE-03: Focus Sessions](../tasks/backend/03_focus_sessions_service.md)** - Pomodoro system
- **[BE-04: Gamification Enhancements](../tasks/backend/04_gamification_enhancements.md)** - XP system

### ADHD Optimization
- **[ADHD_TASK_MANAGEMENT_MASTER.md](../ADHD_TASK_MANAGEMENT_MASTER.md)** - Complete ADHD system vision
- **[CHAMPS_FRAMEWORK.md](../design/CHAMPS_FRAMEWORK.md)** - CHAMPS tagging system

---

## 🔧 Development Resources

### Quick Reference
- **[BACKEND_RESOURCES.md](./BACKEND_RESOURCES.md)** - Tools, libraries, learning materials
- **[TECH_STACK.md](../TECH_STACK.md)** - Technology decisions

### Advanced Topics
- **[BACKEND_REFACTORING_PLAN.md](./BACKEND_REFACTORING_PLAN.md)** - Planned refactoring
- **[BACKEND_TECHNICAL_ASSESSMENT.md](./BACKEND_TECHNICAL_ASSESSMENT.md)** - Technical debt analysis
- **[ZERO_DOWNTIME_MIGRATION.md](./ZERO_DOWNTIME_MIGRATION.md)** - Migration strategy

---

## 🗺️ Service Quick Reference

### ✅ Active Services (Use These)

| Service | Purpose | File | When To Use |
|---------|---------|------|-------------|
| **TaskServiceV2** | Task CRUD with DI | `task_service_v2.py` | Any task operations |
| **LLMCaptureService** | AI task parsing | `llm_capture_service.py` | Natural language input |
| **QuickCaptureService** | 2-second capture | `quick_capture_service.py` | Mobile, speed critical |
| **MicroStepService** | Task breakdown | `micro_step_service.py` | Complex tasks |
| **DelegationRepository** | Task delegation | `delegation/repository.py` | Assign to humans/agents |
| **DopamineRewardService** | Gamification | `dopamine_reward_service.py` | Task completion rewards |
| **SecretaryService** | Smart organization | `secretary_service.py` | Task organization |
| **CHAMPSTagService** | ADHD tagging | `champs_tag_service.py` | ADHD optimization |
| **RedisCacheService** | Caching | `cache_service.py` | Performance optimization |
| **PerformanceService** | Monitoring | `performance_service.py` | Performance tracking |

### ⚠️ Deprecated Services (Don't Use)

| Service | Replaced By | Reason |
|---------|-------------|--------|
| TaskService | TaskServiceV2 | No DI, not testable |
| TaskRepository | TaskRepositoryV2 | No interface |
| simple_tasks.py | tasks_v2_router | Redundant API |
| basic_tasks.py | tasks_v2_router | Redundant API |
| tasks.py | tasks_v2_router | Uses deprecated service |
| task_agent.py | TaskProxyIntelligent | Simple version |
| conversational_task_agent.py | CaptureAgent + TaskProxyIntelligent | Functionality split |

**See**: [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md) for complete details

---

## 🤖 Agent Quick Reference

### ✅ Active Agents

| Agent | Purpose | File |
|-------|---------|------|
| **CaptureAgent** | Brain dump processing | `capture_agent.py` |
| **ClassifierAgent** | Task categorization | `classifier_agent.py` |
| **DecomposerAgent** | Task breakdown | `decomposer_agent.py` |
| **SplitProxyAgent** | Advanced splitting | `split_proxy_agent.py` |
| **TaskProxyIntelligent** | Smart task management | `task_proxy_intelligent.py` |
| **FocusProxyAdvanced** | Focus sessions | `focus_proxy_advanced.py` |
| **EnergyProxyAdvanced** | Energy tracking | `energy_proxy_advanced.py` |
| **ProgressProxyAdvanced** | Progress analytics | `progress_proxy_advanced.py` |
| **GamificationProxyAdvanced** | XP/achievements | `gamification_proxy_advanced.py` |

---

## 📊 Repository Pattern

### ✅ Active Repositories

All repositories extend `BaseRepository[T]` with **entity-specific primary keys**:

```python
# ✅ CORRECT: Entity-specific PKs
sessions.session_id
tasks.task_id
users.user_id
projects.project_id

# ❌ WRONG: Generic id
*.id
```

**Available Repositories**:
- `TaskRepositoryV2` - Task data access (✅ Use this)
- `ProjectRepositoryV2` - Project data access (✅ Use this)
- `GoalRepository` - Goal tracking
- `HabitRepository` - Habit tracking
- `ShoppingListRepository` - Shopping lists

**Deprecated**:
- `TaskRepository` - Use `TaskRepositoryV2` instead

---

## 🌐 API Endpoints

### Current API: `/api/v2/*`

**86 Total Endpoints** across 12 modules:

| Module | Count | Prefix | Status |
|--------|-------|--------|--------|
| Tasks V2 | 5 | `/api/v2/tasks` | ✅ ACTIVE |
| Delegation | - | `/api/v1/delegation` | ✅ ACTIVE (BE-00) |
| Templates | - | `/api/v1/templates` | ✅ ACTIVE (BE-01) |
| Workflows | - | `/api/v1/workflows` | ✅ ACTIVE |
| Integrations | - | `/api/v1/integrations` | ✅ ACTIVE |
| Capture | 4 | `/api/v1/capture` | ✅ ACTIVE |
| Auth | 5 | `/api/v1/auth` | ✅ ACTIVE |
| Focus | 5 | `/api/v1/focus` | ✅ ACTIVE |
| Energy | 6 | `/api/v1/energy` | ✅ ACTIVE |
| Progress | 6 | `/api/v1/progress` | ✅ ACTIVE |
| Gamification | 6 | `/api/v1/gamification` | ✅ ACTIVE |
| Rewards | 4 | `/api/v1/rewards` | ✅ ACTIVE |

### Deprecated APIs

| Module | Status | Reason |
|--------|--------|--------|
| Simple Tasks (20 endpoints) | 🗑️ REDUNDANT | Use Tasks V2 |
| Basic Tasks (6 endpoints) | 🗑️ REDUNDANT | Use Tasks V2 |
| Comprehensive Tasks | ⚠️ DEPRECATED | Uses old TaskService |

**See**: [API_REFERENCE.md](../api/API_REFERENCE.md) for complete endpoint documentation

---

## 🧪 Testing

### Test Files Location

```
src/
├── services/
│   └── tests/           # Service layer tests
├── api/
│   └── tests/           # API endpoint tests
├── agents/
│   └── tests/           # Agent tests
└── repositories/
    └── tests/           # Repository tests
```

### Running Tests

```bash
# All tests
uv run pytest

# Specific service
uv run pytest src/services/tests/test_task_service_v2.py -v

# With coverage
uv run pytest --cov=src --cov-report=html

# Watch mode (TDD)
uv run pytest-watch
```

**See**: [TESTING_STRATEGY.md](../testing/TESTING_STRATEGY.md)

---

## 🔍 Common Tasks

### I want to...

**Create a new service:**
1. Read [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) - "Adding a New Service"
2. Follow TDD: Write test first
3. Use dependency injection
4. Add to [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md)

**Add a new API endpoint:**
1. Read [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) - "Adding a New API Endpoint"
2. Use `/api/v2/*` prefix
3. Inject dependencies with `Depends()`
4. Write integration tests

**Add a new database table:**
1. Read [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) - "Adding a New Database Table"
2. Create Alembic migration: `uv run alembic revision -m "description"`
3. Use entity-specific primary key (e.g., `task_id`, not `id`)
4. Create Pydantic model
5. Create repository extending `BaseRepository[T]`

**Add a new AI agent:**
1. Read [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) - "Adding a New Agent"
2. Extend base agent pattern
3. Use PydanticAI
4. Write comprehensive tests
5. Register in agent registry

**Migrate deprecated code:**
1. Read [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md) - "Migration Guide"
2. Follow step-by-step instructions
3. Update tests
4. Mark old code as deprecated

---

## ❓ Troubleshooting

### Common Issues

1. **"TaskService has no constructor parameters"**
   - Using deprecated `TaskService`
   - Switch to `TaskServiceV2` with DI

2. **"Table 'id' does not exist"**
   - Using generic `id` instead of entity-specific PK
   - Use `task_id`, `user_id`, `project_id`, etc.

3. **"Which task endpoint to use?"**
   - Use `/api/v2/tasks`
   - Avoid `/api/v1/simple-tasks`, `/api/v1/basic-tasks`

4. **"Import errors"**
   - Activate venv: `source .venv/bin/activate`
   - Reinstall: `uv sync`

**See**: [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md) - "Troubleshooting" section

---

## 📞 Getting Help

### Documentation
1. Check this index
2. Search [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md)
3. Read [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)
4. Check [CLAUDE.md](../../CLAUDE.md)

### Code Examples
```bash
# Find similar implementations
rg "class.*Service" src/services/

# Find usage examples
rg "TaskServiceV2" src/

# Find tests
rg "def test.*task" src/
```

### Ask For Help
- **Architecture questions**: Team Lead
- **Test questions**: QA Lead
- **DevOps questions**: DevOps Engineer
- **Stuck on anything**: Don't hesitate to ask!

---

## 📈 Project Status

**Current Status**: ~55% complete (honest assessment)

**What's Working**:
- ✅ Task management (CRUD, delegation, breakdown)
- ✅ AI capture (LLM parsing, quick capture)
- ✅ Gamification (XP, rewards, achievements)
- ✅ Database layer (11 tables, tested)
- ✅ Test suite (887 tests, 0 errors)

**In Progress**:
- 🔄 Epic 7: Task splitting & delegation
- 🔄 Migration to v2 APIs
- 🔄 Agent intelligence improvements

**See**: [PLATFORM_STATUS.md](../../reports/current/PLATFORM_STATUS.md)

---

## ✅ New Developer Checklist

**Day 1**:
- [ ] Read this index
- [ ] Complete [BACKEND_ONBOARDING.md](./BACKEND_ONBOARDING.md)
- [ ] Read [CLAUDE.md](../../CLAUDE.md) (REQUIRED)
- [ ] Set up development environment
- [ ] Run tests successfully

**Week 1**:
- [ ] Read [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md)
- [ ] Read [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)
- [ ] Make first PR
- [ ] Understand service layer architecture

**Month 1**:
- [ ] Comfortable with TDD workflow
- [ ] Can add new services/endpoints
- [ ] Can review PRs
- [ ] Contribute to documentation

---

**Last Updated**: 2025-11-05
**Maintained By**: Backend Team

**Found an issue with the docs?** Submit a PR or open an issue!
