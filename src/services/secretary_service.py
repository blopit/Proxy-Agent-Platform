"""
Secretary Service - Intelligent task organization and prioritization logic
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

# Python 3.10 compatibility
UTC = UTC

from src.core.task_models import TaskPriority, TaskStatus
from src.repositories.enhanced_repositories import EnhancedTaskRepository

logger = logging.getLogger(__name__)


class SecretaryService:
    """Service for intelligent task organization and prioritization"""

    def __init__(self):
        """Initialize secretary service with task repository"""
        self.task_repo = EnhancedTaskRepository()

    def _ensure_timezone_aware(self, dt: datetime | None) -> datetime | None:
        """Ensure datetime has timezone info"""
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.replace(tzinfo=UTC)
        return dt

    def get_secretary_dashboard(self, user_id: str | None = None) -> dict[str, Any]:
        """
        Get secretary dashboard with organized task categories

        Args:
            user_id: Optional user ID for filtering tasks

        Returns:
            Dashboard data with categorized tasks, stats, and upcoming deadlines
        """
        try:
            # Get all active tasks
            all_tasks = self.task_repo.list_tasks().items

            # Filter by user if provided
            if user_id:
                all_tasks = [
                    t for t in all_tasks if hasattr(t, "assignee") and t.assignee == user_id
                ]

            # Get current time for calculations
            now = datetime.now(UTC)
            two_days = now + timedelta(days=2)
            one_week = now + timedelta(days=7)

            # Categorize tasks
            main_priority = []
            urgent_tasks = []
            important_tasks = []
            this_week = []

            for task in all_tasks:
                if task.status == TaskStatus.COMPLETED:
                    continue

                # Ensure task.due_date is timezone-aware for comparison
                due_date = self._ensure_timezone_aware(task.due_date)

                # Check if task is urgent (due within 48 hours)
                is_urgent = due_date and due_date <= two_days if due_date else False

                # Check if task is important (high priority)
                is_important = task.priority in [TaskPriority.HIGH, TaskPriority.CRITICAL]

                # Categorize
                if is_urgent and is_important:
                    main_priority.append(self._task_to_dict(task))
                elif is_urgent:
                    urgent_tasks.append(self._task_to_dict(task))
                elif is_important:
                    important_tasks.append(self._task_to_dict(task))
                elif due_date and due_date <= one_week:
                    this_week.append(self._task_to_dict(task))

            # Calculate statistics
            completed_count = len([t for t in all_tasks if t.status == TaskStatus.COMPLETED])
            overdue_count = len(
                [
                    t
                    for t in all_tasks
                    if t.due_date
                    and self._ensure_timezone_aware(t.due_date) < now
                    and t.status != TaskStatus.COMPLETED
                ]
            )

            stats = {
                "total_tasks": len(all_tasks),
                "active_tasks": len([t for t in all_tasks if t.status != TaskStatus.COMPLETED]),
                "completed_tasks": completed_count,
                "overdue_tasks": overdue_count,
                "main_priority_count": len(main_priority),
                "urgent_count": len(urgent_tasks),
                "important_count": len(important_tasks),
            }

            # Get upcoming deadlines (next 7 days)
            upcoming_deadlines = []
            for task in all_tasks:
                due_date = self._ensure_timezone_aware(task.due_date)
                if due_date and now <= due_date <= one_week and task.status != TaskStatus.COMPLETED:
                    upcoming_deadlines.append(
                        {
                            "task_id": task.task_id,
                            "title": task.title,
                            "due_date": due_date.isoformat(),
                            "priority": task.priority
                            if isinstance(task.priority, str)
                            else task.priority.value,
                            "days_until_due": (due_date - now).days,
                        }
                    )

            # Sort upcoming deadlines by date
            upcoming_deadlines.sort(key=lambda x: x["due_date"])

            return {
                "categories": {
                    "main_priority": main_priority,
                    "urgent_tasks": urgent_tasks,
                    "important_tasks": important_tasks,
                    "this_week": this_week,
                },
                "stats": stats,
                "upcoming_deadlines": upcoming_deadlines,
                "last_updated": now.isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to generate secretary dashboard: {e}")
            raise

    def get_priority_matrix(self, user_id: str | None = None) -> dict[str, Any]:
        """
        Get Eisenhower Priority Matrix categorization

        Args:
            user_id: Optional user ID for filtering tasks

        Returns:
            Matrix data with four quadrants (Do First, Schedule, Delegate, Eliminate)
        """
        try:
            # Get all active tasks
            all_tasks = self.task_repo.list_tasks().items

            # Filter by user if provided
            if user_id:
                all_tasks = [
                    t for t in all_tasks if hasattr(t, "assignee") and t.assignee == user_id
                ]

            # Get current time
            now = datetime.now(UTC)
            three_days = now + timedelta(days=3)

            # Initialize quadrants
            do_first = []  # Urgent + Important
            schedule = []  # Important, Not Urgent
            delegate = []  # Urgent, Not Important
            eliminate = []  # Neither Urgent nor Important

            for task in all_tasks:
                if task.status == TaskStatus.COMPLETED:
                    continue

                # Determine urgency and importance
                is_urgent = (
                    task.due_date and task.due_date <= three_days if task.due_date else False
                )
                is_important = task.priority in [TaskPriority.HIGH, TaskPriority.CRITICAL]

                task_dict = self._task_to_dict(task)

                # Categorize into quadrants
                if is_urgent and is_important:
                    do_first.append(task_dict)
                elif is_important and not is_urgent:
                    schedule.append(task_dict)
                elif is_urgent and not is_important:
                    delegate.append(task_dict)
                else:
                    eliminate.append(task_dict)

            matrix = {
                "do_first": do_first,
                "schedule": schedule,
                "delegate": delegate,
                "eliminate": eliminate,
            }

            stats = {
                "do_first_count": len(do_first),
                "schedule_count": len(schedule),
                "delegate_count": len(delegate),
                "eliminate_count": len(eliminate),
                "total_active": len(do_first) + len(schedule) + len(delegate) + len(eliminate),
            }

            return {
                "matrix": matrix,
                "stats": stats,
                "last_updated": now.isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to generate priority matrix: {e}")
            raise

    def get_daily_briefing(
        self, user_id: str | None = None, time_of_day: str = "morning"
    ) -> dict[str, Any]:
        """
        Get daily briefing with stats and upcoming tasks

        Args:
            user_id: Optional user ID for filtering tasks
            time_of_day: 'morning' or 'evening'

        Returns:
            Briefing data with stats, upcoming tasks, completed tasks, and alerts
        """
        try:
            # Get all tasks
            all_tasks = self.task_repo.list_tasks().items

            # Filter by user if provided
            if user_id:
                all_tasks = [
                    t for t in all_tasks if hasattr(t, "assignee") and t.assignee == user_id
                ]

            # Get current time
            now = datetime.now(UTC)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = today_start + timedelta(days=1)
            tomorrow_end = today_end + timedelta(days=1)

            # Get today's completed tasks
            completed_today = []
            for task in all_tasks:
                if task.status == TaskStatus.COMPLETED and task.updated_at:
                    if today_start <= task.updated_at <= today_end:
                        completed_today.append(self._task_to_dict(task))

            # Get upcoming tasks (today and tomorrow)
            upcoming_tasks = []
            for task in all_tasks:
                if task.status != TaskStatus.COMPLETED and task.due_date:
                    if today_start <= task.due_date <= tomorrow_end:
                        upcoming_tasks.append(self._task_to_dict(task))

            # Sort upcoming tasks by due date and priority
            upcoming_tasks.sort(key=lambda x: (x.get("due_date", ""), x.get("priority", "")))

            # Generate alerts
            alerts = []
            overdue_tasks = [
                t
                for t in all_tasks
                if t.due_date and t.due_date < now and t.status != TaskStatus.COMPLETED
            ]

            if overdue_tasks:
                alerts.append(
                    {
                        "type": "overdue",
                        "severity": "high",
                        "message": f"You have {len(overdue_tasks)} overdue task(s)",
                        "count": len(overdue_tasks),
                    }
                )

            urgent_today = [t for t in upcoming_tasks if t.get("priority") in ["high", "critical"]]

            if urgent_today:
                alerts.append(
                    {
                        "type": "urgent",
                        "severity": "medium",
                        "message": f"You have {len(urgent_today)} high-priority task(s) due soon",
                        "count": len(urgent_today),
                    }
                )

            # Calculate statistics
            stats = {
                "total_tasks": len(all_tasks),
                "completed_today": len(completed_today),
                "upcoming_today": len(
                    [t for t in upcoming_tasks if t.get("due_date", "") < today_end.isoformat()]
                ),
                "urgent_tasks": len(urgent_today),
                "overdue_tasks": len(overdue_tasks),
            }

            return {
                "time_of_day": time_of_day,
                "stats": stats,
                "upcoming_tasks": upcoming_tasks[:10],  # Limit to 10 tasks
                "completed_today": completed_today,
                "alerts": alerts,
                "last_updated": now.isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to generate daily briefing: {e}")
            raise

    def suggest_priority_changes(self, user_id: str | None = None) -> list[dict[str, Any]]:
        """
        Get AI-powered priority change suggestions

        Args:
            user_id: Optional user ID for filtering tasks

        Returns:
            List of priority change suggestions
        """
        try:
            # Get all active tasks
            all_tasks = self.task_repo.list_tasks().items

            # Filter by user if provided
            if user_id:
                all_tasks = [
                    t for t in all_tasks if hasattr(t, "assignee") and t.assignee == user_id
                ]

            suggestions = []
            now = datetime.now(UTC)
            two_days = now + timedelta(days=2)

            for task in all_tasks:
                if task.status == TaskStatus.COMPLETED:
                    continue

                # Suggest priority increase for tasks due soon with low priority
                if task.due_date and task.due_date <= two_days:
                    if task.priority in [TaskPriority.LOW, TaskPriority.MEDIUM]:
                        suggestions.append(
                            {
                                "task_id": task.task_id,
                                "title": task.title,
                                "current_priority": task.priority
                                if isinstance(task.priority, str)
                                else task.priority.value,
                                "suggested_priority": TaskPriority.HIGH.value,
                                "reason": f"Task is due in {(task.due_date - now).days} day(s)",
                                "confidence": 0.85,
                            }
                        )

                # Suggest priority decrease for low-importance tasks with no deadline
                if not task.due_date and task.priority == TaskPriority.HIGH:
                    suggestions.append(
                        {
                            "task_id": task.task_id,
                            "title": task.title,
                            "current_priority": task.priority
                            if isinstance(task.priority, str)
                            else task.priority.value,
                            "suggested_priority": TaskPriority.MEDIUM.value,
                            "reason": "High priority task with no deadline set",
                            "confidence": 0.70,
                        }
                    )

            # Sort by confidence
            suggestions.sort(key=lambda x: x["confidence"], reverse=True)

            return suggestions[:10]  # Limit to top 10 suggestions

        except Exception as e:
            logger.error(f"Failed to generate priority suggestions: {e}")
            raise

    def _task_to_dict(self, task) -> dict[str, Any]:
        """
        Convert task object to dictionary for API responses

        Args:
            task: Task object from repository

        Returns:
            Dictionary representation of task
        """
        return {
            "id": task.task_id,
            "title": task.title,
            "description": task.description,
            "status": task.status if isinstance(task.status, str) else task.status.value,
            "priority": task.priority if isinstance(task.priority, str) else task.priority.value,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "project_id": task.project_id,
            "estimated_hours": float(task.estimated_hours) if task.estimated_hours else None,
            "actual_hours": float(task.actual_hours) if task.actual_hours else None,
            "tags": task.tags,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
        }
