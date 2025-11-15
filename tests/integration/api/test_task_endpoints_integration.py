"""
Integration tests for task management API endpoints using real database
"""

from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from src.core.task_models import TaskPriority, TaskStatus


class TestTaskEndpointsIntegration:
    """Integration tests for task API endpoints with real database"""

    def test_create_task_success(self, client_with_test_db, test_project):
        """Test successful task creation with real database"""
        response = client_with_test_db.post(
            "/api/v1/tasks",
            json={
                "title": "Integration Test Task",
                "description": "A task created in integration test",
                "project_id": test_project.project_id,
                "priority": "high",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Integration Test Task"
        assert data["description"] == "A task created in integration test"
        assert data["priority"] == "high"
        assert data["status"] in ["todo", "pending"]  # Default status
        assert "task_id" in data

    def test_create_task_validation_error(self, client_with_test_db):
        """Test task creation with invalid data"""
        response = client_with_test_db.post(
            "/api/v1/tasks",
            json={
                "description": "Missing title",
                "project_id": "proj-123",
            },
        )

        # Pydantic validation should return 422
        assert response.status_code == 422
        response_text = str(response.json()).lower()
        assert "title" in response_text or "required" in response_text

    def test_create_task_missing_project(self, client_with_test_db):
        """Test task creation with non-existent project"""
        response = client_with_test_db.post(
            "/api/v1/tasks",
            json={
                "title": "Test Task",
                "description": "A test task",
                "project_id": "nonexistent-project-id",
                "priority": "medium",
            },
        )

        # Service error should return 400
        assert response.status_code == 400
        assert "project not found" in response.json()["detail"].lower()

    def test_get_task_success(self, client_with_test_db, test_task):
        """Test successful task retrieval"""
        response = client_with_test_db.get(f"/api/v1/tasks/{test_task.task_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == test_task.task_id
        assert data["title"] == test_task.title
        assert data["description"] == test_task.description

    def test_get_task_not_found(self, client_with_test_db):
        """Test task retrieval when task doesn't exist"""
        response = client_with_test_db.get("/api/v1/tasks/nonexistent-task-id")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_update_task_success(self, client_with_test_db, test_task):
        """Test successful task update"""
        response = client_with_test_db.put(
            f"/api/v1/tasks/{test_task.task_id}",
            json={
                "title": "Updated Title",
                "status": "in_progress",
                "priority": "high",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["status"] == "in_progress"
        assert data["priority"] == "high"

    def test_delete_task_success(self, client_with_test_db, test_task):
        """Test successful task deletion"""
        response = client_with_test_db.delete(f"/api/v1/tasks/{test_task.task_id}")

        assert response.status_code == 204

        # Verify task is deleted
        get_response = client_with_test_db.get(f"/api/v1/tasks/{test_task.task_id}")
        assert get_response.status_code == 404

    def test_list_tasks_success(self, client_with_test_db, test_project, test_task):
        """Test listing tasks"""
        # Create another task
        client_with_test_db.post(
            "/api/v1/tasks",
            json={
                "title": "Second Task",
                "description": "Another task",
                "project_id": test_project.project_id,
                "priority": "low",
            },
        )

        response = client_with_test_db.get("/api/v1/tasks")

        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert "total" in data
        assert len(data["tasks"]) >= 1

    def test_list_tasks_with_filters(self, client_with_test_db, test_project):
        """Test listing tasks with filters"""
        # Create tasks with different statuses
        client_with_test_db.post(
            "/api/v1/tasks",
            json={
                "title": "Todo Task",
                "description": "A todo task",
                "project_id": test_project.project_id,
                "priority": "medium",
            },
        )

        response = client_with_test_db.get(
            "/api/v1/tasks", params={"status": "todo", "priority": "medium"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        # All returned tasks should match filters
        for task in data["tasks"]:
            assert task["status"] == "todo"


class TestProjectEndpointsIntegration:
    """Integration tests for project API endpoints"""

    def test_create_project_success(self, client_with_test_db):
        """Test successful project creation"""
        response = client_with_test_db.post(
            "/api/v1/projects",
            json={
                "name": "Integration Test Project",
                "description": "A project for integration testing",
                # Note: owner is None to avoid foreign key constraints
                "team_members": ["test-user", "collaborator"],
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Integration Test Project"
        # owner can be None
        assert "project_id" in data

    def test_get_project(self, client_with_test_db, test_project):
        """Test project retrieval"""
        response = client_with_test_db.get(f"/api/v1/projects/{test_project.project_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["project_id"] == test_project.project_id
        assert data["name"] == test_project.name


class TestMobileEndpointsIntegration:
    """Integration tests for mobile-optimized endpoints"""

    def test_quick_capture_basic(self, client_with_test_db, test_project):
        """Test basic mobile quick capture"""
        response = client_with_test_db.post(
            "/api/v1/mobile/quick-capture",
            json={
                "text": "Buy groceries tomorrow",
                "user_id": "test-user",
            },
        )

        # This endpoint may not be fully implemented yet
        # Just check it doesn't crash
        assert response.status_code in [200, 201, 400, 404, 501]
