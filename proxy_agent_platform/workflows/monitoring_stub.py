"""
Stub implementation for monitoring when dependencies are not available.
"""

import logging
from typing import Any
from uuid import UUID

logger = logging.getLogger(__name__)


class MetricsCollector:
    """Stub metrics collector that logs operations without actual functionality."""

    def __init__(self):
        """Initialize stub metrics collector."""
        logger.warning("Using stub MetricsCollector - monitoring features disabled")

    async def start_collection(self) -> None:
        """Start metrics collection (stub)."""
        logger.info("Metrics collection started (stub mode)")

    async def stop_collection(self) -> None:
        """Stop metrics collection (stub)."""
        logger.info("Metrics collection stopped (stub mode)")

    async def record_step_start(
        self, step_id: str, workflow_id: UUID, agent_role: Any
    ) -> None:
        """Record step start (stub)."""
        logger.debug(f"Step started: {step_id} in workflow {workflow_id}")

    async def record_step_completion(
        self,
        step_id: str,
        workflow_id: UUID,
        success: bool,
        test_coverage: float | None = None,
        quality_score: float | None = None,
        error_count: int = 0,
    ) -> None:
        """Record step completion (stub)."""
        status = "success" if success else "failed"
        logger.debug(f"Step completed: {step_id} - {status}")

    async def record_workflow_execution(self, result: Any) -> None:
        """Record workflow execution (stub)."""
        logger.debug(f"Workflow execution recorded: {result.workflow_id}")

    async def get_workflow_analytics(
        self, workflow_id: str, hours_back: int = 24
    ) -> dict[str, Any] | None:
        """Get workflow analytics (stub)."""
        return {
            "workflow_id": workflow_id,
            "execution_count": 0,
            "average_duration": 0.0,
            "success_rate": 0.0,
            "error_rate": 0.0,
        }

    async def get_real_time_dashboard_data(self) -> dict[str, Any]:
        """Get dashboard data (stub)."""
        return {
            "active_workflows": 0,
            "total_executions": 0,
            "average_execution_time": 0.0,
            "success_rate": 0.0,
            "agent_utilization": {},
        }
