"""
Capture API Endpoints - Full-screen brain dump capture system

Provides RESTful endpoints for the Capture Mode pipeline:
- Initial capture with decomposition and classification
- Clarification submission and re-classification
- Saving finalized task trees to database
"""

from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from src.agents.capture_agent import CaptureAgent
from src.core.task_models import (
    AutomationPlan,
    CaptureMode,
    ClarificationNeed,
    LeafType,
    MicroStep,
    Task,
)
from src.database.enhanced_adapter import get_enhanced_database
from src.repositories.enhanced_repositories import EnhancedTaskRepository
from src.services.task_service import TaskCreationData, TaskService

router = APIRouter(prefix="/api/v1/capture", tags=["capture"])


# Dependency to get task service
def get_task_service() -> TaskService:
    """Get task service instance"""
    return TaskService()


# --- Request/Response Models ---


class CaptureRequest(BaseModel):
    """Request model for initial capture"""

    query: str = Field(..., description="Raw user input (brain dump)")
    user_id: str = Field(..., description="User ID")
    mode: str = Field("auto", description="Capture mode: auto, manual, clarify")
    manual_fields: Optional[dict[str, Any]] = Field(
        None, description="Manual field overrides (for MANUAL mode)"
    )


class MicroStepResponse(BaseModel):
    """Response model for MicroStep"""

    step_id: str
    description: str
    estimated_minutes: int
    delegation_mode: str
    leaf_type: str
    icon: Optional[str] = None
    short_label: Optional[str] = None
    automation_plan: Optional[AutomationPlan] = None
    clarification_needs: list[ClarificationNeed] = []
    tags: list[str] = []  # CHAMPS-based tags


class CaptureResponse(BaseModel):
    """Response model for capture results"""

    task: dict[str, Any]  # Task as dict
    micro_steps: list[MicroStepResponse]
    clarifications: list[ClarificationNeed]
    ready_to_save: bool
    mode: str


class ClarifyRequest(BaseModel):
    """Request model for submitting clarification answers"""

    micro_steps: list[dict[str, Any]]  # MicroSteps as dicts
    answers: dict[str, str] = Field(..., description="Field name → answer mapping")


class SaveCaptureRequest(BaseModel):
    """Request model for saving finalized capture to database"""

    task: dict[str, Any]
    micro_steps: list[dict[str, Any]]
    user_id: str
    project_id: Optional[str] = None


# --- Endpoints ---


@router.post("/", response_model=CaptureResponse)
async def create_capture(
    request: CaptureRequest,
    db=Depends(get_enhanced_database),
) -> CaptureResponse:
    """
    Initial capture: decompose input → classify → generate clarifications.

    Flow:
    1. Analyze input with QuickCaptureService (or use manual fields)
    2. Decompose into atomic MicroSteps
    3. Classify each MicroStep (DIGITAL/HUMAN)
    4. Return task tree with clarifications if needed

    Examples:
        AUTO mode:
        ```
        POST /api/v1/capture/
        {
            "query": "turn off the AC",
            "user_id": "alice",
            "mode": "auto"
        }
        ```

        MANUAL mode:
        ```
        POST /api/v1/capture/
        {
            "query": "review financial report",
            "user_id": "alice",
            "mode": "manual",
            "manual_fields": {
                "title": "Review Q4 Financial Report",
                "priority": "high",
                "due_date": "2025-10-25",
                "estimated_hours": 2.0
            }
        }
        ```

        CLARIFY mode:
        ```
        POST /api/v1/capture/
        {
            "query": "clean the apartment",
            "user_id": "alice",
            "mode": "clarify"
        }
        ```
    """
    try:
        # Initialize CaptureAgent
        agent = CaptureAgent(db)

        # Validate mode
        try:
            mode = CaptureMode(request.mode)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid mode: {request.mode}. Must be: auto, manual, clarify",
            )

        # Execute capture pipeline
        result = await agent.capture(
            input_text=request.query,
            user_id=request.user_id,
            mode=mode,
            manual_fields=request.manual_fields,
        )

        # Convert to response format
        return CaptureResponse(
            task=result["task"].model_dump(),
            micro_steps=[
                MicroStepResponse(
                    step_id=step.step_id,
                    description=step.description,
                    estimated_minutes=step.estimated_minutes,
                    delegation_mode=step.delegation_mode,  # Already a string due to use_enum_values
                    leaf_type=step.leaf_type,  # Already a string due to use_enum_values
                    automation_plan=step.automation_plan,
                    clarification_needs=step.clarification_needs,
                    tags=step.tags or [],  # Include CHAMPS tags
                )
                for step in result["micro_steps"]
            ],
            clarifications=result["clarifications"],
            ready_to_save=result["ready_to_save"],
            mode=result["mode"] if isinstance(result["mode"], str) else result["mode"].value,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Capture failed: {str(e)}")


@router.post("/clarify", response_model=CaptureResponse)
async def submit_clarifications(
    request: ClarifyRequest,
    db=Depends(get_enhanced_database),
) -> CaptureResponse:
    """
    Submit clarification answers → re-classify → return updated results.

    Flow:
    1. Apply user answers to MicroSteps
    2. Re-classify with updated information
    3. Return updated task tree

    Example:
        ```
        POST /api/v1/capture/clarify
        {
            "micro_steps": [{...}, {...}],  # From previous capture response
            "answers": {
                "email_recipient": "boss@company.com",
                "email_subject": "Weekly Update",
                "calendar_when": "2025-10-23 14:00",
                "iot_device": "AC"
            }
        }
        ```
    """
    try:
        # Initialize CaptureAgent
        agent = CaptureAgent(db)

        # Reconstruct MicroSteps from request
        micro_steps = [MicroStep(**step_data) for step_data in request.micro_steps]

        # Apply clarifications
        result = await agent.apply_clarifications(micro_steps, request.answers)

        # Return updated results
        return CaptureResponse(
            task={},  # Task doesn't change during clarification
            micro_steps=[
                MicroStepResponse(
                    step_id=step.step_id,
                    description=step.description,
                    estimated_minutes=step.estimated_minutes,
                    delegation_mode=step.delegation_mode,  # Already a string due to use_enum_values
                    leaf_type=step.leaf_type,  # Already a string due to use_enum_values
                    automation_plan=step.automation_plan,
                    clarification_needs=step.clarification_needs,
                )
                for step in result["micro_steps"]
            ],
            clarifications=result["clarifications"],
            ready_to_save=result["ready_to_save"],
            mode="clarify",  # Always clarify mode for this endpoint
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Clarification processing failed: {str(e)}"
        )


@router.post("/save")
async def save_capture(
    request: SaveCaptureRequest,
    task_service: TaskService = Depends(get_task_service),
    db=Depends(get_enhanced_database),
) -> dict[str, Any]:
    """
    Save finalized task tree → create Task + MicroSteps in database.

    Flow:
    1. Create parent Task
    2. Save all MicroSteps to micro_steps table
    3. Return created task_id and step IDs

    Example:
        ```
        POST /api/v1/capture/save
        {
            "task": {...},  # From capture response
            "micro_steps": [{...}, {...}],
            "user_id": "alice",
            "project_id": "project-123"  # Optional
        }
        ```
    """
    try:
        # Reconstruct Task and MicroSteps
        task_data = request.task.copy()
        task_data["project_id"] = request.project_id or task_data.get("project_id")

        task = Task(**task_data)
        micro_steps = [MicroStep(**step_data) for step_data in request.micro_steps]

        # Create Task via service
        task_creation_data = TaskCreationData(
            title=task.title,
            description=task.description or "",
            project_id=task.project_id,
            priority=task.priority,
            estimated_hours=task.estimated_hours,
            tags=task.tags or [],
            due_date=task.due_date,
        )

        created_task = task_service.create_task(task_creation_data)

        # Save MicroSteps
        task_repo = EnhancedTaskRepository(db)
        saved_step_ids = []

        for micro_step in micro_steps:
            # Update parent_task_id to match created task
            micro_step.parent_task_id = created_task.task_id

            # Save to database
            step_id = task_repo.save_micro_step(micro_step)
            saved_step_ids.append(step_id)

        return {
            "success": True,
            "task_id": created_task.task_id,
            "micro_step_ids": saved_step_ids,
            "total_steps": len(saved_step_ids),
            "message": f"Capture saved: {len(saved_step_ids)} micro-steps created",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Save failed: {str(e)}")


@router.get("/stats/{user_id}")
async def get_capture_stats(
    user_id: str,
    db=Depends(get_enhanced_database),
) -> dict[str, Any]:
    """
    Get capture statistics for a user.

    Returns:
    - Total captures
    - DIGITAL vs HUMAN breakdown
    - Average micro-steps per capture
    - Most common automation types
    """
    try:
        task_repo = EnhancedTaskRepository(db)

        # Get all user tasks with micro-steps
        # This is a simplified version - you may want to add specific queries
        # to the repository for better performance

        return {
            "user_id": user_id,
            "total_captures": 0,  # TODO: Implement actual stats
            "digital_count": 0,
            "human_count": 0,
            "avg_steps_per_capture": 0.0,
            "message": "Stats endpoint - implement actual calculations",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Stats retrieval failed: {str(e)}"
        )
