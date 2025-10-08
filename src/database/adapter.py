"""
Database Adapter - Easy to swap SQLite for PostgreSQL later
"""

import asyncio
import json
import sqlite3
from datetime import datetime

from src.core.models import Message


class DatabaseAdapter:
    """
    Database adapter that starts with SQLite
    Can be easily swapped for PostgreSQL later
    """

    def __init__(self, db_path: str = "proxy_agents.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize SQLite database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create messages table
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
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_session_id ON messages(session_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_created_at ON messages(created_at)")

        conn.commit()
        conn.close()

    async def store_message(self, message: Message) -> str:
        """Store a message in the database"""
        # Run in thread to avoid blocking
        return await asyncio.to_thread(self._store_message_sync, message)

    def _store_message_sync(self, message: Message) -> str:
        """Synchronous message storage"""
        conn = sqlite3.connect(self.db_path)
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
        """Get conversation history for a session"""
        return await asyncio.to_thread(self._get_history_sync, session_id, limit)

    def _get_history_sync(self, session_id: str, limit: int) -> list[Message]:
        """Synchronous history retrieval"""
        conn = sqlite3.connect(self.db_path)
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
        """Clear all messages for a session"""
        return await asyncio.to_thread(self._clear_session_sync, session_id)

    def _clear_session_sync(self, session_id: str) -> bool:
        """Synchronous session clearing"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
        affected = cursor.rowcount

        conn.commit()
        conn.close()
        return affected > 0


# Global database instance
_db_instance: DatabaseAdapter | None = None


def get_database() -> DatabaseAdapter:
    """Get database adapter instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = DatabaseAdapter()
    return _db_instance


def close_database():
    """Close database connection"""
    global _db_instance
    if _db_instance:
        # SQLite doesn't need explicit closing, but we reset the instance
        _db_instance = None
