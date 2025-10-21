"""
Split Proxy Agent - ADHD-Optimized Task Splitting with AI

Breaks complex tasks into 2-5 minute micro-steps using AI.
Implements the psychology from HABIT.md:
- Immediate dopamine hits (quick wins)
- Clear progress tracking
- Delegation mode per step (4D system)
- ADHD-friendly single focus

Follows TDD - driven by API endpoint tests.
"""

import os
import logging
from datetime import datetime
from decimal import Decimal
from typing import Any

from src.core.task_models import Task, TaskScope, DelegationMode, MicroStep
from src.core.models import AgentRequest, AgentResponse

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


class SplitProxyAgent:
    """
    Split Proxy Agent - Breaks tasks into micro-steps

    Uses AI to analyze tasks and create 2-5 minute actionable steps.
    Each step gets a delegation mode (DO, DO_WITH_ME, DELEGATE, DELETE).
    """

    def __init__(self):
        self.agent_type = "split"

        # Determine AI provider
        self.ai_provider = os.getenv("LLM_PROVIDER", "openai").lower()

        # Initialize AI clients
        if OPENAI_AVAILABLE and self.ai_provider == "openai":
            api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
            if api_key:
                self.openai_client = openai.AsyncOpenAI(api_key=api_key)
            else:
                self.openai_client = None
                logger.warning("OpenAI API key not found")
        else:
            self.openai_client = None

        if ANTHROPIC_AVAILABLE and self.ai_provider == "anthropic":
            api_key = os.getenv("LLM_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
            if api_key:
                self.anthropic_client = anthropic.AsyncAnthropic(api_key=api_key)
            else:
                self.anthropic_client = None
                logger.warning("Anthropic API key not found")
        else:
            self.anthropic_client = None

    async def split_task(self, task: Task, user_id: str) -> dict[str, Any]:
        """
        Split a task into micro-steps

        Args:
            task: The task to split
            user_id: User requesting the split

        Returns:
            Dict with micro_steps array and next_action
        """
        # Determine if task needs splitting based on scope
        scope = self._determine_task_scope(task)

        if scope == TaskScope.SIMPLE:
            # Simple tasks don't need splitting
            return {
                "task_id": task.task_id,
                "scope": scope,
                "micro_steps": [],
                "next_action": {
                    "step_number": 1,
                    "description": task.title,
                    "estimated_minutes": 5
                },
                "message": "Task is simple enough - no splitting needed. Just do it!"
            }

        # For MULTI and PROJECT scope, use AI to split
        if scope == TaskScope.PROJECT:
            # PROJECT scope: suggest breaking into subtasks first
            return {
                "task_id": task.task_id,
                "scope": scope,
                "micro_steps": [],
                "suggestion": (
                    "This is a complex project (60+ minutes). "
                    "Consider breaking it into smaller subtasks first, "
                    "then split each subtask into micro-steps."
                ),
                "estimated_phases": self._estimate_project_phases(task)
            }

        # MULTI scope: Generate micro-steps with AI
        micro_steps = await self._generate_micro_steps_with_ai(task, user_id)

        return {
            "task_id": task.task_id,
            "scope": scope,
            "micro_steps": [
                {
                    "step_id": step.step_id,
                    "step_number": step.step_number,
                    "description": step.description,
                    "estimated_minutes": step.estimated_minutes,
                    "delegation_mode": step.delegation_mode,
                    "status": step.status
                }
                for step in micro_steps
            ],
            "next_action": {
                "step_number": 1,
                "description": micro_steps[0].description,
                "estimated_minutes": micro_steps[0].estimated_minutes
            } if micro_steps else None,
            "total_estimated_minutes": sum(s.estimated_minutes for s in micro_steps)
        }

    def _determine_task_scope(self, task: Task) -> TaskScope:
        """Determine task scope from estimated hours"""
        if not task.estimated_hours:
            # No estimate - analyze description length
            if len(task.description) < 100:
                return TaskScope.SIMPLE
            return TaskScope.MULTI

        hours = float(task.estimated_hours)
        minutes = hours * 60

        if minutes < 10:
            return TaskScope.SIMPLE
        elif minutes <= 60:
            return TaskScope.MULTI
        else:
            return TaskScope.PROJECT

    def _estimate_project_phases(self, task: Task) -> list[str]:
        """Estimate high-level phases for PROJECT scope tasks"""
        # Simple heuristic-based phases
        return [
            "Phase 1: Planning & Research",
            "Phase 2: Core Implementation",
            "Phase 3: Testing & Refinement",
            "Phase 4: Completion & Review"
        ]

    async def _generate_micro_steps_with_ai(
        self,
        task: Task,
        user_id: str
    ) -> list[MicroStep]:
        """
        Use AI to generate micro-steps for a task

        Implements ADHD-optimized splitting:
        - 2-5 minute steps (1-10 min range)
        - 3-7 steps total (not overwhelming)
        - Clear, actionable descriptions
        - Delegation mode suggestions
        """
        # Build prompt for AI
        prompt = self._build_split_prompt(task)

        # Call AI based on provider
        if self.openai_client and self.ai_provider == "openai":
            steps_data = await self._split_with_openai(prompt, task)
        elif self.anthropic_client and self.ai_provider == "anthropic":
            steps_data = await self._split_with_anthropic(prompt, task)
        else:
            # Fallback: Rule-based splitting
            steps_data = self._split_with_rules(task)

        # Convert to MicroStep objects
        micro_steps = []
        for i, step_data in enumerate(steps_data, 1):
            step = MicroStep(
                parent_task_id=task.task_id,
                step_number=i,
                description=step_data["description"],
                estimated_minutes=step_data["estimated_minutes"],
                delegation_mode=step_data.get("delegation_mode", DelegationMode.DO)
            )
            micro_steps.append(step)

        return micro_steps

    def _build_split_prompt(self, task: Task) -> str:
        """Build AI prompt for task splitting"""
        estimated_time = f"{float(task.estimated_hours) * 60:.0f} minutes" if task.estimated_hours else "30 minutes"

        return f"""You are an ADHD-optimized task management assistant. Break this task into micro-steps.

Task: {task.title}
Description: {task.description}
Estimated Time: {estimated_time}
Priority: {task.priority}

Requirements:
1. Create 3-7 micro-steps (ADHD-friendly, not overwhelming)
2. Each step should take 2-5 minutes (max 10 minutes)
3. Steps must be SPECIFIC and ACTIONABLE (not vague)
4. Assign delegation_mode to each step:
   - "do" = Do it yourself (requires focus)
   - "do_with_me" = Do with assistance (pairing/mentoring)
   - "delegate" = Fully delegate to someone/something else
   - "delete" = This step isn't needed (eliminate)
5. First step should be the easiest (quick win for dopamine!)
6. Total time should roughly match estimated time

Return JSON array of steps:
[
  {{
    "description": "Specific action to take",
    "estimated_minutes": 3,
    "delegation_mode": "do"
  }},
  ...
]

Focus on CLARITY and IMMEDIATE ACTION. No vague steps like "research" or "plan"."""

    async def _split_with_openai(self, prompt: str, task: Task) -> list[dict]:
        """Split task using OpenAI"""
        try:
            response = await self.openai_client.chat.completions.create(
                model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": "You are an ADHD-optimized task splitting assistant. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )

            import json
            result = json.loads(response.choices[0].message.content)

            # Handle different response formats
            if "steps" in result:
                return result["steps"]
            elif isinstance(result, list):
                return result
            else:
                # Fallback if unexpected format
                return self._split_with_rules(task)

        except Exception as e:
            logger.error(f"OpenAI split failed: {e}")
            return self._split_with_rules(task)

    async def _split_with_anthropic(self, prompt: str, task: Task) -> list[dict]:
        """Split task using Anthropic Claude"""
        try:
            response = await self.anthropic_client.messages.create(
                model=os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022"),
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )

            import json
            content = response.content[0].text

            # Extract JSON from response
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            result = json.loads(content.strip())

            if "steps" in result:
                return result["steps"]
            elif isinstance(result, list):
                return result
            else:
                return self._split_with_rules(task)

        except Exception as e:
            logger.error(f"Anthropic split failed: {e}")
            return self._split_with_rules(task)

    def _split_with_rules(self, task: Task) -> list[dict]:
        """
        Fallback: Rule-based task splitting (no AI)

        Simple heuristic splitting for when AI is unavailable.
        """
        # Estimate number of steps based on task time
        if task.estimated_hours:
            total_minutes = float(task.estimated_hours) * 60
            num_steps = max(2, min(7, int(total_minutes / 5)))  # 3-7 steps
        else:
            num_steps = 4  # Default to 4 steps

        # Generate generic but useful steps
        steps = []

        # Step 1: Always start with setup/preparation (easy win)
        steps.append({
            "description": f"Gather materials and set up workspace for: {task.title}",
            "estimated_minutes": 2,
            "delegation_mode": "do"
        })

        # Middle steps: Core work (split evenly)
        remaining_time = (float(task.estimated_hours) * 60 - 2) if task.estimated_hours else 18
        time_per_step = max(3, int(remaining_time / (num_steps - 2)))

        for i in range(2, num_steps):
            steps.append({
                "description": f"Work on: {task.title} (part {i-1})",
                "estimated_minutes": min(10, time_per_step),
                "delegation_mode": "do"
            })

        # Final step: Review/complete
        steps.append({
            "description": f"Review and finalize: {task.title}",
            "estimated_minutes": 3,
            "delegation_mode": "do"
        })

        return steps
