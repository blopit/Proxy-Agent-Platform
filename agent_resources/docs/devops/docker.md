# Docker Setup Guide

This guide explains how to run the Proxy Agent Platform using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)

## Quick Start

### Production Mode

Run the full stack in production mode:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services:
- **API**: http://localhost:8000
- **Redis**: localhost:6379

### Development Mode

Run with hot-reloading and development tools:

```bash
# Build and start development stack
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

Services:
- **API** (with reload): http://localhost:8000
- **Redis**: localhost:6379
- **Redis Commander**: http://localhost:8081

## Docker Commands

### Building

```bash
# Build the API image
docker build -t proxy-agent-api .

# Build without cache
docker build --no-cache -t proxy-agent-api .
```

### Running Individual Services

```bash
# Run only the API
docker-compose up api

# Run API and Redis
docker-compose up api redis

# Run with frontend (requires frontend Dockerfile)
docker-compose --profile full up
```

### Managing Containers

```bash
# List running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f api

# Execute commands in running container
docker-compose exec api bash
docker-compose exec api uv run pytest src/

# Restart a service
docker-compose restart api

# Stop and remove containers, networks, volumes
docker-compose down -v
```

### Database Management

```bash
# Access SQLite database in container
docker-compose exec api sqlite3 .data/databases/proxy_agents_enhanced.db

# Backup database
docker-compose exec api cp .data/databases/proxy_agents_enhanced.db \
  .data/databases/backup.db

# Copy database from container to host
docker cp proxy-agent-api:/app/.data/databases/proxy_agents_enhanced.db \
  ./backup.db
```

### Debugging

```bash
# View API logs
docker-compose logs -f api

# Check API health
curl http://localhost:8000/health

# Enter container shell
docker-compose exec api bash

# Run tests inside container
docker-compose exec api uv run pytest src/ -v

# Check environment variables
docker-compose exec api env
```

## Environment Variables

Configure services using environment variables in `docker-compose.yml` or create a `.env` file:

```env
# Database
DATABASE_URL=sqlite:////app/.data/databases/proxy_agents_enhanced.db

# Redis
REDIS_URL=redis://redis:6379

# API
LOG_LEVEL=INFO
RELOAD=false

# Optional: External services
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Volumes

Data is persisted in Docker volumes:

- `data-volume`: Application data (databases, logs)
- `redis-data`: Redis persistence

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect proxy-agent-platform_data-volume

# Remove volumes (CAUTION: deletes data)
docker-compose down -v

# Backup volume
docker run --rm -v proxy-agent-platform_data-volume:/data \
  -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
```

## Profiles

Docker Compose profiles allow running different service combinations:

```bash
# Run API + Redis only (default)
docker-compose up

# Run full stack including frontend
docker-compose --profile full up

# Run with development tools (Storybook, Redis UI)
docker-compose --profile dev up
```

## Health Checks

The API includes a health check endpoint:

```bash
# Check API health
curl http://localhost:8000/health

# View health check status
docker inspect --format='{{json .State.Health}}' proxy-agent-api | jq
```

## Performance Tuning

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Multi-stage Build

The Dockerfile uses multi-stage builds to minimize image size:

- **Builder stage**: Installs dependencies
- **Final stage**: Only runtime dependencies and application code

Current image size: ~200MB (compared to ~1GB without multi-stage)

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8000
lsof -i :8000

# Use different port
docker-compose up -e API_PORT=8001
```

### Database Locked

```bash
# Stop all containers accessing database
docker-compose down

# Remove lock file
docker-compose exec api rm -f .data/databases/*.db-shm
docker-compose exec api rm -f .data/databases/*.db-wal

# Restart
docker-compose up -d
```

### Container Won't Start

```bash
# View full logs
docker-compose logs api

# Check container status
docker-compose ps -a

# Remove and rebuild
docker-compose down
docker-compose build --no-cache api
docker-compose up api
```

### Out of Disk Space

```bash
# Clean up unused images
docker image prune -a

# Clean up unused volumes
docker volume prune

# Clean up everything (CAUTION)
docker system prune -a --volumes
```

## CI/CD Integration

The Docker setup integrates with GitHub Actions:

```yaml
# Build and test in CI
- name: Build Docker image
  run: docker build -t proxy-agent-api .

- name: Run tests in container
  run: docker run proxy-agent-api uv run pytest src/
```

## Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml proxy-agent

# Scale service
docker service scale proxy-agent_api=3
```

### Kubernetes

Convert docker-compose to Kubernetes manifests:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose

# Convert
kompose convert -f docker-compose.yml
```

## Security Best Practices

1. **Don't run as root**: Add user in Dockerfile
2. **Scan images**: Use `docker scan proxy-agent-api`
3. **Update base images**: Regularly rebuild with latest base
4. **Secrets management**: Use Docker secrets or environment files
5. **Network isolation**: Use custom networks (already configured)

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## Support

For issues with Docker setup:
1. Check logs: `docker-compose logs -f`
2. Verify configuration: `docker-compose config`
3. Create issue with logs and `docker version` output
