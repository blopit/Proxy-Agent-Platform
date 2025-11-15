"""
Data Factories for E2E Tests

Provides factory functions for creating test data including projects,
tasks, and other domain objects.
"""

from datetime import UTC, datetime, timedelta
from typing import Any


def create_test_onboarding_data(
    adhd_support_level: int = 7,
    work_preference: str = "hybrid",
) -> dict[str, Any]:
    """
    Create test onboarding data.

    Args:
        adhd_support_level: ADHD support level (1-10)
        work_preference: Work preference (remote, hybrid, office)

    Returns:
        Onboarding data dictionary
    """
    return {
        "work_preference": work_preference,
        "adhd_support_level": adhd_support_level,
        "adhd_challenges": ["time_blindness", "focus", "organization"],
        "productivity_goals": ["reduce_overwhelm", "increase_focus"],
        "daily_schedule": {
            "time_preference": "morning",
            "flexible_enabled": True,
            "week_grid": {
                "monday": "9-17",
                "tuesday": "9-17",
                "wednesday": "9-17",
                "thursday": "9-17",
                "friday": "9-13",
            },
        },
    }


def create_test_project(
    name: str | None = None,
    owner_id: str | None = None,
    description: str | None = None,
) -> dict[str, Any]:
    """
    Create test project data.

    Args:
        name: Project name (auto-generated if not provided)
        owner_id: Owner user ID
        description: Project description

    Returns:
        Project data dictionary
    """
    timestamp = datetime.now(UTC).strftime("%Y%m%d%H%M%S")

    return {
        "name": name or f"E2E Test Project {timestamp}",
        "description": description or "E2E test project for validating backend workflows",
        "owner_id": owner_id,
        "start_date": datetime.now(UTC).isoformat(),
        "end_date": (datetime.now(UTC) + timedelta(days=30)).isoformat(),
        "is_active": True,
        "settings": {
            "auto_archive": False,
            "notification_enabled": True,
        },
    }


def create_test_complex_task(
    title: str | None = None,
    project_id: str | None = None,
    assignee_id: str | None = None,
    estimated_hours: float = 12.0,
) -> dict[str, Any]:
    """
    Create a complex task suitable for task splitting.

    Args:
        title: Task title (auto-generated if not provided)
        project_id: Project ID to associate with
        assignee_id: User ID to assign to
        estimated_hours: Estimated hours (default: 12.0 for PROJECT scope)

    Returns:
        Task data dictionary
    """
    return {
        "title": title or "Design and implement user authentication system",
        "description": (
            "Create a secure authentication system with:\n"
            "- OAuth 2.0 integration (Google, GitHub)\n"
            "- JWT token management\n"
            "- Password recovery flow\n"
            "- Two-factor authentication\n"
            "- Session management\n"
            "- Rate limiting and security headers"
        ),
        "project_id": project_id,
        "assignee_id": assignee_id,
        "priority": "high",
        "status": "todo",
        "estimated_hours": estimated_hours,
        "scope": "complex",  # Triggers task splitting
        "tags": ["backend", "security", "authentication"],
        "due_date": (datetime.now(UTC) + timedelta(days=7)).isoformat(),
    }


def create_test_multi_scope_task(
    title: str | None = None,
    project_id: str | None = None,
    assignee_id: str | None = None,
) -> dict[str, Any]:
    """
    Create a MULTI-scope task (15-60 min) that triggers AI micro-step generation.

    This scope range (0.25-1.0 hours) is perfect for testing real LLM calls,
    as the agent will use OpenAI/Anthropic to generate 3-5 micro-steps.

    Args:
        title: Task title (auto-generated if not provided)
        project_id: Project ID to associate with
        assignee_id: User ID to assign to

    Returns:
        Task data dictionary optimized for AI splitting
    """
    return {
        "title": title or "Implement user profile editing feature",
        "description": (
            "Add functionality for users to edit their profile:\n"
            "- Update display name and bio\n"
            "- Upload profile picture\n"
            "- Change email with verification\n"
            "- Update timezone and preferences"
        ),
        "project_id": project_id,
        "assignee_id": assignee_id,
        "priority": "medium",
        "status": "todo",
        "estimated_hours": 0.75,  # 45 minutes - perfect for MULTI scope (AI splitting)
        "tags": ["frontend", "profile", "user-experience"],
        "due_date": (datetime.now(UTC) + timedelta(days=3)).isoformat(),
    }


def create_test_simple_task(
    title: str | None = None,
    project_id: str | None = None,
    priority: str = "medium",
) -> dict[str, Any]:
    """
    Create a simple task.

    Args:
        title: Task title
        project_id: Project ID to associate with
        priority: Task priority (low, medium, high)

    Returns:
        Task data dictionary
    """
    timestamp = datetime.now(UTC).strftime("%H%M%S")

    return {
        "title": title or f"Simple task created at {timestamp}",
        "description": "A simple task for E2E testing",
        "project_id": project_id,
        "priority": priority,
        "status": "todo",
        "estimated_hours": 1.0,
        "scope": "simple",
        "tags": ["e2e-test"],
    }


def create_test_focus_session(
    task_id: str | None = None,
    duration_minutes: int = 25,
) -> dict[str, Any]:
    """
    Create test focus session data.

    Args:
        task_id: Task ID to associate session with
        duration_minutes: Session duration in minutes

    Returns:
        Focus session data dictionary
    """
    return {
        "task_id": task_id,
        "duration_minutes": duration_minutes,
        "started_at": datetime.now(UTC).isoformat(),
        "is_completed": False,
        "interruptions": 0,
        "notes": "E2E test focus session",
    }


def create_test_morning_ritual(
    focus_task_ids: list[str] | None = None,
) -> dict[str, Any]:
    """
    Create test morning ritual data.

    Args:
        focus_task_ids: List of up to 3 task IDs for daily focus

    Returns:
        Morning ritual data dictionary
    """
    task_ids = focus_task_ids or []

    # Pad with None if less than 3 tasks
    while len(task_ids) < 3:
        task_ids.append(None)

    return {
        "completion_date": datetime.now(UTC).strftime("%Y-%m-%d"),
        "focus_task_1_id": task_ids[0],
        "focus_task_2_id": task_ids[1],
        "focus_task_3_id": task_ids[2],
        "skipped": False,
    }


def create_test_energy_snapshot(
    energy_level: int = 2,
    notes: str | None = None,
) -> dict[str, Any]:
    """
    Create test energy snapshot data.

    Args:
        energy_level: Energy level (1=Low, 2=Medium, 3=High)
        notes: Optional notes

    Returns:
        Energy snapshot data dictionary
    """
    return {
        "energy_level": energy_level,
        "recorded_at": datetime.now(UTC).isoformat(),
        "time_of_day": "morning",
        "notes": notes or "E2E test energy snapshot",
    }


def create_test_compass_zone(
    name: str,
    icon: str = "🎯",
    color: str = "#3b82f6",
) -> dict[str, Any]:
    """
    Create test compass zone data.

    Args:
        name: Zone name (e.g., "Work", "Life", "Self")
        icon: Zone icon emoji
        color: Zone color hex code

    Returns:
        Compass zone data dictionary
    """
    return {
        "name": name,
        "icon": icon,
        "color": color,
        "simple_goal": f"Focus on {name.lower()} tasks",
        "is_active": True,
        "sort_order": 0,
    }
