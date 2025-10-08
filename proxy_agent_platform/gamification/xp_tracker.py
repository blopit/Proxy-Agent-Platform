"""
XP event tracking system for the gamification platform.

Handles real-time XP event tracking, persistence, and integration
with proxy agents and user activities.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any

from .xp_engine import XPActivity, XPEngine


class XPEventType(str, Enum):
    """Types of XP events that can be tracked."""

    TASK_CREATED = "task_created"
    TASK_COMPLETED = "task_completed"
    TASK_UPDATED = "task_updated"
    FOCUS_SESSION_STARTED = "focus_session_started"
    FOCUS_SESSION_COMPLETED = "focus_session_completed"
    ENERGY_LOGGED = "energy_logged"
    PROGRESS_UPDATED = "progress_updated"
    GOAL_ACHIEVED = "goal_achieved"
    STREAK_EXTENDED = "streak_extended"
    QUALITY_IMPROVED = "quality_improved"


@dataclass
class XPEvent:
    """Event that triggers XP calculation."""

    user_id: int
    event_type: XPEventType
    event_data: dict[str, Any]
    timestamp: datetime
    source_agent: str | None = None
    xp_awarded: int | None = None
    processed: bool = False


class XPTracker:
    """
    Tracks XP events and coordinates with XP engine for real-time calculation.

    Integrates with proxy agents to automatically detect XP-worthy activities
    and provides real-time feedback to users.
    """

    def __init__(self, xp_engine: XPEngine | None = None):
        """
        Initialize XP tracker.

        Args:
            xp_engine: XP calculation engine (creates default if None)
        """
        self.xp_engine = xp_engine or XPEngine()
        self.event_queue: list[XPEvent] = []
        self.user_totals: dict[int, int] = {}
        self.processing = False

    async def track_event(
        self,
        user_id: int,
        event_type: XPEventType,
        event_data: dict[str, Any],
        source_agent: str | None = None,
    ) -> int:
        """
        Track an XP event and calculate XP in real-time.

        Args:
            user_id: ID of the user earning XP
            event_type: Type of event that occurred
            event_data: Data about the event
            source_agent: Which agent triggered the event

        Returns:
            XP awarded for this event
        """
        # Create XP event
        event = XPEvent(
            user_id=user_id,
            event_type=event_type,
            event_data=event_data,
            timestamp=datetime.now(),
            source_agent=source_agent,
        )

        # Calculate XP for this event
        xp_activity = self._create_xp_activity_from_event(event)
        xp_awarded = self.xp_engine.calculate_xp(xp_activity)

        # Update event with XP awarded
        event.xp_awarded = xp_awarded

        # Add to queue for processing
        self.event_queue.append(event)

        # Update user total
        if user_id not in self.user_totals:
            self.user_totals[user_id] = 0
        self.user_totals[user_id] += xp_awarded

        # Process event queue
        await self._process_event_queue()

        return xp_awarded

    def _create_xp_activity_from_event(self, event: XPEvent) -> XPActivity:
        """
        Convert an XP event into an XPActivity for calculation.

        Args:
            event: The XP event to convert

        Returns:
            XPActivity object for XP calculation
        """
        # Base activity types and their XP values
        activity_types = self.xp_engine.get_activity_types()

        # Map event types to activity types
        event_to_activity_map = {
            XPEventType.TASK_COMPLETED: "task_completion",
            XPEventType.FOCUS_SESSION_COMPLETED: "focus_session_30min",  # Default, adjusted by duration
            XPEventType.ENERGY_LOGGED: "energy_log",
            XPEventType.PROGRESS_UPDATED: "progress_update",
            XPEventType.GOAL_ACHIEVED: "goal_achievement",
            XPEventType.STREAK_EXTENDED: "streak_milestone",
            XPEventType.QUALITY_IMPROVED: "quality_feedback",
        }

        activity_type = event_to_activity_map.get(event.event_type, "task_completion")
        base_xp = activity_types.get(activity_type, 10)

        # Extract activity parameters from event data
        difficulty = event.event_data.get("difficulty", "medium")
        priority = event.event_data.get("priority", "medium")
        estimated_duration = event.event_data.get("estimated_duration")
        actual_duration = event.event_data.get("actual_duration")
        quality_score = event.event_data.get("quality_score")
        streak_multiplier = event.event_data.get("streak_multiplier", 1.0)

        # Adjust base XP for focus sessions based on duration
        if event.event_type == XPEventType.FOCUS_SESSION_COMPLETED:
            duration = actual_duration or estimated_duration or 30
            if duration >= 90:
                base_xp = activity_types["focus_session_90min"]
            elif duration >= 60:
                base_xp = activity_types["focus_session_60min"]
            else:
                base_xp = activity_types["focus_session_30min"]

        return XPActivity(
            activity_type=activity_type,
            base_xp=base_xp,
            difficulty=difficulty,
            priority=priority,
            estimated_duration=estimated_duration,
            actual_duration=actual_duration,
            quality_score=quality_score,
            streak_multiplier=streak_multiplier,
            created_at=event.timestamp,
        )

    async def _process_event_queue(self):
        """Process pending XP events."""
        if self.processing or not self.event_queue:
            return

        self.processing = True

        try:
            # Process all unprocessed events
            for event in self.event_queue:
                if not event.processed:
                    await self._process_single_event(event)
                    event.processed = True

            # Clean up processed events older than 1 hour
            current_time = datetime.now()
            self.event_queue = [
                event
                for event in self.event_queue
                if not event.processed or (current_time - event.timestamp).seconds < 3600
            ]

        finally:
            self.processing = False

    async def _process_single_event(self, event: XPEvent):
        """
        Process a single XP event (persistence, notifications, etc.).

        Args:
            event: Event to process
        """
        # In a real implementation, this would:
        # 1. Save to database
        # 2. Send notifications
        # 3. Update user stats
        # 4. Trigger achievement checks
        # 5. Update leaderboards

        # For now, just log the event
        print(
            f"[XP] User {event.user_id} earned {event.xp_awarded} XP for {event.event_type.value}"
        )

    def get_user_total_xp(self, user_id: int) -> int:
        """
        Get total XP for a user.

        Args:
            user_id: User ID

        Returns:
            Total XP earned by user
        """
        return self.user_totals.get(user_id, 0)

    def get_recent_events(self, user_id: int, limit: int = 10) -> list[XPEvent]:
        """
        Get recent XP events for a user.

        Args:
            user_id: User ID
            limit: Maximum number of events to return

        Returns:
            List of recent XP events
        """
        user_events = [event for event in self.event_queue if event.user_id == user_id]

        # Sort by timestamp (most recent first)
        user_events.sort(key=lambda e: e.timestamp, reverse=True)

        return user_events[:limit]

    async def simulate_task_completion(
        self,
        user_id: int,
        task_title: str,
        difficulty: str = "medium",
        priority: str = "medium",
        estimated_minutes: int | None = None,
        actual_minutes: int | None = None,
        quality_score: float | None = None,
    ) -> int:
        """
        Simulate a task completion event for testing.

        Args:
            user_id: User completing the task
            task_title: Title of the task
            difficulty: Task difficulty level
            priority: Task priority level
            estimated_minutes: Estimated duration
            actual_minutes: Actual duration
            quality_score: Quality of completion (0-1)

        Returns:
            XP awarded
        """
        event_data = {
            "task_title": task_title,
            "difficulty": difficulty,
            "priority": priority,
        }

        if estimated_minutes:
            event_data["estimated_duration"] = estimated_minutes
        if actual_minutes:
            event_data["actual_duration"] = actual_minutes
        if quality_score:
            event_data["quality_score"] = quality_score

        return await self.track_event(
            user_id=user_id,
            event_type=XPEventType.TASK_COMPLETED,
            event_data=event_data,
            source_agent="task_proxy",
        )

    async def simulate_focus_session(
        self, user_id: int, duration_minutes: int, quality_score: float | None = None
    ) -> int:
        """
        Simulate a focus session completion for testing.

        Args:
            user_id: User who completed the session
            duration_minutes: Length of focus session
            quality_score: Quality of focus (0-1)

        Returns:
            XP awarded
        """
        event_data = {
            "duration_minutes": duration_minutes,
            "actual_duration": duration_minutes,
        }

        if quality_score:
            event_data["quality_score"] = quality_score

        return await self.track_event(
            user_id=user_id,
            event_type=XPEventType.FOCUS_SESSION_COMPLETED,
            event_data=event_data,
            source_agent="focus_proxy",
        )
