"""
Rewards API - Dopamine-engineered reward endpoints for mobile

Provides endpoints for:
- Claiming rewards after task completion
- Opening mystery boxes
- Getting current session multipliers
- Power hour status
"""

import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.database.enhanced_adapter import get_enhanced_database
from src.services.dopamine_reward_service import DopamineRewardService, RewardResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/rewards", tags=["rewards"])

# Initialize dopamine reward service
reward_service = DopamineRewardService()


# Request/Response models


class RewardClaimRequest(BaseModel):
    """Request to claim reward after task completion"""

    user_id: str = Field(..., description="User identifier")
    task_id: str | None = Field(None, description="Task ID if applicable")
    action_type: str = Field(..., description="Action type: task|microstep|streak")
    task_priority: str = Field(default="medium", description="Task priority")
    streak_days: int = Field(default=0, description="Current streak in days")
    power_hour_active: bool = Field(default=False, description="Power hour active")
    energy_level: int = Field(default=50, description="Current energy level 0-100")


class RewardClaimResponse(BaseModel):
    """Response after claiming reward"""

    success: bool
    base_xp: int
    multiplier: float
    total_xp: int
    tier: str
    bonus_reason: str
    celebration_type: str
    sound_effect: str
    streak_bonus: int
    mystery_unlocked: bool
    mystery_content: dict | None = None
    new_total_xp: int
    new_level: int
    level_up: bool


class MysteryBoxRequest(BaseModel):
    """Request to open mystery box"""

    user_id: str = Field(..., description="User identifier")
    user_level: int = Field(default=1, description="User level")


class SessionMultiplierRequest(BaseModel):
    """Request for current session multiplier"""

    user_id: str = Field(..., description="User identifier")
    tasks_completed_today: int = Field(default=0, description="Tasks done today")


# Endpoints


@router.post("/claim", response_model=RewardClaimResponse)
async def claim_reward(request: RewardClaimRequest):
    """
    Claim reward after completing a task/micro-step.

    This is the main dopamine hit endpoint - called after every action.
    Uses variable ratio reward schedule for maximum engagement.
    """
    try:
        # Calculate reward based on action type
        if request.action_type == "task":
            reward = reward_service.calculate_task_reward(
                user_id=request.user_id,
                task_priority=request.task_priority,
                streak_days=request.streak_days,
                power_hour_active=request.power_hour_active,
                energy_level=request.energy_level,
            )
        elif request.action_type == "microstep":
            reward = reward_service.calculate_microstep_reward(
                user_id=request.user_id, streak_days=request.streak_days
            )
        elif request.action_type == "streak":
            reward = reward_service.calculate_streak_completion_reward(
                streak_days=request.streak_days
            )
        else:
            raise HTTPException(
                status_code=400, detail=f"Invalid action_type: {request.action_type}"
            )

        # Get user's current XP and level from database
        db = get_enhanced_database()
        user_stats = await _get_user_stats(db, request.user_id)

        # Update user XP
        new_total_xp = user_stats["total_xp"] + reward.total_xp
        new_level = _calculate_level(new_total_xp)
        level_up = new_level > user_stats["level"]

        # Save to database
        await _update_user_stats(
            db,
            request.user_id,
            new_total_xp,
            new_level,
            request.streak_days,
            request.task_id,
        )

        # Log reward for analytics
        logger.info(
            f"Reward claimed: user={request.user_id}, xp={reward.total_xp}, "
            f"tier={reward.tier.value}, mystery={reward.mystery_unlocked}"
        )

        return RewardClaimResponse(
            success=True,
            base_xp=reward.base_xp,
            multiplier=reward.multiplier,
            total_xp=reward.total_xp,
            tier=reward.tier.value,
            bonus_reason=reward.bonus_reason,
            celebration_type=reward.celebration_type,
            sound_effect=reward.sound_effect,
            streak_bonus=reward.streak_bonus,
            mystery_unlocked=reward.mystery_unlocked,
            mystery_content=reward.mystery_content,
            new_total_xp=new_total_xp,
            new_level=new_level,
            level_up=level_up,
        )

    except Exception as e:
        logger.error(f"Error claiming reward: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mystery-box")
async def open_mystery_box(request: MysteryBoxRequest):
    """
    Open a mystery box for random rewards.

    Unlocked randomly after task completion (15% chance) or via special events.
    Uses variable rewards to keep users engaged.
    """
    try:
        mystery_reward = reward_service.open_mystery_box(
            user_id=request.user_id, user_level=request.user_level
        )

        # Apply XP bonus if present
        if mystery_reward.get("xp_bonus", 0) > 0:
            db = get_enhanced_database()
            user_stats = await _get_user_stats(db, request.user_id)
            new_total_xp = user_stats["total_xp"] + mystery_reward["xp_bonus"]
            new_level = _calculate_level(new_total_xp)

            await _update_user_stats(
                db, request.user_id, new_total_xp, new_level, user_stats["streak_days"]
            )

        logger.info(
            f"Mystery box opened: user={request.user_id}, "
            f"type={mystery_reward['reward_type']}"
        )

        return {"success": True, **mystery_reward}

    except Exception as e:
        logger.error(f"Error opening mystery box: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/current-multiplier")
async def get_current_multiplier(request: SessionMultiplierRequest):
    """
    Get current session multiplier for display in UI.

    Shows user their "hot streak" status and encourages continued engagement.
    """
    try:
        # Determine time of day
        hour = datetime.now().hour
        if hour < 7:
            time_of_day = "early_morning"
        elif hour >= 22:
            time_of_day = "late_night"
        elif 9 <= hour <= 17:
            time_of_day = "work_hours"
        else:
            time_of_day = "normal"

        multiplier_info = reward_service.get_current_session_multiplier(
            tasks_completed_today=request.tasks_completed_today, time_of_day=time_of_day
        )

        return {"success": True, **multiplier_info}

    except Exception as e:
        logger.error(f"Error getting multiplier: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/stats")
async def get_user_reward_stats(user_id: str):
    """
    Get user's reward statistics.

    Returns total XP, level, streak, and achievement progress.
    """
    try:
        db = get_enhanced_database()
        user_stats = await _get_user_stats(db, user_id)

        # Calculate progress to next level
        current_level_xp = _xp_for_level(user_stats["level"])
        next_level_xp = _xp_for_level(user_stats["level"] + 1)
        xp_in_current_level = user_stats["total_xp"] - current_level_xp
        xp_needed_for_next = next_level_xp - user_stats["total_xp"]

        return {
            "success": True,
            "user_id": user_id,
            "total_xp": user_stats["total_xp"],
            "level": user_stats["level"],
            "streak_days": user_stats["streak_days"],
            "tasks_completed_today": user_stats["tasks_today"],
            "xp_progress": {
                "current_level_xp": xp_in_current_level,
                "xp_needed": xp_needed_for_next,
                "progress_percentage": round(
                    (xp_in_current_level / (next_level_xp - current_level_xp)) * 100, 1
                ),
            },
        }

    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions


async def _get_user_stats(db, user_id: str) -> dict:
    """Get user statistics from database"""
    # For now, return mock data
    # TODO: Implement real database lookup
    return {
        "total_xp": 250,
        "level": 5,
        "streak_days": 3,
        "tasks_today": 2,
        "last_activity": datetime.now().isoformat(),
    }


async def _update_user_stats(
    db,
    user_id: str,
    total_xp: int,
    level: int,
    streak_days: int,
    task_id: str | None = None,
):
    """Update user statistics in database"""
    # TODO: Implement real database update
    logger.info(
        f"Updating user stats: {user_id}, xp={total_xp}, "
        f"level={level}, streak={streak_days}"
    )


def _calculate_level(total_xp: int) -> int:
    """Calculate level from total XP (non-linear growth)"""
    # Level formula: XP needed = 100 * level^1.5
    # This makes leveling progressively harder
    level = 1
    while _xp_for_level(level + 1) <= total_xp:
        level += 1
    return level


def _xp_for_level(level: int) -> int:
    """Calculate total XP needed for a given level"""
    if level == 1:
        return 0
    return int(100 * (level**1.5))
