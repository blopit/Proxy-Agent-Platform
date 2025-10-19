"""
Memory Layer for Proxy Agent Platform

Provides persistent memory across conversations using Mem0 with vector storage.
Adapted from: github.com/coleam00/ottomator-agents/mem0-agent

This module enables agents to:
- Store conversation context persistently
- Retrieve relevant memories for context injection
- Build long-term user understanding
- Maintain cross-session knowledge
"""

from mem0 import Memory
from typing import Any, Optional
from pydantic import BaseModel, Field
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class MemoryConfig(BaseModel):
    """Configuration for Mem0 memory system."""

    llm_provider: str = Field(default="anthropic", description="LLM provider for memory processing")
    llm_model: str = Field(default="claude-3-5-sonnet-20241022", description="LLM model name")
    vector_store_provider: str = Field(default="qdrant", description="Vector store provider")
    vector_store_path: str = Field(default="./memory_db", description="Path for vector storage")
    collection_name: str = Field(default="agent_memories", description="Collection name for memories")


class MemoryClient:
    """
    Client for managing agent memories using Mem0.

    Provides methods to add, search, and manage memories across sessions.

    Usage:
        memory_client = MemoryClient()
        memory_client.add_memory(messages, user_id="user123")
        memories = memory_client.search_memories("what did I say about X?", user_id="user123")
    """

    def __init__(self, config: Optional[MemoryConfig] = None) -> None:
        """
        Initialize memory client.

        Args:
            config: Memory configuration. Uses default if not provided.
        """
        self.config = config or MemoryConfig()
        self._memory: Optional[Memory] = None
        self._initialize()

    def _initialize(self) -> None:
        """Initialize Mem0 memory instance with configuration."""
        # Start with basic config
        mem0_config: dict[str, Any] = {
            "vector_store": {
                "provider": self.config.vector_store_provider,
                "config": {
                    "collection_name": self.config.collection_name,
                    "path": self.config.vector_store_path,
                },
            },
        }

        # Add LLM config only if API key is available
        api_key = None
        if self.config.llm_provider == "anthropic":
            api_key = os.getenv("ANTHROPIC_API_KEY")
        elif self.config.llm_provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")

        if api_key:
            mem0_config["llm"] = {
                "provider": self.config.llm_provider,
                "config": {
                    "model": self.config.llm_model,
                    "api_key": api_key,
                },
            }
            logger.info(f"LLM provider configured: {self.config.llm_provider}")
        else:
            logger.warning(
                f"No API key found for {self.config.llm_provider}. "
                "Memory will use default embeddings only (no intelligent extraction)."
            )

        try:
            self._memory = Memory.from_config(mem0_config)
            logger.info(
                f"Memory initialized with {self.config.vector_store_provider} "
                f"at {self.config.vector_store_path}"
            )
        except Exception as e:
            logger.error(f"Failed to initialize memory: {e}")
            raise

    def add_memory(
        self,
        messages: list[dict[str, str]],
        user_id: str,
        agent_id: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """
        Add new memories from conversation messages.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            user_id: User identifier for memory isolation
            agent_id: Optional agent identifier
            metadata: Optional metadata to attach to memories

        Returns:
            Result dict from Mem0

        Example:
            messages = [
                {"role": "user", "content": "I love Python programming"},
                {"role": "assistant", "content": "That's great! Python is very versatile"}
            ]
            result = memory_client.add_memory(messages, user_id="user123")
        """
        if not self._memory:
            raise RuntimeError("Memory not initialized")

        try:
            result = self._memory.add(messages, user_id=user_id, metadata=metadata)
            logger.debug(f"Added memories for user {user_id}: {result}")
            return result
        except Exception as e:
            logger.error(f"Error adding memory for user {user_id}: {e}")
            raise

    def search_memories(
        self, query: str, user_id: str, limit: int = 5, agent_id: Optional[str] = None
    ) -> list[dict[str, Any]]:
        """
        Search for relevant memories based on query.

        Args:
            query: Search query text
            user_id: User identifier for memory isolation
            limit: Maximum number of memories to return
            agent_id: Optional agent identifier

        Returns:
            List of memory dicts with 'memory' and other fields

        Example:
            memories = memory_client.search_memories(
                "what did I say about Python?",
                user_id="user123",
                limit=3
            )
            for mem in memories:
                print(mem['memory'])
        """
        if not self._memory:
            raise RuntimeError("Memory not initialized")

        try:
            result = self._memory.search(query=query, user_id=user_id, limit=limit)
            memories = result.get("results", [])
            logger.debug(f"Found {len(memories)} memories for user {user_id}")
            return memories
        except Exception as e:
            logger.error(f"Error searching memories for user {user_id}: {e}")
            return []

    def get_all_memories(self, user_id: str) -> list[dict[str, Any]]:
        """
        Get all memories for a user.

        Args:
            user_id: User identifier

        Returns:
            List of all memory dicts for the user
        """
        if not self._memory:
            raise RuntimeError("Memory not initialized")

        try:
            result = self._memory.get_all(user_id=user_id)
            memories = result if isinstance(result, list) else result.get("results", [])
            logger.debug(f"Retrieved {len(memories)} memories for user {user_id}")
            return memories
        except Exception as e:
            logger.error(f"Error getting all memories for user {user_id}: {e}")
            return []

    def delete_memory(self, memory_id: str) -> dict[str, Any]:
        """
        Delete a specific memory by ID.

        Args:
            memory_id: Memory identifier to delete

        Returns:
            Result dict from Mem0
        """
        if not self._memory:
            raise RuntimeError("Memory not initialized")

        try:
            result = self._memory.delete(memory_id=memory_id)
            logger.info(f"Deleted memory {memory_id}")
            return result
        except Exception as e:
            logger.error(f"Error deleting memory {memory_id}: {e}")
            raise

    def delete_all_memories(self, user_id: str) -> dict[str, Any]:
        """
        Delete all memories for a user.

        Args:
            user_id: User identifier

        Returns:
            Result dict from Mem0
        """
        if not self._memory:
            raise RuntimeError("Memory not initialized")

        try:
            result = self._memory.delete_all(user_id=user_id)
            logger.info(f"Deleted all memories for user {user_id}")
            return result
        except Exception as e:
            logger.error(f"Error deleting all memories for user {user_id}: {e}")
            raise

    def format_memories_for_prompt(self, memories: list[dict[str, Any]]) -> str:
        """
        Format memories for injection into agent prompt.

        Args:
            memories: List of memory dicts from search

        Returns:
            Formatted string for prompt injection

        Example:
            memories = memory_client.search_memories("topic", user_id="user123")
            context = memory_client.format_memories_for_prompt(memories)
            # Use context in agent system prompt
        """
        if not memories:
            return "No relevant memories found."

        formatted = "Relevant memories from previous conversations:\n"
        for i, memory in enumerate(memories, 1):
            mem_text = memory.get("memory", "")
            formatted += f"{i}. {mem_text}\n"

        return formatted.strip()
