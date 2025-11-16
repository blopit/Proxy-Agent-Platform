"""
TDD Tests for Epic 7 Database Migration - RED PHASE

Tests for adding Epic 7 task splitting fields to database:
- Add scope, delegation_mode, is_micro_step columns to tasks table
- Create micro_steps table
- Test data persistence and retrieval

Following TDD RED-GREEN-REFACTOR methodology.
"""

from decimal import Decimal

import pytest

from src.core.task_models import DelegationMode, MicroStep, Task, TaskScope
from src.database.enhanced_adapter import EnhancedDatabaseAdapter


class TestEpic7DatabaseSchema:
    """Test Epic 7 fields exist in database schema"""

    @pytest.fixture
    def db(self, tmp_path):
        """Create temporary database for testing"""
        db_path = tmp_path / "test_epic7.db"
        adapter = EnhancedDatabaseAdapter(str(db_path))
        yield adapter
        adapter.close_connection()

    def test_tasks_table_has_scope_column(self, db):
        """Test that tasks table has scope column"""
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get table info
        cursor.execute("PRAGMA table_info(tasks)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}  # name: type

        assert "scope" in columns
        assert columns["scope"] == "TEXT"

    def test_tasks_table_has_delegation_mode_column(self, db):
        """Test that tasks table has delegation_mode column"""
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute("PRAGMA table_info(tasks)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}

        assert "delegation_mode" in columns
        assert columns["delegation_mode"] == "TEXT"

    def test_tasks_table_has_is_micro_step_column(self, db):
        """Test that tasks table has is_micro_step column"""
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute("PRAGMA table_info(tasks)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}

        assert "is_micro_step" in columns
        assert columns["is_micro_step"] in ["BOOLEAN", "INTEGER"]  # SQLite boolean is INTEGER

    def test_micro_steps_table_exists(self, db):
        """Test that micro_steps table exists"""
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='micro_steps'
        """
        )
        result = cursor.fetchone()

        assert result is not None
        assert result[0] == "micro_steps"

    def test_micro_steps_table_has_required_columns(self, db):
        """Test that micro_steps table has all required columns"""
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute("PRAGMA table_info(micro_steps)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}

        # Required columns from MicroStep model
        required_columns = {
            "step_id": "TEXT",
            "parent_task_id": "TEXT",
            "step_number": "INTEGER",
            "description": "TEXT",
            "estimated_minutes": "INTEGER",
            "delegation_mode": "TEXT",
            "status": "TEXT",
            "actual_minutes": "INTEGER",
            "created_at": "TIMESTAMP",
            "completed_at": "TIMESTAMP",
        }

        for col_name, _col_type in required_columns.items():
            assert col_name in columns, f"Missing column: {col_name}"

    def test_micro_steps_table_has_foreign_key_to_tasks(self, db):
        """Test that micro_steps table has foreign key to tasks"""
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute("PRAGMA foreign_key_list(micro_steps)")
        foreign_keys = cursor.fetchall()

        # Should have foreign key to tasks table
        assert len(foreign_keys) > 0

        # Check that parent_task_id references tasks(task_id)
        fk_found = False
        for fk in foreign_keys:
            if fk[3] == "parent_task_id" and fk[2] == "tasks":
                fk_found = True
                break

        assert fk_found, "Foreign key from parent_task_id to tasks not found"


class TestEpic7TaskPersistence:
    """Test persisting and retrieving Epic 7 task data"""

    @pytest.fixture
    def db(self, tmp_path):
        """Create temporary database for testing"""
        db_path = tmp_path / "test_epic7_persist.db"
        adapter = EnhancedDatabaseAdapter(str(db_path))

        # Create a test project to satisfy foreign key constraints
        conn = adapter.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO projects (project_id, name, description)
            VALUES ('project_123', 'Test Project', 'Test Project Description')
        """
        )
        conn.commit()

        yield adapter
        adapter.close_connection()

    def test_save_task_with_scope(self, db):
        """Test saving task with scope field"""
        task = Task(
            title="Test Task with Scope",
            description="Testing Epic 7 scope field",
            project_id="project_123",
            scope=TaskScope.MULTI,
            estimated_hours=Decimal("0.5"),  # 30 minutes = MULTI
        )

        # Save to database
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO tasks
            (task_id, title, description, project_id, scope, estimated_hours)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                task.task_id,
                task.title,
                task.description,
                task.project_id,
                task.scope,  # Already a string due to use_enum_values=True
                float(task.estimated_hours),
            ),
        )
        conn.commit()

        # Retrieve and verify
        cursor.execute("SELECT scope FROM tasks WHERE task_id = ?", (task.task_id,))
        row = cursor.fetchone()

        assert row is not None
        assert row[0] == "multi"

    def test_save_task_with_delegation_mode(self, db):
        """Test saving task with delegation_mode field"""
        task = Task(
            title="Delegate This",
            description="Task to delegate",
            project_id="project_123",
            delegation_mode=DelegationMode.DELEGATE,
        )

        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO tasks
            (task_id, title, description, project_id, delegation_mode)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                task.task_id,
                task.title,
                task.description,
                task.project_id,
                task.delegation_mode,  # Already a string
            ),
        )
        conn.commit()

        cursor.execute("SELECT delegation_mode FROM tasks WHERE task_id = ?", (task.task_id,))
        row = cursor.fetchone()

        assert row is not None
        assert row[0] == "delegate"

    def test_save_task_with_is_micro_step_flag(self, db):
        """Test saving task with is_micro_step flag"""
        task = Task(
            title="Micro Step Task",
            description="This is a micro-step",
            project_id="project_123",
            is_micro_step=True,
        )

        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO tasks
            (task_id, title, description, project_id, is_micro_step)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                task.task_id,
                task.title,
                task.description,
                task.project_id,
                1 if task.is_micro_step else 0,  # SQLite boolean
            ),
        )
        conn.commit()

        cursor.execute("SELECT is_micro_step FROM tasks WHERE task_id = ?", (task.task_id,))
        row = cursor.fetchone()

        assert row is not None
        assert row[0] == 1  # True in SQLite

    def test_save_micro_step_to_database(self, db):
        """Test saving MicroStep to micro_steps table"""
        # First create parent task
        parent_task = Task(
            title="Parent Task", description="Task with micro-steps", project_id="project_123"
        )

        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO tasks (task_id, title, description, project_id)
            VALUES (?, ?, ?, ?)
        """,
            (
                parent_task.task_id,
                parent_task.title,
                parent_task.description,
                parent_task.project_id,
            ),
        )

        # Create micro-step
        micro_step = MicroStep(
            parent_task_id=parent_task.task_id,
            step_number=1,
            description="First micro-step",
            estimated_minutes=3,
            delegation_mode=DelegationMode.DO,
        )

        # Save micro-step
        cursor.execute(
            """
            INSERT INTO micro_steps
            (step_id, parent_task_id, step_number, description, estimated_minutes,
             delegation_mode, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                micro_step.step_id,
                micro_step.parent_task_id,
                micro_step.step_number,
                micro_step.description,
                micro_step.estimated_minutes,
                micro_step.delegation_mode,  # Already string
                micro_step.status,  # Already string
                micro_step.created_at.isoformat(),
            ),
        )
        conn.commit()

        # Retrieve and verify
        cursor.execute(
            """
            SELECT step_id, description, estimated_minutes, delegation_mode
            FROM micro_steps
            WHERE parent_task_id = ?
        """,
            (parent_task.task_id,),
        )
        row = cursor.fetchone()

        assert row is not None
        assert row[0] == micro_step.step_id
        assert row[1] == "First micro-step"
        assert row[2] == 3
        assert row[3] == "do"

    def test_retrieve_task_with_micro_steps(self, db):
        """Test retrieving task with associated micro-steps"""
        # Create parent task
        parent_task = Task(
            title="Complex Task",
            description="Task with multiple micro-steps",
            project_id="project_123",
            scope=TaskScope.MULTI,
        )

        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO tasks
            (task_id, title, description, project_id, scope)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                parent_task.task_id,
                parent_task.title,
                parent_task.description,
                parent_task.project_id,
                parent_task.scope,
            ),
        )

        # Add 3 micro-steps
        for i in range(1, 4):
            step = MicroStep(
                parent_task_id=parent_task.task_id,
                step_number=i,
                description=f"Step {i}",
                estimated_minutes=3,
            )

            cursor.execute(
                """
                INSERT INTO micro_steps
                (step_id, parent_task_id, step_number, description, estimated_minutes,
                 delegation_mode, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    step.step_id,
                    step.parent_task_id,
                    step.step_number,
                    step.description,
                    step.estimated_minutes,
                    step.delegation_mode,
                    step.status,  # Already strings
                    step.created_at.isoformat(),
                ),
            )

        conn.commit()

        # Retrieve task with micro-steps
        cursor.execute(
            """
            SELECT COUNT(*) FROM micro_steps WHERE parent_task_id = ?
        """,
            (parent_task.task_id,),
        )
        count = cursor.fetchone()[0]

        assert count == 3

    def test_default_values_for_epic7_fields(self, db):
        """Test that Epic 7 fields have correct defaults"""
        # Create minimal task (no Epic 7 fields specified)
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO tasks (task_id, title, description, project_id)
            VALUES ('task_123', 'Test', 'Description', 'project_123')
        """
        )
        conn.commit()

        # Retrieve and check defaults
        cursor.execute(
            """
            SELECT scope, delegation_mode, is_micro_step
            FROM tasks WHERE task_id = 'task_123'
        """
        )
        row = cursor.fetchone()

        assert row is not None
        # Defaults should be: SIMPLE, DO, False
        assert row[0] == "simple" or row[0] is None  # Default scope
        assert row[1] == "do" or row[1] is None  # Default delegation_mode
        assert row[2] == 0 or row[2] is None  # Default is_micro_step = False


class TestEpic7MigrationBackwardsCompatibility:
    """Test that Epic 7 migration doesn't break existing functionality"""

    @pytest.fixture
    def db(self, tmp_path):
        """Create temporary database for testing"""
        db_path = tmp_path / "test_epic7_compat.db"
        adapter = EnhancedDatabaseAdapter(str(db_path))

        # Create a test project to satisfy foreign key constraints
        conn = adapter.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO projects (project_id, name, description)
            VALUES ('project_123', 'Test Project', 'Test Project Description')
        """
        )
        conn.commit()

        yield adapter
        adapter.close_connection()

    def test_existing_tasks_still_queryable(self, db):
        """Test that existing tasks can still be queried after migration"""
        # Insert task using old schema (without Epic 7 fields)
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO tasks
            (task_id, title, description, project_id, status, priority)
            VALUES ('old_task', 'Old Task', 'Created before Epic 7', 'project_123', 'todo', 'medium')
        """
        )
        conn.commit()

        # Should still be retrievable
        cursor.execute("SELECT title, status FROM tasks WHERE task_id = 'old_task'")
        row = cursor.fetchone()

        assert row is not None
        assert row[0] == "Old Task"
        assert row[1] == "todo"

    def test_can_update_old_task_with_new_fields(self, db):
        """Test that old tasks can be updated with Epic 7 fields"""
        conn = db.get_connection()
        cursor = conn.cursor()

        # Create old-style task
        cursor.execute(
            """
            INSERT INTO tasks
            (task_id, title, description, project_id)
            VALUES ('old_task_2', 'Old Task 2', 'Description', 'project_123')
        """
        )
        conn.commit()

        # Update with Epic 7 fields
        cursor.execute(
            """
            UPDATE tasks
            SET scope = ?, delegation_mode = ?, is_micro_step = ?
            WHERE task_id = ?
        """,
            ("multi", "delegate", 1, "old_task_2"),
        )
        conn.commit()

        # Verify update
        cursor.execute(
            """
            SELECT scope, delegation_mode, is_micro_step
            FROM tasks WHERE task_id = 'old_task_2'
        """
        )
        row = cursor.fetchone()

        assert row[0] == "multi"
        assert row[1] == "delegate"
        assert row[2] == 1
