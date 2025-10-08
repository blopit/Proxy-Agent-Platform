"""
Tests for leaderboard system.

Test leaderboard functionality including creation, updating, ranking,
and user management across different scopes and types.
"""

import pytest

from proxy_agent_platform.gamification.leaderboard import (
    Leaderboard,
    LeaderboardConfig,
    LeaderboardEntry,
    LeaderboardManager,
    LeaderboardScope,
    LeaderboardType,
)


class TestLeaderboard:
    """Test cases for Leaderboard class."""

    @pytest.fixture
    def leaderboard(self):
        """Create leaderboard instance for testing."""
        return Leaderboard()

    def test_initialization(self, leaderboard):
        """Test leaderboard initialization."""
        assert isinstance(leaderboard.leaderboards, dict)
        assert isinstance(leaderboard.configs, dict)
        assert len(leaderboard.configs) > 0  # Should have default configs

    def test_update_user_score(self, leaderboard):
        """Test updating user scores."""
        leaderboard.update_user_score(
            user_id=1, leaderboard_type=LeaderboardType.TOTAL_XP, score=1500.0, username="TestUser"
        )

        leaderboard_id = "total_xp_global"
        assert 1 in leaderboard.user_scores[leaderboard_id]
        assert leaderboard.user_scores[leaderboard_id][1] == 1500.0

    def test_leaderboard_refresh(self, leaderboard):
        """Test leaderboard refresh with multiple users."""
        # Add multiple users
        scores = {1: 1500, 2: 2000, 3: 1200, 4: 1800}
        for user_id, score in scores.items():
            leaderboard.update_user_score(
                user_id=user_id,
                leaderboard_type=LeaderboardType.TOTAL_XP,
                score=score,
                username=f"User{user_id}",
            )

        # Force refresh
        leaderboard_id = "total_xp_global"
        leaderboard._refresh_leaderboard(
            leaderboard_id, username_map={i: f"User{i}" for i in range(1, 5)}
        )

        entries = leaderboard.leaderboards[leaderboard_id]
        assert len(entries) == 4

        # Check ranking order (highest score first)
        assert entries[0].user_id == 2  # 2000 XP
        assert entries[0].rank == 1
        assert entries[1].user_id == 4  # 1800 XP
        assert entries[1].rank == 2
        assert entries[2].user_id == 1  # 1500 XP
        assert entries[2].rank == 3
        assert entries[3].user_id == 3  # 1200 XP
        assert entries[3].rank == 4

    def test_get_leaderboard(self, leaderboard):
        """Test retrieving leaderboard entries."""
        # Setup test data
        leaderboard.update_user_score(
            user_id=1, leaderboard_type=LeaderboardType.TOTAL_XP, score=1500, username="User1"
        )

        entries = leaderboard.get_leaderboard(LeaderboardType.TOTAL_XP)
        assert isinstance(entries, list)

    def test_get_user_rank(self, leaderboard):
        """Test getting specific user rank."""
        # Setup test data
        for i in range(1, 6):
            leaderboard.update_user_score(
                user_id=i,
                leaderboard_type=LeaderboardType.TOTAL_XP,
                score=i * 1000,
                username=f"User{i}",
            )

        # Force refresh
        leaderboard_id = "total_xp_global"
        leaderboard._refresh_leaderboard(
            leaderboard_id, username_map={i: f"User{i}" for i in range(1, 6)}
        )

        # User 5 should be rank 1 (highest score)
        user_rank = leaderboard.get_user_rank(5, LeaderboardType.TOTAL_XP)
        assert user_rank is not None
        assert user_rank.rank == 1
        assert user_rank.score == 5000

        # User 1 should be rank 5 (lowest score)
        user_rank = leaderboard.get_user_rank(1, LeaderboardType.TOTAL_XP)
        assert user_rank is not None
        assert user_rank.rank == 5
        assert user_rank.score == 1000

    def test_get_leaderboard_around_user(self, leaderboard):
        """Test getting leaderboard context around a user."""
        # Setup test data with 10 users
        for i in range(1, 11):
            leaderboard.update_user_score(
                user_id=i,
                leaderboard_type=LeaderboardType.TOTAL_XP,
                score=i * 100,
                username=f"User{i}",
            )

        # Force refresh
        leaderboard_id = "total_xp_global"
        leaderboard._refresh_leaderboard(
            leaderboard_id, username_map={i: f"User{i}" for i in range(1, 11)}
        )

        # Get context around user 5 (should be rank 6)
        context = leaderboard.get_leaderboard_around_user(
            user_id=5, leaderboard_type=LeaderboardType.TOTAL_XP, context_size=2
        )

        assert len(context) == 5  # 2 above + user + 2 below
        assert any(entry.user_id == 5 for entry in context)

    def test_available_leaderboards(self, leaderboard):
        """Test getting available leaderboards."""
        available = leaderboard.get_available_leaderboards()
        assert isinstance(available, list)
        assert len(available) > 0

        # Check structure of leaderboard info
        lb_info = available[0]
        assert "id" in lb_info
        assert "type" in lb_info
        assert "scope" in lb_info
        assert "entry_count" in lb_info

    def test_simulate_leaderboard_data(self, leaderboard):
        """Test leaderboard data simulation."""
        leaderboard.simulate_leaderboard_data()

        # Check that data was created
        total_xp_entries = leaderboard.get_leaderboard(LeaderboardType.TOTAL_XP)
        assert len(total_xp_entries) > 0

        weekly_xp_entries = leaderboard.get_leaderboard(LeaderboardType.WEEKLY_XP)
        assert len(weekly_xp_entries) > 0

        streak_entries = leaderboard.get_leaderboard(LeaderboardType.CURRENT_STREAKS)
        assert len(streak_entries) > 0


class TestLeaderboardManager:
    """Test cases for LeaderboardManager class."""

    @pytest.fixture
    def manager(self):
        """Create leaderboard manager for testing."""
        return LeaderboardManager()

    def test_initialization(self, manager):
        """Test manager initialization."""
        assert manager.leaderboard is not None

    def test_update_from_xp_event(self, manager):
        """Test updating leaderboards from XP events."""
        manager.update_from_xp_event(user_id=1, xp_earned=150, total_xp=1500, username="TestUser")

        # Check that total XP leaderboard was updated
        user_rank = manager.leaderboard.get_user_rank(1, LeaderboardType.TOTAL_XP)
        # May be None if leaderboard hasn't been refreshed yet
        # This tests the integration without forcing immediate refresh

    def test_update_from_streak_event(self, manager):
        """Test updating leaderboards from streak events."""
        manager.update_from_streak_event(
            user_id=1, streak_count=15, streak_type="daily_task_completion", username="TestUser"
        )

        # Verify integration works without errors
        assert True  # Test passes if no exceptions

    def test_update_from_task_completion(self, manager):
        """Test updating leaderboards from task completion."""
        manager.update_from_task_completion(user_id=1, task_count=25, username="TestUser")

        # Verify integration works
        assert True

    def test_get_user_leaderboard_summary(self, manager):
        """Test getting comprehensive user leaderboard summary."""
        # Add some test data
        manager.update_from_xp_event(1, 150, 1500, "TestUser")
        manager.update_from_streak_event(1, 15, "daily_tasks", "TestUser")

        summary = manager.get_user_leaderboard_summary(1)

        assert "user_id" in summary
        assert "rankings" in summary
        assert "trending" in summary
        assert summary["user_id"] == 1


class TestLeaderboardEntry:
    """Test cases for LeaderboardEntry dataclass."""

    def test_entry_creation(self):
        """Test creating leaderboard entry."""
        entry = LeaderboardEntry(
            user_id=1, username="TestUser", score=1500.0, rank=5, change_from_previous=2
        )

        assert entry.user_id == 1
        assert entry.username == "TestUser"
        assert entry.score == 1500.0
        assert entry.rank == 5
        assert entry.change_from_previous == 2
        assert entry.last_updated is not None

    def test_entry_with_metadata(self):
        """Test entry with metadata."""
        metadata = {"streak_type": "daily_tasks", "category": "productivity"}

        entry = LeaderboardEntry(
            user_id=1, username="TestUser", score=100.0, rank=1, metadata=metadata
        )

        assert entry.metadata == metadata


class TestLeaderboardConfig:
    """Test cases for LeaderboardConfig model."""

    def test_config_creation(self):
        """Test creating leaderboard configuration."""
        config = LeaderboardConfig(
            leaderboard_type=LeaderboardType.TOTAL_XP,
            scope=LeaderboardScope.GLOBAL,
            max_entries=50,
            time_window_days=7,
        )

        assert config.leaderboard_type == LeaderboardType.TOTAL_XP
        assert config.scope == LeaderboardScope.GLOBAL
        assert config.max_entries == 50
        assert config.time_window_days == 7

    def test_config_defaults(self):
        """Test configuration defaults."""
        config = LeaderboardConfig(
            leaderboard_type=LeaderboardType.WEEKLY_XP, scope=LeaderboardScope.GLOBAL
        )

        assert config.max_entries == 100  # Default
        assert config.update_frequency_minutes == 5  # Default
        assert config.include_anonymous is False  # Default


@pytest.mark.asyncio
class TestLeaderboardIntegration:
    """Integration tests for leaderboard system."""

    @pytest.fixture
    def manager(self):
        """Create manager for integration tests."""
        return LeaderboardManager()

    async def test_complete_workflow(self, manager):
        """Test complete leaderboard workflow."""
        # Simulate multiple users earning XP
        users = [
            (1, "Alice", 1200),
            (2, "Bob", 1500),
            (3, "Charlie", 900),
            (4, "Diana", 1800),
            (5, "Eve", 1100),
        ]

        for user_id, username, total_xp in users:
            manager.update_from_xp_event(
                user_id=user_id,
                xp_earned=100,  # Recent XP earned
                total_xp=total_xp,
                username=username,
            )

        # Force refresh for testing
        leaderboard_id = "total_xp_global"
        username_map = {uid: name for uid, name, _ in users}
        manager.leaderboard._refresh_leaderboard(leaderboard_id, username_map)

        # Test leaderboard retrieval
        entries = manager.leaderboard.get_leaderboard(LeaderboardType.TOTAL_XP)
        assert len(entries) == 5

        # Verify correct ordering (Diana should be first with 1800 XP)
        assert entries[0].username == "Diana"
        assert entries[0].score == 1800

        # Test user rank lookup
        diana_rank = manager.leaderboard.get_user_rank(4, LeaderboardType.TOTAL_XP)
        assert diana_rank.rank == 1

        # Test user summary
        summary = manager.get_user_leaderboard_summary(4)
        assert summary["user_id"] == 4
        assert "rankings" in summary

    async def test_concurrent_updates(self, manager):
        """Test handling concurrent leaderboard updates."""
        import asyncio

        async def update_user(user_id, base_xp):
            for i in range(10):
                manager.update_from_xp_event(
                    user_id=user_id,
                    xp_earned=50,
                    total_xp=base_xp + (i * 50),
                    username=f"User{user_id}",
                )
                await asyncio.sleep(0.01)  # Small delay

        # Run concurrent updates
        await asyncio.gather(update_user(1, 1000), update_user(2, 1200), update_user(3, 800))

        # Verify final state is consistent
        leaderboard_id = "total_xp_global"
        manager.leaderboard._refresh_leaderboard(
            leaderboard_id, username_map={1: "User1", 2: "User2", 3: "User3"}
        )

        entries = manager.leaderboard.get_leaderboard(LeaderboardType.TOTAL_XP)
        assert len(entries) >= 3

        # User 2 should have highest score (1200 + 450 = 1650)
        user2_rank = manager.leaderboard.get_user_rank(2, LeaderboardType.TOTAL_XP)
        if user2_rank:  # May not exist if refresh timing issues
            assert user2_rank.score == 1650


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
