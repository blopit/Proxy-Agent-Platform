"""
Utility classes and functions for the enhanced workflow system.

This module provides helper utilities, configuration management, and
convenience functions for working with the advanced workflow features.
"""

import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from .schema import (
    AgentRole,
    LoadBalancingStrategy,
    WorkflowHealthStatus,
    WorkflowResult,
    WorkflowStatus,
)

logger = logging.getLogger(__name__)


class WorkflowEngineConfig(BaseModel):
    """Configuration for the enhanced workflow engine."""

    # Directories
    workflows_dir: Path = Path("workflows")
    templates_dir: Path = Path("templates")
    git_repo_path: Path = Path(".")

    # Feature flags
    enable_monitoring: bool = True
    enable_adaptation: bool = True
    enable_orchestration: bool = True

    # Monitoring settings
    metrics_retention_hours: int = 24
    health_check_interval_seconds: int = 30

    # Orchestration settings
    default_load_balancing_strategy: LoadBalancingStrategy = LoadBalancingStrategy.LEAST_LOADED
    default_min_agent_instances: int = 1
    default_max_agent_instances: int = 3
    agent_failure_threshold: int = 3
    agent_recovery_threshold: int = 2

    # Adaptation settings
    performance_degradation_threshold: float = 50.0  # Percentage
    error_rate_threshold: float = 0.3
    cpu_threshold: float = 90.0
    memory_threshold: float = 85.0

    # Retry settings
    default_max_retry_attempts: int = 3
    default_retry_base_delay: float = 2.0
    default_retry_max_delay: float = 60.0
    default_retry_multiplier: float = 2.0

    class Config:
        """Pydantic configuration."""

        use_enum_values = True


class WorkflowPerformanceAnalyzer:
    """Analyzer for workflow performance metrics and trends."""

    @staticmethod
    def analyze_execution_trends(
        results: list[WorkflowResult], time_window_hours: int = 24
    ) -> dict[str, Any]:
        """
        Analyze execution trends over a time window.

        Args:
            results: List of workflow results to analyze
            time_window_hours: Time window for analysis

        Returns:
            Trend analysis results
        """
        if not results:
            return {
                "total_executions": 0,
                "success_rate": 0.0,
                "average_duration": 0.0,
                "trend": "no_data",
            }

        # Filter results by time window
        cutoff_time = datetime.now() - timedelta(hours=time_window_hours)
        recent_results = [
            result for result in results
            if result.start_time >= cutoff_time
        ]

        if not recent_results:
            return {
                "total_executions": 0,
                "success_rate": 0.0,
                "average_duration": 0.0,
                "trend": "no_recent_data",
            }

        # Calculate basic metrics
        total_executions = len(recent_results)
        successful_executions = sum(
            1 for result in recent_results
            if result.status == WorkflowStatus.COMPLETED
        )
        success_rate = (successful_executions / total_executions) * 100

        # Calculate duration metrics
        durations = [
            result.duration_seconds for result in recent_results
            if result.duration_seconds is not None
        ]
        average_duration = sum(durations) / len(durations) if durations else 0.0

        # Analyze trend
        trend = WorkflowPerformanceAnalyzer._calculate_trend(recent_results)

        return {
            "total_executions": total_executions,
            "success_rate": success_rate,
            "average_duration": average_duration,
            "trend": trend,
            "fastest_execution": min(durations) if durations else 0.0,
            "slowest_execution": max(durations) if durations else 0.0,
            "failed_executions": total_executions - successful_executions,
        }

    @staticmethod
    def _calculate_trend(results: list[WorkflowResult]) -> str:
        """Calculate performance trend."""
        if len(results) < 4:
            return "insufficient_data"

        # Split into two halves and compare
        mid_point = len(results) // 2
        first_half = results[:mid_point]
        second_half = results[mid_point:]

        first_half_avg = WorkflowPerformanceAnalyzer._calculate_average_duration(first_half)
        second_half_avg = WorkflowPerformanceAnalyzer._calculate_average_duration(second_half)

        if first_half_avg == 0 or second_half_avg == 0:
            return "insufficient_data"

        change_percentage = ((second_half_avg - first_half_avg) / first_half_avg) * 100

        if change_percentage < -10:
            return "improving"
        elif change_percentage > 10:
            return "degrading"
        else:
            return "stable"

    @staticmethod
    def _calculate_average_duration(results: list[WorkflowResult]) -> float:
        """Calculate average duration for a list of results."""
        durations = [
            result.duration_seconds for result in results
            if result.duration_seconds is not None
        ]
        return sum(durations) / len(durations) if durations else 0.0

    @staticmethod
    def identify_bottlenecks(results: list[WorkflowResult]) -> list[dict[str, Any]]:
        """
        Identify workflow bottlenecks.

        Args:
            results: List of workflow results to analyze

        Returns:
            List of identified bottlenecks
        """
        bottlenecks = []
        step_performance = {}

        # Aggregate step performance data
        for result in results:
            if not result.step_results:
                continue

            for step_id, step_result in result.step_results.items():
                duration = step_result.get("duration_seconds", 0)
                if duration > 0:
                    if step_id not in step_performance:
                        step_performance[step_id] = []
                    step_performance[step_id].append(duration)

        # Identify bottleneck steps
        for step_id, durations in step_performance.items():
            if len(durations) < 3:  # Need at least 3 data points
                continue

            avg_duration = sum(durations) / len(durations)
            max_duration = max(durations)

            # Consider a step a bottleneck if it's consistently slow
            if avg_duration > 30:  # More than 30 seconds average
                bottlenecks.append({
                    "step_id": step_id,
                    "average_duration": avg_duration,
                    "max_duration": max_duration,
                    "execution_count": len(durations),
                    "severity": "high" if avg_duration > 120 else "medium",
                })

        # Sort by average duration
        bottlenecks.sort(key=lambda x: x["average_duration"], reverse=True)
        return bottlenecks


class WorkflowHealthChecker:
    """Health checker for workflow engine components."""

    @staticmethod
    def check_engine_health(
        active_workflows: int,
        agent_health_summary: dict[str, Any],
        recent_error_rate: float,
    ) -> tuple[WorkflowHealthStatus, list[str]]:
        """
        Check overall engine health.

        Args:
            active_workflows: Number of active workflows
            agent_health_summary: Agent health summary
            recent_error_rate: Recent error rate

        Returns:
            Health status and list of issues
        """
        issues = []
        health_status = WorkflowHealthStatus.HEALTHY

        # Check active workflow count
        if active_workflows > 100:
            issues.append("High number of active workflows (> 100)")
            health_status = WorkflowHealthStatus.DEGRADED

        # Check agent health
        agent_health_percentage = agent_health_summary.get("overall_health_percentage", 100)
        if agent_health_percentage < 70:
            issues.append(f"Poor agent health ({agent_health_percentage:.1f}%)")
            health_status = WorkflowHealthStatus.UNHEALTHY
        elif agent_health_percentage < 90:
            issues.append(f"Degraded agent health ({agent_health_percentage:.1f}%)")
            if health_status == WorkflowHealthStatus.HEALTHY:
                health_status = WorkflowHealthStatus.DEGRADED

        # Check error rate
        if recent_error_rate > 0.5:
            issues.append(f"High error rate ({recent_error_rate:.1%})")
            health_status = WorkflowHealthStatus.UNHEALTHY
        elif recent_error_rate > 0.2:
            issues.append(f"Elevated error rate ({recent_error_rate:.1%})")
            if health_status == WorkflowHealthStatus.HEALTHY:
                health_status = WorkflowHealthStatus.DEGRADED

        return health_status, issues

    @staticmethod
    def check_agent_role_health(agent_role: AgentRole, metrics: dict[str, Any]) -> dict[str, Any]:
        """
        Check health of a specific agent role.

        Args:
            agent_role: Agent role to check
            metrics: Performance metrics for the role

        Returns:
            Health check results
        """
        health_score = 100.0
        issues = []
        recommendations = []

        # Check response time
        avg_response_time = metrics.get("average_response_time_ms", 0)
        if avg_response_time > 10000:  # 10 seconds
            health_score -= 30
            issues.append(f"Slow response time ({avg_response_time:.0f}ms)")
            recommendations.append("Consider scaling up or optimizing agent implementation")
        elif avg_response_time > 5000:  # 5 seconds
            health_score -= 15
            issues.append(f"Elevated response time ({avg_response_time:.0f}ms)")

        # Check success rate
        success_rate = metrics.get("average_success_rate", 100)
        if success_rate < 80:
            health_score -= 40
            issues.append(f"Low success rate ({success_rate:.1f}%)")
            recommendations.append("Review and improve error handling")
        elif success_rate < 95:
            health_score -= 20
            issues.append(f"Degraded success rate ({success_rate:.1f}%)")

        # Check load
        active_tasks = metrics.get("total_active_tasks", 0)
        instance_count = metrics.get("instance_count", 1)
        avg_load = active_tasks / instance_count if instance_count > 0 else 0

        if avg_load > 4:  # High load
            health_score -= 25
            issues.append(f"High load per instance ({avg_load:.1f})")
            recommendations.append("Consider adding more instances")

        # Determine health status
        if health_score >= 80:
            status = WorkflowHealthStatus.HEALTHY
        elif health_score >= 60:
            status = WorkflowHealthStatus.DEGRADED
        else:
            status = WorkflowHealthStatus.UNHEALTHY

        return {
            "agent_role": agent_role.value,
            "health_status": status,
            "health_score": max(0, health_score),
            "issues": issues,
            "recommendations": recommendations,
        }


class WorkflowOptimizationSuggester:
    """Provides optimization suggestions for workflows."""

    @staticmethod
    def suggest_parallelization(
        workflow_steps: list[dict[str, Any]],
        execution_history: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Suggest parallelization opportunities.

        Args:
            workflow_steps: List of workflow steps
            execution_history: Historical execution data

        Returns:
            List of parallelization suggestions
        """
        suggestions = []

        # Find independent steps that could be parallelized
        independent_steps = []
        for step in workflow_steps:
            dependencies = step.get("dependencies", [])
            if not dependencies and not step.get("parallel_group"):
                independent_steps.append(step)

        if len(independent_steps) >= 2:
            # Calculate potential time savings
            step_durations = {}
            for execution in execution_history:
                step_results = execution.get("step_results", {})
                for step_id, result in step_results.items():
                    duration = result.get("duration_seconds", 0)
                    if duration > 0:
                        if step_id not in step_durations:
                            step_durations[step_id] = []
                        step_durations[step_id].append(duration)

            parallelizable_steps = []
            total_potential_savings = 0

            for step in independent_steps:
                step_id = step.get("step_id")
                if step_id in step_durations:
                    avg_duration = sum(step_durations[step_id]) / len(step_durations[step_id])
                    if avg_duration > 10:  # Only consider steps > 10 seconds
                        parallelizable_steps.append({
                            "step_id": step_id,
                            "average_duration": avg_duration,
                        })
                        total_potential_savings += avg_duration

            if len(parallelizable_steps) >= 2:
                # Calculate savings (all but the longest step)
                durations = [step["average_duration"] for step in parallelizable_steps]
                actual_savings = sum(durations) - max(durations)

                suggestions.append({
                    "type": "parallelization",
                    "description": f"Parallelize {len(parallelizable_steps)} independent steps",
                    "affected_steps": [step["step_id"] for step in parallelizable_steps],
                    "estimated_time_savings_seconds": actual_savings,
                    "implementation_effort": "medium",
                    "risk_level": "low",
                })

        return suggestions

    @staticmethod
    def suggest_timeout_adjustments(
        workflow_steps: list[dict[str, Any]],
        execution_history: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Suggest timeout adjustments based on historical data.

        Args:
            workflow_steps: List of workflow steps
            execution_history: Historical execution data

        Returns:
            List of timeout adjustment suggestions
        """
        suggestions = []

        # Collect step duration data
        step_durations = {}
        for execution in execution_history:
            step_results = execution.get("step_results", {})
            for step_id, result in step_results.items():
                duration = result.get("duration_seconds", 0)
                if duration > 0:
                    if step_id not in step_durations:
                        step_durations[step_id] = []
                    step_durations[step_id].append(duration)

        for step in workflow_steps:
            step_id = step.get("step_id")
            current_timeout = step.get("timeout_minutes", 60) * 60  # Convert to seconds

            if step_id in step_durations:
                durations = step_durations[step_id]
                max_duration = max(durations)
                avg_duration = sum(durations) / len(durations)

                # Suggest timeout reduction if current timeout is much higher than max observed
                if current_timeout > max_duration * 1.5:
                    suggested_timeout = int((max_duration * 1.2) / 60)  # 20% buffer, convert to minutes
                    suggestions.append({
                        "type": "timeout_reduction",
                        "step_id": step_id,
                        "current_timeout_minutes": current_timeout / 60,
                        "suggested_timeout_minutes": suggested_timeout,
                        "reason": f"Current timeout ({current_timeout/60:.0f}min) is much higher than historical maximum ({max_duration/60:.1f}min)",
                        "risk_level": "low",
                    })

                # Suggest timeout increase if steps are timing out frequently
                elif max_duration > current_timeout * 0.9:
                    suggested_timeout = int((max_duration * 1.3) / 60)  # 30% buffer
                    suggestions.append({
                        "type": "timeout_increase",
                        "step_id": step_id,
                        "current_timeout_minutes": current_timeout / 60,
                        "suggested_timeout_minutes": suggested_timeout,
                        "reason": f"Steps approaching timeout limit (max: {max_duration/60:.1f}min, timeout: {current_timeout/60:.0f}min)",
                        "risk_level": "medium",
                    })

        return suggestions


class WorkflowMetricsAggregator:
    """Aggregates and processes workflow metrics."""

    @staticmethod
    def aggregate_agent_performance(
        step_metrics: list[dict[str, Any]]
    ) -> dict[AgentRole, dict[str, Any]]:
        """
        Aggregate performance metrics by agent role.

        Args:
            step_metrics: List of step execution metrics

        Returns:
            Aggregated metrics by agent role
        """
        agent_metrics = {}

        for metric in step_metrics:
            agent_role = metric.get("agent_role")
            if not agent_role:
                continue

            if agent_role not in agent_metrics:
                agent_metrics[agent_role] = {
                    "total_executions": 0,
                    "total_duration": 0.0,
                    "total_errors": 0,
                    "response_times": [],
                    "success_count": 0,
                }

            agg = agent_metrics[agent_role]
            agg["total_executions"] += 1

            duration = metric.get("duration_seconds", 0)
            if duration > 0:
                agg["total_duration"] += duration
                agg["response_times"].append(duration)

            error_count = metric.get("error_count", 0)
            agg["total_errors"] += error_count

            if error_count == 0:
                agg["success_count"] += 1

        # Calculate derived metrics
        for agent_role, agg in agent_metrics.items():
            if agg["total_executions"] > 0:
                agg["average_duration"] = agg["total_duration"] / agg["total_executions"]
                agg["success_rate"] = (agg["success_count"] / agg["total_executions"]) * 100
                agg["error_rate"] = (agg["total_errors"] / agg["total_executions"]) * 100

                if agg["response_times"]:
                    agg["median_response_time"] = sorted(agg["response_times"])[
                        len(agg["response_times"]) // 2
                    ]
                    agg["p95_response_time"] = sorted(agg["response_times"])[
                        int(len(agg["response_times"]) * 0.95)
                    ]

        return agent_metrics

    @staticmethod
    def calculate_efficiency_score(
        workflow_id: str,
        results: list[WorkflowResult],
    ) -> float:
        """
        Calculate efficiency score for a workflow.

        Args:
            workflow_id: Workflow identifier
            results: List of workflow results

        Returns:
            Efficiency score (0-100)
        """
        workflow_results = [r for r in results if r.workflow_id == workflow_id]

        if not workflow_results:
            return 0.0

        # Factors: success rate, duration consistency, resource efficiency
        successful_results = [r for r in workflow_results if r.status == WorkflowStatus.COMPLETED]
        success_rate = len(successful_results) / len(workflow_results)

        # Duration consistency (lower variance = higher score)
        durations = [r.duration_seconds for r in successful_results if r.duration_seconds]
        if durations:
            avg_duration = sum(durations) / len(durations)
            variance = sum((d - avg_duration) ** 2 for d in durations) / len(durations)
            consistency_score = max(0, 1 - (variance / (avg_duration ** 2))) if avg_duration > 0 else 0
        else:
            consistency_score = 0

        # Resource efficiency (placeholder - would need actual resource metrics)
        resource_efficiency = 0.8  # Assume 80% efficiency as default

        # Weighted combination
        efficiency_score = (
            success_rate * 0.5 +
            consistency_score * 0.3 +
            resource_efficiency * 0.2
        ) * 100

        return min(100.0, max(0.0, efficiency_score))


def format_duration(seconds: float) -> str:
    """
    Format duration in seconds to human-readable string.

    Args:
        seconds: Duration in seconds

    Returns:
        Formatted duration string
    """
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = seconds / 60
        return f"{minutes:.1f}m"
    else:
        hours = seconds / 3600
        return f"{hours:.1f}h"


def validate_workflow_definition(workflow_data: dict[str, Any]) -> tuple[bool, list[str]]:
    """
    Validate a workflow definition for common issues.

    Args:
        workflow_data: Workflow definition data

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check required fields
    required_fields = ["workflow_id", "name", "steps"]
    for field in required_fields:
        if field not in workflow_data:
            errors.append(f"Missing required field: {field}")

    # Validate steps
    steps = workflow_data.get("steps", [])
    if not steps:
        errors.append("Workflow must have at least one step")

    step_ids = set()
    for i, step in enumerate(steps):
        step_id = step.get("step_id")
        if not step_id:
            errors.append(f"Step {i} missing step_id")
        elif step_id in step_ids:
            errors.append(f"Duplicate step_id: {step_id}")
        else:
            step_ids.add(step_id)

        # Check required step fields
        required_step_fields = ["name", "agent_role", "action_type"]
        for field in required_step_fields:
            if field not in step:
                errors.append(f"Step {step_id} missing required field: {field}")

    # Check for circular dependencies
    if not errors:  # Only check if basic structure is valid
        dependency_graph = {}
        for step in steps:
            step_id = step.get("step_id")
            dependencies = [dep.get("task_id") for dep in step.get("dependencies", [])]
            dependency_graph[step_id] = dependencies

        if _has_circular_dependencies(dependency_graph):
            errors.append("Circular dependencies detected in workflow")

    return len(errors) == 0, errors


def _has_circular_dependencies(graph: dict[str, list[str]]) -> bool:
    """Check for circular dependencies in a dependency graph."""
    visited = set()
    rec_stack = set()

    def _visit(node: str) -> bool:
        if node in rec_stack:
            return True  # Circular dependency found
        if node in visited:
            return False

        visited.add(node)
        rec_stack.add(node)

        for neighbor in graph.get(node, []):
            if neighbor in graph and _visit(neighbor):
                return True

        rec_stack.remove(node)
        return False

    for node in graph:
        if node not in visited:
            if _visit(node):
                return True

    return False
