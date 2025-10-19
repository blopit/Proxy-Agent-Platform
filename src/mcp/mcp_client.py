"""
MCP (Model Context Protocol) Client for Proxy Agent Platform

Manages connections to MCP servers and converts MCP tools to Pydantic AI tools.
Adapted from: github.com/coleam00/ottomator-agents/pydantic-ai-mcp-agent

This client enables agents to dynamically discover and use external tools
through the MCP protocol, including filesystem, GitHub, databases, and more.
"""

from pydantic_ai import RunContext, Tool as PydanticTool
from pydantic_ai.tools import ToolDefinition
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.types import Tool as MCPTool
from contextlib import AsyncExitStack
from typing import Any
import asyncio
import logging
import shutil
import json
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class MCPClient:
    """
    Manages connections to one or more MCP servers based on configuration.

    Usage:
        client = MCPClient()
        client.load_servers("mcp_config.json")
        tools = await client.start()
        # tools can now be passed to Pydantic AI Agent
        await client.cleanup()  # When done
    """

    def __init__(self) -> None:
        self.servers: list[MCPServer] = []
        self.config: dict[str, Any] = {}
        self.tools: list[PydanticTool] = []
        self.exit_stack = AsyncExitStack()

    def load_servers(self, config_path: str | Path) -> None:
        """
        Load MCP server configuration from JSON file.

        The configuration file should follow the same format as Claude Desktop:
        {
            "mcpServers": {
                "filesystem": {
                    "command": "npx",
                    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
                    "env": {"KEY": "value"}  // optional
                }
            }
        }

        Args:
            config_path: Path to the JSON configuration file.

        Raises:
            FileNotFoundError: If config file doesn't exist
            ValueError: If config format is invalid
        """
        config_path = Path(config_path)
        if not config_path.exists():
            raise FileNotFoundError(f"MCP config file not found: {config_path}")

        try:
            with open(config_path, "r") as config_file:
                self.config = json.load(config_file)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in MCP config: {e}")

        if "mcpServers" not in self.config:
            raise ValueError("MCP config must contain 'mcpServers' key")

        # Create server instances
        self.servers = [
            MCPServer(name, config) for name, config in self.config["mcpServers"].items()
        ]
        logger.info(f"Loaded {len(self.servers)} MCP servers from config")

    async def start(self) -> list[PydanticTool]:
        """
        Start all MCP servers and return combined tools for Pydantic AI.

        Returns:
            List of Pydantic AI tools from all servers.

        Raises:
            Exception: If any server fails to initialize
        """
        self.tools = []
        failed_servers = []

        for server in self.servers:
            try:
                logger.info(f"Starting MCP server: {server.name}")
                await server.initialize()
                tools = await server.create_pydantic_ai_tools()
                self.tools.extend(tools)
                logger.info(f"✅ Server '{server.name}' initialized with {len(tools)} tools")
            except Exception as e:
                logger.error(f"❌ Failed to initialize server '{server.name}': {e}")
                failed_servers.append(server.name)

        if failed_servers and not self.tools:
            # All servers failed
            await self.cleanup_servers()
            raise RuntimeError(f"All MCP servers failed to initialize: {failed_servers}")

        if failed_servers:
            logger.warning(f"Some servers failed but continuing with {len(self.tools)} tools")

        return self.tools

    async def cleanup_servers(self) -> None:
        """Clean up all MCP servers properly."""
        for server in self.servers:
            try:
                await server.cleanup()
            except Exception as e:
                logger.warning(f"Warning during cleanup of server {server.name}: {e}")

    async def cleanup(self) -> None:
        """Clean up all resources including the exit stack."""
        try:
            # First clean up all servers
            await self.cleanup_servers()
            # Then close the exit stack
            await self.exit_stack.aclose()
            logger.info("MCP client cleanup complete")
        except asyncio.CancelledError:
            # Ignore cancellation errors during cleanup
            logger.debug("Cleanup cancelled (expected during async test teardown)")
        except RuntimeError as e:
            # Ignore cancel scope errors
            if "cancel scope" not in str(e).lower():
                logger.warning(f"Warning during final cleanup: {e}")
        except Exception as e:
            logger.warning(f"Warning during final cleanup: {e}")


class MCPServer:
    """
    Manages a single MCP server connection and tool execution.

    Handles server lifecycle (initialization, tool discovery, cleanup) and
    converts MCP tools to Pydantic AI compatible tools.
    """

    def __init__(self, name: str, config: dict[str, Any]) -> None:
        """
        Initialize MCP server instance.

        Args:
            name: Server identifier (e.g., "filesystem", "github")
            config: Server configuration with command, args, and env
        """
        self.name: str = name
        self.config: dict[str, Any] = config
        self.stdio_context: Any | None = None
        self.session: ClientSession | None = None
        self._cleanup_lock: asyncio.Lock = asyncio.Lock()
        self.exit_stack: AsyncExitStack = AsyncExitStack()

    async def initialize(self) -> None:
        """
        Initialize the MCP server connection.

        Starts the server process and establishes communication via stdio.

        Raises:
            ValueError: If command is invalid
            Exception: If server initialization fails
        """
        # Resolve command path (especially for npx)
        command = (
            shutil.which("npx") if self.config["command"] == "npx" else self.config["command"]
        )
        if command is None:
            raise ValueError(f"Command not found: {self.config['command']}")

        # Prepare server parameters
        server_params = StdioServerParameters(
            command=command,
            args=self.config["args"],
            env=self.config.get("env"),  # Optional environment variables
        )

        try:
            # Start server with stdio transport
            stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
            read, write = stdio_transport

            # Create client session
            session = await self.exit_stack.enter_async_context(ClientSession(read, write))
            await session.initialize()
            self.session = session

            logger.info(f"Server '{self.name}' connected successfully")
        except Exception as e:
            logger.error(f"Error initializing server {self.name}: {e}")
            await self.cleanup()
            raise

    async def create_pydantic_ai_tools(self) -> list[PydanticTool]:
        """
        Convert MCP tools to Pydantic AI tools.

        Fetches the list of tools from the MCP server and wraps each
        tool in a Pydantic AI Tool instance.

        Returns:
            List of Pydantic AI tools.
        """
        if not self.session:
            raise RuntimeError(f"Server '{self.name}' not initialized")

        # List all tools available from this server
        tools_response = await self.session.list_tools()
        mcp_tools = tools_response.tools

        logger.info(f"Server '{self.name}' provides {len(mcp_tools)} tools")

        # Convert each MCP tool to Pydantic AI tool
        return [self.create_tool_instance(tool) for tool in mcp_tools]

    def create_tool_instance(self, tool: MCPTool) -> PydanticTool:
        """
        Create a Pydantic AI Tool from an MCP Tool.

        Args:
            tool: MCP Tool definition

        Returns:
            Pydantic AI Tool instance
        """

        # Tool execution function
        async def execute_tool(**kwargs: Any) -> Any:
            """Execute the MCP tool with given arguments"""
            if not self.session:
                raise RuntimeError(f"Server '{self.name}' not initialized")

            result = await self.session.call_tool(tool.name, arguments=kwargs)
            logger.debug(f"Tool '{tool.name}' executed successfully")
            return result

        # Tool preparation (inject JSON schema)
        async def prepare_tool(ctx: RunContext, tool_def: ToolDefinition) -> ToolDefinition | None:
            """Prepare tool by injecting MCP tool's JSON schema"""
            tool_def.parameters_json_schema = tool.inputSchema
            return tool_def

        # Create Pydantic AI Tool
        return PydanticTool(
            execute_tool,
            name=f"{self.name}_{tool.name}",  # Prefix with server name to avoid conflicts
            description=tool.description or f"Tool from {self.name} server",
            takes_ctx=False,
            prepare=prepare_tool,
        )

    async def cleanup(self) -> None:
        """Clean up server resources safely."""
        async with self._cleanup_lock:
            try:
                await self.exit_stack.aclose()
                self.session = None
                self.stdio_context = None
                logger.info(f"Server '{self.name}' cleaned up")
            except asyncio.CancelledError:
                # Ignore cancellation errors during cleanup
                logger.debug(f"Server '{self.name}' cleanup cancelled (expected during async test teardown)")
                self.session = None
                self.stdio_context = None
            except RuntimeError as e:
                # Ignore cancel scope errors during cleanup (async context timing issues)
                if "cancel scope" not in str(e).lower():
                    logger.error(f"Error during cleanup of server {self.name}: {e}")
            except Exception as e:
                logger.error(f"Error during cleanup of server {self.name}: {e}")
