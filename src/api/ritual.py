"""
Morning Ritual API Endpoints - SIMPLIFIED FOR MVP

Provides simple daily planning ritual:
- Triggered when user opens app in morning (6am-12pm)
- Select 3 focus tasks for the day
- Track completion (one ritual per day)

No midday/evening rituals, no notifications - just opportunistic morning planning.
"""

import logging
from datetime import datetime, date
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from src.database.enhanced_adapter import get_enhanced_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ritual", tags=["ritual"])

# ============================================================================
# Pydantic Models
# ============================================================================


class RitualCheckResponse(BaseModel):
    """Response for checking if ritual should be shown"""

    should_show: bool
    reason: str
    completed_today: bool
    is_morning: bool


class RitualCompleteRequest(BaseModel):
    """Request to complete morning ritual"""

    focus_task_1_id: str | None = None
    focus_task_2_id: str | None = None
    focus_task_3_id: str | None = None
    skipped: bool = Field(False, description="User dismissed the ritual")


class RitualCompleteResponse(BaseModel):
    """Response after completing ritual"""

    ritual_id: str
    completion_date: str
    focus_tasks: list[str]  # IDs of selected tasks
    skipped: bool
    message: str


class RitualStatsResponse(BaseModel):
    """Ritual completion statistics"""

    total_rituals_completed: int
    total_rituals_skipped: int
    current_streak: int
    completion_rate: float  # Percentage


# ============================================================================
# Helper Functions
# ============================================================================


def is_morning_time() -> bool:
    """Check if current time is morning (6am-12pm)"""
    current_hour = datetime.now().hour
    return 6 <= current_hour < 12


def has_ritual_today(user_id: str) -> bool:
    """Check if user has already completed ritual today"""
    db = get_enhanced_database()
    conn = db.get_connection()
    cursor = conn.cursor()

    today = date.today().isoformat()

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM morning_rituals
        WHERE user_id = ? AND completion_date = ?
        """,
        (user_id, today)
    )

    count = cursor.fetchone()[0]
    return count > 0


# ============================================================================
# API Endpoints
# ============================================================================


@router.get("/check", response_model=RitualCheckResponse)
async def check_ritual(
    user_id: str = "mobile-user"  # TODO: Get from auth when enabled
):
    """
    Check if morning ritual should be shown to user.

    Returns:
    - should_show: True if ritual should appear
    - reason: Why it should/shouldn't show
    - completed_today: Whether already done today
    - is_morning: Whether it's currently morning time

    Ritual shows when:
    - It's morning time (6am-12pm)
    - User hasn't completed it today
    - User opens the app (triggered by frontend)
    """
    try:
        is_morning = is_morning_time()
        completed = has_ritual_today(user_id)

        should_show = is_morning and not completed

        if completed:
            reason = "Already completed morning ritual today"
        elif not is_morning:
            reason = "Not morning time (ritual available 6am-12pm)"
        else:
            reason = "Ready to plan your day"

        return RitualCheckResponse(
            should_show=should_show,
            reason=reason,
            completed_today=completed,
            is_morning=is_morning
        )

    except Exception as e:
        logger.error(f"Failed to check ritual: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check ritual: {str(e)}"
        )


@router.post("/complete", response_model=RitualCompleteResponse)
async def complete_ritual(
    ritual_data: RitualCompleteRequest,
    user_id: str = "mobile-user"  # TODO: Get from auth when enabled
):
    """
    Complete (or skip) the morning ritual.

    User can:
    - Select 0-3 focus tasks for the day
    - Or skip the ritual entirely

    Only one ritual per day allowed.
    """
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        # Check if already completed today
        if has_ritual_today(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Morning ritual already completed today"
            )

        # Create ritual record
        ritual_id = str(uuid4())
        today = date.today().isoformat()
        now = datetime.now().isoformat()

        # Collect focus task IDs
        focus_tasks = []
        if ritual_data.focus_task_1_id:
            focus_tasks.append(ritual_data.focus_task_1_id)
        if ritual_data.focus_task_2_id:
            focus_tasks.append(ritual_data.focus_task_2_id)
        if ritual_data.focus_task_3_id:
            focus_tasks.append(ritual_data.focus_task_3_id)

        cursor.execute(
            """
            INSERT INTO morning_rituals
            (ritual_id, user_id, completion_date, focus_task_1_id, focus_task_2_id,
             focus_task_3_id, skipped, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                ritual_id,
                user_id,
                today,
                ritual_data.focus_task_1_id,
                ritual_data.focus_task_2_id,
                ritual_data.focus_task_3_id,
                ritual_data.skipped,
                now
            )
        )
        conn.commit()

        # Build message
        if ritual_data.skipped:
            message = "Morning ritual skipped"
        elif len(focus_tasks) == 0:
            message = "Morning ritual completed (no focus tasks selected)"
        else:
            message = f"Morning ritual complete! {len(focus_tasks)} focus task(s) for today"

        return RitualCompleteResponse(
            ritual_id=ritual_id,
            completion_date=today,
            focus_tasks=focus_tasks,
            skipped=ritual_data.skipped,
            message=message
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to complete ritual: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete ritual: {str(e)}"
        )


@router.get("/stats", response_model=RitualStatsResponse)
async def get_ritual_stats(
    user_id: str = "mobile-user"  # TODO: Get from auth when enabled
):
    """
    Get morning ritual completion statistics.

    Shows:
    - Total rituals completed
    - Total rituals skipped
    - Current streak (consecutive days)
    - Completion rate percentage
    """
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get total counts
        cursor.execute(
            """
            SELECT
                COUNT(CASE WHEN skipped = FALSE THEN 1 END) as completed,
                COUNT(CASE WHEN skipped = TRUE THEN 1 END) as skipped
            FROM morning_rituals
            WHERE user_id = ?
            """,
            (user_id,)
        )

        row = cursor.fetchone()
        total_completed = row[0] or 0
        total_skipped = row[1] or 0
        total = total_completed + total_skipped

        completion_rate = (total_completed / total * 100) if total > 0 else 0

        # Calculate current streak
        cursor.execute(
            """
            SELECT completion_date, skipped
            FROM morning_rituals
            WHERE user_id = ?
            ORDER BY completion_date DESC
            """,
            (user_id,)
        )

        rows = cursor.fetchall()

        current_streak = 0
        expected_date = date.today()

        for row in rows:
            ritual_date = date.fromisoformat(row[0])
            was_skipped = bool(row[1])

            if ritual_date == expected_date and not was_skipped:
                current_streak += 1
                expected_date = date.fromisoformat(row[0])
                expected_date = date.fromordinal(expected_date.toordinal() - 1)
            else:
                break

        return RitualStatsResponse(
            total_rituals_completed=total_completed,
            total_rituals_skipped=total_skipped,
            current_streak=current_streak,
            completion_rate=round(completion_rate, 1)
        )

    except Exception as e:
        logger.error(f"Failed to get ritual stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )


@router.get("/today")
async def get_todays_ritual(
    user_id: str = "mobile-user"  # TODO: Get from auth when enabled
):
    """
    Get today's ritual if it exists.

    Returns the focus tasks selected in this morning's ritual.
    """
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        today = date.today().isoformat()

        cursor.execute(
            """
            SELECT
                ritual_id,
                focus_task_1_id,
                focus_task_2_id,
                focus_task_3_id,
                skipped,
                completed_at
            FROM morning_rituals
            WHERE user_id = ? AND completion_date = ?
            """,
            (user_id, today)
        )

        row = cursor.fetchone()

        if not row:
            return {
                "completed_today": False,
                "message": "No morning ritual completed yet today"
            }

        focus_tasks = []
        if row[1]:
            focus_tasks.append(row[1])
        if row[2]:
            focus_tasks.append(row[2])
        if row[3]:
            focus_tasks.append(row[3])

        return {
            "completed_today": True,
            "ritual_id": row[0],
            "focus_tasks": focus_tasks,
            "skipped": bool(row[4]),
            "completed_at": row[5],
            "message": f"Morning ritual completed with {len(focus_tasks)} focus task(s)"
        }

    except Exception as e:
        logger.error(f"Failed to get today's ritual: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get today's ritual: {str(e)}"
        )


# ============================================================================
# MVP SCOPE NOTES
# ============================================================================

# ✅ IMPLEMENTED:
# - GET /check: Check if ritual should show
# - POST /complete: Complete or skip ritual
# - GET /stats: View ritual statistics
# - GET /today: Get today's focus tasks

# ✅ FEATURES:
# - Opportunistic (triggered by app open, not notification)
# - Morning time only (6am-12pm)
# - Select 0-3 focus tasks
# - Skip option
# - Streak tracking
# - One ritual per day

# ❌ NOT IN MVP:
# - Midday check-in ritual
# - Evening reflection ritual
# - Scheduled notifications
# - Inbox sorting during ritual
# - Energy level allocation
