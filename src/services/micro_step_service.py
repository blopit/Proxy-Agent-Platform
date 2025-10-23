"""
MicroStep Service - Business logic for micro-step operations

Handles CRUD operations for micro-steps (2-5 minute task chunks)
Implements ADHD-friendly task breakdown with validation
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field

from src.database.enhanced_adapter import EnhancedDatabaseAdapter


class MicroStepServiceError(Exception):
    """Custom exception for micro-step service errors"""

    pass


class MicroStep(BaseModel):
    """MicroStep model matching database schema"""

    step_id: str
    parent_task_id: str
    description: str
    estimated_minutes: int
    leaf_type: Optional[str] = None  # "DIGITAL" or "HUMAN"
    delegation_mode: Optional[str] = None  # "DO", "DO_WITH_ME", "DELEGATE", "DELETE"
    automation_plan: Optional[dict] = None  # JSON automation details
    completed: bool = False
    completed_at: Optional[datetime] = None
    energy_level: Optional[int] = None  # 1-5 scale
    created_at: datetime = Field(default_factory=datetime.now)


@dataclass
class MicroStepCreateData:
    """Data class for creating micro-steps"""

    parent_task_id: str
    description: str
    estimated_minutes: int
    leaf_type: Optional[str] = None
    delegation_mode: Optional[str] = None
    automation_plan: Optional[dict] = None


@dataclass
class MicroStepUpdateData:
    """Data class for updating micro-steps"""

    description: Optional[str] = None
    estimated_minutes: Optional[int] = None
    leaf_type: Optional[str] = None
    delegation_mode: Optional[str] = None
    automation_plan: Optional[dict] = None
    completed: Optional[bool] = None
    completed_at: Optional[datetime] = None
    energy_level: Optional[int] = None


class MicroStepService:
    """Service for managing micro-steps (2-5 minute task chunks)"""

    def __init__(self, db: Optional[EnhancedDatabaseAdapter] = None):
        """
        Initialize MicroStepService

        Args:
            db: Database adapter instance (optional, will use singleton if not provided)
        """
        from src.database.enhanced_adapter import get_enhanced_database

        self.db = db or get_enhanced_database()

    def create_micro_step(self, data: MicroStepCreateData) -> MicroStep:
        """
        Create a new micro-step

        Args:
            data: Micro-step creation data

        Returns:
            MicroStep: Created micro-step

        Raises:
            MicroStepServiceError: If validation fails or parent task doesn't exist
        """
        # Validate parent task exists
        from src.repositories.enhanced_repositories import EnhancedTaskRepository

        task_repo = EnhancedTaskRepository(self.db)
        parent_task = task_repo.get_by_id(data.parent_task_id)

        if not parent_task:
            raise MicroStepServiceError(
                f"Parent task with ID {data.parent_task_id} not found"
            )

        # Validate estimated_minutes (ADHD-friendly: 2-5 minutes)
        if data.estimated_minutes < 2 or data.estimated_minutes > 5:
            raise MicroStepServiceError(
                f"Micro-steps must be 2-5 minutes (ADHD-friendly). Got: {data.estimated_minutes}"
            )

        # Validate leaf_type if provided
        if data.leaf_type and data.leaf_type not in ["DIGITAL", "HUMAN"]:
            raise MicroStepServiceError(
                f"leaf_type must be 'DIGITAL' or 'HUMAN'. Got: {data.leaf_type}"
            )

        # Create micro-step
        step_id = str(uuid4())

        # Insert into database
        import json

        conn = self.db.get_connection()
        cursor = conn.cursor()

        automation_plan_json = (
            json.dumps(data.automation_plan) if data.automation_plan else None
        )

        cursor.execute(
            """
            INSERT INTO micro_steps (
                step_id, parent_task_id, description, estimated_minutes,
                leaf_type, delegation_mode, automation_plan, completed
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        """,
            (
                step_id,
                data.parent_task_id,
                data.description,
                data.estimated_minutes,
                data.leaf_type,
                data.delegation_mode,
                automation_plan_json,
            ),
        )

        conn.commit()

        # Retrieve and return created micro-step
        return self.get_micro_step(step_id)

    def get_micro_step(self, step_id: str) -> Optional[MicroStep]:
        """
        Get a micro-step by ID

        Args:
            step_id: Micro-step ID

        Returns:
            MicroStep or None if not found
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT step_id, parent_task_id, description, estimated_minutes,
                   leaf_type, delegation_mode, automation_plan, completed,
                   completed_at, energy_level, created_at
            FROM micro_steps
            WHERE step_id = ?
        """,
            (step_id,),
        )

        row = cursor.fetchone()
        if not row:
            return None

        import json

        automation_plan = json.loads(row[6]) if row[6] else None

        return MicroStep(
            step_id=row[0],
            parent_task_id=row[1],
            description=row[2],
            estimated_minutes=row[3],
            leaf_type=row[4],
            delegation_mode=row[5],
            automation_plan=automation_plan,
            completed=bool(row[7]),
            completed_at=datetime.fromisoformat(row[8]) if row[8] else None,
            energy_level=row[9],
            created_at=datetime.fromisoformat(row[10]),
        )

    def get_micro_steps_by_task(self, parent_task_id: str) -> list[MicroStep]:
        """
        Get all micro-steps for a task

        Args:
            parent_task_id: Parent task ID

        Returns:
            List of micro-steps
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT step_id, parent_task_id, description, estimated_minutes,
                   leaf_type, delegation_mode, automation_plan, completed,
                   completed_at, energy_level, created_at
            FROM micro_steps
            WHERE parent_task_id = ?
            ORDER BY created_at ASC
        """,
            (parent_task_id,),
        )

        rows = cursor.fetchall()

        import json

        micro_steps = []
        for row in rows:
            automation_plan = json.loads(row[6]) if row[6] else None

            micro_step = MicroStep(
                step_id=row[0],
                parent_task_id=row[1],
                description=row[2],
                estimated_minutes=row[3],
                leaf_type=row[4],
                delegation_mode=row[5],
                automation_plan=automation_plan,
                completed=bool(row[7]),
                completed_at=datetime.fromisoformat(row[8]) if row[8] else None,
                energy_level=row[9],
                created_at=datetime.fromisoformat(row[10]),
            )
            micro_steps.append(micro_step)

        return micro_steps

    def get_incomplete_micro_steps(self, parent_task_id: str) -> list[MicroStep]:
        """
        Get all incomplete micro-steps for a task

        Args:
            parent_task_id: Parent task ID

        Returns:
            List of incomplete micro-steps
        """
        all_steps = self.get_micro_steps_by_task(parent_task_id)
        return [step for step in all_steps if not step.completed]

    def get_next_micro_step(self, parent_task_id: str) -> Optional[MicroStep]:
        """
        Get the next incomplete micro-step (for Hunter mode)

        Args:
            parent_task_id: Parent task ID

        Returns:
            Next incomplete micro-step or None
        """
        incomplete = self.get_incomplete_micro_steps(parent_task_id)
        return incomplete[0] if incomplete else None

    def update_micro_step(
        self, step_id: str, data: MicroStepUpdateData
    ) -> MicroStep:
        """
        Update a micro-step

        Args:
            step_id: Micro-step ID
            data: Update data

        Returns:
            Updated micro-step

        Raises:
            MicroStepServiceError: If micro-step not found
        """
        # Check if micro-step exists
        existing = self.get_micro_step(step_id)
        if not existing:
            raise MicroStepServiceError(f"Micro-step with ID {step_id} not found")

        # Build update query dynamically
        updates = []
        params = []

        if data.description is not None:
            updates.append("description = ?")
            params.append(data.description)

        if data.estimated_minutes is not None:
            updates.append("estimated_minutes = ?")
            params.append(data.estimated_minutes)

        if data.leaf_type is not None:
            updates.append("leaf_type = ?")
            params.append(data.leaf_type)

        if data.delegation_mode is not None:
            updates.append("delegation_mode = ?")
            params.append(data.delegation_mode)

        if data.automation_plan is not None:
            import json

            updates.append("automation_plan = ?")
            params.append(json.dumps(data.automation_plan))

        if data.completed is not None:
            updates.append("completed = ?")
            params.append(1 if data.completed else 0)

            # Auto-set completed_at if marking as completed
            if data.completed and data.completed_at is None:
                updates.append("completed_at = ?")
                params.append(datetime.now().isoformat())

        if data.completed_at is not None:
            updates.append("completed_at = ?")
            params.append(data.completed_at.isoformat())

        if data.energy_level is not None:
            updates.append("energy_level = ?")
            params.append(data.energy_level)

        if not updates:
            # No updates, just return existing
            return existing

        params.append(step_id)

        conn = self.db.get_connection()
        cursor = conn.cursor()

        query = f"UPDATE micro_steps SET {', '.join(updates)} WHERE step_id = ?"
        cursor.execute(query, params)
        conn.commit()

        # Return updated micro-step
        return self.get_micro_step(step_id)

    def delete_micro_step(self, step_id: str) -> bool:
        """
        Delete a micro-step

        Args:
            step_id: Micro-step ID

        Returns:
            True if deleted, False if not found
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM micro_steps WHERE step_id = ?", (step_id,))
        conn.commit()

        return cursor.rowcount > 0

    def get_completion_percentage(self, parent_task_id: str) -> float:
        """
        Calculate completion percentage for a task's micro-steps

        Args:
            parent_task_id: Parent task ID

        Returns:
            Completion percentage (0.0-100.0)
        """
        all_steps = self.get_micro_steps_by_task(parent_task_id)
        if not all_steps:
            return 0.0

        completed = sum(1 for step in all_steps if step.completed)
        return (completed / len(all_steps)) * 100.0

    def get_total_estimated_minutes(self, parent_task_id: str) -> int:
        """
        Calculate total estimated time for all micro-steps

        Args:
            parent_task_id: Parent task ID

        Returns:
            Total estimated minutes
        """
        all_steps = self.get_micro_steps_by_task(parent_task_id)
        return sum(step.estimated_minutes for step in all_steps)

    def get_completion_stats(self, parent_task_id: str) -> dict:
        """
        Get comprehensive completion statistics

        Args:
            parent_task_id: Parent task ID

        Returns:
            Dict with completion stats
        """
        all_steps = self.get_micro_steps_by_task(parent_task_id)
        completed = sum(1 for step in all_steps if step.completed)
        incomplete = len(all_steps) - completed

        return {
            "total": len(all_steps),
            "completed": completed,
            "incomplete": incomplete,
            "completion_percentage": self.get_completion_percentage(parent_task_id),
        }
