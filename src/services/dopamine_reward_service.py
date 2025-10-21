"""
Dopamine Reward Service - Variable reward system designed for habit formation.

Implements slot-machine psychology, variable ratio rewards, and unpredictable
bonuses to create addictive (in a good way) task completion loops.

Based on HABIT.md principles of evolutionary psychology and dopamine engineering.
"""

import logging
import random
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class RewardTier(Enum):
    """Reward tier levels for visual/audio feedback"""

    NORMAL = "normal"  # 1x multiplier
    GOOD = "good"  # 2x multiplier
    GREAT = "great"  # 3x multiplier
    AMAZING = "amazing"  # 4x multiplier
    LEGENDARY = "legendary"  # 5x multiplier
    CRITICAL_HIT = "critical_hit"  # 10x multiplier (rare!)


@dataclass
class RewardResult:
    """Result of a reward calculation"""

    base_xp: int
    multiplier: float
    total_xp: int
    tier: RewardTier
    bonus_reason: str
    celebration_type: str
    sound_effect: str
    streak_bonus: int
    mystery_unlocked: bool
    mystery_content: dict[str, Any] | None = None


class DopamineRewardService:
    """Service for calculating variable rewards using dopamine engineering"""

    def __init__(self):
        """Initialize dopamine reward service"""
        # Base configuration
        self.base_task_xp = 25
        self.base_microstep_xp = 5

        # Multiplier probabilities (variable ratio schedule)
        self.multiplier_chances = {
            1.0: 0.50,  # 50% chance of 1x (normal)
            2.0: 0.25,  # 25% chance of 2x (good)
            3.0: 0.15,  # 15% chance of 3x (great)
            4.0: 0.07,  # 7% chance of 4x (amazing)
            5.0: 0.025,  # 2.5% chance of 5x (legendary)
            10.0: 0.005,  # 0.5% chance of 10x (critical hit!)
        }

        # Tier mappings for visual feedback
        self.tier_map = {
            1.0: RewardTier.NORMAL,
            2.0: RewardTier.GOOD,
            3.0: RewardTier.GREAT,
            4.0: RewardTier.AMAZING,
            5.0: RewardTier.LEGENDARY,
            10.0: RewardTier.CRITICAL_HIT,
        }

        # Celebration types by tier
        self.celebration_map = {
            RewardTier.NORMAL: "checkmark",
            RewardTier.GOOD: "small_confetti",
            RewardTier.GREAT: "confetti",
            RewardTier.AMAZING: "fireworks",
            RewardTier.LEGENDARY: "epic_explosion",
            RewardTier.CRITICAL_HIT: "screen_takeover",
        }

        # Sound effects by tier
        self.sound_map = {
            RewardTier.NORMAL: "ding",
            RewardTier.GOOD: "chime",
            RewardTier.GREAT: "fanfare",
            RewardTier.AMAZING: "triumph",
            RewardTier.LEGENDARY: "epic",
            RewardTier.CRITICAL_HIT: "legendary",
        }

        # Streak bonuses
        self.streak_multipliers = {
            3: 1.1,  # 10% bonus at 3-day streak
            7: 1.25,  # 25% bonus at 7-day streak
            14: 1.5,  # 50% bonus at 14-day streak
            30: 2.0,  # 100% bonus at 30-day streak
            100: 3.0,  # 200% bonus at 100-day streak
        }

        # Mystery box unlock chances
        self.mystery_unlock_chance = 0.15  # 15% chance per task

    def calculate_task_reward(
        self,
        user_id: str,
        task_priority: str = "medium",
        streak_days: int = 0,
        power_hour_active: bool = False,
        energy_level: int = 50,
    ) -> RewardResult:
        """
        Calculate reward for completing a task using variable ratio schedule.

        Args:
            user_id: User identifier
            task_priority: Task priority (low/medium/high)
            streak_days: Current streak in days
            power_hour_active: Whether power hour bonus is active
            energy_level: Current user energy level (0-100)

        Returns:
            RewardResult with XP, multiplier, and celebration details
        """
        # Base XP by priority
        base_xp = self._get_base_xp(task_priority)

        # Random multiplier (slot machine effect)
        multiplier = self._get_random_multiplier()

        # Apply streak bonus
        streak_bonus, streak_multiplier = self._calculate_streak_bonus(streak_days)

        # Apply power hour bonus
        if power_hour_active:
            multiplier *= 2.0
            bonus_reason = "POWER HOUR ACTIVE! 2x multiplier"
        else:
            bonus_reason = self._get_bonus_reason(multiplier)

        # Apply energy bonus (reward working when tired)
        if energy_level < 30:
            multiplier *= 1.5
            bonus_reason += " + Low Energy Bonus (1.5x)!"

        # Calculate final XP
        total_multiplier = multiplier * streak_multiplier
        total_xp = int(base_xp * total_multiplier) + streak_bonus

        # Determine celebration tier
        tier = self._get_reward_tier(multiplier)

        # Check for mystery unlock
        mystery_unlocked = random.random() < self.mystery_unlock_chance
        mystery_content = None
        if mystery_unlocked:
            mystery_content = self._generate_mystery_reward()

        return RewardResult(
            base_xp=base_xp,
            multiplier=total_multiplier,
            total_xp=total_xp,
            tier=tier,
            bonus_reason=bonus_reason,
            celebration_type=self.celebration_map[tier],
            sound_effect=self.sound_map[tier],
            streak_bonus=streak_bonus,
            mystery_unlocked=mystery_unlocked,
            mystery_content=mystery_content,
        )

    def calculate_microstep_reward(
        self, user_id: str, streak_days: int = 0
    ) -> RewardResult:
        """
        Calculate reward for completing a micro-step (2-5 min task).

        Micro-steps have smaller XP but faster dopamine hits.
        """
        base_xp = self.base_microstep_xp

        # Lighter multiplier distribution for micro-steps
        if random.random() < 0.7:
            multiplier = 1.0
        elif random.random() < 0.9:
            multiplier = 2.0
        else:
            multiplier = 3.0

        streak_bonus, streak_multiplier = self._calculate_streak_bonus(streak_days)

        total_xp = int(base_xp * multiplier * streak_multiplier) + streak_bonus

        tier = self._get_reward_tier(multiplier)

        return RewardResult(
            base_xp=base_xp,
            multiplier=multiplier * streak_multiplier,
            total_xp=total_xp,
            tier=tier,
            bonus_reason=f"Micro-step complete! {multiplier}x",
            celebration_type=self.celebration_map[tier],
            sound_effect=self.sound_map[tier],
            streak_bonus=streak_bonus,
            mystery_unlocked=False,
        )

    def calculate_streak_completion_reward(self, streak_days: int) -> RewardResult:
        """
        Calculate reward for maintaining a streak (daily bonus).

        Daily check-in rewards to encourage habit formation.
        """
        base_xp = 10

        # Increasing rewards for longer streaks
        if streak_days >= 100:
            multiplier = 10.0
            bonus_reason = "100+ DAY STREAK! LEGENDARY!"
        elif streak_days >= 30:
            multiplier = 5.0
            bonus_reason = "30+ DAY STREAK! AMAZING!"
        elif streak_days >= 14:
            multiplier = 3.0
            bonus_reason = "2 WEEK STREAK! Keep it up!"
        elif streak_days >= 7:
            multiplier = 2.0
            bonus_reason = "WEEK STREAK! You're on fire!"
        elif streak_days >= 3:
            multiplier = 1.5
            bonus_reason = "3-day streak! Building momentum!"
        else:
            multiplier = 1.0
            bonus_reason = "Daily check-in!"

        total_xp = int(base_xp * multiplier)

        tier = self._get_reward_tier(multiplier)

        return RewardResult(
            base_xp=base_xp,
            multiplier=multiplier,
            total_xp=total_xp,
            tier=tier,
            bonus_reason=bonus_reason,
            celebration_type=self.celebration_map[tier],
            sound_effect=self.sound_map[tier],
            streak_bonus=0,
            mystery_unlocked=streak_days % 7 == 0,  # Mystery every 7 days
            mystery_content=(
                self._generate_mystery_reward() if streak_days % 7 == 0 else None
            ),
        )

    def open_mystery_box(self, user_id: str, user_level: int = 1) -> dict[str, Any]:
        """
        Open a mystery box for random rewards.

        Returns:
            Dictionary with reward details
        """
        mystery = self._generate_mystery_reward(user_level)

        return {
            "reward_type": mystery["type"],
            "content": mystery["content"],
            "xp_bonus": mystery.get("xp_bonus", 0),
            "celebration_type": "mystery_box_open",
            "sound_effect": "mystery_reveal",
            "message": mystery["message"],
        }

    # Helper methods

    def _get_base_xp(self, priority: str) -> int:
        """Get base XP by task priority"""
        priority_xp = {"low": 15, "medium": 25, "high": 40, "urgent": 60}
        return priority_xp.get(priority.lower(), 25)

    def _get_random_multiplier(self) -> float:
        """Get random multiplier using weighted probabilities (slot machine)"""
        rand = random.random()
        cumulative = 0.0

        for multiplier, probability in self.multiplier_chances.items():
            cumulative += probability
            if rand < cumulative:
                return multiplier

        return 1.0  # Fallback

    def _calculate_streak_bonus(self, streak_days: int) -> tuple[int, float]:
        """Calculate streak bonus XP and multiplier"""
        bonus_xp = 0
        multiplier = 1.0

        # Find highest applicable streak bonus
        for days, mult in sorted(self.streak_multipliers.items(), reverse=True):
            if streak_days >= days:
                multiplier = mult
                bonus_xp = days * 2  # Extra XP for long streaks
                break

        return bonus_xp, multiplier

    def _get_reward_tier(self, multiplier: float) -> RewardTier:
        """Get reward tier from multiplier"""
        return self.tier_map.get(multiplier, RewardTier.NORMAL)

    def _get_bonus_reason(self, multiplier: float) -> str:
        """Get bonus reason message"""
        reasons = {
            1.0: "Task complete!",
            2.0: "Good work! 2x bonus",
            3.0: "Great job! 3x bonus",
            4.0: "Amazing! 4x bonus",
            5.0: "LEGENDARY! 5x bonus",
            10.0: "🔥 CRITICAL HIT! 10x BONUS 🔥",
        }
        return reasons.get(multiplier, "Task complete!")

    def _generate_mystery_reward(self, user_level: int = 1) -> dict[str, Any]:
        """Generate random mystery box reward"""
        reward_types = [
            {
                "type": "xp_bonus",
                "content": {"amount": random.randint(50, 200)},
                "xp_bonus": random.randint(50, 200),
                "message": f"Bonus XP! +{random.randint(50, 200)}",
            },
            {
                "type": "badge",
                "content": {"badge_name": random.choice(
                    ["Early Bird", "Night Owl", "Consistency King", "Speed Demon"]
                )},
                "xp_bonus": 25,
                "message": "New badge unlocked!",
            },
            {
                "type": "theme_unlock",
                "content": {"theme": random.choice(
                    ["Dark Galaxy", "Ocean Breeze", "Forest Zen", "Sunset Vibes"]
                )},
                "xp_bonus": 10,
                "message": "New theme unlocked!",
            },
            {
                "type": "power_hour",
                "content": {"duration_minutes": 60},
                "xp_bonus": 0,
                "message": "1 Hour of 2x XP activated!",
            },
            {
                "type": "double_streak_protection",
                "content": {"days_protected": 1},
                "xp_bonus": 0,
                "message": "Streak protection! Won't lose streak tomorrow",
            },
        ]

        return random.choice(reward_types)

    def get_current_session_multiplier(
        self, tasks_completed_today: int, time_of_day: str = "morning"
    ) -> dict[str, Any]:
        """
        Get current session multiplier based on user patterns.

        Used for display in UI to show "hot streak" status.
        """
        base_multiplier = 1.0

        # Bonus for completing multiple tasks in a session
        if tasks_completed_today >= 10:
            base_multiplier = 2.0
            status = "ON FIRE! 🔥"
        elif tasks_completed_today >= 5:
            base_multiplier = 1.5
            status = "Hot Streak!"
        elif tasks_completed_today >= 3:
            base_multiplier = 1.2
            status = "Building momentum..."
        else:
            status = "Getting started"

        # Time-based bonuses
        time_bonus = 1.0
        if time_of_day == "early_morning":  # Before 7am
            time_bonus = 1.3
            time_message = "Early Bird Bonus! +30%"
        elif time_of_day == "late_night":  # After 10pm
            time_bonus = 1.2
            time_message = "Night Owl Bonus! +20%"
        else:
            time_message = ""

        total_multiplier = base_multiplier * time_bonus

        return {
            "multiplier": total_multiplier,
            "status": status,
            "time_bonus": time_bonus,
            "time_message": time_message,
            "tasks_today": tasks_completed_today,
            "next_threshold": self._get_next_threshold(tasks_completed_today),
        }

    def _get_next_threshold(self, tasks_completed: int) -> dict[str, Any]:
        """Get next multiplier threshold"""
        thresholds = [(3, 1.2), (5, 1.5), (10, 2.0)]

        for count, multiplier in thresholds:
            if tasks_completed < count:
                return {
                    "tasks_needed": count - tasks_completed,
                    "multiplier": multiplier,
                    "message": f"{count - tasks_completed} more for {multiplier}x!",
                }

        return {"tasks_needed": 0, "multiplier": 2.0, "message": "Max bonus!"}
