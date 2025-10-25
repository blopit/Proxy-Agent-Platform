"""
Capture Type Specific Request/Response Models
Provides API models for goals, habits, and shopping lists
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from src.core.task_models import (
    CaptureType,
    Goal,
    Habit,
    HabitCompletion,
    Milestone,
    RecurrencePattern,
    ShoppingList,
    ShoppingListItem,
    TaskPriority,
)


# Goal Request/Response Models


class MilestoneCreate(BaseModel):
    """Request model for creating a milestone"""

    value: Decimal = Field(..., description="Target value for this milestone")
    date: datetime = Field(..., description="Target date for this milestone")
    description: str | None = Field(None, max_length=500)

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class MilestoneResponse(BaseModel):
    """Response model for a milestone"""

    value: Decimal
    date: datetime
    description: str | None
    completed: bool
    completed_at: datetime | None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class GoalCreate(BaseModel):
    """Request model for creating a goal"""

    # Task fields
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=2000)
    project_id: str

    # Goal-specific fields
    target_value: Decimal | None = Field(None, description="Numeric target (e.g., 20 for '20 pounds')")
    unit: str | None = Field(None, max_length=50, description="Measurement unit (pounds, dollars, etc.)")
    target_date: datetime | None = Field(None, description="When you want to achieve this goal")
    milestones: list[MilestoneCreate] = Field(default_factory=list)

    # Optional fields
    parent_goal_id: str | None = None
    notes: str | None = Field(None, max_length=2000)
    tags: list[str] = Field(default_factory=list)

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class GoalUpdate(BaseModel):
    """Request model for updating a goal"""

    # Task fields
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)

    # Goal-specific fields
    target_value: Decimal | None = None
    current_value: Decimal | None = None
    unit: str | None = Field(None, max_length=50)
    target_date: datetime | None = None
    notes: str | None = Field(None, max_length=2000)
    tags: list[str] | None = None

    # Status
    is_active: bool | None = None
    is_achieved: bool | None = None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class GoalResponse(BaseModel):
    """Response model for a goal"""

    goal_id: str
    task_id: str
    title: str
    description: str
    project_id: str
    capture_type: CaptureType

    # Goal-specific fields
    target_value: Decimal | None
    current_value: Decimal
    unit: str | None
    target_date: datetime | None
    milestones: list[MilestoneResponse]
    progress_percentage: Decimal
    last_progress_update: datetime | None

    # Hierarchy
    parent_goal_id: str | None

    # Status
    is_active: bool
    is_achieved: bool
    achieved_at: datetime | None

    # Metadata
    notes: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


# Habit Request/Response Models


class RecurrencePatternCreate(BaseModel):
    """Request model for creating a recurrence pattern"""

    frequency: str = Field(..., description="daily, weekly, monthly, custom")
    interval: int = Field(default=1, ge=1)
    active_days: list[int] | None = Field(None, description="For weekly: 0=Sunday, 6=Saturday")
    time_of_day: str | None = Field(None, pattern=r"^\d{2}:\d{2}$")
    rrule: str | None = None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class HabitCreate(BaseModel):
    """Request model for creating a habit"""

    # Task fields
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=2000)
    project_id: str

    # Habit-specific fields
    frequency: str = Field(..., description="daily, weekly, monthly, custom")
    recurrence_pattern: RecurrencePatternCreate

    # Reminders
    reminder_time: str | None = Field(None, pattern=r"^\d{2}:\d{2}$")
    reminder_enabled: bool = Field(default=False)

    # Optional fields
    notes: str | None = Field(None, max_length=2000)
    tags: list[str] = Field(default_factory=list)

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class HabitUpdate(BaseModel):
    """Request model for updating a habit"""

    # Task fields
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)

    # Habit-specific fields
    frequency: str | None = None
    recurrence_pattern: RecurrencePatternCreate | None = None
    reminder_time: str | None = Field(None, pattern=r"^\d{2}:\d{2}$")
    reminder_enabled: bool | None = None
    notes: str | None = Field(None, max_length=2000)
    tags: list[str] | None = None

    # Status
    is_active: bool | None = None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class HabitCompletionCreate(BaseModel):
    """Request model for recording a habit completion"""

    completion_date: str | None = Field(None, description="ISO date (YYYY-MM-DD), defaults to today")
    energy_level: int | None = Field(None, ge=1, le=5)
    mood: str | None = Field(None, description="good, neutral, bad")
    notes: str | None = Field(None, max_length=500)

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class HabitCompletionResponse(BaseModel):
    """Response model for a habit completion"""

    completion_id: str
    habit_id: str
    completed_at: datetime
    completion_date: str
    energy_level: int | None
    mood: str | None
    notes: str | None
    created_at: datetime

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class HabitResponse(BaseModel):
    """Response model for a habit"""

    habit_id: str
    task_id: str
    title: str
    description: str
    project_id: str
    capture_type: CaptureType

    # Habit-specific fields
    frequency: str
    recurrence_pattern: RecurrencePattern
    streak_count: int
    longest_streak: int
    total_completions: int
    last_completed_at: datetime | None

    # Reminders
    reminder_time: str | None
    reminder_enabled: bool

    # Status
    is_active: bool
    paused_at: datetime | None

    # Metadata
    notes: str | None
    tags: list[str]
    completion_history: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


# Shopping List Request/Response Models


class ShoppingListItemCreate(BaseModel):
    """Request model for creating a shopping list item"""

    name: str = Field(..., min_length=1, max_length=255)
    quantity: Decimal = Field(default=Decimal("1.0"), ge=0)
    unit: str | None = Field(None, max_length=50)
    estimated_price: Decimal | None = Field(None, ge=0)
    category: str | None = Field(None, max_length=100)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    notes: str | None = Field(None, max_length=500)
    brand: str | None = Field(None, max_length=100)

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class ShoppingListItemUpdate(BaseModel):
    """Request model for updating a shopping list item"""

    name: str | None = Field(None, min_length=1, max_length=255)
    quantity: Decimal | None = Field(None, ge=0)
    unit: str | None = Field(None, max_length=50)
    estimated_price: Decimal | None = Field(None, ge=0)
    actual_price: Decimal | None = Field(None, ge=0)
    category: str | None = Field(None, max_length=100)
    priority: TaskPriority | None = None
    notes: str | None = Field(None, max_length=500)
    brand: str | None = Field(None, max_length=100)
    is_purchased: bool | None = None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class ShoppingListItemResponse(BaseModel):
    """Response model for a shopping list item"""

    item_id: str
    list_id: str
    name: str
    quantity: Decimal
    unit: str | None
    estimated_price: Decimal | None
    actual_price: Decimal | None
    currency: str
    category: str | None
    aisle: str | None
    priority: TaskPriority
    item_order: int
    is_purchased: bool
    purchased_at: datetime | None
    notes: str | None
    brand: str | None
    barcode: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class ShoppingListCreate(BaseModel):
    """Request model for creating a shopping list"""

    # Task fields
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=2000)
    project_id: str

    # Shopping list-specific fields
    store_name: str | None = Field(None, max_length=255)
    store_category: str | None = Field(None, max_length=100)
    shopping_date: datetime | None = None
    items: list[ShoppingListItemCreate] = Field(default_factory=list)

    # Optional fields
    notes: str | None = Field(None, max_length=2000)
    tags: list[str] = Field(default_factory=list)

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class ShoppingListUpdate(BaseModel):
    """Request model for updating a shopping list"""

    # Task fields
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)

    # Shopping list-specific fields
    store_name: str | None = Field(None, max_length=255)
    store_category: str | None = Field(None, max_length=100)
    shopping_date: datetime | None = None
    notes: str | None = Field(None, max_length=2000)
    tags: list[str] | None = None

    # Status
    is_active: bool | None = None
    is_completed: bool | None = None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


class ShoppingListResponse(BaseModel):
    """Response model for a shopping list"""

    list_id: str
    task_id: str
    title: str
    description: str
    project_id: str
    capture_type: CaptureType

    # Shopping list-specific fields
    store_name: str | None
    store_category: str | None
    shopping_date: datetime | None
    total_estimated_cost: Decimal
    total_actual_cost: Decimal
    currency: str

    # Completion tracking
    total_items: int
    purchased_items: int
    completion_percentage: Decimal

    # List status
    is_active: bool
    is_completed: bool
    completed_at: datetime | None

    # Shopping trip details
    shopped_at: datetime | None
    shopping_duration_minutes: int | None

    # Items
    items: list[ShoppingListItemResponse]

    # Metadata
    notes: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)


# Bulk Shopping List Creation (paste entire list)


class BulkShoppingListCreate(BaseModel):
    """Request model for bulk creating a shopping list from text"""

    # Task fields
    title: str = Field(..., min_length=1, max_length=255)
    project_id: str

    # Bulk text input
    items_text: str = Field(
        ...,
        description="Newline-separated list of items (e.g., 'Milk\\nEggs\\nBread')"
    )

    # Shopping list fields
    store_name: str | None = Field(None, max_length=255)
    shopping_date: datetime | None = None

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)
