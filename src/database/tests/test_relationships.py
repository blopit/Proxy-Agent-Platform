"""
Test suite for database relationships and foreign key constraints - Epic 1.3 TDD
"""

import pytest
from datetime import datetime
from uuid import uuid4
import random
import string

from src.core.task_models import User, Project, Task, FocusSession, Achievement, UserAchievement
from src.repositories.enhanced_repositories import (
    UserRepository,
    EnhancedProjectRepository,
    EnhancedTaskRepository,
    FocusSessionRepository,
    AchievementRepository,
    UserAchievementRepository
)
from src.database.enhanced_adapter import get_enhanced_database


def generate_unique_email():
    """Generate a unique email address for testing"""
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test-{suffix}@example.com"

def generate_unique_username():
    """Generate a unique username for testing"""
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"testuser_{suffix}"


class TestUserProjectRelationships:
    """Test user-project foreign key relationships"""

    def setup_method(self):
        """Setup test database and repositories"""
        self.db = get_enhanced_database()
        self.user_repo = UserRepository()
        self.project_repo = EnhancedProjectRepository()

    def teardown_method(self):
        """Clean up test data"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        # Clean up in reverse dependency order
        cursor.execute("DELETE FROM projects WHERE project_id LIKE 'test-%'")
        cursor.execute("DELETE FROM users WHERE user_id LIKE 'test-%'")
        conn.commit()

    def test_project_requires_valid_owner_id(self):
        """Test that projects require a valid user as owner"""
        # Try to create project with non-existent owner
        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id="non-existent-user-id",  # Invalid foreign key
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        # Should fail due to foreign key constraint
        with pytest.raises(Exception) as exc_info:
            self.project_repo.create(project)

        # Verify it's a foreign key constraint error
        assert "foreign key" in str(exc_info.value).lower() or "constraint" in str(exc_info.value).lower()

    def test_project_creation_with_valid_owner_succeeds(self):
        """Test that projects can be created with valid owner"""
        # First create a user
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        # Now create project with valid owner
        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,  # Valid foreign key
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        created_project = self.project_repo.create(project)
        assert created_project.project_id == project.project_id
        assert created_project.owner_id == created_user.user_id

    def test_cascade_delete_user_removes_owned_projects(self):
        """Test that deleting a user cascades to remove their projects"""
        # Create user and project
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        # Delete the user
        self.user_repo.delete(created_user.user_id)

        # Project should also be deleted (cascade)
        deleted_project = self.project_repo.get_by_id(created_project.project_id)
        assert deleted_project is None


class TestProjectTaskRelationships:
    """Test project-task foreign key relationships"""

    def setup_method(self):
        """Setup test database and repositories"""
        self.db = get_enhanced_database()
        self.user_repo = UserRepository()
        self.project_repo = EnhancedProjectRepository()
        self.task_repo = EnhancedTaskRepository()

    def test_task_requires_valid_project_id(self):
        """Test that tasks require a valid project"""
        # Try to create task with non-existent project
        task = Task(
            task_id=str(uuid4()),
            title="Test Task",
            description="Test Description",
            project_id="non-existent-project-id",  # Invalid foreign key
            assignee_id="test-user",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        # Should fail due to foreign key constraint
        with pytest.raises(Exception) as exc_info:
            self.task_repo.create(task)

        assert "foreign key" in str(exc_info.value).lower() or "constraint" in str(exc_info.value).lower()

    def test_task_creation_with_valid_project_succeeds(self):
        """Test that tasks can be created with valid project"""
        # Create user and project first
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        # Now create task with valid project
        task = Task(
            task_id=str(uuid4()),
            title="Test Task",
            description="Test Description",
            project_id=created_project.project_id,  # Valid foreign key
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        created_task = self.task_repo.create(task)
        assert created_task.task_id == task.task_id
        assert created_task.project_id == created_project.project_id

    def test_cascade_delete_project_removes_tasks(self):
        """Test that deleting a project cascades to remove its tasks"""
        # Create user, project, and task
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        task = Task(
            task_id=str(uuid4()),
            title="Test Task",
            description="Test Description",
            project_id=created_project.project_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_task = self.task_repo.create(task)

        # Delete the project
        self.project_repo.delete(created_project.project_id)

        # Task should also be deleted (cascade)
        deleted_task = self.task_repo.get_by_id(created_task.task_id)
        assert deleted_task is None


class TestTaskHierarchyRelationships:
    """Test task parent-child relationships"""

    def setup_method(self):
        """Setup test database and repositories"""
        self.db = get_enhanced_database()
        self.user_repo = UserRepository()
        self.project_repo = EnhancedProjectRepository()
        self.task_repo = EnhancedTaskRepository()

    def test_subtask_requires_valid_parent_task(self):
        """Test that subtasks require a valid parent task"""
        # Create user and project first
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        # Try to create subtask with non-existent parent
        subtask = Task(
            task_id=str(uuid4()),
            title="Test Subtask",
            description="Test Description",
            project_id=created_project.project_id,
            parent_id="non-existent-task-id",  # Invalid parent reference
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        # Should fail due to foreign key constraint
        with pytest.raises(Exception) as exc_info:
            self.task_repo.create(subtask)

        assert "foreign key" in str(exc_info.value).lower() or "constraint" in str(exc_info.value).lower()

    def test_subtask_creation_with_valid_parent_succeeds(self):
        """Test that subtasks can be created with valid parent"""
        # Create user and project
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        # Create parent task
        parent_task = Task(
            task_id=str(uuid4()),
            title="Parent Task",
            description="Parent Description",
            project_id=created_project.project_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_parent = self.task_repo.create(parent_task)

        # Create subtask with valid parent
        subtask = Task(
            task_id=str(uuid4()),
            title="Test Subtask",
            description="Test Description",
            project_id=created_project.project_id,
            parent_id=created_parent.task_id,  # Valid parent reference
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        created_subtask = self.task_repo.create(subtask)
        assert created_subtask.task_id == subtask.task_id
        assert created_subtask.parent_id == created_parent.task_id

    def test_cascade_delete_parent_task_removes_subtasks(self):
        """Test that deleting a parent task cascades to remove subtasks"""
        # Create user, project, parent task, and subtask
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        parent_task = Task(
            task_id=str(uuid4()),
            title="Parent Task",
            description="Parent Description",
            project_id=created_project.project_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_parent = self.task_repo.create(parent_task)

        subtask = Task(
            task_id=str(uuid4()),
            title="Test Subtask",
            description="Test Description",
            project_id=created_project.project_id,
            parent_id=created_parent.task_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_subtask = self.task_repo.create(subtask)

        # Delete parent task
        self.task_repo.delete(created_parent.task_id)

        # Subtask should also be deleted (cascade)
        deleted_subtask = self.task_repo.get_by_id(created_subtask.task_id)
        assert deleted_subtask is None


class TestUserAssignmentRelationships:
    """Test user assignment relationships in tasks and sessions"""

    def setup_method(self):
        """Setup test database and repositories"""
        self.db = get_enhanced_database()
        self.user_repo = UserRepository()
        self.project_repo = EnhancedProjectRepository()
        self.task_repo = EnhancedTaskRepository()
        self.focus_repo = FocusSessionRepository()

    def test_task_assignee_must_be_valid_user(self):
        """Test that task assignee must reference a valid user"""
        # Create user and project
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        # Try to create task with invalid assignee
        task = Task(
            task_id=str(uuid4()),
            title="Test Task",
            description="Test Description",
            project_id=created_project.project_id,
            assignee_id="non-existent-user-id",  # Invalid user reference
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        # Should fail due to foreign key constraint
        with pytest.raises(Exception) as exc_info:
            self.task_repo.create(task)

        assert "foreign key" in str(exc_info.value).lower() or "constraint" in str(exc_info.value).lower()

    def test_focus_session_user_must_be_valid(self):
        """Test that focus sessions must reference valid users"""
        # Try to create focus session with invalid user
        session = FocusSession(
            session_id=str(uuid4()),
            user_id="non-existent-user-id",  # Invalid user reference
            planned_duration_minutes=25,
            started_at=datetime.now()
        )

        # Should fail due to foreign key constraint
        with pytest.raises(Exception) as exc_info:
            self.focus_repo.create(session)

        assert "foreign key" in str(exc_info.value).lower() or "constraint" in str(exc_info.value).lower()


class TestAchievementRelationships:
    """Test achievement and user achievement relationships"""

    def setup_method(self):
        """Setup test database and repositories"""
        self.db = get_enhanced_database()
        self.user_repo = UserRepository()
        self.achievement_repo = AchievementRepository()
        self.user_achievement_repo = UserAchievementRepository()

    def test_user_achievement_requires_valid_user_and_achievement(self):
        """Test that user achievements require valid user and achievement references"""
        # Try to create user achievement with invalid references
        user_achievement = UserAchievement(
            user_achievement_id=str(uuid4()),
            user_id="non-existent-user-id",  # Invalid user reference
            achievement_id="non-existent-achievement-id",  # Invalid achievement reference
            progress=50.0,
            created_at=datetime.now()
        )

        # Should fail due to foreign key constraints
        with pytest.raises(Exception) as exc_info:
            self.user_achievement_repo.create(user_achievement)

        assert "foreign key" in str(exc_info.value).lower() or "constraint" in str(exc_info.value).lower()

    def test_user_achievement_creation_with_valid_references_succeeds(self):
        """Test that user achievements can be created with valid references"""
        # Create user
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        # Create achievement
        achievement = Achievement(
            achievement_id=str(uuid4()),
            name="Test Achievement",
            description="Test Description",
            category="test",
            criteria={"tasks_completed": 10},
            xp_reward=100,
            created_at=datetime.now()
        )
        created_achievement = self.achievement_repo.create(achievement)

        # Create user achievement with valid references
        user_achievement = UserAchievement(
            user_achievement_id=str(uuid4()),
            user_id=created_user.user_id,  # Valid user reference
            achievement_id=created_achievement.achievement_id,  # Valid achievement reference
            progress=50.0,
            created_at=datetime.now()
        )

        created_user_achievement = self.user_achievement_repo.create(user_achievement)
        assert created_user_achievement.user_id == created_user.user_id
        assert created_user_achievement.achievement_id == created_achievement.achievement_id

    def test_cascade_delete_user_removes_user_achievements(self):
        """Test that deleting a user cascades to remove their achievements"""
        # Create user and achievement
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        achievement = Achievement(
            achievement_id=str(uuid4()),
            name="Test Achievement",
            description="Test Description",
            category="test",
            criteria={"tasks_completed": 10},
            xp_reward=100,
            created_at=datetime.now()
        )
        created_achievement = self.achievement_repo.create(achievement)

        user_achievement = UserAchievement(
            user_achievement_id=str(uuid4()),
            user_id=created_user.user_id,
            achievement_id=created_achievement.achievement_id,
            progress=50.0,
            created_at=datetime.now()
        )
        created_user_achievement = self.user_achievement_repo.create(user_achievement)

        # Delete the user
        self.user_repo.delete(created_user.user_id)

        # User achievement should also be deleted (cascade)
        deleted_user_achievement = self.user_achievement_repo.get_by_id(created_user_achievement.user_achievement_id)
        assert deleted_user_achievement is None


class TestDataIntegrityConstraints:
    """Test data integrity and constraint validation"""

    def setup_method(self):
        """Setup test database and repositories"""
        self.db = get_enhanced_database()
        self.user_repo = UserRepository()
        self.project_repo = EnhancedProjectRepository()
        self.task_repo = EnhancedTaskRepository()

    def test_unique_constraint_enforcement(self):
        """Test that unique constraints are properly enforced"""
        # Create first user
        user1 = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user1 = self.user_repo.create(user1)

        # Try to create second user with same username
        user2 = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),  # Duplicate username
            email="different@example.com",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

        # Should fail due to unique constraint
        with pytest.raises(Exception) as exc_info:
            self.user_repo.create(user2)

        assert "unique" in str(exc_info.value).lower() or "constraint" in str(exc_info.value).lower()

    def test_not_null_constraint_enforcement(self):
        """Test that NOT NULL constraints are enforced"""
        # Try to create user without required fields
        with pytest.raises(Exception) as exc_info:
            # This should fail in Pydantic validation or database constraint
            user = User(
                user_id=str(uuid4()),
                username=None,  # Required field
                email=generate_unique_email(),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )

        # Should fail during validation or creation
        assert exc_info.value is not None

    def test_referential_integrity_across_complex_relationships(self):
        """Test referential integrity across multiple related entities"""
        # Create complete relationship chain: user -> project -> task -> subtask
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        parent_task = Task(
            task_id=str(uuid4()),
            title="Parent Task",
            description="Parent Description",
            project_id=created_project.project_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_parent = self.task_repo.create(parent_task)

        subtask = Task(
            task_id=str(uuid4()),
            title="Subtask",
            description="Subtask Description",
            project_id=created_project.project_id,
            parent_id=created_parent.task_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_subtask = self.task_repo.create(subtask)

        # All entities should be created successfully
        assert created_user.user_id == user.user_id
        assert created_project.owner_id == created_user.user_id
        assert created_parent.project_id == created_project.project_id
        assert created_subtask.parent_id == created_parent.task_id

        # Test cascade deletion from the top
        self.user_repo.delete(created_user.user_id)

        # All related entities should be deleted
        assert self.project_repo.get_by_id(created_project.project_id) is None
        assert self.task_repo.get_by_id(created_parent.task_id) is None
        assert self.task_repo.get_by_id(created_subtask.task_id) is None


class TestCascadeSetNullBehavior:
    """Test ON DELETE SET NULL cascade behavior for optional foreign keys"""

    def setup_method(self):
        """Setup test database and repositories"""
        self.db = get_enhanced_database()
        self.user_repo = UserRepository()
        self.project_repo = EnhancedProjectRepository()
        self.task_repo = EnhancedTaskRepository()

    def test_delete_assignee_sets_task_assignee_to_null(self):
        """Test that deleting a user sets task assignee_id to NULL (not cascade delete task)"""
        # Create two users
        owner = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_owner = self.user_repo.create(owner)

        assignee = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_assignee = self.user_repo.create(assignee)

        # Create project owned by first user
        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_owner.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        # Create task assigned to second user
        task = Task(
            task_id=str(uuid4()),
            title="Test Task",
            description="Test Description",
            project_id=created_project.project_id,
            assignee_id=created_assignee.user_id,  # Assigned to different user than owner
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_task = self.task_repo.create(task)

        # Delete the assignee user
        self.user_repo.delete(created_assignee.user_id)

        # Task should still exist (not cascade deleted)
        remaining_task = self.task_repo.get_by_id(created_task.task_id)
        assert remaining_task is not None

        # But assignee should be set to NULL (field name is 'assignee', not 'assignee_id')
        assert remaining_task.assignee is None

    def test_delete_parent_task_cascades_to_subtasks(self):
        """Test that deleting parent task cascades to delete all subtasks"""
        # Create user and project
        user = User(
            user_id=str(uuid4()),
            username=generate_unique_username(),
            email=generate_unique_email(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_user = self.user_repo.create(user)

        project = Project(
            project_id=str(uuid4()),
            name="Test Project",
            description="Test Description",
            owner_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_project = self.project_repo.create(project)

        # Create parent task
        parent = Task(
            task_id=str(uuid4()),
            title="Parent Task",
            description="Parent Description",
            project_id=created_project.project_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_parent = self.task_repo.create(parent)

        # Create multiple levels of subtasks
        subtask1 = Task(
            task_id=str(uuid4()),
            title="Subtask 1",
            description="Subtask 1 Description",
            project_id=created_project.project_id,
            parent_id=created_parent.task_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_subtask1 = self.task_repo.create(subtask1)

        subtask2 = Task(
            task_id=str(uuid4()),
            title="Subtask 2",
            description="Subtask 2 Description",
            project_id=created_project.project_id,
            parent_id=created_parent.task_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_subtask2 = self.task_repo.create(subtask2)

        # Create sub-subtask
        sub_subtask = Task(
            task_id=str(uuid4()),
            title="Sub-subtask",
            description="Sub-subtask Description",
            project_id=created_project.project_id,
            parent_id=created_subtask1.task_id,
            assignee_id=created_user.user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        created_sub_subtask = self.task_repo.create(sub_subtask)

        # Delete parent task
        self.task_repo.delete(created_parent.task_id)

        # All subtasks should be cascade deleted
        assert self.task_repo.get_by_id(created_subtask1.task_id) is None
        assert self.task_repo.get_by_id(created_subtask2.task_id) is None
        assert self.task_repo.get_by_id(created_sub_subtask.task_id) is None