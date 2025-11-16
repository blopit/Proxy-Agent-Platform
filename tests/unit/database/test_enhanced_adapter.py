"""
Tests for the enhanced database adapter
"""

import os
import sqlite3
import tempfile

import pytest

from src.core.models import Message
from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database


class TestEnhancedDatabaseAdapter:
    """Test the enhanced database adapter"""

    @pytest.fixture
    def temp_db(self):
        """Create a temporary database for testing"""
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        temp_file.close()

        db = EnhancedDatabaseAdapter(temp_file.name)
        yield db, temp_file.name

        # Cleanup
        os.unlink(temp_file.name)

    def test_database_initialization(self, temp_db):
        """Test that database initializes with all required tables"""
        db, db_path = temp_db

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check that all expected tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = {row[0] for row in cursor.fetchall()}

        expected_tables = {
            "users",
            "projects",
            "tasks",
            "task_templates",
            "task_dependencies",
            "task_comments",
            "focus_sessions",
            "achievements",
            "user_achievements",
            "productivity_metrics",
            "messages",
        }

        assert expected_tables.issubset(tables), f"Missing tables: {expected_tables - tables}"

        conn.close()

    def test_foreign_key_constraints(self, temp_db):
        """Test that foreign key constraints are enabled in database operations"""
        db, db_path = temp_db

        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()

        cursor.execute("PRAGMA foreign_keys")
        result = cursor.fetchone()

        assert result[0] == 1, "Foreign key constraints should be enabled"

        # Test that foreign key constraint actually works
        # Try to insert a task with non-existent project_id
        with pytest.raises(sqlite3.IntegrityError):
            cursor.execute(
                """
                INSERT INTO tasks (task_id, title, description, project_id)
                VALUES ('test-task', 'Test Task', 'Test Description', 'non-existent-project')
            """
            )

        conn.close()

    def test_default_achievements_inserted(self, temp_db):
        """Test that default achievements are inserted"""
        db, db_path = temp_db

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM achievements")
        count = cursor.fetchone()[0]

        assert count >= 5, "Should have at least 5 default achievements"

        # Check specific achievements
        cursor.execute("SELECT achievement_id FROM achievements")
        achievement_ids = {row[0] for row in cursor.fetchall()}

        expected_achievements = {
            "first_task",
            "task_master",
            "focus_warrior",
            "productivity_streak",
            "early_bird",
        }

        assert expected_achievements.issubset(achievement_ids)

        conn.close()

    def test_indexes_created(self, temp_db):
        """Test that performance indexes are created"""
        db, db_path = temp_db

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
        indexes = {row[0] for row in cursor.fetchall()}

        # Check some key indexes exist
        expected_indexes = {
            "idx_users_email",
            "idx_tasks_project",
            "idx_focus_user",
            "idx_session_id",
            "idx_created_at",
        }

        assert expected_indexes.issubset(indexes), f"Missing indexes: {expected_indexes - indexes}"

        conn.close()

    def test_schema_version(self, temp_db):
        """Test schema version method"""
        db, _ = temp_db

        version = db.get_schema_version()
        assert version == "1.0.0"

    @pytest.mark.asyncio
    async def test_legacy_message_compatibility(self, temp_db):
        """Test that legacy message methods still work"""
        db, _ = temp_db

        # Create a test message
        message = Message(
            id="test-message-1",
            session_id="test-session",
            message_type="user_input",
            content="Test message content",
            agent_type="task",
            metadata={"test": "data"},
        )

        # Store message
        message_id = await db.store_message(message)
        assert message_id == "test-message-1"

        # Retrieve message history
        history = await db.get_conversation_history("test-session", 10)
        assert len(history) == 1
        assert history[0].id == "test-message-1"
        assert history[0].content == "Test message content"
        assert history[0].metadata == {"test": "data"}

        # Clear session
        cleared = await db.clear_session("test-session")
        assert cleared is True

        # Verify cleared
        history = await db.get_conversation_history("test-session", 10)
        assert len(history) == 0

    def test_migration_from_legacy_nonexistent(self, temp_db):
        """Test migration when legacy database doesn't exist"""
        db, _ = temp_db

        # Try to migrate from non-existent database
        result = db.migrate_from_legacy("nonexistent.db")
        assert result is False

    def test_migration_from_legacy_existing(self, temp_db):
        """Test migration from existing legacy database"""
        db, _ = temp_db

        # Create a temporary legacy database
        legacy_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        legacy_temp.close()

        try:
            # Set up legacy database with messages table
            legacy_conn = sqlite3.connect(legacy_temp.name)
            legacy_cursor = legacy_conn.cursor()

            legacy_cursor.execute(
                """
                CREATE TABLE messages (
                    id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    message_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    agent_type TEXT NOT NULL,
                    metadata TEXT DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
            )

            # Insert test data
            legacy_cursor.execute(
                """
                INSERT INTO messages (id, session_id, message_type, content, agent_type)
                VALUES ('legacy-1', 'legacy-session', 'user_input', 'Legacy message', 'task')
            """
            )

            legacy_conn.commit()
            legacy_conn.close()

            # Perform migration
            result = db.migrate_from_legacy(legacy_temp.name)
            assert result is True

            # Verify migration worked
            enhanced_conn = sqlite3.connect(db.db_path)
            enhanced_cursor = enhanced_conn.cursor()

            enhanced_cursor.execute("SELECT COUNT(*) FROM messages WHERE id = 'legacy-1'")
            count = enhanced_cursor.fetchone()[0]
            assert count == 1

            enhanced_conn.close()

        finally:
            # Cleanup
            os.unlink(legacy_temp.name)


class TestEnhancedDatabaseSingleton:
    """Test the enhanced database singleton functionality"""

    def test_singleton_pattern(self):
        """Test that get_enhanced_database returns the same instance"""
        db1 = get_enhanced_database()
        db2 = get_enhanced_database()

        assert db1 is db2, "Should return the same instance"

    def test_database_schema_structure(self):
        """Test that the database has the correct schema structure"""
        db = get_enhanced_database()

        conn = sqlite3.connect(db.db_path)
        cursor = conn.cursor()

        # Test users table structure
        cursor.execute("PRAGMA table_info(users)")
        user_columns = {row[1] for row in cursor.fetchall()}
        expected_user_columns = {
            "user_id",
            "username",
            "email",
            "full_name",
            "timezone",
            "avatar_url",
            "bio",
            "preferences",
            "is_active",
            "last_login",
            "created_at",
            "updated_at",
        }
        assert expected_user_columns.issubset(user_columns)

        # Test tasks table structure
        cursor.execute("PRAGMA table_info(tasks)")
        task_columns = {row[1] for row in cursor.fetchall()}
        expected_task_columns = {
            "task_id",
            "title",
            "description",
            "project_id",
            "parent_id",
            "status",
            "priority",
            "estimated_hours",
            "actual_hours",
            "tags",
            "assignee_id",  # Updated to match database schema
            "due_date",
            "started_at",
            "completed_at",
            "created_at",
            "updated_at",
            "metadata",
        }
        assert expected_task_columns.issubset(task_columns)

        # Test focus_sessions table structure
        cursor.execute("PRAGMA table_info(focus_sessions)")
        focus_columns = {row[1] for row in cursor.fetchall()}
        expected_focus_columns = {
            "session_id",
            "user_id",
            "task_id",
            "project_id",
            "planned_duration_minutes",
            "actual_duration_minutes",
            "session_type",
            "started_at",
            "ended_at",
            "was_completed",
            "interruptions",
            "productivity_score",
            "notes",
            "metadata",
        }
        assert expected_focus_columns.issubset(focus_columns)

        conn.close()

    def test_achievement_data_integrity(self):
        """Test that default achievements have proper data"""
        db = get_enhanced_database()

        conn = sqlite3.connect(db.db_path)
        cursor = conn.cursor()

        # Check that achievements have required fields
        cursor.execute(
            """
            SELECT achievement_id, name, description, category, criteria, xp_reward
            FROM achievements
            WHERE achievement_id = 'first_task'
        """
        )

        result = cursor.fetchone()
        assert result is not None

        achievement_id, name, description, category, criteria, xp_reward = result
        assert achievement_id == "first_task"
        assert name == "First Steps"
        assert category == "tasks"
        assert xp_reward == 100

        # Verify criteria is valid JSON
        import json

        criteria_data = json.loads(criteria)
        assert "tasks_completed" in criteria_data
        assert criteria_data["tasks_completed"] == 1

        conn.close()
