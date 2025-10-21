"""
API endpoints for gamification system.

Provides FastAPI endpoints for XP tracking, achievements, leaderboards,
and progress visualization for the frontend dashboard.
"""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..gamification import (
    GamificationService,
    LeaderboardManager,
    LeaderboardScope,
    LeaderboardType,
    ProgressVisualizer,
    TimeRange,
    XPEventType,
)


# Request/Response models
class XPEventRequest(BaseModel):
    """Request model for XP events."""

    user_id: int
    event_type: XPEventType
    event_data: dict[str, Any] = Field(default_factory=dict)
    source_agent: str | None = None


class XPEventResponse(BaseModel):
    """Response model for XP events."""

    success: bool
    xp_awarded: int
    total_xp: int
    level: int
    new_achievements: list[dict[str, Any]] = Field(default_factory=list)
    streak_info: dict[str, Any] | None = None
    message: str


class UserStatsResponse(BaseModel):
    """Response model for user statistics."""

    user_id: int
    total_xp: int
    current_level: int
    xp_to_next_level: int
    active_streaks: list[dict[str, Any]]
    recent_achievements: list[dict[str, Any]]
    recent_activity: list[dict[str, Any]]
    streak_statistics: dict[str, Any]


class LeaderboardResponse(BaseModel):
    """Response model for leaderboard data."""

    leaderboard_type: str
    scope: str
    entries: list[dict[str, Any]]
    user_rank: dict[str, Any] | None = None
    last_updated: str


class ProgressChartResponse(BaseModel):
    """Response model for progress charts."""

    chart_type: str
    title: str
    time_range: str
    unit: str
    color_scheme: list[str]
    max_value: float | None
    min_value: float | None
    target_value: float | None
    data: list[dict[str, Any]]
    created_at: str


# Initialize services
gamification_service = GamificationService()
leaderboard_manager = LeaderboardManager()
progress_visualizer = ProgressVisualizer()

# Create router
router = APIRouter(prefix="/api/v1/gamification", tags=["gamification"])


@router.post("/events", response_model=XPEventResponse)
async def track_xp_event(event_request: XPEventRequest):
    """
    Track an XP event and return gamification response.

    Args:
        event_request: XP event data

    Returns:
        XP response with awards, achievements, and streaks
    """
    try:
        # Route to appropriate handler based on event type
        if event_request.event_type == XPEventType.TASK_COMPLETED:
            result = await gamification_service.handle_task_completed(
                user_id=event_request.user_id, task_data=event_request.event_data
            )
        elif event_request.event_type == XPEventType.FOCUS_SESSION_COMPLETED:
            result = await gamification_service.handle_focus_session_completed(
                user_id=event_request.user_id, session_data=event_request.event_data
            )
        elif event_request.event_type == XPEventType.ENERGY_LOGGED:
            result = await gamification_service.handle_energy_logged(
                user_id=event_request.user_id, energy_data=event_request.event_data
            )
        elif event_request.event_type == XPEventType.PROGRESS_UPDATED:
            result = await gamification_service.handle_progress_updated(
                user_id=event_request.user_id, progress_data=event_request.event_data
            )
        else:
            raise HTTPException(
                status_code=400, detail=f"Unsupported event type: {event_request.event_type}"
            )

        # Update leaderboards
        leaderboard_manager.update_from_xp_event(
            user_id=event_request.user_id,
            xp_earned=result["xp_awarded"],
            total_xp=result.get("total_xp", result["xp_awarded"]),
            username=event_request.event_data.get("username", f"User{event_request.user_id}"),
        )

        return XPEventResponse(
            success=True,
            xp_awarded=result["xp_awarded"],
            total_xp=result.get("total_xp", result["xp_awarded"]),
            level=result.get("user_level", 1),
            new_achievements=result.get("new_achievements", []),
            streak_info=result.get("streak_info"),
            message=result.get("message", f"Earned {result['xp_awarded']} XP!"),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/stats", response_model=UserStatsResponse)
async def get_user_stats(user_id: int):
    """
    Get comprehensive gamification stats for a user.

    Args:
        user_id: User ID

    Returns:
        Complete user statistics and gamification status
    """
    try:
        dashboard = await gamification_service.get_user_dashboard(user_id)

        return UserStatsResponse(
            user_id=user_id,
            total_xp=dashboard["total_xp"],
            current_level=dashboard["user_level"],
            xp_to_next_level=dashboard["xp_to_next_level"],
            active_streaks=dashboard["active_streaks"],
            recent_achievements=dashboard["recent_achievements"],
            recent_activity=dashboard["recent_activity"],
            streak_statistics=dashboard["streak_statistics"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leaderboards/{leaderboard_type}", response_model=LeaderboardResponse)
async def get_leaderboard(
    leaderboard_type: LeaderboardType,
    scope: LeaderboardScope = LeaderboardScope.GLOBAL,
    limit: int | None = Query(default=25, le=100),
    user_id: int | None = Query(default=None),
):
    """
    Get leaderboard data for a specific type and scope.

    Args:
        leaderboard_type: Type of leaderboard
        scope: Scope of competition
        limit: Maximum entries to return
        user_id: Optional user ID to include their rank

    Returns:
        Leaderboard entries and optional user rank
    """
    try:
        # Get leaderboard entries
        entries = leaderboard_manager.leaderboard.get_leaderboard(
            leaderboard_type=leaderboard_type, scope=scope, limit=limit
        )

        # Format entries for response
        formatted_entries = []
        for entry in entries:
            formatted_entries.append(
                {
                    "user_id": entry.user_id,
                    "username": entry.username,
                    "score": entry.score,
                    "rank": entry.rank,
                    "change_from_previous": entry.change_from_previous,
                    "metadata": entry.metadata,
                    "last_updated": entry.last_updated.isoformat(),
                }
            )

        # Get user's rank if requested
        user_rank = None
        if user_id:
            user_entry = leaderboard_manager.leaderboard.get_user_rank(
                user_id=user_id, leaderboard_type=leaderboard_type, scope=scope
            )
            if user_entry:
                user_rank = {
                    "user_id": user_entry.user_id,
                    "username": user_entry.username,
                    "score": user_entry.score,
                    "rank": user_entry.rank,
                    "change_from_previous": user_entry.change_from_previous,
                }

        return LeaderboardResponse(
            leaderboard_type=leaderboard_type.value,
            scope=scope.value,
            entries=formatted_entries,
            user_rank=user_rank,
            last_updated=datetime.now().isoformat(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leaderboards", response_model=list[dict[str, Any]])
async def get_available_leaderboards():
    """
    Get list of all available leaderboards.

    Returns:
        List of available leaderboard configurations
    """
    try:
        return leaderboard_manager.leaderboard.get_available_leaderboards()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/leaderboard-summary")
async def get_user_leaderboard_summary(user_id: int):
    """
    Get comprehensive leaderboard summary for a user.

    Args:
        user_id: User ID

    Returns:
        User's rankings across all leaderboards
    """
    try:
        return leaderboard_manager.get_user_leaderboard_summary(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/progress/xp", response_model=ProgressChartResponse)
async def get_xp_progression_chart(user_id: int, time_range: TimeRange = TimeRange.WEEKLY):
    """
    Get XP progression chart for a user.

    Args:
        user_id: User ID
        time_range: Time range for chart

    Returns:
        XP progression chart data
    """
    try:
        # Mock XP events for demo (would fetch from database in real implementation)
        xp_events = [
            {
                "timestamp": datetime.now() - timedelta(days=6),
                "xp_awarded": 120,
                "event_type": "task_completed",
            },
            {
                "timestamp": datetime.now() - timedelta(days=5),
                "xp_awarded": 80,
                "event_type": "focus_session",
            },
            {
                "timestamp": datetime.now() - timedelta(days=4),
                "xp_awarded": 150,
                "event_type": "task_completed",
            },
            {
                "timestamp": datetime.now() - timedelta(days=3),
                "xp_awarded": 200,
                "event_type": "achievement",
            },
            {
                "timestamp": datetime.now() - timedelta(days=2),
                "xp_awarded": 90,
                "event_type": "task_completed",
            },
            {
                "timestamp": datetime.now() - timedelta(days=1),
                "xp_awarded": 110,
                "event_type": "focus_session",
            },
            {"timestamp": datetime.now(), "xp_awarded": 130, "event_type": "task_completed"},
        ]

        chart = progress_visualizer.create_xp_progression_chart(
            xp_events=xp_events, time_range=time_range
        )

        return ProgressChartResponse(**progress_visualizer.export_chart_data(chart))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/progress/activity", response_model=ProgressChartResponse)
async def get_activity_heatmap(user_id: int, days_back: int = Query(default=30, le=90)):
    """
    Get daily activity heatmap for a user.

    Args:
        user_id: User ID
        days_back: Number of days to include

    Returns:
        Activity heatmap chart data
    """
    try:
        # Mock activities for demo
        activities = []
        for i in range(days_back):
            # Random number of activities per day (0-8)
            import random

            activity_count = random.randint(0, 8)
            for j in range(activity_count):
                activities.append(
                    {
                        "timestamp": datetime.now()
                        - timedelta(days=i, hours=random.randint(0, 23)),
                        "activity_type": "task_completed",
                    }
                )

        chart = progress_visualizer.create_daily_activity_heatmap(
            activities=activities, days_back=days_back
        )

        return ProgressChartResponse(**progress_visualizer.export_chart_data(chart))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/progress/streaks", response_model=ProgressChartResponse)
async def get_streak_chart(user_id: int):
    """
    Get streak visualization for a user.

    Args:
        user_id: User ID

    Returns:
        Streak visualization chart data
    """
    try:
        # Mock streak data
        streak_data = [
            {
                "streak_type": "Daily Tasks",
                "current_count": 12,
                "best_count": 25,
                "status": "active",
            },
            {
                "streak_type": "Focus Sessions",
                "current_count": 8,
                "best_count": 15,
                "status": "active",
            },
            {
                "streak_type": "Energy Logging",
                "current_count": 5,
                "best_count": 30,
                "status": "active",
            },
        ]

        chart = progress_visualizer.create_streak_visualization(streak_data)

        return ProgressChartResponse(**progress_visualizer.export_chart_data(chart))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/progress/dashboard")
async def get_progress_dashboard(user_id: int):
    """
    Get comprehensive progress dashboard for a user.

    Args:
        user_id: User ID

    Returns:
        Complete dashboard with multiple chart types
    """
    try:
        # Mock comprehensive user data
        user_data = {
            "xp_events": [
                {"timestamp": datetime.now() - timedelta(days=i), "xp_awarded": 100 + i * 10}
                for i in range(7)
            ],
            "activities": [
                {"timestamp": datetime.now() - timedelta(days=i, hours=j)}
                for i in range(30)
                for j in range(random.randint(1, 6))
            ],
            "streaks": [
                {
                    "streak_type": "Daily Tasks",
                    "current_count": 12,
                    "best_count": 25,
                    "status": "active",
                },
                {
                    "streak_type": "Focus Sessions",
                    "current_count": 8,
                    "best_count": 15,
                    "status": "active",
                },
            ],
            "achievement_progress": [
                {
                    "title": "Task Master",
                    "progress": 75,
                    "target": 100,
                    "achievement_id": "task_master_100",
                },
                {
                    "title": "Focus Expert",
                    "progress": 60,
                    "target": 90,
                    "achievement_id": "focus_expert",
                },
            ],
            "daily_stats": {
                "tasks_completed": 5,
                "focus_time_minutes": 120,
                "xp_earned": 250,
                "avg_energy_level": 7,
            },
            "task_categories": {"Work": 15, "Personal": 8, "Learning": 5, "Health": 3},
            "current_xp": 3250,
            "current_level": 8,
        }

        dashboard = progress_visualizer.create_comprehensive_dashboard(user_data)

        # Convert all charts to response format
        response_dashboard = {}
        for chart_name, chart in dashboard.items():
            response_dashboard[chart_name] = progress_visualizer.export_chart_data(chart)

        return response_dashboard

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test/simulate-leaderboard")
async def simulate_leaderboard_data():
    """Simulate leaderboard data for testing purposes."""
    try:
        leaderboard_manager.leaderboard.simulate_leaderboard_data()
        return {"message": "Leaderboard data simulated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper function to add timedelta import at module level
import random
from datetime import timedelta
