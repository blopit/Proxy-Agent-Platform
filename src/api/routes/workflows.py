"""
API routes for AI-powered workflow execution.

Provides endpoints for:
- Listing available workflows
- Executing workflows to generate implementation steps
- Retrieving workflow execution results
"""

import logging
from pathlib import Path
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from src.api.auth import get_current_user
from src.core.task_models import User
from src.workflows.executor import WorkflowExecutor
from src.workflows.models import (
    Workflow,
    WorkflowContext,
    WorkflowExecution,
    WorkflowStep,
    WorkflowType,
)
from src.workflows.recommender import WorkflowRecommender, WorkflowSuggestion

logger = logging.getLogger(__name__)

# Initialize workflow executor with workflows directory
WORKFLOWS_DIR = Path(__file__).parent.parent.parent.parent / "workflows" / "dev"
executor = WorkflowExecutor(WORKFLOWS_DIR)

# Initialize workflow recommender
recommender = WorkflowRecommender()

# Create router
router = APIRouter(prefix="/api/v1/workflows", tags=["workflows"])


# Request/Response Models
class ExecuteWorkflowRequest(BaseModel):
    """Request to execute a workflow."""

    workflow_id: str = Field(..., description="ID of workflow to execute")
    task_id: str = Field(..., description="Task ID from delegation system")
    task_title: str
    task_description: Optional[str] = None
    task_priority: str = "medium"
    estimated_hours: float = 4.0

    # User context (user_id will come from auth dependency)
    user_energy: int = Field(2, ge=1, le=3, description="Energy level 1-3")
    time_of_day: str = "morning"

    # Optional codebase state
    codebase_state: Optional[dict] = None
    recent_tasks: Optional[list[str]] = None
    current_branch: Optional[str] = None


class ExecuteWorkflowResponse(BaseModel):
    """Response from workflow execution."""

    execution_id: UUID
    workflow_id: str
    task_id: str
    status: str
    steps: list[WorkflowStep]

    # Metadata
    steps_generated: int
    estimated_total_minutes: int
    llm_provider_used: Optional[str] = None


class WorkflowSummary(BaseModel):
    """Summary of a workflow for listing."""

    workflow_id: str
    name: str
    description: str
    workflow_type: str
    expected_step_count: int
    tags: list[str]


class SuggestWorkflowsRequest(BaseModel):
    """Request body for workflow suggestions."""

    task_title: str = Field(..., description="Task title to analyze")
    task_description: Optional[str] = Field(None, description="Optional task description")
    user_energy: int = Field(2, ge=1, le=3, description="User energy level (1-3)")
    time_of_day: str = Field("morning", description="Current time of day")
    estimated_hours: float = Field(4.0, gt=0, description="Estimated hours available")
    recent_tasks: Optional[list[str]] = Field(None, description="Recent completed tasks")


# Endpoints
@router.get("/", response_model=list[WorkflowSummary])
async def list_workflows(
    workflow_type: Optional[WorkflowType] = Query(None, description="Filter by type")
):
    """
    List all available workflows.

    Args:
        workflow_type: Optional filter by workflow type

    Returns:
        List of workflow summaries
    """
    try:
        workflows = executor.list_workflows(workflow_type=workflow_type)

        return [
            WorkflowSummary(
                workflow_id=w.workflow_id,
                name=w.name,
                description=w.description,
                workflow_type=w.workflow_type,
                expected_step_count=w.expected_step_count,
                tags=w.tags,
            )
            for w in workflows
        ]

    except Exception as e:
        logger.error(f"Error listing workflows: {e}")
        raise HTTPException(status_code=500, detail="Failed to list workflows")


@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str):
    """
    Get details of a specific workflow.

    Args:
        workflow_id: ID of workflow to retrieve

    Returns:
        Full workflow definition

    Raises:
        404: Workflow not found
    """
    workflow = executor.get_workflow(workflow_id)

    if not workflow:
        raise HTTPException(status_code=404, detail=f"Workflow not found: {workflow_id}")

    return workflow


@router.post("/execute", response_model=ExecuteWorkflowResponse)
async def execute_workflow(request: ExecuteWorkflowRequest, current_user: User = Depends(get_current_user)):
    """
    Execute a workflow to generate implementation steps.

    This endpoint uses AI to generate context-aware implementation steps
    based on the workflow definition, task details, and user context.

    Args:
        request: Workflow execution request with task and context

    Returns:
        Execution result with generated steps

    Raises:
        404: Workflow not found
        500: AI generation failed
    """
    try:
        # Build context
        context = WorkflowContext(
            task_id=request.task_id,
            task_title=request.task_title,
            task_description=request.task_description,
            task_priority=request.task_priority,
            estimated_hours=request.estimated_hours,
            user_id=current_user.user_id,
            user_energy=request.user_energy,
            time_of_day=request.time_of_day,
            codebase_state=request.codebase_state or {},
            recent_tasks=request.recent_tasks or [],
            current_branch=request.current_branch,
        )

        # Execute workflow
        execution = await executor.execute_workflow(
            workflow_id=request.workflow_id,
            context=context,
            # TODO: Get API key from user settings when auth is implemented
            llm_api_key=None,  # Uses ANTHROPIC_API_KEY from env
        )

        # Calculate totals
        total_minutes = sum(step.estimated_minutes for step in execution.steps)

        return ExecuteWorkflowResponse(
            execution_id=execution.execution_id,
            workflow_id=execution.workflow_id,
            task_id=execution.task_id,
            status=execution.status,
            steps=execution.steps,
            steps_generated=len(execution.steps),
            estimated_total_minutes=total_minutes,
            llm_provider_used=execution.llm_provider_used,
        )

    except ValueError as e:
        # Workflow not found
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error executing workflow: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")


@router.post("/executions/{execution_id}/steps/{step_id}/complete")
async def mark_step_complete(
    execution_id: UUID,
    step_id: str,
    actual_minutes: Optional[int] = Query(None, description="Actual time taken"),
    notes: Optional[str] = Query(None, description="Optional notes"),
):
    """
    Mark a workflow step as completed.

    Args:
        execution_id: ID of workflow execution
        step_id: ID of step to mark complete
        actual_minutes: Actual time taken
        notes: Optional notes

    Returns:
        Success message

    Note: This is a simplified version. In production, executions would be
    stored in database and retrieved here.
    """
    # TODO: Implement execution storage and retrieval
    # For MVP, this is a placeholder

    return {
        "execution_id": execution_id,
        "step_id": step_id,
        "status": "completed",
        "actual_minutes": actual_minutes,
        "notes": notes,
    }


@router.post("/suggest", response_model=list[WorkflowSuggestion])
async def suggest_workflows(request: SuggestWorkflowsRequest):
    """
    Get AI-powered workflow suggestions with letter grades (A+ to F).

    This is a MICRO-LLM endpoint - only called when user clicks the ⭐ button!

    Analyzes the task and returns ALL available workflows ranked with honest grades:
    - A+/A/A-: Excellent match
    - B+/B/B-: Good match
    - C+/C/C-: Marginal match
    - D: Poor match
    - F: Unsuitable

    Args:
        request: Workflow suggestion request with task details and user context

    Returns:
        List of ALL workflows with grades, sorted best to worst
    """
    try:
        # Get all available workflows
        available_workflows = executor.list_workflows()

        if not available_workflows:
            raise HTTPException(
                status_code=404, detail="No workflows available for suggestions"
            )

        # Build user context
        user_context = {
            "energy": {1: "low", 2: "medium", 3: "high"}[request.user_energy],
            "energy_numeric": request.user_energy,
            "time_of_day": request.time_of_day,
            "estimated_hours": request.estimated_hours,
            "recent_tasks": request.recent_tasks or [],
        }

        # Get AI suggestions
        suggestions = await recommender.suggest_workflows(
            task_title=request.task_title,
            task_description=request.task_description or "",
            available_workflows=available_workflows,
            user_context=user_context,
        )

        logger.info(
            f"Generated {len(suggestions)} suggestions for task: {request.task_title}. "
            f"Top grade: {suggestions[0].grade if suggestions else 'N/A'}"
        )

        return suggestions

    except Exception as e:
        logger.error(f"Error generating suggestions: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Failed to generate suggestions: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    workflows_count = len(executor.list_workflows())

    return {
        "status": "healthy",
        "workflows_loaded": workflows_count,
        "workflows_dir": str(WORKFLOWS_DIR),
    }
