"""
Gamification service for integration with proxy agents.

Provides a unified interface for all proxy agents to interact with
the gamification system (XP, achievements, streaks).
"""

from datetime import datetime
from typing import Any

from .achievement_engine import AchievementEngine, AchievementTrigger
from .leaderboard import LeaderboardManager
from .streak_manager import StreakManager, StreakType
from .xp_engine import XPEngine
from .xp_tracker import XPEventType, XPTracker


class GamificationService:
    """
    Unified gamification service for proxy agent integration.

    Coordinates XP tracking, streak management, and achievement detection
    across all proxy agents in the platform.
    """

    def __init__(self):
        """Initialize the gamification service."""
        self.xp_engine = XPEngine()
        self.xp_tracker = XPTracker(self.xp_engine)
        self.streak_manager = StreakManager()
        self.achievement_engine = AchievementEngine()
        self.leaderboard_manager = LeaderboardManager()

    async def handle_task_completed(
        self, user_id: int, task_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle task completion event.

        Args:
            user_id: User who completed the task
            task_data: Task completion data

        Returns:
            Gamification response with XP, achievements, etc.
        """
        # Extract task details
        task_title = task_data.get("title", "Untitled Task")
        difficulty = task_data.get("difficulty", "medium")
        priority = task_data.get("priority", "medium")
        estimated_duration = task_data.get("estimated_duration")
        actual_duration = task_data.get("actual_duration")
        quality_score = task_data.get("quality_score")

        # Get current streak multiplier
        streak_multiplier = self.streak_manager.calculate_streak_multiplier(user_id)

        # Track XP event
        xp_awarded = await self.xp_tracker.track_event(
            user_id=user_id,
            event_type=XPEventType.TASK_COMPLETED,
            event_data={
                "task_title": task_title,
                "difficulty": difficulty,
                "priority": priority,
                "estimated_duration": estimated_duration,
                "actual_duration": actual_duration,
                "quality_score": quality_score,
                "streak_multiplier": streak_multiplier,
                "completion_time": datetime.now().isoformat(),
            },
            source_agent="task_proxy",
        )

        # Update streak
        task_streak = self.streak_manager.record_activity(
            user_id=user_id, streak_type=StreakType.DAILY_TASK_COMPLETION
        )

        # Check for achievements
        user_stats = await self._get_user_stats(user_id)
        new_achievements = self.achievement_engine.check_achievements(
            user_id=user_id,
            trigger_event=AchievementTrigger.TASK_COMPLETED,
            event_data={
                "task_title": task_title,
                "difficulty": difficulty,
                "priority": priority,
                "completion_time": datetime.now(),
                "quality_score": quality_score,
            },
            user_stats=user_stats,
        )

        # Award XP for achievements
        achievement_xp = sum(a.xp_awarded for a in new_achievements)

        return {
            "xp_awarded": xp_awarded,
            "achievement_xp": achievement_xp,
            "total_xp": xp_awarded + achievement_xp,
            "new_achievements": [
                {
                    "id": a.achievement_id,
                    "title": self.achievement_engine.achievements[a.achievement_id].title,
                    "description": self.achievement_engine.achievements[
                        a.achievement_id
                    ].description,
                    "icon": self.achievement_engine.achievements[a.achievement_id].icon,
                    "xp_reward": a.xp_awarded,
                    "rarity": self.achievement_engine.achievements[a.achievement_id].rarity.value,
                }
                for a in new_achievements
            ],
            "streak_info": {
                "type": task_streak.streak_type.value,
                "current_count": task_streak.current_count,
                "best_count": task_streak.best_count,
                "status": task_streak.status.value,
                "shields": task_streak.streak_shields,
            },
            "user_level": self._calculate_user_level(
                user_stats["total_xp"] + xp_awarded + achievement_xp
            ),
            "message": self._generate_feedback_message(xp_awarded, new_achievements, task_streak),
        }

    async def handle_focus_session_completed(
        self, user_id: int, session_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle focus session completion event.

        Args:
            user_id: User who completed the session
            session_data: Focus session data

        Returns:
            Gamification response
        """
        duration_minutes = session_data.get("duration_minutes", 30)
        quality_score = session_data.get("quality_score")
        session_type = session_data.get("session_type", "deep_work")

        # Get streak multiplier
        streak_multiplier = self.streak_manager.calculate_streak_multiplier(user_id)

        # Track XP
        xp_awarded = await self.xp_tracker.track_event(
            user_id=user_id,
            event_type=XPEventType.FOCUS_SESSION_COMPLETED,
            event_data={
                "duration_minutes": duration_minutes,
                "actual_duration": duration_minutes,
                "quality_score": quality_score,
                "session_type": session_type,
                "streak_multiplier": streak_multiplier,
            },
            source_agent="focus_proxy",
        )

        # Update streak
        focus_streak = self.streak_manager.record_activity(
            user_id=user_id, streak_type=StreakType.DAILY_FOCUS_SESSION
        )

        # Check achievements
        user_stats = await self._get_user_stats(user_id)
        new_achievements = self.achievement_engine.check_achievements(
            user_id=user_id,
            trigger_event=AchievementTrigger.FOCUS_SESSION_COMPLETED,
            event_data={
                "duration_minutes": duration_minutes,
                "quality_score": quality_score,
                "session_type": session_type,
            },
            user_stats=user_stats,
        )

        achievement_xp = sum(a.xp_awarded for a in new_achievements)

        return {
            "xp_awarded": xp_awarded,
            "achievement_xp": achievement_xp,
            "total_xp": xp_awarded + achievement_xp,
            "new_achievements": [self._format_achievement(a) for a in new_achievements],
            "streak_info": self._format_streak(focus_streak),
            "message": f"🧘 Great focus session! {duration_minutes} minutes of deep work earned you {xp_awarded} XP.",
        }

    async def handle_energy_logged(
        self, user_id: int, energy_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle energy logging event.

        Args:
            user_id: User logging energy
            energy_data: Energy data

        Returns:
            Gamification response
        """
        energy_level = energy_data.get("energy_level", 5)
        mood = energy_data.get("mood")
        notes = energy_data.get("notes")

        # Track XP
        xp_awarded = await self.xp_tracker.track_event(
            user_id=user_id,
            event_type=XPEventType.ENERGY_LOGGED,
            event_data={"energy_level": energy_level, "mood": mood, "notes": notes},
            source_agent="energy_proxy",
        )

        # Update streak
        energy_streak = self.streak_manager.record_activity(
            user_id=user_id, streak_type=StreakType.DAILY_ENERGY_LOG
        )

        return {
            "xp_awarded": xp_awarded,
            "streak_info": self._format_streak(energy_streak),
            "message": f"⚡ Energy logged! {xp_awarded} XP for staying mindful of your energy levels.",
        }

    async def handle_progress_updated(
        self, user_id: int, progress_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Handle progress update event.

        Args:
            user_id: User updating progress
            progress_data: Progress data

        Returns:
            Gamification response
        """
        goal_type = progress_data.get("goal_type", "general")
        progress_percentage = progress_data.get("progress_percentage", 0)
        milestone_reached = progress_data.get("milestone_reached", False)

        # Track XP
        xp_awarded = await self.xp_tracker.track_event(
            user_id=user_id,
            event_type=XPEventType.PROGRESS_UPDATED,
            event_data={
                "goal_type": goal_type,
                "progress_percentage": progress_percentage,
                "milestone_reached": milestone_reached,
            },
            source_agent="progress_proxy",
        )

        # Update streak
        progress_streak = self.streak_manager.record_activity(
            user_id=user_id, streak_type=StreakType.DAILY_PROGRESS_UPDATE
        )

        return {
            "xp_awarded": xp_awarded,
            "streak_info": self._format_streak(progress_streak),
            "message": f"📈 Progress updated! {xp_awarded} XP for tracking your growth.",
        }

    async def get_user_dashboard(self, user_id: int) -> dict[str, Any]:
        """
        Get comprehensive gamification dashboard for user.

        Args:
            user_id: User ID

        Returns:
            Complete gamification status
        """
        user_stats = await self._get_user_stats(user_id)
        user_streaks = self.streak_manager.get_user_streaks(user_id)
        user_achievements = self.achievement_engine.get_user_achievements(user_id)
        recent_events = self.xp_tracker.get_recent_events(user_id, limit=10)

        return {
            "user_level": self._calculate_user_level(user_stats["total_xp"]),
            "total_xp": user_stats["total_xp"],
            "xp_to_next_level": self._xp_to_next_level(user_stats["total_xp"]),
            "active_streaks": [
                self._format_streak(streak)
                for streak in user_streaks
                if streak.status.value in ["active", "protected"]
            ],
            "recent_achievements": [
                self._format_achievement_from_user_achievement(ua)
                for ua in sorted(user_achievements, key=lambda x: x.earned_at, reverse=True)[:5]
            ],
            "recent_activity": [
                {
                    "event_type": event.event_type.value,
                    "xp_awarded": event.xp_awarded,
                    "timestamp": event.timestamp.isoformat(),
                    "source_agent": event.source_agent,
                }
                for event in recent_events
            ],
            "streak_statistics": self.streak_manager.get_streak_statistics(user_id),
        }

    async def _get_user_stats(self, user_id: int) -> dict[str, Any]:
        """Get current user statistics."""
        # In a real implementation, this would query the database
        return {
            "total_xp": self.xp_tracker.get_user_total_xp(user_id),
            "total_tasks_completed": 1,  # Would be from database
            "total_focus_sessions": 1,  # Would be from database
            "perfect_quality_tasks": 0,  # Would be from database
        }

    def _calculate_user_level(self, total_xp: int) -> int:
        """Calculate user level based on total XP."""
        # Simple level calculation: level = sqrt(xp / 100)
        import math

        if total_xp <= 0:
            return 1
        return max(1, int(math.sqrt(total_xp / 100)))

    def _xp_to_next_level(self, total_xp: int) -> int:
        """Calculate XP needed for next level."""
        current_level = self._calculate_user_level(total_xp)
        next_level_xp = (current_level + 1) ** 2 * 100
        return next_level_xp - total_xp

    def _format_streak(self, streak) -> dict[str, Any]:
        """Format streak data for API response."""
        return {
            "type": streak.streak_type.value,
            "current_count": streak.current_count,
            "best_count": streak.best_count,
            "status": streak.status.value,
            "shields": streak.streak_shields,
            "last_activity": streak.last_activity_date.isoformat(),
            "started_date": streak.started_date.isoformat(),
        }

    def _format_achievement(self, user_achievement) -> dict[str, Any]:
        """Format achievement data for API response."""
        achievement_def = self.achievement_engine.achievements[user_achievement.achievement_id]
        return {
            "id": user_achievement.achievement_id,
            "title": achievement_def.title,
            "description": achievement_def.description,
            "icon": achievement_def.icon,
            "xp_reward": user_achievement.xp_awarded,
            "rarity": achievement_def.rarity.value,
            "category": achievement_def.category.value,
            "earned_at": user_achievement.earned_at.isoformat(),
        }

    def _format_achievement_from_user_achievement(self, user_achievement) -> dict[str, Any]:
        """Format user achievement for API response."""
        achievement_def = self.achievement_engine.achievements.get(user_achievement.achievement_id)
        if not achievement_def:
            return {}

        return {
            "id": user_achievement.achievement_id,
            "title": achievement_def.title,
            "description": achievement_def.description,
            "icon": achievement_def.icon,
            "xp_reward": user_achievement.xp_awarded,
            "rarity": achievement_def.rarity.value,
            "category": achievement_def.category.value,
            "earned_at": user_achievement.earned_at.isoformat(),
        }

    def _generate_feedback_message(self, xp_awarded: int, achievements: list, streak) -> str:
        """Generate motivational feedback message."""
        messages = [f"🎯 Task completed! +{xp_awarded} XP"]

        if achievements:
            messages.append(f"🏆 {len(achievements)} new achievement(s) unlocked!")

        if streak.current_count > 1:
            messages.append(f"🔥 {streak.current_count}-day streak maintained!")

        return " ".join(messages)
