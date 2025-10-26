# Production Deployment Guide

> **Complete guide for deploying the Proxy Agent Platform to production environments**

## 🎯 Overview

This guide covers the complete deployment process for the Proxy Agent Platform, including infrastructure setup, deployment procedures, verification, and rollback strategies.

## 📋 Table of Contents

1. [Infrastructure Requirements](#infrastructure-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Procedures](#deployment-procedures)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Troubleshooting](#troubleshooting)

## 🏗️ Infrastructure Requirements

### Minimum Requirements

#### Production Environment
- **Backend Server**: 4 vCPUs, 8GB RAM, 100GB SSD
- **Frontend Server**: 2 vCPUs, 4GB RAM, 50GB SSD
- **Database Server**: 4 vCPUs, 16GB RAM, 200GB SSD (PostgreSQL 13+)
- **Cache Server**: 2 vCPUs, 4GB RAM, 20GB SSD (Redis 7+)
- **Load Balancer**: 2 vCPUs, 2GB RAM

#### Staging Environment
- **Combined Server**: 4 vCPUs, 16GB RAM, 150GB SSD
- Can run all services on a single server

### Recommended Cloud Providers

#### AWS
```yaml
Backend: EC2 t3.large
Frontend: EC2 t3.medium
Database: RDS db.t3.large (PostgreSQL 13)
Cache: ElastiCache cache.t3.medium (Redis 7)
Load Balancer: Application Load Balancer
```

#### Google Cloud Platform
```yaml
Backend: e2-standard-4
Frontend: e2-standard-2
Database: Cloud SQL db-custom-4-16384
Cache: Memorystore 4GB
Load Balancer: Cloud Load Balancing
```

#### DigitalOcean
```yaml
Backend: 8GB/4 vCPU Droplet
Frontend: 4GB/2 vCPU Droplet
Database: Managed PostgreSQL - 4GB/2 vCPU
Cache: Managed Redis - 4GB
Load Balancer: DigitalOcean Load Balancer
```

## 🔧 Server Provisioning

### Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    git \
    curl \
    wget \
    vim \
    htop \
    ufw \
    fail2ban \
    unattended-upgrades

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Create Application User

```bash
# Create dedicated application user
sudo useradd -m -s /bin/bash proxyagent
sudo usermod -aG docker proxyagent

# Set up application directory
sudo mkdir -p /opt/proxy-agent-platform
sudo chown proxyagent:proxyagent /opt/proxy-agent-platform

# Set up backup directory
sudo mkdir -p /backups
sudo chown proxyagent:proxyagent /backups
```

### Configure SSH Access

```bash
# Generate SSH key pair on your local machine
ssh-keygen -t ed25519 -C "deploy@proxy-agent-platform" -f ~/.ssh/proxy_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/proxy_deploy.pub proxyagent@your-server-ip

# Configure SSH (on server)
sudo vim /etc/ssh/sshd_config
```

Add/modify these settings:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers proxyagent
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

## ✅ Pre-Deployment Checklist

### Code Readiness
- [ ] All tests passing (pytest, jest)
- [ ] Code reviewed and approved
- [ ] Security scans completed (Bandit, npm audit)
- [ ] Type checks passing (MyPy, TypeScript)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

### Database Readiness
- [ ] Database migrations tested in staging
- [ ] Backup plan verified
- [ ] Migration rollback tested
- [ ] Database indexes optimized
- [ ] No blocking migrations

### Infrastructure Readiness
- [ ] SSL certificates valid and renewed
- [ ] DNS records configured
- [ ] Load balancer health checks configured
- [ ] Monitoring and alerting active
- [ ] Backup systems verified
- [ ] Firewall rules configured

### Environment Configuration
- [ ] Production `.env` file reviewed
- [ ] Secrets rotated and updated
- [ ] API keys validated
- [ ] Third-party service limits checked
- [ ] Rate limiting configured

### Communication
- [ ] Stakeholders notified of deployment window
- [ ] Support team briefed on changes
- [ ] Rollback plan communicated
- [ ] Emergency contacts updated

## 🚀 Deployment Procedures

### 1. Initial Production Setup

```bash
# SSH into server
ssh proxyagent@your-server-ip

# Clone repository
cd /opt
sudo git clone https://github.com/yourusername/proxy-agent-platform.git
sudo chown -R proxyagent:proxyagent proxy-agent-platform
cd proxy-agent-platform

# Checkout production branch
git checkout main

# Create production environment file
cp .env.example .env.production
vim .env.production
```

Edit `.env.production` with production values:
```bash
# Production Configuration
APP_NAME=Proxy Agent Platform
DEBUG=false
LOG_LEVEL=INFO
SECRET_KEY=<generate-secure-random-key>

# Database
DATABASE_URL=postgresql://user:password@postgres-host:5432/proxy_agent_platform
REDIS_URL=redis://:password@redis-host:6379/0

# AI Providers
LLM_PROVIDER=openai
LLM_API_KEY=sk-prod-...
LLM_MODEL=gpt-4

# Production URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Security
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
PROMETHEUS_ENABLED=true
```

### 2. Build and Start Services

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Run Database Migrations

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Verify migration
docker-compose -f docker-compose.prod.yml exec backend alembic current
```

### 4. Initialize Application Data

```bash
# Create initial admin user
docker-compose -f docker-compose.prod.yml exec backend uv run python scripts/create_admin.py

# Load initial data (if needed)
docker-compose -f docker-compose.prod.yml exec backend uv run python scripts/load_initial_data.py
```

### 5. Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/proxy-agent-platform`:

```nginx
# Backend API
upstream backend {
    server localhost:8000;
}

# Frontend
upstream frontend {
    server localhost:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Frontend HTTPS
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API HTTPS
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req zone=api_limit burst=200 nodelay;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS (if needed)
        add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/proxy-agent-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Set up auto-renewal cron
sudo crontab -e
```

Add:
```cron
0 0 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

## ✔️ Post-Deployment Verification

### Automated Health Checks

```bash
# Backend health check
curl -f https://api.yourdomain.com/health

# Expected response:
# {"status":"healthy","timestamp":"...","services":{"database":"connected","redis":"connected"}}

# Frontend accessibility
curl -I https://yourdomain.com

# Expected: HTTP/2 200
```

### Manual Verification Checklist

- [ ] All containers running: `docker-compose -f docker-compose.prod.yml ps`
- [ ] No errors in logs: `docker-compose -f docker-compose.prod.yml logs --tail=100`
- [ ] Database connections working
- [ ] Redis cache operational
- [ ] SSL certificates valid
- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Background tasks running (Celery)
- [ ] Monitoring dashboards updating
- [ ] Alerts configured

### Performance Testing

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 https://api.yourdomain.com/health

# Load test with wrk
wrk -t4 -c100 -d30s https://api.yourdomain.com/api/v1/tasks

# Monitor resource usage
docker stats
```

### Security Verification

```bash
# SSL test
curl https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

# Security headers
curl -I https://yourdomain.com

# Check for exposed ports
sudo nmap -sT -O localhost
```

## 🔄 Deployment Strategies

### Zero-Downtime Deployment

```bash
# 1. Pull latest changes
git pull origin main

# 2. Build new images with different tag
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Start new containers alongside old ones
docker-compose -f docker-compose.prod.yml up -d --scale backend=2 --no-recreate

# 4. Run health checks on new containers
# Wait for new containers to be healthy

# 5. Switch traffic to new containers (via load balancer)
# Update load balancer configuration

# 6. Gracefully stop old containers
docker-compose -f docker-compose.prod.yml stop old-backend

# 7. Remove old containers
docker-compose -f docker-compose.prod.yml rm -f old-backend
```

### Rolling Updates

```bash
# Update services one at a time
for service in backend frontend celery-worker; do
    echo "Updating $service..."
    docker-compose -f docker-compose.prod.yml up -d --no-deps --build $service
    sleep 30  # Wait for health check
done
```

## ⏮️ Rollback Procedures

### Quick Rollback (Docker Images)

```bash
# View previous images
docker images | grep proxy-agent-platform

# Rollback to previous tag
docker-compose -f docker-compose.prod.yml down
docker tag proxy-agent-platform/backend:previous proxy-agent-platform/backend:latest
docker tag proxy-agent-platform/frontend:previous proxy-agent-platform/frontend:latest
docker-compose -f docker-compose.prod.yml up -d
```

### Git-Based Rollback

```bash
# Find commit to rollback to
git log --oneline -10

# Rollback code
git reset --hard <commit-hash>

# Rebuild and redeploy
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Migration Rollback

```bash
# View migration history
docker-compose -f docker-compose.prod.yml exec backend alembic history

# Rollback one migration
docker-compose -f docker-compose.prod.yml exec backend alembic downgrade -1

# Rollback to specific revision
docker-compose -f docker-compose.prod.yml exec backend alembic downgrade <revision>
```

### Full System Rollback

```bash
# 1. Stop services
docker-compose -f docker-compose.prod.yml down

# 2. Restore database from backup
docker-compose -f docker-compose.prod.yml exec postgres \
    psql -U postgres proxy_agent_platform < /backups/backup_YYYYMMDD_HHMMSS.sql

# 3. Checkout previous code version
git checkout <previous-tag>

# 4. Rebuild and start
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Verify rollback
curl https://api.yourdomain.com/health
```

## 🐛 Troubleshooting

### Common Deployment Issues

#### Services won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -m

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### Database connection errors
```bash
# Test database connectivity
docker-compose -f docker-compose.prod.yml exec backend \
    python -c "from sqlalchemy import create_engine; \
    engine = create_engine('$DATABASE_URL'); \
    conn = engine.connect(); \
    print('Connected!')"

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

#### SSL certificate issues
```bash
# Renew certificates
sudo certbot renew --force-renewal

# Test certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

#### High memory usage
```bash
# View container resource usage
docker stats

# Restart high-memory containers
docker-compose -f docker-compose.prod.yml restart backend

# Check for memory leaks in logs
docker-compose -f docker-compose.prod.yml logs backend | grep -i "memory"
```

## 📊 Deployment Monitoring

### Key Metrics to Monitor

1. **Application Metrics**
   - Response time (p50, p95, p99)
   - Error rate
   - Request throughput
   - Active connections

2. **Infrastructure Metrics**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

3. **Business Metrics**
   - User signups
   - Task completions
   - API usage
   - Feature adoption

### Setting Up Alerts

```yaml
# Example alert rules (Prometheus)
groups:
  - name: proxy-agent-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        annotations:
          summary: "Container memory usage > 90%"
```

## 📝 Deployment Runbook

### Standard Deployment (During Business Hours)

1. **T-30 minutes**: Notify stakeholders
2. **T-15 minutes**: Run pre-deployment checks
3. **T-10 minutes**: Create database backup
4. **T-5 minutes**: Put application in maintenance mode (optional)
5. **T-0**: Begin deployment
6. **T+5**: Run post-deployment verification
7. **T+10**: Monitor for issues
8. **T+30**: Send completion notification

### Emergency Hotfix Deployment

1. Create hotfix branch from main
2. Make minimal required changes
3. Run tests
4. Deploy directly to production
5. Monitor closely
6. Backport fix to develop

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)

## 📝 Next Steps

1. Set up [monitoring and observability](./monitoring.md)
2. Configure [backup and recovery](./backup-recovery.md)
3. Implement [incident response procedures](./incident-response.md)
4. Review [security practices](./security.md)

---

**Last Updated**: 2025-10-25
**Maintained By**: DevOps Team
**Review Schedule**: Monthly
