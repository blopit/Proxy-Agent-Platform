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
    ContextEngineeringProxy,
    EnergyProxy,
    FocusProxy,
    ProgressProxy,
    TaskProxy,
)
from .models import (
    Task,
    TaskCategory,
    TaskPriority,
    TaskStatus,
)

# Services will be added in future epics

__all__ = [
    # Agents (Epic 1 - Core Agents Complete)
    "TaskProxy",
    "FocusProxy",
    "EnergyProxy",
    "ProgressProxy",
    "ContextEngineeringProxy",
    # Models (only existing ones)
    "Task",
    "TaskCategory",
    "TaskPriority",
    "TaskStatus",
]
