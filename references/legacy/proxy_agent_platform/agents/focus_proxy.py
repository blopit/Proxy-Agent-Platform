"""
Focus Proxy Agent - Manages focus sessions and concentration.

This agent helps users maintain focus, manage distractions, and optimize
their concentration through AI-powered focus sessions and techniques.
"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic_ai import RunContext

from .base import BaseProxyAgent


class FocusSessionType(str, Enum):
    """Types of focus sessions."""

    DEEP_WORK = "deep_work"
    POMODORO = "pomodoro"
    FLOW_STATE = "flow_state"
    MEDITATION = "meditation"
    BREAK = "break"


class FocusProxy(BaseProxyAgent):
    """Focus session management agent."""

    def __init__(self):
        super().__init__(
            name="FocusProxy",
            description="Manages focus sessions and concentration optimization",
            capabilities=[
                "focus_session_management",
                "distraction_blocking",
                "concentration_optimization",
                "break_scheduling",
                "focus_analytics",
            ],
        )

    async def start_focus_session(
        self,
        session_type: FocusSessionType,
        duration_minutes: int = 25,
        context: RunContext | None = None,
    ) -> dict[str, Any]:
        """Start a new focus session."""
        session_id = f"focus_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        session_data = {
            "session_id": session_id,
            "type": session_type,
            "duration_minutes": duration_minutes,
            "start_time": datetime.now(),
            "status": "active",
            "distractions_blocked": [],
            "focus_score": 0,
        }

        # Store session in context
        if context:
            context.state["current_focus_session"] = session_data

        return {
            "success": True,
            "session_id": session_id,
            "message": f"Started {session_type} focus session for {duration_minutes} minutes",
            "session_data": session_data,
        }

    async def end_focus_session(
        self, session_id: str, context: RunContext | None = None
    ) -> dict[str, Any]:
        """End a focus session and calculate metrics."""
        if not context or "current_focus_session" not in context.state:
            return {"success": False, "message": "No active focus session found"}

        session = context.state["current_focus_session"]
        session["end_time"] = datetime.now()
        session["status"] = "completed"

        # Calculate focus metrics
        duration = (session["end_time"] - session["start_time"]).total_seconds() / 60
        focus_score = self._calculate_focus_score(session)

        session["actual_duration_minutes"] = duration
        session["focus_score"] = focus_score

        # Clear current session
        del context.state["current_focus_session"]

        return {
            "success": True,
            "session_id": session_id,
            "duration_minutes": duration,
            "focus_score": focus_score,
            "message": f"Focus session completed with {focus_score}/100 focus score",
        }

    async def block_distraction(
        self, distraction_type: str, reason: str, context: RunContext | None = None
    ) -> dict[str, Any]:
        """Block a distraction during focus session."""
        if not context or "current_focus_session" not in context.state:
            return {"success": False, "message": "No active focus session to block distraction"}

        session = context.state["current_focus_session"]
        distraction = {
            "type": distraction_type,
            "reason": reason,
            "timestamp": datetime.now(),
            "blocked": True,
        }

        session["distractions_blocked"].append(distraction)

        return {
            "success": True,
            "message": f"Blocked {distraction_type}: {reason}",
            "distraction": distraction,
        }

    async def get_focus_analytics(
        self, days: int = 7, context: RunContext | None = None
    ) -> dict[str, Any]:
        """Get focus analytics for the specified period."""
        # This would typically query a database
        # For now, return mock analytics
        analytics = {
            "period_days": days,
            "total_sessions": 12,
            "average_duration_minutes": 28.5,
            "average_focus_score": 78.2,
            "total_distractions_blocked": 8,
            "focus_trend": "improving",
            "best_session_type": "deep_work",
            "recommendations": [
                "Try 25-minute Pomodoro sessions",
                "Block social media during focus time",
                "Use noise-cancelling headphones",
            ],
        }

        return {"success": True, "analytics": analytics}

    def _calculate_focus_score(self, session: dict[str, Any]) -> int:
        """Calculate focus score based on session metrics."""
        base_score = 50

        # Duration bonus
        duration = session.get("actual_duration_minutes", 0)
        if duration >= session.get("duration_minutes", 25):
            base_score += 20

        # Distraction penalty
        distractions = len(session.get("distractions_blocked", []))
        distraction_penalty = min(distractions * 5, 30)
        base_score -= distraction_penalty

        # Session type bonus
        session_type = session.get("type", "pomodoro")
        if session_type == "deep_work":
            base_score += 15
        elif session_type == "flow_state":
            base_score += 10

        return max(0, min(100, base_score))

    async def suggest_focus_technique(
        self, current_mood: str, task_complexity: str, context: RunContext | None = None
    ) -> dict[str, Any]:
        """Suggest appropriate focus technique based on context."""
        techniques = {
            "low_energy": {
                "technique": "Pomodoro with 5-minute breaks",
                "duration": 25,
                "break_duration": 5,
                "reason": "Short bursts help maintain energy",
            },
            "high_energy": {
                "technique": "Deep work session",
                "duration": 90,
                "break_duration": 15,
                "reason": "Leverage high energy for complex tasks",
            },
            "distracted": {
                "technique": "Meditation + Pomodoro",
                "duration": 20,
                "break_duration": 10,
                "reason": "Meditation helps reset focus",
            },
        }

        # Simple mood-based selection
        if "tired" in current_mood.lower() or "low" in current_mood.lower():
            suggestion = techniques["low_energy"]
        elif "distracted" in current_mood.lower():
            suggestion = techniques["distracted"]
        else:
            suggestion = techniques["high_energy"]

        return {
            "success": True,
            "suggestion": suggestion,
            "context": {"current_mood": current_mood, "task_complexity": task_complexity},
        }
