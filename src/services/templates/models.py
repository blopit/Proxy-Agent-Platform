"""
Pydantic models for Task Templates Service (BE-01).

Task templates are reusable blueprints for tasks with pre-defined micro-steps.
Reduces task creation friction for ADHD users by 50%+.
"""

from datetime import UTC, datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class TemplateStepBase(BaseModel):
    """Base model for template steps."""

    step_order: int = Field(..., ge=1, description="Display order (1-indexed)")
    description: str = Field(..., min_length=1, max_length=500)
    short_label: str | None = Field(None, max_length=100)
    estimated_minutes: int = Field(..., ge=1, le=60, description="ADHD-optimized duration")
    leaf_type: Literal["DIGITAL", "HUMAN"] = "HUMAN"
    icon: str | None = Field(None, max_length=50)


class TemplateStepCreate(TemplateStepBase):
    """Model for creating template steps."""

    pass


class TemplateStep(TemplateStepBase):
    """Complete template step with IDs."""

    step_id: str = Field(default_factory=lambda: str(uuid4()))
    template_id: str

    model_config = ConfigDict(from_attributes=True)


class TaskTemplateBase(BaseModel):
    """Base model for task templates."""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    category: Literal["Academic", "Work", "Personal", "Health", "Creative"]
    icon: str | None = Field(None, max_length=50)
    estimated_minutes: int | None = Field(None, ge=1)


class TaskTemplateCreate(TaskTemplateBase):
    """Model for creating task templates."""

    steps: list[TemplateStepCreate] = Field(..., min_length=1, max_length=10)
    created_by: str = "system"
    is_public: bool = True


class TaskTemplateUpdate(BaseModel):
    """Model for updating task templates."""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    category: Literal["Academic", "Work", "Personal", "Health", "Creative"] | None = None
    icon: str | None = None


class TaskTemplate(TaskTemplateBase):
    """Complete task template with all fields."""

    template_id: str = Field(default_factory=lambda: str(uuid4()))
    created_by: str
    is_public: bool
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    steps: list[TemplateStep] = []

    model_config = ConfigDict(from_attributes=True)
