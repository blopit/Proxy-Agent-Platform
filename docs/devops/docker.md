# Docker Containerization Guide

> **Complete guide for containerizing and orchestrating the Proxy Agent Platform**

## 🎯 Overview

This guide covers the containerization strategy for the Proxy Agent Platform, including:
- Backend (FastAPI + Python 3.11) containerization
- Frontend (Next.js 15) containerization
- Service orchestration with Docker Compose
- Development vs Production configurations
- Best practices and troubleshooting

## 📦 Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network (proxy-network)          │
│                                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   Frontend   │   │   Backend    │   │  PostgreSQL  │   │
│  │  Next.js 15  │   │  FastAPI     │   │     13+      │   │
│  │  Port: 3000  │   │  Port: 8000  │   │  Port: 5432  │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│         │                   │                   │            │
│         └─────────┬─────────┴───────────────────┘           │
│                   │                                          │
│         ┌─────────▼─────────┐      ┌──────────────┐        │
│         │      Redis        │      │  ML Models   │        │
│         │    Port: 6379     │      │   (Volume)   │        │
│         └───────────────────┘      └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Backend Dockerfile

### Development Dockerfile (`Dockerfile`)

Create this file in the project root:

```dockerfile
# Dockerfile
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install UV package manager
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy application code
COPY src/ ./src/
COPY alembic.ini ./
COPY migrations/ ./migrations/

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Dockerfile (`Dockerfile.prod`)

```dockerfile
# Dockerfile.prod
FROM python:3.11-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1

RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Production stage
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY src/ ./src/
COPY alembic.ini ./
COPY migrations/ ./migrations/

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Backend .dockerignore

Create `.dockerignore` in the project root:

```gitignore
# .dockerignore

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.venv/
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/
.hypothesis/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Documentation
docs/
*.md
!README.md

# Git
.git/
.gitignore
.gitattributes

# CI/CD
.github/
.gitlab-ci.yml

# Frontend
frontend/
node_modules/

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log
logs/

# Reference materials
references/
reports/
workflows/
```

## 🎨 Frontend Dockerfile

### Development Dockerfile (`frontend/Dockerfile`)

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Development image
FROM base AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### Production Dockerfile (`frontend/Dockerfile.prod`)

```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Frontend .dockerignore

Create `frontend/.dockerignore`:

```gitignore
# frontend/.dockerignore

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build
dist

# Production
.vercel

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Storybook
storybook-static/
.storybook-out/
```

## 🔧 Docker Compose Configuration

### Development Configuration (`docker-compose.yml`)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:13-alpine
    container_name: proxy-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DATABASE_NAME:-proxy_agent_platform}
      POSTGRES_USER: ${DATABASE_USER:-postgres}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - proxy-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: proxy-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - proxy-network

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: proxy-backend
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://${DATABASE_USER:-postgres}:${DATABASE_PASSWORD:-postgres}@postgres:5432/${DATABASE_NAME:-proxy_agent_platform}
      REDIS_URL: redis://redis:6379/0
      HOST: 0.0.0.0
      PORT: 8000
      RELOAD: "true"
    ports:
      - "8000:8000"
    volumes:
      - ./src:/app/src:ro
      - ./migrations:/app/migrations:ro
      - ./alembic.ini:/app/alembic.ini:ro
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - proxy-network

  # Frontend Web App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: proxy-frontend
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000
      NODE_ENV: development
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src:ro
      - ./frontend/public:/app/public:ro
    depends_on:
      - backend
    networks:
      - proxy-network

  # Celery Worker (Background Tasks)
  celery-worker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: proxy-celery-worker
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://${DATABASE_USER:-postgres}:${DATABASE_PASSWORD:-postgres}@postgres:5432/${DATABASE_NAME:-proxy_agent_platform}
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: redis://redis:6379/1
      CELERY_RESULT_BACKEND: redis://redis:6379/2
    command: uv run celery -A src.workers.celery_app worker --loglevel=info
    volumes:
      - ./src:/app/src:ro
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - proxy-network

  # Celery Beat (Scheduled Tasks)
  celery-beat:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: proxy-celery-beat
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://${DATABASE_USER:-postgres}:${DATABASE_PASSWORD:-postgres}@postgres:5432/${DATABASE_NAME:-proxy_agent_platform}
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: redis://redis:6379/1
      CELERY_RESULT_BACKEND: redis://redis:6379/2
    command: uv run celery -A src.workers.celery_app beat --loglevel=info
    volumes:
      - ./src:/app/src:ro
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - proxy-network

networks:
  proxy-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

### Production Configuration (`docker-compose.prod.yml`)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: proxy-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_volume:/app/static:ro
    depends_on:
      - backend
      - frontend
    networks:
      - proxy-network

  # PostgreSQL Database
  postgres:
    image: postgres:13-alpine
    container_name: proxy-postgres
    restart: always
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - proxy-network
    # Do not expose port in production (internal only)

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: proxy-redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - proxy-network
    # Do not expose port in production (internal only)

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: proxy-backend
    restart: always
    env_file:
      - .env.production
    environment:
      DATABASE_URL: postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      HOST: 0.0.0.0
      PORT: 8000
      WORKERS: 4
    volumes:
      - static_volume:/app/static
      - media_volume:/app/media
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - proxy-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  # Frontend Web App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: proxy-frontend
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com
      NODE_ENV: production
    depends_on:
      - backend
    networks:
      - proxy-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  # Celery Worker
  celery-worker:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: proxy-celery-worker
    restart: always
    env_file:
      - .env.production
    environment:
      DATABASE_URL: postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      CELERY_BROKER_URL: redis://:${REDIS_PASSWORD}@redis:6379/1
      CELERY_RESULT_BACKEND: redis://:${REDIS_PASSWORD}@redis:6379/2
    command: celery -A src.workers.celery_app worker --loglevel=info --concurrency=4
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - proxy-network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G

  # Celery Beat
  celery-beat:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: proxy-celery-beat
    restart: always
    env_file:
      - .env.production
    environment:
      DATABASE_URL: postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      CELERY_BROKER_URL: redis://:${REDIS_PASSWORD}@redis:6379/1
      CELERY_RESULT_BACKEND: redis://:${REDIS_PASSWORD}@redis:6379/2
    command: celery -A src.workers.celery_app beat --loglevel=info
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - proxy-network

networks:
  proxy-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  static_volume:
    driver: local
  media_volume:
    driver: local
```

## 🚀 Usage Guide

### Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build

# Run database migrations
docker-compose exec backend uv run alembic upgrade head

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec postgres psql -U postgres -d proxy_agent_platform

# Run tests
docker-compose exec backend uv run pytest
```

### Production Environment

```bash
# Build and start production environment
docker-compose -f docker-compose.prod.yml up -d --build

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Scale celery workers
docker-compose -f docker-compose.prod.yml up -d --scale celery-worker=4

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres proxy_agent_platform > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres proxy_agent_platform < backup.sql
```

## 🔍 Health Checks

### Backend Health Endpoint

All containers use health checks to ensure services are running correctly:

```bash
# Check backend health
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-25T10:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Container Health Status

```bash
# View health status of all containers
docker-compose ps

# Detailed health check
docker inspect --format='{{.State.Health.Status}}' proxy-backend
```

## 🛡️ Best Practices

### Security

1. **Never commit secrets** - Use `.env` files and add them to `.gitignore`
2. **Use non-root users** - All containers run as non-root users
3. **Minimize attack surface** - Multi-stage builds reduce image size
4. **Scan for vulnerabilities** - Use `docker scan` regularly
5. **Update base images** - Keep Python and Node.js versions updated

### Performance

1. **Layer caching** - Copy dependency files before application code
2. **Multi-stage builds** - Reduce final image size
3. **Resource limits** - Set memory and CPU limits in production
4. **Health checks** - Ensure services are truly ready before accepting traffic
5. **Volume mounts** - Use volumes for persistent data

### Development Workflow

1. **Hot reload** - Mount source code as volumes in development
2. **Consistent environments** - Use same Docker images across team
3. **Isolated testing** - Use `docker-compose.test.yml` for test environment
4. **Fast rebuilds** - Leverage Docker layer caching

## 🐛 Troubleshooting

### Common Issues

#### Container won't start

```bash
# Check container logs
docker-compose logs backend

# Check all container status
docker-compose ps

# Force rebuild
docker-compose up -d --build --force-recreate
```

#### Database connection errors

```bash
# Check if postgres is healthy
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Test connection manually
docker-compose exec backend uv run python -c "from sqlalchemy import create_engine; engine = create_engine('postgresql://postgres:postgres@postgres:5432/proxy_agent_platform'); conn = engine.connect(); print('Connected!')"
```

#### Port already in use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
docker-compose up -d -p 8001:8000
```

#### Out of disk space

```bash
# Clean up unused Docker resources
docker system prune -a --volumes

# View disk usage
docker system df

# Remove specific volumes
docker volume rm proxy-agent-platform_postgres_data
```

#### Slow builds

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Clear build cache
docker builder prune

# Parallel builds
docker-compose build --parallel
```

## 📊 Monitoring

### Container Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats proxy-backend

# One-time snapshot
docker stats --no-stream
```

### Logs Management

```bash
# Follow logs from all services
docker-compose logs -f

# Logs from specific time
docker-compose logs --since 30m backend

# Save logs to file
docker-compose logs > logs/docker-compose-$(date +%Y%m%d).log

# Limit log output
docker-compose logs --tail=100 backend
```

## 🔄 CI/CD Integration

### GitHub Actions Example

See [CI/CD documentation](./cicd.md) for complete GitHub Actions workflow that:
- Builds Docker images
- Runs tests in containers
- Pushes to Docker Hub / GitHub Container Registry
- Deploys to production

### Image Tagging Strategy

```bash
# Development
docker tag proxy-agent-platform:latest proxy-agent-platform:dev

# Staging
docker tag proxy-agent-platform:latest proxy-agent-platform:staging-$(git rev-parse --short HEAD)

# Production
docker tag proxy-agent-platform:latest proxy-agent-platform:v1.0.0
docker tag proxy-agent-platform:latest proxy-agent-platform:latest
```

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Python Docker Best Practices](https://docs.docker.com/language/python/configure-ci-cd/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)

## 📝 Next Steps

1. Create actual Dockerfile and docker-compose.yml files from these templates
2. Set up [CI/CD pipeline](./cicd.md) for automated builds
3. Configure [monitoring and observability](./monitoring.md)
4. Implement [backup and recovery procedures](./backup-recovery.md)
5. Set up [production deployment](./deployment.md)

---

**Last Updated**: 2025-10-25
**Maintained By**: DevOps Team
**Review Schedule**: Monthly
