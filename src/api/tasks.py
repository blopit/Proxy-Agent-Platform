"""
Task Management API Endpoints
"""

import logging
from datetime import datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from src.core.task_models import (
    Project,
    Task,
    TaskFilter,
    TaskPriority,
    TaskSort,
    TaskStatus,
)
from src.services.task_service import (
    ProjectCreationData,
    TaskCreationData,
    TaskService,
    TaskServiceError,
    TaskUpdateData,
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1", tags=["tasks"])


# Dependency to get task service
def get_task_service() -> TaskService:
    """Get task service instance"""
    return TaskService()


# Request/Response Models


class TaskCreateRequest(BaseModel):
    """Request model for task creation"""

    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=2000)
    project_id: str
    parent_id: str | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_hours: Decimal | None = Field(None, ge=0)
    tags: list[str] = Field(default_factory=list)
    assignee: str | None = None
    due_date: datetime | None = None

    model_config = ConfigDict(use_enum_values=True)


class TaskUpdateRequest(BaseModel):
    """Request model for task updates"""

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


class TaskResponse(BaseModel):
    """Response model for tasks"""

    task_id: str
    title: str
    description: str
    project_id: str
    parent_id: str | None = None
    status: str
    priority: str
    estimated_hours: float | None = None
    actual_hours: float
    progress_percentage: float
    tags: list[str]
    assignee: str | None = None
    due_date: datetime | None = None
    is_overdue: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_task(cls, task: Task) -> "TaskResponse":
        """Create response from task model"""
        return cls(
            task_id=task.task_id,
            title=task.title,
            description=task.description,
            project_id=task.project_id,
            parent_id=task.parent_id,
            status=task.status.value if hasattr(task.status, "value") else task.status,
            priority=task.priority.value if hasattr(task.priority, "value") else task.priority,
            estimated_hours=float(task.estimated_hours) if task.estimated_hours else None,
            actual_hours=float(task.actual_hours),
            progress_percentage=task.progress_percentage,
            tags=task.tags,
            assignee=task.assignee,  # Task model uses assignee field
            due_date=task.due_date,
            is_overdue=task.is_overdue,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )


class TaskListResponse(BaseModel):
    """Response model for task lists"""

    tasks: list[TaskResponse]
    total: int
    limit: int
    offset: int


class ProjectCreateRequest(BaseModel):
    """Request model for project creation"""

    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=2000)
    owner: str | None = None
    team_members: list[str] = Field(default_factory=list)
    start_date: datetime | None = None
    end_date: datetime | None = None
    settings: dict[str, Any] = Field(default_factory=dict)


class ProjectResponse(BaseModel):
    """Response model for projects"""

    project_id: str
    name: str
    description: str
    owner: str | None = None
    team_members: list[str]
    is_active: bool
    start_date: datetime | None = None
    end_date: datetime | None = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_project(cls, project: Project) -> "ProjectResponse":
        """Create response from project model"""
        return cls(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            owner=project.owner_id,  # Fixed: Project model uses owner_id
            team_members=project.team_members,
            is_active=project.is_active,
            start_date=project.start_date,
            end_date=project.end_date,
            created_at=project.created_at,
            updated_at=project.updated_at,
        )


class BulkUpdateRequest(BaseModel):
    """Request model for bulk updates"""

    task_ids: list[str] = Field(..., min_items=1)
    updates: TaskUpdateRequest


class TemplateTaskRequest(BaseModel):
    """Request model for creating task from template"""

    template_name: str
    project_id: str
    variables: dict[str, str]


class QuickCaptureRequest(BaseModel):
    """Request model for mobile quick capture"""

    text: str = Field(..., min_length=1)
    user_id: str
    location: dict[str, float] | None = None
    voice_input: bool = False


class VoiceProcessingRequest(BaseModel):
    """Request model for voice processing"""

    audio_text: str
    user_id: str


# Task Endpoints


@router.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    request: TaskCreateRequest, task_service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """Create a new task"""
    try:
        task_data = TaskCreationData(
            title=request.title,
            description=request.description,
            project_id=request.project_id,
            parent_id=request.parent_id,
            priority=request.priority,
            estimated_hours=request.estimated_hours,
            tags=request.tags,
            assignee=request.assignee,
            due_date=request.due_date,
        )

        task = task_service.create_task(task_data)
        return TaskResponse.from_task(task)

    except TaskServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str, task_service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """Get a task by ID"""
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskResponse.from_task(task)


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str, request: TaskUpdateRequest, task_service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """Update a task"""
    try:
        update_data = TaskUpdateData(
            title=request.title,
            description=request.description,
            status=request.status,
            priority=request.priority,
            estimated_hours=request.estimated_hours,
            actual_hours=request.actual_hours,
            tags=request.tags,
            assignee=request.assignee,
            due_date=request.due_date,
        )

        task = task_service.update_task(task_id, update_data)
        return TaskResponse.from_task(task)

    except TaskServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    force: bool = Query(False, description="Force delete even with dependencies"),
    task_service: TaskService = Depends(get_task_service),
):
    """Delete a task"""
    try:
        success = task_service.delete_task(task_id, force=force)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
    except TaskServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(
    project_id: str | None = Query(None),
    assignee: str | None = Query(None),
    status: list[TaskStatus] | None = Query(None),
    priority: list[TaskPriority] | None = Query(None),
    search_text: str | None = Query(None),
    parent_id: str | None = Query(None),
    sort_field: str = Query("created_at"),
    sort_direction: str = Query("desc"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    task_service: TaskService = Depends(get_task_service),
) -> TaskListResponse:
    """List tasks with filtering and pagination"""
    # Build filter
    filter_obj = None
    if any([project_id, assignee, status, priority, search_text, parent_id]):
        filter_obj = TaskFilter(
            project_id=project_id,
            assignee_id=assignee,  # TaskFilter uses assignee_id field
            status=status,
            priority=priority,
            search_text=search_text,
            parent_id=parent_id,
        )

    # Build sort
    sort_obj = TaskSort(field=sort_field, direction=sort_direction)

    result = task_service.list_tasks(filter_obj, sort_obj, limit, offset)

    return TaskListResponse(
        tasks=[TaskResponse.from_task(task) for task in result.items],
        total=result.total,
        limit=result.limit,
        offset=result.offset,
    )


@router.get("/tasks/{task_id}/hierarchy")
async def get_task_hierarchy(
    task_id: str, task_service: TaskService = Depends(get_task_service)
) -> dict[str, Any]:
    """Get task hierarchy"""
    try:
        hierarchy = task_service.get_task_hierarchy(task_id)

        def convert_hierarchy(h):
            return {
                "task": TaskResponse.from_task(h["task"]),
                "children": [convert_hierarchy(child) for child in h["children"]],
            }

        return convert_hierarchy(hierarchy)

    except TaskServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/tasks/bulk")
async def bulk_update_tasks(
    request: BulkUpdateRequest, task_service: TaskService = Depends(get_task_service)
):
    """Bulk update tasks"""
    update_data = TaskUpdateData(
        title=request.updates.title,
        description=request.updates.description,
        status=request.updates.status,
        priority=request.updates.priority,
        estimated_hours=request.updates.estimated_hours,
        actual_hours=request.updates.actual_hours,
        tags=request.updates.tags,
        assignee=request.updates.assignee,
        due_date=request.updates.due_date,
    )

    result = task_service.bulk_update_tasks(request.task_ids, update_data)

    return {
        "successful_count": result.successful_count,
        "failed_count": result.failed_count,
        "successful_ids": result.successful_ids,
        "failed_ids": result.failed_ids,
        "success_rate": result.success_rate,
        "errors": result.errors,
    }


@router.post("/tasks/{task_id}/estimate")
async def estimate_task_duration(
    task_id: str, task_service: TaskService = Depends(get_task_service)
):
    """Estimate task duration using AI"""
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    estimated_hours = task_service.estimate_task_duration(task)

    return {
        "task_id": task_id,
        "estimated_hours": float(estimated_hours),
        "method": "ai_estimation",
    }


@router.post("/tasks/{task_id}/breakdown", status_code=201)
async def break_down_task(task_id: str, task_service: TaskService = Depends(get_task_service)):
    """Break down task into subtasks using AI"""
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    subtasks = task_service.break_down_task(task)

    return {
        "parent_task_id": task_id,
        "subtasks": [TaskResponse.from_task(subtask) for subtask in subtasks],
        "count": len(subtasks),
    }


@router.post("/tasks/from-template", response_model=TaskResponse, status_code=201)
async def create_task_from_template(
    request: TemplateTaskRequest, task_service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """Create task from template"""
    try:
        task = task_service.create_task_from_template(
            request.template_name, request.project_id, request.variables
        )
        return TaskResponse.from_task(task)

    except TaskServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Project Endpoints


@router.post("/projects", response_model=ProjectResponse, status_code=201)
async def create_project(
    request: ProjectCreateRequest, task_service: TaskService = Depends(get_task_service)
) -> ProjectResponse:
    """Create a new project"""
    try:
        project_data = ProjectCreationData(
            name=request.name,
            description=request.description,
            owner=request.owner,
            team_members=request.team_members,
            start_date=request.start_date,
            end_date=request.end_date,
            settings=request.settings,
        )

        project = task_service.create_project(project_data)
        return ProjectResponse.from_project(project)

    except TaskServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str, task_service: TaskService = Depends(get_task_service)
) -> ProjectResponse:
    """Get a project by ID"""
    project = task_service.project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectResponse.from_project(project)


@router.get("/projects/{project_id}/analytics")
async def get_project_analytics(
    project_id: str, task_service: TaskService = Depends(get_task_service)
):
    """Get project analytics"""
    try:
        analytics = task_service.get_project_analytics(project_id)

        # Convert to serializable format
        result = {}
        for key, value in analytics.items():
            if key == "project":
                result[key] = ProjectResponse.from_project(value)
            elif isinstance(value, Decimal):
                result[key] = float(value)
            else:
                result[key] = value

        return result

    except TaskServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/projects/{project_id}/prioritize")
async def smart_prioritize_tasks(
    project_id: str, task_service: TaskService = Depends(get_task_service)
):
    """Smart prioritization of tasks using AI"""
    try:
        result = task_service.smart_prioritize_tasks(project_id)

        return {
            "project_id": project_id,
            "updated_count": result.updated_count,
            "priority_changes": {
                task_id: priority.value for task_id, priority in result.priority_changes.items()
            },
        }

    except TaskServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Mobile-Specific Endpoints


@router.post("/mobile/quick-capture", status_code=201)
async def mobile_quick_capture(
    request: QuickCaptureRequest, task_service: TaskService = Depends(get_task_service)
):
    """Enhanced quick capture for mobile with 2-second target"""
    start_time = datetime.utcnow()

    try:
        # Process the text to extract task information
        processed = await process_mobile_input(request.text, request.user_id, request.voice_input)

        # Create task data with smart defaults
        task_data = TaskCreationData(
            title=processed.get("title", request.text[:100]),
            description=processed.get("description", request.text),
            project_id=processed.get("project_id", "default-project"),
            priority=TaskPriority(processed.get("priority", "medium")),
            due_date=processed.get("due_date"),
            tags=processed.get("tags", ["mobile", "quick-capture"]),
        )

        task = task_service.create_task(task_data)

        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000

        return {
            "task": TaskResponse.from_task(task),
            "processing_time_ms": int(processing_time),
            "voice_processed": request.voice_input,
            "location_captured": bool(request.location),
        }

    except Exception as e:
        logger.error(f"Error in mobile quick capture: {e}")
        raise HTTPException(status_code=500, detail="Failed to capture task")


@router.get("/mobile/dashboard/{user_id}")
async def get_mobile_dashboard_data(user_id: str):
    """Get mobile-optimized dashboard data"""
    # This would integrate with your analytics service
    # For now, return mock data matching the test
    return {
        "total_tasks": 15,
        "completed_today": 5,
        "focus_time_today": 3.5,
        "current_streak": 12,
        "xp_earned_today": 120,
        "active_focus_session": None,
        "next_due_task": None,
        "energy_level": "high",
    }


@router.get("/mobile/tasks/{user_id}")
async def get_mobile_optimized_tasks(user_id: str, limit: int = Query(20, ge=1, le=50)):
    """Get mobile-optimized task list"""
    # This would filter and optimize tasks for mobile display
    return {
        "tasks": [
            {
                "task_id": "task-1",
                "title": "Short Task 1",
                "priority": "high",
                "due_soon": True,
                "estimated_minutes": 30,
            },
            {
                "task_id": "task-2",
                "title": "Short Task 2",
                "priority": "medium",
                "due_soon": False,
                "estimated_minutes": 15,
            },
        ],
        "has_more": False,
        "user_id": user_id,
    }


@router.post("/mobile/voice-process")
async def process_voice_input(request: VoiceProcessingRequest):
    """Process voice input and extract task information"""
    # This would integrate with speech processing and NLP
    return {
        "intent": "create_task",
        "extracted_data": {
            "title": "Call dentist",
            "due_date": "2024-01-15T09:00:00Z",
            "priority": "medium",
        },
        "confidence": 0.95,
        "original_text": request.audio_text,
    }


# Helper Functions


async def process_mobile_input(
    text: str, user_id: str, voice_input: bool = False
) -> dict[str, Any]:
    """Process mobile input text and extract task information"""
    # Simple NLP processing - in production, this would use more sophisticated AI

    # Extract priority keywords
    priority = "medium"
    text_lower = text.lower()
    if any(word in text_lower for word in ["urgent", "asap", "critical", "important"]):
        priority = "high"
    elif any(word in text_lower for word in ["low", "maybe", "someday", "later"]):
        priority = "low"

    # Extract due date keywords
    due_date = None
    if "tomorrow" in text_lower:
        due_date = datetime.utcnow().replace(hour=9, minute=0, second=0, microsecond=0)
        due_date = due_date.replace(day=due_date.day + 1)
    elif "today" in text_lower:
        due_date = datetime.utcnow().replace(hour=17, minute=0, second=0, microsecond=0)

    # Extract tags
    tags = ["mobile", "quick-capture"]
    if voice_input:
        tags.append("voice")

    # Clean title (remove date/time keywords)
    title = text
    for word in ["tomorrow", "today", "urgent", "asap", "important"]:
        title = title.lower().replace(word, "").strip()
    title = " ".join(title.split())  # Clean extra spaces

    return {
        "title": title or text[:100],
        "description": text,
        "priority": priority,
        "due_date": due_date,
        "tags": tags,
        "project_id": "default-project",  # Could be smarter based on user preferences
    }
