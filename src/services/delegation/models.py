"""
Pydantic models for Task Delegation System (BE-00).

These models define the data structures for delegation operations,
agent capabilities, and task assignments.
"""

from datetime import datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator

# ============================================================================
# Task Delegation Models
# ============================================================================


class TaskDelegationCreate(BaseModel):
    """Model for creating a task delegation/assignment."""

    task_id: str = Field(..., description="ID of the task to delegate")
    assignee_id: str = Field(..., description="ID of the assignee (human or agent)")
    assignee_type: Literal["human", "agent"] = Field(..., description="Type of assignee")
    estimated_hours: float | None = Field(None, gt=0, description="Estimated hours to complete")


class TaskAssignment(BaseModel):
    """Model for a task assignment (response)."""

    assignment_id: str = Field(default_factory=lambda: str(uuid4()))
    task_id: str
    assignee_id: str
    assignee_type: Literal["human", "agent"]
    status: Literal["pending", "in_progress", "completed"] = "pending"
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    accepted_at: datetime | None = None
    completed_at: datetime | None = None
    estimated_hours: float | None = None
    actual_hours: float | None = None

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={datetime: lambda v: v.isoformat()},
    )


class AssignmentComplete(BaseModel):
    """Model for completing an assignment."""

    actual_hours: float | None = Field(None, gt=0, description="Actual hours spent")


# ============================================================================
# Agent Capability Models
# ============================================================================


class AgentCapabilityCreate(BaseModel):
    """Model for registering an agent capability."""

    agent_id: str = Field(..., description="Unique agent identifier")
    agent_name: str = Field(..., description="Human-readable agent name")
    agent_type: Literal["backend", "frontend", "general"] = Field(..., description="Type of agent")
    skills: list[str] = Field(..., description="List of agent skills")
    max_concurrent_tasks: int = Field(default=1, gt=0, description="Max concurrent tasks")

    @field_validator("skills")
    @classmethod
    def skills_must_not_be_empty(cls, v: list[str]) -> list[str]:
        """Ensure skills list is not empty."""
        if not v:
            raise ValueError("Skills list cannot be empty")
        return v


class AgentCapability(BaseModel):
    """Model for an agent capability (response)."""

    capability_id: str = Field(default_factory=lambda: str(uuid4()))
    agent_id: str
    agent_name: str
    agent_type: Literal["backend", "frontend", "general"]
    skills: list[str]
    max_concurrent_tasks: int = 1
    current_task_count: int = 0
    is_available: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={datetime: lambda v: v.isoformat()},
    )


# ============================================================================
# Query Models
# ============================================================================


class AssignmentStatus(BaseModel):
    """Model for assignment status query parameters."""

    status: Literal["pending", "in_progress", "completed"] | None = None


class AgentFilter(BaseModel):
    """Model for filtering agents."""

    agent_type: Literal["backend", "frontend", "general"] | None = None
    available_only: bool | None = None
