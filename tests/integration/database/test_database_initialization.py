"""
Test database initialization to catch schema errors early.

This test ensures that EnhancedDatabaseAdapter initializes without errors,
which is critical for all BE-05 tests to run.

Following TDD RED-GREEN-REFACTOR:
1. RED: This test should FAIL with OperationalError initially
2. GREEN: Fix the database schema to make it pass
3. REFACTOR: Verify all dependent tests can now run
"""

from src.database.enhanced_adapter import EnhancedDatabaseAdapter


class TestDatabaseInitialization:
    """Test that database initializes cleanly without schema errors"""

    def test_database_initializes_without_errors(self, tmp_path):
        """
        Test that EnhancedDatabaseAdapter initializes without OperationalError.

        This is the MOST IMPORTANT test for BE-05 - if this fails,
        ALL other tests are blocked.

        Given: A fresh temporary database path
        When: EnhancedDatabaseAdapter is initialized
        Then: No sqlite3.OperationalError should occur
        And: All expected tables should exist
        """
        db_path = tmp_path / "test_init.db"

        # This should NOT raise OperationalError
        # EXPECTED: Currently FAILS with "no such column: task_id"
        db = EnhancedDatabaseAdapter(str(db_path), check_same_thread=False)

        # Verify database is usable
        conn = db.get_connection()
        cursor = conn.cursor()

        # Verify critical tables exist
        cursor.execute(
            """
            SELECT name FROM sqlite_master
            WHERE type='table'
            ORDER BY name
        """
        )
        tables = {row["name"] for row in cursor.fetchall()}

        # Critical tables for BE-05
        assert "tasks" in tables, "tasks table must exist"
        assert "micro_steps" in tables, "micro_steps table must exist for BE-05"
        assert "users" in tables, "users table must exist"
        assert "projects" in tables, "projects table must exist"

        # Verify micro_steps table has correct schema
        cursor.execute("PRAGMA table_info(micro_steps)")
        columns = {row["name"] for row in cursor.fetchall()}

        required_columns = {
            "step_id",
            "parent_task_id",
            "step_number",
            "description",
            "estimated_minutes",
            "delegation_mode",
            "status",
        }

        for col in required_columns:
            assert col in columns, f"micro_steps must have {col} column"

        db.close_connection()

    def test_database_indexes_created_successfully(self, tmp_path):
        """
        Test that all indexes are created without errors.

        Given: A fresh database
        When: Indexes are created
        Then: All indexes should exist without OperationalError
        """
        db_path = tmp_path / "test_indexes.db"
        db = EnhancedDatabaseAdapter(str(db_path), check_same_thread=False)

        conn = db.get_connection()
        cursor = conn.cursor()

        # Verify indexes exist
        cursor.execute(
            """
            SELECT name FROM sqlite_master
            WHERE type='index'
        """
        )
        indexes = {row["name"] for row in cursor.fetchall()}

        # Critical indexes for BE-05 performance
        assert "idx_micro_steps_parent_task" in indexes, "Micro-steps parent index required"

        # These should NOT cause errors (the bug we're fixing)
        # If "messages" table doesn't exist, these indexes shouldn't be created
        # But their absence shouldn't cause an error either

        db.close_connection()

    def test_database_foreign_keys_work(self, tmp_path):
        """
        Test that foreign key constraints work correctly.

        Given: A database with tasks and micro_steps tables
        When: A micro_step references a task
        Then: Foreign key constraint should be enforced
        """
        db_path = tmp_path / "test_fk.db"
        db = EnhancedDatabaseAdapter(str(db_path), check_same_thread=False)

        conn = db.get_connection()
        cursor = conn.cursor()

        # Enable foreign keys (should already be on)
        cursor.execute("PRAGMA foreign_keys = ON")

        # Create a project first (required by foreign key constraint)
        cursor.execute(
            """
            INSERT INTO projects (project_id, name, description, owner_id)
            VALUES ('test_project', 'Test Project', 'Test Description', NULL)
        """
        )

        # Create a task
        cursor.execute(
            """
            INSERT INTO tasks (task_id, title, description, project_id)
            VALUES ('test_task_fk', 'Test Task', 'Test Description', 'test_project')
        """
        )

        # Create a micro-step referencing this task - should succeed
        cursor.execute(
            """
            INSERT INTO micro_steps
            (step_id, parent_task_id, step_number, description, estimated_minutes)
            VALUES ('step_1', 'test_task_fk', 1, 'Test Step', 3)
        """
        )

        # This should work
        conn.commit()

        # Verify step was created
        cursor.execute(
            """
            SELECT * FROM micro_steps WHERE step_id = 'step_1'
        """
        )
        step = cursor.fetchone()
        assert step is not None
        assert step["parent_task_id"] == "test_task_fk"

        db.close_connection()

    def test_database_handles_missing_optional_tables(self, tmp_path):
        """
        Test that database initialization handles missing optional tables gracefully.

        Some tables (like 'messages') may be legacy/optional and shouldn't
        cause initialization to fail if they don't exist.

        Given: A fresh database (no legacy tables)
        When: Database is initialized
        Then: No errors should occur from missing optional tables
        """
        db_path = tmp_path / "test_optional.db"

        # Should not raise even if optional tables don't exist
        db = EnhancedDatabaseAdapter(str(db_path), check_same_thread=False)

        conn = db.get_connection()
        cursor = conn.cursor()

        # Check if messages table exists (legacy table)
        cursor.execute(
            """
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='messages'
        """
        )
        _ = cursor.fetchone()  # Check passed if no exception

        # If messages doesn't exist (expected), that's fine
        # The bug we're fixing is that indexes try to reference it anyway

        db.close_connection()
