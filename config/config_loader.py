"""
Agent Configuration Loader

Loads and validates YAML agent configurations using Pydantic models.
Provides caching and error handling for production use.
"""

import yaml
import logging
from pathlib import Path
from typing import Any
from functools import lru_cache

from config.agent_config_schema import AgentConfig, AgentType

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ConfigLoader:
    """
    Loads agent configurations from YAML files.

    Usage:
        loader = ConfigLoader()
        config = loader.load_config("task")
        all_configs = loader.load_all_configs()
    """

    def __init__(self, config_dir: str | Path = None) -> None:
        """
        Initialize config loader.

        Args:
            config_dir: Directory containing agent YAML configs.
                       Defaults to config/agents/
        """
        if config_dir is None:
            config_dir = Path(__file__).parent / "agents"

        self.config_dir = Path(config_dir)

        if not self.config_dir.exists():
            logger.warning(f"Config directory does not exist: {self.config_dir}")
            self.config_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"ConfigLoader initialized with directory: {self.config_dir}")

    def load_config(self, agent_type: str | AgentType) -> AgentConfig:
        """
        Load configuration for a specific agent type.

        Args:
            agent_type: Agent type (e.g., "task", "focus", etc.)

        Returns:
            Validated AgentConfig instance

        Raises:
            FileNotFoundError: If config file doesn't exist
            ValueError: If config is invalid

        Example:
            config = loader.load_config("task")
            prompt = config.render_system_prompt(user_name="Alice")
        """
        # Convert enum to string if needed
        if isinstance(agent_type, AgentType):
            agent_type = agent_type.value

        config_file = self.config_dir / f"{agent_type}.yaml"

        if not config_file.exists():
            raise FileNotFoundError(f"Config file not found: {config_file}")

        try:
            with open(config_file, "r") as f:
                config_data = yaml.safe_load(f)

            if not config_data:
                raise ValueError(f"Empty configuration file: {config_file}")

            # Validate with Pydantic
            config = AgentConfig(**config_data)
            logger.debug(f"Loaded config for {agent_type}: {config.name}")
            return config

        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML in {config_file}: {e}")
        except Exception as e:
            raise ValueError(f"Failed to load config from {config_file}: {e}")

    @lru_cache(maxsize=32)
    def load_config_cached(self, agent_type: str) -> AgentConfig:
        """
        Load configuration with caching for performance.

        Args:
            agent_type: Agent type name

        Returns:
            Cached AgentConfig instance
        """
        return self.load_config(agent_type)

    def load_all_configs(self) -> dict[str, AgentConfig]:
        """
        Load all agent configurations from the config directory.

        Returns:
            Dict mapping agent type to AgentConfig

        Example:
            configs = loader.load_all_configs()
            task_config = configs["task"]
        """
        configs = {}
        yaml_files = list(self.config_dir.glob("*.yaml")) + list(
            self.config_dir.glob("*.yml")
        )

        if not yaml_files:
            logger.warning(f"No YAML config files found in {self.config_dir}")
            return configs

        for config_file in yaml_files:
            agent_type = config_file.stem  # filename without extension

            try:
                config = self.load_config(agent_type)
                configs[agent_type] = config
                logger.info(f"Loaded config: {agent_type} ({config.name})")
            except Exception as e:
                logger.error(f"Failed to load {config_file}: {e}")
                # Continue loading other configs

        logger.info(f"Loaded {len(configs)} agent configurations")
        return configs

    def save_config(self, config: AgentConfig, agent_type: str = None) -> Path:
        """
        Save an agent configuration to YAML file.

        Args:
            config: AgentConfig to save
            agent_type: Optional agent type name (defaults to config.type)

        Returns:
            Path to saved config file

        Example:
            config = AgentConfig(...)
            path = loader.save_config(config, "task")
        """
        if agent_type is None:
            agent_type = config.type.value

        config_file = self.config_dir / f"{agent_type}.yaml"

        try:
            # Convert Pydantic model to dict
            config_dict = config.model_dump(mode="json", exclude_none=True)

            # Save to YAML
            with open(config_file, "w") as f:
                yaml.dump(
                    config_dict, f, default_flow_style=False, sort_keys=False, indent=2
                )

            logger.info(f"Saved config to: {config_file}")
            return config_file

        except Exception as e:
            raise ValueError(f"Failed to save config to {config_file}: {e}")

    def validate_config_file(self, config_file: str | Path) -> tuple[bool, str | None]:
        """
        Validate a config file without loading it.

        Args:
            config_file: Path to YAML config file

        Returns:
            Tuple of (is_valid, error_message)

        Example:
            valid, error = loader.validate_config_file("config/agents/task.yaml")
            if not valid:
                print(f"Invalid config: {error}")
        """
        config_file = Path(config_file)

        try:
            with open(config_file, "r") as f:
                config_data = yaml.safe_load(f)

            if not config_data:
                return False, "Empty configuration file"

            # Try to validate with Pydantic
            AgentConfig(**config_data)
            return True, None

        except FileNotFoundError:
            return False, "Config file not found"
        except yaml.YAMLError as e:
            return False, f"Invalid YAML: {e}"
        except Exception as e:
            return False, f"Validation error: {e}"

    def list_available_configs(self) -> list[str]:
        """
        List all available agent configuration files.

        Returns:
            List of agent type names

        Example:
            configs = loader.list_available_configs()
            # ['task', 'focus', 'energy', 'progress', 'gamification']
        """
        yaml_files = list(self.config_dir.glob("*.yaml")) + list(
            self.config_dir.glob("*.yml")
        )
        return sorted([f.stem for f in yaml_files])


# Global config loader instance
_loader: ConfigLoader | None = None


def get_config_loader(config_dir: str | Path = None) -> ConfigLoader:
    """
    Get or create global config loader instance.

    Args:
        config_dir: Optional config directory

    Returns:
        ConfigLoader singleton instance
    """
    global _loader
    if _loader is None:
        _loader = ConfigLoader(config_dir)
    return _loader


def load_agent_config(agent_type: str | AgentType) -> AgentConfig:
    """
    Convenience function to load agent config.

    Args:
        agent_type: Agent type name

    Returns:
        AgentConfig instance

    Example:
        config = load_agent_config("task")
    """
    loader = get_config_loader()
    return loader.load_config(agent_type)
