"""
Capture Agent - Orchestrates the complete Capture Mode pipeline

Coordinates QuickCaptureService → DecomposerAgent → ClassifierAgent
to transform messy brain dumps into structured, classified task trees.

Supports three modes:
- AUTO: AI guesses everything
- MANUAL: User sets all fields
- CLARIFY: AI asks minimal questions
"""

from __future__ import annotations

from typing import Optional

from src.agents.base import BaseProxyAgent
from src.agents.classifier_agent import ClassifierAgent
from src.agents.decomposer_agent import DecomposerAgent
from src.core.models import AgentRequest
from src.core.settings import get_settings
from src.core.task_models import CaptureMode, ClarificationNeed, LeafType, MicroStep, Task
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.knowledge.graph_service import GraphService
from src.services.quick_capture_service import QuickCaptureService


class CaptureAgent(BaseProxyAgent):
    """
    Orchestrates the full Capture Mode pipeline:
    1. Analyze input with QuickCaptureService
    2. Decompose into atomic MicroSteps with DecomposerAgent
    3. Classify each MicroStep (DIGITAL/HUMAN) with ClassifierAgent
    4. Generate clarification form if needed
    """

    def __init__(self, db: Optional[EnhancedDatabaseAdapter] = None):
        super().__init__("capture", db)
        self.quick_capture_service = QuickCaptureService()
        self.decomposer = DecomposerAgent(db)
        self.classifier = ClassifierAgent(db)
        self.graph_service = GraphService(db) if db else None
        self.settings = get_settings()

    async def _handle_request(
        self, request: AgentRequest, history: list[dict]
    ) -> tuple[str, int]:
        """
        Process capture request through the full pipeline.

        Request metadata should contain:
        - mode: "auto" | "manual" | "clarify"
        - manual_fields: dict (optional, for MANUAL mode)

        Returns:
            Tuple of (response message, XP earned)
        """
        # Extract mode and options
        mode_str = request.metadata.get("mode", "auto")
        mode = CaptureMode(mode_str)

        manual_fields = request.metadata.get("manual_fields", {})

        # Run capture pipeline
        result = await self.capture(
            input_text=request.query,
            user_id=request.user_id,
            mode=mode,
            manual_fields=manual_fields,
        )

        # Format response
        response = self._format_capture_response(result, mode)

        # Award XP based on complexity
        micro_step_count = len(result["micro_steps"])
        clarification_count = len(result["clarifications"])

        xp = 30  # Base XP for capture
        xp += micro_step_count * 5  # Bonus per micro-step
        if result["ready_to_save"]:
            xp += 20  # Bonus for complete capture (no clarifications needed)

        return response, xp

    async def capture(
        self,
        input_text: str,
        user_id: str,
        mode: CaptureMode = CaptureMode.AUTO,
        manual_fields: Optional[dict] = None,
    ) -> dict:
        """
        Execute the full capture pipeline.

        Args:
            input_text: Raw user input (brain dump)
            user_id: User ID for context
            mode: Capture mode (AUTO, MANUAL, CLARIFY)
            manual_fields: User-provided fields for MANUAL mode

        Returns:
            Dict with:
            - task: Root task object
            - micro_steps: List of classified MicroSteps
            - clarifications: List of ClarificationNeed objects
            - ready_to_save: Boolean (True if no clarifications needed)
            - mode: The capture mode used
        """
        # Step 0: Retrieve Knowledge Graph context (if enabled)
        kg_context = None
        if (
            self.settings.kg_enabled
            and self.graph_service
            and mode != CaptureMode.MANUAL
        ):
            try:
                kg_context = self.graph_service.get_context_for_query(
                    input_text, user_id, max_entities=self.settings.kg_max_entities
                )
            except Exception as e:
                # Don't fail capture if KG retrieval fails
                import logging

                logging.getLogger(__name__).warning(f"KG context retrieval failed: {e}")

        # Step 1: Initial analysis with QuickCaptureService
        if mode == CaptureMode.MANUAL:
            # Skip AI analysis, use manual fields
            task = self._create_task_from_manual_fields(input_text, manual_fields)
        else:
            # Use QuickCaptureService for intelligent analysis (with KG context)
            analysis = await self.quick_capture_service.analyze_capture(
                input_text, user_id, voice_input=False, kg_context=kg_context
            )
            task = self._create_task_from_analysis(analysis)

        # Step 2: Decompose into atomic MicroSteps
        decomposition_result = await self.decomposer.decompose_task(task, user_id)
        micro_steps = decomposition_result.get("micro_steps", [])

        # Step 3: Classify each MicroStep (DIGITAL vs HUMAN)
        clarifications = []
        for micro_step in micro_steps:
            self.classifier.classify_micro_step(micro_step)

            # Collect clarifications
            if micro_step.clarification_needs:
                clarifications.extend(micro_step.clarification_needs)

        # Step 4: Determine if clarifications are needed
        ready_to_save = True

        if mode == CaptureMode.CLARIFY:
            # In CLARIFY mode, always collect questions if any are present
            ready_to_save = len(clarifications) == 0
        elif mode == CaptureMode.AUTO:
            # In AUTO mode, proceed even with missing info (make best guesses)
            ready_to_save = True
            # Remove clarifications since we're not asking
            for micro_step in micro_steps:
                micro_step.clarification_needs = []
            clarifications = []

        # MANUAL mode always ready (user provided everything)

        return {
            "task": task,
            "micro_steps": micro_steps,
            "clarifications": self._deduplicate_clarifications(clarifications),
            "ready_to_save": ready_to_save,
            "mode": mode,
        }

    async def apply_clarifications(
        self, micro_steps: list[MicroStep], answers: dict[str, str]
    ) -> dict:
        """
        Apply user's clarification answers and re-classify MicroSteps.

        Args:
            micro_steps: List of MicroSteps with clarification needs
            answers: Dict mapping field names to user answers

        Returns:
            Updated dict with micro_steps and ready_to_save status
        """
        # Apply answers to micro-steps
        for micro_step in micro_steps:
            self._apply_answers_to_micro_step(micro_step, answers)

        # Re-classify after applying answers
        for micro_step in micro_steps:
            self.classifier.classify_micro_step(micro_step)

        # Check if any clarifications remain
        all_clarifications = []
        for micro_step in micro_steps:
            all_clarifications.extend(micro_step.clarification_needs)

        return {
            "micro_steps": micro_steps,
            "clarifications": self._deduplicate_clarifications(all_clarifications),
            "ready_to_save": len(all_clarifications) == 0,
        }

    def _create_task_from_analysis(self, analysis: dict) -> Task:
        """Create a Task object from QuickCaptureService analysis."""
        # Round estimated_hours to 2 decimal places for Task model validation
        estimated_hours = analysis.get("estimated_hours", 0.5)
        if estimated_hours is not None:
            estimated_hours = round(float(estimated_hours), 2)

        return Task(
            title=analysis.get("title", "Untitled Task"),
            description=analysis.get("description", ""),
            project_id=analysis.get("project_id", "default-project"),
            priority=analysis.get("priority", "medium"),
            estimated_hours=estimated_hours,
            tags=analysis.get("tags", []),
            due_date=analysis.get("due_date"),
        )

    def _create_task_from_manual_fields(
        self, input_text: str, manual_fields: dict
    ) -> Task:
        """Create a Task object from manual user input."""
        return Task(
            title=manual_fields.get("title", input_text),
            description=manual_fields.get("description", input_text),
            project_id=manual_fields.get("project_id", "default-project"),
            priority=manual_fields.get("priority", "medium"),
            estimated_hours=manual_fields.get("estimated_hours", 0.5),
            tags=manual_fields.get("tags", []),
            due_date=manual_fields.get("due_date"),
        )

    def _deduplicate_clarifications(
        self, clarifications: list[ClarificationNeed]
    ) -> list[ClarificationNeed]:
        """Remove duplicate clarification questions."""
        seen = set()
        unique = []

        for clarif in clarifications:
            key = (clarif.field, clarif.question)
            if key not in seen:
                seen.add(key)
                unique.append(clarif)

        return unique

    def _apply_answers_to_micro_step(
        self, micro_step: MicroStep, answers: dict[str, str]
    ) -> None:
        """
        Apply clarification answers to a MicroStep's automation plan.

        Updates the automation_plan params with user-provided answers.
        """
        if not micro_step.automation_plan:
            return

        for step in micro_step.automation_plan.steps:
            # Update params with answers
            for field, answer in answers.items():
                if field.startswith("email_"):
                    param_name = field.replace("email_", "")
                    if step.kind == "email.send":
                        step.params[param_name] = answer

                elif field.startswith("calendar_"):
                    param_name = field.replace("calendar_", "")
                    if step.kind == "calendar.create":
                        step.params[param_name] = answer

                elif field.startswith("iot_"):
                    param_name = field.replace("iot_", "")
                    if step.kind == "home_iot.toggle":
                        step.params[param_name] = answer

                elif field.startswith("web_"):
                    param_name = field.replace("web_", "")
                    if step.kind == "web.browse":
                        step.params[param_name] = answer

        # Clear clarification needs after applying
        micro_step.clarification_needs = []

    def _format_capture_response(self, result: dict, mode: CaptureMode) -> str:
        """Format capture results as a readable message."""
        task = result["task"]
        micro_steps = result["micro_steps"]
        clarifications = result["clarifications"]
        ready = result["ready_to_save"]

        response_lines = [
            f"📝 **Capture Complete** (Mode: {mode.value.upper()})",
            f"",
            f"**Task:** {task.title}",
            f"**Priority:** {task.priority.upper()}",
            f"**Micro-Steps:** {len(micro_steps)}",
        ]

        # Breakdown by type
        digital_count = sum(1 for s in micro_steps if s.leaf_type == LeafType.DIGITAL)
        human_count = sum(1 for s in micro_steps if s.leaf_type == LeafType.HUMAN)
        unknown_count = sum(1 for s in micro_steps if s.leaf_type == LeafType.UNKNOWN)

        response_lines.append(f"")
        response_lines.append(f"**Classification:**")
        if digital_count:
            response_lines.append(f"  🤖 Digital (AI-ready): {digital_count}")
        if human_count:
            response_lines.append(f"  👤 Human (You-only): {human_count}")
        if unknown_count:
            response_lines.append(f"  ❓ Unknown (Needs info): {unknown_count}")

        # Show micro-steps
        response_lines.append(f"")
        response_lines.append(f"**Breakdown:**")
        for i, step in enumerate(micro_steps[:5], 1):  # Show first 5
            icon = (
                "🤖"
                if step.leaf_type == LeafType.DIGITAL
                else "👤" if step.leaf_type == LeafType.HUMAN else "❓"
            )
            response_lines.append(
                f"  {i}. {icon} {step.description} ({step.estimated_minutes} min)"
            )

        if len(micro_steps) > 5:
            response_lines.append(f"  ... and {len(micro_steps) - 5} more")

        # Show clarifications if needed
        if clarifications:
            response_lines.append(f"")
            response_lines.append(f"**❓ Questions ({len(clarifications)}):**")
            for clarif in clarifications[:3]:  # Show first 3
                response_lines.append(f"  - {clarif.question}")
                if clarif.options:
                    response_lines.append(
                        f"    Options: {', '.join(clarif.options)}"
                    )

        # Status
        response_lines.append(f"")
        if ready:
            response_lines.append(f"✅ **Ready to save!**")
        else:
            response_lines.append(
                f"⏸️ **Awaiting clarifications** ({len(clarifications)} questions)"
            )

        return "\n".join(response_lines)
