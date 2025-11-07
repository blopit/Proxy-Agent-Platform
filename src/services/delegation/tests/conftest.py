"""
Pytest configuration for delegation tests.
"""

import pytest
from fastapi.testclient import TestClient

from src.core.task_models import Project, Task


@pytest.fixture(scope="function")
def test_client(
    client_with_test_db: TestClient, test_task: Task, test_project: Project
) -> TestClient:
    """
    Alias for the main test client fixture with task and project setup.

    Ensures both project and task exist in the test database before tests run,
    avoiding foreign key constraint errors.

    Args:
        client_with_test_db: Main test client fixture from root conftest
        test_task: Test task fixture (creates task in test DB)
        test_project: Test project fixture (creates project in test DB)

    Returns:
        TestClient: FastAPI test client with test database
    """
    # The test_task and test_project fixtures ensure data exists
    # We just need to return the client
    return client_with_test_db


@pytest.fixture(scope="function")
def valid_task_id(test_task: Task) -> str:
    """
    Provide a valid task ID for testing.

    Args:
        test_task: Test task fixture (ensures task exists in DB)

    Returns:
        str: Valid task ID that exists in database
    """
    return test_task.task_id
