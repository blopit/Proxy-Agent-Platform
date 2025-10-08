"""
Pytest configuration and fixtures for mobile component tests.
"""

import asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, Mock

import pytest

from proxy_agent_platform.mobile.mobile_workflow_bridge import (
    MobileWorkflowBridge,
    MobileWorkflowTrigger,
    WorkflowPriority,
    MobileTriggerType,
)

# Import all mobile components for fixture creation
from proxy_agent_platform.mobile.notification_manager import (
    BatchProcessingConfig,
    MobileNotification,
    NotificationCategory,
    NotificationManager,
    NotificationPriority,
)
from proxy_agent_platform.mobile.offline_manager import (
    EnhancedOfflineManager as OfflineManager,
    SyncOperation,
    SyncPriority,
)
from proxy_agent_platform.mobile.voice_processor import (
    VoiceProcessor,
)
# from proxy_agent_platform.mobile.wearable_integration import (
#     DeviceCapability,
#     HealthMetrics,
#     WearableConfig,
#     WearableDevice,
#     WearableIntegration,
# )


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_user_id():
    """Provide a standard mock user ID for tests."""
    return "test-user-123"


@pytest.fixture
def mock_device_id():
    """Provide a standard mock device ID for tests."""
    return "test-device-456"


# Notification Manager Fixtures
@pytest.fixture
def notification_config():
    """Provide notification manager configuration for tests."""
    return BatchProcessingConfig(
        batch_size=5,
        batch_interval_seconds=10,
        max_batch_wait_seconds=30,
        enable_ml_timing=True
    )


@pytest.fixture
def notification_manager(notification_config):
    """Provide a configured notification manager instance."""
    return NotificationManager(batch_config=notification_config)


@pytest.fixture
def sample_notification(mock_user_id):
    """Provide a sample mobile notification for tests."""
    return MobileNotification(
        id="test-notification-123",
        title="Test Notification",
        content="This is a test notification",
        priority=NotificationPriority.MEDIUM,
        category=NotificationCategory.TASK,
        user_id=mock_user_id
    )


@pytest.fixture
def high_priority_notification(mock_user_id):
    """Provide a high priority notification for tests."""
    return MobileNotification(
        id="urgent-notification-456",
        title="Urgent Task",
        content="Critical issue requires attention",
        priority=NotificationPriority.URGENT,
        category=NotificationCategory.ALERT,
        user_id=mock_user_id
    )


@pytest.fixture
def batch_notifications(mock_user_id):
    """Provide a list of batchable notifications for tests."""
    return [
        MobileNotification(
            id=f"batch-{i}",
            title=f"System Update {i}",
            content=f"Update content {i}",
            priority=NotificationPriority.LOW,
            category=NotificationCategory.SYSTEM,
            user_id=mock_user_id
        )
        for i in range(5)
    ]


# Voice Processor Fixtures
@pytest.fixture
def voice_config():
    """Provide voice processor configuration for tests."""
    return VoiceProcessingConfig(
        language="en-US",
        confidence_threshold=0.7,
        max_processing_time=5.0,
        enable_health_context=True
    )


@pytest.fixture
def voice_processor(voice_config):
    """Provide a configured voice processor instance."""
    return VoiceProcessor(config=voice_config)


@pytest.fixture
def sample_voice_command(mock_user_id):
    """Provide a sample voice command for tests."""
    return {
        "id": "test-voice-cmd-123",
        "text": "Schedule a meeting for tomorrow",
        "confidence": 0.85,
        "language": "en-US",
        "user_id": mock_user_id
    }


@pytest.fixture
def high_confidence_voice_command(mock_user_id):
    """Provide a high confidence voice command for tests."""
    return {
        "id": "high-conf-cmd-456",
        "text": "Remind me to call John at 3 PM",
        "confidence": 0.95,
        "language": "en-US",
        "user_id": mock_user_id,
        "intent": "REMINDER",
        "entities": [
            {"type": "PERSON", "value": "John", "confidence": 0.9},
            {"type": "TIME", "value": "3 PM", "confidence": 0.85}
        ]
    }


@pytest.fixture
def health_context():
    """Provide health context for voice processing tests."""
    return HealthContext(
        stress_level=0.3,
        energy_level=0.8,
        focus_level=0.9,
        heart_rate=72
    )


# Offline Manager Fixtures
@pytest.fixture
def sync_config():
    """Provide sync configuration for tests."""
    return SyncConfiguration(
        max_retry_attempts=3,
        base_retry_delay=1.0,
        sync_batch_size=5,
        enable_compression=True,
        auto_sync_interval=300
    )


@pytest.fixture
def offline_manager(sync_config):
    """Provide a configured offline manager instance."""
    return OfflineManager(config=sync_config)


@pytest.fixture
def sample_sync_operation(mock_user_id):
    """Provide a sample sync operation for tests."""
    return SyncOperation(
        id="test-sync-op-123",
        operation_type="CREATE",
        entity_type="task",
        entity_id="task-456",
        data={"title": "Test Task", "completed": False},
        priority=SyncPriority.MEDIUM,
        user_id=mock_user_id
    )


@pytest.fixture
def urgent_sync_operation(mock_user_id):
    """Provide an urgent sync operation for tests."""
    return SyncOperation(
        id="urgent-sync-op-789",
        operation_type="UPDATE",
        entity_type="alert",
        entity_id="alert-critical",
        data={"status": "active", "severity": "high"},
        priority=SyncPriority.URGENT,
        user_id=mock_user_id
    )


@pytest.fixture
def sync_operations_batch(mock_user_id):
    """Provide a batch of sync operations for tests."""
    return [
        SyncOperation(
            id=f"batch-sync-{i}",
            operation_type="UPDATE",
            entity_type="note",
            entity_id=f"note-{i}",
            data={"content": f"Note content {i}"},
            priority=SyncPriority.LOW,
            user_id=mock_user_id
        )
        for i in range(10)
    ]


# Wearable Integration Fixtures
@pytest.fixture
def wearable_config():
    """Provide wearable integration configuration for tests."""
    return WearableConfig(
        health_monitoring_interval=30,
        productivity_analysis_interval=300,
        coaching_enabled=True,
        real_time_feedback=True
    )


@pytest.fixture
def wearable_integration(wearable_config):
    """Provide a configured wearable integration instance."""
    return WearableIntegration(config=wearable_config)


@pytest.fixture
def sample_wearable_device(mock_user_id, mock_device_id):
    """Provide a sample wearable device for tests."""
    return WearableDevice(
        id=mock_device_id,
        name="Test Smartwatch",
        type="smartwatch",
        manufacturer="TestCorp",
        model="Test-Watch-1",
        capabilities=[
            DeviceCapability.HEART_RATE,
            DeviceCapability.STRESS,
            DeviceCapability.STEP_TRACKING,
            DeviceCapability.SLEEP_TRACKING
        ],
        user_id=mock_user_id,
        is_connected=True,
        battery_level=85
    )


@pytest.fixture
def sample_health_metrics(mock_device_id):
    """Provide sample health metrics for tests."""
    return HealthMetrics(
        heart_rate=72,
        heart_rate_variability=45.2,
        stress_level=0.3,
        energy_level=0.8,
        sleep_quality=0.75,
        activity_level=0.6,
        timestamp=datetime.now(),
        device_id=mock_device_id
    )


@pytest.fixture
def high_stress_health_metrics(mock_device_id):
    """Provide high stress health metrics for tests."""
    return HealthMetrics(
        heart_rate=95,
        heart_rate_variability=25.0,
        stress_level=0.9,
        energy_level=0.2,
        sleep_quality=0.3,
        activity_level=0.1,
        timestamp=datetime.now(),
        device_id=mock_device_id
    )


# Mobile Workflow Bridge Fixtures
@pytest.fixture
def bridge_config():
    """Provide mobile workflow bridge configuration for tests."""
    return BridgeConfiguration(
        enable_offline_execution=True,
        max_concurrent_workflows=5,
        health_trigger_threshold=0.8,
        auto_recommendation=True,
        status_broadcast_interval=5
    )


@pytest.fixture
def mobile_workflow_bridge(bridge_config):
    """Provide a configured mobile workflow bridge instance."""
    return MobileWorkflowBridge(config=bridge_config)


@pytest.fixture
def sample_workflow_trigger(mock_user_id):
    """Provide a sample workflow trigger for tests."""
    return MobileWorkflowTrigger(
        id="test-trigger-123",
        workflow_id="test-workflow-456",
        trigger_type=TriggerType.VOICE_COMMAND,
        priority=TriggerPriority.NORMAL,
        context_data={
            "voice_command": "Schedule a meeting",
            "user_intent": "SCHEDULE",
            "entities": ["meeting", "tomorrow"]
        },
        user_id=mock_user_id
    )


@pytest.fixture
def urgent_workflow_trigger(mock_user_id):
    """Provide an urgent workflow trigger for tests."""
    return MobileWorkflowTrigger(
        id="urgent-trigger-789",
        workflow_id="emergency-workflow-123",
        trigger_type=TriggerType.HEALTH_ALERT,
        priority=TriggerPriority.URGENT,
        context_data={
            "health_alert": "high_stress",
            "stress_level": 0.95,
            "intervention_needed": True
        },
        user_id=mock_user_id
    )


# Mock Service Fixtures
@pytest.fixture
def mock_push_notification_service():
    """Provide a mock push notification service."""
    service = Mock()
    service.send_notification = AsyncMock(return_value=True)
    service.send_batch_notification = AsyncMock(return_value=True)
    service.get_device_tokens = AsyncMock(return_value=["token123", "token456"])
    return service


@pytest.fixture
def mock_workflow_engine():
    """Provide a mock workflow engine."""
    engine = Mock()
    engine.execute_workflow = AsyncMock(return_value={
        "success": True,
        "workflow_id": "test-workflow",
        "result": {"task_id": "task-123"}
    })
    engine.get_workflow_status = AsyncMock(return_value={
        "status": "completed",
        "progress": 1.0
    })
    return engine


@pytest.fixture
def mock_health_service():
    """Provide a mock health data service."""
    service = Mock()
    service.get_current_metrics = AsyncMock(return_value={
        "heart_rate": 72,
        "stress_level": 0.3,
        "energy_level": 0.8
    })
    service.get_device_data = AsyncMock(return_value={
        "battery_level": 85,
        "is_connected": True,
        "last_sync": datetime.now().isoformat()
    })
    return service


@pytest.fixture
def mock_analytics_service():
    """Provide a mock analytics service."""
    service = Mock()
    service.track_notification = AsyncMock()
    service.track_voice_command = AsyncMock()
    service.track_workflow_execution = AsyncMock()
    service.track_health_metric = AsyncMock()
    return service


# Integration Test Fixtures
@pytest.fixture
def integrated_mobile_system(
    notification_manager,
    voice_processor,
    offline_manager,
    wearable_integration,
    mobile_workflow_bridge
):
    """Provide an integrated mobile system for end-to-end tests."""
    return {
        "notification_manager": notification_manager,
        "voice_processor": voice_processor,
        "offline_manager": offline_manager,
        "wearable_integration": wearable_integration,
        "workflow_bridge": mobile_workflow_bridge
    }


# Utility Fixtures
@pytest.fixture
def mock_network_state():
    """Provide mock network state for testing."""
    from proxy_agent_platform.mobile.offline_manager import NetworkState
    return NetworkState(
        is_connected=True,
        bandwidth_mbps=25.0,
        latency_ms=50,
        is_metered=False
    )


@pytest.fixture
def offline_network_state():
    """Provide offline network state for testing."""
    from proxy_agent_platform.mobile.offline_manager import NetworkState
    return NetworkState(
        is_connected=False,
        bandwidth_mbps=0.0,
        latency_ms=0,
        is_metered=False
    )


@pytest.fixture
def mock_time_now():
    """Provide a fixed datetime for consistent testing."""
    return datetime(2023, 10, 1, 14, 30, 0)  # October 1, 2023, 2:30 PM


@pytest.fixture
def mock_user_preferences():
    """Provide mock user preferences for testing."""
    return {
        "notification_preferences": {
            "quiet_hours": {"start": "22:00", "end": "08:00"},
            "max_daily_notifications": 50,
            "preferred_categories": ["TASK", "ALERT"]
        },
        "voice_preferences": {
            "language": "en-US",
            "wake_word_enabled": True,
            "voice_feedback": True
        },
        "health_preferences": {
            "stress_threshold": 0.7,
            "energy_tracking": True,
            "coaching_enabled": True
        },
        "workflow_preferences": {
            "auto_execution": True,
            "confirmation_required": False,
            "preferred_execution_times": ["morning", "afternoon"]
        }
    }


# Test Data Generators
@pytest.fixture
def generate_test_notifications():
    """Factory function to generate test notifications."""
    def _generate(count: int, user_id: str = "test-user", **kwargs):
        notifications = []
        for i in range(count):
            notification = MobileNotification(
                id=f"gen-notif-{i}",
                title=f"Generated Notification {i}",
                content=f"Content for notification {i}",
                priority=kwargs.get("priority", NotificationPriority.MEDIUM),
                category=kwargs.get("category", NotificationCategory.TASK),
                user_id=user_id
            )
            notifications.append(notification)
        return notifications
    return _generate


@pytest.fixture
def generate_test_health_metrics():
    """Factory function to generate test health metrics."""
    def _generate(count: int, device_id: str = "test-device", **kwargs):
        metrics = []
        base_time = datetime.now()
        for i in range(count):
            metric = HealthMetrics(
                heart_rate=kwargs.get("heart_rate", 70 + i),
                stress_level=kwargs.get("stress_level", 0.3 + i * 0.1),
                energy_level=kwargs.get("energy_level", 0.8 - i * 0.05),
                sleep_quality=kwargs.get("sleep_quality", 0.7),
                activity_level=kwargs.get("activity_level", 0.6),
                timestamp=base_time + timedelta(minutes=i * 5),
                device_id=device_id
            )
            metrics.append(metric)
        return metrics
    return _generate


# Cleanup Fixtures
@pytest.fixture(autouse=True)
async def cleanup_after_test():
    """Automatically cleanup after each test."""
    yield
    # Cleanup code here if needed
    # For example: clear singleton instances, reset global state, etc.


# Pytest Configuration
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "mobile: mark test as mobile component test"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers automatically."""
    for item in items:
        # Add mobile marker to all tests in mobile directory
        if "mobile" in str(item.fspath):
            item.add_marker(pytest.mark.mobile)

        # Add integration marker to integration test classes
        if "Integration" in item.cls.__name__ if item.cls else False:
            item.add_marker(pytest.mark.integration)

        # Add unit marker to other tests
        elif not any(mark.name == "integration" for mark in item.iter_markers()):
            item.add_marker(pytest.mark.unit)


# Error Handling Fixtures
@pytest.fixture
def mock_exception_handler():
    """Provide a mock exception handler for testing error scenarios."""
    handler = Mock()
    handler.handle_exception = Mock()
    handler.log_error = Mock()
    return handler


# Performance Testing Fixtures
@pytest.fixture
def performance_timer():
    """Provide a performance timer for testing execution times."""
    import time

    class Timer:
        def __init__(self):
            self.start_time = None
            self.end_time = None

        def start(self):
            self.start_time = time.time()

        def stop(self):
            self.end_time = time.time()

        @property
        def elapsed(self):
            if self.start_time and self.end_time:
                return self.end_time - self.start_time
            return None

    return Timer()
