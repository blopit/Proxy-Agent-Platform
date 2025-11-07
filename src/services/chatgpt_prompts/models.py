"""
Pydantic models for ChatGPT Prompt Generator System.

These models define the data structures for generating ChatGPT prompts
and importing task lists created by ChatGPT from video analysis.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# ============================================================================
# Prompt Generation Models
# ============================================================================


class PromptGenerationRequest(BaseModel):
    """Model for requesting a ChatGPT prompt generation."""

    task_context: str = Field(
        ...,
        description="Brief context for the task (e.g., 'Clean room 8')",
        min_length=1,
        max_length=500,
    )
    analysis_focus: str | None = Field(
        None,
        description="Specific things to focus on during video analysis",
        max_length=1000,
    )
    expected_task_count: int | None = Field(
        None,
        gt=0,
        le=100,
        description="Expected number of subtasks (helps ChatGPT structure response)",
    )
    priority: Literal["critical", "high", "medium", "low"] | None = Field(
        "medium", description="Default priority for generated tasks"
    )
    estimated_hours_per_task: float | None = Field(
        None, gt=0, description="Estimated hours per subtask"
    )


class PromptGenerationResponse(BaseModel):
    """Model for ChatGPT prompt generation response."""

    prompt: str = Field(..., description="The generated ChatGPT prompt (copyable)")
    instructions: str = Field(..., description="Step-by-step instructions for the user")
    expected_json_format: dict = Field(
        ..., description="Example of expected JSON format from ChatGPT"
    )
    task_context: str = Field(..., description="Original task context")
    generated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})


# ============================================================================
# Task Import Models
# ============================================================================


class ImportedSubtask(BaseModel):
    """Model for a single subtask from ChatGPT."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    estimated_hours: float | None = Field(None, gt=0, le=100)
    priority: Literal["critical", "high", "medium", "low"] | None = "medium"
    tags: list[str] | None = Field(default_factory=list)


class TaskListImportRequest(BaseModel):
    """Model for importing task list from ChatGPT."""

    parent_task_context: str = Field(
        ..., description="Original task context (e.g., 'Clean room 8')"
    )
    subtasks: list[ImportedSubtask] = Field(
        ..., min_length=1, description="List of subtasks from ChatGPT"
    )
    project_id: str | None = Field(None, description="Optional project ID to associate tasks with")
    delegation_mode: Literal["human", "agent", "hybrid"] = Field(
        "human", description="How these tasks should be delegated"
    )
    capture_type: Literal["video", "voice", "text", "other"] = Field(
        "video", description="How this task was captured"
    )


class TaskImportResult(BaseModel):
    """Model for task import result."""

    success: bool
    parent_task_id: str
    parent_task_title: str
    imported_task_count: int
    task_ids: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    message: str = ""

    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
