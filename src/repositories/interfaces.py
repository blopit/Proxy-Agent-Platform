"""
Repository interface definitions for dependency injection

These interfaces define the contract for repository implementations,
allowing for easy mocking and testing via dependency injection.
"""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List

from src.core.task_models import Task, Project, User

T = TypeVar('T')


class BaseRepositoryInterface(ABC, Generic[T]):
    """Base repository interface with CRUD operations"""

    @abstractmethod
    def get_by_id(self, entity_id: str) -> Optional[T]:
        """
        Get entity by ID

        Args:
            entity_id: Unique identifier for the entity

        Returns:
            Entity if found, None otherwise
        """
        pass

    @abstractmethod
    def create(self, entity: T) -> T:
        """
        Create new entity

        Args:
            entity: Entity to create

        Returns:
            Created entity with any database-generated fields
        """
        pass

    @abstractmethod
    def update(self, entity_id: str, updates: dict) -> Optional[T]:
        """
        Update entity

        Args:
            entity_id: Unique identifier for the entity
            updates: Dictionary of fields to update

        Returns:
            Updated entity if found, None otherwise
        """
        pass

    @abstractmethod
    def delete(self, entity_id: str) -> bool:
        """
        Delete entity

        Args:
            entity_id: Unique identifier for the entity

        Returns:
            True if deleted, False if not found
        """
        pass

    @abstractmethod
    def list_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """
        List all entities with pagination

        Args:
            skip: Number of entities to skip
            limit: Maximum number of entities to return

        Returns:
            List of entities
        """
        pass


class TaskRepositoryInterface(BaseRepositoryInterface[Task]):
    """Task-specific repository interface"""

    @abstractmethod
    def get_by_project(self, project_id: str) -> List[Task]:
        """
        Get all tasks for a project

        Args:
            project_id: Project identifier

        Returns:
            List of tasks in the project
        """
        pass

    @abstractmethod
    def get_by_status(self, status: str) -> List[Task]:
        """
        Get all tasks with a specific status

        Args:
            status: Task status (todo, in_progress, completed, etc.)

        Returns:
            List of tasks with the given status
        """
        pass

    @abstractmethod
    def get_by_assignee(self, assignee_id: str) -> List[Task]:
        """
        Get all tasks assigned to a user

        Args:
            assignee_id: User identifier

        Returns:
            List of tasks assigned to the user
        """
        pass

    @abstractmethod
    def search(self, query: str) -> List[Task]:
        """
        Search tasks by query string

        Args:
            query: Search query (searches title and description)

        Returns:
            List of matching tasks
        """
        pass


class ProjectRepositoryInterface(BaseRepositoryInterface[Project]):
    """Project-specific repository interface"""

    @abstractmethod
    def get_by_owner(self, owner_id: str) -> List[Project]:
        """
        Get all projects owned by a user

        Args:
            owner_id: User identifier

        Returns:
            List of projects owned by the user
        """
        pass

    @abstractmethod
    def get_active(self) -> List[Project]:
        """
        Get all active projects

        Returns:
            List of active projects
        """
        pass


class UserRepositoryInterface(BaseRepositoryInterface[User]):
    """User-specific repository interface"""

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username

        Args:
            username: Username to search for

        Returns:
            User if found, None otherwise
        """
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email

        Args:
            email: Email to search for

        Returns:
            User if found, None otherwise
        """
        pass
