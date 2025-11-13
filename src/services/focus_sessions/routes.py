"""
API routes for Focus Sessions Service (BE-03).

Provides endpoints for managing Pomodoro focus sessions.
"""

from fastapi import APIRouter, HTTPException, Query, status

from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.services.focus_sessions.models import (
    FocusAnalytics,
    FocusSession,
    FocusSessionCreate,
    FocusSessionUpdate,
)
from src.services.focus_sessions.repository import FocusSessionRepository

router = APIRouter(prefix="/api/v1/focus/sessions", tags=["focus"])


def get_repository() -> FocusSessionRepository:
    """Get focus session repository instance."""
    db = EnhancedDatabaseAdapter()
    return FocusSessionRepository(db)


@router.post("/", response_model=FocusSession, status_code=status.HTTP_201_CREATED)
async def start_focus_session(session_data: FocusSessionCreate):
    """
    Start a new focus session.

    Args:
        session_data: Focus session creation data

    Returns:
        FocusSession: Created session
    """
    repo = get_repository()
    return repo.create(session_data)


@router.put("/{session_id}", response_model=FocusSession)
async def end_focus_session(session_id: str, update_data: FocusSessionUpdate):
    """
    End/update a focus session.

    Args:
        session_id: Session ID
        update_data: Update data (completed, interruptions)

    Returns:
        FocusSession: Updated session

    Raises:
        HTTPException: 404 if session not found
    """
    repo = get_repository()
    session = repo.update(session_id, update_data)

    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Focus session not found")

    return session


@router.get("/user/{user_id}", response_model=list[FocusSession])
async def get_user_sessions(user_id: str, limit: int = Query(10, ge=1, le=100)):
    """
    Get user's recent focus sessions.

    Args:
        user_id: User ID
        limit: Maximum sessions to return (1-100)

    Returns:
        List of FocusSession objects
    """
    repo = get_repository()
    return repo.get_by_user(user_id, limit)


@router.get("/analytics/{user_id}", response_model=FocusAnalytics)
async def get_focus_analytics(user_id: str):
    """
    Get focus session analytics for user.

    Args:
        user_id: User ID

    Returns:
        FocusAnalytics: Calculated metrics
    """
    repo = get_repository()
    return repo.get_analytics(user_id)
