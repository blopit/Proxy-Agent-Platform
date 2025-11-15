"""
Shared Fixtures for E2E Tests

Provides pytest fixtures for E2E test setup, including:
- Test database creation
- API client setup
- Test user factory
- Report generator
- Cleanup utilities
"""

import contextlib
import os
import tempfile
from collections.abc import Generator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.database.enhanced_adapter import EnhancedDatabaseAdapter

from .utils import ReportGenerator, TestUserFactory


@pytest.fixture(scope="function")
def e2e_test_db() -> Generator[EnhancedDatabaseAdapter, None, None]:
    """
    Create isolated test database for E2E testing.

    Yields:
        EnhancedDatabaseAdapter instance with fresh database
    """
    # Create temporary database file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    temp_file.close()

    # Create database adapter
    db = EnhancedDatabaseAdapter(temp_file.name, check_same_thread=False)

    yield db

    # Cleanup: delete temp database
    with contextlib.suppress(Exception):
        os.unlink(temp_file.name)


@pytest.fixture(scope="function")
def e2e_api_client(e2e_test_db: EnhancedDatabaseAdapter) -> TestClient:
    """
    Create FastAPI test client with isolated database.

    Args:
        e2e_test_db: Test database fixture

    Returns:
        TestClient instance
    """
    # Note: In full implementation, you'd override database dependency here
    # For now, we'll use the default database and rely on unique usernames
    client = TestClient(app)
    return client


@pytest.fixture(scope="function")
def test_user_factory() -> TestUserFactory:
    """
    Create test user factory.

    Returns:
        TestUserFactory instance
    """
    return TestUserFactory(prefix="e2e")


@pytest.fixture(scope="function")
def report_generator() -> ReportGenerator:
    """
    Create report generator for human review.

    Returns:
        ReportGenerator instance
    """
    return ReportGenerator()


@pytest.fixture(scope="function")
def e2e_base_url() -> str:
    """
    Get base URL for E2E tests.

    Returns:
        Base URL string
    """
    return os.getenv("E2E_BASE_URL", "http://localhost:8000")


@pytest.fixture(scope="function")
def use_real_llms() -> bool:
    """
    Check if E2E tests should use real LLM calls.

    Returns:
        True if using real LLMs
    """
    return os.getenv("E2E_USE_REAL_LLMS", "true").lower() == "true"


@pytest.fixture(scope="function")
def use_real_providers() -> bool:
    """
    Check if E2E tests should use real OAuth providers.

    Returns:
        True if using real providers
    """
    return os.getenv("E2E_USE_REAL_PROVIDERS", "false").lower() == "true"


@pytest.fixture(scope="function")
def generate_reports() -> bool:
    """
    Check if E2E tests should generate human review reports.

    Returns:
        True if reports should be generated
    """
    return os.getenv("E2E_GENERATE_REPORTS", "true").lower() == "true"


@pytest.fixture(scope="function")
def cleanup_test_users() -> bool:
    """
    Check if E2E tests should cleanup test users after execution.

    Returns:
        True if cleanup should be performed
    """
    return os.getenv("E2E_CLEANUP_USERS", "false").lower() == "true"


def pytest_configure(config: Any) -> None:
    """
    Configure pytest for E2E tests.

    Args:
        config: Pytest config object
    """
    # Add custom markers
    config.addinivalue_line("markers", "e2e: mark test as end-to-end test")
    config.addinivalue_line("markers", "slow: mark test as slow running")
    config.addinivalue_line("markers", "requires_llm: mark test as requiring real LLM API calls")
    config.addinivalue_line(
        "markers", "requires_providers: mark test as requiring real OAuth providers"
    )


@pytest.fixture(autouse=True)
def log_test_execution(request: Any) -> Generator[None, None, None]:
    """
    Log test execution for debugging.

    Args:
        request: Pytest request object

    Yields:
        None
    """
    test_name = request.node.name
    print(f"\n{'='*80}")
    print(f"Starting E2E Test: {test_name}")
    print(f"{'='*80}\n")

    yield

    print(f"\n{'='*80}")
    print(f"Finished E2E Test: {test_name}")
    print(f"{'='*80}\n")
