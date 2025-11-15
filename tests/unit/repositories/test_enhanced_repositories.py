"""
Tests for enhanced repository layer
"""

import os
import tempfile
from datetime import datetime, timedelta
from decimal import Decimal

import pytest

from src.core.task_models import (
    Achievement,
    FocusSession,
    ProductivityMetrics,
    Project,
    Task,
    TaskPriority,
    TaskStatus,
    User,
    UserAchievement,
)
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.repositories.enhanced_repositories import (
    AchievementRepository,
    EnhancedProjectRepository,
    EnhancedTaskRepository,
    FocusSessionRepository,
    ProductivityMetricsRepository,
    UserAchievementRepository,
    UserRepository,
)


@pytest.fixture
def temp_db():
    """Create a temporary enhanced database for testing"""
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    temp_file.close()

    db = EnhancedDatabaseAdapter(temp_file.name)
    yield db, temp_file.name

    # Cleanup
    os.unlink(temp_file.name)


@pytest.fixture
def user_repo(temp_db):
    """Create user repository for testing"""
    db, _ = temp_db
    return UserRepository(db)


@pytest.fixture
def focus_repo(temp_db):
    """Create focus session repository for testing"""
    db, _ = temp_db
    return FocusSessionRepository(db)


@pytest.fixture
def achievement_repo(temp_db):
    """Create achievement repository for testing"""
    db, _ = temp_db
    return AchievementRepository(db)


@pytest.fixture
def user_achievement_repo(temp_db):
    """Create user achievement repository for testing"""
    db, _ = temp_db
    return UserAchievementRepository(db)


@pytest.fixture
def metrics_repo(temp_db):
    """Create productivity metrics repository for testing"""
    db, _ = temp_db
    return ProductivityMetricsRepository(db)


@pytest.fixture
def task_repo(temp_db):
    """Create enhanced task repository for testing"""
    db, _ = temp_db
    return EnhancedTaskRepository(db)


@pytest.fixture
def project_repo(temp_db):
    """Create enhanced project repository for testing"""
    db, _ = temp_db
    return EnhancedProjectRepository(db)


@pytest.fixture
def sample_user(user_repo):
    """Create a sample user"""
    user = User(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        preferences={"theme": "dark", "notifications": True},
    )
    return user_repo.create(user)


@pytest.fixture
def sample_project(project_repo):
    """Create a sample project"""
    project = Project(
        name="Test Project",
        description="A test project for enhanced testing",
    )
    return project_repo.create(project)


class TestUserRepository:
    """Test the UserRepository class"""

    def test_create_user(self, user_repo):
        """Test creating a new user"""
        user = User(
            username="newuser",
            email="newuser@example.com",
            full_name="New User",
            bio="A test user biography",
            preferences={"theme": "light", "language": "en"},
        )

        created_user = user_repo.create(user)

        assert created_user.user_id == user.user_id
        assert created_user.username == "newuser"
        assert created_user.email == "newuser@example.com"
        assert created_user.full_name == "New User"
        assert created_user.preferences["theme"] == "light"
        assert created_user.is_active is True

    def test_get_user_by_id(self, user_repo, sample_user):
        """Test retrieving a user by ID"""
        retrieved_user = user_repo.get_by_id(sample_user.user_id)

        assert retrieved_user is not None
        assert retrieved_user.user_id == sample_user.user_id
        assert retrieved_user.username == sample_user.username
        assert retrieved_user.email == sample_user.email

    def test_get_user_by_email(self, user_repo, sample_user):
        """Test retrieving a user by email"""
        retrieved_user = user_repo.get_by_email(sample_user.email)

        assert retrieved_user is not None
        assert retrieved_user.user_id == sample_user.user_id
        assert retrieved_user.email == sample_user.email

    def test_get_user_by_username(self, user_repo, sample_user):
        """Test retrieving a user by username"""
        retrieved_user = user_repo.get_by_username(sample_user.username)

        assert retrieved_user is not None
        assert retrieved_user.user_id == sample_user.user_id
        assert retrieved_user.username == sample_user.username

    def test_update_user(self, user_repo, sample_user):
        """Test updating a user"""
        sample_user.full_name = "Updated Name"
        sample_user.bio = "Updated biography"
        sample_user.preferences = {"theme": "dark", "notifications": False}

        updated_user = user_repo.update(sample_user)

        assert updated_user.full_name == "Updated Name"
        assert updated_user.bio == "Updated biography"
        assert updated_user.preferences["notifications"] is False

        # Verify in database
        retrieved_user = user_repo.get_by_id(sample_user.user_id)
        assert retrieved_user.full_name == "Updated Name"

    def test_list_users(self, user_repo):
        """Test listing users with pagination"""
        # Create multiple users
        users = []
        for i in range(5):
            user = User(username=f"user{i}", email=f"user{i}@example.com", full_name=f"User {i}")
            users.append(user_repo.create(user))

        # Test pagination
        result = user_repo.list_users(limit=3, offset=1)

        assert len(result.items) <= 3
        assert result.limit == 3
        assert result.offset == 1
        assert result.total >= 5


class TestFocusSessionRepository:
    """Test the FocusSessionRepository class"""

    def test_create_focus_session(self, focus_repo, sample_user, sample_project):
        """Test creating a focus session"""
        session = FocusSession(
            user_id=sample_user.user_id,
            project_id=sample_project.project_id,
            planned_duration_minutes=25,
            session_type="focus",
        )

        created_session = focus_repo.create(session)

        assert created_session.session_id == session.session_id
        assert created_session.user_id == sample_user.user_id
        assert created_session.planned_duration_minutes == 25
        assert created_session.session_type == "focus"
        assert created_session.is_active is True

    def test_get_session_by_id(self, focus_repo, sample_user):
        """Test retrieving a session by ID"""
        session = FocusSession(user_id=sample_user.user_id, planned_duration_minutes=30)
        created_session = focus_repo.create(session)

        retrieved_session = focus_repo.get_by_id(created_session.session_id)

        assert retrieved_session is not None
        assert retrieved_session.session_id == created_session.session_id
        assert retrieved_session.user_id == sample_user.user_id

    def test_get_user_sessions(self, focus_repo, sample_user):
        """Test getting sessions for a user"""
        # Create multiple sessions
        for i in range(3):
            session = FocusSession(
                user_id=sample_user.user_id,
                planned_duration_minutes=25 + i * 5,
                session_type="focus",
            )
            focus_repo.create(session)

        sessions = focus_repo.get_user_sessions(sample_user.user_id)

        assert len(sessions) >= 3
        assert all(session.user_id == sample_user.user_id for session in sessions)

    def test_get_active_session(self, focus_repo, sample_user):
        """Test getting active session for a user"""
        # Create an active session
        active_session = FocusSession(user_id=sample_user.user_id, planned_duration_minutes=25)
        focus_repo.create(active_session)

        # Create a completed session
        completed_session = FocusSession(user_id=sample_user.user_id, planned_duration_minutes=30)
        completed_session.complete_session(80.0)
        focus_repo.create(completed_session)
        focus_repo.update(completed_session)

        active = focus_repo.get_active_session(sample_user.user_id)

        assert active is not None
        assert active.session_id == active_session.session_id
        assert active.is_active is True

    def test_update_session(self, focus_repo, sample_user):
        """Test updating a focus session"""
        session = FocusSession(user_id=sample_user.user_id, planned_duration_minutes=25)
        created_session = focus_repo.create(session)

        # Complete the session
        created_session.complete_session(productivity_score=85.0)
        updated_session = focus_repo.update(created_session)

        assert updated_session.was_completed is True
        assert updated_session.productivity_score == 85.0
        assert updated_session.ended_at is not None


class TestAchievementRepository:
    """Test the AchievementRepository class"""

    def test_get_achievement_by_id(self, achievement_repo):
        """Test retrieving achievement by ID"""
        # Should get a default achievement
        achievement = achievement_repo.get_by_id("first_task")

        assert achievement is not None
        assert achievement.achievement_id == "first_task"
        assert achievement.name == "First Steps"
        assert achievement.category == "tasks"

    def test_list_achievements(self, achievement_repo):
        """Test listing all achievements"""
        achievements = achievement_repo.list_achievements()

        assert len(achievements) >= 5  # Should have default achievements
        assert all(achievement.is_active for achievement in achievements)

    def test_list_achievements_by_category(self, achievement_repo):
        """Test listing achievements by category"""
        task_achievements = achievement_repo.list_achievements(category="tasks")

        assert len(task_achievements) >= 2  # Should have task-related achievements
        assert all(achievement.category == "tasks" for achievement in task_achievements)

    def test_create_achievement(self, achievement_repo):
        """Test creating a new achievement"""
        achievement = Achievement(
            achievement_id="custom_achievement",
            name="Custom Achievement",
            description="A custom test achievement",
            category="custom",
            criteria={"custom_metric": 100},
            xp_reward=250,
            badge_icon="🎨",
            rarity="rare",
        )

        created_achievement = achievement_repo.create(achievement)

        assert created_achievement.achievement_id == "custom_achievement"
        assert created_achievement.name == "Custom Achievement"
        assert created_achievement.xp_reward == 250

        # Verify in database
        retrieved = achievement_repo.get_by_id("custom_achievement")
        assert retrieved is not None
        assert retrieved.name == "Custom Achievement"


class TestUserAchievementRepository:
    """Test the UserAchievementRepository class"""

    def test_create_user_achievement(self, user_achievement_repo, sample_user):
        """Test creating a user achievement"""
        user_achievement = UserAchievement(
            user_id=sample_user.user_id, achievement_id="first_task", progress=50.0
        )

        created = user_achievement_repo.create(user_achievement)

        assert created.user_id == sample_user.user_id
        assert created.achievement_id == "first_task"
        assert created.progress == 50.0
        assert created.is_completed is False

    def test_get_user_achievement(self, user_achievement_repo, sample_user):
        """Test getting specific user achievement"""
        user_achievement = UserAchievement(
            user_id=sample_user.user_id, achievement_id="task_master", progress=75.0
        )
        user_achievement_repo.create(user_achievement)

        retrieved = user_achievement_repo.get_user_achievement(sample_user.user_id, "task_master")

        assert retrieved is not None
        assert retrieved.progress == 75.0
        assert retrieved.achievement_id == "task_master"

    def test_get_user_achievements(self, user_achievement_repo, sample_user):
        """Test getting all achievements for a user"""
        # Create multiple user achievements
        achievements = ["first_task", "focus_warrior", "task_master"]
        for i, achievement_id in enumerate(achievements):
            user_achievement = UserAchievement(
                user_id=sample_user.user_id, achievement_id=achievement_id, progress=25.0 * (i + 1)
            )
            user_achievement_repo.create(user_achievement)

        all_achievements = user_achievement_repo.get_user_achievements(sample_user.user_id)
        assert len(all_achievements) >= 3

        # Test completed only
        # Complete one achievement
        completed_achievement = user_achievement_repo.get_user_achievement(
            sample_user.user_id, "first_task"
        )
        completed_achievement.complete_achievement()
        user_achievement_repo.update(completed_achievement)

        completed_only = user_achievement_repo.get_user_achievements(
            sample_user.user_id, completed_only=True
        )
        assert len(completed_only) >= 1
        assert all(achievement.is_completed for achievement in completed_only)

    def test_update_user_achievement(self, user_achievement_repo, sample_user):
        """Test updating a user achievement"""
        user_achievement = UserAchievement(
            user_id=sample_user.user_id, achievement_id="productivity_streak", progress=90.0
        )
        created = user_achievement_repo.create(user_achievement)

        # Complete the achievement
        created.complete_achievement()
        updated = user_achievement_repo.update(created)

        assert updated.is_completed is True
        assert updated.progress == 100.0
        assert updated.earned_at is not None


class TestProductivityMetricsRepository:
    """Test the ProductivityMetricsRepository class"""

    def test_create_or_update_metrics(self, metrics_repo, sample_user):
        """Test creating or updating productivity metrics"""
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        metrics = ProductivityMetrics(
            user_id=sample_user.user_id,
            date=today,
            tasks_created=5,
            tasks_completed=3,
            total_focus_time=120,
            xp_earned=300,
        )

        created_metrics = metrics_repo.create_or_update(metrics)

        assert created_metrics.user_id == sample_user.user_id
        assert created_metrics.tasks_created == 5
        assert created_metrics.tasks_completed == 3
        assert created_metrics.xp_earned == 300

        # Update the same metrics
        metrics.tasks_completed = 4
        metrics.xp_earned = 400
        updated_metrics = metrics_repo.create_or_update(metrics)

        assert updated_metrics.tasks_completed == 4
        assert updated_metrics.xp_earned == 400

    def test_get_user_metrics(self, metrics_repo, sample_user):
        """Test getting metrics for a user"""
        # Create metrics for multiple days
        for i in range(5):
            date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(
                days=i
            )
            metrics = ProductivityMetrics(
                user_id=sample_user.user_id,
                date=date,
                tasks_created=i + 1,
                tasks_completed=i,
                total_focus_time=30 * (i + 1),
            )
            metrics_repo.create_or_update(metrics)

        user_metrics = metrics_repo.get_user_metrics(sample_user.user_id, limit=3)

        assert len(user_metrics) >= 3
        assert all(metric.user_id == sample_user.user_id for metric in user_metrics)
        # Should be ordered by date descending (most recent first)
        assert user_metrics[0].date >= user_metrics[1].date

    def test_get_metrics_for_date(self, metrics_repo, sample_user):
        """Test getting metrics for a specific date"""
        target_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        metrics = ProductivityMetrics(
            user_id=sample_user.user_id,
            date=target_date,
            tasks_created=10,
            tasks_completed=8,
            focus_sessions_completed=4,
        )
        metrics_repo.create_or_update(metrics)

        retrieved_metrics = metrics_repo.get_metrics_for_date(sample_user.user_id, target_date)

        assert retrieved_metrics is not None
        assert retrieved_metrics.tasks_created == 10
        assert retrieved_metrics.tasks_completed == 8
        assert retrieved_metrics.focus_sessions_completed == 4


class TestEnhancedTaskRepository:
    """Test the EnhancedTaskRepository class"""

    def test_create_task_with_foreign_keys(self, task_repo, sample_user, sample_project):
        """Test creating a task with proper foreign key relationships"""
        task = Task(
            title="Enhanced Task",
            description="A task using enhanced repository",
            project_id=sample_project.project_id,
            assignee=sample_user.user_id,
            priority=TaskPriority.HIGH,
            estimated_hours=Decimal("4.0"),
        )

        created_task = task_repo.create(task)

        assert created_task.task_id == task.task_id
        assert created_task.title == "Enhanced Task"
        assert created_task.project_id == sample_project.project_id
        assert created_task.assignee == sample_user.user_id
        assert created_task.priority == TaskPriority.HIGH

    def test_task_operations(self, task_repo, sample_project):
        """Test basic task CRUD operations"""
        # Create
        task = Task(
            title="CRUD Test Task",
            description="Testing CRUD operations",
            project_id=sample_project.project_id,
        )
        created_task = task_repo.create(task)

        # Read
        retrieved_task = task_repo.get_by_id(created_task.task_id)
        assert retrieved_task is not None
        assert retrieved_task.title == "CRUD Test Task"

        # Update
        retrieved_task.title = "Updated CRUD Task"
        retrieved_task.status = TaskStatus.IN_PROGRESS
        updated_task = task_repo.update(retrieved_task)
        assert updated_task.title == "Updated CRUD Task"
        assert updated_task.status == TaskStatus.IN_PROGRESS

        # Delete
        result = task_repo.delete(created_task.task_id)
        assert result is True

        # Verify deletion
        deleted_task = task_repo.get_by_id(created_task.task_id)
        assert deleted_task is None


class TestEnhancedProjectRepository:
    """Test the EnhancedProjectRepository class"""

    def test_create_project_with_owner(self, project_repo, sample_user):
        """Test creating a project with owner reference"""
        project = Project(
            name="Owned Project",
            description="Project with owner",
            owner_id=sample_user.user_id,  # Changed from owner to owner_id
            team_members=[sample_user.user_id],
            settings={"auto_assign": True, "notifications": False},
        )

        created_project = project_repo.create(project)

        assert created_project.name == "Owned Project"
        assert created_project.owner_id == sample_user.user_id  # Changed from owner to owner_id
        assert sample_user.user_id in created_project.team_members
        assert created_project.settings["auto_assign"] is True

    def test_soft_delete_project(self, project_repo):
        """Test soft deletion of projects"""
        project = Project(name="To Be Deleted", description="This project will be soft deleted")
        created_project = project_repo.create(project)

        # Soft delete (use soft_delete method, not delete)
        result = project_repo.soft_delete(created_project.project_id)
        assert result is True

        # Should not appear in active projects list
        projects = project_repo.list_projects()
        active_project_ids = [p.project_id for p in projects.items]
        assert created_project.project_id not in active_project_ids

        # But should still exist in database (soft delete)
        retrieved_project = project_repo.get_by_id(created_project.project_id)
        assert retrieved_project is not None
        assert retrieved_project.is_active is False


class TestIntegratedWorkflows:
    """Test integrated workflows using multiple repositories"""

    def test_complete_productivity_workflow(
        self, user_repo, project_repo, task_repo, focus_repo, metrics_repo
    ):
        """Test a complete productivity workflow"""
        # Create user
        user = User(
            username="productive_user", email="productive@example.com", full_name="Productive User"
        )
        created_user = user_repo.create(user)

        # Create project
        project = Project(
            name="Productivity Project",
            description="A project for productivity testing",
            owner_id=created_user.user_id,  # Changed from owner to owner_id
        )
        created_project = project_repo.create(project)

        # Create tasks
        task = Task(
            title="Important Task",
            description="A very important task",
            project_id=created_project.project_id,
            assignee=created_user.user_id,
            estimated_hours=Decimal("2.0"),
        )
        created_task = task_repo.create(task)

        # Start focus session
        focus_session = FocusSession(
            user_id=created_user.user_id,
            task_id=created_task.task_id,
            project_id=created_project.project_id,
            planned_duration_minutes=120,
        )
        created_session = focus_repo.create(focus_session)

        # Complete focus session
        created_session.complete_session(productivity_score=90.0)
        focus_repo.update(created_session)

        # Update task progress
        created_task.actual_hours = Decimal("2.0")
        created_task.mark_completed()
        task_repo.update(created_task)

        # Update productivity metrics
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        metrics = ProductivityMetrics(
            user_id=created_user.user_id,
            date=today,
            tasks_created=1,
            tasks_completed=1,
            total_focus_time=120,
            focus_sessions_completed=1,
            focus_sessions_started=1,
            xp_earned=250,
        )
        metrics.calculate_derived_metrics()
        metrics_repo.create_or_update(metrics)

        # Verify the complete workflow
        final_user = user_repo.get_by_id(created_user.user_id)
        final_project = project_repo.get_by_id(created_project.project_id)
        final_task = task_repo.get_by_id(created_task.task_id)
        final_session = focus_repo.get_by_id(created_session.session_id)
        final_metrics = metrics_repo.get_metrics_for_date(created_user.user_id, today)

        assert final_user is not None
        assert final_project.owner_id == created_user.user_id  # Changed from owner to owner_id
        assert final_task.status == TaskStatus.COMPLETED
        assert final_session.was_completed is True
        assert final_session.productivity_score == 90.0
        assert final_metrics.tasks_completed == 1
        assert final_metrics.completion_rate == 100.0
