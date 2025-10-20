"""
Conversational Task Agent - Multi-turn clarification for task creation.

This agent asks iterative clarifying questions to gather complete task details
instead of guessing or making assumptions. It maintains conversation state
and learns user preferences over time using the Memory layer.

Usage:
    agent = ConversationalTaskAgent(user_id="alice")

    # Start conversation
    response = await agent.process_message("Review client report")
    # Response: "What priority should this task have? (urgent/high/medium/low)"

    # Continue conversation
    response = await agent.process_message("Urgent")
    # Response: "When is this due? (today/tomorrow/specific date)"

    # Final response creates the task
    response = await agent.process_message("Tomorrow")
    # Response: {task_created: True, task: {...}}
"""

import logging
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class ConversationState(str, Enum):
    """States in the task creation conversation flow."""
    INITIAL = "initial"                    # User provided initial description
    ASKING_PRIORITY = "asking_priority"    # Agent asking for priority
    ASKING_DUE_DATE = "asking_due_date"    # Agent asking for due date
    ASKING_CONTEXT = "asking_context"      # Agent asking for additional context
    COMPLETE = "complete"                  # All info collected, ready to create


class TaskPriority(str, Enum):
    """Task priority levels."""
    URGENT = "urgent"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ConversationContext(BaseModel):
    """Context for an ongoing task creation conversation."""
    conversation_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    state: ConversationState = ConversationState.INITIAL

    # Collected information
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    additional_context: Optional[str] = None

    # Conversation metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    message_count: int = 0


class AgentResponse(BaseModel):
    """Response from the conversational agent."""
    message: str
    state: ConversationState
    task_created: bool = False
    task: Optional[dict[str, Any]] = None
    conversation_id: str
    needs_input: bool = True


class ConversationalTaskAgent:
    """
    Conversational agent for iterative task creation.

    This agent asks clarifying questions one at a time to gather complete
    task information without making assumptions.

    Features:
    - Multi-turn conversations
    - Context retention across messages
    - Natural language parsing for priorities and dates
    - Learns user preferences (future: memory integration)
    - Allows early completion with "done" or "skip"
    """

    def __init__(
        self,
        user_id: str,
        enable_memory: bool = False,
        memory_client: Optional[Any] = None
    ):
        """
        Initialize conversational agent.

        Args:
            user_id: ID of the user creating tasks
            enable_memory: Whether to use memory for learning preferences
            memory_client: Optional memory client for context
        """
        self.user_id = user_id
        self.enable_memory = enable_memory
        self.memory_client = memory_client

        # Active conversations keyed by conversation_id
        self.active_conversations: dict[str, ConversationContext] = {}

        logger.info(f"ConversationalTaskAgent initialized for user {user_id}")

    async def start_conversation(self, initial_message: str) -> AgentResponse:
        """
        Start a new task creation conversation.

        Args:
            initial_message: User's initial task description

        Returns:
            Agent response with first clarifying question
        """
        # Create conversation context
        context = ConversationContext(
            user_id=self.user_id,
            title=initial_message.strip(),
            description=initial_message.strip(),
            state=ConversationState.INITIAL
        )

        self.active_conversations[context.conversation_id] = context

        logger.info(f"Started conversation {context.conversation_id}: {initial_message[:50]}...")

        # Move to asking priority
        return await self._ask_priority(context)

    async def process_message(
        self,
        message: str,
        conversation_id: Optional[str] = None
    ) -> AgentResponse:
        """
        Process a message in an ongoing conversation.

        Args:
            message: User's message
            conversation_id: ID of conversation (uses most recent if None)

        Returns:
            Agent response with next question or task creation confirmation
        """
        # Handle special commands
        message_lower = message.lower().strip()

        # Get or start conversation
        if conversation_id is None:
            # If no conversation ID, start new conversation
            if not self.active_conversations:
                return await self.start_conversation(message)
            # Use most recent conversation
            conversation_id = max(
                self.active_conversations.keys(),
                key=lambda k: self.active_conversations[k].updated_at
            )

        if conversation_id not in self.active_conversations:
            # Conversation not found, start new one
            return await self.start_conversation(message)

        context = self.active_conversations[conversation_id]
        context.message_count += 1
        context.updated_at = datetime.now()

        # Handle "done" or "skip" commands
        if message_lower in ["done", "skip", "finish", "create"]:
            return await self._create_task(context)

        # Process based on current state
        if context.state == ConversationState.INITIAL:
            return await self._ask_priority(context)

        elif context.state == ConversationState.ASKING_PRIORITY:
            # Parse priority from message
            priority = self._parse_priority(message)
            if priority:
                context.priority = priority
                context.state = ConversationState.ASKING_DUE_DATE
                return await self._ask_due_date(context)
            else:
                return AgentResponse(
                    message="I didn't understand that priority. Please choose: urgent, high, medium, or low",
                    state=context.state,
                    conversation_id=context.conversation_id,
                    needs_input=True
                )

        elif context.state == ConversationState.ASKING_DUE_DATE:
            # Parse due date from message
            due_date = self._parse_due_date(message)
            if due_date:
                context.due_date = due_date
                context.state = ConversationState.ASKING_CONTEXT
                return await self._ask_context(context)
            else:
                return AgentResponse(
                    message="I didn't understand that date. Try: 'today', 'tomorrow', 'next week', or a specific date",
                    state=context.state,
                    conversation_id=context.conversation_id,
                    needs_input=True
                )

        elif context.state == ConversationState.ASKING_CONTEXT:
            # Add additional context
            if message_lower not in ["none", "no", "skip"]:
                context.additional_context = message
                if context.description:
                    context.description += f" - {message}"

            # Create task
            return await self._create_task(context)

        else:
            # Unknown state, restart
            return await self.start_conversation(message)

    async def _ask_priority(self, context: ConversationContext) -> AgentResponse:
        """Ask user for task priority."""
        context.state = ConversationState.ASKING_PRIORITY

        return AgentResponse(
            message=f"Got it: \"{context.title}\"\n\nWhat priority should this task have?\n• urgent - needs immediate attention\n• high - important but not urgent\n• medium - normal priority\n• low - can be done later\n\n(Type 'skip' to use default priority)",
            state=context.state,
            conversation_id=context.conversation_id,
            needs_input=True
        )

    async def _ask_due_date(self, context: ConversationContext) -> AgentResponse:
        """Ask user for due date."""
        context.state = ConversationState.ASKING_DUE_DATE

        return AgentResponse(
            message=f"Priority set to: {context.priority.value}\n\nWhen is this due?\n• today\n• tomorrow\n• next week\n• specific date (e.g., 'December 25' or '2025-12-25')\n\n(Type 'skip' for no due date)",
            state=context.state,
            conversation_id=context.conversation_id,
            needs_input=True
        )

    async def _ask_context(self, context: ConversationContext) -> AgentResponse:
        """Ask user for additional context."""
        context.state = ConversationState.ASKING_CONTEXT

        due_str = context.due_date.strftime("%B %d, %Y") if context.due_date else "no due date"

        return AgentResponse(
            message=f"Due date: {due_str}\n\nAny additional context or notes?\n\n(Type 'skip' to create task now, or add any details)",
            state=context.state,
            conversation_id=context.conversation_id,
            needs_input=True
        )

    async def _create_task(self, context: ConversationContext) -> AgentResponse:
        """Create task with collected information."""
        context.state = ConversationState.COMPLETE

        # Build task object
        task = {
            "task_id": str(uuid4()),
            "title": context.title or "Untitled Task",
            "description": context.description or "",
            "priority": context.priority.value if context.priority else "medium",
            "due_date": context.due_date.isoformat() if context.due_date else None,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "user_id": context.user_id,
            "metadata": {
                "conversation_id": context.conversation_id,
                "created_via": "conversational_agent",
                "message_count": context.message_count
            }
        }

        # Clean up conversation
        if context.conversation_id in self.active_conversations:
            del self.active_conversations[context.conversation_id]

        logger.info(f"Task created via conversation {context.conversation_id}")

        # Build summary message
        summary_lines = [
            "✅ Task created successfully!",
            "",
            f"**{task['title']}**",
            f"Priority: {task['priority']}",
        ]

        if task['due_date']:
            due_dt = datetime.fromisoformat(task['due_date'])
            summary_lines.append(f"Due: {due_dt.strftime('%B %d, %Y')}")

        if context.additional_context:
            summary_lines.append(f"Notes: {context.additional_context}")

        return AgentResponse(
            message="\n".join(summary_lines),
            state=context.state,
            task_created=True,
            task=task,
            conversation_id=context.conversation_id,
            needs_input=False
        )

    def _parse_priority(self, message: str) -> Optional[TaskPriority]:
        """Parse priority from user message."""
        message_lower = message.lower().strip()

        # Direct matches
        priority_map = {
            "urgent": TaskPriority.URGENT,
            "high": TaskPriority.HIGH,
            "medium": TaskPriority.MEDIUM,
            "med": TaskPriority.MEDIUM,
            "low": TaskPriority.LOW,
        }

        for key, priority in priority_map.items():
            if key in message_lower:
                return priority

        # Number mapping (1-4)
        if "1" in message_lower or "first" in message_lower:
            return TaskPriority.URGENT
        if "2" in message_lower or "second" in message_lower:
            return TaskPriority.HIGH
        if "3" in message_lower or "third" in message_lower:
            return TaskPriority.MEDIUM
        if "4" in message_lower or "fourth" in message_lower:
            return TaskPriority.LOW

        return None

    def _parse_due_date(self, message: str) -> Optional[datetime]:
        """Parse due date from user message."""
        message_lower = message.lower().strip()
        now = datetime.now()

        # Relative dates
        if "today" in message_lower:
            return now.replace(hour=23, minute=59, second=59)

        if "tomorrow" in message_lower:
            return (now + timedelta(days=1)).replace(hour=23, minute=59, second=59)

        if "next week" in message_lower:
            return (now + timedelta(weeks=1)).replace(hour=23, minute=59, second=59)

        if "next month" in message_lower:
            return (now + timedelta(days=30)).replace(hour=23, minute=59, second=59)

        # Days of week
        weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for i, day in enumerate(weekdays):
            if day in message_lower:
                # Calculate next occurrence of this weekday
                days_ahead = i - now.weekday()
                if days_ahead <= 0:
                    days_ahead += 7
                return (now + timedelta(days=days_ahead)).replace(hour=23, minute=59, second=59)

        # Try parsing specific dates (basic attempt)
        try:
            # Try ISO format YYYY-MM-DD
            if "-" in message and len(message.split("-")) == 3:
                from dateutil import parser
                parsed = parser.parse(message)
                return parsed.replace(hour=23, minute=59, second=59)
        except Exception:
            pass

        return None

    def get_active_conversation(self, conversation_id: str) -> Optional[ConversationContext]:
        """Get active conversation by ID."""
        return self.active_conversations.get(conversation_id)

    def cancel_conversation(self, conversation_id: str) -> bool:
        """Cancel an active conversation."""
        if conversation_id in self.active_conversations:
            del self.active_conversations[conversation_id]
            logger.info(f"Cancelled conversation {conversation_id}")
            return True
        return False
