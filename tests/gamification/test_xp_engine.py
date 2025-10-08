"""
Tests for the XP calculation engine.

Validates XP calculation algorithms, bonuses, and edge cases.
"""

from datetime import datetime, timedelta

import pytest

from proxy_agent_platform.gamification.xp_engine import (
    TaskDifficulty,
    TaskPriority,
    XPActivity,
    XPEngine,
)


class TestXPEngine:
    """Test XP calculation engine functionality."""

    @pytest.fixture
    def xp_engine(self):
        """Create XP engine for testing."""
        return XPEngine()

    @pytest.fixture
    def basic_activity(self):
        """Create basic activity for testing."""
        # Use old timestamp to avoid time bonuses in basic calculations
        from datetime import datetime, timedelta

        return XPActivity(
            activity_type="task_completion",
            base_xp=20,
            difficulty=TaskDifficulty.MEDIUM,
            priority=TaskPriority.MEDIUM,
            created_at=datetime.now() - timedelta(days=3),
        )

    def test_basic_xp_calculation(self, xp_engine, basic_activity):
        """Test basic XP calculation without bonuses."""
        xp = xp_engine.calculate_xp(basic_activity)

        # Base XP (20) * difficulty (1.0) * priority (1.0) = 20
        assert xp == 20

    def test_difficulty_multipliers(self, xp_engine):
        """Test XP calculation with different difficulty levels."""
        from datetime import datetime, timedelta

        # Use old timestamp to avoid time bonuses
        old_time = datetime.now() - timedelta(days=3)

        # Test all difficulty levels
        difficulties_and_expected = [
            (TaskDifficulty.TRIVIAL, 10),  # 20 * 0.5 = 10
            (TaskDifficulty.EASY, 16),  # 20 * 0.8 = 16
            (TaskDifficulty.MEDIUM, 20),  # 20 * 1.0 = 20
            (TaskDifficulty.HARD, 30),  # 20 * 1.5 = 30
            (TaskDifficulty.EXPERT, 40),  # 20 * 2.0 = 40
        ]

        for difficulty, expected_xp in difficulties_and_expected:
            activity = XPActivity(
                activity_type="task_completion",
                base_xp=20,
                difficulty=difficulty,
                priority=TaskPriority.MEDIUM,
                created_at=old_time,
            )
            xp = xp_engine.calculate_xp(activity)
            assert xp == expected_xp

    def test_priority_multipliers(self, xp_engine):
        """Test XP calculation with different priority levels."""
        from datetime import datetime, timedelta

        # Use old timestamp to avoid time bonuses
        old_time = datetime.now() - timedelta(days=3)

        priorities_and_expected = [
            (TaskPriority.LOW, 16),  # 20 * 0.8 = 16
            (TaskPriority.MEDIUM, 20),  # 20 * 1.0 = 20
            (TaskPriority.HIGH, 26),  # 20 * 1.3 = 26
            (TaskPriority.URGENT, 32),  # 20 * 1.6 = 32
        ]

        for priority, expected_xp in priorities_and_expected:
            activity = XPActivity(
                activity_type="task_completion",
                base_xp=20,
                difficulty=TaskDifficulty.MEDIUM,
                priority=priority,
                created_at=old_time,
            )
            xp = xp_engine.calculate_xp(activity)
            assert xp == expected_xp

    def test_efficiency_bonus(self, xp_engine):
        """Test efficiency bonus calculation."""
        # Perfect efficiency (completed in half the time)
        activity = XPActivity(
            activity_type="task_completion",
            base_xp=20,
            difficulty=TaskDifficulty.MEDIUM,
            priority=TaskPriority.MEDIUM,
            estimated_duration=60,
            actual_duration=30,
        )
        xp = xp_engine.calculate_xp(activity)

        # Should get maximum efficiency bonus (50%)
        # 20 * 1.0 * 1.0 * 1.5 = 30 (plus time bonus)
        assert xp >= 30

    def test_quality_bonus(self, xp_engine):
        """Test quality bonus calculation."""
        activity = XPActivity(
            activity_type="task_completion",
            base_xp=20,
            difficulty=TaskDifficulty.MEDIUM,
            priority=TaskPriority.MEDIUM,
            quality_score=1.0,  # Perfect quality
        )
        xp = xp_engine.calculate_xp(activity)

        # Should get maximum quality bonus (40%)
        # 20 * 1.0 * 1.0 * 1.4 = 28 (plus time bonus)
        assert xp >= 28

    def test_streak_multiplier(self, xp_engine):
        """Test streak multiplier application."""
        activity = XPActivity(
            activity_type="task_completion",
            base_xp=20,
            difficulty=TaskDifficulty.MEDIUM,
            priority=TaskPriority.MEDIUM,
            streak_multiplier=2.0,
        )
        xp = xp_engine.calculate_xp(activity)

        # Base calculation with 2x streak multiplier
        # 20 * 1.0 * 1.0 * 2.0 = 40 (plus time bonus)
        assert xp >= 40

    def test_combined_bonuses(self, xp_engine):
        """Test calculation with multiple bonuses combined."""
        activity = XPActivity(
            activity_type="task_completion",
            base_xp=20,
            difficulty=TaskDifficulty.HARD,  # 1.5x
            priority=TaskPriority.HIGH,  # 1.3x
            estimated_duration=60,
            actual_duration=30,  # Efficiency bonus
            quality_score=1.0,  # Quality bonus
            streak_multiplier=1.5,  # Streak bonus
        )
        xp = xp_engine.calculate_xp(activity)

        # Complex calculation with all bonuses
        # This should be significantly higher than base
        assert xp > 50

    def test_xp_bounds(self, xp_engine):
        """Test XP is within minimum and maximum bounds."""
        # Test minimum XP
        minimal_activity = XPActivity(
            activity_type="task_completion",
            base_xp=1,
            difficulty=TaskDifficulty.TRIVIAL,
            priority=TaskPriority.LOW,
        )
        xp = xp_engine.calculate_xp(minimal_activity)
        assert xp >= xp_engine.minimum_xp

        # Test maximum XP (with extreme values)
        maximal_activity = XPActivity(
            activity_type="task_completion",
            base_xp=500,
            difficulty=TaskDifficulty.EXPERT,
            priority=TaskPriority.URGENT,
            estimated_duration=60,
            actual_duration=15,
            quality_score=1.0,
            streak_multiplier=3.0,
        )
        xp = xp_engine.calculate_xp(maximal_activity)
        assert xp <= xp_engine.maximum_xp

    def test_get_xp_breakdown(self, xp_engine):
        """Test XP breakdown provides detailed calculation info."""
        activity = XPActivity(
            activity_type="task_completion",
            base_xp=20,
            difficulty=TaskDifficulty.HARD,
            priority=TaskPriority.HIGH,
            quality_score=0.8,
            streak_multiplier=1.2,
        )

        breakdown = xp_engine.get_xp_breakdown(activity)

        # Check all components are present
        assert "base_xp" in breakdown
        assert "difficulty_multiplier" in breakdown
        assert "priority_multiplier" in breakdown
        assert "quality_bonus" in breakdown
        assert "streak_multiplier" in breakdown
        assert "final_xp" in breakdown

        # Check values make sense
        assert breakdown["base_xp"] == 20
        assert breakdown["difficulty_multiplier"] == 1.5
        assert breakdown["priority_multiplier"] == 1.3
        assert breakdown["streak_multiplier"] == 1.2

    def test_activity_types(self, xp_engine):
        """Test predefined activity types."""
        activity_types = xp_engine.get_activity_types()

        # Check common activity types exist
        assert "task_completion" in activity_types
        assert "focus_session_30min" in activity_types
        assert "focus_session_60min" in activity_types
        assert "energy_log" in activity_types
        assert "goal_achievement" in activity_types

        # Check XP values are reasonable
        assert activity_types["task_completion"] > 0
        assert activity_types["focus_session_60min"] > activity_types["focus_session_30min"]
        assert activity_types["goal_achievement"] > activity_types["task_completion"]

    def test_time_bonus(self, xp_engine):
        """Test time-based bonuses."""
        # Same-day completion
        now = datetime.now()
        activity = XPActivity(
            activity_type="task_completion",
            base_xp=20,
            difficulty=TaskDifficulty.MEDIUM,
            priority=TaskPriority.MEDIUM,
            created_at=now,
        )

        time_bonus = xp_engine._calculate_time_bonus(activity)
        assert time_bonus > 0  # Should get some time bonus

        # Old activity (no time bonus)
        old_activity = XPActivity(
            activity_type="task_completion",
            base_xp=20,
            difficulty=TaskDifficulty.MEDIUM,
            priority=TaskPriority.MEDIUM,
            created_at=now - timedelta(days=2),
        )

        old_time_bonus = xp_engine._calculate_time_bonus(old_activity)
        assert old_time_bonus == 0

    def test_efficiency_edge_cases(self, xp_engine):
        """Test efficiency bonus edge cases."""
        activity = XPActivity(activity_type="task_completion", base_xp=20)

        # No timing data
        bonus = xp_engine._calculate_efficiency_bonus(activity)
        assert bonus == 0.0

        # Took longer than expected (no bonus)
        activity.estimated_duration = 30
        activity.actual_duration = 60
        bonus = xp_engine._calculate_efficiency_bonus(activity)
        assert bonus == 0.0

        # Exactly on time (no bonus)
        activity.actual_duration = 30
        bonus = xp_engine._calculate_efficiency_bonus(activity)
        assert bonus == 0.0
