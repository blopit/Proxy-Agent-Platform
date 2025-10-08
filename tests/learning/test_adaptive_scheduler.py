"""
Tests for adaptive scheduling system.

Test the AI-driven task scheduling and optimization functionality
that learns from user patterns and optimizes productivity.
"""

from datetime import datetime

import pytest

from proxy_agent_platform.learning.adaptive_scheduler import (
    AdaptiveScheduler,
    SchedulingPriority,
    TaskSchedule,
    TimeSlot,
    UserPreferences,
)


class TestTimeSlot:
    """Test TimeSlot data structure."""

    def test_time_slot_creation(self):
        """Test creating a time slot."""
        slot = TimeSlot(
            start_time=datetime(2025, 1, 1, 9, 0),
            end_time=datetime(2025, 1, 1, 10, 0),
            productivity_score=0.8,
        )

        assert slot.start_time.hour == 9
        assert slot.end_time.hour == 10
        assert slot.productivity_score == 0.8
        assert slot.duration_minutes == 60

    def test_time_slot_overlap_detection(self):
        """Test detecting overlapping time slots."""
        slot1 = TimeSlot(
            start_time=datetime(2025, 1, 1, 9, 0),
            end_time=datetime(2025, 1, 1, 10, 0),
        )
        slot2 = TimeSlot(
            start_time=datetime(2025, 1, 1, 9, 30),
            end_time=datetime(2025, 1, 1, 10, 30),
        )

        assert slot1.overlaps_with(slot2)
        assert slot2.overlaps_with(slot1)


class TestUserPreferences:
    """Test UserPreferences model."""

    def test_user_preferences_creation(self):
        """Test creating user preferences."""
        prefs = UserPreferences(
            user_id=1,
            preferred_work_hours=(9, 17),
            break_duration_minutes=15,
            max_focus_duration_minutes=90,
            preferred_task_types=["coding", "writing"],
        )

        assert prefs.user_id == 1
        assert prefs.preferred_work_hours == (9, 17)
        assert prefs.break_duration_minutes == 15
        assert "coding" in prefs.preferred_task_types

    def test_user_preferences_defaults(self):
        """Test default user preferences."""
        prefs = UserPreferences(user_id=1)

        assert prefs.preferred_work_hours == (9, 17)
        assert prefs.break_duration_minutes == 15
        assert prefs.max_focus_duration_minutes == 90


class TestTaskSchedule:
    """Test TaskSchedule model."""

    def test_task_schedule_creation(self):
        """Test creating a task schedule."""
        schedule = TaskSchedule(
            task_id="task-123",
            scheduled_start=datetime(2025, 1, 1, 9, 0),
            estimated_duration_minutes=30,
            priority=SchedulingPriority.HIGH,
            confidence_score=0.85,
        )

        assert schedule.task_id == "task-123"
        assert schedule.priority == SchedulingPriority.HIGH
        assert schedule.confidence_score == 0.85
        assert schedule.scheduled_end.hour == 9
        assert schedule.scheduled_end.minute == 30


class TestAdaptiveScheduler:
    """Test AdaptiveScheduler functionality."""

    @pytest.fixture
    def scheduler(self):
        """Create scheduler instance for testing."""
        return AdaptiveScheduler()

    @pytest.fixture
    def user_prefs(self):
        """Create user preferences for testing."""
        return UserPreferences(
            user_id=1,
            preferred_work_hours=(9, 17),
            break_duration_minutes=15,
            max_focus_duration_minutes=90,
        )

    def test_initialization(self, scheduler):
        """Test scheduler initialization."""
        assert scheduler.user_patterns == {}
        assert scheduler.scheduling_history == {}
        assert scheduler.optimization_rules == {}

    def test_add_user_preferences(self, scheduler, user_prefs):
        """Test adding user preferences."""
        scheduler.add_user_preferences(user_prefs)

        assert 1 in scheduler.user_preferences
        assert scheduler.user_preferences[1] == user_prefs

    def test_analyze_productivity_patterns(self, scheduler):
        """Test analyzing productivity patterns."""
        # Create mock historical data
        historical_data = [
            {
                "timestamp": datetime(2025, 1, 1, 9, 0),
                "productivity_score": 0.8,
                "task_type": "coding",
                "duration_minutes": 45,
            },
            {
                "timestamp": datetime(2025, 1, 1, 14, 0),
                "productivity_score": 0.6,
                "task_type": "meetings",
                "duration_minutes": 60,
            },
        ]

        patterns = scheduler.analyze_productivity_patterns(1, historical_data)

        assert "peak_hours" in patterns
        assert "task_type_preferences" in patterns
        assert "optimal_session_duration" in patterns

    def test_optimize_schedule_empty(self, scheduler, user_prefs):
        """Test optimizing schedule with no tasks."""
        scheduler.add_user_preferences(user_prefs)

        optimized = scheduler.optimize_schedule(
            user_id=1,
            tasks=[],
            target_date=datetime(2025, 1, 1),
        )

        assert optimized == []

    def test_optimize_schedule_with_tasks(self, scheduler, user_prefs):
        """Test optimizing schedule with tasks."""
        scheduler.add_user_preferences(user_prefs)

        tasks = [
            {
                "task_id": "task-1",
                "estimated_duration_minutes": 30,
                "priority": "high",
                "task_type": "coding",
            },
            {
                "task_id": "task-2",
                "estimated_duration_minutes": 60,
                "priority": "medium",
                "task_type": "writing",
            },
        ]

        optimized = scheduler.optimize_schedule(
            user_id=1,
            tasks=tasks,
            target_date=datetime(2025, 1, 1),
        )

        assert len(optimized) == 2
        assert all(isinstance(schedule, TaskSchedule) for schedule in optimized)

        # High priority task should be scheduled first
        high_priority_task = next(s for s in optimized if s.task_id == "task-1")
        medium_priority_task = next(s for s in optimized if s.task_id == "task-2")

        assert high_priority_task.scheduled_start <= medium_priority_task.scheduled_start

    def test_suggest_optimal_time_slots(self, scheduler):
        """Test suggesting optimal time slots."""
        user_patterns = {
            "peak_hours": [9, 10, 11, 14, 15],
            "task_type_preferences": {
                "coding": [9, 10, 11],
                "writing": [14, 15, 16],
            },
        }

        slots = scheduler.suggest_optimal_time_slots(
            user_patterns=user_patterns,
            task_type="coding",
            duration_minutes=90,
            date=datetime(2025, 1, 1),
        )

        assert len(slots) > 0
        assert all(isinstance(slot, TimeSlot) for slot in slots)

        # Should prefer morning hours for coding
        morning_slots = [s for s in slots if s.start_time.hour < 12]
        assert len(morning_slots) > 0

    def test_update_scheduling_feedback(self, scheduler):
        """Test updating scheduling feedback."""
        feedback = {
            "task_id": "task-123",
            "scheduled_start": datetime(2025, 1, 1, 9, 0),
            "actual_start": datetime(2025, 1, 1, 9, 15),
            "actual_duration_minutes": 45,
            "productivity_score": 0.7,
            "user_satisfaction": 0.8,
        }

        scheduler.update_scheduling_feedback(user_id=1, feedback=feedback)

        assert 1 in scheduler.scheduling_history
        assert len(scheduler.scheduling_history[1]) == 1
        assert scheduler.scheduling_history[1][0] == feedback

    def test_get_schedule_recommendations(self, scheduler, user_prefs):
        """Test getting schedule recommendations."""
        scheduler.add_user_preferences(user_prefs)

        recommendations = scheduler.get_schedule_recommendations(
            user_id=1,
            upcoming_tasks=[
                {
                    "task_id": "task-1",
                    "estimated_duration_minutes": 30,
                    "priority": "high",
                    "deadline": datetime(2025, 1, 2),
                }
            ],
        )

        assert "optimizations" in recommendations
        assert "time_slots" in recommendations
        assert "efficiency_tips" in recommendations

    def test_calculate_schedule_efficiency(self, scheduler):
        """Test calculating schedule efficiency."""
        schedule = [
            TaskSchedule(
                task_id="task-1",
                scheduled_start=datetime(2025, 1, 1, 9, 0),
                estimated_duration_minutes=30,
                priority=SchedulingPriority.HIGH,
                confidence_score=0.8,
            ),
            TaskSchedule(
                task_id="task-2",
                scheduled_start=datetime(2025, 1, 1, 10, 0),
                estimated_duration_minutes=60,
                priority=SchedulingPriority.MEDIUM,
                confidence_score=0.7,
            ),
        ]

        efficiency = scheduler.calculate_schedule_efficiency(schedule)

        assert 0 <= efficiency <= 1
        assert isinstance(efficiency, float)


@pytest.mark.asyncio
class TestAdaptiveSchedulerIntegration:
    """Integration tests for adaptive scheduler."""

    @pytest.fixture
    def scheduler(self):
        """Create scheduler for integration tests."""
        return AdaptiveScheduler()

    async def test_end_to_end_scheduling_workflow(self, scheduler):
        """Test complete scheduling workflow."""
        # Setup user preferences
        prefs = UserPreferences(
            user_id=1,
            preferred_work_hours=(9, 17),
            preferred_task_types=["coding", "writing"],
        )
        scheduler.add_user_preferences(prefs)

        # Add historical productivity data
        historical_data = [
            {
                "timestamp": datetime(2025, 1, 1, 9, 0),
                "productivity_score": 0.9,
                "task_type": "coding",
                "duration_minutes": 60,
            },
            {
                "timestamp": datetime(2025, 1, 1, 15, 0),
                "productivity_score": 0.7,
                "task_type": "writing",
                "duration_minutes": 45,
            },
        ]

        # Analyze patterns
        patterns = scheduler.analyze_productivity_patterns(1, historical_data)

        # Optimize schedule
        tasks = [
            {
                "task_id": "coding-task",
                "estimated_duration_minutes": 90,
                "priority": "high",
                "task_type": "coding",
            },
            {
                "task_id": "writing-task",
                "estimated_duration_minutes": 60,
                "priority": "medium",
                "task_type": "writing",
            },
        ]

        optimized_schedule = scheduler.optimize_schedule(
            user_id=1,
            tasks=tasks,
            target_date=datetime(2025, 1, 2),
        )

        # Verify schedule quality
        assert len(optimized_schedule) == 2
        efficiency = scheduler.calculate_schedule_efficiency(optimized_schedule)
        assert efficiency > 0.5  # Should be reasonably efficient

    async def test_adaptive_learning_from_feedback(self, scheduler):
        """Test that scheduler learns from user feedback."""
        prefs = UserPreferences(user_id=1)
        scheduler.add_user_preferences(prefs)

        # Provide feedback on multiple scheduling attempts
        for i in range(5):
            feedback = {
                "task_id": f"task-{i}",
                "scheduled_start": datetime(2025, 1, 1, 9 + i, 0),
                "actual_start": datetime(2025, 1, 1, 9 + i, 0),
                "actual_duration_minutes": 30,
                "productivity_score": 0.8 if i < 3 else 0.6,  # Morning more productive
                "user_satisfaction": 0.9 if i < 3 else 0.5,
            }
            scheduler.update_scheduling_feedback(1, feedback)

        # Check that patterns were updated
        assert 1 in scheduler.scheduling_history
        assert len(scheduler.scheduling_history[1]) == 5

        # Future schedules should prefer morning slots
        recommendations = scheduler.get_schedule_recommendations(
            user_id=1,
            upcoming_tasks=[
                {
                    "task_id": "new-task",
                    "estimated_duration_minutes": 45,
                    "priority": "high",
                }
            ],
        )

        assert "optimizations" in recommendations


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
