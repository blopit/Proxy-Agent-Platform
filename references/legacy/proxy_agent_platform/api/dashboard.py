"""
Real-time dashboard API for productivity monitoring.

Provides endpoints for agent status, live metrics, and interactive
task management with real-time updates.
"""

from datetime import datetime, timedelta
from typing import Any
from uuid import uuid4

from pydantic import BaseModel

from ..gamification.gamification_service import GamificationService


class TaskData(BaseModel):
    """Task data model for dashboard API."""

    title: str
    priority: str = "medium"
    difficulty: str = "medium"
    description: str | None = None


class DashboardAPI:
    """
    Real-time dashboard API for monitoring proxy agents and productivity.

    Provides unified interface for dashboard functionality including:
    - Agent status monitoring
    - Live productivity metrics
    - Interactive task management
    - Real-time updates
    """

    def __init__(self):
        """Initialize dashboard API."""
        self.gamification_service = GamificationService()
        self.agent_manager = None  # Will be injected by tests or main app

    async def get_agent_status(self) -> dict[str, Any]:
        """
        Get current status of all proxy agents.

        Returns:
            Agent status response with current states
        """
        if not self.agent_manager:
            # Return mock data for testing
            return {
                "status": "success",
                "agents": {
                    "task_proxy": {"status": "active", "last_activity": datetime.now()},
                    "focus_proxy": {"status": "idle", "last_activity": datetime.now()},
                    "energy_proxy": {"status": "active", "last_activity": datetime.now()},
                    "progress_proxy": {"status": "active", "last_activity": datetime.now()},
                },
            }

        # Real implementation would query actual agents
        agent_status = await self.agent_manager.get_agent_status()
        return {"status": "success", "agents": agent_status}

    async def get_live_metrics(self, user_id: int) -> dict[str, Any]:
        """
        Get live productivity metrics for user.

        Args:
            user_id: User ID to get metrics for

        Returns:
            Live metrics response
        """
        # Mock implementation for TDD
        return {
            "status": "success",
            "metrics": {
                "xp_today": 145,
                "streak_count": 7,
                "tasks_completed": 12,
                "focus_time": 180,  # minutes
            },
        }

    async def get_productivity_heatmap(self, user_id: int, days: int = 7) -> dict[str, Any]:
        """
        Get productivity heatmap data.

        Args:
            user_id: User ID
            days: Number of days to include

        Returns:
            Heatmap data response
        """
        # Mock implementation for TDD
        heatmap_data = []
        for i in range(days):
            day_data = {
                "date": (datetime.now() - timedelta(days=i)).isoformat(),
                "productivity_score": 75 + (i * 5),  # Mock data
                "tasks_completed": 8 + i,
                "focus_time": 120 + (i * 15),
            }
            heatmap_data.append(day_data)

        return {"status": "success", "heatmap_data": heatmap_data}

    async def create_task(self, user_id: int, task_data: dict[str, Any]) -> dict[str, Any]:
        """
        Create new task through dashboard.

        Args:
            user_id: User ID creating the task
            task_data: Task information

        Returns:
            Task creation response
        """
        # Mock implementation for TDD
        task_id = str(uuid4())

        return {"status": "success", "task_id": task_id, "created_at": datetime.now().isoformat()}

    async def complete_task(self, user_id: int, task_id: str) -> dict[str, Any]:
        """
        Complete task and trigger gamification.

        Args:
            user_id: User ID completing the task
            task_id: Task ID to complete

        Returns:
            Task completion response with XP earned
        """
        # Mock implementation for TDD
        # In real implementation, would integrate with gamification service
        xp_earned = 25  # Mock XP calculation

        return {
            "status": "success",
            "xp_earned": xp_earned,
            "completed_at": datetime.now().isoformat(),
        }
