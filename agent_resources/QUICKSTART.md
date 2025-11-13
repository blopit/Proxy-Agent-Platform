# Quick Start Guide (5 Minutes)

**Last Updated**: November 13, 2025

Get up and running with the Proxy Agent Platform in 5 minutes.

---

## Choose Your Path

### 🐍 Backend Development

```bash
# 1. Setup environment
cd backend
uv sync

# 2. Run tests
uv run pytest

# 3. Start development server
uv run python -m src.main

# 4. Next steps
# Read: agent_resources/backend/README.md
# API Docs: agent_resources/backend/api/README.md
```

**Tech Stack**: Python, FastAPI, SQLite, Pydantic

---

### ⚛️ Frontend Development

```bash
# 1. Setup environment
cd mobile
npm install

# 2. Start development server
npm start

# 3. Run on device/simulator
# iOS: Press 'i' in terminal
# Android: Press 'a' in terminal
# Web: Press 'w' in terminal

# 4. Next steps
# Read: agent_resources/frontend/README.md
# Components: mobile/src/components/
```

**Tech Stack**: React Native, Expo, TypeScript, Storybook

---

## Common Tasks

### Run All Tests

```bash
# Backend tests
cd backend && uv run pytest

# Frontend tests (when available)
cd mobile && npm test

# Integration tests
cd backend && uv run pytest tests/integration/
```

### Check Current Status

```bash
# View project status
cat agent_resources/STATUS.md

# View current sprint
cat agent_resources/tasks/roadmap/current_sprint.md

# View next 5 tasks
cat agent_resources/tasks/roadmap/next_5_tasks.md
```

### Access Documentation

```bash
# Main documentation hub
open agent_resources/docs/README.md

# Backend API reference
open agent_resources/backend/api/API_REFERENCE.md

# Architecture & design
open agent_resources/architecture/design/

# Testing guides
open agent_resources/testing/README.md
```

### Search Documentation

```bash
# Use the search script (best option)
./scripts/search-docs.sh "authentication"
./scripts/search-docs.sh "API" --files-only

# Or use ripgrep directly
rg "search term" agent_resources/ -i --heading

# Search specific area
rg "OAuth" agent_resources/docs/authentication/ -i

# Search for file names
find agent_resources -name "*auth*"

# GitHub search (when browsing online)
# Use: path:agent_resources/ your search term
```

**Pro Tips**:
- Add `-i` for case-insensitive search
- Use `--files-only` to see just file names
- Search specific directories for faster results
- Check [SITEMAP.md](./SITEMAP.md) for complete file index

---

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `backend/` | Python FastAPI backend |
| `mobile/` | React Native Expo app |
| `agent_resources/` | Documentation for AI agents |
| `agent_resources/backend/` | Backend-specific docs |
| `agent_resources/frontend/` | Frontend-specific docs |
| `agent_resources/testing/` | Testing guides |
| `agent_resources/tasks/` | Task tracking & roadmaps |

---

## Authentication Setup

### Backend OAuth Configuration

```bash
# 1. Copy environment template
cp backend/.env.example backend/.env

# 2. Add OAuth credentials
# Edit backend/.env with your OAuth app credentials

# 3. Run database migrations
cd backend && uv run alembic upgrade head
```

### Mobile OAuth Configuration

```bash
# 1. Copy environment template
cp mobile/.env.example mobile/.env

# 2. Configure OAuth providers
# Edit mobile/.env with your OAuth app credentials

# 3. Update app.json with correct schemes
# Read: agent_resources/docs/authentication/README.md
```

---

## Development Workflow

### 1. Check Current Work

```bash
# View status
cat agent_resources/STATUS.md

# View roadmap
cat agent_resources/tasks/roadmap/current_sprint.md
```

### 2. Find Your Task

```bash
# Backend tasks
grep -r "TODO" backend/src/

# Frontend tasks
grep -r "TODO" mobile/src/

# Or check roadmap
cat agent_resources/tasks/roadmap/next_5_tasks.md
```

### 3. Make Changes

- Follow TDD: Write tests first
- Run tests frequently: `uv run pytest` (backend) or `npm test` (frontend)
- Follow conventions: See `CLAUDE.md` for coding standards

### 4. Verify Changes

```bash
# Backend checks
cd backend
uv run pytest                    # Run tests
uv run ruff check .              # Lint
uv run ruff format .             # Format
uv run mypy src/                 # Type check

# Frontend checks
cd mobile
npm run lint                     # Lint (if configured)
npm test                         # Tests (if configured)
```

---

## Need Help?

### Documentation

- **Getting Started**: [docs/getting-started/](./docs/getting-started/)
- **Backend Guide**: [backend/README.md](./backend/README.md)
- **Frontend Guide**: [frontend/README.md](./frontend/README.md)
- **API Reference**: [backend/api/API_REFERENCE.md](./backend/api/API_REFERENCE.md)
- **Testing Guide**: [testing/README.md](./testing/README.md)

### Common Issues

- **OAuth not working**: See [docs/authentication/05_oauth_integration.md](./docs/authentication/05_oauth_integration.md)
- **Database errors**: Check migrations with `uv run alembic current`
- **Import errors**: Run `uv sync` in backend or `npm install` in mobile
- **Tests failing**: Check [testing/06_QUICK_START.md](./testing/06_QUICK_START.md)

### Architecture & Design

- **System Architecture**: [architecture/README.md](./architecture/README.md)
- **Design Patterns**: [architecture/design/](./architecture/design/)
- **ADHD Research**: [docs/references/ADHD_TASK_MANAGEMENT_MASTER.md](./docs/references/ADHD_TASK_MANAGEMENT_MASTER.md)
- **Project Vision**: [docs/references/PROJECT_VISION_SYNTHESIS.md](./docs/references/PROJECT_VISION_SYNTHESIS.md)

---

## Next Steps

After completing this quick start:

1. **Read the full documentation**: [docs/README.md](./docs/README.md)
2. **Explore the codebase**: [docs/references/REPOSITORY_STRUCTURE.md](./docs/references/REPOSITORY_STRUCTURE.md)
3. **Join development**: Pick a task from [tasks/roadmap/next_5_tasks.md](./tasks/roadmap/next_5_tasks.md)
4. **Review standards**: Read [CLAUDE.md](../CLAUDE.md) for coding conventions

---

**Ready to dive deeper?** Check the [Full Documentation Index](./docs/README.md)
