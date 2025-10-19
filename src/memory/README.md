# Memory Layer

Persistent memory system for Proxy Agent Platform using Mem0 with vector storage.

## Overview

The memory layer enables agents to:
- **Remember** user context across sessions
- **Learn** from conversations over time
- **Retrieve** relevant past interactions
- **Build** long-term user understanding

## Quick Start

```python
from src.memory import MemoryClient

# Initialize memory client
memory = MemoryClient()

# Add memories from conversation
messages = [
    {"role": "user", "content": "I'm working on a Python project"},
    {"role": "assistant", "content": "Great! What kind of project?"}
]
memory.add_memory(messages, user_id="user123")

# Search for relevant memories
memories = memory.search_memories(
    "What was I working on?",
    user_id="user123",
    limit=3
)

# Format for agent prompt
context = memory.format_memories_for_prompt(memories)
# Inject context into agent's system prompt
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Memory Client                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Mem0 (Intelligent Memory)                │ │
│  │  - Fact extraction from conversations              │ │
│  │  - Semantic understanding                          │ │
│  │  - Temporal awareness                              │ │
│  └────────────────────────────────────────────────────┘ │
│                         ↓                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │      Qdrant Vector Store (Default)                 │ │
│  │  - Local filesystem storage                        │ │
│  │  - Fast semantic search                            │ │
│  │  - Can switch to Supabase pgvector                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Configuration

### Default (Qdrant Local)

```python
from src.memory import MemoryClient, MemoryConfig

config = MemoryConfig(
    llm_provider="anthropic",
    llm_model="claude-3-5-sonnet-20241022",
    vector_store_provider="qdrant",
    vector_store_path="./memory_db",
    collection_name="agent_memories"
)

memory = MemoryClient(config)
```

### Supabase pgvector (Production)

```python
config = MemoryConfig(
    llm_provider="openai",
    llm_model="gpt-4o-mini",
    vector_store_provider="supabase",
    # Set DATABASE_URL environment variable
)

memory = MemoryClient(config)
```

## API Reference

### MemoryClient

#### `add_memory(messages, user_id, agent_id=None, metadata=None)`

Add new memories from conversation.

**Parameters:**
- `messages`: List of message dicts with 'role' and 'content'
- `user_id`: User identifier for memory isolation
- `agent_id`: Optional agent identifier
- `metadata`: Optional metadata dict

**Returns:** Result dict from Mem0

#### `search_memories(query, user_id, limit=5, agent_id=None)`

Search for relevant memories.

**Parameters:**
- `query`: Search query text
- `user_id`: User identifier
- `limit`: Max number of results
- `agent_id`: Optional agent identifier

**Returns:** List of memory dicts

#### `get_all_memories(user_id)`

Get all memories for a user.

**Returns:** List of all memory dicts

#### `delete_memory(memory_id)`

Delete a specific memory.

#### `delete_all_memories(user_id)`

Delete all memories for a user.

#### `format_memories_for_prompt(memories)`

Format memories for agent prompt injection.

**Returns:** Formatted string for system prompt

## Environment Variables

### Required for LLM Processing

Mem0 uses an LLM to intelligently extract and process memories:

```bash
# For Anthropic Claude
export ANTHROPIC_API_KEY="your-api-key"

# OR for OpenAI
export OPENAI_API_KEY="your-api-key"
```

### Optional for Supabase

```bash
export DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
```

## Testing

### Unit Tests (No API Key Required)

```bash
uv run pytest src/memory/tests/test_memory_client.py -v
```

All tests use mocking - no API keys needed.

### Integration Test (Requires API Key)

```bash
# Set API key first
export ANTHROPIC_API_KEY="your-key"

# Run integration test
uv run python src/memory/test_memory_basic.py
```

## Integration with Agents

```python
from pydantic_ai import Agent
from src.memory import MemoryClient

# Initialize memory
memory = MemoryClient()

# Create agent
agent = Agent("claude-3-5-sonnet-20241022")

async def run_conversation(user_input: str, user_id: str):
    # 1. Retrieve relevant memories
    memories = memory.search_memories(user_input, user_id=user_id, limit=3)
    context = memory.format_memories_for_prompt(memories)

    # 2. Inject into system prompt
    system_prompt = f"""You are a helpful assistant.

{context}

Use the above memories to provide personalized responses."""

    # 3. Run agent with context
    result = await agent.run(user_input, system_prompt=system_prompt)

    # 4. Store new memories
    messages = [
        {"role": "user", "content": user_input},
        {"role": "assistant", "content": result.data}
    ]
    memory.add_memory(messages, user_id=user_id)

    return result.data
```

## Memory Storage

### Qdrant (Default)

- **Location**: `./memory_db/` directory
- **Format**: Local filesystem storage
- **Use Case**: Development, testing, single-instance deployments

### Supabase pgvector (Production)

- **Location**: PostgreSQL database with pgvector extension
- **Format**: Distributed vector storage
- **Use Case**: Production, multi-instance deployments

## Migration from Qdrant to Supabase

```python
# 1. Set up Supabase configuration
export DATABASE_URL="postgresql://..."

# 2. Create new client with Supabase config
from src.memory import MemoryClient, MemoryConfig

config = MemoryConfig(
    vector_store_provider="supabase"
)
new_memory = MemoryClient(config)

# 3. Memories automatically migrate on first use
# (Mem0 handles collection creation)
```

## Best Practices

1. **User Isolation**: Always use unique `user_id` for each user
2. **Search Before Add**: Check existing memories before adding duplicates
3. **Limit Results**: Use appropriate `limit` to avoid context overload
4. **Metadata**: Add metadata for better organization and filtering
5. **Cleanup**: Periodically delete old/irrelevant memories

## Troubleshooting

### "Memory not initialized" Error

**Cause**: API key not set or invalid configuration

**Solution**:
```bash
export ANTHROPIC_API_KEY="your-api-key"
# OR
export OPENAI_API_KEY="your-api-key"
```

### Empty Search Results

**Possible causes**:
1. No memories added yet
2. Query not semantically similar to stored memories
3. Wrong `user_id`

**Solution**: Add more diverse memories and use broader search queries

### Performance Issues

**For large memory stores**:
1. Increase `limit` only when needed
2. Use metadata filters
3. Consider migrating to Supabase for better performance

## Roadmap

- [x] Day 2: Basic Mem0 integration with Qdrant
- [ ] Add Supabase pgvector support
- [ ] Memory importance scoring
- [ ] Automatic memory consolidation
- [ ] Memory expiration policies
- [ ] Multi-agent memory sharing
- [ ] Memory analytics dashboard

## Credits

Adapted from [Ottomator Agents](https://github.com/coleam00/ottomator-agents) Mem0 integration pattern.
