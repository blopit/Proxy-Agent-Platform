"""
Pydantic models for workflow system.
"""

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class WorkflowType(str, Enum):
    """Type of workflow."""

    BACKEND = "backend"
    FRONTEND = "frontend"
    BUGFIX = "bugfix"
    DOCUMENTATION = "documentation"
    TESTING = "testing"


class StepStatus(str, Enum):
    """Status of a workflow step."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class WorkflowContext(BaseModel):
    """
    Context passed to workflow for AI generation.

    This contains all information the AI needs to generate personalized steps.
    """

    model_config = ConfigDict(use_enum_values=True)

    # Task details
    task_id: str
    task_title: str
    task_description: str | None = None
    task_priority: str = "medium"
    estimated_hours: float = 4.0

    # User context
    user_id: str
    user_energy: int = Field(2, ge=1, le=3, description="Energy level: 1=Low, 2=Medium, 3=High")
    time_of_day: str = Field("morning", description="morning, afternoon, evening, night")

    # Codebase state
    codebase_state: dict[str, Any] = Field(
        default_factory=lambda: {
            "tests_passing": 0,
            "tests_failing": 0,
            "recent_files": [],
            "modified_files": [],
        }
    )

    # Recent work context
    recent_tasks: list[str] = Field(default_factory=list, description="Recently completed tasks")
    current_branch: str | None = None

    # Additional context
    extra_context: dict[str, Any] = Field(default_factory=dict)


class WorkflowStep(BaseModel):
    """A single step in a workflow execution."""

    model_config = ConfigDict(use_enum_values=True)

    step_id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    description: str
    estimated_minutes: int = 30
    status: StepStatus = StepStatus.PENDING

    # TDD-specific
    tdd_phase: str | None = None  # "red", "green", "refactor"
    validation_command: str | None = None
    expected_outcome: str | None = None

    # UI display
    icon: str = "📋"
    order: int = 0

    # Metadata
    started_at: datetime | None = None
    completed_at: datetime | None = None
    actual_minutes: int | None = None
    notes: str | None = None


class Workflow(BaseModel):
    """
    Workflow definition loaded from TOML file.

    Defines the structure and AI prompts for generating task steps.
    """

    model_config = ConfigDict(use_enum_values=True)

    workflow_id: str
    name: str
    description: str
    workflow_type: WorkflowType
    version: str = "1.0.0"

    # AI generation config
    llm_provider: str = "anthropic:claude-3-5-sonnet"
    system_prompt: str
    user_prompt_template: str

    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    author: str | None = None
    tags: list[str] = Field(default_factory=list)

    # Step defaults
    default_icon: str = "📋"
    expected_step_count: int = Field(5, ge=3, le=10, description="Target number of steps")


class WorkflowExecution(BaseModel):
    """
    Record of a workflow execution.

    Tracks the full lifecycle from trigger to completion.
    """

    model_config = ConfigDict(use_enum_values=True)

    execution_id: UUID = Field(default_factory=uuid4)
    workflow_id: str
    task_id: str
    user_id: str

    # Context used
    context: WorkflowContext

    # Generated steps
    steps: list[WorkflowStep] = Field(default_factory=list)

    # Execution metadata
    status: str = "pending"  # pending, in_progress, completed, failed
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: datetime | None = None

    # AI usage tracking
    llm_provider_used: str | None = None
    prompt_tokens: int = 0
    completion_tokens: int = 0
    estimated_cost: float = 0.0

    # Results
    error_message: str | None = None
    notes: str | None = None
