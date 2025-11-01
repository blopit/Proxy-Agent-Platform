"""
Seed script for loading real-world dogfooding tasks into the database.

This enables dogfooding: using the app to manage real tasks!

Usage:
    uv run python -m src.database.seeds.seed_dogfooding_tasks [OPTIONS]

Options:
    --reset         Drop and recreate the database before seeding
    --yes, -y       Skip confirmation prompt (useful for automation)
    --db-path PATH  Database file path (default: proxy_agents_enhanced.db)

Examples:
    # Seed tasks without reset
    uv run python -m src.database.seeds.seed_dogfooding_tasks

    # Reset database and seed (with confirmation)
    uv run python -m src.database.seeds.seed_dogfooding_tasks --reset

    # Reset database and seed (skip confirmation)
    uv run python -m src.database.seeds.seed_dogfooding_tasks --reset --yes

    # Use custom database path
    uv run python -m src.database.seeds.seed_dogfooding_tasks --db-path custom.db
"""

import argparse
import json
import os
import sys
from datetime import datetime, UTC
from pathlib import Path
from uuid import uuid4

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from src.database.enhanced_adapter import EnhancedDatabaseAdapter


# ============================================================================
# Task Definitions (Real-world Dogfooding Tasks)
# ============================================================================

DOGFOODING_TASKS = [
    # Today — BE-00: Task Delegation System Implementation
    {
        "task_id": "BE-00-1",
        "title": "Review Task Delegation System spec",
        "description": "Review the spec for Task Delegation System (BE-00)",
        "delegation_mode": "do",
        "estimated_hours": 0.5,
        "tags": ["BE-00", "review"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "BE-00-2",
        "title": "Set up delegation service structure",
        "description": "Create service directory and initial files for delegation system",
        "delegation_mode": "do",
        "estimated_hours": 0.5,
        "tags": ["BE-00", "setup"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "BE-00-3",
        "title": "Create database models for delegation",
        "description": "Define Pydantic models for task assignments and agent capabilities",
        "delegation_mode": "do",
        "estimated_hours": 1.0,
        "tags": ["BE-00", "models"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "BE-00-4",
        "title": "Write TDD tests for delegation API endpoints",
        "description": "Create pytest tests for all delegation API endpoints before implementation",
        "delegation_mode": "do_with_me",
        "estimated_hours": 2.0,
        "tags": ["BE-00", "tests", "tdd"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "BE-00-5",
        "title": "Implement delegation repository",
        "description": "Create repository layer for delegation database operations",
        "delegation_mode": "delegate",
        "estimated_hours": 1.5,
        "tags": ["BE-00", "repository"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "BE-00-6",
        "title": "Implement delegation API routes",
        "description": "Create FastAPI routes for task assignments and agent capabilities",
        "delegation_mode": "delegate",
        "estimated_hours": 2.0,
        "tags": ["BE-00", "api"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "BE-00-7",
        "title": "Create database migration for delegation tables",
        "description": "Create Alembic migration for task_assignments and agent_capabilities tables",
        "delegation_mode": "do",
        "estimated_hours": 0.5,
        "tags": ["BE-00", "migration"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "BE-00-8",
        "title": "Build seed script to load development tasks",
        "description": "Create seed script to populate database with real-world tasks for dogfooding",
        "delegation_mode": "do_with_me",
        "estimated_hours": 1.0,
        "tags": ["BE-00", "seeds"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "completed",
    },
    {
        "task_id": "BE-00-9",
        "title": "Test delegation system end-to-end",
        "description": "Run integration tests for complete delegation workflow",
        "delegation_mode": "do",
        "estimated_hours": 1.0,
        "tags": ["BE-00", "testing"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "BE-00-10",
        "title": "Verify dogfooding capability",
        "description": "Confirm the system can manage its own development tasks",
        "delegation_mode": "do",
        "estimated_hours": 0.5,
        "tags": ["BE-00", "verification"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    # This Week — Core Services
    {
        "task_id": "BE-01",
        "title": "Task Templates Service",
        "description": "CRUD API for reusable task templates (6 hours)",
        "delegation_mode": "delegate",
        "estimated_hours": 6.0,
        "tags": ["Core Services"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "FE-01",
        "title": "ChevronTaskFlow Component",
        "description": "Full-screen task execution modal component (6 hours)",
        "delegation_mode": "delegate",
        "estimated_hours": 6.0,
        "tags": ["Core Services"],
        "category": "frontend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    {
        "task_id": "BE-03",
        "title": "Focus Sessions Service",
        "description": "Pomodoro timer tracking service (4 hours)",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "tags": ["Core Services"],
        "category": "backend",
        "priority": "high",
        "due_date": None,
        "status": "todo",
    },
    # End of Week — Review
    {
        "task_id": "WEEKLY-REVIEW",
        "title": "Weekly review: Track completion metrics and update roadmap",
        "description": "Review completed tasks, track metrics, and update project roadmap",
        "delegation_mode": "do",
        "estimated_hours": 1.0,
        "tags": ["review", "weekly"],
        "category": "planning",
        "priority": "medium",
        "due_date": None,
        "status": "todo",
    },
    # LION motel
    {
        "task_id": "LION-1",
        "title": "Get Jina from airport",
        "description": "Pick up Jina from airport",
        "delegation_mode": "do",
        "estimated_hours": 2.0,
        "tags": ["LION motel"],
        "category": "personal",
        "priority": "high",
        "due_date": "2025-11-11",
        "status": "todo",
    },
    {
        "task_id": "LION-2",
        "title": "Turn off AC and put on AC covers",
        "description": "Winterize LION motel by turning off AC and installing covers",
        "delegation_mode": "do",
        "estimated_hours": 1.0,
        "tags": ["LION motel"],
        "category": "personal",
        "priority": "medium",
        "due_date": "2025-11-02",
        "status": "todo",
    },
    # Personal
    {
        "task_id": "PERSONAL-1",
        "title": "Wish Gina happy birthday",
        "description": "Send birthday wishes to Gina",
        "delegation_mode": "do",
        "estimated_hours": 0.25,
        "tags": ["Personal"],
        "category": "personal",
        "priority": "high",
        "due_date": "2025-11-02",
        "status": "todo",
    },
]


def reset_database(db_path: str = "proxy_agents_enhanced.db"):
    """Reset database by removing and recreating."""
    print(f"🔄 Resetting database: {db_path}")

    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"    Removed existing database")

    db = EnhancedDatabaseAdapter(db_path)
    print(f"    Created fresh database")
    return db


def seed_dogfooding_tasks(db: EnhancedDatabaseAdapter):
    """Seed real-world dogfooding tasks."""
    print(f"\n📝 Seeding {len(DOGFOODING_TASKS)} dogfooding tasks...")

    conn = db.get_connection()
    cursor = conn.cursor()

    # Create dogfooding project
    project_id = "dogfooding"
    cursor.execute(
        """
        INSERT OR REPLACE INTO projects (
            project_id, name, description, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            project_id,
            "Dogfooding - Real Tasks",
            "Using the task system to manage real-world tasks!",
            True,
            datetime.now(UTC),
            datetime.now(UTC),
        ),
    )

    # Insert tasks
    for task_data in DOGFOODING_TASKS:
        # Parse due_date if provided
        due_date = None
        if task_data.get("due_date"):
            try:
                due_date = datetime.strptime(task_data["due_date"], "%Y-%m-%d")
            except ValueError:
                pass

        # Convert tags list to JSON string
        tags_json = json.dumps(task_data.get("tags", []))

        cursor.execute(
            """
            INSERT INTO tasks (
                task_id, title, description, project_id, priority,
                delegation_mode, estimated_hours, is_meta_task,
                status, tags, due_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                str(uuid4()),
                task_data["title"],
                task_data["description"],
                project_id,
                task_data["priority"],
                task_data["delegation_mode"],
                task_data["estimated_hours"],
                False,  # Not meta-tasks, real tasks
                task_data.get("status", "todo"),
                tags_json,
                due_date,
                datetime.now(UTC),
                datetime.now(UTC),
            ),
        )

        cat = task_data["category"][:4].upper()
        status_map = {"completed": "✅", "in_progress": "🔄", "todo": "○"}
        status_emoji = status_map.get(task_data.get("status", "todo"), "○")
        due_str = f" (Due: {task_data['due_date']})" if task_data.get("due_date") else ""
        print(
            f"    {status_emoji} {cat} | {task_data['task_id']}: {task_data['title']}{due_str}"
        )

    conn.commit()
    print(f"\n✅ Seeded {len(DOGFOODING_TASKS)} dogfooding tasks!")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Seed real-world dogfooding tasks into the database"
    )
    parser.add_argument("--reset", action="store_true", help="Reset database before seeding")
    parser.add_argument("--yes", "-y", action="store_true", help="Skip confirmation prompt")
    parser.add_argument(
        "--db-path", default="proxy_agents_enhanced.db", help="Database path"
    )
    args = parser.parse_args()

    print("=" * 60)
    print("🚀 Dogfooding Setup - Real Tasks")
    print("=" * 60)

    if args.reset:
        if not args.yes:
            confirm = input("\n⚠️  Delete ALL data? (yes/no): ")
            if confirm.lower() != "yes":
                print("❌ Aborted")
                return
        db = reset_database(args.db_path)
    else:
        db = EnhancedDatabaseAdapter(args.db_path)

    seed_dogfooding_tasks(db)
    print("\n🎉 Ready for dogfooding!")
    print("\n📋 Summary:")
    print(f"   • {len([t for t in DOGFOODING_TASKS if 'BE-00' in t.get('tags', [])])} BE-00 tasks")
    print(f"   • {len([t for t in DOGFOODING_TASKS if 'Core Services' in t.get('tags', [])])} Core Services tasks")
    print(f"   • {len([t for t in DOGFOODING_TASKS if 'LION motel' in t.get('tags', [])])} LION motel tasks")
    print(f"   • {len([t for t in DOGFOODING_TASKS if 'Personal' in t.get('tags', [])])} Personal tasks")


if __name__ == "__main__":
    main()
