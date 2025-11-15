"""
Tests for proxy agents using SQLite
"""

import os
import tempfile

import pytest

from src.agents.focus_agent import FocusAgent
from src.agents.registry import AgentRegistry
from src.agents.task_agent import TaskAgent
from src.core.models import AgentRequest, Message
from src.database.enhanced_adapter import EnhancedDatabaseAdapter


@pytest.fixture
def temp_db():
    """Create temporary SQLite database for testing"""
    # Create temporary file
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)

    # Create database adapter
    db = EnhancedDatabaseAdapter(path)

    yield db

    # Cleanup
    os.unlink(path)


@pytest.mark.asyncio
async def test_task_agent_capture(temp_db):
    """Test task capture functionality"""
    agent = TaskAgent(temp_db)

    request = AgentRequest(
        query="Add task: Call dentist tomorrow", user_id="test_user", session_id="test_session"
    )

    response = await agent.process_request(request)

    assert response.success is True
    assert "Task captured" in response.response
    assert response.xp_earned > 0
    assert response.processing_time_ms > 0


@pytest.mark.asyncio
async def test_focus_agent_session(temp_db):
    """Test focus session functionality"""
    agent = FocusAgent(temp_db)

    # Start focus
    request = AgentRequest(
        query="Start focus session", user_id="test_user", session_id="test_session"
    )

    response = await agent.process_request(request)

    assert response.success is True
    assert "Focus session started" in response.response
    assert response.xp_earned > 0


@pytest.mark.asyncio
async def test_agent_registry(temp_db):
    """Test agent registry functionality"""
    registry = AgentRegistry(temp_db)

    # Test task agent
    request = AgentRequest(
        query="Add task: Test registry",
        user_id="test_user",
        session_id="test_session",
        agent_type="task",
    )

    response = await registry.process_request(request)
    assert response.success is True
    assert response.agent_type == "task"

    # Test focus agent
    request.agent_type = "focus"
    request.query = "Start focus"

    response = await registry.process_request(request)
    assert response.success is True
    assert response.agent_type == "focus"

    # Test unknown agent
    request.agent_type = "unknown"
    response = await registry.process_request(request)
    assert response.success is False


@pytest.mark.asyncio
async def test_database_adapter(temp_db):
    """Test database adapter functionality"""
    # Store a message
    message = Message(
        session_id="test_session", message_type="user", content="Test message", agent_type="task"
    )

    message_id = await temp_db.store_message(message)
    assert message_id == message.id

    # Get history
    history = await temp_db.get_conversation_history("test_session")
    assert len(history) == 1
    assert history[0].content == "Test message"

    # Clear session
    cleared = await temp_db.clear_session("test_session")
    assert cleared is True

    # Verify cleared
    history = await temp_db.get_conversation_history("test_session")
    assert len(history) == 0


@pytest.mark.asyncio
async def test_conversation_flow(temp_db):
    """Test full conversation flow"""
    registry = AgentRegistry(temp_db)

    session_id = "conversation_test"

    # Add multiple tasks
    tasks = ["Add task: Morning workout", "Create task: Team standup", "New task: Review code"]

    for task in tasks:
        request = AgentRequest(
            query=task, user_id="test_user", session_id=session_id, agent_type="task"
        )
        response = await registry.process_request(request)
        assert response.success is True

    # List tasks
    request = AgentRequest(
        query="show my tasks", user_id="test_user", session_id=session_id, agent_type="task"
    )

    response = await registry.process_request(request)
    assert response.success is True
    assert "Recent tasks" in response.response

    # Get full history
    history = await temp_db.get_conversation_history(session_id)
    assert len(history) >= 6  # 3 user messages + 3 agent responses


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
