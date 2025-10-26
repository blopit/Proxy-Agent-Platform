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
