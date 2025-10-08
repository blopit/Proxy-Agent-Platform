"""
Learning and Optimization System for Proxy Agent Platform.

Epic 5: Learning & Optimization
- User pattern recognition
- Adaptive timing suggestions
- Energy level prediction
- Habit formation tracking
- Personalized nudging system
- Productivity trend analysis
"""

from .adaptive_scheduler import AdaptiveScheduler
from .analytics_engine import ProductivityAnalytics
from .energy_predictor import EnergyPredictor
from .habit_tracker import HabitTracker
from .nudge_system import PersonalizedNudgeSystem
from .pattern_analyzer import PatternAnalyzer

__all__ = [
    "PatternAnalyzer",
    "AdaptiveScheduler",
    "EnergyPredictor",
    "HabitTracker",
    "PersonalizedNudgeSystem",
    "ProductivityAnalytics",
]
