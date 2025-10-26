"""
Tests for task management service
"""

from decimal import Decimal
from unittest.mock import Mock, patch
from uuid import uuid4

import pytest

from src.core.task_models import (
    DependencyType,
    Project,
    Task,
    TaskDependency,
    TaskPriority,
    TaskStatus,
    TaskTemplate,
)
from src.services.task_service import (
    BulkTaskOperationResult,
    ProjectCreationData,
    TaskCreationData,
    TaskService,
    TaskServiceError,
    TaskUpdateData,
)


@pytest.fixture
def mock_task_repo():
    """Create mock task repository"""
    return Mock()


@pytest.fixture
def mock_project_repo():
    """Create mock project repository"""
    return Mock()


@pytest.fixture
def mock_template_repo():
    """Create mock template repository"""
    return Mock()


@pytest.fixture
def mock_dependency_repo():
    """Create mock dependency repository"""
    return Mock()


@pytest.fixture
def mock_comment_repo():
    """Create mock comment repository"""
    return Mock()


@pytest.fixture
def task_service(
    mock_task_repo, mock_project_repo, mock_template_repo, mock_dependency_repo, mock_comment_repo
):
    """Create task service with mocked repositories"""
    service = TaskService()
    service.task_repo = mock_task_repo
    service.project_repo = mock_project_repo
    service.template_repo = mock_template_repo
    service.dependency_repo = mock_dependency_repo
    service.comment_repo = mock_comment_repo
    return service


@pytest.fixture
def sample_project():
    """Create a sample project"""
    return Project(
        project_id=str(uuid4()),
        name="Test Project",
        description="A test project",
        owner="user123",
    )


@pytest.fixture
def sample_task():
    """Create a sample task"""
    return Task(
        task_id=str(uuid4()),
        title="Sample Task",
        description="A sample task for testing",
        project_id=str(uuid4()),
        priority=TaskPriority.MEDIUM,
        status=TaskStatus.TODO,
    )


class TestTaskService:
    """Test the TaskService class"""

    def test_create_task_success(
        self, task_service, mock_task_repo, mock_project_repo, sample_project
    ):
        """Test successful task creation"""
        # Setup mocks
        mock_project_repo.get_by_id.return_value = sample_project
        mock_task_repo.create.return_value = Task(
            title="New Task",
            description="A new task",
            project_id=sample_project.project_id,
        )

        # Create task
        task_data = TaskCreationData(
            title="New Task",
            description="A new task",
            project_id=sample_project.project_id,
            priority=TaskPriority.HIGH,
        )

        result = task_service.create_task(task_data)

        # Verify calls
        mock_project_repo.get_by_id.assert_called_once_with(sample_project.project_id)
        mock_task_repo.create.assert_called_once()

        # Verify result
        assert result.title == "New Task"
        assert result.project_id == sample_project.project_id

    def test_create_task_project_not_found(self, task_service, mock_project_repo):
        """Test task creation with non-existent project"""
        # Setup mocks
        mock_project_repo.get_by_id.return_value = None

        # Create task
        task_data = TaskCreationData(
            title="New Task",
            description="A new task",
            project_id="nonexistent-project-id",
        )

        with pytest.raises(TaskServiceError, match="Project not found"):
            task_service.create_task(task_data)

    def test_create_task_from_template(
        self, task_service, mock_template_repo, mock_project_repo, mock_task_repo, sample_project
    ):
        """Test creating task from template"""
        # Setup template
        template = TaskTemplate(
            name="Bug Fix Template",
            title_template="Fix: {issue}",
            description_template="Bug: {description}",
            default_priority=TaskPriority.HIGH,
        )

        # Setup mocks
        mock_template_repo.get_by_name.return_value = template
        mock_project_repo.get_by_id.return_value = sample_project
        mock_task_repo.create.return_value = Task(
            title="Fix: Authentication Bug",
            description="Bug: User cannot login",
            project_id=sample_project.project_id,
            priority=TaskPriority.HIGH,
        )

        # Create task from template
        variables = {"issue": "Authentication Bug", "description": "User cannot login"}
        result = task_service.create_task_from_template(
            "Bug Fix Template", sample_project.project_id, variables
        )

        # Verify calls
        mock_template_repo.get_by_name.assert_called_once_with("Bug Fix Template")
        mock_task_repo.create.assert_called_once()

        # Verify result
        assert result.title == "Fix: Authentication Bug"
        assert result.priority == TaskPriority.HIGH

    def test_update_task_success(self, task_service, mock_task_repo, sample_task):
        """Test successful task update"""
        # Setup mocks
        mock_task_repo.get_by_id.return_value = sample_task
        updated_task = Task(**sample_task.model_dump())
        updated_task.title = "Updated Task"
        updated_task.status = TaskStatus.IN_PROGRESS
        mock_task_repo.update.return_value = updated_task

        # Update task
        update_data = TaskUpdateData(
            title="Updated Task",
            status=TaskStatus.IN_PROGRESS,
        )

        result = task_service.update_task(sample_task.task_id, update_data)

        # Verify calls
        mock_task_repo.get_by_id.assert_called_once_with(sample_task.task_id)
        mock_task_repo.update.assert_called_once()

        # Verify result
        assert result.title == "Updated Task"
        assert result.status == TaskStatus.IN_PROGRESS

    def test_update_task_not_found(self, task_service, mock_task_repo):
        """Test updating non-existent task"""
        # Setup mocks
        mock_task_repo.get_by_id.return_value = None

        # Update task
        update_data = TaskUpdateData(title="Updated Task")

        with pytest.raises(TaskServiceError, match="Task not found"):
            task_service.update_task("nonexistent-id", update_data)

    def test_delete_task_success(
        self, task_service, mock_task_repo, mock_dependency_repo, sample_task
    ):
        """Test successful task deletion"""
        # Setup mocks
        mock_task_repo.get_by_id.return_value = sample_task
        mock_dependency_repo.get_dependent_tasks.return_value = []
        mock_task_repo.delete.return_value = True

        # Delete task
        result = task_service.delete_task(sample_task.task_id)

        # Verify calls
        mock_dependency_repo.get_dependent_tasks.assert_called_once_with(sample_task.task_id)
        mock_task_repo.delete.assert_called_once_with(sample_task.task_id)

        # Verify result
        assert result is True

    def test_delete_task_with_dependencies(
        self, task_service, mock_task_repo, mock_dependency_repo, sample_task
    ):
        """Test deleting task with dependencies"""
        # Setup mocks
        mock_task_repo.get_by_id.return_value = sample_task
        dependent_task = TaskDependency(
            task_id=str(uuid4()),
            depends_on_task_id=sample_task.task_id,
        )
        mock_dependency_repo.get_dependent_tasks.return_value = [dependent_task]

        # Delete task
        with pytest.raises(TaskServiceError, match="Task has dependent tasks"):
            task_service.delete_task(sample_task.task_id, force=False)

    def test_delete_task_force(
        self, task_service, mock_task_repo, mock_dependency_repo, sample_task
    ):
        """Test force deleting task with dependencies"""
        # Setup mocks
        mock_task_repo.get_by_id.return_value = sample_task
        dependent_task = TaskDependency(
            task_id=str(uuid4()),
            depends_on_task_id=sample_task.task_id,
        )
        mock_dependency_repo.get_dependent_tasks.return_value = [dependent_task]
        mock_dependency_repo.delete_dependency.return_value = True
        mock_task_repo.delete.return_value = True

        # Delete task with force
        result = task_service.delete_task(sample_task.task_id, force=True)

        # Verify dependencies are deleted first
        mock_dependency_repo.delete_dependency.assert_called()
        mock_task_repo.delete.assert_called_once_with(sample_task.task_id)

        # Verify result
        assert result is True

    def test_get_task_hierarchy(self, task_service, mock_task_repo, sample_project):
        """Test getting task hierarchy"""
        # Create parent and child tasks
        parent_task = Task(
            task_id="parent-id",
            title="Parent Task",
            description="Parent task",
            project_id=sample_project.project_id,
        )
        child_task = Task(
            task_id="child-id",
            title="Child Task",
            description="Child task",
            project_id=sample_project.project_id,
            parent_id="parent-id",
        )

        # Setup mocks - parent has children, child has no children
        mock_task_repo.get_by_id.return_value = parent_task

        def mock_list_tasks(filter_obj=None):
            mock_result = Mock()
            if filter_obj and filter_obj.parent_id == "parent-id":
                mock_result.items = [child_task]
            else:
                mock_result.items = []  # No children for child task
            return mock_result

        mock_task_repo.list_tasks.side_effect = mock_list_tasks

        # Get hierarchy
        result = task_service.get_task_hierarchy("parent-id")

        # Verify result
        assert result["task"] == parent_task
        assert len(result["children"]) == 1
        assert result["children"][0]["task"] == child_task

    def test_add_task_dependency(self, task_service, mock_task_repo, mock_dependency_repo):
        """Test adding task dependency"""
        task1 = Task(task_id="task1", title="Task 1", description="", project_id="proj1")
        task2 = Task(task_id="task2", title="Task 2", description="", project_id="proj1")

        # Setup mocks
        mock_task_repo.get_by_id.side_effect = (
            lambda task_id: task1 if task_id == "task1" else task2
        )
        mock_dependency_repo.get_task_dependencies.return_value = []  # No existing dependencies
        mock_dependency_repo.create.return_value = TaskDependency(
            task_id="task2",
            depends_on_task_id="task1",
            dependency_type=DependencyType.BLOCKS,
        )

        # Add dependency
        result = task_service.add_task_dependency("task2", "task1", DependencyType.BLOCKS)

        # Verify calls
        assert mock_task_repo.get_by_id.call_count == 2
        mock_dependency_repo.create.assert_called_once()

        # Verify result
        assert result.task_id == "task2"
        assert result.depends_on_task_id == "task1"

    def test_add_task_dependency_circular(self, task_service, mock_task_repo, mock_dependency_repo):
        """Test preventing circular dependencies"""
        task1 = Task(task_id="task1", title="Task 1", description="", project_id="proj1")
        task2 = Task(task_id="task2", title="Task 2", description="", project_id="proj1")

        # Setup mocks - task1 already depends on task2
        mock_task_repo.get_by_id.side_effect = (
            lambda task_id: task1 if task_id == "task1" else task2
        )
        existing_dependency = TaskDependency(
            task_id="task1",
            depends_on_task_id="task2",
        )
        mock_dependency_repo.get_task_dependencies.return_value = [existing_dependency]

        # Try to add circular dependency
        with pytest.raises(TaskServiceError, match="Circular dependency detected"):
            task_service.add_task_dependency("task2", "task1", DependencyType.BLOCKS)

    def test_bulk_update_tasks(self, task_service, mock_task_repo):
        """Test bulk updating tasks"""
        tasks = [
            Task(task_id="task1", title="Task 1", description="", project_id="proj1"),
            Task(task_id="task2", title="Task 2", description="", project_id="proj1"),
        ]

        # Setup mocks
        mock_task_repo.get_by_id.side_effect = lambda task_id: next(
            t for t in tasks if t.task_id == task_id
        )
        mock_task_repo.update.side_effect = lambda task: task

        # Bulk update
        update_data = TaskUpdateData(status=TaskStatus.COMPLETED)
        result = task_service.bulk_update_tasks(["task1", "task2"], update_data)

        # Verify calls
        assert mock_task_repo.update.call_count == 2

        # Verify result
        assert result.successful_count == 2
        assert result.failed_count == 0
        assert len(result.successful_ids) == 2

    def test_estimate_task_duration(self, task_service, mock_task_repo, sample_project):
        """Test AI-powered task duration estimation"""
        task = Task(
            title="Implement user authentication",
            description="Create login/logout functionality with JWT tokens",
            project_id=sample_project.project_id,
        )

        with patch("src.services.task_service.TaskService._estimate_with_ai") as mock_ai:
            mock_ai.return_value = Decimal("8.0")

            # Estimate duration
            estimated_hours = task_service.estimate_task_duration(task)

            # Verify result
            assert estimated_hours == Decimal("8.0")
            mock_ai.assert_called_once_with(task)

    def test_break_down_task(self, task_service, mock_task_repo, sample_project):
        """Test AI-powered task breakdown"""
        parent_task = Task(
            title="Build user management system",
            description="Complete user registration, authentication, and profile management",
            project_id=sample_project.project_id,
        )

        mock_task_repo.create.side_effect = lambda task: task

        with patch("src.services.task_service.TaskService._breakdown_with_ai") as mock_ai:
            subtask_data = [
                {
                    "title": "Create user registration form",
                    "description": "HTML form with validation",
                    "estimated_hours": "4.0",
                },
                {
                    "title": "Implement authentication API",
                    "description": "JWT-based auth endpoints",
                    "estimated_hours": "6.0",
                },
                {
                    "title": "Build user profile page",
                    "description": "Display and edit user info",
                    "estimated_hours": "3.0",
                },
            ]
            mock_ai.return_value = subtask_data

            # Break down task
            subtasks = task_service.break_down_task(parent_task)

            # Verify result
            assert len(subtasks) == 3
            assert all(task.parent_id == parent_task.task_id for task in subtasks)
            assert subtasks[0].title == "Create user registration form"
            assert subtasks[1].estimated_hours == Decimal("6.0")

    def test_smart_task_prioritization(self, task_service, mock_task_repo, sample_project):
        """Test AI-powered task prioritization"""
        tasks = [
            Task(
                task_id="task1",
                title="Fix critical bug",
                description="App crashes on startup",
                project_id=sample_project.project_id,
            ),
            Task(
                task_id="task2",
                title="Add nice-to-have feature",
                description="Dark mode toggle",
                project_id=sample_project.project_id,
            ),
            Task(
                task_id="task3",
                title="Security vulnerability",
                description="SQL injection risk",
                project_id=sample_project.project_id,
            ),
        ]

        mock_task_repo.get_tasks_by_project.return_value = tasks
        mock_task_repo.update.side_effect = lambda task: task

        with patch("src.services.task_service.TaskService._prioritize_with_ai") as mock_ai:
            # AI suggests priorities based on content analysis
            mock_ai.return_value = {
                "task1": TaskPriority.CRITICAL,
                "task2": TaskPriority.LOW,
                "task3": TaskPriority.CRITICAL,
            }

            # Prioritize tasks
            result = task_service.smart_prioritize_tasks(sample_project.project_id)

            # Verify result
            assert result.updated_count == 3
            assert mock_task_repo.update.call_count == 3


class TestProjectService:
    """Test project-related functionality in TaskService"""

    def test_create_project_success(self, task_service, mock_project_repo):
        """Test successful project creation"""
        project_data = ProjectCreationData(
            name="New Project",
            description="A new project for testing",
            owner="user123",
        )

        created_project = Project(
            name="New Project",
            description="A new project for testing",
            owner_id="user123",
        )
        mock_project_repo.create.return_value = created_project

        # Create project
        result = task_service.create_project(project_data)

        # Verify calls
        mock_project_repo.create.assert_called_once()

        # Verify result
        assert result.name == "New Project"
        assert result.owner_id == "user123"

    def test_get_project_analytics(
        self, task_service, mock_project_repo, mock_task_repo, sample_project
    ):
        """Test getting project analytics"""
        tasks = [
            Task(
                task_id="task1",
                title="Task 1",
                description="",
                project_id=sample_project.project_id,
                status=TaskStatus.COMPLETED,
            ),
            Task(
                task_id="task2",
                title="Task 2",
                description="",
                project_id=sample_project.project_id,
                status=TaskStatus.IN_PROGRESS,
            ),
            Task(
                task_id="task3",
                title="Task 3",
                description="",
                project_id=sample_project.project_id,
                status=TaskStatus.TODO,
            ),
        ]

        # Setup mocks
        mock_project_repo.get_by_id.return_value = sample_project
        mock_task_repo.get_tasks_by_project.return_value = tasks

        # Get analytics
        result = task_service.get_project_analytics(sample_project.project_id)

        # Verify result
        assert result["project"] == sample_project
        assert result["total_tasks"] == 3
        assert result["completed_tasks"] == 1
        assert result["in_progress_tasks"] == 1
        assert result["todo_tasks"] == 1
        assert result["completion_percentage"] == 33.33

    def test_archive_project(self, task_service, mock_project_repo, mock_task_repo, sample_project):
        """Test archiving a project"""
        tasks = [
            Task(
                task_id="task1",
                title="Task 1",
                description="",
                project_id=sample_project.project_id,
                status=TaskStatus.IN_PROGRESS,
            ),
        ]

        # Setup mocks
        mock_project_repo.get_by_id.return_value = sample_project
        mock_task_repo.get_tasks_by_project.return_value = tasks

        # Try to archive project with active tasks
        with pytest.raises(TaskServiceError, match="Project has active tasks"):
            task_service.archive_project(sample_project.project_id)

        # Archive with force
        mock_project_repo.update.return_value = sample_project
        result = task_service.archive_project(sample_project.project_id, force=True)

        # Verify result
        assert result is True
        mock_project_repo.update.assert_called_once()


class TestTaskServiceDataClasses:
    """Test the data classes used by TaskService"""

    def test_task_creation_data(self):
        """Test TaskCreationData validation"""
        data = TaskCreationData(
            title="Test Task",
            description="A test task",
            project_id="proj123",
            priority=TaskPriority.HIGH,
            estimated_hours=Decimal("4.5"),
            tags=["urgent", "backend"],
        )

        assert data.title == "Test Task"
        assert data.priority == TaskPriority.HIGH
        assert data.estimated_hours == Decimal("4.5")
        assert data.tags == ["urgent", "backend"]

    def test_task_update_data(self):
        """Test TaskUpdateData with partial updates"""
        data = TaskUpdateData(
            title="Updated Title",
            status=TaskStatus.COMPLETED,
        )

        assert data.title == "Updated Title"
        assert data.status == TaskStatus.COMPLETED
        assert data.description is None  # Not updated

    def test_bulk_operation_result(self):
        """Test BulkTaskOperationResult"""
        result = BulkTaskOperationResult(
            successful_count=3,
            failed_count=1,
            successful_ids=["task1", "task2", "task3"],
            failed_ids=["task4"],
            errors={"task4": "Task not found"},
        )

        assert result.total_count == 4
        assert result.success_rate == 75.0
        assert len(result.successful_ids) == 3
        assert len(result.failed_ids) == 1
