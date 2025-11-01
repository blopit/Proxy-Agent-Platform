"""
Tests for ChatGPT Task List Import Service.
"""

import pytest

from src.services.chatgpt_prompts.models import (
    ImportedSubtask,
    TaskImportResult,
    TaskListImportRequest,
)
from src.services.chatgpt_prompts.import_service import TaskImportService


@pytest.fixture
def import_service():
    """Provide a TaskImportService instance."""
    return TaskImportService()


@pytest.fixture
def sample_import_request():
    """Provide a sample import request with subtasks."""
    return TaskListImportRequest(
        parent_task_context="Clean room 8",
        subtasks=[
            ImportedSubtask(
                title="Dust all surfaces",
                description="Use microfiber cloth to dust shelves, desk, and windowsills",
                estimated_hours=0.5,
                priority="medium",
            ),
            ImportedSubtask(
                title="Vacuum carpet",
                description="Thoroughly vacuum all carpet areas, including under furniture",
                estimated_hours=0.75,
                priority="high",
            ),
            ImportedSubtask(
                title="Clean windows",
                description="Spray and wipe all windows inside and outside",
                estimated_hours=1.0,
                priority="low",
            ),
        ],
        delegation_mode="human",
        capture_type="video",
    )


# ============================================================================
# Import Tests
# ============================================================================


def test_import_basic_task_list(import_service, sample_import_request):
    """Test basic import of a task list."""
    result = import_service.import_task_list(sample_import_request)

    assert isinstance(result, TaskImportResult)
    assert result.success is True
    assert result.imported_task_count == 3
    assert len(result.task_ids) == 3
    assert result.parent_task_id is not None
    assert "Clean room 8" in result.parent_task_title
    assert result.message != ""


def test_import_creates_parent_task(import_service, sample_import_request):
    """Test that import creates a parent task."""
    result = import_service.import_task_list(sample_import_request)

    # Verify parent task was created
    parent_task = import_service.get_task_by_id(result.parent_task_id)
    assert parent_task is not None
    assert parent_task["title"] == "Clean room 8"
    assert parent_task["capture_type"] == "video"
    assert parent_task["delegation_mode"] == "human"


def test_import_creates_subtasks(import_service, sample_import_request):
    """Test that import creates all subtasks."""
    result = import_service.import_task_list(sample_import_request)

    # Verify all subtasks were created
    for task_id in result.task_ids:
        task = import_service.get_task_by_id(task_id)
        assert task is not None
        assert task["parent_task_id"] == result.parent_task_id


def test_import_preserves_subtask_details(import_service, sample_import_request):
    """Test that subtask details are preserved during import."""
    result = import_service.import_task_list(sample_import_request)

    # Check first subtask
    first_task = import_service.get_task_by_id(result.task_ids[0])
    assert first_task["title"] == "Dust all surfaces"
    assert "microfiber cloth" in first_task["description"]
    assert first_task["estimated_hours"] == 0.5
    assert first_task["priority"] == "medium"


def test_import_with_project_id(import_service):
    """Test import with project ID association."""
    request = TaskListImportRequest(
        parent_task_context="Backend refactoring",
        subtasks=[
            ImportedSubtask(
                title="Refactor auth module",
                description="Update authentication logic",
                estimated_hours=4.0,
            )
        ],
        project_id="proj-123",
        delegation_mode="agent",
    )

    result = import_service.import_task_list(request)

    parent_task = import_service.get_task_by_id(result.parent_task_id)
    assert parent_task["project_id"] == "proj-123"


def test_import_with_tags(import_service):
    """Test import with tags on subtasks."""
    request = TaskListImportRequest(
        parent_task_context="Kitchen cleanup",
        subtasks=[
            ImportedSubtask(
                title="Wash dishes",
                description="Clean all dirty dishes",
                tags=["urgent", "kitchen", "daily"],
            )
        ],
    )

    result = import_service.import_task_list(request)

    task = import_service.get_task_by_id(result.task_ids[0])
    assert "urgent" in task["tags"]
    assert "kitchen" in task["tags"]


def test_import_with_different_priorities(import_service):
    """Test import with various priority levels."""
    request = TaskListImportRequest(
        parent_task_context="Security audit",
        subtasks=[
            ImportedSubtask(
                title="Fix SQL injection vulnerability",
                description="Sanitize database queries",
                priority="critical",
            ),
            ImportedSubtask(
                title="Update SSL certificates", description="Renew certs", priority="high"
            ),
            ImportedSubtask(
                title="Review access logs", description="Check logs", priority="low"
            ),
        ],
    )

    result = import_service.import_task_list(request)

    task_critical = import_service.get_task_by_id(result.task_ids[0])
    task_high = import_service.get_task_by_id(result.task_ids[1])
    task_low = import_service.get_task_by_id(result.task_ids[2])

    assert task_critical["priority"] == "critical"
    assert task_high["priority"] == "high"
    assert task_low["priority"] == "low"


def test_import_single_subtask(import_service):
    """Test import with only one subtask."""
    request = TaskListImportRequest(
        parent_task_context="Quick task",
        subtasks=[
            ImportedSubtask(
                title="Do something", description="Quick action", estimated_hours=0.5
            )
        ],
    )

    result = import_service.import_task_list(request)

    assert result.success is True
    assert result.imported_task_count == 1
    assert len(result.task_ids) == 1


def test_import_many_subtasks(import_service):
    """Test import with many subtasks."""
    subtasks = [
        ImportedSubtask(
            title=f"Subtask {i}",
            description=f"Description for subtask {i}",
            estimated_hours=1.0,
        )
        for i in range(1, 21)  # 20 subtasks
    ]

    request = TaskListImportRequest(
        parent_task_context="Large project", subtasks=subtasks
    )

    result = import_service.import_task_list(request)

    assert result.success is True
    assert result.imported_task_count == 20
    assert len(result.task_ids) == 20


# ============================================================================
# Validation Tests
# ============================================================================


def test_import_fails_with_empty_subtasks(import_service):
    """Test that import fails with empty subtask list."""
    # Pydantic validation should catch this
    with pytest.raises(Exception):  # ValidationError
        TaskListImportRequest(parent_task_context="Empty", subtasks=[])


def test_import_handles_missing_optional_fields(import_service):
    """Test import with minimal subtask data."""
    request = TaskListImportRequest(
        parent_task_context="Minimal task",
        subtasks=[
            ImportedSubtask(
                title="Do work",
                description="Work description",
                # No estimated_hours, priority, or tags
            )
        ],
    )

    result = import_service.import_task_list(request)

    assert result.success is True
    task = import_service.get_task_by_id(result.task_ids[0])
    assert task["priority"] == "medium"  # Default


# ============================================================================
# Edge Cases
# ============================================================================


def test_import_with_very_long_descriptions(import_service):
    """Test import with long task descriptions."""
    long_desc = "A " * 500  # ~1000 chars
    request = TaskListImportRequest(
        parent_task_context="Long description test",
        subtasks=[
            ImportedSubtask(
                title="Task with long description", description=long_desc[:2000]
            )
        ],
    )

    result = import_service.import_task_list(request)

    assert result.success is True


def test_import_with_special_characters(import_service):
    """Test import with special characters in task data."""
    request = TaskListImportRequest(
        parent_task_context="Review code: {API & DB}",
        subtasks=[
            ImportedSubtask(
                title="Fix bug in <Component />",
                description="Update props: {x: 1, y: 2} & test [v2.0]",
            )
        ],
    )

    result = import_service.import_task_list(request)

    assert result.success is True
    task = import_service.get_task_by_id(result.task_ids[0])
    assert "<Component />" in task["title"]


def test_import_result_has_timestamp(import_service, sample_import_request):
    """Test that import result includes timestamp."""
    result = import_service.import_task_list(sample_import_request)

    assert result.created_at is not None
