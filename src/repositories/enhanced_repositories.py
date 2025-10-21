"""
Enhanced Repository Layer - Database operations for all models using the enhanced database adapter
"""

from __future__ import annotations

import asyncio
import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any

from src.core.task_models import (
    Achievement,
    FocusSession,
    ProductivityMetrics,
    Project,
    Task,
    TaskFilter,
    TaskSort,
    User,
    UserAchievement,
)
from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database


@dataclass
class PaginatedResult:
    """Paginated result container"""

    items: list[Any]
    total: int
    limit: int
    offset: int


class BaseEnhancedRepository:
    """Base repository using the enhanced database adapter"""

    def __init__(self, db: EnhancedDatabaseAdapter | None = None):
        self.db = db or get_enhanced_database()

    def _dict_to_model(self, data: dict[str, Any], model_class):
        """Convert dictionary to model instance"""
        # Convert JSON strings back to objects
        for key, value in data.items():
            if key in [
                "tags",
                "team_members",
                "metadata",
                "settings",
                "default_tags",
                "preferences",
                "criteria",
                "context",
            ] and isinstance(value, str):
                try:
                    data[key] = (
                        json.loads(value)
                        if value
                        else ([] if key in ["tags", "team_members", "default_tags"] else {})
                    )
                except json.JSONDecodeError:
                    data[key] = [] if key in ["tags", "team_members", "default_tags"] else {}
            elif (
                key
                in [
                    "estimated_hours",
                    "actual_hours",
                    "default_estimated_hours",
                    "productivity_score",
                    "progress",
                ]
                and value is not None
            ):
                data[key] = Decimal(str(value))
            elif key.endswith("_at") and isinstance(value, str):
                try:
                    data[key] = datetime.fromisoformat(value)
                except (ValueError, TypeError):
                    pass

        return model_class(**data)

    def _model_to_dict(self, model) -> dict[str, Any]:
        """Convert model instance to dictionary for database storage"""
        # Use by_alias=True to respect serialization_alias (e.g., assignee -> assignee_id)
        data = model.model_dump(by_alias=True)

        # Convert lists and dicts to JSON strings
        for key, value in data.items():
            if key in [
                "tags",
                "team_members",
                "metadata",
                "settings",
                "default_tags",
                "preferences",
                "criteria",
                "context",
            ] and isinstance(value, (list, dict)):
                data[key] = json.dumps(value)
            elif isinstance(value, Decimal):
                data[key] = str(value)
            elif isinstance(value, datetime):
                data[key] = value.isoformat()

        return data

    def _execute_query(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
        """Execute a query on the database"""
        conn = self.db.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        result = cursor.execute(query, params)
        conn.commit()
        return result

    async def _execute_query_async(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
        """Execute a query asynchronously"""
        return await asyncio.to_thread(self._execute_query, query, params)


class UserRepository(BaseEnhancedRepository):
    """Repository for user operations"""

    def create(self, user: User) -> User:
        """Create a new user"""
        data = self._model_to_dict(user)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO users ({columns}) VALUES ({placeholders})"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, list(data.values()))
        conn.commit()

        return user

    def get_by_id(self, user_id: str) -> User | None:
        """Get user by ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), User)
        return None

    def get_by_email(self, email: str) -> User | None:
        """Get user by email"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), User)
        return None

    def get_by_username(self, username: str) -> User | None:
        """Get user by username"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), User)
        return None

    def update(self, user: User) -> User:
        """Update an existing user"""
        data = self._model_to_dict(user)
        data["updated_at"] = datetime.utcnow().isoformat()

        set_clause = ", ".join([f"{key} = ?" for key in data.keys() if key != "user_id"])
        values = [value for key, value in data.items() if key != "user_id"]
        values.append(user.user_id)

        query = f"UPDATE users SET {set_clause} WHERE user_id = ?"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()

        return user

    def list_users(self, limit: int = 50, offset: int = 0) -> PaginatedResult:
        """List users with pagination"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get total count
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
        total = cursor.fetchone()[0]

        # Get paginated results
        cursor.execute(
            "SELECT * FROM users WHERE is_active = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )
        rows = cursor.fetchall()

        users = [self._dict_to_model(dict(row), User) for row in rows]

        return PaginatedResult(items=users, total=total, limit=limit, offset=offset)

    def delete(self, user_id: str) -> bool:
        """Delete a user (hard delete to test cascade constraints)"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
        affected = cursor.rowcount
        conn.commit()
        return affected > 0


class FocusSessionRepository(BaseEnhancedRepository):
    """Repository for focus session operations"""

    def create(self, session: FocusSession) -> FocusSession:
        """Create a new focus session"""
        data = self._model_to_dict(session)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO focus_sessions ({columns}) VALUES ({placeholders})"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, list(data.values()))
        conn.commit()

        return session

    def get_by_id(self, session_id: str) -> FocusSession | None:
        """Get focus session by ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM focus_sessions WHERE session_id = ?", (session_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), FocusSession)
        return None

    def get_user_sessions(self, user_id: str, limit: int = 50) -> list[FocusSession]:
        """Get focus sessions for a user"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?",
            (user_id, limit),
        )
        rows = cursor.fetchall()

        return [self._dict_to_model(dict(row), FocusSession) for row in rows]

    def get_active_session(self, user_id: str) -> FocusSession | None:
        """Get active session for a user"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM focus_sessions WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1",
            (user_id,),
        )
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), FocusSession)
        return None

    def update(self, session: FocusSession) -> FocusSession:
        """Update a focus session"""
        data = self._model_to_dict(session)

        set_clause = ", ".join([f"{key} = ?" for key in data.keys() if key != "session_id"])
        values = [value for key, value in data.items() if key != "session_id"]
        values.append(session.session_id)

        query = f"UPDATE focus_sessions SET {set_clause} WHERE session_id = ?"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()

        return session


class AchievementRepository(BaseEnhancedRepository):
    """Repository for achievement operations"""

    def get_by_id(self, achievement_id: str) -> Achievement | None:
        """Get achievement by ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM achievements WHERE achievement_id = ?", (achievement_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), Achievement)
        return None

    def list_achievements(self, category: str | None = None) -> list[Achievement]:
        """List achievements, optionally filtered by category"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        if category:
            cursor.execute(
                "SELECT * FROM achievements WHERE category = ? AND is_active = 1 ORDER BY name",
                (category,),
            )
        else:
            cursor.execute("SELECT * FROM achievements WHERE is_active = 1 ORDER BY category, name")

        rows = cursor.fetchall()

        return [self._dict_to_model(dict(row), Achievement) for row in rows]

    def create(self, achievement: Achievement) -> Achievement:
        """Create a new achievement"""
        data = self._model_to_dict(achievement)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO achievements ({columns}) VALUES ({placeholders})"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, list(data.values()))
        conn.commit()

        return achievement


class UserAchievementRepository(BaseEnhancedRepository):
    """Repository for user achievement operations"""

    def create(self, user_achievement: UserAchievement) -> UserAchievement:
        """Create a new user achievement"""
        data = self._model_to_dict(user_achievement)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO user_achievements ({columns}) VALUES ({placeholders})"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, list(data.values()))
        conn.commit()

        return user_achievement

    def get_user_achievement(self, user_id: str, achievement_id: str) -> UserAchievement | None:
        """Get specific user achievement"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?",
            (user_id, achievement_id),
        )
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), UserAchievement)
        return None

    def get_user_achievements(
        self, user_id: str, completed_only: bool = False
    ) -> list[UserAchievement]:
        """Get all achievements for a user"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        if completed_only:
            cursor.execute(
                "SELECT * FROM user_achievements WHERE user_id = ? AND is_completed = 1 ORDER BY earned_at DESC",
                (user_id,),
            )
        else:
            cursor.execute(
                "SELECT * FROM user_achievements WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,),
            )

        rows = cursor.fetchall()

        return [self._dict_to_model(dict(row), UserAchievement) for row in rows]

    def update(self, user_achievement: UserAchievement) -> UserAchievement:
        """Update a user achievement"""
        data = self._model_to_dict(user_achievement)

        set_clause = ", ".join(
            [f"{key} = ?" for key in data.keys() if key != "user_achievement_id"]
        )
        values = [value for key, value in data.items() if key != "user_achievement_id"]
        values.append(user_achievement.user_achievement_id)

        query = f"UPDATE user_achievements SET {set_clause} WHERE user_achievement_id = ?"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()

        return user_achievement

    def get_by_id(self, user_achievement_id: str) -> UserAchievement | None:
        """Get user achievement by ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM user_achievements WHERE user_achievement_id = ?",
            (user_achievement_id,)
        )
        row = cursor.fetchone()
        return self._dict_to_model(dict(row), UserAchievement) if row else None


class ProductivityMetricsRepository(BaseEnhancedRepository):
    """Repository for productivity metrics operations"""

    def create_or_update(self, metrics: ProductivityMetrics) -> ProductivityMetrics:
        """Create or update productivity metrics for a user/date/period"""
        data = self._model_to_dict(metrics)

        # Try to update first
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Check if record exists
        cursor.execute(
            "SELECT metrics_id FROM productivity_metrics WHERE user_id = ? AND date = ? AND period_type = ?",
            (metrics.user_id, data["date"], metrics.period_type),
        )
        existing = cursor.fetchone()

        if existing:
            # Update existing record
            data["updated_at"] = datetime.utcnow().isoformat()
            set_clause = ", ".join(
                [
                    f"{key} = ?"
                    for key in data.keys()
                    if key not in ["metrics_id", "user_id", "date", "period_type"]
                ]
            )
            values = [
                value
                for key, value in data.items()
                if key not in ["metrics_id", "user_id", "date", "period_type"]
            ]
            values.extend([metrics.user_id, data["date"], metrics.period_type])

            query = f"UPDATE productivity_metrics SET {set_clause} WHERE user_id = ? AND date = ? AND period_type = ?"
            cursor.execute(query, values)
        else:
            # Insert new record
            columns = ", ".join(data.keys())
            placeholders = ", ".join(["?" for _ in data.keys()])
            query = f"INSERT INTO productivity_metrics ({columns}) VALUES ({placeholders})"
            cursor.execute(query, list(data.values()))

        conn.commit()

        return metrics

    def get_user_metrics(
        self, user_id: str, period_type: str = "daily", limit: int = 30
    ) -> list[ProductivityMetrics]:
        """Get productivity metrics for a user"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM productivity_metrics WHERE user_id = ? AND period_type = ? ORDER BY date DESC LIMIT ?",
            (user_id, period_type, limit),
        )
        rows = cursor.fetchall()

        return [self._dict_to_model(dict(row), ProductivityMetrics) for row in rows]

    def get_metrics_for_date(
        self, user_id: str, date: datetime, period_type: str = "daily"
    ) -> ProductivityMetrics | None:
        """Get metrics for a specific date"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM productivity_metrics WHERE user_id = ? AND date = ? AND period_type = ?",
            (user_id, date.isoformat(), period_type),
        )
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), ProductivityMetrics)
        return None


# Enhanced task repository that uses the enhanced database
class EnhancedTaskRepository(BaseEnhancedRepository):
    """Enhanced task repository using the enhanced database adapter"""

    def create(self, task: Task) -> Task:
        """Create a new task"""
        data = self._model_to_dict(task)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO tasks ({columns}) VALUES ({placeholders})"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, list(data.values()))
        conn.commit()

        return task

    def get_by_id(self, task_id: str) -> Task | None:
        """Get task by ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), Task)
        return None

    def update(self, task: Task) -> Task:
        """Update an existing task"""
        data = self._model_to_dict(task)
        data["updated_at"] = datetime.utcnow().isoformat()

        set_clause = ", ".join([f"{key} = ?" for key in data.keys() if key != "task_id"])
        values = [value for key, value in data.items() if key != "task_id"]
        values.append(task.task_id)

        query = f"UPDATE tasks SET {set_clause} WHERE task_id = ?"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()

        return task

    def delete(self, task_id: str) -> bool:
        """Delete a task"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
        affected = cursor.rowcount
        conn.commit()
        return affected > 0

    def list_tasks(
        self,
        filter_obj: TaskFilter | None = None,
        sort_obj: TaskSort | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> PaginatedResult:
        """List tasks with filtering, sorting, and pagination"""
        where_conditions = []
        params = []

        # Apply filters
        if filter_obj:
            if filter_obj.project_id:
                where_conditions.append("project_id = ?")
                params.append(filter_obj.project_id)

            if filter_obj.assignee_id:
                where_conditions.append("assignee_id = ?")
                params.append(filter_obj.assignee_id)

            if filter_obj.status:
                status_placeholders = ", ".join(["?" for _ in filter_obj.status])
                where_conditions.append(f"status IN ({status_placeholders})")
                params.extend(
                    [
                        status.value if hasattr(status, "value") else status
                        for status in filter_obj.status
                    ]
                )

            if filter_obj.priority:
                priority_placeholders = ", ".join(["?" for _ in filter_obj.priority])
                where_conditions.append(f"priority IN ({priority_placeholders})")
                params.extend(
                    [
                        priority.value if hasattr(priority, "value") else priority
                        for priority in filter_obj.priority
                    ]
                )

            if filter_obj.search_text:
                where_conditions.append("(title LIKE ? OR description LIKE ?)")
                search_term = f"%{filter_obj.search_text}%"
                params.extend([search_term, search_term])

        # Build WHERE clause
        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)

        # Build ORDER BY clause
        order_clause = "ORDER BY created_at DESC"
        if sort_obj:
            direction = "ASC" if sort_obj.direction == "asc" else "DESC"
            order_clause = f"ORDER BY {sort_obj.field} {direction}"

        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get total count
        count_query = f"SELECT COUNT(*) FROM tasks {where_clause}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]

        # Get paginated results
        query = f"SELECT * FROM tasks {where_clause} {order_clause} LIMIT ? OFFSET ?"
        cursor.execute(query, params + [limit, offset])
        rows = cursor.fetchall()

        tasks = [self._dict_to_model(dict(row), Task) for row in rows]

        return PaginatedResult(items=tasks, total=total, limit=limit, offset=offset)

    def get_tasks_by_project(self, project_id: str) -> list[Task]:
        """Get all tasks for a project"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC", (project_id,)
        )
        rows = cursor.fetchall()
        return [self._dict_to_model(dict(row), Task) for row in rows]


# Enhanced project repository
class EnhancedProjectRepository(BaseEnhancedRepository):
    """Enhanced project repository using the enhanced database adapter"""

    def create(self, project: Project) -> Project:
        """Create a new project"""
        data = self._model_to_dict(project)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO projects ({columns}) VALUES ({placeholders})"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, list(data.values()))
        conn.commit()

        return project

    def get_by_id(self, project_id: str) -> Project | None:
        """Get project by ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), Project)
        return None

    def update(self, project: Project) -> Project:
        """Update an existing project"""
        data = self._model_to_dict(project)
        data["updated_at"] = datetime.utcnow().isoformat()

        set_clause = ", ".join([f"{key} = ?" for key in data.keys() if key != "project_id"])
        values = [value for key, value in data.items() if key != "project_id"]
        values.append(project.project_id)

        query = f"UPDATE projects SET {set_clause} WHERE project_id = ?"

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()

        return project

    def list_projects(self, limit: int = 50, offset: int = 0) -> PaginatedResult:
        """List projects with pagination"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get total count
        cursor.execute("SELECT COUNT(*) FROM projects WHERE is_active = 1")
        total = cursor.fetchone()[0]

        # Get paginated results
        cursor.execute(
            "SELECT * FROM projects WHERE is_active = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )
        rows = cursor.fetchall()

        projects = [self._dict_to_model(dict(row), Project) for row in rows]

        return PaginatedResult(items=projects, total=total, limit=limit, offset=offset)

    def delete(self, project_id: str) -> bool:
        """Delete a project (hard delete for testing cascade constraints)"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM projects WHERE project_id = ?", (project_id,))
        affected = cursor.rowcount
        conn.commit()
        return affected > 0

    def soft_delete(self, project_id: str) -> bool:
        """Soft delete a project (setting is_active = False)"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE projects SET is_active = 0, updated_at = ? WHERE project_id = ?",
            (datetime.utcnow().isoformat(), project_id),
        )
        affected = cursor.rowcount
        conn.commit()
        return affected > 0
