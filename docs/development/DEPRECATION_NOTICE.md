# ⚠️ Deprecation Notice

**Last Updated**: 2025-11-05

This document lists all deprecated services, APIs, and code that should not be used for new development.

---

## 🔴 Deprecated Services

### TaskService (src/services/task_service.py)

**Status**: ⚠️ DEPRECATED
**Deprecated Date**: 2025-11-05
**Removal Date**: 2025-12-01
**Replaced By**: `TaskServiceV2`

**Reason**:
- Hard-coded dependencies (not testable)
- No dependency injection
- Tight coupling to database

**Migration Path**:
```python
# ❌ OLD (Deprecated)
from src.services.task_service import TaskService
service = TaskService()

# ✅ NEW (Use This)
from src.services.task_service_v2 import TaskService
from src.repositories.task_repository_v2 import TaskRepositoryV2
from src.repositories.project_repository_v2 import ProjectRepositoryV2

task_repo = TaskRepositoryV2(db)
project_repo = ProjectRepositoryV2(db)
service = TaskService(task_repo, project_repo)
```

**Action Required**:
1. Update all imports to `task_service_v2`
2. Add dependency injection
3. Update tests to use mocks
4. File will be removed 2025-12-01

---

### TaskRepository (src/repositories/task_repository.py)

**Status**: ⚠️ DEPRECATED
**Deprecated Date**: 2025-11-05
**Removal Date**: 2025-12-01
**Replaced By**: `TaskRepositoryV2`

**Reason**:
- No interface definition
- Tight coupling to implementation
- Not easily testable

**Migration Path**:
```python
# ❌ OLD (Deprecated)
from src.repositories.task_repository import TaskRepository
repo = TaskRepository(db)

# ✅ NEW (Use This)
from src.repositories.task_repository_v2 import TaskRepositoryV2
repo = TaskRepositoryV2(db)
```

**Action Required**:
1. Update all imports to `task_repository_v2`
2. Implement `TaskRepositoryInterface` if creating custom repo
3. File will be removed 2025-12-01

---

## 🗑️ Redundant API Endpoints

### simple_tasks.py (20 endpoints)

**Status**: 🗑️ REDUNDANT
**Deprecated Date**: 2025-11-05
**Removal Date**: 2025-12-15
**Replaced By**: `/api/v2/tasks`

**Affected Endpoints**:
```
POST   /api/v1/simple-tasks
GET    /api/v1/simple-tasks
GET    /api/v1/simple-tasks/{task_id}
PUT    /api/v1/simple-tasks/{task_id}
DELETE /api/v1/simple-tasks/{task_id}
... (15 more)
```

**Migration Path**:
```python
# ❌ OLD (Redundant)
POST /api/v1/simple-tasks

# ✅ NEW (Use This)
POST /api/v2/tasks
```

**Action Required**:
1. Update frontend to use `/api/v2/tasks`
2. Remove from `main.py` after frontend migration
3. File will be removed 2025-12-15

---

### basic_tasks.py (6 endpoints)

**Status**: 🗑️ REDUNDANT
**Deprecated Date**: 2025-11-05
**Removal Date**: 2025-12-15
**Replaced By**: `/api/v2/tasks`

**Affected Endpoints**:
```
POST   /api/v1/basic-tasks
GET    /api/v1/basic-tasks
GET    /api/v1/basic-tasks/{task_id}
PUT    /api/v1/basic-tasks/{task_id}
DELETE /api/v1/basic-tasks/{task_id}
PATCH  /api/v1/basic-tasks/{task_id}/status
```

**Migration Path**:
```python
# ❌ OLD (Redundant)
POST /api/v1/basic-tasks

# ✅ NEW (Use This)
POST /api/v2/tasks
```

**Action Required**:
1. Update frontend to use `/api/v2/tasks`
2. Remove from `main.py` after frontend migration
3. File will be removed 2025-12-15

---

### tasks.py (Comprehensive endpoints)

**Status**: 🗑️ REDUNDANT
**Deprecated Date**: 2025-11-05
**Removal Date**: 2025-12-15
**Replaced By**: `/api/v2/tasks`

**Reason**:
- Uses deprecated `TaskService`
- Inconsistent with v2 API design
- Functionality duplicated in v2

**Migration Path**:
```python
# ❌ OLD (Redundant)
POST /api/v1/tasks

# ✅ NEW (Use This)
POST /api/v2/tasks
```

**Action Required**:
1. Migrate all endpoints to v2
2. Update frontend
3. Remove from `main.py`
4. File will be removed 2025-12-15

---

## 🤖 Deprecated Agents

### task_agent.py (Simple Task Agent)

**Status**: 🗑️ REDUNDANT
**Deprecated Date**: 2025-11-05
**Removal Date**: 2025-12-20
**Replaced By**: `TaskProxyIntelligent`

**Reason**:
- Simple version superseded by intelligent proxy
- Missing advanced features
- Not actively maintained

**Migration Path**:
```python
# ❌ OLD (Redundant)
from src.agents.task_agent import TaskAgent
agent = TaskAgent()

# ✅ NEW (Use This)
from src.agents.task_proxy_intelligent import TaskProxyIntelligent
agent = TaskProxyIntelligent()
```

**Action Required**:
1. Update to `TaskProxyIntelligent`
2. Test advanced features (scheduling, energy-aware)
3. File will be removed 2025-12-20

---

### conversational_task_agent.py

**Status**: 🗑️ REDUNDANT
**Deprecated Date**: 2025-11-05
**Removal Date**: 2025-12-20
**Replaced By**: `CaptureAgent` + `TaskProxyIntelligent`

**Reason**:
- Functionality split between capture and task management
- Better separation of concerns in new design

**Migration Path**:
```python
# ❌ OLD (Redundant)
from src.agents.conversational_task_agent import ConversationalTaskAgent
agent = ConversationalTaskAgent()

# ✅ NEW (Use This)
# For capture: Use CaptureAgent
from src.agents.capture_agent import CaptureAgent
capture_agent = CaptureAgent()

# For task management: Use TaskProxyIntelligent
from src.agents.task_proxy_intelligent import TaskProxyIntelligent
task_agent = TaskProxyIntelligent()
```

**Action Required**:
1. Split functionality between capture and task agents
2. Update integration points
3. File will be removed 2025-12-20

---

## 📅 Removal Timeline

| Date | Action | Items |
|------|--------|-------|
| **2025-11-05** | Marked deprecated | TaskService, TaskRepository, simple/basic/tasks APIs, task agents |
| **2025-11-15** | Warning phase begins | Console warnings added to deprecated code |
| **2025-11-25** | Final migration deadline | All code must use v2 APIs and services |
| **2025-12-01** | Remove services | TaskService, TaskRepository deleted |
| **2025-12-15** | Remove API endpoints | simple_tasks.py, basic_tasks.py, tasks.py deleted |
| **2025-12-20** | Remove agents | task_agent.py, conversational_task_agent.py deleted |

---

## 🔄 Migration Support

### Check Your Code

Run this script to find deprecated usage:

```bash
# Find deprecated TaskService usage
rg "from src.services.task_service import TaskService" src/

# Find deprecated TaskRepository usage
rg "from src.repositories.task_repository import TaskRepository" src/

# Find deprecated API endpoints
rg "/api/v1/(simple-tasks|basic-tasks|tasks)" src/

# Find deprecated agents
rg "from src.agents.(task_agent|conversational_task_agent)" src/
```

### Migration Checklist

**For Services**:
- [ ] Replace `TaskService` with `TaskServiceV2`
- [ ] Replace `TaskRepository` with `TaskRepositoryV2`
- [ ] Add dependency injection to constructor
- [ ] Update tests to use mocks
- [ ] Verify all tests pass

**For API Endpoints**:
- [ ] Update frontend to use `/api/v2/tasks`
- [ ] Update API documentation
- [ ] Test all endpoints work correctly
- [ ] Remove old endpoints from `main.py`

**For Agents**:
- [ ] Replace simple agents with advanced versions
- [ ] Update agent registry
- [ ] Test agent functionality
- [ ] Update documentation

---

## 🆘 Need Help?

### Migration Questions
- **General**: Check [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md) - "Migration Guide"
- **Services**: See [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) - "Service Layer Pattern"
- **APIs**: See [API_REFERENCE.md](../api/API_REFERENCE.md)

### Blockers
- **Can't migrate yet**: Document reason, create issue, set timeline
- **Breaking changes**: Coordinate with team, plan staged rollout
- **Questions**: Ask in #backend-dev channel

---

## 📝 Adding Deprecation Warnings

### In Python Code

```python
import warnings

class TaskService:
    """
    DEPRECATED: Use TaskServiceV2 instead

    This class will be removed in version 1.0.0 (2025-12-01)
    """

    def __init__(self):
        warnings.warn(
            "TaskService is deprecated. Use TaskServiceV2 with dependency injection instead. "
            "See DEPRECATION_NOTICE.md for migration guide.",
            DeprecationWarning,
            stacklevel=2
        )
        # ... implementation
```

### In API Endpoints

```python
@router.post("/api/v1/simple-tasks")
async def create_simple_task(request: TaskRequest):
    """
    DEPRECATED: Use POST /api/v2/tasks instead

    This endpoint will be removed on 2025-12-15
    """
    warnings.warn(
        "POST /api/v1/simple-tasks is deprecated. Use POST /api/v2/tasks instead.",
        DeprecationWarning,
        stacklevel=2
    )
    # ... implementation
```

---

## 📊 Migration Progress Tracking

### Services Migration

| Service | Status | Owner | Deadline | Progress |
|---------|--------|-------|----------|----------|
| TaskService → TaskServiceV2 | 🟡 In Progress | Backend Team | 2025-12-01 | 60% |
| TaskRepository → TaskRepositoryV2 | 🟡 In Progress | Backend Team | 2025-12-01 | 60% |

### API Migration

| Endpoint Group | Status | Owner | Deadline | Progress |
|---------------|--------|-------|----------|----------|
| simple_tasks.py | 🟡 In Progress | Full Stack Team | 2025-12-15 | 40% |
| basic_tasks.py | 🟡 In Progress | Full Stack Team | 2025-12-15 | 40% |
| tasks.py | 🟡 In Progress | Full Stack Team | 2025-12-15 | 40% |

### Agent Migration

| Agent | Status | Owner | Deadline | Progress |
|-------|--------|-------|----------|----------|
| task_agent.py | 🔴 Not Started | Backend Team | 2025-12-20 | 0% |
| conversational_task_agent.py | 🔴 Not Started | Backend Team | 2025-12-20 | 0% |

**Legend**:
- 🟢 Complete
- 🟡 In Progress
- 🔴 Not Started
- ⏸️ Blocked

---

## ✅ Post-Deprecation Checklist

After removing deprecated code:

- [ ] Update documentation to remove references
- [ ] Remove deprecation warnings
- [ ] Update CHANGELOG.md
- [ ] Announce in team channels
- [ ] Update version number (semantic versioning)

---

**Last Updated**: 2025-11-05
**Next Review**: 2025-11-15

**Questions?** See [BACKEND_SERVICES_GUIDE.md](./BACKEND_SERVICES_GUIDE.md) or ask in #backend-dev
