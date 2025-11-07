"""
ProjectRepository v2 with SQLAlchemy and Dependency Injection

This implementation uses SQLAlchemy ORM models and accepts
the database session via dependency injection for testability.
"""

from sqlalchemy.orm import Session

from src.core.task_models import Project
from src.database.models import Project as ProjectModel
from src.repositories.interfaces import ProjectRepositoryInterface


class ProjectRepository(ProjectRepositoryInterface):
    """
    SQLAlchemy implementation of ProjectRepository

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

    def get_by_id(self, project_id: str) -> Project | None:
        """Get project by ID"""
        project_model = (
            self.db.query(ProjectModel).filter(ProjectModel.project_id == project_id).first()
        )

        if not project_model:
            return None

        return self._to_domain(project_model)

    def create(self, project: Project) -> Project:
        """Create new project"""
        project_model = self._to_model(project)
        self.db.add(project_model)
        self.db.commit()
        self.db.refresh(project_model)

        return self._to_domain(project_model)

    def update(self, project_id: str, updates: dict) -> Project | None:
        """Update project"""
        project_model = (
            self.db.query(ProjectModel).filter(ProjectModel.project_id == project_id).first()
        )

        if not project_model:
            return None

        # Apply updates
        for key, value in updates.items():
            if hasattr(project_model, key):
                setattr(project_model, key, value)

        self.db.commit()
        self.db.refresh(project_model)

        return self._to_domain(project_model)

    def delete(self, project_id: str) -> bool:
        """Delete project"""
        result = self.db.query(ProjectModel).filter(ProjectModel.project_id == project_id).delete()
        self.db.commit()

        return result > 0

    def list_all(self, skip: int = 0, limit: int = 100) -> list[Project]:
        """List all projects with pagination"""
        projects = self.db.query(ProjectModel).offset(skip).limit(limit).all()
        return [self._to_domain(p) for p in projects]

    def get_by_owner(self, owner_id: str) -> list[Project]:
        """Get projects by owner (placeholder implementation)"""
        # TODO: Add owner_id to Project model
        return self.list_all()

    def get_active(self) -> list[Project]:
        """Get active projects (placeholder implementation)"""
        # TODO: Add is_active field to Project model
        return self.list_all()

    @staticmethod
    def _to_domain(project_model: ProjectModel) -> Project:
        """
        Convert SQLAlchemy model to Pydantic domain model

        Args:
            project_model: SQLAlchemy Project model

        Returns:
            Pydantic Project domain model
        """
        return Project(
            project_id=project_model.project_id,
            name=project_model.name,
            description=project_model.description,
            created_at=project_model.created_at,
            updated_at=project_model.updated_at,
        )

    @staticmethod
    def _to_model(project: Project) -> ProjectModel:
        """
        Convert Pydantic domain model to SQLAlchemy model

        Args:
            project: Pydantic Project domain model

        Returns:
            SQLAlchemy Project model
        """
        return ProjectModel(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            created_at=project.created_at,
            updated_at=project.updated_at,
        )
