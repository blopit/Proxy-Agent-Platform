"""
Tests for enhanced task models
"""

from datetime import datetime, timedelta
from decimal import Decimal
from uuid import uuid4

import pytest
from pydantic import ValidationError

from src.core.task_models import (
    Achievement,
    DependencyType,
    FocusSession,
    ProductivityMetrics,
    Project,
    Task,
    TaskComment,
    TaskDependency,
    TaskPriority,
    TaskStatus,
    TaskTemplate,
    User,
    UserAchievement,
)


class TestTaskModel:
    """Test the enhanced Task model"""

    def test_task_creation_with_required_fields(self):
        """Test task creation with minimum required fields"""
        task = Task(
            title="Test Task",
            description="A test task description",
            project_id=str(uuid4()),
        )

        assert task.title == "Test Task"
        assert task.description == "A test task description"
        assert task.status == TaskStatus.TODO
        assert task.priority == TaskPriority.MEDIUM
        assert task.estimated_hours is None
        assert task.actual_hours == Decimal("0.0")
        assert isinstance(task.task_id, str)
        assert isinstance(task.created_at, datetime)

    def test_task_with_all_fields(self):
        """Test task creation with all fields populated"""
        task_id = str(uuid4())
        project_id = str(uuid4())
        parent_id = str(uuid4())

        task = Task(
            task_id=task_id,
            title="Complex Task",
            description="A complex task with all fields",
            project_id=project_id,
            parent_id=parent_id,
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.HIGH,
            estimated_hours=Decimal("8.5"),
            actual_hours=Decimal("4.25"),
            tags=["urgent", "backend"],
            assignee="user123",
            due_date=datetime.now() + timedelta(days=7),
        )

        assert task.task_id == task_id
        assert task.title == "Complex Task"
        assert task.project_id == project_id
        assert task.parent_id == parent_id
        assert task.status == TaskStatus.IN_PROGRESS
        assert task.priority == TaskPriority.HIGH
        assert task.estimated_hours == Decimal("8.5")
        assert task.actual_hours == Decimal("4.25")
        assert task.tags == ["urgent", "backend"]
        assert task.assignee == "user123"

    def test_task_validation_empty_title(self):
        """Test that empty title raises validation error"""
        with pytest.raises(ValidationError):
            Task(title="", description="Test", project_id=str(uuid4()))

    def test_task_validation_negative_hours(self):
        """Test that negative hours raise validation error"""
        with pytest.raises(ValidationError):
            Task(
                title="Test",
                description="Test",
                project_id=str(uuid4()),
                estimated_hours=Decimal("-1.0"),
            )

    def test_task_progress_calculation(self):
        """Test progress calculation based on hours"""
        task = Task(
            title="Test Task",
            description="Test",
            project_id=str(uuid4()),
            estimated_hours=Decimal("10.0"),
            actual_hours=Decimal("3.0"),
        )

        assert task.progress_percentage == 30.0

    def test_task_progress_no_estimate(self):
        """Test progress when no estimate is provided"""
        task = Task(
            title="Test Task",
            description="Test",
            project_id=str(uuid4()),
            actual_hours=Decimal("5.0"),
        )

        assert task.progress_percentage == 0.0

    def test_task_is_overdue(self):
        """Test overdue detection"""
        # Task due yesterday
        overdue_task = Task(
            title="Overdue Task",
            description="Test",
            project_id=str(uuid4()),
            due_date=datetime.now() - timedelta(days=1),
            status=TaskStatus.IN_PROGRESS,
        )

        assert overdue_task.is_overdue is True

        # Task due tomorrow
        future_task = Task(
            title="Future Task",
            description="Test",
            project_id=str(uuid4()),
            due_date=datetime.now() + timedelta(days=1),
            status=TaskStatus.IN_PROGRESS,
        )

        assert future_task.is_overdue is False

        # Completed task
        completed_task = Task(
            title="Completed Task",
            description="Test",
            project_id=str(uuid4()),
            due_date=datetime.now() - timedelta(days=1),
            status=TaskStatus.COMPLETED,
        )

        assert completed_task.is_overdue is False


class TestProjectModel:
    """Test the Project model"""

    def test_project_creation(self):
        """Test project creation with required fields"""
        project = Project(
            name="Test Project",
            description="A test project",
        )

        assert project.name == "Test Project"
        assert project.description == "A test project"
        assert isinstance(project.project_id, str)
        assert isinstance(project.created_at, datetime)
        assert project.is_active is True

    def test_project_with_settings(self):
        """Test project with custom settings"""
        settings = {
            "default_priority": "high",
            "auto_assign": True,
            "notification_enabled": False,
        }

        project = Project(
            name="Custom Project",
            description="Project with settings",
            settings=settings,
        )

        assert project.settings == settings

    def test_project_validation_empty_name(self):
        """Test that empty name raises validation error"""
        with pytest.raises(ValidationError):
            Project(name="", description="Test")


class TestTaskTemplateModel:
    """Test the TaskTemplate model"""

    def test_template_creation(self):
        """Test template creation"""
        template = TaskTemplate(
            name="Bug Fix Template",
            title_template="Fix: {issue_description}",
            description_template="Bug report: {bug_details}\nSteps to reproduce: {steps}",
            default_priority=TaskPriority.HIGH,
            default_estimated_hours=Decimal("4.0"),
            default_tags=["bug", "fix"],
        )

        assert template.name == "Bug Fix Template"
        assert template.default_priority == TaskPriority.HIGH
        assert template.default_estimated_hours == Decimal("4.0")
        assert template.default_tags == ["bug", "fix"]

    def test_template_generate_task(self):
        """Test generating task from template"""
        template = TaskTemplate(
            name="Feature Template",
            title_template="Implement: {feature_name}",
            description_template="Feature: {feature_name}\nRequirements: {requirements}",
            default_priority=TaskPriority.MEDIUM,
            default_estimated_hours=Decimal("8.0"),
            default_tags=["feature"],
        )

        variables = {
            "feature_name": "User Authentication",
            "requirements": "OAuth2 integration with JWT tokens",
        }

        task_data = template.generate_task_data(str(uuid4()), variables)

        assert task_data["title"] == "Implement: User Authentication"
        assert "OAuth2 integration" in task_data["description"]
        assert task_data["priority"] == TaskPriority.MEDIUM
        assert task_data["estimated_hours"] == Decimal("8.0")
        assert task_data["tags"] == ["feature"]


class TestTaskDependencyModel:
    """Test the TaskDependency model"""

    def test_dependency_creation(self):
        """Test dependency creation"""
        dependency = TaskDependency(
            task_id=str(uuid4()),
            depends_on_task_id=str(uuid4()),
            dependency_type=DependencyType.BLOCKS,
        )

        assert dependency.dependency_type == DependencyType.BLOCKS
        assert isinstance(dependency.created_at, datetime)

    def test_dependency_validation_self_reference(self):
        """Test that self-referencing dependencies are invalid"""
        task_id = str(uuid4())

        with pytest.raises(ValueError, match="Task cannot depend on itself"):
            TaskDependency(
                task_id=task_id,
                depends_on_task_id=task_id,
                dependency_type=DependencyType.BLOCKS,
            )


class TestTaskCommentModel:
    """Test the TaskComment model"""

    def test_comment_creation(self):
        """Test comment creation"""
        comment = TaskComment(
            task_id=str(uuid4()),
            author="user123",
            content="This is a test comment",
        )

        assert comment.author == "user123"
        assert comment.content == "This is a test comment"
        assert isinstance(comment.created_at, datetime)

    def test_comment_validation_empty_content(self):
        """Test that empty content raises validation error"""
        with pytest.raises(ValidationError):
            TaskComment(
                task_id=str(uuid4()),
                author="user123",
                content="",
            )


class TestTaskModelAdvanced:
    """Advanced test scenarios for Task model"""

    def test_task_completion_workflow(self):
        """Test complete task workflow from creation to completion"""
        task = Task(
            title="Workflow Test Task",
            description="Testing workflow",
            project_id=str(uuid4()),
            status=TaskStatus.TODO,
            estimated_hours=Decimal("5.0"),
        )

        # Start task
        task.status = TaskStatus.IN_PROGRESS
        assert task.status == TaskStatus.IN_PROGRESS
        assert task.progress_percentage == 0.0

        # Add some hours
        task.actual_hours = Decimal("2.5")
        assert task.progress_percentage == 50.0

        # Complete task
        task.status = TaskStatus.COMPLETED
        task.actual_hours = Decimal("4.5")
        assert task.status == TaskStatus.COMPLETED
        assert not task.is_overdue  # Completed tasks are never overdue

    def test_task_hierarchy_validation(self):
        """Test parent-child task relationships"""
        parent_task = Task(
            title="Parent Task",
            description="Parent",
            project_id=str(uuid4()),
        )

        child_task = Task(
            title="Child Task",
            description="Child",
            project_id=parent_task.project_id,
            parent_id=parent_task.task_id,
        )

        assert child_task.parent_id == parent_task.task_id
        assert child_task.project_id == parent_task.project_id

    def test_task_tags_functionality(self):
        """Test task tagging and filtering capabilities"""
        task = Task(
            title="Tagged Task",
            description="Task with tags",
            project_id=str(uuid4()),
            tags=["urgent", "backend", "api"],
        )

        assert "urgent" in task.tags
        assert "backend" in task.tags
        assert "frontend" not in task.tags
        assert len(task.tags) == 3

    def test_task_time_tracking_precision(self):
        """Test precise time tracking with decimal hours"""
        task = Task(
            title="Time Tracking Task",
            description="Testing time precision",
            project_id=str(uuid4()),
            estimated_hours=Decimal("2.25"),  # 2 hours 15 minutes
            actual_hours=Decimal("1.75"),  # 1 hour 45 minutes
        )

        assert task.estimated_hours == Decimal("2.25")
        assert task.actual_hours == Decimal("1.75")
        # Progress: 1.75 / 2.25 * 100 = 77.77...
        assert abs(task.progress_percentage - 77.78) < 0.01

    def test_task_edge_cases(self):
        """Test edge cases and boundary conditions"""
        # Task with zero estimated hours
        task_no_estimate = Task(
            title="No Estimate",
            description="Task without estimate",
            project_id=str(uuid4()),
            estimated_hours=None,
            actual_hours=Decimal("3.0"),
        )
        assert task_no_estimate.progress_percentage == 0.0

        # Task with exact completion
        task_exact = Task(
            title="Exact Task",
            description="Exactly estimated",
            project_id=str(uuid4()),
            estimated_hours=Decimal("5.0"),
            actual_hours=Decimal("5.0"),
        )
        assert task_exact.progress_percentage == 100.0

        # Task over-estimate
        task_over = Task(
            title="Over Task",
            description="Over estimated",
            project_id=str(uuid4()),
            estimated_hours=Decimal("3.0"),
            actual_hours=Decimal("4.5"),
        )
        assert task_over.progress_percentage == 150.0


class TestProjectModelAdvanced:
    """Advanced test scenarios for Project model"""

    def test_project_settings_defaults(self):
        """Test project with default settings"""
        project = Project(
            name="Default Settings Project",
            description="Testing defaults",
        )

        assert project.settings == {}
        assert project.is_active is True

    def test_project_settings_complex(self):
        """Test complex project settings structure"""
        complex_settings = {
            "notifications": {"email": True, "slack": False, "frequency": "daily"},
            "defaults": {"priority": "medium", "estimated_hours": 4.0, "assignee": "team_lead"},
            "automation": {"auto_close_completed": True, "auto_assign_new": False},
        }

        project = Project(
            name="Complex Project",
            description="Project with complex settings",
            settings=complex_settings,
        )

        assert project.settings["notifications"]["email"] is True
        assert project.settings["defaults"]["priority"] == "medium"
        assert project.settings["automation"]["auto_close_completed"] is True

    def test_project_lifecycle(self):
        """Test project activation/deactivation"""
        project = Project(
            name="Lifecycle Project",
            description="Testing lifecycle",
        )

        # Project starts active
        assert project.is_active is True

        # Deactivate project
        project.is_active = False
        assert project.is_active is False


class TestTaskTemplateAdvanced:
    """Advanced test scenarios for TaskTemplate model"""

    def test_template_variable_substitution_complex(self):
        """Test complex variable substitution in templates"""
        template = TaskTemplate(
            name="Complex Template",
            title_template="[{priority}] {type}: {title} (Est: {hours}h)",
            description_template="""
Type: {type}
Priority: {priority}
Description: {description}
Acceptance Criteria:
{criteria}

Technical Notes:
{tech_notes}
            """.strip(),
            default_priority=TaskPriority.MEDIUM,
            default_estimated_hours=Decimal("6.0"),
        )

        variables = {
            "priority": "HIGH",
            "type": "Feature",
            "title": "User Authentication",
            "hours": "8",
            "description": "Implement secure user authentication",
            "criteria": "- Users can login\n- Passwords are hashed\n- Sessions expire",
            "tech_notes": "Use JWT tokens, bcrypt for hashing",
        }

        task_data = template.generate_task_data(str(uuid4()), variables)

        expected_title = "[HIGH] Feature: User Authentication (Est: 8h)"
        assert task_data["title"] == expected_title
        assert "Use JWT tokens" in task_data["description"]
        assert "Users can login" in task_data["description"]

    def test_template_missing_variables(self):
        """Test template generation with missing variables"""
        template = TaskTemplate(
            name="Missing Vars Template",
            title_template="Task: {title} - {missing_var}",
            description_template="Description: {description}",
        )

        variables = {
            "title": "Test Task",
            "description": "Test Description",
            # missing_var intentionally omitted
        }

        task_data = template.generate_task_data(str(uuid4()), variables)

        # Should preserve placeholder for missing variables
        assert "${missing_var}" in task_data["title"]
        assert "Test Task" in task_data["title"]
        assert task_data["description"] == "Description: Test Description"


class TestTaskIntegrationScenarios:
    """Integration test scenarios combining multiple models"""

    def test_project_with_multiple_tasks(self):
        """Test project containing multiple related tasks"""
        project = Project(
            name="Integration Project",
            description="Project for integration testing",
        )

        # Create parent task
        parent_task = Task(
            title="Parent Feature",
            description="Main feature implementation",
            project_id=project.project_id,
            priority=TaskPriority.HIGH,
            estimated_hours=Decimal("20.0"),
        )

        # Create child tasks
        child_tasks = []
        for i in range(3):
            child_task = Task(
                title=f"Subtask {i + 1}",
                description=f"Subtask {i + 1} description",
                project_id=project.project_id,
                parent_id=parent_task.task_id,
                estimated_hours=Decimal("6.0"),
            )
            child_tasks.append(child_task)

        # Verify relationships
        assert all(task.project_id == project.project_id for task in child_tasks)
        assert all(task.parent_id == parent_task.task_id for task in child_tasks)

    def test_task_dependency_chain(self):
        """Test complex task dependency chains"""
        project_id = str(uuid4())

        # Create a chain of dependent tasks
        task_a = Task(
            title="Task A - Foundation",
            description="Foundation task",
            project_id=project_id,
        )

        task_b = Task(
            title="Task B - Depends on A",
            description="Second task",
            project_id=project_id,
        )

        task_c = Task(
            title="Task C - Depends on B",
            description="Third task",
            project_id=project_id,
        )

        # Create dependencies
        dep_a_b = TaskDependency(
            task_id=task_b.task_id,
            depends_on_task_id=task_a.task_id,
            dependency_type=DependencyType.BLOCKS,
        )

        dep_b_c = TaskDependency(
            task_id=task_c.task_id,
            depends_on_task_id=task_b.task_id,
            dependency_type=DependencyType.BLOCKS,
        )

        # Verify dependency chain
        assert dep_a_b.depends_on_task_id == task_a.task_id
        assert dep_a_b.task_id == task_b.task_id
        assert dep_b_c.depends_on_task_id == task_b.task_id
        assert dep_b_c.task_id == task_c.task_id

    def test_template_to_task_workflow(self):
        """Test complete workflow from template to task creation"""
        # Create project
        project = Project(
            name="Template Workflow Project",
            description="Testing template workflow",
        )

        # Create template
        template = TaskTemplate(
            name="Bug Fix Workflow",
            title_template="🐛 Fix: {bug_title}",
            description_template="""
**Bug Report**
Issue: {bug_title}
Severity: {severity}
Steps to Reproduce: {reproduction_steps}
Expected Behavior: {expected}
Actual Behavior: {actual}

**Solution Plan**
{solution_plan}
            """.strip(),
            default_priority=TaskPriority.HIGH,
            default_estimated_hours=Decimal("4.0"),
            default_tags=["bug", "urgent"],
        )

        # Generate task from template
        bug_variables = {
            "bug_title": "Login form validation error",
            "severity": "High",
            "reproduction_steps": "1. Enter invalid email\n2. Click submit\n3. No error shown",
            "expected": "Validation error should appear",
            "actual": "Form submits with invalid data",
            "solution_plan": "Add client-side validation and server-side checks",
        }

        task_data = template.generate_task_data(project.project_id, bug_variables)

        # Create actual task
        bug_task = Task(**task_data)

        # Verify task creation from template
        assert bug_task.title == "🐛 Fix: Login form validation error"
        assert bug_task.priority == TaskPriority.HIGH
        assert bug_task.estimated_hours == Decimal("4.0")
        assert "bug" in bug_task.tags
        assert "urgent" in bug_task.tags
        assert "client-side validation" in bug_task.description
        assert bug_task.project_id == project.project_id


class TestUserModel:
    """Test the User model"""

    def test_user_creation(self):
        """Test user creation with valid data"""
        user = User(
            username="testuser",
            email="test@example.com",
            full_name="Test User",
        )

        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.is_active is True
        assert user.timezone == "UTC"
        assert isinstance(user.user_id, str)

    def test_user_email_validation(self):
        """Test email validation"""
        # Valid email
        user = User(username="test", email="valid@example.com")
        assert user.email == "valid@example.com"

        # Invalid email
        with pytest.raises(ValidationError):
            User(username="test", email="invalid-email")

    def test_username_validation(self):
        """Test username validation"""
        # Valid username
        user = User(username="valid_user123", email="test@example.com")
        assert user.username == "valid_user123"

        # Empty username
        with pytest.raises(ValidationError):
            User(username="", email="test@example.com")

        # Invalid characters
        with pytest.raises(ValidationError):
            User(username="invalid-user!", email="test@example.com")

    def test_user_preferences(self):
        """Test user preferences handling"""
        preferences = {"theme": "dark", "notifications": True, "default_focus_time": 25}

        user = User(username="testuser", email="test@example.com", preferences=preferences)

        assert user.preferences["theme"] == "dark"
        assert user.preferences["notifications"] is True
        assert user.preferences["default_focus_time"] == 25


class TestFocusSessionModel:
    """Test the FocusSession model"""

    def test_focus_session_creation(self):
        """Test focus session creation"""
        user_id = str(uuid4())
        task_id = str(uuid4())

        session = FocusSession(
            user_id=user_id, task_id=task_id, planned_duration_minutes=25, session_type="focus"
        )

        assert session.user_id == user_id
        assert session.task_id == task_id
        assert session.planned_duration_minutes == 25
        assert session.session_type == "focus"
        assert session.is_active is True
        assert session.was_completed is False

    def test_focus_session_completion(self):
        """Test focus session completion"""
        session = FocusSession(user_id=str(uuid4()), planned_duration_minutes=25)

        # Complete session
        session.complete_session(productivity_score=85.0)

        assert session.was_completed is True
        assert session.productivity_score == 85.0
        assert session.ended_at is not None
        assert session.actual_duration_minutes is not None
        assert session.is_active is False

    def test_focus_session_validation(self):
        """Test focus session validation"""
        # Invalid duration (too short)
        with pytest.raises(ValidationError):
            FocusSession(user_id=str(uuid4()), planned_duration_minutes=0)

        # Invalid duration (too long)
        with pytest.raises(ValidationError):
            FocusSession(user_id=str(uuid4()), planned_duration_minutes=500)

    def test_focus_session_double_completion(self):
        """Test that completing session twice raises error"""
        session = FocusSession(user_id=str(uuid4()), planned_duration_minutes=25)

        session.complete_session()

        # Attempting to complete again should raise error
        with pytest.raises(ValueError, match="Session already completed"):
            session.complete_session()


class TestAchievementModel:
    """Test the Achievement model"""

    def test_achievement_creation(self):
        """Test achievement creation"""
        achievement = Achievement(
            name="First Task",
            description="Complete your first task",
            category="tasks",
            criteria={"tasks_completed": 1},
            xp_reward=100,
            badge_icon="🎯",
            rarity="common",
        )

        assert achievement.name == "First Task"
        assert achievement.category == "tasks"
        assert achievement.criteria["tasks_completed"] == 1
        assert achievement.xp_reward == 100
        assert achievement.badge_icon == "🎯"
        assert achievement.rarity == "common"
        assert achievement.is_active is True

    def test_achievement_validation(self):
        """Test achievement validation"""
        # Empty name should fail
        with pytest.raises(ValidationError):
            Achievement(name="", description="Test", category="tasks", criteria={})

        # Negative XP should fail
        with pytest.raises(ValidationError):
            Achievement(
                name="Test", description="Test", category="tasks", criteria={}, xp_reward=-10
            )


class TestUserAchievementModel:
    """Test the UserAchievement model"""

    def test_user_achievement_creation(self):
        """Test user achievement creation"""
        user_id = str(uuid4())
        achievement_id = str(uuid4())

        user_achievement = UserAchievement(
            user_id=user_id, achievement_id=achievement_id, progress=50.0
        )

        assert user_achievement.user_id == user_id
        assert user_achievement.achievement_id == achievement_id
        assert user_achievement.progress == 50.0
        assert user_achievement.is_completed is False
        assert user_achievement.earned_at is None

    def test_user_achievement_completion(self):
        """Test user achievement completion"""
        user_achievement = UserAchievement(
            user_id=str(uuid4()), achievement_id=str(uuid4()), progress=90.0
        )

        # Complete achievement
        user_achievement.complete_achievement()

        assert user_achievement.is_completed is True
        assert user_achievement.progress == 100.0
        assert user_achievement.earned_at is not None

        # Completing again should not change anything
        earned_time = user_achievement.earned_at
        user_achievement.complete_achievement()
        assert user_achievement.earned_at == earned_time


class TestProductivityMetricsModel:
    """Test the ProductivityMetrics model"""

    def test_productivity_metrics_creation(self):
        """Test productivity metrics creation"""
        user_id = str(uuid4())
        date = datetime.now()

        metrics = ProductivityMetrics(
            user_id=user_id,
            date=date,
            tasks_created=10,
            tasks_completed=8,
            total_focus_time=180,  # 3 hours
            focus_sessions_completed=6,
            focus_sessions_started=8,
            xp_earned=500,
        )

        assert metrics.user_id == user_id
        assert metrics.date == date
        assert metrics.tasks_created == 10
        assert metrics.tasks_completed == 8
        assert metrics.total_focus_time == 180
        assert metrics.xp_earned == 500

    def test_productivity_metrics_calculations(self):
        """Test productivity metrics calculations"""
        metrics = ProductivityMetrics(
            user_id=str(uuid4()),
            date=datetime.now(),
            tasks_created=10,
            tasks_completed=8,
            focus_sessions_started=10,
            focus_sessions_completed=7,
        )

        # Test calculated properties
        assert metrics.task_completion_rate == 80.0
        assert metrics.focus_completion_rate == 70.0

        # Test derived metrics calculation
        metrics.calculate_derived_metrics()
        assert metrics.completion_rate == 80.0
        assert metrics.focus_efficiency == 70.0

    def test_productivity_metrics_edge_cases(self):
        """Test productivity metrics edge cases"""
        # Zero tasks created
        metrics = ProductivityMetrics(
            user_id=str(uuid4()), date=datetime.now(), tasks_created=0, tasks_completed=5
        )
        assert metrics.task_completion_rate == 0.0

        # Zero focus sessions started
        metrics.focus_sessions_started = 0
        metrics.focus_sessions_completed = 3
        assert metrics.focus_completion_rate == 0.0

    def test_productivity_metrics_validation(self):
        """Test productivity metrics validation"""
        # Negative values should fail
        with pytest.raises(ValidationError):
            ProductivityMetrics(user_id=str(uuid4()), date=datetime.now(), tasks_created=-1)

        with pytest.raises(ValidationError):
            ProductivityMetrics(user_id=str(uuid4()), date=datetime.now(), xp_earned=-100)


class TestNewModelsIntegration:
    """Integration tests for new models working together"""

    def test_user_task_focus_workflow(self):
        """Test complete workflow: user creates task, starts focus session"""
        # Create user
        user = User(username="productive_user", email="user@example.com")

        # Create project and task
        project = Project(name="Personal Productivity", description="Personal tasks")

        task = Task(
            title="Learn Python",
            description="Study Python for 2 hours",
            project_id=project.project_id,
            estimated_hours=Decimal("2.0"),
        )

        # Start focus session for task
        focus_session = FocusSession(
            user_id=user.user_id,
            task_id=task.task_id,
            project_id=project.project_id,
            planned_duration_minutes=120,
        )

        # Complete focus session
        focus_session.complete_session(productivity_score=90.0)

        # Add time to task
        task.add_time(Decimal("2.0"))
        task.mark_completed()

        # Verify workflow
        assert focus_session.was_completed is True
        assert focus_session.productivity_score == 90.0
        assert task.status == TaskStatus.COMPLETED
        assert task.progress_percentage == 100.0

    def test_achievement_system_workflow(self):
        """Test achievement system workflow"""
        # Create achievement
        achievement = Achievement(
            name="Task Master",
            description="Complete 10 tasks",
            category="tasks",
            criteria={"tasks_completed": 10},
            xp_reward=500,
            rarity="rare",
        )

        # Create user achievement
        user_achievement = UserAchievement(
            user_id=str(uuid4()), achievement_id=achievement.achievement_id, progress=90.0
        )

        # Complete achievement
        user_achievement.complete_achievement()

        assert user_achievement.is_completed is True
        assert user_achievement.progress == 100.0

    def test_productivity_tracking_workflow(self):
        """Test productivity tracking workflow"""
        user_id = str(uuid4())
        today = datetime.now()

        # Create daily metrics
        metrics = ProductivityMetrics(
            user_id=user_id,
            date=today,
            tasks_created=5,
            tasks_completed=4,
            total_focus_time=150,
            focus_sessions_started=6,
            focus_sessions_completed=5,
            xp_earned=300,
            achievements_unlocked=1,
        )

        metrics.calculate_derived_metrics()

        # Verify comprehensive tracking
        assert metrics.task_completion_rate == 80.0
        assert abs(metrics.focus_completion_rate - 83.33) < 0.01  # 5/6 * 100
        assert metrics.completion_rate == 80.0
        assert abs(metrics.focus_efficiency - 83.33) < 0.01
