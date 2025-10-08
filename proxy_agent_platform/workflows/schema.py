"""
Workflow Schema Definitions for AI Agent Collaboration System.

Defines Pydantic models for workflow specifications, enabling type-safe
workflow execution and validation.
"""

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class AgentRole(str, Enum):
    """Specialized agent roles for workflow execution."""

    PROJECT_MANAGER = "project_manager"
    ARCHITECT = "architect"
    IMPLEMENTATION = "implementation"
    QUALITY = "quality"
    INTEGRATION = "integration"


class WorkflowType(str, Enum):
    """Types of workflows in the hierarchical system."""

    META = "meta"  # Project-level orchestration
    EPIC = "epic"  # Epic-level coordination
    PHASE = "phase"  # Phase-level implementation
    TASK = "task"  # Individual task execution
    CRITICAL = "critical"  # Critical issue resolution
    VALIDATION = "validation"  # Quality assurance


class WorkflowStatus(str, Enum):
    """Workflow execution status."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"
    SKIPPED = "skipped"


class TaskDependency(BaseModel):
    """Defines a dependency relationship between tasks or workflows."""

    task_id: str = Field(..., description="ID of the dependent task")
    workflow_path: str | None = Field(None, description="Path to workflow file if external")
    dependency_type: str = Field(
        "requires", description="Type of dependency (requires, suggests, blocks)"
    )
    conditions: dict[str, Any] = Field(
        default_factory=dict, description="Conditions for dependency satisfaction"
    )


class ValidationGate(BaseModel):
    """Quality gate that must pass for workflow to continue."""

    name: str = Field(..., description="Name of the validation gate")
    description: str = Field(..., description="Description of what this gate validates")
    agent_role: AgentRole = Field(..., description="Agent responsible for validation")
    validation_command: str = Field(..., description="Command or method to run validation")
    success_criteria: dict[str, Any] = Field(
        ..., description="Criteria that define successful validation"
    )
    failure_action: str = Field(
        "block", description="Action to take on failure (block, warn, retry)"
    )
    retry_count: int = Field(default=3, description="Number of retry attempts")


class WorkflowStep(BaseModel):
    """Individual step within a workflow."""

    step_id: str = Field(..., description="Unique identifier for this step")
    name: str = Field(..., description="Human-readable name of the step")
    description: str = Field(..., description="Detailed description of the step")
    agent_role: AgentRole = Field(..., description="Agent responsible for executing this step")

    # Execution details
    action_type: str = Field(
        ..., description="Type of action (implement, test, review, integrate, etc.)"
    )
    action_details: dict[str, Any] = Field(
        ..., description="Specific action parameters and configuration"
    )

    # Dependencies and flow control
    dependencies: list[TaskDependency] = Field(
        default_factory=list, description="Prerequisites for this step"
    )
    parallel_group: str | None = Field(None, description="Group ID for parallel execution")
    timeout_minutes: int = Field(default=60, description="Maximum execution time")

    # Quality and validation
    validation_gates: list[ValidationGate] = Field(
        default_factory=list, description="Quality gates for this step"
    )
    tdd_required: bool = Field(default=True, description="Whether TDD methodology is required")

    # Context and outputs
    input_context: dict[str, Any] = Field(
        default_factory=dict, description="Input context and parameters"
    )
    expected_outputs: list[str] = Field(
        default_factory=list, description="Expected outputs from this step"
    )
    success_criteria: dict[str, Any] = Field(..., description="Criteria for successful completion")


class WorkflowContext(BaseModel):
    """Context information for workflow execution."""

    workflow_id: UUID = Field(default_factory=uuid4, description="Unique workflow execution ID")
    user_id: UUID | None = Field(None, description="User initiating the workflow")
    project_context: dict[str, Any] = Field(
        default_factory=dict, description="Current project state"
    )

    # Execution context
    current_step: str | None = Field(None, description="Currently executing step ID")
    completed_steps: list[str] = Field(
        default_factory=list, description="List of completed step IDs"
    )
    failed_steps: list[str] = Field(default_factory=list, description="List of failed step IDs")

    # Agent context
    active_agents: dict[AgentRole, str] = Field(
        default_factory=dict, description="Currently active agents by role"
    )
    agent_context: dict[str, Any] = Field(
        default_factory=dict, description="Shared context between agents"
    )

    # Progress tracking
    start_time: datetime = Field(default_factory=datetime.now, description="Workflow start time")
    last_update: datetime = Field(default_factory=datetime.now, description="Last progress update")
    estimated_completion: datetime | None = Field(None, description="Estimated completion time")


class WorkflowDefinition(BaseModel):
    """Complete workflow definition for hierarchical AI agent collaboration."""

    # Metadata
    workflow_id: str = Field(..., description="Unique workflow identifier")
    name: str = Field(..., description="Human-readable workflow name")
    description: str = Field(..., description="Detailed workflow description")
    version: str = Field(default="1.0.0", description="Workflow version")

    # Classification
    workflow_type: WorkflowType = Field(..., description="Type of workflow")
    epic_id: str | None = Field(None, description="Associated epic ID if applicable")
    phase_id: str | None = Field(None, description="Associated phase ID if applicable")

    # Execution configuration
    strategy: str = Field(
        "sequential", description="Execution strategy (sequential, parallel, conditional)"
    )
    max_parallel_steps: int = Field(default=3, description="Maximum parallel steps")
    timeout_hours: int = Field(default=24, description="Maximum workflow execution time")

    # Dependencies and triggers
    dependencies: list[TaskDependency] = Field(
        default_factory=list, description="Workflow-level dependencies"
    )
    triggers: list[str] = Field(
        default_factory=list, description="Events that can trigger this workflow"
    )

    # Agent configuration
    required_agents: list[AgentRole] = Field(..., description="Required agent roles for execution")
    agent_config: dict[AgentRole, dict[str, Any]] = Field(
        default_factory=dict, description="Agent-specific configuration"
    )

    # Workflow steps
    steps: list[WorkflowStep] = Field(..., description="Ordered list of workflow steps")

    # Quality assurance
    global_validation_gates: list[ValidationGate] = Field(
        default_factory=list, description="Workflow-level validation gates"
    )
    success_criteria: dict[str, Any] = Field(..., description="Overall workflow success criteria")

    # Human interaction
    human_checkpoints: list[str] = Field(
        default_factory=list, description="Step IDs requiring human validation"
    )
    approval_required: bool = Field(
        default=False, description="Whether human approval is required to start"
    )

    # Metadata and tracking
    created_by: str = Field(..., description="Creator of this workflow")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    tags: list[str] = Field(default_factory=list, description="Tags for workflow categorization")


class WorkflowResult(BaseModel):
    """Result of workflow execution."""

    workflow_id: str = Field(..., description="Workflow that was executed")
    execution_id: UUID = Field(..., description="Unique execution instance ID")
    status: WorkflowStatus = Field(..., description="Final execution status")

    # Execution details
    start_time: datetime = Field(..., description="Execution start time")
    end_time: datetime | None = Field(None, description="Execution end time")
    duration_seconds: float | None = Field(None, description="Total execution duration")

    # Results and outputs
    outputs: dict[str, Any] = Field(
        default_factory=dict, description="Workflow outputs and artifacts"
    )
    step_results: dict[str, Any] = Field(
        default_factory=dict, description="Individual step results"
    )

    # Quality metrics
    validation_results: dict[str, bool] = Field(
        default_factory=dict, description="Validation gate results"
    )
    test_coverage: float | None = Field(None, description="Test coverage percentage")
    code_quality_score: float | None = Field(None, description="Code quality score")

    # Progress and completion
    completed_steps: list[str] = Field(
        default_factory=list, description="Successfully completed steps"
    )
    failed_steps: list[str] = Field(default_factory=list, description="Failed step details")
    skipped_steps: list[str] = Field(default_factory=list, description="Skipped steps")

    # Agent performance
    agent_performance: dict[AgentRole, dict[str, Any]] = Field(
        default_factory=dict, description="Agent execution metrics"
    )

    # Error handling
    error_message: str | None = Field(None, description="Error message if execution failed")
    recovery_suggestions: list[str] = Field(
        default_factory=list, description="Suggestions for error recovery"
    )

    # Context preservation
    final_context: dict[str, Any] = Field(
        default_factory=dict, description="Final workflow context"
    )
    next_recommended_workflows: list[str] = Field(
        default_factory=list, description="Recommended next workflows"
    )


class WorkflowMetrics(BaseModel):
    """Metrics for workflow execution monitoring and optimization."""

    workflow_id: str = Field(..., description="Workflow identifier")
    execution_count: int = Field(default=0, description="Number of times executed")
    success_rate: float = Field(default=0.0, description="Success rate percentage")
    average_duration_minutes: float = Field(default=0.0, description="Average execution duration")
    agent_efficiency: dict[AgentRole, float] = Field(
        default_factory=dict, description="Agent efficiency scores"
    )
    bottleneck_steps: list[str] = Field(
        default_factory=list, description="Steps that commonly cause delays"
    )
    improvement_suggestions: list[str] = Field(
        default_factory=list, description="Optimization suggestions"
    )


class StepExecutionMetrics(BaseModel):
    """Real-time metrics for individual step execution."""

    step_id: str = Field(..., description="Step identifier")
    execution_id: UUID = Field(..., description="Execution instance")
    agent_role: AgentRole = Field(..., description="Executing agent role")

    # Timing metrics
    start_time: datetime = Field(..., description="Step start time")
    end_time: datetime | None = Field(None, description="Step end time")
    duration_seconds: float | None = Field(None, description="Execution duration")

    # Resource metrics
    cpu_usage_percent: float = Field(default=0.0, description="CPU usage during execution")
    memory_usage_mb: float = Field(default=0.0, description="Memory usage in MB")
    io_operations: int = Field(default=0, description="Number of I/O operations")

    # Performance metrics
    throughput_ops_per_sec: float = Field(default=0.0, description="Operations per second")
    error_count: int = Field(default=0, description="Number of errors encountered")
    retry_count: int = Field(default=0, description="Number of retries attempted")

    # Quality metrics
    test_coverage_percent: float | None = Field(None, description="Test coverage achieved")
    code_quality_score: float | None = Field(None, description="Code quality score")
    validation_gate_results: dict[str, bool] = Field(
        default_factory=dict, description="Validation gate pass/fail status"
    )


class WorkflowHealthStatus(str, Enum):
    """Health status for workflow components."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class AgentHealthMetrics(BaseModel):
    """Health and performance metrics for individual agents."""

    agent_role: AgentRole = Field(..., description="Agent role")
    agent_id: str = Field(..., description="Agent instance identifier")
    health_status: WorkflowHealthStatus = Field(..., description="Current health status")

    # Performance metrics
    response_time_ms: float = Field(default=0.0, description="Average response time")
    success_rate: float = Field(default=100.0, description="Success rate percentage")
    active_tasks: int = Field(default=0, description="Currently active tasks")
    queue_depth: int = Field(default=0, description="Pending tasks in queue")

    # Resource utilization
    cpu_usage: float = Field(default=0.0, description="CPU usage percentage")
    memory_usage: float = Field(default=0.0, description="Memory usage percentage")

    # Availability
    last_heartbeat: datetime = Field(default_factory=datetime.now, description="Last heartbeat")
    uptime_seconds: float = Field(default=0.0, description="Agent uptime")

    # Error tracking
    error_rate: float = Field(default=0.0, description="Error rate percentage")
    last_error: str | None = Field(None, description="Last error message")
    consecutive_failures: int = Field(default=0, description="Consecutive failure count")


class RetryStrategy(str, Enum):
    """Retry strategies for failed operations."""

    EXPONENTIAL_BACKOFF = "exponential_backoff"
    LINEAR_BACKOFF = "linear_backoff"
    FIXED_INTERVAL = "fixed_interval"
    IMMEDIATE = "immediate"
    CIRCUIT_BREAKER = "circuit_breaker"


class AdaptationTrigger(str, Enum):
    """Triggers for dynamic workflow adaptation."""

    PERFORMANCE_DEGRADATION = "performance_degradation"
    ERROR_THRESHOLD_EXCEEDED = "error_threshold_exceeded"
    RESOURCE_CONSTRAINT = "resource_constraint"
    AGENT_FAILURE = "agent_failure"
    DEPENDENCY_FAILURE = "dependency_failure"
    MANUAL_INTERVENTION = "manual_intervention"


class WorkflowAdaptation(BaseModel):
    """Dynamic adaptation configuration for workflows."""

    adaptation_id: str = Field(..., description="Unique adaptation identifier")
    trigger: AdaptationTrigger = Field(..., description="What triggered this adaptation")
    timestamp: datetime = Field(default_factory=datetime.now, description="When adaptation was applied")

    # Adaptation actions
    step_modifications: dict[str, dict[str, Any]] = Field(
        default_factory=dict, description="Modifications to specific steps"
    )
    agent_reassignments: dict[str, AgentRole] = Field(
        default_factory=dict, description="Agent role reassignments"
    )
    retry_configurations: dict[str, dict[str, Any]] = Field(
        default_factory=dict, description="Retry strategy modifications"
    )

    # Conditions
    trigger_conditions: dict[str, Any] = Field(
        default_factory=dict, description="Conditions that triggered adaptation"
    )
    rollback_conditions: dict[str, Any] = Field(
        default_factory=dict, description="Conditions for rolling back adaptation"
    )

    # Metadata
    applied_by: str = Field(..., description="Who/what applied this adaptation")
    description: str = Field(..., description="Description of the adaptation")
    effectiveness_score: float | None = Field(None, description="Effectiveness rating")


class WorkflowTemplate(BaseModel):
    """Template for reusable workflow patterns."""

    template_id: str = Field(..., description="Unique template identifier")
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    version: str = Field(default="1.0.0", description="Template version")

    # Template inheritance
    parent_template_id: str | None = Field(None, description="Parent template if inheriting")
    template_category: str = Field(..., description="Category of template")

    # Template structure
    step_templates: list[dict[str, Any]] = Field(
        default_factory=list, description="Parameterized step templates"
    )
    agent_configuration_template: dict[AgentRole, dict[str, Any]] = Field(
        default_factory=dict, description="Agent configuration template"
    )
    validation_gate_templates: list[dict[str, Any]] = Field(
        default_factory=list, description="Validation gate templates"
    )

    # Parameterization
    required_parameters: list[str] = Field(
        default_factory=list, description="Required parameters for instantiation"
    )
    optional_parameters: dict[str, Any] = Field(
        default_factory=dict, description="Optional parameters with defaults"
    )
    parameter_validation: dict[str, Any] = Field(
        default_factory=dict, description="Parameter validation rules"
    )

    # Usage tracking
    usage_count: int = Field(default=0, description="Number of times used")
    success_rate: float = Field(default=0.0, description="Template success rate")
    last_used: datetime | None = Field(None, description="Last usage timestamp")

    # Metadata
    created_by: str = Field(..., description="Template creator")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    tags: list[str] = Field(default_factory=list, description="Template tags")


class WorkflowVersion(BaseModel):
    """Version control for workflow definitions."""

    version_id: str = Field(..., description="Unique version identifier")
    workflow_id: str = Field(..., description="Associated workflow identifier")
    version_number: str = Field(..., description="Semantic version number")

    # Version details
    changes: list[str] = Field(default_factory=list, description="List of changes")
    change_type: str = Field(..., description="Type of change (major, minor, patch)")
    backward_compatible: bool = Field(default=True, description="Backward compatibility flag")

    # Workflow snapshot
    workflow_snapshot: WorkflowDefinition = Field(..., description="Workflow definition snapshot")

    # Migration
    migration_script: str | None = Field(None, description="Migration script for version upgrade")
    rollback_script: str | None = Field(None, description="Rollback script for version downgrade")

    # Metadata
    created_by: str = Field(..., description="Version creator")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    release_notes: str = Field(..., description="Release notes for this version")


class LoadBalancingStrategy(str, Enum):
    """Load balancing strategies for agent pools."""

    ROUND_ROBIN = "round_robin"
    LEAST_LOADED = "least_loaded"
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin"
    RESPONSE_TIME_BASED = "response_time_based"
    RESOURCE_BASED = "resource_based"
    RANDOM = "random"


class AgentPoolConfiguration(BaseModel):
    """Configuration for agent pool management."""

    agent_role: AgentRole = Field(..., description="Agent role")
    min_instances: int = Field(default=1, description="Minimum agent instances")
    max_instances: int = Field(default=5, description="Maximum agent instances")
    target_utilization: float = Field(default=0.8, description="Target utilization percentage")

    # Load balancing
    load_balancing_strategy: LoadBalancingStrategy = Field(
        default=LoadBalancingStrategy.LEAST_LOADED, description="Load balancing strategy"
    )
    weights: dict[str, float] = Field(
        default_factory=dict, description="Instance weights for weighted strategies"
    )

    # Health monitoring
    health_check_interval_seconds: int = Field(default=30, description="Health check interval")
    failure_threshold: int = Field(default=3, description="Consecutive failures before unhealthy")
    recovery_threshold: int = Field(default=2, description="Consecutive successes for recovery")

    # Auto-scaling
    scale_up_threshold: float = Field(default=0.9, description="Scale up utilization threshold")
    scale_down_threshold: float = Field(default=0.3, description="Scale down utilization threshold")
    cooldown_seconds: int = Field(default=300, description="Cooldown between scaling operations")


class WorkflowAnalytics(BaseModel):
    """Comprehensive analytics for workflow performance."""

    workflow_id: str = Field(..., description="Workflow identifier")
    analysis_period_start: datetime = Field(..., description="Analysis period start")
    analysis_period_end: datetime = Field(..., description="Analysis period end")

    # Execution statistics
    total_executions: int = Field(default=0, description="Total executions in period")
    successful_executions: int = Field(default=0, description="Successful executions")
    failed_executions: int = Field(default=0, description="Failed executions")
    average_duration_seconds: float = Field(default=0.0, description="Average execution duration")

    # Performance trends
    performance_trend: str = Field(default="stable", description="Performance trend direction")
    bottleneck_analysis: dict[str, Any] = Field(
        default_factory=dict, description="Bottleneck identification and analysis"
    )
    efficiency_score: float = Field(default=0.0, description="Overall efficiency score")

    # Agent performance
    agent_performance_breakdown: dict[AgentRole, dict[str, Any]] = Field(
        default_factory=dict, description="Performance breakdown by agent role"
    )

    # Resource utilization
    resource_utilization: dict[str, float] = Field(
        default_factory=dict, description="Resource utilization metrics"
    )

    # Recommendations
    optimization_recommendations: list[str] = Field(
        default_factory=list, description="Optimization recommendations"
    )
    predicted_improvements: dict[str, float] = Field(
        default_factory=dict, description="Predicted improvements from recommendations"
    )
