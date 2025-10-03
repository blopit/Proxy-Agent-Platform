"""
Task Agent - Handles task capture and management
"""


from src.agents.base import BaseProxyAgent
from src.core.models import AgentRequest, Message


class TaskAgent(BaseProxyAgent):
    """Task Proxy Agent - optimized for 2-second capture"""

    def __init__(self, db):
        super().__init__("task", db)

    async def _handle_request(self, request: AgentRequest, history: list[Message]) -> tuple[str, int]:
        """Handle task-specific requests"""
        query = request.query.lower().strip()

        # Quick task capture
        if any(word in query for word in ["add", "create", "new", "task"]):
            task = self._extract_task(request.query)

            # Store as task
            await self.store_message(
                request.session_id,
                "task_created",
                task,
                {"priority": "medium", "status": "pending"}
            )

            return f"✅ Task captured: {task}", 25

        # List tasks
        elif any(word in query for word in ["list", "show", "tasks", "what"]):
            tasks = [msg for msg in history if msg.message_type == "task_created"]

            if tasks:
                task_list = "\n".join([f"• {task.content}" for task in tasks[-5:]])
                return f"Recent tasks:\n{task_list}", 5
            else:
                return "No tasks yet. Say 'add task [description]' to create one.", 0

        # Default: treat as new task
        else:
            await self.store_message(
                request.session_id,
                "task_created",
                request.query,
                {"priority": "medium", "status": "pending"}
            )
            return f"✅ Task captured: {request.query}", 15

    def _extract_task(self, query: str) -> str:
        """Extract task description from query"""
        # Remove common prefixes
        task = query.replace("add task", "").replace("create task", "").replace("new task", "")
        task = task.replace("add", "").replace("create", "").replace("new", "")
        return task.strip(" :")  # Remove spaces and colons
