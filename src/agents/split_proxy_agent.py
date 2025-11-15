"""
Split Proxy Agent - ADHD-Optimized Task Splitting with AI

Breaks complex tasks into 3-10 minute micro-steps using AI.
Implements the psychology from HABIT.md:
- Immediate dopamine hits (quick wins)
- Clear progress tracking
- Delegation mode per step (4D system)
- ADHD-friendly single focus
- Avoids over-splitting trivial tasks (< 15 min stays as single task)

Follows TDD - driven by API endpoint tests.
"""

import logging
import os
from typing import Any

from src.core.task_models import DelegationMode, MicroStep, Task, TaskScope

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

    Uses AI to analyze tasks and create 3-10 minute actionable steps.
    Simple tasks (< 15 min) are not split to avoid over-granularity.
    Each step gets a delegation mode (DO, DO_WITH_ME, DELEGATE, DELETE).
    """

    # Task type detection keywords
    EMAIL_KEYWORDS = ["email", "message", "send"]
    SHOPPING_KEYWORDS = ["buy", "shop", "grocery", "purchase"]
    CALL_KEYWORDS = ["call", "phone", "contact"]

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
        Split a task into micro-steps (main orchestrator).

        Determines task scope and routes to appropriate handler.
        SIMPLE tasks are not split, PROJECT tasks get phase suggestions,
        MULTI tasks are split into 3-5 micro-steps using AI or rules.

        Args:
            task: The task to split
            user_id: User requesting the split

        Returns:
            Dict with task_id, scope, micro_steps, next_action/message,
            and metadata indicating if LLM or fallback was used
        """
        scope = self._determine_task_scope(task)

        if scope == TaskScope.SIMPLE:
            result = self._handle_simple_scope(task)
        elif scope == TaskScope.PROJECT:
            result = self._handle_project_scope(task)
        else:
            result = await self._handle_multi_scope(task, user_id)

        # Add metadata about LLM usage
        result["metadata"] = {
            "ai_provider": self.ai_provider if scope == TaskScope.MULTI else None,
            "llm_used": bool(
                scope == TaskScope.MULTI and (self.openai_client or self.anthropic_client)
            ),
            "generation_method": self._get_generation_method(scope),
        }

        return result

    def _get_generation_method(self, scope: TaskScope) -> str:
        """Get the method used to generate steps."""
        if scope == TaskScope.SIMPLE:
            return "none"  # No splitting for simple tasks
        elif scope == TaskScope.PROJECT:
            return "phase_suggestions"  # Project-level phases
        elif self.openai_client or self.anthropic_client:
            return "ai_llm"  # Real LLM API call
        else:
            return "rule_based_fallback"  # ⚠️ FALLBACK USED!

    def _handle_simple_scope(self, task: Task) -> dict[str, Any]:
        """
        Handle SIMPLE scope tasks (<15 minutes).

        These tasks are too small to split - splitting would add unnecessary
        overhead and reduce dopamine hit from quick completion.

        Args:
            task: The simple task

        Returns:
            Response with message explaining no splitting needed
        """
        return {
            "task_id": task.task_id,
            "scope": TaskScope.SIMPLE,
            "micro_steps": [],
            "next_action": {
                "step_number": 1,
                "description": task.title,
                "estimated_minutes": 5,
            },
            "message": "Task is simple enough - no splitting needed. Just do it!",
        }

    def _handle_project_scope(self, task: Task) -> dict[str, Any]:
        """
        Handle PROJECT scope tasks (>60 minutes).

        Large projects should be broken into subtasks first,
        then each subtask can be split into micro-steps.

        Args:
            task: The large project task

        Returns:
            Response with phase suggestions instead of micro-steps
        """
        return {
            "task_id": task.task_id,
            "scope": TaskScope.PROJECT,
            "micro_steps": [],
            "suggestion": (
                "This is a complex project (60+ minutes). "
                "Consider breaking it into smaller subtasks first, "
                "then split each subtask into micro-steps."
            ),
            "estimated_phases": self._estimate_project_phases(task),
        }

    async def _handle_multi_scope(self, task: Task, user_id: str) -> dict[str, Any]:
        """
        Handle MULTI scope tasks (15-60 minutes).

        Generates 3-5 micro-steps using AI or rule-based fallback.
        Each step is 2-5 minutes for ADHD optimization.

        Args:
            task: The multi-scope task
            user_id: User requesting the split

        Returns:
            Response with micro-steps array and next action
        """
        micro_steps = await self._generate_micro_steps_with_ai(task, user_id)

        return {
            "task_id": task.task_id,
            "scope": TaskScope.MULTI,
            "micro_steps": [self._serialize_micro_step(s) for s in micro_steps],
            "next_action": self._get_next_action(micro_steps),
            "total_estimated_minutes": sum(s.estimated_minutes for s in micro_steps),
        }

    def _serialize_micro_step(self, step: MicroStep) -> dict[str, Any]:
        """
        Convert MicroStep model to dict for API response.

        Args:
            step: MicroStep model instance

        Returns:
            Dict with all micro-step fields for API
        """
        return {
            "step_id": step.step_id,
            "step_number": step.step_number,
            "description": step.description,
            "short_label": step.short_label,
            "estimated_minutes": step.estimated_minutes,
            "delegation_mode": step.delegation_mode,
            "status": step.status,
            "icon": step.icon,
        }

    def _get_next_action(self, micro_steps: list[MicroStep]) -> dict[str, Any] | None:
        """
        Get next action (first micro-step) for immediate focus.

        Args:
            micro_steps: List of micro-steps

        Returns:
            Dict with first step details, or None if no steps
        """
        if not micro_steps:
            return None

        first_step = micro_steps[0]
        return {
            "step_number": 1,
            "description": first_step.description,
            "estimated_minutes": first_step.estimated_minutes,
        }

    def _determine_task_scope(self, task: Task) -> TaskScope:
        """
        Determine task complexity scope from estimated hours or description.

        Classification Rules:
        - SIMPLE: <15 minutes (no splitting, avoid over-granularity)
        - MULTI: 15-60 minutes (needs 3-5 micro-steps)
        - PROJECT: >60 minutes (needs phase breakdown)

        Args:
            task: The task to classify

        Returns:
            TaskScope enum (SIMPLE, MULTI, or PROJECT)
        """
        if not task.estimated_hours:
            # No estimate - analyze description length as proxy
            if len(task.description) < 100:
                return TaskScope.SIMPLE
            return TaskScope.MULTI

        hours = float(task.estimated_hours)
        minutes = hours * 60

        if minutes < 15:
            return TaskScope.SIMPLE
        elif minutes <= 60:
            return TaskScope.MULTI
        else:
            return TaskScope.PROJECT

    def _estimate_project_phases(self, task: Task) -> list[str]:
        """
        Estimate high-level phases for PROJECT scope tasks.

        Returns standard 4-phase breakdown for large projects.

        Args:
            task: The project task (unused, for future customization)

        Returns:
            List of 4 project phase descriptions
        """
        return [
            "Phase 1: Planning & Research",
            "Phase 2: Core Implementation",
            "Phase 3: Testing & Refinement",
            "Phase 4: Completion & Review",
        ]

    async def _generate_micro_steps_with_ai(self, task: Task, user_id: str) -> list[MicroStep]:
        """
        Generate micro-steps using AI or fallback to rules.

        Implements ADHD-optimized splitting:
        - 3-5 steps total (not overwhelming)
        - 2-5 minutes per step (strictly enforced)
        - Clear, actionable descriptions
        - Delegation mode suggestions

        Args:
            task: The task to split
            user_id: User ID for potential personalization (future)

        Returns:
            List of MicroStep model instances
        """
        prompt = self._build_split_prompt(task)

        # Try AI providers in order of preference
        if self.openai_client and self.ai_provider == "openai":
            steps_data = await self._split_with_openai(prompt, task)
        elif self.anthropic_client and self.ai_provider == "anthropic":
            steps_data = await self._split_with_anthropic(prompt, task)
        else:
            # CRITICAL WARNING: Fallback to rule-based splitting
            # This happens when:
            # - No API key found in environment
            # - Wrong LLM provider selected
            # - LLM client failed to initialize
            reason = self._get_fallback_reason()
            logger.error(
                f"🚨 LLM FALLBACK TRIGGERED 🚨 Using rule-based splitting instead of AI. "
                f"Reason: {reason}. Task: {task.task_id}"
            )
            # IMPORTANT: This should be monitored in production!
            steps_data = self._split_with_rules(task)

        return self._convert_to_micro_steps(steps_data, task)

    def _get_fallback_reason(self) -> str:
        """Get detailed reason why LLM fallback was triggered."""
        import os

        if not OPENAI_AVAILABLE and not ANTHROPIC_AVAILABLE:
            return "No LLM libraries installed (missing openai and anthropic packages)"

        if self.ai_provider == "openai":
            if not OPENAI_AVAILABLE:
                return "OpenAI package not installed"
            if not os.getenv("LLM_API_KEY") and not os.getenv("OPENAI_API_KEY"):
                return "OPENAI_API_KEY or LLM_API_KEY not found in environment"
            return "OpenAI client failed to initialize"

        if self.ai_provider == "anthropic":
            if not ANTHROPIC_AVAILABLE:
                return "Anthropic package not installed"
            if not os.getenv("LLM_API_KEY") and not os.getenv("ANTHROPIC_API_KEY"):
                return "ANTHROPIC_API_KEY or LLM_API_KEY not found in environment"
            return "Anthropic client failed to initialize"

        return f"Unknown provider '{self.ai_provider}' (should be 'openai' or 'anthropic')"

    def _convert_to_micro_steps(self, steps_data: list[dict], task: Task) -> list[MicroStep]:
        """
        Convert step data dicts to MicroStep models.

        Ensures estimated_minutes is clamped to 2-5 minute range
        for ADHD optimization.

        Args:
            steps_data: List of step dicts from AI or rules
            task: Parent task for parent_task_id

        Returns:
            List of validated MicroStep instances
        """
        micro_steps = []
        for i, step_data in enumerate(steps_data, 1):
            # Clamp to ADHD-optimized 2-5 minute range
            estimated_minutes = max(2, min(5, step_data["estimated_minutes"]))

            step = MicroStep(
                parent_task_id=task.task_id,
                step_number=i,
                description=step_data["description"],
                short_label=step_data.get("short_label"),
                estimated_minutes=estimated_minutes,
                icon=step_data.get("icon"),
                delegation_mode=step_data.get("delegation_mode", DelegationMode.DO),
            )
            micro_steps.append(step)

        return micro_steps

    def _build_split_prompt(self, task: Task) -> str:
        """
        Build AI prompt for task splitting.

        Includes task details, estimated time, and ADHD-optimized requirements.

        Args:
            task: The task to split

        Returns:
            Complete prompt string for AI
        """
        estimated_time = self._estimate_task_time(task)
        requirements = self._get_prompt_requirements()

        return f"""You are an ADHD-optimized task management assistant. Break this task into micro-steps.

Task: {task.title}
Description: {task.description}
Estimated Time: {estimated_time}
Priority: {task.priority}

{requirements}

Focus on CLARITY and IMMEDIATE ACTION. Keep steps substantial - don't break trivial tasks into excessive detail."""

    def _estimate_task_time(self, task: Task) -> str:
        """
        Estimate task time from hours or infer from description.

        If no estimated_hours provided, uses description length
        as a proxy for task complexity.

        Args:
            task: The task to estimate

        Returns:
            Human-readable time estimate string
        """
        if task.estimated_hours and task.estimated_hours > 0:
            return f"{float(task.estimated_hours) * 60:.0f} minutes"

        # Infer from description length
        word_count = len(task.description.split())
        if word_count <= 5:
            return "10-15 minutes (simple task)"
        elif word_count <= 15:
            return "20-30 minutes (moderate task)"
        else:
            return "30-60 minutes (complex task)"

    def _get_prompt_requirements(self) -> str:
        """
        Get ADHD-optimized prompt requirements section.

        Returns:
            Multi-line requirements string for AI prompt
        """
        return """Requirements:
1. Create 3-5 substantial micro-steps (not too granular, ADHD-friendly)
2. Each step MUST take 2-5 minutes ONLY (ADHD-optimized, strictly enforced)
3. Steps must be SPECIFIC and ACTIONABLE (not vague)
4. Combine related actions into single steps - avoid over-splitting trivial tasks
5. Provide a short_label (1-2 words) for each step - this appears in the UI
   Examples: "Gather", "Draft", "Send", "Review", "Call", "Research", "Build"
6. Choose ONE emoji icon for each step that represents the action:
   Examples: 📧 email, 📝 write, 🔍 search, 📞 call, 🛒 shop, 🔨 build,
   📊 analyze, 🎨 design, ⚙️ configure, 🧹 clean, 📁 organize, 💻 code,
   📖 read, ✍️ draft, 🗂️ file, 💬 message, 📅 schedule, ✅ complete, etc.
7. Assign delegation_mode to each step:
   - "do" = Do it yourself (requires focus)
   - "do_with_me" = Do with assistance (pairing/mentoring)
   - "delegate" = Fully delegate to someone/something else
   - "delete" = This step isn't needed (eliminate)
8. First step should be the easiest (quick win for dopamine!)
9. Total time should roughly match estimated time

Return JSON array of steps:
[
  {
    "description": "Specific action to take",
    "short_label": "Gather",
    "estimated_minutes": 5,
    "delegation_mode": "do",
    "icon": "📧"
  },
  ...
]"""

    async def _split_with_openai(self, prompt: str, task: Task) -> list[dict]:
        """
        Split task using OpenAI API.

        Args:
            prompt: The full prompt for AI
            task: The task (for fallback if AI fails)

        Returns:
            List of step dicts, or fallback from _split_with_rules
        """
        try:
            response = await self.openai_client.chat.completions.create(
                model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
                messages=[
                    {
                        "role": "system",
                        "content": "You are an ADHD-optimized task splitting assistant. Always return valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            import json

            result = json.loads(response.choices[0].message.content)
            return self._extract_steps_from_ai_response(result, "OpenAI", task)

        except Exception as e:
            logger.error(f"OpenAI split failed: {e}")
            return self._split_with_rules(task)

    async def _split_with_anthropic(self, prompt: str, task: Task) -> list[dict]:
        """
        Split task using Anthropic Claude API.

        Args:
            prompt: The full prompt for AI
            task: The task (for fallback if AI fails)

        Returns:
            List of step dicts, or fallback from _split_with_rules
        """
        try:
            response = await self.anthropic_client.messages.create(
                model=os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022"),
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )

            import json

            content = response.content[0].text

            # Extract JSON from markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            result = json.loads(content.strip())
            return self._extract_steps_from_ai_response(result, "Anthropic", task)

        except Exception as e:
            logger.error(f"Anthropic split failed: {e}")
            return self._split_with_rules(task)

    def _extract_steps_from_ai_response(
        self, result: dict | list, provider: str, task: Task
    ) -> list[dict]:
        """
        Extract steps array from AI response (handles different formats).

        Args:
            result: Parsed JSON from AI (dict with "steps" key or direct list)
            provider: Provider name for logging ("OpenAI" or "Anthropic")
            task: Task for fallback if format unexpected

        Returns:
            List of step dicts
        """
        logger.info(
            f"🔍 {provider} response keys: {list(result.keys()) if isinstance(result, dict) else 'list'}"
        )

        if isinstance(result, dict) and "steps" in result:
            steps = result["steps"]
            if steps and len(steps) > 0:
                logger.info(
                    f"🔍 First step: icon={repr(steps[0].get('icon'))}, "
                    f"label={repr(steps[0].get('short_label'))}"
                )
            return steps
        elif isinstance(result, list):
            if result and len(result) > 0:
                logger.info(
                    f"🔍 First step (list): icon={repr(result[0].get('icon'))}, "
                    f"label={repr(result[0].get('short_label'))}"
                )
            return result
        else:
            logger.warning(f"Unexpected {provider} format, using fallback")
            return self._split_with_rules(task)

    def _split_with_rules(self, task: Task) -> list[dict]:
        """
        Fallback rule-based task splitting (when AI unavailable).

        Detects task type from keywords and generates contextual 3-step breakdown.

        Args:
            task: The task to split

        Returns:
            List of 3 step dicts
        """
        task_type = self._classify_task_type(task.title.lower())

        if task_type == "email":
            return self._split_email_task(task)
        elif task_type == "shopping":
            return self._split_shopping_task(task)
        elif task_type == "call":
            return self._split_call_task(task)
        else:
            return self._split_generic_task(task)

    def _classify_task_type(self, task_lower: str) -> str:
        """
        Classify task type from keywords in title.

        Args:
            task_lower: Lowercased task title

        Returns:
            Task type: "email", "shopping", "call", or "generic"
        """
        if any(word in task_lower for word in self.EMAIL_KEYWORDS):
            return "email"
        elif any(word in task_lower for word in self.SHOPPING_KEYWORDS):
            return "shopping"
        elif any(word in task_lower for word in self.CALL_KEYWORDS):
            return "call"
        return "generic"

    def _split_email_task(self, task: Task) -> list[dict]:
        """Generate 3-step breakdown for email tasks."""
        return [
            {
                "description": "Open email client and locate recipient",
                "short_label": "Setup",
                "estimated_minutes": 2,
                "delegation_mode": "do",
                "icon": "📧",
            },
            {
                "description": f"Draft the email content for: {task.title}",
                "short_label": "Draft",
                "estimated_minutes": 5,
                "delegation_mode": "do",
                "icon": "✍️",
            },
            {
                "description": "Send the email and confirm delivery",
                "short_label": "Send",
                "estimated_minutes": 2,
                "delegation_mode": "do",
                "icon": "📤",
            },
        ]

    def _split_shopping_task(self, task: Task) -> list[dict]:
        """Generate 3-step breakdown for shopping tasks."""
        return [
            {
                "description": f"Make a shopping list for: {task.title}",
                "short_label": "List",
                "estimated_minutes": 3,
                "delegation_mode": "do",
                "icon": "📝",
            },
            {
                "description": f"Go to the store and find items for: {task.title}",
                "short_label": "Shop",
                "estimated_minutes": 5,
                "delegation_mode": "do",
                "icon": "🛒",
            },
            {
                "description": "Checkout and pay for items",
                "short_label": "Pay",
                "estimated_minutes": 3,
                "delegation_mode": "do",
                "icon": "💳",
            },
        ]

    def _split_call_task(self, task: Task) -> list[dict]:
        """Generate 3-step breakdown for call/phone tasks."""
        return [
            {
                "description": f"Find contact information for: {task.title}",
                "short_label": "Find",
                "estimated_minutes": 2,
                "delegation_mode": "do",
                "icon": "📞",
            },
            {
                "description": f"Make the phone call for: {task.title}",
                "short_label": "Call",
                "estimated_minutes": 5,
                "delegation_mode": "do",
                "icon": "📞",
            },
            {
                "description": "Take notes on the call outcome",
                "short_label": "Notes",
                "estimated_minutes": 2,
                "delegation_mode": "do",
                "icon": "📝",
            },
        ]

    def _split_generic_task(self, task: Task) -> list[dict]:
        """Generate 3-step breakdown for generic tasks."""
        return [
            {
                "description": f"Gather materials and set up workspace for: {task.title}",
                "short_label": "Setup",
                "estimated_minutes": 2,
                "delegation_mode": "do",
                "icon": "📋",
            },
            {
                "description": f"Work on the main part of: {task.title}",
                "short_label": "Work",
                "estimated_minutes": 4,
                "delegation_mode": "do",
                "icon": "⚙️",
            },
            {
                "description": f"Review and finalize: {task.title}",
                "short_label": "Review",
                "estimated_minutes": 3,
                "delegation_mode": "do",
                "icon": "✅",
            },
        ]
