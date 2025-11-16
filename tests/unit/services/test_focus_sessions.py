"""
TDD Tests for Focus Sessions Service (BE-03).

Following RED-GREEN-REFACTOR workflow.
These tests define the expected behavior BEFORE implementation.
"""

from uuid import uuid4


class TestFocusSessionsAPI:
    """TDD tests for focus sessions API endpoints."""

    def test_start_focus_session_success(self, test_client, sample_session_data):
        """Test starting a new focus session."""
        response = test_client.post("/api/v1/focus/sessions", json=sample_session_data)

        assert response.status_code == 201
        data = response.json()
        assert "session_id" in data
        assert data["user_id"] == "test-user-123"
        assert data["duration_minutes"] == 25
        assert data["completed"] is False
        assert data["interruptions"] == 0
        assert "started_at" in data
        assert data["ended_at"] is None

    def test_start_session_validation_error_invalid_duration(self, test_client):
        """Test validation fails with invalid duration."""
        invalid_data = {
            "user_id": "test-user-123",
            "duration_minutes": 200,  # Too long (max is 90)
        }
        response = test_client.post("/api/v1/focus/sessions", json=invalid_data)
        assert response.status_code == 422

    def test_start_session_validation_error_no_user_id(self, test_client):
        """Test validation fails without user_id."""
        invalid_data = {
            "duration_minutes": 25,
            # Missing user_id
        }
        response = test_client.post("/api/v1/focus/sessions", json=invalid_data)
        assert response.status_code == 422

    def test_end_focus_session_success(self, test_client, sample_session_data):
        """Test ending a focus session."""
        # Start a session
        create_response = test_client.post("/api/v1/focus/sessions", json=sample_session_data)
        session_id = create_response.json()["session_id"]

        # End the session
        end_data = {"completed": True, "interruptions": 0}
        response = test_client.put(f"/api/v1/focus/sessions/{session_id}", json=end_data)

        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert data["completed"] is True
        assert data["ended_at"] is not None
        assert data["interruptions"] == 0

    def test_end_session_with_interruptions(self, test_client, sample_session_data):
        """Test ending a session with interruptions tracked."""
        # Start session
        create_response = test_client.post("/api/v1/focus/sessions", json=sample_session_data)
        session_id = create_response.json()["session_id"]

        # End with interruptions
        end_data = {"completed": False, "interruptions": 3}
        response = test_client.put(f"/api/v1/focus/sessions/{session_id}", json=end_data)

        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is False
        assert data["interruptions"] == 3

    def test_end_session_not_found(self, test_client):
        """Test 404 for non-existent session."""
        fake_id = str(uuid4())
        end_data = {"completed": True}
        response = test_client.put(f"/api/v1/focus/sessions/{fake_id}", json=end_data)
        assert response.status_code == 404

    def test_get_user_sessions(self, test_client, sample_session_data):
        """Test retrieving user's focus sessions."""
        # Create 3 sessions
        for _i in range(3):
            test_client.post("/api/v1/focus/sessions", json=sample_session_data)

        # Get user sessions
        response = test_client.get("/api/v1/focus/sessions/user/test-user-123")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3
        assert all(s["user_id"] == "test-user-123" for s in data)

    def test_get_user_sessions_with_limit(self, test_client, sample_session_data):
        """Test pagination with limit parameter."""
        # Create 5 sessions
        for _i in range(5):
            test_client.post("/api/v1/focus/sessions", json=sample_session_data)

        # Get only 2
        response = test_client.get("/api/v1/focus/sessions/user/test-user-123?limit=2")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_get_focus_analytics(self, test_client, sample_session_data):
        """Test analytics endpoint calculates metrics correctly."""
        # Create and complete 2 sessions
        for _i in range(2):
            create_resp = test_client.post("/api/v1/focus/sessions", json=sample_session_data)
            session_id = create_resp.json()["session_id"]
            # Complete session
            test_client.put(
                f"/api/v1/focus/sessions/{session_id}",
                json={"completed": True, "interruptions": 0},
            )

        # Get analytics
        response = test_client.get("/api/v1/focus/sessions/analytics/test-user-123")

        assert response.status_code == 200
        data = response.json()
        assert "total_sessions" in data
        assert data["total_sessions"] >= 2
        assert "completed_sessions" in data
        assert data["completed_sessions"] >= 2
        assert "completion_rate" in data
        assert data["completion_rate"] == 1.0  # 100% completion
        assert "total_focus_minutes" in data
        assert data["total_focus_minutes"] >= 50  # 2 * 25 minutes
        assert "average_duration_minutes" in data

    def test_analytics_with_no_sessions(self, test_client):
        """Test analytics for user with no sessions."""
        response = test_client.get("/api/v1/focus/sessions/analytics/no-sessions-user")

        assert response.status_code == 200
        data = response.json()
        assert data["total_sessions"] == 0
        assert data["completed_sessions"] == 0
        assert data["completion_rate"] == 0.0
        assert data["total_focus_minutes"] == 0
