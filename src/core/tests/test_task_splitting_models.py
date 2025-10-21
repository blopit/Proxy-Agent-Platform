"""
TDD Tests for Epic 7 Task Splitting Models - RED PHASE

Test-Driven Development for:
- TaskScope enum
- DelegationMode enum
- MicroStep model
- Extended Task model with micro-step support

Following TDD RED-GREEN-REFACTOR methodology:
1. RED: Write failing tests first (this file)
2. GREEN: Implement minimum code to pass tests
3. REFACTOR: Improve code quality while keeping tests green
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from pydantic import ValidationError

# These imports will FAIL initially - that's expected in RED phase
from src.core.task_models import (
    Task,
    TaskStatus,
    TaskPriority,
    TaskScope,  # NEW - will fail
    DelegationMode,  # NEW - will fail
    MicroStep,  # NEW - will fail
)


class TestTaskScope:
    """Test TaskScope enum for categorizing task complexity"""

    def test_task_scope_enum_exists(self):
        """Test that TaskScope enum is defined"""
        # This will FAIL - TaskScope doesn't exist yet
        assert hasattr(TaskScope, 'SIMPLE')
        assert hasattr(TaskScope, 'MULTI')
        assert hasattr(TaskScope, 'PROJECT')

    def test_task_scope_values(self):
        """Test TaskScope enum values match specification"""
        assert TaskScope.SIMPLE.value == "simple"
        assert TaskScope.MULTI.value == "multi"
        assert TaskScope.PROJECT.value == "project"

    def test_task_scope_is_string_enum(self):
        """Test that TaskScope is a string enum"""
        assert isinstance(TaskScope.SIMPLE.value, str)


class TestDelegationMode:
    """Test DelegationMode enum for 4D system"""

    def test_delegation_mode_enum_exists(self):
        """Test that DelegationMode enum is defined"""
        # This will FAIL - DelegationMode doesn't exist yet
        assert hasattr(DelegationMode, 'DO')
        assert hasattr(DelegationMode, 'DO_WITH_ME')
        assert hasattr(DelegationMode, 'DELEGATE')
        assert hasattr(DelegationMode, 'DELETE')

    def test_delegation_mode_values(self):
        """Test DelegationMode enum values match specification"""
        assert DelegationMode.DO.value == "do"
        assert DelegationMode.DO_WITH_ME.value == "do_with_me"
        assert DelegationMode.DELEGATE.value == "delegate"
        assert DelegationMode.DELETE.value == "delete"

    def test_delegation_mode_is_string_enum(self):
        """Test that DelegationMode is a string enum"""
        assert isinstance(DelegationMode.DO.value, str)


class TestMicroStep:
    """Test MicroStep model for 2-5 minute actionable steps"""

    def test_microstep_creation_minimal(self):
        """Test creating MicroStep with minimal required fields"""
        # This will FAIL - MicroStep doesn't exist yet
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Review project requirements",
            estimated_minutes=3
        )

        assert step.parent_task_id == "task_123"
        assert step.step_number == 1
        assert step.description == "Review project requirements"
        assert step.estimated_minutes == 3

    def test_microstep_has_default_step_id(self):
        """Test that MicroStep generates default step_id"""
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Test step",
            estimated_minutes=2
        )

        assert step.step_id is not None
        assert isinstance(step.step_id, str)
        assert len(step.step_id) > 0

    def test_microstep_default_status_is_todo(self):
        """Test that new MicroStep defaults to TODO status"""
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Test step",
            estimated_minutes=2
        )

        assert step.status == TaskStatus.TODO

    def test_microstep_estimated_minutes_range(self):
        """Test that estimated_minutes must be between 1-10 minutes"""
        # Valid: 2-5 minutes (target range)
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Quick task",
            estimated_minutes=3
        )
        assert step.estimated_minutes == 3

        # Valid: edge cases (1-10 minutes allowed)
        step_min = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Very quick task",
            estimated_minutes=1
        )
        assert step_min.estimated_minutes == 1

        step_max = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Longer micro-step",
            estimated_minutes=10
        )
        assert step_max.estimated_minutes == 10

    def test_microstep_estimated_minutes_validation_fails_below_minimum(self):
        """Test that estimated_minutes < 1 raises validation error"""
        with pytest.raises(ValidationError):
            MicroStep(
                parent_task_id="task_123",
                step_number=1,
                description="Invalid step",
                estimated_minutes=0
            )

    def test_microstep_estimated_minutes_validation_fails_above_maximum(self):
        """Test that estimated_minutes > 10 raises validation error"""
        with pytest.raises(ValidationError):
            MicroStep(
                parent_task_id="task_123",
                step_number=1,
                description="Too long step",
                estimated_minutes=11
            )

    def test_microstep_description_required(self):
        """Test that description is required"""
        with pytest.raises(ValueError):
            MicroStep(
                parent_task_id="task_123",
                step_number=1,
                description="",  # Empty string should fail
                estimated_minutes=3
            )

    def test_microstep_description_stripped(self):
        """Test that description whitespace is stripped"""
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="  Whitespace test  ",
            estimated_minutes=3
        )

        assert step.description == "Whitespace test"

    def test_microstep_delegation_mode_optional(self):
        """Test that delegation_mode is optional with default DO"""
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Test step",
            estimated_minutes=3
        )

        assert step.delegation_mode == DelegationMode.DO

    def test_microstep_delegation_mode_can_be_set(self):
        """Test that delegation_mode can be explicitly set"""
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Delegate to assistant",
            estimated_minutes=5,
            delegation_mode=DelegationMode.DELEGATE
        )

        assert step.delegation_mode == DelegationMode.DELEGATE

    def test_microstep_has_timestamps(self):
        """Test that MicroStep has created_at and completed_at timestamps"""
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Test step",
            estimated_minutes=3
        )

        assert step.created_at is not None
        assert isinstance(step.created_at, datetime)
        assert step.completed_at is None  # Not completed yet

    def test_microstep_mark_completed_method(self):
        """Test marking MicroStep as completed"""
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Test step",
            estimated_minutes=3
        )

        # Initially not completed
        assert step.status == TaskStatus.TODO
        assert step.completed_at is None

        # Mark as completed
        step.mark_completed()

        # Verify completion
        assert step.status == TaskStatus.COMPLETED
        assert step.completed_at is not None
        assert isinstance(step.completed_at, datetime)

    def test_microstep_actual_minutes_tracked(self):
        """Test that actual_minutes is tracked for completed micro-steps"""
        step = MicroStep(
            parent_task_id="task_123",
            step_number=1,
            description="Test step",
            estimated_minutes=3
        )

        # Initially no actual time
        assert step.actual_minutes is None or step.actual_minutes == 0

        # Mark as completed (should auto-calculate or allow setting actual time)
        step.mark_completed()

        # Could be auto-calculated from created_at to completed_at
        # or set manually - implementation can decide
        assert step.completed_at is not None


class TestTaskWithMicroSteps:
    """Test extended Task model with micro-step support"""

    def test_task_has_scope_field(self):
        """Test that Task model has scope field"""
        # This will FAIL - Task doesn't have scope field yet
        task = Task(
            title="Test Task",
            description="Test Description",
            project_id="project_123",
            scope=TaskScope.SIMPLE
        )

        assert task.scope == TaskScope.SIMPLE

    def test_task_scope_defaults_to_simple(self):
        """Test that Task scope defaults to SIMPLE"""
        task = Task(
            title="Test Task",
            description="Test Description",
            project_id="project_123"
        )

        assert task.scope == TaskScope.SIMPLE

    def test_task_has_micro_steps_field(self):
        """Test that Task model has micro_steps list field"""
        task = Task(
            title="Test Task",
            description="Test Description",
            project_id="project_123"
        )

        assert hasattr(task, 'micro_steps')
        assert isinstance(task.micro_steps, list)
        assert len(task.micro_steps) == 0  # Empty by default

    def test_task_has_is_micro_step_flag(self):
        """Test that Task model has is_micro_step boolean flag"""
        task = Task(
            title="Test Task",
            description="Test Description",
            project_id="project_123"
        )

        assert hasattr(task, 'is_micro_step')
        assert isinstance(task.is_micro_step, bool)
        assert task.is_micro_step is False  # Regular task by default

    def test_task_can_be_marked_as_micro_step(self):
        """Test that Task can be explicitly marked as a micro-step"""
        task = Task(
            title="Micro Task",
            description="This is actually a micro-step",
            project_id="project_123",
            is_micro_step=True
        )

        assert task.is_micro_step is True

    def test_task_has_delegation_mode_field(self):
        """Test that Task model has delegation_mode field"""
        task = Task(
            title="Test Task",
            description="Test Description",
            project_id="project_123",
            delegation_mode=DelegationMode.DELEGATE
        )

        assert task.delegation_mode == DelegationMode.DELEGATE

    def test_task_delegation_mode_defaults_to_do(self):
        """Test that Task delegation_mode defaults to DO"""
        task = Task(
            title="Test Task",
            description="Test Description",
            project_id="project_123"
        )

        assert task.delegation_mode == DelegationMode.DO

    def test_task_can_have_micro_steps_added(self):
        """Test adding MicroStep objects to Task"""
        task = Task(
            title="Complex Task",
            description="A task that needs breaking down",
            project_id="project_123",
            scope=TaskScope.MULTI
        )

        # Add micro-steps
        step1 = MicroStep(
            parent_task_id=task.task_id,
            step_number=1,
            description="First micro-step",
            estimated_minutes=3
        )

        step2 = MicroStep(
            parent_task_id=task.task_id,
            step_number=2,
            description="Second micro-step",
            estimated_minutes=4
        )

        task.micro_steps.append(step1)
        task.micro_steps.append(step2)

        assert len(task.micro_steps) == 2
        assert task.micro_steps[0].step_number == 1
        assert task.micro_steps[1].step_number == 2

    def test_task_total_estimated_minutes_from_micro_steps(self):
        """Test calculating total estimated time from micro-steps"""
        task = Task(
            title="Complex Task",
            description="Task with micro-steps",
            project_id="project_123",
            scope=TaskScope.MULTI
        )

        # Add micro-steps
        task.micro_steps = [
            MicroStep(
                parent_task_id=task.task_id,
                step_number=1,
                description="Step 1",
                estimated_minutes=3
            ),
            MicroStep(
                parent_task_id=task.task_id,
                step_number=2,
                description="Step 2",
                estimated_minutes=4
            ),
            MicroStep(
                parent_task_id=task.task_id,
                step_number=3,
                description="Step 3",
                estimated_minutes=2
            ),
        ]

        # Should have helper method to calculate total
        total_minutes = task.calculate_micro_steps_duration()

        assert total_minutes == 9  # 3 + 4 + 2

    def test_task_micro_step_completion_progress(self):
        """Test tracking completion progress through micro-steps"""
        task = Task(
            title="Complex Task",
            description="Task with micro-steps",
            project_id="project_123",
            scope=TaskScope.MULTI
        )

        # Add 3 micro-steps
        task.micro_steps = [
            MicroStep(
                parent_task_id=task.task_id,
                step_number=i,
                description=f"Step {i}",
                estimated_minutes=3
            )
            for i in range(1, 4)
        ]

        # Initially 0% complete
        progress = task.micro_steps_progress_percentage
        assert progress == 0.0

        # Complete first step
        task.micro_steps[0].mark_completed()
        progress = task.micro_steps_progress_percentage
        assert progress == pytest.approx(33.33, rel=1e-2)

        # Complete second step
        task.micro_steps[1].mark_completed()
        progress = task.micro_steps_progress_percentage
        assert progress == pytest.approx(66.66, rel=1e-2)

        # Complete third step
        task.micro_steps[2].mark_completed()
        progress = task.micro_steps_progress_percentage
        assert progress == 100.0


class TestTaskScopeDetermination:
    """Test automatic task scope determination logic"""

    def test_simple_task_estimated_under_10_minutes(self):
        """Test that tasks under 10 minutes are SIMPLE scope"""
        task = Task(
            title="Quick task",
            description="Very simple task",
            project_id="project_123",
            estimated_hours=Decimal("0.1")  # 6 minutes
        )

        # Helper method to determine scope
        determined_scope = task.determine_scope()
        assert determined_scope == TaskScope.SIMPLE

    def test_multi_task_estimated_10_to_60_minutes(self):
        """Test that tasks 10-60 minutes are MULTI scope"""
        task = Task(
            title="Medium task",
            description="Needs a few steps",
            project_id="project_123",
            estimated_hours=Decimal("0.5")  # 30 minutes
        )

        determined_scope = task.determine_scope()
        assert determined_scope == TaskScope.MULTI

    def test_project_task_estimated_over_60_minutes(self):
        """Test that tasks over 60 minutes are PROJECT scope"""
        task = Task(
            title="Large project",
            description="Complex multi-step project",
            project_id="project_123",
            estimated_hours=Decimal("2.0")  # 120 minutes
        )

        determined_scope = task.determine_scope()
        assert determined_scope == TaskScope.PROJECT

    def test_scope_determination_with_no_estimate(self):
        """Test scope determination when no estimate provided"""
        task = Task(
            title="Unknown complexity",
            description="No estimate yet",
            project_id="project_123"
        )

        # Should default to SIMPLE or analyze description
        determined_scope = task.determine_scope()
        assert determined_scope in [TaskScope.SIMPLE, TaskScope.MULTI, TaskScope.PROJECT]


# Integration test combining all features
class TestEpic7Integration:
    """Integration tests for Epic 7 task splitting features"""

    def test_create_task_split_into_micro_steps_workflow(self):
        """Test complete workflow: create task → determine scope → split into micro-steps"""
        # 1. Create a MULTI-scope task
        task = Task(
            title="Implement login feature",
            description="Add user authentication with email and password",
            project_id="project_123",
            estimated_hours=Decimal("0.5")  # 30 minutes
        )

        # 2. Determine scope (should be MULTI)
        task.scope = task.determine_scope()
        assert task.scope == TaskScope.MULTI

        # 3. Task gets split into micro-steps (by Split Proxy Agent)
        task.micro_steps = [
            MicroStep(
                parent_task_id=task.task_id,
                step_number=1,
                description="Create login form UI",
                estimated_minutes=5,
                delegation_mode=DelegationMode.DO
            ),
            MicroStep(
                parent_task_id=task.task_id,
                step_number=2,
                description="Implement email validation",
                estimated_minutes=3,
                delegation_mode=DelegationMode.DO
            ),
            MicroStep(
                parent_task_id=task.task_id,
                step_number=3,
                description="Add password encryption",
                estimated_minutes=4,
                delegation_mode=DelegationMode.DO_WITH_ME
            ),
            MicroStep(
                parent_task_id=task.task_id,
                step_number=4,
                description="Connect to authentication API",
                estimated_minutes=5,
                delegation_mode=DelegationMode.DELEGATE
            ),
            MicroStep(
                parent_task_id=task.task_id,
                step_number=5,
                description="Test login flow",
                estimated_minutes=3,
                delegation_mode=DelegationMode.DO
            ),
        ]

        # 4. Verify task structure
        assert len(task.micro_steps) == 5
        assert task.calculate_micro_steps_duration() == 20  # 5+3+4+5+3

        # 5. Verify delegation modes
        assert task.micro_steps[0].delegation_mode == DelegationMode.DO
        assert task.micro_steps[2].delegation_mode == DelegationMode.DO_WITH_ME
        assert task.micro_steps[3].delegation_mode == DelegationMode.DELEGATE

        # 6. Track progress as steps complete
        initial_progress = task.micro_steps_progress_percentage
        assert initial_progress == 0.0

        task.micro_steps[0].mark_completed()
        assert task.micro_steps_progress_percentage == 20.0  # 1/5

        task.micro_steps[1].mark_completed()
        assert task.micro_steps_progress_percentage == 40.0  # 2/5

    def test_simple_task_needs_no_splitting(self):
        """Test that SIMPLE tasks don't need micro-step splitting"""
        task = Task(
            title="Reply to email",
            description="Send quick response to John",
            project_id="project_123",
            estimated_hours=Decimal("0.05")  # 3 minutes
        )

        task.scope = task.determine_scope()
        assert task.scope == TaskScope.SIMPLE

        # Simple tasks don't need splitting
        assert len(task.micro_steps) == 0

        # Can be executed as-is with delegation mode
        task.delegation_mode = DelegationMode.DELEGATE
        assert task.delegation_mode == DelegationMode.DELEGATE
