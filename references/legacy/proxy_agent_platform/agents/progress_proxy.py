"""
Progress Proxy Agent - Tracks and optimizes progress.

This agent helps users track progress, set goals, and optimize their
productivity through AI-powered progress analysis and recommendations.
"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic_ai import RunContext

from .base import BaseProxyAgent


class ProgressMetric(str, Enum):
    """Types of progress metrics."""

    TASK_COMPLETION = "task_completion"
    TIME_SPENT = "time_spent"
    FOCUS_SESSIONS = "focus_sessions"
    ENERGY_LEVELS = "energy_levels"
    GOAL_ACHIEVEMENT = "goal_achievement"


class GoalStatus(str, Enum):
    """Goal status values."""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class ProgressProxy(BaseProxyAgent):
    """Progress tracking and optimization agent."""

    def __init__(self):
        super().__init__(
            name="ProgressProxy",
            description="Tracks progress and optimizes productivity",
            capabilities=[
                "progress_tracking",
                "goal_management",
                "productivity_analysis",
                "achievement_recognition",
                "optimization_recommendations",
            ],
        )

    async def track_progress(
        self,
        metric_type: ProgressMetric,
        value: float,
        unit: str,
        context: RunContext | None = None,
    ) -> dict[str, Any]:
        """Track a progress metric."""
        progress_entry = {
            "timestamp": datetime.now(),
            "metric_type": metric_type,
            "value": value,
            "unit": unit,
            "context": context.state.get("current_activity", "general") if context else "general",
        }

        # Store in context (would typically go to database)
        if context:
            if "progress_history" not in context.state:
                context.state["progress_history"] = []
            context.state["progress_history"].append(progress_entry)

        return {
            "success": True,
            "progress_entry": progress_entry,
            "message": f"Tracked {metric_type}: {value} {unit}",
        }

    async def set_goal(
        self,
        goal_name: str,
        target_value: float,
        metric_type: ProgressMetric,
        deadline: datetime | None = None,
        context: RunContext | None = None,
    ) -> dict[str, Any]:
        """Set a new goal."""
        goal_id = f"goal_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        goal = {
            "goal_id": goal_id,
            "goal_name": goal_name,
            "target_value": target_value,
            "metric_type": metric_type,
            "current_value": 0.0,
            "deadline": deadline,
            "status": GoalStatus.NOT_STARTED,
            "created_at": datetime.now(),
            "progress_percentage": 0.0,
        }

        # Store in context
        if context:
            if "goals" not in context.state:
                context.state["goals"] = []
            context.state["goals"].append(goal)

        return {
            "success": True,
            "goal": goal,
            "message": f"Goal '{goal_name}' created with target {target_value} {metric_type}",
        }

    async def update_goal_progress(
        self, goal_id: str, new_value: float, context: RunContext | None = None
    ) -> dict[str, Any]:
        """Update progress towards a goal."""
        if not context or "goals" not in context.state:
            return {"success": False, "message": "No goals found"}

        goals = context.state["goals"]
        goal = next((g for g in goals if g["goal_id"] == goal_id), None)

        if not goal:
            return {"success": False, "message": f"Goal {goal_id} not found"}

        # Update goal progress
        goal["current_value"] = new_value
        goal["progress_percentage"] = min(100.0, (new_value / goal["target_value"]) * 100)

        # Update status based on progress
        if goal["progress_percentage"] >= 100:
            goal["status"] = GoalStatus.COMPLETED
            goal["completed_at"] = datetime.now()
        elif goal["progress_percentage"] > 0:
            goal["status"] = GoalStatus.IN_PROGRESS

        return {
            "success": True,
            "goal": goal,
            "message": f"Goal '{goal['goal_name']}' progress updated to {goal['progress_percentage']:.1f}%",
        }

    async def get_progress_analytics(
        self, days: int = 7, context: RunContext | None = None
    ) -> dict[str, Any]:
        """Get comprehensive progress analytics."""
        if not context:
            return {"success": False, "message": "No context available for analytics"}

        # Get progress history
        progress_history = context.state.get("progress_history", [])
        recent_history = [
            entry
            for entry in progress_history
            if (datetime.now() - entry["timestamp"]).days <= days
        ]

        # Get goals
        goals = context.state.get("goals", [])
        active_goals = [
            g for g in goals if g["status"] in [GoalStatus.NOT_STARTED, GoalStatus.IN_PROGRESS]
        ]
        completed_goals = [g for g in goals if g["status"] == GoalStatus.COMPLETED]

        # Calculate analytics
        analytics = {
            "period_days": days,
            "total_entries": len(recent_history),
            "active_goals": len(active_goals),
            "completed_goals": len(completed_goals),
            "completion_rate": len(completed_goals) / max(1, len(goals)) * 100,
            "metric_breakdown": self._analyze_metrics(recent_history),
            "goal_progress": self._analyze_goal_progress(active_goals),
            "trends": self._calculate_trends(recent_history),
            "recommendations": self._generate_recommendations(active_goals, recent_history),
        }

        return {"success": True, "analytics": analytics}

    async def celebrate_achievement(
        self,
        achievement_type: str,
        description: str,
        xp_earned: int = 10,
        context: RunContext | None = None,
    ) -> dict[str, Any]:
        """Celebrate an achievement and award XP."""
        achievement = {
            "achievement_id": f"ach_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": achievement_type,
            "description": description,
            "xp_earned": xp_earned,
            "timestamp": datetime.now(),
        }

        # Store achievement
        if context:
            if "achievements" not in context.state:
                context.state["achievements"] = []
            context.state["achievements"].append(achievement)

            # Update total XP
            total_xp = context.state.get("total_xp", 0)
            context.state["total_xp"] = total_xp + xp_earned

        return {
            "success": True,
            "achievement": achievement,
            "message": f"🎉 Achievement unlocked: {description}! (+{xp_earned} XP)",
        }

    async def get_productivity_insights(self, context: RunContext | None = None) -> dict[str, Any]:
        """Get AI-powered productivity insights."""
        if not context:
            return {"success": False, "message": "No context available for insights"}

        progress_history = context.state.get("progress_history", [])
        goals = context.state.get("goals", [])

        insights = {
            "peak_productivity_hours": self._find_peak_hours(progress_history),
            "most_productive_activities": self._find_productive_activities(progress_history),
            "goal_completion_patterns": self._analyze_goal_patterns(goals),
            "improvement_areas": self._identify_improvement_areas(progress_history, goals),
            "optimization_suggestions": self._generate_optimization_suggestions(
                progress_history, goals
            ),
        }

        return {"success": True, "insights": insights}

    def _analyze_metrics(self, history: list[dict[str, Any]]) -> dict[str, Any]:
        """Analyze progress metrics."""
        if not history:
            return {}

        metric_totals = {}
        for entry in history:
            metric = entry["metric_type"]
            if metric not in metric_totals:
                metric_totals[metric] = {"total": 0, "count": 0}
            metric_totals[metric]["total"] += entry["value"]
            metric_totals[metric]["count"] += 1

        # Calculate averages
        for metric in metric_totals:
            metric_totals[metric]["average"] = (
                metric_totals[metric]["total"] / metric_totals[metric]["count"]
            )

        return metric_totals

    def _analyze_goal_progress(self, goals: list[dict[str, Any]]) -> dict[str, Any]:
        """Analyze goal progress."""
        if not goals:
            return {"total_goals": 0, "average_progress": 0}

        total_progress = sum(goal["progress_percentage"] for goal in goals)
        average_progress = total_progress / len(goals)

        return {
            "total_goals": len(goals),
            "average_progress": round(average_progress, 1),
            "goals_on_track": len([g for g in goals if g["progress_percentage"] >= 50]),
            "goals_behind": len([g for g in goals if g["progress_percentage"] < 25]),
        }

    def _calculate_trends(self, history: list[dict[str, Any]]) -> dict[str, str]:
        """Calculate progress trends."""
        if len(history) < 2:
            return {"overall": "insufficient_data"}

        # Simple trend calculation
        recent_entries = history[-5:] if len(history) >= 5 else history
        older_entries = history[:-5] if len(history) > 5 else recent_entries

        recent_avg = sum(entry["value"] for entry in recent_entries) / len(recent_entries)
        older_avg = sum(entry["value"] for entry in older_entries) / len(older_entries)

        if recent_avg > older_avg * 1.1:
            return {"overall": "improving"}
        elif recent_avg < older_avg * 0.9:
            return {"overall": "declining"}
        else:
            return {"overall": "stable"}

    def _generate_recommendations(
        self, goals: list[dict[str, Any]], history: list[dict[str, Any]]
    ) -> list[str]:
        """Generate progress optimization recommendations."""
        recommendations = []

        # Goal-based recommendations
        behind_goals = [g for g in goals if g["progress_percentage"] < 25]
        if behind_goals:
            recommendations.append("Focus on goals that are behind schedule")

        # Activity-based recommendations
        if len(history) < 5:
            recommendations.append("Track more activities to get better insights")

        # General recommendations
        recommendations.extend(
            [
                "Set smaller, achievable milestones",
                "Review progress weekly",
                "Celebrate small wins",
                "Adjust goals if they're unrealistic",
            ]
        )

        return recommendations[:5]

    def _find_peak_hours(self, history: list[dict[str, Any]]) -> list[int]:
        """Find peak productivity hours."""
        hour_counts = {}
        for entry in history:
            hour = entry["timestamp"].hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1

        # Return top 3 hours
        sorted_hours = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)
        return [hour for hour, _ in sorted_hours[:3]]

    def _find_productive_activities(self, history: list[dict[str, Any]]) -> list[str]:
        """Find most productive activities."""
        activity_counts = {}
        for entry in history:
            activity = entry.get("context", "general")
            activity_counts[activity] = activity_counts.get(activity, 0) + 1

        sorted_activities = sorted(activity_counts.items(), key=lambda x: x[1], reverse=True)
        return [activity for activity, _ in sorted_activities[:3]]

    def _analyze_goal_patterns(self, goals: list[dict[str, Any]]) -> dict[str, Any]:
        """Analyze goal completion patterns."""
        if not goals:
            return {}

        completed_goals = [g for g in goals if g["status"] == GoalStatus.COMPLETED]
        if not completed_goals:
            return {"completion_rate": 0, "average_completion_time": 0}

        # Calculate average completion time
        completion_times = []
        for goal in completed_goals:
            if "completed_at" in goal:
                duration = (goal["completed_at"] - goal["created_at"]).days
                completion_times.append(duration)

        avg_completion_time = (
            sum(completion_times) / len(completion_times) if completion_times else 0
        )

        return {
            "completion_rate": len(completed_goals) / len(goals) * 100,
            "average_completion_time_days": round(avg_completion_time, 1),
        }

    def _identify_improvement_areas(
        self, history: list[dict[str, Any]], goals: list[dict[str, Any]]
    ) -> list[str]:
        """Identify areas for improvement."""
        areas = []

        if len(history) < 10:
            areas.append("Track more activities for better insights")

        behind_goals = [g for g in goals if g["progress_percentage"] < 25]
        if behind_goals:
            areas.append("Goal achievement - several goals are behind schedule")

        return areas

    def _generate_optimization_suggestions(
        self, history: list[dict[str, Any]], goals: list[dict[str, Any]]
    ) -> list[str]:
        """Generate optimization suggestions."""
        suggestions = [
            "Break large goals into smaller milestones",
            "Set specific deadlines for each goal",
            "Track progress daily for better momentum",
            "Review and adjust goals weekly",
        ]

        return suggestions
