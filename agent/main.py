"""
Main FastAPI application for the Proxy Agent Platform.

This module sets up the FastAPI app with all routers, middleware, and configuration
for the AI proxy agents productivity platform.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from routers import agents, tasks, focus, energy, progress, websocket
from database import init_db, close_db

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Handles startup and shutdown events for the FastAPI application.
    """
    # Startup
    await init_db()
    print("🚀 Proxy Agent Platform API started")

    yield

    # Shutdown
    await close_db()
    print("✨ Proxy Agent Platform API shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Proxy Agent Platform API",
    description="Personal productivity platform with AI proxy agents built with PydanticAI",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(focus.router, prefix="/api/focus", tags=["focus"])
app.include_router(energy.router, prefix="/api/energy", tags=["energy"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(websocket.router, prefix="/ws", tags=["websocket"])


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Proxy Agent Platform API",
        "version": "0.1.0",
        "description": "Personal productivity platform with AI proxy agents",
        "docs": "/docs",
        "agents": {
            "task_agent": "Manages tasks and priorities",
            "focus_agent": "Optimizes focus and deep work sessions",
            "energy_agent": "Tracks and optimizes energy levels",
            "progress_agent": "Monitors goals and celebrates achievements"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "proxy-agent-platform"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for better error responses."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG") else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "false").lower() == "true"

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=debug,
        access_log=debug
    )