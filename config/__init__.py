"""
Agent Configuration System

YAML-based agent configuration with Pydantic validation.

Usage:
    from config import load_agent_config, get_config_loader

    # Load single config
    task_config = load_agent_config("task")
    prompt = task_config.render_system_prompt(user_name="Alice")

    # Load all configs
    loader = get_config_loader()
    all_configs = loader.load_all_configs()
"""

from config.config_loader import (
    ConfigLoader,
    get_config_loader,
    load_agent_config,
)
from config.agent_config_schema import (
    AgentConfig,
    AgentType,
    ModelProvider,
    MemoryConfig,
    BehaviorConfig,
    SystemPromptConfig,
    ToolConfig,
    MCPServerConfig,
)

__all__ = [
    # Loader
    "ConfigLoader",
    "get_config_loader",
    "load_agent_config",
    # Schema
    "AgentConfig",
    "AgentType",
    "ModelProvider",
    "MemoryConfig",
    "BehaviorConfig",
    "SystemPromptConfig",
    "ToolConfig",
    "MCPServerConfig",
]
