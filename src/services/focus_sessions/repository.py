"""
Repository for Focus Sessions Service (BE-03).

Handles all database operations for focus sessions.
"""

from datetime import UTC, datetime
from typing import Optional
from uuid import uuid4

from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.services.focus_sessions.models import (
    FocusAnalytics,
    FocusSession,
    FocusSessionCreate,
    FocusSessionUpdate,
)


class FocusSessionRepository:
    """Repository for focus sessions database operations."""

    def __init__(self, db: EnhancedDatabaseAdapter):
        """
        Initialize repository with database adapter.

        Args:
            db: EnhancedDatabaseAdapter instance
        """
        self.db = db

    def create(self, session_data: FocusSessionCreate) -> FocusSession:
        """
        Create a new focus session.

        Args:
            session_data: Focus session creation data

        Returns:
            FocusSession: Created session with ID
        """
        session_id = str(uuid4())
        now = datetime.now(UTC)

        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO focus_sessions (
                session_id, user_id, step_id, started_at,
                duration_minutes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                session_data.user_id,
                session_data.step_id,
                now,
                session_data.duration_minutes,
                now,
            ),
        )
        conn.commit()

        return self.get_by_id(session_id)

    def get_by_id(self, session_id: str) -> Optional[FocusSession]:
        """
        Get a session by ID.

        Args:
            session_id: Session ID

        Returns:
            FocusSession or None if not found
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM focus_sessions WHERE session_id = ?", (session_id,))
        row = cursor.fetchone()

        if not row:
            return None

        return FocusSession(
            session_id=row[0],
            user_id=row[1],
            step_id=row[2],
            started_at=row[3],
            ended_at=row[4],
            duration_minutes=row[5],
            completed=bool(row[6]),
            interruptions=row[7],
            created_at=row[8],
        )

    def update(self, session_id: str, update_data: FocusSessionUpdate) -> Optional[FocusSession]:
        """
        Update/end a focus session.

        Args:
            session_id: Session ID to update
            update_data: Update data

        Returns:
            Updated FocusSession or None if not found
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Build dynamic update
        updates = []
        values = []

        if update_data.ended_at is not None:
            updates.append("ended_at = ?")
            values.append(update_data.ended_at)
        elif update_data.completed is not None:
            # Auto-set ended_at if completing
            updates.append("ended_at = ?")
            values.append(datetime.now(UTC))

        if update_data.completed is not None:
            updates.append("completed = ?")
            values.append(1 if update_data.completed else 0)

        if update_data.interruptions is not None:
            updates.append("interruptions = ?")
            values.append(update_data.interruptions)

        if not updates:
            return self.get_by_id(session_id)

        values.append(session_id)

        cursor.execute(
            f"UPDATE focus_sessions SET {', '.join(updates)} WHERE session_id = ?", values
        )
        conn.commit()

        return self.get_by_id(session_id)

    def get_by_user(self, user_id: str, limit: int = 10) -> list[FocusSession]:
        """
        Get user's recent focus sessions.

        Args:
            user_id: User ID
            limit: Maximum number of sessions to return

        Returns:
            List of FocusSession objects
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT * FROM focus_sessions
            WHERE user_id = ?
            ORDER BY started_at DESC
            LIMIT ?
            """,
            (user_id, limit),
        )

        return [
            FocusSession(
                session_id=row[0],
                user_id=row[1],
                step_id=row[2],
                started_at=row[3],
                ended_at=row[4],
                duration_minutes=row[5],
                completed=bool(row[6]),
                interruptions=row[7],
                created_at=row[8],
            )
            for row in cursor.fetchall()
        ]

    def get_analytics(self, user_id: str) -> FocusAnalytics:
        """
        Calculate focus analytics for user.

        Args:
            user_id: User ID

        Returns:
            FocusAnalytics with calculated metrics
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
                SUM(duration_minutes) as total_minutes,
                AVG(duration_minutes) as avg_minutes
            FROM focus_sessions
            WHERE user_id = ?
            """,
            (user_id,),
        )

        row = cursor.fetchone()
        total = row[0] or 0
        completed = row[1] or 0
        total_minutes = row[2] or 0
        avg_minutes = row[3] or 0.0

        completion_rate = (completed / total) if total > 0 else 0.0

        return FocusAnalytics(
            total_sessions=total,
            completed_sessions=completed,
            completion_rate=completion_rate,
            total_focus_minutes=total_minutes,
            average_duration_minutes=avg_minutes,
        )
