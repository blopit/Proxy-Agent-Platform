"""
Unified Agent - Configuration-Driven Agent with MCP and Memory

The Unified Agent combines three core systems:
1. Configuration System - YAML-based agent definitions
2. MCP Integration - Dynamic tool discovery
3. Memory Layer - Persistent conversation context

This single agent class can act as ANY agent type by loading different configurations.
No more separate agent classes - just different YAML configs.

Usage:
    # Create task agent
    agent = await UnifiedAgent.create("task")
    response = await agent.run("Create a task for project planning", user_id="alice")

    # Create focus agent
    agent = await UnifiedAgent.create("focus")
    response = await agent.run("Start a Pomodoro session", user_id="alice")
"""

import logging
from typing import Any

from pydantic_ai import Agent

from config import AgentConfig, load_agent_config
from src.mcp import MCPClient
from src.memory import MemoryClient

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class UnifiedAgent:
    """
    Unified Agent that combines configuration, MCP tools, and memory.

    Features:
    - Loads behavior from YAML configuration
    - Discovers tools dynamically via MCP
    - Maintains conversation memory
    - Injects context automatically

    Example:
        # Create and use agent
        agent = await UnifiedAgent.create("task")
        result = await agent.run(
            "Create a task for code review",
            user_id="alice",
            user_name="Alice"
        )
        print(result.data)
    """

    def __init__(
        self,
        config: AgentConfig,
        agent: Agent,
        mcp_client: MCPClient | None = None,
        memory_client: MemoryClient | None = None,
    ) -> None:
        """
        Initialize unified agent (use create() class method instead).

        Args:
            config: Agent configuration
            agent: Pydantic AI agent instance
            mcp_client: Optional MCP client for tools
            memory_client: Optional memory client
        """
        self.config = config
        self.agent = agent
        self.mcp_client = mcp_client
        self.memory_client = memory_client

        logger.info(f"Unified agent initialized: {config.name} ({config.type.value})")

    @classmethod
    async def create(
        cls,
        agent_type: str,
        enable_mcp: bool = True,
        enable_memory: bool = True,
        config_override: dict[str, Any] | None = None,
    ) -> "UnifiedAgent":
        """
        Create a unified agent from configuration.

        Args:
            agent_type: Agent type to load (e.g., "task", "focus")
            enable_mcp: Whether to enable MCP tool discovery
            enable_memory: Whether to enable memory
            config_override: Optional config overrides

        Returns:
            Initialized UnifiedAgent instance

        Example:
            agent = await UnifiedAgent.create("task")
            result = await agent.run("Create task", user_id="alice")
        """
        logger.info(f"Creating unified agent: {agent_type}")

        # Load configuration
        config = load_agent_config(agent_type)
        logger.debug(f"Loaded config: {config.name}")

        # Apply overrides if provided
        if config_override:
            for key, value in config_override.items():
                if hasattr(config, key):
                    setattr(config, key, value)

        # Initialize MCP client if enabled and configured
        mcp_client = None
        mcp_tools = []
        if enable_mcp and config.mcp_servers:
            try:
                logger.info(f"Initializing MCP with {len(config.mcp_servers)} servers")
                mcp_client = MCPClient()

                # Write MCP config to temporary file
                import json
                import tempfile
                from pathlib import Path

                mcp_config = config.get_mcp_config()
                with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
                    json.dump(mcp_config, f)
                    mcp_config_path = Path(f.name)

                # Load and start MCP servers
                mcp_client.load_servers(mcp_config_path)
                mcp_tools = await mcp_client.start()
                logger.info(f"MCP initialized with {len(mcp_tools)} tools")

                # Clean up temp file
                mcp_config_path.unlink()

            except Exception as e:
                logger.error(f"Failed to initialize MCP: {e}")
                # Continue without MCP tools

        # Initialize memory client if enabled
        memory_client = None
        if enable_memory and config.memory.enabled:
            try:
                from src.memory import MemoryConfig as MemConfig

                mem_config = MemConfig(
                    vector_store_path=f"./memory_db/{agent_type}",
                    collection_name=f"{agent_type}_memories",
                )
                memory_client = MemoryClient(mem_config)
                logger.info("Memory client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize memory: {e}")
                # Continue without memory

        # Get model name
        model_name = cls._get_model_name(config)

        # Create Pydantic AI agent with tools
        # System prompt will be rendered dynamically in run()
        pydantic_agent = Agent(
            model_name,
            tools=mcp_tools if mcp_tools else [],
        )

        logger.info(f"Pydantic AI agent created: {model_name}, {len(mcp_tools)} tools")

        return cls(
            config=config,
            agent=pydantic_agent,
            mcp_client=mcp_client,
            memory_client=memory_client,
        )

    @staticmethod
    def _get_model_name(config: AgentConfig) -> str:
        """
        Get Pydantic AI model name from config.

        Args:
            config: Agent configuration

        Returns:
            Model name compatible with Pydantic AI

        Raises:
            ValueError: If provider/model combination is unsupported
        """
        provider = config.model_provider.value
        model = config.model_name

        # Map to Pydantic AI model names with provider prefix
        if provider == "anthropic":
            return f"anthropic:{model}"
        elif provider == "openai":
            return f"openai:{model}"
        elif provider == "gemini":
            return f"gemini:{model}"
        elif provider == "ollama":
            return f"ollama:{model}"
        else:
            raise ValueError(f"Unsupported model provider: {provider}")

    async def run(
        self,
        user_message: str,
        user_id: str,
        **context_vars: Any,
    ) -> Any:
        """
        Run the agent with a user message.

        Args:
            user_message: User's input message
            user_id: User identifier for memory
            **context_vars: Additional context variables for prompt

        Returns:
            Agent response

        Example:
            result = await agent.run(
                "Create a task for code review",
                user_id="alice",
                user_name="Alice",
                energy_level=8
            )
        """
        # Retrieve relevant memories if enabled
        memory_context = ""
        if self.memory_client and self.config.memory.enabled:
            try:
                memories = self.memory_client.search_memories(
                    query=user_message,
                    user_id=user_id,
                    limit=self.config.memory.search_limit,
                )
                if memories:
                    memory_context = self.memory_client.format_memories_for_prompt(memories)
                    logger.debug(f"Retrieved {len(memories)} memories for context")
            except Exception as e:
                logger.error(f"Error retrieving memories: {e}")

        # Render system prompt with context
        try:
            system_prompt = self.config.render_system_prompt(**context_vars)

            # Inject memory context if available
            if memory_context and self.config.system_prompt.inject_memory:
                system_prompt = f"{system_prompt}\n\n{memory_context}"

        except Exception as e:
            logger.error(f"Error rendering system prompt: {e}")
            system_prompt = self.config.system_prompt.template

        logger.debug(f"System prompt: {len(system_prompt)} chars")

        # Run agent
        try:
            result = await self.agent.run(
                user_message,
                model_settings={
                    "temperature": self.config.behavior.temperature,
                    "max_tokens": self.config.behavior.max_tokens,
                },
                system_prompt=system_prompt,
            )

            # Save conversation to memory if enabled
            if self.memory_client and self.config.memory.enabled and self.config.memory.auto_save:
                try:
                    messages = [
                        {"role": "user", "content": user_message},
                        {"role": "assistant", "content": str(result.data)},
                    ]
                    self.memory_client.add_memory(messages, user_id=user_id)
                    logger.debug("Conversation saved to memory")
                except Exception as e:
                    logger.error(f"Error saving to memory: {e}")

            return result

        except Exception as e:
            logger.error(f"Error running agent: {e}")
            raise

    async def cleanup(self) -> None:
        """Clean up resources (MCP connections, etc.)."""
        if self.mcp_client:
            try:
                await self.mcp_client.cleanup()
                logger.info("MCP client cleaned up")
            except Exception as e:
                logger.error(f"Error during MCP cleanup: {e}")

    def get_info(self) -> dict[str, Any]:
        """
        Get agent information and status.

        Returns:
            Dict with agent details
        """
        return {
            "name": self.config.name,
            "type": self.config.type.value,
            "description": self.config.description,
            "version": self.config.version,
            "model": f"{self.config.model_provider.value}:{self.config.model_name}",
            "tools_enabled": len(self.config.get_enabled_tools()),
            "mcp_servers": len(self.config.mcp_servers),
            "memory_enabled": self.config.memory.enabled,
            "capabilities": self.config.capabilities,
        }

    def __repr__(self) -> str:
        return (
            f"UnifiedAgent(name='{self.config.name}', "
            f"type='{self.config.type.value}', "
            f"model='{self.config.model_provider.value}:{self.config.model_name}')"
        )
