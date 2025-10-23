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
    MicroStep,
    Project,
    Task,
    TaskFilter,
    TaskPriority,
    TaskScope,
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


class MicroStepResponse(BaseModel):
    """Response model for micro-steps"""

    step_id: str
    step_number: int
    description: str
    estimated_minutes: int
    delegation_mode: str
    status: str
    actual_minutes: int | None = None
    completed_at: datetime | None = None

    @classmethod
    def from_micro_step(cls, step: MicroStep) -> "MicroStepResponse":
        """Create response from micro-step model"""
        return cls(
            step_id=step.step_id,
            step_number=step.step_number,
            description=step.description,
            estimated_minutes=step.estimated_minutes,
            delegation_mode=step.delegation_mode,
            status=step.status,
            actual_minutes=step.actual_minutes,
            completed_at=step.completed_at,
        )


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
    micro_steps: list[MicroStepResponse] = Field(default_factory=list)

    @classmethod
    def from_task(cls, task: Task, micro_steps: list[MicroStep] | None = None) -> "TaskResponse":
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
            micro_steps=[MicroStepResponse.from_micro_step(s) for s in (micro_steps or [])],
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

    task_ids: list[str] = Field(..., min_length=1)
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
    auto_mode: bool = True  # AI extrapolation mode
    ask_for_clarity: bool = False  # Generate clarifying questions


class VoiceProcessingRequest(BaseModel):
    """Request model for voice processing"""

    audio_text: str
    user_id: str


class SplitTaskRequest(BaseModel):
    """Request model for task splitting"""

    user_id: str


class CompleteMicroStepRequest(BaseModel):
    """Request model for completing a micro-step"""

    actual_minutes: int | None = None


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
    from src.core.task_models import MicroStep, DelegationMode, TaskStatus
    from datetime import datetime

    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Epic 7 Phase 7.2: Query micro_steps from separate table
    db = task_service.get_db()
    conn = db.get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT step_id, step_number, description, estimated_minutes,
               delegation_mode, status, actual_minutes, created_at, completed_at
        FROM micro_steps
        WHERE parent_task_id = ?
        ORDER BY step_number
    """, (task_id,))

    rows = cursor.fetchall()
    micro_steps = []
    for row in rows:
        # Convert database row to MicroStep object
        micro_step = MicroStep(
            step_id=row[0],
            parent_task_id=task_id,
            step_number=row[1],
            description=row[2],
            estimated_minutes=row[3],
            delegation_mode=DelegationMode(row[4]) if row[4] else DelegationMode.DO,
            status=TaskStatus(row[5]) if row[5] else TaskStatus.TODO,
            actual_minutes=row[6],
            created_at=datetime.fromisoformat(row[7]) if row[7] else datetime.utcnow(),
            completed_at=datetime.fromisoformat(row[8]) if row[8] else None
        )
        micro_steps.append(micro_step)

    return TaskResponse.from_task(task, micro_steps)


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


# Epic 7: ADHD Task Splitting Endpoints


@router.post("/tasks/{task_id}/split")
async def split_task(
    task_id: str,
    request: SplitTaskRequest,
    task_service: TaskService = Depends(get_task_service)
):
    """Split a task into ADHD-optimized micro-steps using AI"""
    from src.agents.split_proxy_agent import SplitProxyAgent

    # Get task
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check if task already has micro-steps
    db = task_service.get_db()
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT step_id, parent_task_id, step_number, description, estimated_minutes,
               delegation_mode, status, actual_minutes, created_at, completed_at
        FROM micro_steps
        WHERE parent_task_id = ?
        ORDER BY step_number
    """, (task_id,))

    existing_steps = cursor.fetchall()

    if existing_steps:
        # Return existing micro-steps
        micro_steps = []
        for row in existing_steps:
            micro_steps.append({
                "step_id": row[0],
                "step_number": row[2],
                "description": row[3],
                "estimated_minutes": row[4],
                "delegation_mode": row[5],
                "status": row[6]
            })

        return {
            "task_id": task_id,
            "scope": task.scope if hasattr(task, "scope") else "multi",
            "micro_steps": micro_steps,
            "next_action": micro_steps[0] if micro_steps else None,
            "total_estimated_minutes": sum(s["estimated_minutes"] for s in micro_steps)
        }

    # Use Split Proxy Agent to generate micro-steps
    agent = SplitProxyAgent()
    result = await agent.split_task(task, request.user_id)

    # Save micro-steps to database if generated
    if result.get("micro_steps"):
        for step_data in result["micro_steps"]:
            cursor.execute("""
                INSERT INTO micro_steps
                (step_id, parent_task_id, step_number, description, estimated_minutes,
                 delegation_mode, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                step_data["step_id"],
                task_id,
                step_data["step_number"],
                step_data["description"],
                step_data["estimated_minutes"],
                step_data["delegation_mode"],
                step_data["status"],
                datetime.utcnow().isoformat()
            ))
        conn.commit()

    return result


@router.patch("/micro-steps/{step_id}/complete")
async def complete_micro_step(
    step_id: str,
    request: CompleteMicroStepRequest,
    task_service: TaskService = Depends(get_task_service)
):
    """Complete a micro-step and award XP (dopamine hit!)"""
    db = task_service.get_db()
    conn = db.get_connection()
    cursor = conn.cursor()

    # Get micro-step
    cursor.execute("""
        SELECT step_id, parent_task_id, step_number, description, estimated_minutes,
               delegation_mode, status, created_at
        FROM micro_steps
        WHERE step_id = ?
    """, (step_id,))

    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Micro-step not found")

    # Calculate actual minutes if not provided
    actual_minutes = request.actual_minutes
    if actual_minutes is None:
        # Calculate from created_at to now
        created_at = datetime.fromisoformat(row[7])
        duration = datetime.utcnow() - created_at
        actual_minutes = max(1, int(duration.total_seconds() / 60))

    # Update micro-step
    completed_at = datetime.utcnow()
    cursor.execute("""
        UPDATE micro_steps
        SET status = 'completed',
            actual_minutes = ?,
            completed_at = ?
        WHERE step_id = ?
    """, (actual_minutes, completed_at.isoformat(), step_id))
    conn.commit()

    # Calculate XP reward (ADHD dopamine hit!)
    # Base XP: 10 points per step
    # Bonus: +5 if completed faster than estimated
    # Bonus: +10 if first step of the day
    base_xp = 10
    speed_bonus = 5 if actual_minutes <= row[4] else 0  # row[4] = estimated_minutes
    xp_earned = base_xp + speed_bonus

    return {
        "step_id": step_id,
        "status": "completed",
        "actual_minutes": actual_minutes,
        "completed_at": completed_at,
        "xp_earned": xp_earned,
        "message": "Great job! Keep the momentum going!" if speed_bonus > 0 else "Step completed!"
    }


@router.get("/tasks/{task_id}/progress")
async def get_task_progress(
    task_id: str,
    task_service: TaskService = Depends(get_task_service)
):
    """Get task progress based on micro-step completion"""
    # Verify task exists
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Query micro-steps
    db = task_service.get_db()
    conn = db.get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM micro_steps
        WHERE parent_task_id = ?
    """, (task_id,))

    row = cursor.fetchone()
    total_steps = row[0] or 0
    completed_steps = row[1] or 0

    progress_percentage = (completed_steps / total_steps * 100.0) if total_steps > 0 else 0.0

    return {
        "task_id": task_id,
        "total_steps": total_steps,
        "completed_steps": completed_steps,
        "progress_percentage": progress_percentage
    }


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
    """
    Enhanced quick capture for mobile with AI-powered micro-step breakdown.

    Flow:
    1. Capture raw text
    2. AI analysis (QuickCaptureService)
    3. Break into 2-5 minute micro-steps (DecomposerAgent)
    4. Classify each step as DIGITAL or HUMAN (ClassifierAgent)
    5. Return task + micro-steps for immediate ADHD-friendly display
    """
    from src.agents.capture_agent import CaptureAgent
    from src.core.task_models import CaptureMode
    from src.database.enhanced_adapter import get_enhanced_database

    start_time = datetime.utcnow()

    try:
        # Determine capture mode
        if request.ask_for_clarity:
            mode = CaptureMode.CLARIFY
        elif request.auto_mode:
            mode = CaptureMode.AUTO
        else:
            mode = CaptureMode.MANUAL

        # Use full capture pipeline with AI agents
        from src.database.enhanced_adapter import get_enhanced_database
        db = get_enhanced_database()
        agent = CaptureAgent(db)

        result = await agent.capture(
            input_text=request.text,
            user_id=request.user_id,
            mode=mode,
            manual_fields=None,
        )

        # Format micro-steps for frontend display
        micro_steps_display = []
        for step in result["micro_steps"]:
            # Handle both enum and string values for leaf_type and delegation_mode
            leaf_type = step.leaf_type.value if hasattr(step.leaf_type, 'value') else step.leaf_type
            delegation_mode = step.delegation_mode.value if hasattr(step.delegation_mode, 'value') else step.delegation_mode

            micro_steps_display.append({
                "step_id": step.step_id,
                "description": step.description,
                "estimated_minutes": step.estimated_minutes,
                "leaf_type": leaf_type,  # "DIGITAL" or "HUMAN"
                "icon": "🤖" if leaf_type == "DIGITAL" else "👤",
                "delegation_mode": delegation_mode,
            })

        task_data = result["task"]
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000

        # Build response with micro-steps breakdown
        response = {
            "task": {
                "title": task_data.title,
                "description": task_data.description,
                "priority": task_data.priority,
                "estimated_hours": task_data.estimated_hours,
                "tags": task_data.tags,
            },
            "micro_steps": micro_steps_display,
            "breakdown": {
                "total_steps": len(micro_steps_display),
                "digital_count": sum(1 for s in micro_steps_display if s["leaf_type"] == "DIGITAL"),
                "human_count": sum(1 for s in micro_steps_display if s["leaf_type"] == "HUMAN"),
                "total_minutes": sum(s["estimated_minutes"] for s in micro_steps_display),
            },
            "needs_clarification": not result["ready_to_save"],
            "clarifications": [
                {
                    "field": c.field,
                    "question": c.question,
                    "options": c.options,
                }
                for c in result.get("clarifications", [])
            ],
            "processing_time_ms": int(processing_time),
            "voice_processed": request.voice_input,
            "location_captured": bool(request.location),
        }

        return response

    except Exception as e:
        # Fallback to simple analysis on error
        logger.error(f"AI capture failed: {e}, falling back to simple mode")

        from src.services.quick_capture_service import QuickCaptureService
        quick_capture = QuickCaptureService()

        analysis = await quick_capture.analyze_capture(
            request.text, request.user_id, request.voice_input
        )

        task_data = TaskCreationData(
            title=analysis.get("title", request.text[:100]),
            description=analysis.get("description", request.text),
            project_id="default-project",
            priority=TaskPriority(analysis.get("priority", "medium")),
            due_date=analysis.get("due_date"),
            tags=analysis.get("tags", ["mobile", "quick-capture"]),
        )

        task = task_service.create_task(task_data)
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000

        return {
            "task": TaskResponse.from_task(task),
            "micro_steps": [],
            "breakdown": {
                "total_steps": 0,
                "digital_count": 0,
                "human_count": 0,
                "total_minutes": 0
            },
            "needs_clarification": False,
            "clarifications": [],
            "analysis": {
                "category": analysis.get("category"),
                "confidence": analysis.get("confidence"),
                "should_delegate": analysis.get("should_delegate"),
                "delegation_type": analysis.get("delegation_type"),
                "reasoning": analysis.get("reasoning"),
            },
            "processing_time_ms": int(processing_time),
            "voice_processed": request.voice_input,
            "location_captured": bool(request.location),
            "error": str(e),
        }


@router.get("/mobile/dashboard/{user_id}")
async def get_mobile_dashboard_data(user_id: str):
    """Get mobile-optimized dashboard data"""
    # 🚨 WARNING: ALL DATA BELOW IS FAKE MOCK DATA - REPLACE WITH REAL APIS 🚨
    return {
        "total_tasks": 999999,  # 🚨 FAKE - Use /api/v1/secretary/dashboard
        "completed_today": 42069,  # 🚨 FAKE - Use /api/v1/progress/...
        "focus_time_today": 420.69,  # 🚨 FAKE - Use /api/v1/focus/...
        "current_streak": 1337,  # 🚨 FAKE - Use /api/v1/progress/...
        "xp_earned_today": 80085,  # 🚨 FAKE - Use /api/v1/progress/...
        "active_focus_session": "MOCK_DATA_NOT_REAL",
        "next_due_task": "OBVIOUSLY_FAKE_REPLACE_ME",
        "energy_level": "GIBBERISH_MOCK_DATA",
        "_warning": "🚨 THIS IS ALL FAKE MOCK DATA - INTEGRATE REAL APIS 🚨"
    }


@router.get("/mobile/tasks/{user_id}")
async def get_mobile_optimized_tasks(user_id: str, limit: int = Query(20, ge=1, le=50)):
    """Get mobile-optimized task list"""
    # 🚨 WARNING: FAKE MOCK DATA - Use /api/v1/tasks instead 🚨
    return {
        "tasks": [
            {
                "task_id": "FAKE-MOCK-ID-12345",
                "title": "🚨 MOCK DATA - Buy unicorn food",
                "priority": "OBVIOUSLY_FAKE",
                "due_soon": "THIS_IS_NOT_REAL",
                "estimated_minutes": 696969,
            },
            {
                "task_id": "FAKE-MOCK-ID-67890",
                "title": "🚨 MOCK DATA - Ride flying carpet to work",
                "priority": "GIBBERISH_PRIORITY",
                "due_soon": "REPLACE_WITH_REAL_DATA",
                "estimated_minutes": 42069,
            },
        ],
        "has_more": "FAKE_BOOLEAN",
        "user_id": user_id,
        "_warning": "🚨 ALL FAKE - USE /api/v1/tasks FOR REAL DATA 🚨"
    }


@router.post("/mobile/voice-process")
async def process_voice_input(request: VoiceProcessingRequest):
    """Process voice input and extract task information"""
    # 🚨 WARNING: FAKE VOICE PROCESSING - No real speech-to-text integrated 🚨
    return {
        "intent": "FAKE_MOCK_INTENT",
        "extracted_data": {
            "title": "🚨 GIBBERISH - Teach penguins to code Python",
            "due_date": "1999-12-31T23:59:59Z",  # Y2K party!
            "priority": "OBVIOUSLY_FAKE_PRIORITY",
        },
        "confidence": 0.00001,  # Almost no confidence because it's FAKE!
        "original_text": request.audio_text,
        "_warning": "🚨 MOCK VOICE DATA - INTEGRATE REAL SPEECH API 🚨"
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
