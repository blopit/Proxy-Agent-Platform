"""
Pytest configuration and shared fixtures.

This file provides common test fixtures and configuration for TDD.
"""

import asyncio
import os
import sys
from datetime import datetime, timezone
from typing import Generator
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from faker import Faker
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.database.models import Base
from src.core.task_models import TaskStatus, TaskPriority, TaskScope

# Add project paths
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "agent"))
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

fake = Faker()


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_db_session():
    """Mock database session for testing."""
    session = AsyncMock()
    session.add = Mock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.get = AsyncMock()
    session.execute = AsyncMock()
    return session


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "total_xp": 150,
        "current_level": 2,
        "current_streak": 5,
        "is_active": True,
    }


@pytest.fixture
def sample_task_data():
    """Sample task data for testing."""
    return {
        "id": 1,
        "user_id": 1,
        "title": "Test Task",
        "description": "A test task for TDD",
        "status": "pending",
        "priority": "medium",
        "estimated_duration": 30,
        "xp_reward": 50,
        "ai_suggested": True,
    }


@pytest.fixture
def cli_test_args():
    """Common CLI test arguments."""
    return {"base_url": "http://localhost:8000", "user_id": 1}


# Test data factories
class TestDataFactory:
    """Factory for creating test data."""

    @staticmethod
    def create_task_request(action="create", **kwargs):
        """Create a task request for testing."""
        base_request = {
            "action": action,
            "task_data": {
                "title": "Test Task",
                "description": "Test description",
                "priority": "medium",
            },
        }

        if kwargs:
            base_request.update(kwargs)

        return base_request

    @staticmethod
    def create_agent_response(success=True, **kwargs):
        """Create an agent response for testing."""
        from agents.base_agent import AgentResponse

        base_response = {
            "success": success,
            "message": "Test response",
            "data": {"test": "data"},
            "suggestions": ["Test suggestion"],
        }

        base_response.update(kwargs)
        return AgentResponse(**base_response)


@pytest.fixture
def test_data_factory():
    """Test data factory fixture."""
    return TestDataFactory


# ============================================================================
# Database Fixtures for TDD (Sprint 1.2)
# ============================================================================

@pytest.fixture(scope="function")
def test_db() -> Generator[Session, None, None]:
    """
    Create in-memory SQLite database for testing

    Each test gets a fresh database that's destroyed after the test.
    This ensures test isolation.
    """
    # Create in-memory database
    engine = create_engine("sqlite:///:memory:")

    # Create all tables
    Base.metadata.create_all(engine)

    # Create session
    TestSessionLocal = sessionmaker(bind=engine)
    session = TestSessionLocal()

    yield session

    # Cleanup
    session.close()
    Base.metadata.drop_all(engine)


@pytest.fixture
def make_task_data():
    """
    Factory for creating task data dictionaries

    Usage:
        task_data = make_task_data(title="Custom Title", priority=TaskPriority.HIGH)
    """
    def _make_task_data(**overrides):
        data = {
            "task_id": str(uuid4()),
            "title": fake.sentence(),
            "description": fake.text(),
            "project_id": str(uuid4()),
            "status": TaskStatus.TODO.value,
            "priority": TaskPriority.MEDIUM.value,
            "scope": TaskScope.SIMPLE.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        data.update(overrides)
        return data
    return _make_task_data


@pytest.fixture
def make_project_data():
    """
    Factory for creating project data dictionaries

    Usage:
        project_data = make_project_data(name="Test Project")
    """
    def _make_project_data(**overrides):
        data = {
            "project_id": str(uuid4()),
            "name": fake.catch_phrase(),
            "description": fake.text(),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        data.update(overrides)
        return data
    return _make_project_data


@pytest.fixture
def make_user_data():
    """
    Factory for creating user data dictionaries
    """
    def _make_user_data(**overrides):
        data = {
            "user_id": str(uuid4()),
            "username": fake.user_name(),
            "email": fake.email(),
            "full_name": fake.name(),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        data.update(overrides)
        return data
    return _make_user_data


@pytest.fixture
def mock_task_repository():
    """
    Mock TaskRepository for service layer unit tests
    """
    return Mock()


@pytest.fixture
def mock_project_repository():
    """
    Mock ProjectRepository for service layer unit tests
    """
    return Mock()


# ============================================================================
# Integration Test Fixtures (Sprint 1.3)
# ============================================================================

@pytest.fixture
async def api_client():
    """
    FastAPI test client for integration tests

    Uses TestClient from httpx for async support.
    """
    from httpx import AsyncClient
    from src.api.main import app

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def test_project(test_db):
    """
    Create a test project in the database

    Returns Project domain model.
    """
    from src.database.models import Project as ProjectModel
    from src.core.task_models import Project

    project_data = {
        "project_id": str(uuid4()),
        "name": "Test Project",
        "description": "A test project for integration tests",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    project_model = ProjectModel(**project_data)
    test_db.add(project_model)
    test_db.commit()
    test_db.refresh(project_model)

    return Project(**project_data)


@pytest.fixture
def test_task(test_db, test_project):
    """
    Create a test task in the database

    Returns Task domain model.
    """
    from src.database.models import Task as TaskModel
    from src.core.task_models import Task

    task_data = {
        "task_id": str(uuid4()),
        "title": "Test Task",
        "description": "A test task for integration tests",
        "project_id": test_project.project_id,
        "status": TaskStatus.TODO.value,
        "priority": TaskPriority.MEDIUM.value,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    task_model = TaskModel(**task_data)
    test_db.add(task_model)
    test_db.commit()
    test_db.refresh(task_model)

    # Convert to domain model
    return Task(
        task_id=task_model.task_id,
        title=task_model.title,
        description=task_model.description,
        project_id=task_model.project_id,
        status=TaskStatus(task_model.status),
        priority=TaskPriority(task_model.priority),
        created_at=task_model.created_at,
        updated_at=task_model.updated_at,
    )


@pytest.fixture
def test_task_in_progress(test_db, test_project):
    """
    Create a test task in IN_PROGRESS status

    Returns Task domain model.
    """
    from src.database.models import Task as TaskModel
    from src.core.task_models import Task

    task_data = {
        "task_id": str(uuid4()),
        "title": "In Progress Task",
        "description": "A task currently in progress",
        "project_id": test_project.project_id,
        "status": TaskStatus.IN_PROGRESS.value,
        "priority": TaskPriority.HIGH.value,
        "started_at": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    task_model = TaskModel(**task_data)
    test_db.add(task_model)
    test_db.commit()
    test_db.refresh(task_model)

    return Task(
        task_id=task_model.task_id,
        title=task_model.title,
        description=task_model.description,
        project_id=task_model.project_id,
        status=TaskStatus(task_model.status),
        priority=TaskPriority(task_model.priority),
        started_at=task_model.started_at,
        created_at=task_model.created_at,
        updated_at=task_model.updated_at,
    )


@pytest.fixture
def test_task_searchable(test_db, test_project):
    """
    Create a task with searchable content

    Returns Task domain model.
    """
    from src.database.models import Task as TaskModel
    from src.core.task_models import Task

    task_data = {
        "task_id": str(uuid4()),
        "title": "Implement user authentication system",
        "description": "Add JWT-based authentication with secure token handling",
        "project_id": test_project.project_id,
        "status": TaskStatus.TODO.value,
        "priority": TaskPriority.HIGH.value,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    task_model = TaskModel(**task_data)
    test_db.add(task_model)
    test_db.commit()
    test_db.refresh(task_model)

    return Task(
        task_id=task_model.task_id,
        title=task_model.title,
        description=task_model.description,
        project_id=task_model.project_id,
        status=TaskStatus(task_model.status),
        priority=TaskPriority(task_model.priority),
        created_at=task_model.created_at,
        updated_at=task_model.updated_at,
    )


@pytest.fixture
def test_project_with_tasks(test_db):
    """
    Create a project with multiple tasks in different statuses

    Returns Project domain model with tasks populated.
    """
    from src.database.models import Project as ProjectModel, Task as TaskModel
    from src.core.task_models import Project

    # Create project
    project_data = {
        "project_id": str(uuid4()),
        "name": "Project with Tasks",
        "description": "A project with multiple tasks for statistics testing",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    project_model = ProjectModel(**project_data)
    test_db.add(project_model)
    test_db.commit()

    # Create tasks in different statuses
    statuses = [TaskStatus.TODO, TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]
    priorities = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.HIGH]

    for i, (status, priority) in enumerate(zip(statuses, priorities)):
        task_data = {
            "task_id": str(uuid4()),
            "title": f"Task {i+1}",
            "description": f"Test task {i+1}",
            "project_id": project_data["project_id"],
            "status": status.value,
            "priority": priority.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        if status == TaskStatus.COMPLETED:
            task_data["completed_at"] = datetime.now(timezone.utc)
        elif status == TaskStatus.IN_PROGRESS:
            task_data["started_at"] = datetime.now(timezone.utc)

        task_model = TaskModel(**task_data)
        test_db.add(task_model)

    test_db.commit()

    return Project(**project_data)
