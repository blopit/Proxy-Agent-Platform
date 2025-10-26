"""
Task Service v2 with Dependency Injection

This service layer implements business logic for task management
using dependency injection pattern for testability.
"""

from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from src.core.task_models import Task, TaskStatus, TaskPriority
from src.repositories.interfaces import TaskRepositoryInterface, ProjectRepositoryInterface


# ============================================================================
# Custom Exceptions
# ============================================================================

class TaskServiceError(Exception):
    """Base exception for task service errors"""
    pass


class TaskNotFoundError(TaskServiceError):
    """Raised when task is not found"""
    def __init__(self, task_id: str):
        self.task_id = task_id
        super().__init__(f"Task {task_id} not found")


class ProjectNotFoundError(TaskServiceError):
    """Raised when project is not found"""
    def __init__(self, project_id: str):
        self.project_id = project_id
        super().__init__(f"Project {project_id} not found")


# ============================================================================
# Task Service
# ============================================================================

class TaskService:
    """
    Task management business logic with dependency injection

    This service is fully testable because all dependencies
    are injected via the constructor.
    """

    def __init__(
        self,
        task_repo: TaskRepositoryInterface,
        project_repo: ProjectRepositoryInterface
    ):
        """
        Initialize service with injected repositories

        Args:
            task_repo: Task repository implementation
            project_repo: Project repository implementation
        """
        self.task_repo = task_repo
        self.project_repo = project_repo

    def create_task(
        self,
        title: str,
        description: str,
        project_id: str,
        priority: TaskPriority = TaskPriority.MEDIUM,
        assignee: str | None = None
    ) -> Task:
        """
        Create a new task

        Args:
            title: Task title
            description: Task description
            project_id: Parent project ID
            priority: Task priority
            assignee: Optional assignee user ID

        Returns:
            Created task

        Raises:
            ProjectNotFoundError: If project doesn't exist
        """
        # Validate project exists
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        # Create task with generated ID
        task = Task(
            task_id=str(uuid4()),
            title=title,
            description=description,
            project_id=project_id,
            priority=priority,
            status=TaskStatus.TODO,
            assignee=assignee,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        return self.task_repo.create(task)

    def get_task(self, task_id: str) -> Task:
        """
        Get task by ID

        Args:
            task_id: Task ID

        Returns:
            Task

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError(task_id)
        return task

    def update_task_status(self, task_id: str, new_status: TaskStatus) -> Task:
        """
        Update task status with automatic timestamp management

        Args:
            task_id: Task ID
            new_status: New status

        Returns:
            Updated task

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        # Verify task exists
        task = self.get_task(task_id)

        # Build updates dict
        updates = {
            "status": new_status.value,
            "updated_at": datetime.now(timezone.utc)
        }

        # Set completed_at when transitioning to COMPLETED
        if new_status == TaskStatus.COMPLETED:
            updates["completed_at"] = datetime.now(timezone.utc)

        # Set started_at when transitioning to IN_PROGRESS (only first time)
        elif new_status == TaskStatus.IN_PROGRESS and not task.started_at:
            updates["started_at"] = datetime.now(timezone.utc)

        # Update via repository
        updated_task = self.task_repo.update(task_id, updates)
        if not updated_task:
            raise TaskNotFoundError(task_id)

        return updated_task

    def delete_task(self, task_id: str) -> bool:
        """
        Delete a task

        Args:
            task_id: Task ID

        Returns:
            True if deleted, False if not found
        """
        return self.task_repo.delete(task_id)

    def list_tasks_by_project(self, project_id: str) -> List[Task]:
        """
        List all tasks for a project

        Args:
            project_id: Project ID

        Returns:
            List of tasks
        """
        return self.task_repo.get_by_project(project_id)

    def list_tasks_by_status(self, status: TaskStatus) -> List[Task]:
        """
        List all tasks with a specific status

        Args:
            status: Task status

        Returns:
            List of tasks
        """
        return self.task_repo.get_by_status(status.value)

    def list_tasks_by_assignee(self, assignee_id: str) -> List[Task]:
        """
        List all tasks assigned to a user

        Args:
            assignee_id: User ID

        Returns:
            List of tasks
        """
        return self.task_repo.get_by_assignee(assignee_id)

    def search_tasks(self, query: str) -> List[Task]:
        """
        Search tasks by query

        Args:
            query: Search query (searches title and description)

        Returns:
            List of matching tasks
        """
        return self.task_repo.search(query)
