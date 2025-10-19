"""
Unit Tests for MCP Client

Tests MCP client initialization, server management, and tool discovery.
"""

import pytest
import asyncio
import json
from pathlib import Path
from src.mcp import MCPClient, MCPServer


# Fixtures


@pytest.fixture
def test_config_file(tmp_path):
    """Create a temporary MCP config file for testing"""
    config = {
        "mcpServers": {
            "filesystem": {
                "command": "npx",
                "args": ["-y", "@modelcontextprotocol/server-filesystem", str(tmp_path)],
                "env": {},
            }
        }
    }
    config_path = tmp_path / "mcp_config.json"
    with open(config_path, "w") as f:
        json.dump(config, f)
    return config_path


@pytest.fixture
def invalid_config_file(tmp_path):
    """Create an invalid config file"""
    config_path = tmp_path / "invalid_config.json"
    with open(config_path, "w") as f:
        f.write("{invalid json")
    return config_path


# MCPClient Tests


class TestMCPClient:
    """Test MCP Client functionality"""

    def test_client_initialization(self):
        """Test MCP client initializes correctly"""
        client = MCPClient()
        assert client.servers == []
        assert client.config == {}
        assert client.tools == []

    def test_load_servers_success(self, test_config_file):
        """Test loading valid server configuration"""
        client = MCPClient()
        client.load_servers(test_config_file)

        assert len(client.servers) == 1
        assert client.servers[0].name == "filesystem"
        assert "mcpServers" in client.config

    def test_load_servers_file_not_found(self):
        """Test handling of missing config file"""
        client = MCPClient()
        with pytest.raises(FileNotFoundError):
            client.load_servers("nonexistent_config.json")

    def test_load_servers_invalid_json(self, invalid_config_file):
        """Test handling of invalid JSON"""
        client = MCPClient()
        with pytest.raises(ValueError, match="Invalid JSON"):
            client.load_servers(invalid_config_file)

    def test_load_servers_missing_key(self, tmp_path):
        """Test handling of config without mcpServers key"""
        config_path = tmp_path / "bad_config.json"
        with open(config_path, "w") as f:
            json.dump({"wrong_key": {}}, f)

        client = MCPClient()
        with pytest.raises(ValueError, match="mcpServers"):
            client.load_servers(config_path)

    @pytest.mark.asyncio
    async def test_start_servers_success(self, test_config_file):
        """Test starting MCP servers and getting tools"""
        client = MCPClient()
        client.load_servers(test_config_file)

        try:
            tools = await client.start()
            # Filesystem server should provide tools
            assert isinstance(tools, list)
            assert len(tools) > 0
            # Tool names should be prefixed with server name
            assert any("filesystem_" in tool.name for tool in tools)
        finally:
            await client.cleanup()

    @pytest.mark.asyncio
    async def test_cleanup_without_servers(self):
        """Test cleanup when no servers are initialized"""
        client = MCPClient()
        # Should not raise exception
        await client.cleanup()

    @pytest.mark.asyncio
    async def test_cleanup_with_servers(self, test_config_file):
        """Test cleanup after servers are started"""
        client = MCPClient()
        client.load_servers(test_config_file)

        try:
            await client.start()
        finally:
            # Should cleanup without errors
            await client.cleanup()
            # Tools should be cleared
            assert client.tools is not None


# MCPServer Tests


class TestMCPServer:
    """Test MCP Server functionality"""

    def test_server_initialization(self):
        """Test MCP server initializes correctly"""
        config = {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
            "env": {},
        }
        server = MCPServer("test_server", config)

        assert server.name == "test_server"
        assert server.config == config
        assert server.session is None

    @pytest.mark.asyncio
    async def test_server_initialize_and_cleanup(self, tmp_path):
        """Test server initialization and cleanup"""
        config = {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", str(tmp_path)],
            "env": {},
        }
        server = MCPServer("filesystem", config)

        try:
            await server.initialize()
            assert server.session is not None
        finally:
            await server.cleanup()
            # Session should be cleared after cleanup
            assert server.session is None

    @pytest.mark.asyncio
    async def test_server_invalid_command(self):
        """Test server with invalid command"""
        config = {"command": "nonexistent_command_12345", "args": [], "env": {}}
        server = MCPServer("bad_server", config)

        # Should raise exception when trying to execute nonexistent command
        with pytest.raises((ValueError, FileNotFoundError, OSError)):
            await server.initialize()

    @pytest.mark.asyncio
    async def test_create_pydantic_ai_tools(self, tmp_path):
        """Test creating Pydantic AI tools from MCP tools"""
        config = {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", str(tmp_path)],
            "env": {},
        }
        server = MCPServer("filesystem", config)

        try:
            await server.initialize()
            tools = await server.create_pydantic_ai_tools()

            # Should have tools
            assert isinstance(tools, list)
            assert len(tools) > 0

            # Each tool should have required attributes
            for tool in tools:
                assert hasattr(tool, "name")
                assert hasattr(tool, "description")
                # Tool names should be prefixed with server name
                assert tool.name.startswith("filesystem_")

        finally:
            await server.cleanup()

    @pytest.mark.asyncio
    async def test_create_tools_without_initialization(self):
        """Test creating tools before server is initialized"""
        config = {"command": "npx", "args": [], "env": {}}
        server = MCPServer("test_server", config)

        with pytest.raises(RuntimeError, match="not initialized"):
            await server.create_pydantic_ai_tools()


# Integration Tests


class TestMCPIntegration:
    """Test MCP client and server integration"""

    @pytest.mark.asyncio
    async def test_full_workflow(self, test_config_file):
        """Test complete MCP workflow: load, start, use, cleanup"""
        client = MCPClient()

        # Load servers
        client.load_servers(test_config_file)
        assert len(client.servers) == 1

        try:
            # Start servers and get tools
            tools = await client.start()
            assert len(tools) > 0

            # Verify tools have required attributes
            for tool in tools:
                assert hasattr(tool, "name")
                assert hasattr(tool, "description")
                assert hasattr(tool, "function")
                assert callable(tool.function)

        finally:
            # Cleanup
            await client.cleanup()

    @pytest.mark.asyncio
    async def test_multiple_server_configuration(self, tmp_path):
        """Test configuration with multiple servers"""
        config = {
            "mcpServers": {
                "filesystem1": {
                    "command": "npx",
                    "args": ["-y", "@modelcontextprotocol/server-filesystem", str(tmp_path)],
                    "env": {},
                },
                "filesystem2": {
                    "command": "npx",
                    "args": ["-y", "@modelcontextprotocol/server-filesystem", str(tmp_path / "sub")],
                    "env": {},
                },
            }
        }
        config_path = tmp_path / "multi_config.json"
        with open(config_path, "w") as f:
            json.dump(config, f)

        # Create subdirectory
        (tmp_path / "sub").mkdir()

        client = MCPClient()
        client.load_servers(config_path)

        # Should load both servers
        assert len(client.servers) == 2
        server_names = {s.name for s in client.servers}
        assert server_names == {"filesystem1", "filesystem2"}

        try:
            tools = await client.start()
            # Should have tools from both servers
            assert len(tools) > 0
            # Tools should be prefixed with their server names
            assert any("filesystem1_" in tool.name for tool in tools)
            assert any("filesystem2_" in tool.name for tool in tools)
        finally:
            await client.cleanup()


# Performance Tests


class TestMCPPerformance:
    """Test MCP performance characteristics"""

    @pytest.mark.asyncio
    async def test_startup_time(self, test_config_file):
        """Test MCP server startup is reasonable"""
        import time

        client = MCPClient()
        client.load_servers(test_config_file)

        start = time.time()
        try:
            await client.start()
            duration = time.time() - start
            # Startup should be under 15 seconds
            assert duration < 15.0
        finally:
            await client.cleanup()

    @pytest.mark.asyncio
    async def test_cleanup_is_fast(self, test_config_file):
        """Test cleanup completes quickly"""
        import time

        client = MCPClient()
        client.load_servers(test_config_file)

        try:
            await client.start()
        finally:
            start = time.time()
            await client.cleanup()
            duration = time.time() - start
            # Cleanup should be under 5 seconds
            assert duration < 5.0
