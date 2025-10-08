"""
Smart notification manager for mobile devices.

Provides intelligent, context-aware notifications with personalization,
ML-based timing optimization, batch processing, and seamless workflow integration.
"""

import logging
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any
from uuid import uuid4

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class NotificationPriority(Enum):
    """Notification priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationCategory(Enum):
    """Notification categories."""
    TASK = "task"
    REMINDER = "reminder"
    ACHIEVEMENT = "achievement"
    ALERT = "alert"
    SOCIAL = "social"
    SYSTEM = "system"


@dataclass
class BatchProcessingConfig:
    """Configuration for batch processing."""
    batch_size: int = 5
    timeout_seconds: int = 300
    enabled: bool = True


@dataclass
class MobileNotification:
    """Mobile notification data structure."""
    notification_id: str
    title: str
    body: str
    priority: NotificationPriority
    category: NotificationCategory
    user_id: str
    created_at: datetime
    scheduled_at: datetime | None = None
    metadata: dict[str, Any] | None = None
    action_url: str | None = None

    def __post_init__(self):
        """Post-initialization setup."""
        if self.metadata is None:
            self.metadata = {}
        if self.notification_id is None:
            self.notification_id = str(uuid4())


class NotificationManager:
    """Intelligent notification management system with ML optimization."""

    def __init__(self):
        """Initialize notification manager with ML models and batch processing."""
        self.notification_templates = self._initialize_templates()
        self.user_preferences = {}
        self.context_weights = {
            "location": 0.3,
            "calendar_status": 0.4,
            "energy_level": 0.2,
            "recent_activity": 0.1,
        }
        self.timing_rules = self._initialize_timing_rules()

        # ML-based timing optimization
        self.timing_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.feature_scaler = StandardScaler()
        self.is_model_trained = False
        self.interaction_history = defaultdict(list)

        # Batch processing and queuing
        self.notification_queue = deque()
        self.batch_size = 5
        self.batch_timeout = 300  # 5 minutes
        self.priority_thresholds = {"urgent": 90, "high": 70, "medium": 50, "low": 30}

        # Conflict resolution and grouping
        self.notification_groups = defaultdict(list)
        self.conflict_resolver = NotificationConflictResolver()

        # Performance metrics
        self.metrics = {
            "notifications_sent": 0,
            "batch_processed": 0,
            "conflicts_resolved": 0,
            "ml_predictions": 0,
        }

    def _initialize_templates(self) -> dict[str, dict[str, Any]]:
        """Initialize notification message templates."""
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
            "energy_boost": {
                "encouraging": "Your energy is {level}! Perfect time for {suggestion}",
                "professional": "Energy level: {level}. Consider: {suggestion}",
                "casual": "Feeling {level}? How about: {suggestion}",
                "motivational": "You're {level}! Channel that energy into: {suggestion}",
            },
            "focus_break": {
                "encouraging": "Great work! Time for a well-deserved break 🌟",
                "professional": "Focus session complete. Break time recommended.",
                "casual": "Nice focus session! Take a breather 😊",
                "motivational": "Excellent focus! Recharge and come back stronger!",
            },
        }

    def _initialize_timing_rules(self) -> dict[str, dict[str, Any]]:
        """Initialize rules for optimal notification timing."""
        return {
            "morning": {
                "start_time": "06:00",
                "end_time": "10:00",
                "notification_types": ["streak_milestone", "daily_planning", "energy_boost"],
                "max_per_hour": 2,
            },
            "work_hours": {
                "start_time": "09:00",
                "end_time": "17:00",
                "notification_types": ["task_reminder", "focus_break", "priority_alert"],
                "max_per_hour": 3,
            },
            "evening": {
                "start_time": "18:00",
                "end_time": "22:00",
                "notification_types": ["day_summary", "tomorrow_prep", "achievement"],
                "max_per_hour": 2,
            },
            "do_not_disturb": {
                "start_time": "22:00",
                "end_time": "06:00",
                "notification_types": ["urgent_only"],
                "max_per_hour": 0,
            },
        }

    async def generate_smart_notification(self, user_context: dict[str, Any]) -> dict[str, Any]:
        """
        Generate context-aware notification based on user situation.

        Args:
            user_context: Dictionary containing user context with keys:
                - user_id: User identifier
                - current_location: Current location context
                - calendar_status: Calendar availability status
                - energy_level: Current energy level
                - recent_activity: Recent user activity

        Returns:
            Dictionary with notification details:
                - status: Generation status
                - message: Notification message
                - timing_score: Optimal timing score (0-100)
                - suggested_actions: List of suggested actions

        Raises:
            ValueError: If required context data is missing
        """
        user_id = user_context.get("user_id")
        if not user_id:
            raise ValueError("User ID is required for notification generation")

        logger.info(f"Generating smart notification for user {user_id}")

        # Analyze context for timing optimization
        timing_score = await self._calculate_timing_score(user_context)

        # Determine notification type based on context
        notification_type = await self._determine_notification_type(user_context)

        # Generate personalized message
        message = await self._generate_personalized_message(notification_type, user_context)

        # Generate suggested actions
        suggested_actions = await self._generate_suggested_actions(user_context, notification_type)

        # Determine if notification should be sent now
        should_send = timing_score >= 60  # Threshold for sending

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
        """
        Create personalized notification based on user preferences.

        Args:
            notification_type: Type of notification to personalize
            user_preferences: Dictionary containing user preferences with keys:
                - user_id: User identifier
                - preferred_time: Preferred notification time
                - notification_style: Preferred message style
                - goal_focus: User's primary goal focus

        Returns:
            Dictionary with personalized notification:
                - status: Personalization status
                - personalized_message: Customized message
                - call_to_action: Personalized call to action

        Raises:
            ValueError: If required preference data is missing
        """
        user_id = user_preferences.get("user_id")
        if not user_id:
            raise ValueError("User ID is required for personalization")

        if notification_type not in self.notification_templates:
            raise ValueError(f"Unknown notification type: {notification_type}")

        logger.info(f"Personalizing {notification_type} notification for user {user_id}")

        # Get user's preferred style
        style = user_preferences.get("notification_style", "encouraging")
        if style not in ["encouraging", "professional", "casual", "motivational"]:
            style = "encouraging"

        # Store preferences for future use
        self.user_preferences[user_id] = user_preferences

        # Generate personalized message
        message_template = self.notification_templates[notification_type].get(style)
        if not message_template:
            message_template = self.notification_templates[notification_type]["encouraging"]

        # Customize message based on notification type
        personalized_message = await self._customize_message(
            message_template, notification_type, user_preferences
        )

        # Generate call to action
        call_to_action = await self._generate_call_to_action(notification_type, user_preferences)

        return {
            "status": "success",
            "personalized_message": personalized_message,
            "call_to_action": call_to_action,
            "style_used": style,
            "notification_id": f"notif_{uuid4().hex[:8]}",
        }

    async def _calculate_timing_score(self, user_context: dict[str, Any]) -> int:
        """Calculate optimal timing score based on context."""
        score = 50  # Base score

        # Location context
        location = user_context.get("current_location", "unknown")
        if location == "home":
            score += 20
        elif location == "office":
            score += 15
        elif location == "commuting":
            score -= 10

        # Calendar status
        calendar_status = user_context.get("calendar_status", "unknown")
        if calendar_status == "free":
            score += 25
        elif calendar_status == "busy":
            score -= 20
        elif calendar_status == "in_meeting":
            score -= 40

        # Energy level
        energy_level = user_context.get("energy_level", "medium")
        if energy_level in ["high", "peak"]:
            score += 15
        elif energy_level == "low":
            score -= 15

        # Recent activity
        recent_activity = user_context.get("recent_activity", "")
        if recent_activity == "completed_task":
            score += 10
        elif recent_activity == "break_taken":
            score += 5

        # Time of day considerations
        current_hour = datetime.now().hour
        if 9 <= current_hour <= 11 or 14 <= current_hour <= 16:  # Peak hours
            score += 10
        elif current_hour < 6 or current_hour > 22:  # Do not disturb
            score -= 30

        return max(0, min(100, score))

    async def _determine_notification_type(self, user_context: dict[str, Any]) -> str:
        """Determine the most appropriate notification type."""
        energy_level = user_context.get("energy_level", "medium")
        recent_activity = user_context.get("recent_activity", "")
        calendar_status = user_context.get("calendar_status", "unknown")

        # Decision logic based on context
        if recent_activity == "completed_task":
            return "streak_milestone"
        elif energy_level in ["high", "peak"] and calendar_status == "free":
            return "task_reminder"
        elif energy_level == "low":
            return "energy_boost"
        else:
            return "task_reminder"  # Default

    async def _generate_personalized_message(
        self, notification_type: str, user_context: dict[str, Any]
    ) -> str:
        """Generate personalized message based on context."""
        user_id = user_context["user_id"]
        user_prefs = self.user_preferences.get(user_id, {})
        style = user_prefs.get("notification_style", "encouraging")

        # Get template
        template = self.notification_templates.get(notification_type, {}).get(style)
        if not template:
            template = "You have a new notification."

        # Customize based on notification type
        if notification_type == "streak_milestone":
            return template.format(days=7)  # Mock streak data
        elif notification_type == "task_reminder":
            return template.format(task_title="Review project documentation")
        elif notification_type == "energy_boost":
            energy = user_context.get("energy_level", "medium")
            suggestion = self._get_energy_suggestion(energy)
            return template.format(level=energy, suggestion=suggestion)
        else:
            return template

    async def _generate_suggested_actions(
        self, user_context: dict[str, Any], notification_type: str
    ) -> list[str]:
        """Generate context-appropriate suggested actions."""
        actions = []

        energy_level = user_context.get("energy_level", "medium")
        calendar_status = user_context.get("calendar_status", "unknown")

        if notification_type == "task_reminder":
            actions = ["Start task", "Defer 15 min", "Mark complete"]
        elif notification_type == "streak_milestone":
            actions = ["View progress", "Share achievement", "Set new goal"]
        elif notification_type == "energy_boost":
            if energy_level == "high":
                actions = ["Start focus session", "Tackle priority task", "Plan ahead"]
            else:
                actions = ["Take break", "Do light task", "Refresh energy"]

        return actions[:3]  # Limit to 3 actions

    async def _customize_message(
        self, template: str, notification_type: str, user_preferences: dict[str, Any]
    ) -> str:
        """Customize message template with user-specific data."""
        goal_focus = user_preferences.get("goal_focus", "productivity")

        # Add goal-specific context
        if goal_focus == "productivity" and "task" in template.lower():
            template = template.replace("task", "productivity goal")
        elif goal_focus == "wellness" and "work" in template.lower():
            template = template.replace("work", "wellness activity")

        return template

    async def _generate_call_to_action(
        self, notification_type: str, user_preferences: dict[str, Any]
    ) -> str:
        """Generate personalized call to action."""
        goal_focus = user_preferences.get("goal_focus", "productivity")

        cta_map = {
            "streak_milestone": {
                "productivity": "Keep building momentum!",
                "wellness": "Maintain your healthy habits!",
                "learning": "Continue your growth journey!",
            },
            "task_reminder": {
                "productivity": "Time to make progress!",
                "wellness": "Take care of yourself!",
                "learning": "Expand your knowledge!",
            },
            "energy_boost": {
                "productivity": "Channel your energy wisely!",
                "wellness": "Listen to your body!",
                "learning": "Perfect time to learn!",
            },
        }

        return cta_map.get(notification_type, {}).get(goal_focus, "Take action!")

    def _get_delivery_recommendation(self, timing_score: int) -> str:
        """Get delivery recommendation based on timing score."""
        if timing_score >= 80:
            return "Send immediately"
        elif timing_score >= 60:
            return "Send soon"
        elif timing_score >= 40:
            return "Delay 15 minutes"
        else:
            return "Wait for better timing"

    def _get_energy_suggestion(self, energy_level: str) -> str:
        """Get suggestion based on energy level."""
        suggestions = {
            "low": "a short break or light task",
            "medium": "a moderate complexity task",
            "high": "your most important work",
            "peak": "tackling challenging projects",
        }
        return suggestions.get(energy_level, "taking action")

    def get_notification_history(self, user_id: int, limit: int = 10) -> list[dict[str, Any]]:
        """Get recent notification history for user."""
        # Mock implementation - in real app, this would fetch from database
        return [
            {
                "id": f"notif_{i}",
                "type": "task_reminder",
                "message": f"Sample notification {i}",
                "sent_at": (datetime.now() - timedelta(hours=i)).isoformat(),
                "timing_score": 75 + (i * 5) % 25,
            }
            for i in range(limit)
        ]

    def get_notification_settings(self, user_id: int) -> dict[str, Any]:
        """Get user's notification settings."""
        return self.user_preferences.get(
            user_id,
            {
                "notification_style": "encouraging",
                "preferred_time": "morning",
                "goal_focus": "productivity",
                "max_daily_notifications": 10,
            },
        )

    async def batch_process_notifications(
        self, notifications: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """
        Process multiple notifications in batch with intelligent grouping.

        Args:
            notifications: List of notification dictionaries

        Returns:
            Dictionary with batch processing results
        """
        if not notifications:
            return {"status": "success", "processed": 0, "grouped": 0, "conflicts_resolved": 0}

        logger.info(f"Batch processing {len(notifications)} notifications")

        # Group notifications by user and type
        grouped = self._group_notifications(notifications)

        # Resolve conflicts within groups
        resolved_groups = {}
        conflicts_resolved = 0

        for group_key, group_notifications in grouped.items():
            if len(group_notifications) > 1:
                resolved = await self.conflict_resolver.resolve_notification_conflicts(
                    group_notifications
                )
                conflicts_resolved += len(group_notifications) - len(resolved)
                resolved_groups[group_key] = resolved
            else:
                resolved_groups[group_key] = group_notifications

        # Apply ML timing optimization
        optimized_notifications = []
        for group_notifications in resolved_groups.values():
            for notification in group_notifications:
                timing_score = await self._ml_predict_optimal_timing(notification)
                notification["ml_timing_score"] = timing_score
                optimized_notifications.append(notification)

        # Schedule notifications based on priority and timing
        scheduled = await self._schedule_batch_notifications(optimized_notifications)

        self.metrics["batch_processed"] += 1
        self.metrics["conflicts_resolved"] += conflicts_resolved

        return {
            "status": "success",
            "processed": len(notifications),
            "grouped": len(grouped),
            "conflicts_resolved": conflicts_resolved,
            "scheduled": scheduled,
        }

    async def train_timing_model(self, user_id: int, training_data: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Train ML model for optimal notification timing based on user interaction data.

        Args:
            user_id: User identifier
            training_data: Historical interaction data

        Returns:
            Training results and model performance metrics
        """
        if len(training_data) < 10:
            return {"status": "error", "message": "Insufficient training data (minimum 10 samples)"}

        logger.info(f"Training timing model for user {user_id} with {len(training_data)} samples")

        # Prepare features and targets
        features = []
        targets = []

        for sample in training_data:
            feature_vector = self._extract_timing_features(sample)
            interaction_score = sample.get("interaction_score", 0)  # 0-100 based on user response
            features.append(feature_vector)
            targets.append(interaction_score)

        X = np.array(features)
        y = np.array(targets)

        # Scale features
        X_scaled = self.feature_scaler.fit_transform(X)

        # Train model
        self.timing_model.fit(X_scaled, y)
        self.is_model_trained = True

        # Calculate performance metrics
        train_score = self.timing_model.score(X_scaled, y)
        feature_importance = dict(zip(self._get_feature_names(), self.timing_model.feature_importances_, strict=False))

        return {
            "status": "success",
            "model_score": train_score,
            "feature_importance": feature_importance,
            "training_samples": len(training_data),
        }

    async def smart_notification_grouping(
        self, notifications: list[dict[str, Any]]
    ) -> dict[str, list[dict[str, Any]]]:
        """
        Intelligently group notifications to reduce notification fatigue.

        Args:
            notifications: List of notifications to group

        Returns:
            Dictionary of grouped notifications
        """
        groups = defaultdict(list)

        for notification in notifications:
            user_id = notification.get("user_id")
            notification_type = notification.get("type", "general")
            priority = notification.get("priority", "medium")

            # Create grouping key based on user, type, and timing window
            timing_window = self._get_timing_window(notification.get("created_at"))
            group_key = f"{user_id}_{notification_type}_{timing_window}"

            # Special handling for urgent notifications
            if priority == "urgent":
                group_key += "_urgent"

            groups[group_key].append(notification)

        return dict(groups)

    async def priority_scoring_system(self, notification: dict[str, Any]) -> int:
        """
        Calculate priority score for notification with context awareness.

        Args:
            notification: Notification data

        Returns:
            Priority score (0-100)
        """
        base_priority = {"urgent": 90, "high": 70, "medium": 50, "low": 30}
        score = base_priority.get(notification.get("priority", "medium"), 50)

        # Context adjustments
        user_context = notification.get("user_context", {})

        # Calendar status adjustment
        calendar_status = user_context.get("calendar_status", "unknown")
        if calendar_status == "in_meeting":
            score -= 30
        elif calendar_status == "free":
            score += 10

        # Energy level adjustment
        energy_level = user_context.get("energy_level", "medium")
        if energy_level in ["high", "peak"]:
            score += 15
        elif energy_level == "low":
            score -= 10

        # Time-based adjustment
        current_hour = datetime.now().hour
        if current_hour >= 22 or current_hour <= 6:  # Night hours
            score -= 40
        elif 9 <= current_hour <= 17:  # Work hours
            score += 10

        # Recent notification frequency
        user_id = notification.get("user_id")
        if user_id:
            recent_count = self._count_recent_notifications(user_id, hours=1)
            if recent_count > 3:
                score -= 20

        return max(0, min(100, score))

    def _group_notifications(self, notifications: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
        """Group notifications by user, type, and timing window."""
        groups = defaultdict(list)

        for notification in notifications:
            user_id = notification.get("user_id")
            notification_type = notification.get("type", "general")
            created_at = notification.get("created_at", datetime.now().isoformat())

            # Create 15-minute timing windows
            dt = datetime.fromisoformat(created_at)
            window = dt.replace(minute=(dt.minute // 15) * 15, second=0, microsecond=0)

            group_key = f"{user_id}_{notification_type}_{window.isoformat()}"
            groups[group_key].append(notification)

        return dict(groups)

    async def _ml_predict_optimal_timing(self, notification: dict[str, Any]) -> int:
        """Predict optimal timing score using ML model."""
        if not self.is_model_trained:
            # Fallback to rule-based scoring
            return await self._calculate_timing_score(notification.get("user_context", {}))

        try:
            features = self._extract_timing_features(notification)
            X = np.array([features])
            X_scaled = self.feature_scaler.transform(X)

            prediction = self.timing_model.predict(X_scaled)[0]
            self.metrics["ml_predictions"] += 1

            return max(0, min(100, int(prediction)))
        except Exception as e:
            logger.error(f"ML prediction failed: {e}")
            return await self._calculate_timing_score(notification.get("user_context", {}))

    def _extract_timing_features(self, data: dict[str, Any]) -> list[float]:
        """Extract features for ML timing model."""
        user_context = data.get("user_context", {})

        # Time-based features
        now = datetime.now()
        hour_of_day = now.hour
        day_of_week = now.weekday()

        # Context features
        location_score = self._encode_location(user_context.get("current_location", "unknown"))
        calendar_score = self._encode_calendar_status(user_context.get("calendar_status", "unknown"))
        energy_score = self._encode_energy_level(user_context.get("energy_level", "medium"))

        # Recent activity features
        recent_notifications = self._count_recent_notifications(
            data.get("user_id"), hours=2
        )

        return [
            hour_of_day,
            day_of_week,
            location_score,
            calendar_score,
            energy_score,
            recent_notifications,
        ]

    def _get_feature_names(self) -> list[str]:
        """Get names of ML model features."""
        return [
            "hour_of_day",
            "day_of_week",
            "location_score",
            "calendar_score",
            "energy_score",
            "recent_notifications",
        ]

    def _encode_location(self, location: str) -> float:
        """Encode location as numerical score."""
        location_scores = {"home": 0.8, "office": 0.6, "commuting": 0.2, "unknown": 0.5}
        return location_scores.get(location, 0.5)

    def _encode_calendar_status(self, status: str) -> float:
        """Encode calendar status as numerical score."""
        status_scores = {"free": 1.0, "busy": 0.4, "in_meeting": 0.0, "unknown": 0.5}
        return status_scores.get(status, 0.5)

    def _encode_energy_level(self, energy: str) -> float:
        """Encode energy level as numerical score."""
        energy_scores = {"low": 0.2, "medium": 0.5, "high": 0.8, "peak": 1.0}
        return energy_scores.get(energy, 0.5)

    def _count_recent_notifications(self, user_id: int | None, hours: int = 1) -> int:
        """Count recent notifications for user."""
        if not user_id or user_id not in self.interaction_history:
            return 0

        cutoff = datetime.now() - timedelta(hours=hours)
        recent = [
            notif for notif in self.interaction_history[user_id]
            if datetime.fromisoformat(notif.get("timestamp", "")) > cutoff
        ]
        return len(recent)

    def _get_timing_window(self, timestamp_str: str | None) -> str:
        """Get timing window for grouping notifications."""
        if not timestamp_str:
            timestamp_str = datetime.now().isoformat()

        dt = datetime.fromisoformat(timestamp_str)
        # Create 15-minute windows
        window = dt.replace(minute=(dt.minute // 15) * 15, second=0, microsecond=0)
        return window.isoformat()

    async def _schedule_batch_notifications(self, notifications: list[dict[str, Any]]) -> int:
        """Schedule notifications based on priority and timing scores."""
        # Sort by priority score (highest first)
        sorted_notifications = sorted(
            notifications,
            key=lambda n: n.get("ml_timing_score", 0),
            reverse=True
        )

        scheduled_count = 0
        for notification in sorted_notifications:
            timing_score = notification.get("ml_timing_score", 0)

            # Only schedule if timing score meets threshold
            if timing_score >= 50:
                await self._queue_notification(notification)
                scheduled_count += 1

        return scheduled_count

    async def _queue_notification(self, notification: dict[str, Any]) -> None:
        """Add notification to processing queue."""
        self.notification_queue.append({
            **notification,
            "queued_at": datetime.now().isoformat(),
        })


class NotificationConflictResolver:
    """Resolve conflicts between multiple notifications."""

    async def resolve_notification_conflicts(
        self, notifications: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Resolve conflicts in notification group."""
        if len(notifications) <= 1:
            return notifications

        # Group by similarity
        similar_groups = self._group_by_similarity(notifications)

        resolved = []
        for group in similar_groups:
            if len(group) == 1:
                resolved.extend(group)
            else:
                # Merge similar notifications
                merged = await self._merge_notifications(group)
                resolved.append(merged)

        return resolved

    def _group_by_similarity(self, notifications: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
        """Group notifications by content similarity."""
        # Simple similarity based on type and keywords
        groups = defaultdict(list)

        for notification in notifications:
            notif_type = notification.get("type", "general")
            content = notification.get("message", "")

            # Create similarity key based on type and content keywords
            keywords = set(content.lower().split()[:3])  # First 3 words
            similarity_key = f"{notif_type}_{hash(frozenset(keywords))}"

            groups[similarity_key].append(notification)

        return list(groups.values())

    async def _merge_notifications(self, notifications: list[dict[str, Any]]) -> dict[str, Any]:
        """Merge similar notifications into one."""
        if not notifications:
            return {}

        # Use the highest priority notification as base
        base = max(notifications, key=lambda n: self._get_priority_value(n.get("priority", "medium")))

        # Merge content
        merged_content = await self._merge_content(notifications)

        return {
            **base,
            "message": merged_content,
            "merged_count": len(notifications),
            "merged_at": datetime.now().isoformat(),
        }

    async def _merge_content(self, notifications: list[dict[str, Any]]) -> str:
        """Merge notification content intelligently."""
        if len(notifications) == 1:
            return notifications[0].get("message", "")

        # For multiple notifications, create a summary
        count = len(notifications)
        first_message = notifications[0].get("message", "")

        if count == 2:
            return f"{first_message} (and 1 more notification)"
        else:
            return f"{first_message} (and {count - 1} more notifications)"

    def _get_priority_value(self, priority: str) -> int:
        """Convert priority string to numerical value."""
        priority_values = {"urgent": 4, "high": 3, "medium": 2, "low": 1}
        return priority_values.get(priority, 2)
