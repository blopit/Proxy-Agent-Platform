"""
Base agent class for the Proxy Agent Platform.

This module provides the foundation for all AI proxy agents in the productivity platform,
using PydanticAI for structured AI interactions.
"""

import os
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type
from datetime import datetime
from pydantic import BaseModel
from pydantic_ai import Agent
from sqlalchemy.ext.asyncio import AsyncSession

from database import User, AgentActivity, AgentType


class AgentResponse(BaseModel):
    """Standard response format for all agents."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None
    xp_earned: Optional[int] = None


class BaseProxyAgent(ABC):
    """
    Base class for all proxy agents in the platform.

    This class provides common functionality for agent logging, user interaction,
    and integration with the productivity platform.
    """

    def __init__(self, agent_type: AgentType, model_name: str = "gpt-4"):
        """
        Initialize the base proxy agent.

        Args:
            agent_type: The type of agent (task, focus, energy, progress)
            model_name: The AI model to use for this agent
        """
        self.agent_type = agent_type
        self.model_name = model_name
        self.agent = Agent(
            model=model_name,
            system_prompt=self._get_system_prompt(),
            result_type=AgentResponse
        )

    @abstractmethod
    def _get_system_prompt(self) -> str:
        """
        Get the system prompt for this agent.

        Returns:
            System prompt string for the AI agent
        """
        pass

    async def log_activity(
        self,
        db: AsyncSession,
        user_id: int,
        action: str,
        description: str,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Log agent activity to the database.

        Args:
            db: Database session
            user_id: User ID
            action: Action performed by the agent
            description: Description of the action
            context: Additional context data
        """
        activity = AgentActivity(
            user_id=user_id,
            agent_type=self.agent_type,
            action=action,
            description=description,
            context=context or {}
        )
        db.add(activity)
        await db.commit()

    async def award_xp(
        self,
        db: AsyncSession,
        user_id: int,
        xp_amount: int,
        reason: str
    ) -> None:
        """
        Award XP to a user for completing an action.

        Args:
            db: Database session
            user_id: User ID
            xp_amount: Amount of XP to award
            reason: Reason for awarding XP
        """
        # Get user
        user = await db.get(User, user_id)
        if user:
            user.total_xp += xp_amount

            # Calculate new level (simple formula: level = sqrt(total_xp / 100))
            new_level = int((user.total_xp / 100) ** 0.5) + 1
            if new_level > user.current_level:
                user.current_level = new_level
                await self.log_activity(
                    db, user_id, "level_up",
                    f"User leveled up to level {new_level}!",
                    {"new_level": new_level, "total_xp": user.total_xp}
                )

            await db.commit()

    async def get_user_context(self, db: AsyncSession, user_id: int) -> Dict[str, Any]:
        """
        Get relevant user context for agent decision making.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Dictionary containing user context data
        """
        user = await db.get(User, user_id)
        if not user:
            return {}

        return {
            "user_id": user_id,
            "username": user.username,
            "total_xp": user.total_xp,
            "current_level": user.current_level,
            "current_streak": user.current_streak,
            "last_activity": user.last_activity_date.isoformat() if user.last_activity_date else None
        }

    @abstractmethod
    async def process_request(
        self,
        db: AsyncSession,
        user_id: int,
        request: Dict[str, Any]
    ) -> AgentResponse:
        """
        Process a user request using the AI agent.

        Args:
            db: Database session
            user_id: User ID
            request: User request data

        Returns:
            AgentResponse with the result
        """
        pass

    def get_agent_status(self) -> Dict[str, Any]:
        """
        Get the current status of this agent.

        Returns:
            Dictionary containing agent status information
        """
        return {
            "agent_type": self.agent_type.value,
            "model": self.model_name,
            "status": "active",
            "capabilities": self._get_capabilities()
        }

    @abstractmethod
    def _get_capabilities(self) -> List[str]:
        """
        Get a list of capabilities this agent provides.

        Returns:
            List of capability descriptions
        """
        pass


class AgentManager:
    """
    Manager class for coordinating multiple proxy agents.

    This class handles agent orchestration and inter-agent communication.
    """

    def __init__(self):
        """Initialize the agent manager."""
        self.agents: Dict[AgentType, BaseProxyAgent] = {}

    def register_agent(self, agent: BaseProxyAgent) -> None:
        """
        Register an agent with the manager.

        Args:
            agent: The agent to register
        """
        self.agents[agent.agent_type] = agent

    async def get_agent_recommendations(
        self,
        db: AsyncSession,
        user_id: int,
        context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get recommendations from all registered agents.

        Args:
            db: Database session
            user_id: User ID
            context: Additional context for recommendations

        Returns:
            List of recommendations from all agents
        """
        recommendations = []

        for agent_type, agent in self.agents.items():
            try:
                # Each agent can provide proactive recommendations
                if hasattr(agent, 'get_recommendations'):
                    agent_recommendations = await agent.get_recommendations(db, user_id, context)
                    recommendations.extend(agent_recommendations)
            except Exception as e:
                print(f"Error getting recommendations from {agent_type}: {e}")

        return recommendations

    def get_all_agent_status(self) -> Dict[str, Any]:
        """
        Get status of all registered agents.

        Returns:
            Dictionary containing status of all agents
        """
        return {
            agent_type.value: agent.get_agent_status()
            for agent_type, agent in self.agents.items()
        }


# Global agent manager instance
agent_manager = AgentManager()