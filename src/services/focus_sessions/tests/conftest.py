"""
Pytest fixtures for Focus Sessions Service tests (BE-03).
"""


import pytest
from fastapi.testclient import TestClient

from src.api.main import app


@pytest.fixture
def test_client():
    """Provide FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def sample_session_data():
    """Fixture for valid focus session creation data."""
    return {
        "user_id": "test-user-123",
        "step_id": None,  # Optional
        "duration_minutes": 25,  # Pomodoro default
    }


@pytest.fixture
def sample_completed_session():
    """Fixture for a completed focus session."""
    return {
        "user_id": "test-user-123",
        "step_id": None,
        "duration_minutes": 25,
        "completed": True,
        "interruptions": 0,
    }
