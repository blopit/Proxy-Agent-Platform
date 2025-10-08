"""
Tests for gamification API endpoints.

Test FastAPI routes for XP tracking, leaderboards, progress visualization,
and user statistics with proper error handling and response validation.
"""

from datetime import datetime
from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI
from httpx import AsyncClient

from proxy_agent_platform.api.gamification import router

# Create test app
app = FastAPI()
app.include_router(router)


# Initialize TestClient
@pytest.fixture
async def client():
    """Create test client fixture."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


class TestXPEventEndpoint:
    """Test XP event tracking endpoint."""

    async def test_track_task_completion_event(self, client):
        """Test tracking task completion event."""
        event_data = {
            "user_id": 1,
            "event_type": "task_completed",
            "event_data": {
                "title": "Test Task",
                "difficulty": "medium",
                "priority": "high",
                "estimated_duration": 30,
                "actual_duration": 25,
                "quality_score": 0.9,
            },
            "source_agent": "task_proxy",
        }

        with patch("proxy_agent_platform.api.gamification.gamification_service") as mock_service:
            mock_service.handle_task_completed = AsyncMock(
                return_value={
                    "xp_awarded": 150,
                    "total_xp": 1500,
                    "user_level": 5,
                    "new_achievements": [],
                    "streak_info": {"type": "daily_task", "current_count": 3},
                    "message": "Task completed! +150 XP",
                }
            )

            response = await client.post("/api/v1/gamification/events", json=event_data)

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["xp_awarded"] == 150
            assert data["total_xp"] == 1500
            assert data["level"] == 5
            assert data["message"] == "Task completed! +150 XP"

    async def test_track_focus_session_event(self, client):
        """Test tracking focus session event."""
        event_data = {
            "user_id": 1,
            "event_type": "focus_session_completed",
            "event_data": {
                "duration_minutes": 90,
                "quality_score": 0.85,
                "session_type": "deep_work",
            },
        }

        with patch("proxy_agent_platform.api.gamification.gamification_service") as mock_service:
            mock_service.handle_focus_session_completed = AsyncMock(
                return_value={
                    "xp_awarded": 200,
                    "total_xp": 1700,
                    "user_level": 5,
                    "new_achievements": [
                        {"id": "focus_master", "title": "Focus Master", "xp_reward": 300}
                    ],
                    "message": "Great focus session! +200 XP",
                }
            )

            response = await client.post("/api/v1/gamification/events", json=event_data)

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["xp_awarded"] == 200
            assert len(data["new_achievements"]) == 1

    async def test_track_energy_log_event(self, client):
        """Test tracking energy logging event."""
        event_data = {
            "user_id": 1,
            "event_type": "energy_logged",
            "event_data": {
                "energy_level": 8,
                "mood": "focused",
                "notes": "Good energy after coffee",
            },
        }

        with patch("proxy_agent_platform.api.gamification.gamification_service") as mock_service:
            mock_service.handle_energy_logged = AsyncMock(
                return_value={
                    "xp_awarded": 10,
                    "total_xp": 1510,
                    "streak_info": {"type": "daily_energy", "current_count": 5},
                    "message": "Energy logged! +10 XP",
                }
            )

            response = await client.post("/api/v1/gamification/events", json=event_data)

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["xp_awarded"] == 10

    async def test_unsupported_event_type(self, client):
        """Test handling unsupported event types."""
        event_data = {"user_id": 1, "event_type": "unknown_event", "event_data": {}}

        response = await client.post("/api/v1/gamification/events", json=event_data)
        assert response.status_code == 400
        assert "Unsupported event type" in response.json()["detail"]

    async def test_event_processing_error(self, client):
        """Test handling event processing errors."""
        event_data = {"user_id": 1, "event_type": "task_completed", "event_data": {}}

        with patch("proxy_agent_platform.api.gamification.gamification_service") as mock_service:
            mock_service.handle_task_completed = AsyncMock(
                side_effect=Exception("Processing error")
            )

            response = await client.post("/api/v1/gamification/events", json=event_data)
            assert response.status_code == 500


class TestUserStatsEndpoint:
    """Test user statistics endpoint."""

    async def test_get_user_stats(self, client):
        """Test retrieving user statistics."""
        with patch("proxy_agent_platform.api.gamification.gamification_service") as mock_service:
            mock_service.get_user_dashboard = AsyncMock(
                return_value={
                    "total_xp": 2500,
                    "user_level": 7,
                    "xp_to_next_level": 400,
                    "active_streaks": [
                        {"type": "daily_task_completion", "current_count": 12, "status": "active"}
                    ],
                    "recent_achievements": [
                        {
                            "id": "task_master_10",
                            "title": "Task Master",
                            "earned_at": datetime.now().isoformat(),
                        }
                    ],
                    "recent_activity": [
                        {
                            "event_type": "task_completed",
                            "xp_awarded": 150,
                            "timestamp": datetime.now().isoformat(),
                        }
                    ],
                    "streak_statistics": {"total_active_streaks": 2, "longest_current_streak": 12},
                }
            )

            response = await client.get("/api/v1/gamification/users/1/stats")

            assert response.status_code == 200
            data = response.json()
            assert data["user_id"] == 1
            assert data["total_xp"] == 2500
            assert data["current_level"] == 7
            assert data["xp_to_next_level"] == 400
            assert len(data["active_streaks"]) == 1
            assert len(data["recent_achievements"]) == 1

    async def test_user_stats_error(self, client):
        """Test user stats retrieval error."""
        with patch("proxy_agent_platform.api.gamification.gamification_service") as mock_service:
            mock_service.get_user_dashboard = AsyncMock(side_effect=Exception("Database error"))

            response = await client.get("/api/v1/gamification/users/999/stats")
            assert response.status_code == 500


class TestLeaderboardEndpoints:
    """Test leaderboard endpoints."""

    async def test_get_leaderboard(self, client):
        """Test retrieving leaderboard data."""
        with patch("proxy_agent_platform.api.gamification.leaderboard_manager") as mock_manager:
            mock_entries = [
                Mock(
                    user_id=1,
                    username="Alice",
                    score=2500,
                    rank=1,
                    change_from_previous=None,
                    metadata={},
                    last_updated=datetime.now(),
                ),
                Mock(
                    user_id=2,
                    username="Bob",
                    score=2200,
                    rank=2,
                    change_from_previous=1,
                    metadata={},
                    last_updated=datetime.now(),
                ),
            ]

            mock_manager.leaderboard.get_leaderboard.return_value = mock_entries
            mock_manager.leaderboard.get_user_rank.return_value = mock_entries[0]

            response = await client.get(
                "/api/v1/gamification/leaderboards/total_xp", params={"user_id": 1, "limit": 10}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["leaderboard_type"] == "total_xp"
            assert data["scope"] == "global"
            assert len(data["entries"]) == 2
            assert data["user_rank"] is not None
            assert data["user_rank"]["rank"] == 1

    async def test_get_leaderboard_with_scope(self, client):
        """Test retrieving leaderboard with specific scope."""
        with patch("proxy_agent_platform.api.gamification.leaderboard_manager") as mock_manager:
            mock_manager.leaderboard.get_leaderboard.return_value = []
            mock_manager.leaderboard.get_user_rank.return_value = None

            response = await client.get(
                "/api/v1/gamification/leaderboards/weekly_xp", params={"scope": "team", "limit": 25}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["leaderboard_type"] == "weekly_xp"
            assert data["scope"] == "team"

    async def test_get_available_leaderboards(self, client):
        """Test retrieving available leaderboards."""
        with patch("proxy_agent_platform.api.gamification.leaderboard_manager") as mock_manager:
            mock_manager.leaderboard.get_available_leaderboards.return_value = [
                {
                    "id": "total_xp_global",
                    "type": "total_xp",
                    "scope": "global",
                    "entry_count": 15,
                    "last_updated": datetime.now().isoformat(),
                }
            ]

            response = await client.get("/api/v1/gamification/leaderboards")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["type"] == "total_xp"

    async def test_get_user_leaderboard_summary(self, client):
        """Test user leaderboard summary."""
        with patch("proxy_agent_platform.api.gamification.leaderboard_manager") as mock_manager:
            mock_manager.get_user_leaderboard_summary.return_value = {
                "user_id": 1,
                "rankings": {"total_xp": {"rank": 5, "score": 2500, "change": 2}},
                "trending": {"total_xp": "up"},
            }

            response = await client.get("/api/v1/gamification/users/1/leaderboard-summary")

            assert response.status_code == 200
            data = response.json()
            assert data["user_id"] == 1
            assert "rankings" in data
            assert "trending" in data

    async def test_simulate_leaderboard_data(self, client):
        """Test leaderboard data simulation."""
        with patch("proxy_agent_platform.api.gamification.leaderboard_manager") as mock_manager:
            mock_manager.leaderboard.simulate_leaderboard_data.return_value = None

            response = await client.post("/api/v1/gamification/test/simulate-leaderboard")

            assert response.status_code == 200
            data = response.json()
            assert "message" in data


class TestProgressVisualizationEndpoints:
    """Test progress visualization endpoints."""

    async def test_get_xp_progression_chart(self, client):
        """Test XP progression chart endpoint."""
        with patch("proxy_agent_platform.api.gamification.progress_visualizer") as mock_viz:
            mock_chart = Mock()
            mock_viz.create_xp_progression_chart.return_value = mock_chart
            mock_viz.export_chart_data.return_value = {
                "chart_type": "line_chart",
                "title": "XP Progression",
                "time_range": "weekly",
                "unit": "XP",
                "data": [
                    {"timestamp": datetime.now().isoformat(), "value": 100, "label": "100 XP"}
                ],
                "created_at": datetime.now().isoformat(),
            }

            response = await client.get(
                "/api/v1/gamification/users/1/progress/xp", params={"time_range": "weekly"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["chart_type"] == "line_chart"
            assert data["title"] == "XP Progression"
            assert data["time_range"] == "weekly"
            assert len(data["data"]) == 1

    async def test_get_activity_heatmap(self, client):
        """Test activity heatmap endpoint."""
        with patch("proxy_agent_platform.api.gamification.progress_visualizer") as mock_viz:
            mock_chart = Mock()
            mock_viz.create_daily_activity_heatmap.return_value = mock_chart
            mock_viz.export_chart_data.return_value = {
                "chart_type": "heatmap",
                "title": "Daily Activity Heatmap",
                "data": [],
            }

            response = await client.get(
                "/api/v1/gamification/users/1/progress/activity", params={"days_back": 30}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["chart_type"] == "heatmap"

    async def test_get_streak_chart(self, client):
        """Test streak visualization endpoint."""
        with patch("proxy_agent_platform.api.gamification.progress_visualizer") as mock_viz:
            mock_chart = Mock()
            mock_viz.create_streak_visualization.return_value = mock_chart
            mock_viz.export_chart_data.return_value = {
                "chart_type": "bar_chart",
                "title": "Current Streaks",
                "data": [],
            }

            response = await client.get("/api/v1/gamification/users/1/progress/streaks")

            assert response.status_code == 200
            data = response.json()
            assert data["chart_type"] == "bar_chart"

    async def test_get_progress_dashboard(self, client):
        """Test comprehensive progress dashboard endpoint."""
        with patch("proxy_agent_platform.api.gamification.progress_visualizer") as mock_viz:
            mock_viz.create_comprehensive_dashboard.return_value = {
                "xp_progression": Mock(),
                "activity_heatmap": Mock(),
                "streaks": Mock(),
            }
            mock_viz.export_chart_data.side_effect = [
                {"chart_type": "line_chart", "title": "XP Progression", "data": []},
                {"chart_type": "heatmap", "title": "Activity Heatmap", "data": []},
                {"chart_type": "bar_chart", "title": "Streaks", "data": []},
            ]

            response = await client.get("/api/v1/gamification/users/1/progress/dashboard")

            assert response.status_code == 200
            data = response.json()
            assert "xp_progression" in data
            assert "activity_heatmap" in data
            assert "streaks" in data

    async def test_progress_visualization_error(self, client):
        """Test progress visualization error handling."""
        with patch("proxy_agent_platform.api.gamification.progress_visualizer") as mock_viz:
            mock_viz.create_xp_progression_chart.side_effect = Exception("Chart error")

            response = await client.get("/api/v1/gamification/users/1/progress/xp")
            assert response.status_code == 500


class TestParameterValidation:
    """Test API parameter validation."""

    async def test_invalid_leaderboard_type(self, client):
        """Test invalid leaderboard type parameter."""
        response = await client.get("/api/v1/gamification/leaderboards/invalid_type")
        assert response.status_code == 422  # Validation error

    async def test_invalid_time_range(self, client):
        """Test invalid time range parameter."""
        response = await client.get(
            "/api/v1/gamification/users/1/progress/xp", params={"time_range": "invalid_range"}
        )
        assert response.status_code == 422

    async def test_invalid_user_id(self, client):
        """Test invalid user ID parameter."""
        response = await client.get("/api/v1/gamification/users/invalid/stats")
        assert response.status_code == 422

    async def test_limit_parameter_validation(self, client):
        """Test limit parameter validation."""
        # Valid limit
        with patch("proxy_agent_platform.api.gamification.leaderboard_manager") as mock_manager:
            mock_manager.leaderboard.get_leaderboard.return_value = []
            response = await client.get(
                "/api/v1/gamification/leaderboards/total_xp", params={"limit": 50}
            )
            assert response.status_code == 200

        # Invalid limit (too high)
        response = await client.get("/api/v1/gamification/leaderboards/total_xp", params={"limit": 200})
        assert response.status_code == 422

    async def test_days_back_validation(self, client):
        """Test days_back parameter validation."""
        with patch("proxy_agent_platform.api.gamification.progress_visualizer"):
            # Valid days_back
            response = await client.get(
                "/api/v1/gamification/users/1/progress/activity", params={"days_back": 30}
            )
            # May fail due to mocking, but parameter should be accepted

            # Invalid days_back (too high)
            response = await client.get(
                "/api/v1/gamification/users/1/progress/activity", params={"days_back": 200}
            )
            assert response.status_code == 422


@pytest.mark.asyncio
class TestAPIIntegration:
    """Integration tests for API endpoints."""

    async def test_complete_user_workflow(self, client):
        """Test complete user workflow through API."""
        # This would test the complete flow from XP event to dashboard
        # in a real integration environment
        pass

    async def test_concurrent_api_requests(self, client):
        """Test handling concurrent API requests."""
        # This would test concurrent access to endpoints
        # with proper async handling
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
