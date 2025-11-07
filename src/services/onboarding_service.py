"""
User Onboarding Service

Handles user onboarding data persistence and retrieval
Supports mobile app onboarding flow with ADHD-optimized features
"""

import json
import sqlite3
from datetime import UTC, datetime
from typing import Any

from src.api.routes.schemas.onboarding_schemas import (
    ADHDChallenge,
    DailySchedule,
    OnboardingResponse,
    OnboardingUpdateRequest,
    ProductivityGoal,
    TimePreference,
    WorkPreference,
)


class OnboardingService:
    """Service for managing user onboarding data"""

    def __init__(self, db_path: str = "./proxy_agents_enhanced.db"):
        """
        Initialize onboarding service

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self._ensure_table_exists()

    def _ensure_table_exists(self) -> None:
        """Ensure user_onboarding table exists"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            # Check if table exists
            cursor.execute(
                """
                SELECT name FROM sqlite_master
                WHERE type='table' AND name='user_onboarding'
                """
            )
            if not cursor.fetchone():
                # Run migration
                with open("src/database/migrations/024_create_user_onboarding.sql") as f:
                    migration_sql = f.read()
                    cursor.executescript(migration_sql)
            conn.commit()

    def _get_connection(self) -> sqlite3.Connection:
        """Get database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    async def get_onboarding(self, user_id: str) -> OnboardingResponse | None:
        """
        Get onboarding data for a user

        Args:
            user_id: User ID to fetch onboarding for

        Returns:
            OnboardingResponse if exists, None otherwise
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM user_onboarding WHERE user_id = ?
                """,
                (user_id,),
            )
            row = cursor.fetchone()

            if not row:
                return None

            # Parse JSON fields
            adhd_challenges = (
                [ADHDChallenge(c) for c in json.loads(row["adhd_challenges"])]
                if row["adhd_challenges"]
                else []
            )
            productivity_goals = (
                [ProductivityGoal(g) for g in json.loads(row["productivity_goals"])]
                if row["productivity_goals"]
                else []
            )

            daily_schedule = None
            if row["daily_schedule"]:
                schedule_data = json.loads(row["daily_schedule"])
                daily_schedule = DailySchedule(
                    time_preference=TimePreference(schedule_data["time_preference"]),
                    flexible_enabled=schedule_data.get("flexible_enabled", False),
                    week_grid=schedule_data.get("week_grid", {}),
                )

            return OnboardingResponse(
                user_id=row["user_id"],
                work_preference=WorkPreference(row["work_preference"])
                if row["work_preference"]
                else None,
                adhd_support_level=row["adhd_support_level"],
                adhd_challenges=adhd_challenges,
                daily_schedule=daily_schedule,
                productivity_goals=productivity_goals,
                chatgpt_export_prompt=row["chatgpt_export_prompt"],
                chatgpt_exported_at=(
                    datetime.fromisoformat(row["chatgpt_exported_at"])
                    if row["chatgpt_exported_at"]
                    else None
                ),
                onboarding_completed=bool(row["onboarding_completed"]),
                onboarding_skipped=bool(row["onboarding_skipped"]),
                completed_at=(
                    datetime.fromisoformat(row["completed_at"]) if row["completed_at"] else None
                ),
                skipped_at=datetime.fromisoformat(row["skipped_at"]) if row["skipped_at"] else None,
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"]),
            )

    async def upsert_onboarding(
        self, user_id: str, data: OnboardingUpdateRequest
    ) -> OnboardingResponse:
        """
        Create or update onboarding data for a user

        Args:
            user_id: User ID to update onboarding for
            data: Onboarding data to update

        Returns:
            Updated OnboardingResponse
        """
        now = datetime.now(UTC).isoformat()

        # Prepare JSON fields
        # Note: Pydantic use_enum_values=True converts enums to strings automatically
        adhd_challenges_json = (
            json.dumps([c if isinstance(c, str) else c.value for c in data.adhd_challenges])
            if data.adhd_challenges is not None
            else None
        )
        productivity_goals_json = (
            json.dumps([g if isinstance(g, str) else g.value for g in data.productivity_goals])
            if data.productivity_goals is not None
            else None
        )
        daily_schedule_json = None
        if data.daily_schedule:
            time_pref = data.daily_schedule.time_preference
            daily_schedule_json = json.dumps(
                {
                    "time_preference": time_pref if isinstance(time_pref, str) else time_pref.value,
                    "flexible_enabled": data.daily_schedule.flexible_enabled,
                    "week_grid": data.daily_schedule.week_grid,
                }
            )

        with self._get_connection() as conn:
            cursor = conn.cursor()

            # Check if record exists
            cursor.execute("SELECT user_id FROM user_onboarding WHERE user_id = ?", (user_id,))
            exists = cursor.fetchone() is not None

            if exists:
                # Update existing record
                update_fields: list[str] = []
                update_values: list[Any] = []

                if data.work_preference is not None:
                    update_fields.append("work_preference = ?")
                    work_pref = data.work_preference
                    update_values.append(
                        work_pref if isinstance(work_pref, str) else work_pref.value
                    )

                if data.adhd_support_level is not None:
                    update_fields.append("adhd_support_level = ?")
                    update_values.append(data.adhd_support_level)

                if adhd_challenges_json is not None:
                    update_fields.append("adhd_challenges = ?")
                    update_values.append(adhd_challenges_json)

                if daily_schedule_json is not None:
                    update_fields.append("daily_schedule = ?")
                    update_values.append(daily_schedule_json)
                    if data.daily_schedule:
                        update_fields.append("time_preference = ?")
                        tp = data.daily_schedule.time_preference
                        update_values.append(tp if isinstance(tp, str) else tp.value)

                if productivity_goals_json is not None:
                    update_fields.append("productivity_goals = ?")
                    update_values.append(productivity_goals_json)

                if data.chatgpt_export_prompt is not None:
                    update_fields.append("chatgpt_export_prompt = ?")
                    update_values.append(data.chatgpt_export_prompt)
                    update_fields.append("chatgpt_exported_at = ?")
                    update_values.append(now)

                if data.onboarding_completed is not None:
                    update_fields.append("onboarding_completed = ?")
                    update_values.append(data.onboarding_completed)
                    if data.onboarding_completed:
                        update_fields.append("completed_at = ?")
                        update_values.append(now)

                if data.onboarding_skipped is not None:
                    update_fields.append("onboarding_skipped = ?")
                    update_values.append(data.onboarding_skipped)
                    if data.onboarding_skipped:
                        update_fields.append("skipped_at = ?")
                        update_values.append(now)

                update_fields.append("updated_at = ?")
                update_values.append(now)
                update_values.append(user_id)

                sql = f"UPDATE user_onboarding SET {', '.join(update_fields)} WHERE user_id = ?"
                cursor.execute(sql, update_values)
            else:
                # Insert new record
                # Handle enum-to-string conversion
                work_pref_val = None
                if data.work_preference:
                    work_pref_val = (
                        data.work_preference
                        if isinstance(data.work_preference, str)
                        else data.work_preference.value
                    )

                time_pref_val = None
                if data.daily_schedule:
                    tp = data.daily_schedule.time_preference
                    time_pref_val = tp if isinstance(tp, str) else tp.value

                cursor.execute(
                    """
                    INSERT INTO user_onboarding (
                        user_id, work_preference, adhd_support_level, adhd_challenges,
                        daily_schedule, time_preference, productivity_goals,
                        chatgpt_export_prompt, chatgpt_exported_at,
                        onboarding_completed, onboarding_skipped,
                        completed_at, skipped_at, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        user_id,
                        work_pref_val,
                        data.adhd_support_level,
                        adhd_challenges_json,
                        daily_schedule_json,
                        time_pref_val,
                        productivity_goals_json,
                        data.chatgpt_export_prompt,
                        now if data.chatgpt_export_prompt else None,
                        data.onboarding_completed or False,
                        data.onboarding_skipped or False,
                        now if data.onboarding_completed else None,
                        now if data.onboarding_skipped else None,
                        now,
                        now,
                    ),
                )

            conn.commit()

        # Return updated data
        result = await self.get_onboarding(user_id)
        if result is None:
            raise ValueError(f"Failed to retrieve onboarding data after upsert for user {user_id}")
        return result

    async def mark_completed(self, user_id: str, completed: bool = True) -> OnboardingResponse:
        """
        Mark onboarding as completed or skipped

        Args:
            user_id: User ID
            completed: True to mark completed, False to mark skipped

        Returns:
            Updated OnboardingResponse
        """
        update_data = OnboardingUpdateRequest(
            onboarding_completed=completed,
            onboarding_skipped=not completed,
        )
        return await self.upsert_onboarding(user_id, update_data)

    async def delete_onboarding(self, user_id: str) -> bool:
        """
        Delete onboarding data for a user

        Args:
            user_id: User ID

        Returns:
            True if deleted, False if not found
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM user_onboarding WHERE user_id = ?", (user_id,))
            deleted = cursor.rowcount > 0
            conn.commit()
            return deleted
