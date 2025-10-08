"""
Proxy Agent Platform - AI Agents Module

This module contains all the proxy agents that handle personal productivity tasks.
Each agent specializes in a specific domain while working together as a cohesive system.
"""

from .base import AgentExecutionContext, AgentResult, BaseProxyAgent
from .context_engineering_proxy import ContextEngineeringProxy
from .energy_proxy import EnergyProxy
from .focus_proxy import FocusProxy
from .progress_proxy import ProgressProxy
from .task_proxy import TaskProxy

__all__ = [
    # Base classes
    "BaseProxyAgent",
    "AgentExecutionContext",
    "AgentResult",
    # Proxy Agents (Epic 1 - Core Agents)
    "TaskProxy",
    "FocusProxy",
    "EnergyProxy",
    "ProgressProxy",
    "ContextEngineeringProxy",
]
