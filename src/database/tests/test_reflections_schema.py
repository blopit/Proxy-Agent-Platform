"""
TDD Tests for Reflections Database Schema

Tests written FIRST before migration implementation.
Following Test-Driven Development: Red → Green → Refactor
"""

import pytest
from datetime import datetime
from pathlib import Path
from uuid import uuid4


@pytest.fixture
def db(isolated_db):
    """Provide test database with migrations applied"""
    # Create minimal tasks and micro_steps tables for foreign key testing
    isolated_db.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            task_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    isolated_db.execute("""
        CREATE TABLE IF NOT EXISTS micro_steps (
            step_id TEXT PRIMARY KEY,
            parent_task_id TEXT NOT NULL,
            description TEXT NOT NULL,
            estimated_minutes INTEGER,
            completed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
        )
    """)

    # Apply 008_add_reflections.sql migration
    migration_path = Path(__file__).parent.parent / "migrations" / "008_add_reflections.sql"
    with open(migration_path, "r") as f:
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
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,)
    )
    return cursor.fetchone() is not None


class TestReflectionsTableExists:
    """Test that reflections table is created"""

    def test_reflections_table_exists(self, db):
        """Test that reflections table is created by migration"""
        # This will FAIL until we create the migration
        assert table_exists(db, "reflections"), "reflections table should exist"

    def test_reflections_table_has_primary_key(self, db):
        """Test that reflection_id is the primary key"""
        cursor = db.execute("PRAGMA table_info(reflections)")
        columns = cursor.fetchall()

        # Find reflection_id column and check if it's primary key
        reflection_id_col = [col for col in columns if col[1] == "reflection_id"]
        assert len(reflection_id_col) == 1, "reflection_id column should exist"
        assert reflection_id_col[0][5] == 1, "reflection_id should be primary key (pk=1)"


class TestReflectionsTableSchema:
    """Test reflections table has required columns"""

    def test_has_required_columns(self, db):
        """Test all required columns exist"""
        columns = get_table_columns(db, "reflections")

        required_columns = [
            "reflection_id",
            "user_id",
            "reflection_date",
            "step_id",
            "task_id",
            "what_happened",
            "energy_level",
            "difficulty_rating",
            "time_taken_minutes",
            "llm_analysis",
            "detected_patterns",
            "created_at",
        ]

        for col in required_columns:
            assert col in columns, f"Column {col} should exist in reflections table"

    def test_reflection_id_is_text(self, db):
        """Test reflection_id is TEXT type (for UUID)"""
        columns = get_table_columns(db, "reflections")
        assert columns["reflection_id"] == "TEXT", "reflection_id should be TEXT type"

    def test_user_id_is_text_not_null(self, db):
        """Test user_id is TEXT NOT NULL"""
        columns = get_table_columns(db, "reflections")
        assert columns["user_id"] == "TEXT"

        # Try to insert without user_id (should fail)
        with pytest.raises(Exception):  # Will raise IntegrityError
            db.execute("""
                INSERT INTO reflections (
                    reflection_id, reflection_date, what_happened
                )
                VALUES (?, ?, ?)
            """, (str(uuid4()), "2025-10-22", "Test"))

    def test_reflection_date_is_text(self, db):
        """Test reflection_date is TEXT type (ISO format)"""
        columns = get_table_columns(db, "reflections")
        assert columns["reflection_date"] == "TEXT"

    def test_what_happened_is_text_not_null(self, db):
        """Test what_happened is TEXT NOT NULL"""
        columns = get_table_columns(db, "reflections")
        assert columns["what_happened"] == "TEXT"

        # Try to insert without what_happened (should fail)
        with pytest.raises(Exception):
            db.execute("""
                INSERT INTO reflections (reflection_id, user_id, reflection_date)
                VALUES (?, ?, ?)
            """, (str(uuid4()), "alice", "2025-10-22"))

    def test_energy_level_is_integer(self, db):
        """Test energy_level is INTEGER type"""
        columns = get_table_columns(db, "reflections")
        assert columns["energy_level"] == "INTEGER"

    def test_difficulty_rating_is_integer(self, db):
        """Test difficulty_rating is INTEGER type"""
        columns = get_table_columns(db, "reflections")
        assert columns["difficulty_rating"] == "INTEGER"

    def test_time_taken_minutes_is_integer(self, db):
        """Test time_taken_minutes is INTEGER type"""
        columns = get_table_columns(db, "reflections")
        assert columns["time_taken_minutes"] == "INTEGER"


class TestReflectionsForeignKeys:
    """Test foreign key constraints"""

    def test_step_id_references_micro_steps(self, db):
        """Test that step_id has foreign key to micro_steps table"""
        # Create parent task
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        # Create micro-step
        step_id = str(uuid4())
        db.execute("""
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """, (step_id, task_id, "Test Step", 5))

        # Try to insert reflection with non-existent step_id
        # Should fail if foreign key is enforced
        with pytest.raises(Exception):  # IntegrityError
            db.execute("""
                INSERT INTO reflections (
                    reflection_id, user_id, reflection_date,
                    step_id, what_happened
                )
                VALUES (?, ?, ?, ?, ?)
            """, (str(uuid4()), "alice", "2025-10-22", "non-existent-step-id", "Test"))

    def test_task_id_references_tasks(self, db):
        """Test that task_id has foreign key to tasks table"""
        # Try to insert reflection with non-existent task_id
        # Should fail if foreign key is enforced
        with pytest.raises(Exception):  # IntegrityError
            db.execute("""
                INSERT INTO reflections (
                    reflection_id, user_id, reflection_date,
                    task_id, what_happened
                )
                VALUES (?, ?, ?, ?, ?)
            """, (str(uuid4()), "alice", "2025-10-22", "non-existent-task-id", "Test"))

    def test_cascade_delete_on_step(self, db):
        """Test that deleting micro-step cascades to reflections"""
        # Create parent task
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        # Create micro-step
        step_id = str(uuid4())
        db.execute("""
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """, (step_id, task_id, "Test Step", 5))

        # Create reflection
        reflection_id = str(uuid4())
        db.execute("""
            INSERT INTO reflections (
                reflection_id, user_id, reflection_date,
                step_id, what_happened
            )
            VALUES (?, ?, ?, ?, ?)
        """, (reflection_id, "alice", "2025-10-22", step_id, "Test reflection"))

        # Verify reflection exists
        cursor = db.execute("SELECT * FROM reflections WHERE reflection_id = ?", (reflection_id,))
        assert cursor.fetchone() is not None

        # Delete micro-step
        db.execute("DELETE FROM micro_steps WHERE step_id = ?", (step_id,))

        # Reflection should be deleted (CASCADE)
        cursor = db.execute("SELECT * FROM reflections WHERE reflection_id = ?", (reflection_id,))
        assert cursor.fetchone() is None, "Reflection should be CASCADE deleted"


class TestReflectionsDataTypes:
    """Test data type constraints and validations"""

    def test_llm_analysis_stores_json(self, db):
        """Test llm_analysis can store JSON data"""
        # Create parent task and step
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        step_id = str(uuid4())
        db.execute("""
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """, (step_id, task_id, "Test", 5))

        # Insert with JSON llm_analysis
        reflection_id = str(uuid4())
        import json
        llm_analysis = json.dumps({
            "sentiment": "positive",
            "key_insights": ["Good focus", "Task well-scoped"],
            "suggestions": ["Continue this pattern"]
        })

        db.execute("""
            INSERT INTO reflections (
                reflection_id, user_id, reflection_date,
                step_id, what_happened, llm_analysis
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (reflection_id, "alice", "2025-10-22", step_id, "Completed successfully", llm_analysis))

        # Retrieve and verify
        cursor = db.execute("SELECT llm_analysis FROM reflections WHERE reflection_id = ?", (reflection_id,))
        result = cursor.fetchone()[0]
        parsed = json.loads(result)

        assert parsed["sentiment"] == "positive"
        assert len(parsed["key_insights"]) == 2

    def test_detected_patterns_stores_json(self, db):
        """Test detected_patterns can store JSON array"""
        # Create parent task and step
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        step_id = str(uuid4())
        db.execute("""
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """, (step_id, task_id, "Test", 5))

        # Insert with JSON detected_patterns
        reflection_id = str(uuid4())
        import json
        patterns = json.dumps([
            {"pattern": "morning_productivity", "confidence": 0.85},
            {"pattern": "email_distraction", "confidence": 0.72}
        ])

        db.execute("""
            INSERT INTO reflections (
                reflection_id, user_id, reflection_date,
                step_id, what_happened, detected_patterns
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (reflection_id, "alice", "2025-10-22", step_id, "Test", patterns))

        # Retrieve and verify
        cursor = db.execute("SELECT detected_patterns FROM reflections WHERE reflection_id = ?", (reflection_id,))
        result = cursor.fetchone()[0]
        parsed = json.loads(result)

        assert len(parsed) == 2
        assert parsed[0]["pattern"] == "morning_productivity"


class TestReflectionsTimestamps:
    """Test timestamp handling"""

    def test_created_at_defaults_to_current_timestamp(self, db):
        """Test created_at automatically sets to current time"""
        # Create parent task and step
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        step_id = str(uuid4())
        db.execute("""
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """, (step_id, task_id, "Test", 5))

        reflection_id = str(uuid4())

        db.execute("""
            INSERT INTO reflections (
                reflection_id, user_id, reflection_date,
                step_id, what_happened
            )
            VALUES (?, ?, ?, ?, ?)
        """, (reflection_id, "alice", "2025-10-22", step_id, "Test"))

        # Check created_at is set (not NULL)
        cursor = db.execute("SELECT created_at FROM reflections WHERE reflection_id = ?", (reflection_id,))
        created_at_str = cursor.fetchone()[0]

        assert created_at_str is not None, "created_at should be automatically set"
        # Verify it's a valid timestamp format
        created_at = datetime.fromisoformat(created_at_str)
        assert isinstance(created_at, datetime)


class TestReflectionsQueries:
    """Test common query patterns"""

    def test_get_reflections_by_user(self, db):
        """Test retrieving all reflections for a user"""
        # Create parent task and step
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        step_id = str(uuid4())
        db.execute("""
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """, (step_id, task_id, "Test", 5))

        # Insert 3 reflections for alice
        for i in range(3):
            reflection_id = str(uuid4())
            db.execute("""
                INSERT INTO reflections (
                    reflection_id, user_id, reflection_date,
                    step_id, what_happened
                )
                VALUES (?, ?, ?, ?, ?)
            """, (reflection_id, "alice", f"2025-10-{22+i}", step_id, f"Reflection {i+1}"))

        # Insert 1 reflection for bob
        reflection_id = str(uuid4())
        db.execute("""
            INSERT INTO reflections (
                reflection_id, user_id, reflection_date,
                step_id, what_happened
            )
            VALUES (?, ?, ?, ?, ?)
        """, (reflection_id, "bob", "2025-10-22", step_id, "Bob's reflection"))

        # Query all reflections for alice
        cursor = db.execute("""
            SELECT * FROM reflections WHERE user_id = ?
        """, ("alice",))

        results = cursor.fetchall()
        assert len(results) == 3

    def test_get_reflections_by_date(self, db):
        """Test filtering reflections by date"""
        # Create parent task and step
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        step_id = str(uuid4())
        db.execute("""
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """, (step_id, task_id, "Test", 5))

        # Insert reflections for different dates
        dates = ["2025-10-20", "2025-10-21", "2025-10-22"]
        for date in dates:
            reflection_id = str(uuid4())
            db.execute("""
                INSERT INTO reflections (
                    reflection_id, user_id, reflection_date,
                    step_id, what_happened
                )
                VALUES (?, ?, ?, ?, ?)
            """, (reflection_id, "alice", date, step_id, f"Reflection on {date}"))

        # Query reflections for specific date
        cursor = db.execute("""
            SELECT * FROM reflections WHERE reflection_date = ?
        """, ("2025-10-22",))

        results = cursor.fetchall()
        assert len(results) == 1
        assert results[0][2] == "2025-10-22"  # reflection_date column

    def test_get_reflections_by_step(self, db):
        """Test retrieving reflections for a specific micro-step"""
        # Create parent task
        task_id = str(uuid4())
        db.execute("INSERT INTO tasks (task_id, title) VALUES (?, ?)", (task_id, "Test"))

        # Create 2 micro-steps
        step_id_1 = str(uuid4())
        db.execute("""
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """, (step_id_1, task_id, "Step 1", 5))

        step_id_2 = str(uuid4())
        db.execute("""
            INSERT INTO micro_steps (step_id, parent_task_id, description, estimated_minutes)
            VALUES (?, ?, ?, ?)
        """, (step_id_2, task_id, "Step 2", 5))

        # Insert reflections for step_id_1 only
        for i in range(2):
            reflection_id = str(uuid4())
            db.execute("""
                INSERT INTO reflections (
                    reflection_id, user_id, reflection_date,
                    step_id, what_happened
                )
                VALUES (?, ?, ?, ?, ?)
            """, (reflection_id, "alice", f"2025-10-{22+i}", step_id_1, f"Reflection {i+1}"))

        # Query reflections for step_id_1
        cursor = db.execute("""
            SELECT * FROM reflections WHERE step_id = ?
        """, (step_id_1,))

        results = cursor.fetchall()
        assert len(results) == 2
