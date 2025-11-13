"""
Pydantic models for Focus Sessions Service (BE-03).

TDD Implementation - Models defined to pass tests.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FocusSessionCreate(BaseModel):
    """Request model for creating a focus session."""

    user_id: str = Field(..., min_length=1, description="User identifier")
    step_id: Optional[str] = Field(None, description="Optional link to task step")
    duration_minutes: int = Field(25, ge=5, le=90, description="Session duration (5-90 min)")


class FocusSessionUpdate(BaseModel):
    """Request model for updating/ending a session."""

    ended_at: Optional[datetime] = None
    completed: Optional[bool] = None
    interruptions: Optional[int] = Field(None, ge=0, description="Number of interruptions")


class FocusSession(BaseModel):
    """Response model for a focus session."""

    session_id: str
    user_id: str
    step_id: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]
    duration_minutes: int
    completed: bool
    interruptions: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FocusAnalytics(BaseModel):
    """Analytics summary for user's focus sessions."""

    total_sessions: int = Field(..., description="Total number of sessions")
    completed_sessions: int = Field(..., description="Number of completed sessions")
    completion_rate: float = Field(..., description="Completion rate (0.0-1.0)")
    total_focus_minutes: int = Field(..., description="Total focus time in minutes")
    average_duration_minutes: float = Field(..., description="Average session duration")
