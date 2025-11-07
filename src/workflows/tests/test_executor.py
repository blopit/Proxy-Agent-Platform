"""
Tests for WorkflowExecutor.

Tests workflow loading, execution, and step generation.
"""

from pathlib import Path

import pytest

from src.workflows.executor import WorkflowExecutor
from src.workflows.models import WorkflowContext, WorkflowType


@pytest.fixture
def workflows_dir(tmp_path: Path) -> Path:
    """Create a temporary workflows directory with test workflow."""
    workflows_dir = tmp_path / "workflows"
    workflows_dir.mkdir()

    # Create a simple test workflow
    test_workflow = workflows_dir / "test-workflow.toml"
    test_workflow.write_text("""
workflow_id = "test_workflow"
name = "Test Workflow"
description = "A simple test workflow"
workflow_type = "backend"
version = "1.0.0"

llm_provider = "anthropic:claude-3-5-sonnet"
expected_step_count = 3
default_icon = "🧪"
tags = ["test"]

system_prompt = "You are a test assistant. Generate exactly 3 test steps."

user_prompt_template = '''Generate 3 steps for: {task_title}

Expected format (JSON array):
[
  {{
    "title": "Step 1",
    "description": "First step description",
    "estimated_minutes": 10,
    "icon": "🧪"
  }}
]
'''
    """)

    return workflows_dir


@pytest.fixture
def executor(workflows_dir: Path) -> WorkflowExecutor:
    """Create WorkflowExecutor with test workflows."""
    return WorkflowExecutor(workflows_dir)


def test_workflow_loading(executor: WorkflowExecutor):
    """Test that workflows are loaded correctly."""
    workflows = executor.list_workflows()
    assert len(workflows) == 1
    assert workflows[0].workflow_id == "test_workflow"
    assert workflows[0].name == "Test Workflow"


def test_get_workflow(executor: WorkflowExecutor):
    """Test getting a specific workflow."""
    workflow = executor.get_workflow("test_workflow")
    assert workflow is not None
    assert workflow.workflow_id == "test_workflow"
    assert workflow.workflow_type == WorkflowType.BACKEND


def test_get_nonexistent_workflow(executor: WorkflowExecutor):
    """Test getting a workflow that doesn't exist."""
    workflow = executor.get_workflow("nonexistent")
    assert workflow is None


def test_list_workflows_by_type(executor: WorkflowExecutor):
    """Test filtering workflows by type."""
    backend_workflows = executor.list_workflows(workflow_type=WorkflowType.BACKEND)
    assert len(backend_workflows) == 1

    frontend_workflows = executor.list_workflows(workflow_type=WorkflowType.FRONTEND)
    assert len(frontend_workflows) == 0


def test_build_user_prompt(executor: WorkflowExecutor):
    """Test user prompt building with context."""
    workflow = executor.get_workflow("test_workflow")
    assert workflow is not None

    context = WorkflowContext(
        task_id="test-task-1",
        task_title="Test Task",
        task_description="Test description",
        user_id="test-user",
        user_energy=2,
        time_of_day="morning",
    )

    prompt = executor._build_user_prompt(workflow, context)
    assert "Test Task" in prompt
    assert "Medium" in prompt  # Energy level label


# Note: Integration test for actual AI execution requires API key
# and is marked as async. Run with pytest-asyncio:
# pytest src/workflows/tests/test_executor.py -v


@pytest.mark.asyncio
@pytest.mark.skipif(
    not Path.home().joinpath(".anthropic_api_key").exists(), reason="Requires ANTHROPIC_API_KEY"
)
async def test_execute_workflow_integration(executor: WorkflowExecutor):
    """
    Integration test for workflow execution with real AI.

    This test is skipped unless ANTHROPIC_API_KEY is available.
    """
    context = WorkflowContext(
        task_id="test-task-1",
        task_title="Implement user authentication",
        task_description="Add JWT-based authentication to API",
        task_priority="high",
        estimated_hours=4.0,
        user_id="test-user",
        user_energy=2,
        time_of_day="morning",
        codebase_state={
            "tests_passing": 150,
            "tests_failing": 2,
            "recent_files": ["src/api/auth.py"],
        },
        recent_tasks=["Setup FastAPI project"],
    )

    execution = await executor.execute_workflow(
        workflow_id="test_workflow",
        context=context,
    )

    assert execution.status == "completed"
    assert len(execution.steps) > 0
    assert execution.task_id == "test-task-1"

    # Check step structure
    first_step = execution.steps[0]
    assert first_step.title
    assert first_step.description
    assert first_step.estimated_minutes > 0
