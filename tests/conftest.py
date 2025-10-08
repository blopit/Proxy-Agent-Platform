"""
Pytest configuration and shared fixtures.

This file provides common test fixtures and configuration for TDD.
"""

import asyncio
import os
import sys
from unittest.mock import AsyncMock, Mock

import pytest

# Add project paths
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "agent"))
sys.path.append(os.path.dirname(os.path.dirname(__file__)))


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
