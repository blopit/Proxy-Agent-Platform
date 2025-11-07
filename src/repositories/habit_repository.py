"""
Habit Repository - Database operations for habits and habit completions
"""

from __future__ import annotations

import contextlib
import json
from datetime import datetime

from src.core.task_models import CaptureType, Habit, HabitCompletion, RecurrencePattern, Task
from src.repositories.enhanced_repositories import BaseEnhancedRepository


class HabitRepository(BaseEnhancedRepository):
    """Repository for habit operations"""

    def create(self, habit: Habit, task: Task) -> Habit:
        """
        Create a new habit with its associated task.

        Args:
            habit: Habit model instance
            task: Associated task model instance

        Returns:
            Habit: Created habit with task_id set
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            # Ensure task has correct capture_type
            task.capture_type = CaptureType.HABIT

            # Insert task first
            task_data = self._model_to_dict(task)
            task_columns = ", ".join(task_data.keys())
            task_placeholders = ", ".join(["?" for _ in task_data])
            task_query = f"INSERT INTO tasks ({task_columns}) VALUES ({task_placeholders})"
            cursor.execute(task_query, list(task_data.values()))

            # Prepare habit data
            habit_data = self._model_to_dict(habit)
            habit_data["task_id"] = task.task_id

            # Convert recurrence_pattern to JSON string if it's a dict
            if "recurrence_pattern" in habit_data and isinstance(
                habit_data["recurrence_pattern"], dict
            ):
                habit_data["recurrence_pattern"] = json.dumps(habit_data["recurrence_pattern"])

            # Convert completion_history to JSON string
            if "completion_history" in habit_data and isinstance(
                habit_data["completion_history"], list
            ):
                habit_data["completion_history"] = json.dumps(habit_data["completion_history"])

            # Insert habit
            habit_columns = ", ".join(habit_data.keys())
            habit_placeholders = ", ".join(["?" for _ in habit_data])
            habit_query = f"INSERT INTO habits ({habit_columns}) VALUES ({habit_placeholders})"
            cursor.execute(habit_query, list(habit_data.values()))

            conn.commit()
            habit.task_id = task.task_id
            return habit

        except Exception as e:
            conn.rollback()
            raise e

    def get_by_id(self, habit_id: str) -> Habit | None:
        """Get habit by ID with task details"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT h.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM habits h
            JOIN tasks t ON h.task_id = t.task_id
            WHERE h.habit_id = ?
        """
        cursor.execute(query, (habit_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_habit_model(dict(row))
        return None

    def get_by_task_id(self, task_id: str) -> Habit | None:
        """Get habit by task ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT h.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM habits h
            JOIN tasks t ON h.task_id = t.task_id
            WHERE h.task_id = ?
        """
        cursor.execute(query, (task_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_habit_model(dict(row))
        return None

    def update(self, habit: Habit) -> Habit:
        """Update an existing habit"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        habit_data = self._model_to_dict(habit)
        habit_data["updated_at"] = datetime.utcnow().isoformat()

        # Convert recurrence_pattern to JSON string
        if "recurrence_pattern" in habit_data and isinstance(
            habit_data["recurrence_pattern"], dict
        ):
            habit_data["recurrence_pattern"] = json.dumps(habit_data["recurrence_pattern"])

        # Convert completion_history to JSON string
        if "completion_history" in habit_data and isinstance(
            habit_data["completion_history"], list
        ):
            habit_data["completion_history"] = json.dumps(habit_data["completion_history"])

        set_clause = ", ".join([f"{key} = ?" for key in habit_data if key != "habit_id"])
        values = [value for key, value in habit_data.items() if key != "habit_id"]
        values.append(habit.habit_id)

        query = f"UPDATE habits SET {set_clause} WHERE habit_id = ?"
        cursor.execute(query, values)
        conn.commit()

        return habit

    def mark_completed_today(
        self, habit_id: str, completion_date: str | None = None
    ) -> HabitCompletion | None:
        """Mark habit as completed for today and record completion"""
        habit = self.get_by_id(habit_id)
        if not habit:
            return None

        # Mark completed and get completion record
        completion = habit.mark_completed_today(completion_date)

        # Update habit in database
        self.update(habit)

        # Store completion in habit_completions table
        self.create_completion(completion)

        return completion

    def reset_streak(self, habit_id: str) -> bool:
        """Reset habit streak"""
        habit = self.get_by_id(habit_id)
        if not habit:
            return False

        habit.reset_streak()
        self.update(habit)
        return True

    def get_active_habits(self, limit: int = 50, offset: int = 0) -> list[Habit]:
        """Get all active habits"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT h.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM habits h
            JOIN tasks t ON h.task_id = t.task_id
            WHERE h.is_active = 1
            ORDER BY h.created_at DESC
            LIMIT ? OFFSET ?
        """
        cursor.execute(query, (limit, offset))
        rows = cursor.fetchall()

        return [self._dict_to_habit_model(dict(row)) for row in rows]

    def get_habits_due_today(self) -> list[Habit]:
        """Get habits that should be completed today"""
        # Note: This is a simplified version
        # A full implementation would parse recurrence_pattern and check if today matches
        return self.get_active_habits()

    def get_completion_history(self, habit_id: str, days: int = 30) -> list[HabitCompletion]:
        """Get completion history for a habit"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT * FROM habit_completions
            WHERE habit_id = ?
            ORDER BY completion_date DESC
            LIMIT ?
        """
        cursor.execute(query, (habit_id, days))
        rows = cursor.fetchall()

        return [self._dict_to_completion_model(dict(row)) for row in rows]

    def create_completion(self, completion: HabitCompletion) -> HabitCompletion:
        """Create a habit completion record"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        completion_data = self._model_to_dict(completion)

        # Convert metadata to JSON string
        if "metadata" in completion_data and isinstance(completion_data["metadata"], dict):
            completion_data["metadata"] = json.dumps(completion_data["metadata"])

        columns = ", ".join(completion_data.keys())
        placeholders = ", ".join(["?" for _ in completion_data])
        query = f"INSERT INTO habit_completions ({columns}) VALUES ({placeholders})"

        cursor.execute(query, list(completion_data.values()))
        conn.commit()

        return completion

    def delete(self, habit_id: str) -> bool:
        """Delete a habit (cascades to task and completions)"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get task_id first
        cursor.execute("SELECT task_id FROM habits WHERE habit_id = ?", (habit_id,))
        row = cursor.fetchone()

        if not row:
            return False

        task_id = row["task_id"]

        # Delete task (cascades to habit due to FK constraint)
        cursor.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
        conn.commit()

        return cursor.rowcount > 0

    def _dict_to_habit_model(self, data: dict) -> Habit:
        """Convert database row dict to Habit model"""
        # Parse recurrence_pattern JSON
        if "recurrence_pattern" in data and isinstance(data["recurrence_pattern"], str):
            try:
                pattern_data = (
                    json.loads(data["recurrence_pattern"]) if data["recurrence_pattern"] else {}
                )
                data["recurrence_pattern"] = RecurrencePattern(**pattern_data)
            except (json.JSONDecodeError, TypeError, KeyError):
                # Default pattern if parse fails
                data["recurrence_pattern"] = RecurrencePattern(frequency="daily", interval=1)

        # Parse completion_history JSON
        if "completion_history" in data and isinstance(data["completion_history"], str):
            try:
                data["completion_history"] = (
                    json.loads(data["completion_history"]) if data["completion_history"] else []
                )
            except json.JSONDecodeError:
                data["completion_history"] = []

        # Parse metadata
        if "metadata" in data and isinstance(data["metadata"], str):
            try:
                data["metadata"] = json.loads(data["metadata"]) if data["metadata"] else {}
            except json.JSONDecodeError:
                data["metadata"] = {}

        # Convert datetime fields
        for field in ["last_completed_at", "paused_at", "created_at", "updated_at"]:
            if field in data and isinstance(data[field], str):
                with contextlib.suppress(ValueError, TypeError):
                    data[field] = datetime.fromisoformat(data[field])

        # Convert boolean fields
        for field in ["is_active", "reminder_enabled"]:
            if field in data:
                data[field] = bool(data[field])

        # Convert integer fields
        for field in ["streak_count", "longest_streak", "total_completions"]:
            if field in data and data[field] is not None:
                data[field] = int(data[field])

        return Habit(**data)

    def _dict_to_completion_model(self, data: dict) -> HabitCompletion:
        """Convert database row dict to HabitCompletion model"""
        # Parse metadata
        if "metadata" in data and isinstance(data["metadata"], str):
            try:
                data["metadata"] = json.loads(data["metadata"]) if data["metadata"] else {}
            except json.JSONDecodeError:
                data["metadata"] = {}

        # Convert datetime fields
        for field in ["completed_at", "created_at"]:
            if field in data and isinstance(data[field], str):
                with contextlib.suppress(ValueError, TypeError):
                    data[field] = datetime.fromisoformat(data[field])

        # Convert integer fields
        if "energy_level" in data and data["energy_level"] is not None:
            data["energy_level"] = int(data["energy_level"])

        return HabitCompletion(**data)
