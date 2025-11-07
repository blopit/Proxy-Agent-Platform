"""
MicroStep Service - Business logic for micro-step operations

Handles CRUD operations for micro-steps (2-5 minute task chunks)
Implements ADHD-friendly task breakdown with validation
"""

import logging
from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, Field

from src.database.enhanced_adapter import EnhancedDatabaseAdapter

logger = logging.getLogger(__name__)


class MicroStepServiceError(Exception):
    """Custom exception for micro-step service errors"""

    pass


class MicroStep(BaseModel):
    """MicroStep model matching database schema with hierarchical support"""

    step_id: str
    parent_task_id: str
    description: str
    estimated_minutes: int
    leaf_type: str | None = None  # "DIGITAL" or "HUMAN"
    delegation_mode: str | None = None  # "DO", "DO_WITH_ME", "DELEGATE", "DELETE"
    automation_plan: dict | None = None  # JSON automation details
    tags: list[str] | None = None  # CHAMPS-based tags
    completed: bool = False
    completed_at: datetime | None = None
    energy_level: int | None = None  # 1-5 scale
    created_at: datetime = Field(default_factory=datetime.now)

    # Hierarchical structure fields
    parent_step_id: str | None = None  # Parent micro-step ID
    level: int = 0  # Depth in tree
    is_leaf: bool = True  # Can be decomposed?
    decomposition_state: str = "atomic"  # stub, decomposing, decomposed, atomic
    short_label: str | None = None  # 1-2 word label
    icon: str | None = None  # Emoji icon


@dataclass
class MicroStepCreateData:
    """Data class for creating micro-steps"""

    parent_task_id: str
    description: str
    estimated_minutes: int
    step_number: int = 1  # Required by database schema
    leaf_type: str | None = None
    delegation_mode: str | None = None
    automation_plan: dict | None = None
    tags: list[str] | None = None

    # Hierarchical fields
    parent_step_id: str | None = None
    level: int = 0
    is_leaf: bool = True
    decomposition_state: str = "atomic"
    short_label: str | None = None
    icon: str | None = None


@dataclass
class MicroStepUpdateData:
    """Data class for updating micro-steps"""

    description: str | None = None
    estimated_minutes: int | None = None
    leaf_type: str | None = None
    delegation_mode: str | None = None
    automation_plan: dict | None = None
    completed: bool | None = None
    completed_at: datetime | None = None
    energy_level: int | None = None


class MicroStepService:
    """Service for managing micro-steps (2-5 minute task chunks)"""

    def __init__(self, db: EnhancedDatabaseAdapter | None = None):
        """
        Initialize MicroStepService

        Args:
            db: Database adapter instance (optional, will use singleton if not provided)
        """
        from src.database.enhanced_adapter import get_enhanced_database

        self.db = db or get_enhanced_database()
        self.champs_service = None

    def _get_champs_service(self):
        """Lazy load CHAMPS service"""
        if self.champs_service is None:
            from src.services.champs_tag_service import CHAMPSTagService

            self.champs_service = CHAMPSTagService()
        return self.champs_service

    async def generate_champs_tags(
        self, description: str, estimated_minutes: int, leaf_type: str = "HUMAN"
    ) -> list[str]:
        """
        Generate CHAMPS-based tags for a micro-step using LLM

        Args:
            description: Step description
            estimated_minutes: Estimated duration
            leaf_type: "DIGITAL" or "HUMAN"

        Returns:
            List of CHAMPS tags
        """
        try:
            champs_service = self._get_champs_service()
            result = await champs_service.generate_tags(description, estimated_minutes, leaf_type)
            return result.tags.get_all_tags()
        except Exception as e:
            logger.error(f"Error generating CHAMPS tags: {e}")
            # Return basic fallback tags
            return ["🎯 Focused", "⚡ Quick Win"]

    async def create_micro_step(self, data: MicroStepCreateData) -> MicroStep:
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
            raise MicroStepServiceError(f"Parent task with ID {data.parent_task_id} not found")

        # Validate estimated_minutes (ADHD-friendly: 2-5 minutes required)
        if data.estimated_minutes < 2:
            raise MicroStepServiceError(
                f"Micro-steps must be 2-5 minutes for ADHD-friendly task management. Got: {data.estimated_minutes} minute(s)"
            )

        if data.estimated_minutes > 5:
            raise MicroStepServiceError(
                f"Micro-steps must be 2-5 minutes for ADHD-friendly task management. Got: {data.estimated_minutes} minutes"
            )

        # Validate and normalize leaf_type if provided (case-insensitive)
        if data.leaf_type:
            normalized_type = data.leaf_type.upper()
            if normalized_type not in ["DIGITAL", "HUMAN"]:
                raise MicroStepServiceError(
                    f"leaf_type must be 'DIGITAL' or 'HUMAN' (case-insensitive). Got: {data.leaf_type}"
                )
            # Normalize to uppercase for storage
            data.leaf_type = normalized_type

        # Generate CHAMPS tags if not provided
        tags = data.tags
        if not tags:
            tags = await self.generate_champs_tags(
                data.description, data.estimated_minutes, data.leaf_type or "HUMAN"
            )

        # Create micro-step
        step_id = str(uuid4())

        # Insert into database
        import json

        conn = self.db.get_connection()
        cursor = conn.cursor()

        automation_plan_json = json.dumps(data.automation_plan) if data.automation_plan else None

        tags_json = json.dumps(tags) if tags else None

        # Insert into database with actual schema columns
        cursor.execute(
            """
            INSERT INTO micro_steps (
                step_id, parent_task_id, step_number, description, estimated_minutes,
                delegation_mode, status, actual_minutes, parent_step_id, level, is_leaf,
                decomposition_state, short_label, icon, leaf_type, automation_plan,
                completed, completed_at, energy_level
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                step_id,
                data.parent_task_id,
                data.step_number,
                data.description,
                data.estimated_minutes,
                data.delegation_mode or "do",
                "todo",  # Default status
                0,  # Default actual_minutes
                data.parent_step_id,
                data.level,
                1 if data.is_leaf else 0,
                data.decomposition_state,
                data.short_label,
                data.icon,
                data.leaf_type,
                automation_plan_json,
                0,  # Default completed = False
                None,  # Default completed_at = None
                None,  # Default energy_level = None
            ),
        )

        conn.commit()

        # Retrieve and return created micro-step
        return self.get_micro_step(step_id)

    def get_micro_step(self, step_id: str) -> MicroStep | None:
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
            SELECT step_id, parent_task_id, step_number, description, estimated_minutes,
                   delegation_mode, status, actual_minutes, created_at, completed_at,
                   parent_step_id, level, is_leaf, decomposition_state, short_label, icon,
                   leaf_type, automation_plan, completed, energy_level
            FROM micro_steps
            WHERE step_id = ?
        """,
            (step_id,),
        )

        row = cursor.fetchone()
        if not row:
            return None

        import json

        return MicroStep(
            step_id=row[0],
            parent_task_id=row[1],
            description=row[3],
            estimated_minutes=row[4],
            leaf_type=row[16],
            delegation_mode=row[5],
            automation_plan=json.loads(row[17]) if row[17] else None,
            tags=None,  # Tags not stored in micro_steps yet
            completed=bool(row[18]) if row[18] is not None else False,
            completed_at=datetime.fromisoformat(row[9]) if row[9] else None,
            energy_level=row[19],
            created_at=datetime.fromisoformat(row[8]),
            parent_step_id=row[10],
            level=row[11] if row[11] is not None else 0,
            is_leaf=bool(row[12]) if row[12] is not None else True,
            decomposition_state=row[13] if row[13] else "atomic",
            short_label=row[14],
            icon=row[15],
        )

    def get_micro_steps_by_task(self, parent_task_id: str) -> list[MicroStep]:
        """
        Get all top-level micro-steps for a task (excludes nested children)

        Args:
            parent_task_id: Parent task ID

        Returns:
            List of top-level micro-steps (parent_step_id IS NULL)
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT step_id, parent_task_id, step_number, description, estimated_minutes,
                   delegation_mode, status, actual_minutes, created_at, completed_at,
                   parent_step_id, level, is_leaf, decomposition_state, short_label, icon
            FROM micro_steps
            WHERE parent_task_id = ? AND parent_step_id IS NULL
            ORDER BY step_number ASC
        """,
            (parent_task_id,),
        )

        rows = cursor.fetchall()

        micro_steps = []
        for row in rows:
            micro_step = MicroStep(
                step_id=row[0],
                parent_task_id=row[1],
                description=row[3],
                estimated_minutes=row[4],
                leaf_type=None,  # Not in schema
                delegation_mode=row[5],
                automation_plan=None,  # Not in schema
                tags=None,  # Not in schema
                completed=(row[6] == "done"),  # Map status to completed
                completed_at=datetime.fromisoformat(row[9]) if row[9] else None,
                energy_level=None,  # Not in schema
                created_at=datetime.fromisoformat(row[8]),
                parent_step_id=row[10],
                level=row[11] if row[11] is not None else 0,
                is_leaf=bool(row[12]) if row[12] is not None else True,
                decomposition_state=row[13] if row[13] else "atomic",
                short_label=row[14],
                icon=row[15],
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

    def get_next_micro_step(self, parent_task_id: str) -> MicroStep | None:
        """
        Get the next incomplete micro-step (for Hunter mode)

        Args:
            parent_task_id: Parent task ID

        Returns:
            Next incomplete micro-step or None
        """
        incomplete = self.get_incomplete_micro_steps(parent_task_id)
        return incomplete[0] if incomplete else None

    def update_micro_step(self, step_id: str, data: MicroStepUpdateData) -> MicroStep:
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
            updates.append("status = ?")
            params.append("done" if data.completed else "todo")

            # Also update the completed column
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

    # ========================================================================
    # Hierarchical Methods
    # ========================================================================

    def get_children(self, parent_step_id: str) -> list[MicroStep]:
        """
        Get all child micro-steps for a parent step

        Args:
            parent_step_id: Parent step ID

        Returns:
            List of child micro-steps ordered by step_number
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT step_id, parent_task_id, step_number, description, estimated_minutes,
                   delegation_mode, status, actual_minutes, created_at, completed_at,
                   parent_step_id, level, is_leaf, decomposition_state, short_label, icon
            FROM micro_steps
            WHERE parent_step_id = ?
            ORDER BY step_number ASC
        """,
            (parent_step_id,),
        )

        rows = cursor.fetchall()

        children = []
        for row in rows:
            child = MicroStep(
                step_id=row[0],
                parent_task_id=row[1],
                description=row[3],
                estimated_minutes=row[4],
                leaf_type=None,  # Not in schema
                delegation_mode=row[5],
                automation_plan=None,  # Not in schema
                tags=None,  # Not in schema
                completed=(row[6] == "done"),  # Map status to completed
                completed_at=datetime.fromisoformat(row[9]) if row[9] else None,
                energy_level=None,  # Not in schema
                created_at=datetime.fromisoformat(row[8]),
                parent_step_id=row[10],
                level=row[11],
                is_leaf=bool(row[12]),
                decomposition_state=row[13],
                short_label=row[14],
                icon=row[15],
            )
            children.append(child)

        return children

    async def decompose_step(self, step_id: str, user_id: str) -> dict:
        """
        Decompose a micro-step into smaller child steps using AI

        Args:
            step_id: Step ID to decompose
            user_id: User ID for context

        Returns:
            Dict with children array and metadata

        Raises:
            MicroStepServiceError: If step not found or can't be decomposed
        """
        # Get the step
        step = self.get_micro_step(step_id)
        if not step:
            raise MicroStepServiceError(f"Micro-step with ID {step_id} not found")

        # Check if step can be decomposed
        if step.is_leaf or step.decomposition_state == "atomic":
            raise MicroStepServiceError(
                f"Step cannot be decomposed (is_leaf={step.is_leaf}, state={step.decomposition_state})"
            )

        # Update step state to "decomposing"
        self.update_micro_step(
            step_id,
            MicroStepUpdateData(
                description=step.description,
                estimated_minutes=step.estimated_minutes,
                delegation_mode=step.delegation_mode,
            ),
        )

        # Set decomposition state manually in database
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE micro_steps SET decomposition_state = ? WHERE step_id = ?",
            ("decomposing", step_id),
        )
        conn.commit()

        # Use DecomposerAgent to break down the step
        from src.agents.decomposer_agent import DecomposerAgent
        from src.core.task_models import Task

        # Convert MicroStep to Task for decomposition
        task = Task(
            title=step.description,
            description=step.description,
            project_id=step.parent_task_id,  # Use parent task as project
            estimated_hours=step.estimated_minutes / 60.0,
        )

        decomposer = DecomposerAgent()
        result = await decomposer.decompose_task(task, user_id, depth=step.level)

        # Save children to database
        from src.core.task_models import MicroStep as CoreMicroStep

        children_ids = []
        for i, child_step in enumerate(result.get("micro_steps", []), 1):
            # Convert core MicroStep to service MicroStep
            if isinstance(child_step, CoreMicroStep):
                child_data = MicroStepCreateData(
                    parent_task_id=step.parent_task_id,
                    description=child_step.description,
                    estimated_minutes=child_step.estimated_minutes,
                    leaf_type=child_step.leaf_type.value
                    if hasattr(child_step.leaf_type, "value")
                    else child_step.leaf_type,
                    delegation_mode=child_step.delegation_mode.value
                    if hasattr(child_step.delegation_mode, "value")
                    else child_step.delegation_mode,
                    automation_plan=child_step.automation_plan.model_dump()
                    if child_step.automation_plan
                    else None,
                    tags=child_step.tags,
                    parent_step_id=step_id,  # Set parent to current step
                    level=step.level + 1,
                    is_leaf=child_step.is_leaf
                    if hasattr(child_step, "is_leaf")
                    else (child_step.estimated_minutes <= 5),
                    decomposition_state=child_step.decomposition_state.value
                    if hasattr(child_step, "decomposition_state")
                    else "atomic",
                    short_label=child_step.short_label,
                    icon=child_step.icon,
                )

                created_child = await self.create_micro_step(child_data)
                children_ids.append(created_child.step_id)

        # Update parent step state to "decomposed"
        cursor.execute(
            "UPDATE micro_steps SET decomposition_state = ? WHERE step_id = ?",
            ("decomposed", step_id),
        )
        conn.commit()

        # Return children
        children = self.get_children(step_id)

        return {
            "step_id": step_id,
            "children": [child.__dict__ for child in children],
            "total_children": len(children),
            "message": f"Step decomposed into {len(children)} child steps",
        }

    def can_be_decomposed(self, step: MicroStep) -> bool:
        """
        Check if a micro-step can be decomposed

        Args:
            step: MicroStep to check

        Returns:
            True if step can be decomposed
        """
        return (
            not step.is_leaf
            and step.estimated_minutes > 5
            and step.decomposition_state in ["stub", "decomposing"]
        )
