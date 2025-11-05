# 🔧 Backend Services Guide

**Last Updated**: 2025-11-05
**Target Audience**: Backend developers (new and experienced)
**Prerequisite Reading**: [BACKEND_ONBOARDING.md](./BACKEND_ONBOARDING.md), [CLAUDE.md](../../CLAUDE.md)

---

## 📋 Table of Contents

- [Quick Reference](#quick-reference)
- [Service Status Matrix](#service-status-matrix)
- [Active Services](#active-services)
- [Deprecated Services](#deprecated-services)
- [Migration Guide](#migration-guide)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Reference

### What Service Do I Need?

| I Want To... | Use This Service | File Location |
|-------------|------------------|---------------|
| Create/manage tasks | `TaskServiceV2` | `src/services/task_service_v2.py` |
| Parse natural language input | `LLMCaptureService` | `src/services/llm_capture_service.py` |
| Quick 2-second capture | `QuickCaptureService` | `src/services/quick_capture_service.py` |
| Break down complex tasks | `MicroStepService` | `src/services/micro_step_service.py` |
| Delegate to humans/agents | `DelegationRepository` | `src/services/delegation/repository.py` |
| Reward task completion | `DopamineRewardService` | `src/services/dopamine_reward_service.py` |
| Organize tasks intelligently | `SecretaryService` | `src/services/secretary_service.py` |
| Tag with CHAMPS framework | `CHAMPSTagService` | `src/services/champs_tag_service.py` |
| Cache data for performance | `RedisCacheService` | `src/services/cache_service.py` |
| Monitor performance | `PerformanceService` | `src/services/performance_service.py` |

### What Agent Do I Need?

| I Want To... | Use This Agent | File Location |
|-------------|----------------|---------------|
| Process brain dumps | `CaptureAgent` | `src/agents/capture_agent.py` |
| Categorize tasks | `ClassifierAgent` | `src/agents/classifier_agent.py` |
| Break down tasks | `DecomposerAgent` | `src/agents/decomposer_agent.py` |
| Advanced task splitting | `SplitProxyAgent` | `src/agents/split_proxy_agent.py` |
| Smart task management | `TaskProxyIntelligent` | `src/agents/task_proxy_intelligent.py` |
| Manage focus sessions | `FocusProxyAdvanced` | `src/agents/focus_proxy_advanced.py` |
| Track energy levels | `EnergyProxyAdvanced` | `src/agents/energy_proxy_advanced.py` |
| Progress analytics | `ProgressProxyAdvanced` | `src/agents/progress_proxy_advanced.py` |
| Gamification logic | `GamificationProxyAdvanced` | `src/agents/gamification_proxy_advanced.py` |

---

## 📊 Service Status Matrix

### Legend
- ✅ **ACTIVE** - Current, maintained, use this
- 🔄 **MIGRATING** - In transition, prefer new version
- ⚠️ **DEPRECATED** - Don't use for new code, will be removed
- 🗑️ **REDUNDANT** - Delete after migration complete

---

## 🟢 Active Services

### Core Task Management

#### ✅ TaskServiceV2
**Status**: ACTIVE (Primary)
**File**: `src/services/task_service_v2.py`
**Why Use**: Modern, dependency injection, fully testable
**Replaces**: `TaskService` (deprecated)

```python
from src.services.task_service_v2 import TaskService
from src.repositories.task_repository_v2 import TaskRepositoryV2
from src.repositories.project_repository_v2 import ProjectRepositoryV2

# Initialize with dependencies
task_repo = TaskRepositoryV2(db)
project_repo = ProjectRepositoryV2(db)
service = TaskService(task_repo, project_repo)

# Use
task = service.create_task(
    title="New feature",
    description="Implementation details",
    project_id=project_id,
    priority=TaskPriority.HIGH
)
```

**Key Features**:
- Constructor dependency injection
- Interface-based design
- Exception handling with custom errors (`TaskNotFoundError`, `ProjectNotFoundError`)
- Full CRUD operations
- Project validation

---

### AI-Powered Capture

#### ✅ LLMCaptureService
**Status**: ACTIVE (Primary)
**File**: `src/services/llm_capture_service.py`
**Why Use**: Best for parsing natural language with context

```python
from src.services.llm_capture_service import LLMCaptureService

service = LLMCaptureService()
result = await service.parse(
    text="Email team about project by Friday",
    user_id=user_id,
    kg_context=knowledge_graph_context  # Optional
)

# Access structured task
print(result.task.title)  # "Email team about project"
print(result.task.due_date)  # "2025-11-08"
print(result.task.estimated_hours)  # 0.5
print(result.reasoning)  # AI explanation
```

**Key Features**:
- OpenAI/Anthropic LLM integration
- Knowledge Graph context awareness
- Auto-populates priority, duration, tags, due dates
- Identifies automation opportunities
- Returns confidence scores and reasoning

**Models**:
- `ParsedTask`: Structured task output
- `TaskParseResult`: Includes metadata and reasoning

---

#### ✅ QuickCaptureService
**Status**: ACTIVE (Primary)
**File**: `src/services/quick_capture_service.py`
**Why Use**: Optimized for 2-second mobile capture

```python
from src.services.quick_capture_service import QuickCaptureService

service = QuickCaptureService()
task = await service.quick_capture(
    input="Call dentist",
    user_id=user_id,
    input_type="text"  # or "voice"
)
```

**Key Features**:
- Minimal validation for speed
- Voice input support
- Offline queueing capability
- Real-time WebSocket sync
- < 2 second response time guarantee

**Use When**: Mobile app, voice capture, speed is critical

---

### Task Intelligence

#### ✅ MicroStepService
**Status**: ACTIVE (Epic 7)
**File**: `src/services/micro_step_service.py`
**Why Use**: Break overwhelming tasks into 2-minute steps

```python
from src.services.micro_step_service import MicroStepService

service = MicroStepService(task_repo)

# Decompose large task
microsteps = await service.decompose_task(
    task_id=task_id,
    max_steps=10
)

# Get next step
next_step = service.get_next_microstep(task_id)
```

**Key Features**:
- AI-powered decomposition
- 2-minute microsteps for ADHD
- Dependency tracking
- Progress visualization
- Recursive breakdown until atomic

**Use When**: Task feels overwhelming, user has ADHD, need clear next step

---

#### ✅ DelegationRepository
**Status**: ACTIVE (BE-00)
**File**: `src/services/delegation/repository.py`
**Why Use**: Epic 7 task delegation system

```python
from src.services.delegation.repository import DelegationRepository

repo = DelegationRepository(db)

# Assign to agent
assignment = repo.assign_task(
    task_id=task_id,
    assigned_to="agent:backend-tdd-1",
    delegation_mode="DELEGATE"  # DO, DO_WITH_ME, DELEGATE, DELETE
)

# Get agent tasks
tasks = repo.get_assigned_tasks("agent:backend-tdd-1")
```

**Key Features**:
- 4D delegation model (DO, DO_WITH_ME, DELEGATE, DELETE)
- Agent capability matching
- Task assignment tracking
- PRP (Prompt, Reiterate, Process) generation

**Database Tables**:
- `task_assignments`: Who owns what
- `agent_capabilities`: Available agents and skills

---

### Gamification

#### ✅ DopamineRewardService
**Status**: ACTIVE (HABIT.md)
**File**: `src/services/dopamine_reward_service.py`
**Why Use**: Variable ratio reinforcement for ADHD

```python
from src.services.dopamine_reward_service import DopamineRewardService

service = DopamineRewardService()
reward = await service.grant_task_reward(
    user_id=user_id,
    task_id=task_id,
    completion_quality=0.9
)

print(f"Earned {reward.xp} XP!")
if reward.bonus_xp:
    print(f"🎉 BONUS: +{reward.bonus_xp} XP!")
```

**Key Features**:
- Base XP + random bonuses (slot machine effect)
- Streak multipliers
- Achievement unlocking
- Level progression
- 10% chance for 2-5x bonus XP

**Use When**: Task completed, milestone reached, streak maintained

---

#### ✅ SecretaryService
**Status**: ACTIVE
**File**: `src/services/secretary_service.py`
**Why Use**: Intelligent task organization

```python
from src.services.secretary_service import SecretaryService

service = SecretaryService()
suggestions = await service.organize_tasks(user_id)
```

**Key Features**:
- Smart categorization
- Priority recommendations
- Schedule optimization
- Context-aware suggestions

---

#### ✅ CHAMPSTagService
**Status**: ACTIVE
**File**: `src/services/champs_tag_service.py`
**Why Use**: ADHD-optimized task tagging

```python
from src.services.champs_tag_service import CHAMPSTagService

service = CHAMPSTagService()
champs_data = await service.analyze_task(task)
```

**CHAMPS Framework**:
- **C**: Context (location, people)
- **H**: High-stakes (urgency, importance)
- **A**: Attention (focus level required)
- **M**: Materials (resources needed)
- **P**: Progress (trackable milestones)
- **S**: Support (help needed)

---

### Performance

#### ✅ RedisCacheService
**Status**: ACTIVE
**File**: `src/services/cache_service.py`
**Why Use**: Fast data caching

```python
from src.services.cache_service import RedisCacheService

cache = RedisCacheService()
await cache.set("user_tasks:{user_id}", tasks, ttl=300)
tasks = await cache.get(f"user_tasks:{user_id}")
```

**Key Features**:
- Redis-based caching
- TTL management
- Session storage
- Real-time data caching

---

#### ✅ PerformanceService
**Status**: ACTIVE
**File**: `src/services/performance_service.py`
**Why Use**: Monitor performance bottlenecks

```python
from src.services.performance_service import PerformanceService

service = PerformanceService()
with service.track_operation("task_creation"):
    task = create_task(...)
```

**Key Features**:
- Query performance tracking
- Slow query detection
- Resource usage monitoring

---

## 🟡 Deprecated Services

### ⚠️ TaskService (Legacy)
**Status**: DEPRECATED
**File**: `src/services/task_service.py`
**Replaced By**: `TaskServiceV2`
**Reason**: Hard-coded dependencies, not testable, no DI
**Action**: Migrate to TaskServiceV2
**Removal Date**: 2025-12-01

```python
# ❌ DON'T USE
from src.services.task_service import TaskService
service = TaskService()  # Hard-coded deps

# ✅ USE INSTEAD
from src.services.task_service_v2 import TaskService
service = TaskService(task_repo, project_repo)  # DI
```

---

### ⚠️ TaskRepository (Legacy)
**Status**: DEPRECATED
**File**: `src/repositories/task_repository.py`
**Replaced By**: `TaskRepositoryV2`
**Reason**: No interface, tight coupling
**Action**: Migrate to TaskRepositoryV2
**Removal Date**: 2025-12-01

```python
# ❌ DON'T USE
from src.repositories.task_repository import TaskRepository

# ✅ USE INSTEAD
from src.repositories.task_repository_v2 import TaskRepositoryV2
```

---

## 🗑️ Redundant Services (To Be Removed)

### API Endpoints - Multiple Overlapping Implementations

#### 🗑️ simple_tasks.py (20 endpoints)
**Status**: REDUNDANT
**File**: `src/api/simple_tasks.py`
**Replaced By**: `src/api/routes/tasks_v2_router`
**Reason**: Simplified version, now redundant with v2 API
**Action**: Remove after v2 API fully deployed

#### 🗑️ basic_tasks.py (6 endpoints)
**Status**: REDUNDANT
**File**: `src/api/basic_tasks.py`
**Replaced By**: `src/api/routes/tasks_v2_router`
**Reason**: Basic CRUD, duplicates v2 functionality
**Action**: Remove after v2 API fully deployed

#### 🗑️ tasks.py (Comprehensive)
**Status**: REDUNDANT
**File**: `src/api/tasks.py`
**Replaced By**: `src/api/routes/tasks_v2_router`
**Reason**: Uses deprecated TaskService
**Action**: Remove after v2 migration complete

**Current State**: All 3 files still included in main.py:
```python
# src/api/main.py (lines 106-127)
app.include_router(tasks_v2_router)           # ✅ NEW - Keep
app.include_router(comprehensive_task_router)  # ⚠️ DEPRECATED - Remove
app.include_router(simple_task_router)        # 🗑️ REDUNDANT - Remove
app.include_router(basic_task_router)         # 🗑️ REDUNDANT - Remove
```

**Migration Path**:
1. All new code uses `tasks_v2_router`
2. Test v2 API covers all use cases
3. Update frontend to use v2 endpoints
4. Remove redundant routers from main.py
5. Delete files

---

### Agents - Multiple Task Agents

#### 🗑️ task_agent.py (Simple)
**Status**: REDUNDANT
**File**: `src/agents/task_agent.py`
**Replaced By**: `TaskProxyIntelligent`
**Reason**: Simple version, superseded by intelligent proxy
**Action**: Remove after migration

#### 🗑️ conversational_task_agent.py
**Status**: REDUNDANT
**File**: `src/agents/conversational_task_agent.py`
**Replaced By**: `TaskProxyIntelligent` + `CaptureAgent`
**Reason**: Functionality split between capture and task proxy
**Action**: Remove after migration

**Keep**: `TaskProxyIntelligent` (most advanced, production-ready)

---

## 📦 Active Agents (Keep)

### ✅ Core Agents

| Agent | File | Purpose | Status |
|-------|------|---------|--------|
| `CaptureAgent` | `capture_agent.py` | Brain dump processing | ✅ ACTIVE |
| `ClassifierAgent` | `classifier_agent.py` | Task categorization | ✅ ACTIVE |
| `DecomposerAgent` | `decomposer_agent.py` | Task breakdown | ✅ ACTIVE |
| `SplitProxyAgent` | `split_proxy_agent.py` | Advanced splitting (Epic 7) | ✅ ACTIVE |
| `TaskProxyIntelligent` | `task_proxy_intelligent.py` | Smart task management | ✅ ACTIVE |
| `FocusProxyAdvanced` | `focus_proxy_advanced.py` | Focus session management | ✅ ACTIVE |
| `EnergyProxyAdvanced` | `energy_proxy_advanced.py` | Energy tracking/prediction | ✅ ACTIVE |
| `ProgressProxyAdvanced` | `progress_proxy_advanced.py` | Progress analytics | ✅ ACTIVE |
| `GamificationProxyAdvanced` | `gamification_proxy_advanced.py` | XP/achievements | ✅ ACTIVE |

---

## 🔄 Migration Guide

### Migrating from TaskService → TaskServiceV2

**Before (Deprecated)**:
```python
from src.services.task_service import TaskService

service = TaskService()
task = service.create_task(
    title="My task",
    description="Details",
    user_id=user_id
)
```

**After (Current)**:
```python
from src.services.task_service_v2 import TaskService
from src.repositories.task_repository_v2 import TaskRepositoryV2
from src.repositories.project_repository_v2 import ProjectRepositoryV2
from src.database.enhanced_adapter import get_enhanced_database

# Setup dependencies
db = get_enhanced_database()
task_repo = TaskRepositoryV2(db)
project_repo = ProjectRepositoryV2(db)
service = TaskService(task_repo, project_repo)

# Use service
task = service.create_task(
    title="My task",
    description="Details",
    project_id=project_id,  # Now required!
    priority=TaskPriority.MEDIUM
)
```

**Key Changes**:
1. Must inject repositories via constructor
2. `project_id` is now required (validates project exists)
3. Use `TaskPriority` enum instead of strings
4. Better error handling with custom exceptions

---

### Migrating API Endpoints

**Before (simple_tasks.py)**:
```python
# src/api/simple_tasks.py
@router.post("/api/v1/simple-tasks")
async def create_simple_task(request: TaskRequest):
    service = TaskService()  # ❌ Hard-coded
    return service.create_task(...)
```

**After (tasks_v2_router)**:
```python
# src/api/routes/tasks_v2.py
@router.post("/api/v2/tasks")
async def create_task(
    request: TaskCreateRequest,
    service: TaskService = Depends(get_task_service)  # ✅ DI
):
    return service.create_task(...)
```

**Benefits**:
- Dependency injection for testability
- Consistent error handling
- OpenAPI documentation
- Better validation with Pydantic

---

## 🎓 Common Patterns

### Pattern 1: Service with Dependency Injection

```python
# ✅ CORRECT Pattern
class MyService:
    def __init__(
        self,
        repo: MyRepositoryInterface,
        cache: CacheService,
        logger: Logger
    ):
        self.repo = repo
        self.cache = cache
        self.logger = logger

    def my_method(self, data: MyModel) -> Result:
        # Use injected dependencies
        cached = self.cache.get(data.id)
        if cached:
            return cached

        result = self.repo.fetch(data.id)
        self.cache.set(data.id, result)
        return result
```

### Pattern 2: Repository with Auto-Derived Names

```python
# ✅ CORRECT Pattern
from src.repositories.enhanced_repositories import BaseRepository

class TaskRepository(BaseRepository[Task]):
    def __init__(self, db):
        super().__init__()  # Auto-derives table="tasks", pk="task_id"

    def find_by_user_id(self, user_id: str) -> list[Task]:
        query = "SELECT * FROM tasks WHERE user_id = ?"
        return self._fetch_many(query, (user_id,))
```

**Key Points**:
- Entity-specific primary keys: `task_id`, `user_id`, `project_id`
- NOT generic `id`
- Auto-derived from class name

### Pattern 3: FastAPI Dependency Injection

```python
# ✅ CORRECT Pattern
from fastapi import Depends, APIRouter

router = APIRouter()

def get_task_repo(db = Depends(get_db)) -> TaskRepositoryV2:
    return TaskRepositoryV2(db)

def get_task_service(
    task_repo: TaskRepositoryV2 = Depends(get_task_repo),
    project_repo: ProjectRepositoryV2 = Depends(get_project_repo)
) -> TaskService:
    return TaskService(task_repo, project_repo)

@router.post("/tasks")
async def create_task(
    request: TaskCreateRequest,
    service: TaskService = Depends(get_task_service)
):
    return service.create_task(**request.dict())
```

---

## 🐛 Troubleshooting

### Issue: "TaskService has no constructor parameters"

**Problem**: Using deprecated TaskService
**Solution**: Migrate to TaskServiceV2 with DI

```python
# ❌ Error
from src.services.task_service import TaskService
service = TaskService(task_repo)  # Error: unexpected argument

# ✅ Fix
from src.services.task_service_v2 import TaskService
service = TaskService(task_repo, project_repo)  # Works!
```

---

### Issue: "Table 'id' does not exist"

**Problem**: Using generic `id` instead of entity-specific PK
**Solution**: Use entity-specific primary keys

```python
# ❌ Wrong
task = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))

# ✅ Correct
task = db.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
```

---

### Issue: "Multiple task endpoints, which one to use?"

**Problem**: Redundant API endpoints
**Solution**: Always use v2 API

```python
# ❌ Wrong
POST /api/v1/simple-tasks     # Deprecated
POST /api/v1/basic-tasks      # Deprecated
POST /api/v1/tasks            # Deprecated

# ✅ Correct
POST /api/v2/tasks            # Current
```

---

## 📚 Related Documentation

### Essential Reading
1. **[BACKEND_ONBOARDING.md](./BACKEND_ONBOARDING.md)** - Setup guide
2. **[CLAUDE.md](../../CLAUDE.md)** - Development standards
3. **[NAMING_CONVENTIONS.md](../design/NAMING_CONVENTIONS.md)** - Naming standards
4. **[BACKEND_GUIDE.md](./BACKEND_GUIDE.md)** - Architecture overview

### Deep Dive
- **[API_REFERENCE.md](../api/API_REFERENCE.md)** - Complete API docs
- **[TESTING_STRATEGY.md](../testing/TESTING_STRATEGY.md)** - Testing guide
- **[Epic 7 - Task Splitting](../tasks/backend/00_task_delegation_system.md)** - Delegation system

---

## ✅ Quick Checklist for New Backend Developers

When starting a new feature:

- [ ] Use `TaskServiceV2`, not `TaskService`
- [ ] Use `TaskRepositoryV2`, not `TaskRepository`
- [ ] Use v2 API endpoints (`/api/v2/*`)
- [ ] Inject dependencies via constructor
- [ ] Use entity-specific primary keys (`task_id`, not `id`)
- [ ] Follow TDD: Write test first, then implementation
- [ ] Use `LLMCaptureService` for AI parsing
- [ ] Use `QuickCaptureService` for fast mobile capture
- [ ] Use `MicroStepService` for task breakdown
- [ ] Use `DopamineRewardService` for gamification

---

**Questions?** Check [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) or ask in #backend-dev
