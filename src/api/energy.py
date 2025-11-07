"""
Energy Management API Endpoints - SIMPLIFIED FOR MVP

Provides simple 3-level energy tracking:
- Low (1): Tired, need easy tasks
- Medium (2): Normal energy, can handle most tasks
- High (3): Energized, tackle complex work

No multi-factor algorithms, just manual user selection.
"""

import logging
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.api.auth import get_current_user
from src.core.task_models import User
from src.database.enhanced_adapter import get_enhanced_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/energy", tags=["energy"])

# ============================================================================
# Pydantic Models (Simplified)
# ============================================================================


class EnergySetRequest(BaseModel):
    """Request to set current energy level"""

    energy_level: int = Field(..., ge=1, le=3, description="Energy: 1=Low, 2=Medium, 3=High")
    notes: str | None = Field(None, max_length=200, description="Optional context note")


class EnergyResponse(BaseModel):
    """Energy level response"""

    snapshot_id: str
    user_id: str
    energy_level: int
    energy_label: str  # "Low", "Medium", or "High"
    recorded_at: str
    notes: str | None
    message: str


class CurrentEnergyResponse(BaseModel):
    """Current energy level response"""

    energy_level: int
    energy_label: str
    user_id: str
    timestamp: str
    message: str


# ============================================================================
# Energy Level Labels
# ============================================================================

ENERGY_LABELS = {1: "Low", 2: "Medium", 3: "High"}

ENERGY_EMOJIS = {
    1: "🔋",  # Low battery
    2: "⚡",  # Medium
    3: "🔥",  # High energy
}


# ============================================================================
# API Endpoints
# ============================================================================


@router.post("/set", response_model=EnergyResponse)
async def set_energy_level(
    energy_data: EnergySetRequest, current_user: User = Depends(get_current_user)
):
    """
    Set your current energy level (1-3).

    Levels:
    - 1 = Low: Tired, need easy tasks
    - 2 = Medium: Normal energy
    - 3 = High: Energized, ready for complex work

    This helps filter tasks to match your current state.
    """
    user_id = current_user.user_id
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        snapshot_id = str(uuid4())

        # Determine time of day for context
        current_hour = datetime.now().hour
        if 6 <= current_hour < 12:
            time_of_day = "morning"
        elif 12 <= current_hour < 17:
            time_of_day = "afternoon"
        elif 17 <= current_hour < 21:
            time_of_day = "evening"
        else:
            time_of_day = "night"

        # Insert into energy_snapshots table
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO energy_snapshots
            (snapshot_id, user_id, energy_level, time_of_day, notes, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                snapshot_id,
                user_id,
                energy_data.energy_level,
                time_of_day,
                energy_data.notes,
                datetime.now().isoformat(),
            ),
        )
        conn.commit()

        energy_label = ENERGY_LABELS[energy_data.energy_level]
        emoji = ENERGY_EMOJIS[energy_data.energy_level]

        return EnergyResponse(
            snapshot_id=snapshot_id,
            user_id=user_id,
            energy_level=energy_data.energy_level,
            energy_label=energy_label,
            recorded_at=datetime.now().isoformat(),
            notes=energy_data.notes,
            message=f"{emoji} Energy set to {energy_label}",
        )

    except Exception as e:
        logger.error(f"Failed to set energy level: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set energy: {str(e)}",
        )


@router.get("/current", response_model=CurrentEnergyResponse)
async def get_current_energy(current_user: User = Depends(get_current_user)):
    """
    Get your most recent energy level.

    Returns the last energy level you set, or defaults to Medium (2)
    if you haven't set it yet.
    """
    user_id = current_user.user_id
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get most recent energy snapshot
        cursor.execute(
            """
            SELECT energy_level, recorded_at
            FROM energy_snapshots
            WHERE user_id = ?
            ORDER BY recorded_at DESC
            LIMIT 1
            """,
            (user_id,),
        )

        row = cursor.fetchone()

        if row:
            energy_level = row[0]
            recorded_at = row[1]
        else:
            # Default to Medium if never set
            energy_level = 2
            recorded_at = datetime.now().isoformat()

        energy_label = ENERGY_LABELS[energy_level]
        emoji = ENERGY_EMOJIS[energy_level]

        return CurrentEnergyResponse(
            energy_level=energy_level,
            energy_label=energy_label,
            user_id=user_id,
            timestamp=recorded_at,
            message=f"{emoji} Current energy: {energy_label}",
        )

    except Exception as e:
        logger.error(f"Failed to get current energy: {e}")
        # Return default instead of error for better UX
        return CurrentEnergyResponse(
            energy_level=2,
            energy_label="Medium",
            user_id=user_id,
            timestamp=datetime.now().isoformat(),
            message="⚡ Current energy: Medium (default)",
        )


@router.get("/history")
async def get_energy_history(current_user: User = Depends(get_current_user), limit: int = 10):
    """
    Get your recent energy level history.

    Returns up to {limit} most recent energy snapshots.
    Useful for seeing patterns in your energy throughout the day.
    """
    user_id = current_user.user_id
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                snapshot_id,
                energy_level,
                time_of_day,
                notes,
                recorded_at
            FROM energy_snapshots
            WHERE user_id = ?
            ORDER BY recorded_at DESC
            LIMIT ?
            """,
            (user_id, limit),
        )

        rows = cursor.fetchall()

        history = []
        for row in rows:
            energy_level = row[1]
            history.append(
                {
                    "snapshot_id": row[0],
                    "energy_level": energy_level,
                    "energy_label": ENERGY_LABELS[energy_level],
                    "time_of_day": row[2],
                    "notes": row[3],
                    "recorded_at": row[4],
                }
            )

        return {
            "user_id": user_id,
            "count": len(history),
            "history": history,
            "message": f"📊 Retrieved {len(history)} energy snapshots",
        }

    except Exception as e:
        logger.error(f"Failed to get energy history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get history: {str(e)}",
        )


# ============================================================================
# MVP SCOPE NOTES
# ============================================================================

# ✅ KEPT (Simple & Useful):
# - POST /set: Set energy level (1-3)
# - GET /current: Get current energy level
# - GET /history: View recent energy snapshots

# ❌ ARCHIVED (Complex, not MVP):
# - Multi-factor tracking (sleep, stress, nutrition, hydration)
# - Circadian rhythm analysis
# - Energy optimization recommendations
# - Task-energy matching (moved to task filtering)
# - Recovery planning

# See archive/backend/services/energy_router_complex.py for full implementation
