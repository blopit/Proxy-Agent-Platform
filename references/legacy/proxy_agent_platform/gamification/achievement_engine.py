"""
Achievement system for real-time detection and awarding.

Implements a flexible framework for defining, detecting, and awarding
achievements across all user activities and productivity metrics.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any


class AchievementCategory(str, Enum):
    """Categories of achievements."""

    PRODUCTIVITY = "productivity"
    CONSISTENCY = "consistency"
    QUALITY = "quality"
    LEARNING = "learning"
    SOCIAL = "social"
    MILESTONES = "milestones"
    SPECIAL = "special"


class AchievementRarity(str, Enum):
    """Rarity levels for achievements."""

    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"


class AchievementTrigger(str, Enum):
    """Events that can trigger achievement checks."""

    TASK_COMPLETED = "task_completed"
    FOCUS_SESSION_COMPLETED = "focus_session_completed"
    STREAK_MILESTONE = "streak_milestone"
    XP_MILESTONE = "xp_milestone"
    GOAL_ACHIEVED = "goal_achieved"
    DAILY_SUMMARY = "daily_summary"
    WEEKLY_SUMMARY = "weekly_summary"
    QUALITY_FEEDBACK = "quality_feedback"


@dataclass
class AchievementDefinition:
    """Definition of an achievement that can be earned."""

    achievement_id: str
    title: str
    description: str
    category: AchievementCategory
    rarity: AchievementRarity
    xp_reward: int
    icon: str
    trigger_events: list[AchievementTrigger]
    check_function: str  # Name of method to call for checking
    requirements: dict[str, Any] = field(default_factory=dict)
    is_repeatable: bool = False
    max_awards: int | None = None
    prerequisite_achievements: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class UserAchievement:
    """Record of an achievement earned by a user."""

    user_id: int
    achievement_id: str
    earned_at: datetime
    progress_data: dict[str, Any] = field(default_factory=dict)
    xp_awarded: int = 0
    award_count: int = 1


class AchievementChecker(ABC):
    """Abstract base class for achievement checking logic."""

    @abstractmethod
    def check(self, user_id: int, event_data: dict[str, Any], user_stats: dict[str, Any]) -> bool:
        """
        Check if achievement requirements are met.

        Args:
            user_id: User ID
            event_data: Data from the triggering event
            user_stats: Current user statistics

        Returns:
            True if achievement should be awarded
        """
        pass


class AchievementEngine:
    """
    Core achievement detection and awarding engine.

    Manages achievement definitions, tracks user progress,
    and awards achievements in real-time based on user activities.
    """

    def __init__(self):
        """Initialize the achievement engine."""
        self.achievements: dict[str, AchievementDefinition] = {}
        self.user_achievements: dict[int, list[UserAchievement]] = {}
        self.checkers: dict[str, AchievementChecker] = {}
        self._initialize_default_achievements()

    def _initialize_default_achievements(self):
        """Initialize default set of achievements."""
        default_achievements = [
            # Productivity achievements
            AchievementDefinition(
                achievement_id="first_task",
                title="Getting Started",
                description="Complete your first task",
                category=AchievementCategory.PRODUCTIVITY,
                rarity=AchievementRarity.COMMON,
                xp_reward=50,
                icon="🎯",
                trigger_events=[AchievementTrigger.TASK_COMPLETED],
                check_function="check_first_task",
            ),
            AchievementDefinition(
                achievement_id="task_master_10",
                title="Task Master",
                description="Complete 10 tasks",
                category=AchievementCategory.PRODUCTIVITY,
                rarity=AchievementRarity.UNCOMMON,
                xp_reward=200,
                icon="⭐",
                trigger_events=[AchievementTrigger.TASK_COMPLETED],
                check_function="check_task_count",
                requirements={"count": 10},
            ),
            AchievementDefinition(
                achievement_id="task_master_100",
                title="Productivity Pro",
                description="Complete 100 tasks",
                category=AchievementCategory.PRODUCTIVITY,
                rarity=AchievementRarity.RARE,
                xp_reward=1000,
                icon="🏆",
                trigger_events=[AchievementTrigger.TASK_COMPLETED],
                check_function="check_task_count",
                requirements={"count": 100},
            ),
            # Focus achievements
            AchievementDefinition(
                achievement_id="focus_master",
                title="Focus Master",
                description="Complete a 90-minute focus session",
                category=AchievementCategory.QUALITY,
                rarity=AchievementRarity.UNCOMMON,
                xp_reward=300,
                icon="🧘",
                trigger_events=[AchievementTrigger.FOCUS_SESSION_COMPLETED],
                check_function="check_focus_duration",
                requirements={"min_duration": 90},
            ),
            # Consistency achievements
            AchievementDefinition(
                achievement_id="week_warrior",
                title="Week Warrior",
                description="Maintain a 7-day streak",
                category=AchievementCategory.CONSISTENCY,
                rarity=AchievementRarity.UNCOMMON,
                xp_reward=500,
                icon="🔥",
                trigger_events=[AchievementTrigger.STREAK_MILESTONE],
                check_function="check_streak_milestone",
                requirements={"min_streak": 7},
            ),
            AchievementDefinition(
                achievement_id="month_champion",
                title="Month Champion",
                description="Maintain a 30-day streak",
                category=AchievementCategory.CONSISTENCY,
                rarity=AchievementRarity.EPIC,
                xp_reward=2000,
                icon="👑",
                trigger_events=[AchievementTrigger.STREAK_MILESTONE],
                check_function="check_streak_milestone",
                requirements={"min_streak": 30},
            ),
            # XP achievements
            AchievementDefinition(
                achievement_id="xp_1000",
                title="Rising Star",
                description="Earn 1,000 XP",
                category=AchievementCategory.MILESTONES,
                rarity=AchievementRarity.UNCOMMON,
                xp_reward=200,
                icon="⭐",
                trigger_events=[AchievementTrigger.XP_MILESTONE],
                check_function="check_xp_milestone",
                requirements={"xp_threshold": 1000},
            ),
            AchievementDefinition(
                achievement_id="xp_10000",
                title="Power User",
                description="Earn 10,000 XP",
                category=AchievementCategory.MILESTONES,
                rarity=AchievementRarity.RARE,
                xp_reward=1000,
                icon="💎",
                trigger_events=[AchievementTrigger.XP_MILESTONE],
                check_function="check_xp_milestone",
                requirements={"xp_threshold": 10000},
            ),
            # Quality achievements
            AchievementDefinition(
                achievement_id="perfectionist",
                title="Perfectionist",
                description="Complete 5 tasks with perfect quality scores",
                category=AchievementCategory.QUALITY,
                rarity=AchievementRarity.RARE,
                xp_reward=800,
                icon="✨",
                trigger_events=[AchievementTrigger.QUALITY_FEEDBACK],
                check_function="check_perfect_quality",
                requirements={"perfect_count": 5},
            ),
            # Special achievements
            AchievementDefinition(
                achievement_id="night_owl",
                title="Night Owl",
                description="Complete a task after 11 PM",
                category=AchievementCategory.SPECIAL,
                rarity=AchievementRarity.UNCOMMON,
                xp_reward=150,
                icon="🦉",
                trigger_events=[AchievementTrigger.TASK_COMPLETED],
                check_function="check_night_task",
            ),
            AchievementDefinition(
                achievement_id="early_bird",
                title="Early Bird",
                description="Complete a task before 7 AM",
                category=AchievementCategory.SPECIAL,
                rarity=AchievementRarity.UNCOMMON,
                xp_reward=150,
                icon="🐦",
                trigger_events=[AchievementTrigger.TASK_COMPLETED],
                check_function="check_early_task",
            ),
        ]

        for achievement in default_achievements:
            self.achievements[achievement.achievement_id] = achievement

    def check_achievements(
        self,
        user_id: int,
        trigger_event: AchievementTrigger,
        event_data: dict[str, Any],
        user_stats: dict[str, Any],
    ) -> list[UserAchievement]:
        """
        Check for achievements triggered by an event.

        Args:
            user_id: User ID
            trigger_event: Event that triggered the check
            event_data: Data from the triggering event
            user_stats: Current user statistics

        Returns:
            List of newly awarded achievements
        """
        new_achievements = []

        for achievement in self.achievements.values():
            if trigger_event not in achievement.trigger_events:
                continue

            # Check if user already has this achievement (and it's not repeatable)
            if not achievement.is_repeatable and self._user_has_achievement(
                user_id, achievement.achievement_id
            ):
                continue

            # Check prerequisites
            if not self._check_prerequisites(user_id, achievement.prerequisite_achievements):
                continue

            # Check max awards
            if achievement.max_awards:
                current_awards = self._get_achievement_award_count(
                    user_id, achievement.achievement_id
                )
                if current_awards >= achievement.max_awards:
                    continue

            # Run achievement check
            if self._run_achievement_check(achievement, user_id, event_data, user_stats):
                awarded_achievement = self._award_achievement(user_id, achievement)
                new_achievements.append(awarded_achievement)

        return new_achievements

    def _run_achievement_check(
        self,
        achievement: AchievementDefinition,
        user_id: int,
        event_data: dict[str, Any],
        user_stats: dict[str, Any],
    ) -> bool:
        """Run the check function for an achievement."""
        check_method = getattr(self, achievement.check_function, None)
        if check_method:
            return check_method(user_id, event_data, user_stats, achievement.requirements)
        return False

    def _award_achievement(
        self, user_id: int, achievement: AchievementDefinition
    ) -> UserAchievement:
        """Award an achievement to a user."""
        user_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement.achievement_id,
            earned_at=datetime.now(),
            xp_awarded=achievement.xp_reward,
        )

        if user_id not in self.user_achievements:
            self.user_achievements[user_id] = []

        self.user_achievements[user_id].append(user_achievement)
        return user_achievement

    def _user_has_achievement(self, user_id: int, achievement_id: str) -> bool:
        """Check if user has already earned an achievement."""
        user_achievements = self.user_achievements.get(user_id, [])
        return any(a.achievement_id == achievement_id for a in user_achievements)

    def _check_prerequisites(self, user_id: int, prerequisites: list[str]) -> bool:
        """Check if user has all prerequisite achievements."""
        for prereq in prerequisites:
            if not self._user_has_achievement(user_id, prereq):
                return False
        return True

    def _get_achievement_award_count(self, user_id: int, achievement_id: str) -> int:
        """Get number of times user has earned an achievement."""
        user_achievements = self.user_achievements.get(user_id, [])
        return sum(1 for a in user_achievements if a.achievement_id == achievement_id)

    # Achievement check methods
    def check_first_task(
        self, user_id: int, event_data: dict, user_stats: dict, requirements: dict
    ) -> bool:
        """Check if this is the user's first task completion."""
        return user_stats.get("total_tasks_completed", 0) == 1

    def check_task_count(
        self, user_id: int, event_data: dict, user_stats: dict, requirements: dict
    ) -> bool:
        """Check if user has completed required number of tasks."""
        required_count = requirements.get("count", 0)
        return user_stats.get("total_tasks_completed", 0) >= required_count

    def check_focus_duration(
        self, user_id: int, event_data: dict, user_stats: dict, requirements: dict
    ) -> bool:
        """Check if focus session meets duration requirement."""
        min_duration = requirements.get("min_duration", 0)
        session_duration = event_data.get("duration_minutes", 0)
        return session_duration >= min_duration

    def check_streak_milestone(
        self, user_id: int, event_data: dict, user_stats: dict, requirements: dict
    ) -> bool:
        """Check if streak milestone is reached."""
        min_streak = requirements.get("min_streak", 0)
        current_streak = event_data.get("streak_count", 0)
        return current_streak >= min_streak

    def check_xp_milestone(
        self, user_id: int, event_data: dict, user_stats: dict, requirements: dict
    ) -> bool:
        """Check if XP milestone is reached."""
        xp_threshold = requirements.get("xp_threshold", 0)
        total_xp = user_stats.get("total_xp", 0)
        return total_xp >= xp_threshold

    def check_perfect_quality(
        self, user_id: int, event_data: dict, user_stats: dict, requirements: dict
    ) -> bool:
        """Check if user has enough perfect quality tasks."""
        perfect_count = requirements.get("perfect_count", 0)
        user_perfect_count = user_stats.get("perfect_quality_tasks", 0)
        return user_perfect_count >= perfect_count

    def check_night_task(
        self, user_id: int, event_data: dict, user_stats: dict, requirements: dict
    ) -> bool:
        """Check if task was completed at night."""
        completion_time = event_data.get("completion_time", datetime.now())
        if isinstance(completion_time, str):
            completion_time = datetime.fromisoformat(completion_time)
        return completion_time.hour >= 23

    def check_early_task(
        self, user_id: int, event_data: dict, user_stats: dict, requirements: dict
    ) -> bool:
        """Check if task was completed early in the morning."""
        completion_time = event_data.get("completion_time", datetime.now())
        if isinstance(completion_time, str):
            completion_time = datetime.fromisoformat(completion_time)
        return completion_time.hour <= 7

    def get_user_achievements(self, user_id: int) -> list[UserAchievement]:
        """Get all achievements earned by a user."""
        return self.user_achievements.get(user_id, [])

    def get_achievement_progress(
        self, user_id: int, achievement_id: str, user_stats: dict
    ) -> dict[str, Any]:
        """Get progress toward an achievement."""
        achievement = self.achievements.get(achievement_id)
        if not achievement:
            return {}

        progress = {"progress": 0, "target": 1, "description": ""}

        if achievement.check_function == "check_task_count":
            target = achievement.requirements.get("count", 0)
            current = user_stats.get("total_tasks_completed", 0)
            progress = {
                "progress": min(current, target),
                "target": target,
                "description": f"{current}/{target} tasks completed",
            }

        elif achievement.check_function == "check_xp_milestone":
            target = achievement.requirements.get("xp_threshold", 0)
            current = user_stats.get("total_xp", 0)
            progress = {
                "progress": min(current, target),
                "target": target,
                "description": f"{current}/{target} XP earned",
            }

        return progress
