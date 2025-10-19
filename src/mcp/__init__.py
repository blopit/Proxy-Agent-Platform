"""
MCP (Model Context Protocol) Integration

This module provides MCP client functionality for the Proxy Agent Platform,
enabling agents to dynamically discover and use external tools.

Usage:
    from src.mcp import MCPClient

    client = MCPClient()
    client.load_servers("mcp_config.json")
    tools = await client.start()
    # Use tools with Pydantic AI agents
"""

from src.mcp.mcp_client import MCPClient, MCPServer

__all__ = ["MCPClient", "MCPServer"]
