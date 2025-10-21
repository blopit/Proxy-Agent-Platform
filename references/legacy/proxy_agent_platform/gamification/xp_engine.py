"""
XP calculation engine for the gamification system.

Implements dynamic XP scoring based on task complexity, completion time,
quality, and other productivity factors.
"""

from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field


class TaskDifficulty(str, Enum):
    """Task difficulty levels for XP calculation."""

    TRIVIAL = "trivial"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


class TaskPriority(str, Enum):
    """Task priority levels for XP calculation."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class XPActivity(BaseModel):
    """Model for activities that earn XP."""

    activity_type: str = Field(
        ..., description="Type of activity (task_completion, focus_session, etc.)"
    )
    base_xp: int = Field(default=10, ge=0, description="Base XP value for this activity")
    difficulty: TaskDifficulty = Field(default=TaskDifficulty.MEDIUM)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    estimated_duration: int | None = Field(
        default=None, description="Estimated duration in minutes"
    )
    actual_duration: int | None = Field(default=None, description="Actual duration in minutes")
    quality_score: float | None = Field(default=None, ge=0, le=1, description="Quality score 0-1")
    streak_multiplier: float = Field(default=1.0, ge=1.0, description="Streak bonus multiplier")
    created_at: datetime = Field(default_factory=datetime.now)


class XPEngine:
    """
    Core XP calculation engine with dynamic scoring algorithms.

    Calculates XP based on multiple factors:
    - Task difficulty and priority
    - Completion efficiency (actual vs estimated time)
    - Quality of work
    - Current streak bonuses
    - Time-based bonuses (early completion, consistency)
    """

    # Base XP multipliers for different factors
    DIFFICULTY_MULTIPLIERS = {
        TaskDifficulty.TRIVIAL: 0.5,
        TaskDifficulty.EASY: 0.8,
        TaskDifficulty.MEDIUM: 1.0,
        TaskDifficulty.HARD: 1.5,
        TaskDifficulty.EXPERT: 2.0,
    }

    PRIORITY_MULTIPLIERS = {
        TaskPriority.LOW: 0.8,
        TaskPriority.MEDIUM: 1.0,
        TaskPriority.HIGH: 1.3,
        TaskPriority.URGENT: 1.6,
    }

    # Efficiency bonus ranges
    EFFICIENCY_BONUS_MAX = 0.5  # 50% bonus for excellent efficiency
    QUALITY_BONUS_MAX = 0.4  # 40% bonus for high quality

    def __init__(self):
        """Initialize the XP engine."""
        self.minimum_xp = 1
        self.maximum_xp = 1000

    def calculate_xp(self, activity: XPActivity) -> int:
        """
        Calculate total XP for an activity using dynamic scoring.

        Args:
            activity: The activity to calculate XP for

        Returns:
            Total XP earned (integer)
        """
        # Start with base XP
        xp = Decimal(str(activity.base_xp))

        # Apply difficulty multiplier
        xp *= Decimal(str(self.DIFFICULTY_MULTIPLIERS[activity.difficulty]))

        # Apply priority multiplier
        xp *= Decimal(str(self.PRIORITY_MULTIPLIERS[activity.priority]))

        # Apply efficiency bonus
        efficiency_bonus = self._calculate_efficiency_bonus(activity)
        xp *= Decimal("1") + Decimal(str(efficiency_bonus))

        # Apply quality bonus
        quality_bonus = self._calculate_quality_bonus(activity)
        xp *= Decimal("1") + Decimal(str(quality_bonus))

        # Apply streak multiplier
        xp *= Decimal(str(activity.streak_multiplier))

        # Apply time-based bonuses
        time_bonus = self._calculate_time_bonus(activity)
        xp *= Decimal("1") + Decimal(str(time_bonus))

        # Ensure XP is within bounds
        final_xp = max(self.minimum_xp, min(int(xp), self.maximum_xp))

        return final_xp

    def _calculate_efficiency_bonus(self, activity: XPActivity) -> float:
        """
        Calculate efficiency bonus based on actual vs estimated time.

        Args:
            activity: Activity with timing data

        Returns:
            Efficiency bonus (0.0 to EFFICIENCY_BONUS_MAX)
        """
        if not activity.estimated_duration or not activity.actual_duration:
            return 0.0

        # Calculate efficiency ratio (estimated / actual)
        efficiency_ratio = activity.estimated_duration / activity.actual_duration

        if efficiency_ratio <= 1.0:
            # Took longer than expected - no bonus
            return 0.0

        if efficiency_ratio >= 2.0:
            # Completed in half the time or less - maximum bonus
            return self.EFFICIENCY_BONUS_MAX

        # Linear scaling between 1.0 and 2.0 efficiency ratio
        bonus_ratio = (efficiency_ratio - 1.0) / 1.0
        return bonus_ratio * self.EFFICIENCY_BONUS_MAX

    def _calculate_quality_bonus(self, activity: XPActivity) -> float:
        """
        Calculate quality bonus based on work quality score.

        Args:
            activity: Activity with quality data

        Returns:
            Quality bonus (0.0 to QUALITY_BONUS_MAX)
        """
        if activity.quality_score is None:
            return 0.0

        # Quality score should be 0-1, apply maximum bonus proportionally
        return activity.quality_score * self.QUALITY_BONUS_MAX

    def _calculate_time_bonus(self, activity: XPActivity) -> float:
        """
        Calculate time-based bonuses (early completion, consistency, etc.).

        Args:
            activity: Activity with timing data

        Returns:
            Time bonus (0.0 to 0.2)
        """
        bonus = 0.0
        now = datetime.now()

        # Early completion bonus (completed today)
        if activity.created_at.date() == now.date():
            bonus += 0.1  # 10% bonus for same-day completion

        # Consistency bonus (completed within 24 hours)
        if now - activity.created_at <= timedelta(hours=24):
            bonus += 0.1  # 10% bonus for quick completion

        return min(bonus, 0.2)  # Cap at 20% time bonus

    def get_xp_breakdown(self, activity: XPActivity) -> dict[str, float]:
        """
        Get detailed breakdown of XP calculation for transparency.

        Args:
            activity: Activity to analyze

        Returns:
            Dictionary with breakdown of all XP factors
        """
        base_xp = float(activity.base_xp)

        breakdown = {
            "base_xp": base_xp,
            "difficulty_multiplier": self.DIFFICULTY_MULTIPLIERS[activity.difficulty],
            "priority_multiplier": self.PRIORITY_MULTIPLIERS[activity.priority],
            "efficiency_bonus": self._calculate_efficiency_bonus(activity),
            "quality_bonus": self._calculate_quality_bonus(activity),
            "streak_multiplier": activity.streak_multiplier,
            "time_bonus": self._calculate_time_bonus(activity),
            "final_xp": self.calculate_xp(activity),
        }

        return breakdown

    def get_activity_types(self) -> dict[str, int]:
        """
        Get predefined activity types and their base XP values.

        Returns:
            Dictionary mapping activity types to base XP
        """
        return {
            "task_completion": 20,
            "focus_session_30min": 15,
            "focus_session_60min": 25,
            "focus_session_90min": 40,
            "energy_log": 5,
            "progress_update": 10,
            "goal_achievement": 50,
            "streak_milestone": 30,
            "quality_feedback": 10,
            "skill_improvement": 25,
            "creative_breakthrough": 35,
            "problem_solving": 30,
            "collaboration": 20,
            "learning_session": 15,
            "reflection_journal": 10,
        }
