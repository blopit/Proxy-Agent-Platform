# 🚀 Installation & Setup Guide

Complete installation guide for the Proxy Agent Platform - get up and running in minutes!

## 📋 System Requirements

### Minimum Requirements
- **OS**: macOS 10.15+, Ubuntu 20.04+, Windows 10+
- **Python**: 3.11 or higher
- **Memory**: 4GB RAM
- **Storage**: 2GB free space
- **Network**: Internet connection for AI providers

### Recommended Requirements
- **OS**: macOS 12+, Ubuntu 22.04+, Windows 11+
- **Python**: 3.12
- **Memory**: 8GB RAM
- **Storage**: 10GB free space (for ML models and data)
- **Database**: PostgreSQL 15+ (for production)
- **Cache**: Redis 7+ (for real-time features)

## 🛠️ Quick Installation

### Option 1: One-Command Setup (Recommended)

```bash
# Install and set up everything automatically
curl -sSL https://install.proxyagent.dev | bash
```

This script will:
- Install UV package manager
- Clone the repository
- Set up virtual environment
- Install all dependencies
- Configure basic settings
- Run initial setup

### Option 2: Manual Installation

#### Step 1: Install Prerequisites

**Install UV Package Manager:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc  # or restart terminal
```

**Install PostgreSQL (Optional but Recommended):**
```bash
# macOS (with Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Windows (with Chocolatey)
choco install postgresql15
```

**Install Redis (Optional for real-time features):**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# Windows
choco install redis-64
```

#### Step 2: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/proxy-agent-platform.git
cd proxy-agent-platform

# Create virtual environment
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv sync

# Install development tools (optional)
uv sync --group dev
```

#### Step 3: Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration (see Configuration section below)
nano .env  # or your preferred editor
```

#### Step 4: Database Setup

```bash
# Create database (PostgreSQL)
createdb proxy_agent_platform

# Or for testing with SQLite (no additional setup needed)
# The app will create the SQLite file automatically

# Run database migrations
uv run alembic upgrade head

# Create initial user (optional)
uv run python scripts/create_initial_user.py
```

#### Step 5: Verification

```bash
# Run tests to verify installation
uv run pytest tests/ -v

# Start the application
uv run uvicorn proxy_agent_platform.api.main:app --reload

# Test CLI interface
uv run proxy-agent --help
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following configuration:

```bash
# ============================================================================
# CORE APPLICATION SETTINGS
# ============================================================================

# Application
APP_NAME="Proxy Agent Platform"
VERSION="1.0.0"
DEBUG=false
LOG_LEVEL=INFO
SECRET_KEY=your_secret_key_here_make_it_long_and_random

# Server
HOST=0.0.0.0
PORT=8000
WORKERS=4

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

# Primary Database (choose one)
# PostgreSQL (recommended for production)
DATABASE_URL=postgresql://username:password@localhost:5432/proxy_agent_platform

# SQLite (good for development/testing)
# DATABASE_URL=sqlite:///./proxy_agent.db

# Database Connection Pool
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
DB_POOL_TIMEOUT=30

# ============================================================================
# REDIS CONFIGURATION (Optional but recommended)
# ============================================================================

REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=
REDIS_MAX_CONNECTIONS=50

# Session storage
SESSION_REDIS_URL=redis://localhost:6379/1

# Cache storage
CACHE_REDIS_URL=redis://localhost:6379/2

# ============================================================================
# AI PROVIDER CONFIGURATION (at least one required)
# ============================================================================

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ORG_ID=your_org_id_optional

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google AI
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_PROJECT_ID=your_project_id_optional

# Default AI provider (openai, anthropic, google)
DEFAULT_AI_PROVIDER=openai

# Model preferences
TASK_AGENT_MODEL=gpt-4
FOCUS_AGENT_MODEL=gpt-4
ENERGY_AGENT_MODEL=gpt-3.5-turbo
PROGRESS_AGENT_MODEL=gpt-4

# ============================================================================
# EXTERNAL INTEGRATIONS
# ============================================================================

# Email (for notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

# Calendar Integration
GOOGLE_CALENDAR_CREDENTIALS_FILE=path/to/google_credentials.json
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret

# Mobile Push Notifications
FCM_SERVER_KEY=your_firebase_server_key
APNS_KEY_ID=your_apple_key_id
APNS_TEAM_ID=your_apple_team_id
APNS_KEY_FILE=path/to/apns_key.p8

# ============================================================================
# SECURITY SETTINGS
# ============================================================================

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_different_from_main_secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS Settings
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
CORS_ALLOW_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_BURST=200

# ============================================================================
# MONITORING AND LOGGING
# ============================================================================

# Sentry (Error Tracking)
SENTRY_DSN=your_sentry_dsn_optional

# Logging
LOG_FORMAT=json
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10MB
LOG_BACKUP_COUNT=5

# Metrics
ENABLE_METRICS=true
METRICS_PORT=9090

# ============================================================================
# FEATURE FLAGS
# ============================================================================

# Features
ENABLE_VOICE_PROCESSING=true
ENABLE_MOBILE_SYNC=true
ENABLE_REAL_TIME_DASHBOARD=true
ENABLE_ML_PREDICTIONS=true
ENABLE_ADVANCED_ANALYTICS=true

# Experimental Features
ENABLE_FEDERATED_LEARNING=false
ENABLE_BLOCKCHAIN_SYNC=false

# ============================================================================
# PERFORMANCE SETTINGS
# ============================================================================

# Task Processing
MAX_CONCURRENT_TASKS=100
TASK_TIMEOUT_SECONDS=30

# ML Model Settings
MODEL_CACHE_SIZE=1000
PREDICTION_BATCH_SIZE=32
MODEL_UPDATE_INTERVAL_HOURS=24

# File Upload
MAX_UPLOAD_SIZE=10MB
ALLOWED_UPLOAD_TYPES=["png", "jpg", "jpeg", "gif", "pdf", "txt", "md"]
```

### API Keys Setup

#### OpenAI
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env` as `OPENAI_API_KEY`

#### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Generate an API key
3. Add to `.env` as `ANTHROPIC_API_KEY`

#### Google AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `.env` as `GOOGLE_API_KEY`

### Database Setup Options

#### Option 1: PostgreSQL (Recommended for Production)

```bash
# Install PostgreSQL
# (See platform-specific instructions above)

# Create user and database
sudo -u postgres psql
```

```sql
CREATE USER proxy_agent WITH PASSWORD 'your_secure_password';
CREATE DATABASE proxy_agent_platform OWNER proxy_agent;
GRANT ALL PRIVILEGES ON DATABASE proxy_agent_platform TO proxy_agent;
\q
```

```bash
# Update .env file
DATABASE_URL=postgresql://proxy_agent:your_secure_password@localhost:5432/proxy_agent_platform
```

#### Option 2: SQLite (Development/Testing)

```bash
# No additional setup required
# Just use in .env:
DATABASE_URL=sqlite:///./proxy_agent.db
```

#### Option 3: Docker Database

```bash
# Run PostgreSQL in Docker
docker run --name proxy-postgres \
  -e POSTGRES_DB=proxy_agent_platform \
  -e POSTGRES_USER=proxy_agent \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# Run Redis in Docker
docker run --name proxy-redis \
  -p 6379:6379 \
  -d redis:7-alpine

# Update .env
DATABASE_URL=postgresql://proxy_agent:your_password@localhost:5432/proxy_agent_platform
REDIS_URL=redis://localhost:6379
```

## 🚀 Running the Application

### Development Mode

```bash
# Start the API server with hot reload
uv run uvicorn proxy_agent_platform.api.main:app --reload --port 8000

# In another terminal, test the CLI
uv run proxy-agent task add "Test task from CLI"

# Run with debug logging
DEBUG=true uv run uvicorn proxy_agent_platform.api.main:app --reload --log-level debug
```

### Production Mode

```bash
# Install production dependencies
uv sync --no-dev

# Run with Gunicorn
uv run gunicorn proxy_agent_platform.api.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  -b 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -

# Or use the provided production script
chmod +x scripts/start_production.sh
./scripts/start_production.sh
```

### Docker Deployment

```bash
# Build the image
docker build -t proxy-agent-platform .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app
```

## 🧪 Verification & Testing

### Health Check

```bash
# Check API health
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","timestamp":"2024-10-07T..."}
```

### Run Test Suite

```bash
# Run all tests
uv run pytest tests/ -v

# Run with coverage
uv run pytest tests/ --cov=proxy_agent_platform --cov-report=html

# Run specific test categories
uv run pytest tests/ -m "not slow"  # Skip slow tests
uv run pytest tests/ -m "unit"      # Only unit tests
uv run pytest tests/ -m "integration"  # Only integration tests
```

### CLI Testing

```bash
# Test CLI commands
uv run proxy-agent --help
uv run proxy-agent task add "Test task"
uv run proxy-agent focus start --duration 25
uv run proxy-agent energy log 8
uv run proxy-agent progress show
```

### API Testing

```bash
# Test task capture
curl -X POST "http://localhost:8000/v1/agents/task/capture" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": "Test API task capture", "input_type": "text"}'

# Test health endpoints
curl http://localhost:8000/health
curl http://localhost:8000/metrics
```

## 📱 Mobile Setup

### iOS Integration

1. **Install iOS Shortcuts App** (pre-installed on iOS 13+)

2. **Import Proxy Agent Shortcuts:**
   ```bash
   # Generate iOS shortcuts
   uv run python scripts/generate_ios_shortcuts.py

   # This creates shortcuts.json with importable shortcuts
   ```

3. **Add shortcuts to iOS:**
   - Open the generated shortcuts file
   - Import each shortcut to the Shortcuts app
   - Configure with your API endpoint and token

### Android Integration

1. **Install Tasker** (or use built-in Google Assistant)

2. **Import Tasker Profiles:**
   ```bash
   # Generate Tasker profiles
   uv run python scripts/generate_android_profiles.py
   ```

3. **Configure Google Assistant:**
   - Set up custom phrases in Google Assistant
   - Link to webhook endpoints provided by the platform

## 🔧 Troubleshooting

### Common Issues

#### "ModuleNotFoundError: No module named 'proxy_agent_platform'"

```bash
# Ensure you're in the virtual environment
source .venv/bin/activate

# Reinstall dependencies
uv sync
```

#### "Database connection failed"

```bash
# Check database is running
# PostgreSQL:
pg_isready -h localhost -p 5432

# Check connection string in .env
echo $DATABASE_URL

# Test connection
uv run python -c "
from proxy_agent_platform.database import engine
import asyncio
async def test():
    async with engine.begin() as conn:
        result = await conn.execute('SELECT 1')
        print('Database connected successfully')
asyncio.run(test())
"
```

#### "Redis connection failed"

```bash
# Check Redis is running
redis-cli ping

# Should return: PONG

# Check Redis URL in .env
echo $REDIS_URL
```

#### "AI Provider authentication failed"

```bash
# Verify API keys
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Test API connection
uv run python -c "
from openai import OpenAI
client = OpenAI()
response = client.models.list()
print('OpenAI connection successful')
"
```

#### Permission Errors

```bash
# Fix file permissions
chmod +x scripts/*.sh

# Fix ownership (if needed)
sudo chown -R $USER:$USER .
```

### Performance Issues

#### Slow Startup

```bash
# Check database migration status
uv run alembic current
uv run alembic history

# Optimize database
uv run python scripts/optimize_database.py
```

#### High Memory Usage

```bash
# Monitor memory usage
uv run python scripts/memory_profiler.py

# Reduce ML model cache size in .env
MODEL_CACHE_SIZE=100
```

### Logging and Debugging

#### Enable Debug Logging

```bash
# Set in .env
DEBUG=true
LOG_LEVEL=DEBUG

# Or run with debug
DEBUG=true uv run uvicorn proxy_agent_platform.api.main:app --reload
```

#### Check Logs

```bash
# Application logs
tail -f logs/app.log

# Error logs only
tail -f logs/app.log | grep ERROR

# Real-time log viewing
uv run python scripts/log_viewer.py
```

## 🔄 Updates and Maintenance

### Updating the Platform

```bash
# Pull latest changes
git pull origin main

# Update dependencies
uv sync

# Run database migrations
uv run alembic upgrade head

# Restart services
./scripts/restart_services.sh
```

### Backup and Recovery

```bash
# Backup database
uv run python scripts/backup_database.py

# Backup user data
uv run python scripts/backup_user_data.py

# Restore from backup
uv run python scripts/restore_backup.py backup_file.sql
```

### Health Monitoring

```bash
# Check system health
uv run python scripts/health_check.py

# Performance monitoring
uv run python scripts/performance_monitor.py

# Generate health report
uv run python scripts/generate_health_report.py
```

## 💡 Next Steps

Once installation is complete:

1. **📖 Read the [User Guide](user-guide/README.md)** to learn how to use all features
2. **🔧 Check the [API Documentation](api/README.md)** for integration details
3. **📱 Set up [Mobile Integration](components/mobile-integration.md)** for on-the-go access
4. **🎯 Explore [Advanced Features](user-guide/advanced-features.md)** like ML predictions
5. **🤝 Join the [Community](https://discord.gg/proxy-agent)** for support and tips

## 🆘 Getting Help

- **📖 Documentation**: [docs.proxyagent.dev](https://docs.proxyagent.dev)
- **💬 Community**: [Discord Server](https://discord.gg/proxy-agent)
- **🐛 Issues**: [GitHub Issues](https://github.com/yourusername/proxy-agent-platform/issues)
- **📧 Support**: [support@proxyagent.dev](mailto:support@proxyagent.dev)

---

**🎉 Congratulations!** You now have a fully functional Proxy Agent Platform ready to transform your productivity. Start by capturing your first task with the 2-second capture feature!