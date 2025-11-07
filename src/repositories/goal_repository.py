"""
Goal Repository - Database operations for goals
"""

from __future__ import annotations

import contextlib
import json
from datetime import datetime
from decimal import Decimal

from src.core.task_models import CaptureType, Goal, Milestone, Task
from src.repositories.enhanced_repositories import BaseEnhancedRepository


class GoalRepository(BaseEnhancedRepository):
    """Repository for goal operations"""

    def create(self, goal: Goal, task: Task) -> Goal:
        """
        Create a new goal with its associated task.

        Args:
            goal: Goal model instance
            task: Associated task model instance

        Returns:
            Goal: Created goal with task_id set
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            # Ensure task has correct capture_type
            task.capture_type = CaptureType.GOAL

            # Insert task first
            task_data = self._model_to_dict(task)
            task_columns = ", ".join(task_data.keys())
            task_placeholders = ", ".join(["?" for _ in task_data])
            task_query = f"INSERT INTO tasks ({task_columns}) VALUES ({task_placeholders})"
            cursor.execute(task_query, list(task_data.values()))

            # Prepare goal data
            goal_data = self._model_to_dict(goal)
            goal_data["task_id"] = task.task_id

            # Convert milestones to JSON string
            if "milestones" in goal_data:
                goal_data["milestones"] = json.dumps(
                    [
                        {
                            "value": str(m["value"])
                            if isinstance(m["value"], Decimal)
                            else m["value"],
                            "date": m["date"].isoformat()
                            if isinstance(m["date"], datetime)
                            else m["date"],
                            "description": m.get("description"),
                            "completed": m.get("completed", False),
                            "completed_at": m["completed_at"].isoformat()
                            if m.get("completed_at")
                            else None,
                        }
                        for m in goal_data["milestones"]
                    ]
                    if isinstance(goal_data["milestones"], list)
                    else []
                )

            # Insert goal
            goal_columns = ", ".join(goal_data.keys())
            goal_placeholders = ", ".join(["?" for _ in goal_data])
            goal_query = f"INSERT INTO goals ({goal_columns}) VALUES ({goal_placeholders})"
            cursor.execute(goal_query, list(goal_data.values()))

            conn.commit()
            goal.task_id = task.task_id
            return goal

        except Exception as e:
            conn.rollback()
            raise e

    def get_by_id(self, goal_id: str) -> Goal | None:
        """Get goal by ID with task details"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT g.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date, t.created_at as task_created_at, t.updated_at as task_updated_at
            FROM goals g
            JOIN tasks t ON g.task_id = t.task_id
            WHERE g.goal_id = ?
        """
        cursor.execute(query, (goal_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_goal_model(dict(row))
        return None

    def get_by_task_id(self, task_id: str) -> Goal | None:
        """Get goal by task ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT g.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM goals g
            JOIN tasks t ON g.task_id = t.task_id
            WHERE g.task_id = ?
        """
        cursor.execute(query, (task_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_goal_model(dict(row))
        return None

    def update(self, goal: Goal) -> Goal:
        """Update an existing goal"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        goal_data = self._model_to_dict(goal)
        goal_data["updated_at"] = datetime.utcnow().isoformat()

        # Convert milestones to JSON string
        if "milestones" in goal_data:
            goal_data["milestones"] = json.dumps(
                [
                    {
                        "value": str(m["value"]) if isinstance(m["value"], Decimal) else m["value"],
                        "date": m["date"].isoformat()
                        if isinstance(m["date"], datetime)
                        else m["date"],
                        "description": m.get("description"),
                        "completed": m.get("completed", False),
                        "completed_at": m["completed_at"].isoformat()
                        if m.get("completed_at")
                        else None,
                    }
                    for m in goal_data["milestones"]
                ]
                if isinstance(goal_data["milestones"], list)
                else []
            )

        set_clause = ", ".join([f"{key} = ?" for key in goal_data if key != "goal_id"])
        values = [value for key, value in goal_data.items() if key != "goal_id"]
        values.append(goal.goal_id)

        query = f"UPDATE goals SET {set_clause} WHERE goal_id = ?"
        cursor.execute(query, values)
        conn.commit()

        return goal

    def update_progress(self, goal_id: str, new_value: Decimal) -> Goal | None:
        """Update goal progress and recalculate percentage"""
        goal = self.get_by_id(goal_id)
        if not goal:
            return None

        goal.update_progress(new_value)
        return self.update(goal)

    def add_milestone(
        self, goal_id: str, value: Decimal, date: datetime, description: str | None = None
    ) -> Goal | None:
        """Add a milestone to a goal"""
        goal = self.get_by_id(goal_id)
        if not goal:
            return None

        goal.add_milestone(value, date, description)
        return self.update(goal)

    def get_active_goals(self, limit: int = 50, offset: int = 0) -> list[Goal]:
        """Get all active goals"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT g.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM goals g
            JOIN tasks t ON g.task_id = t.task_id
            WHERE g.is_active = 1 AND g.is_achieved = 0
            ORDER BY g.target_date ASC
            LIMIT ? OFFSET ?
        """
        cursor.execute(query, (limit, offset))
        rows = cursor.fetchall()

        return [self._dict_to_goal_model(dict(row)) for row in rows]

    def get_goals_by_status(
        self, is_active: bool, is_achieved: bool, limit: int = 50
    ) -> list[Goal]:
        """Get goals by status"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT g.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM goals g
            JOIN tasks t ON g.task_id = t.task_id
            WHERE g.is_active = ? AND g.is_achieved = ?
            ORDER BY g.created_at DESC
            LIMIT ?
        """
        cursor.execute(query, (1 if is_active else 0, 1 if is_achieved else 0, limit))
        rows = cursor.fetchall()

        return [self._dict_to_goal_model(dict(row)) for row in rows]

    def get_overdue_goals(self) -> list[Goal]:
        """Get goals that are past their target date and not achieved"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        now = datetime.utcnow().isoformat()
        query = """
            SELECT g.*, t.title, t.description, t.project_id, t.status, t.priority,
                   t.tags, t.due_date
            FROM goals g
            JOIN tasks t ON g.task_id = t.task_id
            WHERE g.is_active = 1
              AND g.is_achieved = 0
              AND g.target_date IS NOT NULL
              AND g.target_date < ?
            ORDER BY g.target_date ASC
        """
        cursor.execute(query, (now,))
        rows = cursor.fetchall()

        return [self._dict_to_goal_model(dict(row)) for row in rows]

    def delete(self, goal_id: str) -> bool:
        """Delete a goal (cascades to task)"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get task_id first
        cursor.execute("SELECT task_id FROM goals WHERE goal_id = ?", (goal_id,))
        row = cursor.fetchone()

        if not row:
            return False

        task_id = row["task_id"]

        # Delete task (cascades to goal due to FK constraint)
        cursor.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
        conn.commit()

        return cursor.rowcount > 0

    def _dict_to_goal_model(self, data: dict) -> Goal:
        """Convert database row dict to Goal model"""
        # Parse milestones JSON
        if "milestones" in data and isinstance(data["milestones"], str):
            try:
                milestones_data = json.loads(data["milestones"]) if data["milestones"] else []
                data["milestones"] = [
                    Milestone(
                        value=Decimal(m["value"]) if m["value"] else Decimal("0.0"),
                        date=datetime.fromisoformat(m["date"])
                        if isinstance(m["date"], str)
                        else m["date"],
                        description=m.get("description"),
                        completed=m.get("completed", False),
                        completed_at=(
                            datetime.fromisoformat(m["completed_at"])
                            if m.get("completed_at") and isinstance(m["completed_at"], str)
                            else m.get("completed_at")
                        ),
                    )
                    for m in milestones_data
                ]
            except (json.JSONDecodeError, KeyError, ValueError):
                data["milestones"] = []

        # Parse metadata
        if "metadata" in data and isinstance(data["metadata"], str):
            try:
                data["metadata"] = json.loads(data["metadata"]) if data["metadata"] else {}
            except json.JSONDecodeError:
                data["metadata"] = {}

        # Convert decimal fields
        for field in ["target_value", "current_value", "progress_percentage"]:
            if field in data and data[field] is not None:
                data[field] = Decimal(str(data[field]))

        # Convert datetime fields
        for field in [
            "target_date",
            "last_progress_update",
            "achieved_at",
            "created_at",
            "updated_at",
        ]:
            if field in data and isinstance(data[field], str):
                with contextlib.suppress(ValueError, TypeError):
                    data[field] = datetime.fromisoformat(data[field])

        # Convert boolean fields
        for field in ["is_active", "is_achieved"]:
            if field in data:
                data[field] = bool(data[field])

        return Goal(**data)
