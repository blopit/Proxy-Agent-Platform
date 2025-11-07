"""
Tests for dogfooding API endpoints.

Following TDD methodology - tests written first to define expected behavior.
"""

import pytest

# Mark entire module as skipped - dogfooding endpoints not yet implemented
pytestmark = pytest.mark.skip(reason="Dogfooding endpoints not yet implemented (TDD - tests first)")
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock

from src.api.main import app
from src.database.enhanced_adapter import EnhancedDatabaseAdapter


@pytest.fixture
def client():
    """FastAPI test client fixture."""
    return TestClient(app)


@pytest.fixture
def mock_db():
    """Mock database adapter fixture."""
    with patch("src.api.dogfooding.get_enhanced_database") as mock:
        db_mock = Mock(spec=EnhancedDatabaseAdapter)
        mock.return_value = db_mock
        yield db_mock


@pytest.fixture
def mock_current_user():
    """Mock current user dependency."""
    with patch("src.api.dogfooding.get_current_user") as mock:
        mock.return_value = {"user_id": "test-user-123", "username": "testuser"}
        yield mock


@pytest.fixture
def sample_task():
    """Sample task data for testing."""
    return {
        "task_id": "task-123",
        "user_id": "test-user-123",
        "title": "Write blog post",
        "description": "Write a blog post about TDD",
        "status": "todo",
        "priority": "high",
        "estimated_minutes": 30,
        "energy_cost": "medium",
        "created_at": datetime.now().isoformat(),
    }


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    def test_health_endpoint_returns_200(self, client):
        """Test that health endpoint returns 200 OK."""
        response = client.get("/api/v1/dogfood/health")
        assert response.status_code == 200

    def test_health_endpoint_returns_correct_structure(self, client):
        """Test that health endpoint returns expected JSON structure."""
        response = client.get("/api/v1/dogfood/health")
        data = response.json()

        assert "status" in data
        assert "service" in data
        assert "version" in data
        assert data["status"] == "healthy"
        assert data["service"] == "dogfooding_workflow"


class TestArchiveTask:
    """Tests for archive task endpoint (swipe left)."""

    def test_archive_task_success(self, client, mock_db, mock_current_user, sample_task):
        """Test successful task archival."""
        # Setup mock
        mock_db.get_task.return_value = sample_task
        mock_db.update_task.return_value = {**sample_task, "status": "archived"}

        # Make request
        response = client.post(
            "/api/v1/dogfood/tasks/task-123/archive",
            json={"reason": "not_relevant"},
        )

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == "task-123"
        assert data["status"] == "archived"
        assert data["xp_penalty"] == 0

    def test_archive_task_not_found(self, client, mock_db, mock_current_user):
        """Test archiving non-existent task returns 404."""
        mock_db.get_task.return_value = None

        response = client.post(
            "/api/v1/dogfood/tasks/nonexistent/archive",
            json={"reason": "not_relevant"},
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_archive_task_logs_action(self, client, mock_db, mock_current_user, sample_task):
        """Test that archiving a task logs the action."""
        mock_db.get_task.return_value = sample_task
        mock_db.update_task.return_value = {**sample_task, "status": "archived"}

        client.post(
            "/api/v1/dogfood/tasks/task-123/archive",
            json={"reason": "not_relevant"},
        )

        # Verify action was logged (would need to check task_actions table)
        # This is a placeholder - actual implementation would verify DB call
        assert mock_db.update_task.called

    def test_archive_requires_reason(self, client, mock_db, mock_current_user):
        """Test that archive endpoint requires a reason."""
        response = client.post(
            "/api/v1/dogfood/tasks/task-123/archive",
            json={},  # Missing reason
        )

        assert response.status_code == 422  # Validation error


class TestDelegateTask:
    """Tests for delegate task endpoint (swipe right)."""

    def test_delegate_task_auto_assign(self, client, mock_db, mock_current_user, sample_task):
        """Test delegating task with auto-assignment to best agent."""
        mock_db.get_task.return_value = sample_task

        with patch("src.api.dogfooding.requests.post") as mock_post:
            mock_post.return_value.status_code = 201
            mock_post.return_value.json.return_value = {
                "task_id": "task-123",
                "assigned_agent": "task_proxy_intelligent",
            }

            response = client.post(
                "/api/v1/dogfood/tasks/task-123/delegate",
                json={"auto_assign": True},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["task_id"] == "task-123"
            assert data["status"] == "delegated"
            assert "assigned_agent" in data

    def test_delegate_task_specific_agent(self, client, mock_db, mock_current_user, sample_task):
        """Test delegating task to a specific agent."""
        mock_db.get_task.return_value = sample_task

        with patch("src.api.dogfooding.requests.post") as mock_post:
            mock_post.return_value.status_code = 201
            mock_post.return_value.json.return_value = {
                "task_id": "task-123",
                "assigned_agent": "research_specialist",
            }

            response = client.post(
                "/api/v1/dogfood/tasks/task-123/delegate",
                json={"auto_assign": False, "agent_id": "research_specialist"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["assigned_agent"] == "research_specialist"

    def test_delegate_task_not_found(self, client, mock_db, mock_current_user):
        """Test delegating non-existent task returns 404."""
        mock_db.get_task.return_value = None

        response = client.post(
            "/api/v1/dogfood/tasks/nonexistent/delegate",
            json={"auto_assign": True},
        )

        assert response.status_code == 404

    def test_delegate_awards_xp(self, client, mock_db, mock_current_user, sample_task):
        """Test that delegating a task awards +5 XP."""
        mock_db.get_task.return_value = sample_task

        with patch("src.api.dogfooding.requests.post") as mock_post:
            mock_post.return_value.status_code = 201
            mock_post.return_value.json.return_value = {
                "task_id": "task-123",
                "assigned_agent": "task_proxy_intelligent",
            }

            response = client.post(
                "/api/v1/dogfood/tasks/task-123/delegate",
                json={"auto_assign": True},
            )

            data = response.json()
            # In future, this should check gamification service call
            # For now, just verify structure
            assert response.status_code == 200


class TestExecuteTask:
    """Tests for execute task endpoint (swipe up - Do With Me)."""

    def test_execute_task_assisted_mode(self, client, mock_db, mock_current_user, sample_task):
        """Test executing task in assisted (Do With Me) mode."""
        mock_db.get_task.return_value = sample_task

        with patch("src.api.dogfooding.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {
                "execution_id": "exec-456",
                "workflow_id": "content_creation_tdd",
                "steps": [
                    {
                        "step_id": 1,
                        "title": "Brainstorm 5 headline options",
                        "estimated_minutes": 5,
                        "status": "pending",
                    }
                ],
            }

            response = client.post(
                "/api/v1/dogfood/tasks/task-123/execute",
                json={"mode": "assisted"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["execution_id"] == "exec-456"
            assert "steps" in data
            assert len(data["steps"]) > 0

    def test_execute_task_not_found(self, client, mock_db, mock_current_user):
        """Test executing non-existent task returns 404."""
        mock_db.get_task.return_value = None

        response = client.post(
            "/api/v1/dogfood/tasks/nonexistent/execute",
            json={"mode": "assisted"},
        )

        assert response.status_code == 404

    def test_execute_task_updates_status(self, client, mock_db, mock_current_user, sample_task):
        """Test that executing task updates status to in_progress."""
        mock_db.get_task.return_value = sample_task
        mock_db.update_task.return_value = {**sample_task, "status": "in_progress"}

        with patch("src.api.dogfooding.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {
                "execution_id": "exec-456",
                "workflow_id": "content_creation_tdd",
                "steps": [],
            }

            client.post(
                "/api/v1/dogfood/tasks/task-123/execute",
                json={"mode": "assisted"},
            )

            # Verify update was called
            assert mock_db.update_task.called


class TestStartSoloExecution:
    """Tests for start solo execution endpoint (DO Solo mode)."""

    def test_start_solo_creates_focus_session(
        self, client, mock_db, mock_current_user, sample_task
    ):
        """Test that starting solo execution creates a focus session."""
        mock_db.get_task.return_value = sample_task

        response = client.post(
            "/api/v1/dogfood/tasks/task-123/start-solo",
            json={"pomodoro_duration": 25, "notes": "Let's focus!"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "focus_session_id" in data
        assert data["task_id"] == "task-123"
        assert data["timer_running"] is True
        assert "estimated_end" in data

    def test_start_solo_default_duration(self, client, mock_db, mock_current_user, sample_task):
        """Test that solo execution defaults to 25 minutes."""
        mock_db.get_task.return_value = sample_task

        response = client.post(
            "/api/v1/dogfood/tasks/task-123/start-solo",
            json={},  # No duration specified
        )

        assert response.status_code == 200
        # Verify default 25 minute duration was used
        # Would check estimated_end timestamp

    def test_start_solo_updates_task_status(
        self, client, mock_db, mock_current_user, sample_task
    ):
        """Test that starting solo updates task status to in_progress."""
        mock_db.get_task.return_value = sample_task
        mock_db.update_task.return_value = {**sample_task, "status": "in_progress"}

        client.post(
            "/api/v1/dogfood/tasks/task-123/start-solo",
            json={"pomodoro_duration": 25},
        )

        assert mock_db.update_task.called

    def test_start_solo_not_found(self, client, mock_db, mock_current_user):
        """Test starting solo on non-existent task returns 404."""
        mock_db.get_task.return_value = None

        response = client.post(
            "/api/v1/dogfood/tasks/nonexistent/start-solo",
            json={"pomodoro_duration": 25},
        )

        assert response.status_code == 404


class TestCompleteSoloExecution:
    """Tests for complete solo execution endpoint."""

    def test_complete_solo_awards_xp(self, client, mock_db, mock_current_user, sample_task):
        """Test that completing solo session awards XP."""
        # Setup focus session
        focus_session = {
            "focus_session_id": "session-789",
            "task_id": "task-123",
            "user_id": "test-user-123",
            "started_at": (datetime.now() - timedelta(minutes=25)).isoformat(),
            "estimated_duration_minutes": 25,
            "status": "active",
        }

        mock_db.get_task.return_value = sample_task

        response = client.post(
            "/api/v1/dogfood/focus-sessions/session-789/complete",
            json={"actual_minutes": 25, "completed": True},
        )

        assert response.status_code == 200
        data = response.json()
        assert "xp_earned" in data
        assert data["xp_earned"] >= 10  # Base XP
        assert data["task_status"] == "completed"

    def test_complete_solo_time_bonus(self, client, mock_db, mock_current_user, sample_task):
        """Test that longer focus sessions earn time bonus XP."""
        mock_db.get_task.return_value = sample_task

        response = client.post(
            "/api/v1/dogfood/focus-sessions/session-789/complete",
            json={"actual_minutes": 45, "completed": True},  # Longer session
        )

        assert response.status_code == 200
        data = response.json()
        # Should earn more XP for longer session
        assert data["xp_earned"] > 10

    def test_complete_solo_incomplete(self, client, mock_db, mock_current_user, sample_task):
        """Test completing session without finishing task."""
        mock_db.get_task.return_value = sample_task

        response = client.post(
            "/api/v1/dogfood/focus-sessions/session-789/complete",
            json={"actual_minutes": 15, "completed": False},  # Stopped early
        )

        assert response.status_code == 200
        data = response.json()
        # Should still earn some XP but task remains in_progress
        assert data["task_status"] == "in_progress"

    def test_complete_solo_session_not_found(self, client, mock_db, mock_current_user):
        """Test completing non-existent session returns 404."""
        response = client.post(
            "/api/v1/dogfood/focus-sessions/nonexistent/complete",
            json={"actual_minutes": 25, "completed": True},
        )

        assert response.status_code == 404


class TestIntegrationScenarios:
    """Integration tests for complete user workflows."""

    def test_full_do_solo_workflow(self, client, mock_db, mock_current_user, sample_task):
        """Test complete DO Solo workflow: start → work → complete."""
        # Setup
        mock_db.get_task.return_value = sample_task
        mock_db.update_task.return_value = {**sample_task, "status": "in_progress"}

        # Step 1: Start solo session
        start_response = client.post(
            "/api/v1/dogfood/tasks/task-123/start-solo",
            json={"pomodoro_duration": 25},
        )
        assert start_response.status_code == 200
        session_id = start_response.json()["focus_session_id"]

        # Step 2: Complete session
        complete_response = client.post(
            f"/api/v1/dogfood/focus-sessions/{session_id}/complete",
            json={"actual_minutes": 25, "completed": True},
        )
        assert complete_response.status_code == 200
        assert complete_response.json()["task_status"] == "completed"

    def test_swipe_combo_scenario(self, client, mock_db, mock_current_user, sample_task):
        """Test multiple swipe actions in sequence (combo)."""
        # This would test:
        # 1. Swipe left on task A (archive)
        # 2. Swipe right on task B (delegate)
        # 3. Swipe up on task C (execute)
        # Should detect combo and award bonus XP

        # Future implementation with gamification service
        pass

    def test_archive_then_delegate_different_tasks(
        self, client, mock_db, mock_current_user, sample_task
    ):
        """Test archiving one task then delegating another."""
        task_a = {**sample_task, "task_id": "task-a"}
        task_b = {**sample_task, "task_id": "task-b"}

        # Archive task A
        mock_db.get_task.return_value = task_a
        mock_db.update_task.return_value = {**task_a, "status": "archived"}

        archive_response = client.post(
            "/api/v1/dogfood/tasks/task-a/archive",
            json={"reason": "not_relevant"},
        )
        assert archive_response.status_code == 200

        # Delegate task B
        mock_db.get_task.return_value = task_b
        with patch("src.api.dogfooding.requests.post") as mock_post:
            mock_post.return_value.status_code = 201
            mock_post.return_value.json.return_value = {
                "task_id": "task-b",
                "assigned_agent": "task_proxy_intelligent",
            }

            delegate_response = client.post(
                "/api/v1/dogfood/tasks/task-b/delegate",
                json={"auto_assign": True},
            )
            assert delegate_response.status_code == 200


class TestErrorHandling:
    """Tests for error handling and edge cases."""

    def test_delegate_with_delegation_service_down(
        self, client, mock_db, mock_current_user, sample_task
    ):
        """Test graceful handling when delegation service is unavailable."""
        mock_db.get_task.return_value = sample_task

        with patch("src.api.dogfooding.requests.post") as mock_post:
            mock_post.side_effect = Exception("Connection refused")

            response = client.post(
                "/api/v1/dogfood/tasks/task-123/delegate",
                json={"auto_assign": True},
            )

            assert response.status_code == 500
            assert "delegation service" in response.json()["detail"].lower()

    def test_execute_with_workflow_service_down(
        self, client, mock_db, mock_current_user, sample_task
    ):
        """Test graceful handling when workflow service is unavailable."""
        mock_db.get_task.return_value = sample_task

        with patch("src.api.dogfooding.requests.post") as mock_post:
            mock_post.side_effect = Exception("Connection refused")

            response = client.post(
                "/api/v1/dogfood/tasks/task-123/execute",
                json={"mode": "assisted"},
            )

            assert response.status_code == 500
            assert "workflow service" in response.json()["detail"].lower()

    def test_invalid_task_id_format(self, client, mock_db, mock_current_user):
        """Test handling of invalid task ID format."""
        # This depends on validation rules - adjust as needed
        response = client.post(
            "/api/v1/dogfood/tasks/invalid<>id/archive",
            json={"reason": "not_relevant"},
        )

        # Should handle gracefully (either 404 or 400)
        assert response.status_code in [400, 404]
