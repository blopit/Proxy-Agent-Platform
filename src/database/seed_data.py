"""
Seed default data for development and testing
"""

from datetime import datetime, timedelta
from uuid import uuid4

from src.core.task_models import Project, Task, User
from src.database.enhanced_adapter import get_enhanced_database
from src.repositories.enhanced_repositories import (
    EnhancedProjectRepository,
    EnhancedTaskRepository,
    UserRepository,
)


def create_default_user():
    """Create a default user for development"""
    user_repo = UserRepository()

    default_user = User(
        user_id=str(uuid4()),
        username="demo_user",
        email="demo@proxyagent.com",
        display_name="Demo User",
        bio="Default demo user for testing",
        preferences={"theme": "light", "notifications": True, "timezone": "UTC"},
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    try:
        created_user = user_repo.create(default_user)
        print(f"✅ Created default user: {created_user.username} ({created_user.user_id})")
        return created_user
    except Exception as e:
        print(f"❌ Error creating default user: {e}")
        # Try to get existing user
        existing_user = user_repo.get_by_username("demo_user")
        if existing_user:
            print(f"✅ Using existing user: {existing_user.username}")
            return existing_user
        return None


def create_default_project(user_id: str):
    """Create a default project for development"""
    project_repo = EnhancedProjectRepository()

    default_project = Project(
        project_id=str(uuid4()),
        name="Personal Tasks",
        description="Default project for personal task management",
        owner_id=user_id,
        settings={"auto_archive": False, "default_priority": "medium", "task_auto_complete": False},
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    try:
        created_project = project_repo.create(default_project)
        print(f"✅ Created default project: {created_project.name} ({created_project.project_id})")
        return created_project
    except Exception as e:
        print(f"❌ Error creating default project: {e}")
        # Try to get existing project by querying database directly
        try:
            # Use the database connection to check for existing projects
            conn = project_repo.db.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects LIMIT 1")
            row = cursor.fetchone()
            conn.close()

            if row:
                # Convert row to project (simplified for this case)
                print("✅ Using existing project from database")
                return Project(
                    project_id=row[0],  # Assuming first column is project_id
                    name=row[1] or "Existing Project",
                    description=row[2] or "Existing project",
                    owner_id=row[3] or user_id,
                )
        except Exception:
            pass
        return None


def create_sample_tasks(user_id: str, project_id: str):
    """Create sample tasks for development"""
    task_repo = EnhancedTaskRepository()

    sample_tasks = [
        {
            "title": "Set up development environment",
            "description": "Install dependencies and configure the development environment",
            "status": "done",
            "priority": "high",
        },
        {
            "title": "Connect frontend to backend APIs",
            "description": "Replace mock data with real API calls in React components",
            "status": "in_progress",
            "priority": "high",
        },
        {
            "title": "Implement user authentication",
            "description": "Add JWT authentication and user registration/login flows",
            "status": "todo",
            "priority": "high",
        },
        {
            "title": "Add real-time notifications",
            "description": "Implement WebSocket connections for live updates",
            "status": "todo",
            "priority": "medium",
        },
        {
            "title": "Create mobile app prototype",
            "description": "Build React Native prototype for mobile access",
            "status": "todo",
            "priority": "low",
        },
    ]

    created_tasks = []
    for i, task_data in enumerate(sample_tasks):
        task = Task(
            task_id=str(uuid4()),
            title=task_data["title"],
            description=task_data["description"],
            project_id=project_id,
            assignee=user_id,
            status=task_data["status"],
            priority=task_data["priority"],
            created_at=datetime.now() - timedelta(days=5 - i),
            updated_at=datetime.now() - timedelta(days=5 - i),
        )

        try:
            created_task = task_repo.create(task)
            created_tasks.append(created_task)
            print(f"✅ Created task: {created_task.title}")
        except Exception as e:
            print(f"❌ Error creating task '{task_data['title']}': {e}")

    return created_tasks


def seed_database():
    """Main function to seed the database with default data"""
    print("🌱 Seeding database with default data...")

    # Initialize database
    get_enhanced_database()

    # Create default user
    user = create_default_user()
    if not user:
        print("❌ Failed to create/get default user. Cannot continue seeding.")
        return False

    # Create default project
    project = create_default_project(user.user_id)
    if not project:
        print("❌ Failed to create/get default project. Cannot continue seeding.")
        return False

    # Create sample tasks
    tasks = create_sample_tasks(user.user_id, project.project_id)

    print("\n✅ Database seeding completed:")
    print(f"   - User: {user.username} ({user.user_id})")
    print(f"   - Project: {project.name} ({project.project_id})")
    print(f"   - Tasks: {len(tasks)} created")

    return True


if __name__ == "__main__":
    seed_database()
