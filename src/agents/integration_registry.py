"""
Integration Registry - Maps task verbs/objects to automation capabilities

This module provides the IntegrationRegistry class which determines if a MicroStep
can be automated and generates structured AutomationPlans for digital execution.
"""

from __future__ import annotations

import re

from src.core.task_models import AutomationPlan, AutomationStep, DelegationMode, MicroStep


class IntegrationRegistry:
    """
    Central registry for automation capabilities.

    Maps task descriptions to available integrations (email, calendar, research, etc.)
    and generates structured automation plans for digital tasks.
    """

    # Keyword mappings for automation detection
    EMAIL_KEYWORDS = [
        "email",
        "send email",
        "draft email",
        "reply",
        "message",
        "compose",
        "forward",
    ]

    CALENDAR_KEYWORDS = [
        "schedule",
        "meeting",
        "calendar",
        "book",
        "arrange",
        "appointment",
        "event",
    ]

    RESEARCH_KEYWORDS = [
        "research",
        "look up",
        "find out",
        "investigate",
        "google",
        "search",
        "explore",
    ]

    DOCUMENT_KEYWORDS = [
        "write",
        "document",
        "draft",
        "create doc",
        "notes",
        "memo",
        "report",
    ]

    WEB_KEYWORDS = [
        "browse",
        "web",
        "website",
        "online",
        "check site",
        "visit",
    ]

    HOME_IOT_KEYWORDS = {
        "ac": ["air conditioner", "ac", "a/c", "cooling"],
        "lights": ["lights", "lamp", "lighting"],
        "heater": ["heater", "heating", "heat"],
        "fan": ["fan", "ventilation"],
    }

    PHYSICAL_VERBS = [
        "vacuum",
        "take",
        "tidy",
        "gather",
        "wash",
        "walk",
        "drive",
        "clean",
        "organize",
        "move",
        "carry",
        "pick up",
        "put away",
    ]

    def can_automate(self, micro_step: MicroStep) -> AutomationPlan | None:
        """
        Determine if a MicroStep can be automated and generate an AutomationPlan.

        Args:
            micro_step: The MicroStep to analyze for automation potential

        Returns:
            AutomationPlan if automatable, None if human-only or unknown

        Examples:
            >>> registry = IntegrationRegistry()
            >>> step = MicroStep(description="Turn off the AC", ...)
            >>> plan = registry.can_automate(step)
            >>> plan.steps[0].kind
            'home_iot.toggle'
        """
        description = micro_step.description.lower()

        # Check for physical tasks (HUMAN-only)
        if self._is_physical_task(description):
            return None

        # Try automation patterns
        if plan := self._check_home_iot(description):
            return plan
        if plan := self._check_email(description):
            return plan
        if plan := self._check_calendar(description):
            return plan
        if plan := self._check_research(description):
            return plan
        if plan := self._check_document(description):
            return plan
        if plan := self._check_web(description):
            return plan

        # No automation available
        return None

    def _is_physical_task(self, description: str) -> bool:
        """Check if task requires physical action."""
        return any(verb in description for verb in self.PHYSICAL_VERBS)

    def _check_home_iot(self, description: str) -> AutomationPlan | None:
        """Check for home automation tasks (lights, AC, etc.)."""
        # Check for toggle/turn on/turn off actions
        is_toggle = any(
            pattern in description for pattern in ["turn on", "turn off", "toggle", "switch"]
        )

        if not is_toggle:
            return None

        # Determine device
        device = None
        for device_name, keywords in self.HOME_IOT_KEYWORDS.items():
            if any(kw in description for kw in keywords):
                device = device_name
                break

        if not device:
            return None

        # Determine state
        state = "off" if "off" in description else "on"

        return AutomationPlan(
            steps=[
                AutomationStep(
                    kind="home_iot.toggle",
                    params={"device": device, "state": state},
                )
            ],
            confidence=0.9,
        )

    def _check_email(self, description: str) -> AutomationPlan | None:
        """Check for email tasks."""
        if not any(kw in description for kw in self.EMAIL_KEYWORDS):
            return None

        # Extract recipient (basic pattern matching)
        recipient_match = re.search(r"to\s+([a-zA-Z0-9@._-]+)", description)
        recipient = recipient_match.group(1) if recipient_match else None

        # Extract subject (basic pattern matching)
        subject_match = re.search(r"(?:about|re:?|subject:?)\s+(.+?)(?:\.|$)", description)
        subject = subject_match.group(1).strip() if subject_match else None

        return AutomationPlan(
            steps=[
                AutomationStep(
                    kind="email.send",
                    params={
                        "to": recipient,
                        "subject": subject,
                        "body": None,  # Will be filled by AI or user
                    },
                )
            ],
            confidence=0.7 if recipient and subject else 0.4,
        )

    def _check_calendar(self, description: str) -> AutomationPlan | None:
        """Check for calendar/scheduling tasks."""
        if not any(kw in description for kw in self.CALENDAR_KEYWORDS):
            return None

        # Extract title (use the full description as default)
        title = description

        # Extract time (basic pattern matching)
        time_match = re.search(r"(?:at|@)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", description)
        when = time_match.group(1) if time_match else None

        return AutomationPlan(
            steps=[
                AutomationStep(
                    kind="calendar.create",
                    params={
                        "title": title,
                        "when": when,
                        "duration_minutes": None,
                    },
                )
            ],
            confidence=0.7 if when else 0.5,
        )

    def _check_research(self, description: str) -> AutomationPlan | None:
        """Check for research/lookup tasks."""
        if not any(kw in description for kw in self.RESEARCH_KEYWORDS):
            return None

        # Extract query (everything after the research verb)
        query = description
        for kw in self.RESEARCH_KEYWORDS:
            if kw in description:
                query = description.split(kw, 1)[-1].strip()
                break

        return AutomationPlan(
            steps=[
                AutomationStep(
                    kind="research.web",
                    params={"query": query},
                )
            ],
            confidence=0.8,
        )

    def _check_document(self, description: str) -> AutomationPlan | None:
        """Check for document creation tasks."""
        if not any(kw in description for kw in self.DOCUMENT_KEYWORDS):
            return None

        return AutomationPlan(
            steps=[
                AutomationStep(
                    kind="document.create",
                    params={
                        "title": description,
                        "content": None,  # Will be filled by AI
                    },
                )
            ],
            confidence=0.6,
        )

    def _check_web(self, description: str) -> AutomationPlan | None:
        """Check for web browsing tasks."""
        if not any(kw in description for kw in self.WEB_KEYWORDS):
            return None

        # Extract URL if present
        url_match = re.search(r"https?://[^\s]+", description)
        url = url_match.group(0) if url_match else None

        return AutomationPlan(
            steps=[
                AutomationStep(
                    kind="web.browse",
                    params={"url": url, "task": description},
                )
            ],
            confidence=0.7 if url else 0.5,
        )

    def suggest_delegation_mode(self, automation_plan: AutomationPlan | None) -> DelegationMode:
        """
        Suggest a DelegationMode based on automation plan availability.

        Args:
            automation_plan: The AutomationPlan (or None if not automatable)

        Returns:
            DelegationMode recommendation
        """
        if automation_plan is None:
            return DelegationMode.DO  # Human-only

        if automation_plan.confidence >= 0.8:
            return DelegationMode.DELEGATE  # Fully automatable

        if automation_plan.confidence >= 0.5:
            return DelegationMode.DO_WITH_ME  # Collaborative (AI helps, human confirms)

        return DelegationMode.DO  # Low confidence, human should handle
