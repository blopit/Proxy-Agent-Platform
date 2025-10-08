"""
Voice command processing system for mobile and wearable devices.

Provides intelligent voice command parsing and execution for task management,
queries, and focus session control across all supported platforms.
"""

import logging
import re
from datetime import datetime
from typing import Any
from uuid import uuid4

logger = logging.getLogger(__name__)


class VoiceProcessor:
    """Advanced voice command processor for productivity management."""

    def __init__(self):
        """Initialize voice processor with command patterns and handlers."""
        self.command_patterns = self._initialize_command_patterns()
        self.intent_handlers = self._initialize_intent_handlers()
        self.user_contexts = {}  # Store user context for better responses

    def _initialize_command_patterns(self) -> dict[str, list[dict[str, Any]]]:
        """Initialize regex patterns for command recognition."""
        return {
            "create_task": [
                {"pattern": r"add task (.+)", "groups": ["task_content"], "priority": "medium"},
                {"pattern": r"remind me to (.+)", "groups": ["task_content"], "priority": "low"},
                {
                    "pattern": r"create (?:(urgent|high|low|medium)\s+)?task (.+)",
                    "groups": ["priority", "task_content"],
                    "priority": "medium",
                },
            ],
            "query": [
                {"pattern": r"what'?s my (?:current )?streak\??", "response_type": "streak_count"},
                {
                    "pattern": r"how much xp (?:do i have|have i earned) today\??",
                    "response_type": "daily_xp",
                },
                {"pattern": r"what'?s my next task\??", "response_type": "next_task"},
                {
                    "pattern": r"what'?s my (?:current )?energy level\??",
                    "response_type": "energy_level",
                },
            ],
            "focus_control": [
                {
                    "pattern": r"start (?:a )?(\d+) minute focus session",
                    "groups": ["duration"],
                    "action": "start_focus",
                },
                {
                    "pattern": r"begin (?:a )?(?:(deep work|focus) )?session",
                    "groups": ["session_type"],
                    "action": "start_focus",
                    "default_duration": 25,
                },
                {
                    "pattern": r"take (?:a )?(\d+) minute break",
                    "groups": ["duration"],
                    "action": "start_break",
                },
                {"pattern": r"(?:stop|end) (?:focus )?session", "action": "stop_session"},
            ],
        }

    def _initialize_intent_handlers(self) -> dict[str, callable]:
        """Initialize handlers for each intent type."""
        return {
            "create_task": self._handle_task_creation,
            "query": self._handle_query,
            "focus_control": self._handle_focus_control,
        }

    async def process_command(self, command: str, user_id: int) -> dict[str, Any]:
        """
        Process voice command and execute appropriate action.

        Args:
            command: Voice command text to process
            user_id: User identifier for personalized responses

        Returns:
            Dictionary containing:
                - status: Success/failure status
                - intent: Recognized intent type
                - Additional response data based on intent

        Raises:
            ValueError: If command is empty or user_id is invalid
        """
        if not command or not command.strip():
            raise ValueError("Command cannot be empty")

        if not user_id or user_id <= 0:
            raise ValueError("Valid user_id is required")

        command = command.strip().lower()
        logger.info(f"Processing voice command for user {user_id}: '{command}'")

        # Recognize intent and extract parameters
        intent, parameters = await self._recognize_intent(command)

        if not intent:
            return {
                "status": "error",
                "error": "Could not understand command",
                "suggested_commands": self._get_suggested_commands(),
            }

        # Execute intent handler
        try:
            response = await self.intent_handlers[intent](user_id, parameters)
            response["status"] = "success"
            response["intent"] = intent
            return response

        except Exception as e:
            logger.error(f"Error processing intent {intent}: {e}")
            return {"status": "error", "intent": intent, "error": str(e)}

    async def _recognize_intent(self, command: str) -> tuple[str | None, dict[str, Any]]:
        """
        Recognize intent and extract parameters from command.

        Args:
            command: Normalized command text

        Returns:
            Tuple of (intent_name, parameters_dict)
        """
        for intent, patterns in self.command_patterns.items():
            for pattern_config in patterns:
                pattern = pattern_config["pattern"]
                match = re.search(pattern, command, re.IGNORECASE)

                if match:
                    parameters = {}

                    # Extract named groups
                    if "groups" in pattern_config:
                        groups = pattern_config["groups"]
                        for i, group_name in enumerate(groups):
                            if i + 1 <= len(match.groups()):
                                value = match.group(i + 1)
                                if value:  # Only add non-None values
                                    parameters[group_name] = value.strip()

                    # Add pattern configuration to parameters
                    parameters.update(
                        {k: v for k, v in pattern_config.items() if k not in ["pattern", "groups"]}
                    )

                    logger.info(f"Recognized intent: {intent}, parameters: {parameters}")
                    return intent, parameters

        return None, {}

    async def _handle_task_creation(
        self, user_id: int, parameters: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle task creation commands."""
        task_content = parameters.get("task_content", "").strip()
        if not task_content:
            raise ValueError("Task content is required")

        priority = parameters.get("priority", "medium")
        if priority not in ["low", "medium", "high", "urgent"]:
            priority = "medium"

        # Create task
        task_id = f"voice_task_{uuid4().hex[:8]}"
        task_data = {
            "id": task_id,
            "content": task_content,
            "priority": priority,
            "created_at": datetime.now().isoformat(),
            "source": "voice_command",
            "user_id": user_id,
        }

        # Store task (in real implementation, this would save to database)
        logger.info(f"Created task via voice: {task_id} - {task_content}")

        return {
            "task_data": task_data,
            "spoken_response": f"Task created: {task_content}",
            "confirmation": f"I've added '{task_content}' to your task list with {priority} priority.",
        }

    async def _handle_query(self, user_id: int, parameters: dict[str, Any]) -> dict[str, Any]:
        """Handle information query commands."""
        response_type = parameters.get("response_type")

        if response_type == "streak_count":
            streak = await self._get_user_streak(user_id)
            spoken_response = f"Your current streak is {streak} days. Keep it up!"

        elif response_type == "daily_xp":
            xp = await self._get_daily_xp(user_id)
            spoken_response = f"You've earned {xp} XP today. Great progress!"

        elif response_type == "next_task":
            next_task = await self._get_next_task(user_id)
            if next_task:
                spoken_response = f"Your next task is: {next_task}"
            else:
                spoken_response = "You don't have any pending tasks. Great job!"

        elif response_type == "energy_level":
            energy = await self._get_energy_level(user_id)
            energy_advice = self._get_energy_advice(energy)
            spoken_response = f"Your energy level is {energy}. {energy_advice}"

        else:
            spoken_response = "I'm not sure what information you're looking for."

        return {"spoken_response": spoken_response, "data_type": response_type}

    async def _handle_focus_control(
        self, user_id: int, parameters: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle focus session control commands."""
        action = parameters.get("action")

        if action == "start_focus":
            duration = parameters.get("duration")
            if duration:
                try:
                    duration = int(duration)
                except ValueError:
                    duration = parameters.get("default_duration", 25)
            else:
                duration = parameters.get("default_duration", 25)

            session_type = parameters.get("session_type", "focus")

            # Start focus session
            session_id = await self._start_focus_session(user_id, duration, session_type)

            return {
                "session_id": session_id,
                "duration": duration,
                "session_type": session_type,
                "spoken_response": f"Starting {duration} minute {session_type} session. Focus time!",
            }

        elif action == "start_break":
            duration = parameters.get("duration", "5")
            try:
                duration = int(duration)
            except ValueError:
                duration = 5

            # Start break session
            break_id = await self._start_break_session(user_id, duration)

            return {
                "break_id": break_id,
                "duration": duration,
                "spoken_response": f"Starting {duration} minute break. Relax and recharge!",
            }

        elif action == "stop_session":
            # Stop current session
            stopped = await self._stop_current_session(user_id)

            if stopped:
                return {"session_stopped": True, "spoken_response": "Session stopped. Good work!"}
            else:
                return {"session_stopped": False, "spoken_response": "No active session to stop."}

        else:
            raise ValueError(f"Unknown focus control action: {action}")

    def _get_suggested_commands(self) -> list[str]:
        """Get list of suggested voice commands for help."""
        return [
            "Add task call client tomorrow",
            "What's my current streak?",
            "Start 25 minute focus session",
            "How much XP do I have today?",
            "What's my next task?",
            "Take a 5 minute break",
        ]

    def _get_energy_advice(self, energy_level: str) -> str:
        """Get energy-specific advice."""
        advice_map = {
            "low": "Consider taking a break or doing some light tasks.",
            "medium": "Good time for moderate complexity tasks.",
            "high": "Perfect time for challenging work!",
            "peak": "Tackle your most important tasks now!",
        }
        return advice_map.get(energy_level, "Listen to your body and pace yourself.")

    async def _get_user_streak(self, user_id: int) -> int:
        """Get current task completion streak."""
        # Mock implementation
        return 7

    async def _get_daily_xp(self, user_id: int) -> int:
        """Get XP earned today."""
        # Mock implementation
        return 150

    async def _get_next_task(self, user_id: int) -> str | None:
        """Get next scheduled task."""
        # Mock implementation
        tasks = ["Review project proposal", "Call team meeting", "Update documentation"]
        import time

        if int(time.time()) % 2:  # Sometimes return None
            return tasks[int(time.time()) % len(tasks)]
        return None

    async def _get_energy_level(self, user_id: int) -> str:
        """Get current energy level."""
        # Mock implementation
        levels = ["low", "medium", "high", "peak"]
        import time

        return levels[int(time.time()) % len(levels)]

    async def _start_focus_session(self, user_id: int, duration: int, session_type: str) -> str:
        """Start a focus session."""
        session_id = f"focus_{uuid4().hex[:8]}"
        logger.info(f"Starting {session_type} session for user {user_id}: {duration} minutes")
        return session_id

    async def _start_break_session(self, user_id: int, duration: int) -> str:
        """Start a break session."""
        break_id = f"break_{uuid4().hex[:8]}"
        logger.info(f"Starting break for user {user_id}: {duration} minutes")
        return break_id

    async def _stop_current_session(self, user_id: int) -> bool:
        """Stop current active session."""
        # Mock implementation - in real app, would check for active sessions
        logger.info(f"Stopping current session for user {user_id}")
        return True  # Assume there was a session to stop
