"""
Enhanced Database Adapter - Comprehensive schema for the Proxy Agent Platform
"""

from __future__ import annotations

import asyncio
import json
import sqlite3
from datetime import datetime
from pathlib import Path

from src.core.models import Message


class EnhancedDatabaseAdapter:
    """
    Enhanced database adapter with comprehensive schema
    Supports all models: Tasks, Projects, Users, Focus Sessions, Achievements, etc.
    """

    def __init__(self, db_path: str = "proxy_agents_enhanced.db", check_same_thread: bool = False):
        self.db_path = db_path
        self.check_same_thread = check_same_thread
        self._connection = None
        self._connection_pool = []
        self._max_pool_size = 5
        self._init_db()

    def get_connection(self):
        """
        Get a database connection with foreign keys and WAL mode enabled.
        Uses connection pooling for better performance.
        """
        if self._connection is None:
            self._connection = self._create_connection()
        return self._connection

    def _create_connection(self):
        """Create a new database connection with optimal settings"""
        conn = sqlite3.connect(
            self.db_path,
            check_same_thread=self.check_same_thread,
            timeout=30.0,  # 30 second timeout for locks
        )
        # Enable WAL mode for better concurrent access
        conn.execute("PRAGMA journal_mode=WAL")
        # Enable foreign key constraints
        conn.execute("PRAGMA foreign_keys = ON")
        # Optimize for performance
        conn.execute("PRAGMA synchronous = NORMAL")
        conn.execute("PRAGMA cache_size = 10000")
        conn.execute("PRAGMA temp_store = MEMORY")
        # Set row factory
        conn.row_factory = sqlite3.Row
        return conn

    def close_connection(self):
        """Close the database connection"""
        if self._connection:
            self._connection.close()
            self._connection = None

    def _init_db(self):
        """Initialize SQLite database with comprehensive schema"""
        conn = self._create_connection()
        cursor = conn.cursor()

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                full_name TEXT,
                timezone TEXT DEFAULT 'UTC',
                avatar_url TEXT,
                bio TEXT,
                preferences TEXT DEFAULT '{}',
                is_active BOOLEAN DEFAULT 1,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Projects table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                project_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                owner_id TEXT,
                team_members TEXT DEFAULT '[]',
                is_active BOOLEAN DEFAULT 1,
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                settings TEXT DEFAULT '{}',
                metadata TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        """)

        # Tasks table (with Epic 7 task splitting fields)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                task_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                project_id TEXT NOT NULL,
                parent_id TEXT,
                status TEXT DEFAULT 'todo',
                priority TEXT DEFAULT 'medium',
                estimated_hours DECIMAL(10,2),
                actual_hours DECIMAL(10,2) DEFAULT 0.0,
                tags TEXT DEFAULT '[]',
                assignee_id TEXT,
                due_date TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT DEFAULT '{}',
                scope TEXT DEFAULT 'simple',
                delegation_mode TEXT DEFAULT 'do',
                is_micro_step BOOLEAN DEFAULT 0,
                micro_steps TEXT DEFAULT '[]',
                FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
                FOREIGN KEY (assignee_id) REFERENCES users(user_id) ON DELETE SET NULL
            )
        """)

        # Task templates table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS task_templates (
                template_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                title_template TEXT NOT NULL,
                description_template TEXT NOT NULL,
                default_priority TEXT DEFAULT 'medium',
                default_estimated_hours DECIMAL(10,2),
                default_tags TEXT DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Task dependencies table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS task_dependencies (
                dependency_id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                depends_on_task_id TEXT NOT NULL,
                dependency_type TEXT DEFAULT 'depends_on',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT,
                FOREIGN KEY (task_id) REFERENCES tasks(task_id),
                FOREIGN KEY (depends_on_task_id) REFERENCES tasks(task_id),
                FOREIGN KEY (created_by) REFERENCES users(user_id),
                UNIQUE(task_id, depends_on_task_id)
            )
        """)

        # Task comments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS task_comments (
                comment_id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                author_id TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                is_edited BOOLEAN DEFAULT 0,
                FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
                FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        """)

        # Micro-steps table (Epic 7: ADHD Task Splitting)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS micro_steps (
                step_id TEXT PRIMARY KEY,
                parent_task_id TEXT NOT NULL,
                step_number INTEGER NOT NULL,
                description TEXT NOT NULL,
                estimated_minutes INTEGER NOT NULL CHECK(estimated_minutes >= 1 AND estimated_minutes <= 10),
                delegation_mode TEXT DEFAULT 'do',
                status TEXT DEFAULT 'todo',
                actual_minutes INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
            )
        """)

        # Focus sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS focus_sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                task_id TEXT,
                project_id TEXT,
                planned_duration_minutes INTEGER NOT NULL,
                actual_duration_minutes INTEGER,
                session_type TEXT DEFAULT 'focus',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP,
                was_completed BOOLEAN DEFAULT 0,
                interruptions INTEGER DEFAULT 0,
                productivity_score DECIMAL(5,2),
                notes TEXT,
                metadata TEXT DEFAULT '{}',
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
                FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
            )
        """)

        # Achievements table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS achievements (
                achievement_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                criteria TEXT NOT NULL,
                xp_reward INTEGER DEFAULT 0,
                badge_icon TEXT,
                rarity TEXT DEFAULT 'common',
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # User achievements table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_achievements (
                user_achievement_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                achievement_id TEXT NOT NULL,
                progress DECIMAL(5,2) DEFAULT 0.0,
                is_completed BOOLEAN DEFAULT 0,
                earned_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                context TEXT DEFAULT '{}',
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
                UNIQUE(user_id, achievement_id)
            )
        """)

        # Productivity metrics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS productivity_metrics (
                metrics_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date TIMESTAMP NOT NULL,
                period_type TEXT DEFAULT 'daily',
                tasks_created INTEGER DEFAULT 0,
                tasks_completed INTEGER DEFAULT 0,
                tasks_overdue INTEGER DEFAULT 0,
                total_focus_time INTEGER DEFAULT 0,
                planned_focus_time INTEGER DEFAULT 0,
                break_time INTEGER DEFAULT 0,
                focus_sessions_completed INTEGER DEFAULT 0,
                focus_sessions_started INTEGER DEFAULT 0,
                average_productivity_score DECIMAL(5,2),
                xp_earned INTEGER DEFAULT 0,
                achievements_unlocked INTEGER DEFAULT 0,
                streak_days INTEGER DEFAULT 0,
                completion_rate DECIMAL(5,2),
                focus_efficiency DECIMAL(5,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                UNIQUE(user_id, date, period_type)
            )
        """)

        # Legacy messages table (for backward compatibility)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                message_type TEXT NOT NULL,
                content TEXT NOT NULL,
                agent_type TEXT NOT NULL,
                metadata TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create indexes for performance
        self._create_indexes(cursor)

        # Insert default achievements
        self._insert_default_achievements(cursor)

        # Insert default entities (user and project)
        self._insert_default_entities(cursor)

        conn.commit()
        conn.close()

    def _create_indexes(self, cursor):
        """Create performance indexes"""
        indexes = [
            # User indexes
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
            "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
            "CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)",
            # Project indexes
            "CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id)",
            "CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active)",
            # Task indexes
            "CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_id)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at)",
            # Task dependency indexes
            "CREATE INDEX IF NOT EXISTS idx_dependencies_task ON task_dependencies(task_id)",
            "CREATE INDEX IF NOT EXISTS idx_dependencies_depends ON task_dependencies(depends_on_task_id)",
            # Comment indexes
            "CREATE INDEX IF NOT EXISTS idx_comments_task ON task_comments(task_id)",
            "CREATE INDEX IF NOT EXISTS idx_comments_author ON task_comments(author_id)",
            # Focus session indexes
            "CREATE INDEX IF NOT EXISTS idx_focus_user ON focus_sessions(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_focus_task ON focus_sessions(task_id)",
            "CREATE INDEX IF NOT EXISTS idx_focus_started ON focus_sessions(started_at)",
            # Achievement indexes
            "CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category)",
            "CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(is_completed)",
            # Metrics indexes
            "CREATE INDEX IF NOT EXISTS idx_metrics_user ON productivity_metrics(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_metrics_date ON productivity_metrics(date)",
            "CREATE INDEX IF NOT EXISTS idx_metrics_period ON productivity_metrics(period_type)",
            # Legacy message indexes
            "CREATE INDEX IF NOT EXISTS idx_session_id ON messages(session_id)",
            "CREATE INDEX IF NOT EXISTS idx_created_at ON messages(created_at)",
        ]

        for index_sql in indexes:
            cursor.execute(index_sql)

    def _insert_default_achievements(self, cursor):
        """Insert default achievements for gamification"""
        default_achievements = [
            {
                "achievement_id": "first_task",
                "name": "First Steps",
                "description": "Complete your first task",
                "category": "tasks",
                "criteria": json.dumps({"tasks_completed": 1}),
                "xp_reward": 100,
                "badge_icon": "🎯",
                "rarity": "common",
            },
            {
                "achievement_id": "task_master",
                "name": "Task Master",
                "description": "Complete 10 tasks",
                "category": "tasks",
                "criteria": json.dumps({"tasks_completed": 10}),
                "xp_reward": 500,
                "badge_icon": "🏆",
                "rarity": "rare",
            },
            {
                "achievement_id": "focus_warrior",
                "name": "Focus Warrior",
                "description": "Complete 5 focus sessions",
                "category": "focus",
                "criteria": json.dumps({"focus_sessions_completed": 5}),
                "xp_reward": 300,
                "badge_icon": "🧘",
                "rarity": "common",
            },
            {
                "achievement_id": "productivity_streak",
                "name": "Productivity Streak",
                "description": "Maintain a 7-day productivity streak",
                "category": "streaks",
                "criteria": json.dumps({"streak_days": 7}),
                "xp_reward": 750,
                "badge_icon": "🔥",
                "rarity": "epic",
            },
            {
                "achievement_id": "early_bird",
                "name": "Early Bird",
                "description": "Complete a task before 9 AM",
                "category": "time",
                "criteria": json.dumps({"early_completion": True}),
                "xp_reward": 200,
                "badge_icon": "🌅",
                "rarity": "common",
            },
        ]

        for achievement in default_achievements:
            cursor.execute(
                """
                INSERT OR IGNORE INTO achievements
                (achievement_id, name, description, category, criteria, xp_reward, badge_icon, rarity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    achievement["achievement_id"],
                    achievement["name"],
                    achievement["description"],
                    achievement["category"],
                    achievement["criteria"],
                    achievement["xp_reward"],
                    achievement["badge_icon"],
                    achievement["rarity"],
                ),
            )

    def _insert_default_entities(self, cursor):
        """Insert default user and project entities"""
        from datetime import datetime

        # Create default user
        cursor.execute(
            """
            INSERT OR IGNORE INTO users
            (user_id, username, email, full_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                "default-user",
                "demo_user",
                "demo@proxyagent.com",
                "Demo User",
                datetime.now().isoformat(),
                datetime.now().isoformat(),
            ),
        )

        # Create default project
        cursor.execute(
            """
            INSERT OR IGNORE INTO projects
            (project_id, name, description, owner_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                "default-project",
                "Personal Tasks",
                "Default project for personal task management",
                "default-user",
                datetime.now().isoformat(),
                datetime.now().isoformat(),
            ),
        )

    def get_schema_version(self) -> str:
        """Get current schema version"""
        return "1.0.0"

    def migrate_from_legacy(self, legacy_db_path: str = "proxy_agents.db") -> bool:
        """Migrate data from legacy database to enhanced schema"""
        if not Path(legacy_db_path).exists():
            return False

        try:
            # Connect to both databases
            legacy_conn = sqlite3.connect(legacy_db_path)
            enhanced_conn = sqlite3.connect(self.db_path)

            legacy_cursor = legacy_conn.cursor()
            enhanced_cursor = enhanced_conn.cursor()

            # Migrate messages (legacy table exists as-is)
            legacy_cursor.execute("SELECT * FROM messages")
            messages = legacy_cursor.fetchall()

            for message in messages:
                enhanced_cursor.execute(
                    """
                    INSERT OR IGNORE INTO messages
                    (id, session_id, message_type, content, agent_type, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                    message,
                )

            enhanced_conn.commit()
            legacy_conn.close()
            enhanced_conn.close()

            return True
        except Exception as e:
            print(f"Migration failed: {e}")
            return False

    # Legacy compatibility methods
    async def store_message(self, message: Message) -> str:
        """Store a message in the database (legacy compatibility)"""
        return await asyncio.to_thread(self._store_message_sync, message)

    def _store_message_sync(self, message: Message) -> str:
        """Synchronous message storage"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO messages (id, session_id, message_type, content, agent_type, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            (
                message.id,
                message.session_id,
                message.message_type,
                message.content,
                message.agent_type,
                json.dumps(message.metadata),
                message.created_at,
            ),
        )

        conn.commit()
        conn.close()
        return message.id

    async def get_conversation_history(self, session_id: str, limit: int = 10) -> list[Message]:
        """Get conversation history for a session (legacy compatibility)"""
        return await asyncio.to_thread(self._get_history_sync, session_id, limit)

    def _get_history_sync(self, session_id: str, limit: int) -> list[Message]:
        """Synchronous history retrieval"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, session_id, message_type, content, agent_type, metadata, created_at
            FROM messages
            WHERE session_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """,
            (session_id, limit),
        )

        rows = cursor.fetchall()
        conn.close()

        messages = []
        for row in rows:
            messages.append(
                Message(
                    id=row[0],
                    session_id=row[1],
                    message_type=row[2],
                    content=row[3],
                    agent_type=row[4],
                    metadata=json.loads(row[5]) if row[5] else {},
                    created_at=datetime.fromisoformat(row[6])
                    if isinstance(row[6], str)
                    else row[6],
                )
            )

        return list(reversed(messages))  # Return in chronological order

    async def clear_session(self, session_id: str) -> bool:
        """Clear all messages for a session (legacy compatibility)"""
        return await asyncio.to_thread(self._clear_session_sync, session_id)

    def _clear_session_sync(self, session_id: str) -> bool:
        """Synchronous session clearing"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()

        cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
        affected = cursor.rowcount

        conn.commit()
        conn.close()
        return affected > 0


# Global enhanced database instance
_enhanced_db_instance: EnhancedDatabaseAdapter | None = None


def get_enhanced_database() -> EnhancedDatabaseAdapter:
    """Get enhanced database adapter instance"""
    global _enhanced_db_instance
    if _enhanced_db_instance is None:
        _enhanced_db_instance = EnhancedDatabaseAdapter()
    return _enhanced_db_instance


def close_enhanced_database():
    """Close enhanced database connection"""
    global _enhanced_db_instance
    if _enhanced_db_instance:
        _enhanced_db_instance = None
