"""
Memory Layer for Proxy Agent Platform

Provides persistent memory across conversations using Mem0 with vector storage.

Usage:
    from src.memory import MemoryClient, MemoryConfig

    memory_client = MemoryClient()
    memory_client.add_memory(messages, user_id="user123")
    memories = memory_client.search_memories("query", user_id="user123")
"""

from src.memory.memory_client import MemoryClient, MemoryConfig

__all__ = ["MemoryClient", "MemoryConfig"]
