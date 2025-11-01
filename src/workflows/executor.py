"""
Workflow Executor - AI-powered step generation.

This executor takes a workflow definition and user context,
then generates personalized implementation steps using AI.
"""

import json
import logging
import os
import tomllib
from pathlib import Path
from typing import Optional

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider

from src.workflows.models import (
    Workflow,
    WorkflowContext,
    WorkflowExecution,
    WorkflowStep,
    WorkflowType,
)

logger = logging.getLogger(__name__)


class WorkflowExecutor:
    """
    Executes workflows by generating AI-powered implementation steps.

    Uses PydanticAI to generate context-aware steps based on:
    - Workflow definition (TOML file)
    - User context (energy, time, codebase state)
    - Task details (title, description, priority)
    """

    def __init__(self, workflows_dir: Path):
        """
        Initialize executor with workflows directory.

        Args:
            workflows_dir: Path to directory containing .toml workflow files
        """
        self.workflows_dir = workflows_dir
        self.workflows: dict[str, Workflow] = {}
        self._load_workflows()

    def _load_workflows(self) -> None:
        """Load all workflow definitions from TOML files."""
        if not self.workflows_dir.exists():
            logger.warning(f"Workflows directory does not exist: {self.workflows_dir}")
            return

        for toml_file in self.workflows_dir.glob("**/*.toml"):
            try:
                with open(toml_file, "rb") as f:
                    data = tomllib.load(f)

                workflow = Workflow(**data)
                self.workflows[workflow.workflow_id] = workflow
                logger.info(f"Loaded workflow: {workflow.name} ({workflow.workflow_id})")

            except Exception as e:
                logger.error(f"Failed to load workflow {toml_file}: {e}")

    def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        """Get workflow by ID."""
        return self.workflows.get(workflow_id)

    def list_workflows(self, workflow_type: Optional[WorkflowType] = None) -> list[Workflow]:
        """
        List all available workflows.

        Args:
            workflow_type: Optional filter by type

        Returns:
            List of workflows
        """
        workflows = list(self.workflows.values())

        if workflow_type:
            workflows = [w for w in workflows if w.workflow_type == workflow_type]

        return workflows

    async def execute_workflow(
        self,
        workflow_id: str,
        context: WorkflowContext,
        llm_api_key: Optional[str] = None,
    ) -> WorkflowExecution:
        """
        Execute workflow to generate implementation steps.

        Args:
            workflow_id: ID of workflow to execute
            context: User and task context for step generation
            llm_api_key: Optional API key override

        Returns:
            WorkflowExecution with generated steps

        Raises:
            ValueError: If workflow not found
            Exception: If AI generation fails
        """
        # Get workflow
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow not found: {workflow_id}")

        # Create execution record
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            task_id=context.task_id,
            user_id=context.user_id,
            context=context,
            llm_provider_used=workflow.llm_provider,
        )

        try:
            # Generate steps using AI
            steps = await self._generate_steps(workflow, context, llm_api_key)

            # Update execution
            execution.steps = steps
            execution.status = "completed"

            logger.info(
                f"Generated {len(steps)} steps for workflow {workflow_id} "
                f"(task: {context.task_id})"
            )

            return execution

        except Exception as e:
            execution.status = "failed"
            execution.error_message = str(e)
            logger.error(f"Workflow execution failed: {e}")
            raise

    async def _generate_steps(
        self,
        workflow: Workflow,
        context: WorkflowContext,
        llm_api_key: Optional[str] = None,
    ) -> list[WorkflowStep]:
        """
        Generate implementation steps using AI.

        Args:
            workflow: Workflow definition
            context: User and task context
            llm_api_key: Optional API key

        Returns:
            List of generated steps
        """
        # Build prompt with context
        user_prompt = self._build_user_prompt(workflow, context)

        # Initialize AI agent
        provider = OpenAIProvider(api_key=llm_api_key or os.getenv("LLM_API_KEY"))
        model = OpenAIModel("gpt-4.1-mini", provider=provider)

        agent = Agent(
            model,
            system_prompt=workflow.system_prompt,
            output_type=list[dict],  # Expect list of step dicts
        )

        # Generate steps
        result = await agent.run(user_prompt)

        # Convert to WorkflowStep objects
        steps = []
        for i, step_data in enumerate(result.output):
            step = WorkflowStep(
                title=step_data.get("title", f"Step {i+1}"),
                description=step_data.get("description", ""),
                estimated_minutes=step_data.get("estimated_minutes", 30),
                tdd_phase=step_data.get("tdd_phase"),
                validation_command=step_data.get("validation_command"),
                expected_outcome=step_data.get("expected_outcome"),
                icon=step_data.get("icon", workflow.default_icon),
                order=i,
            )
            steps.append(step)

        # Track token usage
        # Note: PydanticAI doesn't expose usage in result yet
        # We can add this when the API supports it

        return steps

    def _build_user_prompt(self, workflow: Workflow, context: WorkflowContext) -> str:
        """
        Build AI prompt from workflow template and context.

        Args:
            workflow: Workflow definition
            context: User and task context

        Returns:
            Formatted prompt string
        """
        # Prepare context variables
        template_vars = {
            "task_title": context.task_title,
            "task_description": context.task_description or "No detailed description provided.",
            "task_priority": context.task_priority,
            "estimated_hours": context.estimated_hours,
            "user_energy": context.user_energy,
            "user_energy_label": {1: "Low", 2: "Medium", 3: "High"}[context.user_energy],
            "time_of_day": context.time_of_day,
            "tests_passing": context.codebase_state.get("tests_passing", 0),
            "tests_failing": context.codebase_state.get("tests_failing", 0),
            "recent_files": "\n".join(context.codebase_state.get("recent_files", [])),
            "recent_tasks": "\n".join(context.recent_tasks),
            "current_branch": context.current_branch or "main",
            "expected_step_count": workflow.expected_step_count,
        }

        # Fill template
        prompt = workflow.user_prompt_template.format(**template_vars)

        return prompt

    def get_step_by_id(self, execution: WorkflowExecution, step_id: str) -> Optional[WorkflowStep]:
        """Get a specific step from execution."""
        for step in execution.steps:
            if step.step_id == step_id:
                return step
        return None

    def mark_step_complete(
        self,
        execution: WorkflowExecution,
        step_id: str,
        actual_minutes: Optional[int] = None,
        notes: Optional[str] = None,
    ) -> bool:
        """
        Mark a step as completed.

        Args:
            execution: WorkflowExecution to update
            step_id: ID of step to complete
            actual_minutes: Actual time taken
            notes: Optional notes

        Returns:
            True if step was found and marked complete
        """
        step = self.get_step_by_id(execution, step_id)
        if not step:
            return False

        from datetime import datetime

        step.status = "completed"
        step.completed_at = datetime.now()
        step.actual_minutes = actual_minutes
        step.notes = notes

        return True
