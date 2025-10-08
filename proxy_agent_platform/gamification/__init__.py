"""
Gamification system for the Proxy Agent Platform.

This module provides XP tracking, achievements, streaks, and reward systems
to maintain user motivation and engagement.
"""

from .achievement_engine import AchievementEngine, AchievementTrigger
from .gamification_service import GamificationService
from .leaderboard import Leaderboard, LeaderboardManager, LeaderboardScope, LeaderboardType
from .progress_visualizer import ChartType, ProgressChart, ProgressVisualizer, TimeRange
from .streak_manager import StreakManager, StreakType
from .xp_engine import XPActivity, XPEngine
from .xp_tracker import XPEventType, XPTracker

__all__ = [
    "XPEngine",
    "XPActivity",
    "XPTracker",
    "XPEventType",
    "StreakManager",
    "StreakType",
    "AchievementEngine",
    "AchievementTrigger",
    "GamificationService",
    "Leaderboard",
    "LeaderboardManager",
    "LeaderboardType",
    "LeaderboardScope",
    "ProgressVisualizer",
    "ProgressChart",
    "ChartType",
    "TimeRange",
]
