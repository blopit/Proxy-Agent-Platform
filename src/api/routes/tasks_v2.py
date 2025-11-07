"""
Task API v2 Routes - Unified RESTful API

This module implements the consolidated Task API using TaskService v2
with dependency injection for full testability.
"""

import logging
from datetime import UTC

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from src.api.routes.schemas import (
    TaskCreateRequest,
    TaskListResponse,
    TaskResponse,
    TaskSearchResponse,
    TaskSearchResultItem,
    TaskStatsResponse,
    TaskStatusUpdateRequest,
    TaskUpdateRequest,
)
from src.core.task_models import TaskPriority, TaskStatus
from src.database.connection import get_db_session
from src.repositories.project_repository_v2 import ProjectRepository
from src.repositories.task_repository_v2 import TaskRepository
from src.services.task_service_v2 import (
    ProjectNotFoundError,
    TaskNotFoundError,
    TaskService,
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v2", tags=["tasks-v2"])


# ============================================================================
# Dependency Injection
# ============================================================================


def get_task_service(db: Session = Depends(get_db_session)) -> TaskService:
    """
    Dependency injection for TaskService

    Args:
        db: Database session (injected)

    Returns:
        TaskService instance with injected repositories
    """
    task_repo = TaskRepository(db)
    project_repo = ProjectRepository(db)
    return TaskService(task_repo=task_repo, project_repo=project_repo)


# ============================================================================
# CRUD Endpoints
# ============================================================================


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    request: TaskCreateRequest, service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """
    Create a new task

    Args:
        request: Task creation data
        service: Task service (injected)

    Returns:
        Created task

    Raises:
        404: Project not found
        400: Validation error
    """
    try:
        task = service.create_task(
            title=request.title,
            description=request.description,
            project_id=request.project_id,
            priority=request.priority,
            assignee=request.assignee,
        )

        return TaskResponse.from_task(task)

    except ProjectNotFoundError as e:
        logger.warning(f"Create task failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "project_not_found",
                "message": str(e),
                "details": {"project_id": e.project_id},
            },
        )
    except Exception as e:
        logger.error(f"Unexpected error creating task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error_code": "internal_error", "message": "Internal server error"},
        )


# ============================================================================
# Search & Statistics (MUST come before /{task_id} route)
# ============================================================================


@router.get("/tasks/search", response_model=TaskSearchResponse)
async def search_tasks(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Maximum results"),
    service: TaskService = Depends(get_task_service),
) -> TaskSearchResponse:
    """
    Search tasks by query string

    Args:
        q: Search query (searches title and description)
        limit: Max results
        service: Task service (injected)

    Returns:
        Search results with relevance scores
    """
    tasks = service.search_tasks(q)

    # Limit results
    tasks = tasks[:limit]

    # Convert to search result items with basic relevance scoring
    results = []
    for task in tasks:
        # Simple relevance: exact match in title = 1.0, in description = 0.5
        q_lower = q.lower()
        relevance = 0.0
        if q_lower in task.title.lower():
            relevance = 0.95
        elif q_lower in task.description.lower():
            relevance = 0.75
        else:
            relevance = 0.5

        results.append(
            TaskSearchResultItem(
                task_id=task.task_id,
                title=task.title,
                description=task.description,
                status=task.status,
                priority=task.priority,
                relevance_score=relevance,
            )
        )

    return TaskSearchResponse(results=results, total=len(results), query=q)


@router.get("/tasks/stats", response_model=TaskStatsResponse)
async def get_task_stats(
    project_id: str | None = Query(None, description="Filter by project ID"),
    service: TaskService = Depends(get_task_service),
) -> TaskStatsResponse:
    """
    Get task statistics

    Args:
        project_id: Optional project filter
        service: Task service (injected)

    Returns:
        Task statistics
    """
    # Get tasks
    if project_id:
        tasks = service.list_tasks_by_project(project_id)
    else:
        tasks = service.task_repo.list_all()

    # Calculate statistics
    total_tasks = len(tasks)

    # Count by status
    by_status = {}
    for status_enum in TaskStatus:
        count = sum(1 for t in tasks if t.status == status_enum)
        if count > 0:
            by_status[status_enum.value] = count

    # Count by priority
    by_priority = {}
    for priority_enum in TaskPriority:
        count = sum(1 for t in tasks if t.priority == priority_enum)
        if count > 0:
            by_priority[priority_enum.value] = count

    # Completion rate
    completed_count = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED)
    completion_rate = completed_count / total_tasks if total_tasks > 0 else 0.0

    # Average completion time
    completed_tasks_with_times = [
        t
        for t in tasks
        if t.status == TaskStatus.COMPLETED
        and t.started_at is not None
        and t.completed_at is not None
    ]

    avg_completion_time = None
    if completed_tasks_with_times:
        total_hours = sum(
            (t.completed_at - t.started_at).total_seconds() / 3600
            for t in completed_tasks_with_times
        )
        avg_completion_time = total_hours / len(completed_tasks_with_times)

    return TaskStatsResponse(
        total_tasks=total_tasks,
        by_status=by_status,
        by_priority=by_priority,
        completion_rate=completion_rate,
        average_completion_time_hours=avg_completion_time,
    )


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, service: TaskService = Depends(get_task_service)) -> TaskResponse:
    """
    Get task by ID

    Args:
        task_id: Task identifier
        service: Task service (injected)

    Returns:
        Task data

    Raises:
        404: Task not found
    """
    try:
        task = service.get_task(task_id)
        return TaskResponse.from_task(task)

    except TaskNotFoundError as e:
        logger.warning(f"Get task failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "task_not_found",
                "message": str(e),
                "details": {"task_id": e.task_id},
            },
        )


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str, request: TaskUpdateRequest, service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """
    Update task

    Args:
        task_id: Task identifier
        request: Update data
        service: Task service (injected)

    Returns:
        Updated task

    Raises:
        404: Task not found
        400: Validation error
    """
    try:
        # Get existing task first to verify it exists
        task = service.get_task(task_id)

        # Build updates dictionary from request (only non-None fields)
        updates = {}
        if request.title is not None:
            updates["title"] = request.title
        if request.description is not None:
            updates["description"] = request.description
        if request.status is not None:
            # Handle both enum and string (use_enum_values=True makes it a string)
            updates["status"] = (
                request.status if isinstance(request.status, str) else request.status.value
            )
        if request.priority is not None:
            # Handle both enum and string (use_enum_values=True makes it a string)
            updates["priority"] = (
                request.priority if isinstance(request.priority, str) else request.priority.value
            )
        if request.estimated_hours is not None:
            updates["estimated_hours"] = request.estimated_hours
        if request.actual_hours is not None:
            updates["actual_hours"] = request.actual_hours
        if request.tags is not None:
            updates["tags"] = request.tags
        if request.assignee is not None:
            updates["assignee"] = request.assignee
        if request.due_date is not None:
            updates["due_date"] = request.due_date

        # If status is being updated, use update_task_status for proper timestamp management
        if "status" in updates:
            status_enum = TaskStatus(updates.pop("status"))
            task = service.update_task_status(task_id, status_enum)

        # Apply other updates if any
        if updates:
            from datetime import datetime

            updates["updated_at"] = datetime.now(UTC)
            updated_task = service.task_repo.update(task_id, updates)
            if not updated_task:
                raise TaskNotFoundError(task_id)
            task = updated_task

        return TaskResponse.from_task(task)

    except TaskNotFoundError as e:
        logger.warning(f"Update task failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "task_not_found",
                "message": str(e),
                "details": {"task_id": e.task_id},
            },
        )


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, service: TaskService = Depends(get_task_service)) -> None:
    """
    Delete task

    Args:
        task_id: Task identifier
        service: Task service (injected)

    Raises:
        404: Task not found
    """
    try:
        # Verify task exists first
        service.get_task(task_id)

        # Delete the task
        deleted = service.delete_task(task_id)
        if not deleted:
            raise TaskNotFoundError(task_id)

    except TaskNotFoundError as e:
        logger.warning(f"Delete task failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "task_not_found",
                "message": str(e),
                "details": {"task_id": e.task_id},
            },
        )


@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(
    project_id: str | None = Query(None, description="Filter by project ID"),
    status: str | None = Query(None, description="Filter by status"),
    priority: str | None = Query(None, description="Filter by priority"),
    assignee: str | None = Query(None, description="Filter by assignee"),
    limit: int = Query(50, ge=1, le=100, description="Maximum results"),
    skip: int = Query(0, ge=0, description="Results to skip"),
    service: TaskService = Depends(get_task_service),
) -> TaskListResponse:
    """
    List tasks with optional filters and pagination

    Args:
        project_id: Filter by project
        status: Filter by status
        priority: Filter by priority
        assignee: Filter by assignee
        limit: Max results (1-100)
        skip: Pagination offset
        service: Task service (injected)

    Returns:
        Paginated list of tasks
    """
    # Get filtered tasks
    tasks = []

    if project_id:
        tasks = service.list_tasks_by_project(project_id)
    elif status:
        tasks = service.list_tasks_by_status(TaskStatus(status))
    elif assignee:
        tasks = service.list_tasks_by_assignee(assignee)
    else:
        # List all tasks (using repository directly for now)
        tasks = service.task_repo.list_all(skip=skip, limit=limit)

    # Apply additional filters if needed
    if tasks and status and not any([project_id]):
        # Handle both enum and string status values
        tasks = [
            t
            for t in tasks
            if (t.status.value if hasattr(t.status, "value") else t.status) == status
        ]
    if tasks and priority:
        # Handle both enum and string priority values
        tasks = [
            t
            for t in tasks
            if (t.priority.value if hasattr(t.priority, "value") else t.priority) == priority
        ]
    if tasks and assignee and not any([project_id, status]):
        tasks = [t for t in tasks if t.assignee == assignee]

    # Apply pagination manually for filtered results
    total = len(tasks)
    tasks = tasks[skip : skip + limit]

    # Convert to response models
    task_responses = [TaskResponse.from_task(task) for task in tasks]

    return TaskListResponse(tasks=task_responses, total=total, limit=limit, skip=skip)


# ============================================================================
# Status Management
# ============================================================================


@router.patch("/tasks/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: str, request: TaskStatusUpdateRequest, service: TaskService = Depends(get_task_service)
) -> TaskResponse:
    """
    Update task status with automatic timestamp management

    Args:
        task_id: Task identifier
        request: Status update data
        service: Task service (injected)

    Returns:
        Updated task

    Raises:
        404: Task not found
    """
    try:
        task = service.update_task_status(task_id, request.status)
        return TaskResponse.from_task(task)

    except TaskNotFoundError as e:
        logger.warning(f"Update task status failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "task_not_found",
                "message": str(e),
                "details": {"task_id": e.task_id},
            },
        )
