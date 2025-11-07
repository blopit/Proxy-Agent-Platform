"""
User Onboarding request/response schemas for API
Captures user preferences during mobile app onboarding flow
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class WorkPreference(str, Enum):
    """Work environment preferences"""

    REMOTE = "remote"
    HYBRID = "hybrid"
    OFFICE = "office"
    FLEXIBLE = "flexible"


class TimePreference(str, Enum):
    """Time of day preferences"""

    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"
    FLEXIBLE = "flexible"
    VARIED = "varied"


class ADHDChallenge(str, Enum):
    """Common ADHD challenges"""

    TIME_BLINDNESS = "time_blindness"
    TASK_INITIATION = "task_initiation"
    ORGANIZATION = "organization"
    FOCUS = "focus"
    PRIORITIZATION = "prioritization"
    OVERWHELM = "overwhelm"
    HYPERFOCUS = "hyperfocus"
    TRANSITIONS = "transitions"


class ProductivityGoal(str, Enum):
    """Productivity goal types"""

    REDUCE_OVERWHELM = "reduce_overwhelm"
    BUILD_HABITS = "build_habits"
    INCREASE_FOCUS = "increase_focus"
    BETTER_PLANNING = "better_planning"
    TIME_MANAGEMENT = "time_management"
    WORK_LIFE_BALANCE = "work_life_balance"
    REDUCE_PROCRASTINATION = "reduce_procrastination"
    TRACK_PROGRESS = "track_progress"


class DailySchedule(BaseModel):
    """Daily schedule configuration"""

    time_preference: TimePreference
    flexible_enabled: bool = False
    # Week grid: Mon-Sun with preferred work hours (e.g., "9-5", "flexible", etc.)
    week_grid: dict[str, str] = Field(default_factory=dict)

    model_config = ConfigDict(use_enum_values=True)


class OnboardingUpdateRequest(BaseModel):
    """Request model for updating user onboarding preferences"""

    work_preference: WorkPreference | None = None
    adhd_support_level: int | None = Field(
        None, ge=1, le=10, description="ADHD support level (1-10)"
    )
    adhd_challenges: list[ADHDChallenge] | None = None
    daily_schedule: DailySchedule | None = None
    productivity_goals: list[ProductivityGoal] | None = None
    chatgpt_export_prompt: str | None = Field(None, max_length=5000)
    onboarding_completed: bool | None = None
    onboarding_skipped: bool | None = None

    model_config = ConfigDict(
        use_enum_values=True,
        json_schema_extra={
            "example": {
                "work_preference": "remote",
                "adhd_support_level": 7,
                "adhd_challenges": ["time_blindness", "task_initiation", "focus"],
                "daily_schedule": {
                    "time_preference": "morning",
                    "flexible_enabled": False,
                    "week_grid": {
                        "monday": "8-12,14-18",
                        "tuesday": "8-12,14-18",
                        "wednesday": "flexible",
                        "thursday": "8-12,14-18",
                        "friday": "8-13",
                        "saturday": "off",
                        "sunday": "off",
                    },
                },
                "productivity_goals": ["reduce_overwhelm", "increase_focus", "build_habits"],
                "onboarding_completed": True,
            }
        },
    )


class OnboardingResponse(BaseModel):
    """Response model for user onboarding data"""

    user_id: str
    work_preference: WorkPreference | None = None
    adhd_support_level: int | None = Field(None, ge=1, le=10)
    adhd_challenges: list[ADHDChallenge] = Field(default_factory=list)
    daily_schedule: DailySchedule | None = None
    productivity_goals: list[ProductivityGoal] = Field(default_factory=list)
    chatgpt_export_prompt: str | None = None
    chatgpt_exported_at: datetime | None = None
    onboarding_completed: bool = False
    onboarding_skipped: bool = False
    completed_at: datetime | None = None
    skipped_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        use_enum_values=True,
        from_attributes=True,
        json_schema_extra={
            "example": {
                "user_id": "user_123",
                "work_preference": "remote",
                "adhd_support_level": 7,
                "adhd_challenges": ["time_blindness", "focus"],
                "daily_schedule": {
                    "time_preference": "morning",
                    "flexible_enabled": False,
                    "week_grid": {"monday": "8-17", "tuesday": "8-17"},
                },
                "productivity_goals": ["reduce_overwhelm", "increase_focus"],
                "chatgpt_export_prompt": "You are helping someone with...",
                "chatgpt_exported_at": "2025-11-07T10:00:00Z",
                "onboarding_completed": True,
                "onboarding_skipped": False,
                "completed_at": "2025-11-07T10:05:00Z",
                "created_at": "2025-11-07T10:00:00Z",
                "updated_at": "2025-11-07T10:05:00Z",
            }
        },
    )


class OnboardingCompletionRequest(BaseModel):
    """Request to mark onboarding as completed or skipped"""

    completed: bool = Field(..., description="True to complete, False to skip")

    model_config = ConfigDict(json_schema_extra={"example": {"completed": True}})
