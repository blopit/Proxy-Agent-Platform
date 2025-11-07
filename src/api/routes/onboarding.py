"""User Onboarding API router."""

from fastapi import APIRouter, HTTPException, status

from src.api.routes.schemas.onboarding_schemas import (
    OnboardingCompletionRequest,
    OnboardingResponse,
    OnboardingUpdateRequest,
)
from src.services.onboarding_service import OnboardingService

router = APIRouter(prefix="/api/v1/users", tags=["onboarding"])

# Singleton service instance (in production, use dependency injection)
_onboarding_service = OnboardingService()


@router.get(
    "/{user_id}/onboarding",
    response_model=OnboardingResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user onboarding data",
    description=(
        "Returns onboarding preferences for a user including work preferences, "
        "ADHD support level, challenges, daily schedule, and productivity goals."
    ),
    response_description="User onboarding data",
    responses={
        200: {
            "description": "Onboarding data retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "user_id": "user_123",
                        "work_preference": "remote",
                        "adhd_support_level": 7,
                        "adhd_challenges": ["time_blindness", "focus"],
                        "daily_schedule": {
                            "time_preference": "morning",
                            "flexible_enabled": False,
                            "week_grid": {"monday": "8-17"},
                        },
                        "productivity_goals": ["reduce_overwhelm", "increase_focus"],
                        "onboarding_completed": True,
                        "created_at": "2025-11-07T10:00:00Z",
                        "updated_at": "2025-11-07T10:05:00Z",
                    }
                }
            },
        },
        404: {
            "description": "Onboarding data not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Onboarding data not found for user: user_999"}
                }
            },
        },
    },
)
async def get_user_onboarding(user_id: str) -> OnboardingResponse:
    """
    Get onboarding data for a user.

    Args:
        user_id: The unique identifier for the user

    Returns:
        OnboardingResponse: Object containing all onboarding data

    Raises:
        HTTPException: 404 if onboarding data not found
    """
    onboarding = await _onboarding_service.get_onboarding(user_id)

    if onboarding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Onboarding data not found for user: {user_id}",
        )

    return onboarding


@router.put(
    "/{user_id}/onboarding",
    response_model=OnboardingResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user onboarding data",
    description=(
        "Create or update onboarding preferences for a user. "
        "Partial updates are supported - only provided fields will be updated."
    ),
    response_description="Updated onboarding data",
    responses={
        200: {
            "description": "Onboarding data updated successfully",
        },
        400: {
            "description": "Invalid request data",
            "content": {"application/json": {"example": {"detail": "Invalid ADHD support level"}}},
        },
    },
)
async def update_user_onboarding(user_id: str, data: OnboardingUpdateRequest) -> OnboardingResponse:
    """
    Create or update onboarding data for a user.

    Supports partial updates - only provide the fields you want to update.

    Args:
        user_id: The unique identifier for the user
        data: Onboarding data to update

    Returns:
        OnboardingResponse: Updated onboarding data

    Raises:
        HTTPException: 400 if validation fails
    """
    try:
        onboarding = await _onboarding_service.upsert_onboarding(user_id, data)
        return onboarding
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.post(
    "/{user_id}/onboarding/complete",
    response_model=OnboardingResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark onboarding as completed or skipped",
    description=(
        "Mark the onboarding flow as completed (user went through all steps) "
        "or skipped (user chose to skip onboarding)."
    ),
    response_description="Updated onboarding data with completion status",
    responses={
        200: {
            "description": "Onboarding status updated successfully",
        },
    },
)
async def complete_user_onboarding(
    user_id: str, data: OnboardingCompletionRequest
) -> OnboardingResponse:
    """
    Mark onboarding as completed or skipped.

    Args:
        user_id: The unique identifier for the user
        data: Completion request with 'completed' boolean

    Returns:
        OnboardingResponse: Updated onboarding data

    Raises:
        HTTPException: 400 if validation fails
    """
    try:
        onboarding = await _onboarding_service.mark_completed(user_id, data.completed)
        return onboarding
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.delete(
    "/{user_id}/onboarding",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user onboarding data",
    description="Permanently delete all onboarding data for a user.",
    responses={
        204: {
            "description": "Onboarding data deleted successfully",
        },
        404: {
            "description": "Onboarding data not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Onboarding data not found for user: user_999"}
                }
            },
        },
    },
)
async def delete_user_onboarding(user_id: str) -> None:
    """
    Delete onboarding data for a user.

    Args:
        user_id: The unique identifier for the user

    Raises:
        HTTPException: 404 if onboarding data not found
    """
    deleted = await _onboarding_service.delete_onboarding(user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Onboarding data not found for user: {user_id}",
        )
