"""
Pydantic models for Task Templates Service (BE-01).

Task templates are reusable blueprints for tasks with pre-defined micro-steps.
Reduces task creation friction for ADHD users by 50%+.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from uuid import UUID, uuid4
from datetime import datetime, UTC


class TemplateStepBase(BaseModel):
    """Base model for template steps."""

    step_order: int = Field(..., ge=1, description="Display order (1-indexed)")
    description: str = Field(..., min_length=1, max_length=500)
    short_label: Optional[str] = Field(None, max_length=100)
    estimated_minutes: int = Field(..., ge=1, le=60, description="ADHD-optimized duration")
    leaf_type: Literal["DIGITAL", "HUMAN"] = "HUMAN"
    icon: Optional[str] = Field(None, max_length=50)


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
    description: Optional[str] = None
    category: Literal["Academic", "Work", "Personal", "Health", "Creative"]
    icon: Optional[str] = Field(None, max_length=50)
    estimated_minutes: Optional[int] = Field(None, ge=1)


class TaskTemplateCreate(TaskTemplateBase):
    """Model for creating task templates."""

    steps: List[TemplateStepCreate] = Field(..., min_length=1, max_length=10)
    created_by: str = "system"
    is_public: bool = True


class TaskTemplateUpdate(BaseModel):
    """Model for updating task templates."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[Literal["Academic", "Work", "Personal", "Health", "Creative"]] = None
    icon: Optional[str] = None


class TaskTemplate(TaskTemplateBase):
    """Complete task template with all fields."""

    template_id: str = Field(default_factory=lambda: str(uuid4()))
    created_by: str
    is_public: bool
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    steps: List[TemplateStep] = []

    model_config = ConfigDict(from_attributes=True)
