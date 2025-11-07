"""Statistics API router."""

from fastapi import APIRouter, HTTPException, status

from src.core.statistics_models import ProductivityScoreResponse, UserStatisticsResponse
from src.services.task_statistics_service import StatisticsService

router = APIRouter(prefix="/api/statistics", tags=["statistics"])

# Singleton service instance (in production, use dependency injection)
_statistics_service = StatisticsService()


@router.get(
    "/users/{user_id}",
    response_model=UserStatisticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user statistics",
    description=(
        "Returns comprehensive task statistics for a user including "
        "total tasks, completion rate, average completion time, "
        "productivity score, and current streak."
    ),
    response_description="User statistics object with all metrics",
    responses={
        200: {
            "description": "Statistics retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "user_id": "user_123",
                        "total_tasks": 50,
                        "completed_tasks": 42,
                        "completion_rate": 84.0,
                        "avg_completion_time_minutes": 25.5,
                        "productivity_score": 78.5,
                        "streak_days": 7,
                    }
                }
            },
        },
        404: {
            "description": "User not found",
            "content": {"application/json": {"example": {"detail": "User not found: user_999"}}},
        },
    },
)
async def get_user_statistics(user_id: str) -> UserStatisticsResponse:
    """
    Get comprehensive statistics for a user.

    Args:
        user_id: The unique identifier for the user

    Returns:
        UserStatisticsResponse: Object containing all user statistics

    Raises:
        HTTPException: 404 if user not found or invalid user_id
    """
    try:
        stats = await _statistics_service.get_user_statistics(user_id)
        return UserStatisticsResponse(**stats)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"User not found: {user_id}"
        )


@router.get(
    "/users/{user_id}/productivity",
    response_model=ProductivityScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user productivity score",
    description=(
        "Returns the productivity score (0-100) for a user. "
        "The score is calculated based on completion rate (40%), "
        "task velocity (30%), consistency/streak (20%), and volume (10%)."
    ),
    response_description="Productivity score object",
    responses={
        200: {
            "description": "Productivity score retrieved successfully",
            "content": {
                "application/json": {"example": {"user_id": "user_123", "productivity_score": 78.5}}
            },
        },
        404: {
            "description": "User not found",
            "content": {"application/json": {"example": {"detail": "User not found: user_999"}}},
        },
    },
)
async def get_productivity_score(user_id: str) -> ProductivityScoreResponse:
    """
    Get productivity score for a user.

    The productivity score is a composite metric (0-100) that evaluates:
    - Completion rate: How many tasks are completed (40% weight)
    - Task velocity: How quickly tasks are completed (30% weight)
    - Consistency: Streak of consecutive days with completions (20% weight)
    - Volume: Total number of completed tasks (10% weight)

    Args:
        user_id: The unique identifier for the user

    Returns:
        ProductivityScoreResponse: Object containing the productivity score

    Raises:
        HTTPException: 404 if user not found or invalid user_id
    """
    try:
        score = await _statistics_service.get_productivity_score(user_id)
        return ProductivityScoreResponse(user_id=user_id, productivity_score=score)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"User not found: {user_id}"
        )
