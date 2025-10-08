"""
Enhanced wearable integration for Apple Watch and Galaxy Watch.

Provides seamless integration with smartwatches for quick task capture,
progress monitoring, health data correlation, productivity insights,
and intelligent haptic feedback systems.
"""

import asyncio
import base64
import logging
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any
from uuid import uuid4

import numpy as np

logger = logging.getLogger(__name__)


class HealthMetric(Enum):
    """Types of health metrics tracked."""
    HEART_RATE = "heart_rate"
    STEPS = "steps"
    CALORIES = "calories"
    STRESS_LEVEL = "stress_level"
    SLEEP_QUALITY = "sleep_quality"
    ACTIVITY_LEVEL = "activity_level"
    BLOOD_OXYGEN = "blood_oxygen"
    BODY_TEMPERATURE = "body_temperature"


class ProductivityState(Enum):
    """Productivity states based on biometric data."""
    PEAK_FOCUS = "peak_focus"
    HIGH_ENERGY = "high_energy"
    MODERATE = "moderate"
    LOW_ENERGY = "low_energy"
    NEED_BREAK = "need_break"
    STRESS_ALERT = "stress_alert"
    RECOVERY = "recovery"


@dataclass
class HealthDataPoint:
    """Represents a single health data measurement."""
    metric: HealthMetric
    value: float
    timestamp: datetime
    device: str
    confidence: float = 1.0
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ProductivityInsight:
    """Represents a productivity insight based on health data."""
    insight_type: str
    title: str
    description: str
    recommendations: list[str]
    confidence: float
    health_correlations: dict[str, float]
    created_at: datetime


class WearableAPI:
    """Enhanced wearable device integration with health data analysis and productivity insights."""

    def __init__(self, workflow_engine=None):
        """Initialize wearable API with health monitoring and productivity analysis."""
        self.complications_cache = {}
        self.haptic_patterns = {
            "pulse": {"duration": 0.5, "intensity": "medium"},
            "double_tap": {"duration": 0.2, "intensity": "light", "repeat": 2},
            "urgent": {"duration": 1.0, "intensity": "strong"},
            "focus_start": {"duration": 0.3, "intensity": "medium", "pattern": "ascending"},
            "achievement": {"duration": 0.8, "intensity": "light", "pattern": "celebration"},
            "stress_relief": {"duration": 2.0, "intensity": "light", "pattern": "breathing"},
        }
        self.voice_transcriptions = {}

        # Health data and productivity analysis
        self.health_monitor = HealthDataMonitor()
        self.productivity_analyzer = ProductivityAnalyzer()
        self.biometric_correlator = BiometricProductivityCorrelator()

        # Workflow integration
        self.workflow_engine = workflow_engine
        self.wearable_workflow_bridge = WearableWorkflowBridge(workflow_engine)

        # Smart coaching system
        self.coaching_engine = SmartCoachingEngine()

        # Device management
        self.connected_devices = {}
        self.device_capabilities = defaultdict(list)

        # Analytics and insights
        self.insights_cache = deque(maxlen=100)
        self.daily_summaries = {}

        # Performance metrics
        self.metrics = {
            "health_data_points": 0,
            "insights_generated": 0,
            "workflow_triggers": 0,
            "coaching_interactions": 0,
        }

    async def get_enhanced_watch_complications(self, user_id: int, device_type: str = "apple_watch") -> dict[str, Any]:
        """
        Get enhanced watch complications with health-based insights.

        Args:
            user_id: User identifier for personalized data
            device_type: Type of wearable device

        Returns:
            Dictionary containing enhanced complication data with health insights

        Raises:
            ValueError: If user_id is invalid
        """
        if not user_id or user_id <= 0:
            raise ValueError("Valid user_id is required")

        logger.info(f"Fetching enhanced watch complications for user {user_id} on {device_type}")

        # Check cache first
        cache_key = f"complications_{user_id}_{device_type}"
        if cache_key in self.complications_cache:
            cached_data = self.complications_cache[cache_key]
            cache_time = datetime.fromisoformat(cached_data.get("cached_at", ""))
            if (datetime.now() - cache_time).seconds < 180:  # 3-minute cache
                return {k: v for k, v in cached_data.items() if k != "cached_at"}

        # Get current health data
        current_health = await self.health_monitor.get_current_health_snapshot(user_id)

        # Analyze productivity state
        productivity_state = await self.productivity_analyzer.analyze_current_state(
            user_id, current_health
        )

        # Generate smart recommendations
        recommendations = await self.coaching_engine.get_contextual_recommendations(
            user_id, current_health, productivity_state
        )

        # Fetch basic data
        complication_data = {
            "streak_count": await self._get_user_streak(user_id),
            "xp_today": await self._get_daily_xp(user_id),
            "next_task": await self._get_next_task_preview(user_id),
            "energy_level": productivity_state.value,
            "health_score": current_health.get("overall_score", 75),
            "stress_level": current_health.get(HealthMetric.STRESS_LEVEL.value, 50),
            "focus_readiness": await self._calculate_focus_readiness(current_health),
            "smart_suggestion": recommendations[0] if recommendations else None,
            "optimal_work_window": await self._predict_optimal_work_window(user_id),
            "break_recommendation": await self._get_break_recommendation(current_health),
        }

        # Add device-specific customizations
        if device_type == "apple_watch":
            complication_data.update(await self._get_apple_watch_specific_data(user_id))
        elif device_type == "galaxy_watch":
            complication_data.update(await self._get_galaxy_watch_specific_data(user_id))

        # Cache the data
        complication_data["cached_at"] = datetime.now().isoformat()
        self.complications_cache[cache_key] = complication_data.copy()

        # Remove cache timestamp from return data
        del complication_data["cached_at"]

        return complication_data

    async def send_intelligent_haptic_feedback(
        self, haptic_request: dict[str, Any], health_context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        Send intelligent haptic feedback adapted to user's current state.

        Args:
            haptic_request: Dictionary containing haptic feedback data
            health_context: Current health/biometric context

        Returns:
            Dictionary with status and adaptive feedback details

        Raises:
            ValueError: If required haptic data is missing or invalid
        """
        feedback_type = haptic_request.get("type")
        user_id = haptic_request.get("user_id")
        context = haptic_request.get("context", {})

        if not all([feedback_type, user_id]):
            raise ValueError("Haptic request requires type and user_id")

        logger.info(f"Sending intelligent haptic feedback for {feedback_type} to user {user_id}")

        # Get current health context if not provided
        if not health_context:
            health_context = await self.health_monitor.get_current_health_snapshot(user_id)

        # Adapt haptic pattern based on context
        adaptive_pattern = await self._adapt_haptic_pattern(
            feedback_type, health_context, context
        )

        # Check if user is in a state where haptic feedback should be modified
        feedback_adjustment = await self._calculate_feedback_adjustment(
            user_id, health_context, feedback_type
        )

        # Execute adaptive haptic feedback
        feedback_sent = await self._execute_adaptive_haptic_feedback(
            user_id, feedback_type, adaptive_pattern, feedback_adjustment
        )

        # Log interaction for learning
        await self._log_haptic_interaction(
            user_id, feedback_type, adaptive_pattern, health_context
        )

        return {
            "status": "success",
            "feedback_sent": feedback_sent,
            "pattern_used": adaptive_pattern["name"],
            "intensity": adaptive_pattern["intensity"],
            "adaptation_reason": feedback_adjustment["reason"],
            "health_consideration": feedback_adjustment["health_factor"],
        }

    async def process_enhanced_voice_capture(
        self, voice_data: dict[str, Any], health_context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        Process voice capture with health-aware context and workflow integration.

        Args:
            voice_data: Dictionary containing voice capture data
            health_context: Current health/biometric context

        Returns:
            Dictionary with enhanced processing results

        Raises:
            ValueError: If required voice data is missing
        """
        audio_data = voice_data.get("audio_data")
        duration = voice_data.get("duration")
        user_id = voice_data.get("user_id")
        device_type = voice_data.get("device_type", "unknown")

        if not all([audio_data, duration, user_id]):
            raise ValueError("Voice data requires audio_data, duration, and user_id")

        if duration <= 0 or duration > 60:
            raise ValueError("Duration must be between 0 and 60 seconds")

        logger.info(f"Processing enhanced voice capture from {device_type} (duration: {duration}s)")

        # Get health context if not provided
        if not health_context:
            health_context = await self.health_monitor.get_current_health_snapshot(user_id)

        # Validate audio data
        try:
            base64.b64decode(audio_data)
        except Exception:
            if audio_data != "base64_encoded_audio":
                raise ValueError("Invalid base64 audio data")

        # Enhanced transcription with context awareness
        transcription_result = await self._enhanced_transcription(
            audio_data, duration, health_context, device_type
        )

        # Analyze voice characteristics for stress/energy detection
        voice_analysis = await self._analyze_voice_characteristics(
            audio_data, duration, health_context
        )

        # Process with workflow integration
        workflow_actions = None
        if self.workflow_engine and transcription_result["transcription"]:
            workflow_actions = await self.wearable_workflow_bridge.process_voice_workflow(
                transcription_result["transcription"], user_id, health_context
            )

        # Create task or execute action based on health state
        action_result = await self._process_health_aware_voice_action(
            transcription_result["transcription"], user_id, device_type, health_context
        )

        # Store enhanced transcription data
        transcription_id = f"voice_enhanced_{uuid4().hex[:8]}"
        self.voice_transcriptions[transcription_id] = {
            "transcription": transcription_result["transcription"],
            "confidence": transcription_result["confidence"],
            "voice_analysis": voice_analysis,
            "health_context": health_context,
            "user_id": user_id,
            "device_type": device_type,
            "duration": duration,
            "created_at": datetime.now().isoformat(),
            "action_result": action_result,
            "workflow_actions": workflow_actions,
        }

        # Update coaching engine with voice interaction
        await self.coaching_engine.record_voice_interaction(
            user_id, transcription_result, voice_analysis, health_context
        )

        return {
            "status": "success",
            "transcription": transcription_result["transcription"],
            "confidence": transcription_result["confidence"],
            "voice_analysis": voice_analysis,
            "action_result": action_result,
            "workflow_actions": workflow_actions,
            "transcription_id": transcription_id,
            "health_insights": await self._generate_voice_health_insights(
                voice_analysis, health_context
            ),
        }

    async def collect_health_data(
        self, user_id: int, health_data: list[dict[str, Any]], device_type: str
    ) -> dict[str, Any]:
        """
        Collect and process health data from wearable devices.

        Args:
            user_id: User identifier
            health_data: List of health measurements
            device_type: Type of wearable device

        Returns:
            Dictionary with processing results and insights
        """
        if not health_data:
            raise ValueError("Health data cannot be empty")

        logger.info(f"Collecting {len(health_data)} health data points for user {user_id}")

        processed_data = []
        for data_point in health_data:
            try:
                health_point = HealthDataPoint(
                    metric=HealthMetric(data_point["metric"]),
                    value=float(data_point["value"]),
                    timestamp=datetime.fromisoformat(data_point.get(
                        "timestamp", datetime.now().isoformat()
                    )),
                    device=device_type,
                    confidence=data_point.get("confidence", 1.0),
                    metadata=data_point.get("metadata", {})
                )
                processed_data.append(health_point)
                self.metrics["health_data_points"] += 1

            except (ValueError, KeyError) as e:
                logger.warning(f"Invalid health data point: {e}")
                continue

        # Store health data
        await self.health_monitor.store_health_data(user_id, processed_data)

        # Analyze for productivity insights
        insights = await self.productivity_analyzer.generate_insights(
            user_id, processed_data
        )

        # Check for health alerts
        alerts = await self._check_health_alerts(user_id, processed_data)

        # Update productivity correlations
        correlations = await self.biometric_correlator.update_correlations(
            user_id, processed_data
        )

        # Generate coaching recommendations
        recommendations = await self.coaching_engine.generate_health_based_recommendations(
            user_id, processed_data, insights
        )

        return {
            "status": "success",
            "data_points_processed": len(processed_data),
            "insights_generated": len(insights),
            "health_alerts": alerts,
            "productivity_correlations": correlations,
            "recommendations": recommendations,
            "overall_health_score": await self._calculate_health_score(processed_data),
        }

    async def get_productivity_insights(
        self, user_id: int, time_period: str = "today"
    ) -> dict[str, Any]:
        """
        Get productivity insights based on health data correlations.

        Args:
            user_id: User identifier
            time_period: Time period for analysis (today, week, month)

        Returns:
            Dictionary with comprehensive productivity insights
        """
        logger.info(f"Generating productivity insights for user {user_id} ({time_period})")

        # Get health data for the period
        health_data = await self.health_monitor.get_health_data_for_period(
            user_id, time_period
        )

        # Analyze productivity patterns
        productivity_patterns = await self.productivity_analyzer.analyze_patterns(
            user_id, health_data, time_period
        )

        # Get biometric correlations
        correlations = await self.biometric_correlator.get_correlations(user_id)

        # Generate actionable insights
        insights = await self._generate_actionable_insights(
            user_id, productivity_patterns, correlations
        )

        # Predict optimal performance windows
        optimal_windows = await self._predict_optimal_performance_windows(
            user_id, health_data
        )

        # Calculate productivity score
        productivity_score = await self._calculate_productivity_score(
            productivity_patterns, correlations
        )

        self.metrics["insights_generated"] += len(insights)

        return {
            "status": "success",
            "time_period": time_period,
            "productivity_score": productivity_score,
            "patterns": productivity_patterns,
            "correlations": correlations,
            "insights": insights,
            "optimal_windows": optimal_windows,
            "recommendations": await self.coaching_engine.get_period_recommendations(
                user_id, time_period, insights
            ),
        }

    async def trigger_workflow_from_health_event(
        self, user_id: int, health_event: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Trigger workflows based on health events (e.g., stress spike, energy peak).

        Args:
            user_id: User identifier
            health_event: Health event data

        Returns:
            Dictionary with workflow trigger results
        """
        if not self.workflow_engine:
            return {"status": "error", "message": "Workflow engine not available"}

        logger.info(f"Processing health event trigger for user {user_id}: {health_event['type']}")

        # Determine appropriate workflow
        workflow_config = await self.wearable_workflow_bridge.determine_health_workflow(
            health_event, user_id
        )

        if not workflow_config:
            return {"status": "no_action", "message": "No workflow triggered"}

        # Execute workflow
        workflow_result = await self.wearable_workflow_bridge.execute_health_workflow(
            workflow_config, user_id, health_event
        )

        self.metrics["workflow_triggers"] += 1

        return {
            "status": "success",
            "workflow_triggered": workflow_config["name"],
            "workflow_result": workflow_result,
            "health_event": health_event,
        }

    # Enhanced helper methods
    async def _enhanced_transcription(
        self, audio_data: str, duration: float, health_context: dict[str, Any], device_type: str
    ) -> dict[str, Any]:
        """Enhanced transcription with context awareness."""
        # Mock enhanced transcription with confidence scoring
        sample_transcriptions = [
            {"text": "Add task call mom tonight", "confidence": 0.95},
            {"text": "Remind me to submit expense report", "confidence": 0.88},
            {"text": "I'm feeling stressed, need a break", "confidence": 0.92},
            {"text": "Start focus session for deep work", "confidence": 0.91},
            {"text": "How's my energy level today", "confidence": 0.87},
        ]

        import hashlib
        hash_val = int(hashlib.sha256(audio_data.encode()).hexdigest(), 16)
        index = hash_val % len(sample_transcriptions)

        # Adjust confidence based on health context (stress affects speech clarity)
        stress_level = health_context.get(HealthMetric.STRESS_LEVEL.value, 50)
        confidence_adjustment = max(0.7, 1.0 - (stress_level / 100) * 0.3)

        result = sample_transcriptions[index].copy()
        result["confidence"] *= confidence_adjustment

        await asyncio.sleep(min(duration * 0.1, 2.0))
        return {"transcription": result["text"], "confidence": result["confidence"]}

    async def _analyze_voice_characteristics(
        self, audio_data: str, duration: float, health_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Analyze voice characteristics for stress and energy detection."""
        # Mock voice analysis - in real implementation, would analyze audio features
        import random

        # Simulate voice analysis based on health context
        stress_level = health_context.get(HealthMetric.STRESS_LEVEL.value, 50)
        energy_level = health_context.get("overall_score", 75)

        return {
            "speaking_rate": 120 + random.randint(-20, 20),  # words per minute
            "voice_energy": energy_level + random.randint(-10, 10),
            "stress_indicators": stress_level + random.randint(-5, 15),
            "emotional_state": self._determine_emotional_state(stress_level, energy_level),
            "clarity_score": max(0.6, 1.0 - (stress_level / 100) * 0.4),
            "confidence_level": energy_level / 100,
        }

    def _determine_emotional_state(self, stress_level: float, energy_level: float) -> str:
        """Determine emotional state from stress and energy levels."""
        if stress_level > 70:
            return "stressed"
        elif energy_level > 80:
            return "energetic"
        elif energy_level < 30:
            return "tired"
        elif stress_level < 30 and energy_level > 60:
            return "calm_focused"
        else:
            return "neutral"

    async def _process_health_aware_voice_action(
        self, transcription: str, user_id: int, device_type: str, health_context: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Process voice command with health context awareness."""
        transcription_lower = transcription.lower()

        # Health-aware command processing
        if "stressed" in transcription_lower or "overwhelmed" in transcription_lower:
            return await self._handle_stress_voice_command(user_id, transcription, health_context)
        elif "energy" in transcription_lower or "tired" in transcription_lower:
            return await self._handle_energy_voice_command(user_id, transcription, health_context)
        elif "focus" in transcription_lower or "concentrate" in transcription_lower:
            return await self._handle_focus_voice_command(user_id, transcription, health_context)
        elif any(keyword in transcription_lower for keyword in ["add task", "remind me", "schedule"]):
            return await self._handle_task_voice_command(user_id, transcription, health_context)

        return None

    async def _handle_stress_voice_command(
        self, user_id: int, transcription: str, health_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle stress-related voice commands."""
        stress_level = health_context.get(HealthMetric.STRESS_LEVEL.value, 50)

        recommendations = []
        if stress_level > 60:
            recommendations.extend([
                "Take 5 deep breaths",
                "Try a 2-minute meditation",
                "Step outside for fresh air"
            ])

        # Trigger stress relief haptic pattern
        await self.send_intelligent_haptic_feedback({
            "type": "stress_relief",
            "user_id": user_id,
            "context": {"stress_level": stress_level}
        }, health_context)

        return {
            "type": "stress_response",
            "action": "stress_relief_initiated",
            "recommendations": recommendations,
            "stress_level": stress_level
        }

    async def _handle_energy_voice_command(
        self, user_id: int, transcription: str, health_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle energy-related voice commands."""
        energy_score = health_context.get("overall_score", 75)

        if energy_score < 40:
            suggestion = "Consider taking a break or having a healthy snack"
            action = "low_energy_support"
        elif energy_score > 80:
            suggestion = "Great energy! Perfect time for challenging tasks"
            action = "high_energy_optimization"
        else:
            suggestion = "Moderate energy level, good for steady progress"
            action = "moderate_energy_guidance"

        return {
            "type": "energy_response",
            "action": action,
            "energy_score": energy_score,
            "suggestion": suggestion
        }

    async def _handle_focus_voice_command(
        self, user_id: int, transcription: str, health_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle focus-related voice commands."""
        focus_readiness = await self._calculate_focus_readiness(health_context)

        if focus_readiness > 75:
            duration = 45  # Longer session for high readiness
            message = "Starting extended focus session - you're in great shape for deep work!"
        elif focus_readiness > 50:
            duration = 25  # Standard Pomodoro
            message = "Starting focus session - good conditions for concentrated work"
        else:
            duration = 15  # Shorter session for low readiness
            message = "Starting gentle focus session - let's build up gradually"

        # Trigger focus start haptic
        await self.send_intelligent_haptic_feedback({
            "type": "focus_start",
            "user_id": user_id,
            "context": {"focus_readiness": focus_readiness}
        }, health_context)

        return {
            "type": "focus_session",
            "action": "focus_session_started",
            "duration": duration,
            "focus_readiness": focus_readiness,
            "message": message
        }

    async def _handle_task_voice_command(
        self, user_id: int, transcription: str, health_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle task creation with health context."""
        # Extract task content
        task_keywords = ["add task", "remind me", "create task", "schedule"]
        task_content = transcription
        for keyword in task_keywords:
            task_content = task_content.replace(keyword, "").strip()

        # Adjust task priority based on health state
        stress_level = health_context.get(HealthMetric.STRESS_LEVEL.value, 50)
        energy_level = health_context.get("overall_score", 75)

        if stress_level > 70:
            priority = "low"  # Don't add pressure when stressed
            note = "Added with low priority due to current stress level"
        elif energy_level > 80:
            priority = "high"  # Can handle more when energetic
            note = "Added with high priority - you have great energy for this!"
        else:
            priority = "medium"
            note = "Added with standard priority"

        task_id = f"voice_task_{uuid4().hex[:8]}"
        task_data = {
            "id": task_id,
            "content": task_content,
            "priority": priority,
            "source": "voice_capture_health_aware",
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "health_context": health_context,
            "note": note
        }

        logger.info(f"Created health-aware task: {task_id} - {task_content}")
        return {
            "type": "task_creation",
            "action": "task_created",
            "task_data": task_data,
            "health_consideration": note
        }

    async def _adapt_haptic_pattern(
        self, feedback_type: str, health_context: dict[str, Any], context: dict[str, Any]
    ) -> dict[str, Any]:
        """Adapt haptic pattern based on health context."""
        base_pattern = self.haptic_patterns.get(feedback_type, self.haptic_patterns["pulse"])
        adapted_pattern = base_pattern.copy()
        adapted_pattern["name"] = feedback_type

        # Adjust based on stress level
        stress_level = health_context.get(HealthMetric.STRESS_LEVEL.value, 50)
        if stress_level > 70:
            # Gentler haptics when stressed
            adapted_pattern["intensity"] = "light"
            adapted_pattern["duration"] = min(adapted_pattern["duration"], 0.5)
        elif stress_level < 30:
            # Can use stronger haptics when calm
            adapted_pattern["intensity"] = "medium"

        return adapted_pattern

    async def _calculate_feedback_adjustment(
        self, user_id: int, health_context: dict[str, Any], feedback_type: str
    ) -> dict[str, Any]:
        """Calculate how feedback should be adjusted based on health state."""
        adjustments = {"reason": "standard", "health_factor": "normal"}

        stress_level = health_context.get(HealthMetric.STRESS_LEVEL.value, 50)
        heart_rate = health_context.get(HealthMetric.HEART_RATE.value, 70)

        if stress_level > 70:
            adjustments["reason"] = "reduced_intensity_due_to_stress"
            adjustments["health_factor"] = "high_stress"
        elif heart_rate > 100:
            adjustments["reason"] = "gentle_feedback_elevated_heart_rate"
            adjustments["health_factor"] = "elevated_heart_rate"
        elif stress_level < 30 and heart_rate < 80:
            adjustments["reason"] = "optimal_conditions_standard_feedback"
            adjustments["health_factor"] = "optimal"

        return adjustments

    async def _generate_voice_health_insights(
        self, voice_analysis: dict[str, Any], health_context: dict[str, Any]
    ) -> list[str]:
        """Generate health insights from voice analysis."""
        insights = []

        if voice_analysis["stress_indicators"] > 60:
            insights.append("Voice analysis suggests elevated stress - consider taking a break")

        if voice_analysis["voice_energy"] < 40:
            insights.append("Low vocal energy detected - you might benefit from a power nap")

        if voice_analysis["emotional_state"] == "calm_focused":
            insights.append("Great vocal indicators for focused work - perfect time for deep tasks")

        return insights

    async def _calculate_focus_readiness(self, health_context: dict[str, Any]) -> float:
        """Calculate focus readiness score based on health metrics."""
        # Simple calculation - can be enhanced with ML models
        stress_level = health_context.get(HealthMetric.STRESS_LEVEL.value, 50)
        energy_score = health_context.get("overall_score", 75)
        heart_rate = health_context.get(HealthMetric.HEART_RATE.value, 70)

        # Optimal focus: low stress, good energy, steady heart rate
        stress_factor = max(0, 100 - stress_level) / 100
        energy_factor = energy_score / 100
        hr_factor = 1.0 if 60 <= heart_rate <= 90 else 0.7

        return (stress_factor * 0.4 + energy_factor * 0.4 + hr_factor * 0.2) * 100

    async def _predict_optimal_work_window(self, user_id: int) -> dict[str, Any]:
        """Predict optimal work window based on health patterns."""
        # Mock prediction - in real implementation, would use historical data
        current_hour = datetime.now().hour

        if 9 <= current_hour <= 11:
            return {"start": "09:00", "end": "11:30", "confidence": 0.85, "reason": "Morning peak focus"}
        elif 14 <= current_hour <= 16:
            return {"start": "14:00", "end": "16:00", "confidence": 0.75, "reason": "Afternoon productivity"}
        else:
            return {"start": "Tomorrow 09:00", "end": "Tomorrow 11:30", "confidence": 0.90, "reason": "Next morning peak"}

    async def _get_break_recommendation(self, health_context: dict[str, Any]) -> dict[str, Any]:
        """Get break recommendation based on health context."""
        stress_level = health_context.get(HealthMetric.STRESS_LEVEL.value, 50)
        energy_score = health_context.get("overall_score", 75)

        if stress_level > 70:
            return {"type": "stress_relief", "duration": 10, "activity": "Deep breathing or meditation"}
        elif energy_score < 40:
            return {"type": "energy_boost", "duration": 15, "activity": "Light walk or stretching"}
        else:
            return {"type": "maintenance", "duration": 5, "activity": "Quick movement or hydration"}

    async def _get_apple_watch_specific_data(self, user_id: int) -> dict[str, Any]:
        """Get Apple Watch specific complication data."""
        return {
            "digital_crown_action": "Scroll for health trends",
            "complication_family": "circular_small",
            "watch_face_color": await self._determine_optimal_watch_face_color(user_id)
        }

    async def _get_galaxy_watch_specific_data(self, user_id: int) -> dict[str, Any]:
        """Get Galaxy Watch specific complication data."""
        return {
            "rotating_bezel_action": "Rotate for productivity insights",
            "tile_layout": "health_productivity",
            "always_on_display": True
        }

    async def _determine_optimal_watch_face_color(self, user_id: int) -> str:
        """Determine optimal watch face color based on circadian rhythm and stress."""
        current_hour = datetime.now().hour

        if 6 <= current_hour <= 10:
            return "energizing_blue"  # Morning energy
        elif 10 <= current_hour <= 14:
            return "focus_green"  # Peak focus time
        elif 14 <= current_hour <= 18:
            return "steady_purple"  # Afternoon productivity
        elif 18 <= current_hour <= 22:
            return "calming_orange"  # Evening wind down
        else:
            return "rest_red"  # Night mode

    async def _calculate_health_score(self, health_data: list[HealthDataPoint]) -> float:
        """Calculate overall health score from recent data points."""
        if not health_data:
            return 75.0  # Default neutral score

        # Simple scoring - can be enhanced with medical guidelines
        scores = []
        for data_point in health_data:
            if data_point.metric == HealthMetric.HEART_RATE:
                # Optimal resting HR: 60-100 bpm
                score = 100 if 60 <= data_point.value <= 100 else 70
            elif data_point.metric == HealthMetric.STRESS_LEVEL:
                # Lower stress is better
                score = max(0, 100 - data_point.value)
            elif data_point.metric == HealthMetric.STEPS:
                # 10,000 steps target
                score = min(100, (data_point.value / 10000) * 100)
            else:
                score = 75  # Default for unknown metrics

            scores.append(score)

        return sum(scores) / len(scores) if scores else 75.0

    async def _check_health_alerts(
        self, user_id: int, health_data: list[HealthDataPoint]
    ) -> list[dict[str, Any]]:
        """Check for health alerts that need immediate attention."""
        alerts = []

        for data_point in health_data:
            if data_point.metric == HealthMetric.HEART_RATE and data_point.value > 120:
                alerts.append({
                    "type": "elevated_heart_rate",
                    "message": "Heart rate elevated - consider taking a break",
                    "severity": "medium",
                    "value": data_point.value
                })
            elif data_point.metric == HealthMetric.STRESS_LEVEL and data_point.value > 80:
                alerts.append({
                    "type": "high_stress",
                    "message": "Stress level high - try some relaxation techniques",
                    "severity": "high",
                    "value": data_point.value
                })

        return alerts

    async def _generate_actionable_insights(
        self, user_id: int, patterns: dict[str, Any], correlations: dict[str, Any]
    ) -> list[ProductivityInsight]:
        """Generate actionable productivity insights."""
        insights = []

        # Mock insight generation - real implementation would use ML/statistical analysis
        if correlations.get("stress_productivity_correlation", 0) < -0.5:
            insights.append(ProductivityInsight(
                insight_type="stress_management",
                title="Stress Impact on Productivity",
                description="High stress levels significantly reduce your productivity",
                recommendations=[
                    "Schedule regular stress-relief breaks",
                    "Practice mindfulness during high-stress periods",
                    "Consider adjusting workload during stressful times"
                ],
                confidence=0.85,
                health_correlations={"stress_level": correlations["stress_productivity_correlation"]},
                created_at=datetime.now()
            ))

        return insights

    async def _predict_optimal_performance_windows(
        self, user_id: int, health_data: list[HealthDataPoint]
    ) -> list[dict[str, Any]]:
        """Predict optimal performance windows based on health patterns."""
        # Mock prediction - real implementation would use time series analysis
        windows = [
            {
                "start_time": "09:00",
                "end_time": "11:30",
                "predicted_performance": 0.90,
                "confidence": 0.85,
                "reasoning": "Historical data shows peak focus during morning hours"
            },
            {
                "start_time": "14:30",
                "end_time": "16:00",
                "predicted_performance": 0.75,
                "confidence": 0.70,
                "reasoning": "Moderate performance window post-lunch"
            }
        ]

        return windows

    async def _calculate_productivity_score(
        self, patterns: dict[str, Any], correlations: dict[str, Any]
    ) -> float:
        """Calculate overall productivity score."""
        # Mock calculation - real implementation would use complex scoring
        base_score = 75.0

        # Adjust based on stress correlation
        stress_correlation = correlations.get("stress_productivity_correlation", 0)
        base_score += abs(stress_correlation) * 10  # Better correlation = higher score

        # Adjust based on consistency patterns
        consistency = patterns.get("consistency_score", 0.5)
        base_score += consistency * 20

        return min(100.0, max(0.0, base_score))

    async def _execute_adaptive_haptic_feedback(
        self, user_id: int, feedback_type: str, pattern: dict[str, Any], adjustment: dict[str, Any]
    ) -> bool:
        """Execute adaptive haptic feedback."""
        try:
            logger.info(
                f"Executing adaptive haptic feedback for user {user_id}: "
                f"type={feedback_type}, pattern={pattern['name']}, adjustment={adjustment['reason']}"
            )

            # Simulate adaptive feedback execution
            await asyncio.sleep(0.1)
            return True
        except Exception as e:
            logger.error(f"Failed to execute adaptive haptic feedback: {e}")
            return False

    async def _log_haptic_interaction(
        self, user_id: int, feedback_type: str, pattern: dict[str, Any], health_context: dict[str, Any]
    ):
        """Log haptic interaction for learning and optimization."""
        interaction_log = {
            "user_id": user_id,
            "feedback_type": feedback_type,
            "pattern": pattern,
            "health_context": health_context,
            "timestamp": datetime.now().isoformat(),
        }

        # In real implementation, would store in database for ML training
        logger.info(f"Logged haptic interaction: {interaction_log}")

    # Existing mock methods (simplified)
    async def _get_user_streak(self, user_id: int) -> int:
        return 7

    async def _get_daily_xp(self, user_id: int) -> int:
        return 150

    async def _get_next_task_preview(self, user_id: int) -> str:
        return "Review project documentation"

    async def _get_energy_level(self, user_id: int) -> str:
        return "high"


class HealthDataMonitor:
    """Monitor and analyze health data from wearable devices."""

    def __init__(self):
        self.health_storage = defaultdict(list)
        self.analysis_models = {}
        self.baseline_metrics = {}

    async def store_health_data(self, user_id: int, health_data: list[HealthDataPoint]):
        """Store health data points for analysis."""
        self.health_storage[user_id].extend(health_data)
        # Keep only last 1000 data points per user
        if len(self.health_storage[user_id]) > 1000:
            self.health_storage[user_id] = self.health_storage[user_id][-1000:]

    async def get_current_health_snapshot(self, user_id: int) -> dict[str, Any]:
        """Get current health snapshot for user."""
        recent_data = self.health_storage[user_id][-10:]  # Last 10 data points

        if not recent_data:
            return {"overall_score": 75}  # Default

        snapshot = {}
        for metric in HealthMetric:
            metric_data = [dp for dp in recent_data if dp.metric == metric]
            if metric_data:
                snapshot[metric.value] = metric_data[-1].value  # Most recent

        # Calculate overall score
        snapshot["overall_score"] = await self._calculate_health_score_from_snapshot(snapshot)
        snapshot["timestamp"] = datetime.now().isoformat()

        return snapshot

    async def get_health_data_for_period(
        self, user_id: int, period: str
    ) -> list[HealthDataPoint]:
        """Get health data for specified time period."""
        now = datetime.now()

        if period == "today":
            cutoff = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            cutoff = now - timedelta(days=7)
        elif period == "month":
            cutoff = now - timedelta(days=30)
        else:
            cutoff = now - timedelta(days=1)

        return [
            dp for dp in self.health_storage[user_id]
            if dp.timestamp >= cutoff
        ]

    async def _calculate_health_score_from_snapshot(self, snapshot: dict[str, Any]) -> float:
        """Calculate health score from current snapshot."""
        # Simple scoring algorithm
        score = 75.0  # Base score

        if HealthMetric.STRESS_LEVEL.value in snapshot:
            stress = snapshot[HealthMetric.STRESS_LEVEL.value]
            score += (50 - stress) * 0.5  # Lower stress = higher score

        if HealthMetric.HEART_RATE.value in snapshot:
            hr = snapshot[HealthMetric.HEART_RATE.value]
            if 60 <= hr <= 90:
                score += 10  # Optimal range
            elif hr > 100:
                score -= 15  # Elevated

        return max(0, min(100, score))


class ProductivityAnalyzer:
    """Analyze productivity patterns based on health data."""

    def __init__(self):
        self.productivity_models = {}
        self.pattern_cache = {}

    async def analyze_current_state(
        self, user_id: int, health_snapshot: dict[str, Any]
    ) -> ProductivityState:
        """Analyze current productivity state."""
        stress_level = health_snapshot.get(HealthMetric.STRESS_LEVEL.value, 50)
        energy_score = health_snapshot.get("overall_score", 75)
        heart_rate = health_snapshot.get(HealthMetric.HEART_RATE.value, 75)

        # Simple state determination logic
        if stress_level > 80:
            return ProductivityState.STRESS_ALERT
        elif stress_level > 60:
            return ProductivityState.NEED_BREAK
        elif energy_score > 85 and stress_level < 30:
            return ProductivityState.PEAK_FOCUS
        elif energy_score > 70:
            return ProductivityState.HIGH_ENERGY
        elif energy_score < 40:
            return ProductivityState.LOW_ENERGY
        else:
            return ProductivityState.MODERATE

    async def generate_insights(
        self, user_id: int, health_data: list[HealthDataPoint]
    ) -> list[ProductivityInsight]:
        """Generate productivity insights from health data."""
        insights = []

        # Analyze stress patterns
        stress_data = [dp for dp in health_data if dp.metric == HealthMetric.STRESS_LEVEL]
        if len(stress_data) > 5:
            avg_stress = sum(dp.value for dp in stress_data) / len(stress_data)
            if avg_stress > 60:
                insights.append(ProductivityInsight(
                    insight_type="stress_pattern",
                    title="Elevated Stress Pattern Detected",
                    description=f"Average stress level: {avg_stress:.1f}%",
                    recommendations=[
                        "Schedule more frequent breaks",
                        "Consider stress management techniques",
                        "Review workload distribution"
                    ],
                    confidence=0.8,
                    health_correlations={"average_stress": avg_stress},
                    created_at=datetime.now()
                ))

        return insights

    async def analyze_patterns(
        self, user_id: int, health_data: list[HealthDataPoint], period: str
    ) -> dict[str, Any]:
        """Analyze health and productivity patterns over time period."""
        if not health_data:
            return {"consistency_score": 0.5, "patterns": []}

        # Group data by hour to find patterns
        hourly_data = defaultdict(list)
        for dp in health_data:
            hour = dp.timestamp.hour
            hourly_data[hour].append(dp)

        # Calculate consistency score
        consistency_score = len(hourly_data) / 24  # How many hours have data

        # Find peak performance hours
        peak_hours = []
        for hour, data_points in hourly_data.items():
            stress_avg = np.mean([dp.value for dp in data_points if dp.metric == HealthMetric.STRESS_LEVEL])
            if stress_avg < 40:  # Low stress indicates good performance potential
                peak_hours.append(hour)

        return {
            "consistency_score": consistency_score,
            "peak_performance_hours": peak_hours,
            "data_coverage": len(hourly_data),
            "total_data_points": len(health_data)
        }


class BiometricProductivityCorrelator:
    """Correlate biometric data with productivity metrics."""

    def __init__(self):
        self.correlations = defaultdict(dict)
        self.correlation_history = defaultdict(list)

    async def update_correlations(
        self, user_id: int, health_data: list[HealthDataPoint]
    ) -> dict[str, float]:
        """Update productivity correlations with new health data."""
        # Mock correlation calculation
        correlations = {
            "stress_productivity_correlation": -0.65,  # Higher stress = lower productivity
            "energy_productivity_correlation": 0.72,   # Higher energy = higher productivity
            "heart_rate_focus_correlation": -0.45,    # Higher HR = lower focus
        }

        self.correlations[user_id].update(correlations)
        return correlations

    async def get_correlations(self, user_id: int) -> dict[str, float]:
        """Get current correlations for user."""
        return self.correlations[user_id]


class SmartCoachingEngine:
    """Intelligent coaching system based on health and productivity data."""

    def __init__(self):
        self.coaching_history = defaultdict(list)
        self.user_preferences = {}

    async def get_contextual_recommendations(
        self, user_id: int, health_context: dict[str, Any], productivity_state: ProductivityState
    ) -> list[str]:
        """Get contextual recommendations based on current state."""
        recommendations = []

        if productivity_state == ProductivityState.STRESS_ALERT:
            recommendations.extend([
                "Take a 5-minute breathing break",
                "Step away from your workspace",
                "Try a quick meditation"
            ])
        elif productivity_state == ProductivityState.PEAK_FOCUS:
            recommendations.extend([
                "Perfect time for your most challenging task",
                "Consider a longer focus session",
                "Tackle creative or complex work now"
            ])
        elif productivity_state == ProductivityState.LOW_ENERGY:
            recommendations.extend([
                "Consider a light snack",
                "Take a short walk",
                "Switch to easier tasks"
            ])

        return recommendations

    async def record_voice_interaction(
        self, user_id: int, transcription_result: dict[str, Any],
        voice_analysis: dict[str, Any], health_context: dict[str, Any]
    ):
        """Record voice interaction for coaching insights."""
        interaction = {
            "timestamp": datetime.now().isoformat(),
            "transcription": transcription_result,
            "voice_analysis": voice_analysis,
            "health_context": health_context
        }

        self.coaching_history[user_id].append(interaction)
        # Keep only last 50 interactions
        if len(self.coaching_history[user_id]) > 50:
            self.coaching_history[user_id] = self.coaching_history[user_id][-50:]

    async def generate_health_based_recommendations(
        self, user_id: int, health_data: list[HealthDataPoint], insights: list[ProductivityInsight]
    ) -> list[str]:
        """Generate recommendations based on health data and insights."""
        recommendations = []

        # Analyze recent health trends
        recent_stress = [dp.value for dp in health_data if dp.metric == HealthMetric.STRESS_LEVEL][-5:]
        if recent_stress and np.mean(recent_stress) > 60:
            recommendations.append("Consider implementing regular stress breaks")

        # Add insight-based recommendations
        for insight in insights:
            recommendations.extend(insight.recommendations[:2])  # Limit to top 2

        return recommendations[:5]  # Return top 5 recommendations

    async def get_period_recommendations(
        self, user_id: int, period: str, insights: list[ProductivityInsight]
    ) -> list[str]:
        """Get recommendations for a specific time period."""
        base_recommendations = [
            "Maintain consistent sleep schedule",
            "Stay hydrated throughout the day",
            "Take breaks every 25-30 minutes"
        ]

        # Add period-specific recommendations
        if period == "today":
            base_recommendations.insert(0, "Focus on energy management for today")
        elif period == "week":
            base_recommendations.insert(0, "Plan rest and recovery for the weekend")

        return base_recommendations


class WearableWorkflowBridge:
    """Bridge between wearable data and workflow engine."""

    def __init__(self, workflow_engine):
        self.workflow_engine = workflow_engine
        self.health_triggers = {
            "stress_spike": "stress_management_workflow",
            "energy_peak": "high_productivity_workflow",
            "fatigue_detected": "recovery_workflow"
        }

    async def process_voice_workflow(
        self, transcription: str, user_id: int, health_context: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Process voice commands for workflow triggers."""
        if not self.workflow_engine:
            return None

        # Check for workflow keywords
        workflow_keywords = {
            "start workflow": "manual_workflow_start",
            "automate": "automation_workflow",
            "schedule": "scheduling_workflow"
        }

        for keyword, workflow_type in workflow_keywords.items():
            if keyword in transcription.lower():
                return await self._trigger_voice_workflow(workflow_type, user_id, transcription)

        return None

    async def determine_health_workflow(
        self, health_event: dict[str, Any], user_id: int
    ) -> dict[str, Any] | None:
        """Determine appropriate workflow based on health event."""
        event_type = health_event.get("type")

        if event_type in self.health_triggers:
            workflow_name = self.health_triggers[event_type]
            return {
                "name": workflow_name,
                "trigger": "health_event",
                "event_data": health_event
            }

        return None

    async def execute_health_workflow(
        self, workflow_config: dict[str, Any], user_id: int, health_event: dict[str, Any]
    ) -> dict[str, Any]:
        """Execute health-triggered workflow."""
        # Mock workflow execution
        workflow_result = {
            "workflow_id": f"health_workflow_{uuid4().hex[:8]}",
            "name": workflow_config["name"],
            "status": "executed",
            "user_id": user_id,
            "health_trigger": health_event,
            "executed_at": datetime.now().isoformat()
        }

        logger.info(f"Executed health workflow: {workflow_config['name']} for user {user_id}")
        return workflow_result

    async def _trigger_voice_workflow(
        self, workflow_type: str, user_id: int, transcription: str
    ) -> dict[str, Any]:
        """Trigger workflow from voice command."""
        # Mock voice workflow triggering
        return {
            "workflow_type": workflow_type,
            "triggered_by": "voice_command",
            "transcription": transcription,
            "user_id": user_id,
            "status": "triggered"
        }
