"""
Real-time Workflow Monitoring and Analytics System.

This module provides comprehensive monitoring capabilities for workflow execution,
including performance metrics collection, real-time analytics, and dashboard data.
"""

import asyncio
import logging
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

import psutil

from .schema import (
    AgentHealthMetrics,
    AgentRole,
    StepExecutionMetrics,
    WorkflowAnalytics,
    WorkflowHealthStatus,
    WorkflowResult,
)

logger = logging.getLogger(__name__)


class MetricsCollector:
    """Collects and aggregates real-time workflow metrics."""

    def __init__(self, retention_hours: int = 24):
        """
        Initialize metrics collector.

        Args:
            retention_hours: How long to retain metrics data
        """
        self.retention_hours = retention_hours
        self.step_metrics: dict[str, StepExecutionMetrics] = {}
        self.agent_metrics: dict[str, AgentHealthMetrics] = {}
        self.workflow_executions: deque = deque(maxlen=1000)
        self.performance_history: dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self._collection_tasks: list[asyncio.Task] = []
        self._running = False

    async def start_collection(self) -> None:
        """Start real-time metrics collection."""
        if self._running:
            return

        self._running = True
        logger.info("Starting real-time metrics collection")

        # Start background collection tasks
        self._collection_tasks = [
            asyncio.create_task(self._collect_system_metrics()),
            asyncio.create_task(self._collect_agent_health()),
            asyncio.create_task(self._cleanup_old_metrics()),
        ]

    async def stop_collection(self) -> None:
        """Stop metrics collection and cleanup tasks."""
        self._running = False

        for task in self._collection_tasks:
            task.cancel()

        await asyncio.gather(*self._collection_tasks, return_exceptions=True)
        self._collection_tasks.clear()
        logger.info("Stopped metrics collection")

    async def record_step_start(
        self, step_id: str, execution_id: UUID, agent_role: AgentRole
    ) -> None:
        """Record the start of a workflow step execution."""
        metrics = StepExecutionMetrics(
            step_id=step_id,
            execution_id=execution_id,
            agent_role=agent_role,
            start_time=datetime.now(),
        )

        self.step_metrics[f"{execution_id}:{step_id}"] = metrics
        logger.debug("Started tracking step: %s", step_id)

    async def record_step_completion(
        self,
        step_id: str,
        execution_id: UUID,
        success: bool = True,
        error_count: int = 0,
        retry_count: int = 0,
        test_coverage: float | None = None,
        quality_score: float | None = None,
    ) -> StepExecutionMetrics:
        """Record the completion of a workflow step execution."""
        metrics_key = f"{execution_id}:{step_id}"

        if metrics_key not in self.step_metrics:
            logger.warning("No start metrics found for step: %s", step_id)
            return None

        metrics = self.step_metrics[metrics_key]
        metrics.end_time = datetime.now()
        metrics.duration_seconds = (metrics.end_time - metrics.start_time).total_seconds()
        metrics.error_count = error_count
        metrics.retry_count = retry_count
        metrics.test_coverage_percent = test_coverage
        metrics.code_quality_score = quality_score

        # Collect resource usage
        process = psutil.Process()
        metrics.cpu_usage_percent = process.cpu_percent()
        metrics.memory_usage_mb = process.memory_info().rss / 1024 / 1024

        # Store in performance history
        self.performance_history[step_id].append({
            "timestamp": metrics.end_time,
            "duration": metrics.duration_seconds,
            "success": success,
            "cpu_usage": metrics.cpu_usage_percent,
            "memory_usage": metrics.memory_usage_mb,
        })

        logger.debug(
            "Completed step tracking: %s (%.2fs)", step_id, metrics.duration_seconds
        )
        return metrics

    async def record_workflow_execution(self, result: WorkflowResult) -> None:
        """Record a complete workflow execution result."""
        self.workflow_executions.append({
            "workflow_id": result.workflow_id,
            "execution_id": result.execution_id,
            "status": result.status,
            "start_time": result.start_time,
            "end_time": result.end_time,
            "duration_seconds": result.duration_seconds,
            "step_count": len(result.step_results),
            "success_rate": len(result.completed_steps) / len(result.step_results) if result.step_results else 0,
        })

        logger.debug("Recorded workflow execution: %s", result.workflow_id)

    async def update_agent_health(
        self,
        agent_role: AgentRole,
        agent_id: str,
        response_time_ms: float,
        success: bool = True,
        error_message: str | None = None,
    ) -> None:
        """Update agent health metrics."""
        if agent_id not in self.agent_metrics:
            self.agent_metrics[agent_id] = AgentHealthMetrics(
                agent_role=agent_role,
                agent_id=agent_id,
                health_status=WorkflowHealthStatus.HEALTHY,
            )

        metrics = self.agent_metrics[agent_id]
        metrics.last_heartbeat = datetime.now()

        # Update response time (moving average)
        if metrics.response_time_ms == 0:
            metrics.response_time_ms = response_time_ms
        else:
            metrics.response_time_ms = (metrics.response_time_ms * 0.8) + (response_time_ms * 0.2)

        # Update success rate
        if success:
            metrics.consecutive_failures = 0
            # Increase success rate gradually
            metrics.success_rate = min(100.0, metrics.success_rate + 0.1)
        else:
            metrics.consecutive_failures += 1
            metrics.last_error = error_message
            # Decrease success rate based on failure
            metrics.success_rate = max(0.0, metrics.success_rate - 1.0)

        # Update health status based on metrics
        if metrics.consecutive_failures >= 3:
            metrics.health_status = WorkflowHealthStatus.UNHEALTHY
        elif metrics.success_rate < 90:
            metrics.health_status = WorkflowHealthStatus.DEGRADED
        else:
            metrics.health_status = WorkflowHealthStatus.HEALTHY

        logger.debug(
            "Updated agent health: %s (%s) - %s",
            agent_id,
            metrics.health_status,
            metrics.success_rate,
        )

    async def get_workflow_analytics(
        self, workflow_id: str, hours_back: int = 24
    ) -> WorkflowAnalytics:
        """Generate comprehensive analytics for a workflow."""
        cutoff_time = datetime.now() - timedelta(hours=hours_back)

        # Filter executions for the workflow and time period
        relevant_executions = [
            exec for exec in self.workflow_executions
            if exec["workflow_id"] == workflow_id and exec["start_time"] >= cutoff_time
        ]

        if not relevant_executions:
            return WorkflowAnalytics(
                workflow_id=workflow_id,
                analysis_period_start=cutoff_time,
                analysis_period_end=datetime.now(),
            )

        # Calculate statistics
        total_executions = len(relevant_executions)
        successful_executions = sum(1 for exec in relevant_executions if exec["success_rate"] > 0.8)
        failed_executions = total_executions - successful_executions

        durations = [exec["duration_seconds"] for exec in relevant_executions if exec["duration_seconds"]]
        average_duration = sum(durations) / len(durations) if durations else 0.0

        # Analyze performance trends
        if len(durations) >= 2:
            recent_avg = sum(durations[-5:]) / len(durations[-5:])
            older_avg = sum(durations[:-5]) / len(durations[:-5]) if len(durations) > 5 else recent_avg

            if recent_avg < older_avg * 0.9:
                trend = "improving"
            elif recent_avg > older_avg * 1.1:
                trend = "degrading"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"

        # Bottleneck analysis
        bottlenecks = self._analyze_bottlenecks(workflow_id)

        # Agent performance breakdown
        agent_breakdown = self._analyze_agent_performance()

        # Generate recommendations
        recommendations = self._generate_recommendations(
            workflow_id, relevant_executions, bottlenecks, agent_breakdown
        )

        return WorkflowAnalytics(
            workflow_id=workflow_id,
            analysis_period_start=cutoff_time,
            analysis_period_end=datetime.now(),
            total_executions=total_executions,
            successful_executions=successful_executions,
            failed_executions=failed_executions,
            average_duration_seconds=average_duration,
            performance_trend=trend,
            bottleneck_analysis=bottlenecks,
            efficiency_score=self._calculate_efficiency_score(relevant_executions),
            agent_performance_breakdown=agent_breakdown,
            optimization_recommendations=recommendations,
        )

    async def get_real_time_dashboard_data(self) -> dict[str, Any]:
        """Get real-time data for monitoring dashboard."""
        current_time = datetime.now()

        # Active workflow count
        active_workflows = len([
            exec for exec in self.workflow_executions
            if exec.get("end_time") is None or
            (current_time - exec["start_time"]).total_seconds() < 3600  # Active in last hour
        ])

        # Agent health summary
        healthy_agents = sum(
            1 for agent in self.agent_metrics.values()
            if agent.health_status == WorkflowHealthStatus.HEALTHY
        )

        total_agents = len(self.agent_metrics)

        # Recent performance metrics
        recent_executions = [
            exec for exec in self.workflow_executions
            if (current_time - exec["start_time"]).total_seconds() < 3600
        ]

        success_rate = (
            sum(1 for exec in recent_executions if exec["success_rate"] > 0.8) /
            len(recent_executions) if recent_executions else 100.0
        ) * 100

        avg_duration = (
            sum(exec["duration_seconds"] for exec in recent_executions if exec["duration_seconds"]) /
            len([exec for exec in recent_executions if exec["duration_seconds"]])
            if any(exec["duration_seconds"] for exec in recent_executions) else 0.0
        )

        return {
            "timestamp": current_time,
            "active_workflows": active_workflows,
            "total_executions_today": len(recent_executions),
            "success_rate_percent": success_rate,
            "average_duration_seconds": avg_duration,
            "agent_health": {
                "healthy": healthy_agents,
                "total": total_agents,
                "health_percentage": (healthy_agents / total_agents * 100) if total_agents > 0 else 100,
            },
            "top_performing_workflows": self._get_top_performing_workflows(),
            "recent_errors": self._get_recent_errors(),
            "resource_utilization": self._get_resource_utilization(),
        }

    async def _collect_system_metrics(self) -> None:
        """Background task to collect system-level metrics."""
        while self._running:
            try:
                # Collect system metrics
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage("/")

                # Store system metrics
                timestamp = datetime.now()
                self.performance_history["system"].append({
                    "timestamp": timestamp,
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "disk_percent": disk.percent,
                })

                await asyncio.sleep(10)  # Collect every 10 seconds

            except Exception as e:
                logger.error("Error collecting system metrics: %s", e)
                await asyncio.sleep(30)  # Back off on error

    async def _collect_agent_health(self) -> None:
        """Background task to monitor agent health."""
        while self._running:
            try:
                current_time = datetime.now()

                for agent_id, metrics in self.agent_metrics.items():
                    # Check for stale agents (no heartbeat in 5 minutes)
                    if (current_time - metrics.last_heartbeat).total_seconds() > 300:
                        metrics.health_status = WorkflowHealthStatus.UNKNOWN
                        metrics.consecutive_failures += 1

                    # Update uptime
                    metrics.uptime_seconds = (current_time - metrics.last_heartbeat).total_seconds()

                await asyncio.sleep(30)  # Check every 30 seconds

            except Exception as e:
                logger.error("Error collecting agent health: %s", e)
                await asyncio.sleep(60)

    async def _cleanup_old_metrics(self) -> None:
        """Background task to cleanup old metrics data."""
        while self._running:
            try:
                cutoff_time = datetime.now() - timedelta(hours=self.retention_hours)

                # Clean up step metrics
                expired_keys = [
                    key for key, metrics in self.step_metrics.items()
                    if metrics.start_time < cutoff_time
                ]
                for key in expired_keys:
                    del self.step_metrics[key]

                # Clean up performance history
                for step_id, history in self.performance_history.items():
                    while history and history[0]["timestamp"] < cutoff_time:
                        history.popleft()

                logger.debug("Cleaned up %d expired metrics", len(expired_keys))
                await asyncio.sleep(3600)  # Cleanup every hour

            except Exception as e:
                logger.error("Error cleaning up metrics: %s", e)
                await asyncio.sleep(3600)

    def _analyze_bottlenecks(self, workflow_id: str) -> dict[str, Any]:
        """Analyze workflow bottlenecks."""
        step_performance = defaultdict(list)

        # Collect performance data for each step
        for step_id, history in self.performance_history.items():
            if step_id != "system":  # Skip system metrics
                for entry in history:
                    step_performance[step_id].append(entry["duration"])

        # Find bottleneck steps
        bottleneck_steps = []
        for step_id, durations in step_performance.items():
            if durations:
                avg_duration = sum(durations) / len(durations)
                if avg_duration > 60:  # Steps taking more than 1 minute
                    bottleneck_steps.append({
                        "step_id": step_id,
                        "average_duration": avg_duration,
                        "max_duration": max(durations),
                        "execution_count": len(durations),
                    })

        # Sort by average duration
        bottleneck_steps.sort(key=lambda x: x["average_duration"], reverse=True)

        return {
            "bottleneck_steps": bottleneck_steps[:5],  # Top 5 bottlenecks
            "total_analyzed_steps": len(step_performance),
            "analysis_timestamp": datetime.now(),
        }

    def _analyze_agent_performance(self) -> dict[AgentRole, dict[str, Any]]:
        """Analyze performance by agent role."""
        agent_breakdown = {}

        for agent_role in AgentRole:
            role_agents = [
                agent for agent in self.agent_metrics.values()
                if agent.agent_role == agent_role
            ]

            if role_agents:
                avg_response_time = sum(agent.response_time_ms for agent in role_agents) / len(role_agents)
                avg_success_rate = sum(agent.success_rate for agent in role_agents) / len(role_agents)
                total_active_tasks = sum(agent.active_tasks for agent in role_agents)

                agent_breakdown[agent_role] = {
                    "instance_count": len(role_agents),
                    "average_response_time_ms": avg_response_time,
                    "average_success_rate": avg_success_rate,
                    "total_active_tasks": total_active_tasks,
                    "health_status": min(agent.health_status.value for agent in role_agents),
                }

        return agent_breakdown

    def _generate_recommendations(
        self,
        workflow_id: str,
        executions: list[dict[str, Any]],
        bottlenecks: dict[str, Any],
        agent_performance: dict[AgentRole, dict[str, Any]],
    ) -> list[str]:
        """Generate optimization recommendations."""
        recommendations = []

        # Check success rate
        success_rate = sum(1 for exec in executions if exec["success_rate"] > 0.8) / len(executions)
        if success_rate < 0.9:
            recommendations.append(
                f"Success rate is {success_rate:.1%}. Consider improving error handling and retry logic."
            )

        # Check bottlenecks
        if bottlenecks["bottleneck_steps"]:
            top_bottleneck = bottlenecks["bottleneck_steps"][0]
            recommendations.append(
                f"Step '{top_bottleneck['step_id']}' averages {top_bottleneck['average_duration']:.1f}s. "
                "Consider optimizing or parallelizing this step."
            )

        # Check agent performance
        for role, perf in agent_performance.items():
            if perf["average_response_time_ms"] > 5000:  # 5 seconds
                recommendations.append(
                    f"{role.value} agents are slow (avg {perf['average_response_time_ms']:.0f}ms). "
                    "Consider scaling up or optimizing agent implementation."
                )

        # Check resource utilization
        system_metrics = self.performance_history.get("system", [])
        if system_metrics:
            recent_cpu = [m["cpu_percent"] for m in system_metrics[-10:]]
            if recent_cpu and sum(recent_cpu) / len(recent_cpu) > 80:
                recommendations.append(
                    "High CPU utilization detected. Consider distributing load or upgrading resources."
                )

        return recommendations[:5]  # Return top 5 recommendations

    def _calculate_efficiency_score(self, executions: list[dict[str, Any]]) -> float:
        """Calculate overall efficiency score for the workflow."""
        if not executions:
            return 0.0

        # Factors: success rate, duration consistency, resource usage
        success_rate = sum(1 for exec in executions if exec["success_rate"] > 0.8) / len(executions)

        durations = [exec["duration_seconds"] for exec in executions if exec["duration_seconds"]]
        if durations:
            avg_duration = sum(durations) / len(durations)
            duration_variance = sum((d - avg_duration) ** 2 for d in durations) / len(durations)
            consistency_score = max(0, 1 - (duration_variance / (avg_duration ** 2)))
        else:
            consistency_score = 1.0

        # Combine factors (weighted)
        efficiency_score = (success_rate * 0.5) + (consistency_score * 0.3) + (0.8 * 0.2)  # Base performance

        return min(10.0, efficiency_score * 10)  # Scale to 0-10

    def _get_top_performing_workflows(self) -> list[dict[str, Any]]:
        """Get top performing workflows by success rate."""
        workflow_stats = defaultdict(lambda: {"executions": 0, "successes": 0})

        for exec in list(self.workflow_executions)[-50:]:  # Last 50 executions
            workflow_stats[exec["workflow_id"]]["executions"] += 1
            if exec["success_rate"] > 0.8:
                workflow_stats[exec["workflow_id"]]["successes"] += 1

        top_workflows = []
        for workflow_id, stats in workflow_stats.items():
            if stats["executions"] >= 3:  # Minimum 3 executions
                success_rate = stats["successes"] / stats["executions"]
                top_workflows.append({
                    "workflow_id": workflow_id,
                    "success_rate": success_rate,
                    "execution_count": stats["executions"],
                })

        return sorted(top_workflows, key=lambda x: x["success_rate"], reverse=True)[:5]

    def _get_recent_errors(self) -> list[dict[str, Any]]:
        """Get recent errors from agent metrics."""
        errors = []
        for agent in self.agent_metrics.values():
            if agent.last_error and agent.consecutive_failures > 0:
                errors.append({
                    "agent_id": agent.agent_id,
                    "agent_role": agent.agent_role.value,
                    "error_message": agent.last_error,
                    "consecutive_failures": agent.consecutive_failures,
                    "timestamp": agent.last_heartbeat,
                })

        return sorted(errors, key=lambda x: x["timestamp"], reverse=True)[:10]

    def _get_resource_utilization(self) -> dict[str, float]:
        """Get current resource utilization."""
        system_metrics = self.performance_history.get("system", [])
        if system_metrics:
            latest = system_metrics[-1]
            return {
                "cpu_percent": latest["cpu_percent"],
                "memory_percent": latest["memory_percent"],
                "disk_percent": latest["disk_percent"],
            }
        else:
            return {"cpu_percent": 0, "memory_percent": 0, "disk_percent": 0}
