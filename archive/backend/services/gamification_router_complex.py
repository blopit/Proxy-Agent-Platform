"""
Gamification API Endpoints - Gamification Proxy Agent Integration

Provides RESTful API for:
- Achievement detection and unlocking
- Leaderboard generation and rankings
- Motivation algorithm recommendations
- Reward distribution and tracking
- Engagement analytics and insights
"""

import logging
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.agents.gamification_proxy_advanced import AdvancedGamificationAgent
from src.api.auth import verify_token
from src.core.models import AgentRequest
from src.database.enhanced_adapter import get_enhanced_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/gamification", tags=["gamification"])

# Pydantic models for request/response


class AchievementCheckRequest(BaseModel):
    """Request to check for achievement unlocks"""

    user_activity: dict[str, Any] = Field(
        ..., description="User activity data for achievement detection"
    )


class AchievementResponse(BaseModel):
    """Achievement unlock response"""

    achievements_unlocked: list[dict[str, Any]]
    total_xp_earned: int
    new_badges: list[str]
    message: str
    next_achievements: list[dict[str, Any]]


class LeaderboardRequest(BaseModel):
    """Request for leaderboard data"""

    category: str = Field("overall", description="Leaderboard category: overall, weekly, monthly")
    limit: int = Field(10, description="Number of top users to return", ge=1, le=100)


class LeaderboardResponse(BaseModel):
    """Leaderboard rankings"""

    category: str
    entries: list[dict[str, Any]]
    user_rank: int | None
    user_score: int | None
    total_participants: int
    message: str


class MotivationRequest(BaseModel):
    """Request for motivation recommendations"""

    user_context: dict[str, Any] = Field(..., description="User context and current state")


class MotivationResponse(BaseModel):
    """Motivation algorithm recommendations"""

    motivation_strategy: str
    recommendations: list[str]
    encouragement_message: str
    suggested_goals: list[dict[str, Any]]
    engagement_score: float
    message: str


class RewardDistributionResponse(BaseModel):
    """Reward distribution tracking"""

    rewards_earned: list[dict[str, Any]]
    total_rewards_value: int
    pending_rewards: list[dict[str, Any]]
    redemption_options: list[dict[str, Any]]
    message: str


class EngagementAnalyticsResponse(BaseModel):
    """Engagement analytics and insights"""

    engagement_score: float
    active_days_streak: int
    participation_rate: float
    achievement_completion_rate: float
    engagement_trends: dict[str, Any]
    insights: list[str]
    message: str


# Initialize gamification agent (singleton pattern)
_gamification_agent: AdvancedGamificationAgent | None = None


def get_gamification_agent() -> AdvancedGamificationAgent:
    """Get or create Gamification Agent instance"""
    global _gamification_agent
    if _gamification_agent is None:
        db = get_enhanced_database()
        _gamification_agent = AdvancedGamificationAgent(db)
    return _gamification_agent


@router.post("/achievements/check", response_model=AchievementResponse)
async def check_achievements(
    request_data: AchievementCheckRequest, current_username: str = Depends(verify_token)
):
    """
    Check for achievement unlocks based on user activity.

    Detects achievement triggers based on:
    - Task completion counts
    - Focus session completions
    - Streak milestones
    - Quality ratings
    - Productivity metrics

    Returns newly unlocked achievements and next available goals.
    """
    try:
        user_id = current_username
        agent = get_gamification_agent()

        # Check for achievement triggers
        achievement_result = await agent.check_achievement_triggers(request_data.user_activity)

        unlocked = achievement_result.get("achievements_unlocked", [])
        total_xp = sum(a.get("xp_reward", 0) for a in unlocked)

        return AchievementResponse(
            achievements_unlocked=unlocked,
            total_xp_earned=total_xp,
            new_badges=[a.get("badge_tier", "") for a in unlocked],
            message=f"🏆 {len(unlocked)} achievement(s) unlocked! +{total_xp} XP earned",
            next_achievements=achievement_result.get("next_achievements", []),
        )

    except Exception as e:
        logger.error(f"Failed to check achievements: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check achievements: {str(e)}",
        )


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    category: str = "overall",
    limit: int = 10,
    current_username: str = Depends(verify_token),
):
    """
    Get leaderboard rankings.

    Leaderboard categories:
    - overall: All-time total XP
    - weekly: XP earned this week
    - monthly: XP earned this month
    - focus: Focus session performance
    - productivity: Task completion metrics

    Returns top users, current user rank, and statistics.
    """
    try:
        user_id = current_username
        agent = get_gamification_agent()

        # Generate leaderboard
        user_context = {"user_id": user_id, "limit": limit}
        leaderboard_data = await agent.generate_leaderboard(category, user_context)

        return LeaderboardResponse(
            category=leaderboard_data.get("leaderboard_type", category),
            entries=leaderboard_data.get("top_10", [])[:limit],
            user_rank=leaderboard_data.get("user_rank"),
            user_score=leaderboard_data.get("user_entry", {}).get("score"),
            total_participants=leaderboard_data.get("total_participants", 0),
            message=f"📊 {category.title()} Leaderboard (Top {limit})",
        )

    except Exception as e:
        logger.error(f"Failed to generate leaderboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate leaderboard: {str(e)}",
        )


@router.post("/motivation", response_model=MotivationResponse)
async def get_motivation_recommendations(
    request_data: MotivationRequest, current_username: str = Depends(verify_token)
):
    """
    Get personalized motivation recommendations.

    Motivation algorithm analyzes:
    - Current engagement levels
    - Recent activity patterns
    - Achievement progress
    - Streak status
    - Performance trends

    Returns tailored strategies, goals, and encouragement.
    """
    try:
        user_id = current_username
        agent = get_gamification_agent()

        # Get motivation strategy
        motivation_data = await agent.generate_motivation_strategy(request_data.user_context)

        # Map agent response to API response
        strategy_type = motivation_data.get("primary_strategy", "balanced_approach")

        return MotivationResponse(
            motivation_strategy=strategy_type,
            recommendations=motivation_data.get("recommendations", []),
            encouragement_message=f"{motivation_data.get('motivation_type', 'Keep going!')} - Expected {motivation_data.get('expected_improvement', 0.15)*100}% improvement in {motivation_data.get('timeline', '2-4 weeks')}",
            suggested_goals=motivation_data.get("success_metrics", []),
            engagement_score=motivation_data.get("expected_improvement", 0.5) * 10,  # Scale to 0-10
            message=f"💪 {strategy_type.replace('_', ' ').title()} motivation strategy activated",
        )

    except Exception as e:
        logger.error(f"Failed to get motivation recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get motivation: {str(e)}",
        )


@router.get("/rewards", response_model=RewardDistributionResponse)
async def get_rewards(current_username: str = Depends(verify_token)):
    """
    Get user rewards and redemption options.

    Tracks:
    - Earned rewards from achievements
    - Pending reward claims
    - Available redemption options
    - Total rewards value

    Rewards may include bonus XP, special badges, or unlockable features.
    """
    try:
        user_id = current_username
        agent = get_gamification_agent()

        # Get reward distribution
        achievement_data = {"user_id": user_id, "achievement_type": "general"}
        reward_data = await agent.distribute_achievement_reward(achievement_data)

        return RewardDistributionResponse(
            rewards_earned=reward_data.get("additional_rewards", []),
            total_rewards_value=reward_data.get("xp_reward", 0),
            pending_rewards=[],  # Mock for now
            redemption_options=[],  # Mock for now
            message=f"🎁 Reward earned: {reward_data.get('xp_reward', 0)} XP ({reward_data.get('celebration_type', 'standard')} celebration)",
        )

    except Exception as e:
        logger.error(f"Failed to get rewards: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get rewards: {str(e)}",
        )


@router.get("/analytics", response_model=EngagementAnalyticsResponse)
async def get_engagement_analytics(current_username: str = Depends(verify_token)):
    """
    Get engagement analytics and insights.

    Analyzes:
    - Overall engagement score
    - Active days and streaks
    - Participation rate
    - Achievement completion rate
    - Engagement trends over time

    Provides actionable insights for improving engagement.
    """
    try:
        user_id = current_username
        agent = get_gamification_agent()

        # Get engagement analytics
        analytics_data = await agent.analyze_user_engagement(user_id, "30d")

        # Map agent response to API response
        engagement_score = analytics_data.get("engagement_score", 5.0)

        return EngagementAnalyticsResponse(
            engagement_score=engagement_score,
            active_days_streak=0,  # Would come from streak tracking
            participation_rate=min(1.0, engagement_score / 10.0),  # Scale engagement score to 0-1
            achievement_completion_rate=0.5,  # Mock for now
            engagement_trends={"trend": analytics_data.get("engagement_trend", "stable"), "peak_times": analytics_data.get("peak_activity_times", [])},
            insights=analytics_data.get("recommendations", []) + analytics_data.get("risk_factors", []),
            message=f"📈 Engagement Score: {engagement_score:.1f}/10",
        )

    except Exception as e:
        logger.error(f"Failed to get engagement analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics: {str(e)}",
        )


@router.get("/user-stats", response_model=EngagementAnalyticsResponse)
async def get_user_stats_mobile(user_id: str):
    """
    Get user gamification stats for mobile interface (no auth required).

    Mobile stub endpoint - returns mock data for immediate testing.
    TODO: Integrate with real user analytics in production.
    """
    try:
        # Return mock data for mobile testing
        return EngagementAnalyticsResponse(
            engagement_score=7.5,
            active_days_streak=12,
            participation_rate=0.85,
            achievement_completion_rate=0.65,
            engagement_trends={
                "trend": "improving",
                "peak_times": ["09:00-11:00", "14:00-16:00"]
            },
            insights=[
                "Great momentum! You're on a 12-day streak",
                "Morning sessions show highest productivity",
                "Consider scheduling complex tasks at peak times"
            ],
            message="📈 Engagement Score: 7.5/10",
        )

    except Exception as e:
        logger.error(f"Failed to get user stats for mobile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user stats: {str(e)}",
        )
