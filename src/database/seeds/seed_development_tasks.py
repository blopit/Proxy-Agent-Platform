"""
Seed script for loading all 36 development tasks into the database.

This enables dogfooding: using the app to manage building the app!

Usage:
    python -m src.database.seeds.seed_development_tasks [OPTIONS]

Options:
    --reset         Drop and recreate the database before seeding
    --yes, -y       Skip confirmation prompt (useful for automation)
    --db-path PATH  Database file path (default: proxy_agents_enhanced.db)

Examples:
    # Seed tasks without reset
    python -m src.database.seeds.seed_development_tasks

    # Reset database and seed (with confirmation)
    python -m src.database.seeds.seed_development_tasks --reset

    # Reset database and seed (skip confirmation)
    python -m src.database.seeds.seed_development_tasks --reset --yes

    # Use custom database path
    python -m src.database.seeds.seed_development_tasks --db-path custom.db
"""

import argparse
import os
import sys
from datetime import UTC, datetime
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
        "status": "in_progress",
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

# ============================================================================
# Task Definitions (36 Development Tasks - Original Feature Roadmap)
# ============================================================================

DEVELOPMENT_TASKS = [
    # Wave 1: Foundation
    {
        "task_id": "BE-00",
        "title": "Task Delegation System",
        "description": "Implement 4D delegation with task_assignments and agent_capabilities tables",
        "delegation_mode": "do_with_me",
        "estimated_hours": 8.0,
        "wave": 1,
        "category": "backend",
        "priority": "critical",
    },
    # Wave 2: Core Services - Backend
    {
        "task_id": "BE-01",
        "title": "Task Templates Service",
        "description": "CRUD API for reusable task templates",
        "delegation_mode": "delegate",
        "estimated_hours": 6.0,
        "wave": 2,
        "category": "backend",
        "priority": "high",
    },
    {
        "task_id": "BE-02",
        "title": "User Pets Service",
        "description": "Virtual pet system with XP and evolution",
        "delegation_mode": "delegate",
        "estimated_hours": 8.0,
        "wave": 2,
        "category": "backend",
        "priority": "high",
    },
    {
        "task_id": "BE-03",
        "title": "Focus Sessions Service",
        "description": "Pomodoro timer tracking",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "wave": 2,
        "category": "backend",
        "priority": "high",
    },
    {
        "task_id": "BE-04",
        "title": "Gamification Enhancements",
        "description": "XP, badges, levels, achievements",
        "delegation_mode": "delegate",
        "estimated_hours": 5.0,
        "wave": 2,
        "category": "backend",
        "priority": "high",
    },
    # Wave 2: Core Services - Frontend
    {
        "task_id": "FE-01",
        "title": "ChevronTaskFlow Component",
        "description": "Full-screen task execution modal",
        "delegation_mode": "delegate",
        "estimated_hours": 8.0,
        "wave": 2,
        "category": "frontend",
        "priority": "high",
    },
    {
        "task_id": "FE-02",
        "title": "MiniChevronNav Component",
        "description": "Sticky section navigation",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "wave": 2,
        "category": "frontend",
        "priority": "medium",
    },
    {
        "task_id": "FE-03",
        "title": "Mapper Restructure",
        "description": "2-tab Mapper: Today + Insights",
        "delegation_mode": "do_with_me",
        "estimated_hours": 7.0,
        "wave": 2,
        "category": "frontend",
        "priority": "high",
    },
    {
        "task_id": "FE-04",
        "title": "TaskTemplateLibrary Component",
        "description": "Template picker grid",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "wave": 2,
        "category": "frontend",
        "priority": "medium",
    },
    {
        "task_id": "FE-05",
        "title": "PetWidget Component",
        "description": "Virtual pet display with animations",
        "delegation_mode": "do_with_me",
        "estimated_hours": 7.0,
        "wave": 2,
        "category": "frontend",
        "priority": "high",
    },
    {
        "task_id": "FE-06",
        "title": "CelebrationScreen Component",
        "description": "Post-completion rewards screen",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "wave": 2,
        "category": "frontend",
        "priority": "medium",
    },
    {
        "task_id": "FE-07",
        "title": "FocusTimer Component",
        "description": "Pomodoro timer with streaks",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "wave": 2,
        "category": "frontend",
        "priority": "medium",
    },
    # Wave 3: Advanced Backend
    {
        "task_id": "BE-05",
        "title": "Task Splitting Service",
        "description": "AI-powered task breakdown (Epic 7)",
        "delegation_mode": "delegate",
        "estimated_hours": 10.0,
        "wave": 3,
        "category": "backend",
        "priority": "high",
    },
    {
        "task_id": "BE-06",
        "title": "Analytics & Insights",
        "description": "Productivity dashboards",
        "delegation_mode": "delegate",
        "estimated_hours": 8.0,
        "wave": 3,
        "category": "backend",
        "priority": "medium",
    },
    {
        "task_id": "BE-07",
        "title": "Notification System",
        "description": "Reminders and celebrations",
        "delegation_mode": "delegate",
        "estimated_hours": 6.0,
        "wave": 3,
        "category": "backend",
        "priority": "medium",
    },
    {
        "task_id": "BE-08",
        "title": "Social Sharing",
        "description": "Share achievements/templates",
        "delegation_mode": "delegate",
        "estimated_hours": 5.0,
        "wave": 3,
        "category": "backend",
        "priority": "low",
    },
    {
        "task_id": "BE-09",
        "title": "Export/Import Service",
        "description": "Data portability",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "wave": 3,
        "category": "backend",
        "priority": "low",
    },
    {
        "task_id": "BE-10",
        "title": "Webhooks & Integrations",
        "description": "Third-party integrations",
        "delegation_mode": "delegate",
        "estimated_hours": 5.0,
        "wave": 3,
        "category": "backend",
        "priority": "low",
    },
    # Wave 3: Enhanced UX
    {
        "task_id": "FE-08",
        "title": "Energy Visualization",
        "description": "Interactive energy graphs",
        "delegation_mode": "delegate",
        "estimated_hours": 5.0,
        "wave": 3,
        "category": "frontend",
        "priority": "medium",
    },
    {
        "task_id": "FE-09",
        "title": "Swipeable Task Cards",
        "description": "Tinder-style task cards",
        "delegation_mode": "delegate",
        "estimated_hours": 6.0,
        "wave": 3,
        "category": "frontend",
        "priority": "high",
    },
    {
        "task_id": "FE-10",
        "title": "Biological Tabs",
        "description": "Bottom nav with 5 modes",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "wave": 3,
        "category": "frontend",
        "priority": "medium",
    },
    {
        "task_id": "FE-11",
        "title": "Task Breakdown Modal",
        "description": "Review AI task splits",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "wave": 3,
        "category": "frontend",
        "priority": "medium",
    },
    {
        "task_id": "FE-12",
        "title": "Achievement Gallery",
        "description": "Badge collection grid",
        "delegation_mode": "delegate",
        "estimated_hours": 5.0,
        "wave": 3,
        "category": "frontend",
        "priority": "low",
    },
    {
        "task_id": "FE-13",
        "title": "Ritual System",
        "description": "Repeating task rituals",
        "delegation_mode": "delegate",
        "estimated_hours": 6.0,
        "wave": 3,
        "category": "frontend",
        "priority": "medium",
    },
    # Wave 4: Creature & ML
    {
        "task_id": "BE-11",
        "title": "Creature Leveling",
        "description": "Pet XP and evolution",
        "delegation_mode": "delegate",
        "estimated_hours": 6.0,
        "wave": 4,
        "category": "backend",
        "priority": "medium",
    },
    {
        "task_id": "BE-12",
        "title": "AI Creature Generation",
        "description": "AI pet personalities",
        "delegation_mode": "delegate",
        "estimated_hours": 7.0,
        "wave": 4,
        "category": "backend",
        "priority": "low",
    },
    {
        "task_id": "BE-13",
        "title": "ML Training Pipeline",
        "description": "Energy prediction ML",
        "delegation_mode": "delegate",
        "estimated_hours": 8.0,
        "wave": 4,
        "category": "backend",
        "priority": "medium",
    },
    {
        "task_id": "FE-14",
        "title": "Creature Animations",
        "description": "Animated creature sprites",
        "delegation_mode": "delegate",
        "estimated_hours": 7.0,
        "wave": 4,
        "category": "frontend",
        "priority": "medium",
    },
    {
        "task_id": "FE-15",
        "title": "Creature Gallery",
        "description": "Pokedex-style collection",
        "delegation_mode": "delegate",
        "estimated_hours": 4.0,
        "wave": 4,
        "category": "frontend",
        "priority": "low",
    },
    # Wave 5: Advanced Features
    {
        "task_id": "FE-16",
        "title": "Temporal Visualization",
        "description": "GitHub-style heatmap",
        "delegation_mode": "delegate",
        "estimated_hours": 6.0,
        "wave": 5,
        "category": "frontend",
        "priority": "medium",
    },
    {
        "task_id": "FE-17",
        "title": "Onboarding Flow",
        "description": "5-step wizard",
        "delegation_mode": "delegate",
        "estimated_hours": 6.0,
        "wave": 5,
        "category": "frontend",
        "priority": "high",
    },
    # Wave 6: Polish & Quality
    {
        "task_id": "BE-14",
        "title": "Performance Monitoring",
        "description": "Metrics and health checks",
        "delegation_mode": "delegate",
        "estimated_hours": 5.0,
        "wave": 6,
        "category": "backend",
        "priority": "high",
    },
    {
        "task_id": "BE-15",
        "title": "Integration Tests",
        "description": "End-to-end test scenarios",
        "delegation_mode": "delegate",
        "estimated_hours": 7.0,
        "wave": 6,
        "category": "backend",
        "priority": "high",
    },
    {
        "task_id": "FE-18",
        "title": "Accessibility Suite",
        "description": "WCAG AA compliance",
        "delegation_mode": "delegate",
        "estimated_hours": 7.0,
        "wave": 6,
        "category": "frontend",
        "priority": "high",
    },
    {
        "task_id": "FE-19",
        "title": "E2E Test Suite",
        "description": "Playwright tests",
        "delegation_mode": "delegate",
        "estimated_hours": 8.0,
        "wave": 6,
        "category": "frontend",
        "priority": "high",
    },
    {
        "task_id": "FE-20",
        "title": "Performance Optimization",
        "description": "Bundle size and Core Web Vitals",
        "delegation_mode": "delegate",
        "estimated_hours": 7.0,
        "wave": 6,
        "category": "frontend",
        "priority": "high",
    },
]


def reset_database(db_path: str = "proxy_agents_enhanced.db"):
    """Reset database by removing and recreating."""
    print(f"=�  Resetting database: {db_path}")

    if os.path.exists(db_path):
        os.remove(db_path)
        print("    Removed existing database")

    db = EnhancedDatabaseAdapter(db_path)
    print("    Created fresh database")
    return db


def seed_development_tasks(db: EnhancedDatabaseAdapter):
    """Seed all 36 development tasks."""
    print(f"\n=� Seeding {len(DEVELOPMENT_TASKS)} tasks...")

    conn = db.get_connection()
    cursor = conn.cursor()

    # Create meta-project
    project_id = "meta-development"
    cursor.execute(
        """
        INSERT OR REPLACE INTO projects (
            project_id, name, description, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            project_id,
            "App Development (Meta)",
            "Using the app to build the app!",
            True,
            datetime.now(UTC),
            datetime.now(UTC),
        ),
    )

    # Insert tasks
    for task_data in DEVELOPMENT_TASKS:
        cursor.execute(
            """
            INSERT INTO tasks (
                task_id, title, description, project_id, priority,
                delegation_mode, estimated_hours, is_meta_task,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                str(uuid4()),
                f"{task_data['task_id']}: {task_data['title']}",
                task_data["description"],
                project_id,
                task_data["priority"],
                task_data["delegation_mode"],
                task_data["estimated_hours"],
                True,
                "pending",
                datetime.now(UTC),
                datetime.now(UTC),
            ),
        )

        wave = task_data["wave"]
        cat = task_data["category"][:2].upper()
        print(f"    W{wave} | {cat} | {task_data['task_id']}: {task_data['title']}")

    conn.commit()
    print(f"\n Seeded {len(DEVELOPMENT_TASKS)} tasks!")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Reset database before seeding")
    parser.add_argument("--yes", "-y", action="store_true", help="Skip confirmation prompt")
    parser.add_argument("--db-path", default="proxy_agents_enhanced.db", help="Database path")
    args = parser.parse_args()

    print("= Dogfooding Setup")
    print("=" * 50)

    if args.reset:
        confirm = input("\n�  Delete ALL data? (yes/no): ")
        if confirm.lower() != "yes":
            print("L Aborted")
            return
        db = reset_database(args.db_path)
    else:
        db = EnhancedDatabaseAdapter(args.db_path)

    seed_development_tasks(db)
    print("\n<� Ready for dogfooding!")


if __name__ == "__main__":
    main()
