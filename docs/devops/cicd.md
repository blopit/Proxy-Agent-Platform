# CI/CD Pipeline Documentation

> **Continuous Integration and Continuous Deployment guide for the Proxy Agent Platform**

## 🎯 Overview

This guide covers the complete CI/CD strategy for automated testing, building, and deployment of the Proxy Agent Platform using GitHub Actions.

## 📋 CI/CD Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        Git Push / Pull Request                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────▼────────────┐
                │   GitHub Actions         │
                │   Workflow Triggered     │
                └────────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  Lint & Format │  │  Type Check    │  │  Security Scan │
│  (Ruff, ESLint)│  │  (MyPy, TSC)   │  │  (Bandit, etc) │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Run Tests      │
                    │   (Pytest, Jest) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Build Docker    │
                    │  Images          │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Push to Registry│
                    │  (GHCR/DockerHub)│
                    └────────┬────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
┌───────▼────────┐                       ┌───────▼────────┐
│  Deploy to      │                       │  Deploy to      │
│  Staging        │                       │  Production     │
│  (Auto)         │                       │  (Manual)       │
└────────────────┘                       └────────────────┘
```

## 🔧 Workflow Files

### Main CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  PYTHON_VERSION: "3.11"
  NODE_VERSION: "18"
  UV_VERSION: "latest"

jobs:
  # Backend Linting and Formatting
  backend-lint:
    name: Backend Lint & Format
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: uv sync --frozen

      - name: Run Ruff linter
        run: uv run ruff check .

      - name: Run Ruff formatter
        run: uv run ruff format --check .

      - name: Check imports
        run: uv run ruff check --select I .

  # Backend Type Checking
  backend-typecheck:
    name: Backend Type Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: uv sync --frozen

      - name: Run MyPy
        run: uv run mypy src/

  # Backend Security Scanning
  backend-security:
    name: Backend Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: uv sync --frozen --group dev

      - name: Run Bandit security linter
        run: uv run bandit -r src/

      - name: Run Safety check
        run: uv run safety check

  # Backend Tests
  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: proxy_agent_platform_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: uv sync --frozen --group dev

      - name: Run tests with coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/proxy_agent_platform_test
          REDIS_URL: redis://localhost:6379/0
          TESTING: "true"
        run: |
          uv run pytest --cov=src --cov-report=xml --cov-report=html --cov-report=term-missing

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml
          flags: backend
          name: backend-coverage

      - name: Upload coverage artifacts
        uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: htmlcov/

  # Frontend Linting and Formatting
  frontend-lint:
    name: Frontend Lint & Format
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run type-check

  # Frontend Tests
  frontend-test:
    name: Frontend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./frontend/coverage/coverage-final.json
          flags: frontend
          name: frontend-coverage

  # Build Backend Docker Image
  build-backend:
    name: Build Backend Docker Image
    runs-on: ubuntu-latest
    needs: [backend-lint, backend-typecheck, backend-security, backend-test]
    if: github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/backend
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.prod
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Build Frontend Docker Image
  build-frontend:
    name: Build Frontend Docker Image
    runs-on: ubuntu-latest
    needs: [frontend-lint, frontend-test]
    if: github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/frontend
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile.prod
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Deployment Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy

on:
  push:
    branches: [main]
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - staging
          - production

env:
  PYTHON_VERSION: "3.11"
  NODE_VERSION: "18"

jobs:
  # Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' || (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'staging')
    environment:
      name: staging
      url: https://staging.yourdomain.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.STAGING_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.STAGING_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy to staging server
        run: |
          ssh ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} << 'EOF'
            cd /opt/proxy-agent-platform
            git pull origin develop
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d --no-deps --build
            docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head
          EOF

      - name: Run smoke tests
        run: |
          curl -f https://staging.yourdomain.com/health || exit 1

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: 'Staging deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  # Deploy to Production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'production')
    environment:
      name: production
      url: https://yourdomain.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.PRODUCTION_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.PRODUCTION_HOST }} >> ~/.ssh/known_hosts

      - name: Create backup
        run: |
          ssh ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            cd /opt/proxy-agent-platform
            docker-compose -f docker-compose.prod.yml exec -T postgres \
              pg_dump -U postgres proxy_agent_platform > /backups/backup_$(date +%Y%m%d_%H%M%S).sql
          EOF

      - name: Deploy to production server
        run: |
          ssh ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            cd /opt/proxy-agent-platform
            git pull origin main
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d --no-deps --build
            docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head
          EOF

      - name: Run smoke tests
        run: |
          curl -f https://yourdomain.com/health || exit 1

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: 'Production deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Rollback on failure
        if: failure()
        run: |
          ssh ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            cd /opt/proxy-agent-platform
            git reset --hard HEAD~1
            docker-compose -f docker-compose.prod.yml up -d --no-deps --build
          EOF
```

### Database Migration Workflow (`.github/workflows/migrations.yml`)

```yaml
name: Database Migrations

on:
  pull_request:
    paths:
      - 'migrations/**'
      - 'alembic.ini'

jobs:
  check-migrations:
    name: Check Database Migrations
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: proxy_agent_platform_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: uv sync --frozen

      - name: Run migrations
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/proxy_agent_platform_test
        run: |
          uv run alembic upgrade head

      - name: Check for migration conflicts
        run: |
          uv run alembic check

      - name: Downgrade and upgrade test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/proxy_agent_platform_test
        run: |
          uv run alembic downgrade -1
          uv run alembic upgrade head
```

### Release Workflow (`.github/workflows/release.yml`)

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  create-release:
    name: Create Release
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        run: |
          # Generate changelog from commits
          PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
          if [ -z "$PREVIOUS_TAG" ]; then
            CHANGELOG=$(git log --pretty=format:"- %s (%h)" --no-merges)
          else
            CHANGELOG=$(git log $PREVIOUS_TAG..HEAD --pretty=format:"- %s (%h)" --no-merges)
          fi
          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            ## Changes in this Release
            ${{ steps.changelog.outputs.changelog }}

            ## Docker Images
            - Backend: `ghcr.io/${{ github.repository }}/backend:${{ github.ref_name }}`
            - Frontend: `ghcr.io/${{ github.repository }}/frontend:${{ github.ref_name }}`
          draft: false
          prerelease: false
```

### Dependency Update Workflow (`.github/workflows/dependencies.yml`)

```yaml
name: Update Dependencies

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  update-python-deps:
    name: Update Python Dependencies
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Update dependencies
        run: |
          uv lock --upgrade
          uv sync --frozen

      - name: Run tests
        run: uv run pytest

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: Update Python dependencies'
          title: 'chore: Update Python dependencies'
          body: 'Automated dependency update'
          branch: deps/python-updates
          delete-branch: true

  update-node-deps:
    name: Update Node Dependencies
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Update dependencies
        run: |
          npm update
          npm audit fix

      - name: Run tests
        run: npm test

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: Update Node dependencies'
          title: 'chore: Update Node dependencies'
          body: 'Automated dependency update'
          branch: deps/node-updates
          delete-branch: true
```

## 🔐 Required Secrets

Configure these secrets in GitHub Settings > Secrets and variables > Actions:

### General Secrets
- `CODECOV_TOKEN` - Codecov upload token
- `SLACK_WEBHOOK` - Slack notification webhook URL

### Staging Environment
- `STAGING_HOST` - Staging server hostname or IP
- `STAGING_USER` - SSH username for staging
- `STAGING_SSH_KEY` - Private SSH key for staging

### Production Environment
- `PRODUCTION_HOST` - Production server hostname or IP
- `PRODUCTION_USER` - SSH username for production
- `PRODUCTION_SSH_KEY` - Private SSH key for production

### Container Registry
- `DOCKER_USERNAME` - Docker Hub username (if using Docker Hub)
- `DOCKER_PASSWORD` - Docker Hub password (if using Docker Hub)

## 🛡️ Branch Protection Rules

Configure branch protection for `main` and `develop`:

### Main Branch Protection
```yaml
Required status checks:
  - backend-lint
  - backend-typecheck
  - backend-security
  - backend-test
  - frontend-lint
  - frontend-test

Required reviews: 1
Require linear history: true
Include administrators: true
```

### Develop Branch Protection
```yaml
Required status checks:
  - backend-lint
  - backend-test
  - frontend-lint
  - frontend-test

Required reviews: 1
```

## 📊 Deployment Strategies

### Blue-Green Deployment

```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment

on:
  workflow_dispatch:

jobs:
  blue-green-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to green environment
        run: |
          # Deploy new version to green
          ssh ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            docker-compose -f docker-compose.green.yml up -d
          EOF

      - name: Run smoke tests on green
        run: |
          curl -f https://green.yourdomain.com/health || exit 1

      - name: Switch traffic to green
        run: |
          # Update load balancer to point to green
          # This depends on your infrastructure

      - name: Monitor green environment
        run: |
          sleep 300  # Monitor for 5 minutes

      - name: Tear down blue environment
        if: success()
        run: |
          ssh ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            docker-compose -f docker-compose.blue.yml down
          EOF
```

### Canary Deployment

```yaml
# .github/workflows/canary-deploy.yml
name: Canary Deployment

on:
  workflow_dispatch:
    inputs:
      traffic_percentage:
        description: 'Percentage of traffic to route to canary'
        required: true
        default: '10'

jobs:
  canary-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy canary
        run: |
          # Deploy canary version
          ssh ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            docker-compose -f docker-compose.canary.yml up -d --scale backend=1
          EOF

      - name: Configure traffic split
        run: |
          # Configure load balancer to route ${{ github.event.inputs.traffic_percentage }}% to canary
          echo "Routing ${{ github.event.inputs.traffic_percentage }}% traffic to canary"

      - name: Monitor metrics
        run: |
          # Monitor error rates, latency, etc.
          sleep 600  # Monitor for 10 minutes

      - name: Promote canary
        if: success()
        run: |
          # Gradually increase traffic to canary
          # Eventually replace all instances
```

## 📈 Monitoring CI/CD

### Workflow Status Dashboard

Create a dashboard to monitor workflow status:

```markdown
## CI/CD Status

| Workflow | Status | Last Run |
|----------|--------|----------|
| CI Pipeline | ![CI](https://github.com/user/repo/workflows/CI%20Pipeline/badge.svg) | - |
| Deploy | ![Deploy](https://github.com/user/repo/workflows/Deploy/badge.svg) | - |
| Migrations | ![Migrations](https://github.com/user/repo/workflows/Database%20Migrations/badge.svg) | - |
```

### Metrics to Track

1. **Build Time** - Monitor and optimize slow builds
2. **Test Coverage** - Maintain > 80% coverage
3. **Deployment Frequency** - Track how often you deploy
4. **Mean Time to Recovery** - How quickly you can rollback
5. **Change Failure Rate** - Percentage of deployments causing issues

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check workflow logs
gh workflow view ci.yml

# Re-run failed jobs
gh run rerun <run-id>

# Debug with tmate (add to workflow)
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
```

#### Test Failures

```bash
# Run tests locally with same environment
docker-compose -f docker-compose.test.yml up
docker-compose -f docker-compose.test.yml exec backend pytest -v

# Check test logs
gh run view <run-id> --log
```

#### Deployment Failures

```bash
# Check deployment logs
ssh user@host 'docker-compose logs backend'

# Rollback deployment
gh workflow run deploy.yml -f environment=production -f rollback=true
```

## 📚 Best Practices

### 1. Keep Workflows Fast
- Use caching for dependencies
- Run jobs in parallel
- Use matrix builds for multiple versions

### 2. Secure Secrets
- Never log secrets
- Use environment-specific secrets
- Rotate secrets regularly

### 3. Fail Fast
- Run cheap checks first (linting, formatting)
- Run expensive tests last
- Use continue-on-error sparingly

### 4. Monitor and Alert
- Set up Slack/Discord notifications
- Monitor deployment success rates
- Track build times

### 5. Documentation
- Document workflow triggers
- Explain required secrets
- Maintain runbook for failures

## 🔄 Continuous Improvement

### Weekly Reviews
- Review failed builds
- Identify slow tests
- Update dependencies

### Monthly Reviews
- Audit security scans
- Review deployment metrics
- Update workflows

## 📝 Next Steps

1. Create `.github/workflows/` directory
2. Add workflow files from templates above
3. Configure GitHub secrets
4. Set up branch protection rules
5. Enable Codecov integration
6. Configure Slack notifications
7. Test workflows with pull request

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)
- [GitHub Secrets Best Practices](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Last Updated**: 2025-10-25
**Maintained By**: DevOps Team
**Review Schedule**: Monthly
