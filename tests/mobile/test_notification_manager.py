"""
Comprehensive tests for enhanced notification manager with ML-based timing optimization.
"""

import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

import pytest

from proxy_agent_platform.mobile.notification_manager import (
    BatchProcessingConfig,
    ConflictResolution,
    MLTimingPredictor,
    MobileNotification,
    NotificationCategory,
    NotificationConflictResolver,
    NotificationGrouping,
    NotificationManager,
    NotificationPriority,
)


class TestMobileNotification:
    """Test MobileNotification dataclass and methods."""

    def test_notification_creation(self):
        """Test notification creation with all fields."""
        notification = MobileNotification(
            id="test-123",
            title="Test Notification",
            content="Test content",
            priority=NotificationPriority.HIGH,
            category=NotificationCategory.TASK,
            user_id="user-456"
        )

        assert notification.id == "test-123"
        assert notification.title == "Test Notification"
        assert notification.priority == NotificationPriority.HIGH
        assert notification.category == NotificationCategory.TASK
        assert isinstance(notification.created_at, datetime)
        assert notification.scheduled_for is None
        assert not notification.is_delivered

    def test_notification_should_batch_logic(self):
        """Test notification batching decision logic."""
        notification = MobileNotification(
            id="test-123",
            title="Test",
            content="Content",
            priority=NotificationPriority.LOW,
            category=NotificationCategory.SYSTEM
        )

        # Low priority system notifications should batch
        assert notification.should_batch() is True

        # High priority notifications should not batch
        notification.priority = NotificationPriority.URGENT
        assert notification.should_batch() is False

        # Task notifications should not batch by default
        notification.category = NotificationCategory.TASK
        notification.priority = NotificationPriority.MEDIUM
        assert notification.should_batch() is False


class TestNotificationConflictResolver:
    """Test notification conflict resolution logic."""

    def setup_method(self):
        """Set up test fixtures."""
        self.resolver = NotificationConflictResolver()
        self.base_notification = MobileNotification(
            id="base-123",
            title="Base Notification",
            content="Base content",
            priority=NotificationPriority.MEDIUM,
            category=NotificationCategory.TASK,
            user_id="user-1"
        )

    def test_merge_resolution(self):
        """Test merging conflicting notifications."""
        conflict_notification = MobileNotification(
            id="conflict-456",
            title="Conflict Notification",
            content="Conflict content",
            priority=NotificationPriority.HIGH,
            category=NotificationCategory.TASK,
            user_id="user-1"
        )

        resolution = self.resolver.resolve_conflict(
            self.base_notification,
            conflict_notification,
            ConflictResolution.MERGE
        )

        assert resolution.strategy == ConflictResolution.MERGE
        assert resolution.resulting_notification.priority == NotificationPriority.HIGH
        assert "Base content" in resolution.resulting_notification.content
        assert "Conflict content" in resolution.resulting_notification.content

    def test_replace_resolution(self):
        """Test replacing with higher priority notification."""
        higher_priority = MobileNotification(
            id="high-789",
            title="High Priority",
            content="Urgent content",
            priority=NotificationPriority.URGENT,
            category=NotificationCategory.ALERT,
            user_id="user-1"
        )

        resolution = self.resolver.resolve_conflict(
            self.base_notification,
            higher_priority,
            ConflictResolution.REPLACE
        )

        assert resolution.strategy == ConflictResolution.REPLACE
        assert resolution.resulting_notification.id == "high-789"
        assert resolution.resulting_notification.priority == NotificationPriority.URGENT

    def test_batch_resolution(self):
        """Test batching similar notifications."""
        similar_notification = MobileNotification(
            id="similar-321",
            title="Similar Notification",
            content="Similar content",
            priority=NotificationPriority.LOW,
            category=NotificationCategory.SYSTEM,
            user_id="user-1"
        )

        resolution = self.resolver.resolve_conflict(
            self.base_notification,
            similar_notification,
            ConflictResolution.BATCH
        )

        assert resolution.strategy == ConflictResolution.BATCH
        assert len(resolution.batched_notifications) == 2


class TestMLTimingPredictor:
    """Test ML-based timing prediction functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.predictor = MLTimingPredictor()

    @patch('proxy_agent_platform.mobile.notification_manager.RandomForestRegressor')
    @patch('proxy_agent_platform.mobile.notification_manager.StandardScaler')
    def test_predictor_initialization(self, mock_scaler, mock_rf):
        """Test ML model initialization."""
        predictor = MLTimingPredictor()

        mock_rf.assert_called_once()
        mock_scaler.assert_called_once()
        assert predictor.model is not None
        assert predictor.scaler is not None

    def test_feature_extraction(self):
        """Test feature extraction for ML model."""
        notification = MobileNotification(
            id="test-123",
            title="Test Notification",
            content="Test content",
            priority=NotificationPriority.HIGH,
            category=NotificationCategory.TASK,
            user_id="user-1"
        )

        features = self.predictor._extract_features(notification, {})

        assert len(features) == 6  # Expected number of features
        assert features[0] == NotificationPriority.HIGH.value
        assert features[1] == NotificationCategory.TASK.value
        assert features[2] == len("Test content")
        # Time-based features should be reasonable
        assert 0 <= features[3] <= 23  # Hour of day
        assert 0 <= features[4] <= 6   # Day of week

    @patch.object(MLTimingPredictor, '_extract_features')
    def test_predict_optimal_timing(self, mock_extract):
        """Test optimal timing prediction."""
        mock_extract.return_value = [3, 1, 50, 14, 2, 0]

        # Mock the model prediction
        self.predictor.model.predict = Mock(return_value=[0.8])
        self.predictor.scaler.transform = Mock(return_value=[[3, 1, 50, 14, 2, 0]])

        notification = MobileNotification(
            id="test-123",
            title="Test",
            content="Test content",
            priority=NotificationPriority.MEDIUM,
            category=NotificationCategory.TASK,
            user_id="user-1"
        )

        optimal_time = self.predictor.predict_optimal_timing(notification, {})

        assert isinstance(optimal_time, datetime)
        # Should be scheduled for future
        assert optimal_time > datetime.now()


class TestNotificationGrouping:
    """Test notification grouping and batching logic."""

    def setup_method(self):
        """Set up test fixtures."""
        self.grouping = NotificationGrouping()

    def test_group_by_category(self):
        """Test grouping notifications by category."""
        notifications = [
            MobileNotification(
                id="task1", title="Task 1", content="Content 1",
                priority=NotificationPriority.MEDIUM,
                category=NotificationCategory.TASK, user_id="user-1"
            ),
            MobileNotification(
                id="task2", title="Task 2", content="Content 2",
                priority=NotificationPriority.LOW,
                category=NotificationCategory.TASK, user_id="user-1"
            ),
            MobileNotification(
                id="alert1", title="Alert 1", content="Alert content",
                priority=NotificationPriority.HIGH,
                category=NotificationCategory.ALERT, user_id="user-1"
            )
        ]

        groups = self.grouping.group_by_category(notifications)

        assert len(groups[NotificationCategory.TASK]) == 2
        assert len(groups[NotificationCategory.ALERT]) == 1
        assert groups[NotificationCategory.TASK][0].id == "task1"

    def test_group_by_priority(self):
        """Test grouping notifications by priority."""
        notifications = [
            MobileNotification(
                id="high1", title="High 1", content="Content",
                priority=NotificationPriority.HIGH,
                category=NotificationCategory.TASK, user_id="user-1"
            ),
            MobileNotification(
                id="high2", title="High 2", content="Content",
                priority=NotificationPriority.HIGH,
                category=NotificationCategory.ALERT, user_id="user-1"
            ),
            MobileNotification(
                id="low1", title="Low 1", content="Content",
                priority=NotificationPriority.LOW,
                category=NotificationCategory.SYSTEM, user_id="user-1"
            )
        ]

        groups = self.grouping.group_by_priority(notifications)

        assert len(groups[NotificationPriority.HIGH]) == 2
        assert len(groups[NotificationPriority.LOW]) == 1

    def test_create_batch_notification(self):
        """Test creating a batch notification from group."""
        notifications = [
            MobileNotification(
                id="n1", title="Notification 1", content="Content 1",
                priority=NotificationPriority.LOW,
                category=NotificationCategory.SYSTEM, user_id="user-1"
            ),
            MobileNotification(
                id="n2", title="Notification 2", content="Content 2",
                priority=NotificationPriority.LOW,
                category=NotificationCategory.SYSTEM, user_id="user-1"
            )
        ]

        batch = self.grouping.create_batch_notification(notifications)

        assert "2 system notifications" in batch.title
        assert batch.category == NotificationCategory.SYSTEM
        assert batch.priority == NotificationPriority.LOW
        assert len(batch.metadata.get("batched_ids", [])) == 2


@pytest.mark.asyncio
class TestNotificationManager:
    """Test the main NotificationManager class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.config = BatchProcessingConfig(
            batch_size=5,
            batch_interval_seconds=10,
            max_batch_wait_seconds=30
        )
        self.manager = NotificationManager(batch_config=self.config)

    async def test_send_notification_immediate(self):
        """Test sending immediate high-priority notification."""
        notification = MobileNotification(
            id="urgent-123",
            title="Urgent Task",
            content="Critical issue",
            priority=NotificationPriority.URGENT,
            category=NotificationCategory.ALERT,
            user_id="user-1"
        )

        with patch.object(self.manager, '_deliver_notification') as mock_deliver:
            mock_deliver.return_value = True

            result = await self.manager.send_notification(notification)

            assert result is True
            mock_deliver.assert_called_once_with(notification)

    async def test_send_notification_batched(self):
        """Test sending batchable notification."""
        notification = MobileNotification(
            id="low-123",
            title="System Update",
            content="Update available",
            priority=NotificationPriority.LOW,
            category=NotificationCategory.SYSTEM,
            user_id="user-1"
        )

        result = await self.manager.send_notification(notification)

        assert result is True
        assert len(self.manager.batch_queue) == 1
        assert self.manager.batch_queue[0].id == "low-123"

    async def test_batch_processing(self):
        """Test batch processing of queued notifications."""
        # Add multiple batchable notifications
        notifications = []
        for i in range(3):
            notification = MobileNotification(
                id=f"batch-{i}",
                title=f"System {i}",
                content=f"Content {i}",
                priority=NotificationPriority.LOW,
                category=NotificationCategory.SYSTEM,
                user_id="user-1"
            )
            notifications.append(notification)
            await self.manager.send_notification(notification)

        assert len(self.manager.batch_queue) == 3

        with patch.object(self.manager, '_deliver_notification') as mock_deliver:
            mock_deliver.return_value = True

            processed = await self.manager.batch_process_notifications()

            assert processed == 1  # Should create 1 batch notification
            assert len(self.manager.batch_queue) == 0
            mock_deliver.assert_called_once()

    async def test_schedule_notification(self):
        """Test scheduling notification for future delivery."""
        notification = MobileNotification(
            id="scheduled-123",
            title="Scheduled Task",
            content="Future reminder",
            priority=NotificationPriority.MEDIUM,
            category=NotificationCategory.TASK,
            user_id="user-1"
        )

        future_time = datetime.now() + timedelta(hours=1)

        with patch.object(self.manager.timing_predictor, 'predict_optimal_timing') as mock_predict:
            mock_predict.return_value = future_time

            result = await self.manager.schedule_notification(notification)

            assert result is True
            assert notification.scheduled_for == future_time
            assert len(self.manager.scheduled_notifications) == 1

    async def test_get_user_preferences(self):
        """Test retrieving user notification preferences."""
        with patch.object(self.manager, '_load_user_preferences') as mock_load:
            mock_load.return_value = {
                "quiet_hours": {"start": "22:00", "end": "08:00"},
                "preferred_categories": ["TASK", "ALERT"],
                "max_daily_notifications": 50
            }

            prefs = await self.manager.get_user_preferences("user-1")

            assert "quiet_hours" in prefs
            assert prefs["max_daily_notifications"] == 50
            mock_load.assert_called_once_with("user-1")

    @patch('proxy_agent_platform.mobile.notification_manager.asyncio.sleep')
    async def test_process_batch_queue_timing(self, mock_sleep):
        """Test batch queue processing timing."""
        # Start the batch processor
        processor_task = asyncio.create_task(self.manager._process_batch_queue())

        # Add a notification
        notification = MobileNotification(
            id="batch-test",
            title="Batch Test",
            content="Test content",
            priority=NotificationPriority.LOW,
            category=NotificationCategory.SYSTEM,
            user_id="user-1"
        )

        await self.manager.send_notification(notification)

        # Let the processor run briefly
        await asyncio.sleep(0.1)
        processor_task.cancel()

        # Verify sleep was called with batch interval
        mock_sleep.assert_called_with(self.config.batch_interval_seconds)

    async def test_conflict_resolution_integration(self):
        """Test conflict resolution during notification processing."""
        # Create conflicting notifications
        notification1 = MobileNotification(
            id="conflict-1",
            title="Task Update",
            content="Original content",
            priority=NotificationPriority.MEDIUM,
            category=NotificationCategory.TASK,
            user_id="user-1"
        )

        notification2 = MobileNotification(
            id="conflict-2",
            title="Task Update",
            content="Updated content",
            priority=NotificationPriority.HIGH,
            category=NotificationCategory.TASK,
            user_id="user-1"
        )

        # Send first notification
        await self.manager.send_notification(notification1)

        # Send conflicting notification
        with patch.object(self.manager.conflict_resolver, 'resolve_conflict') as mock_resolve:
            mock_resolve.return_value.strategy = ConflictResolution.REPLACE
            mock_resolve.return_value.resulting_notification = notification2

            await self.manager.send_notification(notification2)

            # Should have called conflict resolution
            mock_resolve.assert_called_once()


@pytest.mark.integration
class TestNotificationManagerIntegration:
    """Integration tests for notification manager with external dependencies."""

    @pytest.fixture
    def manager_with_mocks(self):
        """Create manager with mocked external dependencies."""
        config = BatchProcessingConfig(
            batch_size=3,
            batch_interval_seconds=5,
            max_batch_wait_seconds=15
        )
        manager = NotificationManager(batch_config=config)

        # Mock external services
        manager._push_service = Mock()
        manager._analytics_service = Mock()
        manager._user_service = Mock()

        return manager

    async def test_end_to_end_notification_flow(self, manager_with_mocks):
        """Test complete notification flow from creation to delivery."""
        manager = manager_with_mocks

        # Configure mocks
        manager._push_service.send.return_value = True
        manager._user_service.get_preferences.return_value = {
            "device_tokens": ["token123"],
            "quiet_hours": None
        }

        notification = MobileNotification(
            id="e2e-test",
            title="End-to-End Test",
            content="Integration test notification",
            priority=NotificationPriority.HIGH,
            category=NotificationCategory.TASK,
            user_id="user-1"
        )

        # Send notification
        result = await manager.send_notification(notification)

        assert result is True
        assert notification.is_delivered

        # Verify external service calls
        manager._push_service.send.assert_called_once()
        manager._analytics_service.track_notification.assert_called_once()

    async def test_batch_processing_with_analytics(self, manager_with_mocks):
        """Test batch processing with analytics tracking."""
        manager = manager_with_mocks

        # Add multiple notifications for batching
        for i in range(4):
            notification = MobileNotification(
                id=f"batch-analytics-{i}",
                title=f"Batch {i}",
                content=f"Content {i}",
                priority=NotificationPriority.LOW,
                category=NotificationCategory.SYSTEM,
                user_id="user-1"
            )
            await manager.send_notification(notification)

        # Process batch
        processed = await manager.batch_process_notifications()

        assert processed > 0
        # Verify analytics tracking
        manager._analytics_service.track_batch_processing.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
