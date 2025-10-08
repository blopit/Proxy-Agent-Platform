"""
Test git integration functionality for workflow system.

This module tests the git integration capabilities added to the workflow engine,
ensuring proper git operations during workflow execution.
"""

import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from proxy_agent_platform.workflows.git_integration import (
    GitCommitInfo,
    GitIntegration,
    WorkflowGitManager,
)


class TestGitIntegration:
    """Test the GitIntegration class functionality."""

    @pytest.fixture
    def temp_git_repo(self):
        """Create a temporary git repository for testing."""
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_path = Path(temp_dir)
            yield repo_path

    @pytest.fixture
    def git_integration(self, temp_git_repo):
        """Create GitIntegration instance for testing."""
        return GitIntegration(temp_git_repo)

    @pytest.fixture
    def workflow_git_manager(self, git_integration):
        """Create WorkflowGitManager instance for testing."""
        return WorkflowGitManager(git_integration)

    @patch("subprocess.run")
    @pytest.mark.asyncio
    async def test_create_workflow_commit_basic(self, mock_run, git_integration):
        """Test basic workflow commit creation functionality."""
        # Mock successful git commands
        mock_run.side_effect = [
            MagicMock(returncode=0, stdout=""),  # git add
            MagicMock(returncode=0, stdout="commit_hash_123"),  # git commit
            MagicMock(
                returncode=0, stdout="Author\t2024-01-01T00:00:00Z\tfile1.py file2.py\t+5\t-2"
            ),  # git log
        ]

        commit_info = await git_integration.create_workflow_commit(
            message="test: basic commit test", files=["file1.py"], commit_type="test"
        )

        assert isinstance(commit_info, GitCommitInfo)
        assert commit_info.commit_hash == "commit_hash_123"

    @patch("subprocess.run")
    @pytest.mark.asyncio
    async def test_create_tdd_cycle_commit(self, mock_run, git_integration):
        """Test TDD cycle commit creation."""
        mock_run.side_effect = [
            MagicMock(returncode=0, stdout=""),  # git add
            MagicMock(returncode=0, stdout="commit_hash_456"),  # git commit
            MagicMock(
                returncode=0, stdout="Author\t2024-01-01T00:00:00Z\ttest_file.py\t+10\t-0"
            ),  # git log
        ]

        commit_info = await git_integration.create_tdd_cycle_commit(
            cycle_phase="red",
            test_file="tests/test_example.py",
            implementation_file="src/example.py",
            feature_description="example feature",
        )

        assert commit_info.commit_hash == "commit_hash_456"
        assert "example feature" in commit_info.commit_message

    @patch("subprocess.run")
    @pytest.mark.asyncio
    async def test_workflow_milestone_commit(self, mock_run, workflow_git_manager):
        """Test workflow milestone commit creation."""
        mock_run.return_value = MagicMock(returncode=0, stdout="commit_hash_789")

        commit_info = await workflow_git_manager.create_workflow_milestone_commit(
            workflow_name="Test Workflow",
            workflow_type="critical",
            completed_steps=["step1", "step2"],
            summary_details={"total_steps": 3, "completed_steps": 2},
        )

        assert commit_info.commit_type == "milestone"
        assert "Test Workflow" in commit_info.message
        assert "2/3" in commit_info.message

    @patch("subprocess.run")
    @pytest.mark.asyncio
    async def test_epic_completion_commit(self, mock_run, workflow_git_manager):
        """Test epic completion commit creation."""
        mock_run.return_value = MagicMock(returncode=0, stdout="commit_hash_abc")

        commit_info = await workflow_git_manager.create_epic_completion_commit(
            epic_name="Epic 1: Core Agents",
            epic_tasks=["task1", "task2", "task3"],
            deliverables=["agent1", "agent2"],
            epic_summary="Core proxy agents implemented",
        )

        assert commit_info.commit_type == "epic"
        assert "Epic 1" in commit_info.message
        assert "Core proxy agents implemented" in commit_info.message

    @patch("subprocess.run")
    @pytest.mark.asyncio
    async def test_create_tag(self, mock_run, git_integration):
        """Test git tag creation."""
        mock_run.return_value = MagicMock(returncode=0)

        await git_integration.create_tag(
            tag_name="v1.0.0", tag_message="Test release", commit_hash="abc123"
        )

        # Verify git tag command was called
        mock_run.assert_called()
        call_args = mock_run.call_args[0][0]
        assert "git" in call_args
        assert "tag" in call_args
        assert "v1.0.0" in call_args

    @patch("subprocess.run")
    @pytest.mark.asyncio
    async def test_push_to_remote_success(self, mock_run, git_integration):
        """Test successful push to remote repository."""
        mock_run.return_value = MagicMock(returncode=0)

        success = await git_integration.push_to_remote(branch="main", include_tags=True)

        assert success is True
        mock_run.assert_called()

    @patch("subprocess.run")
    @pytest.mark.asyncio
    async def test_push_to_remote_failure(self, mock_run, git_integration):
        """Test failed push to remote repository."""
        mock_run.return_value = MagicMock(returncode=1, stderr="Push failed")

        success = await git_integration.push_to_remote(branch="main", include_tags=False)

        assert success is False


class TestWorkflowEngineGitIntegration:
    """Test git integration in the workflow engine."""

    @pytest.fixture
    def mock_workflow_engine(self):
        """Create a mock workflow engine with git integration."""
        from proxy_agent_platform.workflows.engine import WorkflowEngine

        with patch.object(WorkflowEngine, "__init__", return_value=None):
            engine = WorkflowEngine()
            engine.git_integration = MagicMock()
            engine.git_manager = MagicMock()
            return engine

    @pytest.mark.asyncio
    async def test_create_workflow_completion_commit(self, mock_workflow_engine):
        """Test workflow completion commit in engine."""
        from proxy_agent_platform.workflows.schema import WorkflowType

        # Mock workflow definition
        workflow_def = MagicMock()
        workflow_def.name = "Test Workflow"
        workflow_def.workflow_type = WorkflowType.CRITICAL
        workflow_def.workflow_id = "test_workflow"
        workflow_def.steps = ["step1", "step2"]

        step_results = {"step1": {"status": "completed"}, "step2": {"status": "completed"}}

        # Mock the git manager method
        mock_workflow_engine.git_manager.create_workflow_milestone_commit = AsyncMock()

        # Call the method
        await mock_workflow_engine._create_workflow_completion_commit(workflow_def, step_results)

        # Verify git manager was called
        mock_workflow_engine.git_manager.create_workflow_milestone_commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_tdd_phase_commit(self, mock_workflow_engine):
        """Test TDD phase commit creation in engine."""

        # Mock workflow step
        step = MagicMock()
        step.step_id = "test_step"
        step.name = "Test Step"
        step.description = "Test step description"

        phase_result = {"status": "completed", "phase": "red"}

        # Mock the git integration method
        mock_workflow_engine.git_integration.create_commit = AsyncMock()

        # Call the method
        await mock_workflow_engine._create_tdd_phase_commit("red", step, phase_result)

        # Verify git integration was called
        mock_workflow_engine.git_integration.create_commit.assert_called_once()

        # Check the commit message format
        call_args = mock_workflow_engine.git_integration.create_commit.call_args
        assert "tdd-red" in call_args[1]["message"]
        assert "Write failing test" in call_args[1]["message"]


if __name__ == "__main__":
    # Run tests if executed directly
    pytest.main([__file__, "-v"])
