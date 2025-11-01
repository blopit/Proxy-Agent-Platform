"""
Dogfooding API Routes - Mobile Task Management

Provides endpoints for the mobile dogfooding workflow:
- Task swipe actions (archive, delegate, execute)
- DO screen execution modes (assisted, solo)
- Focus timer integration
- Quick task actions
"""

import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.api.auth import get_current_user
from src.core.task_models import User
from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/dogfood", tags=["dogfooding"])


# ============================================================================
# Request/Response Models
# ============================================================================


class ArchiveTaskRequest(BaseModel):
    """Request to archive a task."""

    reason: str = Field(
        "not_relevant",
        description="Reason for archiving: not_relevant, later, delegated_elsewhere",
    )


class ArchiveTaskResponse(BaseModel):
    """Response from archiving a task."""

    task_id: str
    status: str
    archived_at: str
    xp_penalty: int = 0


class DelegateTaskRequest(BaseModel):
    """Request to delegate a task."""

    auto_assign: bool = Field(
        True, description="Let system pick best agent automatically"
    )
    agent_id: Optional[str] = Field(None, description="Specific agent to assign to")


class DelegateTaskResponse(BaseModel):
    """Response from delegating a task."""

    task_id: str
    status: str
    assigned_agent: str
    delegation_mode: str
    estimated_completion: Optional[str]


class ExecuteTaskRequest(BaseModel):
    """Request to execute a task with AI assistance."""

    mode: str = Field("assisted", description="Execution mode: assisted or solo")
    workflow_id: str = Field(
        "auto_detect", description="Workflow to use or auto_detect"
    )


class WorkflowStep(BaseModel):
    """A step in the workflow execution."""

    step_id: int
    title: str
    estimated_minutes: int
    status: str = "pending"
    validation_command: Optional[str] = None


class ExecuteTaskResponse(BaseModel):
    """Response from executing a task."""

    execution_id: str
    workflow_id: str
    task_id: str
    steps: list[WorkflowStep]
    ai_context: str


class StartSoloRequest(BaseModel):
    """Request to start solo execution with timer."""

    pomodoro_duration: int = Field(
        25, ge=5, le=60, description="Focus timer duration in minutes"
    )
    notes: Optional[str] = Field(None, description="Optional notes before starting")


class StartSoloResponse(BaseModel):
    """Response from starting solo execution."""

    focus_session_id: str
    task_id: str
    started_at: str
    estimated_end: str
    timer_running: bool


class CompleteSoloRequest(BaseModel):
    """Request to complete solo execution."""

    actual_minutes: Optional[int] = Field(None, description="Actual time spent")
    notes: Optional[str] = Field(None, description="Completion notes")


class CompleteSoloResponse(BaseModel):
    """Response from completing solo execution."""

    task_id: str
    focus_session_id: str
    status: str
    actual_minutes: int
    xp_earned: int
    completed_at: str


# ============================================================================
# Task Action Endpoints
# ============================================================================


@router.post("/tasks/{task_id}/archive", response_model=ArchiveTaskResponse)
async def archive_task(
    task_id: str,
    request: ArchiveTaskRequest,
    current_user: User = Depends(get_current_user),
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
):
    """
    Archive a task (swipe left action).

    Removes task from active queue and logs the reason.
    No XP penalty for archiving.

    Args:
        task_id: Task ID to archive
        request: Archive request with reason
        current_user: Current authenticated user
        db: Database adapter

    Returns:
        Archive confirmation

    Raises:
        404: Task not found
        403: Not authorized to archive this task
    """
    try:
        # Get task
        task_query = """
        SELECT task_id, user_id, status
        FROM tasks
        WHERE task_id = ?
        """
        task = db.execute_read(task_query, (task_id,))

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )

        # Authorization check
        if task[0][1] != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to archive this task",
            )

        # Update task status
        now = datetime.now(timezone.utc)
        update_query = """
        UPDATE tasks
        SET status = 'archived', updated_at = ?
        WHERE task_id = ?
        """
        db.execute_write(update_query, (now.isoformat(), task_id))

        # Log action
        log_query = """
        INSERT INTO task_actions (action_id, task_id, user_id, action_type, reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        db.execute_write(
            log_query,
            (
                str(uuid4()),
                task_id,
                current_user.user_id,
                "archive",
                request.reason,
                now.isoformat(),
            ),
        )

        logger.info(f"Archived task {task_id} for user {current_user.user_id}")

        return ArchiveTaskResponse(
            task_id=task_id,
            status="archived",
            archived_at=now.isoformat(),
            xp_penalty=0,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to archive task: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to archive task",
        )


@router.post("/tasks/{task_id}/delegate", response_model=DelegateTaskResponse)
async def delegate_task(
    task_id: str,
    request: DelegateTaskRequest,
    current_user: User = Depends(get_current_user),
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
):
    """
    Delegate a task to an AI agent (swipe up action).

    Task is assigned to best available agent or specified agent.
    Status changes to 'delegated' and task appears in agent queue.

    Args:
        task_id: Task ID to delegate
        request: Delegation request
        current_user: Current authenticated user
        db: Database adapter

    Returns:
        Delegation confirmation

    Raises:
        404: Task not found
        403: Not authorized to delegate this task
    """
    try:
        # Get task
        task_query = """
        SELECT task_id, user_id, title, description, priority
        FROM tasks
        WHERE task_id = ?
        """
        task = db.execute_read(task_query, (task_id,))

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )

        # Authorization check
        if task[0][1] != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delegate this task",
            )

        # Determine agent (simplified - use delegation system in production)
        agent_id = request.agent_id or "task_proxy_intelligent"

        # Update task status
        now = datetime.now(timezone.utc)
        update_query = """
        UPDATE tasks
        SET status = 'delegated', updated_at = ?
        WHERE task_id = ?
        """
        db.execute_write(update_query, (now.isoformat(), task_id))

        # Log delegation action
        log_query = """
        INSERT INTO task_actions (action_id, task_id, user_id, action_type, agent_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        db.execute_write(
            log_query,
            (
                str(uuid4()),
                task_id,
                current_user.user_id,
                "delegate",
                agent_id,
                now.isoformat(),
            ),
        )

        logger.info(
            f"Delegated task {task_id} to {agent_id} for user {current_user.user_id}"
        )

        return DelegateTaskResponse(
            task_id=task_id,
            status="delegated",
            assigned_agent=agent_id,
            delegation_mode="autonomous",
            estimated_completion=None,  # TODO: Calculate from agent workload
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delegate task: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delegate task",
        )


@router.post("/tasks/{task_id}/execute", response_model=ExecuteTaskResponse)
async def execute_task(
    task_id: str,
    request: ExecuteTaskRequest,
    current_user: User = Depends(get_current_user),
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
):
    """
    Execute a task with AI assistance (Do With Me mode).

    Opens workflow execution with step-by-step AI guidance.
    This is the "Do With Me" option from the DO screen.

    Args:
        task_id: Task ID to execute
        request: Execution request
        current_user: Current authenticated user
        db: Database adapter

    Returns:
        Workflow execution details

    Raises:
        404: Task not found
        403: Not authorized to execute this task
    """
    try:
        # Get task
        task_query = """
        SELECT task_id, user_id, title, description, priority
        FROM tasks
        WHERE task_id = ?
        """
        task = db.execute_read(task_query, (task_id,))

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )

        # Authorization check
        if task[0][1] != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to execute this task",
            )

        # TODO: Integrate with existing workflow executor
        # For now, return mock workflow steps
        execution_id = str(uuid4())
        workflow_id = "task_execution_basic"

        # Update task status
        now = datetime.now(timezone.utc)
        update_query = """
        UPDATE tasks
        SET status = 'in_progress', updated_at = ?
        WHERE task_id = ?
        """
        db.execute_write(update_query, (now.isoformat(), task_id))

        # Create sample workflow steps
        steps = [
            WorkflowStep(
                step_id=1,
                title="Review task requirements",
                estimated_minutes=3,
                status="pending",
            ),
            WorkflowStep(
                step_id=2,
                title="Break down into sub-tasks",
                estimated_minutes=5,
                status="pending",
            ),
            WorkflowStep(
                step_id=3,
                title="Execute first sub-task",
                estimated_minutes=10,
                status="pending",
            ),
        ]

        logger.info(
            f"Started assisted execution for task {task_id} (user: {current_user.user_id})"
        )

        return ExecuteTaskResponse(
            execution_id=execution_id,
            workflow_id=workflow_id,
            task_id=task_id,
            steps=steps,
            ai_context="I'll guide you through completing this task step-by-step. Let's start by reviewing what needs to be done.",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to execute task: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to execute task",
        )


@router.post("/tasks/{task_id}/start-solo", response_model=StartSoloResponse)
async def start_solo_execution(
    task_id: str,
    request: StartSoloRequest,
    current_user: User = Depends(get_current_user),
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
):
    """
    Start solo execution with focus timer (Do Solo mode).

    Starts a Pomodoro-style focus session without AI guidance.
    This is the "Do Solo" option from the DO screen.

    Args:
        task_id: Task ID to work on
        request: Solo execution request
        current_user: Current authenticated user
        db: Database adapter

    Returns:
        Focus session details

    Raises:
        404: Task not found
        403: Not authorized to work on this task
    """
    try:
        # Get task
        task_query = """
        SELECT task_id, user_id, title
        FROM tasks
        WHERE task_id = ?
        """
        task = db.execute_read(task_query, (task_id,))

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )

        # Authorization check
        if task[0][1] != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to work on this task",
            )

        # Create focus session
        from datetime import timedelta

        session_id = str(uuid4())
        now = datetime.now(timezone.utc)
        estimated_end = now + timedelta(minutes=request.pomodoro_duration)

        session_query = """
        INSERT INTO focus_sessions (
            session_id, user_id, task_id, duration_minutes,
            started_at, estimated_end, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        db.execute_write(
            session_query,
            (
                session_id,
                current_user.user_id,
                task_id,
                request.pomodoro_duration,
                now.isoformat(),
                estimated_end.isoformat(),
                "active",
                request.notes or "",
            ),
        )

        # Update task status
        update_query = """
        UPDATE tasks
        SET status = 'in_progress', updated_at = ?
        WHERE task_id = ?
        """
        db.execute_write(update_query, (now.isoformat(), task_id))

        logger.info(
            f"Started solo execution for task {task_id} (user: {current_user.user_id}, duration: {request.pomodoro_duration}m)"
        )

        return StartSoloResponse(
            focus_session_id=session_id,
            task_id=task_id,
            started_at=now.isoformat(),
            estimated_end=estimated_end.isoformat(),
            timer_running=True,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start solo execution: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start solo execution",
        )


@router.post(
    "/focus-sessions/{session_id}/complete", response_model=CompleteSoloResponse
)
async def complete_solo_execution(
    session_id: str,
    request: CompleteSoloRequest,
    current_user: User = Depends(get_current_user),
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
):
    """
    Complete a solo focus session and mark task as done.

    Args:
        session_id: Focus session ID
        request: Completion request
        current_user: Current authenticated user
        db: Database adapter

    Returns:
        Completion confirmation with XP earned

    Raises:
        404: Session not found
        403: Not authorized
    """
    try:
        # Get session
        session_query = """
        SELECT session_id, user_id, task_id, started_at
        FROM focus_sessions
        WHERE session_id = ?
        """
        session = db.execute_read(session_query, (session_id,))

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
            )

        # Authorization check
        if session[0][1] != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to complete this session",
            )

        task_id = session[0][2]
        now = datetime.now(timezone.utc)

        # Calculate actual minutes if not provided
        if request.actual_minutes:
            actual_minutes = request.actual_minutes
        else:
            started_at = datetime.fromisoformat(session[0][3])
            actual_minutes = int((now - started_at).total_seconds() / 60)

        # Update session
        update_session_query = """
        UPDATE focus_sessions
        SET status = 'completed', actual_minutes = ?, completed_at = ?, notes = ?
        WHERE session_id = ?
        """
        db.execute_write(
            update_session_query,
            (
                actual_minutes,
                now.isoformat(),
                request.notes or "",
                session_id,
            ),
        )

        # Update task status
        update_task_query = """
        UPDATE tasks
        SET status = 'completed', updated_at = ?
        WHERE task_id = ?
        """
        db.execute_write(update_task_query, (now.isoformat(), task_id))

        # Calculate XP (base 10 + time bonus)
        xp_earned = 10 + (actual_minutes // 5)  # 1 XP per 5 minutes

        logger.info(
            f"Completed solo execution for task {task_id} (user: {current_user.user_id}, {actual_minutes}m, {xp_earned} XP)"
        )

        return CompleteSoloResponse(
            task_id=task_id,
            focus_session_id=session_id,
            status="completed",
            actual_minutes=actual_minutes,
            xp_earned=xp_earned,
            completed_at=now.isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to complete solo execution: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete solo execution",
        )


# ============================================================================
# Health Check
# ============================================================================


@router.get("/health")
async def health_check():
    """Health check endpoint for dogfooding system."""
    return {
        "status": "healthy",
        "service": "dogfooding_workflow",
        "version": "1.0.0",
    }
