"""Pytest configuration for Google integration tests."""

import pytest


# Add any fixtures needed specifically for Google integration tests
@pytest.fixture(autouse=True)
def skip_db_setup():
    """Skip database setup for integration tests."""
    pass
