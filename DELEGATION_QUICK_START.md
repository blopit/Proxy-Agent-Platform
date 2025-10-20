# Agent-to-Agent Delegation - Quick Start Guide

**5-Minute Guide to Using Delegation**

---

## ⚡ Quick Reference

### Create Agent with Delegation

```python
from src.agents import UnifiedAgent

agent = await UnifiedAgent.create(
    "task",
    enable_delegation=True,  # Enable delegation
    enable_memory=True,      # Optional: track history
    enable_mcp=True,         # Optional: MCP tools
)
```

### Delegate a Task

```python
# Simple delegation
result = await agent.delegate(
    task_note="Draft email to alex@company.com about delay",
    user_id="user_123",
)

# Check result
if result.success:
    print(f"✅ Success: {result.reasoning}")
    print(f"Agent used: {result.tool_agent_type}")
else:
    print(f"❌ Failed: {result.error}")
```

### Auto-Delegate Decision

```python
user_message = "Draft email to customer"

if agent.should_delegate(user_message):
    # Delegate to specialized Tool Agent
    result = await agent.delegate(user_message, user_id="user_123")
else:
    # Handle directly with main agent
    result = await agent.run(user_message, user_id="user_123")
```

---

## 🎯 What Gets Delegated?

### ✅ Delegates to Tool Agents:
- "Draft email to alex@company.com"
- "Send message to team"
- "Format data as JSON"
- "Schedule meeting for tomorrow"
- "Convert CSV to JSON"
- "Extract data from file"

### ❌ Handles Directly:
- "Create a task for project planning"
- "What's my schedule?"
- "Tell me about this project"

---

## 📊 Check Statistics

```python
stats = agent.get_delegation_stats()

print(f"Total: {stats['total_delegations']}")
print(f"By type: {stats['delegations_by_type']}")
print(f"Success rate: {stats['dispatcher_stats']['success_rate']}")
```

---

## 🧪 Test It

### Run Validation:
```bash
./venv_linux/bin/python validate_delegation.py
```

### Run Unit Tests:
```bash
./venv_linux/bin/pytest tests/test_delegation_infrastructure.py -v
```

### Run Integration Test:
```bash
./venv_linux/bin/python test_delegation.py
```

---

## 🚧 Current Limitations

**Tool Agent execution is stubbed** - always returns success with mock data.

**Next step**: Implement real Tool Agents (EmailToolAgent, FormatToolAgent, etc.)

See [AGENT_INTEGRATION_PLAN.md](AGENT_INTEGRATION_PLAN.md) Phase 2 for details.

---

## 📚 Full Documentation

- [DELEGATION_IMPLEMENTATION_SUMMARY.md](DELEGATION_IMPLEMENTATION_SUMMARY.md) - Complete implementation details
- [AGENT_INTEGRATION_PLAN.md](AGENT_INTEGRATION_PLAN.md) - Full integration roadmap
- [reports/archive/2025-01-20/completed/AGENT_TO_AGENT_COMMUNICATION.md](reports/archive/2025-01-20/completed/AGENT_TO_AGENT_COMMUNICATION.md) - Original design spec

---

**Status**: Phase 1 Complete ✅
**Ready**: Delegation infrastructure working
**Next**: Add real Tool Agents (Phase 2)
