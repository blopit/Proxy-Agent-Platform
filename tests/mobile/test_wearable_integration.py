"""
Comprehensive tests for enhanced wearable integration with health data correlation.
"""

import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

import pytest

from proxy_agent_platform.mobile.wearable_integration import (
    ActivityData,
    BiometricProductivityCorrelator,
    CoachingRecommendation,
    DeviceCapability,
    HealthDataMonitor,
    HealthMetrics,
    HealthTrend,
    ProductivityAnalyzer,
    ProductivityInsight,
    SmartCoachingEngine,
    WearableConfig,
    WearableDevice,
    WearableIntegration,
)


class TestWearableDevice:
    """Test WearableDevice dataclass and methods."""

    def test_wearable_device_creation(self):
        """Test wearable device creation with all fields."""
        device = WearableDevice(
            id="device-123",
            name="Apple Watch Series 8",
            type="smartwatch",
            manufacturer="Apple",
            model="Series 8",
            capabilities=[
                DeviceCapability.HEART_RATE,
                DeviceCapability.STEP_TRACKING,
                DeviceCapability.SLEEP_TRACKING
            ],
            user_id="user-456"
        )

        assert device.id == "device-123"
        assert device.name == "Apple Watch Series 8"
        assert device.type == "smartwatch"
        assert DeviceCapability.HEART_RATE in device.capabilities
        assert device.is_connected is True  # Default value
        assert device.battery_level == 100  # Default value

    def test_device_capability_checking(self):
        """Test checking device capabilities."""
        device = WearableDevice(
            id="fitness-tracker",
            name="Fitbit Versa",
            type="fitness_tracker",
            capabilities=[
                DeviceCapability.HEART_RATE,
                DeviceCapability.STEP_TRACKING,
                DeviceCapability.SLEEP_TRACKING
            ]
        )

        assert device.has_capability(DeviceCapability.HEART_RATE)
        assert device.has_capability(DeviceCapability.SLEEP_TRACKING)
        assert not device.has_capability(DeviceCapability.GPS)
        assert not device.has_capability(DeviceCapability.ECG)

    def test_device_battery_status(self):
        """Test device battery status monitoring."""
        device = WearableDevice(
            id="low-battery",
            name="Test Device",
            type="smartwatch",
            battery_level=15
        )

        assert device.needs_charging() is True

        device.battery_level = 85
        assert device.needs_charging() is False


class TestHealthMetrics:
    """Test HealthMetrics dataclass and calculations."""

    def test_health_metrics_creation(self):
        """Test health metrics creation and validation."""
        metrics = HealthMetrics(
            heart_rate=72,
            heart_rate_variability=45.2,
            stress_level=0.3,
            energy_level=0.8,
            sleep_quality=0.75,
            activity_level=0.6,
            timestamp=datetime.now(),
            device_id="device-123"
        )

        assert metrics.heart_rate == 72
        assert 0 <= metrics.stress_level <= 1
        assert 0 <= metrics.energy_level <= 1
        assert isinstance(metrics.timestamp, datetime)

    def test_health_score_calculation(self):
        """Test overall health score calculation."""
        good_metrics = HealthMetrics(
            heart_rate=70,
            stress_level=0.2,
            energy_level=0.9,
            sleep_quality=0.85,
            activity_level=0.8
        )

        health_score = good_metrics.calculate_health_score()
        assert 0.7 <= health_score <= 1.0  # Should be high for good metrics

        poor_metrics = HealthMetrics(
            heart_rate=95,
            stress_level=0.8,
            energy_level=0.2,
            sleep_quality=0.3,
            activity_level=0.1
        )

        poor_score = poor_metrics.calculate_health_score()
        assert 0.0 <= poor_score <= 0.4  # Should be low for poor metrics

    def test_stress_level_categorization(self):
        """Test stress level categorization."""
        low_stress = HealthMetrics(stress_level=0.2)
        assert low_stress.get_stress_category() == "low"

        medium_stress = HealthMetrics(stress_level=0.5)
        assert medium_stress.get_stress_category() == "medium"

        high_stress = HealthMetrics(stress_level=0.8)
        assert high_stress.get_stress_category() == "high"


class TestHealthDataMonitor:
    """Test health data monitoring functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.monitor = HealthDataMonitor()

    async def test_collect_health_data(self):
        """Test health data collection from wearable devices."""
        device = WearableDevice(
            id="monitor-test",
            name="Test Watch",
            type="smartwatch",
            capabilities=[DeviceCapability.HEART_RATE, DeviceCapability.STRESS]
        )

        with patch.object(self.monitor, '_read_device_data') as mock_read:
            mock_read.return_value = {
                "heart_rate": 75,
                "stress_level": 0.3,
                "energy_level": 0.7,
                "timestamp": datetime.now()
            }

            metrics = await self.monitor.collect_health_data(device)

            assert isinstance(metrics, HealthMetrics)
            assert metrics.heart_rate == 75
            assert metrics.stress_level == 0.3
            mock_read.assert_called_once_with(device)

    async def test_continuous_monitoring(self):
        """Test continuous health data monitoring."""
        device = WearableDevice(
            id="continuous-test",
            name="Continuous Monitor",
            type="smartwatch"
        )

        # Mock data collection
        collected_data = []

        async def mock_collect_data(dev):
            data = HealthMetrics(
                heart_rate=70 + len(collected_data),  # Varying heart rate
                stress_level=0.1 + len(collected_data) * 0.1,
                energy_level=0.8 - len(collected_data) * 0.1,
                timestamp=datetime.now()
            )
            collected_data.append(data)
            return data

        with patch.object(self.monitor, 'collect_health_data', side_effect=mock_collect_data):
            # Start continuous monitoring
            monitoring_task = asyncio.create_task(
                self.monitor.start_continuous_monitoring(device, interval_seconds=0.1)
            )

            # Let it collect some data
            await asyncio.sleep(0.3)
            monitoring_task.cancel()

            # Should have collected multiple data points
            assert len(collected_data) >= 2

    async def test_health_trend_analysis(self):
        """Test health trend analysis over time."""
        # Create historical health data
        historical_data = []
        base_time = datetime.now() - timedelta(hours=24)

        for i in range(24):  # 24 hours of data
            metrics = HealthMetrics(
                heart_rate=70 + (i % 10),  # Varying pattern
                stress_level=0.1 + (i / 24) * 0.3,  # Gradually increasing
                energy_level=0.9 - (i / 24) * 0.4,  # Gradually decreasing
                timestamp=base_time + timedelta(hours=i)
            )
            historical_data.append(metrics)

        trend = await self.monitor.analyze_health_trends(historical_data)

        assert isinstance(trend, HealthTrend)
        assert trend.stress_trend == "increasing"  # Stress was increasing
        assert trend.energy_trend == "decreasing"  # Energy was decreasing

    async def test_anomaly_detection(self):
        """Test health anomaly detection."""
        # Normal baseline data
        normal_data = []
        for i in range(10):
            metrics = HealthMetrics(
                heart_rate=70,
                stress_level=0.2,
                energy_level=0.8
            )
            normal_data.append(metrics)

        # Anomalous data point
        anomalous_metrics = HealthMetrics(
            heart_rate=120,  # Significantly elevated
            stress_level=0.9,  # Very high stress
            energy_level=0.1   # Very low energy
        )

        anomalies = await self.monitor.detect_anomalies(normal_data + [anomalous_metrics])

        assert len(anomalies) == 1
        assert anomalies[0] == anomalous_metrics


class TestProductivityAnalyzer:
    """Test productivity analysis functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.analyzer = ProductivityAnalyzer()

    async def test_analyze_productivity_patterns(self):
        """Test productivity pattern analysis."""
        # Create activity data spanning a work day
        activities = []
        work_start = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)

        for hour in range(8):  # 8-hour work day
            activity = ActivityData(
                type="work",
                duration_minutes=60,
                intensity="medium" if hour % 2 == 0 else "high",
                timestamp=work_start + timedelta(hours=hour),
                metadata={"task_type": "coding" if hour < 4 else "meetings"}
            )
            activities.append(activity)

        insights = await self.analyzer.analyze_productivity_patterns(activities)

        assert isinstance(insights, list)
        assert len(insights) > 0

        # Should identify patterns
        insight_types = [insight.type for insight in insights]
        assert "peak_hours" in insight_types or "productivity_pattern" in insight_types

    async def test_focus_score_calculation(self):
        """Test focus score calculation."""
        # High focus scenario
        high_focus_activities = [
            ActivityData(
                type="deep_work",
                duration_minutes=120,
                intensity="high",
                interruptions=1
            ),
            ActivityData(
                type="coding",
                duration_minutes=90,
                intensity="high",
                interruptions=0
            )
        ]

        high_score = await self.analyzer.calculate_focus_score(high_focus_activities)
        assert 0.7 <= high_score <= 1.0

        # Low focus scenario
        low_focus_activities = [
            ActivityData(
                type="email",
                duration_minutes=15,
                intensity="low",
                interruptions=5
            ),
            ActivityData(
                type="meetings",
                duration_minutes=30,
                intensity="medium",
                interruptions=8
            )
        ]

        low_score = await self.analyzer.calculate_focus_score(low_focus_activities)
        assert 0.0 <= low_score <= 0.4

    async def test_productivity_insights_generation(self):
        """Test generation of productivity insights."""
        # Mix of productive and unproductive activities
        mixed_activities = [
            ActivityData(type="deep_work", duration_minutes=120, intensity="high"),
            ActivityData(type="social_media", duration_minutes=45, intensity="low"),
            ActivityData(type="coding", duration_minutes=90, intensity="high"),
            ActivityData(type="breaks", duration_minutes=30, intensity="low")
        ]

        insights = await self.analyzer.generate_insights(mixed_activities)

        assert len(insights) > 0
        for insight in insights:
            assert isinstance(insight, ProductivityInsight)
            assert insight.confidence > 0
            assert len(insight.message) > 0

    async def test_optimal_work_time_identification(self):
        """Test identification of optimal work times."""
        # Create performance data across different times
        performance_data = []
        for hour in range(24):
            # Simulate higher performance during traditional work hours
            performance = 0.8 if 9 <= hour <= 17 else 0.4
            if hour in [10, 11, 14, 15]:  # Peak hours
                performance = 0.95

            data = {
                "hour": hour,
                "performance_score": performance,
                "focus_level": performance * 0.9,
                "energy_level": performance * 0.8
            }
            performance_data.append(data)

        optimal_times = await self.analyzer.identify_optimal_work_times(performance_data)

        assert len(optimal_times) > 0
        # Should identify morning and afternoon peaks
        optimal_hours = [time["hour"] for time in optimal_times]
        assert 10 in optimal_hours or 11 in optimal_hours  # Morning peak
        assert 14 in optimal_hours or 15 in optimal_hours  # Afternoon peak


class TestBiometricProductivityCorrelator:
    """Test biometric and productivity data correlation."""

    def setup_method(self):
        """Set up test fixtures."""
        self.correlator = BiometricProductivityCorrelator()

    async def test_correlate_health_productivity(self):
        """Test correlation between health metrics and productivity."""
        # Create paired health and productivity data
        health_data = [
            HealthMetrics(heart_rate=65, stress_level=0.2, energy_level=0.9),
            HealthMetrics(heart_rate=85, stress_level=0.7, energy_level=0.3),
            HealthMetrics(heart_rate=70, stress_level=0.3, energy_level=0.8),
        ]

        productivity_data = [
            {"focus_score": 0.9, "task_completion": 0.95},  # High productivity
            {"focus_score": 0.3, "task_completion": 0.4},   # Low productivity
            {"focus_score": 0.8, "task_completion": 0.85},  # Good productivity
        ]

        correlations = await self.correlator.correlate_health_productivity(
            health_data, productivity_data
        )

        assert "stress_productivity_correlation" in correlations
        assert "energy_productivity_correlation" in correlations

        # High stress should correlate with low productivity (negative correlation)
        assert correlations["stress_productivity_correlation"] < 0
        # High energy should correlate with high productivity (positive correlation)
        assert correlations["energy_productivity_correlation"] > 0

    async def test_predict_productivity_from_health(self):
        """Test productivity prediction based on health metrics."""
        current_health = HealthMetrics(
            heart_rate=72,
            stress_level=0.3,
            energy_level=0.8,
            sleep_quality=0.75
        )

        # Mock historical correlations
        with patch.object(self.correlator, '_get_historical_correlations') as mock_correlations:
            mock_correlations.return_value = {
                "stress_productivity_correlation": -0.7,
                "energy_productivity_correlation": 0.8,
                "sleep_productivity_correlation": 0.6
            }

            prediction = await self.correlator.predict_productivity(current_health)

            assert 0 <= prediction <= 1
            # Good health metrics should predict good productivity
            assert prediction > 0.6

    async def test_optimal_health_recommendations(self):
        """Test generation of health-based productivity recommendations."""
        current_health = HealthMetrics(
            heart_rate=90,  # Elevated
            stress_level=0.8,  # High stress
            energy_level=0.2,  # Low energy
            sleep_quality=0.4  # Poor sleep
        )

        recommendations = await self.correlator.generate_health_recommendations(current_health)

        assert len(recommendations) > 0
        recommendation_types = [rec.type for rec in recommendations]

        # Should recommend stress management and energy boosting
        assert "stress_management" in recommendation_types
        assert "energy_boost" in recommendation_types or "rest" in recommendation_types

    async def test_biometric_trend_impact_analysis(self):
        """Test analysis of biometric trend impact on productivity."""
        # Create trending health data (increasing stress over time)
        trending_health = []
        trending_productivity = []

        for i in range(10):
            health = HealthMetrics(
                stress_level=0.1 + (i * 0.08),  # Gradually increasing stress
                energy_level=0.9 - (i * 0.07),  # Gradually decreasing energy
            )
            productivity = 0.9 - (i * 0.08)  # Decreasing productivity

            trending_health.append(health)
            trending_productivity.append(productivity)

        impact_analysis = await self.correlator.analyze_trend_impact(
            trending_health, trending_productivity
        )

        assert "stress_impact" in impact_analysis
        assert "energy_impact" in impact_analysis
        # Increasing stress should have negative impact
        assert impact_analysis["stress_impact"] < 0


class TestSmartCoachingEngine:
    """Test smart coaching and recommendation engine."""

    def setup_method(self):
        """Set up test fixtures."""
        self.coaching_engine = SmartCoachingEngine()

    async def test_generate_personalized_recommendations(self):
        """Test generation of personalized coaching recommendations."""
        user_context = {
            "current_health": HealthMetrics(
                stress_level=0.7,
                energy_level=0.3,
                sleep_quality=0.4
            ),
            "productivity_history": [0.8, 0.6, 0.4, 0.3],  # Declining trend
            "preferences": {
                "work_style": "deep_work_focused",
                "break_preferences": "short_frequent"
            }
        }

        recommendations = await self.coaching_engine.generate_recommendations(user_context)

        assert len(recommendations) > 0
        for rec in recommendations:
            assert isinstance(rec, CoachingRecommendation)
            assert rec.confidence > 0
            assert len(rec.action_steps) > 0

    async def test_adaptive_coaching_strategies(self):
        """Test adaptive coaching based on user response."""
        # Initial recommendation
        initial_rec = CoachingRecommendation(
            id="stress-reduction-1",
            type="stress_management",
            title="Take a breathing exercise",
            description="5-minute deep breathing",
            confidence=0.8,
            action_steps=["Find quiet space", "Breathe deeply for 5 minutes"]
        )

        # Simulate user follows recommendation
        user_feedback = {
            "followed": True,
            "effectiveness": 0.7,
            "completion_rate": 1.0
        }

        adapted_rec = await self.coaching_engine.adapt_recommendation(
            initial_rec, user_feedback
        )

        # Should maintain or improve the recommendation
        assert adapted_rec.confidence >= initial_rec.confidence

    async def test_contextual_timing_recommendations(self):
        """Test contextual timing for recommendations."""
        high_stress_context = {
            "current_time": datetime.now().replace(hour=14),  # Afternoon
            "health_state": HealthMetrics(stress_level=0.8, energy_level=0.2),
            "work_state": "high_pressure_meeting",
            "calendar": {"next_free_slot": "15:30"}
        }

        recommendations = await self.coaching_engine.get_contextual_recommendations(
            high_stress_context
        )

        # Should recommend immediate stress relief
        immediate_recs = [r for r in recommendations if r.urgency == "immediate"]
        assert len(immediate_recs) > 0

    async def test_long_term_coaching_goals(self):
        """Test long-term coaching goal tracking."""
        user_goals = {
            "stress_reduction": {"target": 0.3, "current": 0.7, "timeline": "2_weeks"},
            "energy_improvement": {"target": 0.8, "current": 0.4, "timeline": "1_month"},
            "focus_enhancement": {"target": 0.9, "current": 0.6, "timeline": "3_weeks"}
        }

        progress_analysis = await self.coaching_engine.analyze_goal_progress(user_goals)

        assert "stress_reduction" in progress_analysis
        assert "recommended_actions" in progress_analysis
        assert "timeline_adjustments" in progress_analysis

    async def test_intervention_timing(self):
        """Test smart intervention timing."""
        declining_metrics = [
            HealthMetrics(stress_level=0.3, timestamp=datetime.now() - timedelta(hours=3)),
            HealthMetrics(stress_level=0.5, timestamp=datetime.now() - timedelta(hours=2)),
            HealthMetrics(stress_level=0.7, timestamp=datetime.now() - timedelta(hours=1)),
            HealthMetrics(stress_level=0.9, timestamp=datetime.now()),
        ]

        should_intervene = await self.coaching_engine.should_trigger_intervention(
            declining_metrics
        )

        assert should_intervene is True  # Rapid stress increase should trigger intervention

        stable_metrics = [
            HealthMetrics(stress_level=0.3, timestamp=datetime.now() - timedelta(hours=i))
            for i in range(4)
        ]

        should_not_intervene = await self.coaching_engine.should_trigger_intervention(
            stable_metrics
        )

        assert should_not_intervene is False  # Stable metrics shouldn't trigger intervention


@pytest.mark.asyncio
class TestWearableIntegration:
    """Test the main WearableIntegration class."""

    def setup_method(self):
        """Set up test fixtures."""
        config = WearableConfig(
            health_monitoring_interval=30,
            productivity_analysis_interval=300,
            coaching_enabled=True,
            real_time_feedback=True
        )
        self.integration = WearableIntegration(config=config)

    async def test_device_registration(self):
        """Test registering wearable devices."""
        device = WearableDevice(
            id="register-test",
            name="Test Smartwatch",
            type="smartwatch",
            capabilities=[DeviceCapability.HEART_RATE, DeviceCapability.STRESS]
        )

        success = await self.integration.register_device(device)

        assert success is True
        registered_devices = await self.integration.get_registered_devices()
        assert len(registered_devices) == 1
        assert registered_devices[0].id == "register-test"

    async def test_health_monitoring_integration(self):
        """Test health monitoring integration."""
        device = WearableDevice(
            id="health-monitor",
            name="Health Watch",
            type="smartwatch",
            capabilities=[DeviceCapability.HEART_RATE, DeviceCapability.STRESS]
        )

        await self.integration.register_device(device)

        # Mock health data collection
        with patch.object(self.integration.health_monitor, 'collect_health_data') as mock_collect:
            mock_collect.return_value = HealthMetrics(
                heart_rate=75,
                stress_level=0.4,
                energy_level=0.7
            )

            metrics = await self.integration.get_current_health_metrics(device.id)

            assert isinstance(metrics, HealthMetrics)
            assert metrics.heart_rate == 75
            mock_collect.assert_called_once()

    async def test_productivity_correlation(self):
        """Test health-productivity correlation."""
        # Register device
        device = WearableDevice(
            id="correlation-test",
            name="Productivity Tracker",
            type="fitness_tracker"
        )
        await self.integration.register_device(device)

        # Mock data
        health_data = HealthMetrics(stress_level=0.3, energy_level=0.8)
        productivity_data = {"focus_score": 0.85, "task_completion": 0.9}

        with patch.object(self.integration.correlator, 'correlate_health_productivity') as mock_correlate:
            mock_correlate.return_value = {
                "stress_productivity_correlation": -0.6,
                "energy_productivity_correlation": 0.7
            }

            correlations = await self.integration.analyze_health_productivity_correlation(
                [health_data], [productivity_data]
            )

            assert "stress_productivity_correlation" in correlations
            mock_correlate.assert_called_once()

    async def test_smart_coaching_integration(self):
        """Test smart coaching recommendations."""
        device = WearableDevice(
            id="coaching-test",
            name="Coaching Watch",
            type="smartwatch"
        )
        await self.integration.register_device(device)

        user_context = {
            "current_health": HealthMetrics(stress_level=0.8, energy_level=0.2),
            "work_state": "high_pressure"
        }

        with patch.object(self.integration.coaching_engine, 'generate_recommendations') as mock_coach:
            mock_coach.return_value = [
                CoachingRecommendation(
                    id="stress-rec",
                    type="stress_management",
                    title="Take a break",
                    description="5-minute relaxation",
                    confidence=0.9,
                    action_steps=["Step away from work", "Practice deep breathing"]
                )
            ]

            recommendations = await self.integration.get_coaching_recommendations(user_context)

            assert len(recommendations) == 1
            assert recommendations[0].type == "stress_management"
            mock_coach.assert_called_once()

    async def test_real_time_feedback(self):
        """Test real-time feedback delivery."""
        device = WearableDevice(
            id="feedback-test",
            name="Feedback Watch",
            type="smartwatch",
            capabilities=[DeviceCapability.HAPTIC_FEEDBACK]
        )
        await self.integration.register_device(device)

        feedback_message = "Great focus session! Take a short break."

        with patch.object(self.integration, '_send_haptic_feedback') as mock_haptic, \
             patch.object(self.integration, '_send_visual_feedback') as mock_visual:

            success = await self.integration.send_real_time_feedback(
                device.id, feedback_message, feedback_type="positive"
            )

            assert success is True
            mock_haptic.assert_called_once()
            mock_visual.assert_called_once()

    async def test_device_disconnection_handling(self):
        """Test handling of device disconnections."""
        device = WearableDevice(
            id="disconnect-test",
            name="Disconnect Watch",
            type="smartwatch",
            is_connected=True
        )
        await self.integration.register_device(device)

        # Simulate disconnection
        await self.integration._handle_device_disconnection(device.id)

        # Device should be marked as disconnected
        updated_device = await self.integration.get_device(device.id)
        assert updated_device.is_connected is False

    async def test_battery_monitoring(self):
        """Test device battery level monitoring."""
        low_battery_device = WearableDevice(
            id="low-battery",
            name="Low Battery Watch",
            type="smartwatch",
            battery_level=10  # Low battery
        )
        await self.integration.register_device(low_battery_device)

        # Check battery warnings
        with patch.object(self.integration, '_send_battery_warning') as mock_warning:
            await self.integration._check_device_battery_levels()

            mock_warning.assert_called_once_with(low_battery_device)


@pytest.mark.integration
class TestWearableIntegrationE2E:
    """End-to-end integration tests for wearable integration."""

    @pytest.fixture
    def integration_with_mocks(self):
        """Create integration with mocked external dependencies."""
        config = WearableConfig(
            health_monitoring_interval=1,  # Fast for testing
            productivity_analysis_interval=5,
            coaching_enabled=True
        )
        integration = WearableIntegration(config=config)

        # Mock external services
        integration._device_api = Mock()
        integration._notification_service = Mock()
        integration._analytics_service = Mock()

        return integration

    async def test_complete_health_productivity_workflow(self, integration_with_mocks):
        """Test complete workflow from health monitoring to productivity recommendations."""
        integration = integration_with_mocks

        # Register device
        device = WearableDevice(
            id="workflow-test",
            name="Workflow Watch",
            type="smartwatch",
            capabilities=[
                DeviceCapability.HEART_RATE,
                DeviceCapability.STRESS,
                DeviceCapability.HAPTIC_FEEDBACK
            ]
        )
        await integration.register_device(device)

        # Configure mocks
        integration._device_api.get_health_data.return_value = {
            "heart_rate": 85,
            "stress_level": 0.7,
            "energy_level": 0.3
        }

        # Simulate workflow
        # 1. Collect health data
        metrics = await integration.get_current_health_metrics(device.id)

        # 2. Analyze productivity correlation
        correlations = await integration.analyze_health_productivity_correlation(
            [metrics], [{"focus_score": 0.4}]
        )

        # 3. Generate coaching recommendations
        recommendations = await integration.get_coaching_recommendations({
            "current_health": metrics,
            "productivity_history": [0.8, 0.6, 0.4]
        })

        # 4. Send feedback to device
        if recommendations:
            await integration.send_real_time_feedback(
                device.id, recommendations[0].title, "coaching"
            )

        # Verify the workflow executed
        assert metrics.stress_level == 0.7
        assert len(recommendations) > 0
        integration._notification_service.send_feedback.assert_called()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
