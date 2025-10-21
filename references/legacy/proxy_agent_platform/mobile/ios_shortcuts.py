"""
iOS Shortcuts integration for instant task capture.

Provides seamless integration with iOS Shortcuts app,
Siri voice commands, and context-aware task creation.
"""

from datetime import datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel

from ..gamification.gamification_service import GamificationService


class LocationData(BaseModel):
    """Location context data."""

    latitude: float
    longitude: float
    address: str | None = None
    place_name: str | None = None


class ShortcutTaskData(BaseModel):
    """iOS Shortcut task data model."""

    text: str
    voice_input: bool = False
    timestamp: str | None = None
    location: str | None = None
    priority: str = "medium"
    context: dict[str, Any] | None = None


class IOSShortcutsAPI:
    """
    iOS Shortcuts integration API for instant task capture.

    Handles Siri voice commands, context-aware capture,
    and seamless iOS ecosystem integration.
    """

    def __init__(self):
        """Initialize iOS Shortcuts API."""
        self.gamification_service = GamificationService()

    async def capture_task(self, shortcut_data: dict[str, Any]) -> dict[str, Any]:
        """
        Capture task from iOS Shortcuts.

        Args:
            shortcut_data: Task data from iOS Shortcuts

        Returns:
            Task capture response
        """
        task_data = ShortcutTaskData(**shortcut_data)
        task_id = str(uuid4())

        # Extract task details
        title = task_data.text.strip()
        priority = self._infer_priority(title)

        # Create confirmation message
        confirmation = f"Task '{title}' has been captured successfully!"
        if task_data.location:
            confirmation += f" (Location: {task_data.location})"

        return {
            "status": "success",
            "task_id": task_id,
            "confirmation_message": confirmation,
            "created_at": datetime.now().isoformat(),
            "priority": priority,
        }

    async def process_voice_command(self, voice_command: dict[str, Any]) -> dict[str, Any]:
        """
        Process Siri voice command for task creation.

        Args:
            voice_command: Voice command data from Siri

        Returns:
            Voice command processing response
        """
        command_text = voice_command.get("command", "")
        confidence = voice_command.get("confidence", 0.0)
        user_id = voice_command.get("user_id")

        # Parse the command to extract task
        task_text = self._extract_task_from_command(command_text)

        if confidence < 0.7:
            return {
                "status": "clarification_needed",
                "spoken_response": "I didn't catch that clearly. Could you repeat the task?",
                "confidence": confidence,
            }

        # Create the task
        task_id = str(uuid4())

        # Generate spoken response
        spoken_response = f"I've added '{task_text}' to your task list."

        return {
            "status": "success",
            "task_created": {"id": task_id, "text": task_text, "created_via": "siri"},
            "spoken_response": spoken_response,
            "confidence": confidence,
        }

    async def capture_with_context(self, context_data: dict[str, Any]) -> dict[str, Any]:
        """
        Capture task with rich context information.

        Args:
            context_data: Task data with location, calendar, energy context

        Returns:
            Context-aware capture response
        """
        task_text = context_data.get("text", "")
        location = context_data.get("location")
        calendar_context = context_data.get("calendar_context")
        energy_level = context_data.get("energy_level", "medium")

        task_id = str(uuid4())

        # Analyze context for smart scheduling
        smart_scheduling = self._analyze_scheduling_context(
            task_text, calendar_context, energy_level
        )

        # Generate location-based reminders if applicable
        location_reminder = None
        if location and self._is_location_relevant(task_text):
            location_reminder = {
                "enabled": True,
                "location": location,
                "message": f"Don't forget: {task_text}",
            }

        return {
            "status": "success",
            "task_id": task_id,
            "smart_scheduling": smart_scheduling,
            "location_reminder": location_reminder,
            "context_analysis": {
                "energy_match": self._match_task_to_energy(task_text, energy_level),
                "time_suggestion": smart_scheduling.get("suggested_time"),
            },
        }

    def _infer_priority(self, task_text: str) -> str:
        """
        Infer task priority from text content.

        Args:
            task_text: Task description

        Returns:
            Priority level (low, medium, high, urgent)
        """
        urgent_keywords = ["urgent", "asap", "emergency", "critical", "immediately"]
        high_keywords = ["important", "deadline", "due", "meeting", "call"]
        low_keywords = ["maybe", "sometime", "eventually", "when possible"]

        text_lower = task_text.lower()

        if any(keyword in text_lower for keyword in urgent_keywords):
            return "urgent"
        elif any(keyword in text_lower for keyword in high_keywords):
            return "high"
        elif any(keyword in text_lower for keyword in low_keywords):
            return "low"
        else:
            return "medium"

    def _extract_task_from_command(self, command: str) -> str:
        """
        Extract task text from voice command.

        Args:
            command: Raw voice command

        Returns:
            Cleaned task text
        """
        # Remove common command prefixes
        prefixes = [
            "add task",
            "create task",
            "remind me to",
            "i need to",
            "add to my list",
            "new task",
            "task",
        ]

        command_lower = command.lower().strip()

        for prefix in prefixes:
            if command_lower.startswith(prefix):
                return command[len(prefix) :].strip()

        return command.strip()

    def _analyze_scheduling_context(
        self, task_text: str, calendar_context: str | None, energy_level: str
    ) -> dict[str, Any]:
        """
        Analyze context for smart task scheduling.

        Args:
            task_text: Task description
            calendar_context: Calendar availability info
            energy_level: Current energy level

        Returns:
            Scheduling analysis and suggestions
        """
        # Mock smart scheduling analysis
        task_complexity = self._estimate_task_complexity(task_text)

        if energy_level == "high" and task_complexity == "high":
            suggested_time = "Now (high energy + complex task match)"
        elif energy_level == "low" and task_complexity == "low":
            suggested_time = "Now (low energy + simple task match)"
        elif calendar_context and "free time" in calendar_context:
            suggested_time = f"During {calendar_context}"
        else:
            suggested_time = "Next available high-energy period"

        return {
            "task_complexity": task_complexity,
            "energy_match": energy_level,
            "suggested_time": suggested_time,
            "confidence": 0.8,
        }

    def _estimate_task_complexity(self, task_text: str) -> str:
        """Estimate task complexity from description."""
        complex_keywords = ["analyze", "design", "write", "plan", "research", "create"]
        simple_keywords = ["call", "email", "buy", "schedule", "remind", "check"]

        text_lower = task_text.lower()

        if any(keyword in text_lower for keyword in complex_keywords):
            return "high"
        elif any(keyword in text_lower for keyword in simple_keywords):
            return "low"
        else:
            return "medium"

    def _is_location_relevant(self, task_text: str) -> bool:
        """Check if task is location-relevant."""
        location_keywords = ["buy", "shop", "pick up", "drop off", "visit", "go to"]
        return any(keyword in task_text.lower() for keyword in location_keywords)

    def _match_task_to_energy(self, task_text: str, energy_level: str) -> str:
        """Match task complexity to current energy level."""
        complexity = self._estimate_task_complexity(task_text)

        if complexity == "high" and energy_level == "high":
            return "perfect_match"
        elif complexity == "low" and energy_level == "low":
            return "good_match"
        elif complexity == "high" and energy_level == "low":
            return "energy_too_low"
        else:
            return "acceptable"
