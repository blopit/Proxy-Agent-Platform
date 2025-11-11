"""
Shared fixtures and configuration for integration tests.

These fixtures are used across all integration tests to ensure
consistent setup and teardown of test data.
"""

import os
from datetime import datetime

import pytest
import requests

# Base configuration
BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8000")
TEST_TIMEOUT = int(os.getenv("TEST_TIMEOUT", "10"))


@pytest.fixture(scope="session")
def base_url():
    """Provide the base URL for API calls."""
    return BASE_URL


@pytest.fixture(scope="session")
def api_timeout():
    """Provide timeout for API calls."""
    return TEST_TIMEOUT


@pytest.fixture
def test_user_id():
    """Generate a unique test user ID for each test."""
    return f"test_user_{int(datetime.now().timestamp())}"


@pytest.fixture
def api_client(base_url, api_timeout):
    """Provide a configured requests session for API calls."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})

    def make_request(method, endpoint, **kwargs):
        """Make an API request with automatic URL construction."""
        url = f"{base_url}{endpoint}"
        kwargs.setdefault("timeout", api_timeout)
        return session.request(method, url, **kwargs)

    session.api_request = make_request
    return session


@pytest.fixture
def sample_onboarding_data():
    """Provide sample onboarding data for testing."""
    return {
        "work_preference": "remote",
        "adhd_support_level": 7,
        "adhd_challenges": ["time_blindness", "task_initiation", "focus"],
        "daily_schedule": {
            "time_preference": "morning",
            "flexible_enabled": False,
            "week_grid": {
                "monday": "8-17",
                "tuesday": "8-17",
                "wednesday": "flexible",
                "thursday": "8-17",
                "friday": "8-13",
                "saturday": "off",
                "sunday": "off",
            },
        },
        "productivity_goals": ["reduce_overwhelm", "increase_focus", "build_habits"],
    }


@pytest.fixture
def cleanup_onboarding_data(base_url):
    """Cleanup fixture to remove test data after tests."""
    user_ids_to_cleanup = []

    yield user_ids_to_cleanup

    # Cleanup after test
    for user_id in user_ids_to_cleanup:
        try:
            requests.delete(
                f"{base_url}/api/v1/users/{user_id}/onboarding",
                timeout=TEST_TIMEOUT
            )
        except Exception:
            pass  # Ignore cleanup errors


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test (requires running backend)"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )


def pytest_collection_modifyitems(config, items):
    """Automatically mark all tests in integration folder."""
    for item in items:
        if "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
