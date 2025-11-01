"""
AI-Powered Workflow Execution System (Pipelex-inspired).

This module provides lightweight workflow execution using TOML-based workflow definitions
and AI-powered step generation. Inspired by Pipelex concepts but built specifically for
the Proxy Agent Platform's dogfooding needs.
"""

from src.workflows.executor import WorkflowExecutor
from src.workflows.models import (
    Workflow,
    WorkflowStep,
    WorkflowExecution,
    WorkflowContext,
)

__all__ = [
    "WorkflowExecutor",
    "Workflow",
    "WorkflowStep",
    "WorkflowExecution",
    "WorkflowContext",
]
