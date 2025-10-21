"""
Leaderboard system for competitive gamification.

Provides real-time leaderboards across multiple dimensions including XP,
streaks, achievements, and productivity metrics with privacy controls.
"""

from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class LeaderboardType(str, Enum):
    """Types of leaderboards available."""

    TOTAL_XP = "total_xp"
    WEEKLY_XP = "weekly_xp"
    MONTHLY_XP = "monthly_xp"
    TASK_COMPLETION_COUNT = "task_completion_count"
    FOCUS_TIME = "focus_time"
    CURRENT_STREAKS = "current_streaks"
    ACHIEVEMENT_COUNT = "achievement_count"
    CONSISTENCY_SCORE = "consistency_score"
    QUALITY_SCORE = "quality_score"


class LeaderboardScope(str, Enum):
    """Scope of leaderboard competition."""

    GLOBAL = "global"
    TEAM = "team"
    FRIENDS = "friends"
    ORGANIZATION = "organization"


@dataclass
class LeaderboardEntry:
    """Single entry in a leaderboard."""

    user_id: int
    username: str
    score: float
    rank: int
    change_from_previous: int | None = None
    metadata: dict[str, Any] = None
    last_updated: datetime = None

    def __post_init__(self):
        if self.last_updated is None:
            self.last_updated = datetime.now()
        if self.metadata is None:
            self.metadata = {}


class LeaderboardConfig(BaseModel):
    """Configuration for a leaderboard."""

    leaderboard_type: LeaderboardType
    scope: LeaderboardScope
    time_window_days: int | None = Field(
        default=None, description="Time window for scoring (None for all-time)"
    )
    max_entries: int = Field(default=100, ge=1, le=1000)
    update_frequency_minutes: int = Field(default=5, ge=1)
    include_anonymous: bool = Field(default=False)
    min_activity_threshold: int | None = Field(
        default=None, description="Minimum activities required to appear on leaderboard"
    )


class Leaderboard:
    """
    Real-time leaderboard system with multiple scoring dimensions.

    Supports various leaderboard types, time windows, and privacy controls
    for competitive motivation across productivity metrics.
    """

    def __init__(self):
        """Initialize the leaderboard system."""
        self.leaderboards: dict[str, list[LeaderboardEntry]] = {}
        self.configs: dict[str, LeaderboardConfig] = {}
        self.last_updates: dict[str, datetime] = {}
        self.user_scores: dict[str, dict[int, float]] = defaultdict(dict)
        self._initialize_default_leaderboards()

    def _initialize_default_leaderboards(self):
        """Initialize default leaderboard configurations."""
        default_configs = [
            LeaderboardConfig(
                leaderboard_type=LeaderboardType.TOTAL_XP,
                scope=LeaderboardScope.GLOBAL,
                max_entries=50,
            ),
            LeaderboardConfig(
                leaderboard_type=LeaderboardType.WEEKLY_XP,
                scope=LeaderboardScope.GLOBAL,
                time_window_days=7,
                max_entries=25,
            ),
            LeaderboardConfig(
                leaderboard_type=LeaderboardType.MONTHLY_XP,
                scope=LeaderboardScope.GLOBAL,
                time_window_days=30,
                max_entries=25,
            ),
            LeaderboardConfig(
                leaderboard_type=LeaderboardType.CURRENT_STREAKS,
                scope=LeaderboardScope.GLOBAL,
                max_entries=20,
            ),
            LeaderboardConfig(
                leaderboard_type=LeaderboardType.TASK_COMPLETION_COUNT,
                scope=LeaderboardScope.GLOBAL,
                time_window_days=7,
                max_entries=25,
                min_activity_threshold=3,
            ),
        ]

        for config in default_configs:
            leaderboard_id = self._generate_leaderboard_id(config.leaderboard_type, config.scope)
            self.configs[leaderboard_id] = config
            self.leaderboards[leaderboard_id] = []

    def _generate_leaderboard_id(
        self, leaderboard_type: LeaderboardType, scope: LeaderboardScope
    ) -> str:
        """Generate unique ID for a leaderboard."""
        return f"{leaderboard_type.value}_{scope.value}"

    def update_user_score(
        self,
        user_id: int,
        leaderboard_type: LeaderboardType,
        score: float,
        username: str = "Anonymous",
        metadata: dict[str, Any] | None = None,
    ):
        """
        Update a user's score for a specific leaderboard type.

        Args:
            user_id: User ID
            leaderboard_type: Type of leaderboard to update
            score: New score value
            username: Display username
            metadata: Additional metadata about the score
        """
        leaderboard_id = self._generate_leaderboard_id(leaderboard_type, LeaderboardScope.GLOBAL)

        # Update score tracking
        self.user_scores[leaderboard_id][user_id] = score

        # Mark for refresh if enough time has passed
        config = self.configs.get(leaderboard_id)
        if config:
            last_update = self.last_updates.get(leaderboard_id)
            if (
                not last_update
                or (datetime.now() - last_update).total_seconds()
                >= config.update_frequency_minutes * 60
            ):
                self._refresh_leaderboard(leaderboard_id, username_map={user_id: username})

    def _refresh_leaderboard(self, leaderboard_id: str, username_map: dict[int, str] | None = None):
        """
        Refresh a specific leaderboard with current scores.

        Args:
            leaderboard_id: ID of leaderboard to refresh
            username_map: Optional mapping of user IDs to usernames
        """
        config = self.configs.get(leaderboard_id)
        if not config:
            return

        # Get current scores for this leaderboard
        scores = self.user_scores.get(leaderboard_id, {})

        # Apply filters
        filtered_scores = self._apply_leaderboard_filters(scores, config)

        # Sort by score (descending)
        sorted_scores = sorted(filtered_scores.items(), key=lambda x: x[1], reverse=True)

        # Create leaderboard entries
        previous_leaderboard = {
            entry.user_id: entry.rank for entry in self.leaderboards.get(leaderboard_id, [])
        }

        new_entries = []
        for rank, (user_id, score) in enumerate(sorted_scores[: config.max_entries], 1):
            username = "Anonymous"
            if username_map and user_id in username_map:
                username = username_map[user_id]

            previous_rank = previous_leaderboard.get(user_id)
            change = None
            if previous_rank is not None:
                change = previous_rank - rank  # Positive = moved up

            entry = LeaderboardEntry(
                user_id=user_id,
                username=username,
                score=score,
                rank=rank,
                change_from_previous=change,
                metadata=self._get_score_metadata(config.leaderboard_type, user_id),
            )
            new_entries.append(entry)

        self.leaderboards[leaderboard_id] = new_entries
        self.last_updates[leaderboard_id] = datetime.now()

    def _apply_leaderboard_filters(
        self, scores: dict[int, float], config: LeaderboardConfig
    ) -> dict[int, float]:
        """Apply filters to scores based on leaderboard configuration."""
        filtered_scores = scores.copy()

        # Apply minimum activity threshold
        if config.min_activity_threshold:
            filtered_scores = {
                user_id: score
                for user_id, score in filtered_scores.items()
                if score >= config.min_activity_threshold
            }

        # Apply time window filtering (would need additional data in real implementation)
        if config.time_window_days:
            # In a real implementation, this would filter based on actual timestamps
            pass

        return filtered_scores

    def _get_score_metadata(
        self, leaderboard_type: LeaderboardType, user_id: int
    ) -> dict[str, Any]:
        """Get additional metadata for a score entry."""
        # In a real implementation, this would fetch additional context
        return {"last_activity": datetime.now().isoformat(), "score_type": leaderboard_type.value}

    def get_leaderboard(
        self,
        leaderboard_type: LeaderboardType,
        scope: LeaderboardScope = LeaderboardScope.GLOBAL,
        limit: int | None = None,
    ) -> list[LeaderboardEntry]:
        """
        Get current leaderboard entries.

        Args:
            leaderboard_type: Type of leaderboard
            scope: Scope of competition
            limit: Maximum number of entries to return

        Returns:
            List of leaderboard entries sorted by rank
        """
        leaderboard_id = self._generate_leaderboard_id(leaderboard_type, scope)
        entries = self.leaderboards.get(leaderboard_id, [])

        if limit:
            entries = entries[:limit]

        return entries

    def get_user_rank(
        self,
        user_id: int,
        leaderboard_type: LeaderboardType,
        scope: LeaderboardScope = LeaderboardScope.GLOBAL,
    ) -> LeaderboardEntry | None:
        """
        Get a specific user's rank in a leaderboard.

        Args:
            user_id: User ID to look up
            leaderboard_type: Type of leaderboard
            scope: Scope of competition

        Returns:
            User's leaderboard entry or None if not found
        """
        entries = self.get_leaderboard(leaderboard_type, scope)

        for entry in entries:
            if entry.user_id == user_id:
                return entry

        return None

    def get_leaderboard_around_user(
        self,
        user_id: int,
        leaderboard_type: LeaderboardType,
        scope: LeaderboardScope = LeaderboardScope.GLOBAL,
        context_size: int = 5,
    ) -> list[LeaderboardEntry]:
        """
        Get leaderboard entries around a specific user's position.

        Args:
            user_id: User ID to center around
            leaderboard_type: Type of leaderboard
            scope: Scope of competition
            context_size: Number of entries above and below user

        Returns:
            List of leaderboard entries around the user
        """
        entries = self.get_leaderboard(leaderboard_type, scope)

        # Find user's position
        user_position = None
        for i, entry in enumerate(entries):
            if entry.user_id == user_id:
                user_position = i
                break

        if user_position is None:
            return []

        # Get context around user
        start_idx = max(0, user_position - context_size)
        end_idx = min(len(entries), user_position + context_size + 1)

        return entries[start_idx:end_idx]

    def get_available_leaderboards(self) -> list[dict[str, Any]]:
        """
        Get list of all available leaderboards.

        Returns:
            List of leaderboard information
        """
        leaderboards = []
        for leaderboard_id, config in self.configs.items():
            entry_count = len(self.leaderboards.get(leaderboard_id, []))
            last_update = self.last_updates.get(leaderboard_id)

            leaderboards.append(
                {
                    "id": leaderboard_id,
                    "type": config.leaderboard_type.value,
                    "scope": config.scope.value,
                    "time_window_days": config.time_window_days,
                    "entry_count": entry_count,
                    "last_updated": last_update.isoformat() if last_update else None,
                    "max_entries": config.max_entries,
                }
            )

        return leaderboards

    def simulate_leaderboard_data(self):
        """Simulate some leaderboard data for testing."""
        # Simulate XP leaderboard
        xp_scores = {
            1: 5420,
            2: 4850,
            3: 4200,
            4: 3800,
            5: 3500,
            6: 3200,
            7: 2900,
            8: 2600,
            9: 2300,
            10: 2000,
        }

        for user_id, score in xp_scores.items():
            self.update_user_score(
                user_id=user_id,
                leaderboard_type=LeaderboardType.TOTAL_XP,
                score=score,
                username=f"User{user_id}",
            )

        # Simulate weekly XP
        weekly_scores = {
            3: 850,
            1: 720,
            5: 680,
            2: 650,
            8: 590,
            4: 520,
            10: 480,
            7: 420,
            6: 380,
            9: 340,
        }

        for user_id, score in weekly_scores.items():
            self.update_user_score(
                user_id=user_id,
                leaderboard_type=LeaderboardType.WEEKLY_XP,
                score=score,
                username=f"User{user_id}",
            )

        # Simulate streak leaderboard
        streak_scores = {7: 45, 2: 38, 5: 32, 1: 28, 9: 25, 3: 22, 10: 18, 4: 15, 6: 12, 8: 8}

        for user_id, score in streak_scores.items():
            self.update_user_score(
                user_id=user_id,
                leaderboard_type=LeaderboardType.CURRENT_STREAKS,
                score=score,
                username=f"User{user_id}",
            )


class LeaderboardManager:
    """High-level manager for leaderboard operations."""

    def __init__(self):
        """Initialize the leaderboard manager."""
        self.leaderboard = Leaderboard()

    def update_from_xp_event(
        self, user_id: int, xp_earned: int, total_xp: int, username: str = "Anonymous"
    ):
        """Update leaderboards based on XP events."""
        # Update total XP leaderboard
        self.leaderboard.update_user_score(
            user_id=user_id,
            leaderboard_type=LeaderboardType.TOTAL_XP,
            score=total_xp,
            username=username,
        )

        # Update weekly XP (would need proper time tracking in real implementation)
        self.leaderboard.update_user_score(
            user_id=user_id,
            leaderboard_type=LeaderboardType.WEEKLY_XP,
            score=xp_earned,  # Simplified - would accumulate weekly total
            username=username,
        )

    def update_from_streak_event(
        self, user_id: int, streak_count: int, streak_type: str, username: str = "Anonymous"
    ):
        """Update leaderboards based on streak events."""
        self.leaderboard.update_user_score(
            user_id=user_id,
            leaderboard_type=LeaderboardType.CURRENT_STREAKS,
            score=streak_count,
            username=username,
            metadata={"streak_type": streak_type},
        )

    def update_from_task_completion(
        self, user_id: int, task_count: int, username: str = "Anonymous"
    ):
        """Update leaderboards based on task completion."""
        self.leaderboard.update_user_score(
            user_id=user_id,
            leaderboard_type=LeaderboardType.TASK_COMPLETION_COUNT,
            score=task_count,
            username=username,
        )

    def get_user_leaderboard_summary(self, user_id: int) -> dict[str, Any]:
        """Get comprehensive leaderboard summary for a user."""
        summary = {"user_id": user_id, "rankings": {}, "trending": {}}

        # Check all leaderboard types
        for lb_type in LeaderboardType:
            entry = self.leaderboard.get_user_rank(user_id, lb_type)
            if entry:
                summary["rankings"][lb_type.value] = {
                    "rank": entry.rank,
                    "score": entry.score,
                    "change": entry.change_from_previous,
                    "last_updated": entry.last_updated.isoformat(),
                }

                # Determine trending direction
                if entry.change_from_previous:
                    if entry.change_from_previous > 0:
                        summary["trending"][lb_type.value] = "up"
                    elif entry.change_from_previous < 0:
                        summary["trending"][lb_type.value] = "down"
                    else:
                        summary["trending"][lb_type.value] = "stable"

        return summary
