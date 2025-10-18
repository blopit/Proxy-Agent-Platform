"""
Tests for task repository layer
"""

from datetime import datetime
from decimal import Decimal

import pytest

from src.core.task_models import (
    DependencyType,
    Project,
    Task,
    TaskComment,
    TaskDependency,
    TaskFilter,
    TaskPriority,
    TaskSort,
    TaskStatus,
    TaskTemplate,
)
from src.repositories.task_repository import (
    ProjectRepository,
    TaskCommentRepository,
    TaskDependencyRepository,
    TaskRepository,
    TaskTemplateRepository,
)


@pytest.fixture
def task_repo():
    """Create task repository for testing"""
    repo = TaskRepository()
    repo.setup()
    yield repo
    repo.cleanup()


@pytest.fixture
def project_repo():
    """Create project repository for testing"""
    repo = ProjectRepository()
    repo.setup()
    yield repo
    repo.cleanup()


@pytest.fixture
def sample_project(project_repo):
    """Create a sample project"""
    project = Project(
        name="Test Project",
        description="A test project for task management",
    )
    return project_repo.create(project)


@pytest.fixture
def sample_task(task_repo, sample_project):
    """Create a sample task"""
    task = Task(
        title="Sample Task",
        description="A sample task for testing",
        project_id=sample_project.project_id,
    )
    return task_repo.create(task)


class TestTaskRepository:
    """Test the TaskRepository class"""

    def test_create_task(self, task_repo, sample_project):
        """Test creating a new task"""
        task = Task(
            title="Test Task",
            description="A test task",
            project_id=sample_project.project_id,
            priority=TaskPriority.HIGH,
            estimated_hours=Decimal("8.0"),
        )

        created_task = task_repo.create(task)

        assert created_task.task_id == task.task_id
        assert created_task.title == "Test Task"
        assert created_task.priority == TaskPriority.HIGH
        assert created_task.estimated_hours == Decimal("8.0")
        assert isinstance(created_task.created_at, datetime)

    def test_get_task_by_id(self, task_repo, sample_task):
        """Test retrieving a task by ID"""
        retrieved_task = task_repo.get_by_id(sample_task.task_id)

        assert retrieved_task is not None
        assert retrieved_task.task_id == sample_task.task_id
        assert retrieved_task.title == sample_task.title

    def test_get_nonexistent_task(self, task_repo):
        """Test retrieving a non-existent task"""
        retrieved_task = task_repo.get_by_id("nonexistent-id")
        assert retrieved_task is None

    def test_update_task(self, task_repo, sample_task):
        """Test updating a task"""
        sample_task.title = "Updated Task Title"
        sample_task.status = TaskStatus.IN_PROGRESS
        sample_task.actual_hours = Decimal("2.5")

        updated_task = task_repo.update(sample_task)

        assert updated_task.title == "Updated Task Title"
        assert updated_task.status == TaskStatus.IN_PROGRESS
        assert updated_task.actual_hours == Decimal("2.5")

    def test_delete_task(self, task_repo, sample_task):
        """Test deleting a task"""
        result = task_repo.delete(sample_task.task_id)
        assert result is True

        # Verify task is deleted
        retrieved_task = task_repo.get_by_id(sample_task.task_id)
        assert retrieved_task is None

    def test_list_tasks_basic(self, task_repo, sample_project):
        """Test listing tasks without filters"""
        # Create multiple tasks
        tasks = []
        for i in range(3):
            task = Task(
                title=f"Task {i}",
                description=f"Description {i}",
                project_id=sample_project.project_id,
            )
            tasks.append(task_repo.create(task))

        # List all tasks
        result = task_repo.list_tasks()

        assert len(result.items) >= 3
        assert result.total >= 3

    def test_list_tasks_with_filter(self, task_repo, sample_project):
        """Test listing tasks with filters"""
        # Create tasks with different statuses
        task1 = Task(
            title="Todo Task",
            description="A todo task",
            project_id=sample_project.project_id,
            status=TaskStatus.TODO,
            priority=TaskPriority.HIGH,
        )
        task2 = Task(
            title="In Progress Task",
            description="An in-progress task",
            project_id=sample_project.project_id,
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.MEDIUM,
        )

        task_repo.create(task1)
        task_repo.create(task2)

        # Filter by status
        filter_obj = TaskFilter(status=[TaskStatus.TODO])
        result = task_repo.list_tasks(filter_obj=filter_obj)

        assert len(result.items) >= 1
        assert all(task.status == TaskStatus.TODO for task in result.items)

        # Filter by priority
        filter_obj = TaskFilter(priority=[TaskPriority.HIGH])
        result = task_repo.list_tasks(filter_obj=filter_obj)

        assert len(result.items) >= 1
        assert all(task.priority == TaskPriority.HIGH for task in result.items)

    def test_list_tasks_with_pagination(self, task_repo, sample_project):
        """Test listing tasks with pagination"""
        # Create multiple tasks
        for i in range(5):
            task = Task(
                title=f"Task {i}",
                description=f"Description {i}",
                project_id=sample_project.project_id,
            )
            task_repo.create(task)

        # Test pagination
        result = task_repo.list_tasks(limit=2, offset=1)

        assert len(result.items) <= 2
        assert result.limit == 2
        assert result.offset == 1

    def test_list_tasks_with_sorting(self, task_repo, sample_project):
        """Test listing tasks with sorting"""
        # Create tasks with different titles
        task1 = Task(
            title="A First Task",
            description="Description",
            project_id=sample_project.project_id,
        )
        task2 = Task(
            title="Z Last Task",
            description="Description",
            project_id=sample_project.project_id,
        )

        task_repo.create(task1)
        task_repo.create(task2)

        # Sort by title ascending
        sort_obj = TaskSort(field="title", direction="asc")
        result = task_repo.list_tasks(sort_obj=sort_obj)

        # Check if results are sorted
        titles = [task.title for task in result.items]
        assert titles == sorted(titles)

    def test_search_tasks(self, task_repo, sample_project):
        """Test searching tasks by text"""
        # Create tasks with different content
        task1 = Task(
            title="Bug Fix",
            description="Fix authentication bug",
            project_id=sample_project.project_id,
        )
        task2 = Task(
            title="Feature Implementation",
            description="Implement user dashboard",
            project_id=sample_project.project_id,
        )

        task_repo.create(task1)
        task_repo.create(task2)

        # Search for tasks
        filter_obj = TaskFilter(search_text="bug")
        result = task_repo.list_tasks(filter_obj=filter_obj)

        assert len(result.items) >= 1
        assert any(
            "bug" in task.title.lower() or "bug" in task.description.lower()
            for task in result.items
        )

    def test_get_tasks_by_project(self, task_repo, project_repo):
        """Test getting tasks by project"""
        # Create two projects
        project1 = Project(name="Project 1", description="First project")
        project2 = Project(name="Project 2", description="Second project")

        project1 = project_repo.create(project1)
        project2 = project_repo.create(project2)

        # Create tasks for each project
        task1 = Task(title="Task 1", description="Description", project_id=project1.project_id)
        task2 = Task(title="Task 2", description="Description", project_id=project2.project_id)

        task_repo.create(task1)
        task_repo.create(task2)

        # Get tasks by project
        result = task_repo.get_tasks_by_project(project1.project_id)

        assert len(result) >= 1
        assert all(task.project_id == project1.project_id for task in result)


class TestProjectRepository:
    """Test the ProjectRepository class"""

    def test_create_project(self, project_repo):
        """Test creating a new project"""
        project = Project(
            name="Test Project",
            description="A test project",
            owner="user123",
            settings={"auto_assign": True},
        )

        created_project = project_repo.create(project)

        assert created_project.project_id == project.project_id
        assert created_project.name == "Test Project"
        assert created_project.owner == "user123"
        assert created_project.settings["auto_assign"] is True

    def test_get_project_by_id(self, project_repo, sample_project):
        """Test retrieving a project by ID"""
        retrieved_project = project_repo.get_by_id(sample_project.project_id)

        assert retrieved_project is not None
        assert retrieved_project.project_id == sample_project.project_id
        assert retrieved_project.name == sample_project.name

    def test_list_projects(self, project_repo):
        """Test listing projects"""
        # Create multiple projects
        for i in range(3):
            project = Project(
                name=f"Project {i}",
                description=f"Description {i}",
            )
            project_repo.create(project)

        result = project_repo.list_projects()

        assert len(result.items) >= 3
        assert result.total >= 3

    def test_update_project(self, project_repo, sample_project):
        """Test updating a project"""
        sample_project.name = "Updated Project Name"
        sample_project.is_active = False

        updated_project = project_repo.update(sample_project)

        assert updated_project.name == "Updated Project Name"
        assert updated_project.is_active is False

    def test_delete_project(self, project_repo, sample_project):
        """Test deleting a project"""
        result = project_repo.delete(sample_project.project_id)
        assert result is True

        # Verify project is deleted
        retrieved_project = project_repo.get_by_id(sample_project.project_id)
        assert retrieved_project is None


class TestTaskTemplateRepository:
    """Test the TaskTemplateRepository class"""

    def test_create_template(self):
        """Test creating a task template"""
        repo = TaskTemplateRepository()
        repo.setup()

        template = TaskTemplate(
            name="Bug Fix Template",
            title_template="Fix: {issue_description}",
            description_template="Bug: {bug_details}",
            default_priority=TaskPriority.HIGH,
        )

        created_template = repo.create(template)

        assert created_template.name == "Bug Fix Template"
        assert created_template.default_priority == TaskPriority.HIGH

        repo.cleanup()

    def test_get_template_by_name(self):
        """Test retrieving template by name"""
        repo = TaskTemplateRepository()
        repo.setup()

        template = TaskTemplate(
            name="Feature Template",
            title_template="Implement: {feature_name}",
            description_template="Feature: {feature_description}",
        )

        repo.create(template)
        retrieved_template = repo.get_by_name("Feature Template")

        assert retrieved_template is not None
        assert retrieved_template.name == "Feature Template"

        repo.cleanup()


class TestTaskDependencyRepository:
    """Test the TaskDependencyRepository class"""

    def test_create_dependency(self, task_repo, sample_project):
        """Test creating a task dependency"""
        repo = TaskDependencyRepository()
        repo.setup()

        # Create two tasks
        task1 = Task(title="Task 1", description="First task", project_id=sample_project.project_id)
        task2 = Task(
            title="Task 2", description="Second task", project_id=sample_project.project_id
        )

        task1 = task_repo.create(task1)
        task2 = task_repo.create(task2)

        # Create dependency
        dependency = TaskDependency(
            task_id=task2.task_id,
            depends_on_task_id=task1.task_id,
            dependency_type=DependencyType.BLOCKS,
        )

        created_dependency = repo.create(dependency)

        assert created_dependency.task_id == task2.task_id
        assert created_dependency.depends_on_task_id == task1.task_id
        assert created_dependency.dependency_type == DependencyType.BLOCKS

        repo.cleanup()

    def test_get_task_dependencies(self, task_repo, sample_project):
        """Test getting dependencies for a task"""
        repo = TaskDependencyRepository()
        repo.setup()

        # Create tasks and dependencies
        task1 = Task(title="Task 1", description="First task", project_id=sample_project.project_id)
        task2 = Task(
            title="Task 2", description="Second task", project_id=sample_project.project_id
        )

        task1 = task_repo.create(task1)
        task2 = task_repo.create(task2)

        dependency = TaskDependency(
            task_id=task2.task_id,
            depends_on_task_id=task1.task_id,
        )

        repo.create(dependency)

        # Get dependencies
        dependencies = repo.get_task_dependencies(task2.task_id)

        assert len(dependencies) >= 1
        assert dependencies[0].depends_on_task_id == task1.task_id

        repo.cleanup()


class TestTaskCommentRepository:
    """Test the TaskCommentRepository class"""

    def test_create_comment(self, sample_task):
        """Test creating a task comment"""
        repo = TaskCommentRepository()
        repo.setup()

        comment = TaskComment(
            task_id=sample_task.task_id,
            author="user123",
            content="This is a test comment",
        )

        created_comment = repo.create(comment)

        assert created_comment.task_id == sample_task.task_id
        assert created_comment.author == "user123"
        assert created_comment.content == "This is a test comment"

        repo.cleanup()

    def test_get_task_comments(self, sample_task):
        """Test getting comments for a task"""
        repo = TaskCommentRepository()
        repo.setup()

        # Create multiple comments
        for i in range(3):
            comment = TaskComment(
                task_id=sample_task.task_id,
                author=f"user{i}",
                content=f"Comment {i}",
            )
            repo.create(comment)

        # Get comments
        comments = repo.get_task_comments(sample_task.task_id)

        assert len(comments) >= 3
        assert all(comment.task_id == sample_task.task_id for comment in comments)

        repo.cleanup()
