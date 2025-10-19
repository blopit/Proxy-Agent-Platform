# Agent Configuration System

YAML-based agent configuration with Pydantic validation for the Proxy Agent Platform.

## Overview

The configuration system enables **declarative agent definitions** without code changes:
- **YAML configs** define agent behavior, prompts, tools, and settings
- **Pydantic validation** ensures type safety and correctness
- **Dynamic loading** allows runtime configuration changes
- **Template system** for flexible system prompts
- **MCP integration** for external tool configuration

## Quick Start

```python
from config import load_agent_config

# Load agent configuration
task_config = load_agent_config("task")

# Render system prompt with variables
prompt = task_config.render_system_prompt(
    user_name="Alice",
    current_time="2025-01-15 14:30"
)

# Get enabled tools
tools = task_config.get_enabled_tools()
# ['task_repository', 'project_repository']

# Get MCP configuration
mcp_config = task_config.get_mcp_config()
```

## Configuration Schema

### Agent Identity
```yaml
name: "Intelligent Task Agent"
type: "task"  # task, focus, energy, progress, gamification, unified
description: "AI-powered task management..."
version: "1.0.0"
```

### Model Configuration
```yaml
model_provider: "anthropic"  # anthropic, openai, ollama, gemini
model_name: "claude-3-5-sonnet-20241022"
```

### System Prompt
```yaml
system_prompt:
  template: |
    You are an expert in {domain}.

    Current user: {user_name}
    Time: {current_time}

    Your capabilities include...

  variables:
    domain: "productivity"
    user_name: "User"

  inject_memory: true   # Inject memory context automatically
  inject_time: true     # Inject current time automatically
```

### Tools
```yaml
tools:
  - name: "task_repository"
    enabled: true
    config:
      auto_save: true

  - name: "analytics_engine"
    enabled: true
    config:
      cache_duration: 300  # seconds
```

### MCP Servers
```yaml
mcp_servers:
  - name: "filesystem"
    command: "npx"
    args:
      - "-y"
      - "@modelcontextprotocol/server-filesystem"
      - "/path/to/workspace"
    env:
      KEY: "value"
```

### Memory Configuration
```yaml
memory:
  enabled: true          # Enable persistent memory
  user_scoped: true      # Scope memories per user
  search_limit: 5        # Max memories to retrieve
  auto_save: true        # Auto-save conversations
```

### Behavior Settings
```yaml
behavior:
  temperature: 0.7       # Model temperature (0.0-2.0)
  max_tokens: 2000       # Max response tokens
  top_p: null            # Top-p sampling
  streaming: false       # Enable streaming
  timeout: 30            # Request timeout (seconds)
```

### Capabilities
```yaml
capabilities:
  - "task_creation"
  - "task_prioritization"
  - "duration_estimation"
```

### Metadata
```yaml
metadata:
  category: "productivity"
  requires_auth: true
  rate_limit: 100  # requests per hour
```

## Available Configurations

### 1. Task Agent (`task.yaml`)
- **Purpose**: Intelligent task management
- **Capabilities**: Creation, prioritization, breakdown, estimation
- **Tools**: task_repository, project_repository
- **MCP**: filesystem

### 2. Focus Agent (`focus.yaml`)
- **Purpose**: Distraction management and focus optimization
- **Capabilities**: Pomodoro, distraction tracking, environment optimization
- **Tools**: pomodoro_timer, distraction_tracker

### 3. Energy Agent (`energy.yaml`)
- **Purpose**: Energy tracking and wellness optimization
- **Capabilities**: Pattern recognition, task-energy matching, burnout prevention
- **Tools**: energy_tracker, wellness_logger

### 4. Progress Agent (`progress.yaml`)
- **Purpose**: Progress tracking and analytics
- **Capabilities**: Trend analysis, milestone management, reporting
- **Tools**: analytics_engine, milestone_tracker, trend_analyzer

### 5. Gamification Agent (`gamification.yaml`)
- **Purpose**: Achievement system and engagement
- **Capabilities**: XP calculation, achievements, leaderboards, streaks
- **Tools**: xp_calculator, achievement_tracker, leaderboard_manager, badge_system

## API Reference

### ConfigLoader

#### `load_config(agent_type)`
Load configuration for a specific agent.

```python
config = loader.load_config("task")
```

#### `load_all_configs()`
Load all agent configurations.

```python
configs = loader.load_all_configs()
# {'task': AgentConfig(...), 'focus': AgentConfig(...), ...}
```

#### `save_config(config, agent_type)`
Save configuration to YAML file.

```python
loader.save_config(task_config, "task")
```

#### `validate_config_file(config_file)`
Validate a config file without loading.

```python
is_valid, error = loader.validate_config_file("config/agents/task.yaml")
```

#### `list_available_configs()`
List all available configuration files.

```python
configs = loader.list_available_configs()
# ['task', 'focus', 'energy', 'progress', 'gamification']
```

### AgentConfig

#### `render_system_prompt(**kwargs)`
Render system prompt with variables.

```python
prompt = config.render_system_prompt(
    user_name="Alice",
    energy_level=8
)
```

#### `get_enabled_tools()`
Get list of enabled tool names.

```python
tools = config.get_enabled_tools()
```

#### `get_mcp_config()`
Get MCP configuration for MCPClient.

```python
mcp_config = config.get_mcp_config()
```

## Usage Examples

### Load and Use Agent Config

```python
from config import load_agent_config

# Load configuration
task_config = load_agent_config("task")

# Render prompt with user context
system_prompt = task_config.render_system_prompt(
    user_name="Alice",
    current_time="2025-01-15 14:30"
)

# Create Pydantic AI agent with config
from pydantic_ai import Agent

agent = Agent(
    task_config.model_name,
    system_prompt=system_prompt
)

# Use agent
result = await agent.run("Create a task for project planning")
```

### Load All Configs for Multi-Agent System

```python
from config import get_config_loader

loader = get_config_loader()
all_configs = loader.load_all_configs()

# Create agents for each type
agents = {}
for agent_type, config in all_configs.items():
    prompt = config.render_system_prompt(user_name="Alice")
    agents[agent_type] = Agent(config.model_name, system_prompt=prompt)

# Route to appropriate agent
response = await agents["task"].run("Add a new task")
```

### Dynamic Configuration Changes

```python
from config import load_agent_config

# Load config
config = load_agent_config("task")

# Modify settings
config.behavior.temperature = 0.9
config.memory.search_limit = 10

# Save updated config
loader = get_config_loader()
loader.save_config(config, "task")
```

### Create New Agent Configuration

```python
from config import AgentConfig, AgentType, ModelProvider

new_config = AgentConfig(
    name="Custom Agent",
    type=AgentType.UNIFIED,
    description="A custom unified agent",
    model_provider=ModelProvider.ANTHROPIC,
    model_name="claude-3-5-sonnet-20241022",
    system_prompt={
        "template": "You are a helpful assistant.",
        "variables": {},
        "inject_memory": True,
        "inject_time": True
    }
)

# Save to file
loader = get_config_loader()
loader.save_config(new_config, "custom")
```

## Validation

The system provides comprehensive validation:

### Type Validation
```python
# Pydantic ensures correct types
config = AgentConfig(
    temperature=0.7,       # ✅ float
    temperature="high"     # ❌ ValueError
)
```

### Range Validation
```python
behavior = BehaviorConfig(
    temperature=0.7,   # ✅ Valid (0.0-2.0)
    temperature=3.0    # ❌ ValueError: must be ≤ 2.0
)
```

### Enum Validation
```python
config = AgentConfig(
    model_provider="anthropic",  # ✅ Valid enum value
    model_provider="invalid"     # ❌ ValueError
)
```

### Template Validation
```python
# Missing variables detected at render time
prompt = config.render_system_prompt()  # ❌ KeyError if variables missing
```

## Testing

### Unit Tests (Future)
```bash
uv run pytest config/tests/test_config_loader.py -v
```

### Integration Test
```bash
uv run python config/test_config_basic.py
```

Expected output:
```
🎉 All configuration tests passed!
   - 5 agent configurations loaded
   - All prompts render correctly
   - All validations passed
```

## File Structure

```
config/
├── __init__.py              # Module exports
├── README.md                # This file
├── agent_config_schema.py   # Pydantic models
├── config_loader.py         # YAML loader
├── test_config_basic.py     # Integration test
└── agents/                  # Agent configurations
    ├── task.yaml
    ├── focus.yaml
    ├── energy.yaml
    ├── progress.yaml
    └── gamification.yaml
```

## Best Practices

### 1. Use Templates for Dynamic Content
```yaml
system_prompt:
  template: |
    Current user: {user_name}
    Context: {user_context}
```

### 2. Scope Memory Per User
```yaml
memory:
  enabled: true
  user_scoped: true  # Essential for multi-user systems
```

### 3. Set Appropriate Timeouts
```yaml
behavior:
  timeout: 30  # Balance between responsiveness and complex tasks
```

### 4. Version Your Configs
```yaml
version: "1.0.0"  # Track config changes
```

### 5. Document Capabilities
```yaml
capabilities:
  - "task_creation"      # Clear capability listing
  - "task_prioritization"
```

## Migration Guide

### From Hardcoded Agents to Config-Based

**Before:**
```python
class TaskAgent:
    def __init__(self):
        self.model = "claude-3-5-sonnet-20241022"
        self.temperature = 0.7
        self.system_prompt = "You are a task agent..."
```

**After:**
```yaml
# config/agents/task.yaml
name: "Task Agent"
model_provider: "anthropic"
model_name: "claude-3-5-sonnet-20241022"
behavior:
  temperature: 0.7
system_prompt:
  template: "You are a task agent..."
```

```python
# Python code
config = load_agent_config("task")
agent = Agent(config.model_name, system_prompt=config.render_system_prompt())
```

## Roadmap

- [x] Day 3: YAML configuration system with Pydantic validation
- [ ] Configuration hot-reloading
- [ ] Configuration versioning and migration
- [ ] A/B testing support
- [ ] Configuration UI/dashboard
- [ ] Multi-environment configs (dev/staging/prod)
- [ ] Configuration templates and inheritance

## Credits

Inspired by configuration-driven development patterns from Ottomator Agents.
