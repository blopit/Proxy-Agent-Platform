"""
Repository layer for Task Delegation System (BE-00).

Handles database operations for task assignments and agent capabilities.
"""

import json
from datetime import datetime
from uuid import uuid4

from src.database.enhanced_adapter import EnhancedDatabaseAdapter


class DelegationRepository:
    """Repository for delegation-related database operations."""

    def __init__(self, db: EnhancedDatabaseAdapter):
        """
        Initialize delegation repository.

        Args:
            db: Database adapter instance
        """
        self.db = db

    # ========================================================================
    # Task Assignment Operations
    # ========================================================================

    def create_assignment(
        self,
        task_id: str,
        assignee_id: str,
        assignee_type: str,
        estimated_hours: float | None = None,
    ) -> dict:
        """
        Create a new task assignment.

        Args:
            task_id: ID of the task to assign
            assignee_id: ID of the assignee (human or agent)
            assignee_type: Type of assignee ('human' or 'agent')
            estimated_hours: Estimated hours to complete

        Returns:
            dict: Created assignment data
        """
        assignment_id = str(uuid4())
        assigned_at = datetime.utcnow()

        query = """
            INSERT INTO task_assignments (
                assignment_id, task_id, assignee_id, assignee_type,
                status, assigned_at, estimated_hours
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            query,
            (
                assignment_id,
                task_id,
                assignee_id,
                assignee_type,
                "pending",
                assigned_at,
                estimated_hours,
            ),
        )
        conn.commit()

        return {
            "assignment_id": assignment_id,
            "task_id": task_id,
            "assignee_id": assignee_id,
            "assignee_type": assignee_type,
            "status": "pending",
            "assigned_at": assigned_at.isoformat(),
            "accepted_at": None,
            "completed_at": None,
            "estimated_hours": estimated_hours,
            "actual_hours": None,
        }

    def get_assignments_by_agent(self, agent_id: str, status: str | None = None) -> list[dict]:
        """
        Get all assignments for a specific assignee (agent or human).

        Args:
            agent_id: ID of the assignee (agent or human)
            status: Optional status filter ('pending', 'in_progress', 'completed')

        Returns:
            List[dict]: List of assignments
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        if status:
            query = """
                SELECT * FROM task_assignments
                WHERE assignee_id = ?
                  AND status = ?
                ORDER BY assigned_at DESC
            """
            cursor.execute(query, (agent_id, status))
        else:
            query = """
                SELECT * FROM task_assignments
                WHERE assignee_id = ?
                ORDER BY assigned_at DESC
            """
            cursor.execute(query, (agent_id,))

        rows = cursor.fetchall()
        return [self._row_to_dict(row) for row in rows]

    def get_assignment_by_id(self, assignment_id: str) -> dict | None:
        """
        Get a specific assignment by ID.

        Args:
            assignment_id: ID of the assignment

        Returns:
            Optional[dict]: Assignment data or None if not found
        """
        query = """
            SELECT * FROM task_assignments
            WHERE assignment_id = ?
        """

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, (assignment_id,))
        row = cursor.fetchone()

        return self._row_to_dict(row) if row else None

    def accept_assignment(self, assignment_id: str) -> dict | None:
        """
        Accept a pending assignment.

        Args:
            assignment_id: ID of the assignment to accept

        Returns:
            Optional[dict]: Updated assignment data or None if not found/invalid

        Raises:
            ValueError: If assignment is not in pending status
        """
        # Get current assignment
        assignment = self.get_assignment_by_id(assignment_id)
        if not assignment:
            return None

        if assignment["status"] != "pending":
            raise ValueError("Assignment already accepted or completed")

        accepted_at = datetime.utcnow()

        query = """
            UPDATE task_assignments
            SET status = 'in_progress',
                accepted_at = ?
            WHERE assignment_id = ?
        """

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, (accepted_at, assignment_id))
        conn.commit()

        # Return updated assignment
        assignment["status"] = "in_progress"
        assignment["accepted_at"] = accepted_at.isoformat()
        return assignment

    def complete_assignment(
        self, assignment_id: str, actual_hours: float | None = None
    ) -> dict | None:
        """
        Complete an in-progress assignment.

        Args:
            assignment_id: ID of the assignment to complete
            actual_hours: Actual hours spent on the task

        Returns:
            Optional[dict]: Updated assignment data or None if not found/invalid

        Raises:
            ValueError: If assignment is not in in_progress status
        """
        # Get current assignment
        assignment = self.get_assignment_by_id(assignment_id)
        if not assignment:
            return None

        if assignment["status"] != "in_progress":
            raise ValueError("Assignment must be accepted before completing")

        completed_at = datetime.utcnow()

        query = """
            UPDATE task_assignments
            SET status = 'completed',
                completed_at = ?,
                actual_hours = ?
            WHERE assignment_id = ?
        """

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, (completed_at, actual_hours, assignment_id))
        conn.commit()

        # Return updated assignment
        assignment["status"] = "completed"
        assignment["completed_at"] = completed_at.isoformat()
        assignment["actual_hours"] = actual_hours
        return assignment

    # ========================================================================
    # Agent Capability Operations
    # ========================================================================

    def register_agent(
        self,
        agent_id: str,
        agent_name: str,
        agent_type: str,
        skills: list[str],
        max_concurrent_tasks: int = 1,
    ) -> dict:
        """
        Register a new agent capability.

        Args:
            agent_id: Unique agent identifier
            agent_name: Human-readable agent name
            agent_type: Type of agent ('backend', 'frontend', 'general')
            skills: List of agent skills
            max_concurrent_tasks: Maximum concurrent tasks

        Returns:
            dict: Created agent capability data
        """
        capability_id = str(uuid4())
        created_at = datetime.utcnow()
        skills_json = json.dumps(skills)

        query = """
            INSERT INTO agent_capabilities (
                capability_id, agent_id, agent_name, agent_type,
                skills, max_concurrent_tasks, current_task_count,
                is_available, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            query,
            (
                capability_id,
                agent_id,
                agent_name,
                agent_type,
                skills_json,
                max_concurrent_tasks,
                0,  # current_task_count
                True,  # is_available
                created_at,
                created_at,  # updated_at
            ),
        )
        conn.commit()

        return {
            "capability_id": capability_id,
            "agent_id": agent_id,
            "agent_name": agent_name,
            "agent_type": agent_type,
            "skills": skills,
            "max_concurrent_tasks": max_concurrent_tasks,
            "current_task_count": 0,
            "is_available": True,
            "created_at": created_at.isoformat(),
            "updated_at": created_at.isoformat(),
        }

    def get_agents(self, agent_type: str | None = None, available_only: bool = False) -> list[dict]:
        """
        Get agents with optional filtering.

        Args:
            agent_type: Optional filter by agent type
            available_only: Filter to only available agents

        Returns:
            List[dict]: List of agent capabilities
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        conditions = []
        params = []

        if agent_type:
            conditions.append("agent_type = ?")
            params.append(agent_type)

        if available_only:
            conditions.append("is_available = 1")

        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)

        query = f"""
            SELECT * FROM agent_capabilities
            {where_clause}
            ORDER BY created_at DESC
        """

        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [self._row_to_agent_dict(row) for row in rows]

    # ========================================================================
    # Helper Methods
    # ========================================================================

    def _row_to_dict(self, row) -> dict:
        """Convert SQLite row to dict for task assignment."""
        return {
            "assignment_id": row["assignment_id"],
            "task_id": row["task_id"],
            "assignee_id": row["assignee_id"],
            "assignee_type": row["assignee_type"],
            "status": row["status"],
            "assigned_at": row["assigned_at"],
            "accepted_at": row["accepted_at"],
            "completed_at": row["completed_at"],
            "estimated_hours": row["estimated_hours"],
            "actual_hours": row["actual_hours"],
        }

    def _row_to_agent_dict(self, row) -> dict:
        """Convert SQLite row to dict for agent capability."""
        return {
            "capability_id": row["capability_id"],
            "agent_id": row["agent_id"],
            "agent_name": row["agent_name"],
            "agent_type": row["agent_type"],
            "skills": json.loads(row["skills"]),
            "max_concurrent_tasks": row["max_concurrent_tasks"],
            "current_task_count": row["current_task_count"],
            "is_available": bool(row["is_available"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
