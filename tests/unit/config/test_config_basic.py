"""
Basic Configuration System Test

Tests that config loader can load and validate agent configurations.
Run with: uv run python config/test_config_basic.py
"""

import logging
from pathlib import Path
from config import get_config_loader, load_agent_config, AgentType

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def test_config_system():
    """Test configuration loading and validation"""
    print("\n" + "=" * 70)
    print("🧪 Testing Agent Configuration System")
    print("=" * 70 + "\n")

    # Initialize loader
    loader = get_config_loader()
    print(f"📂 Config directory: {loader.config_dir}\n")

    # Test 1: List available configs
    print("📋 Test 1: Listing available configurations...")
    available = loader.list_available_configs()
    print(f"✅ Found {len(available)} configurations: {', '.join(available)}\n")

    if not available:
        print("❌ No configurations found! Expected 5 agent configs.")
        return False

    # Test 2: Load each config
    print("📖 Test 2: Loading individual configurations...")
    configs = {}
    for agent_type in available:
        try:
            config = loader.load_config(agent_type)
            configs[agent_type] = config
            print(f"✅ {agent_type}: {config.name} (v{config.version})")
        except Exception as e:
            print(f"❌ Failed to load {agent_type}: {e}")
            return False
    print()

    # Test 3: Validate config structure
    print("🔍 Test 3: Validating configuration structure...")
    for agent_type, config in configs.items():
        # Check required fields
        assert config.name, f"{agent_type}: missing name"
        assert config.type, f"{agent_type}: missing type"
        assert config.description, f"{agent_type}: missing description"
        assert config.model_provider, f"{agent_type}: missing model_provider"
        assert config.model_name, f"{agent_type}: missing model_name"
        assert config.system_prompt.template, f"{agent_type}: missing system prompt"

        print(f"✅ {agent_type}: All required fields present")
    print()

    # Test 4: Render system prompts
    print("💬 Test 4: Rendering system prompts...")
    for agent_type, config in configs.items():
        try:
            # Render with default variables
            prompt = config.render_system_prompt()
            assert len(prompt) > 0, f"{agent_type}: empty rendered prompt"

            # Render with custom variables
            prompt_custom = config.render_system_prompt(user_name="Alice")
            assert "Alice" in prompt_custom, f"{agent_type}: custom variable not applied"

            print(
                f"✅ {agent_type}: Rendered {len(prompt)} chars (default), {len(prompt_custom)} chars (custom)"
            )
        except Exception as e:
            print(f"❌ Failed to render {agent_type} prompt: {e}")
            return False
    print()

    # Test 5: Tool configuration
    print("🔧 Test 5: Checking tool configurations...")
    for agent_type, config in configs.items():
        enabled_tools = config.get_enabled_tools()
        print(
            f"✅ {agent_type}: {len(enabled_tools)} enabled tools: {', '.join(enabled_tools) if enabled_tools else 'none'}"
        )
    print()

    # Test 6: MCP configuration
    print("🔌 Test 6: Checking MCP configurations...")
    for agent_type, config in configs.items():
        mcp_config = config.get_mcp_config()
        server_count = len(mcp_config.get("mcpServers", {}))
        if server_count > 0:
            servers = list(mcp_config["mcpServers"].keys())
            print(f"✅ {agent_type}: {server_count} MCP servers: {', '.join(servers)}")
        else:
            print(f"✅ {agent_type}: No MCP servers configured")
    print()

    # Test 7: Memory configuration
    print("💾 Test 7: Checking memory configurations...")
    for agent_type, config in configs.items():
        mem_status = "enabled" if config.memory.enabled else "disabled"
        print(
            f"✅ {agent_type}: Memory {mem_status} (limit: {config.memory.search_limit})"
        )
    print()

    # Test 8: Behavior settings
    print("⚙️  Test 8: Checking behavior settings...")
    for agent_type, config in configs.items():
        print(
            f"✅ {agent_type}: temp={config.behavior.temperature}, "
            f"max_tokens={config.behavior.max_tokens or 'auto'}, "
            f"timeout={config.behavior.timeout}s"
        )
    print()

    # Test 9: Load all configs at once
    print("📚 Test 9: Loading all configurations at once...")
    all_configs = loader.load_all_configs()
    print(f"✅ Loaded {len(all_configs)} configurations in batch\n")

    # Test 10: Validate config files
    print("✓ Test 10: Validating config files...")
    for agent_type in available:
        config_file = loader.config_dir / f"{agent_type}.yaml"
        is_valid, error = loader.validate_config_file(config_file)
        if is_valid:
            print(f"✅ {agent_type}.yaml: Valid")
        else:
            print(f"❌ {agent_type}.yaml: Invalid - {error}")
            return False
    print()

    # Summary
    print("=" * 70)
    print("🎉 All configuration tests passed!")
    print(f"   - {len(configs)} agent configurations loaded")
    print(f"   - All prompts render correctly")
    print(f"   - All validations passed")
    print("=" * 70 + "\n")

    # Display config summary
    print("📊 Configuration Summary:")
    print("-" * 70)
    for agent_type, config in configs.items():
        print(f"\n{config.name} ({agent_type})")
        print(f"  Provider: {config.model_provider.value}")
        print(f"  Model: {config.model_name}")
        print(f"  Tools: {len(config.tools)}")
        print(f"  MCP Servers: {len(config.mcp_servers)}")
        print(f"  Capabilities: {', '.join(config.capabilities[:3])}{'...' if len(config.capabilities) > 3 else ''}")

    print("\n" + "=" * 70 + "\n")
    return True


if __name__ == "__main__":
    success = test_config_system()
    exit(0 if success else 1)
