"""
Comprehensive tests for enhanced offline manager with robust sync conflict resolution.
"""

from datetime import datetime
from unittest.mock import Mock, patch

import pytest

from proxy_agent_platform.mobile.offline_manager import (
    AdvancedConflictResolver,
    BandwidthMonitor,
    ConflictResolution,
    NetworkState,
    OfflineManager,
    OfflineQueueManager,
    ProgressiveSyncManager,
    SyncConfiguration,
    SyncOperation,
    SyncPriority,
)


class TestSyncOperation:
    """Test SyncOperation dataclass and methods."""

    def test_sync_operation_creation(self):
        """Test sync operation creation with all fields."""
        operation = SyncOperation(
            id="op-123",
            operation_type="CREATE",
            entity_type="task",
            entity_id="task-456",
            data={"title": "Test Task", "completed": False},
            priority=SyncPriority.HIGH,
            user_id="user-789"
        )

        assert operation.id == "op-123"
        assert operation.operation_type == "CREATE"
        assert operation.entity_type == "task"
        assert operation.priority == SyncPriority.HIGH
        assert operation.retry_count == 0
        assert isinstance(operation.created_at, datetime)

    def test_sync_operation_retry_logic(self):
        """Test retry logic and backoff calculation."""
        operation = SyncOperation(
            id="retry-test",
            operation_type="UPDATE",
            entity_type="note",
            entity_id="note-123",
            data={"content": "Updated content"},
            priority=SyncPriority.MEDIUM
        )

        # Test initial state
        assert operation.retry_count == 0
        assert operation.next_retry is None

        # Test retry increment
        operation.increment_retry()
        assert operation.retry_count == 1
        assert operation.next_retry is not None
        assert operation.next_retry > datetime.now()

        # Test backoff calculation
        first_retry = operation.next_retry
        operation.increment_retry()
        second_retry = operation.next_retry

        # Second retry should be scheduled later than first
        assert second_retry > first_retry

    def test_sync_operation_serialization(self):
        """Test operation serialization for storage."""
        operation = SyncOperation(
            id="serialize-test",
            operation_type="DELETE",
            entity_type="contact",
            entity_id="contact-789",
            data={},
            priority=SyncPriority.LOW
        )

        # Convert to dict
        op_dict = operation.to_dict()
        assert op_dict["id"] == "serialize-test"
        assert op_dict["priority"] == SyncPriority.LOW.value

        # Convert back from dict
        restored = SyncOperation.from_dict(op_dict)
        assert restored.id == operation.id
        assert restored.priority == operation.priority


class TestAdvancedConflictResolver:
    """Test advanced conflict resolution strategies."""

    def setup_method(self):
        """Set up test fixtures."""
        self.resolver = AdvancedConflictResolver()

    def test_merge_resolution_strategy(self):
        """Test merge conflict resolution."""
        local_data = {
            "title": "Local Task",
            "description": "Local description",
            "completed": False,
            "updated_at": "2023-10-01T10:00:00Z"
        }

        remote_data = {
            "title": "Remote Task",
            "priority": "high",
            "completed": True,
            "updated_at": "2023-10-01T11:00:00Z"
        }

        resolution = self.resolver.resolve_conflict(
            local_data, remote_data, ConflictResolution.MERGE
        )

        assert resolution.strategy == ConflictResolution.MERGE
        result = resolution.resolved_data

        # Should combine non-conflicting fields
        assert result["description"] == "Local description"
        assert result["priority"] == "high"

        # Should use most recent for conflicting fields
        assert result["title"] == "Remote Task"
        assert result["completed"] is True

    def test_timestamp_resolution_strategy(self):
        """Test timestamp-based conflict resolution."""
        older_data = {
            "content": "Older content",
            "updated_at": "2023-10-01T09:00:00Z"
        }

        newer_data = {
            "content": "Newer content",
            "updated_at": "2023-10-01T12:00:00Z"
        }

        resolution = self.resolver.resolve_conflict(
            older_data, newer_data, ConflictResolution.TIMESTAMP
        )

        assert resolution.strategy == ConflictResolution.TIMESTAMP
        assert resolution.resolved_data["content"] == "Newer content"

    def test_user_preference_resolution(self):
        """Test user preference-based conflict resolution."""
        local_data = {"title": "Local Title", "author": "user-123"}
        remote_data = {"title": "Remote Title", "author": "user-456"}

        # Mock user preferences favoring local changes
        with patch.object(self.resolver, '_get_user_preference') as mock_pref:
            mock_pref.return_value = "local"

            resolution = self.resolver.resolve_conflict(
                local_data, remote_data, ConflictResolution.USER_PREFERENCE
            )

            assert resolution.resolved_data["title"] == "Local Title"

    def test_field_priority_resolution(self):
        """Test field priority-based conflict resolution."""
        local_data = {
            "title": "Local Title",
            "status": "in_progress",
            "notes": "Local notes"
        }

        remote_data = {
            "title": "Remote Title",
            "status": "completed",
            "priority": "high"
        }

        # Define field priorities (higher number = higher priority)
        field_priorities = {
            "status": 10,  # Status changes are most important
            "title": 5,
            "notes": 3,
            "priority": 7
        }

        resolution = self.resolver.resolve_conflict(
            local_data, remote_data, ConflictResolution.FIELD_PRIORITY,
            field_priorities=field_priorities
        )

        result = resolution.resolved_data

        # Should keep local status (higher priority field)
        assert result["status"] == "in_progress"
        # Should keep remote priority (higher priority field)
        assert result["priority"] == "high"

    def test_conflict_detection(self):
        """Test conflict detection logic."""
        identical_data = {"title": "Same", "status": "active"}
        no_conflict = self.resolver._detect_conflicts(identical_data, identical_data)
        assert len(no_conflict) == 0

        different_data1 = {"title": "First", "status": "active"}
        different_data2 = {"title": "Second", "status": "active"}
        conflicts = self.resolver._detect_conflicts(different_data1, different_data2)
        assert "title" in conflicts
        assert "status" not in conflicts


class TestProgressiveSyncManager:
    """Test progressive synchronization management."""

    def setup_method(self):
        """Set up test fixtures."""
        self.sync_manager = ProgressiveSyncManager()

    async def test_progressive_sync_priority_ordering(self):
        """Test progressive sync respects priority ordering."""
        operations = [
            SyncOperation(
                id="low-1", operation_type="UPDATE", entity_type="note",
                entity_id="note-1", data={}, priority=SyncPriority.LOW
            ),
            SyncOperation(
                id="urgent-1", operation_type="CREATE", entity_type="task",
                entity_id="task-1", data={}, priority=SyncPriority.URGENT
            ),
            SyncOperation(
                id="high-1", operation_type="UPDATE", entity_type="contact",
                entity_id="contact-1", data={}, priority=SyncPriority.HIGH
            )
        ]

        # Mock network conditions
        network_state = NetworkState(
            is_connected=True,
            bandwidth_mbps=5.0,
            latency_ms=50,
            is_metered=False
        )

        with patch.object(self.sync_manager, '_sync_operation') as mock_sync:
            mock_sync.return_value = True

            synced_ops = await self.sync_manager.progressive_sync(operations, network_state)

            # Should sync in priority order: URGENT, HIGH, LOW
            sync_calls = mock_sync.call_args_list
            assert len(sync_calls) == 3

            # Verify order by checking operation IDs
            synced_ids = [call[0][0].id for call in sync_calls]
            assert synced_ids == ["urgent-1", "high-1", "low-1"]

    async def test_progressive_sync_bandwidth_limiting(self):
        """Test progressive sync adapts to bandwidth limitations."""
        operations = []
        for i in range(10):
            op = SyncOperation(
                id=f"op-{i}", operation_type="UPDATE", entity_type="large_file",
                entity_id=f"file-{i}", data={"size": "10MB"}, priority=SyncPriority.MEDIUM
            )
            operations.append(op)

        # Low bandwidth scenario
        low_bandwidth = NetworkState(
            is_connected=True,
            bandwidth_mbps=0.5,  # Very low bandwidth
            latency_ms=200,
            is_metered=True
        )

        with patch.object(self.sync_manager, '_sync_operation') as mock_sync:
            mock_sync.return_value = True

            synced_ops = await self.sync_manager.progressive_sync(operations, low_bandwidth)

            # Should sync fewer operations due to bandwidth constraints
            assert len(synced_ops) < len(operations)

    async def test_progressive_sync_failure_handling(self):
        """Test progressive sync handles failures gracefully."""
        operations = [
            SyncOperation(
                id="fail-op", operation_type="CREATE", entity_type="task",
                entity_id="task-fail", data={}, priority=SyncPriority.HIGH
            ),
            SyncOperation(
                id="success-op", operation_type="UPDATE", entity_type="note",
                entity_id="note-success", data={}, priority=SyncPriority.HIGH
            )
        ]

        network_state = NetworkState(
            is_connected=True,
            bandwidth_mbps=10.0,
            latency_ms=30,
            is_metered=False
        )

        def mock_sync_side_effect(operation):
            # First operation fails, second succeeds
            return operation.id == "success-op"

        with patch.object(self.sync_manager, '_sync_operation', side_effect=mock_sync_side_effect):
            synced_ops = await self.sync_manager.progressive_sync(operations, network_state)

            # Should have synced only the successful operation
            assert len(synced_ops) == 1
            assert synced_ops[0].id == "success-op"

    def test_calculate_sync_batch_size(self):
        """Test sync batch size calculation based on network conditions."""
        # High bandwidth scenario
        high_bandwidth = NetworkState(
            is_connected=True,
            bandwidth_mbps=50.0,
            latency_ms=20,
            is_metered=False
        )

        high_batch_size = self.sync_manager._calculate_sync_batch_size(high_bandwidth)
        assert high_batch_size > 5

        # Low bandwidth scenario
        low_bandwidth = NetworkState(
            is_connected=True,
            bandwidth_mbps=1.0,
            latency_ms=500,
            is_metered=True
        )

        low_batch_size = self.sync_manager._calculate_sync_batch_size(low_bandwidth)
        assert low_batch_size <= high_batch_size


class TestOfflineQueueManager:
    """Test offline queue management functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.queue_manager = OfflineQueueManager()

    async def test_add_operation_to_queue(self):
        """Test adding operations to the offline queue."""
        operation = SyncOperation(
            id="queue-test",
            operation_type="CREATE",
            entity_type="task",
            entity_id="task-queue",
            data={"title": "Queued Task"},
            priority=SyncPriority.MEDIUM
        )

        await self.queue_manager.add_operation(operation)

        # Verify operation is in queue
        queue_size = await self.queue_manager.get_queue_size()
        assert queue_size == 1

        operations = await self.queue_manager.get_pending_operations()
        assert len(operations) == 1
        assert operations[0].id == "queue-test"

    async def test_priority_queue_ordering(self):
        """Test priority-based queue ordering."""
        operations = [
            SyncOperation(id="low", operation_type="UPDATE", entity_type="note",
                         entity_id="note-1", data={}, priority=SyncPriority.LOW),
            SyncOperation(id="urgent", operation_type="CREATE", entity_type="task",
                         entity_id="task-1", data={}, priority=SyncPriority.URGENT),
            SyncOperation(id="medium", operation_type="UPDATE", entity_type="contact",
                         entity_id="contact-1", data={}, priority=SyncPriority.MEDIUM),
        ]

        # Add operations in random order
        for op in operations:
            await self.queue_manager.add_operation(op)

        # Get operations - should be ordered by priority
        pending_ops = await self.queue_manager.get_pending_operations()
        priorities = [op.priority for op in pending_ops]

        # Should be ordered: URGENT, MEDIUM, LOW
        expected_order = [SyncPriority.URGENT, SyncPriority.MEDIUM, SyncPriority.LOW]
        assert priorities == expected_order

    async def test_remove_operation_from_queue(self):
        """Test removing operations from the queue."""
        operation = SyncOperation(
            id="remove-test",
            operation_type="DELETE",
            entity_type="contact",
            entity_id="contact-remove",
            data={},
            priority=SyncPriority.HIGH
        )

        await self.queue_manager.add_operation(operation)
        assert await self.queue_manager.get_queue_size() == 1

        success = await self.queue_manager.remove_operation("remove-test")
        assert success is True
        assert await self.queue_manager.get_queue_size() == 0

    async def test_clear_queue(self):
        """Test clearing the entire queue."""
        # Add multiple operations
        for i in range(5):
            op = SyncOperation(
                id=f"clear-{i}", operation_type="UPDATE", entity_type="note",
                entity_id=f"note-{i}", data={}, priority=SyncPriority.LOW
            )
            await self.queue_manager.add_operation(op)

        assert await self.queue_manager.get_queue_size() == 5

        await self.queue_manager.clear_queue()
        assert await self.queue_manager.get_queue_size() == 0

    async def test_persistent_queue_storage(self):
        """Test queue persistence across restarts."""
        operation = SyncOperation(
            id="persist-test",
            operation_type="CREATE",
            entity_type="reminder",
            entity_id="reminder-persist",
            data={"message": "Persistent reminder"},
            priority=SyncPriority.HIGH
        )

        # Add operation and simulate storage
        await self.queue_manager.add_operation(operation)

        with patch.object(self.queue_manager, '_save_queue_to_storage') as mock_save:
            await self.queue_manager._persist_queue()
            mock_save.assert_called_once()

        # Simulate loading from storage
        with patch.object(self.queue_manager, '_load_queue_from_storage') as mock_load:
            mock_load.return_value = [operation.to_dict()]

            new_queue_manager = OfflineQueueManager()
            await new_queue_manager._restore_queue()

            restored_ops = await new_queue_manager.get_pending_operations()
            assert len(restored_ops) == 1
            assert restored_ops[0].id == "persist-test"


class TestBandwidthMonitor:
    """Test bandwidth monitoring and network state tracking."""

    def setup_method(self):
        """Set up test fixtures."""
        self.monitor = BandwidthMonitor()

    async def test_network_state_detection(self):
        """Test network state detection and monitoring."""
        with patch.object(self.monitor, '_measure_bandwidth') as mock_bandwidth, \
             patch.object(self.monitor, '_measure_latency') as mock_latency, \
             patch.object(self.monitor, '_is_metered_connection') as mock_metered:

            mock_bandwidth.return_value = 25.5
            mock_latency.return_value = 45
            mock_metered.return_value = False

            network_state = await self.monitor.get_current_network_state()

            assert network_state.is_connected is True
            assert network_state.bandwidth_mbps == 25.5
            assert network_state.latency_ms == 45
            assert network_state.is_metered is False

    async def test_bandwidth_measurement(self):
        """Test bandwidth measurement functionality."""
        # Mock network speed test
        with patch.object(self.monitor, '_perform_speed_test') as mock_speed_test:
            mock_speed_test.return_value = {
                "download_mbps": 45.2,
                "upload_mbps": 12.8,
                "latency_ms": 35
            }

            bandwidth = await self.monitor._measure_bandwidth()
            latency = await self.monitor._measure_latency()

            assert bandwidth == 45.2  # Download speed
            assert latency == 35

    async def test_network_quality_assessment(self):
        """Test network quality assessment."""
        # High quality network
        high_quality_state = NetworkState(
            is_connected=True,
            bandwidth_mbps=100.0,
            latency_ms=20,
            is_metered=False
        )

        quality = self.monitor.assess_network_quality(high_quality_state)
        assert quality == "excellent"

        # Poor quality network
        poor_quality_state = NetworkState(
            is_connected=True,
            bandwidth_mbps=0.5,
            latency_ms=2000,
            is_metered=True
        )

        quality = self.monitor.assess_network_quality(poor_quality_state)
        assert quality == "poor"

    async def test_adaptive_sync_recommendations(self):
        """Test adaptive sync recommendations based on network state."""
        # Mobile/metered connection
        mobile_state = NetworkState(
            is_connected=True,
            bandwidth_mbps=5.0,
            latency_ms=150,
            is_metered=True
        )

        recommendations = self.monitor.get_sync_recommendations(mobile_state)

        assert recommendations["batch_size"] <= 3
        assert recommendations["delay_between_batches"] >= 2.0
        assert recommendations["compress_data"] is True

        # WiFi connection
        wifi_state = NetworkState(
            is_connected=True,
            bandwidth_mbps=50.0,
            latency_ms=30,
            is_metered=False
        )

        recommendations = self.monitor.get_sync_recommendations(wifi_state)

        assert recommendations["batch_size"] >= 10
        assert recommendations["delay_between_batches"] <= 1.0


@pytest.mark.asyncio
class TestOfflineManager:
    """Test the main OfflineManager class."""

    def setup_method(self):
        """Set up test fixtures."""
        config = SyncConfiguration(
            max_retry_attempts=3,
            base_retry_delay=1.0,
            sync_batch_size=5,
            enable_compression=True
        )
        self.manager = OfflineManager(config=config)

    async def test_sync_when_online(self):
        """Test synchronization when device comes online."""
        # Add some offline operations
        operations = []
        for i in range(3):
            op = SyncOperation(
                id=f"sync-{i}", operation_type="CREATE", entity_type="task",
                entity_id=f"task-{i}", data={"title": f"Task {i}"},
                priority=SyncPriority.MEDIUM
            )
            operations.append(op)
            await self.manager.add_offline_operation(op)

        # Mock successful sync
        with patch.object(self.manager.progressive_sync, 'progressive_sync') as mock_sync:
            mock_sync.return_value = operations  # All operations synced successfully

            result = await self.manager.sync_when_online()

            assert result is True
            mock_sync.assert_called_once()

    async def test_add_offline_operation(self):
        """Test adding operations while offline."""
        operation = SyncOperation(
            id="offline-op",
            operation_type="UPDATE",
            entity_type="note",
            entity_id="note-offline",
            data={"content": "Updated offline"},
            priority=SyncPriority.HIGH
        )

        await self.manager.add_offline_operation(operation)

        # Verify operation is queued
        pending = await self.manager.queue_manager.get_pending_operations()
        assert len(pending) == 1
        assert pending[0].id == "offline-op"

    async def test_conflict_resolution_during_sync(self):
        """Test conflict resolution during synchronization."""
        # Create operation with potential conflict
        operation = SyncOperation(
            id="conflict-op",
            operation_type="UPDATE",
            entity_type="task",
            entity_id="task-conflict",
            data={"title": "Local Update", "updated_at": "2023-10-01T10:00:00Z"},
            priority=SyncPriority.MEDIUM
        )

        await self.manager.add_offline_operation(operation)

        # Mock server response with conflicting data
        server_data = {
            "title": "Server Update",
            "description": "Server added description",
            "updated_at": "2023-10-01T11:00:00Z"
        }

        with patch.object(self.manager, '_fetch_server_data') as mock_fetch, \
             patch.object(self.manager.conflict_resolver, 'resolve_conflict') as mock_resolve:

            mock_fetch.return_value = server_data
            mock_resolve.return_value.strategy = ConflictResolution.MERGE
            mock_resolve.return_value.resolved_data = {
                "title": "Server Update",  # Server wins on title (newer timestamp)
                "description": "Server added description",
                "updated_at": "2023-10-01T11:00:00Z"
            }

            result = await self.manager.sync_when_online()

            # Should have resolved conflict and synced
            mock_resolve.assert_called_once()

    async def test_retry_failed_operations(self):
        """Test retry mechanism for failed operations."""
        # Create operation that will fail initially
        operation = SyncOperation(
            id="retry-op",
            operation_type="CREATE",
            entity_type="contact",
            entity_id="contact-retry",
            data={"name": "Retry Contact"},
            priority=SyncPriority.HIGH
        )

        await self.manager.add_offline_operation(operation)

        # Mock sync failure then success
        sync_attempts = []

        def mock_sync_side_effect(operations, network_state):
            sync_attempts.append(len(operations))
            if len(sync_attempts) == 1:
                # First attempt fails
                return []
            else:
                # Second attempt succeeds
                return operations

        with patch.object(self.manager.progressive_sync, 'progressive_sync', side_effect=mock_sync_side_effect):
            # First sync attempt (fails)
            result1 = await self.manager.sync_when_online()
            assert result1 is False  # Failed to sync all operations

            # Second sync attempt (succeeds)
            result2 = await self.manager.sync_when_online()
            assert result2 is True  # All operations synced

            # Verify retry was attempted
            assert len(sync_attempts) == 2

    async def test_get_sync_statistics(self):
        """Test sync statistics and metrics reporting."""
        # Add some operations and simulate sync
        for i in range(5):
            op = SyncOperation(
                id=f"stats-{i}", operation_type="UPDATE", entity_type="task",
                entity_id=f"task-{i}", data={}, priority=SyncPriority.LOW
            )
            await self.manager.add_offline_operation(op)

        # Mock partial sync success
        with patch.object(self.manager.progressive_sync, 'progressive_sync') as mock_sync:
            mock_sync.return_value = [op for op in []]  # Sync 3 out of 5

            await self.manager.sync_when_online()

        stats = await self.manager.get_sync_statistics()

        assert "total_operations" in stats
        assert "pending_operations" in stats
        assert "sync_success_rate" in stats
        assert stats["total_operations"] >= 5

    async def test_clear_sync_queue(self):
        """Test clearing the sync queue."""
        # Add operations
        for i in range(3):
            op = SyncOperation(
                id=f"clear-{i}", operation_type="DELETE", entity_type="note",
                entity_id=f"note-{i}", data={}, priority=SyncPriority.LOW
            )
            await self.manager.add_offline_operation(op)

        # Verify operations are queued
        stats_before = await self.manager.get_sync_statistics()
        assert stats_before["pending_operations"] == 3

        # Clear queue
        await self.manager.clear_sync_queue()

        # Verify queue is empty
        stats_after = await self.manager.get_sync_statistics()
        assert stats_after["pending_operations"] == 0

    async def test_network_state_monitoring(self):
        """Test network state monitoring and adaptive behavior."""
        # Simulate network state changes
        with patch.object(self.manager.bandwidth_monitor, 'get_current_network_state') as mock_network:
            # Start with offline state
            mock_network.return_value = NetworkState(
                is_connected=False,
                bandwidth_mbps=0.0,
                latency_ms=0,
                is_metered=False
            )

            is_online = await self.manager.is_online()
            assert is_online is False

            # Change to online state
            mock_network.return_value = NetworkState(
                is_connected=True,
                bandwidth_mbps=25.0,
                latency_ms=50,
                is_metered=False
            )

            is_online = await self.manager.is_online()
            assert is_online is True


@pytest.mark.integration
class TestOfflineManagerIntegration:
    """Integration tests for offline manager with external dependencies."""

    @pytest.fixture
    def manager_with_mocks(self):
        """Create manager with mocked external dependencies."""
        config = SyncConfiguration(
            max_retry_attempts=2,
            base_retry_delay=0.1,  # Faster for testing
            sync_batch_size=3
        )
        manager = OfflineManager(config=config)

        # Mock external services
        manager._api_client = Mock()
        manager._storage_service = Mock()
        manager._network_service = Mock()

        return manager

    async def test_end_to_end_offline_sync_flow(self, manager_with_mocks):
        """Test complete offline to online sync flow."""
        manager = manager_with_mocks

        # Configure mocks
        manager._api_client.sync_operation.return_value = True
        manager._network_service.is_connected.return_value = True

        # Add offline operations
        operations = []
        for i in range(4):
            op = SyncOperation(
                id=f"e2e-{i}", operation_type="CREATE", entity_type="task",
                entity_id=f"task-{i}", data={"title": f"Task {i}"},
                priority=SyncPriority.MEDIUM if i < 2 else SyncPriority.LOW
            )
            operations.append(op)
            await manager.add_offline_operation(op)

        # Trigger sync when online
        result = await manager.sync_when_online()

        assert result is True
        # Verify API calls were made
        assert manager._api_client.sync_operation.call_count == 4

    async def test_partial_sync_with_failures(self, manager_with_mocks):
        """Test handling of partial sync failures."""
        manager = manager_with_mocks

        # Configure mock to fail some operations
        def mock_sync_side_effect(operation):
            # Fail operations with odd IDs
            return "odd" not in operation.id

        manager._api_client.sync_operation.side_effect = mock_sync_side_effect

        # Add operations
        success_op = SyncOperation(
            id="even-success", operation_type="UPDATE", entity_type="note",
            entity_id="note-even", data={}, priority=SyncPriority.HIGH
        )
        fail_op = SyncOperation(
            id="odd-fail", operation_type="CREATE", entity_type="task",
            entity_id="task-odd", data={}, priority=SyncPriority.HIGH
        )

        await manager.add_offline_operation(success_op)
        await manager.add_offline_operation(fail_op)

        # Attempt sync
        result = await manager.sync_when_online()

        # Should be partial success
        stats = await manager.get_sync_statistics()
        assert stats["pending_operations"] == 1  # Failed operation still pending


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
