"""
Temporary stub for notification manager to enable testing without numpy/sklearn.
"""

import logging
from collections import defaultdict, deque
from typing import Any
from uuid import uuid4

logger = logging.getLogger(__name__)


class NotificationManager:
    """Stub notification manager for testing."""

    def __init__(self):
        self.notification_templates = self._initialize_templates()
        self.user_preferences = {}
        self.context_weights = {
            "location": 0.3,
            "calendar_status": 0.4,
            "energy_level": 0.2,
            "recent_activity": 0.1,
        }
        self.timing_rules = self._initialize_timing_rules()
        self.notification_queue = deque()
        self.batch_size = 5
        self.batch_timeout = 300
        self.priority_thresholds = {"urgent": 90, "high": 70, "medium": 50, "low": 30}
        self.notification_groups = defaultdict(list)
        self.conflict_resolver = NotificationConflictResolver()
        self.metrics = {
            "notifications_sent": 0,
            "batch_processed": 0,
            "conflicts_resolved": 0,
            "ml_predictions": 0,
        }

    def _initialize_templates(self) -> dict[str, dict[str, Any]]:
        return {
            "streak_milestone": {
                "encouraging": "Amazing! You've hit a {days}-day streak! 🔥",
                "professional": "Congratulations on maintaining your {days}-day streak.",
                "casual": "Nice! {days} days in a row! Keep it going!",
                "motivational": "Unstoppable! {days} days straight - you're on fire!",
            },
            "task_reminder": {
                "encouraging": "You've got this! Time to tackle: {task_title}",
                "professional": "Reminder: {task_title} is ready for your attention.",
                "casual": "Hey! Don't forget about: {task_title}",
                "motivational": "Time to crush it! Let's do: {task_title}",
            },
        }

    def _initialize_timing_rules(self) -> dict[str, dict[str, Any]]:
        return {
            "morning": {
                "start_time": "06:00",
                "end_time": "10:00",
                "notification_types": ["streak_milestone", "daily_planning", "energy_boost"],
                "max_per_hour": 2,
            },
        }

    async def generate_smart_notification(self, user_context: dict[str, Any]) -> dict[str, Any]:
        """Generate smart notification (stub)."""
        user_id = user_context.get("user_id")
        if not user_id:
            raise ValueError("User ID is required for notification generation")

        timing_score = await self._calculate_timing_score(user_context)
        notification_type = await self._determine_notification_type(user_context)
        message = await self._generate_personalized_message(notification_type, user_context)
        suggested_actions = await self._generate_suggested_actions(user_context, notification_type)
        should_send = timing_score >= 60

        return {
            "status": "success",
            "message": message,
            "timing_score": timing_score,
            "suggested_actions": suggested_actions,
            "notification_type": notification_type,
            "should_send": should_send,
            "delivery_recommendation": self._get_delivery_recommendation(timing_score),
        }

    async def personalize_notification(
        self, notification_type: str, user_preferences: dict[str, Any]
    ) -> dict[str, Any]:
        """Personalize notification (stub)."""
        user_id = user_preferences.get("user_id")
        if not user_id:
            raise ValueError("User ID is required for personalization")

        if notification_type not in self.notification_templates:
            raise ValueError(f"Unknown notification type: {notification_type}")

        style = user_preferences.get("notification_style", "encouraging")
        self.user_preferences[user_id] = user_preferences

        message_template = self.notification_templates[notification_type].get(style)
        if not message_template:
            message_template = self.notification_templates[notification_type]["encouraging"]

        personalized_message = await self._customize_message(
            message_template, notification_type, user_preferences
        )
        call_to_action = await self._generate_call_to_action(notification_type, user_preferences)

        return {
            "status": "success",
            "personalized_message": personalized_message,
            "call_to_action": call_to_action,
            "style_used": style,
            "notification_id": f"notif_{uuid4().hex[:8]}",
        }

    async def _calculate_timing_score(self, user_context: dict[str, Any]) -> int:
        """Calculate timing score (stub)."""
        return 75  # Mock score

    async def _determine_notification_type(self, user_context: dict[str, Any]) -> str:
        """Determine notification type (stub)."""
        return "task_reminder"

    async def _generate_personalized_message(
        self, notification_type: str, user_context: dict[str, Any]
    ) -> str:
        """Generate personalized message (stub)."""
        return "You have a new task to complete!"

    async def _generate_suggested_actions(
        self, user_context: dict[str, Any], notification_type: str
    ) -> list[str]:
        """Generate suggested actions (stub)."""
        return ["Start task", "Defer 15 min", "Mark complete"]

    async def _customize_message(
        self, template: str, notification_type: str, user_preferences: dict[str, Any]
    ) -> str:
        """Customize message (stub)."""
        return template

    async def _generate_call_to_action(
        self, notification_type: str, user_preferences: dict[str, Any]
    ) -> str:
        """Generate call to action (stub)."""
        return "Take action!"

    def _get_delivery_recommendation(self, timing_score: int) -> str:
        """Get delivery recommendation (stub)."""
        if timing_score >= 80:
            return "Send immediately"
        elif timing_score >= 60:
            return "Send soon"
        else:
            return "Wait for better timing"

    async def batch_process_notifications(
        self, notifications: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Batch process notifications (stub)."""
        return {
            "status": "success",
            "processed": len(notifications),
            "grouped": 0,
            "conflicts_resolved": 0,
            "scheduled": len(notifications),
        }


class NotificationConflictResolver:
    """Stub conflict resolver."""

    async def resolve_notification_conflicts(
        self, notifications: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Resolve conflicts (stub)."""
        return notifications
