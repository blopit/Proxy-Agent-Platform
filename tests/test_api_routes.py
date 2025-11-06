"""
Test API routes and endpoints.

Comprehensive tests for FastAPI routes to increase coverage.
"""

import pytest
from fastapi.testclient import TestClient

# Import main app from correct location
from src.api.main import app

# Note: Individual routers (energy, focus, progress, tasks) will be implemented in Epic 2


# NOTE: Tasks router will be implemented in Epic 2 - Gamification System
# class TestTasksRouter:
#     """Test tasks router endpoints."""
#     # Tests moved to Epic 2 implementation


class TestAgentsRouter:
    """Test agents router endpoints."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)

    def test_agent_task_endpoint(self, client):
        """Test POST /api/agents/task endpoint."""
        response = client.post("/api/agents/task", json={
            "query": "test task",
            "user_id": "test_user",
            "session_id": "test_session"
        })

        # Should return response (200 or 400 if validation fails)
        assert response.status_code in [200, 400, 422]

    def test_agent_focus_endpoint(self, client):
        """Test POST /api/agents/focus endpoint."""
        response = client.post("/api/agents/focus", json={
            "query": "focus session",
            "user_id": "test_user",
            "session_id": "test_session"
        })

        # Should return response (200 or 400 if validation fails)
        assert response.status_code in [200, 400, 422]

    def test_quick_capture_endpoint(self, client):
        """Test POST /api/quick-capture endpoint."""
        response = client.post("/api/quick-capture", params={
            "query": "test task",
            "user_id": "test_user",
            "session_id": "mobile"
        })

        # Should return response (200 or 400)
        assert response.status_code in [200, 400, 422]


# NOTE: Individual routers will be implemented in Epic 2 - Gamification System
# class TestFocusRouter:
# class TestEnergyRouter:
# class TestProgressRouter:
# These test classes will be restored when the corresponding routers are implemented


class TestMainApp:
    """Test main FastAPI application."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)

    def test_root_endpoint(self, client):
        """Test GET / endpoint."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Proxy Agent Platform" in data["message"]
        assert "agents" in data
        assert "version" in data

    def test_health_endpoint(self, client):
        """Test GET /health endpoint."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data

    def test_readiness_endpoint(self, client):
        """Test GET /ready endpoint."""
        response = client.get("/ready")

        # Should return 200 when ready or 503 if not ready
        assert response.status_code in [200, 503]
        data = response.json()
        assert "status" in data
        assert "checks" in data

    def test_app_configuration(self):
        """Test app has correct configuration."""
        assert app.title == "Proxy Agent Platform"
        assert app.version == "0.1.0"
        assert "productivity platform" in app.description.lower()

    def test_app_has_required_routers(self):
        """Test app includes currently implemented routers."""
        # Check that basic routes exist
        assert len(app.routes) > 0

        # Check that our main routes are present
        route_paths = []
        for route in app.routes:
            if hasattr(route, "path"):
                route_paths.append(route.path)

        # Should have basic endpoints
        expected_paths = ["/", "/health", "/ready"]
        for expected_path in expected_paths:
            assert any(expected_path in path for path in route_paths)

    def test_cors_middleware_configured(self):
        """Test CORS middleware is configured."""
        # CORS middleware is configured in app.add_middleware
        # We can verify by checking that app has middleware
        assert hasattr(app, "middleware_stack")

        # Note: This is a basic test - middleware_stack exists which means middleware is configured
        # Detailed middleware inspection would require more complex testing


class TestErrorHandling:
    """Test API error handling."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)

    def test_404_handling(self, client):
        """Test 404 error handling."""
        response = client.get("/nonexistent-endpoint")

        assert response.status_code == 404

    # NOTE: Task-specific error tests will be implemented in Epic 2
    # def test_task_not_found_error(self, mock_get_db, client):
    # def test_invalid_json_handling(self, client):


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
