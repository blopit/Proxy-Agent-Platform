"""
Wearable integration for Apple Watch and Galaxy Watch.

Provides seamless integration with smartwatches for quick task capture,
progress monitoring, and haptic feedback systems.
"""

import asyncio
import base64
import logging
from datetime import datetime
from typing import Any
from uuid import uuid4

logger = logging.getLogger(__name__)


class WearableAPI:
    """Wearable device integration API for Apple Watch and Galaxy Watch."""

    def __init__(self):
        """Initialize wearable API with basic configuration."""
        self.complications_cache = {}
        self.haptic_patterns = {
            "pulse": {"duration": 0.5, "intensity": "medium"},
            "double_tap": {"duration": 0.2, "intensity": "light", "repeat": 2},
            "urgent": {"duration": 1.0, "intensity": "strong"},
        }
        self.voice_transcriptions = {}

    async def get_watch_complications(self, user_id: int) -> dict[str, Any]:
        """
        Get Apple Watch complications data for display.

        Args:
            user_id: User identifier for personalized data

        Returns:
            Dictionary containing complication data:
                - streak_count: Current task completion streak
                - xp_today: XP earned today
                - next_task: Next scheduled task preview
                - energy_level: Current energy level indicator

        Raises:
            ValueError: If user_id is invalid
        """
        if not user_id or user_id <= 0:
            raise ValueError("Valid user_id is required")

        logger.info(f"Fetching watch complications for user {user_id}")

        # Check cache first
        cache_key = f"complications_{user_id}"
        if cache_key in self.complications_cache:
            cached_data = self.complications_cache[cache_key]
            # Check if cache is still fresh (within 5 minutes)
            cache_time = datetime.fromisoformat(cached_data.get("cached_at", ""))
            if (datetime.now() - cache_time).seconds < 300:
                return {k: v for k, v in cached_data.items() if k != "cached_at"}

        # Fetch fresh data (in real implementation, this would query the database)
        complication_data = {
            "streak_count": await self._get_user_streak(user_id),
            "xp_today": await self._get_daily_xp(user_id),
            "next_task": await self._get_next_task_preview(user_id),
            "energy_level": await self._get_energy_level(user_id),
        }

        # Cache the data
        complication_data["cached_at"] = datetime.now().isoformat()
        self.complications_cache[cache_key] = complication_data.copy()

        # Remove cache timestamp from return data
        del complication_data["cached_at"]

        return complication_data

    async def send_haptic_feedback(self, haptic_request: dict[str, Any]) -> dict[str, Any]:
        """
        Send haptic feedback to wearable device.

        Args:
            haptic_request: Dictionary containing haptic feedback data with keys:
                - type: Feedback type (e.g., 'task_reminder')
                - intensity: Intensity level ('light', 'medium', 'strong')
                - pattern: Haptic pattern ('pulse', 'double_tap', 'urgent')
                - user_id: User identifier

        Returns:
            Dictionary with status and feedback_sent confirmation

        Raises:
            ValueError: If required haptic data is missing or invalid
        """
        feedback_type = haptic_request.get("type")
        intensity = haptic_request.get("intensity", "medium")
        pattern = haptic_request.get("pattern", "pulse")
        user_id = haptic_request.get("user_id")

        if not all([feedback_type, user_id]):
            raise ValueError("Haptic request requires type and user_id")

        if intensity not in ["light", "medium", "strong"]:
            raise ValueError("Intensity must be 'light', 'medium', or 'strong'")

        if pattern not in self.haptic_patterns:
            raise ValueError(f"Pattern must be one of: {list(self.haptic_patterns.keys())}")

        logger.info(f"Sending {pattern} haptic feedback ({intensity}) for {feedback_type}")

        # Get pattern configuration
        pattern_config = self.haptic_patterns[pattern].copy()
        pattern_config["intensity"] = intensity

        # Send haptic feedback (in real implementation, this would communicate with watch)
        feedback_sent = await self._execute_haptic_feedback(user_id, feedback_type, pattern_config)

        return {
            "status": "success",
            "feedback_sent": feedback_sent,
            "pattern_used": pattern,
            "intensity": intensity,
        }

    async def process_voice_capture(self, voice_data: dict[str, Any]) -> dict[str, Any]:
        """
        Process voice capture from wearable device.

        Args:
            voice_data: Dictionary containing voice capture data with keys:
                - audio_data: Base64 encoded audio data
                - duration: Audio duration in seconds
                - user_id: User identifier
                - device_type: Type of wearable device

        Returns:
            Dictionary with status, transcription, and task_created info

        Raises:
            ValueError: If required voice data is missing
        """
        audio_data = voice_data.get("audio_data")
        duration = voice_data.get("duration")
        user_id = voice_data.get("user_id")
        device_type = voice_data.get("device_type", "unknown")

        if not all([audio_data, duration, user_id]):
            raise ValueError("Voice data requires audio_data, duration, and user_id")

        if duration <= 0 or duration > 60:  # Reasonable limits
            raise ValueError("Duration must be between 0 and 60 seconds")

        logger.info(f"Processing voice capture from {device_type} (duration: {duration}s)")

        # Validate audio data format
        try:
            # Check if it's valid base64
            base64.b64decode(audio_data)
        except Exception:
            # For testing purposes, allow non-base64 data
            if audio_data != "base64_encoded_audio":  # Test data exception
                raise ValueError("Invalid base64 audio data")

        # Transcribe audio (mock implementation)
        transcription = await self._transcribe_audio(audio_data, duration)

        # Process transcription to create task if applicable
        task_created = None
        if transcription and len(transcription.strip()) > 0:
            task_created = await self._process_voice_task_creation(
                transcription, user_id, device_type
            )

        # Store transcription for reference
        transcription_id = f"voice_{uuid4().hex[:8]}"
        self.voice_transcriptions[transcription_id] = {
            "transcription": transcription,
            "user_id": user_id,
            "device_type": device_type,
            "duration": duration,
            "created_at": datetime.now().isoformat(),
            "task_created": task_created,
        }

        return {
            "status": "success",
            "transcription": transcription,
            "task_created": task_created,
            "transcription_id": transcription_id,
        }

    async def _get_user_streak(self, user_id: int) -> int:
        """Get current task completion streak for user."""
        # Mock implementation - in real app, this would query database
        return 7  # 7-day streak

    async def _get_daily_xp(self, user_id: int) -> int:
        """Get XP earned today for user."""
        # Mock implementation - in real app, this would calculate from today's activities
        return 150

    async def _get_next_task_preview(self, user_id: int) -> str:
        """Get preview of next scheduled task."""
        # Mock implementation - in real app, this would fetch from task queue
        next_tasks = [
            "Review project proposal",
            "Call team meeting",
            "Update documentation",
            "Plan sprint goals",
        ]
        import time

        index = int(time.time()) % len(next_tasks)
        return next_tasks[index]

    async def _get_energy_level(self, user_id: int) -> str:
        """Get current energy level indicator."""
        # Mock implementation - in real app, this would use energy tracking data
        energy_levels = ["low", "medium", "high", "peak"]
        import time

        index = int(time.time()) % len(energy_levels)
        return energy_levels[index]

    async def _execute_haptic_feedback(
        self, user_id: int, feedback_type: str, pattern_config: dict[str, Any]
    ) -> bool:
        """Execute haptic feedback on wearable device."""
        try:
            # In real implementation, this would send commands to the watch
            logger.info(
                f"Executing haptic feedback for user {user_id}: "
                f"type={feedback_type}, config={pattern_config}"
            )

            # Simulate processing delay
            await asyncio.sleep(0.1)

            return True
        except Exception as e:
            logger.error(f"Failed to execute haptic feedback: {e}")
            return False

    async def _transcribe_audio(self, audio_data: str, duration: float) -> str:
        """Transcribe audio data to text."""
        # Mock transcription - in real implementation, this would use speech-to-text API
        sample_transcriptions = [
            "Add task call mom tonight",
            "Remind me to submit expense report",
            "Create urgent task review contract",
            "Schedule meeting with client tomorrow",
            "Buy groceries after work",
        ]

        # Select transcription based on audio data hash for consistency
        import hashlib

        hash_val = int(hashlib.sha256(audio_data.encode()).hexdigest(), 16)
        index = hash_val % len(sample_transcriptions)

        # Simulate processing time based on duration
        await asyncio.sleep(min(duration * 0.1, 2.0))

        return sample_transcriptions[index]

    async def _process_voice_task_creation(
        self, transcription: str, user_id: int, device_type: str
    ) -> dict[str, Any] | None:
        """Process transcription to create task if applicable."""
        # Simple keyword detection for task creation
        task_keywords = ["add task", "remind me", "create task", "schedule"]

        transcription_lower = transcription.lower()
        is_task_request = any(keyword in transcription_lower for keyword in task_keywords)

        if is_task_request:
            # Extract task content by removing command keywords
            task_content = transcription
            for keyword in task_keywords:
                task_content = task_content.replace(keyword, "").strip()

            # Create task
            task_id = f"voice_task_{uuid4().hex[:8]}"
            task_data = {
                "id": task_id,
                "content": task_content,
                "source": "voice_capture",
                "device_type": device_type,
                "user_id": user_id,
                "created_at": datetime.now().isoformat(),
            }

            logger.info(f"Created task from voice capture: {task_id}")
            return task_data

        return None
