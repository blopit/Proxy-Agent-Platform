"""
Pytest configuration for database tests

Provides isolated test fixtures to avoid database locks
"""

import sqlite3

import pytest


@pytest.fixture
def isolated_db():
    """
    Provide isolated SQLite database for testing.

    Does NOT use EnhancedDatabaseAdapter to avoid initialization issues.
    Creates raw SQLite connection for schema testing.
    """
    # Use in-memory database
    conn = sqlite3.connect(":memory:")

    # Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON")

    yield conn

    conn.close()
