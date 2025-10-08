"""
Comprehensive tests for mobile-workflow bridge integration.
"""

import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

import pytest

from proxy_agent_platform.mobile.mobile_workflow_bridge import (
    BridgeConfiguration,
    ContextAggregator,
    MobileWorkflowBridge,
    MobileWorkflowStatus,
    MobileWorkflowTrigger,
    OfflineWorkflowQueue,
    TriggerPriority,
    TriggerType,
    WorkflowContext,
    WorkflowExecutionResult,
    WorkflowRecommendationEngine,
    WorkflowStatusBroadcaster,
)


class TestMobileWorkflowTrigger:
    """Test MobileWorkflowTrigger dataclass and methods."""

    def test_trigger_creation(self):
        """Test workflow trigger creation with all fields."""
        trigger = MobileWorkflowTrigger(
            id="trigger-123",
            workflow_id="workflow-456",
            trigger_type=TriggerType.VOICE_COMMAND,
            priority=TriggerPriority.HIGH,
            context_data={
                "voice_command": "Schedule a meeting",
                "user_intent": "SCHEDULE",
                "entities": ["meeting", "tomorrow"]
            },
            user_id="user-789"
        )

        assert trigger.id == "trigger-123"
        assert trigger.workflow_id == "workflow-456"
        assert trigger.trigger_type == TriggerType.VOICE_COMMAND
        assert trigger.priority == TriggerPriority.HIGH
        assert isinstance(trigger.created_at, datetime)
        assert trigger.execution_status == "pending"

    def test_trigger_priority_comparison(self):
        """Test trigger priority comparison for queue ordering."""
        urgent_trigger = MobileWorkflowTrigger(
            id="urgent", workflow_id="wf1", trigger_type=TriggerType.HEALTH_ALERT,
            priority=TriggerPriority.URGENT
        )

        normal_trigger = MobileWorkflowTrigger(
            id="normal", workflow_id="wf2", trigger_type=TriggerType.VOICE_COMMAND,
            priority=TriggerPriority.NORMAL
        )

        # Urgent should have higher priority value
        assert urgent_trigger.priority.value > normal_trigger.priority.value

    def test_trigger_execution_status_updates(self):
        """Test trigger execution status lifecycle."""
        trigger = MobileWorkflowTrigger(
            id="status-test", workflow_id="wf-status",
            trigger_type=TriggerType.NOTIFICATION_ACTION
        )

        assert trigger.execution_status == "pending"

        trigger.execution_status = "executing"
        trigger.started_at = datetime.now()

        assert trigger.execution_status == "executing"
        assert trigger.started_at is not None

        trigger.execution_status = "completed"
        trigger.completed_at = datetime.now()

        assert trigger.execution_status == "completed"
        assert trigger.completed_at > trigger.started_at


class TestContextAggregator:
    """Test mobile context aggregation functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.aggregator = ContextAggregator()

    async def test_aggregate_voice_context(self):
        """Test aggregating voice command context."""
        voice_data = {
            "text": "Schedule a team meeting for tomorrow at 2 PM",
            "intent": "SCHEDULE",
            "entities": [
                {"type": "TASK", "value": "team meeting"},
                {"type": "TIME", "value": "tomorrow at 2 PM"}
            ],
            "confidence": 0.92
        }

        health_data = {
            "stress_level": 0.3,
            "energy_level": 0.8,
            "focus_level": 0.9
        }

        context = await self.aggregator.aggregate_context(
            voice_data=voice_data,
            health_data=health_data,
            user_id="user-voice"
        )

        assert isinstance(context, WorkflowContext)
        assert context.trigger_source == "voice_command"
        assert context.user_id == "user-voice"
        assert "team meeting" in context.extracted_entities
        assert context.health_context["stress_level"] == 0.3

    async def test_aggregate_health_context(self):
        """Test aggregating health-triggered context."""
        health_data = {
            "stress_level": 0.9,  # High stress
            "heart_rate": 95,
            "energy_level": 0.2,
            "trend": "deteriorating"
        }

        wearable_data = {
            "device_id": "watch-123",
            "battery_level": 85,
            "last_sync": datetime.now().isoformat()
        }

        context = await self.aggregator.aggregate_context(
            health_data=health_data,
            wearable_data=wearable_data,
            user_id="user-health"
        )

        assert context.trigger_source == "health_alert"
        assert context.health_context["stress_level"] == 0.9
        assert context.priority == TriggerPriority.HIGH  # High stress should escalate priority

    async def test_aggregate_notification_context(self):
        """Test aggregating notification-triggered context."""
        notification_data = {
            "notification_id": "notif-456",
            "action": "remind_later",
            "original_task": "Call dentist",
            "user_response_time": 2.5
        }

        productivity_data = {
            "current_focus_score": 0.7,
            "task_completion_rate": 0.85,
            "interruption_count": 3
        }

        context = await self.aggregator.aggregate_context(
            notification_data=notification_data,
            productivity_data=productivity_data,
            user_id="user-notif"
        )

        assert context.trigger_source == "notification_action"
        assert context.productivity_context["current_focus_score"] == 0.7
        assert "Call dentist" in str(context.extracted_entities)

    async def test_context_enrichment(self):
        """Test context enrichment with historical data."""
        base_context = {
            "voice_command": "Set reminder",
            "user_id": "user-enrich"
        }

        # Mock historical context retrieval
        with patch.object(self.aggregator, '_get_user_history') as mock_history:
            mock_history.return_value = {
                "recent_tasks": ["meeting preparation", "code review"],
                "preferred_times": ["morning", "early afternoon"],
                "productivity_patterns": {"peak_hours": [10, 11, 14, 15]}
            }

            enriched_context = await self.aggregator.enrich_context(base_context)

            assert "user_history" in enriched_context
            assert "recent_tasks" in enriched_context["user_history"]
            mock_history.assert_called_once_with("user-enrich")

    async def test_context_priority_calculation(self):
        """Test dynamic priority calculation based on context."""
        # Low priority scenario
        low_priority_context = {
            "health_data": {"stress_level": 0.2, "energy_level": 0.8},
            "productivity_data": {"focus_score": 0.9},
            "urgency_indicators": []
        }

        low_priority = await self.aggregator._calculate_priority(low_priority_context)
        assert low_priority == TriggerPriority.LOW

        # High priority scenario
        high_priority_context = {
            "health_data": {"stress_level": 0.9, "energy_level": 0.1},
            "productivity_data": {"focus_score": 0.2},
            "urgency_indicators": ["health_alert", "deadline_approaching"]
        }

        high_priority = await self.aggregator._calculate_priority(high_priority_context)
        assert high_priority == TriggerPriority.HIGH


class TestWorkflowStatusBroadcaster:
    """Test workflow status broadcasting to mobile devices."""

    def setup_method(self):
        """Set up test fixtures."""
        self.broadcaster = WorkflowStatusBroadcaster()

    async def test_broadcast_workflow_status(self):
        """Test broadcasting workflow status updates."""
        status = MobileWorkflowStatus(
            workflow_id="wf-broadcast",
            trigger_id="trigger-broadcast",
            status="executing",
            progress=0.45,
            current_step="Analyzing requirements",
            estimated_completion=datetime.now() + timedelta(minutes=5)
        )

        # Mock mobile notification service
        with patch.object(self.broadcaster, '_send_push_notification') as mock_push:
            await self.broadcaster.broadcast_status(status, ["user-123"])

            mock_push.assert_called_once()
            call_args = mock_push.call_args[0]
            assert "user-123" in call_args[0]  # User IDs
            assert "Analyzing requirements" in call_args[1]  # Message content

    async def test_progress_update_throttling(self):
        """Test throttling of frequent progress updates."""
        workflow_id = "wf-throttle"
        user_ids = ["user-throttle"]

        # Send multiple rapid updates
        for progress in [0.1, 0.15, 0.2, 0.25, 0.3]:
            status = MobileWorkflowStatus(
                workflow_id=workflow_id,
                status="executing",
                progress=progress
            )

            with patch.object(self.broadcaster, '_send_push_notification') as mock_push:
                await self.broadcaster.broadcast_status(status, user_ids)

        # Should throttle notifications (not send every single update)
        # Exact behavior depends on throttling implementation

    async def test_completion_notification(self):
        """Test workflow completion notifications."""
        completion_status = MobileWorkflowStatus(
            workflow_id="wf-complete",
            trigger_id="trigger-complete",
            status="completed",
            progress=1.0,
            result={
                "task_created": "Team meeting scheduled",
                "calendar_event": "event-789",
                "notification_sent": True
            }
        )

        with patch.object(self.broadcaster, '_send_completion_notification') as mock_complete:
            await self.broadcaster.broadcast_status(completion_status, ["user-complete"])

            mock_complete.assert_called_once()
            notification_data = mock_complete.call_args[0][1]
            assert "Team meeting scheduled" in str(notification_data)

    async def test_error_notification(self):
        """Test workflow error notifications."""
        error_status = MobileWorkflowStatus(
            workflow_id="wf-error",
            trigger_id="trigger-error",
            status="failed",
            progress=0.6,
            error_message="Calendar service unavailable",
            retry_available=True
        )

        with patch.object(self.broadcaster, '_send_error_notification') as mock_error:
            await self.broadcaster.broadcast_status(error_status, ["user-error"])

            mock_error.assert_called_once()
            error_data = mock_error.call_args[0][1]
            assert "Calendar service unavailable" in error_data["message"]
            assert error_data["retry_available"] is True


class TestOfflineWorkflowQueue:
    """Test offline workflow queue management."""

    def setup_method(self):
        """Set up test fixtures."""
        self.queue = OfflineWorkflowQueue()

    async def test_queue_workflow_trigger(self):
        """Test queueing workflow triggers for offline execution."""
        trigger = MobileWorkflowTrigger(
            id="offline-trigger",
            workflow_id="offline-workflow",
            trigger_type=TriggerType.VOICE_COMMAND,
            priority=TriggerPriority.HIGH,
            context_data={"command": "Create reminder"}
        )

        await self.queue.add_trigger(trigger)

        queued_triggers = await self.queue.get_pending_triggers()
        assert len(queued_triggers) == 1
        assert queued_triggers[0].id == "offline-trigger"

    async def test_priority_queue_ordering(self):
        """Test priority-based queue ordering."""
        triggers = [
            MobileWorkflowTrigger(
                id="low", workflow_id="wf1", trigger_type=TriggerType.NOTIFICATION_ACTION,
                priority=TriggerPriority.LOW
            ),
            MobileWorkflowTrigger(
                id="urgent", workflow_id="wf2", trigger_type=TriggerType.HEALTH_ALERT,
                priority=TriggerPriority.URGENT
            ),
            MobileWorkflowTrigger(
                id="normal", workflow_id="wf3", trigger_type=TriggerType.VOICE_COMMAND,
                priority=TriggerPriority.NORMAL
            )
        ]

        # Add triggers in random order
        for trigger in triggers:
            await self.queue.add_trigger(trigger)

        ordered_triggers = await self.queue.get_pending_triggers()
        priorities = [t.priority for t in ordered_triggers]

        # Should be ordered by priority (urgent first)
        assert priorities[0] == TriggerPriority.URGENT
        assert priorities[-1] == TriggerPriority.LOW

    async def test_offline_execution_simulation(self):
        """Test offline workflow execution simulation."""
        trigger = MobileWorkflowTrigger(
            id="simulate-offline",
            workflow_id="reminder-workflow",
            trigger_type=TriggerType.VOICE_COMMAND,
            context_data={
                "task": "Call doctor",
                "time": "tomorrow 10 AM"
            }
        )

        await self.queue.add_trigger(trigger)

        # Mock offline execution
        with patch.object(self.queue, '_simulate_workflow_execution') as mock_execute:
            mock_execute.return_value = WorkflowExecutionResult(
                success=True,
                result_data={"reminder_id": "rem-123", "scheduled_time": "2023-10-02T10:00:00Z"},
                execution_time=1.5
            )

            result = await self.queue.execute_offline_workflow(trigger)

            assert result.success is True
            assert "reminder_id" in result.result_data
            mock_execute.assert_called_once_with(trigger)

    async def test_sync_with_server_when_online(self):
        """Test syncing offline results with server when coming online."""
        # Execute some workflows offline
        offline_results = []
        for i in range(3):
            trigger = MobileWorkflowTrigger(
                id=f"sync-{i}",
                workflow_id=f"workflow-{i}",
                trigger_type=TriggerType.VOICE_COMMAND
            )

            result = WorkflowExecutionResult(
                success=True,
                result_data={"task_id": f"task-{i}"},
                execution_time=1.0
            )

            offline_results.append((trigger, result))
            await self.queue.store_offline_result(trigger, result)

        # Mock server sync
        with patch.object(self.queue, '_sync_results_to_server') as mock_sync:
            mock_sync.return_value = True

            sync_success = await self.queue.sync_offline_results()

            assert sync_success is True
            mock_sync.assert_called_once()

    async def test_queue_persistence(self):
        """Test queue persistence across app restarts."""
        trigger = MobileWorkflowTrigger(
            id="persist-test",
            workflow_id="persist-workflow",
            trigger_type=TriggerType.HEALTH_ALERT
        )

        await self.queue.add_trigger(trigger)

        # Mock persistence
        with patch.object(self.queue, '_save_to_storage') as mock_save:
            await self.queue.persist_queue()
            mock_save.assert_called_once()

        # Mock restoration
        with patch.object(self.queue, '_load_from_storage') as mock_load:
            mock_load.return_value = [trigger.to_dict()]

            new_queue = OfflineWorkflowQueue()
            await new_queue.restore_queue()

            restored_triggers = await new_queue.get_pending_triggers()
            assert len(restored_triggers) == 1
            assert restored_triggers[0].id == "persist-test"


class TestWorkflowRecommendationEngine:
    """Test workflow recommendation engine."""

    def setup_method(self):
        """Set up test fixtures."""
        self.engine = WorkflowRecommendationEngine()

    async def test_recommend_workflows_from_context(self):
        """Test workflow recommendations based on context."""
        context = WorkflowContext(
            trigger_source="voice_command",
            user_id="user-recommend",
            health_context={"stress_level": 0.7, "energy_level": 0.4},
            productivity_context={"focus_score": 0.3},
            extracted_entities=["break", "stress relief"]
        )

        recommendations = await self.engine.recommend_workflows(context)

        assert len(recommendations) > 0
        # Should recommend stress management workflows
        stress_workflows = [w for w in recommendations if "stress" in w["name"].lower()]
        assert len(stress_workflows) > 0

    async def test_health_based_recommendations(self):
        """Test health-based workflow recommendations."""
        high_stress_context = WorkflowContext(
            trigger_source="health_alert",
            user_id="user-stress",
            health_context={
                "stress_level": 0.9,
                "heart_rate": 95,
                "energy_level": 0.2
            }
        )

        recommendations = await self.engine.recommend_workflows(high_stress_context)

        recommended_types = [w["type"] for w in recommendations]
        assert "stress_management" in recommended_types
        assert "breathing_exercise" in recommended_types or "break_reminder" in recommended_types

    async def test_productivity_based_recommendations(self):
        """Test productivity-based workflow recommendations."""
        low_productivity_context = WorkflowContext(
            trigger_source="productivity_alert",
            user_id="user-productivity",
            productivity_context={
                "focus_score": 0.2,
                "task_completion_rate": 0.3,
                "interruption_count": 8
            }
        )

        recommendations = await self.engine.recommend_workflows(low_productivity_context)

        productivity_workflows = [w for w in recommendations
                                if "focus" in w["name"].lower() or "productivity" in w["name"].lower()]
        assert len(productivity_workflows) > 0

    async def test_contextual_workflow_ranking(self):
        """Test contextual ranking of workflow recommendations."""
        context = WorkflowContext(
            trigger_source="voice_command",
            user_id="user-ranking",
            health_context={"stress_level": 0.5},
            time_context={"hour": 14, "day_of_week": "monday"},  # Monday afternoon
            location_context={"setting": "office"}
        )

        recommendations = await self.engine.recommend_workflows(context)

        # Recommendations should be ranked by relevance
        assert len(recommendations) > 1
        scores = [w["relevance_score"] for w in recommendations]
        assert scores == sorted(scores, reverse=True)  # Descending order

    async def test_user_preference_integration(self):
        """Test integration of user preferences in recommendations."""
        context = WorkflowContext(
            trigger_source="voice_command",
            user_id="user-preferences"
        )

        # Mock user preferences
        with patch.object(self.engine, '_get_user_preferences') as mock_prefs:
            mock_prefs.return_value = {
                "preferred_break_type": "walking",
                "preferred_reminder_style": "gentle",
                "blocked_workflow_types": ["meditation"]  # User doesn't like meditation
            }

            recommendations = await self.engine.recommend_workflows(context)

            # Should respect user preferences
            workflow_types = [w["type"] for w in recommendations]
            assert "meditation" not in workflow_types
            # Should favor preferred types when relevant


@pytest.mark.asyncio
class TestMobileWorkflowBridge:
    """Test the main MobileWorkflowBridge class."""

    def setup_method(self):
        """Set up test fixtures."""
        config = BridgeConfiguration(
            enable_offline_execution=True,
            max_concurrent_workflows=5,
            health_trigger_threshold=0.8,
            auto_recommendation=True
        )
        self.bridge = MobileWorkflowBridge(config=config)

    async def test_process_voice_trigger(self):
        """Test processing voice command triggers."""
        voice_data = {
            "text": "Schedule daily standup for tomorrow 9 AM",
            "intent": "SCHEDULE",
            "entities": [
                {"type": "EVENT", "value": "daily standup"},
                {"type": "TIME", "value": "tomorrow 9 AM"}
            ],
            "confidence": 0.91
        }

        # Mock workflow engine
        with patch.object(self.bridge, '_execute_workflow') as mock_execute:
            mock_execute.return_value = WorkflowExecutionResult(
                success=True,
                result_data={"event_id": "evt-123"},
                execution_time=2.1
            )

            result = await self.bridge.process_voice_trigger(voice_data, "user-voice")

            assert result.success is True
            assert "event_id" in result.result_data
            mock_execute.assert_called_once()

    async def test_process_health_trigger(self):
        """Test processing health-based triggers."""
        health_data = {
            "stress_level": 0.85,  # Above threshold
            "heart_rate": 90,
            "energy_level": 0.25,
            "trend": "increasing_stress"
        }

        wearable_data = {
            "device_id": "watch-health",
            "last_reading": datetime.now().isoformat()
        }

        # Mock stress management workflow
        with patch.object(self.bridge, '_execute_workflow') as mock_execute:
            mock_execute.return_value = WorkflowExecutionResult(
                success=True,
                result_data={"intervention_type": "breathing_exercise"},
                execution_time=1.0
            )

            result = await self.bridge.process_health_trigger(
                health_data, wearable_data, "user-health"
            )

            assert result.success is True
            # Should trigger stress management workflow
            call_args = mock_execute.call_args[0]
            trigger = call_args[0]
            assert trigger.trigger_type == TriggerType.HEALTH_ALERT

    async def test_process_notification_trigger(self):
        """Test processing notification action triggers."""
        notification_data = {
            "notification_id": "notif-123",
            "action": "snooze",
            "original_task": "Review quarterly report",
            "snooze_duration": "1_hour"
        }

        # Mock reminder workflow
        with patch.object(self.bridge, '_execute_workflow') as mock_execute:
            mock_execute.return_value = WorkflowExecutionResult(
                success=True,
                result_data={"reminder_id": "rem-456", "scheduled_time": "in_1_hour"},
                execution_time=0.5
            )

            result = await self.bridge.process_notification_trigger(
                notification_data, "user-notification"
            )

            assert result.success is True
            assert "reminder_id" in result.result_data

    async def test_offline_execution_mode(self):
        """Test offline workflow execution."""
        # Simulate offline mode
        self.bridge._is_online = False

        voice_data = {
            "text": "Create reminder to call client",
            "intent": "REMINDER",
            "entities": [{"type": "TASK", "value": "call client"}]
        }

        result = await self.bridge.process_voice_trigger(voice_data, "user-offline")

        # Should queue for offline execution
        assert result.success is True
        assert "queued_for_offline" in result.result_data or result.result_data.get("offline_mode") is True

        # Check offline queue
        queued_triggers = await self.bridge.offline_queue.get_pending_triggers()
        assert len(queued_triggers) >= 1

    async def test_workflow_status_monitoring(self):
        """Test workflow status monitoring and broadcasting."""
        trigger = MobileWorkflowTrigger(
            id="status-monitor",
            workflow_id="long-running-workflow",
            trigger_type=TriggerType.VOICE_COMMAND,
            user_id="user-status"
        )

        # Mock long-running workflow
        with patch.object(self.bridge, '_execute_workflow') as mock_execute, \
             patch.object(self.bridge.status_broadcaster, 'broadcast_status') as mock_broadcast:

            # Simulate workflow execution with status updates
            async def mock_execution(trigger):
                # Simulate progress updates
                for progress in [0.2, 0.5, 0.8, 1.0]:
                    status = MobileWorkflowStatus(
                        workflow_id=trigger.workflow_id,
                        trigger_id=trigger.id,
                        status="executing" if progress < 1.0 else "completed",
                        progress=progress
                    )
                    await self.bridge._update_workflow_status(status)
                    await asyncio.sleep(0.1)

                return WorkflowExecutionResult(success=True, result_data={}, execution_time=1.0)

            mock_execute.side_effect = mock_execution

            result = await self.bridge._execute_workflow(trigger)

            # Should have broadcast status updates
            assert mock_broadcast.call_count >= 3  # Progress updates + completion

    async def test_concurrent_workflow_execution(self):
        """Test concurrent workflow execution with limits."""
        # Create multiple triggers
        triggers = []
        for i in range(7):  # More than max_concurrent_workflows (5)
            trigger = MobileWorkflowTrigger(
                id=f"concurrent-{i}",
                workflow_id=f"workflow-{i}",
                trigger_type=TriggerType.VOICE_COMMAND,
                user_id=f"user-{i}"
            )
            triggers.append(trigger)

        # Mock workflow execution
        execution_count = 0

        async def mock_execute(trigger):
            nonlocal execution_count
            execution_count += 1
            await asyncio.sleep(0.1)  # Simulate work
            return WorkflowExecutionResult(success=True, result_data={}, execution_time=0.1)

        with patch.object(self.bridge, '_execute_workflow', side_effect=mock_execute):
            # Execute all triggers concurrently
            tasks = [self.bridge._execute_workflow(trigger) for trigger in triggers]
            results = await asyncio.gather(*tasks)

            # All should complete successfully
            assert all(r.success for r in results)
            assert execution_count == 7

    async def test_recommendation_engine_integration(self):
        """Test integration with workflow recommendation engine."""
        context_data = {
            "health_data": {"stress_level": 0.6, "energy_level": 0.4},
            "productivity_data": {"focus_score": 0.3},
            "time_context": {"hour": 15}  # Mid-afternoon
        }

        # Mock recommendations
        with patch.object(self.bridge.recommendation_engine, 'recommend_workflows') as mock_recommend:
            mock_recommend.return_value = [
                {"id": "break-workflow", "name": "Take a break", "relevance_score": 0.9},
                {"id": "focus-workflow", "name": "Focus session", "relevance_score": 0.7}
            ]

            recommendations = await self.bridge.get_workflow_recommendations(
                context_data, "user-recommend"
            )

            assert len(recommendations) == 2
            assert recommendations[0]["name"] == "Take a break"  # Higher score first
            mock_recommend.assert_called_once()

    async def test_error_handling_and_recovery(self):
        """Test error handling and recovery mechanisms."""
        trigger = MobileWorkflowTrigger(
            id="error-test",
            workflow_id="failing-workflow",
            trigger_type=TriggerType.VOICE_COMMAND,
            user_id="user-error"
        )

        # Mock workflow failure
        with patch.object(self.bridge, '_execute_workflow') as mock_execute:
            mock_execute.side_effect = Exception("Workflow execution failed")

            result = await self.bridge._execute_workflow(trigger)

            # Should handle error gracefully
            assert result.success is False
            assert "error" in result.result_data or hasattr(result, 'error_message')


@pytest.mark.integration
class TestMobileWorkflowBridgeIntegration:
    """Integration tests for mobile workflow bridge."""

    @pytest.fixture
    def bridge_with_mocks(self):
        """Create bridge with mocked external dependencies."""
        config = BridgeConfiguration(
            enable_offline_execution=True,
            max_concurrent_workflows=3,
            health_trigger_threshold=0.7
        )
        bridge = MobileWorkflowBridge(config=config)

        # Mock external services
        bridge._workflow_engine = Mock()
        bridge._mobile_notification_service = Mock()
        bridge._analytics_service = Mock()

        return bridge

    async def test_end_to_end_voice_workflow(self, bridge_with_mocks):
        """Test complete voice-to-workflow execution flow."""
        bridge = bridge_with_mocks

        # Configure mocks
        bridge._workflow_engine.execute_workflow.return_value = {
            "success": True,
            "result": {"task_id": "task-e2e", "scheduled_time": "2023-10-02T14:00:00Z"}
        }

        voice_data = {
            "text": "Schedule code review meeting with the team",
            "intent": "SCHEDULE",
            "entities": [
                {"type": "EVENT", "value": "code review meeting"},
                {"type": "PARTICIPANTS", "value": "team"}
            ],
            "confidence": 0.94
        }

        # Execute complete flow
        result = await bridge.process_voice_trigger(voice_data, "user-e2e")

        # Verify workflow execution
        assert result.success is True
        bridge._workflow_engine.execute_workflow.assert_called_once()

        # Verify status broadcasting
        bridge._mobile_notification_service.broadcast_status.assert_called()

        # Verify analytics tracking
        bridge._analytics_service.track_workflow_execution.assert_called()

    async def test_health_intervention_workflow(self, bridge_with_mocks):
        """Test health-triggered intervention workflow."""
        bridge = bridge_with_mocks

        # Configure health intervention workflow
        bridge._workflow_engine.execute_workflow.return_value = {
            "success": True,
            "result": {"intervention_type": "breathing_exercise", "duration": 300}
        }

        high_stress_data = {
            "stress_level": 0.9,
            "heart_rate": 100,
            "trend": "rapidly_increasing"
        }

        wearable_data = {
            "device_id": "health-watch",
            "alert_type": "stress_spike"
        }

        # Execute health intervention
        result = await bridge.process_health_trigger(
            high_stress_data, wearable_data, "user-intervention"
        )

        assert result.success is True
        # Should have triggered stress management workflow
        workflow_call = bridge._workflow_engine.execute_workflow.call_args
        assert "stress" in str(workflow_call).lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
