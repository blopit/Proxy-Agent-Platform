"""
Focus router for focus session management.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db

router = APIRouter()

@router.get("/sessions")
async def get_focus_sessions(db: AsyncSession = Depends(get_db)):
    """Get focus sessions for user."""
    return {"message": "Focus sessions endpoint - to be implemented"}

@router.post("/start")
async def start_focus_session(db: AsyncSession = Depends(get_db)):
    """Start a new focus session."""
    return {"message": "Start focus session endpoint - to be implemented"}