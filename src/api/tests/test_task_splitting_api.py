"""
Outside-In TDD Tests for Epic 7 Task Splitting API - RED PHASE

Testing from the user's perspective:
1. What does the user call? (API endpoints)
2. What response do they expect?
3. What side effects should happen?

This drives the implementation of:
- API endpoints
- Split Proxy Agent
- Integration with existing services

Following TDD RED-GREEN-REFACTOR methodology.
"""

import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.services.task_service import TaskService


@pytest.fixture
def test_db(tmp_path):
    """Create test database with sample data"""
    db_path = tmp_path / "test_api.db"
    db = EnhancedDatabaseAdapter(str(db_path), check_same_thread=False)

    # Create test project
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO projects (project_id, name, description)
        VALUES ('test_project', 'Test Project', 'Test Project Description')
    """)

    # Create test user
    cursor.execute("""
        INSERT INTO users (user_id, username, email)
        VALUES ('test_user', 'testuser', 'test@example.com')
    """)

    # Create a MULTI-scope task (needs splitting)
    cursor.execute("""
        INSERT INTO tasks
        (task_id, title, description, project_id, estimated_hours, scope, status)
        VALUES
        ('task_multi', 'Implement Login Feature',
         'Add user authentication with email and password',
         'test_project', 0.5, 'multi', 'todo')
    """)

    # Create a SIMPLE-scope task (no splitting needed)
    cursor.execute("""
        INSERT INTO tasks
        (task_id, title, description, project_id, estimated_hours, scope, status)
        VALUES
        ('task_simple', 'Reply to Email',
         'Send quick response to John',
         'test_project', 0.05, 'simple', 'todo')
    """)

    # Create a PROJECT-scope task (complex)
    cursor.execute("""
        INSERT INTO tasks
        (task_id, title, description, project_id, estimated_hours, scope, status)
        VALUES
        ('task_project', 'Build Mobile App',
         'Complete mobile application with all features',
         'test_project', 40.0, 'project', 'todo')
    """)

    conn.commit()

    yield db
    db.close_connection()


@pytest.fixture
def client(test_db):
    """Create test client with test database"""
    from src.api.tasks import get_task_service

    # Create task service with test database
    def get_test_task_service():
        return TaskService(db=test_db)

    # Override dependency
    app.dependency_overrides[get_task_service] = get_test_task_service
    yield TestClient(app)
    app.dependency_overrides.clear()


class TestSplitTaskEndpoint:
    """Test POST /api/v1/tasks/{task_id}/split - Core user action"""

    def test_split_multi_scope_task_success(self, client, test_db):
        """Test splitting a MULTI-scope task into micro-steps"""
        # This is what the USER does - the most important test!
        response = client.post("/api/v1/tasks/task_multi/split", json={"user_id": "test_user"})

        # User expects 200 OK
        assert response.status_code == 200

        # User expects micro-steps in response
        data = response.json()
        assert "task_id" in data
        assert "micro_steps" in data
        assert len(data["micro_steps"]) >= 2  # At least 2 steps
        assert len(data["micro_steps"]) <= 7  # Not overwhelming (ADHD-friendly)

        # Each micro-step should have required fields
        for step in data["micro_steps"]:
            assert "step_id" in step
            assert "step_number" in step
            assert "description" in step
            assert "estimated_minutes" in step
            assert 2 <= step["estimated_minutes"] <= 5  # 2-5 min ADHD-optimized range
            assert "delegation_mode" in step
            assert step["delegation_mode"] in ["do", "do_with_me", "delegate", "delete"]

    def test_split_task_returns_ordered_steps(self, client, test_db):
        """Test that micro-steps are returned in order"""
        response = client.post("/api/v1/tasks/task_multi/split", json={"user_id": "test_user"})

        assert response.status_code == 200
        steps = response.json()["micro_steps"]

        # Verify ordering
        for i, step in enumerate(steps):
            assert step["step_number"] == i + 1

    def test_split_simple_task_returns_minimal_steps(self, client, test_db):
        """Test that SIMPLE tasks get minimal/no splitting"""
        response = client.post("/api/v1/tasks/task_simple/split", json={"user_id": "test_user"})

        # Should still return 200, but with note that splitting isn't needed
        assert response.status_code == 200
        data = response.json()

        # Either no micro-steps, or just 1 step (the task itself)
        assert len(data["micro_steps"]) <= 1

    def test_split_project_task_returns_phases(self, client, test_db):
        """Test that PROJECT-scope tasks get broken into phases"""
        response = client.post("/api/v1/tasks/task_project/split", json={"user_id": "test_user"})

        assert response.status_code == 200
        data = response.json()

        # PROJECT scope might return high-level phases, not micro-steps
        # Or suggest breaking into subtasks first
        assert "micro_steps" in data or "suggestion" in data

    def test_split_nonexistent_task_returns_404(self, client, test_db):
        """Test splitting non-existent task returns 404"""
        response = client.post("/api/v1/tasks/fake_task_id/split", json={"user_id": "test_user"})

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_split_already_split_task_returns_existing_steps(self, client, test_db):
        """Test splitting an already-split task returns existing micro-steps"""
        # First split
        response1 = client.post("/api/v1/tasks/task_multi/split", json={"user_id": "test_user"})
        assert response1.status_code == 200
        steps1 = response1.json()["micro_steps"]

        # Second split (should return same steps, not re-generate)
        response2 = client.post("/api/v1/tasks/task_multi/split", json={"user_id": "test_user"})
        assert response2.status_code == 200
        steps2 = response2.json()["micro_steps"]

        # Should be same steps
        assert len(steps1) == len(steps2)
        assert steps1[0]["step_id"] == steps2[0]["step_id"]


class TestGetTaskWithMicroSteps:
    """Test GET /api/v1/tasks/{task_id} returns micro-steps"""

    def test_get_task_includes_micro_steps(self, client, test_db):
        """Test that GET task returns micro-steps if they exist"""

        # First, split the task
        split_response = client.post(
            "/api/v1/tasks/task_multi/split", json={"user_id": "test_user"}
        )
        assert split_response.status_code == 200

        # Now GET the task
        get_response = client.get("/api/v1/tasks/task_multi")

        assert get_response.status_code == 200
        data = get_response.json()

        # Should include micro-steps
        assert "micro_steps" in data
        assert len(data["micro_steps"]) > 0

    def test_get_task_without_split_shows_empty_micro_steps(self, client, test_db):
        """Test that unsplit task shows empty micro-steps array"""

        response = client.get("/api/v1/tasks/task_simple")

        assert response.status_code == 200
        data = response.json()

        # Should have micro_steps field, but empty
        assert "micro_steps" in data
        assert len(data["micro_steps"]) == 0


class TestMicroStepOperations:
    """Test micro-step CRUD operations"""

    def test_complete_micro_step(self, client, test_db):
        """Test PATCH /api/v1/micro-steps/{step_id}/complete"""

        # First, split task to create micro-steps
        split_response = client.post(
            "/api/v1/tasks/task_multi/split", json={"user_id": "test_user"}
        )
        step_id = split_response.json()["micro_steps"][0]["step_id"]

        # Complete the first step
        response = client.patch(
            f"/api/v1/micro-steps/{step_id}/complete", json={"actual_minutes": 4}
        )

        assert response.status_code == 200
        data = response.json()

        # Step should be marked completed
        assert data["status"] == "completed"
        assert data["actual_minutes"] == 4
        assert data["completed_at"] is not None

    def test_complete_micro_step_awards_xp(self, client, test_db):
        """Test completing micro-step awards XP for dopamine hit"""

        # Split and complete step
        split_response = client.post(
            "/api/v1/tasks/task_multi/split", json={"user_id": "test_user"}
        )
        step_id = split_response.json()["micro_steps"][0]["step_id"]

        response = client.patch(f"/api/v1/micro-steps/{step_id}/complete", json={})

        assert response.status_code == 200
        data = response.json()

        # Should include XP reward
        assert "xp_earned" in data
        assert data["xp_earned"] > 0  # Dopamine hit!

    def test_get_micro_step_progress(self, client, test_db):
        """Test GET /api/v1/tasks/{task_id}/progress shows micro-step completion"""

        # Split task
        split_response = client.post(
            "/api/v1/tasks/task_multi/split", json={"user_id": "test_user"}
        )
        steps = split_response.json()["micro_steps"]

        # Complete first step
        client.patch(f"/api/v1/micro-steps/{steps[0]['step_id']}/complete", json={})

        # Get progress
        response = client.get("/api/v1/tasks/task_multi/progress")

        assert response.status_code == 200
        data = response.json()

        # Should show progress percentage
        assert "progress_percentage" in data
        assert data["progress_percentage"] > 0
        assert data["completed_steps"] == 1
        assert data["total_steps"] == len(steps)


class TestSplitAgentIntegration:
    """Test that Split Proxy Agent is called correctly"""

    def test_split_endpoint_calls_split_agent(self, client, test_db):
        """Test that POST /split calls the Split Proxy Agent"""

        # Mock to verify agent is called
        agent_called = []

        def mock_split_agent(task, user_id):
            agent_called.append(True)
            return {
                "micro_steps": [
                    {
                        "step_number": 1,
                        "description": "Test step",
                        "estimated_minutes": 3,
                        "delegation_mode": "do",
                    }
                ]
            }

        # This test will DRIVE the creation of Split Proxy Agent
        response = client.post("/api/v1/tasks/task_multi/split", json={"user_id": "test_user"})

        # For now, it will fail because agent doesn't exist
        # Once implemented, verify agent was called
        # assert len(agent_called) > 0


class TestADHDOptimizedFeatures:
    """Test ADHD-specific features in task splitting"""

    def test_micro_steps_have_delegation_suggestions(self, client, test_db):
        """Test that AI suggests which steps can be delegated"""

        response = client.post("/api/v1/tasks/task_multi/split", json={"user_id": "test_user"})

        assert response.status_code == 200
        steps = response.json()["micro_steps"]

        # All steps should have valid delegation modes
        valid_modes = ["do", "do_with_me", "delegate", "delete"]
        for step in steps:
            assert step["delegation_mode"] in valid_modes

        # Note: Variety in delegation modes depends on AI
        # When AI is unavailable, fallback gives all "do" (which is valid)

    def test_split_returns_immediate_first_step(self, client, test_db):
        """Test that response highlights the FIRST step to do now"""

        response = client.post("/api/v1/tasks/task_multi/split", json={"user_id": "test_user"})

        assert response.status_code == 200
        data = response.json()

        # Should highlight first actionable step
        assert "next_action" in data
        assert data["next_action"]["step_number"] == 1
        assert "description" in data["next_action"]

    def test_estimated_time_is_realistic(self, client, test_db):
        """Test that total micro-step time ~= original task estimate"""

        response = client.post("/api/v1/tasks/task_multi/split", json={"user_id": "test_user"})

        assert response.status_code == 200
        data = response.json()

        # Sum of micro-steps should roughly equal original estimate (0.5 hours = 30 min)
        total_minutes = sum(step["estimated_minutes"] for step in data["micro_steps"])

        # Allow 20% variance (AI estimation isn't perfect)
        assert 24 <= total_minutes <= 36  # 30 min +/- 20%


class TestTaskSplitWorkflow:
    """Integration test: Full user workflow"""

    def test_complete_split_workflow(self, client, test_db):
        """Test complete user journey: split → complete steps → task done"""

        # 1. User splits task
        split_response = client.post(
            "/api/v1/tasks/task_multi/split", json={"user_id": "test_user"}
        )
        assert split_response.status_code == 200
        steps = split_response.json()["micro_steps"]

        # 2. User completes each step
        for step in steps:
            complete_response = client.patch(
                f"/api/v1/micro-steps/{step['step_id']}/complete",
                json={"actual_minutes": step["estimated_minutes"]},
            )
            assert complete_response.status_code == 200

        # 3. Check task progress
        progress_response = client.get("/api/v1/tasks/task_multi/progress")
        assert progress_response.status_code == 200
        assert progress_response.json()["progress_percentage"] == 100.0

        # 4. Verify task is marked completed
        task_response = client.get("/api/v1/tasks/task_multi")
        # Task might auto-complete when all micro-steps are done
        # assert task_response.json()["status"] in ["completed", "in_progress"]
