"""
Integration tests for Task API v2

Test-Driven Development workflow:
1. Write tests first (RED - they will fail)
2. Implement routes to make tests pass (GREEN)
3. Refactor while keeping tests green (REFACTOR)

These tests verify the complete request/response cycle through FastAPI.
"""

import pytest
from httpx import AsyncClient
from fastapi import status

from src.core.task_models import TaskStatus, TaskPriority


@pytest.mark.integration
@pytest.mark.asyncio
class TestTaskRoutesCreate:
    """Test task creation endpoint"""

    async def test_create_task_success(self, api_client: AsyncClient, test_project):
        """
        GIVEN: Valid task data and existing project
        WHEN: POST /api/v2/tasks
        THEN: Task is created with 201 status and correct data
        """
        # Arrange
        task_data = {
            "title": "Implement user authentication",
            "description": "Add JWT-based authentication system",
            "project_id": test_project.project_id,
            "priority": "high",
            "estimated_hours": 8.0,
            "tags": ["backend", "security"],
        }

        # Act
        response = await api_client.post("/api/v2/tasks", json=task_data)

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "Implement user authentication"
        assert data["description"] == "Add JWT-based authentication system"
        assert data["project_id"] == test_project.project_id
        assert data["status"] == "todo"  # Default status
        assert data["priority"] == "high"
        assert "task_id" in data
        assert "created_at" in data
        assert "updated_at" in data

    async def test_create_task_project_not_found(self, api_client: AsyncClient):
        """
        GIVEN: Invalid project_id
        WHEN: POST /api/v2/tasks
        THEN: 404 error with project_not_found code
        """
        # Arrange
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "project_id": "nonexistent_project_123",
        }

        # Act
        response = await api_client.post("/api/v2/tasks", json=task_data)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert data["error_code"] == "project_not_found"
        assert "nonexistent_project_123" in data["message"]

    async def test_create_task_validation_error(self, api_client: AsyncClient):
        """
        GIVEN: Invalid task data (missing required fields)
        WHEN: POST /api/v2/tasks
        THEN: 422 validation error
        """
        # Arrange
        invalid_data = {
            "title": "",  # Empty title (should fail min_length validation)
            "description": "Test",
        }

        # Act
        response = await api_client.post("/api/v2/tasks", json=invalid_data)

        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.integration
@pytest.mark.asyncio
class TestTaskRoutesRead:
    """Test task retrieval endpoints"""

    async def test_get_task_success(self, api_client: AsyncClient, test_task):
        """
        GIVEN: Task exists in database
        WHEN: GET /api/v2/tasks/{task_id}
        THEN: Task data is returned with 200 status
        """
        # Act
        response = await api_client.get(f"/api/v2/tasks/{test_task.task_id}")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["task_id"] == test_task.task_id
        assert data["title"] == test_task.title
        assert data["description"] == test_task.description
        assert data["project_id"] == test_task.project_id
        # Task model has use_enum_values=True, so status and priority are already strings
        assert data["status"] == test_task.status
        assert data["priority"] == test_task.priority

    async def test_get_task_not_found(self, api_client: AsyncClient):
        """
        GIVEN: Task does not exist
        WHEN: GET /api/v2/tasks/{task_id}
        THEN: 404 error with task_not_found code
        """
        # Act
        response = await api_client.get("/api/v2/tasks/nonexistent_task_123")

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert data["error_code"] == "task_not_found"
        assert "nonexistent_task_123" in data["message"]

    async def test_list_tasks_empty(self, api_client: AsyncClient):
        """
        GIVEN: No tasks in database
        WHEN: GET /api/v2/tasks
        THEN: Empty list with pagination metadata
        """
        # Act
        response = await api_client.get("/api/v2/tasks")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["tasks"] == []
        assert data["total"] == 0
        assert data["limit"] == 50  # Default limit
        assert data["skip"] == 0

    async def test_list_tasks_with_data(
        self, api_client: AsyncClient, test_project, test_task
    ):
        """
        GIVEN: Tasks exist in database
        WHEN: GET /api/v2/tasks
        THEN: Tasks are returned with pagination
        """
        # Act
        response = await api_client.get("/api/v2/tasks")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["tasks"]) >= 1
        assert data["total"] >= 1
        assert any(task["task_id"] == test_task.task_id for task in data["tasks"])

    async def test_list_tasks_with_project_filter(
        self, api_client: AsyncClient, test_project, test_task
    ):
        """
        GIVEN: Multiple tasks in different projects
        WHEN: GET /api/v2/tasks?project_id=X
        THEN: Only tasks from project X are returned
        """
        # Act
        response = await api_client.get(
            "/api/v2/tasks", params={"project_id": test_project.project_id}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(
            task["project_id"] == test_project.project_id for task in data["tasks"]
        )

    async def test_list_tasks_with_status_filter(
        self, api_client: AsyncClient, test_task
    ):
        """
        GIVEN: Tasks with different statuses
        WHEN: GET /api/v2/tasks?status=todo
        THEN: Only todo tasks are returned
        """
        # Act
        response = await api_client.get("/api/v2/tasks", params={"status": "todo"})

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(task["status"] == "todo" for task in data["tasks"])

    async def test_list_tasks_with_pagination(self, api_client: AsyncClient):
        """
        GIVEN: Tasks exist
        WHEN: GET /api/v2/tasks?limit=10&skip=0
        THEN: Pagination parameters are respected
        """
        # Act
        response = await api_client.get(
            "/api/v2/tasks", params={"limit": 10, "skip": 0}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["limit"] == 10
        assert data["skip"] == 0
        assert len(data["tasks"]) <= 10


@pytest.mark.integration
@pytest.mark.asyncio
class TestTaskRoutesUpdate:
    """Test task update endpoints"""

    async def test_update_task_success(self, api_client: AsyncClient, test_task):
        """
        GIVEN: Task exists
        WHEN: PUT /api/v2/tasks/{task_id} with updated data
        THEN: Task is updated and returned with 200 status
        """
        # Arrange
        update_data = {
            "title": "Updated Task Title",
            "description": "Updated description",
            "priority": "high",  # Valid values: low, medium, high, critical
        }

        # Act
        response = await api_client.put(
            f"/api/v2/tasks/{test_task.task_id}", json=update_data
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["task_id"] == test_task.task_id
        assert data["title"] == "Updated Task Title"
        assert data["description"] == "Updated description"
        assert data["priority"] == "high"
        assert data["updated_at"] != test_task.updated_at.isoformat()

    async def test_update_task_not_found(self, api_client: AsyncClient):
        """
        GIVEN: Task does not exist
        WHEN: PUT /api/v2/tasks/{task_id}
        THEN: 404 error with task_not_found code
        """
        # Arrange
        update_data = {"title": "Updated Title"}

        # Act
        response = await api_client.put(
            "/api/v2/tasks/nonexistent_task_123", json=update_data
        )

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert data["error_code"] == "task_not_found"

    async def test_update_task_partial(self, api_client: AsyncClient, test_task):
        """
        GIVEN: Task exists
        WHEN: PUT /api/v2/tasks/{task_id} with partial data
        THEN: Only specified fields are updated
        """
        # Arrange
        original_description = test_task.description
        update_data = {"title": "Only Title Updated"}

        # Act
        response = await api_client.put(
            f"/api/v2/tasks/{test_task.task_id}", json=update_data
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Only Title Updated"
        # Description should remain unchanged (assuming PUT allows partial updates)


@pytest.mark.integration
@pytest.mark.asyncio
class TestTaskRoutesStatusManagement:
    """Test task status update endpoint"""

    async def test_update_status_to_in_progress(
        self, api_client: AsyncClient, test_task
    ):
        """
        GIVEN: Task in todo status
        WHEN: PATCH /api/v2/tasks/{task_id}/status with in_progress
        THEN: Status updated and started_at is set
        """
        # Arrange
        status_update = {"status": "in_progress"}

        # Act
        response = await api_client.patch(
            f"/api/v2/tasks/{test_task.task_id}/status", json=status_update
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "in_progress"
        assert data["started_at"] is not None  # Should be set automatically
        assert data["completed_at"] is None

    async def test_update_status_to_completed(
        self, api_client: AsyncClient, test_task_in_progress
    ):
        """
        GIVEN: Task in progress
        WHEN: PATCH /api/v2/tasks/{task_id}/status with completed
        THEN: Status updated and completed_at is set
        """
        # Arrange
        status_update = {"status": "completed"}

        # Act
        response = await api_client.patch(
            f"/api/v2/tasks/{test_task_in_progress.task_id}/status", json=status_update
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "completed"
        assert data["completed_at"] is not None  # Should be set automatically
        assert data["started_at"] is not None  # Should still be set

    async def test_update_status_task_not_found(self, api_client: AsyncClient):
        """
        GIVEN: Task does not exist
        WHEN: PATCH /api/v2/tasks/{task_id}/status
        THEN: 404 error with task_not_found code
        """
        # Arrange
        status_update = {"status": "completed"}

        # Act
        response = await api_client.patch(
            "/api/v2/tasks/nonexistent_task_123/status", json=status_update
        )

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert data["error_code"] == "task_not_found"


@pytest.mark.integration
@pytest.mark.asyncio
class TestTaskRoutesDelete:
    """Test task deletion endpoint"""

    async def test_delete_task_success(self, api_client: AsyncClient, test_task):
        """
        GIVEN: Task exists
        WHEN: DELETE /api/v2/tasks/{task_id}
        THEN: Task is deleted with 204 status
        """
        # Act
        response = await api_client.delete(f"/api/v2/tasks/{test_task.task_id}")

        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify task is actually deleted
        get_response = await api_client.get(f"/api/v2/tasks/{test_task.task_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_task_not_found(self, api_client: AsyncClient):
        """
        GIVEN: Task does not exist
        WHEN: DELETE /api/v2/tasks/{task_id}
        THEN: 404 error with task_not_found code
        """
        # Act
        response = await api_client.delete("/api/v2/tasks/nonexistent_task_123")

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert data["error_code"] == "task_not_found"


@pytest.mark.integration
@pytest.mark.asyncio
class TestTaskRoutesSearch:
    """Test task search endpoint"""

    async def test_search_tasks_success(
        self, api_client: AsyncClient, test_task_searchable
    ):
        """
        GIVEN: Task with searchable content exists
        WHEN: GET /api/v2/tasks/search?q=authentication
        THEN: Matching tasks are returned
        """
        # Act
        response = await api_client.get(
            "/api/v2/tasks/search", params={"q": "authentication"}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert "query" in data
        assert data["query"] == "authentication"
        assert data["total"] >= 1
        assert any(
            "authentication" in result["title"].lower()
            or "authentication" in result["description"].lower()
            for result in data["results"]
        )

    async def test_search_tasks_no_results(self, api_client: AsyncClient):
        """
        GIVEN: No tasks match query
        WHEN: GET /api/v2/tasks/search?q=nonexistent_query_xyz
        THEN: Empty results with 200 status
        """
        # Act
        response = await api_client.get(
            "/api/v2/tasks/search", params={"q": "nonexistent_query_xyz"}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["results"] == []
        assert data["total"] == 0


@pytest.mark.integration
@pytest.mark.asyncio
class TestTaskRoutesStats:
    """Test task statistics endpoint"""

    async def test_get_task_stats(
        self, api_client: AsyncClient, test_project_with_tasks
    ):
        """
        GIVEN: Project with multiple tasks
        WHEN: GET /api/v2/tasks/stats?project_id=X
        THEN: Statistics are returned
        """
        # Act
        response = await api_client.get(
            "/api/v2/tasks/stats",
            params={"project_id": test_project_with_tasks.project_id},
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_tasks" in data
        assert "by_status" in data
        assert "by_priority" in data
        assert "completion_rate" in data
        assert data["total_tasks"] > 0
        assert isinstance(data["by_status"], dict)
        assert isinstance(data["by_priority"], dict)
        assert 0 <= data["completion_rate"] <= 1
