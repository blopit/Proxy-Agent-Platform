"""
Enhanced Task Models - Comprehensive task management with hierarchy, dependencies, and advanced features
"""

from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from enum import Enum
from typing import Any
from uuid import uuid4

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


class TaskScope(str, Enum):
    """Task complexity scope for Epic 7 task splitting"""

    SIMPLE = "simple"  # < 10 minutes, no splitting needed
    MULTI = "multi"  # 10-60 minutes, needs micro-steps
    PROJECT = "project"  # > 60 minutes, major project with phases


class DelegationMode(str, Enum):
    """4D Delegation system for task execution strategy"""

    DO = "do"  # Do it yourself
    DO_WITH_ME = "do_with_me"  # Do with assistance/collaboration
    DELEGATE = "delegate"  # Fully delegate to someone/something else
    DELETE = "delete"  # Eliminate this task (not needed)


class LeafType(str, Enum):
    """Classification of leaf nodes (MicroSteps) for automation potential"""

    DIGITAL = "digital"  # Automatable by agents/APIs
    HUMAN = "human"  # Requires person/IRL action
    UNKNOWN = "unknown"  # Needs clarification (transient state)


class CaptureMode(str, Enum):
    """Capture mode for user interaction strategy"""

    AUTO = "auto"  # AI guesses all fields automatically
    MANUAL = "manual"  # User sets all fields explicitly
    CLARIFY = "clarify"  # AI asks minimal questions for missing info


class CaptureType(str, Enum):
    """Type of capture entity for proper handling"""

    TASK = "task"  # One-time actionable item with completion criteria
    GOAL = "goal"  # Long-term objective with milestones and progress tracking
    HABIT = "habit"  # Recurring activity with frequency pattern and streak tracking
    SHOPPING_LIST = "shopping_list"  # List of items to purchase with store/category grouping


class DecompositionState(str, Enum):
    """Decomposition state for progressive task hierarchy disclosure"""

    STUB = "stub"  # Created but not decomposed yet
    DECOMPOSING = "decomposing"  # AI is working on decomposition
    DECOMPOSED = "decomposed"  # Has children, fully decomposed
    ATOMIC = "atomic"  # Cannot decompose (leaf node or <= 3 min)


class AutomationStep(BaseModel):
    """Single step in an automation plan"""

    kind: str = Field(..., description="Step type (e.g., 'email.send', 'calendar.create')")
    params: dict[str, Any] = Field(default_factory=dict, description="Step-specific parameters")

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class AutomationPlan(BaseModel):
    """Structured plan for automated task execution"""

    steps: list[AutomationStep] = Field(
        default_factory=list, description="Sequence of automation steps"
    )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0.0-1.0)")

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class ClarificationNeed(BaseModel):
    """Represents missing information requiring user input"""

    field: str = Field(..., description="Field name requiring clarification")
    question: str = Field(..., description="Human-readable question to ask user")
    options: list[str] | None = Field(None, description="Optional multiple choice options")
    required: bool = Field(True, description="Whether this clarification blocks progress")

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class MicroStep(BaseModel):
    """Micro-step model for Epic 7 - 2-5 minute actionable steps with hierarchical support"""

    step_id: str = Field(default_factory=lambda: str(uuid4()))
    parent_task_id: str = Field(..., description="ID of the parent task")
    step_number: int = Field(..., ge=1, description="Order in sequence")
    description: str = Field(..., min_length=1, max_length=500)
    short_label: str | None = Field(
        None, max_length=20, description="1-2 word label for UI display"
    )
    estimated_minutes: int = Field(
        ..., ge=2, le=5, description="2-5 minutes (ADHD-optimized micro-steps)"
    )
    icon: str | None = Field(None, description="Emoji icon representing this step")

    # Delegation
    delegation_mode: DelegationMode = Field(default=DelegationMode.DO)

    # Status
    status: TaskStatus = Field(default=TaskStatus.TODO)

    # Time tracking
    actual_minutes: int | None = Field(None, ge=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = None

    # Capture system fields (Epic: Capture Mode)
    leaf_type: LeafType = Field(
        default=LeafType.UNKNOWN, description="Classification for automation"
    )
    automation_plan: AutomationPlan | None = Field(
        None, description="Structured automation plan if DIGITAL"
    )
    clarification_needs: list[ClarificationNeed] = Field(
        default_factory=list, description="Questions requiring user input"
    )

    # CHAMPS-based tags for success criteria and expectations
    tags: list[str] = Field(default_factory=list, description="CHAMPS-based success criteria tags")

    # Hierarchical structure fields
    parent_step_id: str | None = Field(None, description="Parent micro-step ID (for hierarchy)")
    level: int = Field(default=0, ge=0, description="Depth in tree (0 = top-level)")
    is_leaf: bool = Field(default=True, description="True if atomic (can't decompose further)")
    decomposition_state: DecompositionState = Field(
        default=DecompositionState.ATOMIC, description="Current decomposition state"
    )
    children_ids: list[str] = Field(default_factory=list, description="IDs of child micro-steps")

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip()

    @field_validator("estimated_minutes")
    @classmethod
    def validate_estimated_minutes(cls, v: int) -> int:
        if v < 2 or v > 5:
            raise ValueError("Estimated minutes must be between 2 and 5 (ADHD-optimized)")
        return v

    def mark_completed(self) -> None:
        """Mark micro-step as completed"""
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.now(UTC)

        # Auto-calculate actual time if not set
        if self.actual_minutes is None and self.created_at:
            duration = datetime.now(UTC) - self.created_at
            self.actual_minutes = max(1, int(duration.total_seconds() / 60))

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class Task(BaseModel):
    """Enhanced Task model with hierarchy, dependencies, and advanced features"""

    task_id: str = Field(default_factory=lambda: str(uuid4()))
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=2000)
    project_id: str = Field(..., description="ID of the project this task belongs to")
    parent_id: str | None = Field(None, description="Parent task ID for subtasks")

    # Capture type (task, goal, habit, shopping_list)
    capture_type: CaptureType = Field(
        default=CaptureType.TASK, description="Type of capture entity"
    )

    # Status and priority
    status: TaskStatus = Field(default=TaskStatus.TODO)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)

    # Time tracking
    estimated_hours: Decimal | None = Field(None, ge=0, decimal_places=2)
    actual_hours: Decimal = Field(default=Decimal("0.0"), ge=0, decimal_places=2)

    # Organization
    tags: list[str] = Field(default_factory=list)
    assignee: str | None = Field(
        None,
        description="User ID of assigned person",
        validation_alias="assignee_id",  # Accept 'assignee_id' when parsing
        serialization_alias="assignee_id",  # Output as 'assignee_id' when serializing
    )

    # Dates
    due_date: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Metadata
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Epic 7: Task Splitting Support
    scope: TaskScope = Field(default=TaskScope.SIMPLE, description="Task complexity scope")
    micro_steps: list[MicroStep] = Field(
        default_factory=list, description="Micro-steps (2-5 min each)"
    )
    is_micro_step: bool = Field(default=False, description="Is this task itself a micro-step")
    delegation_mode: DelegationMode = Field(
        default=DelegationMode.DO, description="4D delegation strategy"
    )

    # Progressive Hierarchy Support (7 Levels)
    level: int = Field(default=0, ge=0, le=6, description="Hierarchy level: 0=Initiative, 6=Step")
    custom_emoji: str | None = Field(None, description="AI-generated custom emoji for this node")
    decomposition_state: DecompositionState = Field(
        default=DecompositionState.STUB, description="Current decomposition state"
    )
    children_ids: list[str] = Field(default_factory=list, description="IDs of child tasks")
    total_minutes: int = Field(default=0, ge=0, description="Total time including all descendants")
    is_leaf: bool = Field(default=False, description="True if atomic leaf node (can't decompose)")
    leaf_type: LeafType | None = Field(
        None, description="Classification for leaf nodes (DIGITAL/HUMAN)"
    )

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
        return datetime.now(UTC) > self.due_date

    def add_time(self, hours: Decimal) -> None:
        """Add hours to actual time"""
        if hours < 0:
            raise ValueError("Cannot add negative hours")
        self.actual_hours += hours
        self.updated_at = datetime.now(UTC)

    def mark_started(self) -> None:
        """Mark task as started"""
        if self.status == TaskStatus.TODO:
            self.status = TaskStatus.IN_PROGRESS
            self.started_at = datetime.now(UTC)
            self.updated_at = datetime.now(UTC)

    def mark_completed(self) -> None:
        """Mark task as completed"""
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)

    # Epic 7: Task Splitting Methods

    def determine_scope(self) -> TaskScope:
        """
        Determine task scope based on estimated hours.

        Returns:
            TaskScope: SIMPLE (<10 min), MULTI (10-60 min), or PROJECT (>60 min)
        """
        if not self.estimated_hours:
            # No estimate - could analyze description length/complexity
            # For now, default to SIMPLE
            return TaskScope.SIMPLE

        hours = float(self.estimated_hours)
        minutes = hours * 60

        if minutes < 10:
            return TaskScope.SIMPLE
        elif minutes <= 60:
            return TaskScope.MULTI
        else:
            return TaskScope.PROJECT

    def calculate_micro_steps_duration(self) -> int:
        """
        Calculate total estimated duration from all micro-steps.

        Returns:
            int: Total minutes from all micro-steps
        """
        return sum(step.estimated_minutes for step in self.micro_steps)

    @property
    def micro_steps_progress_percentage(self) -> float:
        """
        Calculate progress percentage based on completed micro-steps.

        Returns:
            float: Percentage of micro-steps completed (0-100)
        """
        if not self.micro_steps or len(self.micro_steps) == 0:
            return 0.0

        completed_count = sum(1 for step in self.micro_steps if step.status == TaskStatus.COMPLETED)

        return (completed_count / len(self.micro_steps)) * 100.0

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
        by_alias=True,  # Use serialization aliases when converting to dict/JSON
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
    author: str = Field(
        ...,
        description="User ID of comment author",
        validation_alias="author_id",
        serialization_alias="author_id",
    )
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
        self.updated_at = datetime.now(UTC)
        self.is_edited = True

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
        by_alias=True,  # Use serialization aliases when converting to dict/JSON
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

    # OAuth fields
    oauth_provider: str | None = Field(
        None, description="OAuth provider (google, apple, github, microsoft)"
    )
    oauth_provider_id: str | None = Field(None, description="User ID from OAuth provider")

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

        self.ended_at = datetime.now(UTC)
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
            self.earned_at = datetime.now(UTC)

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
        self.updated_at = datetime.now(UTC)

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


# Capture Type Specific Models


class Milestone(BaseModel):
    """Milestone model for goal tracking"""

    value: Decimal = Field(..., description="Target value for this milestone")
    date: datetime = Field(..., description="Target date for this milestone")
    description: str | None = Field(None, max_length=500, description="Optional description")
    completed: bool = Field(default=False, description="Whether milestone is achieved")
    completed_at: datetime | None = Field(None, description="When milestone was achieved")

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class Goal(BaseModel):
    """Goal model for long-term objectives with milestone tracking"""

    goal_id: str = Field(default_factory=lambda: str(uuid4()))
    task_id: str = Field(..., description="Link to tasks table (capture_type='goal')")

    # Goal-specific fields
    target_value: Decimal | None = Field(
        None, description="Numeric target (NULL for non-quantifiable)"
    )
    current_value: Decimal = Field(default=Decimal("0.0"), description="Current progress")
    unit: str | None = Field(
        None, max_length=50, description="Measurement unit (pounds, dollars, etc.)"
    )
    target_date: datetime | None = Field(None, description="When you want to achieve this goal")

    # Milestones
    milestones: list[Milestone] = Field(
        default_factory=list, description="Intermediate checkpoints"
    )

    # Progress tracking
    progress_percentage: Decimal = Field(
        default=Decimal("0.0"), ge=0, le=100, decimal_places=2, description="Progress (0-100)"
    )
    last_progress_update: datetime | None = Field(
        None, description="When progress was last updated"
    )

    # Goal hierarchy
    parent_goal_id: str | None = Field(None, description="Parent goal (NULL for top-level)")

    # Status
    is_active: bool = Field(default=True, description="Whether goal is currently being pursued")
    is_achieved: bool = Field(default=False, description="Whether goal has been completed")
    achieved_at: datetime | None = Field(None, description="When goal was achieved")

    # Metadata
    notes: str | None = Field(None, max_length=2000)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def update_progress(self, new_value: Decimal) -> None:
        """Update goal progress"""
        self.current_value = new_value
        self.last_progress_update = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)

        # Calculate percentage if target_value exists
        if self.target_value and self.target_value > 0:
            percentage = (self.current_value / self.target_value) * 100
            self.progress_percentage = min(Decimal("100.0"), max(Decimal("0.0"), percentage))

            # Check if achieved
            if self.current_value >= self.target_value and not self.is_achieved:
                self.is_achieved = True
                self.achieved_at = datetime.now(UTC)

    def add_milestone(self, value: Decimal, date: datetime, description: str | None = None) -> None:
        """Add a new milestone"""
        milestone = Milestone(value=value, date=date, description=description)
        self.milestones.append(milestone)
        self.updated_at = datetime.now(UTC)

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class RecurrencePattern(BaseModel):
    """RRULE-compatible recurrence pattern for habits"""

    frequency: str = Field(..., description="daily, weekly, monthly, custom")
    interval: int = Field(default=1, ge=1, description="Every N days/weeks/months")
    active_days: list[int] | None = Field(None, description="For weekly: 0=Sunday, 6=Saturday")
    time_of_day: str | None = Field(
        None, pattern=r"^\d{2}:\d{2}$", description="Preferred time (HH:MM)"
    )
    rrule: str | None = Field(None, description="Full RRULE string (optional)")

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class HabitCompletion(BaseModel):
    """Individual habit completion record"""

    completion_id: str = Field(default_factory=lambda: str(uuid4()))
    habit_id: str = Field(..., description="Habit this completion belongs to")

    # Completion details
    completed_at: datetime = Field(default_factory=datetime.utcnow)
    completion_date: str = Field(..., description="ISO date (YYYY-MM-DD) for grouping")

    # Optional quality metrics
    energy_level: int | None = Field(None, ge=1, le=5, description="Energy level (1-5)")
    mood: str | None = Field(None, description="good, neutral, bad")
    notes: str | None = Field(None, max_length=500)

    # Metadata
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class Habit(BaseModel):
    """Habit model for recurring activities with streak tracking"""

    habit_id: str = Field(default_factory=lambda: str(uuid4()))
    task_id: str = Field(..., description="Link to tasks table (capture_type='habit')")

    # Recurrence
    frequency: str = Field(..., description="daily, weekly, monthly, custom")
    recurrence_pattern: RecurrencePattern = Field(..., description="Full recurrence pattern")

    # Streak tracking
    streak_count: int = Field(default=0, ge=0, description="Current consecutive streak")
    longest_streak: int = Field(default=0, ge=0, description="Best streak ever achieved")
    total_completions: int = Field(default=0, ge=0, description="Lifetime completion count")
    last_completed_at: datetime | None = Field(None, description="Most recent completion")

    # Reminders
    reminder_time: str | None = Field(
        None, pattern=r"^\d{2}:\d{2}$", description="Time for notifications (HH:MM)"
    )
    reminder_enabled: bool = Field(default=False, description="Whether to send reminders")

    # Status
    is_active: bool = Field(default=True, description="Whether habit is being tracked")
    paused_at: datetime | None = Field(None, description="When habit was paused")

    # Completion history (denormalized for quick stats)
    completion_history: list[str] = Field(
        default_factory=list, description="ISO dates of recent completions (last 90 days)"
    )

    # Metadata
    notes: str | None = Field(None, max_length=2000)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def mark_completed_today(self, completion_date: str | None = None) -> HabitCompletion:
        """Mark habit as completed for today and update streak"""
        if completion_date is None:
            completion_date = datetime.now(UTC).strftime("%Y-%m-%d")

        # Create completion record
        completion = HabitCompletion(habit_id=self.habit_id, completion_date=completion_date)

        # Update habit stats
        self.total_completions += 1
        self.last_completed_at = datetime.now(UTC)

        # Add to history (keep last 90 days)
        if completion_date not in self.completion_history:
            self.completion_history.append(completion_date)
            self.completion_history = sorted(self.completion_history)[-90:]

        # Update streak (simplified - should validate consecutive days based on frequency)
        self.streak_count += 1
        if self.streak_count > self.longest_streak:
            self.longest_streak = self.streak_count

        self.updated_at = datetime.now(UTC)

        return completion

    def reset_streak(self) -> None:
        """Reset current streak (when habit is missed)"""
        self.streak_count = 0
        self.updated_at = datetime.now(UTC)

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class ShoppingListItem(BaseModel):
    """Individual item in a shopping list"""

    item_id: str = Field(default_factory=lambda: str(uuid4()))
    list_id: str = Field(..., description="Shopping list this item belongs to")

    # Item details
    name: str = Field(..., min_length=1, max_length=255, description="Item name")
    quantity: Decimal = Field(default=Decimal("1.0"), ge=0, description="Amount needed")
    unit: str | None = Field(None, max_length=50, description="Measurement unit")

    # Pricing
    estimated_price: Decimal | None = Field(None, ge=0, decimal_places=2)
    actual_price: Decimal | None = Field(None, ge=0, decimal_places=2)
    currency: str = Field(default="USD", max_length=3)

    # Categorization
    category: str | None = Field(None, max_length=100, description="Product category")
    aisle: str | None = Field(None, max_length=50, description="Store aisle/location")

    # Priority and ordering
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    item_order: int = Field(default=0, ge=0, description="Display/shopping order")

    # Purchase tracking
    is_purchased: bool = Field(default=False)
    purchased_at: datetime | None = None

    # Metadata
    notes: str | None = Field(None, max_length=500)
    brand: str | None = Field(None, max_length=100)
    barcode: str | None = Field(None, max_length=50)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def mark_purchased(self, actual_price: Decimal | None = None) -> None:
        """Mark item as purchased"""
        self.is_purchased = True
        self.purchased_at = datetime.now(UTC)
        if actual_price is not None:
            self.actual_price = actual_price
        self.updated_at = datetime.now(UTC)

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )


class ShoppingList(BaseModel):
    """Shopping list model for managing purchase items"""

    list_id: str = Field(default_factory=lambda: str(uuid4()))
    task_id: str = Field(..., description="Link to tasks table (capture_type='shopping_list')")

    # List organization
    store_name: str | None = Field(None, max_length=255, description="Target store")
    store_category: str | None = Field(None, max_length=100, description="Store type")

    # Shopping details
    shopping_date: datetime | None = Field(None, description="When you plan to shop")
    total_estimated_cost: Decimal = Field(default=Decimal("0.0"), ge=0, decimal_places=2)
    total_actual_cost: Decimal = Field(default=Decimal("0.0"), ge=0, decimal_places=2)
    currency: str = Field(default="USD", max_length=3)

    # Completion tracking
    total_items: int = Field(default=0, ge=0)
    purchased_items: int = Field(default=0, ge=0)
    completion_percentage: Decimal = Field(default=Decimal("0.0"), ge=0, le=100, decimal_places=2)

    # List status
    is_active: bool = Field(default=True)
    is_completed: bool = Field(default=False)
    completed_at: datetime | None = None

    # Shopping trip details
    shopped_at: datetime | None = Field(None, description="When shopping was completed")
    shopping_duration_minutes: int | None = Field(None, ge=0)

    # Items (populated from repository)
    items: list[ShoppingListItem] = Field(default_factory=list, description="Items in this list")

    # Metadata
    notes: str | None = Field(None, max_length=2000)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def update_totals(self) -> None:
        """Recalculate totals based on items"""
        self.total_items = len(self.items)
        self.purchased_items = sum(1 for item in self.items if item.is_purchased)

        # Update completion percentage
        if self.total_items > 0:
            self.completion_percentage = Decimal((self.purchased_items / self.total_items) * 100)
        else:
            self.completion_percentage = Decimal("0.0")

        # Update costs
        self.total_estimated_cost = sum(
            (item.estimated_price or Decimal("0.0")) * item.quantity for item in self.items
        )
        self.total_actual_cost = sum(
            (item.actual_price or Decimal("0.0")) * item.quantity
            for item in self.items
            if item.is_purchased
        )

        # Check if completed
        if self.total_items > 0 and self.purchased_items == self.total_items:
            self.is_completed = True
            if not self.completed_at:
                self.completed_at = datetime.now(UTC)

        self.updated_at = datetime.now(UTC)

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
    )
