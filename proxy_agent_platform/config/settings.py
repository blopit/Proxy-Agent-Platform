"""
Settings management for Proxy Agent Platform using pydantic-settings and python-dotenv.

This module provides configuration management following the CLAUDE.md standards for
PydanticAI development with proper environment variable loading.
"""

from functools import lru_cache
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pydantic import ConfigDict, Field, validator
from pydantic_ai.models import Model
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.models.gemini import GeminiModel
from pydantic_ai.models.openai import OpenAIModel
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings with environment variable support.

    Follows CLAUDE.md standards for PydanticAI configuration with proper
    environment variable loading using python-dotenv.
    """

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Core Application Settings
    app_name: str = Field(default="Proxy Agent Platform", description="Application name")
    debug: bool = Field(default=False, description="Debug mode")
    log_level: str = Field(default="INFO", description="Logging level")
    secret_key: str = Field(..., description="Secret key for JWT and encryption")

    # LLM Configuration
    llm_provider: str = Field(default="openai", description="LLM provider (openai, anthropic, gemini)")
    llm_api_key: str = Field(..., description="API key for the LLM provider")
    llm_model: str = Field(default="gpt-4", description="Model name to use")
    llm_base_url: str = Field(
        default="https://api.openai.com/v1",
        description="Base URL for the LLM API"
    )

    # Database Configuration
    database_url: str = Field(..., description="PostgreSQL database URL")
    redis_url: str = Field(default="redis://localhost:6379/0", description="Redis URL")

    # External Services
    brave_api_key: str | None = Field(default=None, description="Brave Search API key")
    gmail_credentials_path: str = Field(
        default="./credentials/credentials.json",
        description="Path to Gmail credentials.json"
    )
    gmail_token_path: str = Field(
        default="./credentials/token.json",
        description="Path to Gmail token.json"
    )
    github_token: str | None = Field(default=None, description="GitHub API token")
    github_webhook_secret: str | None = Field(default=None, description="GitHub webhook secret")

    # Mobile Integration
    ios_shortcuts_webhook_url: str | None = Field(
        default=None,
        description="iOS Shortcuts webhook URL"
    )
    android_tiles_webhook_url: str | None = Field(
        default=None,
        description="Android tiles webhook URL"
    )

    # Gamification
    xp_multiplier: float = Field(default=1.0, description="XP multiplier for achievements")
    streak_bonus_enabled: bool = Field(default=True, description="Enable streak bonuses")
    achievement_notifications: bool = Field(default=True, description="Enable achievement notifications")

    # FastAPI Configuration
    host: str = Field(default="0.0.0.0", description="FastAPI host")
    port: int = Field(default=8000, description="FastAPI port")
    reload: bool = Field(default=True, description="Auto-reload in development")
    workers: int = Field(default=1, description="Number of workers")

    # Celery Configuration
    celery_broker_url: str = Field(
        default="redis://localhost:6379/1",
        description="Celery broker URL"
    )
    celery_result_backend: str = Field(
        default="redis://localhost:6379/2",
        description="Celery result backend URL"
    )

    # Monitoring & Observability
    sentry_dsn: str | None = Field(default=None, description="Sentry DSN for error tracking")
    prometheus_enabled: bool = Field(default=False, description="Enable Prometheus metrics")
    jaeger_enabled: bool = Field(default=False, description="Enable Jaeger tracing")

    # Development/Testing
    testing: bool = Field(default=False, description="Testing mode")
    test_database_url: str | None = Field(
        default=None,
        description="Test database URL"
    )
    mock_external_apis: bool = Field(default=False, description="Mock external API calls")

    @validator('llm_provider')
    def validate_llm_provider(cls, v: str) -> str:
        """Validate LLM provider is supported."""
        supported_providers = {"openai", "anthropic", "gemini", "ollama"}
        if v.lower() not in supported_providers:
            raise ValueError(f"Unsupported LLM provider: {v}. Supported: {supported_providers}")
        return v.lower()

    @validator('log_level')
    def validate_log_level(cls, v: str) -> str:
        """Validate log level is supported."""
        valid_levels = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in valid_levels:
            raise ValueError(f"Invalid log level: {v}. Valid levels: {valid_levels}")
        return v.upper()

    def get_credentials_dir(self) -> Path:
        """Get the credentials directory path."""
        return Path(self.gmail_credentials_path).parent

    def get_database_config(self) -> dict[str, Any]:
        """Get database configuration dictionary."""
        return {
            "url": self.test_database_url if self.testing else self.database_url,
            "echo": self.debug,
            "pool_size": 5,
            "max_overflow": 10,
            "pool_pre_ping": True,
        }

    def get_celery_config(self) -> dict[str, Any]:
        """Get Celery configuration dictionary."""
        return {
            "broker_url": self.celery_broker_url,
            "result_backend": self.celery_result_backend,
            "task_serializer": "json",
            "accept_content": ["json"],
            "result_serializer": "json",
            "timezone": "UTC",
            "enable_utc": True,
            "task_routes": {
                "proxy_agent_platform.agents.*": {"queue": "agents"},
                "proxy_agent_platform.tools.*": {"queue": "tools"},
                "proxy_agent_platform.gamification.*": {"queue": "gamification"},
            }
        }


def load_settings() -> Settings:
    """
    Load settings with proper error handling and environment loading.

    Follows CLAUDE.md standards for environment variable management.

    Returns:
        Settings instance with all configuration loaded

    Raises:
        ValueError: If required settings are missing or invalid
    """
    # Load environment variables from .env file
    load_dotenv()

    try:
        return Settings()
    except Exception as e:
        error_msg = f"Failed to load settings: {e}"
        if "llm_api_key" in str(e).lower():
            error_msg += "\nMake sure to set LLM_API_KEY in your .env file"
        if "secret_key" in str(e).lower():
            error_msg += "\nMake sure to set SECRET_KEY in your .env file"
        if "database_url" in str(e).lower():
            error_msg += "\nMake sure to set DATABASE_URL in your .env file"
        raise ValueError(error_msg) from e


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return load_settings()


def get_llm_model() -> Model:
    """
    Get configured LLM model with proper environment loading.

    Follows CLAUDE.md standards for PydanticAI model configuration.

    Returns:
        Configured PydanticAI model instance

    Raises:
        ValueError: If provider is not supported or configuration is invalid
    """
    settings = get_settings()

    if settings.llm_provider == "openai":
        return OpenAIModel(
            model_name=settings.llm_model,
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url,
        )
    elif settings.llm_provider == "anthropic":
        return AnthropicModel(
            model_name=settings.llm_model,
            api_key=settings.llm_api_key,
        )
    elif settings.llm_provider == "gemini":
        return GeminiModel(
            model_name=settings.llm_model,
            api_key=settings.llm_api_key,
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")


def setup_logging() -> None:
    """Setup structured logging with proper configuration."""
    import logging

    import structlog

    settings = get_settings()

    # Configure standard logging
    logging.basicConfig(
        level=getattr(logging, settings.log_level),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if not settings.debug
            else structlog.dev.ConsoleRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
