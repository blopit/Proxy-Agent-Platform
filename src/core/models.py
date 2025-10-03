"""
Core Models - Simple data structures for the platform
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import uuid4, UUID

from pydantic import BaseModel, Field


class AgentRequest(BaseModel):
    """Simple agent request"""
    query: str
    user_id: str
    session_id: str
    agent_type: str = "task"  # task, focus, energy, progress
    request_id: str = Field(default_factory=lambda: str(uuid4()))


class AgentResponse(BaseModel):
    """Simple agent response"""
    success: bool
    response: str
    request_id: str
    session_id: str
    agent_type: str
    xp_earned: int = 0
    processing_time_ms: int = 0


class Message(BaseModel):
    """Database message model"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    message_type: str  # user, agent, system
    content: str
    agent_type: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)