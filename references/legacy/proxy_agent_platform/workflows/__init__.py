"""
Enhanced AI Agent Workflow System for Proxy Agent Platform.

This module provides the advanced workflow engine with real-time monitoring,
dynamic adaptation, intelligent orchestration, and template-based reusability
for hierarchical AI agent collaboration.
"""

# Core workflow agents
# Advanced components
from .adaptation import WorkflowAdaptationEngine
from .agents import (
    ArchitectAgent,
    ImplementationAgent,
    IntegrationAgent,
    ProjectManagerAgent,
    QualityAgent,
    WorkflowAgentDependencies,
)

# Enhanced workflow engine
from .engine import EnhancedWorkflowEngine, WorkflowEngine

# Core schema definitions
# Enhanced schema definitions
from .schema import (
    AdaptationTrigger,
    AgentHealthMetrics,
    AgentPoolConfiguration,
    AgentRole,
    LoadBalancingStrategy,
    RetryStrategy,
    StepExecutionMetrics,
    TaskDependency,
    ValidationGate,
    WorkflowAdaptation,
    WorkflowAnalytics,
    WorkflowContext,
    WorkflowDefinition,
    WorkflowHealthStatus,
    WorkflowResult,
    WorkflowStatus,
    WorkflowStep,
    WorkflowTemplate,
    WorkflowType,
    WorkflowVersion,
)

try:
    from .monitoring import MetricsCollector
except ImportError:
    from .monitoring_stub import MetricsCollector
from .orchestration import AgentOrchestrator, LoadBalancer
from .templates import WorkflowTemplateManager

# Utility classes
from .utils import (
    WorkflowEngineConfig,
    WorkflowHealthChecker,
    WorkflowOptimizationSuggester,
    WorkflowPerformanceAnalyzer,
    format_duration,
    validate_workflow_definition,
)

__all__ = [
    # Core workflow components
    "WorkflowDefinition",
    "WorkflowStep",
    "WorkflowType",
    "AgentRole",
    "TaskDependency",
    "ValidationGate",
    "WorkflowContext",
    "WorkflowResult",
    "WorkflowStatus",
    # Engine classes
    "EnhancedWorkflowEngine",
    "WorkflowEngine",  # Legacy alias
    # Agent classes
    "ProjectManagerAgent",
    "ArchitectAgent",
    "ImplementationAgent",
    "QualityAgent",
    "IntegrationAgent",
    "WorkflowAgentDependencies",
    # Enhanced features
    "AdaptationTrigger",
    "AgentHealthMetrics",
    "AgentPoolConfiguration",
    "LoadBalancingStrategy",
    "RetryStrategy",
    "StepExecutionMetrics",
    "WorkflowAdaptation",
    "WorkflowAnalytics",
    "WorkflowHealthStatus",
    "WorkflowTemplate",
    "WorkflowVersion",
    # Advanced components
    "WorkflowAdaptationEngine",
    "MetricsCollector",
    "AgentOrchestrator",
    "LoadBalancer",
    "WorkflowTemplateManager",
    # Utility classes
    "WorkflowEngineConfig",
    "WorkflowHealthChecker",
    "WorkflowOptimizationSuggester",
    "WorkflowPerformanceAnalyzer",
    "format_duration",
    "validate_workflow_definition",
]
