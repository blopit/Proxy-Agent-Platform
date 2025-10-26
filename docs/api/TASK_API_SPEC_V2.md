# Task API v2 - Unified RESTful Specification

**Status**: Sprint 1.3 - TDD Design Phase
**Created**: 2025-10-25
**Version**: 2.0.0

---

## Overview

This specification consolidates 3 overlapping task APIs (tasks.py, simple_tasks.py, basic_tasks.py) into a single, clean RESTful API following industry best practices.

### Goals

1. **Single Source of Truth**: One unified task API
2. **RESTful Design**: Follow REST conventions strictly
3. **TDD Implementation**: Integration tests before implementation
4. **Dependency Injection**: Use TaskService v2 with DI
5. **Backward Compatibility**: Deprecate old endpoints gracefully

---

## API Endpoints

### Core Task CRUD

#### Create Task
```http
POST /api/v2/tasks
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication",
  "project_id": "proj_123",
  "priority": "high",
  "estimated_hours": 8.0,
  "tags": ["backend", "security"],
  "assignee": "user_456",
  "due_date": "2025-11-01T00:00:00Z"
}

Response: 201 Created
{
  "task_id": "task_789",
  "title": "Implement user authentication",
  "status": "todo",
  "priority": "high",
  "created_at": "2025-10-25T10:00:00Z",
  "updated_at": "2025-10-25T10:00:00Z"
}
```

#### Get Task
```http
GET /api/v2/tasks/{task_id}

Response: 200 OK
{
  "task_id": "task_789",
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication",
  "project_id": "proj_123",
  "status": "todo",
  "priority": "high",
  "estimated_hours": 8.0,
  "actual_hours": null,
  "tags": ["backend", "security"],
  "assignee": "user_456",
  "due_date": "2025-11-01T00:00:00Z",
  "created_at": "2025-10-25T10:00:00Z",
  "updated_at": "2025-10-25T10:00:00Z",
  "started_at": null,
  "completed_at": null
}

Errors:
- 404 Not Found: Task doesn't exist
```

#### Update Task
```http
PUT /api/v2/tasks/{task_id}
Content-Type: application/json

{
  "title": "Implement OAuth authentication",
  "status": "in_progress",
  "priority": "high",
  "actual_hours": 3.5
}

Response: 200 OK
{
  "task_id": "task_789",
  "title": "Implement OAuth authentication",
  "status": "in_progress",
  "started_at": "2025-10-25T11:00:00Z",
  "updated_at": "2025-10-25T11:00:00Z"
}

Errors:
- 404 Not Found: Task doesn't exist
- 400 Bad Request: Invalid data
```

#### Delete Task
```http
DELETE /api/v2/tasks/{task_id}

Response: 204 No Content

Errors:
- 404 Not Found: Task doesn't exist
```

#### List Tasks
```http
GET /api/v2/tasks?project_id=proj_123&status=todo&limit=50&skip=0

Response: 200 OK
{
  "tasks": [
    {
      "task_id": "task_789",
      "title": "Implement user authentication",
      "status": "todo",
      "priority": "high",
      "created_at": "2025-10-25T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "skip": 0
}

Query Parameters:
- project_id: Filter by project
- status: Filter by status (todo, in_progress, completed, blocked)
- priority: Filter by priority (low, medium, high, urgent)
- assignee: Filter by assignee
- tags: Filter by tags (comma-separated)
- limit: Max results (default: 50, max: 100)
- skip: Pagination offset (default: 0)
```

---

### Task Status Management

#### Update Task Status
```http
PATCH /api/v2/tasks/{task_id}/status
Content-Type: application/json

{
  "status": "completed"
}

Response: 200 OK
{
  "task_id": "task_789",
  "status": "completed",
  "completed_at": "2025-10-25T15:00:00Z",
  "updated_at": "2025-10-25T15:00:00Z"
}

Business Rules:
- When status → in_progress: Set started_at (if not already set)
- When status → completed: Set completed_at
- When status → blocked: Require reason (future enhancement)
```

---

### Task Search

#### Search Tasks
```http
GET /api/v2/tasks/search?q=authentication&limit=20

Response: 200 OK
{
  "results": [
    {
      "task_id": "task_789",
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication",
      "status": "todo",
      "relevance_score": 0.95
    }
  ],
  "total": 1,
  "query": "authentication"
}
```

---

### Task Statistics

#### Get Task Statistics
```http
GET /api/v2/tasks/stats?project_id=proj_123

Response: 200 OK
{
  "total_tasks": 50,
  "by_status": {
    "todo": 20,
    "in_progress": 15,
    "completed": 10,
    "blocked": 5
  },
  "by_priority": {
    "low": 10,
    "medium": 25,
    "high": 12,
    "urgent": 3
  },
  "completion_rate": 0.20,
  "average_completion_time_hours": 24.5
}
```

---

## Request/Response Models

### TaskCreateRequest
```python
class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=2000)
    project_id: str
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_hours: Decimal | None = Field(None, ge=0)
    tags: list[str] = Field(default_factory=list)
    assignee: str | None = None
    due_date: datetime | None = None
```

### TaskUpdateRequest
```python
class TaskUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    estimated_hours: Decimal | None = Field(None, ge=0)
    actual_hours: Decimal | None = Field(None, ge=0)
    tags: list[str] | None = None
    assignee: str | None = None
    due_date: datetime | None = None
```

### TaskStatusUpdateRequest
```python
class TaskStatusUpdateRequest(BaseModel):
    status: TaskStatus
```

### TaskResponse
```python
class TaskResponse(BaseModel):
    task_id: str
    title: str
    description: str
    project_id: str
    status: TaskStatus
    priority: TaskPriority
    estimated_hours: Decimal | None
    actual_hours: Decimal | None
    tags: list[str]
    assignee: str | None
    due_date: datetime | None
    created_at: datetime
    updated_at: datetime
    started_at: datetime | None
    completed_at: datetime | None
    
    @classmethod
    def from_task(cls, task: Task) -> "TaskResponse":
        """Convert domain model to API response"""
        return cls(
            task_id=task.task_id,
            title=task.title,
            description=task.description,
            project_id=task.project_id,
            status=task.status,
            priority=task.priority,
            estimated_hours=task.estimated_hours,
            actual_hours=task.actual_hours,
            tags=task.tags or [],
            assignee=task.assignee,
            due_date=task.due_date,
            created_at=task.created_at,
            updated_at=task.updated_at,
            started_at=task.started_at,
            completed_at=task.completed_at,
        )
```

### TaskListResponse
```python
class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    limit: int
    skip: int
```

---

## Error Handling

### Standard Error Response
```python
class ErrorResponse(BaseModel):
    error_code: str
    message: str
    details: dict[str, Any] | None = None
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| task_not_found | 404 | Task with given ID doesn't exist |
| project_not_found | 404 | Project with given ID doesn't exist |
| validation_error | 400 | Request data validation failed |
| invalid_status_transition | 400 | Invalid task status change |
| unauthorized | 401 | Authentication required |
| forbidden | 403 | Insufficient permissions |
| internal_error | 500 | Server error |

---

## Dependency Injection

### Service Layer Integration

```python
from fastapi import Depends
from sqlalchemy.orm import Session

from src.database.connection import get_db_session
from src.repositories.task_repository_v2 import TaskRepository
from src.repositories.project_repository_v2 import ProjectRepository
from src.services.task_service_v2 import TaskService

def get_task_service(
    db: Session = Depends(get_db_session)
) -> TaskService:
    """Dependency injection for TaskService"""
    task_repo = TaskRepository(db)
    project_repo = ProjectRepository(db)
    return TaskService(
        task_repo=task_repo,
        project_repo=project_repo
    )

@router.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    request: TaskCreateRequest,
    service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """Create a new task"""
    task = service.create_task(
        title=request.title,
        description=request.description,
        project_id=request.project_id,
        priority=request.priority,
        assignee=request.assignee
    )
    return TaskResponse.from_task(task)
```

---

## Migration Strategy

### Phase 1: Deploy v2 API (Week 3 Days 1-3)
- Create `/api/v2/tasks/*` endpoints
- Use TaskService v2 with DI
- Integration tests for all endpoints
- OpenAPI documentation

### Phase 2: Add Deprecation Warnings (Week 3 Days 4-5)
- Add deprecation headers to old endpoints:
  ```python
  @router.get("/api/v1/tasks")
  async def legacy_list_tasks():
      return Response(
          headers={
              "X-API-Deprecated": "true",
              "X-API-Sunset": "2025-12-01",
              "X-API-Replacement": "/api/v2/tasks"
          }
      )
  ```
- Log deprecation warnings
- Update documentation

### Phase 3: Client Migration (Week 4-6)
- Update frontend to use v2 API
- Update mobile clients
- Monitor v1 usage metrics

### Phase 4: Sunset v1 API (Week 8)
- Remove `/api/v1/tasks/*` endpoints
- Keep basic_tasks.py `/simple-tasks/*` for legacy clients
- Final migration complete

---

## Testing Strategy

### Integration Tests (TDD Red Phase)

```python
# tests/integration/test_task_routes.py

import pytest
from httpx import AsyncClient

@pytest.mark.integration
class TestTaskRoutes:
    """Integration tests for Task API v2"""
    
    async def test_create_task_success(self, client: AsyncClient, test_project):
        """
        GIVEN: Valid task data
        WHEN: POST /api/v2/tasks
        THEN: Task is created with 201 status
        """
        response = await client.post(
            "/api/v2/tasks",
            json={
                "title": "Test Task",
                "description": "Test Description",
                "project_id": test_project.project_id,
                "priority": "high"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["status"] == "todo"
        assert "task_id" in data
    
    async def test_create_task_project_not_found(self, client: AsyncClient):
        """
        GIVEN: Invalid project_id
        WHEN: POST /api/v2/tasks
        THEN: 404 error is returned
        """
        response = await client.post(
            "/api/v2/tasks",
            json={
                "title": "Test Task",
                "description": "Test",
                "project_id": "nonexistent_project"
            }
        )
        
        assert response.status_code == 404
        data = response.json()
        assert data["error_code"] == "project_not_found"
    
    async def test_get_task_success(self, client: AsyncClient, test_task):
        """
        GIVEN: Task exists
        WHEN: GET /api/v2/tasks/{task_id}
        THEN: Task data is returned
        """
        response = await client.get(f"/api/v2/tasks/{test_task.task_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == test_task.task_id
        assert data["title"] == test_task.title
    
    async def test_update_task_status(self, client: AsyncClient, test_task):
        """
        GIVEN: Task in todo status
        WHEN: PATCH /api/v2/tasks/{task_id}/status with in_progress
        THEN: Status updated and started_at is set
        """
        response = await client.patch(
            f"/api/v2/tasks/{test_task.task_id}/status",
            json={"status": "in_progress"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "in_progress"
        assert data["started_at"] is not None
    
    async def test_list_tasks_with_filters(self, client: AsyncClient, test_project):
        """
        GIVEN: Multiple tasks exist
        WHEN: GET /api/v2/tasks with filters
        THEN: Filtered tasks are returned
        """
        response = await client.get(
            "/api/v2/tasks",
            params={
                "project_id": test_project.project_id,
                "status": "todo",
                "limit": 10
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert "total" in data
        assert all(task["project_id"] == test_project.project_id for task in data["tasks"])
```

---

## File Structure

```
src/api/
  routes/
    __init__.py
    tasks_v2.py           # New unified task routes
    schemas/
      __init__.py
      task_schemas.py     # Request/response models
      error_schemas.py    # Error response models
  
  # Legacy (deprecated)
  tasks.py               # Keep with deprecation warnings
  simple_tasks.py        # Keep with deprecation warnings
  basic_tasks.py         # Keep for legacy /simple-tasks

tests/
  integration/
    test_task_routes.py  # API integration tests (TDD Red)
  
  conftest.py            # Add API client fixture
```

---

## Success Criteria

- [ ] All TDD integration tests passing
- [ ] OpenAPI spec generated correctly
- [ ] All CRUD operations working
- [ ] Status management with timestamp logic
- [ ] Search functionality
- [ ] Statistics endpoint
- [ ] Error handling comprehensive
- [ ] Deprecation warnings on v1 endpoints
- [ ] Documentation complete

---

**Next**: Write integration tests (TDD Red Phase)
