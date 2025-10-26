"""
TaskRepository v2 with SQLAlchemy and Dependency Injection

This implementation uses SQLAlchemy ORM models and accepts
the database session via dependency injection for testability.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.database.models import Task as TaskModel
from src.core.task_models import Task, TaskStatus, TaskPriority
from src.repositories.interfaces import TaskRepositoryInterface


class TaskRepository(TaskRepositoryInterface):
    """
    SQLAlchemy implementation of TaskRepository

    Uses dependency injection pattern - database session
    is injected via constructor for easy testing.
    """

    def __init__(self, db: Session):
        """
        Initialize repository with database session

        Args:
            db: SQLAlchemy session (injected)
        """
        self.db = db

    def get_by_id(self, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        task_model = self.db.query(TaskModel).filter(
            TaskModel.task_id == task_id
        ).first()

        if not task_model:
            return None

        return self._to_domain(task_model)

    def create(self, task: Task) -> Task:
        """Create new task"""
        task_model = self._to_model(task)
        self.db.add(task_model)
        self.db.commit()
        self.db.refresh(task_model)

        return self._to_domain(task_model)

    def update(self, task_id: str, updates: dict) -> Optional[Task]:
        """Update task"""
        task_model = self.db.query(TaskModel).filter(
            TaskModel.task_id == task_id
        ).first()

        if not task_model:
            return None

        # Apply updates
        for key, value in updates.items():
            if hasattr(task_model, key):
                setattr(task_model, key, value)

        self.db.commit()
        self.db.refresh(task_model)

        return self._to_domain(task_model)

    def delete(self, task_id: str) -> bool:
        """Delete task"""
        result = self.db.query(TaskModel).filter(
            TaskModel.task_id == task_id
        ).delete()
        self.db.commit()

        return result > 0

    def list_all(self, skip: int = 0, limit: int = 100) -> List[Task]:
        """List all tasks with pagination"""
        tasks = self.db.query(TaskModel).offset(skip).limit(limit).all()
        return [self._to_domain(t) for t in tasks]

    def get_by_project(self, project_id: str) -> List[Task]:
        """Get tasks by project"""
        tasks = self.db.query(TaskModel).filter(
            TaskModel.project_id == project_id
        ).all()
        return [self._to_domain(t) for t in tasks]

    def get_by_status(self, status: str) -> List[Task]:
        """Get tasks by status"""
        tasks = self.db.query(TaskModel).filter(
            TaskModel.status == status
        ).all()
        return [self._to_domain(t) for t in tasks]

    def get_by_assignee(self, assignee_id: str) -> List[Task]:
        """Get tasks by assignee"""
        tasks = self.db.query(TaskModel).filter(
            TaskModel.assignee_id == assignee_id
        ).all()
        return [self._to_domain(t) for t in tasks]

    def search(self, query: str) -> List[Task]:
        """Search tasks by title or description"""
        tasks = self.db.query(TaskModel).filter(
            or_(
                TaskModel.title.ilike(f"%{query}%"),
                TaskModel.description.ilike(f"%{query}%")
            )
        ).all()
        return [self._to_domain(t) for t in tasks]

    @staticmethod
    def _to_domain(task_model: TaskModel) -> Task:
        """
        Convert SQLAlchemy model to Pydantic domain model

        Args:
            task_model: SQLAlchemy Task model

        Returns:
            Pydantic Task domain model
        """
        return Task(
            task_id=task_model.task_id,
            title=task_model.title,
            description=task_model.description,
            project_id=task_model.project_id,
            parent_id=task_model.parent_id,
            status=TaskStatus(task_model.status),
            priority=TaskPriority(task_model.priority),
            estimated_hours=task_model.estimated_hours,
            actual_hours=task_model.actual_hours,
            tags=(
                task_model.tags if isinstance(task_model.tags, list)
                else eval(task_model.tags) if task_model.tags else []
            ),
            assignee=task_model.assignee_id,  # Note: 'assignee' in domain, 'assignee_id' in DB
            due_date=task_model.due_date,
            started_at=task_model.started_at,
            completed_at=task_model.completed_at,
            created_at=task_model.created_at,
            updated_at=task_model.updated_at,
        )

    @staticmethod
    def _to_model(task: Task) -> TaskModel:
        """
        Convert Pydantic domain model to SQLAlchemy model

        Args:
            task: Pydantic Task domain model

        Returns:
            SQLAlchemy Task model
        """
        return TaskModel(
            task_id=task.task_id,
            title=task.title,
            description=task.description,
            project_id=task.project_id,
            parent_id=task.parent_id,
            status=task.status.value if isinstance(task.status, TaskStatus) else task.status,
            priority=task.priority.value if isinstance(task.priority, TaskPriority) else task.priority,
            estimated_hours=task.estimated_hours,
            actual_hours=task.actual_hours,
            tags=str(task.tags) if task.tags else "[]",
            assignee_id=task.assignee,  # Note: 'assignee' in domain, 'assignee_id' in DB
            due_date=task.due_date,
            started_at=task.started_at,
            completed_at=task.completed_at,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
