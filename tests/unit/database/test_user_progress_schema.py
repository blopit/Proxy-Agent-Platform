"""
TDD Tests for User Progress Database Schema

Tests written FIRST before migration implementation.
Following Test-Driven Development: Red → Green → Refactor

User Progress tracks gamification: XP, levels, badges, streaks
"""

from datetime import datetime
from pathlib import Path

import pytest


@pytest.fixture
def db(isolated_db):
    """Provide test database with migrations applied"""
    # Apply 009_add_user_progress.sql migration
    migration_path = Path(__file__).parent.parent / "migrations" / "009_add_user_progress.sql"
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


class TestUserProgressTableExists:
    """Test that user_progress table is created"""

    def test_user_progress_table_exists(self, db):
        """Test that user_progress table is created by migration"""
        # This will FAIL until we create the migration
        assert table_exists(db, "user_progress"), "user_progress table should exist"

    def test_user_progress_table_has_primary_key(self, db):
        """Test that user_id is the primary key"""
        cursor = db.execute("PRAGMA table_info(user_progress)")
        columns = cursor.fetchall()

        # Find user_id column and check if it's primary key
        user_id_col = [col for col in columns if col[1] == "user_id"]
        assert len(user_id_col) == 1, "user_id column should exist"
        assert user_id_col[0][5] == 1, "user_id should be primary key (pk=1)"


class TestUserProgressTableSchema:
    """Test user_progress table has required columns"""

    def test_has_required_columns(self, db):
        """Test all required columns exist"""
        columns = get_table_columns(db, "user_progress")

        required_columns = [
            "user_id",
            "total_xp",
            "current_level",
            "tasks_completed",
            "micro_steps_completed",
            "current_streak",
            "longest_streak",
            "last_activity_date",
            "badges_earned",
            "achievements",
            "created_at",
            "updated_at",
        ]

        for col in required_columns:
            assert col in columns, f"Column {col} should exist in user_progress table"

    def test_user_id_is_text_not_null(self, db):
        """Test user_id is TEXT NOT NULL"""
        columns = get_table_columns(db, "user_progress")
        assert columns["user_id"] == "TEXT"

        # Try to insert without user_id (should fail)
        with pytest.raises(Exception):  # Will raise IntegrityError
            db.execute(
                """
                INSERT INTO user_progress (total_xp, current_level)
                VALUES (?, ?)
            """,
                (100, 5),
            )

    def test_total_xp_is_integer_default_zero(self, db):
        """Test total_xp is INTEGER with DEFAULT 0"""
        columns = get_table_columns(db, "user_progress")
        assert columns["total_xp"] == "INTEGER"

        # Insert row without specifying total_xp
        user_id = "alice"
        db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))

        # Check default value
        cursor = db.execute("SELECT total_xp FROM user_progress WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()
        assert result[0] == 0, "total_xp should default to 0"

    def test_current_level_is_integer_default_one(self, db):
        """Test current_level is INTEGER with DEFAULT 1"""
        columns = get_table_columns(db, "user_progress")
        assert columns["current_level"] == "INTEGER"

        # Insert row without specifying current_level
        user_id = "bob"
        db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))

        # Check default value
        cursor = db.execute("SELECT current_level FROM user_progress WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()
        assert result[0] == 1, "current_level should default to 1"

    def test_tasks_completed_is_integer_default_zero(self, db):
        """Test tasks_completed is INTEGER with DEFAULT 0"""
        columns = get_table_columns(db, "user_progress")
        assert columns["tasks_completed"] == "INTEGER"

        user_id = "charlie"
        db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))

        cursor = db.execute(
            "SELECT tasks_completed FROM user_progress WHERE user_id = ?", (user_id,)
        )
        assert cursor.fetchone()[0] == 0

    def test_micro_steps_completed_is_integer_default_zero(self, db):
        """Test micro_steps_completed is INTEGER with DEFAULT 0"""
        columns = get_table_columns(db, "user_progress")
        assert columns["micro_steps_completed"] == "INTEGER"

        user_id = "dana"
        db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))

        cursor = db.execute(
            "SELECT micro_steps_completed FROM user_progress WHERE user_id = ?", (user_id,)
        )
        assert cursor.fetchone()[0] == 0

    def test_current_streak_is_integer_default_zero(self, db):
        """Test current_streak is INTEGER with DEFAULT 0"""
        columns = get_table_columns(db, "user_progress")
        assert columns["current_streak"] == "INTEGER"

        user_id = "eve"
        db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))

        cursor = db.execute(
            "SELECT current_streak FROM user_progress WHERE user_id = ?", (user_id,)
        )
        assert cursor.fetchone()[0] == 0

    def test_longest_streak_is_integer_default_zero(self, db):
        """Test longest_streak is INTEGER with DEFAULT 0"""
        columns = get_table_columns(db, "user_progress")
        assert columns["longest_streak"] == "INTEGER"

        user_id = "frank"
        db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))

        cursor = db.execute(
            "SELECT longest_streak FROM user_progress WHERE user_id = ?", (user_id,)
        )
        assert cursor.fetchone()[0] == 0


class TestUserProgressDataTypes:
    """Test data type constraints and validations"""

    def test_badges_earned_stores_json_array(self, db):
        """Test badges_earned can store JSON array"""
        user_id = "alice"
        import json

        badges = json.dumps(["first_task", "streak_7", "level_10"])

        db.execute(
            """
            INSERT INTO user_progress (user_id, badges_earned)
            VALUES (?, ?)
        """,
            (user_id, badges),
        )

        # Retrieve and verify
        cursor = db.execute("SELECT badges_earned FROM user_progress WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()[0]
        parsed = json.loads(result)

        assert len(parsed) == 3
        assert "first_task" in parsed
        assert "streak_7" in parsed

    def test_achievements_stores_json_object(self, db):
        """Test achievements can store JSON object"""
        user_id = "bob"
        import json

        achievements = json.dumps(
            {
                "task_master": {"unlocked": True, "unlocked_at": "2025-10-22T10:30:00"},
                "reflection_champion": {"unlocked": False, "progress": 5, "target": 30},
            }
        )

        db.execute(
            """
            INSERT INTO user_progress (user_id, achievements)
            VALUES (?, ?)
        """,
            (user_id, achievements),
        )

        # Retrieve and verify
        cursor = db.execute("SELECT achievements FROM user_progress WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()[0]
        parsed = json.loads(result)

        assert "task_master" in parsed
        assert parsed["task_master"]["unlocked"] is True
        assert parsed["reflection_champion"]["progress"] == 5


class TestUserProgressTimestamps:
    """Test timestamp handling"""

    def test_created_at_defaults_to_current_timestamp(self, db):
        """Test created_at automatically sets to current time"""
        user_id = "timestamp_test_1"

        db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))

        # Check created_at is set (not NULL)
        cursor = db.execute("SELECT created_at FROM user_progress WHERE user_id = ?", (user_id,))
        created_at_str = cursor.fetchone()[0]

        assert created_at_str is not None, "created_at should be automatically set"
        # Verify it's a valid timestamp format
        created_at = datetime.fromisoformat(created_at_str)
        assert isinstance(created_at, datetime)

    def test_updated_at_defaults_to_current_timestamp(self, db):
        """Test updated_at automatically sets to current time"""
        user_id = "timestamp_test_2"

        db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))

        # Check updated_at is set (not NULL)
        cursor = db.execute("SELECT updated_at FROM user_progress WHERE user_id = ?", (user_id,))
        updated_at_str = cursor.fetchone()[0]

        assert updated_at_str is not None, "updated_at should be automatically set"
        updated_at = datetime.fromisoformat(updated_at_str)
        assert isinstance(updated_at, datetime)

    def test_last_activity_date_is_text(self, db):
        """Test last_activity_date is TEXT (ISO format)"""
        columns = get_table_columns(db, "user_progress")
        assert columns["last_activity_date"] == "TEXT"

        # Insert with specific activity date
        user_id = "activity_test"
        db.execute(
            """
            INSERT INTO user_progress (user_id, last_activity_date)
            VALUES (?, ?)
        """,
            (user_id, "2025-10-22"),
        )

        cursor = db.execute(
            "SELECT last_activity_date FROM user_progress WHERE user_id = ?", (user_id,)
        )
        assert cursor.fetchone()[0] == "2025-10-22"


class TestUserProgressConstraints:
    """Test constraints and unique constraints"""

    def test_user_id_is_unique(self, db):
        """Test that user_id is unique (primary key)"""
        user_id = "unique_test"

        # Insert first time - should succeed
        db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))

        # Try to insert same user_id again - should fail
        with pytest.raises(Exception):  # IntegrityError
            db.execute("INSERT INTO user_progress (user_id) VALUES (?)", (user_id,))


class TestUserProgressQueries:
    """Test common query patterns"""

    def test_get_user_progress_by_user_id(self, db):
        """Test retrieving progress for a specific user"""
        user_id = "alice"
        db.execute(
            """
            INSERT INTO user_progress (
                user_id, total_xp, current_level, tasks_completed
            )
            VALUES (?, ?, ?, ?)
        """,
            (user_id, 1500, 8, 42),
        )

        cursor = db.execute("SELECT * FROM user_progress WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()

        assert result is not None
        assert result[0] == "alice"  # user_id
        assert result[1] == 1500  # total_xp
        assert result[2] == 8  # current_level
        assert result[3] == 42  # tasks_completed

    def test_update_xp_and_level(self, db):
        """Test updating XP and checking for level up"""
        user_id = "level_test"
        db.execute(
            """
            INSERT INTO user_progress (user_id, total_xp, current_level)
            VALUES (?, ?, ?)
        """,
            (user_id, 100, 1),
        )

        # Update XP (simulate level up)
        new_xp = 1000
        new_level = 5
        db.execute(
            """
            UPDATE user_progress
            SET total_xp = ?, current_level = ?
            WHERE user_id = ?
        """,
            (new_xp, new_level, user_id),
        )

        # Verify update
        cursor = db.execute(
            """
            SELECT total_xp, current_level FROM user_progress WHERE user_id = ?
        """,
            (user_id,),
        )
        result = cursor.fetchone()

        assert result[0] == 1000
        assert result[1] == 5

    def test_increment_streak(self, db):
        """Test incrementing streak counters"""
        user_id = "streak_test"
        db.execute(
            """
            INSERT INTO user_progress (user_id, current_streak, longest_streak)
            VALUES (?, ?, ?)
        """,
            (user_id, 5, 7),
        )

        # Increment current streak
        db.execute(
            """
            UPDATE user_progress
            SET current_streak = current_streak + 1
            WHERE user_id = ?
        """,
            (user_id,),
        )

        cursor = db.execute(
            "SELECT current_streak FROM user_progress WHERE user_id = ?", (user_id,)
        )
        assert cursor.fetchone()[0] == 6

    def test_update_longest_streak_if_needed(self, db):
        """Test updating longest_streak when current_streak exceeds it"""
        user_id = "longest_streak_test"
        db.execute(
            """
            INSERT INTO user_progress (user_id, current_streak, longest_streak)
            VALUES (?, ?, ?)
        """,
            (user_id, 10, 8),
        )

        # Update longest streak if current > longest
        db.execute(
            """
            UPDATE user_progress
            SET longest_streak = current_streak
            WHERE user_id = ? AND current_streak > longest_streak
        """,
            (user_id,),
        )

        cursor = db.execute(
            "SELECT longest_streak FROM user_progress WHERE user_id = ?", (user_id,)
        )
        assert cursor.fetchone()[0] == 10

    def test_add_badge_to_badges_earned(self, db):
        """Test adding a new badge to badges_earned JSON array"""
        user_id = "badge_test"
        import json

        # Start with one badge
        initial_badges = json.dumps(["first_task"])
        db.execute(
            """
            INSERT INTO user_progress (user_id, badges_earned)
            VALUES (?, ?)
        """,
            (user_id, initial_badges),
        )

        # Retrieve, add badge, update
        cursor = db.execute("SELECT badges_earned FROM user_progress WHERE user_id = ?", (user_id,))
        current_badges_json = cursor.fetchone()[0]
        current_badges = json.loads(current_badges_json)
        current_badges.append("streak_7")
        updated_badges = json.dumps(current_badges)

        db.execute(
            """
            UPDATE user_progress
            SET badges_earned = ?
            WHERE user_id = ?
        """,
            (updated_badges, user_id),
        )

        # Verify
        cursor = db.execute("SELECT badges_earned FROM user_progress WHERE user_id = ?", (user_id,))
        final_badges = json.loads(cursor.fetchone()[0])
        assert len(final_badges) == 2
        assert "streak_7" in final_badges

    def test_get_leaderboard_by_xp(self, db):
        """Test querying users ordered by XP (leaderboard)"""
        # Insert multiple users
        users = [
            ("alice", 1500, 8),
            ("bob", 3000, 15),
            ("charlie", 500, 3),
            ("dana", 2000, 10),
        ]

        for user_id, xp, level in users:
            db.execute(
                """
                INSERT INTO user_progress (user_id, total_xp, current_level)
                VALUES (?, ?, ?)
            """,
                (user_id, xp, level),
            )

        # Query top 3 by XP
        cursor = db.execute("""
            SELECT user_id, total_xp FROM user_progress
            ORDER BY total_xp DESC
            LIMIT 3
        """)

        results = cursor.fetchall()
        assert len(results) == 3
        assert results[0][0] == "bob"  # 3000 XP
        assert results[1][0] == "dana"  # 2000 XP
        assert results[2][0] == "alice"  # 1500 XP
