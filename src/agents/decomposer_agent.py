"""
Decomposer Agent - Recursive Task Decomposition

Recursively breaks down complex tasks into atomic MicroSteps (3-15 minute actions).
Stops when each leaf is atomic (single verb, single object, fits practical time window).
Avoids over-splitting trivial tasks - tasks under 15 minutes stay as single steps.

Inspired by Task Master's expand_task pattern with ADHD-optimized splitting from SplitProxyAgent.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from src.agents.base import BaseProxyAgent
from src.agents.split_proxy_agent import SplitProxyAgent
from src.core.models import AgentRequest
from src.core.task_models import MicroStep, Task, TaskScope
from src.database.enhanced_adapter import EnhancedDatabaseAdapter

# AI client availability flags (not currently used but reserved for future AI integration)
OPENAI_AVAILABLE = False
ANTHROPIC_AVAILABLE = False

logger = logging.getLogger(__name__)


class DecomposerAgent(BaseProxyAgent):
    """
    Agent for recursive task decomposition into atomic MicroSteps.

    Enhances SplitProxyAgent with recursive capabilities - keeps splitting
    until every leaf is a 3-15 minute atomic action (practical range).
    Simple tasks (< 15 min) remain unsplit to avoid excessive granularity.
    """

    def __init__(self, db: EnhancedDatabaseAdapter | None = None):
        super().__init__("decomposer", db)
        self.split_agent = SplitProxyAgent()
        self.max_depth = 7  # 7 levels: 0=Initiative to 6=Step

        # Hierarchy level names
        self.level_names = {
            0: "initiative",
            1: "phase",
            2: "epic",
            3: "sprint",
            4: "task",
            5: "subtask",
            6: "step",
        }

        # Split range per level
        self.split_ranges = {
            0: (2, 6),   # Initiative -> Phases
            1: (2, 6),   # Phase -> Projects (removed from hierarchy)
            2: (4, 50),  # Epic -> Sprints (variable range)
            3: (2, 6),   # Sprint -> Tasks
            4: (2, 6),   # Task -> Subtasks
            5: (2, 6),   # Subtask -> Steps
            6: (1, 1),   # Steps never split
        }

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
                "message": "Task too complex - reached max depth. Please simplify manually.",
            }

        # Use SplitProxyAgent to analyze task scope
        split_result = await self.split_agent.split_task(task, user_id)

        scope = split_result.get("scope")

        # SIMPLE scope - already atomic, no further splitting
        if scope == TaskScope.SIMPLE or scope == "simple":
            # Create single MicroStep from task
            micro_step = MicroStep(
                parent_task_id=task.task_id,
                step_number=1,
                description=task.title,
                estimated_minutes=min(10, int(float(task.estimated_hours or 0.1) * 60))
                if task.estimated_hours
                else 5,
                icon="⚡",  # Default icon for simple tasks
            )
            return {
                "task_id": task.task_id,
                "scope": TaskScope.SIMPLE,
                "micro_steps": [micro_step],
                "message": "Task is atomic - no decomposition needed!",
            }

        # PROJECT scope - needs subtask creation first
        if scope == TaskScope.PROJECT or scope == "project":
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
        for i, step_data in enumerate(micro_steps_data):
            if isinstance(step_data, dict):
                # Debug first step
                if i == 0:
                    import sys
                    print(f"🔍 decomposer converting dict: icon={repr(step_data.get('icon'))}, short_label={repr(step_data.get('short_label'))}", file=sys.stderr)

                micro_step = MicroStep(
                    parent_task_id=task.task_id,
                    step_number=step_data.get("step_number", len(micro_steps) + 1),
                    description=step_data["description"],
                    short_label=step_data.get("short_label"),
                    estimated_minutes=step_data["estimated_minutes"],
                    icon=step_data.get("icon"),
                    delegation_mode=step_data.get("delegation_mode", "do"),
                )

                # Debug after creation
                if i == 0:
                    print(f"🔍 decomposer created MicroStep: icon={repr(micro_step.icon)}, short_label={repr(micro_step.short_label)}", file=sys.stderr)
            else:
                micro_step = step_data  # Already a MicroStep object

            # Check if this micro-step needs further splitting
            if self._is_atomic(micro_step):
                micro_steps.append(micro_step)
            else:
                # Micro-step is still too complex - recurse
                import sys
                print(f"🔍 Recursing for non-atomic step: {micro_step.description[:60]}... (est_min: {micro_step.estimated_minutes}, len: {len(micro_step.description)})", file=sys.stderr)
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
        - Description under 150 characters
        - Estimated time is 2-15 minutes (practical range)
        """
        description = micro_step.description.lower()

        # Check time constraint - increased to 15 min for practical micro-steps
        if micro_step.estimated_minutes > 15:
            return False

        # Check description length (proxy for complexity) - relaxed to 150 chars
        if len(description) > 150:
            return False

        # Check for strong compound actions only (reduced false positives)
        # Only split on clear sequential indicators, not simple "and" conjunctions
        compound_indicators = [" then ", " after that", " followed by", "; "]
        return not any(indicator in description for indicator in compound_indicators)

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
        for _, subtask_data in enumerate(subtasks_data, 1):
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

    async def decompose_task_hierarchy(
        self,
        task: Task,
        max_level: int | None = None,
        force_atomic: bool = False,
    ) -> dict[str, Any]:
        """
        Decompose a task into hierarchical children using the 7-level system.

        Progressive decomposition - only creates immediate children, not entire tree.

        Args:
            task: The task to decompose
            max_level: Optional max level to decompose to (0-6)
            force_atomic: If True, decompose all the way to atomic steps (level 6)

        Returns:
            Dict with task_id, children array, and metadata
        """
        from src.core.task_models import DecompositionState, LeafType

        # Determine stop conditions
        if task.level >= 6:  # Already at Step level
            return {
                "task_id": task.task_id,
                "children": [],
                "message": "Already at atomic Step level (L6)",
            }

        if task.estimated_minutes <= 3 and not force_atomic:
            return {
                "task_id": task.task_id,
                "children": [],
                "message": "Task is under 3 minutes - no decomposition needed",
            }

        if max_level is not None and task.level >= max_level:
            return {
                "task_id": task.task_id,
                "children": [],
                "message": f"Reached max level {max_level}",
            }

        # Get split range for this level
        min_children, max_children = self.split_ranges.get(task.level, (2, 6))

        # Determine optimal number of children based on time
        estimated_minutes = int((task.estimated_hours or 0) * 60) or task.total_minutes or 30
        if estimated_minutes <= 10:
            num_children = 2
        elif estimated_minutes <= 30:
            num_children = min(3, max_children)
        elif estimated_minutes <= 120:
            num_children = min(4, max_children)
        else:
            # For large tasks, scale up (especially for Epics)
            if task.level == 2:  # Epic level - can have 4-50 children
                num_children = min(int(estimated_minutes / 60), max_children)
            else:
                num_children = min(6, max_children)

        # Use SplitProxyAgent to generate children
        child_level_name = self.level_names.get(task.level + 1, "task")

        # Build AI prompt for this specific level
        prompt = f"""You are decomposing a {self.level_names[task.level]} into {num_children} {child_level_name}s.

Task: {task.title}
Description: {task.description or task.title}
Estimated Time: {estimated_minutes} minutes
Current Level: {task.level} ({self.level_names[task.level]})
Target Level: {task.level + 1} ({child_level_name})

Requirements:
1. Create exactly {num_children} {child_level_name}s
2. Each should be logically grouped and semantically meaningful
3. Total time should roughly equal {estimated_minutes} minutes
4. Provide a custom emoji for each {child_level_name}
5. Each {child_level_name} should have a clear, actionable title

Return JSON array:
[
  {{
    "title": "Clear title for this {child_level_name}",
    "description": "Brief description",
    "estimated_minutes": 100,
    "custom_emoji": "🎯"
  }},
  ...
]

Focus on LOGICAL SEMANTIC GROUPING, not just time-based splits."""

        # Call AI
        children_data = []
        try:
            if self.split_agent.openai_client:
                response = await self.split_agent.openai_client.chat.completions.create(
                    model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a task decomposition assistant. Always return valid JSON.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.7,
                )
                result = json.loads(response.choices[0].message.content)
                children_data = result.get("items", result.get("children", []))

        except Exception as e:
            logger.error(f"AI decomposition failed: {e}")
            # Fallback: Simple equal splits
            time_per_child = estimated_minutes // num_children
            for i in range(num_children):
                children_data.append({
                    "title": f"{child_level_name.capitalize()} {i+1}",
                    "description": f"Part {i+1} of {task.title}",
                    "estimated_minutes": time_per_child,
                    "custom_emoji": "📋",
                })

        # Create child Task objects
        children = []
        total_minutes = 0

        for i, child_data in enumerate(children_data[:num_children], 1):
            child_minutes = child_data.get("estimated_minutes", estimated_minutes // num_children)
            total_minutes += child_minutes

            child = {
                "task_id": f"{task.task_id}-child-{i}",
                "title": child_data["title"],
                "description": child_data.get("description", child_data["title"]),
                "level": task.level + 1,
                "parent_id": task.task_id,
                "estimated_minutes": child_minutes,
                "total_minutes": child_minutes,
                "custom_emoji": child_data.get("custom_emoji"),
                "decomposition_state": DecompositionState.STUB.value,
                "is_leaf": (task.level + 1) >= 6 or child_minutes <= 3,
                "leaf_type": None,  # Will be classified when it becomes a leaf
                "children_ids": [],
            }

            # If this is now a leaf (Step level or <= 3 min), classify it
            if child["is_leaf"]:
                # Simple heuristic: if description contains digital keywords
                digital_keywords = [
                    "api",
                    "code",
                    "script",
                    "database",
                    "email",
                    "automated",
                    "digital",
                ]
                desc_lower = child["description"].lower()
                if any(keyword in desc_lower for keyword in digital_keywords):
                    child["leaf_type"] = LeafType.DIGITAL.value
                else:
                    child["leaf_type"] = LeafType.HUMAN.value
                child["decomposition_state"] = DecompositionState.ATOMIC.value

            children.append(child)

        return {
            "task_id": task.task_id,
            "children": children,
            "total_minutes": total_minutes,
            "level": task.level,
            "child_level": task.level + 1,
            "message": f"Decomposed into {len(children)} {child_level_name}s",
        }

    def _format_decomposition_response(self, result: dict) -> str:
        """Format decomposition results as readable message."""
        response_lines = [
            "🔧 **Task Decomposition Complete**",
            "",
            f"**Scope:** {result.get('scope', 'UNKNOWN').upper()}",
            f"**Micro-Steps:** {len(result.get('micro_steps', []))}",
        ]

        if result.get("subtasks"):
            response_lines.append(f"**Subtasks Created:** {result['subtasks']}")

        if result.get("total_estimated_minutes"):
            response_lines.append(
                f"**Total Time:** {result['total_estimated_minutes']} minutes"
            )

        response_lines.append("")
        response_lines.append("**Next Steps:**")

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
