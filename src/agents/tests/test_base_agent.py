"""
TDD Tests for BaseProxyAgent - Foundation for all agents

Following Epic 2 TDD methodology:
- Test base agent functionality
- Ensure proper message storage
- Verify conversation history
- Test error handling
- Validate timing and metrics
"""

import pytest
from datetime import datetime
from unittest.mock import Mock, AsyncMock, patch

from src.agents.base import BaseProxyAgent
from src.core.models import AgentRequest, AgentResponse, Message
from src.database.adapter import DatabaseAdapter


@pytest.fixture
def mock_db():
    """Create mock database adapter"""
    db = Mock(spec=DatabaseAdapter)
    db.store_message = AsyncMock(return_value="msg_123")
    db.get_conversation_history = AsyncMock(return_value=[])
    return db


@pytest.fixture
def base_agent(mock_db):
    """Create base agent for testing"""
    return BaseProxyAgent("test_agent", mock_db)


@pytest.fixture
def sample_request():
    """Create sample agent request"""
    return AgentRequest(
        request_id="req_123",
        session_id="session_456",
        user_id="user_789",
        agent_type="test_agent",
        query="Test query"
    )


class TestBaseProxyAgentInitialization:
    """Test base agent initialization"""

    def test_agent_initialization(self, mock_db):
        """Test that agent initializes with correct properties"""
        agent = BaseProxyAgent("test_type", mock_db)

        assert agent.agent_type == "test_type"
        assert agent.db == mock_db

    def test_agent_type_stored(self, base_agent):
        """Test that agent type is properly stored"""
        assert base_agent.agent_type == "test_agent"


class TestMessageStorage:
    """Test message storage functionality"""

    @pytest.mark.asyncio
    async def test_store_message_basic(self, base_agent, mock_db):
        """Test basic message storage"""
        message_id = await base_agent.store_message(
            "session_123",
            "user",
            "Hello, agent!"
        )

        assert message_id == "msg_123"
        mock_db.store_message.assert_called_once()

        # Verify message structure
        call_args = mock_db.store_message.call_args[0][0]
        assert isinstance(call_args, Message)
        assert call_args.session_id == "session_123"
        assert call_args.message_type == "user"
        assert call_args.content == "Hello, agent!"
        assert call_args.agent_type == "test_agent"

    @pytest.mark.asyncio
    async def test_store_message_with_metadata(self, base_agent, mock_db):
        """Test message storage with metadata"""
        metadata = {"key": "value", "number": 42}

        await base_agent.store_message(
            "session_123",
            "agent",
            "Response",
            metadata=metadata
        )

        call_args = mock_db.store_message.call_args[0][0]
        assert call_args.metadata == metadata

    @pytest.mark.asyncio
    async def test_store_message_empty_metadata(self, base_agent, mock_db):
        """Test that empty metadata defaults to empty dict"""
        await base_agent.store_message(
            "session_123",
            "user",
            "Test"
        )

        call_args = mock_db.store_message.call_args[0][0]
        assert call_args.metadata == {}


class TestConversationHistory:
    """Test conversation history retrieval"""

    @pytest.mark.asyncio
    async def test_get_history_basic(self, base_agent, mock_db):
        """Test basic history retrieval"""
        mock_messages = [
            Message(
                session_id="session_123",
                message_type="user",
                content="First message",
                agent_type="test_agent"
            ),
            Message(
                session_id="session_123",
                message_type="agent",
                content="First response",
                agent_type="test_agent"
            )
        ]
        mock_db.get_conversation_history.return_value = mock_messages

        history = await base_agent.get_history("session_123")

        assert len(history) == 2
        assert history[0].content == "First message"
        assert history[1].content == "First response"

    @pytest.mark.asyncio
    async def test_get_history_with_limit(self, base_agent, mock_db):
        """Test history retrieval with limit"""
        await base_agent.get_history("session_123", limit=5)

        mock_db.get_conversation_history.assert_called_once_with("session_123", 5)

    @pytest.mark.asyncio
    async def test_get_history_default_limit(self, base_agent, mock_db):
        """Test history retrieval uses default limit of 10"""
        await base_agent.get_history("session_123")

        mock_db.get_conversation_history.assert_called_once_with("session_123", 10)


class TestRequestProcessing:
    """Test request processing workflow"""

    @pytest.mark.asyncio
    async def test_process_request_success(self, base_agent, sample_request):
        """Test successful request processing"""
        # Mock the _handle_request method
        with patch.object(base_agent, '_handle_request', new_callable=AsyncMock) as mock_handle:
            mock_handle.return_value = ("Test response", 25)

            response = await base_agent.process_request(sample_request)

            assert response.success is True
            assert response.response == "Test response"
            assert response.xp_earned == 25
            assert response.agent_type == "test_agent"
            assert response.request_id == "req_123"
            assert response.session_id == "session_456"

    @pytest.mark.asyncio
    async def test_process_request_stores_user_message(self, base_agent, sample_request, mock_db):
        """Test that user message is stored"""
        with patch.object(base_agent, '_handle_request', new_callable=AsyncMock) as mock_handle:
            mock_handle.return_value = ("Response", 10)

            await base_agent.process_request(sample_request)

            # Should be called twice: user message + agent response
            assert mock_db.store_message.call_count == 2

            # First call should be user message
            first_call = mock_db.store_message.call_args_list[0][0][0]
            assert first_call.message_type == "user"
            assert first_call.content == "Test query"

    @pytest.mark.asyncio
    async def test_process_request_stores_agent_response(self, base_agent, sample_request, mock_db):
        """Test that agent response is stored"""
        with patch.object(base_agent, '_handle_request', new_callable=AsyncMock) as mock_handle:
            mock_handle.return_value = ("Agent response", 30)

            await base_agent.process_request(sample_request)

            # Second call should be agent response
            second_call = mock_db.store_message.call_args_list[1][0][0]
            assert second_call.message_type == "agent"
            assert second_call.content == "Agent response"
            assert second_call.metadata["xp_earned"] == 30

    @pytest.mark.asyncio
    async def test_process_request_calculates_timing(self, base_agent, sample_request):
        """Test that processing time is calculated"""
        with patch.object(base_agent, '_handle_request', new_callable=AsyncMock) as mock_handle:
            mock_handle.return_value = ("Response", 10)

            response = await base_agent.process_request(sample_request)

            assert response.processing_time_ms >= 0
            assert isinstance(response.processing_time_ms, int)


class TestErrorHandling:
    """Test error handling in base agent"""

    @pytest.mark.asyncio
    async def test_process_request_handles_errors(self, base_agent, sample_request, mock_db):
        """Test that errors are caught and returned gracefully"""
        with patch.object(base_agent, '_handle_request', new_callable=AsyncMock) as mock_handle:
            mock_handle.side_effect = ValueError("Test error")

            response = await base_agent.process_request(sample_request)

            assert response.success is False
            assert "Test error" in response.response
            assert response.processing_time_ms >= 0

    @pytest.mark.asyncio
    async def test_error_stored_as_message(self, base_agent, sample_request, mock_db):
        """Test that errors are stored as error messages"""
        with patch.object(base_agent, '_handle_request', new_callable=AsyncMock) as mock_handle:
            mock_handle.side_effect = RuntimeError("Critical error")

            await base_agent.process_request(sample_request)

            # Should store user message + error message
            assert mock_db.store_message.call_count == 2

            # Second call should be error message
            error_call = mock_db.store_message.call_args_list[1][0][0]
            assert error_call.message_type == "error"
            assert "Critical error" in error_call.content


class TestSubclassImplementation:
    """Test that subclasses can properly override _handle_request"""

    @pytest.mark.asyncio
    async def test_default_handle_request(self, base_agent, sample_request):
        """Test default implementation of _handle_request"""
        history = []
        response_text, xp = await base_agent._handle_request(sample_request, history)

        assert "test_agent" in response_text
        assert sample_request.query in response_text
        assert xp == 10

    @pytest.mark.asyncio
    async def test_custom_handle_request(self, mock_db, sample_request):
        """Test that subclasses can override _handle_request"""
        class CustomAgent(BaseProxyAgent):
            async def _handle_request(self, request, history):
                return f"Custom: {request.query}", 50

        agent = CustomAgent("custom", mock_db)
        response = await agent.process_request(sample_request)

        assert response.response == "Custom: Test query"
        assert response.xp_earned == 50
