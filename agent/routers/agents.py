"""
Agents router for the Proxy Agent Platform API.

This module provides endpoints for interacting with AI proxy agents,
including task management, focus optimization, energy tracking, and progress monitoring.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from database import get_db
from agents.base_agent import agent_manager, AgentResponse
from agents.task_agent import TaskAgent

router = APIRouter()

# Initialize agents
task_agent = TaskAgent()
agent_manager.register_agent(task_agent)

# Request/Response models
class AgentRequest(BaseModel):
    """Request schema for agent interactions."""
    agent_type: str
    action: str
    data: Dict[str, Any]
    user_id: int


class AgentStatusResponse(BaseModel):
    """Response schema for agent status."""
    status: str
    agents: Dict[str, Any]
    active_agents: int


@router.get("/status", response_model=AgentStatusResponse)
async def get_agents_status():
    """
    Get the status of all proxy agents.

    Returns:
        AgentStatusResponse: Status of all registered agents
    """
    agents_status = agent_manager.get_all_agent_status()
    return AgentStatusResponse(
        status="active",
        agents=agents_status,
        active_agents=len(agents_status)
    )


@router.post("/interact", response_model=AgentResponse)
async def interact_with_agent(
    request: AgentRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Interact with a specific proxy agent.

    Args:
        request: Agent interaction request
        db: Database session

    Returns:
        AgentResponse: Result from the agent interaction
    """
    try:
        # Get the requested agent
        agent_type_map = {
            "task": task_agent,
            # Will add other agents here
        }

        agent = agent_type_map.get(request.agent_type)
        if not agent:
            raise HTTPException(
                status_code=404,
                detail=f"Agent type '{request.agent_type}' not found"
            )

        # Process the request with the agent
        result = await agent.process_request(
            db=db,
            user_id=request.user_id,
            request={"action": request.action, **request.data}
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interacting with agent: {str(e)}"
        )


@router.get("/recommendations/{user_id}")
async def get_agent_recommendations(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get recommendations from all agents for a specific user.

    Args:
        user_id: User ID to get recommendations for
        db: Database session

    Returns:
        List of recommendations from all agents
    """
    try:
        recommendations = await agent_manager.get_agent_recommendations(db, user_id)
        return {"recommendations": recommendations}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting recommendations: {str(e)}"
        )


@router.get("/capabilities")
async def get_agent_capabilities():
    """
    Get capabilities of all registered agents.

    Returns:
        Dictionary of agent capabilities
    """
    capabilities = {}
    for agent_type, agent in agent_manager.agents.items():
        capabilities[agent_type.value] = agent._get_capabilities()

    return {"capabilities": capabilities}