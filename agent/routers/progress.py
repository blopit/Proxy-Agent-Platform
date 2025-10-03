"""
Progress router for goal tracking and achievements.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db

router = APIRouter()

@router.get("/achievements")
async def get_achievements(db: AsyncSession = Depends(get_db)):
    """Get user achievements."""
    return {"message": "Achievements endpoint - to be implemented"}

@router.get("/stats")
async def get_progress_stats(db: AsyncSession = Depends(get_db)):
    """Get progress statistics."""
    return {"message": "Progress stats endpoint - to be implemented"}