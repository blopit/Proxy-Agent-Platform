"""
Mobile-Workflow Bridge for Proxy Agent Platform.

Provides seamless integration between mobile components (notifications, voice,
offline sync, wearables) and the workflow engine, enabling mobile-triggered
workflows, real-time status updates, and context-aware workflow execution.
"""

import asyncio
import logging
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4

# Import mobile components
try:
    from .notification_manager import NotificationManager
except ImportError:
    from .notification_manager_stub import NotificationManager

try:
    from .voice_processor import VoiceProcessor
except ImportError:
    class VoiceProcessor:
        def __init__(self, *args, **kwargs):
            pass

try:
    from .offline_manager import OfflineManager
except ImportError:
    class OfflineManager:
        def __init__(self, *args, **kwargs):
            pass

try:
    from .wearable_integration import WearableAPI
except ImportError:
    class WearableAPI:
        def __init__(self, *args, **kwargs):
            pass

# Import workflow components (assuming they exist)
try:
    from ..workflows import WorkflowContext, WorkflowDefinition, WorkflowEngine, WorkflowStatus
except ImportError:
    # Mock classes for development
    class WorkflowEngine:
        pass
    class WorkflowDefinition:
        pass
    class WorkflowContext:
        pass
    class WorkflowStatus:
        pass

logger = logging.getLogger(__name__)


class MobileTriggerType(Enum):
    """Types of mobile triggers for workflows."""
    VOICE_COMMAND = "voice_command"
    NOTIFICATION_ACTION = "notification_action"
    HEALTH_EVENT = "health_event"
    LOCATION_CHANGE = "location_change"
    DEVICE_CONNECTIVITY = "device_connectivity"
    TASK_COMPLETION = "task_completion"
    STRESS_ALERT = "stress_alert"
    ENERGY_PEAK = "energy_peak"
    FOCUS_SESSION = "focus_session"
    BREAK_REMINDER = "break_reminder"


class WorkflowPriority(Enum):
    """Priority levels for mobile-triggered workflows."""
    CRITICAL = 1  # Health emergencies, urgent tasks
    HIGH = 2      # Stress alerts, important deadlines
    NORMAL = 3    # Regular productivity workflows
    LOW = 4       # Background optimizations
    BACKGROUND = 5  # Data analysis, cleanup


@dataclass
class MobileWorkflowTrigger:
    """Represents a mobile trigger for workflow execution."""
    trigger_id: str
    trigger_type: MobileTriggerType
    user_id: int
    priority: WorkflowPriority
    context: dict[str, Any]
    created_at: datetime
    device_info: dict[str, Any] = field(default_factory=dict)
    health_context: dict[str, Any] | None = None
    location_context: dict[str, Any] | None = None


@dataclass
class MobileWorkflowExecution:
    """Tracks execution of mobile-triggered workflows."""
    execution_id: str
    trigger: MobileWorkflowTrigger
    workflow_name: str
    status: str
    started_at: datetime
    completed_at: datetime | None = None
    result: dict[str, Any] | None = None
    mobile_feedback: dict[str, Any] | None = None


class MobileWorkflowBridge:
    """Bridge between mobile components and workflow engine."""

    def __init__(self, workflow_engine: WorkflowEngine | None = None):
        """Initialize mobile-workflow bridge."""
        self.workflow_engine = workflow_engine

        # Mobile component integrations
        self.notification_manager = NotificationManager()
        self.voice_processor = VoiceProcessor(workflow_engine)
        self.offline_manager = OfflineManager(workflow_engine)
        self.wearable_api = WearableAPI(workflow_engine)

        # Workflow management
        self.mobile_workflows = self._initialize_mobile_workflows()
        self.trigger_mappings = self._initialize_trigger_mappings()
        self.execution_history = deque(maxlen=1000)
        self.active_executions = {}

        # Context management
        self.context_aggregator = MobileContextAggregator()
        self.status_broadcaster = WorkflowStatusBroadcaster()

        # Performance monitoring
        self.metrics = {
            "triggers_processed": 0,
            "workflows_executed": 0,
            "mobile_feedback_sent": 0,
            "context_enrichments": 0,
            "offline_workflows": 0,
        }

        # Configuration
        self.config = {
            "max_concurrent_workflows": 10,
            "context_cache_duration": 300,  # 5 minutes
            "feedback_timeout": 30,  # 30 seconds
            "offline_workflow_retention": 86400,  # 24 hours
        }

    def _initialize_mobile_workflows(self) -> dict[str, dict[str, Any]]:
        """Initialize mobile-specific workflow definitions."""
        return {
            "mobile_task_creation": {
                "name": "Mobile Task Creation Workflow",
                "description": "Create and prioritize tasks from mobile input",
                "triggers": [MobileTriggerType.VOICE_COMMAND, MobileTriggerType.NOTIFICATION_ACTION],
                "steps": [
                    {"name": "validate_input", "timeout": 5},
                    {"name": "analyze_context", "timeout": 10},
                    {"name": "create_task", "timeout": 15},
                    {"name": "send_confirmation", "timeout": 5},
                ],
                "mobile_feedback": True,
                "offline_capable": True,
            },
            "stress_management": {
                "name": "Stress Management Workflow",
                "description": "Handle stress alerts and provide relief suggestions",
                "triggers": [MobileTriggerType.STRESS_ALERT, MobileTriggerType.HEALTH_EVENT],
                "steps": [
                    {"name": "assess_stress_level", "timeout": 5},
                    {"name": "generate_recommendations", "timeout": 10},
                    {"name": "send_haptic_feedback", "timeout": 5},
                    {"name": "schedule_followup", "timeout": 10},
                ],
                "mobile_feedback": True,
                "offline_capable": False,
                "priority": WorkflowPriority.HIGH,
            },
            "productivity_optimization": {
                "name": "Productivity Optimization Workflow",
                "description": "Optimize productivity based on health and context data",
                "triggers": [MobileTriggerType.ENERGY_PEAK, MobileTriggerType.FOCUS_SESSION],
                "steps": [
                    {"name": "analyze_productivity_state", "timeout": 10},
                    {"name": "suggest_optimal_tasks", "timeout": 15},
                    {"name": "configure_environment", "timeout": 10},
                    {"name": "monitor_session", "timeout": 5},
                ],
                "mobile_feedback": True,
                "offline_capable": True,
            },
            "mobile_sync_orchestration": {
                "name": "Mobile Sync Orchestration",
                "description": "Orchestrate offline sync and conflict resolution",
                "triggers": [MobileTriggerType.DEVICE_CONNECTIVITY],
                "steps": [
                    {"name": "assess_sync_needs", "timeout": 10},
                    {"name": "prioritize_operations", "timeout": 5},
                    {"name": "execute_sync", "timeout": 60},
                    {"name": "resolve_conflicts", "timeout": 30},
                    {"name": "update_status", "timeout": 5},
                ],
                "mobile_feedback": True,
                "offline_capable": False,
            },
            "contextual_notification": {
                "name": "Contextual Notification Workflow",
                "description": "Send intelligent notifications based on context",
                "triggers": [MobileTriggerType.LOCATION_CHANGE, MobileTriggerType.TASK_COMPLETION],
                "steps": [
                    {"name": "gather_context", "timeout": 10},
                    {"name": "determine_relevance", "timeout": 5},
                    {"name": "personalize_notification", "timeout": 10},
                    {"name": "send_notification", "timeout": 5},
                ],
                "mobile_feedback": False,
                "offline_capable": True,
            },
        }

    def _initialize_trigger_mappings(self) -> dict[MobileTriggerType, list[str]]:
        """Map trigger types to workflow names."""
        mappings = defaultdict(list)

        for workflow_name, workflow_def in self.mobile_workflows.items():
            for trigger_type in workflow_def["triggers"]:
                mappings[trigger_type].append(workflow_name)

        return dict(mappings)

    async def process_mobile_trigger(
        self, trigger: MobileWorkflowTrigger
    ) -> dict[str, Any]:
        """
        Process a mobile trigger and execute appropriate workflows.

        Args:
            trigger: Mobile workflow trigger

        Returns:
            Dictionary with execution results
        """
        logger.info(f"Processing mobile trigger: {trigger.trigger_type.value} for user {trigger.user_id}")

        self.metrics["triggers_processed"] += 1

        # Enrich trigger context
        enriched_trigger = await self.context_aggregator.enrich_trigger_context(trigger)

        # Determine applicable workflows
        applicable_workflows = await self._determine_applicable_workflows(enriched_trigger)

        if not applicable_workflows:
            return {
                "status": "no_workflows",
                "message": "No applicable workflows found for trigger",
                "trigger_id": trigger.trigger_id
            }

        # Execute workflows based on priority
        execution_results = []
        for workflow_name in applicable_workflows:
            try:
                if await self._can_execute_workflow(workflow_name, enriched_trigger):
                    result = await self._execute_mobile_workflow(
                        workflow_name, enriched_trigger
                    )
                    execution_results.append(result)

            except Exception as e:
                logger.error(f"Failed to execute workflow {workflow_name}: {e}")
                execution_results.append({
                    "workflow_name": workflow_name,
                    "status": "error",
                    "error": str(e)
                })

        # Send mobile feedback if any workflow requires it
        await self._send_mobile_feedback(enriched_trigger, execution_results)

        return {
            "status": "success",
            "trigger_id": trigger.trigger_id,
            "workflows_executed": len(execution_results),
            "execution_results": execution_results
        }

    async def create_voice_triggered_workflow(
        self, voice_command: str, user_id: int, device_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Create workflow from voice command."""
        trigger = MobileWorkflowTrigger(
            trigger_id=f"voice_{uuid4().hex[:8]}",
            trigger_type=MobileTriggerType.VOICE_COMMAND,
            user_id=user_id,
            priority=WorkflowPriority.NORMAL,
            context={
                "voice_command": voice_command,
                "device_context": device_context
            },
            created_at=datetime.now(),
            device_info=device_context
        )

        return await self.process_mobile_trigger(trigger)

    async def create_health_triggered_workflow(
        self, health_event: dict[str, Any], user_id: int, device_type: str
    ) -> dict[str, Any]:
        """Create workflow from health event."""
        # Determine priority based on health event severity
        severity = health_event.get("severity", "medium")
        priority_map = {
            "critical": WorkflowPriority.CRITICAL,
            "high": WorkflowPriority.HIGH,
            "medium": WorkflowPriority.NORMAL,
            "low": WorkflowPriority.LOW
        }

        trigger = MobileWorkflowTrigger(
            trigger_id=f"health_{uuid4().hex[:8]}",
            trigger_type=MobileTriggerType.HEALTH_EVENT,
            user_id=user_id,
            priority=priority_map.get(severity, WorkflowPriority.NORMAL),
            context={
                "health_event": health_event,
                "device_type": device_type
            },
            created_at=datetime.now(),
            health_context=health_event,
            device_info={"type": device_type}
        )

        return await self.process_mobile_trigger(trigger)

    async def create_notification_workflow(
        self, notification_data: dict[str, Any], user_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Create workflow for intelligent notification."""
        trigger = MobileWorkflowTrigger(
            trigger_id=f"notification_{uuid4().hex[:8]}",
            trigger_type=MobileTriggerType.NOTIFICATION_ACTION,
            user_id=notification_data["user_id"],
            priority=WorkflowPriority.NORMAL,
            context={
                "notification_data": notification_data,
                "user_context": user_context
            },
            created_at=datetime.now()
        )

        return await self.process_mobile_trigger(trigger)

    async def execute_offline_workflow(
        self, workflow_name: str, parameters: dict[str, Any], user_id: int
    ) -> dict[str, Any]:
        """Execute workflow offline with intelligent queuing."""
        if not self.mobile_workflows.get(workflow_name, {}).get("offline_capable", False):
            return {
                "status": "error",
                "error": "Workflow is not offline capable",
                "workflow_name": workflow_name
            }

        # Create offline workflow execution
        offline_execution = {
            "execution_id": f"offline_{uuid4().hex[:8]}",
            "workflow_name": workflow_name,
            "parameters": parameters,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "status": "queued_offline"
        }

        # Store in offline manager
        result = await self.offline_manager.store_offline_data(
            offline_execution,
            data_type="workflow_execution",
            priority=self.offline_manager.SyncPriority.HIGH
        )

        self.metrics["offline_workflows"] += 1

        return {
            "status": "success",
            "execution_id": offline_execution["execution_id"],
            "offline_id": result["offline_id"],
            "message": "Workflow queued for execution when online"
        }

    async def get_workflow_status_for_mobile(
        self, execution_id: str, include_mobile_context: bool = True
    ) -> dict[str, Any]:
        """Get workflow status optimized for mobile display."""
        if execution_id not in self.active_executions:
            # Check execution history
            for execution in self.execution_history:
                if execution.execution_id == execution_id:
                    return await self._format_mobile_status(execution, include_mobile_context)

            return {"status": "not_found", "execution_id": execution_id}

        execution = self.active_executions[execution_id]
        return await self._format_mobile_status(execution, include_mobile_context)

    async def cancel_mobile_workflow(
        self, execution_id: str, user_id: int, reason: str = "user_cancelled"
    ) -> dict[str, Any]:
        """Cancel a mobile-triggered workflow."""
        if execution_id not in self.active_executions:
            return {"status": "error", "error": "Execution not found or already completed"}

        execution = self.active_executions[execution_id]

        if execution.trigger.user_id != user_id:
            return {"status": "error", "error": "Unauthorized to cancel this workflow"}

        # Cancel workflow in engine if available
        if self.workflow_engine:
            try:
                await self.workflow_engine.cancel_workflow(execution_id, reason)
            except Exception as e:
                logger.error(f"Failed to cancel workflow in engine: {e}")

        # Update execution status
        execution.status = "cancelled"
        execution.completed_at = datetime.now()
        execution.result = {"cancelled": True, "reason": reason}

        # Move to history
        self.execution_history.append(execution)
        del self.active_executions[execution_id]

        # Send cancellation feedback to mobile
        await self._send_cancellation_feedback(execution)

        return {
            "status": "success",
            "execution_id": execution_id,
            "message": "Workflow cancelled successfully"
        }

    async def get_mobile_workflow_recommendations(
        self, user_id: int, current_context: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Get workflow recommendations for current mobile context."""
        recommendations = []

        # Analyze current context
        context_analysis = await self.context_aggregator.analyze_context_for_recommendations(
            user_id, current_context
        )

        # Generate recommendations based on context
        for workflow_name, workflow_def in self.mobile_workflows.items():
            recommendation_score = await self._calculate_recommendation_score(
                workflow_name, workflow_def, context_analysis
            )

            if recommendation_score > 0.6:  # Threshold for recommendations
                recommendations.append({
                    "workflow_name": workflow_name,
                    "title": workflow_def["name"],
                    "description": workflow_def["description"],
                    "score": recommendation_score,
                    "estimated_duration": await self._estimate_workflow_duration(workflow_name),
                    "mobile_friendly": workflow_def.get("mobile_feedback", False),
                    "offline_capable": workflow_def.get("offline_capable", False)
                })

        # Sort by score
        recommendations.sort(key=lambda x: x["score"], reverse=True)

        return recommendations[:5]  # Return top 5 recommendations

    # Helper methods

    async def _determine_applicable_workflows(
        self, trigger: MobileWorkflowTrigger
    ) -> list[str]:
        """Determine which workflows apply to the trigger."""
        applicable = self.trigger_mappings.get(trigger.trigger_type, [])

        # Filter based on context and priority
        filtered_workflows = []
        for workflow_name in applicable:
            workflow_def = self.mobile_workflows[workflow_name]

            # Check if workflow is suitable for current context
            if await self._is_workflow_contextually_suitable(workflow_def, trigger):
                filtered_workflows.append(workflow_name)

        # Sort by priority
        workflow_priorities = []
        for workflow_name in filtered_workflows:
            workflow_def = self.mobile_workflows[workflow_name]
            priority = workflow_def.get("priority", WorkflowPriority.NORMAL)
            workflow_priorities.append((priority.value, workflow_name))

        workflow_priorities.sort()  # Sort by priority value (lower = higher priority)

        return [name for _, name in workflow_priorities]

    async def _can_execute_workflow(
        self, workflow_name: str, trigger: MobileWorkflowTrigger
    ) -> bool:
        """Check if workflow can be executed."""
        # Check concurrent execution limit
        if len(self.active_executions) >= self.config["max_concurrent_workflows"]:
            logger.warning(f"Max concurrent workflows reached, skipping {workflow_name}")
            return False

        # Check if workflow is already running for this user
        user_active_workflows = [
            ex for ex in self.active_executions.values()
            if ex.trigger.user_id == trigger.user_id and ex.workflow_name == workflow_name
        ]

        if user_active_workflows:
            logger.info(f"Workflow {workflow_name} already running for user {trigger.user_id}")
            return False

        return True

    async def _execute_mobile_workflow(
        self, workflow_name: str, trigger: MobileWorkflowTrigger
    ) -> dict[str, Any]:
        """Execute a mobile workflow."""
        execution_id = f"exec_{uuid4().hex[:8]}"

        execution = MobileWorkflowExecution(
            execution_id=execution_id,
            trigger=trigger,
            workflow_name=workflow_name,
            status="running",
            started_at=datetime.now()
        )

        self.active_executions[execution_id] = execution

        try:
            # Execute workflow steps
            workflow_def = self.mobile_workflows[workflow_name]
            result = await self._execute_workflow_steps(workflow_def, trigger, execution_id)

            execution.status = "completed"
            execution.completed_at = datetime.now()
            execution.result = result

            self.metrics["workflows_executed"] += 1

        except Exception as e:
            execution.status = "failed"
            execution.completed_at = datetime.now()
            execution.result = {"error": str(e)}
            logger.error(f"Workflow execution failed: {e}")

        # Move to history
        self.execution_history.append(execution)
        del self.active_executions[execution_id]

        # Broadcast status update
        await self.status_broadcaster.broadcast_workflow_status(execution)

        return {
            "execution_id": execution_id,
            "workflow_name": workflow_name,
            "status": execution.status,
            "result": execution.result
        }

    async def _execute_workflow_steps(
        self, workflow_def: dict[str, Any], trigger: MobileWorkflowTrigger, execution_id: str
    ) -> dict[str, Any]:
        """Execute individual workflow steps."""
        step_results = []

        for step in workflow_def["steps"]:
            step_name = step["name"]
            timeout = step.get("timeout", 30)

            try:
                step_result = await asyncio.wait_for(
                    self._execute_workflow_step(step_name, trigger, execution_id),
                    timeout=timeout
                )
                step_results.append({
                    "step": step_name,
                    "status": "success",
                    "result": step_result
                })

            except TimeoutError:
                step_results.append({
                    "step": step_name,
                    "status": "timeout",
                    "error": f"Step timed out after {timeout} seconds"
                })
                break

            except Exception as e:
                step_results.append({
                    "step": step_name,
                    "status": "error",
                    "error": str(e)
                })
                break

        return {
            "steps": step_results,
            "completed_steps": len([s for s in step_results if s["status"] == "success"]),
            "total_steps": len(workflow_def["steps"])
        }

    async def _execute_workflow_step(
        self, step_name: str, trigger: MobileWorkflowTrigger, execution_id: str
    ) -> dict[str, Any]:
        """Execute a single workflow step."""
        # Mock step execution - replace with actual implementation
        logger.info(f"Executing step: {step_name} for execution {execution_id}")

        # Simulate different step types
        if step_name == "validate_input":
            return {"validated": True, "input_quality": "good"}
        elif step_name == "analyze_context":
            return {"context_score": 0.85, "recommendations": ["optimize_timing"]}
        elif step_name == "create_task":
            task_id = f"task_{uuid4().hex[:8]}"
            return {"task_created": True, "task_id": task_id}
        elif step_name == "send_confirmation":
            await self._send_mobile_confirmation(trigger, execution_id)
            return {"confirmation_sent": True}
        elif step_name == "assess_stress_level":
            stress_level = trigger.health_context.get("stress_level", 50) if trigger.health_context else 50
            return {"stress_level": stress_level, "needs_intervention": stress_level > 70}
        elif step_name == "generate_recommendations":
            return {"recommendations": ["take_deep_breath", "short_walk", "meditation"]}
        elif step_name == "send_haptic_feedback":
            await self.wearable_api.send_intelligent_haptic_feedback({
                "type": "stress_relief",
                "user_id": trigger.user_id
            })
            return {"haptic_sent": True}
        else:
            # Generic step execution
            await asyncio.sleep(0.1)  # Simulate processing
            return {"step_completed": True, "step_name": step_name}

    async def _send_mobile_feedback(
        self, trigger: MobileWorkflowTrigger, execution_results: list[dict[str, Any]]
    ):
        """Send feedback to mobile devices about workflow execution."""
        feedback_data = {
            "trigger_id": trigger.trigger_id,
            "user_id": trigger.user_id,
            "execution_count": len(execution_results),
            "successful_executions": len([r for r in execution_results if r.get("status") == "completed"]),
            "timestamp": datetime.now().isoformat()
        }

        # Send notification if any workflow requires mobile feedback
        requires_feedback = any(
            self.mobile_workflows.get(result["workflow_name"], {}).get("mobile_feedback", False)
            for result in execution_results
        )

        if requires_feedback:
            await self.notification_manager.generate_smart_notification({
                "user_id": trigger.user_id,
                "trigger_type": trigger.trigger_type.value,
                "workflow_results": execution_results,
                "current_location": trigger.location_context.get("location") if trigger.location_context else "unknown",
                "calendar_status": "free",  # Could be enriched from context
                "energy_level": "medium",   # Could be from health context
                "recent_activity": "workflow_execution"
            })

            self.metrics["mobile_feedback_sent"] += 1

    async def _send_mobile_confirmation(self, trigger: MobileWorkflowTrigger, execution_id: str):
        """Send confirmation to mobile device."""
        confirmation_data = {
            "execution_id": execution_id,
            "trigger_type": trigger.trigger_type.value,
            "message": "Workflow execution started successfully",
            "timestamp": datetime.now().isoformat()
        }

        # Send haptic feedback for immediate confirmation
        if trigger.trigger_type == MobileTriggerType.VOICE_COMMAND:
            await self.wearable_api.send_intelligent_haptic_feedback({
                "type": "confirmation",
                "user_id": trigger.user_id,
                "context": {"execution_id": execution_id}
            })

    async def _send_cancellation_feedback(self, execution: MobileWorkflowExecution):
        """Send cancellation feedback to mobile device."""
        await self.notification_manager.generate_smart_notification({
            "user_id": execution.trigger.user_id,
            "notification_type": "workflow_cancelled",
            "workflow_name": execution.workflow_name,
            "execution_id": execution.execution_id,
            "current_location": "unknown",
            "calendar_status": "free",
            "energy_level": "medium",
            "recent_activity": "workflow_cancellation"
        })

    async def _format_mobile_status(
        self, execution: MobileWorkflowExecution, include_context: bool
    ) -> dict[str, Any]:
        """Format workflow status for mobile display."""
        status = {
            "execution_id": execution.execution_id,
            "workflow_name": execution.workflow_name,
            "status": execution.status,
            "started_at": execution.started_at.isoformat(),
            "duration": self._calculate_execution_duration(execution)
        }

        if execution.completed_at:
            status["completed_at"] = execution.completed_at.isoformat()

        if execution.result:
            # Simplify result for mobile
            status["result"] = self._simplify_result_for_mobile(execution.result)

        if include_context and execution.trigger:
            status["trigger_info"] = {
                "type": execution.trigger.trigger_type.value,
                "priority": execution.trigger.priority.name
            }

        return status

    def _calculate_execution_duration(self, execution: MobileWorkflowExecution) -> str:
        """Calculate execution duration in human-readable format."""
        if execution.completed_at:
            duration = execution.completed_at - execution.started_at
        else:
            duration = datetime.now() - execution.started_at

        total_seconds = int(duration.total_seconds())

        if total_seconds < 60:
            return f"{total_seconds}s"
        elif total_seconds < 3600:
            minutes = total_seconds // 60
            return f"{minutes}m"
        else:
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours}h {minutes}m"

    def _simplify_result_for_mobile(self, result: dict[str, Any]) -> dict[str, Any]:
        """Simplify workflow result for mobile display."""
        simplified = {}

        if "steps" in result:
            simplified["completed_steps"] = result.get("completed_steps", 0)
            simplified["total_steps"] = result.get("total_steps", 0)
            simplified["success_rate"] = f"{(simplified['completed_steps'] / max(simplified['total_steps'], 1)) * 100:.0f}%"

        if "error" in result:
            simplified["error"] = result["error"]

        # Include key results
        for key in ["task_created", "task_id", "recommendations", "confirmation_sent"]:
            if key in result:
                simplified[key] = result[key]

        return simplified

    async def _is_workflow_contextually_suitable(
        self, workflow_def: dict[str, Any], trigger: MobileWorkflowTrigger
    ) -> bool:
        """Check if workflow is suitable for current context."""
        # Check if user is in a state suitable for the workflow
        if trigger.health_context:
            stress_level = trigger.health_context.get("stress_level", 50)

            # Don't run complex workflows when stress is very high
            if stress_level > 80 and len(workflow_def["steps"]) > 3:
                return False

        # Check location context
        if trigger.location_context:
            location = trigger.location_context.get("location", "unknown")

            # Some workflows might not be suitable for certain locations
            if location == "meeting" and workflow_def.get("disruptive", False):
                return False

        return True

    async def _calculate_recommendation_score(
        self, workflow_name: str, workflow_def: dict[str, Any], context_analysis: dict[str, Any]
    ) -> float:
        """Calculate recommendation score for workflow."""
        base_score = 0.5

        # Increase score based on context relevance
        relevance_factors = context_analysis.get("relevance_factors", {})

        if workflow_name == "stress_management" and relevance_factors.get("stress_level", 0) > 60:
            base_score += 0.3

        if workflow_name == "productivity_optimization" and relevance_factors.get("energy_level", 0) > 70:
            base_score += 0.3

        if workflow_name == "mobile_task_creation" and relevance_factors.get("has_pending_input", False):
            base_score += 0.2

        # Adjust based on recent usage
        recent_usage = context_analysis.get("recent_workflow_usage", {}).get(workflow_name, 0)
        if recent_usage > 3:  # Used more than 3 times recently
            base_score -= 0.2  # Reduce score to avoid over-recommendation

        # Adjust based on time of day
        current_hour = datetime.now().hour
        if workflow_name == "productivity_optimization" and 9 <= current_hour <= 17:
            base_score += 0.1  # Better during work hours

        return min(1.0, max(0.0, base_score))

    async def _estimate_workflow_duration(self, workflow_name: str) -> str:
        """Estimate workflow duration."""
        workflow_def = self.mobile_workflows.get(workflow_name, {})
        steps = workflow_def.get("steps", [])

        total_timeout = sum(step.get("timeout", 30) for step in steps)

        if total_timeout < 60:
            return f"~{total_timeout}s"
        else:
            minutes = total_timeout // 60
            return f"~{minutes}m"


class MobileContextAggregator:
    """Aggregate context from multiple mobile sources."""

    def __init__(self):
        self.context_cache = {}
        self.cache_duration = 300  # 5 minutes

    async def enrich_trigger_context(
        self, trigger: MobileWorkflowTrigger
    ) -> MobileWorkflowTrigger:
        """Enrich trigger with additional context."""
        # Get cached context if available
        cache_key = f"context_{trigger.user_id}"
        if cache_key in self.context_cache:
            cached_context = self.context_cache[cache_key]
            cache_time = datetime.fromisoformat(cached_context["timestamp"])
            if (datetime.now() - cache_time).seconds < self.cache_duration:
                trigger.context.update(cached_context["data"])
                return trigger

        # Gather fresh context
        enriched_context = await self._gather_comprehensive_context(trigger.user_id)

        # Cache context
        self.context_cache[cache_key] = {
            "data": enriched_context,
            "timestamp": datetime.now().isoformat()
        }

        # Merge with trigger context
        trigger.context.update(enriched_context)

        return trigger

    async def analyze_context_for_recommendations(
        self, user_id: int, current_context: dict[str, Any]
    ) -> dict[str, Any]:
        """Analyze context to generate workflow recommendations."""
        analysis = {
            "relevance_factors": {},
            "recent_workflow_usage": {},
            "context_quality": "good"
        }

        # Analyze stress level
        if "health_data" in current_context:
            stress_level = current_context["health_data"].get("stress_level", 50)
            analysis["relevance_factors"]["stress_level"] = stress_level

        # Analyze energy level
        if "health_data" in current_context:
            energy_level = current_context["health_data"].get("energy_level", 50)
            analysis["relevance_factors"]["energy_level"] = energy_level

        # Check for pending input
        analysis["relevance_factors"]["has_pending_input"] = current_context.get("has_voice_input", False)

        # Mock recent usage data
        analysis["recent_workflow_usage"] = {
            "stress_management": 1,
            "productivity_optimization": 2,
            "mobile_task_creation": 0
        }

        return analysis

    async def _gather_comprehensive_context(self, user_id: int) -> dict[str, Any]:
        """Gather comprehensive context from all sources."""
        context = {}

        # Add timestamp
        context["timestamp"] = datetime.now().isoformat()

        # Add time-based context
        now = datetime.now()
        context["time_context"] = {
            "hour": now.hour,
            "day_of_week": now.weekday(),
            "is_weekend": now.weekday() >= 5,
            "is_work_hours": 9 <= now.hour <= 17
        }

        # Add mock location context
        context["location_context"] = {
            "location": "office",
            "confidence": 0.8
        }

        # Add mock calendar context
        context["calendar_context"] = {
            "current_status": "free",
            "next_meeting": "14:00",
            "busy_until": None
        }

        return context


class WorkflowStatusBroadcaster:
    """Broadcast workflow status updates to mobile devices."""

    def __init__(self):
        self.subscribers = defaultdict(list)

    async def subscribe_to_updates(self, user_id: int, device_id: str, callback: callable):
        """Subscribe to workflow status updates."""
        self.subscribers[user_id].append({
            "device_id": device_id,
            "callback": callback,
            "subscribed_at": datetime.now()
        })

    async def unsubscribe_from_updates(self, user_id: int, device_id: str):
        """Unsubscribe from workflow status updates."""
        self.subscribers[user_id] = [
            sub for sub in self.subscribers[user_id]
            if sub["device_id"] != device_id
        ]

    async def broadcast_workflow_status(self, execution: MobileWorkflowExecution):
        """Broadcast workflow status to subscribed devices."""
        user_id = execution.trigger.user_id

        if user_id not in self.subscribers:
            return

        status_update = {
            "execution_id": execution.execution_id,
            "workflow_name": execution.workflow_name,
            "status": execution.status,
            "timestamp": datetime.now().isoformat()
        }

        # Broadcast to all subscribed devices
        for subscriber in self.subscribers[user_id]:
            try:
                await subscriber["callback"](status_update)
            except Exception as e:
                logger.error(f"Failed to broadcast to device {subscriber['device_id']}: {e}")


# Type aliases for backwards compatibility and test expectations
TriggerType = MobileTriggerType
TriggerPriority = WorkflowPriority
ContextAggregator = MobileContextAggregator
BridgeConfiguration = dict  # TODO: Create proper configuration class
MobileWorkflowStatus = str  # TODO: Create proper status enum
WorkflowExecutionResult = MobileWorkflowExecution
OfflineWorkflowQueue = list  # TODO: Implement proper queue class
WorkflowRecommendationEngine = dict  # TODO: Implement recommendation engine

# Export main classes and aliases
__all__ = [
    "MobileWorkflowBridge",
    "MobileTriggerType",
    "WorkflowPriority",
    "MobileWorkflowTrigger",
    "MobileWorkflowExecution",
    "MobileContextAggregator",
    "WorkflowStatusBroadcaster",
    # Aliases for test compatibility
    "TriggerType",
    "TriggerPriority",
    "ContextAggregator",
    "BridgeConfiguration",
    "MobileWorkflowStatus",
    "WorkflowContext",
    "WorkflowExecutionResult",
    "OfflineWorkflowQueue",
    "WorkflowRecommendationEngine",
]
