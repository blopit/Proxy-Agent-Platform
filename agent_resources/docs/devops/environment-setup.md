# Environment Setup & Configuration Guide

> **Complete guide for setting up development, staging, and production environments**

## 🎯 Overview

This guide covers environment setup and configuration management for the Proxy Agent Platform across all environments.

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Environment Variables](#environment-variables)
3. [Configuration Management](#configuration-management)
4. [Secrets Management](#secrets-management)
5. [Third-Party Services](#third-party-services)
6. [Environment-Specific Configurations](#environment-specific-configurations)

## 💻 Local Development Setup

### Prerequisites

#### Required Software

```bash
# Check versions
python --version    # Python 3.11+
node --version      # Node.js 18+
docker --version    # Docker 20+
git --version       # Git 2.30+
```

#### Install UV Package Manager

```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH (if not automatic)
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
uv --version
```

#### Install PostgreSQL (Optional for Local Development)

```bash
# macOS
brew install postgresql@13
brew services start postgresql@13

# Ubuntu/Debian
sudo apt install postgresql-13 postgresql-contrib
sudo systemctl start postgresql

# Windows (via Chocolatey)
choco install postgresql13

# Or use Docker
docker run -d \
  --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=proxy_agent_platform \
  -p 5432:5432 \
  postgres:13-alpine
```

#### Install Redis (Optional for Local Development)

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Windows (via Chocolatey)
choco install redis-64

# Or use Docker
docker run -d \
  --name redis-dev \
  -p 6379:6379 \
  redis:7-alpine
```

### Repository Setup

```bash
# Clone repository
git clone https://github.com/yourusername/proxy-agent-platform.git
cd proxy-agent-platform

# Create virtual environment
uv venv

# Activate virtual environment
# macOS/Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate

# Install dependencies
uv sync

# Install development dependencies
uv sync --group dev

# Install pre-commit hooks
uv run pre-commit install
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm ci

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev

# In another terminal, start Storybook
npm run storybook
```

### Database Setup

```bash
# Create database (if using local PostgreSQL)
createdb proxy_agent_platform

# Or via psql
psql -U postgres -c "CREATE DATABASE proxy_agent_platform;"

# Run migrations
uv run alembic upgrade head

# Verify migrations
uv run alembic current

# Create initial data (optional)
uv run python scripts/seed_dev_data.py
```

### Running the Application

```bash
# Option 1: Use the startup script (recommended)
chmod +x start.sh
./start.sh

# Option 2: Start services individually
# Terminal 1 - Backend
uv run uvicorn src.api.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Celery Worker
uv run celery -A src.workers.celery_app worker --loglevel=info

# Terminal 4 - Celery Beat
uv run celery -A src.workers.celery_app beat --loglevel=info
```

### Verify Installation

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend
open http://localhost:3000

# Check API docs
open http://localhost:8000/docs

# Run tests
uv run pytest
cd frontend && npm test
```

## 🔧 Environment Variables

### Environment File Structure

```
.env.example         # Template with all variables (committed)
.env                 # Local development (gitignored)
.env.local           # Local overrides (gitignored)
.env.test            # Test environment (gitignored)
.env.staging         # Staging environment (secure storage)
.env.production      # Production environment (secure storage)
```

### Core Environment Variables

#### Application Configuration

```bash
# .env.example

# ============================================================================
# CORE APPLICATION SETTINGS
# ============================================================================
APP_NAME=Proxy Agent Platform
DEBUG=false
LOG_LEVEL=INFO
ENVIRONMENT=development  # development, staging, production

# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-secret-key-here

# Allowed hosts (comma-separated)
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
# PostgreSQL (Production/Staging)
DATABASE_URL=postgresql://user:password@localhost:5432/proxy_agent_platform

# SQLite (Development)
# DATABASE_URL=sqlite:///./proxy_agent.db

# Database pool settings
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
DATABASE_POOL_TIMEOUT=30

# ============================================================================
# REDIS CONFIGURATION
# ============================================================================
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=

# ============================================================================
# CELERY CONFIGURATION
# ============================================================================
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
CELERY_TASK_SERIALIZER=json
CELERY_RESULT_SERIALIZER=json
CELERY_ACCEPT_CONTENT=json
CELERY_TIMEZONE=UTC

# ============================================================================
# LLM PROVIDER CONFIGURATION
# ============================================================================
# Primary LLM Provider (openai, anthropic, gemini)
LLM_PROVIDER=openai
LLM_MODEL=gpt-4

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_ORGANIZATION=

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Google Gemini
GOOGLE_API_KEY=your-gemini-api-key-here
GOOGLE_MODEL=gemini-pro

# ============================================================================
# EXTERNAL SERVICES
# ============================================================================
# Brave Search (for research proxy)
BRAVE_API_KEY=BSA_your_brave_api_key_here

# Gmail API (for email proxy)
GMAIL_CREDENTIALS_PATH=./credentials/credentials.json
GMAIL_TOKEN_PATH=./credentials/token.json

# GitHub API
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# ============================================================================
# MOBILE INTEGRATION
# ============================================================================
IOS_SHORTCUTS_WEBHOOK_URL=https://your-domain.com/api/mobile/ios
ANDROID_TILES_WEBHOOK_URL=https://your-domain.com/api/mobile/android

# ============================================================================
# GAMIFICATION SETTINGS
# ============================================================================
XP_MULTIPLIER=1.0
STREAK_BONUS_ENABLED=true
ACHIEVEMENT_NOTIFICATIONS=true
LEADERBOARD_ENABLED=true

# ============================================================================
# FASTAPI CONFIGURATION
# ============================================================================
HOST=0.0.0.0
PORT=8000
RELOAD=true
WORKERS=1
API_V1_PREFIX=/api/v1
API_DOCS_URL=/docs
API_REDOC_URL=/redoc

# ============================================================================
# MONITORING & OBSERVABILITY
# ============================================================================
# Sentry Error Tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1

# Prometheus
PROMETHEUS_ENABLED=false
PROMETHEUS_PORT=9090

# Jaeger Tracing
JAEGER_ENABLED=false
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831

# ============================================================================
# SECURITY SETTINGS
# ============================================================================
# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60  # seconds

# Password Requirements
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true

# ============================================================================
# DEVELOPMENT/TESTING
# ============================================================================
TESTING=false
TEST_DATABASE_URL=sqlite:///./test.db
MOCK_EXTERNAL_APIS=false
ENABLE_DEBUG_TOOLBAR=false

# ============================================================================
# FRONTEND CONFIGURATION
# ============================================================================
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_DSN=
NEXT_TELEMETRY_DISABLED=1
```

### Environment-Specific Examples

#### Development (`.env`)

```bash
DEBUG=true
LOG_LEVEL=DEBUG
ENVIRONMENT=development

DATABASE_URL=sqlite:///./proxy_agent.db
REDIS_URL=redis://localhost:6379/0

LLM_PROVIDER=openai
OPENAI_API_KEY=sk-dev-key-here

RELOAD=true
WORKERS=1

PROMETHEUS_ENABLED=false
JAEGER_ENABLED=false
SENTRY_DSN=

MOCK_EXTERNAL_APIS=true
ENABLE_DEBUG_TOOLBAR=true
```

#### Staging (`.env.staging`)

```bash
DEBUG=false
LOG_LEVEL=INFO
ENVIRONMENT=staging

DATABASE_URL=postgresql://user:pass@staging-db:5432/proxy_agent_platform
REDIS_URL=redis://:password@staging-redis:6379/0

LLM_PROVIDER=openai
OPENAI_API_KEY=${OPENAI_API_KEY_STAGING}

RELOAD=false
WORKERS=4

PROMETHEUS_ENABLED=true
JAEGER_ENABLED=true
SENTRY_DSN=${SENTRY_DSN_STAGING}
SENTRY_ENVIRONMENT=staging

ALLOWED_HOSTS=staging.yourdomain.com
CORS_ORIGINS=https://staging.yourdomain.com

RATE_LIMIT_ENABLED=true
```

#### Production (`.env.production`)

```bash
DEBUG=false
LOG_LEVEL=WARNING
ENVIRONMENT=production

DATABASE_URL=postgresql://user:pass@prod-db:5432/proxy_agent_platform
REDIS_URL=redis://:password@prod-redis:6379/0

LLM_PROVIDER=openai
OPENAI_API_KEY=${OPENAI_API_KEY_PROD}

RELOAD=false
WORKERS=8

PROMETHEUS_ENABLED=true
JAEGER_ENABLED=true
SENTRY_DSN=${SENTRY_DSN_PROD}
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.01

ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com

RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_PERIOD=60

# Enhanced security
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
PASSWORD_MIN_LENGTH=12
```

## 🔐 Secrets Management

### Local Development

#### Using `.env` files (Development Only)

```bash
# Never commit actual secrets
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore

# Use .env.example as template
cp .env.example .env
```

### Production Secrets

#### AWS Secrets Manager

```bash
# Store secret
aws secretsmanager create-secret \
  --name proxy-agent-platform/production/database-url \
  --secret-string "postgresql://user:pass@host:5432/db"

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id proxy-agent-platform/production/database-url \
  --query SecretString \
  --output text
```

#### HashiCorp Vault

```bash
# Store secret
vault kv put secret/proxy-agent-platform/production \
  database_url="postgresql://..." \
  openai_api_key="sk-..."

# Retrieve secret
vault kv get -field=database_url secret/proxy-agent-platform/production
```

#### Docker Secrets

```yaml
# docker-compose.prod.yml
secrets:
  database_url:
    external: true
  openai_api_key:
    external: true

services:
  backend:
    secrets:
      - database_url
      - openai_api_key
    environment:
      DATABASE_URL_FILE: /run/secrets/database_url
      OPENAI_API_KEY_FILE: /run/secrets/openai_api_key
```

```bash
# Create secrets
echo "postgresql://..." | docker secret create database_url -
echo "sk-..." | docker secret create openai_api_key -
```

### Environment Variables from Secrets

```python
# src/config/settings.py
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    """Application settings with secret file support."""

    # Standard environment variables
    database_url: str
    openai_api_key: str

    # Support for Docker secrets (_FILE suffix)
    @property
    def get_database_url(self) -> str:
        if hasattr(self, 'database_url_file'):
            return Path(self.database_url_file).read_text().strip()
        return self.database_url

    @property
    def get_openai_api_key(self) -> str:
        if hasattr(self, 'openai_api_key_file'):
            return Path(self.openai_api_key_file).read_text().strip()
        return self.openai_api_key

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
```

## 🔌 Third-Party Services Configuration

### OpenAI Configuration

```bash
# Get API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...
OPENAI_ORGANIZATION=org-...  # Optional

# Test connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Anthropic (Claude) Configuration

```bash
# Get API key from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...

# Test connection
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-sonnet-20240229","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
```

### PostgreSQL Configuration

```bash
# Connection string format
DATABASE_URL=postgresql://[user[:password]@][host][:port]/database

# With connection pool settings
DATABASE_URL=postgresql://user:pass@host:5432/db?pool_size=20&max_overflow=10

# SSL mode (production)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Redis Configuration

```bash
# Simple connection
REDIS_URL=redis://localhost:6379/0

# With password
REDIS_URL=redis://:password@localhost:6379/0

# With SSL (production)
REDIS_URL=rediss://:password@host:6379/0
```

### Sentry Configuration

```bash
# Get DSN from https://sentry.io/settings/projects/
SENTRY_DSN=https://...@o...ingest.sentry.io/...
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions

# Test Sentry
python -c "import sentry_sdk; sentry_sdk.init('$SENTRY_DSN'); sentry_sdk.capture_message('Test')"
```

## 📊 Configuration Management Patterns

### Settings Class Pattern

```python
# src/config/settings.py
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    """Application settings with validation."""

    # App Settings
    app_name: str = "Proxy Agent Platform"
    debug: bool = False
    environment: str = "development"

    # Database
    database_url: str
    database_pool_size: int = 20
    database_max_overflow: int = 10

    # Redis
    redis_url: str
    redis_password: Optional[str] = None

    # LLM
    llm_provider: str = "openai"
    llm_model: str = "gpt-4"
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

    # Security
    secret_key: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30

    # Features
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100
    rate_limit_period: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

# Usage
settings = get_settings()
```

### Environment-Specific Configuration

```python
# src/config/environments.py
from enum import Enum
from typing import Dict, Any

class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class EnvironmentConfig:
    """Environment-specific configuration."""

    _configs: Dict[Environment, Dict[str, Any]] = {
        Environment.DEVELOPMENT: {
            "debug": True,
            "log_level": "DEBUG",
            "workers": 1,
            "reload": True,
        },
        Environment.STAGING: {
            "debug": False,
            "log_level": "INFO",
            "workers": 4,
            "reload": False,
        },
        Environment.PRODUCTION: {
            "debug": False,
            "log_level": "WARNING",
            "workers": 8,
            "reload": False,
        },
    }

    @classmethod
    def get_config(cls, env: Environment) -> Dict[str, Any]:
        """Get configuration for environment."""
        return cls._configs.get(env, cls._configs[Environment.DEVELOPMENT])
```

## 🔍 Configuration Validation

### Pre-flight Checks

```python
# src/config/validation.py
import sys
from src.config.settings import get_settings
import structlog

logger = structlog.get_logger()

def validate_configuration() -> bool:
    """Validate required configuration before startup."""
    settings = get_settings()
    errors = []

    # Check database URL
    if not settings.database_url:
        errors.append("DATABASE_URL is required")

    # Check LLM API keys
    if settings.llm_provider == "openai" and not settings.openai_api_key:
        errors.append("OPENAI_API_KEY is required when using OpenAI")
    elif settings.llm_provider == "anthropic" and not settings.anthropic_api_key:
        errors.append("ANTHROPIC_API_KEY is required when using Anthropic")

    # Check secret keys
    if settings.secret_key == "your-secret-key-here":
        errors.append("SECRET_KEY must be changed from default")

    # Production-specific checks
    if settings.environment == "production":
        if settings.debug:
            errors.append("DEBUG must be False in production")
        if "localhost" in settings.database_url:
            errors.append("DATABASE_URL should not use localhost in production")

    if errors:
        logger.error("Configuration validation failed", errors=errors)
        for error in errors:
            print(f"❌ {error}", file=sys.stderr)
        return False

    logger.info("Configuration validation passed")
    return True

# Usage in main.py
if not validate_configuration():
    sys.exit(1)
```

## 📚 Best Practices

### 1. Environment Variables
- Use `.env.example` as template (committed)
- Never commit actual `.env` files
- Use descriptive variable names
- Group related variables
- Document all variables

### 2. Secrets
- Never hardcode secrets
- Rotate secrets regularly
- Use different secrets per environment
- Minimize secret access
- Audit secret usage

### 3. Configuration
- Validate configuration at startup
- Use type hints and Pydantic
- Provide sensible defaults
- Document all settings
- Make configuration testable

### 4. Documentation
- Document all environment variables
- Provide setup instructions
- Include troubleshooting guide
- Keep documentation updated
- Add examples for each environment

## 🐛 Troubleshooting

### Common Issues

#### Environment variables not loading

```bash
# Check if .env file exists
ls -la .env

# Check file permissions
chmod 644 .env

# Verify variables are exported
export $(cat .env | xargs)
```

#### Database connection errors

```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1;"

# Test from Python
python -c "from sqlalchemy import create_engine; \
engine = create_engine('$DATABASE_URL'); \
conn = engine.connect(); print('Connected!')"
```

#### Redis connection errors

```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# Test from Python
python -c "import redis; \
r = redis.from_url('$REDIS_URL'); \
print(r.ping())"
```

## 📝 Next Steps

1. Copy `.env.example` to `.env` and fill in values
2. Set up third-party service accounts
3. Configure staging environment
4. Set up production secrets management
5. Test configuration validation
6. Document any custom configuration

## 📚 Additional Resources

- [Pydantic Settings Documentation](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [12-Factor App Configuration](https://12factor.net/config)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [HashiCorp Vault](https://www.vaultproject.io/)

---

**Last Updated**: 2025-10-25
**Maintained By**: DevOps Team
**Review Schedule**: Monthly
