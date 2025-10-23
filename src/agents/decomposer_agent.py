"""
Decomposer Agent - Recursive Task Decomposition

Recursively breaks down complex tasks into atomic MicroSteps (2-5 minute actions).
Stops when each leaf is atomic (single verb, single object, fits 2-5 min window).

Inspired by Task Master's expand_task pattern with ADHD-optimized splitting from SplitProxyAgent.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Optional

from src.agents.base import BaseProxyAgent
from src.agents.split_proxy_agent import SplitProxyAgent
from src.core.models import AgentRequest
from src.core.task_models import MicroStep, Task, TaskScope
from src.database.enhanced_adapter import EnhancedDatabaseAdapter

# Try to import AI clients
try:
    import openai

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic

    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

logger = logging.getLogger(__name__)


class DecomposerAgent(BaseProxyAgent):
    """
    Agent for recursive task decomposition into atomic MicroSteps.

    Enhances SplitProxyAgent with recursive capabilities - keeps splitting
    until every leaf is a 2-5 minute atomic action.
    """

    def __init__(self, db: Optional[EnhancedDatabaseAdapter] = None):
        super().__init__("decomposer", db)
        self.split_agent = SplitProxyAgent()
        self.max_depth = 5  # Prevent infinite recursion

    async def _handle_request(
        self, request: AgentRequest, history: list[dict]
    ) -> tuple[str, int]:
        """
        Process task decomposition request.

        Args:
            request: AgentRequest containing task data in metadata
            history: Conversation history (not used)

        Returns:
            Tuple of (response message, XP earned)
        """
        # Extract task from request
        task_data = request.metadata.get("task")
        if not task_data:
            return "❌ No task data provided for decomposition", 0

        try:
            task = Task(**task_data)
        except Exception as e:
            return f"❌ Invalid task data: {str(e)}", 0

        # Decompose task recursively
        result = await self.decompose_task(task, request.user_id)

        # Format response
        response = self._format_decomposition_response(result)

        # Award XP based on complexity
        leaf_count = len(result.get("micro_steps", []))
        xp = 20 + (leaf_count * 5)  # Base 20 + 5 per micro-step

        return response, xp

    async def decompose_task(
        self, task: Task, user_id: str, depth: int = 0
    ) -> dict[str, Any]:
        """
        Recursively decompose a task into atomic MicroSteps.

        Args:
            task: The task to decompose
            user_id: User ID for context
            depth: Current recursion depth (for safety)

        Returns:
            Dict with task_id, scope, micro_steps array, and metadata
        """
        # Safety check - prevent infinite recursion
        if depth >= self.max_depth:
            logger.warning(
                f"Max decomposition depth ({self.max_depth}) reached for task {task.task_id}"
            )
            return {
                "task_id": task.task_id,
                "scope": TaskScope.SIMPLE,
                "micro_steps": [],
                "message": f"Task too complex - reached max depth. Please simplify manually.",
            }

        # Use SplitProxyAgent to analyze task scope
        split_result = await self.split_agent.split_task(task, user_id)

        scope = split_result.get("scope")

        # SIMPLE scope - already atomic, no further splitting
        if scope == TaskScope.SIMPLE:
            # Create single MicroStep from task
            micro_step = MicroStep(
                parent_task_id=task.task_id,
                step_number=1,
                description=task.title,
                estimated_minutes=min(10, int(float(task.estimated_hours or 0.1) * 60))
                if task.estimated_hours
                else 5,
            )
            return {
                "task_id": task.task_id,
                "scope": TaskScope.SIMPLE,
                "micro_steps": [micro_step],
                "message": "Task is atomic - no decomposition needed!",
            }

        # PROJECT scope - needs subtask creation first
        if scope == TaskScope.PROJECT:
            # Generate subtasks first, then decompose each
            subtasks = await self._generate_subtasks(task, user_id)

            # Recursively decompose each subtask
            all_micro_steps = []
            for subtask in subtasks:
                subtask_result = await self.decompose_task(subtask, user_id, depth + 1)
                all_micro_steps.extend(subtask_result.get("micro_steps", []))

            return {
                "task_id": task.task_id,
                "scope": TaskScope.PROJECT,
                "micro_steps": all_micro_steps,
                "subtasks": len(subtasks),
                "message": f"Complex project decomposed into {len(subtasks)} subtasks → {len(all_micro_steps)} micro-steps",
            }

        # MULTI scope - split into micro-steps
        micro_steps_data = split_result.get("micro_steps", [])

        # Convert to MicroStep objects if needed
        micro_steps = []
        for step_data in micro_steps_data:
            if isinstance(step_data, dict):
                micro_step = MicroStep(
                    parent_task_id=task.task_id,
                    step_number=step_data.get("step_number", len(micro_steps) + 1),
                    description=step_data["description"],
                    estimated_minutes=step_data["estimated_minutes"],
                    delegation_mode=step_data.get("delegation_mode", "do"),
                )
            else:
                micro_step = step_data  # Already a MicroStep object

            # Check if this micro-step needs further splitting
            if self._is_atomic(micro_step):
                micro_steps.append(micro_step)
            else:
                # Micro-step is still too complex - recurse
                sub_task = self._micro_step_to_task(micro_step, task)
                sub_result = await self.decompose_task(sub_task, user_id, depth + 1)
                micro_steps.extend(sub_result.get("micro_steps", []))

        # Re-number steps sequentially
        for i, step in enumerate(micro_steps, 1):
            step.step_number = i

        return {
            "task_id": task.task_id,
            "scope": TaskScope.MULTI,
            "micro_steps": micro_steps,
            "total_estimated_minutes": sum(s.estimated_minutes for s in micro_steps),
            "message": f"Task decomposed into {len(micro_steps)} atomic micro-steps",
        }

    def _is_atomic(self, micro_step: MicroStep) -> bool:
        """
        Determine if a MicroStep is atomic (no further splitting needed).

        Criteria for atomic:
        - Single clear action verb
        - Single object
        - Description under 100 characters
        - Estimated time is 2-10 minutes
        """
        description = micro_step.description.lower()

        # Check time constraint
        if micro_step.estimated_minutes > 10:
            return False

        # Check description length (proxy for complexity)
        if len(description) > 100:
            return False

        # Check for compound actions (and, then, after, etc.)
        compound_indicators = [" and ", " then ", " after ", ", ", ";"]
        if any(indicator in description for indicator in compound_indicators):
            return False

        # If all checks pass, it's atomic
        return True

    def _micro_step_to_task(self, micro_step: MicroStep, parent_task: Task) -> Task:
        """Convert a MicroStep back into a Task for further decomposition."""
        return Task(
            title=micro_step.description,
            description=micro_step.description,
            project_id=parent_task.project_id,
            parent_id=parent_task.task_id,
            estimated_hours=round(micro_step.estimated_minutes / 60, 2),  # Round to 2 decimals
            priority=parent_task.priority,
        )

    async def _generate_subtasks(self, task: Task, user_id: str) -> list[Task]:
        """
        Generate high-level subtasks for PROJECT scope tasks.

        Uses AI to break large project into manageable chunks (3-5 subtasks).
        """
        # Build prompt for subtask generation
        prompt = self._build_subtask_prompt(task)

        # Call AI to generate subtasks
        if self.split_agent.openai_client:
            subtasks_data = await self._generate_subtasks_with_openai(prompt, task)
        elif self.split_agent.anthropic_client:
            subtasks_data = await self._generate_subtasks_with_anthropic(prompt, task)
        else:
            # Fallback: Rule-based phase breakdown
            subtasks_data = self._generate_subtasks_with_rules(task)

        # Convert to Task objects
        subtasks = []
        for i, subtask_data in enumerate(subtasks_data, 1):
            subtask = Task(
                title=subtask_data["title"],
                description=subtask_data.get("description", subtask_data["title"]),
                project_id=task.project_id,
                parent_id=task.task_id,
                estimated_hours=subtask_data.get("estimated_hours", 0.5),
                priority=task.priority,
            )
            subtasks.append(subtask)

        return subtasks

    def _build_subtask_prompt(self, task: Task) -> str:
        """Build AI prompt for subtask generation."""
        return f"""You are a task decomposition assistant. Break this complex project into high-level subtasks.

Project: {task.title}
Description: {task.description}
Estimated Time: {float(task.estimated_hours) if task.estimated_hours else 'Unknown'}  hours

Requirements:
1. Create 3-5 high-level subtasks (major phases)
2. Each subtask should take 30-60 minutes
3. Subtasks should be sequential and logical
4. Each subtask title should be clear and actionable

Return JSON array of subtasks:
[
  {{
    "title": "Phase 1: Research and Planning",
    "description": "Gather requirements and create plan",
    "estimated_hours": 0.75
  }},
  ...
]

Focus on LOGICAL PHASES of the project."""

    async def _generate_subtasks_with_openai(
        self, prompt: str, task: Task
    ) -> list[dict]:
        """Generate subtasks using OpenAI."""
        try:
            response = await self.split_agent.openai_client.chat.completions.create(
                model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            result = json.loads(content)

            # Handle both wrapped and unwrapped formats
            if "subtasks" in result:
                return result["subtasks"]
            return result if isinstance(result, list) else []

        except Exception as e:
            logger.error(f"OpenAI subtask generation failed: {e}")
            return self._generate_subtasks_with_rules(task)

    async def _generate_subtasks_with_anthropic(
        self, prompt: str, task: Task
    ) -> list[dict]:
        """Generate subtasks using Anthropic Claude."""
        try:
            response = await self.split_agent.anthropic_client.messages.create(
                model=os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022"),
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
            )

            content = response.content[0].text

            # Extract JSON from markdown if wrapped
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
            else:
                json_str = content

            result = json.loads(json_str)

            # Handle both wrapped and unwrapped formats
            if "subtasks" in result:
                return result["subtasks"]
            return result if isinstance(result, list) else []

        except Exception as e:
            logger.error(f"Anthropic subtask generation failed: {e}")
            return self._generate_subtasks_with_rules(task)

    def _generate_subtasks_with_rules(self, task: Task) -> list[dict]:
        """Generate subtasks using heuristic rules (fallback)."""
        # Simple 4-phase breakdown
        return [
            {
                "title": "Planning & Research",
                "description": f"Plan and research for: {task.title}",
                "estimated_hours": 0.5,
            },
            {
                "title": "Core Implementation",
                "description": f"Main implementation work for: {task.title}",
                "estimated_hours": 1.0,
            },
            {
                "title": "Testing & Refinement",
                "description": f"Test and refine: {task.title}",
                "estimated_hours": 0.5,
            },
            {
                "title": "Completion & Review",
                "description": f"Final review and completion: {task.title}",
                "estimated_hours": 0.25,
            },
        ]

    def _format_decomposition_response(self, result: dict) -> str:
        """Format decomposition results as readable message."""
        response_lines = [
            f"🔧 **Task Decomposition Complete**",
            f"",
            f"**Scope:** {result.get('scope', 'UNKNOWN').upper()}",
            f"**Micro-Steps:** {len(result.get('micro_steps', []))}",
        ]

        if result.get("subtasks"):
            response_lines.append(f"**Subtasks Created:** {result['subtasks']}")

        if result.get("total_estimated_minutes"):
            response_lines.append(
                f"**Total Time:** {result['total_estimated_minutes']} minutes"
            )

        response_lines.append(f"")
        response_lines.append(f"**Next Steps:**")

        micro_steps = result.get("micro_steps", [])
        for i, step in enumerate(micro_steps[:5], 1):  # Show first 5
            if isinstance(step, dict):
                desc = step.get("description", "Unknown")
                mins = step.get("estimated_minutes", 0)
            else:
                desc = step.description
                mins = step.estimated_minutes

            response_lines.append(f"  {i}. {desc} ({mins} min)")

        if len(micro_steps) > 5:
            response_lines.append(f"  ... and {len(micro_steps) - 5} more steps")

        return "\n".join(response_lines)
