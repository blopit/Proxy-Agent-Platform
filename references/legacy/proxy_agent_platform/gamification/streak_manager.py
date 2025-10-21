"""
Streak tracking and management system.

Handles daily/weekly productivity streaks, streak shields, and recovery mechanisms
to maintain user motivation and engagement.
"""

from dataclasses import dataclass
from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field


class StreakType(str, Enum):
    """Types of streaks that can be tracked."""

    DAILY_TASK_COMPLETION = "daily_task_completion"
    DAILY_FOCUS_SESSION = "daily_focus_session"
    DAILY_ENERGY_LOG = "daily_energy_log"
    DAILY_PROGRESS_UPDATE = "daily_progress_update"
    WEEKLY_GOAL_ACHIEVEMENT = "weekly_goal_achievement"
    WEEKLY_CONSISTENCY = "weekly_consistency"
    LEARNING_STREAK = "learning_streak"
    QUALITY_STREAK = "quality_streak"


class StreakStatus(str, Enum):
    """Status of a streak."""

    ACTIVE = "active"
    BROKEN = "broken"
    PROTECTED = "protected"  # Has streak shield
    RECOVERING = "recovering"  # In recovery period


@dataclass
class StreakData:
    """Data structure for tracking streak information."""

    streak_type: StreakType
    user_id: int
    current_count: int
    best_count: int
    status: StreakStatus
    last_activity_date: date
    started_date: date
    streak_shields: int = 0
    recovery_expires: datetime | None = None
    created_at: datetime = None
    updated_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()


class StreakRequirement(BaseModel):
    """Requirements for maintaining a specific streak type."""

    streak_type: StreakType
    minimum_actions: int = Field(default=1, description="Minimum actions required per period")
    grace_period_hours: int = Field(default=24, description="Grace period before streak breaks")
    reset_time_hour: int = Field(default=0, description="Hour of day when streak resets (0-23)")
    description: str = Field(..., description="Human-readable description of the streak")


class StreakManager:
    """
    Core streak management system.

    Tracks multiple types of productivity streaks, manages streak shields,
    and provides recovery mechanisms for broken streaks.
    """

    def __init__(self):
        """Initialize the streak manager."""
        self.streaks: dict[tuple[int, StreakType], StreakData] = {}
        self.streak_requirements = self._initialize_streak_requirements()

    def _initialize_streak_requirements(self) -> dict[StreakType, StreakRequirement]:
        """Initialize default streak requirements."""
        return {
            StreakType.DAILY_TASK_COMPLETION: StreakRequirement(
                streak_type=StreakType.DAILY_TASK_COMPLETION,
                minimum_actions=1,
                grace_period_hours=24,
                reset_time_hour=0,
                description="Complete at least one task every day",
            ),
            StreakType.DAILY_FOCUS_SESSION: StreakRequirement(
                streak_type=StreakType.DAILY_FOCUS_SESSION,
                minimum_actions=1,
                grace_period_hours=24,
                reset_time_hour=0,
                description="Complete at least one focus session every day",
            ),
            StreakType.DAILY_ENERGY_LOG: StreakRequirement(
                streak_type=StreakType.DAILY_ENERGY_LOG,
                minimum_actions=1,
                grace_period_hours=24,
                reset_time_hour=0,
                description="Log your energy level at least once every day",
            ),
            StreakType.DAILY_PROGRESS_UPDATE: StreakRequirement(
                streak_type=StreakType.DAILY_PROGRESS_UPDATE,
                minimum_actions=1,
                grace_period_hours=24,
                reset_time_hour=0,
                description="Update your progress at least once every day",
            ),
            StreakType.WEEKLY_GOAL_ACHIEVEMENT: StreakRequirement(
                streak_type=StreakType.WEEKLY_GOAL_ACHIEVEMENT,
                minimum_actions=3,
                grace_period_hours=168,  # 7 days
                reset_time_hour=0,
                description="Achieve at least 3 goals every week",
            ),
            StreakType.WEEKLY_CONSISTENCY: StreakRequirement(
                streak_type=StreakType.WEEKLY_CONSISTENCY,
                minimum_actions=5,
                grace_period_hours=168,  # 7 days
                reset_time_hour=0,
                description="Be active at least 5 days every week",
            ),
        }

    def record_activity(
        self, user_id: int, streak_type: StreakType, activity_date: date | None = None
    ) -> StreakData:
        """
        Record an activity that counts toward a streak.

        Args:
            user_id: User performing the activity
            streak_type: Type of streak to update
            activity_date: Date of activity (defaults to today)

        Returns:
            Updated streak data
        """
        if activity_date is None:
            activity_date = date.today()

        streak_key = (user_id, streak_type)
        streak = self.streaks.get(streak_key)

        if streak is None:
            # Create new streak
            streak = StreakData(
                streak_type=streak_type,
                user_id=user_id,
                current_count=1,
                best_count=1,
                status=StreakStatus.ACTIVE,
                last_activity_date=activity_date,
                started_date=activity_date,
            )
        else:
            # Update existing streak
            streak = self._update_streak(streak, activity_date)

        self.streaks[streak_key] = streak
        return streak

    def _update_streak(self, streak: StreakData, activity_date: date) -> StreakData:
        """
        Update an existing streak with new activity.

        Args:
            streak: Current streak data
            activity_date: Date of new activity

        Returns:
            Updated streak data
        """
        days_since_last = (activity_date - streak.last_activity_date).days

        if days_since_last == 0:
            # Activity on same day - no change to count
            pass
        elif days_since_last == 1:
            # Consecutive day - extend streak
            streak.current_count += 1
            streak.best_count = max(streak.best_count, streak.current_count)
            streak.status = StreakStatus.ACTIVE
        else:
            # Gap in streak - check if protected by shield
            if streak.streak_shields > 0 and days_since_last <= 3:
                # Use streak shield
                streak.streak_shields -= 1
                streak.status = StreakStatus.PROTECTED
            else:
                # Streak broken - restart
                streak.current_count = 1
                streak.status = StreakStatus.BROKEN
                streak.started_date = activity_date

        streak.last_activity_date = activity_date
        streak.updated_at = datetime.now()
        return streak

    def check_streak_status(self, user_id: int, streak_type: StreakType) -> StreakData:
        """
        Check current status of a streak, accounting for grace periods.

        Args:
            user_id: User ID
            streak_type: Type of streak to check

        Returns:
            Current streak data with updated status
        """
        streak_key = (user_id, streak_type)
        streak = self.streaks.get(streak_key)

        if streak is None:
            # No streak exists - create inactive one
            return StreakData(
                streak_type=streak_type,
                user_id=user_id,
                current_count=0,
                best_count=0,
                status=StreakStatus.BROKEN,
                last_activity_date=date.today(),
                started_date=date.today(),
            )

        # Check if streak should be broken due to inactivity
        requirement = self.streak_requirements.get(streak_type)
        if requirement:
            hours_since_last = (
                datetime.now() - datetime.combine(streak.last_activity_date, datetime.min.time())
            ).total_seconds() / 3600

            if hours_since_last > requirement.grace_period_hours:
                if streak.streak_shields > 0:
                    # Protected by shield
                    streak.status = StreakStatus.PROTECTED
                else:
                    # Streak broken
                    streak.status = StreakStatus.BROKEN
                    streak.current_count = 0

        return streak

    def add_streak_shield(self, user_id: int, streak_type: StreakType, shields: int = 1):
        """
        Add streak shields to protect against breaking.

        Args:
            user_id: User ID
            streak_type: Type of streak to protect
            shields: Number of shields to add
        """
        streak_key = (user_id, streak_type)
        streak = self.streaks.get(streak_key)

        if streak is None:
            # No streak to protect
            return

        streak.streak_shields += shields
        streak.updated_at = datetime.now()

    def get_user_streaks(self, user_id: int) -> list[StreakData]:
        """
        Get all streaks for a user.

        Args:
            user_id: User ID

        Returns:
            List of all streak data for the user
        """
        user_streaks = []
        for (uid, streak_type), streak in self.streaks.items():
            if uid == user_id:
                # Update status before returning
                updated_streak = self.check_streak_status(user_id, streak_type)
                user_streaks.append(updated_streak)

        return user_streaks

    def get_streak_leaderboard(
        self, streak_type: StreakType, limit: int = 10
    ) -> list[tuple[int, int]]:
        """
        Get leaderboard for a specific streak type.

        Args:
            streak_type: Type of streak for leaderboard
            limit: Maximum number of entries to return

        Returns:
            List of (user_id, streak_count) tuples sorted by streak count
        """
        streak_counts = []

        for (user_id, st), streak in self.streaks.items():
            if st == streak_type and streak.status == StreakStatus.ACTIVE:
                streak_counts.append((user_id, streak.current_count))

        # Sort by streak count (descending)
        streak_counts.sort(key=lambda x: x[1], reverse=True)

        return streak_counts[:limit]

    def get_streak_statistics(self, user_id: int) -> dict[str, any]:
        """
        Get comprehensive streak statistics for a user.

        Args:
            user_id: User ID

        Returns:
            Dictionary with streak statistics
        """
        user_streaks = self.get_user_streaks(user_id)

        stats = {
            "total_active_streaks": 0,
            "longest_current_streak": 0,
            "longest_ever_streak": 0,
            "total_streak_shields": 0,
            "streak_breakdown": {},
        }

        for streak in user_streaks:
            if streak.status == StreakStatus.ACTIVE:
                stats["total_active_streaks"] += 1
                stats["longest_current_streak"] = max(
                    stats["longest_current_streak"], streak.current_count
                )

            stats["longest_ever_streak"] = max(stats["longest_ever_streak"], streak.best_count)
            stats["total_streak_shields"] += streak.streak_shields

            stats["streak_breakdown"][streak.streak_type.value] = {
                "current": streak.current_count,
                "best": streak.best_count,
                "status": streak.status.value,
                "shields": streak.streak_shields,
            }

        return stats

    def calculate_streak_multiplier(self, user_id: int, base_multiplier: float = 1.0) -> float:
        """
        Calculate XP multiplier based on active streaks.

        Args:
            user_id: User ID
            base_multiplier: Base multiplier to enhance

        Returns:
            Enhanced multiplier based on streaks
        """
        user_streaks = self.get_user_streaks(user_id)
        bonus_multiplier = 0.0

        for streak in user_streaks:
            if streak.status == StreakStatus.ACTIVE:
                # Add bonus based on streak length
                if streak.current_count >= 30:
                    bonus_multiplier += 0.5  # 50% bonus for 30+ day streaks
                elif streak.current_count >= 14:
                    bonus_multiplier += 0.3  # 30% bonus for 14+ day streaks
                elif streak.current_count >= 7:
                    bonus_multiplier += 0.2  # 20% bonus for 7+ day streaks
                elif streak.current_count >= 3:
                    bonus_multiplier += 0.1  # 10% bonus for 3+ day streaks

        return base_multiplier + bonus_multiplier
