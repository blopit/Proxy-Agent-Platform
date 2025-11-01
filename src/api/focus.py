"""
Focus Session API Endpoints - SIMPLIFIED FOR MVP

Provides simple Pomodoro timer (25min work / 5min break):
- Start a focus session
- Check session status
- Complete session and earn XP

No distraction tracking, no multiple techniques - just pure Pomodoro.
"""

import logging
from datetime import datetime, timedelta
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.api.auth import get_current_user
from src.core.task_models import User
from src.database.enhanced_adapter import get_enhanced_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/focus", tags=["focus"])

# ============================================================================
# Pydantic Models (Simplified)
# ============================================================================


class PomodoroStartRequest(BaseModel):
    """Request to start a Pomodoro session"""

    task_description: str = Field(
        ..., min_length=1, max_length=200, description="What are you working on?"
    )


class PomodoroResponse(BaseModel):
    """Pomodoro session response"""

    session_id: str
    task_description: str
    work_duration_minutes: int  # Always 25
    break_duration_minutes: int  # Always 5
    started_at: str
    ends_at: str
    status: str  # "active", "break", "completed"
    message: str


class SessionStatusResponse(BaseModel):
    """Current session status"""

    session_id: str
    status: str  # "active", "break", "completed", "none"
    elapsed_minutes: int
    remaining_minutes: int
    progress_percent: float
    task_description: str | None
    message: str


class SessionCompleteRequest(BaseModel):
    """Request to complete session"""

    actually_focused: bool = Field(
        True, description="Did you stay focused during the session?"
    )


class SessionCompleteResponse(BaseModel):
    """Session completion response"""

    session_id: str
    actual_duration_minutes: int
    xp_earned: int
    streak_updated: bool
    message: str


# ============================================================================
# Pomodoro Constants
# ============================================================================

WORK_DURATION = 25  # minutes
BREAK_DURATION = 5  # minutes
XP_PER_POMODORO = 50  # XP earned for completing a session
XP_BONUS_FOCUSED = 25  # Bonus if user reports they stayed focused


# ============================================================================
# Helper Functions
# ============================================================================


def get_active_session(user_id: str):
    """Get active session for user from database"""
    db = get_enhanced_database()
    conn = db.get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            session_id,
            task_description,
            started_at,
            ends_at,
            status
        FROM focus_sessions
        WHERE user_id = ? AND status IN ('active', 'break')
        ORDER BY started_at DESC
        LIMIT 1
        """,
        (user_id,)
    )

    row = cursor.fetchone()
    if not row:
        return None

    return {
        "session_id": row[0],
        "task_description": row[1],
        "started_at": row[2],
        "ends_at": row[3],
        "status": row[4]
    }


def calculate_progress(started_at_str: str, ends_at_str: str):
    """Calculate session progress"""
    started_at = datetime.fromisoformat(started_at_str)
    ends_at = datetime.fromisoformat(ends_at_str)
    now = datetime.now()

    total_duration = (ends_at - started_at).total_seconds() / 60  # minutes
    elapsed = (now - started_at).total_seconds() / 60  # minutes
    remaining = max(0, (ends_at - now).total_seconds() / 60)  # minutes

    progress_percent = min(100, (elapsed / total_duration) * 100)

    return {
        "elapsed_minutes": int(elapsed),
        "remaining_minutes": int(remaining),
        "progress_percent": round(progress_percent, 1)
    }


# ============================================================================
# API Endpoints
# ============================================================================


@router.post("/start", response_model=PomodoroResponse, status_code=status.HTTP_201_CREATED)
async def start_pomodoro(
    request: PomodoroStartRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Start a Pomodoro session (25 minutes of focused work).

    Classic Pomodoro technique:
    - 25 minutes of focused work
    - 5 minute break after
    - Earn 50 XP for completion (+25 bonus if you stay focused)

    Only one active session allowed at a time.
    """
    user_id = current_user.user_id
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        # Check if user already has an active session
        existing = get_active_session(user_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"You already have an active Pomodoro session. Complete it first."
            )

        # Create new session
        session_id = str(uuid4())
        started_at = datetime.now()
        ends_at = started_at + timedelta(minutes=WORK_DURATION)

        cursor.execute(
            """
            INSERT INTO focus_sessions
            (session_id, user_id, task_description, started_at, ends_at,
             work_duration_minutes, break_duration_minutes, status,
             planned_duration_minutes, session_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                user_id,
                request.task_description,
                started_at.isoformat(),
                ends_at.isoformat(),
                WORK_DURATION,
                BREAK_DURATION,
                "active",
                WORK_DURATION,  # planned_duration_minutes
                "pomodoro"  # session_type
            )
        )
        conn.commit()

        return PomodoroResponse(
            session_id=session_id,
            task_description=request.task_description,
            work_duration_minutes=WORK_DURATION,
            break_duration_minutes=BREAK_DURATION,
            started_at=started_at.isoformat(),
            ends_at=ends_at.isoformat(),
            status="active",
            message=f"🍅 Pomodoro started! Focus for {WORK_DURATION} minutes."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start Pomodoro: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start session: {str(e)}"
        )


@router.get("/status", response_model=SessionStatusResponse)
async def get_pomodoro_status(
    current_user: User = Depends(get_current_user)
):
    """
    Get status of your current Pomodoro session.

    Returns:
    - Time elapsed and remaining
    - Progress percentage
    - What you're working on
    - Whether it's work time or break time
    """
    user_id = current_user.user_id
    try:
        session = get_active_session(user_id)

        if not session:
            return SessionStatusResponse(
                session_id="none",
                status="none",
                elapsed_minutes=0,
                remaining_minutes=0,
                progress_percent=0,
                task_description=None,
                message="No active Pomodoro session"
            )

        progress = calculate_progress(session["started_at"], session["ends_at"])

        # Auto-transition to break if work session completed
        if progress["remaining_minutes"] <= 0 and session["status"] == "active":
            db = get_enhanced_database()
            conn = db.get_connection()
            cursor = conn.cursor()

            # Update to break status
            break_ends_at = datetime.now() + timedelta(minutes=BREAK_DURATION)
            cursor.execute(
                """
                UPDATE focus_sessions
                SET status = 'break',
                    ends_at = ?,
                    completed_at = ?
                WHERE session_id = ?
                """,
                (break_ends_at.isoformat(), datetime.now().isoformat(), session["session_id"])
            )
            conn.commit()

            session["status"] = "break"
            session["ends_at"] = break_ends_at.isoformat()
            progress = calculate_progress(datetime.now().isoformat(), session["ends_at"])

        emoji = "🍅" if session["status"] == "active" else "☕"
        status_text = "Focus time" if session["status"] == "active" else "Break time"

        return SessionStatusResponse(
            session_id=session["session_id"],
            status=session["status"],
            elapsed_minutes=progress["elapsed_minutes"],
            remaining_minutes=progress["remaining_minutes"],
            progress_percent=progress["progress_percent"],
            task_description=session["task_description"],
            message=f"{emoji} {status_text}: {progress['remaining_minutes']} min remaining"
        )

    except Exception as e:
        logger.error(f"Failed to get session status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status: {str(e)}"
        )


@router.post("/complete", response_model=SessionCompleteResponse)
async def complete_pomodoro(
    request: SessionCompleteRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Mark your Pomodoro session as complete and earn XP.

    XP Rewards:
    - Base: 50 XP for completing the session
    - Bonus: +25 XP if you stayed focused (total: 75 XP)

    This also updates your daily streak if applicable.
    """
    user_id = current_user.user_id
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get active session
        session = get_active_session(user_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active Pomodoro session to complete"
            )

        # Calculate actual duration
        started_at = datetime.fromisoformat(session["started_at"])
        actual_duration = (datetime.now() - started_at).total_seconds() / 60

        # Calculate XP
        xp_earned = XP_PER_POMODORO
        if request.actually_focused:
            xp_earned += XP_BONUS_FOCUSED

        # Update session to completed
        cursor.execute(
            """
            UPDATE focus_sessions
            SET status = 'completed',
                completed_at = ?,
                xp_earned = ?
            WHERE session_id = ?
            """,
            (datetime.now().isoformat(), xp_earned, session["session_id"])
        )

        # Update user progress (if user_progress table exists)
        cursor.execute(
            """
            UPDATE user_progress
            SET total_xp = total_xp + ?,
                last_completion_date = DATE('now')
            WHERE user_id = ?
            """,
            (xp_earned, user_id)
        )

        conn.commit()

        return SessionCompleteResponse(
            session_id=session["session_id"],
            actual_duration_minutes=int(actual_duration),
            xp_earned=xp_earned,
            streak_updated=True,
            message=f"🎉 Pomodoro complete! +{xp_earned} XP"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to complete Pomodoro: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete session: {str(e)}"
        )


# ============================================================================
# MVP SCOPE NOTES
# ============================================================================

# ✅ KEPT (Simple & Effective):
# - POST /start: Start 25-minute Pomodoro
# - GET /status: Check progress
# - POST /complete: Mark done, earn XP

# ❌ ARCHIVED (Complex, not MVP):
# - Multiple techniques (Deep Work, Timeboxing)
# - Distraction tracking and interventions
# - Break activity recommendations
# - Focus score algorithms
# - Advanced analytics

# See archive/backend/services/focus_router_complex.py for full implementation
