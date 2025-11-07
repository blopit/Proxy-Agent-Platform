"""
Classifier Agent - Classifies MicroSteps as DIGITAL or HUMAN

Analyzes atomic MicroSteps to determine if they can be automated (DIGITAL)
or require human action (HUMAN), and generates clarification needs for
ambiguous cases.
"""

from __future__ import annotations

from src.agents.base import BaseProxyAgent
from src.agents.integration_registry import IntegrationRegistry
from src.core.models import AgentRequest
from src.core.task_models import (
    ClarificationNeed,
    DelegationMode,
    LeafType,
    MicroStep,
)
from src.database.enhanced_adapter import EnhancedDatabaseAdapter


class ClassifierAgent(BaseProxyAgent):
    """
    Agent for classifying MicroSteps as DIGITAL (automatable) or HUMAN (requires person).

    Uses IntegrationRegistry to match task descriptions against available automations,
    and generates clarification questions when information is missing.
    """

    def __init__(self, db: EnhancedDatabaseAdapter | None = None):
        super().__init__("classifier", db)
        self.registry = IntegrationRegistry()

    async def _handle_request(self, request: AgentRequest, history: list[dict]) -> tuple[str, int]:
        """
        Process classification request for a MicroStep.

        Args:
            request: AgentRequest containing MicroStep data in metadata
            history: Conversation history (not used for classification)

        Returns:
            Tuple of (response message, XP earned)
        """
        # Extract MicroStep from request metadata
        micro_step_data = request.metadata.get("micro_step")
        if not micro_step_data:
            return "❌ No micro-step data provided for classification", 0

        # Reconstruct MicroStep object
        try:
            micro_step = MicroStep(**micro_step_data)
        except Exception as e:
            return f"❌ Invalid micro-step data: {str(e)}", 0

        # Classify the MicroStep
        self._classify_micro_step(micro_step)

        # Build response message
        response = self._format_classification_response(micro_step)

        # Award XP based on classification confidence
        xp = 15  # Base XP for classification
        if micro_step.automation_plan and micro_step.automation_plan.confidence >= 0.8:
            xp = 25  # Bonus for high-confidence automation

        return response, xp

    def _classify_micro_step(self, micro_step: MicroStep) -> None:
        """
        Classify a MicroStep and update its fields in-place.

        Updates:
            - leaf_type (DIGITAL, HUMAN, UNKNOWN)
            - automation_plan (if DIGITAL)
            - delegation_mode (DO, DO_WITH_ME, DELEGATE, DELETE)
            - clarification_needs (if UNKNOWN)
        """
        # Try to find automation plan
        automation_plan = self.registry.can_automate(micro_step)

        # If leaf_type is already classified as DIGITAL or HUMAN (from DecomposerAgent), respect it
        already_classified = (
            micro_step.leaf_type == LeafType.DIGITAL or micro_step.leaf_type == LeafType.HUMAN
        )

        if automation_plan:
            # Task is automatable - mark as DIGITAL (only if not already classified)
            if not already_classified:
                micro_step.leaf_type = LeafType.DIGITAL
            micro_step.automation_plan = automation_plan
            micro_step.delegation_mode = self.registry.suggest_delegation_mode(automation_plan)
            micro_step.clarification_needs = self._generate_clarifications(
                micro_step, automation_plan
            )

            if micro_step.clarification_needs and not already_classified:
                # Has missing information - mark as UNKNOWN until clarified (only if not already classified)
                micro_step.leaf_type = LeafType.UNKNOWN

        else:
            # No automation available - check if it's clearly HUMAN
            if self._is_clearly_human(micro_step):
                if not already_classified:
                    micro_step.leaf_type = LeafType.HUMAN
                micro_step.delegation_mode = DelegationMode.DO
                micro_step.clarification_needs = []
            elif not already_classified:
                # Ambiguous - needs clarification (only if not already classified)
                micro_step.leaf_type = LeafType.UNKNOWN
                micro_step.clarification_needs = self._generate_generic_clarifications(micro_step)

    def _is_clearly_human(self, micro_step: MicroStep) -> bool:
        """
        Determine if a MicroStep is clearly a human-only task.

        Returns True if task requires physical action or in-person presence.
        """
        description = micro_step.description.lower()

        # Physical action indicators
        physical_indicators = [
            "pick up",
            "put away",
            "move",
            "carry",
            "lift",
            "place",
            "arrange",
            "vacuum",
            "sweep",
            "mop",
            "clean",
            "wash",
            "wipe",
            "dust",
            "take out",
            "throw away",
            "walk",
            "drive",
            "go to",
            "meet",
            "call person",
            "talk to",
            "discuss in person",
        ]

        return any(indicator in description for indicator in physical_indicators)

    def _generate_clarifications(
        self, micro_step: MicroStep, automation_plan
    ) -> list[ClarificationNeed]:
        """
        Generate clarification questions for automation plans with missing info.

        Checks automation plan parameters for None values and creates questions.
        """
        clarifications = []

        if not automation_plan or not automation_plan.steps:
            return clarifications

        for step in automation_plan.steps:
            kind = step.kind
            params = step.params

            # Email clarifications
            if kind == "email.send":
                if not params.get("to"):
                    clarifications.append(
                        ClarificationNeed(
                            field="email_recipient",
                            question="Who should I send this email to?",
                            required=True,
                        )
                    )
                if not params.get("subject"):
                    clarifications.append(
                        ClarificationNeed(
                            field="email_subject",
                            question="What's the email subject?",
                            required=True,
                        )
                    )

            # Calendar clarifications
            elif kind == "calendar.create":
                if not params.get("when"):
                    clarifications.append(
                        ClarificationNeed(
                            field="calendar_when",
                            question="When should this event be scheduled?",
                            required=True,
                        )
                    )
                if not params.get("duration_minutes"):
                    clarifications.append(
                        ClarificationNeed(
                            field="calendar_duration",
                            question="How long should this event last?",
                            options=["15 minutes", "30 minutes", "1 hour", "2 hours"],
                            required=False,
                        )
                    )

            # Home IoT clarifications
            elif kind == "home_iot.toggle":
                if not params.get("device"):
                    clarifications.append(
                        ClarificationNeed(
                            field="iot_device",
                            question="Which device should I control?",
                            options=["AC", "Lights", "Heater", "Fan"],
                            required=True,
                        )
                    )

            # Web browsing clarifications
            elif kind == "web.browse":
                if not params.get("url"):
                    clarifications.append(
                        ClarificationNeed(
                            field="web_url",
                            question="What website should I browse?",
                            required=False,
                        )
                    )

        return clarifications

    def _generate_generic_clarifications(self, micro_step: MicroStep) -> list[ClarificationNeed]:
        """
        Generate generic clarification questions for ambiguous tasks.

        Used when task doesn't match any automation pattern and isn't clearly human.
        """
        return [
            ClarificationNeed(
                field="task_type",
                question=f"Is '{micro_step.description}' something that can be automated?",
                options=["Yes, automate it", "No, I'll do it myself", "Not sure"],
                required=True,
            )
        ]

    def _format_classification_response(self, micro_step: MicroStep) -> str:
        """Format classification results as a readable message."""
        response_lines = [
            "🏷️ **Classification Results**",
            "",
            f"**Task:** {micro_step.description}",
            f"**Type:** {micro_step.leaf_type.value.upper()}",
            f"**Delegation:** {micro_step.delegation_mode.value.replace('_', ' ').title()}",
        ]

        if micro_step.automation_plan:
            response_lines.append("")
            response_lines.append(
                f"**Automation Plan** (confidence: {micro_step.automation_plan.confidence:.0%})"
            )
            for i, step in enumerate(micro_step.automation_plan.steps, 1):
                response_lines.append(f"  {i}. {step.kind}: {step.params}")

        if micro_step.clarification_needs:
            response_lines.append("")
            response_lines.append("**❓ Questions:**")
            for clarif in micro_step.clarification_needs:
                response_lines.append(f"  - {clarif.question}")
                if clarif.options:
                    response_lines.append(f"    Options: {', '.join(clarif.options)}")

        return "\n".join(response_lines)

    def classify_micro_step(self, micro_step: MicroStep) -> MicroStep:
        """
        Public method to classify a MicroStep directly.

        Useful for batch classification or integration with other agents.

        Args:
            micro_step: The MicroStep to classify

        Returns:
            The same MicroStep instance with updated classification fields
        """
        self._classify_micro_step(micro_step)
        return micro_step
