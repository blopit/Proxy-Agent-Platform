"""
Base Agent - Simple foundation for all proxy agents
"""

from datetime import datetime

from src.core.models import AgentRequest, AgentResponse, Message
from src.database.adapter import DatabaseAdapter


class BaseProxyAgent:
    """
    Simple base class for all proxy agents
    Uses database adapter for easy SQLite -> PostgreSQL migration
    """

    def __init__(self, agent_type: str, db: DatabaseAdapter):
        self.agent_type = agent_type
        self.db = db

    async def store_message(
        self, session_id: str, message_type: str, content: str, metadata: dict = None
    ) -> str:
        """Store a message using the database adapter"""
        message = Message(
            session_id=session_id,
            message_type=message_type,
            content=content,
            agent_type=self.agent_type,
            metadata=metadata or {},
        )
        return await self.db.store_message(message)

    async def get_history(self, session_id: str, limit: int = 10) -> list[Message]:
        """Get conversation history"""
        return await self.db.get_conversation_history(session_id, limit)

    async def process_request(self, request: AgentRequest) -> AgentResponse:
        """Process agent request with timing"""
        start_time = datetime.utcnow()

        try:
            # Store user message
            await self.store_message(
                request.session_id, "user", request.query, {"request_id": request.request_id}
            )

            # Get conversation context
            history = await self.get_history(request.session_id)

            # Handle the request (implemented by subclasses)
            response_text, xp_earned = await self._handle_request(request, history)

            # Store agent response
            await self.store_message(
                request.session_id,
                "agent",
                response_text,
                {"xp_earned": xp_earned, "request_id": request.request_id},
            )

            # Calculate processing time
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            return AgentResponse(
                success=True,
                response=response_text,
                request_id=request.request_id,
                session_id=request.session_id,
                agent_type=self.agent_type,
                xp_earned=xp_earned,
                processing_time_ms=processing_time,
            )

        except Exception as e:
            # Store error
            await self.store_message(
                request.session_id, "error", str(e), {"request_id": request.request_id}
            )

            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            return AgentResponse(
                success=False,
                response=f"Error: {str(e)}",
                request_id=request.request_id,
                session_id=request.session_id,
                agent_type=self.agent_type,
                processing_time_ms=processing_time,
            )

    async def _handle_request(
        self, request: AgentRequest, history: list[Message]
    ) -> tuple[str, int]:
        """
        Handle specific agent logic - override in subclasses
        Returns: (response_text, xp_earned)
        """
        return f"Processed by {self.agent_type}: {request.query}", 10
