# Architecture Overview

## Repository Structure

This is a **monorepo** containing two main applications:

```
Proxy-Agent-Platform/
├── src/                    # 🐍 Python Backend (FastAPI)
│   ├── api/                # API endpoints and routers
│   ├── core/               # Core business logic
│   ├── database/           # Database models and migrations
│   ├── agents/             # AI agent implementations
│   ├── services/           # Business logic services
│   ├── repositories/       # Data access layer
│   └── integrations/       # External service integrations
│
├── mobile/                 # 📱 React Native App (Expo)
│   ├── app/                # Expo Router screens
│   ├── components/         # React Native components
│   ├── src/                # App business logic
│   └── .rnstorybook/       # Component storybook
│
├── docs/                   # 📚 Project documentation
├── scripts/                # 🛠️ Utility scripts
├── tests/                  # 🧪 Backend tests
└── alembic/                # 📦 Database migrations
```

## Why Two Directories?

### `/src` - Backend API (Python/FastAPI)
**Technology**: Python 3.12, FastAPI, PostgreSQL, SQLAlchemy
**Purpose**: RESTful API server providing data and AI agent services

**Key features**:
- Task management APIs
- OAuth authentication (Google, Apple, GitHub)
- AI-powered task breakdown and suggestions
- Gamification and reward systems
- Database models and migrations
- Background job processing

**Run**:
```bash
uv run uvicorn src.api.main:app --reload
```

### `/mobile` - Universal Mobile App (React Native/Expo)
**Technology**: React Native, Expo SDK 54, TypeScript
**Purpose**: Cross-platform mobile app for iOS, Android, and Web

**Key features**:
- 5 biological workflow modes (Capture, Scout, Today, Mapper, Hunter)
- Expo Router for navigation
- Component storybook for development
- OAuth authentication flows
- Universal deployment (iOS/Android/Web from one codebase)

**Run**:
```bash
cd mobile && npm start
```

## Architecture Pattern

```
┌─────────────────────────────────────────┐
│         Mobile App (React Native)        │
│  iOS / Android / Web (Expo)              │
│  - User interface                        │
│  - State management                      │
│  - Offline support                       │
└───────────────┬─────────────────────────┘
                │
                │ HTTP/REST API
                │ WebSocket (real-time)
                │
┌───────────────▼─────────────────────────┐
│       Backend API (FastAPI/Python)       │
│  - Business logic                        │
│  - AI agent orchestration                │
│  - Database access                       │
│  - External integrations                 │
└───────────────┬─────────────────────────┘
                │
                │ SQL
                │
┌───────────────▼─────────────────────────┐
│        PostgreSQL Database               │
│  - User data                             │
│  - Tasks and workflows                   │
│  - Gamification state                    │
└──────────────────────────────────────────┘
```

## Why Not a `/frontend` Directory?

**Answer**: The mobile app IS the frontend, and it supports web deployment!

Expo allows React Native apps to run on:
- **iOS** - Native iOS app
- **Android** - Native Android app
- **Web** - Progressive Web App (PWA)

All from a **single codebase** in `/mobile`.

## Development Workflow

### Backend Development
```bash
# Activate virtual environment
source .venv/bin/activate

# Run backend server
uv run uvicorn src.api.main:app --reload

# Run tests
uv run pytest

# Database migrations
alembic upgrade head
```

### Mobile Development
```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run web      # Web browser
npm run ios      # iOS simulator
npm run android  # Android emulator

# View Storybook
npm run storybook
```

## API Communication

The mobile app communicates with the backend via:

- **REST API**: `http://localhost:8000/api/v1/*`
- **WebSocket**: `ws://localhost:8000/ws`
- **OAuth callbacks**: Configured in app.json and .env

Configuration:
- Backend: `.env` (API keys, database URL)
- Mobile: `mobile/.env` (API URL, OAuth client IDs)

## Key Files

| File | Purpose |
|------|---------|
| `src/api/main.py` | FastAPI app entry point |
| `mobile/app/_layout.tsx` | Mobile app root layout |
| `pyproject.toml` | Python dependencies |
| `mobile/package.json` | Node dependencies |
| `CLAUDE.md` | Python development guide |
| `mobile/README.md` | Mobile app documentation |

## Benefits of Monorepo

✅ **Shared documentation**: All docs in `/docs`
✅ **Atomic changes**: Update API and mobile together
✅ **Consistent versioning**: Single git history
✅ **Easy code search**: Find all usages across stack
✅ **Simplified CI/CD**: One repo to build/deploy

## Next Steps

- **Backend**: See `/docs/guides/` for API documentation
- **Mobile**: See `/mobile/README.md` for mobile development
- **Architecture**: See `/docs/architecture/` for design docs

---

**TL;DR**: `/src` = Python backend API, `/mobile` = React Native app (iOS/Android/Web). They're separate apps that communicate via REST API.
