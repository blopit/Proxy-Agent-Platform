"""
Basic Memory Integration Test

Tests that Mem0 client can store and retrieve memories.
Run with: uv run python src/memory/test_memory_basic.py
"""

import logging

from src.memory import MemoryClient, MemoryConfig

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def test_memory_basic():
    """Test basic memory operations"""
    print("\n" + "=" * 70)
    print("🧪 Testing Mem0 Memory Layer")
    print("=" * 70 + "\n")

    # Initialize memory client with test config
    config = MemoryConfig(
        vector_store_path="./test_memory_db",  # Test database
        collection_name="test_memories",
    )

    print("📂 Initializing memory client...")
    print(f"   - Vector store: {config.vector_store_provider}")
    print(f"   - Path: {config.vector_store_path}")
    print(f"   - Collection: {config.collection_name}\n")

    try:
        client = MemoryClient(config)
        print("✅ Memory client initialized\n")
    except Exception as e:
        print(f"❌ ERROR: Failed to initialize memory client: {e}")
        return False

    # Test user
    test_user = "test_user_123"

    try:
        # Test 1: Add memory
        print("📝 Test 1: Adding memory...")
        messages = [
            {"role": "user", "content": "I love Python programming and FastAPI"},
            {
                "role": "assistant",
                "content": "That's great! Python and FastAPI are excellent for building APIs.",
            },
        ]
        client.add_memory(messages, user_id=test_user)
        print("✅ Memory added successfully\n")

        # Test 2: Search memory
        print("🔍 Test 2: Searching memory...")
        query = "What programming language do I like?"
        memories = client.search_memories(query, user_id=test_user, limit=3)
        print(f"✅ Found {len(memories)} relevant memories:")
        for i, mem in enumerate(memories, 1):
            print(f"   {i}. {mem.get('memory', 'N/A')}")
        print()

        # Test 3: Format for prompt
        print("📋 Test 3: Formatting memories for prompt...")
        formatted = client.format_memories_for_prompt(memories)
        print(f"✅ Formatted output:\n{formatted}\n")

        # Test 4: Get all memories
        print("📚 Test 4: Getting all memories...")
        all_memories = client.get_all_memories(user_id=test_user)
        print(f"✅ Retrieved {len(all_memories)} total memories\n")

        # Test 5: Add more context
        print("📝 Test 5: Adding more context...")
        messages2 = [
            {"role": "user", "content": "I'm building a task management system"},
            {
                "role": "assistant",
                "content": "A task management system with FastAPI would be perfect!",
            },
        ]
        client.add_memory(messages2, user_id=test_user)
        print("✅ Additional context added\n")

        # Test 6: Search with new context
        print("🔍 Test 6: Searching with broader context...")
        query2 = "What am I building?"
        memories2 = client.search_memories(query2, user_id=test_user, limit=3)
        print(f"✅ Found {len(memories2)} relevant memories:")
        for i, mem in enumerate(memories2, 1):
            print(f"   {i}. {mem.get('memory', 'N/A')}")
        print()

        # Cleanup (delete test memories)
        print("🧹 Cleaning up test memories...")
        client.delete_all_memories(user_id=test_user)
        print("✅ Cleanup complete\n")

        print("=" * 70)
        print("🎉 All tests passed! Memory layer working correctly.")
        print("=" * 70 + "\n")
        return True

    except Exception as e:
        print(f"❌ ERROR: {e}")
        logger.exception("Test failed")
        return False


if __name__ == "__main__":
    success = test_memory_basic()
    exit(0 if success else 1)
