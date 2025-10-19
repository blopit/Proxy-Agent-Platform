"""
Agent Configuration Schema

Defines the Pydantic models for agent configuration validation.
Supports YAML-based agent definitions with full type safety.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Any, Literal
from enum import Enum


class ModelProvider(str, Enum):
    """Supported LLM providers"""

    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    OLLAMA = "ollama"
    GEMINI = "gemini"


class AgentType(str, Enum):
    """Agent type categories"""

    TASK = "task"
    FOCUS = "focus"
    ENERGY = "energy"
    PROGRESS = "progress"
    GAMIFICATION = "gamification"
    UNIFIED = "unified"  # New unified agent


class MemoryConfig(BaseModel):
    """Memory configuration for an agent"""

    enabled: bool = Field(default=True, description="Enable memory for this agent")
    user_scoped: bool = Field(default=True, description="Scope memories per user")
    search_limit: int = Field(default=5, description="Max memories to retrieve", ge=1, le=20)
    auto_save: bool = Field(default=True, description="Automatically save conversations")


class MCPServerConfig(BaseModel):
    """Configuration for a single MCP server"""

    name: str = Field(description="Server identifier")
    command: str = Field(description="Command to run (e.g., 'npx')")
    args: list[str] = Field(description="Command arguments")
    env: dict[str, str] = Field(default_factory=dict, description="Environment variables")


class ToolConfig(BaseModel):
    """Tool configuration"""

    name: str = Field(description="Tool name or identifier")
    enabled: bool = Field(default=True, description="Whether tool is enabled")
    config: dict[str, Any] = Field(default_factory=dict, description="Tool-specific config")


class BehaviorConfig(BaseModel):
    """Agent behavior settings"""

    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="Model temperature")
    max_tokens: int | None = Field(default=None, description="Max response tokens", ge=1)
    top_p: float | None = Field(default=None, ge=0.0, le=1.0, description="Top-p sampling")
    streaming: bool = Field(default=False, description="Enable streaming responses")
    timeout: int = Field(default=30, ge=1, description="Request timeout in seconds")


class SystemPromptConfig(BaseModel):
    """System prompt configuration"""

    template: str = Field(description="Prompt template with {variables}")
    variables: dict[str, Any] = Field(
        default_factory=dict, description="Default variable values"
    )
    inject_memory: bool = Field(default=True, description="Inject memory context")
    inject_time: bool = Field(default=True, description="Inject current time")


class AgentConfig(BaseModel):
    """Complete agent configuration"""

    # Identity
    name: str = Field(description="Agent display name")
    type: AgentType = Field(description="Agent type category")
    description: str = Field(description="Agent description for users")
    version: str = Field(default="1.0.0", description="Config version")

    # Model Configuration
    model_provider: ModelProvider = Field(description="LLM provider to use")
    model_name: str = Field(description="Specific model name")

    # System Prompt
    system_prompt: SystemPromptConfig = Field(description="System prompt configuration")

    # Tools & MCP
    tools: list[ToolConfig] = Field(default_factory=list, description="Agent tools")
    mcp_servers: list[MCPServerConfig] = Field(
        default_factory=list, description="MCP servers to connect"
    )

    # Memory
    memory: MemoryConfig = Field(
        default_factory=MemoryConfig, description="Memory configuration"
    )

    # Behavior
    behavior: BehaviorConfig = Field(
        default_factory=BehaviorConfig, description="Behavior settings"
    )

    # Capabilities
    capabilities: list[str] = Field(
        default_factory=list,
        description="Agent capabilities (e.g., 'task_creation', 'prioritization')",
    )

    # Metadata
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )

    @field_validator("system_prompt")
    @classmethod
    def validate_prompt_template(cls, v: SystemPromptConfig) -> SystemPromptConfig:
        """Ensure prompt template is not empty"""
        if not v.template.strip():
            raise ValueError("System prompt template cannot be empty")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Ensure name is valid"""
        if not v.strip():
            raise ValueError("Agent name cannot be empty")
        return v.strip()

    def render_system_prompt(self, **kwargs: Any) -> str:
        """
        Render the system prompt with variables.

        Args:
            **kwargs: Additional variables to override defaults

        Returns:
            Rendered system prompt
        """
        # Merge default variables with provided kwargs
        variables = {**self.system_prompt.variables, **kwargs}

        # Add automatic injections
        if self.system_prompt.inject_time:
            from datetime import datetime

            variables.setdefault("current_time", datetime.now().strftime("%Y-%m-%d %H:%M"))

        # Render template
        try:
            return self.system_prompt.template.format(**variables)
        except KeyError as e:
            raise ValueError(f"Missing variable in system prompt: {e}")

    def get_enabled_tools(self) -> list[str]:
        """Get list of enabled tool names."""
        return [tool.name for tool in self.tools if tool.enabled]

    def get_mcp_config(self) -> dict[str, dict[str, Any]]:
        """
        Get MCP configuration in the format expected by MCPClient.

        Returns:
            Dict compatible with mcp_config.json format
        """
        if not self.mcp_servers:
            return {"mcpServers": {}}

        servers = {}
        for server in self.mcp_servers:
            servers[server.name] = {
                "command": server.command,
                "args": server.args,
                "env": server.env,
            }

        return {"mcpServers": servers}
