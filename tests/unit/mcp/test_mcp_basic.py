"""
Basic MCP Integration Test

Tests that MCP client can connect to filesystem server and discover tools.
Run with: uv run python src/mcp/test_mcp_basic.py
"""

import asyncio
import logging
from pathlib import Path
from src.mcp import MCPClient

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


async def test_mcp_filesystem():
    """Test MCP client with filesystem server"""
    print("\n" + "=" * 70)
    print("🧪 Testing MCP Client with Filesystem Server")
    print("=" * 70 + "\n")

    # Initialize MCP client
    client = MCPClient()

    # Load configuration
    config_path = Path(__file__).parent / "mcp_config.json"
    print(f"📂 Loading config from: {config_path}")
    client.load_servers(config_path)
    print(f"✅ Loaded {len(client.servers)} server(s)\n")

    try:
        # Start MCP servers and get tools
        print("🚀 Starting MCP servers...")
        tools = await client.start()
        print(f"✅ Successfully connected to MCP servers\n")

        # Display discovered tools
        print(f"🔧 Discovered {len(tools)} tools:")
        for i, tool in enumerate(tools, 1):
            print(f"   {i}. {tool.name}")
            if hasattr(tool, "description"):
                print(f"      └─ {tool.description}")
        print()

        # Test results
        if tools:
            print("✅ SUCCESS: MCP integration working!")
            print(f"   - {len(client.servers)} server(s) connected")
            print(f"   - {len(tools)} tool(s) available")
            print("\n💡 Your agents can now use these MCP tools!")
            return True
        else:
            print("❌ FAILED: No tools discovered")
            return False

    except Exception as e:
        print(f"❌ ERROR: {e}")
        logger.exception("Test failed")
        return False

    finally:
        # Cleanup
        print("\n🧹 Cleaning up...")
        await client.cleanup()
        print("✅ Cleanup complete\n")


async def main():
    """Main test runner"""
    success = await test_mcp_filesystem()
    print("=" * 70)
    if success:
        print("🎉 All tests passed!")
    else:
        print("❌ Tests failed")
    print("=" * 70 + "\n")
    return success


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
