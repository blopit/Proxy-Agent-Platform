"""
Task request/response schemas for API v2
"""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from src.core.task_models import Task, TaskPriority, TaskStatus


class TaskCreateRequest(BaseModel):
    """Request model for creating a new task"""

    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: str = Field(..., max_length=2000, description="Task description")
    project_id: str = Field(..., description="Parent project ID")
    priority: TaskPriority = Field(
        default=TaskPriority.MEDIUM, description="Task priority"
    )
    estimated_hours: Decimal | None = Field(
        None, ge=0, description="Estimated hours to complete"
    )
    tags: list[str] = Field(default_factory=list, description="Task tags")
    assignee: str | None = Field(None, description="Assigned user ID")
    due_date: datetime | None = Field(None, description="Task due date")

    model_config = ConfigDict(
        use_enum_values=True,
        json_schema_extra={
            "example": {
                "title": "Implement user authentication",
                "description": "Add JWT-based authentication system",
                "project_id": "proj_123",
                "priority": "high",
                "estimated_hours": 8.0,
                "tags": ["backend", "security"],
                "assignee": "user_456",
                "due_date": "2025-11-01T00:00:00Z",
            }
        },
    )


class TaskUpdateRequest(BaseModel):
    """Request model for updating an existing task"""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    estimated_hours: Decimal | None = Field(None, ge=0)
    actual_hours: Decimal | None = Field(None, ge=0)
    tags: list[str] | None = None
    assignee: str | None = None
    due_date: datetime | None = None

    model_config = ConfigDict(use_enum_values=True)


class TaskStatusUpdateRequest(BaseModel):
    """Request model for updating task status"""

    status: TaskStatus = Field(..., description="New task status")

    model_config = ConfigDict(
        use_enum_values=True,
        json_schema_extra={"example": {"status": "in_progress"}},
    )


class TaskResponse(BaseModel):
    """Response model for a single task"""

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

    model_config = ConfigDict(from_attributes=True, use_enum_values=False)

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


class TaskListResponse(BaseModel):
    """Response model for task list with pagination"""

    tasks: list[TaskResponse]
    total: int = Field(..., description="Total number of tasks matching filters")
    limit: int = Field(..., description="Maximum results per page")
    skip: int = Field(..., description="Number of results skipped")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tasks": [
                    {
                        "task_id": "task_789",
                        "title": "Implement authentication",
                        "status": "todo",
                        "priority": "high",
                    }
                ],
                "total": 1,
                "limit": 50,
                "skip": 0,
            }
        }
    )


class TaskSearchResultItem(BaseModel):
    """Single search result item"""

    task_id: str
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    relevance_score: float = Field(..., ge=0, le=1, description="Search relevance (0-1)")

    model_config = ConfigDict(from_attributes=True)


class TaskSearchResponse(BaseModel):
    """Response model for task search"""

    results: list[TaskSearchResultItem]
    total: int = Field(..., description="Total matching results")
    query: str = Field(..., description="Search query used")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "results": [
                    {
                        "task_id": "task_789",
                        "title": "Implement user authentication",
                        "description": "Add JWT-based auth",
                        "status": "todo",
                        "priority": "high",
                        "relevance_score": 0.95,
                    }
                ],
                "total": 1,
                "query": "authentication",
            }
        }
    )


class TaskStatsResponse(BaseModel):
    """Response model for task statistics"""

    total_tasks: int
    by_status: dict[str, int] = Field(..., description="Task counts by status")
    by_priority: dict[str, int] = Field(..., description="Task counts by priority")
    completion_rate: float = Field(
        ..., ge=0, le=1, description="Percentage of completed tasks"
    )
    average_completion_time_hours: float | None = Field(
        None, description="Average time to complete tasks (hours)"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_tasks": 50,
                "by_status": {"todo": 20, "in_progress": 15, "completed": 10, "blocked": 5},
                "by_priority": {"low": 10, "medium": 25, "high": 12, "urgent": 3},
                "completion_rate": 0.20,
                "average_completion_time_hours": 24.5,
            }
        }
    )
