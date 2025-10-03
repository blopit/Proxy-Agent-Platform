"""
Proxy Agent Platform - AI Agents Module

This module contains all the proxy agents that handle personal productivity tasks.
Each agent specializes in a specific domain while working together as a cohesive system.
"""

from .base import BaseProxyAgent, AgentExecutionContext, AgentResult
from .task_proxy import TaskProxy
from .focus_proxy import FocusProxy
from .energy_proxy import EnergyProxy
from .progress_proxy import ProgressProxy
from .research_proxy import ResearchProxy
from .email_proxy import EmailProxy
from .context_engineering_proxy import ContextEngineeringProxy

__all__ = [
    # Base classes
    "BaseProxyAgent",
    "AgentExecutionContext",
    "AgentResult",

    # Proxy Agents
    "TaskProxy",
    "FocusProxy",
    "EnergyProxy",
    "ProgressProxy",
    "ResearchProxy",
    "EmailProxy",
    "ContextEngineeringProxy",
]