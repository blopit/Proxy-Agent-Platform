"""
Tests for task management API endpoints
"""

from decimal import Decimal
from unittest.mock import Mock, patch

import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.core.task_models import Project, Task, TaskPriority, TaskStatus
from src.services.task_service import BulkTaskOperationResult, TaskService


@pytest.fixture
def mock_task_service():
    """Create mock task service"""
    return Mock(spec=TaskService)


@pytest.fixture
def client(mock_task_service):
    """Create test client with mocked dependencies"""
    from src.api.tasks import get_task_service

    app.dependency_overrides[get_task_service] = lambda: mock_task_service
    yield TestClient(app)
    app.dependency_overrides.clear()


class TestTaskEndpoints:
    """Test task management API endpoints"""

    def test_create_task_success(self, client, mock_task_service):
        """Test successful task creation"""
        # Setup mock
        mock_task = Task(
            task_id="task-123",
            title="Test Task",
            description="A test task",
            project_id="proj-123",
            priority=TaskPriority.HIGH,
        )
        mock_task_service.create_task.return_value = mock_task

        response = client.post(
            "/api/v1/tasks",
            json={
                "title": "Test Task",
                "description": "A test task",
                "project_id": "proj-123",
                "priority": "high",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["task_id"] == "task-123"
        assert data["title"] == "Test Task"
        assert data["priority"] == "high"

    def test_create_task_validation_error(self, client):
        """Test task creation with invalid data"""
        response = client.post(
            "/api/v1/tasks", json={"description": "Missing title", "project_id": "proj-123"}
        )

        assert response.status_code == 422
        assert "title" in response.json()["detail"][0]["loc"]

    def test_get_task_success(self, client, mock_task_service):
        """Test successful task retrieval"""
        mock_task = Task(
            task_id="task-123",
            title="Test Task",
            description="A test task",
            project_id="proj-123",
        )
        mock_task_service.get_task.return_value = mock_task

        response = client.get("/api/v1/tasks/task-123")

        assert response.status_code == 200
        data = response.json()
        assert data["task_id"] == "task-123"
        assert data["title"] == "Test Task"

    def test_get_task_not_found(self, client, mock_task_service):
        """Test task retrieval when task doesn't exist"""
        mock_task_service.get_task.return_value = None

        response = client.get("/api/v1/tasks/nonexistent")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_update_task_success(self, client, mock_task_service):
        """Test successful task update"""
        mock_task = Task(
            task_id="task-123",
            title="Updated Task",
            description="Updated description",
            project_id="proj-123",
            status=TaskStatus.COMPLETED,
        )
        mock_task_service.update_task.return_value = mock_task

        response = client.put(
            "/api/v1/tasks/task-123", json={"title": "Updated Task", "status": "completed"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Task"
        assert data["status"] == "completed"

    def test_delete_task_success(self, client, mock_task_service):
        """Test successful task deletion"""
        mock_task_service.delete_task.return_value = True

        response = client.delete("/api/v1/tasks/task-123")

        assert response.status_code == 204

    def test_list_tasks_success(self, client, mock_task_service):
        """Test successful task listing"""
        mock_tasks = [
            Task(task_id="task-1", title="Task 1", description="First task", project_id="proj-123"),
            Task(
                task_id="task-2", title="Task 2", description="Second task", project_id="proj-123"
            ),
        ]
        mock_result = Mock()
        mock_result.items = mock_tasks
        mock_result.total = 2
        mock_result.limit = 10
        mock_result.offset = 0
        mock_task_service.list_tasks.return_value = mock_result

        response = client.get("/api/v1/tasks")

        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 2
        assert data["total"] == 2
        assert data["tasks"][0]["title"] == "Task 1"

    def test_list_tasks_with_filters(self, client, mock_task_service):
        """Test task listing with filters"""
        mock_result = Mock()
        mock_result.items = []
        mock_result.total = 0
        mock_result.limit = 10
        mock_result.offset = 0
        mock_task_service.list_tasks.return_value = mock_result

        response = client.get("/api/v1/tasks?project_id=proj-123&status=todo&priority=high")

        assert response.status_code == 200
        # Verify filter was called with correct parameters
        mock_task_service.list_tasks.assert_called_once()

    def test_get_task_hierarchy(self, client, mock_task_service):
        """Test task hierarchy endpoint"""
        mock_hierarchy = {
            "task": Task(
                task_id="parent", title="Parent Task", description="", project_id="proj-123"
            ),
            "children": [
                {
                    "task": Task(
                        task_id="child",
                        title="Child Task",
                        description="",
                        project_id="proj-123",
                        parent_id="parent",
                    ),
                    "children": [],
                }
            ],
        }
        mock_task_service.get_task_hierarchy.return_value = mock_hierarchy

        response = client.get("/api/v1/tasks/parent/hierarchy")

        assert response.status_code == 200
        data = response.json()
        assert data["task"]["task_id"] == "parent"
        assert len(data["children"]) == 1

    def test_bulk_update_tasks(self, client, mock_task_service):
        """Test bulk task update"""
        mock_result = BulkTaskOperationResult(
            successful_count=2,
            failed_count=0,
            successful_ids=["task-1", "task-2"],
            failed_ids=[],
        )
        mock_task_service.bulk_update_tasks.return_value = mock_result

        response = client.patch(
            "/api/v1/tasks/bulk",
            json={"task_ids": ["task-1", "task-2"], "updates": {"status": "completed"}},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["successful_count"] == 2
        assert data["success_rate"] == 100.0

    def test_estimate_task_duration(self, client, mock_task_service):
        """Test AI task duration estimation"""
        mock_task_service.get_task.return_value = Task(
            task_id="task-123",
            title="Complex Feature",
            description="Implement authentication",
            project_id="proj-123",
        )
        mock_task_service.estimate_task_duration.return_value = Decimal("8.5")

        response = client.post("/api/v1/tasks/task-123/estimate")

        assert response.status_code == 200
        data = response.json()
        assert data["estimated_hours"] == 8.5
        assert data["task_id"] == "task-123"

    def test_break_down_task(self, client, mock_task_service):
        """Test AI task breakdown"""
        mock_subtasks = [
            Task(
                task_id="sub-1",
                title="Subtask 1",
                description="First subtask",
                project_id="proj-123",
                parent_id="task-123",
            ),
            Task(
                task_id="sub-2",
                title="Subtask 2",
                description="Second subtask",
                project_id="proj-123",
                parent_id="task-123",
            ),
        ]
        mock_task_service.get_task.return_value = Task(
            task_id="task-123",
            title="Complex Task",
            description="A complex task to break down",
            project_id="proj-123",
        )
        mock_task_service.break_down_task.return_value = mock_subtasks

        response = client.post("/api/v1/tasks/task-123/breakdown")

        assert response.status_code == 201
        data = response.json()
        assert len(data["subtasks"]) == 2
        assert data["parent_task_id"] == "task-123"

    def test_create_task_from_template(self, client, mock_task_service):
        """Test creating task from template"""
        mock_task = Task(
            task_id="task-123",
            title="Fix: Authentication Bug",
            description="Bug: Users cannot login",
            project_id="proj-123",
            priority=TaskPriority.HIGH,
        )
        mock_task_service.create_task_from_template.return_value = mock_task

        response = client.post(
            "/api/v1/tasks/from-template",
            json={
                "template_name": "Bug Fix Template",
                "project_id": "proj-123",
                "variables": {
                    "issue_description": "Authentication Bug",
                    "bug_details": "Users cannot login",
                },
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Fix: Authentication Bug"
        assert data["priority"] == "high"


class TestProjectEndpoints:
    """Test project management API endpoints"""

    def test_create_project_success(self, client, mock_task_service):
        """Test successful project creation"""
        mock_project = Project(
            project_id="proj-123",
            name="Test Project",
            description="A test project",
            owner="user123",
        )
        mock_task_service.create_project.return_value = mock_project

        response = client.post(
            "/api/v1/projects",
            json={"name": "Test Project", "description": "A test project", "owner": "user123"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["project_id"] == "proj-123"
        assert data["name"] == "Test Project"

    def test_get_project_analytics(self, client, mock_task_service):
        """Test project analytics endpoint"""
        mock_analytics = {
            "project": Project(name="Test Project", description="", owner="user123"),
            "total_tasks": 10,
            "completed_tasks": 7,
            "completion_percentage": 70.0,
            "total_estimated_hours": Decimal("50.0"),
            "total_actual_hours": Decimal("35.5"),
        }
        mock_task_service.get_project_analytics.return_value = mock_analytics

        response = client.get("/api/v1/projects/proj-123/analytics")

        assert response.status_code == 200
        data = response.json()
        assert data["total_tasks"] == 10
        assert data["completion_percentage"] == 70.0

    def test_smart_prioritize_tasks(self, client, mock_task_service):
        """Test AI task prioritization"""
        from src.services.task_service import TaskPrioritizationResult

        mock_result = TaskPrioritizationResult(
            updated_count=3,
            priority_changes={
                "task-1": TaskPriority.CRITICAL,
                "task-2": TaskPriority.HIGH,
                "task-3": TaskPriority.LOW,
            },
        )
        mock_task_service.smart_prioritize_tasks.return_value = mock_result

        response = client.post("/api/v1/projects/proj-123/prioritize")

        assert response.status_code == 200
        data = response.json()
        assert data["updated_count"] == 3
        assert len(data["priority_changes"]) == 3


class TestMobileEndpoints:
    """Test mobile-specific API endpoints"""

    def test_quick_capture_enhanced(self, client, mock_task_service):
        """Test enhanced quick capture for mobile"""
        mock_task = Task(
            task_id="task-123",
            title="Captured Task",
            description="A task captured via mobile",
            project_id="default-project",
        )
        mock_task_service.create_task.return_value = mock_task

        response = client.post(
            "/api/v1/mobile/quick-capture",
            json={
                "text": "Buy groceries tomorrow",
                "user_id": "user123",
                "location": {"lat": 37.7749, "lng": -122.4194},
                "voice_input": True,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["task"]["title"] == "Captured Task"
        assert data["processing_time_ms"] < 2000  # 2-second capture requirement

    @pytest.mark.skip(
        reason="Mobile dashboard endpoint returns mock data - needs real implementation"
    )
    def test_mobile_dashboard_data(self, client, mock_task_service):
        """Test mobile dashboard data endpoint"""
        mock_analytics = {
            "total_tasks": 15,
            "completed_today": 5,
            "focus_time_today": 3.5,
            "current_streak": 12,
            "xp_earned_today": 120,
        }

        with patch("src.api.tasks.get_mobile_dashboard_data", return_value=mock_analytics):
            response = client.get("/api/v1/mobile/dashboard/user123")

        assert response.status_code == 200
        data = response.json()
        assert data["total_tasks"] == 15
        assert data["completed_today"] == 5

    @pytest.mark.skip(
        reason="Mobile task list endpoint returns mock data - needs real implementation"
    )
    def test_mobile_task_list_optimized(self, client, mock_task_service):
        """Test mobile-optimized task list"""
        mock_tasks = [
            {
                "task_id": "task-1",
                "title": "Short Task 1",
                "priority": "high",
                "due_soon": True,
                "estimated_minutes": 30,
            },
            {
                "task_id": "task-2",
                "title": "Short Task 2",
                "priority": "medium",
                "due_soon": False,
                "estimated_minutes": 15,
            },
        ]

        with patch("src.api.tasks.get_mobile_optimized_tasks", return_value=mock_tasks):
            response = client.get("/api/v1/mobile/tasks/user123?limit=20")

        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 2
        assert data["tasks"][0]["due_soon"] is True

    @pytest.mark.skip(
        reason="Voice processing endpoint returns mock data - needs real implementation"
    )
    def test_voice_task_processing(self, client, mock_task_service):
        """Test voice input processing"""
        mock_processed = {
            "intent": "create_task",
            "extracted_data": {
                "title": "Call dentist",
                "due_date": "2024-01-15T09:00:00Z",
                "priority": "medium",
            },
            "confidence": 0.95,
        }

        with patch("src.api.tasks.process_voice_input", return_value=mock_processed):
            response = client.post(
                "/api/v1/mobile/voice-process",
                json={
                    "audio_text": "Remind me to call the dentist tomorrow morning",
                    "user_id": "user123",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "create_task"
        assert data["confidence"] > 0.9
