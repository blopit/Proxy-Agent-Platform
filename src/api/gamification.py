"""
Gamification API Endpoints - SIMPLIFIED FOR MVP

Provides simple XP and streak tracking:
- View current XP and level
- Track daily streaks
- Simple level progression

No achievements, leaderboards, or complex motivation algorithms - just core progression.
"""

import logging
from datetime import datetime, date

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from src.database.enhanced_adapter import get_enhanced_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/gamification", tags=["gamification"])

# ============================================================================
# Pydantic Models (Simplified)
# ============================================================================


class UserProgressResponse(BaseModel):
    """User XP and level response"""

    user_id: str
    total_xp: int
    current_level: int
    xp_for_next_level: int
    xp_progress_percent: float
    current_streak: int
    longest_streak: int
    total_tasks_completed: int
    message: str


class StreakResponse(BaseModel):
    """User streak response"""

    user_id: str
    current_streak: int
    longest_streak: int
    last_completion_date: str | None
    streak_at_risk: bool  # True if haven't completed task today
    message: str


# ============================================================================
# XP & Level Constants
# ============================================================================

# Simple exponential level progression
# Level 1→2: 100 XP
# Level 2→3: 180 XP
# Level 3→4: 324 XP
# Level 10→11: ~2,600 XP
def xp_for_level(level: int) -> int:
    """Calculate XP required for given level (exponential curve)"""
    return int(100 * (level ** 1.5))


def calculate_level(total_xp: int) -> int:
    """Calculate level from total XP"""
    level = 1
    while total_xp >= xp_for_level(level):
        total_xp -= xp_for_level(level)
        level += 1
    return level


def xp_progress_in_current_level(total_xp: int) -> tuple[int, int, float]:
    """Calculate progress within current level"""
    level = calculate_level(total_xp)

    # Calculate XP used for previous levels
    xp_used = 0
    for lvl in range(1, level):
        xp_used += xp_for_level(lvl)

    # XP in current level
    xp_in_level = total_xp - xp_used
    xp_needed = xp_for_level(level)
    progress_percent = (xp_in_level / xp_needed) * 100

    return (xp_in_level, xp_needed, progress_percent)


# ============================================================================
# Helper Functions
# ============================================================================


def get_or_create_user_progress(user_id: str) -> dict:
    """Get user progress from database, create if doesn't exist"""
    db = get_enhanced_database()
    conn = db.get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            total_xp,
            current_level,
            current_streak,
            longest_streak,
            last_completion_date,
            total_tasks_completed
        FROM user_progress
        WHERE user_id = ?
        """,
        (user_id,)
    )

    row = cursor.fetchone()

    if row:
        return {
            "total_xp": row[0],
            "current_level": row[1],
            "current_streak": row[2],
            "longest_streak": row[3],
            "last_completion_date": row[4],
            "total_tasks_completed": row[5]
        }
    else:
        # Create new user progress
        cursor.execute(
            """
            INSERT INTO user_progress
            (user_id, total_xp, current_level, current_streak, longest_streak,
             total_tasks_completed, created_at, updated_at)
            VALUES (?, 0, 1, 0, 0, 0, ?, ?)
            """,
            (user_id, datetime.now().isoformat(), datetime.now().isoformat())
        )
        conn.commit()

        return {
            "total_xp": 0,
            "current_level": 1,
            "current_streak": 0,
            "longest_streak": 0,
            "last_completion_date": None,
            "total_tasks_completed": 0
        }


def update_streak(user_id: str) -> dict:
    """Update user's streak based on last completion date"""
    db = get_enhanced_database()
    conn = db.get_connection()
    cursor = conn.cursor()

    progress = get_or_create_user_progress(user_id)

    today = date.today()
    last_date_str = progress["last_completion_date"]

    if not last_date_str:
        # First completion ever
        new_streak = 1
        longest_streak = 1
    else:
        last_date = date.fromisoformat(last_date_str)
        days_since = (today - last_date).days

        if days_since == 0:
            # Already completed today, no change
            return {
                "current_streak": progress["current_streak"],
                "longest_streak": progress["longest_streak"],
                "streak_continued": False
            }
        elif days_since == 1:
            # Continue streak
            new_streak = progress["current_streak"] + 1
            longest_streak = max(new_streak, progress["longest_streak"])
        else:
            # Streak broken, restart
            new_streak = 1
            longest_streak = progress["longest_streak"]

    # Update database
    cursor.execute(
        """
        UPDATE user_progress
        SET current_streak = ?,
            longest_streak = ?,
            last_completion_date = ?,
            total_tasks_completed = total_tasks_completed + 1,
            updated_at = ?
        WHERE user_id = ?
        """,
        (new_streak, longest_streak, today.isoformat(), datetime.now().isoformat(), user_id)
    )
    conn.commit()

    return {
        "current_streak": new_streak,
        "longest_streak": longest_streak,
        "streak_continued": True
    }


# ============================================================================
# API Endpoints
# ============================================================================


@router.get("/progress", response_model=UserProgressResponse)
async def get_user_progress(
    user_id: str = "mobile-user"  # TODO: Get from auth when enabled
):
    """
    Get your current XP, level, and progress.

    Shows:
    - Total XP earned
    - Current level
    - Progress to next level
    - Current and longest streaks
    - Total tasks completed
    """
    try:
        progress = get_or_create_user_progress(user_id)

        # Calculate level and progress
        total_xp = progress["total_xp"]
        level = calculate_level(total_xp)
        xp_in_level, xp_needed, progress_percent = xp_progress_in_current_level(total_xp)

        # Check if streak is at risk
        last_date_str = progress["last_completion_date"]
        streak_at_risk = False
        if last_date_str:
            last_date = date.fromisoformat(last_date_str)
            days_since = (date.today() - last_date).days
            streak_at_risk = (days_since >= 1)  # Haven't completed today

        return UserProgressResponse(
            user_id=user_id,
            total_xp=total_xp,
            current_level=level,
            xp_for_next_level=xp_needed,
            xp_progress_percent=round(progress_percent, 1),
            current_streak=progress["current_streak"],
            longest_streak=progress["longest_streak"],
            total_tasks_completed=progress["total_tasks_completed"],
            message=f"⭐ Level {level} | {total_xp} XP | {progress['current_streak']}🔥 streak"
        )

    except Exception as e:
        logger.error(f"Failed to get user progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get progress: {str(e)}"
        )


class AddXPRequest(BaseModel):
    """Request model for adding XP"""
    xp_amount: int = Field(..., ge=1, le=1000, description="XP to add")
    reason: str = Field("Task completed", description="Reason for XP")
    user_id: str = Field("mobile-user", description="User ID")


@router.post("/xp/add")
async def add_xp(request: AddXPRequest):
    """
    Add XP to user (called when completing tasks/sessions).

    This endpoint:
    - Adds XP to user's total
    - Updates their level if they level up
    - Updates streak if it's a new day
    - Returns updated progress
    """
    xp_amount = request.xp_amount
    reason = request.reason
    user_id = request.user_id
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get current progress
        progress = get_or_create_user_progress(user_id)
        old_level = progress["current_level"]
        old_xp = progress["total_xp"]

        # Add XP
        new_total_xp = old_xp + xp_amount
        new_level = calculate_level(new_total_xp)
        leveled_up = (new_level > old_level)

        # Update streak
        streak_info = update_streak(user_id)

        # Update XP and level in database
        cursor.execute(
            """
            UPDATE user_progress
            SET total_xp = ?,
                current_level = ?,
                updated_at = ?
            WHERE user_id = ?
            """,
            (new_total_xp, new_level, datetime.now().isoformat(), user_id)
        )
        conn.commit()

        # Build response message
        message = f"+{xp_amount} XP"
        if leveled_up:
            message += f" | 🎉 Level Up! Now level {new_level}"
        if streak_info["streak_continued"]:
            message += f" | 🔥 {streak_info['current_streak']} day streak"

        return {
            "user_id": user_id,
            "xp_added": xp_amount,
            "reason": reason,
            "old_total_xp": old_xp,
            "new_total_xp": new_total_xp,
            "old_level": old_level,
            "new_level": new_level,
            "leveled_up": leveled_up,
            "current_streak": streak_info["current_streak"],
            "message": message
        }

    except Exception as e:
        logger.error(f"Failed to add XP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add XP: {str(e)}"
        )


@router.get("/streak", response_model=StreakResponse)
async def get_streak(
    user_id: str = "mobile-user"  # TODO: Get from auth when enabled
):
    """
    Get your current streak status.

    Streak = consecutive days completing at least one task.
    Breaks if you skip a day.
    """
    try:
        progress = get_or_create_user_progress(user_id)

        # Check if streak is at risk
        last_date_str = progress["last_completion_date"]
        streak_at_risk = False

        if last_date_str:
            last_date = date.fromisoformat(last_date_str)
            days_since = (date.today() - last_date).days

            if days_since >= 1:
                streak_at_risk = True

        emoji = "🔥" if progress["current_streak"] > 0 else "💤"

        message = f"{emoji} {progress['current_streak']} day streak"
        if streak_at_risk and progress["current_streak"] > 0:
            message += " (at risk! Complete a task today)"

        return StreakResponse(
            user_id=user_id,
            current_streak=progress["current_streak"],
            longest_streak=progress["longest_streak"],
            last_completion_date=last_date_str,
            streak_at_risk=streak_at_risk,
            message=message
        )

    except Exception as e:
        logger.error(f"Failed to get streak: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get streak: {str(e)}"
        )


# ============================================================================
# MVP SCOPE NOTES
# ============================================================================

# ✅ KEPT (Simple & Motivating):
# - GET /progress: View XP, level, and streak
# - POST /xp/add: Award XP (called by task completion)
# - GET /streak: Check streak status

# ❌ ARCHIVED (Complex, not MVP):
# - Achievement system (check, unlock, badges)
# - Leaderboards (social comparison)
# - Motivation algorithm (AI recommendations)
# - Reward distribution (no rewards in MVP)
# - Engagement analytics (too complex)

# See archive/backend/services/gamification_router_complex.py for full implementation
