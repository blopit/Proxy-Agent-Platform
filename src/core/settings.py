"""
Application settings and configuration using Pydantic BaseSettings.
Environment variables are loaded from .env file.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings with environment variable support.

    All settings can be overridden via environment variables.
    Loads from .env file in project root by default.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore extra fields from .env
    )

    # Core Platform Configuration
    app_name: str = Field(default="Proxy Agent Platform", description="Application name")
    debug: bool = Field(default=False, description="Debug mode")
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO", description="Logging level"
    )

    # Security Configuration
    jwt_secret_key: str = Field(
        ..., description="Secret key for JWT token generation (required)"
    )
    jwt_algorithm: str = Field(default="HS256", description="JWT encoding algorithm")
    jwt_access_token_expire_minutes: int = Field(
        default=30, description="JWT token expiry in minutes"
    )

    # Database Configuration
    database_path: str = Field(
        default="proxy_agents_enhanced.db", description="SQLite database file path"
    )
    test_database_path: str = Field(
        default="test_proxy_agents.db", description="Test database file path"
    )

    # Redis Configuration
    redis_url: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")

    # LLM Configuration
    llm_provider: Literal["openai", "anthropic", "gemini"] = Field(
        default="openai", description="LLM provider"
    )
    llm_api_key: str | None = Field(default=None, description="LLM API key")
    llm_model: str = Field(default="gpt-4", description="LLM model name")
    llm_base_url: str = Field(
        default="https://api.openai.com/v1", description="LLM API base URL"
    )

    # External Services
    brave_api_key: str | None = Field(default=None, description="Brave Search API key")
    github_token: str | None = Field(default=None, description="GitHub API token")
    github_webhook_secret: str | None = Field(default=None, description="GitHub webhook secret")

    # Gmail API
    gmail_credentials_path: str = Field(
        default="./credentials/credentials.json", description="Gmail credentials file path"
    )
    gmail_token_path: str = Field(
        default="./credentials/token.json", description="Gmail token file path"
    )

    # Mobile Integration
    ios_shortcuts_webhook_url: str | None = Field(
        default=None, description="iOS Shortcuts webhook URL"
    )
    android_tiles_webhook_url: str | None = Field(
        default=None, description="Android Tiles webhook URL"
    )

    # Gamification
    xp_multiplier: float = Field(default=1.0, description="XP multiplier for rewards", ge=0.1, le=10.0)
    streak_bonus_enabled: bool = Field(default=True, description="Enable streak bonuses")
    achievement_notifications: bool = Field(default=True, description="Enable achievement notifications")

    # FastAPI Configuration
    host: str = Field(default="0.0.0.0", description="FastAPI host")
    port: int = Field(default=8000, description="FastAPI port", ge=1, le=65535)
    reload: bool = Field(default=True, description="Enable auto-reload in development")
    workers: int = Field(default=1, description="Number of worker processes", ge=1)

    # Celery Configuration
    celery_broker_url: str = Field(
        default="redis://localhost:6379/1", description="Celery broker URL"
    )
    celery_result_backend: str = Field(
        default="redis://localhost:6379/2", description="Celery result backend URL"
    )

    # Monitoring & Observability
    sentry_dsn: str | None = Field(default=None, description="Sentry DSN for error tracking")
    prometheus_enabled: bool = Field(default=False, description="Enable Prometheus metrics")
    jaeger_enabled: bool = Field(default=False, description="Enable Jaeger tracing")

    # Development/Testing
    testing: bool = Field(default=False, description="Testing mode")
    mock_external_apis: bool = Field(default=False, description="Mock external API calls")

    def is_production(self) -> bool:
        """Check if running in production mode"""
        return not self.debug and not self.testing

    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.debug and not self.testing

    def is_testing(self) -> bool:
        """Check if running in testing mode"""
        return self.testing


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Returns singleton Settings instance loaded from environment variables.
    Uses lru_cache to avoid reloading settings on every call.

    Returns:
        Settings: Application settings instance

    Example:
        >>> settings = get_settings()
        >>> print(settings.jwt_secret_key)
    """
    return Settings()


# Convenience export
settings = get_settings()
