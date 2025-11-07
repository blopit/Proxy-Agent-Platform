"""
Repository layer for Task Templates Service (BE-01).

Handles database operations for task templates and template steps.
"""

from datetime import UTC, datetime
from uuid import uuid4

from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.services.templates.models import (
    TaskTemplate,
    TaskTemplateCreate,
    TaskTemplateUpdate,
    TemplateStep,
)


class TemplateRepository:
    """Repository for template-related database operations."""

    def __init__(self, db: EnhancedDatabaseAdapter):
        """
        Initialize template repository.

        Args:
            db: Database adapter instance
        """
        self.db = db

    # ========================================================================
    # Task Template Operations
    # ========================================================================

    def create_template_with_steps(self, template_data: TaskTemplateCreate) -> TaskTemplate:
        """
        Create a new template with its associated steps (transactional).

        Args:
            template_data: Template creation data with steps

        Returns:
            TaskTemplate: Created template with steps
        """
        template_id = str(uuid4())
        now = datetime.now(UTC)

        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            # Insert template
            cursor.execute(
                """
                INSERT INTO task_templates (
                    template_id, name, description, category, icon,
                    estimated_minutes, created_by, is_public, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    template_id,
                    template_data.name,
                    template_data.description,
                    template_data.category,
                    template_data.icon,
                    template_data.estimated_minutes,
                    template_data.created_by,
                    template_data.is_public,
                    now,
                    now,
                ),
            )

            # Insert steps
            for step_data in template_data.steps:
                step_id = str(uuid4())
                cursor.execute(
                    """
                    INSERT INTO template_steps (
                        step_id, template_id, step_order, description,
                        short_label, estimated_minutes, leaf_type, icon
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        step_id,
                        template_id,
                        step_data.step_order,
                        step_data.description,
                        step_data.short_label,
                        step_data.estimated_minutes,
                        step_data.leaf_type,
                        step_data.icon,
                    ),
                )

            conn.commit()

            # Fetch and return created template with steps
            return self.get_by_id(template_id)

        except Exception as e:
            conn.rollback()
            raise e

    def get_by_id(self, template_id: str) -> TaskTemplate | None:
        """
        Get a template by ID with its steps.

        Args:
            template_id: Template ID

        Returns:
            TaskTemplate or None if not found
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get template
        cursor.execute(
            """
            SELECT template_id, name, description, category, icon,
                   estimated_minutes, created_by, is_public, created_at, updated_at
            FROM task_templates
            WHERE template_id = ?
            """,
            (template_id,),
        )

        row = cursor.fetchone()
        if not row:
            return None

        template_dict = {
            "template_id": row[0],
            "name": row[1],
            "description": row[2],
            "category": row[3],
            "icon": row[4],
            "estimated_minutes": row[5],
            "created_by": row[6],
            "is_public": bool(row[7]),
            "created_at": row[8],
            "updated_at": row[9],
        }

        # Get steps
        cursor.execute(
            """
            SELECT step_id, template_id, step_order, description,
                   short_label, estimated_minutes, leaf_type, icon
            FROM template_steps
            WHERE template_id = ?
            ORDER BY step_order
            """,
            (template_id,),
        )

        steps = []
        for step_row in cursor.fetchall():
            steps.append(
                TemplateStep(
                    step_id=step_row[0],
                    template_id=step_row[1],
                    step_order=step_row[2],
                    description=step_row[3],
                    short_label=step_row[4],
                    estimated_minutes=step_row[5],
                    leaf_type=step_row[6],
                    icon=step_row[7],
                )
            )

        template_dict["steps"] = steps
        return TaskTemplate(**template_dict)

    def get_all_public(self) -> list[TaskTemplate]:
        """
        Get all public templates.

        Returns:
            List[TaskTemplate]: All public templates with steps
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT template_id
            FROM task_templates
            WHERE is_public = 1
            ORDER BY created_at DESC
            """
        )

        template_ids = [row[0] for row in cursor.fetchall()]
        return [self.get_by_id(tid) for tid in template_ids if self.get_by_id(tid)]

    def get_by_category(self, category: str) -> list[TaskTemplate]:
        """
        Get all public templates in a specific category.

        Args:
            category: Template category

        Returns:
            List[TaskTemplate]: Templates in the category
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT template_id
            FROM task_templates
            WHERE category = ? AND is_public = 1
            ORDER BY created_at DESC
            """,
            (category,),
        )

        template_ids = [row[0] for row in cursor.fetchall()]
        return [self.get_by_id(tid) for tid in template_ids if self.get_by_id(tid)]

    def update(self, template_id: str, update_data: TaskTemplateUpdate) -> TaskTemplate | None:
        """
        Update template metadata (not steps).

        Args:
            template_id: Template ID
            update_data: Fields to update

        Returns:
            TaskTemplate or None if not found
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Build dynamic update query
        updates = []
        values = []

        if update_data.name is not None:
            updates.append("name = ?")
            values.append(update_data.name)
        if update_data.description is not None:
            updates.append("description = ?")
            values.append(update_data.description)
        if update_data.category is not None:
            updates.append("category = ?")
            values.append(update_data.category)
        if update_data.icon is not None:
            updates.append("icon = ?")
            values.append(update_data.icon)

        if not updates:
            return self.get_by_id(template_id)

        updates.append("updated_at = ?")
        values.append(datetime.now(UTC))
        values.append(template_id)

        query = f"""
            UPDATE task_templates
            SET {", ".join(updates)}
            WHERE template_id = ?
        """

        cursor.execute(query, values)
        conn.commit()

        return self.get_by_id(template_id)

    def delete(self, template_id: str) -> bool:
        """
        Delete a template (cascade deletes steps).

        Args:
            template_id: Template ID

        Returns:
            bool: True if deleted, False if not found
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM task_templates WHERE template_id = ?", (template_id,))
        conn.commit()

        return cursor.rowcount > 0
