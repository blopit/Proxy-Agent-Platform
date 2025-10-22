"""
Agent Registry - Manages all proxy agents
"""

from src.agents.base import BaseProxyAgent
from src.agents.capture_agent import CaptureAgent
from src.agents.classifier_agent import ClassifierAgent
from src.agents.decomposer_agent import DecomposerAgent
from src.agents.focus_agent import FocusAgent
from src.agents.task_agent import TaskAgent
from src.core.models import AgentRequest, AgentResponse
from src.database.adapter import DatabaseAdapter, get_database


class AgentRegistry:
    """Simple registry for managing proxy agents"""

    def __init__(self, db: DatabaseAdapter = None):
        self.db = db or get_database()
        self.agents: dict[str, BaseProxyAgent] = {
            "task": TaskAgent(self.db),
            "focus": FocusAgent(self.db),
            # Capture Mode agents (Epic: Capture)
            "capture": CaptureAgent(self.db),
            "decomposer": DecomposerAgent(self.db),
            "classifier": ClassifierAgent(self.db),
            # Energy and Progress agents to be added later
        }

    def get_agent(self, agent_type: str) -> BaseProxyAgent | None:
        """Get agent by type"""
        return self.agents.get(agent_type)

    async def process_request(self, request: AgentRequest) -> AgentResponse:
        """Route request to appropriate agent"""
        agent = self.get_agent(request.agent_type)

        if not agent:
            return AgentResponse(
                success=False,
                response=f"Unknown agent type: {request.agent_type}",
                request_id=request.request_id,
                session_id=request.session_id,
                agent_type=request.agent_type,
            )

        return await agent.process_request(request)

    def list_agents(self) -> dict[str, str]:
        """List available agents"""
        return {agent_type: agent.__class__.__name__ for agent_type, agent in self.agents.items()}
