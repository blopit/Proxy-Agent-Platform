"""
Unit Tests for Memory Client

Tests memory client functionality with mocking to avoid requiring API keys.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from src.memory import MemoryClient, MemoryConfig


# Fixtures


@pytest.fixture
def mock_memory():
    """Create a mock Mem0 Memory instance"""
    mock = MagicMock()
    mock.search.return_value = {
        "results": [
            {"memory": "User loves Python programming", "id": "mem1"},
            {"memory": "User is building a task management system", "id": "mem2"},
        ]
    }
    mock.add.return_value = {"status": "success", "id": "new_mem_id"}
    mock.get_all.return_value = [
        {"memory": "Test memory 1", "id": "mem1"},
        {"memory": "Test memory 2", "id": "mem2"},
    ]
    mock.delete.return_value = {"status": "success"}
    mock.delete_all.return_value = {"status": "success"}
    return mock


@pytest.fixture
def memory_config():
    """Create test memory configuration"""
    return MemoryConfig(
        vector_store_path="./test_db",
        collection_name="test_memories",
        llm_provider="openai",
        llm_model="gpt-4o-mini",
    )


# MemoryClient Tests


class TestMemoryClient:
    """Test Memory Client functionality"""

    @patch("src.memory.memory_client.Memory.from_config")
    def test_client_initialization(self, mock_from_config, memory_config):
        """Test memory client initializes correctly"""
        mock_from_config.return_value = MagicMock()

        client = MemoryClient(memory_config)

        assert client.config == memory_config
        assert client._memory is not None
        mock_from_config.assert_called_once()

    @patch("src.memory.memory_client.Memory.from_config")
    def test_client_initialization_with_defaults(self, mock_from_config):
        """Test memory client initializes with default config"""
        mock_from_config.return_value = MagicMock()

        client = MemoryClient()

        assert client.config is not None
        assert isinstance(client.config, MemoryConfig)
        assert client._memory is not None

    @patch("src.memory.memory_client.Memory.from_config")
    def test_add_memory_success(self, mock_from_config, mock_memory, memory_config):
        """Test adding memories successfully"""
        mock_from_config.return_value = mock_memory

        client = MemoryClient(memory_config)
        messages = [
            {"role": "user", "content": "I love Python"},
            {"role": "assistant", "content": "That's great!"},
        ]

        result = client.add_memory(messages, user_id="test_user")

        assert result["status"] == "success"
        mock_memory.add.assert_called_once_with(messages, user_id="test_user", metadata=None)

    @patch("src.memory.memory_client.Memory.from_config")
    def test_add_memory_with_metadata(self, mock_from_config, mock_memory, memory_config):
        """Test adding memories with metadata"""
        mock_from_config.return_value = mock_memory

        client = MemoryClient(memory_config)
        messages = [{"role": "user", "content": "Test message"}]
        metadata = {"agent_type": "task", "session_id": "123"}

        result = client.add_memory(messages, user_id="test_user", metadata=metadata)

        mock_memory.add.assert_called_once_with(
            messages, user_id="test_user", metadata=metadata
        )

    @patch("src.memory.memory_client.Memory.from_config")
    def test_search_memories_success(self, mock_from_config, mock_memory, memory_config):
        """Test searching memories successfully"""
        mock_from_config.return_value = mock_memory

        client = MemoryClient(memory_config)
        memories = client.search_memories("Python", user_id="test_user", limit=5)

        assert len(memories) == 2
        assert memories[0]["memory"] == "User loves Python programming"
        mock_memory.search.assert_called_once_with(
            query="Python", user_id="test_user", limit=5
        )

    @patch("src.memory.memory_client.Memory.from_config")
    def test_search_memories_empty_results(self, mock_from_config, memory_config):
        """Test searching with no results"""
        mock = MagicMock()
        mock.search.return_value = {"results": []}
        mock_from_config.return_value = mock

        client = MemoryClient(memory_config)
        memories = client.search_memories("nonexistent", user_id="test_user")

        assert memories == []

    @patch("src.memory.memory_client.Memory.from_config")
    def test_search_memories_error_handling(self, mock_from_config, memory_config):
        """Test search error handling"""
        mock = MagicMock()
        mock.search.side_effect = Exception("Search failed")
        mock_from_config.return_value = mock

        client = MemoryClient(memory_config)
        memories = client.search_memories("test", user_id="test_user")

        assert memories == []  # Should return empty list on error

    @patch("src.memory.memory_client.Memory.from_config")
    def test_get_all_memories(self, mock_from_config, mock_memory, memory_config):
        """Test getting all memories for a user"""
        mock_from_config.return_value = mock_memory

        client = MemoryClient(memory_config)
        memories = client.get_all_memories(user_id="test_user")

        assert len(memories) == 2
        mock_memory.get_all.assert_called_once_with(user_id="test_user")

    @patch("src.memory.memory_client.Memory.from_config")
    def test_delete_memory(self, mock_from_config, mock_memory, memory_config):
        """Test deleting a specific memory"""
        mock_from_config.return_value = mock_memory

        client = MemoryClient(memory_config)
        result = client.delete_memory(memory_id="mem123")

        assert result["status"] == "success"
        mock_memory.delete.assert_called_once_with(memory_id="mem123")

    @patch("src.memory.memory_client.Memory.from_config")
    def test_delete_all_memories(self, mock_from_config, mock_memory, memory_config):
        """Test deleting all memories for a user"""
        mock_from_config.return_value = mock_memory

        client = MemoryClient(memory_config)
        result = client.delete_all_memories(user_id="test_user")

        assert result["status"] == "success"
        mock_memory.delete_all.assert_called_once_with(user_id="test_user")

    @patch("src.memory.memory_client.Memory.from_config")
    def test_format_memories_for_prompt(self, mock_from_config, memory_config):
        """Test formatting memories for prompt injection"""
        mock_from_config.return_value = MagicMock()

        client = MemoryClient(memory_config)
        memories = [
            {"memory": "User loves Python"},
            {"memory": "User is building an API"},
        ]

        formatted = client.format_memories_for_prompt(memories)

        assert "Relevant memories from previous conversations:" in formatted
        assert "1. User loves Python" in formatted
        assert "2. User is building an API" in formatted

    @patch("src.memory.memory_client.Memory.from_config")
    def test_format_memories_empty(self, mock_from_config, memory_config):
        """Test formatting empty memories list"""
        mock_from_config.return_value = MagicMock()

        client = MemoryClient(memory_config)
        formatted = client.format_memories_for_prompt([])

        assert formatted == "No relevant memories found."

    def test_operations_without_initialization(self):
        """Test that operations fail gracefully without initialization"""
        # Create client but prevent initialization
        config = MemoryConfig()
        client = MemoryClient.__new__(MemoryClient)
        client.config = config
        client._memory = None

        with pytest.raises(RuntimeError, match="Memory not initialized"):
            client.add_memory([], user_id="test")

        with pytest.raises(RuntimeError, match="Memory not initialized"):
            client.search_memories("test", user_id="test")

        with pytest.raises(RuntimeError, match="Memory not initialized"):
            client.get_all_memories(user_id="test")


# Configuration Tests


class TestMemoryConfig:
    """Test Memory Configuration"""

    def test_default_config(self):
        """Test default configuration values"""
        config = MemoryConfig()

        assert config.llm_provider == "anthropic"
        assert config.llm_model == "claude-3-5-sonnet-20241022"
        assert config.vector_store_provider == "qdrant"
        assert config.vector_store_path == "./memory_db"
        assert config.collection_name == "agent_memories"

    def test_custom_config(self):
        """Test custom configuration"""
        config = MemoryConfig(
            llm_provider="openai",
            llm_model="gpt-4",
            vector_store_path="/custom/path",
            collection_name="custom_memories",
        )

        assert config.llm_provider == "openai"
        assert config.llm_model == "gpt-4"
        assert config.vector_store_path == "/custom/path"
        assert config.collection_name == "custom_memories"


# Integration Simulation Tests


class TestMemoryIntegration:
    """Test memory integration workflow simulations"""

    @patch("src.memory.memory_client.Memory.from_config")
    def test_conversation_memory_workflow(self, mock_from_config, mock_memory):
        """Test complete conversation memory workflow"""
        mock_from_config.return_value = mock_memory

        client = MemoryClient()
        user_id = "test_user"

        # Simulate conversation
        # User says something
        messages1 = [
            {"role": "user", "content": "I'm working on a Python project"},
            {"role": "assistant", "content": "Great! What kind of project?"},
        ]
        client.add_memory(messages1, user_id=user_id)

        # Later, search for context
        memories = client.search_memories("project", user_id=user_id)
        assert len(memories) > 0

        # Format for prompt
        context = client.format_memories_for_prompt(memories)
        assert "Python" in context or "project" in context

    @patch("src.memory.memory_client.Memory.from_config")
    def test_multi_user_isolation(self, mock_from_config):
        """Test that memories are isolated per user"""
        mock = MagicMock()
        mock.search.side_effect = [
            {"results": [{"memory": "User1 data"}]},
            {"results": [{"memory": "User2 data"}]},
        ]
        mock_from_config.return_value = mock

        client = MemoryClient()

        # Search for different users
        mem1 = client.search_memories("data", user_id="user1")
        mem2 = client.search_memories("data", user_id="user2")

        # Should have called search twice with different user_ids
        assert mock.search.call_count == 2
        assert mem1[0]["memory"] == "User1 data"
        assert mem2[0]["memory"] == "User2 data"
