"""
ChatGPT Task List Import Service.

Parses task lists from ChatGPT (either structured text or JSON)
and imports them into our task management system.
"""

import json
import re
from datetime import datetime
from typing import Any
from uuid import uuid4

from src.services.chatgpt_prompts.models import (
    ImportedSubtask,
    TaskImportResult,
    TaskListImportRequest,
)


class TaskImportService:
    """Service for importing task lists from ChatGPT responses."""

    def __init__(self):
        """Initialize the import service."""
        self._tasks_db: dict[str, dict[str, Any]] = {}  # In-memory for testing

    def import_task_list(self, request: TaskListImportRequest) -> TaskImportResult:
        """
        Import a task list from ChatGPT response.

        Creates a parent task and all subtasks in the database.

        Args:
            request: Import request with parent context and subtasks

        Returns:
            TaskImportResult: Result with created task IDs

        Raises:
            ValueError: If import fails
        """
        try:
            # Create parent task
            parent_task_id = self._create_parent_task(
                title=request.parent_task_context,
                delegation_mode=request.delegation_mode,
                capture_type=request.capture_type,
                project_id=request.project_id,
            )

            # Create all subtasks
            task_ids = []
            for subtask in request.subtasks:
                task_id = self._create_subtask(
                    parent_task_id=parent_task_id,
                    subtask=subtask,
                    delegation_mode=request.delegation_mode,
                    project_id=request.project_id,
                )
                task_ids.append(task_id)

            return TaskImportResult(
                success=True,
                parent_task_id=parent_task_id,
                parent_task_title=request.parent_task_context,
                imported_task_count=len(task_ids),
                task_ids=task_ids,
                created_at=datetime.utcnow(),
                message=f"Successfully imported {len(task_ids)} tasks",
            )

        except Exception as e:
            return TaskImportResult(
                success=False,
                parent_task_id="",
                parent_task_title=request.parent_task_context,
                imported_task_count=0,
                task_ids=[],
                created_at=datetime.utcnow(),
                message=f"Import failed: {str(e)}",
            )

    def parse_chatgpt_response(self, raw_response: str) -> TaskListImportRequest:
        """
        Parse ChatGPT response into structured task list.

        Handles both structured text format and JSON format.

        Args:
            raw_response: Raw text from ChatGPT

        Returns:
            TaskListImportRequest: Parsed task list

        Raises:
            ValueError: If parsing fails
        """
        # Try JSON first (if user is technical)
        try:
            return self._parse_json_format(raw_response)
        except (json.JSONDecodeError, KeyError):
            pass

        # Try structured text format (our recommended format)
        try:
            return self._parse_text_format(raw_response)
        except Exception as e:
            raise ValueError(
                f"Could not parse ChatGPT response. Expected structured format. Error: {e}"
            )

    def _parse_json_format(self, raw_response: str) -> TaskListImportRequest:
        """Parse JSON format response."""
        data = json.loads(raw_response)

        subtasks = [
            ImportedSubtask(
                title=st["title"],
                description=st["description"],
                estimated_hours=st.get("estimated_hours"),
                priority=st.get("priority", "medium"),
                tags=st.get("tags", []),
            )
            for st in data["subtasks"]
        ]

        return TaskListImportRequest(
            parent_task_context=data["parent_task_context"],
            subtasks=subtasks,
            delegation_mode=data.get("delegation_mode", "human"),
            capture_type=data.get("capture_type", "video"),
            project_id=data.get("project_id"),
        )

    def _parse_text_format(self, raw_response: str) -> TaskListImportRequest:
        """
        Parse structured text format response.

        Expected format:
        **Task Breakdown for: [Context]**

        1. **[Title]**
           - What to do: [Description]
           - Time estimate: [Hours/minutes]
           - Priority: [Level]
        """
        lines = raw_response.strip().split("\n")

        # Extract parent task context from header
        parent_context = None
        for line in lines[:5]:  # Check first few lines
            if "Task Breakdown for:" in line:
                parent_context = re.search(r"Task Breakdown for:\s*(.+?)(?:\*\*)?$", line)
                if parent_context:
                    parent_context = parent_context.group(1).strip()
                    break

        if not parent_context:
            raise ValueError("Could not find 'Task Breakdown for:' header")

        # Parse individual tasks
        subtasks = []
        current_task = {}
        in_task = False

        for line in lines:
            line = line.strip()

            # Detect task number pattern: "1. **Title**" or "1. Title"
            task_match = re.match(r"^\d+\.\s+\*\*(.+?)\*\*$", line)
            if not task_match:
                task_match = re.match(r"^\d+\.\s+(.+)$", line)

            if task_match:
                # Save previous task if exists
                if current_task and current_task.get("title"):
                    subtasks.append(self._create_imported_subtask(current_task))

                # Start new task
                current_task = {"title": task_match.group(1).strip()}
                in_task = True
                continue

            if in_task and line:
                # Parse task details
                if line.startswith("- What to do:") or line.startswith("What to do:"):
                    desc = re.sub(r"^-?\s*What to do:\s*", "", line)
                    current_task["description"] = desc
                elif line.startswith("- Time estimate:") or line.startswith("Time estimate:"):
                    time_str = re.sub(r"^-?\s*Time estimate:\s*", "", line)
                    current_task["estimated_hours"] = self._parse_time_estimate(time_str)
                elif line.startswith("- Priority:") or line.startswith("Priority:"):
                    priority = re.sub(r"^-?\s*Priority:\s*", "", line)
                    current_task["priority"] = priority.strip().lower()

        # Add last task
        if current_task and current_task.get("title"):
            subtasks.append(self._create_imported_subtask(current_task))

        if not subtasks:
            raise ValueError("No tasks found in response")

        return TaskListImportRequest(
            parent_task_context=parent_context,
            subtasks=subtasks,
            delegation_mode="human",
            capture_type="video",
        )

    def _create_imported_subtask(self, task_dict: dict) -> ImportedSubtask:
        """Create ImportedSubtask from parsed dictionary."""
        return ImportedSubtask(
            title=task_dict.get("title", "Untitled Task"),
            description=task_dict.get("description", "No description provided"),
            estimated_hours=task_dict.get("estimated_hours"),
            priority=task_dict.get("priority", "medium"),
            tags=task_dict.get("tags", []),
        )

    def _parse_time_estimate(self, time_str: str) -> float | None:
        """
        Parse time estimate from various formats.

        Examples: "30 minutes", "1.5 hours", "2 hrs", "45 min"
        """
        time_str = time_str.lower().strip()

        # Try to extract number
        number_match = re.search(r"(\d+(?:\.\d+)?)", time_str)
        if not number_match:
            return None

        value = float(number_match.group(1))

        # Check if it's minutes
        if "min" in time_str and "hour" not in time_str:
            return round(value / 60, 2)  # Convert to hours

        # Otherwise assume hours
        return value

    def _create_parent_task(
        self,
        title: str,
        delegation_mode: str,
        capture_type: str,
        project_id: str | None,
    ) -> str:
        """Create parent task in database."""
        task_id = str(uuid4())
        self._tasks_db[task_id] = {
            "task_id": task_id,
            "title": title,
            "description": f"Parent task for: {title}",
            "status": "pending",
            "priority": "medium",
            "delegation_mode": delegation_mode,
            "capture_type": capture_type,
            "project_id": project_id,
            "parent_task_id": None,
            "created_at": datetime.utcnow().isoformat(),
            "tags": "",
        }
        return task_id

    def _create_subtask(
        self,
        parent_task_id: str,
        subtask: ImportedSubtask,
        delegation_mode: str,
        project_id: str | None,
    ) -> str:
        """Create subtask in database."""
        task_id = str(uuid4())
        self._tasks_db[task_id] = {
            "task_id": task_id,
            "title": subtask.title,
            "description": subtask.description,
            "status": "pending",
            "priority": subtask.priority or "medium",
            "delegation_mode": delegation_mode,
            "estimated_hours": subtask.estimated_hours,
            "parent_task_id": parent_task_id,
            "project_id": project_id,
            "created_at": datetime.utcnow().isoformat(),
            "tags": ",".join(subtask.tags) if subtask.tags else "",
        }
        return task_id

    def get_task_by_id(self, task_id: str) -> dict[str, Any] | None:
        """Get task by ID (for testing)."""
        return self._tasks_db.get(task_id)
