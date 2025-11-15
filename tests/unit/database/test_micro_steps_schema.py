"""
TDD Tests for MicroSteps Database Schema

Tests written FIRST before migration implementation.
Following Test-Driven Development: Red → Green → Refactor
"""

from datetime import datetime
from pathlib import Path
from uuid import uuid4

import pytest


@pytest.fixture
def db(isolated_db):
    """Provide test database with migrations applied"""
    # Create minimal tasks table for foreign key testing
    isolated_db.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            task_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Apply 007_add_micro_steps.sql migration
    migration_path = Path(__file__).parent.parent / "migrations" / "007_add_micro_steps.sql"
    with open(migration_path) as f:
        migration_sql = f.read()
        isolated_db.executescript(migration_sql)

    isolated_db.commit()

    return isolated_db


def get_table_columns(db, table_name):
    """Helper to get column names from a table"""
    cursor = db.execute(f"PRAGMA table_info({table_name})")
    columns = {row[1]: row[2] for row in cursor.fetchall()}  # name: type
    return columns


def table_exists(db, table_name):
    """Helper to check if table exists"""
    cursor = db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,)
    )
    return cursor.fetchone() is not None


class TestMicroStepsTableExists:
    """Test that micro_steps table is created"""

    def test_micro_steps_table_exists(self, db):
        """Test that micro_steps table is created by migration"""
        # This will FAIL until we create the migration
        assert table_exists(db, "micro_steps"), "micro_steps table should exist"

    def test_micro_steps_table_has_primary_key(self, db):
        """Test that step_id is the primary key"""
        cursor = db.execute("PRAGMA table_info(micro_steps)")
        columns = cursor.fetchall()

        # Find step_id column and check if it's primary key
        step_id_col = [col for col in columns if col[1] == "step_id"]
        assert len(step_id_col) == 1, "step_id column should exist"
        assert step_id_col[0][5] == 1, "step_id should be primary key (pk=1)"


class TestMicroStepsTableSchema:
    """Test micro_steps table has required columns"""

    def test_has_required_columns(self, db):
        """Test all required columns exist"""
        columns = get_table_columns(db, "micro_steps")

        required_columns = [
            "step_id",
            "parent_task_id",
            "description",
            "estimated_minutes",
            "leaf_type",
            "delegation_mode",
            "automation_plan",
            "completed",
            "completed_at",
            "energy_level",
            "created_at",
        ]

        for col in required_columns:
            assert col in columns, f"Column {col} should exist in micro_steps table"

    def test_step_id_is_text(self, db):
        """Test step_id is TEXT type (for UUID)"""
        columns = get_table_columns(db, "micro_steps")
        assert columns["step_id"] == "TEXT", "step_id should be TEXT type"

    def test_parent_task_id_is_text(self, db):
        """Test parent_task_id is TEXT type"""
        columns = get_table_columns(db, "micro_steps")
        assert columns["parent_task_id"] == "TEXT"

    def test_description_is_text_not_null(self, db):
        """Test description is TEXT NOT NULL"""
        columns = get_table_columns(db, "micro_steps")
        assert columns["description"] == "TEXT", "description should be TEXT type"

        # Try to insert without description (should fail)

        with pytest.raises(Exception):  # Will raise IntegrityError
            db.execute(
                """
                INSERT INTO micro_steps (step_id, parent_task_id, estimated_minutes)
                VALUES (?, ?, ?)
            """,
                (str(uuid4()), str(uuid4()), 5),
            )

    def test_estimated_minutes_is_integer(self, db):
        """Test estimated_minutes is INTEGER type"""
        columns = get_table_columns(db, "micro_steps")
        assert columns["estimated_minutes"] == "INTEGER"

    def test_completed_is_boolean_default_false(self, db):
        """Test completed column defaults to FALSE"""

        # Insert row without specifying completed
        task_id = str(uuid4())
        step_id = str(uuid4())

        # First insert parent task
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        db.execute(
            """
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """,
            (step_id, task_id, "Test step", 5),
        )

        # Check default value
        cursor = db.execute("SELECT completed FROM micro_steps WHERE step_id = ?", (step_id,))
        result = cursor.fetchone()
        assert result[0] == 0, "completed should default to FALSE (0)"

    def test_energy_level_is_integer(self, db):
        """Test energy_level is INTEGER type"""
        columns = get_table_columns(db, "micro_steps")
        assert columns["energy_level"] == "INTEGER"


class TestMicroStepsForeignKeys:
    """Test foreign key constraints"""

    def test_parent_task_id_references_tasks(self, db):
        """Test that parent_task_id has foreign key to tasks table"""

        # Try to insert micro_step with non-existent parent task
        # Should fail if foreign key is enforced
        with pytest.raises(Exception):  # IntegrityError
            db.execute(
                """
                INSERT INTO micro_steps (
                    step_id, parent_task_id, description, estimated_minutes
                )
                VALUES (?, ?, ?, ?)
            """,
                (str(uuid4()), "non-existent-task-id", "Test", 5),
            )

    def test_cascade_delete_on_parent_task(self, db):
        """Test that deleting parent task cascades to micro_steps"""

        # Create parent task
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test Task"))

        # Create micro-step
        step_id = str(uuid4())
        db.execute(
            """
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """,
            (step_id, task_id, "Test Step", 5),
        )

        # Verify micro-step exists
        cursor = db.execute("SELECT * FROM micro_steps WHERE step_id = ?", (step_id,))
        assert cursor.fetchone() is not None

        # Delete parent task
        db.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))

        # Micro-step should be deleted (CASCADE)
        cursor = db.execute("SELECT * FROM micro_steps WHERE step_id = ?", (step_id,))
        assert cursor.fetchone() is None, "Micro-step should be CASCADE deleted"


class TestMicroStepsDataTypes:
    """Test data type constraints and validations"""

    def test_automation_plan_stores_json(self, db):
        """Test automation_plan can store JSON data"""

        # Create parent task
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        # Insert with JSON automation plan
        step_id = str(uuid4())
        import json

        automation_plan = json.dumps({"type": "email", "steps": ["Open client", "Compose", "Send"]})

        db.execute(
            """
            INSERT INTO micro_steps (
                step_id, parent_task_id, description,
                estimated_minutes, automation_plan
            )
            VALUES (?, ?, ?, ?, ?)
        """,
            (step_id, task_id, "Email task", 3, automation_plan),
        )

        # Retrieve and verify
        cursor = db.execute("SELECT automation_plan FROM micro_steps WHERE step_id = ?", (step_id,))
        result = cursor.fetchone()[0]
        parsed = json.loads(result)

        assert parsed["type"] == "email"
        assert len(parsed["steps"]) == 3

    def test_leaf_type_accepts_valid_values(self, db):
        """Test leaf_type accepts DIGITAL and HUMAN"""

        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        # Test DIGITAL
        step_id_1 = str(uuid4())
        db.execute(
            """
            INSERT INTO micro_steps (
                step_id, parent_task_id, description,
                estimated_minutes, leaf_type
            )
            VALUES (?, ?, ?, ?, ?)
        """,
            (step_id_1, task_id, "Digital task", 5, "DIGITAL"),
        )

        # Test HUMAN
        step_id_2 = str(uuid4())
        db.execute(
            """
            INSERT INTO micro_steps (
                step_id, parent_task_id, description,
                estimated_minutes, leaf_type
            )
            VALUES (?, ?, ?, ?, ?)
        """,
            (step_id_2, task_id, "Human task", 5, "HUMAN"),
        )

        # Verify both inserted
        cursor = db.execute("SELECT COUNT(*) FROM micro_steps WHERE parent_task_id = ?", (task_id,))
        assert cursor.fetchone()[0] == 2


class TestMicroStepsTimestamps:
    """Test timestamp handling"""

    def test_created_at_defaults_to_current_timestamp(self, db):
        """Test created_at automatically sets to current time"""

        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        step_id = str(uuid4())

        db.execute(
            """
            INSERT INTO micro_steps (
                step_id, parent_task_id, description, estimated_minutes
            )
            VALUES (?, ?, ?, ?)
        """,
            (step_id, task_id, "Test", 5),
        )

        # Check created_at is set (not NULL)
        cursor = db.execute("SELECT created_at FROM micro_steps WHERE step_id = ?", (step_id,))
        created_at_str = cursor.fetchone()[0]

        assert created_at_str is not None, "created_at should be automatically set"
        # Verify it's a valid timestamp format
        created_at = datetime.fromisoformat(created_at_str)
        assert isinstance(created_at, datetime)

    def test_completed_at_is_null_by_default(self, db):
        """Test completed_at is NULL until task is completed"""

        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        step_id = str(uuid4())
        db.execute(
            """
            INSERT INTO micro_steps (
                step_id, parent_task_id, description, estimated_minutes
            )
            VALUES (?, ?, ?, ?)
        """,
            (step_id, task_id, "Test", 5),
        )

        cursor = db.execute("SELECT completed_at FROM micro_steps WHERE step_id = ?", (step_id,))
        assert cursor.fetchone()[0] is None


class TestMicroStepsQueries:
    """Test common query patterns"""

    def test_get_micro_steps_by_parent_task(self, db):
        """Test retrieving all micro-steps for a task"""

        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        # Insert 3 micro-steps
        for i in range(3):
            step_id = str(uuid4())
            db.execute(
                """
                INSERT INTO micro_steps (
                    step_id, parent_task_id, description, estimated_minutes
                )
                VALUES (?, ?, ?, ?)
            """,
                (step_id, task_id, f"Step {i + 1}", 5),
            )

        # Query all micro-steps for task
        cursor = db.execute(
            """
            SELECT * FROM micro_steps WHERE parent_task_id = ?
        """,
            (task_id,),
        )

        results = cursor.fetchall()
        assert len(results) == 3

    def test_get_incomplete_micro_steps(self, db):
        """Test filtering for incomplete tasks"""

        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        # Insert completed and incomplete steps
        step_id_complete = str(uuid4())
        db.execute(
            """
            INSERT INTO micro_steps (
                step_id, parent_task_id, description,
                estimated_minutes, completed
            )
            VALUES (?, ?, ?, ?, ?)
        """,
            (step_id_complete, task_id, "Completed", 5, 1),
        )

        step_id_incomplete = str(uuid4())
        db.execute(
            """
            INSERT INTO micro_steps (
                step_id, parent_task_id, description,
                estimated_minutes, completed
            )
            VALUES (?, ?, ?, ?, ?)
        """,
            (step_id_incomplete, task_id, "Incomplete", 5, 0),
        )

        # Query incomplete only
        cursor = db.execute("""
            SELECT * FROM micro_steps WHERE completed = 0
        """)

        results = cursor.fetchall()
        assert len(results) == 1
        assert (
            results[0][3] == "Incomplete"
        )  # description column (index 3: step_id, parent_task_id, step_number, description)
