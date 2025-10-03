"""
Proxy Agent Platform - Personal productivity platform with AI proxy agents.

A comprehensive platform built with PydanticAI and CopilotKit that deploys specialized
AI proxy agents to handle personal productivity tasks with real-time progress tracking,
mobile integration, and gamification for ADHD/overwhelmed professionals.
"""

__version__ = "0.1.0"
__author__ = "Proxy Agent Platform Team"
__email__ = "support@proxyagent.dev"

from .agents import (
    EmailProxy,
    EnergyProxy,
    FocusProxy,
    ProgressProxy,
    ResearchProxy,
    TaskProxy,
)
from .models import (
    Achievement,
    EnergyLevel,
    FocusSession,
    ProgressMetrics,
    Task,
    User,
)
from .services import (
    AgentRegistry,
    GamificationEngine,
    MobileIntegration,
    TaskQueue,
)

__all__ = [
    # Agents
    "TaskProxy",
    "FocusProxy",
    "EnergyProxy",
    "ProgressProxy",
    "ResearchProxy",
    "EmailProxy",

    # Models
    "Task",
    "FocusSession",
    "EnergyLevel",
    "ProgressMetrics",
    "User",
    "Achievement",

    # Services
    "AgentRegistry",
    "TaskQueue",
    "GamificationEngine",
    "MobileIntegration",
]
