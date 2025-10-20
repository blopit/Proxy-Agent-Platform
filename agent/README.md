# Agent Backend Server

FastAPI-based backend server that provides the core API endpoints for the Proxy Agent Platform.

## Overview

This directory contains the main backend server implementation using FastAPI, which serves as the primary interface between the frontend and the proxy agent system.

## Structure

```
agent/
├── main.py              # FastAPI application entry point
├── database.py          # Database configuration and models
├── requirements.txt     # Python dependencies
├── alembic.ini         # Alembic configuration
├── alembic/            # Database migrations
├── routers/            # API route handlers
└── proxy_agent_platform.db  # SQLite database file
```

## Key Components

### main.py
- FastAPI application setup
- CORS configuration
- Route registration
- Server startup configuration

### database.py
- SQLAlchemy database configuration
- Database session management
- Model definitions and relationships

### routers/
Contains modular API route handlers for different functionality areas.

## Quick Start

1. **Install dependencies:**
```bash
cd agent
pip install -r requirements.txt
```

2. **Run database migrations:**
```bash
alembic upgrade head
```

3. **Start the server:**
```bash
python main.py
```

The server will start on `http://localhost:8000` with automatic API documentation available at `/docs`.

## API Documentation

- **Interactive docs:** `http://localhost:8000/docs`
- **OpenAPI spec:** `http://localhost:8000/openapi.json`

## Database

Uses SQLite for development with Alembic for migrations. The database file is stored as `proxy_agent_platform.db`.

### Running Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Downgrade migrations
alembic downgrade -1
```

## Development

The server supports hot reloading during development. Use the following for development mode:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

- `DATABASE_URL`: Database connection string (defaults to SQLite)
- `CORS_ORIGINS`: Allowed CORS origins for frontend integration

## Integration

This backend integrates with:
- Frontend Next.js application
- Proxy agent system in `proxy_agent_platform/`
- MCP servers for extended functionality
