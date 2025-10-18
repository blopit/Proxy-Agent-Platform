"""
Enhanced Task Models - Comprehensive task management with hierarchy, dependencies, and advanced features
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any
from uuid import uuid4
from pydantic.fields import FieldInfo

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskStatus(str, Enum):
    """Task status enumeration"""

    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    """Task priority enumeration"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DependencyType(str, Enum):
    """Task dependency types"""

    BLOCKS = "blocks"  # This task blocks the dependent task
    DEPENDS_ON = "depends_on"  # This task depends on another task
    RELATED = "related"  # Tasks are related but not blocking


class Task(BaseModel):
    """Enhanced Task model with hierarchy, dependencies, and advanced features"""

    task_id: str = Field(default_factory=lambda: str(uuid4()))
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=2000)
    project_id: str = Field(..., description="ID of the project this task belongs to")
    parent_id: str | None = Field(None, description="Parent task ID for subtasks")

    # Status and priority
    status: TaskStatus = Field(default=TaskStatus.TODO)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)

    # Time tracking
    estimated_hours: Decimal | None = Field(None, ge=0, decimal_places=2)
    actual_hours: Decimal = Field(default=Decimal("0.0"), ge=0, decimal_places=2)

    # Organization
    tags: list[str] = Field(default_factory=list)
    assignee_id: str | None = Field(None, description="User ID of assigned person")

    # Dates
    due_date: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Metadata
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

    @field_validator("estimated_hours", "actual_hours")
    @classmethod
    def validate_hours(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v < 0:
            raise ValueError("Hours cannot be negative")
        return v

    @property
    def progress_percentage(self) -> float:
        """Calculate progress percentage based on hours"""
        if not self.estimated_hours or self.estimated_hours == 0:
            return 0.0
        return float((self.actual_hours / self.estimated_hours) * 100)

    @property
    def is_overdue(self) -> bool:
        """Check if task is overdue"""
        if not self.due_date or self.status == TaskStatus.COMPLETED:
            return False
        return datetime.utcnow() > self.due_date

    def add_time(self, hours: Decimal) -> None:
        """Add hours to actual time"""
        if hours < 0:
            raise ValueError("Cannot add negative hours")
        self.actual_hours += hours
        self.updated_at = datetime.utcnow()

    def mark_started(self) -> None:
        """Mark task as started"""
        if self.status == TaskStatus.TODO:
            self.status = TaskStatus.IN_PROGRESS
            self.started_at = datetime.utcnow()
            self.updated_at = datetime.utcnow()

    def mark_completed(self) -> None:
        """Mark task as completed"""
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class Project(BaseModel):
    """Project model for organizing tasks"""

    project_id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=2000)

    # Organization
    owner_id: str | None = Field(None, description="User ID of project owner")
    team_members: list[str] = Field(default_factory=list)

    # Status
    is_active: bool = Field(default=True)

    # Dates
    start_date: datetime | None = None
    end_date: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Configuration
    settings: dict[str, Any] = Field(default_factory=dict)

    # Metadata
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class TaskTemplate(BaseModel):
    """Task template for creating standardized tasks"""

    template_id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=2000)

    # Template content
    title_template: str = Field(..., description="Template for task title with variables")
    description_template: str = Field(..., description="Template for task description")

    # Default values
    default_priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    default_estimated_hours: Decimal | None = Field(None, ge=0, decimal_places=2)
    default_tags: list[str] = Field(default_factory=list)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def generate_task_data(self, project_id: str, variables: dict[str, str]) -> dict[str, Any]:
        """Generate task data from template with provided variables"""
        import string

        # Use safe_substitute to preserve missing variables as placeholders
        title_formatter = string.Template(self.title_template.replace("{", "${").replace("}", "}"))
        description_formatter = string.Template(
            self.description_template.replace("{", "${").replace("}", "}")
        )

        title = title_formatter.safe_substitute(**variables)
        description = description_formatter.safe_substitute(**variables)

        return {
            "title": title,
            "description": description,
            "project_id": project_id,
            "priority": self.default_priority,
            "estimated_hours": self.default_estimated_hours,
            "tags": self.default_tags.copy(),
        }

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class TaskDependency(BaseModel):
    """Task dependency model for managing task relationships"""

    dependency_id: str = Field(default_factory=lambda: str(uuid4()))
    task_id: str = Field(..., description="The task that has the dependency")
    depends_on_task_id: str = Field(..., description="The task that is depended upon")
    dependency_type: DependencyType = Field(default=DependencyType.DEPENDS_ON)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str | None = Field(None, description="User who created the dependency")

    @field_validator("depends_on_task_id")
    @classmethod
    def validate_no_self_dependency(cls, v: str, info: Any) -> str:
        if hasattr(info, "data") and "task_id" in info.data and v == info.data["task_id"]:
            raise ValueError("Task cannot depend on itself")
        return v

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class TaskComment(BaseModel):
    """Task comment model for collaboration"""

    comment_id: str = Field(default_factory=lambda: str(uuid4()))
    task_id: str = Field(..., description="The task this comment belongs to")
    author_id: str = Field(..., description="User ID of comment author")
    content: str = Field(..., min_length=1, max_length=2000)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = None
    is_edited: bool = Field(default=False)

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Content cannot be empty")
        return v.strip()

    def edit_content(self, new_content: str) -> None:
        """Edit comment content"""
        if not new_content or not new_content.strip():
            raise ValueError("Content cannot be empty")

        self.content = new_content.strip()
        self.updated_at = datetime.utcnow()
        self.is_edited = True

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class TaskFilter(BaseModel):
    """Filter model for task queries"""

    project_id: str | None = None
    assignee_id: str | None = None
    status: list[TaskStatus] | None = None
    priority: list[TaskPriority] | None = None
    tags: list[str] | None = None
    parent_id: str | None = None
    is_overdue: bool | None = None
    has_due_date: bool | None = None

    # Date ranges
    created_after: datetime | None = None
    created_before: datetime | None = None
    due_after: datetime | None = None
    due_before: datetime | None = None

    # Text search
    search_text: str | None = None

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class TaskSort(BaseModel):
    """Sort model for task queries"""

    field: str = Field(default="created_at")
    direction: str = Field(default="desc", pattern="^(asc|desc)$")

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class User(BaseModel):
    """User model for authentication and profiles"""

    user_id: str = Field(default_factory=lambda: str(uuid4()))
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., description="User email address")
    password_hash: str | None = Field(None, description="Hashed password for authentication")
    full_name: str | None = Field(None, max_length=255)

    # Profile
    timezone: str = Field(default="UTC")
    avatar_url: str | None = None
    bio: str | None = Field(None, max_length=500)

    # Preferences
    preferences: dict[str, Any] = Field(default_factory=dict)

    # Status
    is_active: bool = Field(default=True)
    last_login: datetime | None = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Username cannot be empty")
        # Basic validation - alphanumeric and underscores only
        import re

        if not re.match(r"^[a-zA-Z0-9_]+$", v.strip()):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v.strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        # Basic email validation
        import re

        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, v):
            raise ValueError("Invalid email format")
        return v.lower()

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class FocusSession(BaseModel):
    """Focus session model for productivity tracking"""

    session_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str = Field(..., description="User who owned this session")
    task_id: str | None = Field(None, description="Task being worked on")
    project_id: str | None = Field(None, description="Project context")

    # Session details
    planned_duration_minutes: int = Field(..., ge=1, le=480)  # Max 8 hours
    actual_duration_minutes: int | None = Field(None, ge=0)
    session_type: str = Field(default="focus")  # focus, break, deep_work

    # Status
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: datetime | None = None
    was_completed: bool = Field(default=False)
    interruptions: int = Field(default=0)

    # Metrics
    productivity_score: float | None = Field(None, ge=0, le=100)
    notes: str | None = Field(None, max_length=1000)

    # Metadata
    metadata: dict[str, Any] = Field(default_factory=dict)

    @property
    def is_active(self) -> bool:
        """Check if session is currently active"""
        return self.ended_at is None

    def complete_session(self, productivity_score: float | None = None) -> None:
        """Complete the focus session"""
        if self.ended_at:
            raise ValueError("Session already completed")

        self.ended_at = datetime.utcnow()
        self.was_completed = True

        # Calculate actual duration
        duration = self.ended_at - self.started_at
        self.actual_duration_minutes = int(duration.total_seconds() / 60)

        if productivity_score is not None:
            self.productivity_score = productivity_score

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class Achievement(BaseModel):
    """Achievement/badge model for gamification"""

    achievement_id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=500)

    # Achievement criteria
    category: str = Field(..., description="Category like 'tasks', 'focus', 'streaks'")
    criteria: dict[str, Any] = Field(..., description="Criteria for earning achievement")

    # Rewards
    xp_reward: int = Field(default=0, ge=0)
    badge_icon: str | None = Field(None, description="Icon or emoji for badge")

    # Rarity
    rarity: str = Field(default="common")  # common, rare, epic, legendary

    # Status
    is_active: bool = Field(default=True)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class UserAchievement(BaseModel):
    """User's earned achievements"""

    user_achievement_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str = Field(..., description="User who earned the achievement")
    achievement_id: str = Field(..., description="Achievement that was earned")

    # Progress
    progress: float = Field(default=0.0, ge=0, le=100)
    is_completed: bool = Field(default=False)

    # Timestamps
    earned_at: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Context
    context: dict[str, Any] = Field(default_factory=dict)

    def complete_achievement(self) -> None:
        """Mark achievement as completed"""
        if not self.is_completed:
            self.is_completed = True
            self.progress = 100.0
            self.earned_at = datetime.utcnow()

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class ProductivityMetrics(BaseModel):
    """Daily/weekly productivity metrics"""

    metrics_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str = Field(..., description="User these metrics belong to")
    date: datetime = Field(..., description="Date for these metrics")
    period_type: str = Field(default="daily")  # daily, weekly, monthly

    # Task metrics
    tasks_created: int = Field(default=0, ge=0)
    tasks_completed: int = Field(default=0, ge=0)
    tasks_overdue: int = Field(default=0, ge=0)

    # Time metrics (in minutes)
    total_focus_time: int = Field(default=0, ge=0)
    planned_focus_time: int = Field(default=0, ge=0)
    break_time: int = Field(default=0, ge=0)

    # Quality metrics
    focus_sessions_completed: int = Field(default=0, ge=0)
    focus_sessions_started: int = Field(default=0, ge=0)
    average_productivity_score: float | None = Field(None, ge=0, le=100)

    # XP and achievements
    xp_earned: int = Field(default=0, ge=0)
    achievements_unlocked: int = Field(default=0, ge=0)
    streak_days: int = Field(default=0, ge=0)

    # Calculated fields
    completion_rate: float | None = Field(None, ge=0, le=100)
    focus_efficiency: float | None = Field(None, ge=0, le=100)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def task_completion_rate(self) -> float:
        """Calculate task completion rate"""
        if self.tasks_created == 0:
            return 0.0
        return (self.tasks_completed / self.tasks_created) * 100

    @property
    def focus_completion_rate(self) -> float:
        """Calculate focus session completion rate"""
        if self.focus_sessions_started == 0:
            return 0.0
        return (self.focus_sessions_completed / self.focus_sessions_started) * 100

    def calculate_derived_metrics(self) -> None:
        """Calculate derived metrics"""
        self.completion_rate = self.task_completion_rate
        self.focus_efficiency = self.focus_completion_rate
        self.updated_at = datetime.utcnow()

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )
