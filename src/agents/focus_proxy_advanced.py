"""
Advanced Focus Proxy Agent - Intelligent focus session management

This agent provides sophisticated focus session management including:
- Adaptive Pomodoro technique with personalized durations
- Real-time distraction detection and intervention
- Context-aware session recommendations
- Focus quality analysis and optimization
- Integration with energy levels and task complexity
- Learning from user patterns and preferences
"""

import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from src.agents.base import BaseProxyAgent
from src.core.models import AgentRequest, Message
from src.repositories.enhanced_repositories import EnhancedTaskRepository
from src.repositories.enhanced_repositories_extensions import EnhancedFocusSessionRepository

logger = logging.getLogger(__name__)


@dataclass
class FocusSessionConfig:
    """Configuration for focus sessions"""

    duration: int  # minutes
    technique: str  # pomodoro, deep_work, timeboxing
    break_duration: int  # minutes
    long_break_frequency: int  # number of sessions
    distraction_tolerance: float  # 0.0 to 1.0
    interruption_policy: str  # strict, flexible, adaptive


@dataclass
class FocusMetrics:
    """Focus session quality metrics"""

    completion_rate: float
    distraction_count: int
    focus_score: float  # 0.0 to 10.0
    productivity_rating: float
    interruption_recovery_time: float  # minutes


class AdvancedFocusAgent(BaseProxyAgent):
    """Advanced Focus Proxy Agent with intelligent session management"""

    def __init__(self, db, session_repo=None, task_repo=None):
        super().__init__("advanced_focus", db)

        # Repository dependencies
        self.session_repo = session_repo or EnhancedFocusSessionRepository()
        self.task_repo = task_repo or EnhancedTaskRepository()

        # Session tracking
        self.active_sessions = {}
        self.user_preferences = {}
        self.distraction_patterns = {}

        # Default configurations
        self.default_configs = {
            "pomodoro": FocusSessionConfig(25, "pomodoro", 5, 4, 0.7, "adaptive"),
            "deep_work": FocusSessionConfig(90, "deep_work", 15, 2, 0.5, "strict"),
            "timeboxing": FocusSessionConfig(60, "timeboxing", 10, 3, 0.8, "flexible"),
        }

    async def _handle_request(
        self, request: AgentRequest, history: list[Message]
    ) -> tuple[str, int]:
        """Handle focus session requests with intelligent routing"""
        try:
            query = request.query.lower().strip()

            # Start focus session
            if any(word in query for word in ["start", "begin", "focus"]):
                session_data = await self.start_focus_session(request)
                return self._format_session_start_response(session_data), 40

            # End/complete session
            elif any(word in query for word in ["stop", "end", "complete", "finish"]):
                completion_data = await self.complete_focus_session(request.session_id, {})
                return self._format_session_completion_response(completion_data), 30

            # Session status check
            elif any(word in query for word in ["status", "time", "progress"]):
                status = await self.get_session_status(request.session_id)
                return self._format_status_response(status), 10

            # Break recommendations
            elif any(word in query for word in ["break", "rest", "pause"]):
                break_rec = await self.recommend_break({"duration": 25, "intensity": "medium"})
                return self._format_break_response(break_rec), 20

            # Distraction help
            elif any(word in query for word in ["distracted", "focus", "concentrate"]):
                intervention = await self.handle_distraction(request.session_id, query)
                return self._format_intervention_response(intervention), 15

            # Default guidance
            else:
                guidance = await self.provide_focus_guidance(request)
                return guidance["message"], guidance["xp"]

        except Exception as e:
            logger.error(f"Focus agent error: {e}")
            return "🎯 I'm here to help with focus sessions. Try 'start focus' to begin.", 5

    async def start_focus_session(self, request: AgentRequest) -> dict[str, Any]:
        """Start an intelligent focus session"""
        user_id = request.user_id
        session_config = await self._determine_optimal_session_config(user_id, request.query)

        session_data = await self._create_focus_session(
            user_id=user_id,
            session_id=request.session_id,
            config=session_config,
            task_context=request.query,
        )

        # Track active session
        self.active_sessions[request.session_id] = {
            "start_time": datetime.now(),
            "config": session_config,
            "user_id": user_id,
            "distractions": [],
            "quality_metrics": FocusMetrics(0.0, 0, 0.0, 0.0, 0.0),
        }

        return session_data

    async def _determine_optimal_session_config(
        self, user_id: str, task_context: str
    ) -> FocusSessionConfig:
        """Determine optimal session configuration based on user patterns and task"""
        # Analyze task complexity
        task_complexity = await self._analyze_task_complexity_from_context(task_context)

        # Get user preferences and patterns
        user_patterns = await self._get_user_focus_patterns(user_id)

        # Determine session type
        if task_complexity > 0.8:
            base_config = self.default_configs["deep_work"]
        elif "quick" in task_context.lower() or "simple" in task_context.lower():
            base_config = self.default_configs["timeboxing"]
        else:
            base_config = self.default_configs["pomodoro"]

        # Customize based on user patterns
        if user_patterns:
            optimal_duration = user_patterns.get(
                "average_successful_duration", base_config.duration
            )
            distraction_tolerance = user_patterns.get(
                "distraction_tolerance", base_config.distraction_tolerance
            )

            return FocusSessionConfig(
                duration=optimal_duration,
                technique=base_config.technique,
                break_duration=base_config.break_duration,
                long_break_frequency=base_config.long_break_frequency,
                distraction_tolerance=distraction_tolerance,
                interruption_policy=base_config.interruption_policy,
            )

        return base_config

    async def _create_focus_session(
        self, user_id: str, session_id: str, config: FocusSessionConfig, task_context: str
    ) -> dict[str, Any]:
        """Create and store focus session"""
        session_data = {
            "session_id": f"focus_{datetime.now().timestamp()}",
            "user_id": user_id,
            "external_session_id": session_id,
            "technique": config.technique,
            "planned_duration": config.duration,
            "break_duration": config.break_duration,
            "task_context": task_context,
            "start_time": datetime.now(),
            "status": "active",
            "config": {
                "distraction_tolerance": config.distraction_tolerance,
                "interruption_policy": config.interruption_policy,
            },
        }

        # Store in repository
        try:
            await self.session_repo.create(session_data)
        except Exception as e:
            logger.error(f"Failed to store focus session: {e}")

        return session_data

    async def recommend_session_duration(self, user_id: str, context: str) -> dict[str, Any]:
        """Recommend optimal session duration based on analysis"""
        duration_rec = await self._analyze_optimal_duration(user_id, context)

        return {
            "recommended_duration": duration_rec.get(
                "recommended_duration", duration_rec.get("duration", 25)
            ),
            "confidence": duration_rec["confidence"],
            "reasoning": duration_rec.get(
                "reason", duration_rec.get("reasoning", "Standard recommendation")
            ),
            "alternative_durations": duration_rec.get("alternatives", []),
        }

    async def _analyze_optimal_duration(self, user_id: str, context: str) -> dict[str, Any]:
        """Analyze optimal session duration"""
        # Get user historical data
        user_sessions = await self._get_user_session_history(user_id)

        # Analyze task complexity
        complexity = await self._analyze_task_complexity_from_context(context)

        # Calculate base duration
        if complexity > 0.8:
            base_duration = 60  # Complex tasks need longer focus
        elif complexity > 0.5:
            base_duration = 45  # Medium complexity
        else:
            base_duration = 25  # Standard Pomodoro

        # Adjust based on user patterns
        if user_sessions:
            avg_successful = sum(
                s.get("actual_duration", 25)
                for s in user_sessions
                if s.get("completion_rate", 0) > 0.8
            ) / len(user_sessions)
            adjusted_duration = int((base_duration + avg_successful) / 2)
        else:
            adjusted_duration = base_duration

        # Confidence based on data availability
        confidence = min(0.9, len(user_sessions) * 0.1 + 0.3)

        return {
            "duration": adjusted_duration,
            "confidence": confidence,
            "reasoning": f"Based on task complexity ({complexity:.1f}) and user patterns",
            "alternatives": [adjusted_duration - 10, adjusted_duration + 10],
        }

    async def detect_distractions(
        self, session_id: str, activity_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Detect and analyze distractions during focus session"""
        analysis = await self._analyze_focus_quality(session_id, activity_data)

        # Store distraction data
        if session_id in self.active_sessions:
            self.active_sessions[session_id]["distractions"].append(
                {
                    "timestamp": datetime.now(),
                    "type": analysis.get("primary_distractors", []),
                    "severity": analysis.get("distraction_level", 0.0),
                }
            )

        return analysis

    async def _analyze_focus_quality(
        self, session_id: str, activity_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Analyze focus quality based on activity patterns"""
        distraction_indicators = {
            "app_switches": activity_data.get("app_switches", 0),
            "typing_pattern": activity_data.get("typing_pattern", "regular"),
            "mouse_movement": activity_data.get("mouse_movement", "normal"),
            "notification_interactions": activity_data.get("notifications", 0),
        }

        # Calculate distraction level
        distraction_score = 0.0
        primary_distractors = []

        if distraction_indicators["app_switches"] > 3:
            distraction_score += 0.3
            primary_distractors.append("application_switching")

        if distraction_indicators["typing_pattern"] == "irregular":
            distraction_score += 0.2

        if distraction_indicators["mouse_movement"] == "frequent_tabs":
            distraction_score += 0.2
            primary_distractors.append("web_browsing")

        if distraction_indicators["notification_interactions"] > 2:
            distraction_score += 0.3
            primary_distractors.append("notifications")

        return {
            "distraction_level": min(1.0, distraction_score),
            "primary_distractors": primary_distractors,
            "intervention_needed": distraction_score > 0.5,
            "recommendations": self._generate_distraction_interventions(primary_distractors),
        }

    def _generate_distraction_interventions(self, distractors: list[str]) -> list[str]:
        """Generate specific interventions for detected distractions"""
        interventions = []

        if "application_switching" in distractors:
            interventions.extend(["Close unnecessary applications", "Use single-app mode"])

        if "web_browsing" in distractors:
            interventions.extend(["Enable website blocker", "Close browser tabs"])

        if "notifications" in distractors:
            interventions.extend(["Turn on do not disturb", "Disable non-essential notifications"])

        if not interventions:
            interventions = ["Take 3 deep breaths", "Refocus on your main task"]

        return interventions

    async def complete_focus_session(
        self, session_id: str, completion_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Complete focus session and calculate metrics"""
        if session_id not in self.active_sessions:
            return {"error": "No active session found"}

        session = self.active_sessions[session_id]
        end_time = datetime.now()
        actual_duration = (end_time - session["start_time"]).total_seconds() / 60

        # Calculate session metrics
        metrics = await self._calculate_session_metrics(session, completion_data, actual_duration)

        # Store completion data
        session_result = {
            "session_id": session_id,
            "user_id": session["user_id"],
            "actual_duration": actual_duration,
            "planned_duration": session["config"].duration,
            "completion_rate": getattr(
                metrics, "completion_rate", metrics.get("completion_rate", 0.0)
            ),
            "focus_score": getattr(metrics, "focus_score", metrics.get("focus_score", 0.0)),
            "productivity_rating": getattr(
                metrics, "productivity_rating", metrics.get("productivity_rating", 0.0)
            ),
            "distraction_count": len(session["distractions"]),
            "end_time": end_time,
            "recommendations": getattr(
                metrics, "recommendations", metrics.get("recommendations", [])
            ),
        }

        # Clean up active session
        del self.active_sessions[session_id]

        return session_result

    async def _calculate_session_metrics(
        self, session: dict[str, Any], completion_data: dict[str, Any], actual_duration: float
    ) -> FocusMetrics:
        """Calculate comprehensive session quality metrics"""
        planned_duration = session["config"].duration
        distraction_count = len(session["distractions"])

        # Completion rate
        completion_rate = min(1.0, actual_duration / planned_duration)

        # Focus score (0-10)
        focus_score = 10.0
        focus_score -= min(3.0, distraction_count * 0.5)  # Penalty for distractions
        focus_score *= completion_rate  # Bonus for completion

        # Productivity rating from user feedback or task progress
        productivity_rating = completion_data.get(
            "productivity_rating", focus_score * 0.5 + completion_rate * 5.0
        )

        return FocusMetrics(
            completion_rate=completion_rate,
            distraction_count=distraction_count,
            focus_score=focus_score,
            productivity_rating=productivity_rating,
            interruption_recovery_time=0.0,  # Would calculate from distraction timing
        )

    async def recommend_break(self, session_data: dict[str, Any]) -> dict[str, Any]:
        """Recommend intelligent break activities"""
        break_recommendations = await self._recommend_break_activities(session_data)

        return {
            "type": break_recommendations["type"],
            "duration": break_recommendations["duration"],
            "activities": break_recommendations["activities"],
            "avoid": break_recommendations["avoid"],
            "reasoning": break_recommendations.get("reasoning", "Based on session characteristics"),
        }

    async def _recommend_break_activities(self, session_data: dict[str, Any]) -> dict[str, Any]:
        """Generate personalized break activity recommendations"""
        duration = session_data.get("duration", 25)
        intensity = session_data.get("intensity", "medium")
        screen_time = session_data.get("screen_time", duration)

        # Determine break type
        if intensity == "high" or screen_time > 45:
            break_type = "active_break"
            activities = ["walk_outside", "stretching", "eye_exercises", "hydrate"]
            avoid = ["screens", "social_media", "email"]
            duration_rec = 15
        elif intensity == "medium":
            break_type = "restorative_break"
            activities = ["deep_breathing", "light_snack", "organize_workspace"]
            avoid = ["work_related_content", "stressful_news"]
            duration_rec = 10
        else:
            break_type = "micro_break"
            activities = ["stand_and_stretch", "look_away_from_screen", "water"]
            avoid = ["sitting", "continued_screen_use"]
            duration_rec = 5

        return {
            "type": break_type,
            "duration": duration_rec,
            "activities": activities,
            "avoid": avoid,
            "reasoning": f"After {duration}min of {intensity} intensity work",
        }

    async def get_session_status(self, session_id: str) -> dict[str, Any]:
        """Get current session status and progress"""
        if session_id not in self.active_sessions:
            return {"status": "no_active_session", "message": "No active focus session"}

        session = self.active_sessions[session_id]
        elapsed = (datetime.now() - session["start_time"]).total_seconds() / 60
        remaining = max(0, session["config"].duration - elapsed)

        return {
            "status": "active",
            "elapsed_minutes": int(elapsed),
            "remaining_minutes": int(remaining),
            "progress_percentage": min(100, (elapsed / session["config"].duration) * 100),
            "distraction_count": len(session["distractions"]),
            "technique": session["config"].technique,
        }

    async def handle_distraction(self, session_id: str, distraction_context: str) -> dict[str, Any]:
        """Handle distraction intervention"""
        if session_id not in self.active_sessions:
            return {"message": "Start a focus session first to get distraction help"}

        interventions = [
            "Take 3 deep breaths and refocus on your task",
            "Close any distracting applications or browser tabs",
            "Set your phone to do not disturb mode",
            "Remind yourself of your session goal",
        ]

        # Record distraction
        self.active_sessions[session_id]["distractions"].append(
            {
                "timestamp": datetime.now(),
                "context": distraction_context,
                "intervention": interventions[0],
            }
        )

        return {
            "type": "distraction_intervention",
            "primary_suggestion": interventions[0],
            "additional_strategies": interventions[1:],
            "encouragement": "Distractions are normal. Gently bring your attention back to your task.",
        }

    async def provide_focus_guidance(self, request: AgentRequest) -> dict[str, Any]:
        """Provide general focus guidance and tips"""
        guidance_tips = [
            "Start with a clear intention for your focus session",
            "Remove potential distractions from your environment",
            "Use the Pomodoro technique: 25 minutes focus, 5 minute break",
            "Practice single-tasking - focus on one thing at a time",
            "Take regular breaks to maintain high performance",
        ]

        return {
            "message": f"🎯 Focus tip: {guidance_tips[0]}. Say 'start focus' to begin a session!",
            "xp": 10,
            "additional_tips": guidance_tips[1:],
        }

    # Response formatting methods
    def _format_session_start_response(self, session_data: dict[str, Any]) -> str:
        duration = session_data.get("planned_duration", 25)
        technique = session_data.get("technique", "pomodoro")
        return f"🎯 {technique.title()} session started! {duration} minutes of focused work ahead."

    def _format_session_completion_response(self, completion_data: dict[str, Any]) -> str:
        if "error" in completion_data:
            return "⏸️ No active session to complete. Start a new session with 'start focus'."

        score = completion_data.get("focus_score", 0)
        completion = completion_data.get("completion_rate", 0) * 100
        return f"✅ Session complete! Focus score: {score:.1f}/10, Completion: {completion:.0f}%"

    def _format_status_response(self, status: dict[str, Any]) -> str:
        if status.get("status") == "no_active_session":
            return "No active focus session. Say 'start focus' to begin!"

        remaining = status.get("remaining_minutes", 0)
        progress = status.get("progress_percentage", 0)
        return f"🎯 Focus session: {remaining} minutes remaining ({progress:.0f}% complete)"

    def _format_break_response(self, break_rec: dict[str, Any]) -> str:
        duration = break_rec.get("duration", 5)
        activities = break_rec.get("activities", [])
        activity_str = ", ".join(activities[:2])
        return f"☕ Take a {duration}-minute break! Try: {activity_str}"

    def _format_intervention_response(self, intervention: dict[str, Any]) -> str:
        suggestion = intervention.get("primary_suggestion", "Refocus on your task")
        return f"🧘 {suggestion}"

    # Helper methods for data access
    async def _get_user_focus_patterns(self, user_id: str) -> dict[str, Any]:
        """Get user's historical focus patterns"""
        # This would query the database for user's session history
        return {}

    async def _get_user_session_history(self, user_id: str) -> list[dict[str, Any]]:
        """Get user's session history for analysis"""
        # This would query the database
        return []

    async def _analyze_task_complexity_from_context(self, context: str) -> float:
        """Analyze task complexity from context description"""
        complexity_keywords = {
            "simple": 0.2,
            "quick": 0.3,
            "easy": 0.2,
            "complex": 0.8,
            "difficult": 0.7,
            "challenging": 0.8,
            "analyze": 0.6,
            "design": 0.7,
            "implement": 0.8,
            "review": 0.4,
            "update": 0.3,
            "fix": 0.5,
        }

        content = context.lower()
        max_complexity = 0.5  # Default

        for keyword, score in complexity_keywords.items():
            if keyword in content:
                max_complexity = max(max_complexity, score)

        return max_complexity

    async def _generate_session_recommendations(
        self, session: dict[str, Any], metrics: FocusMetrics
    ) -> list[str]:
        """Generate recommendations for improving future sessions"""
        recommendations = []

        if metrics.distraction_count > 3:
            recommendations.append("Consider using website/app blockers during focus sessions")

        if metrics.completion_rate < 0.7:
            recommendations.append("Try shorter session durations to build focus stamina")

        if metrics.focus_score < 6.0:
            recommendations.append("Remove more distractions from your environment before starting")

        if not recommendations:
            recommendations.append("Great focus session! Keep up the excellent work")

        return recommendations
