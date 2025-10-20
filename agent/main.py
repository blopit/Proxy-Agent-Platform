"""
Main FastAPI application for the Proxy Agent Platform.

This module sets up the FastAPI app with all routers, middleware, and configuration
for the AI proxy agents productivity platform.
"""

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

import sys
sys.path.append(os.path.dirname(__file__))
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from routers import router as agents_router
from src.api.tasks import router as tasks_router
from database import close_db, init_db

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
    redoc_url="/redoc",
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
# CORS configuration - secure environment-based origins

# Get allowed origins from environment variable
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000")
allowed_origins: list[str] = [origin.strip() for origin in allowed_origins_env.split(",")]

# In production, never use wildcard origins
if os.getenv("ENVIRONMENT") == "production":
    if "*" in allowed_origins or not allowed_origins:
        raise ValueError(
            "Production environment requires specific CORS origins. Set ALLOWED_ORIGINS environment variable."
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents_router)
app.include_router(tasks_router)


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
            "progress_agent": "Monitors goals and celebrates achievements",
        },
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
            "detail": str(exc) if os.getenv("DEBUG") else "An unexpected error occurred",
        },
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "false").lower() == "true"

    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=debug, access_log=debug)
