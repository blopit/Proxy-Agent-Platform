"""
Task Repository Layer - Database operations for task management
"""

import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any, Protocol, Type, TypeVar

T = TypeVar('T')

class PydanticModel(Protocol):
    def model_dump(self) -> dict[str, Any]: ...

from src.core.task_models import (
    Project,
    Task,
    TaskComment,
    TaskDependency,
    TaskFilter,
    TaskSort,
    TaskTemplate,
)


@dataclass
class PaginatedResult:
    """Paginated result container"""

    items: list[Any]
    total: int
    limit: int
    offset: int


class BaseRepository:
    """Base repository with common database operations"""

    def __init__(self, db_path: str = ":memory:"):
        self.db_path = db_path
        self.connection: sqlite3.Connection | None = None

    def setup(self) -> None:
        """Setup database connection and tables"""
        self.connection = sqlite3.connect(self.db_path)
        self.connection.row_factory = sqlite3.Row
        self._create_tables()

    def cleanup(self) -> None:
        """Close database connection"""
        if self.connection:
            self.connection.close()
            self.connection = None

    def _create_tables(self) -> None:
        """Create database tables - to be implemented by subclasses"""
        pass

    def _ensure_connection(self) -> sqlite3.Connection:
        """Ensure database connection is available"""
        if not self.connection:
            raise RuntimeError("Database connection not established. Call setup() first.")
        return self.connection

    def _dict_to_model(self, data: dict[str, Any], model_class: Type[T]) -> T:
        """Convert dictionary to model instance"""
        # Convert JSON strings back to objects
        for key, value in data.items():
            if key in [
                "tags",
                "team_members",
                "metadata",
                "settings",
                "default_tags",
                "micro_steps",  # Epic 7: Task Splitting
                "children_ids",  # Progressive hierarchy
            ] and isinstance(value, str):
                try:
                    data[key] = (
                        json.loads(value)
                        if value
                        else ([] if key in ["tags", "team_members", "default_tags", "micro_steps", "children_ids"] else {})
                    )
                except json.JSONDecodeError:
                    data[key] = [] if key in ["tags", "team_members", "default_tags", "micro_steps", "children_ids"] else {}
            elif (
                key in ["estimated_hours", "actual_hours", "default_estimated_hours"]
                and value is not None
            ):
                data[key] = Decimal(str(value))
            elif key.endswith("_at") and isinstance(value, str):
                try:
                    data[key] = datetime.fromisoformat(value)
                except (ValueError, TypeError):
                    pass

        return model_class(**data)

    def _model_to_dict(self, model: PydanticModel) -> dict[str, Any]:
        """Convert model instance to dictionary for database storage"""
        # Use by_alias=True to respect serialization aliases (e.g., assignee -> assignee_id)
        data = model.model_dump(by_alias=True)

        # Convert lists and dicts to JSON strings
        for key, value in data.items():
            if key in [
                "tags",
                "team_members",
                "metadata",
                "settings",
                "default_tags",
                "micro_steps",  # Epic 7: Task Splitting
                "children_ids",  # Progressive hierarchy
            ] and isinstance(value, (list, dict)):
                data[key] = json.dumps(value)
            elif isinstance(value, Decimal):
                data[key] = str(value)
            elif isinstance(value, datetime):
                data[key] = value.isoformat()
            elif hasattr(value, 'value'):  # Handle enum values
                data[key] = value.value

        return data


class TaskRepository(BaseRepository):
    """Repository for task operations"""

    def _create_tables(self) -> None:
        """Create tasks table"""
        conn = self._ensure_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                task_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                project_id TEXT NOT NULL,
                parent_id TEXT,
                capture_type TEXT DEFAULT 'task',
                status TEXT NOT NULL DEFAULT 'todo',
                priority TEXT NOT NULL DEFAULT 'medium',
                estimated_hours TEXT,
                actual_hours TEXT DEFAULT '0.0',
                tags TEXT DEFAULT '[]',
                assignee_id TEXT,
                due_date TEXT,
                started_at TEXT,
                completed_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                metadata TEXT DEFAULT '{}',
                scope TEXT DEFAULT 'simple',
                micro_steps TEXT DEFAULT '[]',
                is_micro_step INTEGER DEFAULT 0,
                delegation_mode TEXT DEFAULT 'do',
                level INTEGER DEFAULT 0,
                custom_emoji TEXT,
                decomposition_state TEXT DEFAULT 'stub',
                children_ids TEXT DEFAULT '[]',
                total_minutes INTEGER DEFAULT 0,
                is_leaf INTEGER DEFAULT 0,
                leaf_type TEXT
            )
        """)
        conn.commit()

    def create(self, task: Task) -> Task:
        """Create a new task"""
        conn = self._ensure_connection()
        data = self._model_to_dict(task)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO tasks ({columns}) VALUES ({placeholders})"
        conn.execute(query, list(data.values()))
        conn.commit()

        return task

    def get_by_id(self, task_id: str) -> Task | None:
        """Get task by ID"""
        conn = self._ensure_connection()
        cursor = conn.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), Task)
        return None

    def update(self, task: Task) -> Task:
        """Update an existing task"""
        conn = self._ensure_connection()
        data = self._model_to_dict(task)
        data["updated_at"] = datetime.utcnow().isoformat()

        set_clause = ", ".join([f"{key} = ?" for key in data.keys() if key != "task_id"])
        values = [value for key, value in data.items() if key != "task_id"]
        values.append(task.task_id)

        query = f"UPDATE tasks SET {set_clause} WHERE task_id = ?"
        conn.execute(query, values)
        conn.commit()

        return task

    def delete(self, task_id: str) -> bool:
        """Delete a task"""
        conn = self._ensure_connection()
        cursor = conn.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
        conn.commit()
        return cursor.rowcount > 0

    def list_tasks(
        self,
        filter_obj: TaskFilter | None = None,
        sort_obj: TaskSort | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> PaginatedResult:
        """List tasks with filtering, sorting, and pagination"""
        conn = self._ensure_connection()
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

            if filter_obj.parent_id:
                where_conditions.append("parent_id = ?")
                params.append(filter_obj.parent_id)

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

        # Get total count
        count_query = f"SELECT COUNT(*) FROM tasks {where_clause}"
        cursor = conn.execute(count_query, params)
        total = cursor.fetchone()[0]

        # Get paginated results
        query = f"SELECT * FROM tasks {where_clause} {order_clause} LIMIT ? OFFSET ?"
        cursor = conn.execute(query, params + [limit, offset])
        rows = cursor.fetchall()

        tasks = [self._dict_to_model(dict(row), Task) for row in rows]

        return PaginatedResult(items=tasks, total=total, limit=limit, offset=offset)

    def get_tasks_by_project(self, project_id: str) -> list[Task]:
        """Get all tasks for a project"""
        conn = self._ensure_connection()
        cursor = conn.execute(
            "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC", (project_id,)
        )
        rows = cursor.fetchall()
        return [self._dict_to_model(dict(row), Task) for row in rows]


class ProjectRepository(BaseRepository):
    """Repository for project operations"""

    def _create_tables(self) -> None:
        """Create projects table"""
        conn = self._ensure_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                project_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                owner_id TEXT,
                team_members TEXT DEFAULT '[]',
                is_active BOOLEAN DEFAULT 1,
                start_date TEXT,
                end_date TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                settings TEXT DEFAULT '{}',
                metadata TEXT DEFAULT '{}'
            )
        """)
        conn.commit()

    def create(self, project: Project) -> Project:
        """Create a new project"""
        conn = self._ensure_connection()
        data = self._model_to_dict(project)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO projects ({columns}) VALUES ({placeholders})"
        conn.execute(query, list(data.values()))
        conn.commit()

        return project

    def get_by_id(self, project_id: str) -> Project | None:
        """Get project by ID"""
        conn = self._ensure_connection()
        cursor = conn.execute(
            "SELECT * FROM projects WHERE project_id = ?", (project_id,)
        )
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), Project)
        return None

    def update(self, project: Project) -> Project:
        """Update an existing project"""
        conn = self._ensure_connection()
        data = self._model_to_dict(project)
        data["updated_at"] = datetime.utcnow().isoformat()

        set_clause = ", ".join([f"{key} = ?" for key in data.keys() if key != "project_id"])
        values = [value for key, value in data.items() if key != "project_id"]
        values.append(project.project_id)

        query = f"UPDATE projects SET {set_clause} WHERE project_id = ?"
        conn.execute(query, values)
        conn.commit()

        return project

    def delete(self, project_id: str) -> bool:
        """Delete a project"""
        conn = self._ensure_connection()
        cursor = conn.execute("DELETE FROM projects WHERE project_id = ?", (project_id,))
        conn.commit()
        return cursor.rowcount > 0

    def list_projects(self, limit: int = 50, offset: int = 0) -> PaginatedResult:
        """List projects with pagination"""
        conn = self._ensure_connection()
        # Get total count
        cursor = conn.execute("SELECT COUNT(*) FROM projects")
        total = cursor.fetchone()[0]

        # Get paginated results
        cursor = conn.execute(
            "SELECT * FROM projects ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, offset)
        )
        rows = cursor.fetchall()

        projects = [self._dict_to_model(dict(row), Project) for row in rows]

        return PaginatedResult(items=projects, total=total, limit=limit, offset=offset)


class TaskTemplateRepository(BaseRepository):
    """Repository for task template operations"""

    def _create_tables(self) -> None:
        """Create task_templates table"""
        conn = self._ensure_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS task_templates (
                template_id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT DEFAULT '',
                title_template TEXT NOT NULL,
                description_template TEXT NOT NULL,
                default_priority TEXT DEFAULT 'medium',
                default_estimated_hours TEXT,
                default_tags TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.commit()

    def create(self, template: TaskTemplate) -> TaskTemplate:
        """Create a new task template"""
        conn = self._ensure_connection()
        data = self._model_to_dict(template)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO task_templates ({columns}) VALUES ({placeholders})"
        conn.execute(query, list(data.values()))
        conn.commit()

        return template

    def get_by_id(self, template_id: str) -> TaskTemplate | None:
        """Get template by ID"""
        conn = self._ensure_connection()
        cursor = conn.execute(
            "SELECT * FROM task_templates WHERE template_id = ?", (template_id,)
        )
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), TaskTemplate)
        return None

    def get_by_name(self, name: str) -> TaskTemplate | None:
        """Get template by name"""
        conn = self._ensure_connection()
        cursor = conn.execute("SELECT * FROM task_templates WHERE name = ?", (name,))
        row = cursor.fetchone()

        if row:
            return self._dict_to_model(dict(row), TaskTemplate)
        return None

    def list_templates(self) -> list[TaskTemplate]:
        """List all templates"""
        conn = self._ensure_connection()
        cursor = conn.execute("SELECT * FROM task_templates ORDER BY name")
        rows = cursor.fetchall()
        return [self._dict_to_model(dict(row), TaskTemplate) for row in rows]


class TaskDependencyRepository(BaseRepository):
    """Repository for task dependency operations"""

    def _create_tables(self) -> None:
        """Create task_dependencies table"""
        conn = self._ensure_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS task_dependencies (
                dependency_id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                depends_on_task_id TEXT NOT NULL,
                dependency_type TEXT DEFAULT 'depends_on',
                created_at TEXT NOT NULL,
                created_by TEXT,
                UNIQUE(task_id, depends_on_task_id)
            )
        """)
        conn.commit()

    def create(self, dependency: TaskDependency) -> TaskDependency:
        """Create a new task dependency"""
        conn = self._ensure_connection()
        data = self._model_to_dict(dependency)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO task_dependencies ({columns}) VALUES ({placeholders})"
        conn.execute(query, list(data.values()))
        conn.commit()

        return dependency

    def get_task_dependencies(self, task_id: str) -> list[TaskDependency]:
        """Get all dependencies for a task"""
        conn = self._ensure_connection()
        cursor = conn.execute(
            "SELECT * FROM task_dependencies WHERE task_id = ?", (task_id,)
        )
        rows = cursor.fetchall()
        return [self._dict_to_model(dict(row), TaskDependency) for row in rows]

    def get_dependent_tasks(self, task_id: str) -> list[TaskDependency]:
        """Get all tasks that depend on the given task"""
        conn = self._ensure_connection()
        cursor = conn.execute(
            "SELECT * FROM task_dependencies WHERE depends_on_task_id = ?", (task_id,)
        )
        rows = cursor.fetchall()
        return [self._dict_to_model(dict(row), TaskDependency) for row in rows]

    def delete_dependency(self, task_id: str, depends_on_task_id: str) -> bool:
        """Delete a specific dependency"""
        conn = self._ensure_connection()
        cursor = conn.execute(
            "DELETE FROM task_dependencies WHERE task_id = ? AND depends_on_task_id = ?",
            (task_id, depends_on_task_id),
        )
        conn.commit()
        return cursor.rowcount > 0


class TaskCommentRepository(BaseRepository):
    """Repository for task comment operations"""

    def _create_tables(self) -> None:
        """Create task_comments table"""
        conn = self._ensure_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS task_comments (
                comment_id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                author_id TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT,
                is_edited BOOLEAN DEFAULT 0
            )
        """)
        conn.commit()

    def create(self, comment: TaskComment) -> TaskComment:
        """Create a new task comment"""
        conn = self._ensure_connection()
        data = self._model_to_dict(comment)
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data.keys()])

        query = f"INSERT INTO task_comments ({columns}) VALUES ({placeholders})"
        conn.execute(query, list(data.values()))
        conn.commit()

        return comment

    def get_task_comments(self, task_id: str) -> list[TaskComment]:
        """Get all comments for a task"""
        conn = self._ensure_connection()
        cursor = conn.execute(
            "SELECT * FROM task_comments WHERE task_id = ? ORDER BY created_at ASC", (task_id,)
        )
        rows = cursor.fetchall()
        return [self._dict_to_model(dict(row), TaskComment) for row in rows]

    def update(self, comment: TaskComment) -> TaskComment:
        """Update a comment"""
        conn = self._ensure_connection()
        data = self._model_to_dict(comment)

        set_clause = ", ".join([f"{key} = ?" for key in data.keys() if key != "comment_id"])
        values = [value for key, value in data.items() if key != "comment_id"]
        values.append(comment.comment_id)

        query = f"UPDATE task_comments SET {set_clause} WHERE comment_id = ?"
        conn.execute(query, values)
        conn.commit()

        return comment

    def delete(self, comment_id: str) -> bool:
        """Delete a comment"""
        conn = self._ensure_connection()
        cursor = conn.execute(
            "DELETE FROM task_comments WHERE comment_id = ?", (comment_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
