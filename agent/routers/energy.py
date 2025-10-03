"""
Energy router for energy level tracking.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db

router = APIRouter()

@router.get("/logs")
async def get_energy_logs(db: AsyncSession = Depends(get_db)):
    """Get energy logs for user."""
    return {"message": "Energy logs endpoint - to be implemented"}

@router.post("/log")
async def log_energy(db: AsyncSession = Depends(get_db)):
    """Log current energy level."""
    return {"message": "Log energy endpoint - to be implemented"}