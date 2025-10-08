"""
Focus Agent - Handles focus sessions and attention management
"""

from src.agents.base import BaseProxyAgent
from src.core.models import AgentRequest, Message


class FocusAgent(BaseProxyAgent):
    """Focus Proxy Agent - manages deep work sessions"""

    def __init__(self, db):
        super().__init__("focus", db)

    async def _handle_request(
        self, request: AgentRequest, history: list[Message]
    ) -> tuple[str, int]:
        """Handle focus-specific requests"""
        query = request.query.lower().strip()

        # Start focus session
        if any(word in query for word in ["start", "begin", "focus"]):
            await self.store_message(
                request.session_id,
                "focus_started",
                "Focus session started",
                {"duration": 25, "type": "pomodoro"},
            )
            return "🎯 Focus session started! 25 minutes of deep work.", 30

        # Stop/pause focus
        elif any(word in query for word in ["stop", "end", "break", "pause"]):
            await self.store_message(
                request.session_id, "focus_stopped", "Focus session paused", {"type": "break"}
            )
            return "⏸️ Focus session paused. Take a 5-minute break!", 20

        # Check focus status
        elif any(word in query for word in ["status", "time", "how long"]):
            focus_sessions = [msg for msg in history if msg.message_type == "focus_started"]
            if focus_sessions:
                return "🎯 You're in a focus session. Stay concentrated!", 5
            else:
                return "No active focus session. Say 'start focus' to begin.", 0

        # Default
        else:
            return f"Focus guidance: {request.query}", 10
