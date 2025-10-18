"""
Shared pytest configuration and fixtures for all tests
"""

import os
import tempfile
from typing import Generator
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.core.task_models import Project, Task, TaskPriority
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.repositories.enhanced_repositories import (
    EnhancedProjectRepository,
    EnhancedTaskRepository,
)
from src.services.task_service import ProjectCreationData, TaskService


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

    yield db

    # Cleanup
    try:
        os.unlink(temp_file.name)
    except Exception:
        pass  # Ignore cleanup errors


@pytest.fixture(scope="function")
def test_db_path(test_db: EnhancedDatabaseAdapter) -> str:
    """
    Get the path to the test database.

    Args:
        test_db: Test database fixture

    Returns:
        str: Path to test database file
    """
    return test_db.db_path


@pytest.fixture(scope="function")
def test_project(test_db: EnhancedDatabaseAdapter) -> Project:
    """
    Create a test project in the database to satisfy foreign key constraints.

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
        owner_id=None,  # None to avoid foreign key constraints in tests
        team_members=["test-user"],
    )

    created_project = project_repo.create(project)
    return created_project


@pytest.fixture(scope="function")
def test_task(test_db: EnhancedDatabaseAdapter, test_project: Project) -> Task:
    """
    Create a test task in the database.

    Args:
        test_db: Test database fixture
        test_project: Test project fixture

    Returns:
        Task: Created test task
    """
    task_repo = EnhancedTaskRepository(test_db)

    task = Task(
        task_id=str(uuid4()),
        title="Test Task",
        description="A test task for testing",
        project_id=test_project.project_id,
        priority=TaskPriority.MEDIUM,
    )

    created_task = task_repo.create(task)
    return created_task


@pytest.fixture(scope="function")
def test_task_service(test_db: EnhancedDatabaseAdapter) -> TaskService:
    """
    Create a TaskService instance using the test database.

    Args:
        test_db: Test database fixture

    Returns:
        TaskService: Task service configured with test database
    """
    return TaskService(db=test_db)


@pytest.fixture(scope="function")
def client_with_test_db(test_db: EnhancedDatabaseAdapter) -> Generator[TestClient, None, None]:
    """
    Create a FastAPI TestClient with test database dependency override.

    Args:
        test_db: Test database fixture

    Returns:
        TestClient: FastAPI test client with test database
    """
    from src.api.tasks import get_task_service
    from src.database.enhanced_adapter import get_enhanced_database

    # Override database dependency to use test database
    def override_get_database():
        return test_db

    # Override task service dependency to use test database
    def override_get_task_service():
        return TaskService(db=test_db)

    app.dependency_overrides[get_enhanced_database] = override_get_database
    app.dependency_overrides[get_task_service] = override_get_task_service

    client = TestClient(app)

    yield client

    # Cleanup overrides
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def sample_project_data() -> ProjectCreationData:
    """
    Provide sample project creation data for testing.

    Returns:
        ProjectCreationData: Sample project data
    """
    return ProjectCreationData(
        name="Sample Project",
        description="A sample project for testing",
        owner="test-user",
        team_members=["test-user", "user2"],
    )
