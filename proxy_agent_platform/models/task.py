"""
Task Models - Data structures for task management
"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import Field

from .base import BaseModel


class TaskCategory(str, Enum):
    """Task categories for organization."""

    WORK = "work"
    PERSONAL = "personal"
    HEALTH = "health"
    LEARNING = "learning"
    FINANCE = "finance"
    RELATIONSHIPS = "relationships"
    HOBBIES = "hobbies"
    ADMIN = "admin"


class TaskPriority(str, Enum):
    """Task priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskStatus(str, Enum):
    """Task status values."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ARCHIVED = "archived"


class Task(BaseModel):
    """Task model for the proxy agent platform."""

    title: str = Field(..., description="Task title")
    description: str | None = Field(None, description="Task description")
    category: TaskCategory = Field(default=TaskCategory.WORK, description="Task category")
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, description="Task priority")
    status: TaskStatus = Field(default=TaskStatus.PENDING, description="Task status")

    # Time management
    due_date: datetime | None = Field(None, description="Task due date")
    estimated_duration_minutes: int | None = Field(
        None, description="Estimated duration in minutes"
    )
    actual_duration_minutes: int | None = Field(None, description="Actual duration in minutes")

    # Relationships
    parent_task_id: str | None = Field(None, description="Parent task ID for subtasks")
    project_id: str | None = Field(None, description="Associated project ID")
    user_id: str = Field(..., description="User who owns this task")

    # Metadata
    tags: list[str] = Field(default_factory=list, description="Task tags")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

    # Gamification
    xp_value: int = Field(default=10, description="XP value for completing this task")
    difficulty_level: int = Field(default=1, description="Difficulty level (1-5)")

    # Completion tracking
    completed_at: datetime | None = Field(None, description="When the task was completed")
    completion_notes: str | None = Field(None, description="Notes about task completion")

    class Config:
        """Pydantic configuration."""

        use_enum_values = True
        validate_assignment = True
