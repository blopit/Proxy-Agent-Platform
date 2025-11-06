"""Integration tests for statistics API endpoints."""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime


class TestStatisticsEndpoints:
    """Test suite for statistics API endpoints."""

    @pytest.fixture
    def setup_test_data(self, client: TestClient):
        """Setup test data for a user."""
        from src.api.statistics import _statistics_service

        _statistics_service._clear_data()

        # Add tasks and completions for test user
        _statistics_service._add_task("test_user_1", {"id": "task_1"})
        _statistics_service._add_task("test_user_1", {"id": "task_2"})
        _statistics_service._add_task("test_user_1", {"id": "task_3"})

        _statistics_service._add_completion(
            "test_user_1",
            {
                "task_id": "task_1",
                "completion_time_minutes": 25,
                "completed_at": datetime.now()
            }
        )
        _statistics_service._add_completion(
            "test_user_1",
            {
                "task_id": "task_2",
                "completion_time_minutes": 35,
                "completed_at": datetime.now()
            }
        )

        yield

        _statistics_service._clear_data()

    def test_get_user_statistics_success(self, client: TestClient, setup_test_data):
        """Test successful retrieval of user statistics."""
        response = client.get("/api/statistics/users/test_user_1")

        assert response.status_code == 200
        data = response.json()

        # Verify all required fields are present
        assert "user_id" in data
        assert "total_tasks" in data
        assert "completed_tasks" in data
        assert "completion_rate" in data
        assert "avg_completion_time_minutes" in data
        assert "productivity_score" in data
        assert "streak_days" in data

        # Verify correct values
        assert data["user_id"] == "test_user_1"
        assert data["total_tasks"] == 3
        assert data["completed_tasks"] == 2
        assert data["completion_rate"] == pytest.approx(66.67, rel=0.1)
        assert data["avg_completion_time_minutes"] == 30.0

    def test_get_user_statistics_nonexistent_user(self, client: TestClient):
        """Test statistics for nonexistent user returns empty stats."""
        response = client.get("/api/statistics/users/nonexistent_user")

        # Should return 200 with empty statistics (no tasks)
        assert response.status_code == 200
        data = response.json()
        assert data["total_tasks"] == 0
        assert data["completed_tasks"] == 0

    def test_get_user_statistics_content_type(self, client: TestClient):
        """Test that endpoint returns correct content type."""
        response = client.get("/api/statistics/users/test_user")

        assert response.headers["content-type"] == "application/json"

    def test_get_user_statistics_only_accepts_get(self, client: TestClient):
        """Test that endpoint only accepts GET requests."""
        post_response = client.post("/api/statistics/users/test_user")
        assert post_response.status_code == 405  # Method Not Allowed

        put_response = client.put("/api/statistics/users/test_user")
        assert put_response.status_code == 405

        delete_response = client.delete("/api/statistics/users/test_user")
        assert delete_response.status_code == 405

    def test_get_user_statistics_performance(self, client: TestClient, setup_test_data):
        """Test that endpoint responds within 200ms."""
        import time

        start = time.perf_counter()
        response = client.get("/api/statistics/users/test_user_1")
        elapsed = (time.perf_counter() - start) * 1000  # Convert to ms

        assert response.status_code == 200
        assert elapsed < 200, f"Endpoint took {elapsed:.2f}ms (expected <200ms)"

    def test_get_productivity_score_success(self, client: TestClient, setup_test_data):
        """Test successful retrieval of productivity score."""
        response = client.get("/api/statistics/users/test_user_1/productivity")

        assert response.status_code == 200
        data = response.json()

        # Verify required fields
        assert "user_id" in data
        assert "productivity_score" in data

        # Verify correct values
        assert data["user_id"] == "test_user_1"
        assert isinstance(data["productivity_score"], (int, float))
        assert 0.0 <= data["productivity_score"] <= 100.0

    def test_get_productivity_score_nonexistent_user(self, client: TestClient):
        """Test productivity score for nonexistent user."""
        response = client.get("/api/statistics/users/nonexistent_user/productivity")

        # Should return 200 with score of 0
        assert response.status_code == 200
        data = response.json()
        assert data["productivity_score"] == 0.0

    def test_get_productivity_score_content_type(self, client: TestClient):
        """Test that endpoint returns correct content type."""
        response = client.get("/api/statistics/users/test_user/productivity")

        assert response.headers["content-type"] == "application/json"

    def test_get_productivity_score_only_accepts_get(self, client: TestClient):
        """Test that endpoint only accepts GET requests."""
        post_response = client.post("/api/statistics/users/test_user/productivity")
        assert post_response.status_code == 405

    def test_get_productivity_score_performance(self, client: TestClient, setup_test_data):
        """Test that endpoint responds within 200ms."""
        import time

        start = time.perf_counter()
        response = client.get("/api/statistics/users/test_user_1/productivity")
        elapsed = (time.perf_counter() - start) * 1000

        assert response.status_code == 200
        assert elapsed < 200, f"Endpoint took {elapsed:.2f}ms (expected <200ms)"

    def test_concurrent_requests_handling(self, client: TestClient, setup_test_data):
        """Test that API handles concurrent requests correctly."""
        import concurrent.futures

        def make_request():
            return client.get("/api/statistics/users/test_user_1")

        # Make 10 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            responses = [f.result() for f in futures]

        # All requests should succeed
        assert all(r.status_code == 200 for r in responses)

        # All should return consistent data
        data_list = [r.json() for r in responses]
        first_total = data_list[0]["total_tasks"]
        assert all(d["total_tasks"] == first_total for d in data_list)

    def test_multiple_users_isolation(self, client: TestClient):
        """Test that statistics for different users are isolated."""
        from src.api.statistics import _statistics_service

        _statistics_service._clear_data()

        # Setup data for two users
        _statistics_service._add_task("user_a", {"id": "task_1"})
        _statistics_service._add_task("user_b", {"id": "task_1"})
        _statistics_service._add_task("user_b", {"id": "task_2"})

        # Get statistics for both users
        response_a = client.get("/api/statistics/users/user_a")
        response_b = client.get("/api/statistics/users/user_b")

        assert response_a.status_code == 200
        assert response_b.status_code == 200

        data_a = response_a.json()
        data_b = response_b.json()

        # Verify isolation
        assert data_a["total_tasks"] == 1
        assert data_b["total_tasks"] == 2

        _statistics_service._clear_data()

    def test_response_schema_validation(self, client: TestClient, setup_test_data):
        """Test that responses match the expected schema."""
        response = client.get("/api/statistics/users/test_user_1")

        assert response.status_code == 200
        data = response.json()

        # Verify types
        assert isinstance(data["user_id"], str)
        assert isinstance(data["total_tasks"], int)
        assert isinstance(data["completed_tasks"], int)
        assert isinstance(data["completion_rate"], (int, float))
        assert isinstance(data["avg_completion_time_minutes"], (int, float))
        assert isinstance(data["productivity_score"], (int, float))
        assert isinstance(data["streak_days"], int)

        # Verify constraints
        assert data["total_tasks"] >= 0
        assert data["completed_tasks"] >= 0
        assert 0.0 <= data["completion_rate"] <= 100.0
        assert data["avg_completion_time_minutes"] >= 0.0
        assert 0.0 <= data["productivity_score"] <= 100.0
        assert data["streak_days"] >= 0
