"""
Progress Tracking API Endpoints - Progress Proxy Agent Integration

Provides RESTful API for:
- Dynamic XP calculation for task completions
- Streak tracking and momentum analysis
- Level progression and threshold management
- Progress visualization data generation
- Performance trend analysis
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.agents.progress_proxy_advanced import AdvancedProgressAgent
from src.api.auth import verify_token
from src.database.enhanced_adapter import get_enhanced_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/progress", tags=["progress"])

# Pydantic models for request/response


class TaskCompletionRequest(BaseModel):
    """Request to calculate XP for task completion"""

    task_id: str
    complexity: str = Field(..., description="Task complexity: low, medium, high, expert")
    priority: str = Field(..., description="Task priority: low, medium, high, critical")
    quality_rating: str | None = Field(None, description="Quality: poor, average, good, excellent")
    time_spent: int | None = Field(None, description="Time spent in minutes")
    estimated_time: int | None = Field(None, description="Estimated time in minutes")


class XPCalculationResponse(BaseModel):
    """XP calculation breakdown"""

    base_xp: int
    complexity_bonus: int
    efficiency_bonus: int
    quality_bonus: int
    streak_bonus: int = 0
    total_xp: int
    multipliers_applied: list[str]
    xp_breakdown: dict[str, Any]
    message: str


class StreakDataResponse(BaseModel):
    """User streak tracking data"""

    current_streak: int
    longest_streak: int
    streak_type: str
    next_milestone: int
    momentum_score: float
    streak_bonus_multiplier: float
    message: str


class LevelProgressionResponse(BaseModel):
    """User level and progression"""

    current_level: int
    current_xp: int
    xp_for_next_level: int
    xp_needed: int
    progress_percentage: float
    level_benefits: list[str]
    prestige_tier: str
    message: str


class ProgressVisualizationResponse(BaseModel):
    """Progress visualization data"""

    daily_xp_trend: list[Any]
    task_completion_rate: list[Any]
    productivity_score_trend: list[Any]
    milestone_achievements: list[Any]
    areas_for_improvement: list[Any]
    performance_insights: dict[str, Any]
    comparative_analysis: dict[str, Any]
    message: str


class TrendAnalysisResponse(BaseModel):
    """Performance trend analysis"""

    trend_direction: str
    momentum_score: float
    productivity_rating: float
    recommendations: list[str]
    insights: list[str]
    message: str


# Initialize progress agent (singleton pattern)
_progress_agent: AdvancedProgressAgent | None = None


def get_progress_agent() -> AdvancedProgressAgent:
    """Get or create Progress Agent instance"""
    global _progress_agent
    if _progress_agent is None:
        db = get_enhanced_database()
        _progress_agent = AdvancedProgressAgent(db)
    return _progress_agent


@router.post("/xp/calculate", response_model=XPCalculationResponse)
async def calculate_task_xp(
    task_data: TaskCompletionRequest, current_username: str = Depends(verify_token)
):
    """
    Calculate dynamic XP for task completion.

    XP calculation considers:
    - Task complexity (low, medium, high, expert)
    - Task priority (low, medium, high, critical)
    - Quality rating (poor, average, good, excellent)
    - Efficiency (time spent vs estimated)
    - Current streak bonus

    Returns detailed XP breakdown with all multipliers applied.
    """
    try:
        agent = get_progress_agent()

        # Build task data dict
        task_dict = {
            "task_id": task_data.task_id,
            "complexity": task_data.complexity,
            "priority": task_data.priority,
            "quality_rating": task_data.quality_rating or "average",
            "time_spent": task_data.time_spent,
            "estimated_time": task_data.estimated_time or task_data.time_spent,
        }

        # Calculate XP
        xp_result = await agent.calculate_task_xp(task_dict)

        return XPCalculationResponse(
            base_xp=xp_result["base_xp"],
            complexity_bonus=xp_result["complexity_bonus"],
            efficiency_bonus=xp_result["efficiency_bonus"],
            quality_bonus=xp_result["quality_bonus"],
            streak_bonus=xp_result.get("streak_bonus", 0),
            total_xp=xp_result["total_xp"],
            multipliers_applied=xp_result["multipliers_applied"],
            xp_breakdown=xp_result["xp_breakdown"],
            message=f"🎯 Earned {xp_result['total_xp']} XP! (+{xp_result['xp_breakdown']['bonus_percentage']}% bonus)",
        )

    except Exception as e:
        logger.error(f"Failed to calculate XP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate XP: {str(e)}",
        )


@router.get("/streak", response_model=StreakDataResponse)
async def get_user_streak(current_username: str = Depends(verify_token)):
    """
    Get user's current streak data and momentum.

    Tracks:
    - Current consecutive day streak
    - Longest streak achieved
    - Streak type and momentum
    - Next milestone
    - Streak bonus multiplier

    Streaks are calculated based on daily task completions.
    """
    try:
        user_id = current_username
        agent = get_progress_agent()

        # Get streak data
        streak_data = await agent.track_user_streaks(user_id, {})

        return StreakDataResponse(
            current_streak=streak_data["current_streak"],
            longest_streak=streak_data["longest_streak"],
            streak_type=streak_data["streak_type"],
            next_milestone=streak_data["next_milestone"],
            momentum_score=1.0
            if streak_data.get("streak_momentum") == "high"
            else 0.5,  # Convert momentum to score
            streak_bonus_multiplier=streak_data.get("bonus_multiplier", 1.0),
            message=f"🔥 {streak_data['current_streak']} day streak! (Next milestone: {streak_data['next_milestone']} days)",
        )

    except Exception as e:
        logger.error(f"Failed to get streak data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get streak: {str(e)}",
        )


@router.get("/level", response_model=LevelProgressionResponse)
async def get_level_progression(current_username: str = Depends(verify_token)):
    """
    Get user's level progression and status.

    Returns:
    - Current level and XP
    - XP needed for next level
    - Progress percentage
    - Level benefits and prestige tier
    - Leveling recommendations

    Levels use exponential XP thresholds (100, 250, 450, 700, 1000...).
    """
    try:
        user_id = current_username
        agent = get_progress_agent()

        # Get level progression - need to get current XP first
        # For now, use 0 as current XP (should be fetched from user metrics in production)
        level_data = await agent.calculate_user_level(user_id, 0)

        return LevelProgressionResponse(
            current_level=level_data["current_level"],
            current_xp=level_data["current_xp"],
            xp_for_next_level=level_data["xp_for_next_level"],
            xp_needed=level_data["xp_needed"],
            progress_percentage=level_data["progress_percentage"],
            level_benefits=level_data["level_benefits"],
            prestige_tier=level_data["prestige_tier"],
            message=f"⭐ Level {level_data['current_level']} ({level_data['progress_percentage']:.1f}% to next)",
        )

    except Exception as e:
        logger.error(f"Failed to get level progression: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get level: {str(e)}",
        )


@router.get("/visualization", response_model=ProgressVisualizationResponse)
async def get_progress_visualization(days: int = 30, current_username: str = Depends(verify_token)):
    """
    Get progress visualization data.

    Provides data for charts and graphs:
    - Daily XP history (last N days)
    - Weekly summary statistics
    - Productivity trends
    - Performance metrics

    Default: Last 30 days of data.
    """
    try:
        user_id = current_username
        agent = get_progress_agent()

        # Get visualization data
        time_period = f"{days}d"  # Format: "30d" for 30 days
        viz_data = await agent.generate_progress_visualization(user_id, time_period)

        return ProgressVisualizationResponse(
            daily_xp_trend=viz_data.get("daily_xp_trend", []),
            task_completion_rate=viz_data.get("task_completion_rate", []),
            productivity_score_trend=viz_data.get("productivity_score_trend", []),
            milestone_achievements=viz_data.get("milestone_achievements", []),
            areas_for_improvement=viz_data.get("areas_for_improvement", []),
            performance_insights=viz_data.get("performance_insights", {}),
            comparative_analysis=viz_data.get("comparative_analysis", {}),
            message=f"📊 Progress data for last {days} days ready for visualization",
        )

    except Exception as e:
        logger.error(f"Failed to get visualization data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get visualization: {str(e)}",
        )


@router.get("/trends", response_model=TrendAnalysisResponse)
async def analyze_performance_trends(
    period_days: int = 14, current_username: str = Depends(verify_token)
):
    """
    Analyze performance trends and provide insights.

    Analyzes:
    - Trend direction (improving, declining, stable)
    - Momentum score
    - Productivity rating
    - Actionable recommendations
    - Performance insights

    Default: Last 14 days analysis.
    """
    try:
        user_id = current_username
        agent = get_progress_agent()

        # Get visualization data which includes trends
        time_period = f"{period_days}d"
        viz_data = await agent.generate_progress_visualization(user_id, time_period)

        # Extract trend information
        productivity_trend = viz_data.get("productivity_score_trend", [])
        viz_data.get("daily_xp_trend", [])
        insights = viz_data.get("performance_insights", {})

        # Determine trend direction
        if len(productivity_trend) >= 2:
            recent_avg = (
                sum(productivity_trend[-3:]) / len(productivity_trend[-3:])
                if len(productivity_trend) >= 3
                else productivity_trend[-1]
            )
            earlier_avg = (
                sum(productivity_trend[:3]) / len(productivity_trend[:3])
                if len(productivity_trend) >= 3
                else productivity_trend[0]
            )
            if recent_avg > earlier_avg * 1.1:
                trend_direction = "improving"
            elif recent_avg < earlier_avg * 0.9:
                trend_direction = "declining"
            else:
                trend_direction = "stable"
        else:
            trend_direction = "insufficient_data"

        # Calculate momentum score (0-10)
        momentum_score = (
            sum(productivity_trend[-5:]) / len(productivity_trend[-5:])
            if productivity_trend
            else 5.0
        )

        # Get recommendations from areas for improvement
        recommendations = viz_data.get("areas_for_improvement", [])

        return TrendAnalysisResponse(
            trend_direction=trend_direction,
            momentum_score=momentum_score,
            productivity_rating=momentum_score,
            recommendations=recommendations if isinstance(recommendations, list) else [],
            insights=insights.get("summary", []) if isinstance(insights, dict) else [],
            message=f"📈 Trend: {trend_direction.title()} (Momentum: {momentum_score:.2f})",
        )

    except Exception as e:
        logger.error(f"Failed to analyze trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze trends: {str(e)}",
        )


@router.get("/level-progression", response_model=LevelProgressionResponse)
async def get_level_progression_mobile(user_id: str):
    """
    Get user's level progression for mobile interface (no auth required).

    Mobile stub endpoint - returns mock data for immediate testing.
    TODO: Integrate with real user progress tracking in production.
    """
    try:
        # Return mock data for mobile testing
        return LevelProgressionResponse(
            current_level=5,
            current_xp=420,
            xp_for_next_level=700,
            xp_needed=280,
            progress_percentage=60.0,
            level_benefits=["Task automation unlocked", "Priority tags enabled"],
            prestige_tier="Bronze",
            message="⭐ Level 5 (60.0% to next)",
        )

    except Exception as e:
        logger.error(f"Failed to get level progression for mobile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get level: {str(e)}",
        )
