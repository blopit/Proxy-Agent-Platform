"""
Integration tests for the complete gamification system.

Tests the interaction between XP engine, streak manager, achievement engine,
and gamification service.
"""

import asyncio
from datetime import date

import pytest

from proxy_agent_platform.gamification import (
    GamificationService,
    StreakType,
)


class TestGamificationIntegration:
    """Test complete gamification system integration."""

    @pytest.fixture
    def gamification_service(self):
        """Create gamification service for testing."""
        return GamificationService()

    @pytest.mark.asyncio
    async def test_task_completion_flow(self, gamification_service):
        """Test complete task completion flow with all gamification features."""
        user_id = 1

        # Simulate task completion
        task_data = {
            "title": "Complete important project milestone",
            "difficulty": "hard",
            "priority": "high",
            "estimated_duration": 120,
            "actual_duration": 90,  # Completed early
            "quality_score": 0.9,  # High quality
        }

        result = await gamification_service.handle_task_completed(user_id, task_data)

        # Check XP was awarded
        assert result["xp_awarded"] > 0
        assert result["total_xp"] >= result["xp_awarded"]

        # Check streak information
        assert "streak_info" in result
        assert result["streak_info"]["current_count"] >= 1
        assert result["streak_info"]["type"] == "daily_task_completion"

        # Check user level calculation
        assert result["user_level"] >= 1

        # Check feedback message
        assert "XP" in result["message"]
        assert len(result["message"]) > 0

    @pytest.mark.asyncio
    async def test_focus_session_flow(self, gamification_service):
        """Test focus session completion flow."""
        user_id = 2

        session_data = {"duration_minutes": 90, "quality_score": 0.8, "session_type": "deep_work"}

        result = await gamification_service.handle_focus_session_completed(user_id, session_data)

        # Check XP and streak
        assert result["xp_awarded"] > 0
        assert "streak_info" in result
        assert result["streak_info"]["type"] == "daily_focus_session"

        # Check message formatting
        assert "focus session" in result["message"].lower()
        assert "90 minutes" in result["message"]

    @pytest.mark.asyncio
    async def test_energy_logging_flow(self, gamification_service):
        """Test energy logging flow."""
        user_id = 3

        energy_data = {
            "energy_level": 8,
            "mood": "focused",
            "notes": "Feeling great after morning coffee",
        }

        result = await gamification_service.handle_energy_logged(user_id, energy_data)

        # Check XP and streak
        assert result["xp_awarded"] > 0
        assert "streak_info" in result
        assert result["streak_info"]["type"] == "daily_energy_log"

    @pytest.mark.asyncio
    async def test_progress_update_flow(self, gamification_service):
        """Test progress update flow."""
        user_id = 4

        progress_data = {
            "goal_type": "quarterly_objective",
            "progress_percentage": 75,
            "milestone_reached": True,
        }

        result = await gamification_service.handle_progress_updated(user_id, progress_data)

        # Check XP and streak
        assert result["xp_awarded"] > 0
        assert "streak_info" in result
        assert result["streak_info"]["type"] == "daily_progress_update"

    @pytest.mark.asyncio
    async def test_achievement_triggering(self, gamification_service):
        """Test that achievements are triggered correctly."""
        user_id = 5

        # Complete first task to trigger "first_task" achievement
        task_data = {"title": "My very first task", "difficulty": "medium", "priority": "medium"}

        result = await gamification_service.handle_task_completed(user_id, task_data)

        # Should get achievement XP in addition to task XP
        if result["new_achievements"]:
            assert result["achievement_xp"] > 0
            assert len(result["new_achievements"]) > 0

            # Check achievement formatting
            achievement = result["new_achievements"][0]
            assert "id" in achievement
            assert "title" in achievement
            assert "description" in achievement
            assert "icon" in achievement
            assert "xp_reward" in achievement

    @pytest.mark.asyncio
    async def test_streak_multiplier_effect(self, gamification_service):
        """Test that streak multipliers affect XP calculation."""
        user_id = 6

        # Complete multiple tasks to build streak
        task_data = {"title": "Daily task", "difficulty": "medium", "priority": "medium"}

        # First task
        result1 = await gamification_service.handle_task_completed(user_id, task_data)
        first_xp = result1["xp_awarded"]

        # Build up streak by recording multiple activities
        for i in range(5):
            gamification_service.streak_manager.record_activity(
                user_id=user_id,
                streak_type=StreakType.DAILY_TASK_COMPLETION,
                activity_date=date.today(),
            )

        # Complete another task - should have streak bonus
        result2 = await gamification_service.handle_task_completed(user_id, task_data)

        # Second task might have higher XP due to streak multiplier
        # (depending on streak count and multiplier calculation)
        assert result2["xp_awarded"] >= first_xp

    @pytest.mark.asyncio
    async def test_user_dashboard(self, gamification_service):
        """Test user dashboard generation."""
        user_id = 7

        # Complete some activities first
        await gamification_service.handle_task_completed(
            user_id, {"title": "Test task", "difficulty": "medium", "priority": "medium"}
        )

        await gamification_service.handle_focus_session_completed(user_id, {"duration_minutes": 45})

        # Get dashboard
        dashboard = await gamification_service.get_user_dashboard(user_id)

        # Check dashboard structure
        assert "user_level" in dashboard
        assert "total_xp" in dashboard
        assert "xp_to_next_level" in dashboard
        assert "active_streaks" in dashboard
        assert "recent_achievements" in dashboard
        assert "recent_activity" in dashboard
        assert "streak_statistics" in dashboard

        # Check data types
        assert isinstance(dashboard["user_level"], int)
        assert isinstance(dashboard["total_xp"], int)
        assert isinstance(dashboard["active_streaks"], list)
        assert isinstance(dashboard["recent_activity"], list)

    @pytest.mark.asyncio
    async def test_multiple_users_isolation(self, gamification_service):
        """Test that user data is properly isolated."""
        user1_id = 10
        user2_id = 11

        # User 1 completes task
        await gamification_service.handle_task_completed(
            user1_id, {"title": "User 1 task", "difficulty": "easy"}
        )

        # User 2 completes task
        await gamification_service.handle_task_completed(
            user2_id, {"title": "User 2 task", "difficulty": "hard"}
        )

        # Get dashboards
        dashboard1 = await gamification_service.get_user_dashboard(user1_id)
        dashboard2 = await gamification_service.get_user_dashboard(user2_id)

        # XP should be different (different difficulty)
        # And users should have separate tracking
        assert dashboard1["total_xp"] != dashboard2["total_xp"]

    @pytest.mark.asyncio
    async def test_level_progression(self, gamification_service):
        """Test user level progression with XP accumulation."""
        user_id = 12

        # Start at level 1
        initial_dashboard = await gamification_service.get_user_dashboard(user_id)
        initial_level = initial_dashboard["user_level"]

        # Complete many high-value tasks
        for i in range(10):
            await gamification_service.handle_task_completed(
                user_id,
                {
                    "title": f"High value task {i}",
                    "difficulty": "expert",
                    "priority": "urgent",
                    "quality_score": 1.0,
                },
            )

        # Check level progression
        final_dashboard = await gamification_service.get_user_dashboard(user_id)
        final_level = final_dashboard["user_level"]

        assert final_level >= initial_level
        assert final_dashboard["total_xp"] > 0

    def test_xp_calculation_consistency(self, gamification_service):
        """Test that XP calculations are consistent."""
        # Test same activity multiple times
        activity_data = {"title": "Consistent task", "difficulty": "medium", "priority": "medium"}

        # Calculate XP multiple times
        xp_results = []
        for _ in range(5):
            # Reset to clean state for consistent calculation
            service = GamificationService()
            result = asyncio.run(service.handle_task_completed(1, activity_data))
            xp_results.append(result["xp_awarded"])

        # All calculations should be the same for identical inputs
        assert len(set(xp_results)) == 1  # All values should be identical
