"""
Git Integration for AI Agent Workflow System.

This module provides comprehensive git integration capabilities for workflows,
including automatic commits, pushes, branch management, and progress tracking.
"""

import asyncio
import logging
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class GitCommitInfo(BaseModel):
    """Information about a git commit."""

    commit_hash: str = Field(..., description="Git commit hash")
    commit_message: str = Field(..., description="Commit message")
    author: str = Field(..., description="Commit author")
    timestamp: datetime = Field(..., description="Commit timestamp")
    files_changed: list[str] = Field(default_factory=list, description="Files changed in commit")
    insertions: int = Field(default=0, description="Number of insertions")
    deletions: int = Field(default=0, description="Number of deletions")


class GitBranchInfo(BaseModel):
    """Information about git branch state."""

    current_branch: str = Field(..., description="Current branch name")
    is_clean: bool = Field(..., description="Whether working directory is clean")
    staged_files: list[str] = Field(default_factory=list, description="Staged files")
    modified_files: list[str] = Field(default_factory=list, description="Modified files")
    untracked_files: list[str] = Field(default_factory=list, description="Untracked files")
    commits_ahead: int = Field(default=0, description="Commits ahead of remote")
    commits_behind: int = Field(default=0, description="Commits behind remote")


class GitIntegration:
    """
    Git integration for workflow system.

    Provides automatic git operations including commits, pushes, branch management,
    and progress tracking for AI agent workflows.
    """

    def __init__(self, repository_path: Path = None):
        """
        Initialize git integration.

        Args:
            repository_path: Path to git repository (default: current directory)
        """
        self.repo_path = repository_path or Path.cwd()
        self.auto_commit = True
        self.auto_push = True
        self.commit_prefix = "🤖 AI Agent Workflow"

    async def get_git_status(self) -> GitBranchInfo:
        """
        Get current git repository status.

        Returns:
            GitBranchInfo with current repository state
        """
        try:
            # Get current branch
            branch_result = await self._run_git_command(["branch", "--show-current"])
            current_branch = branch_result.stdout.strip()

            # Check if working directory is clean
            status_result = await self._run_git_command(["status", "--porcelain"])
            is_clean = len(status_result.stdout.strip()) == 0

            # Get staged, modified, and untracked files
            staged_files = []
            modified_files = []
            untracked_files = []

            if not is_clean:
                for line in status_result.stdout.strip().split("\n"):
                    if not line:
                        continue
                    status_code = line[:2]
                    filename = line[3:]

                    if status_code[0] in ["A", "M", "D", "R", "C"]:
                        staged_files.append(filename)
                    if status_code[1] in ["M", "D"]:
                        modified_files.append(filename)
                    if status_code == "??":
                        untracked_files.append(filename)

            # Get commits ahead/behind remote
            commits_ahead = 0
            commits_behind = 0
            try:
                ahead_result = await self._run_git_command(
                    ["rev-list", "--count", f"origin/{current_branch}..HEAD"]
                )
                commits_ahead = int(ahead_result.stdout.strip())

                behind_result = await self._run_git_command(
                    ["rev-list", "--count", f"HEAD..origin/{current_branch}"]
                )
                commits_behind = int(behind_result.stdout.strip())
            except (subprocess.CalledProcessError, ValueError):
                # Remote tracking might not be set up
                pass

            return GitBranchInfo(
                current_branch=current_branch,
                is_clean=is_clean,
                staged_files=staged_files,
                modified_files=modified_files,
                untracked_files=untracked_files,
                commits_ahead=commits_ahead,
                commits_behind=commits_behind,
            )

        except Exception as e:
            logger.error(f"Failed to get git status: {e}")
            raise

    async def create_workflow_commit(
        self,
        workflow_id: str,
        step_id: str,
        step_name: str,
        files_to_commit: list[str] | None = None,
        custom_message: str | None = None,
    ) -> GitCommitInfo:
        """
        Create a commit for workflow progress.

        Args:
            workflow_id: ID of the workflow
            step_id: ID of the workflow step
            step_name: Name of the workflow step
            files_to_commit: Specific files to commit (None for all changes)
            custom_message: Custom commit message

        Returns:
            GitCommitInfo with commit details
        """
        try:
            # Check git status first
            git_status = await self.get_git_status()

            if git_status.is_clean and not git_status.staged_files:
                logger.info("No changes to commit")
                return None

            # Stage files
            if files_to_commit:
                for file_path in files_to_commit:
                    await self._run_git_command(["add", file_path])
            else:
                # Add all changes
                await self._run_git_command(["add", "."])

            # Generate commit message
            if custom_message:
                commit_message = custom_message
            else:
                commit_message = self._generate_commit_message(workflow_id, step_id, step_name)

            # Create commit
            await self._run_git_command(["commit", "-m", commit_message])

            # Get commit info
            commit_info = await self._get_latest_commit_info()

            logger.info(
                f"Created commit: {commit_info.commit_hash[:8]} - {commit_info.commit_message}"
            )

            return commit_info

        except Exception as e:
            logger.error(f"Failed to create commit: {e}")
            raise

    async def push_changes(self, branch: str | None = None) -> bool:
        """
        Push changes to remote repository.

        Args:
            branch: Branch to push (default: current branch)

        Returns:
            True if push successful
        """
        try:
            if branch:
                await self._run_git_command(["push", "origin", branch])
            else:
                # Get current branch and push
                git_status = await self.get_git_status()
                await self._run_git_command(["push", "origin", git_status.current_branch])

            logger.info("Successfully pushed changes to remote")
            return True

        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to push changes: {e}")
            return False

    async def create_feature_branch(self, workflow_id: str, epic_id: str | None = None) -> str:
        """
        Create a feature branch for workflow execution.

        Args:
            workflow_id: ID of the workflow
            epic_id: Optional epic ID for organization

        Returns:
            Name of created branch
        """
        try:
            # Generate branch name
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            if epic_id:
                branch_name = f"workflow/{epic_id}/{workflow_id}_{timestamp}"
            else:
                branch_name = f"workflow/{workflow_id}_{timestamp}"

            # Create and checkout branch
            await self._run_git_command(["checkout", "-b", branch_name])

            logger.info(f"Created feature branch: {branch_name}")
            return branch_name

        except Exception as e:
            logger.error(f"Failed to create feature branch: {e}")
            raise

    async def commit_workflow_milestone(
        self,
        milestone_type: str,
        milestone_name: str,
        workflow_context: dict[str, Any],
        files_changed: list[str] | None = None,
    ) -> GitCommitInfo:
        """
        Commit a workflow milestone with comprehensive information.

        Args:
            milestone_type: Type of milestone (epic_start, epic_complete, phase_complete, etc.)
            milestone_name: Human-readable milestone name
            workflow_context: Context information about the workflow
            files_changed: Files that were changed

        Returns:
            GitCommitInfo with commit details
        """
        try:
            # Create detailed commit message
            commit_message = self._generate_milestone_commit_message(
                milestone_type, milestone_name, workflow_context
            )

            # Stage appropriate files
            if files_changed:
                for file_path in files_changed:
                    await self._run_git_command(["add", file_path])
            else:
                await self._run_git_command(["add", "."])

            # Create commit
            await self._run_git_command(["commit", "-m", commit_message])

            # Get commit info
            commit_info = await self._get_latest_commit_info()

            logger.info(f"Created milestone commit: {milestone_type} - {milestone_name}")

            # Auto-push if enabled
            if self.auto_push:
                await self.push_changes()

            return commit_info

        except Exception as e:
            logger.error(f"Failed to commit milestone: {e}")
            raise

    async def create_epic_completion_commit(
        self, epic_id: str, epic_name: str, completion_summary: dict[str, Any]
    ) -> GitCommitInfo:
        """
        Create a special commit for epic completion.

        Args:
            epic_id: Epic identifier
            epic_name: Epic name
            completion_summary: Summary of what was completed

        Returns:
            GitCommitInfo with commit details
        """
        commit_message = f"""🎯 Complete {epic_name}

Epic ID: {epic_id}

Summary:
- Tasks completed: {completion_summary.get("tasks_completed", "N/A")}
- Test coverage: {completion_summary.get("test_coverage", "N/A")}%
- Files modified: {completion_summary.get("files_modified", "N/A")}
- Quality gates: {completion_summary.get("quality_gates_passed", "N/A")}

{self.commit_prefix}: Epic completion with full validation

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""

        return await self.create_workflow_commit(
            workflow_id=epic_id,
            step_id="epic_completion",
            step_name=epic_name,
            custom_message=commit_message,
        )

    async def create_tdd_cycle_commit(
        self,
        cycle_phase: str,  # 'red', 'green', 'refactor'
        test_file: str,
        implementation_file: str,
        feature_description: str,
    ) -> GitCommitInfo:
        """
        Create commit for TDD cycle phases.

        Args:
            cycle_phase: TDD phase (red, green, refactor)
            test_file: Test file being worked on
            implementation_file: Implementation file
            feature_description: Description of feature being implemented

        Returns:
            GitCommitInfo with commit details
        """
        phase_emojis = {"red": "🔴", "green": "🟢", "refactor": "♻️"}

        phase_descriptions = {
            "red": "Add failing test",
            "green": "Make test pass",
            "refactor": "Refactor implementation",
        }

        emoji = phase_emojis.get(cycle_phase, "⚡")
        description = phase_descriptions.get(cycle_phase, "TDD cycle")

        commit_message = f"""{emoji} TDD {cycle_phase.upper()}: {description}

Feature: {feature_description}
Test: {test_file}
Implementation: {implementation_file}

{self.commit_prefix}: TDD methodology - {cycle_phase} phase

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""

        return await self.create_workflow_commit(
            workflow_id="tdd_cycle",
            step_id=f"tdd_{cycle_phase}",
            step_name=f"TDD {cycle_phase} phase",
            custom_message=commit_message,
            files_to_commit=[test_file, implementation_file],
        )

    async def _run_git_command(self, args: list[str]) -> subprocess.CompletedProcess:
        """
        Run a git command asynchronously.

        Args:
            args: Git command arguments

        Returns:
            CompletedProcess result
        """
        cmd = ["git"] + args
        process = await asyncio.create_subprocess_exec(
            *cmd, cwd=self.repo_path, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            error_msg = stderr.decode().strip()
            raise subprocess.CalledProcessError(process.returncode, cmd, stdout, stderr)

        return subprocess.CompletedProcess(
            args=cmd, returncode=process.returncode, stdout=stdout.decode(), stderr=stderr.decode()
        )

    async def _get_latest_commit_info(self) -> GitCommitInfo:
        """Get information about the latest commit."""
        try:
            # Get commit hash and message
            log_result = await self._run_git_command(["log", "-1", "--format=%H|%s|%an|%at"])

            parts = log_result.stdout.strip().split("|")
            commit_hash = parts[0]
            commit_message = parts[1]
            author = parts[2]
            timestamp = datetime.fromtimestamp(int(parts[3]))

            # Get files changed
            files_result = await self._run_git_command(
                ["diff-tree", "--no-commit-id", "--name-only", "-r", commit_hash]
            )
            files_changed = [f.strip() for f in files_result.stdout.split("\n") if f.strip()]

            # Get insertions/deletions
            stat_result = await self._run_git_command(["show", "--stat", "--format=", commit_hash])

            insertions = 0
            deletions = 0
            for line in stat_result.stdout.split("\n"):
                if "+" in line and "-" in line:
                    parts = line.split()
                    for part in parts:
                        if "+" in part:
                            insertions += part.count("+")
                        if "-" in part:
                            deletions += part.count("-")

            return GitCommitInfo(
                commit_hash=commit_hash,
                commit_message=commit_message,
                author=author,
                timestamp=timestamp,
                files_changed=files_changed,
                insertions=insertions,
                deletions=deletions,
            )

        except Exception as e:
            logger.error(f"Failed to get commit info: {e}")
            raise

    def _generate_commit_message(self, workflow_id: str, step_id: str, step_name: str) -> str:
        """Generate a commit message for workflow step."""
        return f"""{self.commit_prefix}: {step_name}

Workflow: {workflow_id}
Step: {step_id}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""

    def _generate_milestone_commit_message(
        self, milestone_type: str, milestone_name: str, workflow_context: dict[str, Any]
    ) -> str:
        """Generate commit message for workflow milestones."""
        milestone_emojis = {
            "epic_start": "🚀",
            "epic_complete": "🎯",
            "phase_start": "📋",
            "phase_complete": "✅",
            "critical_fix": "🔒",
            "integration_complete": "🔗",
            "quality_gate_passed": "✨",
        }

        emoji = milestone_emojis.get(milestone_type, "⚡")

        message = f"""{emoji} {milestone_name}

Milestone: {milestone_type}
Workflow: {workflow_context.get("workflow_id", "unknown")}"""

        if "epic_id" in workflow_context:
            message += f"\nEpic: {workflow_context['epic_id']}"

        if "progress" in workflow_context:
            message += f"\nProgress: {workflow_context['progress']}"

        if "test_coverage" in workflow_context:
            message += f"\nTest Coverage: {workflow_context['test_coverage']}%"

        message += f"""

{self.commit_prefix}: {milestone_type}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""

        return message


class WorkflowGitManager:
    """
    High-level git manager for workflow operations.

    Provides workflow-specific git operations and integrates with the workflow engine.
    """

    def __init__(self, git_integration: GitIntegration):
        self.git = git_integration
        self.commit_history: list[GitCommitInfo] = []

    async def start_workflow_session(self, workflow_id: str, epic_id: str | None = None) -> str:
        """
        Start a git session for workflow execution.

        Args:
            workflow_id: ID of the workflow
            epic_id: Optional epic ID

        Returns:
            Branch name for the workflow session
        """
        # Create feature branch for workflow
        branch_name = await self.git.create_feature_branch(workflow_id, epic_id)

        # Create initial commit
        await self.git.commit_workflow_milestone(
            milestone_type="workflow_start",
            milestone_name=f"Start workflow: {workflow_id}",
            workflow_context={
                "workflow_id": workflow_id,
                "epic_id": epic_id,
                "branch": branch_name,
            },
        )

        return branch_name

    async def commit_step_completion(
        self,
        workflow_id: str,
        step_id: str,
        step_name: str,
        step_result: dict[str, Any],
        files_modified: list[str] | None = None,
    ) -> GitCommitInfo:
        """
        Commit completion of a workflow step.

        Args:
            workflow_id: Workflow ID
            step_id: Step ID
            step_name: Step name
            step_result: Results from step execution
            files_modified: Files that were modified

        Returns:
            GitCommitInfo with commit details
        """
        commit_info = await self.git.create_workflow_commit(
            workflow_id=workflow_id,
            step_id=step_id,
            step_name=step_name,
            files_to_commit=files_modified,
        )

        if commit_info:
            self.commit_history.append(commit_info)

        return commit_info

    async def handle_tdd_cycle(
        self, phase: str, test_file: str, implementation_file: str, feature_description: str
    ) -> GitCommitInfo:
        """Handle TDD cycle commits."""
        commit_info = await self.git.create_tdd_cycle_commit(
            cycle_phase=phase,
            test_file=test_file,
            implementation_file=implementation_file,
            feature_description=feature_description,
        )

        if commit_info:
            self.commit_history.append(commit_info)

        return commit_info

    async def complete_workflow(
        self, workflow_id: str, workflow_result: dict[str, Any]
    ) -> GitCommitInfo:
        """
        Complete workflow execution with final commit.

        Args:
            workflow_id: Workflow ID
            workflow_result: Final workflow results

        Returns:
            GitCommitInfo with final commit details
        """
        commit_info = await self.git.commit_workflow_milestone(
            milestone_type="workflow_complete",
            milestone_name=f"Complete workflow: {workflow_id}",
            workflow_context={
                "workflow_id": workflow_id,
                "status": workflow_result.get("status"),
                "duration": workflow_result.get("duration_seconds"),
                "steps_completed": len(workflow_result.get("completed_steps", [])),
                "test_coverage": workflow_result.get("test_coverage"),
            },
        )

        if commit_info:
            self.commit_history.append(commit_info)

        # Auto-push final results
        await self.git.push_changes()

        return commit_info

    def get_session_summary(self) -> dict[str, Any]:
        """Get summary of current git session."""
        return {
            "total_commits": len(self.commit_history),
            "commits": [
                {
                    "hash": commit.commit_hash[:8],
                    "message": commit.commit_message.split("\n")[0],
                    "timestamp": commit.timestamp.isoformat(),
                    "files_changed": len(commit.files_changed),
                }
                for commit in self.commit_history
            ],
            "total_files_changed": sum(len(c.files_changed) for c in self.commit_history),
            "total_insertions": sum(c.insertions for c in self.commit_history),
            "total_deletions": sum(c.deletions for c in self.commit_history),
        }
