"""Unit tests for StatisticsService."""
import pytest
from datetime import datetime, timedelta
from src.services.task_statistics_service import StatisticsService


class TestStatisticsService:
    """Test suite for StatisticsService."""

    @pytest.fixture
    def service(self):
        """Create a fresh StatisticsService instance for each test."""
        svc = StatisticsService()
        svc._clear_data()
        return svc

    @pytest.mark.asyncio
    async def test_get_user_statistics_with_no_tasks(self, service):
        """Test statistics for user with zero tasks."""
        stats = await service.get_user_statistics("user_empty")

        assert stats["user_id"] == "user_empty"
        assert stats["total_tasks"] == 0
        assert stats["completed_tasks"] == 0
        assert stats["completion_rate"] == 0.0
        assert stats["avg_completion_time_minutes"] == 0.0
        assert stats["productivity_score"] == 0.0
        assert stats["streak_days"] == 0

    @pytest.mark.asyncio
    async def test_get_user_statistics_with_tasks_no_completions(self, service):
        """Test statistics for user with tasks but no completions."""
        service._add_task("user_1", {"id": "task_1", "title": "Task 1"})
        service._add_task("user_1", {"id": "task_2", "title": "Task 2"})

        stats = await service.get_user_statistics("user_1")

        assert stats["total_tasks"] == 2
        assert stats["completed_tasks"] == 0
        assert stats["completion_rate"] == 0.0
        assert stats["streak_days"] == 0

    @pytest.mark.asyncio
    async def test_get_user_statistics_with_full_completion(self, service):
        """Test statistics for user with 100% completion rate."""
        # Add 3 tasks
        service._add_task("user_2", {"id": "task_1"})
        service._add_task("user_2", {"id": "task_2"})
        service._add_task("user_2", {"id": "task_3"})

        # Add 3 completions
        service._add_completion(
            "user_2",
            {
                "task_id": "task_1",
                "completion_time_minutes": 20,
                "completed_at": datetime.now()
            }
        )
        service._add_completion(
            "user_2",
            {
                "task_id": "task_2",
                "completion_time_minutes": 30,
                "completed_at": datetime.now()
            }
        )
        service._add_completion(
            "user_2",
            {
                "task_id": "task_3",
                "completion_time_minutes": 25,
                "completed_at": datetime.now()
            }
        )

        stats = await service.get_user_statistics("user_2")

        assert stats["total_tasks"] == 3
        assert stats["completed_tasks"] == 3
        assert stats["completion_rate"] == 100.0
        assert stats["avg_completion_time_minutes"] == 25.0  # (20+30+25)/3
        assert stats["streak_days"] == 1  # All completed today

    @pytest.mark.asyncio
    async def test_get_user_statistics_with_partial_completion(self, service):
        """Test statistics for user with partial completion."""
        # Add 5 tasks
        for i in range(5):
            service._add_task("user_3", {"id": f"task_{i}"})

        # Complete 3 tasks
        for i in range(3):
            service._add_completion(
                "user_3",
                {
                    "task_id": f"task_{i}",
                    "completion_time_minutes": 30,
                    "completed_at": datetime.now()
                }
            )

        stats = await service.get_user_statistics("user_3")

        assert stats["total_tasks"] == 5
        assert stats["completed_tasks"] == 3
        assert stats["completion_rate"] == 60.0
        assert stats["avg_completion_time_minutes"] == 30.0

    @pytest.mark.asyncio
    async def test_get_user_statistics_invalid_user_id(self, service):
        """Test that invalid user_id raises ValueError."""
        with pytest.raises(ValueError, match="Invalid user_id"):
            await service.get_user_statistics("")

        with pytest.raises(ValueError, match="Invalid user_id"):
            await service.get_user_statistics(None)

    @pytest.mark.asyncio
    async def test_get_productivity_score_returns_correct_value(self, service):
        """Test that productivity score endpoint returns correct score."""
        # Add tasks and completions
        service._add_task("user_4", {"id": "task_1"})
        service._add_completion(
            "user_4",
            {
                "task_id": "task_1",
                "completion_time_minutes": 30,
                "completed_at": datetime.now()
            }
        )

        score = await service.get_productivity_score("user_4")

        assert isinstance(score, float)
        assert 0.0 <= score <= 100.0

    @pytest.mark.asyncio
    async def test_get_productivity_score_invalid_user_id(self, service):
        """Test that invalid user_id raises ValueError."""
        with pytest.raises(ValueError, match="Invalid user_id"):
            await service.get_productivity_score("")

    def test_calculate_streak_with_no_completions(self, service):
        """Test streak calculation with no completions."""
        streak = service._calculate_streak([])
        assert streak == 0

    def test_calculate_streak_with_consecutive_days(self, service):
        """Test streak calculation with consecutive days."""
        today = datetime.now()
        completions = [
            {"completed_at": today},
            {"completed_at": today - timedelta(days=1)},
            {"completed_at": today - timedelta(days=2)},
        ]

        streak = service._calculate_streak(completions)
        assert streak == 3

    def test_calculate_streak_with_gap(self, service):
        """Test streak calculation with gap in days."""
        today = datetime.now()
        completions = [
            {"completed_at": today},
            {"completed_at": today - timedelta(days=3)},  # Gap here
        ]

        streak = service._calculate_streak(completions)
        assert streak == 1  # Only today counts

    def test_calculate_streak_multiple_completions_same_day(self, service):
        """Test streak counts days, not individual completions."""
        today = datetime.now()
        completions = [
            {"completed_at": today},
            {"completed_at": today},  # Same day
            {"completed_at": today},  # Same day
        ]

        streak = service._calculate_streak(completions)
        assert streak == 1  # Only one day

    def test_calculate_productivity_score_perfect_conditions(self, service):
        """Test productivity score with ideal conditions."""
        score = service._calculate_productivity_score(
            completion_rate=100.0,
            avg_completion_time=30.0,  # Optimal time
            streak_days=30,  # Max streak score
            total_completed=100
        )

        assert 95.0 <= score <= 100.0  # Should be near perfect

    def test_calculate_productivity_score_zero_activity(self, service):
        """Test productivity score with no activity."""
        score = service._calculate_productivity_score(
            completion_rate=0.0,
            avg_completion_time=0.0,
            streak_days=0,
            total_completed=0
        )

        assert score == 0.0

    def test_calculate_productivity_score_boundaries(self, service):
        """Test productivity score stays within 0-100 bounds."""
        # Test with extreme values
        score = service._calculate_productivity_score(
            completion_rate=100.0,
            avg_completion_time=1.0,  # Very fast
            streak_days=365,  # Very long streak
            total_completed=10000  # Huge volume
        )

        assert 0.0 <= score <= 100.0

    def test_calculate_productivity_score_slow_completion(self, service):
        """Test productivity score with slow task completion."""
        # Slow completion should reduce velocity score
        score_slow = service._calculate_productivity_score(
            completion_rate=100.0,
            avg_completion_time=120.0,  # 2 hours per task
            streak_days=0,
            total_completed=10
        )

        score_fast = service._calculate_productivity_score(
            completion_rate=100.0,
            avg_completion_time=30.0,  # Optimal
            streak_days=0,
            total_completed=10
        )

        assert score_slow < score_fast

    def test_calculate_productivity_score_components_weighted(self, service):
        """Test that productivity score components have correct weights."""
        # Test completion rate weight (40%)
        score_high_completion = service._calculate_productivity_score(
            completion_rate=100.0,
            avg_completion_time=0.0,
            streak_days=0,
            total_completed=0
        )

        # Should be around 40 points (40% weight)
        assert 38.0 <= score_high_completion <= 42.0
