"""
Inter-Agent Communication Protocol for Workflow System.

This module defines the communication protocol and context sharing mechanisms
that enable AI agents to collaborate effectively on complex workflows.
"""

import logging
from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class MessageType(str, Enum):
    """Types of inter-agent messages."""

    TASK_ASSIGNMENT = "task_assignment"
    TASK_COMPLETION = "task_completion"
    CONTEXT_UPDATE = "context_update"
    VALIDATION_REQUEST = "validation_request"
    VALIDATION_RESULT = "validation_result"
    ERROR_NOTIFICATION = "error_notification"
    PROGRESS_UPDATE = "progress_update"
    COLLABORATION_REQUEST = "collaboration_request"
    HANDOFF = "handoff"


class MessagePriority(str, Enum):
    """Message priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class AgentMessage(BaseModel):
    """
    Standard message format for inter-agent communication.

    Provides structured communication between agents during workflow execution.
    """

    message_id: UUID = Field(default_factory=uuid4, description="Unique message identifier")
    message_type: MessageType = Field(..., description="Type of message")
    priority: MessagePriority = Field(
        default=MessagePriority.MEDIUM, description="Message priority"
    )

    # Sender and recipient information
    sender_agent: str = Field(..., description="Agent role that sent the message")
    recipient_agent: str | None = Field(None, description="Target agent role (None for broadcast)")
    workflow_id: UUID = Field(..., description="Workflow execution ID")
    step_id: str | None = Field(None, description="Related workflow step ID")

    # Message content
    subject: str = Field(..., description="Brief message subject")
    content: dict[str, Any] = Field(..., description="Message payload")
    context: dict[str, Any] = Field(default_factory=dict, description="Shared context data")

    # Metadata
    timestamp: datetime = Field(default_factory=datetime.now, description="Message timestamp")
    correlation_id: UUID | None = Field(None, description="Correlation ID for message chains")
    reply_to: UUID | None = Field(None, description="ID of message this is replying to")
    expires_at: datetime | None = Field(None, description="Message expiration time")

    # Delivery tracking
    delivery_attempts: int = Field(default=0, description="Number of delivery attempts")
    max_delivery_attempts: int = Field(default=3, description="Maximum delivery attempts")
    acknowledged: bool = Field(default=False, description="Whether message was acknowledged")


class TaskAssignment(BaseModel):
    """Task assignment details for agent collaboration."""

    task_id: str = Field(..., description="Unique task identifier")
    task_name: str = Field(..., description="Human-readable task name")
    task_description: str = Field(..., description="Detailed task description")
    assigned_agent: str = Field(..., description="Agent role assigned to task")

    # Task requirements
    requirements: dict[str, Any] = Field(..., description="Task requirements and constraints")
    input_artifacts: list[str] = Field(default_factory=list, description="Required input artifacts")
    expected_outputs: list[str] = Field(..., description="Expected output artifacts")

    # Quality criteria
    acceptance_criteria: dict[str, Any] = Field(..., description="Criteria for task completion")
    quality_gates: list[str] = Field(
        default_factory=list, description="Quality validation requirements"
    )

    # Timing and dependencies
    deadline: datetime | None = Field(None, description="Task deadline")
    estimated_duration: int | None = Field(None, description="Estimated duration in minutes")
    dependencies: list[str] = Field(default_factory=list, description="Required predecessor tasks")

    # Context and resources
    context_data: dict[str, Any] = Field(default_factory=dict, description="Task execution context")
    resources: dict[str, Any] = Field(default_factory=dict, description="Available resources")


class TaskCompletion(BaseModel):
    """Task completion notification with results."""

    task_id: str = Field(..., description="Completed task identifier")
    completion_status: str = Field(..., description="Completion status (success, failure, partial)")

    # Results and artifacts
    outputs: dict[str, Any] = Field(..., description="Task outputs and artifacts")
    artifacts_produced: list[str] = Field(default_factory=list, description="Artifact locations")

    # Quality metrics
    quality_metrics: dict[str, Any] = Field(
        default_factory=dict, description="Quality measurements"
    )
    validation_results: dict[str, bool] = Field(
        default_factory=dict, description="Validation gate results"
    )

    # Performance data
    execution_time: float = Field(..., description="Actual execution time in seconds")
    resource_usage: dict[str, Any] = Field(default_factory=dict, description="Resource consumption")

    # Issues and recommendations
    issues_encountered: list[str] = Field(
        default_factory=list, description="Issues during execution"
    )
    recommendations: list[str] = Field(
        default_factory=list, description="Recommendations for follow-up"
    )
    next_suggested_tasks: list[str] = Field(
        default_factory=list, description="Suggested next tasks"
    )


class ContextUpdate(BaseModel):
    """Context update for sharing state between agents."""

    context_type: str = Field(..., description="Type of context being updated")
    context_scope: str = Field(..., description="Scope of context (global, workflow, step)")

    # Context data
    updates: dict[str, Any] = Field(..., description="Context updates to apply")
    incremental: bool = Field(default=True, description="Whether this is an incremental update")

    # Versioning and conflict resolution
    context_version: int = Field(default=1, description="Context version number")
    merge_strategy: str = Field(default="merge", description="How to handle conflicts")

    # Persistence
    persist: bool = Field(default=True, description="Whether to persist context changes")
    sync_required: bool = Field(default=False, description="Whether synchronization is required")


class ValidationRequest(BaseModel):
    """Request for validation from another agent."""

    validation_type: str = Field(..., description="Type of validation requested")
    target_artifacts: list[str] = Field(..., description="Artifacts to validate")

    # Validation criteria
    criteria: dict[str, Any] = Field(..., description="Validation criteria")
    quality_requirements: dict[str, Any] = Field(..., description="Quality requirements")

    # Context and constraints
    validation_context: dict[str, Any] = Field(
        default_factory=dict, description="Validation context"
    )
    timeout_minutes: int = Field(default=30, description="Validation timeout")

    # Response requirements
    detailed_feedback: bool = Field(default=True, description="Whether detailed feedback is needed")
    blocking: bool = Field(default=True, description="Whether validation blocks progress")


class ValidationResult(BaseModel):
    """Result of validation performed by an agent."""

    validation_id: UUID = Field(..., description="Validation request ID")
    validation_status: str = Field(..., description="Validation status (passed, failed, warning)")

    # Results
    overall_score: float = Field(..., description="Overall validation score (0-10)")
    criteria_results: dict[str, bool] = Field(..., description="Individual criteria results")

    # Feedback
    feedback: list[str] = Field(default_factory=list, description="Validation feedback")
    recommendations: list[str] = Field(
        default_factory=list, description="Improvement recommendations"
    )
    issues_found: list[dict[str, Any]] = Field(
        default_factory=list, description="Issues identified"
    )

    # Metrics
    validation_duration: float = Field(..., description="Time taken for validation")
    confidence_level: float = Field(..., description="Confidence in validation results")


class AgentHandoff(BaseModel):
    """Handoff information when transferring work between agents."""

    from_agent: str = Field(..., description="Agent transferring work")
    to_agent: str = Field(..., description="Agent receiving work")
    handoff_reason: str = Field(..., description="Reason for handoff")

    # Work state
    current_state: dict[str, Any] = Field(..., description="Current work state")
    completed_work: list[str] = Field(..., description="Work completed so far")
    remaining_work: list[str] = Field(..., description="Work remaining to be done")

    # Context transfer
    context_data: dict[str, Any] = Field(..., description="Context to transfer")
    working_files: list[str] = Field(default_factory=list, description="Files being worked on")

    # Handoff requirements
    briefing_required: bool = Field(default=True, description="Whether briefing is required")
    knowledge_transfer: dict[str, Any] = Field(
        default_factory=dict, description="Knowledge to transfer"
    )
    continuation_instructions: list[str] = Field(
        default_factory=list, description="How to continue work"
    )


class CommunicationBus:
    """
    Communication bus for managing inter-agent message delivery.

    Handles message routing, delivery, acknowledgment, and persistence
    for the workflow system's agent collaboration.
    """

    def __init__(self):
        self.message_queue: list[AgentMessage] = []
        self.message_history: list[AgentMessage] = []
        self.agent_subscriptions: dict[str, list[MessageType]] = {}
        self.active_conversations: dict[UUID, list[UUID]] = {}  # workflow_id -> message_ids

    def subscribe_agent(self, agent_role: str, message_types: list[MessageType]) -> None:
        """Subscribe an agent to specific message types."""
        self.agent_subscriptions[agent_role] = message_types
        logger.info("Agent %s subscribed to message types: %s", agent_role, message_types)

    def send_message(self, message: AgentMessage) -> bool:
        """
        Send a message through the communication bus.

        Args:
            message: Message to send

        Returns:
            True if message was queued successfully
        """
        try:
            # Validate message
            if not self._validate_message(message):
                logger.error("Message validation failed: %s", message.message_id)
                return False

            # Queue message for delivery
            self.message_queue.append(message)

            # Track conversation
            if message.workflow_id not in self.active_conversations:
                self.active_conversations[message.workflow_id] = []
            self.active_conversations[message.workflow_id].append(message.message_id)

            logger.info(
                "Message queued: %s from %s to %s",
                message.message_type,
                message.sender_agent,
                message.recipient_agent,
            )

            return True

        except Exception as e:
            logger.error("Failed to send message: %s", e)
            return False

    def deliver_messages(self, agent_role: str) -> list[AgentMessage]:
        """
        Deliver pending messages for a specific agent.

        Args:
            agent_role: Agent role to deliver messages to

        Returns:
            List of messages for the agent
        """
        messages_for_agent = []
        remaining_messages = []

        for message in self.message_queue:
            # Check if message is for this agent
            if (
                message.recipient_agent == agent_role or message.recipient_agent is None
            ):  # Broadcast message
                # Check if agent is subscribed to this message type
                subscribed_types = self.agent_subscriptions.get(agent_role, [])
                if message.message_type in subscribed_types or not subscribed_types:
                    messages_for_agent.append(message)
                    message.delivery_attempts += 1

                    # Archive delivered message
                    self.message_history.append(message)
                else:
                    remaining_messages.append(message)
            else:
                remaining_messages.append(message)

        self.message_queue = remaining_messages

        logger.info("Delivered %d messages to agent %s", len(messages_for_agent), agent_role)
        return messages_for_agent

    def acknowledge_message(self, message_id: UUID, agent_role: str) -> bool:
        """
        Acknowledge receipt of a message.

        Args:
            message_id: ID of message to acknowledge
            agent_role: Agent acknowledging the message

        Returns:
            True if acknowledgment was processed
        """
        for message in self.message_history:
            if message.message_id == message_id:
                message.acknowledged = True
                logger.info("Message %s acknowledged by %s", message_id, agent_role)
                return True

        logger.warning("Message %s not found for acknowledgment", message_id)
        return False

    def create_task_assignment_message(
        self,
        workflow_id: UUID,
        assignment: TaskAssignment,
        sender: str,
        recipient: str,
        priority: MessagePriority = MessagePriority.MEDIUM,
    ) -> AgentMessage:
        """Create a task assignment message."""
        return AgentMessage(
            message_type=MessageType.TASK_ASSIGNMENT,
            priority=priority,
            sender_agent=sender,
            recipient_agent=recipient,
            workflow_id=workflow_id,
            step_id=assignment.task_id,
            subject=f"Task Assignment: {assignment.task_name}",
            content=assignment.dict(),
            context=assignment.context_data,
        )

    def create_completion_message(
        self,
        workflow_id: UUID,
        completion: TaskCompletion,
        sender: str,
        recipient: str | None = None,
        priority: MessagePriority = MessagePriority.HIGH,
    ) -> AgentMessage:
        """Create a task completion message."""
        return AgentMessage(
            message_type=MessageType.TASK_COMPLETION,
            priority=priority,
            sender_agent=sender,
            recipient_agent=recipient,
            workflow_id=workflow_id,
            step_id=completion.task_id,
            subject=f"Task Completed: {completion.task_id}",
            content=completion.dict(),
            context={"completion_status": completion.completion_status},
        )

    def create_validation_request_message(
        self,
        workflow_id: UUID,
        validation_request: ValidationRequest,
        sender: str,
        recipient: str,
        priority: MessagePriority = MessagePriority.HIGH,
    ) -> AgentMessage:
        """Create a validation request message."""
        return AgentMessage(
            message_type=MessageType.VALIDATION_REQUEST,
            priority=priority,
            sender_agent=sender,
            recipient_agent=recipient,
            workflow_id=workflow_id,
            subject=f"Validation Request: {validation_request.validation_type}",
            content=validation_request.dict(),
            context=validation_request.validation_context,
        )

    def create_handoff_message(
        self,
        workflow_id: UUID,
        handoff: AgentHandoff,
        sender: str,
        recipient: str,
        priority: MessagePriority = MessagePriority.HIGH,
    ) -> AgentMessage:
        """Create an agent handoff message."""
        return AgentMessage(
            message_type=MessageType.HANDOFF,
            priority=priority,
            sender_agent=sender,
            recipient_agent=recipient,
            workflow_id=workflow_id,
            subject=f"Work Handoff: {handoff.handoff_reason}",
            content=handoff.dict(),
            context=handoff.context_data,
        )

    def get_conversation_history(self, workflow_id: UUID) -> list[AgentMessage]:
        """Get message history for a specific workflow."""
        conversation_message_ids = self.active_conversations.get(workflow_id, [])
        return [msg for msg in self.message_history if msg.message_id in conversation_message_ids]

    def _validate_message(self, message: AgentMessage) -> bool:
        """Validate message format and content."""
        try:
            # Check required fields
            if not message.sender_agent or not message.workflow_id:
                return False

            # Check expiration
            if message.expires_at and datetime.now() > message.expires_at:
                logger.warning("Message expired: %s", message.message_id)
                return False

            # Check delivery attempts
            if message.delivery_attempts >= message.max_delivery_attempts:
                logger.warning("Message exceeded max delivery attempts: %s", message.message_id)
                return False

            return True

        except Exception as e:
            logger.error("Message validation error: %s", e)
            return False
