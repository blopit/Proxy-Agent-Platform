"""
Unit tests for TaskService with Dependency Injection (TDD)

Test-Driven Development workflow:
1. Write tests first with MOCKED dependencies (RED - they fail)
2. Implement TaskService with DI (GREEN - tests pass)
3. Refactor while keeping tests green (REFACTOR)

Key TDD Principle: Test services with MOCKED repositories
- Unit tests should NOT touch the database
- We mock the repository layer
- This tests business logic in isolation
"""

from unittest.mock import Mock

import pytest

from src.core.task_models import Project, Task, TaskPriority, TaskStatus
from src.services.task_service_v2 import (
    ProjectNotFoundError,
    TaskNotFoundError,
    TaskService,
)


@pytest.mark.unit
class TestTaskServiceCreate:
    """Test task creation business logic"""

    def test_create_task_success(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Valid task data and existing project
        WHEN: create_task() is called
        THEN: Task is created via repository
        """
        # Arrange
        project = Project(project_id="proj_123", name="Test Project", description="Test")
        mock_project_repository.get_by_id.return_value = project

        expected_task = Task(
            task_id="task_456",
            title="Test Task",
            description="Test Description",
            project_id="proj_123",
            status=TaskStatus.TODO,
            priority=TaskPriority.HIGH,
        )
        mock_task_repository.create.return_value = expected_task

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        result = service.create_task(
            title="Test Task",
            description="Test Description",
            project_id="proj_123",
            priority=TaskPriority.HIGH,
        )

        # Assert
        assert result.task_id == "task_456"
        assert result.status == TaskStatus.TODO
        assert result.priority == TaskPriority.HIGH

        # Verify repository was called correctly
        mock_project_repository.get_by_id.assert_called_once_with("proj_123")
        mock_task_repository.create.assert_called_once()

    def test_create_task_project_not_found(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Project does not exist
        WHEN: create_task() is called
        THEN: ProjectNotFoundError is raised
        """
        # Arrange
        mock_project_repository.get_by_id.return_value = None

        # Act & Assert
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)

        with pytest.raises(ProjectNotFoundError, match="Project proj_999 not found"):
            service.create_task(title="Test Task", description="Test", project_id="proj_999")

        # Verify create was never called
        mock_task_repository.create.assert_not_called()

    def test_create_task_generates_task_id(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Task data without task_id
        WHEN: create_task() is called
        THEN: task_id is automatically generated
        """
        # Arrange
        mock_project_repository.get_by_id.return_value = Mock()

        # Capture the task passed to repository
        created_task = None

        def capture_task(task):
            nonlocal created_task
            created_task = task
            return task

        mock_task_repository.create.side_effect = capture_task

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        service.create_task(title="Test", description="Test", project_id="proj_1")

        # Assert
        assert created_task is not None
        assert created_task.task_id is not None
        assert len(created_task.task_id) > 0  # UUID generated


@pytest.mark.unit
class TestTaskServiceRead:
    """Test task retrieval business logic"""

    def test_get_task_success(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Task exists
        WHEN: get_task() is called
        THEN: Task is returned
        """
        # Arrange
        expected_task = Task(
            task_id="task_1", title="Found Task", description="Test", project_id="proj_1"
        )
        mock_task_repository.get_by_id.return_value = expected_task

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        result = service.get_task("task_1")

        # Assert
        assert result.task_id == "task_1"
        assert result.title == "Found Task"
        mock_task_repository.get_by_id.assert_called_once_with("task_1")

    def test_get_task_not_found(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Task does not exist
        WHEN: get_task() is called
        THEN: TaskNotFoundError is raised
        """
        # Arrange
        mock_task_repository.get_by_id.return_value = None

        # Act & Assert
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)

        with pytest.raises(TaskNotFoundError, match="Task task_999 not found"):
            service.get_task("task_999")


@pytest.mark.unit
class TestTaskServiceUpdate:
    """Test task updating business logic"""

    def test_update_task_status(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Task exists
        WHEN: update_task_status() is called
        THEN: Task status is updated via repository
        """
        # Arrange
        existing_task = Task(
            task_id="task_1",
            title="Test",
            description="Test",
            project_id="proj_1",
            status=TaskStatus.TODO,
        )
        mock_task_repository.get_by_id.return_value = existing_task

        updated_task = existing_task.model_copy(update={"status": TaskStatus.IN_PROGRESS})
        mock_task_repository.update.return_value = updated_task

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        result = service.update_task_status("task_1", TaskStatus.IN_PROGRESS)

        # Assert
        assert result.status == TaskStatus.IN_PROGRESS
        mock_task_repository.update.assert_called_once()

    def test_update_task_status_sets_started_at(
        self, mock_task_repository, mock_project_repository
    ):
        """
        GIVEN: Task without started_at
        WHEN: update_task_status(IN_PROGRESS) is called
        THEN: started_at is set in the update
        """
        # Arrange
        existing_task = Task(
            task_id="task_1",
            title="Test",
            description="Test",
            project_id="proj_1",
            status=TaskStatus.TODO,
            started_at=None,
        )
        mock_task_repository.get_by_id.return_value = existing_task
        mock_task_repository.update.return_value = existing_task

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        service.update_task_status("task_1", TaskStatus.IN_PROGRESS)

        # Assert - check the update dict passed to repository
        call_args = mock_task_repository.update.call_args
        updates_dict = call_args[0][1]  # Second argument
        assert "started_at" in updates_dict
        assert updates_dict["started_at"] is not None

    def test_update_task_status_sets_completed_at(
        self, mock_task_repository, mock_project_repository
    ):
        """
        GIVEN: Task in progress
        WHEN: update_task_status(COMPLETED) is called
        THEN: completed_at is set in the update
        """
        # Arrange
        existing_task = Task(
            task_id="task_1",
            title="Test",
            description="Test",
            project_id="proj_1",
            status=TaskStatus.IN_PROGRESS,
            completed_at=None,
        )
        mock_task_repository.get_by_id.return_value = existing_task
        mock_task_repository.update.return_value = existing_task

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        service.update_task_status("task_1", TaskStatus.COMPLETED)

        # Assert
        call_args = mock_task_repository.update.call_args
        updates_dict = call_args[0][1]
        assert "completed_at" in updates_dict
        assert updates_dict["completed_at"] is not None

    def test_update_task_not_found(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Task does not exist
        WHEN: update_task_status() is called
        THEN: TaskNotFoundError is raised
        """
        # Arrange
        mock_task_repository.get_by_id.return_value = None

        # Act & Assert
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)

        with pytest.raises(TaskNotFoundError):
            service.update_task_status("task_999", TaskStatus.COMPLETED)


@pytest.mark.unit
class TestTaskServiceDelete:
    """Test task deletion business logic"""

    def test_delete_task_success(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Task exists
        WHEN: delete_task() is called
        THEN: Task is deleted via repository
        """
        # Arrange
        mock_task_repository.delete.return_value = True

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        result = service.delete_task("task_1")

        # Assert
        assert result is True
        mock_task_repository.delete.assert_called_once_with("task_1")

    def test_delete_task_not_found(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Task does not exist
        WHEN: delete_task() is called
        THEN: False is returned
        """
        # Arrange
        mock_task_repository.delete.return_value = False

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        result = service.delete_task("task_999")

        # Assert
        assert result is False


@pytest.mark.unit
class TestTaskServiceList:
    """Test task listing business logic"""

    def test_list_tasks_by_project(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Multiple tasks exist for a project
        WHEN: list_tasks_by_project() is called
        THEN: Tasks are returned from repository
        """
        # Arrange
        tasks = [
            Task(task_id=f"task_{i}", title=f"Task {i}", description="Test", project_id="proj_1")
            for i in range(3)
        ]
        mock_task_repository.get_by_project.return_value = tasks

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        result = service.list_tasks_by_project("proj_1")

        # Assert
        assert len(result) == 3
        mock_task_repository.get_by_project.assert_called_once_with("proj_1")

    def test_list_tasks_by_status(self, mock_task_repository, mock_project_repository):
        """
        GIVEN: Multiple tasks with same status exist
        WHEN: list_tasks_by_status() is called
        THEN: Tasks are returned from repository
        """
        # Arrange
        tasks = [
            Task(
                task_id=f"task_{i}",
                title=f"Task {i}",
                description="Test",
                project_id="proj_1",
                status=TaskStatus.TODO,
            )
            for i in range(2)
        ]
        mock_task_repository.get_by_status.return_value = tasks

        # Act
        service = TaskService(task_repo=mock_task_repository, project_repo=mock_project_repository)
        result = service.list_tasks_by_status(TaskStatus.TODO)

        # Assert
        assert len(result) == 2
        mock_task_repository.get_by_status.assert_called_once_with(TaskStatus.TODO.value)
