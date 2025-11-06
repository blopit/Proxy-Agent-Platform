"""Statistics-related Pydantic models."""
from pydantic import BaseModel, Field


class UserStatisticsResponse(BaseModel):
    """Response model for user statistics endpoint."""

    user_id: str = Field(
        ...,
        description="Unique identifier for the user",
        example="user_123"
    )
    total_tasks: int = Field(
        ...,
        description="Total number of tasks created by the user",
        ge=0,
        example=50
    )
    completed_tasks: int = Field(
        ...,
        description="Number of tasks completed by the user",
        ge=0,
        example=42
    )
    completion_rate: float = Field(
        ...,
        description="Percentage of tasks completed (0-100)",
        ge=0.0,
        le=100.0,
        example=84.0
    )
    avg_completion_time_minutes: float = Field(
        ...,
        description="Average time in minutes to complete a task",
        ge=0.0,
        example=25.5
    )
    productivity_score: float = Field(
        ...,
        description="Overall productivity score (0-100)",
        ge=0.0,
        le=100.0,
        example=78.5
    )
    streak_days: int = Field(
        ...,
        description="Current consecutive days with task completions",
        ge=0,
        example=7
    )

    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "total_tasks": 50,
                "completed_tasks": 42,
                "completion_rate": 84.0,
                "avg_completion_time_minutes": 25.5,
                "productivity_score": 78.5,
                "streak_days": 7
            }
        }


class ProductivityScoreResponse(BaseModel):
    """Response model for productivity score endpoint."""

    user_id: str = Field(
        ...,
        description="Unique identifier for the user",
        example="user_123"
    )
    productivity_score: float = Field(
        ...,
        description="Productivity score (0-100) based on completion rate, velocity, consistency, and volume",
        ge=0.0,
        le=100.0,
        example=78.5
    )

    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "productivity_score": 78.5
            }
        }
