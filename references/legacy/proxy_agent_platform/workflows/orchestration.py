"""
Advanced Agent Orchestration System.

This module provides enhanced agent orchestration capabilities including
load balancing, health monitoring, failover, and resource management.
"""

import asyncio
import logging
import random
import time
from collections import defaultdict, deque
from datetime import datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel

from .schema import (
    AgentHealthMetrics,
    AgentPoolConfiguration,
    AgentRole,
    LoadBalancingStrategy,
    WorkflowHealthStatus,
)

logger = logging.getLogger(__name__)


class AgentInstance(BaseModel):
    """Represents an individual agent instance."""

    instance_id: str
    agent_role: AgentRole
    agent: Any  # The actual agent object
    created_at: datetime
    is_active: bool = True
    current_load: int = 0
    max_concurrent_tasks: int = 5


class TaskAssignment(BaseModel):
    """Represents a task assignment to an agent."""

    task_id: str
    instance_id: str
    agent_role: AgentRole
    assigned_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    status: str = "assigned"  # assigned, running, completed, failed


class LoadBalancer:
    """Load balancer for distributing tasks across agent instances."""

    def __init__(self, strategy: LoadBalancingStrategy = LoadBalancingStrategy.LEAST_LOADED):
        """Initialize load balancer with strategy."""
        self.strategy = strategy
        self.agent_instances: dict[str, AgentInstance] = {}
        self.task_assignments: dict[str, TaskAssignment] = {}
        self.round_robin_counters: dict[AgentRole, int] = defaultdict(int)

    async def select_agent_instance(
        self,
        agent_role: AgentRole,
        task_requirements: dict[str, Any] | None = None,
    ) -> AgentInstance | None:
        """
        Select the best agent instance for a task.

        Args:
            agent_role: Required agent role
            task_requirements: Optional task-specific requirements

        Returns:
            Selected agent instance or None if none available
        """
        # Get available instances for the role
        available_instances = [
            instance for instance in self.agent_instances.values()
            if (instance.agent_role == agent_role and
                instance.is_active and
                instance.current_load < instance.max_concurrent_tasks)
        ]

        if not available_instances:
            return None

        # Apply load balancing strategy
        if self.strategy == LoadBalancingStrategy.ROUND_ROBIN:
            return self._select_round_robin(agent_role, available_instances)
        elif self.strategy == LoadBalancingStrategy.LEAST_LOADED:
            return self._select_least_loaded(available_instances)
        elif self.strategy == LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
            return self._select_weighted_round_robin(available_instances, task_requirements)
        elif self.strategy == LoadBalancingStrategy.RESPONSE_TIME_BASED:
            return self._select_by_response_time(available_instances)
        elif self.strategy == LoadBalancingStrategy.RESOURCE_BASED:
            return self._select_by_resources(available_instances)
        else:  # RANDOM
            return random.choice(available_instances)

    def _select_round_robin(
        self, agent_role: AgentRole, instances: list[AgentInstance]
    ) -> AgentInstance:
        """Select instance using round-robin strategy."""
        counter = self.round_robin_counters[agent_role]
        selected = instances[counter % len(instances)]
        self.round_robin_counters[agent_role] = (counter + 1) % len(instances)
        return selected

    def _select_least_loaded(self, instances: list[AgentInstance]) -> AgentInstance:
        """Select instance with least current load."""
        return min(instances, key=lambda x: x.current_load)

    def _select_weighted_round_robin(
        self, instances: list[AgentInstance], task_requirements: dict[str, Any] | None
    ) -> AgentInstance:
        """Select instance using weighted round-robin based on capacity."""
        # Simple implementation - could be enhanced with actual weights
        weighted_instances = []
        for instance in instances:
            weight = instance.max_concurrent_tasks - instance.current_load
            weighted_instances.extend([instance] * max(1, weight))

        return random.choice(weighted_instances) if weighted_instances else instances[0]

    def _select_by_response_time(self, instances: list[AgentInstance]) -> AgentInstance:
        """Select instance with best response time (placeholder implementation)."""
        # In real implementation, would track response times
        return min(instances, key=lambda x: x.current_load)

    def _select_by_resources(self, instances: list[AgentInstance]) -> AgentInstance:
        """Select instance based on resource availability."""
        # Simple implementation based on load
        return self._select_least_loaded(instances)

    async def assign_task(self, task_id: str, instance: AgentInstance) -> TaskAssignment:
        """Assign a task to an agent instance."""
        assignment = TaskAssignment(
            task_id=task_id,
            instance_id=instance.instance_id,
            agent_role=instance.agent_role,
            assigned_at=datetime.now(),
        )

        self.task_assignments[task_id] = assignment
        instance.current_load += 1

        logger.debug(
            "Assigned task %s to agent %s (load: %d/%d)",
            task_id,
            instance.instance_id,
            instance.current_load,
            instance.max_concurrent_tasks,
        )

        return assignment

    async def complete_task(self, task_id: str, success: bool = True) -> None:
        """Mark a task as completed and update agent load."""
        if task_id in self.task_assignments:
            assignment = self.task_assignments[task_id]
            assignment.completed_at = datetime.now()
            assignment.status = "completed" if success else "failed"

            # Find and update agent instance
            if assignment.instance_id in self.agent_instances:
                instance = self.agent_instances[assignment.instance_id]
                instance.current_load = max(0, instance.current_load - 1)

                logger.debug(
                    "Completed task %s on agent %s (load: %d/%d)",
                    task_id,
                    instance.instance_id,
                    instance.current_load,
                    instance.max_concurrent_tasks,
                )

    def add_agent_instance(self, instance: AgentInstance) -> None:
        """Add an agent instance to the pool."""
        self.agent_instances[instance.instance_id] = instance
        logger.info("Added agent instance: %s (%s)", instance.instance_id, instance.agent_role)

    def remove_agent_instance(self, instance_id: str) -> None:
        """Remove an agent instance from the pool."""
        if instance_id in self.agent_instances:
            instance = self.agent_instances.pop(instance_id)
            logger.info("Removed agent instance: %s (%s)", instance_id, instance.agent_role)

    def get_load_statistics(self) -> dict[str, Any]:
        """Get current load balancing statistics."""
        stats = {
            "total_instances": len(self.agent_instances),
            "active_instances": sum(1 for i in self.agent_instances.values() if i.is_active),
            "total_load": sum(i.current_load for i in self.agent_instances.values()),
            "by_role": {},
        }

        for role in AgentRole:
            role_instances = [i for i in self.agent_instances.values() if i.agent_role == role]
            if role_instances:
                stats["by_role"][role.value] = {
                    "instances": len(role_instances),
                    "active": sum(1 for i in role_instances if i.is_active),
                    "total_load": sum(i.current_load for i in role_instances),
                    "average_load": sum(i.current_load for i in role_instances) / len(role_instances),
                }

        return stats


class HealthMonitor:
    """Health monitoring system for agent instances."""

    def __init__(self, check_interval_seconds: int = 30):
        """Initialize health monitor."""
        self.check_interval = check_interval_seconds
        self.health_metrics: dict[str, AgentHealthMetrics] = {}
        self.health_history: dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self._monitoring_task: asyncio.Task | None = None
        self._running = False

    async def start_monitoring(self) -> None:
        """Start health monitoring background task."""
        if self._running:
            return

        self._running = True
        self._monitoring_task = asyncio.create_task(self._monitor_health_loop())
        logger.info("Started agent health monitoring")

    async def stop_monitoring(self) -> None:
        """Stop health monitoring."""
        self._running = False
        if self._monitoring_task:
            self._monitoring_task.cancel()
            try:
                await self._monitoring_task
            except asyncio.CancelledError:
                pass
        logger.info("Stopped agent health monitoring")

    async def check_agent_health(self, instance: AgentInstance) -> AgentHealthMetrics:
        """Check health of a specific agent instance."""
        start_time = time.time()

        try:
            # Perform health check (ping the agent)
            health_check_result = await self._perform_health_check(instance)
            response_time_ms = (time.time() - start_time) * 1000

            # Update or create health metrics
            if instance.instance_id not in self.health_metrics:
                self.health_metrics[instance.instance_id] = AgentHealthMetrics(
                    agent_role=instance.agent_role,
                    agent_id=instance.instance_id,
                    health_status=WorkflowHealthStatus.HEALTHY,
                )

            metrics = self.health_metrics[instance.instance_id]
            metrics.last_heartbeat = datetime.now()
            metrics.response_time_ms = response_time_ms

            if health_check_result["success"]:
                metrics.consecutive_failures = 0
                if metrics.health_status == WorkflowHealthStatus.UNHEALTHY:
                    metrics.health_status = WorkflowHealthStatus.DEGRADED
                elif metrics.health_status == WorkflowHealthStatus.DEGRADED:
                    if metrics.consecutive_failures == 0:
                        metrics.health_status = WorkflowHealthStatus.HEALTHY
            else:
                metrics.consecutive_failures += 1
                metrics.last_error = health_check_result.get("error", "Health check failed")

                if metrics.consecutive_failures >= 3:
                    metrics.health_status = WorkflowHealthStatus.UNHEALTHY
                elif metrics.consecutive_failures >= 1:
                    metrics.health_status = WorkflowHealthStatus.DEGRADED

            # Update derived metrics
            metrics.active_tasks = instance.current_load
            metrics.uptime_seconds = (datetime.now() - instance.created_at).total_seconds()

            # Store in history
            self.health_history[instance.instance_id].append({
                "timestamp": datetime.now(),
                "health_status": metrics.health_status,
                "response_time_ms": response_time_ms,
                "success": health_check_result["success"],
            })

            return metrics

        except Exception as e:
            logger.error("Health check failed for agent %s: %s", instance.instance_id, e)

            # Create/update metrics for failed check
            if instance.instance_id not in self.health_metrics:
                self.health_metrics[instance.instance_id] = AgentHealthMetrics(
                    agent_role=instance.agent_role,
                    agent_id=instance.instance_id,
                    health_status=WorkflowHealthStatus.UNKNOWN,
                )

            metrics = self.health_metrics[instance.instance_id]
            metrics.consecutive_failures += 1
            metrics.last_error = str(e)
            metrics.health_status = WorkflowHealthStatus.UNKNOWN

            return metrics

    async def _perform_health_check(self, instance: AgentInstance) -> dict[str, Any]:
        """Perform actual health check on agent instance."""
        try:
            # Simple health check - could be enhanced
            if hasattr(instance.agent, 'health_check'):
                result = await instance.agent.health_check()
                return {"success": True, "result": result}
            else:
                # Basic check - if agent is responsive
                return {"success": instance.is_active}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _monitor_health_loop(self) -> None:
        """Background health monitoring loop."""
        while self._running:
            try:
                # This would be called by the orchestrator with current instances
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                logger.error("Error in health monitoring loop: %s", e)
                await asyncio.sleep(self.check_interval)

    def get_health_summary(self) -> dict[str, Any]:
        """Get summary of agent health status."""
        if not self.health_metrics:
            return {"total_agents": 0, "healthy": 0, "degraded": 0, "unhealthy": 0, "unknown": 0}

        status_counts = defaultdict(int)
        for metrics in self.health_metrics.values():
            status_counts[metrics.health_status.value] += 1

        return {
            "total_agents": len(self.health_metrics),
            "healthy": status_counts["healthy"],
            "degraded": status_counts["degraded"],
            "unhealthy": status_counts["unhealthy"],
            "unknown": status_counts["unknown"],
            "overall_health_percentage": (
                (status_counts["healthy"] + status_counts["degraded"] * 0.5) /
                len(self.health_metrics) * 100
                if self.health_metrics else 100
            ),
        }


class AutoScaler:
    """Auto-scaling system for agent pools."""

    def __init__(self):
        """Initialize auto-scaler."""
        self.scaling_history: list[dict[str, Any]] = []
        self.last_scaling_action: dict[AgentRole, datetime] = {}
        self.cooldown_seconds = 300  # 5 minutes between scaling actions

    async def evaluate_scaling_needs(
        self,
        agent_role: AgentRole,
        current_instances: list[AgentInstance],
        config: AgentPoolConfiguration,
        metrics: dict[str, Any],
    ) -> dict[str, Any] | None:
        """
        Evaluate if agent pool needs scaling.

        Args:
            agent_role: Agent role to evaluate
            current_instances: Current instances for the role
            config: Pool configuration
            metrics: Current performance metrics

        Returns:
            Scaling recommendation or None
        """
        if not self._is_scaling_allowed(agent_role, config):
            return None

        active_instances = [i for i in current_instances if i.is_active]
        current_count = len(active_instances)

        if current_count == 0:
            return None

        # Calculate utilization
        total_capacity = sum(i.max_concurrent_tasks for i in active_instances)
        total_load = sum(i.current_load for i in active_instances)
        utilization = total_load / total_capacity if total_capacity > 0 else 0

        # Scale up decision
        if (utilization > config.scale_up_threshold and
            current_count < config.max_instances):

            return {
                "action": "scale_up",
                "agent_role": agent_role,
                "current_instances": current_count,
                "target_instances": min(current_count + 1, config.max_instances),
                "reason": f"Utilization {utilization:.2%} exceeds threshold {config.scale_up_threshold:.2%}",
                "utilization": utilization,
            }

        # Scale down decision
        elif (utilization < config.scale_down_threshold and
              current_count > config.min_instances):

            return {
                "action": "scale_down",
                "agent_role": agent_role,
                "current_instances": current_count,
                "target_instances": max(current_count - 1, config.min_instances),
                "reason": f"Utilization {utilization:.2%} below threshold {config.scale_down_threshold:.2%}",
                "utilization": utilization,
            }

        return None

    def _is_scaling_allowed(self, agent_role: AgentRole, config: AgentPoolConfiguration) -> bool:
        """Check if scaling is allowed based on cooldown period."""
        if agent_role not in self.last_scaling_action:
            return True

        time_since_last = (datetime.now() - self.last_scaling_action[agent_role]).total_seconds()
        return time_since_last >= config.cooldown_seconds

    async def record_scaling_action(
        self,
        agent_role: AgentRole,
        action: str,
        from_count: int,
        to_count: int,
        reason: str,
    ) -> None:
        """Record a scaling action."""
        self.last_scaling_action[agent_role] = datetime.now()

        scaling_record = {
            "timestamp": datetime.now(),
            "agent_role": agent_role.value,
            "action": action,
            "from_count": from_count,
            "to_count": to_count,
            "reason": reason,
        }

        self.scaling_history.append(scaling_record)

        # Keep only recent history
        if len(self.scaling_history) > 100:
            self.scaling_history.pop(0)

        logger.info(
            "Auto-scaling: %s %s instances from %d to %d - %s",
            action,
            agent_role.value,
            from_count,
            to_count,
            reason,
        )


class AgentOrchestrator:
    """
    Main orchestrator for advanced agent management.

    Combines load balancing, health monitoring, auto-scaling,
    and failover capabilities.
    """

    def __init__(self):
        """Initialize the agent orchestrator."""
        self.load_balancer = LoadBalancer()
        self.health_monitor = HealthMonitor()
        self.auto_scaler = AutoScaler()
        self.agent_pools: dict[AgentRole, AgentPoolConfiguration] = {}
        self.failover_agents: dict[AgentRole, list[str]] = defaultdict(list)
        self._orchestration_task: asyncio.Task | None = None
        self._running = False

    async def start_orchestration(self) -> None:
        """Start the orchestration system."""
        if self._running:
            return

        self._running = True
        await self.health_monitor.start_monitoring()
        self._orchestration_task = asyncio.create_task(self._orchestration_loop())
        logger.info("Started agent orchestration system")

    async def stop_orchestration(self) -> None:
        """Stop the orchestration system."""
        self._running = False
        await self.health_monitor.stop_monitoring()

        if self._orchestration_task:
            self._orchestration_task.cancel()
            try:
                await self._orchestration_task
            except asyncio.CancelledError:
                pass

        logger.info("Stopped agent orchestration system")

    async def register_agent_pool(
        self,
        agent_role: AgentRole,
        config: AgentPoolConfiguration,
        initial_instances: list[Any],
    ) -> None:
        """Register an agent pool with configuration."""
        self.agent_pools[agent_role] = config

        # Create initial agent instances
        for i, agent in enumerate(initial_instances):
            instance = AgentInstance(
                instance_id=f"{agent_role.value}_{i}_{uuid4().hex[:8]}",
                agent_role=agent_role,
                agent=agent,
                created_at=datetime.now(),
                max_concurrent_tasks=5,  # Could be configurable
            )
            self.load_balancer.add_agent_instance(instance)

        logger.info(
            "Registered agent pool: %s with %d instances",
            agent_role.value,
            len(initial_instances),
        )

    async def assign_task_to_agent(
        self,
        task_id: str,
        agent_role: AgentRole,
        task_requirements: dict[str, Any] | None = None,
    ) -> TaskAssignment | None:
        """
        Assign a task to the best available agent.

        Args:
            task_id: Unique task identifier
            agent_role: Required agent role
            task_requirements: Optional task-specific requirements

        Returns:
            Task assignment or None if no agent available
        """
        # Try to get a healthy agent instance
        instance = await self.load_balancer.select_agent_instance(agent_role, task_requirements)

        if not instance:
            # Try to scale up if possible
            await self._attempt_emergency_scaling(agent_role)
            instance = await self.load_balancer.select_agent_instance(agent_role, task_requirements)

        if not instance:
            # Try failover to different agent role
            instance = await self._attempt_failover(agent_role, task_requirements)

        if instance:
            assignment = await self.load_balancer.assign_task(task_id, instance)
            logger.debug("Assigned task %s to agent %s", task_id, instance.instance_id)
            return assignment
        else:
            logger.warning("No available agent for task %s (role: %s)", task_id, agent_role.value)
            return None

    async def complete_task(
        self,
        task_id: str,
        success: bool = True,
        response_time_ms: float | None = None,
        error_message: str | None = None,
    ) -> None:
        """Complete a task and update metrics."""
        await self.load_balancer.complete_task(task_id, success)

        # Update agent health metrics if we have response time
        if task_id in self.load_balancer.task_assignments:
            assignment = self.load_balancer.task_assignments[task_id]
            if assignment.instance_id in self.load_balancer.agent_instances:
                instance = self.load_balancer.agent_instances[assignment.instance_id]

                # Update health metrics
                if instance.instance_id in self.health_monitor.health_metrics:
                    metrics = self.health_monitor.health_metrics[instance.instance_id]
                    if response_time_ms:
                        # Update moving average of response time
                        if metrics.response_time_ms == 0:
                            metrics.response_time_ms = response_time_ms
                        else:
                            metrics.response_time_ms = (metrics.response_time_ms * 0.8) + (response_time_ms * 0.2)

                    if success:
                        metrics.consecutive_failures = 0
                        metrics.success_rate = min(100.0, metrics.success_rate + 0.1)
                    else:
                        metrics.consecutive_failures += 1
                        metrics.last_error = error_message
                        metrics.success_rate = max(0.0, metrics.success_rate - 1.0)

    async def get_orchestration_status(self) -> dict[str, Any]:
        """Get comprehensive orchestration status."""
        load_stats = self.load_balancer.get_load_statistics()
        health_summary = self.health_monitor.get_health_summary()

        return {
            "load_balancing": load_stats,
            "health_monitoring": health_summary,
            "agent_pools": {
                role.value: {
                    "config": config.model_dump(),
                    "instances": len([
                        i for i in self.load_balancer.agent_instances.values()
                        if i.agent_role == role
                    ]),
                }
                for role, config in self.agent_pools.items()
            },
            "recent_scaling_actions": self.auto_scaler.scaling_history[-10:],
            "system_health": "healthy" if health_summary["overall_health_percentage"] > 80 else "degraded",
        }

    async def _orchestration_loop(self) -> None:
        """Main orchestration loop for monitoring and scaling."""
        while self._running:
            try:
                # Check health of all instances
                instances_by_role = defaultdict(list)
                for instance in self.load_balancer.agent_instances.values():
                    instances_by_role[instance.agent_role].append(instance)
                    await self.health_monitor.check_agent_health(instance)

                # Evaluate scaling needs for each role
                for agent_role, config in self.agent_pools.items():
                    instances = instances_by_role[agent_role]
                    metrics = self._get_role_metrics(agent_role, instances)

                    scaling_recommendation = await self.auto_scaler.evaluate_scaling_needs(
                        agent_role, instances, config, metrics
                    )

                    if scaling_recommendation:
                        await self._execute_scaling_action(scaling_recommendation)

                # Check for unhealthy instances and remove them
                await self._handle_unhealthy_instances()

                await asyncio.sleep(30)  # Run every 30 seconds

            except Exception as e:
                logger.error("Error in orchestration loop: %s", e)
                await asyncio.sleep(60)  # Back off on error

    async def _attempt_emergency_scaling(self, agent_role: AgentRole) -> None:
        """Attempt emergency scaling when no agents are available."""
        if agent_role not in self.agent_pools:
            return

        config = self.agent_pools[agent_role]
        current_instances = [
            i for i in self.load_balancer.agent_instances.values()
            if i.agent_role == agent_role
        ]

        if len(current_instances) < config.max_instances:
            # Create emergency instance (simplified)
            logger.warning("Attempting emergency scaling for %s", agent_role.value)
            # In real implementation, would create new agent instance

    async def _attempt_failover(
        self,
        primary_role: AgentRole,
        task_requirements: dict[str, Any] | None,
    ) -> AgentInstance | None:
        """Attempt failover to alternative agent roles."""
        # Define failover mapping
        failover_mapping = {
            AgentRole.IMPLEMENTATION: [AgentRole.ARCHITECT, AgentRole.QUALITY],
            AgentRole.QUALITY: [AgentRole.IMPLEMENTATION, AgentRole.INTEGRATION],
            AgentRole.INTEGRATION: [AgentRole.QUALITY, AgentRole.IMPLEMENTATION],
            AgentRole.ARCHITECT: [AgentRole.PROJECT_MANAGER],
            AgentRole.PROJECT_MANAGER: [AgentRole.ARCHITECT],
        }

        if primary_role not in failover_mapping:
            return None

        for fallback_role in failover_mapping[primary_role]:
            instance = await self.load_balancer.select_agent_instance(fallback_role, task_requirements)
            if instance:
                logger.warning(
                    "Using failover: %s -> %s for task",
                    primary_role.value,
                    fallback_role.value,
                )
                return instance

        return None

    async def _execute_scaling_action(self, recommendation: dict[str, Any]) -> None:
        """Execute a scaling action based on recommendation."""
        action = recommendation["action"]
        agent_role = recommendation["agent_role"]

        if action == "scale_up":
            # In real implementation, would create new agent instance
            logger.info(
                "Would scale up %s: %d -> %d",
                agent_role.value,
                recommendation["current_instances"],
                recommendation["target_instances"],
            )
        elif action == "scale_down":
            # In real implementation, would remove least utilized instance
            logger.info(
                "Would scale down %s: %d -> %d",
                agent_role.value,
                recommendation["current_instances"],
                recommendation["target_instances"],
            )

        await self.auto_scaler.record_scaling_action(
            agent_role,
            action,
            recommendation["current_instances"],
            recommendation["target_instances"],
            recommendation["reason"],
        )

    async def _handle_unhealthy_instances(self) -> None:
        """Remove consistently unhealthy instances."""
        unhealthy_instances = []

        for instance_id, metrics in self.health_monitor.health_metrics.items():
            if (metrics.health_status == WorkflowHealthStatus.UNHEALTHY and
                metrics.consecutive_failures >= 5):
                unhealthy_instances.append(instance_id)

        for instance_id in unhealthy_instances:
            if instance_id in self.load_balancer.agent_instances:
                instance = self.load_balancer.agent_instances[instance_id]
                instance.is_active = False
                logger.warning(
                    "Marking instance as inactive due to health issues: %s",
                    instance_id,
                )

    def _get_role_metrics(
        self, agent_role: AgentRole, instances: list[AgentInstance]
    ) -> dict[str, Any]:
        """Get metrics for a specific agent role."""
        if not instances:
            return {}

        total_load = sum(i.current_load for i in instances)
        total_capacity = sum(i.max_concurrent_tasks for i in instances)
        active_instances = [i for i in instances if i.is_active]

        health_metrics = [
            self.health_monitor.health_metrics.get(i.instance_id)
            for i in instances
            if i.instance_id in self.health_monitor.health_metrics
        ]

        healthy_count = sum(
            1 for m in health_metrics
            if m and m.health_status == WorkflowHealthStatus.HEALTHY
        )

        return {
            "total_instances": len(instances),
            "active_instances": len(active_instances),
            "healthy_instances": healthy_count,
            "total_load": total_load,
            "total_capacity": total_capacity,
            "utilization": total_load / total_capacity if total_capacity > 0 else 0,
            "average_response_time": (
                sum(m.response_time_ms for m in health_metrics if m) / len(health_metrics)
                if health_metrics else 0
            ),
        }
