"""
Dynamic Workflow Adaptation System.

This module provides intelligent workflow adaptation capabilities including
context-aware step modifications, intelligent retry mechanisms, and
workflow branching based on execution results.
"""

import logging
import math
import random
from datetime import datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel

from .schema import (
    AdaptationTrigger,
    AgentRole,
    RetryStrategy,
    WorkflowAdaptation,
    WorkflowContext,
    WorkflowDefinition,
    WorkflowStep,
)

logger = logging.getLogger(__name__)


class CircuitBreakerState(BaseModel):
    """State management for circuit breaker pattern."""

    failure_count: int = 0
    last_failure_time: datetime | None = None
    state: str = "closed"  # closed, open, half_open
    timeout_seconds: int = 60


class AdaptationRule(BaseModel):
    """Rule for triggering workflow adaptations."""

    rule_id: str
    trigger: AdaptationTrigger
    conditions: dict[str, Any]
    adaptation_actions: dict[str, Any]
    priority: int = 1
    enabled: bool = True


class WorkflowAdaptationEngine:
    """
    Engine for dynamic workflow adaptation.

    Monitors workflow execution and applies intelligent adaptations
    based on performance, errors, and resource constraints.
    """

    def __init__(self):
        """Initialize the adaptation engine."""
        self.adaptation_rules: list[AdaptationRule] = []
        self.active_adaptations: dict[str, WorkflowAdaptation] = {}
        self.circuit_breakers: dict[str, CircuitBreakerState] = {}
        self.adaptation_history: list[WorkflowAdaptation] = []
        self._setup_default_rules()

    def _setup_default_rules(self) -> None:
        """Setup default adaptation rules."""
        # Performance degradation rule
        self.adaptation_rules.append(AdaptationRule(
            rule_id="performance_degradation",
            trigger=AdaptationTrigger.PERFORMANCE_DEGRADATION,
            conditions={
                "response_time_threshold_ms": 10000,
                "degradation_percentage": 50,
                "consecutive_slow_steps": 3,
            },
            adaptation_actions={
                "increase_timeout": True,
                "reduce_parallel_execution": True,
                "enable_step_retries": True,
            },
            priority=2,
        ))

        # Error threshold rule
        self.adaptation_rules.append(AdaptationRule(
            rule_id="error_threshold",
            trigger=AdaptationTrigger.ERROR_THRESHOLD_EXCEEDED,
            conditions={
                "error_rate_threshold": 0.3,
                "consecutive_failures": 5,
                "time_window_minutes": 10,
            },
            adaptation_actions={
                "activate_circuit_breaker": True,
                "fallback_to_simpler_approach": True,
                "increase_retry_attempts": True,
            },
            priority=1,
        ))

        # Resource constraint rule
        self.adaptation_rules.append(AdaptationRule(
            rule_id="resource_constraint",
            trigger=AdaptationTrigger.RESOURCE_CONSTRAINT,
            conditions={
                "cpu_threshold": 90,
                "memory_threshold": 85,
                "duration_minutes": 5,
            },
            adaptation_actions={
                "reduce_parallelism": True,
                "defer_non_critical_steps": True,
                "optimize_resource_usage": True,
            },
            priority=3,
        ))

        # Agent failure rule
        self.adaptation_rules.append(AdaptationRule(
            rule_id="agent_failure",
            trigger=AdaptationTrigger.AGENT_FAILURE,
            conditions={
                "agent_unavailable_minutes": 2,
                "consecutive_agent_failures": 3,
            },
            adaptation_actions={
                "reassign_to_backup_agent": True,
                "distribute_load": True,
                "skip_non_essential_validations": True,
            },
            priority=1,
        ))

    async def evaluate_adaptation_needs(
        self,
        workflow_context: WorkflowContext,
        current_metrics: dict[str, Any],
        step_results: dict[str, Any],
    ) -> list[WorkflowAdaptation]:
        """
        Evaluate if workflow needs adaptation based on current state.

        Args:
            workflow_context: Current workflow execution context
            current_metrics: Real-time performance metrics
            step_results: Results from executed steps

        Returns:
            List of adaptations to apply
        """
        adaptations = []

        for rule in self.adaptation_rules:
            if not rule.enabled:
                continue

            if await self._evaluate_rule_conditions(rule, workflow_context, current_metrics, step_results):
                adaptation = await self._create_adaptation(rule, workflow_context, current_metrics)
                if adaptation:
                    adaptations.append(adaptation)

        # Sort by priority (lower number = higher priority)
        adaptations.sort(key=lambda x: self._get_rule_priority(x.adaptation_id))

        return adaptations

    async def apply_adaptation(
        self,
        adaptation: WorkflowAdaptation,
        workflow_def: WorkflowDefinition,
        context: WorkflowContext,
    ) -> tuple[WorkflowDefinition, WorkflowContext]:
        """
        Apply a workflow adaptation.

        Args:
            adaptation: Adaptation to apply
            workflow_def: Current workflow definition
            context: Current workflow context

        Returns:
            Modified workflow definition and context
        """
        logger.info("Applying adaptation: %s (%s)", adaptation.adaptation_id, adaptation.trigger)

        # Store adaptation
        self.active_adaptations[adaptation.adaptation_id] = adaptation
        self.adaptation_history.append(adaptation)

        # Apply step modifications
        modified_workflow = await self._apply_step_modifications(
            workflow_def, adaptation.step_modifications
        )

        # Apply agent reassignments
        modified_context = await self._apply_agent_reassignments(
            context, adaptation.agent_reassignments
        )

        # Apply retry configurations
        modified_workflow = await self._apply_retry_configurations(
            modified_workflow, adaptation.retry_configurations
        )

        logger.info("Successfully applied adaptation: %s", adaptation.adaptation_id)
        return modified_workflow, modified_context

    async def create_intelligent_retry_strategy(
        self,
        step_id: str,
        failure_history: list[dict[str, Any]],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Create an intelligent retry strategy based on failure patterns.

        Args:
            step_id: ID of the failing step
            failure_history: History of failures for this step
            context: Current execution context

        Returns:
            Retry strategy configuration
        """
        if not failure_history:
            return self._get_default_retry_config()

        # Analyze failure patterns
        failure_types = [f.get("error_type", "unknown") for f in failure_history]
        failure_intervals = self._calculate_failure_intervals(failure_history)

        # Determine appropriate strategy
        if len(failure_history) >= 5:
            # Too many failures, use circuit breaker
            strategy = RetryStrategy.CIRCUIT_BREAKER
            config = {
                "strategy": strategy.value,
                "failure_threshold": 5,
                "timeout_seconds": 300,
                "half_open_max_calls": 3,
            }
        elif "timeout" in str(failure_types).lower():
            # Timeout errors, use exponential backoff with longer delays
            strategy = RetryStrategy.EXPONENTIAL_BACKOFF
            config = {
                "strategy": strategy.value,
                "base_delay_seconds": 10,
                "max_delay_seconds": 300,
                "multiplier": 2.0,
                "jitter": True,
                "max_attempts": 5,
            }
        elif "resource" in str(failure_types).lower():
            # Resource constraints, use linear backoff
            strategy = RetryStrategy.LINEAR_BACKOFF
            config = {
                "strategy": strategy.value,
                "base_delay_seconds": 30,
                "increment_seconds": 15,
                "max_attempts": 3,
            }
        else:
            # Unknown errors, use conservative exponential backoff
            strategy = RetryStrategy.EXPONENTIAL_BACKOFF
            config = {
                "strategy": strategy.value,
                "base_delay_seconds": 5,
                "max_delay_seconds": 120,
                "multiplier": 1.5,
                "jitter": True,
                "max_attempts": 3,
            }

        logger.info("Created retry strategy for step %s: %s", step_id, strategy.value)
        return config

    async def handle_step_failure(
        self,
        step: WorkflowStep,
        error: Exception,
        attempt_count: int,
        context: WorkflowContext,
    ) -> dict[str, Any]:
        """
        Handle step failure with intelligent retry logic.

        Args:
            step: Failed workflow step
            error: Exception that caused the failure
            attempt_count: Current attempt number
            context: Workflow context

        Returns:
            Retry decision and configuration
        """
        step_key = f"{context.workflow_id}:{step.step_id}"

        # Check circuit breaker state
        if step_key in self.circuit_breakers:
            circuit_state = self.circuit_breakers[step_key]
            if circuit_state.state == "open":
                if self._should_transition_to_half_open(circuit_state):
                    circuit_state.state = "half_open"
                    circuit_state.failure_count = 0
                    logger.info("Circuit breaker half-open for step: %s", step.step_id)
                else:
                    return {
                        "should_retry": False,
                        "reason": "circuit_breaker_open",
                        "wait_seconds": circuit_state.timeout_seconds,
                    }

        # Get retry configuration from step or use intelligent strategy
        retry_config = step.action_details.get("retry_config", {})
        if not retry_config:
            failure_history = self._get_step_failure_history(step.step_id)
            retry_config = await self.create_intelligent_retry_strategy(
                step.step_id, failure_history, context.project_context
            )

        # Determine if should retry
        max_attempts = retry_config.get("max_attempts", 3)
        if attempt_count >= max_attempts:
            return {
                "should_retry": False,
                "reason": "max_attempts_exceeded",
                "final_attempt": attempt_count,
            }

        # Calculate retry delay
        delay_seconds = self._calculate_retry_delay(retry_config, attempt_count, error)

        # Record failure for circuit breaker
        self._record_step_failure(step_key, error)

        return {
            "should_retry": True,
            "delay_seconds": delay_seconds,
            "attempt_count": attempt_count + 1,
            "strategy": retry_config.get("strategy", "exponential_backoff"),
        }

    async def handle_step_success(
        self,
        step: WorkflowStep,
        context: WorkflowContext,
    ) -> None:
        """
        Handle step success for circuit breaker management.

        Args:
            step: Successful workflow step
            context: Workflow context
        """
        step_key = f"{context.workflow_id}:{step.step_id}"

        if step_key in self.circuit_breakers:
            circuit_state = self.circuit_breakers[step_key]

            if circuit_state.state == "half_open":
                # Transition back to closed
                circuit_state.state = "closed"
                circuit_state.failure_count = 0
                logger.info("Circuit breaker closed for step: %s", step.step_id)
            elif circuit_state.state == "closed":
                # Reset failure count on success
                circuit_state.failure_count = max(0, circuit_state.failure_count - 1)

    async def suggest_workflow_optimizations(
        self,
        workflow_def: WorkflowDefinition,
        execution_history: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Suggest workflow optimizations based on execution history.

        Args:
            workflow_def: Workflow definition to optimize
            execution_history: Historical execution data

        Returns:
            List of optimization suggestions
        """
        suggestions = []

        if not execution_history:
            return suggestions

        # Analyze step performance
        step_performance = self._analyze_step_performance(execution_history)

        # Suggest parallelization opportunities
        parallel_suggestions = self._suggest_parallelization(workflow_def, step_performance)
        suggestions.extend(parallel_suggestions)

        # Suggest timeout optimizations
        timeout_suggestions = self._suggest_timeout_optimizations(workflow_def, step_performance)
        suggestions.extend(timeout_suggestions)

        # Suggest agent role optimizations
        agent_suggestions = self._suggest_agent_optimizations(workflow_def, step_performance)
        suggestions.extend(agent_suggestions)

        # Suggest step removal or merging
        step_suggestions = self._suggest_step_optimizations(workflow_def, step_performance)
        suggestions.extend(step_suggestions)

        return suggestions[:10]  # Return top 10 suggestions

    async def _evaluate_rule_conditions(
        self,
        rule: AdaptationRule,
        context: WorkflowContext,
        metrics: dict[str, Any],
        step_results: dict[str, Any],
    ) -> bool:
        """Evaluate if rule conditions are met."""
        conditions = rule.conditions

        if rule.trigger == AdaptationTrigger.PERFORMANCE_DEGRADATION:
            avg_response_time = metrics.get("average_response_time_ms", 0)
            threshold = conditions.get("response_time_threshold_ms", 10000)
            return avg_response_time > threshold

        elif rule.trigger == AdaptationTrigger.ERROR_THRESHOLD_EXCEEDED:
            error_rate = metrics.get("error_rate", 0)
            threshold = conditions.get("error_rate_threshold", 0.3)
            return error_rate > threshold

        elif rule.trigger == AdaptationTrigger.RESOURCE_CONSTRAINT:
            cpu_usage = metrics.get("cpu_usage_percent", 0)
            memory_usage = metrics.get("memory_usage_percent", 0)
            cpu_threshold = conditions.get("cpu_threshold", 90)
            memory_threshold = conditions.get("memory_threshold", 85)
            return cpu_usage > cpu_threshold or memory_usage > memory_threshold

        elif rule.trigger == AdaptationTrigger.AGENT_FAILURE:
            failed_agents = metrics.get("failed_agents", [])
            threshold = conditions.get("consecutive_agent_failures", 3)
            return len(failed_agents) >= threshold

        return False

    async def _create_adaptation(
        self,
        rule: AdaptationRule,
        context: WorkflowContext,
        metrics: dict[str, Any],
    ) -> WorkflowAdaptation | None:
        """Create adaptation based on rule and current state."""
        adaptation_id = f"{rule.rule_id}_{uuid4().hex[:8]}"

        adaptation = WorkflowAdaptation(
            adaptation_id=adaptation_id,
            trigger=rule.trigger,
            trigger_conditions=metrics,
            applied_by="adaptation_engine",
            description=f"Auto-adaptation triggered by {rule.rule_id}",
        )

        actions = rule.adaptation_actions

        # Apply specific adaptations based on trigger
        if rule.trigger == AdaptationTrigger.PERFORMANCE_DEGRADATION:
            if actions.get("increase_timeout"):
                adaptation.step_modifications = self._create_timeout_modifications(context, 1.5)
            if actions.get("reduce_parallel_execution"):
                adaptation.step_modifications.update(self._create_parallelism_modifications(context, 0.5))

        elif rule.trigger == AdaptationTrigger.ERROR_THRESHOLD_EXCEEDED:
            if actions.get("increase_retry_attempts"):
                adaptation.retry_configurations = self._create_retry_modifications(context)
            if actions.get("activate_circuit_breaker"):
                adaptation.retry_configurations.update(self._create_circuit_breaker_config(context))

        elif rule.trigger == AdaptationTrigger.RESOURCE_CONSTRAINT:
            if actions.get("reduce_parallelism"):
                adaptation.step_modifications = self._create_parallelism_modifications(context, 0.3)

        elif rule.trigger == AdaptationTrigger.AGENT_FAILURE:
            if actions.get("reassign_to_backup_agent"):
                adaptation.agent_reassignments = self._create_agent_reassignments(context, metrics)

        return adaptation

    def _get_rule_priority(self, adaptation_id: str) -> int:
        """Get priority for adaptation rule."""
        for rule in self.adaptation_rules:
            if rule.rule_id in adaptation_id:
                return rule.priority
        return 999  # Default low priority

    async def _apply_step_modifications(
        self,
        workflow_def: WorkflowDefinition,
        modifications: dict[str, dict[str, Any]],
    ) -> WorkflowDefinition:
        """Apply step modifications to workflow definition."""
        if not modifications:
            return workflow_def

        # Create a copy of the workflow
        modified_workflow = workflow_def.model_copy(deep=True)

        for step_id, mods in modifications.items():
            # Find and modify the step
            for step in modified_workflow.steps:
                if step.step_id == step_id:
                    for field, value in mods.items():
                        if hasattr(step, field):
                            setattr(step, field, value)
                        else:
                            step.action_details[field] = value

        return modified_workflow

    async def _apply_agent_reassignments(
        self,
        context: WorkflowContext,
        reassignments: dict[str, AgentRole],
    ) -> WorkflowContext:
        """Apply agent reassignments to workflow context."""
        if not reassignments:
            return context

        modified_context = context.model_copy(deep=True)

        for step_id, new_agent_role in reassignments.items():
            # Update active agents mapping
            if step_id in modified_context.active_agents:
                modified_context.active_agents[new_agent_role] = modified_context.active_agents.pop(step_id)

        return modified_context

    async def _apply_retry_configurations(
        self,
        workflow_def: WorkflowDefinition,
        retry_configs: dict[str, dict[str, Any]],
    ) -> WorkflowDefinition:
        """Apply retry configurations to workflow steps."""
        if not retry_configs:
            return workflow_def

        modified_workflow = workflow_def.model_copy(deep=True)

        for step_id, config in retry_configs.items():
            for step in modified_workflow.steps:
                if step.step_id == step_id:
                    step.action_details["retry_config"] = config

        return modified_workflow

    def _calculate_retry_delay(
        self,
        retry_config: dict[str, Any],
        attempt_count: int,
        error: Exception,
    ) -> float:
        """Calculate retry delay based on strategy and attempt count."""
        strategy = retry_config.get("strategy", "exponential_backoff")

        if strategy == "exponential_backoff":
            base_delay = retry_config.get("base_delay_seconds", 1)
            multiplier = retry_config.get("multiplier", 2.0)
            max_delay = retry_config.get("max_delay_seconds", 300)
            jitter = retry_config.get("jitter", False)

            delay = base_delay * (multiplier ** (attempt_count - 1))
            delay = min(delay, max_delay)

            if jitter:
                delay = delay * (0.5 + random.random() * 0.5)

            return delay

        elif strategy == "linear_backoff":
            base_delay = retry_config.get("base_delay_seconds", 5)
            increment = retry_config.get("increment_seconds", 5)
            return base_delay + (increment * (attempt_count - 1))

        elif strategy == "fixed_interval":
            return retry_config.get("interval_seconds", 10)

        else:  # immediate
            return 0

    def _record_step_failure(self, step_key: str, error: Exception) -> None:
        """Record step failure for circuit breaker tracking."""
        if step_key not in self.circuit_breakers:
            self.circuit_breakers[step_key] = CircuitBreakerState()

        circuit_state = self.circuit_breakers[step_key]
        circuit_state.failure_count += 1
        circuit_state.last_failure_time = datetime.now()

        # Check if should open circuit breaker
        if circuit_state.failure_count >= 5 and circuit_state.state == "closed":
            circuit_state.state = "open"
            logger.warning("Circuit breaker opened for step: %s", step_key)

    def _should_transition_to_half_open(self, circuit_state: CircuitBreakerState) -> bool:
        """Check if circuit breaker should transition to half-open state."""
        if circuit_state.state != "open":
            return False

        if not circuit_state.last_failure_time:
            return True

        time_since_failure = (datetime.now() - circuit_state.last_failure_time).total_seconds()
        return time_since_failure >= circuit_state.timeout_seconds

    def _get_step_failure_history(self, step_id: str) -> list[dict[str, Any]]:
        """Get failure history for a specific step."""
        # This would typically be retrieved from a database or cache
        # For now, return empty list as placeholder
        return []

    def _get_default_retry_config(self) -> dict[str, Any]:
        """Get default retry configuration."""
        return {
            "strategy": "exponential_backoff",
            "base_delay_seconds": 2,
            "max_delay_seconds": 60,
            "multiplier": 2.0,
            "jitter": True,
            "max_attempts": 3,
        }

    def _calculate_failure_intervals(self, failure_history: list[dict[str, Any]]) -> list[float]:
        """Calculate intervals between failures."""
        if len(failure_history) < 2:
            return []

        intervals = []
        for i in range(1, len(failure_history)):
            prev_time = failure_history[i - 1].get("timestamp")
            curr_time = failure_history[i].get("timestamp")
            if prev_time and curr_time:
                interval = (curr_time - prev_time).total_seconds()
                intervals.append(interval)

        return intervals

    def _create_timeout_modifications(
        self, context: WorkflowContext, multiplier: float
    ) -> dict[str, dict[str, Any]]:
        """Create timeout modifications for workflow steps."""
        modifications = {}

        # Increase timeout for current and upcoming steps
        for step_id in context.project_context.get("remaining_steps", []):
            modifications[step_id] = {
                "timeout_minutes": int(60 * multiplier),  # Increase timeout
            }

        return modifications

    def _create_parallelism_modifications(
        self, context: WorkflowContext, factor: float
    ) -> dict[str, dict[str, Any]]:
        """Create parallelism modifications for workflow steps."""
        modifications = {}

        # Reduce parallel execution
        for step_id in context.project_context.get("parallel_steps", []):
            modifications[step_id] = {
                "parallel_group": None,  # Remove from parallel group
            }

        return modifications

    def _create_retry_modifications(self, context: WorkflowContext) -> dict[str, dict[str, Any]]:
        """Create retry modifications for workflow steps."""
        retry_configs = {}

        for step_id in context.failed_steps:
            retry_configs[step_id] = {
                "strategy": "exponential_backoff",
                "base_delay_seconds": 5,
                "max_delay_seconds": 120,
                "max_attempts": 5,
                "jitter": True,
            }

        return retry_configs

    def _create_circuit_breaker_config(self, context: WorkflowContext) -> dict[str, dict[str, Any]]:
        """Create circuit breaker configurations."""
        configs = {}

        for step_id in context.failed_steps:
            configs[step_id] = {
                "strategy": "circuit_breaker",
                "failure_threshold": 3,
                "timeout_seconds": 180,
                "half_open_max_calls": 2,
            }

        return configs

    def _create_agent_reassignments(
        self, context: WorkflowContext, metrics: dict[str, Any]
    ) -> dict[str, AgentRole]:
        """Create agent reassignments based on failures."""
        reassignments = {}

        failed_agents = metrics.get("failed_agents", [])
        for agent_info in failed_agents:
            step_id = agent_info.get("step_id")
            current_role = agent_info.get("agent_role")

            # Simple reassignment logic - could be more sophisticated
            if current_role == AgentRole.IMPLEMENTATION:
                reassignments[step_id] = AgentRole.ARCHITECT
            elif current_role == AgentRole.QUALITY:
                reassignments[step_id] = AgentRole.IMPLEMENTATION

        return reassignments

    def _analyze_step_performance(self, execution_history: list[dict[str, Any]]) -> dict[str, Any]:
        """Analyze step performance from execution history."""
        step_stats = {}

        for execution in execution_history:
            step_results = execution.get("step_results", {})
            for step_id, result in step_results.items():
                if step_id not in step_stats:
                    step_stats[step_id] = {
                        "total_executions": 0,
                        "total_duration": 0,
                        "failure_count": 0,
                        "durations": [],
                    }

                stats = step_stats[step_id]
                stats["total_executions"] += 1

                duration = result.get("duration_seconds", 0)
                stats["total_duration"] += duration
                stats["durations"].append(duration)

                if result.get("status") != "completed":
                    stats["failure_count"] += 1

        # Calculate derived metrics
        for step_id, stats in step_stats.items():
            if stats["total_executions"] > 0:
                stats["average_duration"] = stats["total_duration"] / stats["total_executions"]
                stats["failure_rate"] = stats["failure_count"] / stats["total_executions"]
                stats["max_duration"] = max(stats["durations"]) if stats["durations"] else 0

        return step_stats

    def _suggest_parallelization(
        self, workflow_def: WorkflowDefinition, step_performance: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Suggest parallelization opportunities."""
        suggestions = []

        # Find steps that could be parallelized
        independent_steps = []
        for step in workflow_def.steps:
            if not step.dependencies and not step.parallel_group:
                independent_steps.append(step)

        if len(independent_steps) >= 2:
            avg_durations = []
            for step in independent_steps:
                perf = step_performance.get(step.step_id, {})
                avg_duration = perf.get("average_duration", 0)
                if avg_duration > 30:  # Only consider steps taking more than 30 seconds
                    avg_durations.append((step.step_id, avg_duration))

            if len(avg_durations) >= 2:
                suggestions.append({
                    "type": "parallelization",
                    "description": f"Consider parallelizing {len(avg_durations)} independent steps",
                    "affected_steps": [step_id for step_id, _ in avg_durations],
                    "estimated_savings_seconds": sum(duration for _, duration in avg_durations[1:]),
                })

        return suggestions

    def _suggest_timeout_optimizations(
        self, workflow_def: WorkflowDefinition, step_performance: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Suggest timeout optimizations."""
        suggestions = []

        for step in workflow_def.steps:
            perf = step_performance.get(step.step_id, {})
            avg_duration = perf.get("average_duration", 0)
            max_duration = perf.get("max_duration", 0)

            current_timeout = step.timeout_minutes * 60

            if avg_duration > 0 and current_timeout > max_duration * 1.5:
                new_timeout = math.ceil(max_duration * 1.2 / 60)  # 20% buffer
                suggestions.append({
                    "type": "timeout_optimization",
                    "description": f"Reduce timeout for step {step.step_id}",
                    "step_id": step.step_id,
                    "current_timeout_minutes": step.timeout_minutes,
                    "suggested_timeout_minutes": new_timeout,
                    "reason": "Current timeout is much higher than historical maximum duration",
                })

        return suggestions

    def _suggest_agent_optimizations(
        self, workflow_def: WorkflowDefinition, step_performance: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Suggest agent role optimizations."""
        suggestions = []

        # Analyze which agent roles perform best for each step type
        agent_performance = {}
        for step in workflow_def.steps:
            perf = step_performance.get(step.step_id, {})
            failure_rate = perf.get("failure_rate", 0)

            if failure_rate > 0.2:  # High failure rate
                suggestions.append({
                    "type": "agent_optimization",
                    "description": f"High failure rate for {step.agent_role.value} agent on {step.step_id}",
                    "step_id": step.step_id,
                    "current_agent": step.agent_role.value,
                    "failure_rate": failure_rate,
                    "recommendation": "Consider reassigning to a different agent role or improving validation",
                })

        return suggestions

    def _suggest_step_optimizations(
        self, workflow_def: WorkflowDefinition, step_performance: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Suggest step-level optimizations."""
        suggestions = []

        # Find steps with very low duration that could be merged
        quick_steps = []
        for step in workflow_def.steps:
            perf = step_performance.get(step.step_id, {})
            avg_duration = perf.get("average_duration", 0)

            if 0 < avg_duration < 10:  # Very quick steps
                quick_steps.append((step.step_id, avg_duration))

        if len(quick_steps) >= 3:
            suggestions.append({
                "type": "step_merging",
                "description": f"Consider merging {len(quick_steps)} quick steps",
                "affected_steps": [step_id for step_id, _ in quick_steps],
                "total_overhead_seconds": len(quick_steps) * 2,  # Estimated overhead per step
                "recommendation": "Merge quick sequential steps to reduce orchestration overhead",
            })

        return suggestions
