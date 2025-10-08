"""Routers for the agent API."""

from fastapi import APIRouter

# Create main router
router = APIRouter(prefix="/api/v1", tags=["agents"])


# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "proxy-agent-platform"}
