"""
Base classes for Proxy Agent Platform agents.

Provides common functionality and patterns for all proxy agents following
CLAUDE.md standards for PydanticAI development.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, Optional, TypeVar, Generic, List
from uuid import UUID, uuid4
from dataclasses import dataclass
from enum import Enum

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from ..config import get_llm_model, get_settings
from ..models.base import BaseModel as ProxyBaseModel


class AgentStatus(str, Enum):
    """Status of agent execution."""
    IDLE = "idle"
    THINKING = "thinking"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentPriority(str, Enum):
    """Priority levels for agent tasks."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


@dataclass
class AgentExecutionContext:
    """
    Context for agent execution containing user info and environment.

    Provides all necessary context for agents to operate on behalf of users.
    """
    user_id: UUID
    session_id: UUID
    execution_id: UUID
    user_preferences: Dict[str, Any]
    energy_level: Optional[float] = None
    time_context: Optional[Dict[str, Any]] = None
    mobile_context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

    def get_preference(self, key: str, default: Any = None) -> Any:
        """Get user preference value."""
        return self.user_preferences.get(key, default)

    def is_mobile_context(self) -> bool:
        """Check if this is a mobile-initiated context."""
        return self.mobile_context is not None

    def get_energy_context(self) -> str:
        """Get energy level context for agent decisions."""
        if self.energy_level is None:
            return "unknown"
        elif self.energy_level >= 8.0:
            return "high"
        elif self.energy_level >= 6.0:
            return "medium"
        elif self.energy_level >= 4.0:
            return "low"
        else:
            return "very-low"


class AgentResult(ProxyBaseModel):
    """
    Result of agent execution with status and data.

    Standardized result format for all proxy agents.
    """
    agent_type: str = Field(..., description="Type of agent that produced this result")
    status: AgentStatus = Field(..., description="Execution status")
    data: Any = Field(default=None, description="Result data from agent execution")
    message: str = Field(default="", description="Human-readable message about the result")
    execution_time: float = Field(default=0.0, description="Execution time in seconds")
    tokens_used: Optional[int] = Field(default=None, description="Tokens consumed")
    xp_earned: int = Field(default=0, description="XP awarded for this action")
    next_actions: List[str] = Field(default=[], description="Suggested next actions")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")

    def is_success(self) -> bool:
        """Check if the execution was successful."""
        return self.status == AgentStatus.COMPLETED

    def add_xp(self, amount: int, reason: str = "") -> None:
        """Add XP to the result."""
        self.xp_earned += amount
        if reason and self.metadata:
            self.metadata.setdefault("xp_reasons", []).append(reason)


# Type variable for agent dependencies
DepsType = TypeVar('DepsType')


class BaseProxyAgent(ABC, Generic[DepsType]):
    """
    Base class for all proxy agents in the platform.

    Provides common functionality including:
    - PydanticAI agent initialization
    - Context management
    - Result formatting
    - XP calculation
    - Error handling
    """

    def __init__(
        self,
        agent_type: str,
        system_prompt: str,
        deps_type: type[DepsType],
        description: str = "",
    ):
        """
        Initialize the proxy agent.

        Args:
            agent_type: Unique identifier for this agent type
            system_prompt: System prompt for the underlying AI agent
            deps_type: Type for agent dependencies
            description: Human-readable description of agent capabilities
        """
        self.agent_type = agent_type
        self.description = description
        self.settings = get_settings()

        # Initialize PydanticAI agent
        self.agent = Agent(
            model=get_llm_model(),
            deps_type=deps_type,
            system_prompt=system_prompt,
        )

        # Register common tools
        self._register_base_tools()

        # Register agent-specific tools
        self._register_agent_tools()

    @abstractmethod
    def _register_agent_tools(self) -> None:
        """Register agent-specific tools. Must be implemented by subclasses."""
        pass

    def _register_base_tools(self) -> None:
        """Register common tools available to all agents."""

        @self.agent.tool
        async def get_current_time(ctx: RunContext[DepsType]) -> str:
            """Get the current time and date."""
            return datetime.now(timezone.utc).isoformat()

        @self.agent.tool
        async def log_activity(
            ctx: RunContext[DepsType],
            activity: str,
            importance: str = "medium"
        ) -> str:
            """Log an activity for tracking and analytics."""
            # This would integrate with the actual logging system
            timestamp = datetime.now(timezone.utc).isoformat()
            return f"Activity logged: {activity} at {timestamp} (importance: {importance})"

    async def execute(
        self,
        prompt: str,
        context: AgentExecutionContext,
        deps: DepsType,
    ) -> AgentResult:
        """
        Execute the agent with given prompt and context.

        Args:
            prompt: User prompt or task description
            context: Execution context with user info
            deps: Agent-specific dependencies

        Returns:
            AgentResult with execution status and data
        """
        start_time = datetime.now()
        execution_id = str(uuid4())

        try:
            # Enhance prompt with context
            enhanced_prompt = self._enhance_prompt_with_context(prompt, context)

            # Execute the agent
            result = await self.agent.run(enhanced_prompt, deps=deps)

            # Calculate execution time
            execution_time = (datetime.now() - start_time).total_seconds()

            # Calculate XP based on successful execution
            xp_earned = self._calculate_xp(result, context, execution_time)

            # Create result
            agent_result = AgentResult(
                agent_type=self.agent_type,
                status=AgentStatus.COMPLETED,
                data=result.data,
                message=self._format_success_message(result),
                execution_time=execution_time,
                tokens_used=getattr(result.usage, 'total_tokens', None) if hasattr(result, 'usage') else None,
                xp_earned=xp_earned,
                next_actions=self._suggest_next_actions(result, context),
                metadata={
                    "execution_id": execution_id,
                    "model_used": self.settings.llm_model,
                    "context_type": "mobile" if context.is_mobile_context() else "desktop",
                }
            )

            return agent_result

        except Exception as error:
            execution_time = (datetime.now() - start_time).total_seconds()

            return AgentResult(
                agent_type=self.agent_type,
                status=AgentStatus.FAILED,
                data=None,
                message=f"Agent execution failed: {str(error)}",
                execution_time=execution_time,
                metadata={
                    "execution_id": execution_id,
                    "error": str(error),
                }
            )

    def _enhance_prompt_with_context(
        self,
        prompt: str,
        context: AgentExecutionContext
    ) -> str:
        """Enhance the user prompt with relevant context information."""
        enhanced_parts = [prompt]

        # Add energy context if available
        energy_context = context.get_energy_context()
        if energy_context != "unknown":
            enhanced_parts.append(f"\nUser's current energy level: {energy_context}")

        # Add time context
        if context.time_context:
            time_info = context.time_context.get("description", "")
            if time_info:
                enhanced_parts.append(f"\nTime context: {time_info}")

        # Add mobile context
        if context.is_mobile_context():
            enhanced_parts.append("\nNote: This request is from a mobile device - keep responses concise and actionable.")

        # Add user preferences
        if context.user_preferences:
            prefs = []
            for key, value in context.user_preferences.items():
                if key.startswith("agent_"):
                    prefs.append(f"{key}: {value}")

            if prefs:
                enhanced_parts.append(f"\nUser preferences: {'; '.join(prefs)}")

        return "\n".join(enhanced_parts)

    def _format_success_message(self, result: Any) -> str:
        """Format a success message based on the result."""
        if hasattr(result, 'data') and result.data:
            return f"{self.agent_type.title()} completed successfully"
        else:
            return f"{self.agent_type.title()} executed"

    def _calculate_xp(
        self,
        result: Any,
        context: AgentExecutionContext,
        execution_time: float
    ) -> int:
        """Calculate XP earned for this execution."""
        base_xp = 10  # Base XP for any successful execution

        # Bonus for mobile usage (encouraging quick captures)
        if context.is_mobile_context():
            base_xp += 5

        # Bonus for low energy usage (self-care bonus)
        energy_context = context.get_energy_context()
        if energy_context in ["low", "very-low"]:
            base_xp += 10  # Bonus for using the system when low energy

        # Efficiency bonus (faster execution)
        if execution_time < 2.0:
            base_xp += 5

        # Apply user's XP multiplier
        multiplier = context.get_preference("xp_multiplier", 1.0)
        return int(base_xp * multiplier)

    def _suggest_next_actions(
        self,
        result: Any,
        context: AgentExecutionContext
    ) -> List[str]:
        """Suggest next actions based on the result and context."""
        suggestions = []

        # Energy-based suggestions
        energy_context = context.get_energy_context()
        if energy_context == "high":
            suggestions.append("Consider tackling a challenging task while your energy is high")
        elif energy_context in ["low", "very-low"]:
            suggestions.append("Take a break or focus on easier tasks")

        # Time-based suggestions
        if context.time_context:
            hour = context.time_context.get("hour", 12)
            if 9 <= hour <= 11:  # Peak morning hours
                suggestions.append("Great time for deep work and important tasks")
            elif 14 <= hour <= 16:  # Afternoon dip
                suggestions.append("Consider administrative tasks or taking a short break")

        return suggestions

    async def stream_execute(
        self,
        prompt: str,
        context: AgentExecutionContext,
        deps: DepsType,
    ):
        """
        Execute the agent with streaming response.

        Yields intermediate results as the agent processes the request.
        """
        start_time = datetime.now()

        try:
            enhanced_prompt = self._enhance_prompt_with_context(prompt, context)

            # Stream the agent execution
            async with self.agent.iter(enhanced_prompt, deps=deps) as run:
                async for node in run:
                    # Yield status updates as the agent processes
                    if self.agent.is_user_prompt_node(node):
                        yield AgentResult(
                            agent_type=self.agent_type,
                            status=AgentStatus.THINKING,
                            message="Processing your request...",
                        )

                    elif self.agent.is_call_tools_node(node):
                        yield AgentResult(
                            agent_type=self.agent_type,
                            status=AgentStatus.EXECUTING,
                            message="Executing tools...",
                        )

            # Get final result
            final_result = run.result
            execution_time = (datetime.now() - start_time).total_seconds()

            yield AgentResult(
                agent_type=self.agent_type,
                status=AgentStatus.COMPLETED,
                data=final_result.data,
                message=self._format_success_message(final_result),
                execution_time=execution_time,
                xp_earned=self._calculate_xp(final_result, context, execution_time),
            )

        except Exception as error:
            execution_time = (datetime.now() - start_time).total_seconds()

            yield AgentResult(
                agent_type=self.agent_type,
                status=AgentStatus.FAILED,
                message=f"Agent execution failed: {str(error)}",
                execution_time=execution_time,
            )

    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities and metadata."""
        return {
            "agent_type": self.agent_type,
            "description": self.description,
            "status": "active",
            "model": self.settings.llm_model,
            "provider": self.settings.llm_provider,
        }