"""
Shared pytest fixtures for service tests
"""

import os
import tempfile
from pathlib import Path
from typing import Generator
from uuid import uuid4

import pytest

from src.core.task_models import Project, TaskPriority
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.repositories.enhanced_repositories import EnhancedProjectRepository
from src.services.task_service import TaskService, ProjectCreationData
from src.services.micro_step_service import MicroStepService


@pytest.fixture(scope="function")
def test_db() -> Generator[EnhancedDatabaseAdapter, None, None]:
    """
    Create a temporary test database for each test function.

    Yields:
        EnhancedDatabaseAdapter: Test database instance
    """
    # Create temporary database file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    temp_file.close()

    # Initialize database with thread safety disabled for testing
    db = EnhancedDatabaseAdapter(temp_file.name, check_same_thread=False)

    # Apply migrations 007, 008, 009
    migrations_dir = Path(__file__).parent.parent.parent / "database" / "migrations"

    migration_files = [
        "007_add_micro_steps.sql",
        "008_add_reflections.sql",
        "009_add_user_progress.sql",
    ]

    conn = db.get_connection()

    for migration_file in migration_files:
        migration_path = migrations_dir / migration_file
        if migration_path.exists():
            with open(migration_path, "r") as f:
                migration_sql = f.read()
                conn.executescript(migration_sql)

    conn.commit()

    yield db

    # Cleanup
    try:
        os.unlink(temp_file.name)
    except Exception:
        pass  # Ignore cleanup errors


@pytest.fixture(scope="function")
def test_project(test_db: EnhancedDatabaseAdapter) -> Project:
    """
    Create a test project in the database

    Args:
        test_db: Test database fixture

    Returns:
        Project: Created test project
    """
    project_repo = EnhancedProjectRepository(test_db)

    project = Project(
        project_id=str(uuid4()),
        name="Test Project",
        description="A test project for testing",
        owner_id=None,
        team_members=["test-user"],
    )

    created_project = project_repo.create(project)
    return created_project


@pytest.fixture
def task_service(test_db: EnhancedDatabaseAdapter) -> TaskService:
    """
    Provide TaskService instance for testing

    Args:
        test_db: Test database with migrations applied

    Returns:
        TaskService: Configured task service
    """
    return TaskService(test_db)


@pytest.fixture
def micro_step_service(test_db: EnhancedDatabaseAdapter) -> MicroStepService:
    """
    Provide MicroStepService instance for testing

    Args:
        test_db: Test database with migrations applied

    Returns:
        MicroStepService: Configured micro-step service
    """
    return MicroStepService(test_db)
