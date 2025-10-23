"""
TDD Tests for MicroStepService

Tests written FIRST before implementation.
Following Test-Driven Development: Red → Green → Refactor

MicroStepService handles CRUD operations for micro-steps (2-5 minute task chunks)
"""

import pytest
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from src.services.micro_step_service import (
    MicroStepService,
    MicroStepServiceError,
    MicroStepCreateData,
    MicroStepUpdateData,
    MicroStep,
)
from src.core.task_models import Task, TaskPriority, TaskStatus


@pytest.fixture
def sample_task(task_service, test_project):
    """Create a sample task for testing micro-steps"""
    from src.services.task_service import TaskCreationData

    task_data = TaskCreationData(
        title="Test Parent Task",
        description="A task to split into micro-steps",
        project_id=test_project.project_id,  # Use test_project fixture
        priority=TaskPriority.HIGH,
        estimated_hours=Decimal("2.0"),
    )

    task = task_service.create_task(task_data)
    return task


class TestMicroStepCreation:
    """Test creating micro-steps"""

    def test_create_micro_step_success(self, micro_step_service, sample_task):
        """Test creating a micro-step for a task"""
        create_data = MicroStepCreateData(
            parent_task_id=sample_task.task_id,
            description="Write function signature",
            estimated_minutes=3,
            leaf_type="DIGITAL",
            delegation_mode="DO",
        )

        micro_step = micro_step_service.create_micro_step(create_data)

        assert micro_step is not None
        assert micro_step.step_id is not None
        assert micro_step.parent_task_id == sample_task.task_id
        assert micro_step.description == "Write function signature"
        assert micro_step.estimated_minutes == 3
        assert micro_step.leaf_type == "DIGITAL"
        assert micro_step.delegation_mode == "DO"
        assert micro_step.completed is False
        assert micro_step.completed_at is None

    def test_create_micro_step_with_automation_plan(self, micro_step_service, sample_task):
        """Test creating micro-step with automation plan"""
        automation_plan = {
            "tool": "code_generator",
            "prompt": "Generate Python function",
            "estimated_cost": 0.02,
        }

        create_data = MicroStepCreateData(
            parent_task_id=sample_task.task_id,
            description="Auto-generate boilerplate",
            estimated_minutes=2,
            leaf_type="DIGITAL",
            delegation_mode="DELEGATE",
            automation_plan=automation_plan,
        )

        micro_step = micro_step_service.create_micro_step(create_data)

        assert micro_step.automation_plan == automation_plan
        assert micro_step.automation_plan["tool"] == "code_generator"

    def test_create_micro_step_invalid_parent_task(self, micro_step_service):
        """Test creating micro-step with non-existent parent task fails"""
        create_data = MicroStepCreateData(
            parent_task_id="non-existent-task-id",
            description="This should fail",
            estimated_minutes=5,
        )

        with pytest.raises(MicroStepServiceError) as exc_info:
            micro_step_service.create_micro_step(create_data)

        assert "parent task" in str(exc_info.value).lower()

    def test_create_micro_step_validates_estimated_minutes(self, micro_step_service, sample_task):
        """Test that estimated_minutes must be 2-5 minutes (ADHD-friendly)"""
        # Too short (< 2 minutes)
        with pytest.raises(MicroStepServiceError) as exc_info:
            create_data = MicroStepCreateData(
                parent_task_id=sample_task.task_id,
                description="Too quick",
                estimated_minutes=1,
            )
            micro_step_service.create_micro_step(create_data)

        assert "2-5 minutes" in str(exc_info.value)

        # Too long (> 5 minutes)
        with pytest.raises(MicroStepServiceError) as exc_info:
            create_data = MicroStepCreateData(
                parent_task_id=sample_task.task_id,
                description="Too long",
                estimated_minutes=10,
            )
            micro_step_service.create_micro_step(create_data)

        assert "2-5 minutes" in str(exc_info.value)

    def test_create_micro_step_validates_leaf_type(self, micro_step_service, sample_task):
        """Test that leaf_type must be DIGITAL or HUMAN"""
        # Valid: DIGITAL
        create_data = MicroStepCreateData(
            parent_task_id=sample_task.task_id,
            description="Digital task",
            estimated_minutes=3,
            leaf_type="DIGITAL",
        )
        micro_step = micro_step_service.create_micro_step(create_data)
        assert micro_step.leaf_type == "DIGITAL"

        # Valid: HUMAN
        create_data = MicroStepCreateData(
            parent_task_id=sample_task.task_id,
            description="Human task",
            estimated_minutes=3,
            leaf_type="HUMAN",
        )
        micro_step = micro_step_service.create_micro_step(create_data)
        assert micro_step.leaf_type == "HUMAN"

        # Invalid
        with pytest.raises(MicroStepServiceError):
            create_data = MicroStepCreateData(
                parent_task_id=sample_task.task_id,
                description="Invalid",
                estimated_minutes=3,
                leaf_type="INVALID",
            )
            micro_step_service.create_micro_step(create_data)


class TestMicroStepRetrieval:
    """Test retrieving micro-steps"""

    def test_get_micro_step_by_id(self, micro_step_service, sample_task):
        """Test retrieving a micro-step by ID"""
        create_data = MicroStepCreateData(
            parent_task_id=sample_task.task_id,
            description="Test retrieval",
            estimated_minutes=3,
        )

        created = micro_step_service.create_micro_step(create_data)

        # Retrieve
        retrieved = micro_step_service.get_micro_step(created.step_id)

        assert retrieved is not None
        assert retrieved.step_id == created.step_id
        assert retrieved.description == "Test retrieval"

    def test_get_micro_step_not_found(self, micro_step_service):
        """Test retrieving non-existent micro-step returns None"""
        result = micro_step_service.get_micro_step("non-existent-id")
        assert result is None

    def test_get_micro_steps_by_parent_task(self, micro_step_service, sample_task):
        """Test retrieving all micro-steps for a task"""
        # Create 3 micro-steps
        for i in range(3):
            create_data = MicroStepCreateData(
                parent_task_id=sample_task.task_id,
                description=f"Step {i+1}",
                estimated_minutes=3,
            )
            micro_step_service.create_micro_step(create_data)

        # Retrieve all
        micro_steps = micro_step_service.get_micro_steps_by_task(sample_task.task_id)

        assert len(micro_steps) == 3
        assert all(ms.parent_task_id == sample_task.task_id for ms in micro_steps)

    def test_get_incomplete_micro_steps(self, micro_step_service, sample_task):
        """Test retrieving only incomplete micro-steps"""
        # Create 3 micro-steps
        created_steps = []
        for i in range(3):
            create_data = MicroStepCreateData(
                parent_task_id=sample_task.task_id,
                description=f"Step {i+1}",
                estimated_minutes=3,
            )
            step = micro_step_service.create_micro_step(create_data)
            created_steps.append(step)

        # Mark one as completed
        update_data = MicroStepUpdateData(completed=True)
        micro_step_service.update_micro_step(created_steps[0].step_id, update_data)

        # Get incomplete
        incomplete = micro_step_service.get_incomplete_micro_steps(sample_task.task_id)

        assert len(incomplete) == 2
        assert all(not ms.completed for ms in incomplete)

    def test_get_next_micro_step(self, micro_step_service, sample_task):
        """Test getting the next incomplete micro-step (for Hunter mode)"""
        # Create micro-steps
        for i in range(3):
            create_data = MicroStepCreateData(
                parent_task_id=sample_task.task_id,
                description=f"Step {i+1}",
                estimated_minutes=3,
            )
            micro_step_service.create_micro_step(create_data)

        # Get next (should be first incomplete)
        next_step = micro_step_service.get_next_micro_step(sample_task.task_id)

        assert next_step is not None
        assert next_step.description == "Step 1"
        assert not next_step.completed


class TestMicroStepUpdate:
    """Test updating micro-steps"""

    def test_update_micro_step_description(self, micro_step_service, sample_task):
        """Test updating micro-step description"""
        create_data = MicroStepCreateData(
            parent_task_id=sample_task.task_id,
            description="Original description",
            estimated_minutes=3,
        )
        created = micro_step_service.create_micro_step(create_data)

        # Update
        update_data = MicroStepUpdateData(description="Updated description")
        updated = micro_step_service.update_micro_step(created.step_id, update_data)

        assert updated.description == "Updated description"

    def test_mark_micro_step_completed(self, micro_step_service, sample_task):
        """Test marking a micro-step as completed"""
        create_data = MicroStepCreateData(
            parent_task_id=sample_task.task_id,
            description="Complete me",
            estimated_minutes=3,
        )
        created = micro_step_service.create_micro_step(create_data)

        assert not created.completed
        assert created.completed_at is None

        # Mark completed
        update_data = MicroStepUpdateData(completed=True)
        completed = micro_step_service.update_micro_step(created.step_id, update_data)

        assert completed.completed is True
        assert completed.completed_at is not None
        assert isinstance(completed.completed_at, datetime)

    def test_update_energy_level_after_completion(self, micro_step_service, sample_task):
        """Test updating energy_level (for reflection)"""
        create_data = MicroStepCreateData(
            parent_task_id=sample_task.task_id,
            description="Rate my energy",
            estimated_minutes=3,
        )
        created = micro_step_service.create_micro_step(create_data)

        # Update energy level (1-5 scale)
        update_data = MicroStepUpdateData(energy_level=4, completed=True)
        updated = micro_step_service.update_micro_step(created.step_id, update_data)

        assert updated.energy_level == 4
        assert updated.completed is True


class TestMicroStepDeletion:
    """Test deleting micro-steps"""

    def test_delete_micro_step(self, micro_step_service, sample_task):
        """Test deleting a micro-step"""
        create_data = MicroStepCreateData(
            parent_task_id=sample_task.task_id,
            description="Delete me",
            estimated_minutes=3,
        )
        created = micro_step_service.create_micro_step(create_data)

        # Delete
        result = micro_step_service.delete_micro_step(created.step_id)
        assert result is True

        # Verify deleted
        retrieved = micro_step_service.get_micro_step(created.step_id)
        assert retrieved is None

    def test_delete_non_existent_micro_step(self, micro_step_service):
        """Test deleting non-existent micro-step returns False"""
        result = micro_step_service.delete_micro_step("non-existent-id")
        assert result is False


class TestMicroStepStatistics:
    """Test micro-step statistics and calculations"""

    def test_calculate_completion_percentage(self, micro_step_service, sample_task):
        """Test calculating completion % for a task"""
        # Create 4 micro-steps
        created_steps = []
        for i in range(4):
            create_data = MicroStepCreateData(
                parent_task_id=sample_task.task_id,
                description=f"Step {i+1}",
                estimated_minutes=3,
            )
            step = micro_step_service.create_micro_step(create_data)
            created_steps.append(step)

        # Complete 2 of 4
        for step in created_steps[:2]:
            update_data = MicroStepUpdateData(completed=True)
            micro_step_service.update_micro_step(step.step_id, update_data)

        # Calculate percentage
        percentage = micro_step_service.get_completion_percentage(sample_task.task_id)

        assert percentage == 50.0  # 2/4 = 50%

    def test_calculate_total_estimated_time(self, micro_step_service, sample_task):
        """Test calculating total estimated time for all micro-steps"""
        # Create micro-steps with different durations
        durations = [2, 3, 5, 4]
        for duration in durations:
            create_data = MicroStepCreateData(
                parent_task_id=sample_task.task_id,
                description=f"Step {duration}min",
                estimated_minutes=duration,
            )
            micro_step_service.create_micro_step(create_data)

        # Calculate total
        total_minutes = micro_step_service.get_total_estimated_minutes(sample_task.task_id)

        assert total_minutes == sum(durations)  # 2+3+5+4 = 14 minutes

    def test_get_completion_stats(self, micro_step_service, sample_task):
        """Test getting comprehensive completion stats"""
        # Create and complete some steps
        for i in range(5):
            create_data = MicroStepCreateData(
                parent_task_id=sample_task.task_id,
                description=f"Step {i+1}",
                estimated_minutes=3,
            )
            step = micro_step_service.create_micro_step(create_data)

            # Complete first 3
            if i < 3:
                update_data = MicroStepUpdateData(completed=True)
                micro_step_service.update_micro_step(step.step_id, update_data)

        # Get stats
        stats = micro_step_service.get_completion_stats(sample_task.task_id)

        assert stats["total"] == 5
        assert stats["completed"] == 3
        assert stats["incomplete"] == 2
        assert stats["completion_percentage"] == 60.0
