"""
Compass Zones API Endpoints - SIMPLIFIED FOR MVP

Provides 3-zone life organization:
- Work: Professional tasks and projects
- Life: Personal tasks, errands, home
- Self: Health, learning, relationships

Simple goal tracking without complex purpose statements.
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

router = APIRouter(prefix="/api/v1/compass", tags=["compass"])

# ============================================================================
# Pydantic Models
# ============================================================================


class ZoneCreate(BaseModel):
    """Request to create a compass zone"""

    name: str = Field(..., min_length=1, max_length=50, description="Zone name")
    icon: str = Field(..., min_length=1, max_length=10, description="Emoji icon")
    simple_goal: str | None = Field(None, max_length=200, description="Simple goal (optional)")
    color: str = Field("#3b82f6", pattern="^#[0-9A-Fa-f]{6}$", description="Hex color")


class ZoneUpdate(BaseModel):
    """Request to update a compass zone"""

    name: str | None = Field(None, min_length=1, max_length=50)
    icon: str | None = Field(None, min_length=1, max_length=10)
    simple_goal: str | None = Field(None, max_length=200)
    color: str | None = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    is_active: bool | None = None


class ZoneResponse(BaseModel):
    """Compass zone response"""

    zone_id: str
    user_id: str
    name: str
    icon: str
    simple_goal: str | None
    color: str
    sort_order: int
    is_active: bool
    created_at: str
    updated_at: str


class ZoneProgressResponse(BaseModel):
    """Zone progress response"""

    zone_id: str
    zone_name: str
    zone_icon: str
    tasks_completed_today: int
    tasks_completed_this_week: int
    tasks_completed_all_time: int


# ============================================================================
# Default Zones (Created on First Access)
# ============================================================================

DEFAULT_ZONES = [
    {
        "name": "Work",
        "icon": "💼",
        "simple_goal": "Complete important work tasks",
        "color": "#3b82f6",  # Blue
        "sort_order": 0,
    },
    {
        "name": "Life",
        "icon": "🏠",
        "simple_goal": "Handle personal tasks and errands",
        "color": "#10b981",  # Green
        "sort_order": 1,
    },
    {
        "name": "Self",
        "icon": "❤️",
        "simple_goal": "Invest in health and growth",
        "color": "#8b5cf6",  # Purple
        "sort_order": 2,
    },
]


# ============================================================================
# Helper Functions
# ============================================================================


def get_or_create_default_zones(user_id: str) -> list[dict]:
    """Get user's zones, or create default 3 zones if none exist"""
    db = get_enhanced_database()
    conn = db.get_connection()
    cursor = conn.cursor()

    # Check if user has zones
    cursor.execute(
        """
        SELECT
            zone_id, name, icon, simple_goal, color, sort_order, is_active,
            created_at, updated_at
        FROM compass_zones
        WHERE user_id = ? AND is_active = TRUE
        ORDER BY sort_order
        """,
        (user_id,),
    )

    rows = cursor.fetchall()

    if rows:
        # User has zones, return them
        zones = []
        for row in rows:
            zones.append(
                {
                    "zone_id": row[0],
                    "name": row[1],
                    "icon": row[2],
                    "simple_goal": row[3],
                    "color": row[4],
                    "sort_order": row[5],
                    "is_active": bool(row[6]),
                    "created_at": row[7],
                    "updated_at": row[8],
                }
            )
        return zones

    # No zones exist, create defaults
    zones = []
    for zone_config in DEFAULT_ZONES:
        zone_id = str(uuid4())
        now = datetime.now().isoformat()

        cursor.execute(
            """
            INSERT INTO compass_zones
            (zone_id, user_id, name, icon, simple_goal, color, sort_order,
             is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
            """,
            (
                zone_id,
                user_id,
                zone_config["name"],
                zone_config["icon"],
                zone_config["simple_goal"],
                zone_config["color"],
                zone_config["sort_order"],
                now,
                now,
            ),
        )

        zones.append(
            {
                "zone_id": zone_id,
                "name": zone_config["name"],
                "icon": zone_config["icon"],
                "simple_goal": zone_config["simple_goal"],
                "color": zone_config["color"],
                "sort_order": zone_config["sort_order"],
                "is_active": True,
                "created_at": now,
                "updated_at": now,
            }
        )

    conn.commit()
    return zones


# ============================================================================
# API Endpoints
# ============================================================================


@router.get("/zones", response_model=list[ZoneResponse])
async def get_zones(current_user: User = Depends(get_current_user)):
    """
    Get all compass zones for user.

    Creates default 3 zones (Work, Life, Self) on first access.
    """
    user_id = current_user.user_id
    try:
        zones = get_or_create_default_zones(user_id)

        return [
            ZoneResponse(
                zone_id=z["zone_id"],
                user_id=user_id,
                name=z["name"],
                icon=z["icon"],
                simple_goal=z["simple_goal"],
                color=z["color"],
                sort_order=z["sort_order"],
                is_active=z["is_active"],
                created_at=z["created_at"],
                updated_at=z["updated_at"],
            )
            for z in zones
        ]

    except Exception as e:
        logger.error(f"Failed to get zones: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get zones: {str(e)}",
        )


@router.post("/zones", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
async def create_zone(zone_data: ZoneCreate, current_user: User = Depends(get_current_user)):
    """
    Create a new compass zone.

    Note: MVP limits to 5 zones max. Default 3 zones already created.
    """
    user_id = current_user.user_id
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        # Check zone limit (max 5 zones)
        cursor.execute(
            "SELECT COUNT(*) FROM compass_zones WHERE user_id = ? AND is_active = TRUE", (user_id,)
        )
        count = cursor.fetchone()[0]

        if count >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 zones allowed. Archive or delete a zone first.",
            )

        # Create zone
        zone_id = str(uuid4())
        now = datetime.now().isoformat()

        cursor.execute(
            """
            INSERT INTO compass_zones
            (zone_id, user_id, name, icon, simple_goal, color, sort_order,
             is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
            """,
            (
                zone_id,
                user_id,
                zone_data.name,
                zone_data.icon,
                zone_data.simple_goal,
                zone_data.color,
                count,  # Next sort order
                now,
                now,
            ),
        )
        conn.commit()

        return ZoneResponse(
            zone_id=zone_id,
            user_id=user_id,
            name=zone_data.name,
            icon=zone_data.icon,
            simple_goal=zone_data.simple_goal,
            color=zone_data.color,
            sort_order=count,
            is_active=True,
            created_at=now,
            updated_at=now,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create zone: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create zone: {str(e)}",
        )


@router.put("/zones/{zone_id}", response_model=ZoneResponse)
async def update_zone(
    zone_id: str, zone_data: ZoneUpdate, current_user: User = Depends(get_current_user)
):
    """
    Update a compass zone.
    """
    user_id = current_user.user_id
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        # Build update query dynamically
        updates = []
        values = []

        if zone_data.name is not None:
            updates.append("name = ?")
            values.append(zone_data.name)
        if zone_data.icon is not None:
            updates.append("icon = ?")
            values.append(zone_data.icon)
        if zone_data.simple_goal is not None:
            updates.append("simple_goal = ?")
            values.append(zone_data.simple_goal)
        if zone_data.color is not None:
            updates.append("color = ?")
            values.append(zone_data.color)
        if zone_data.is_active is not None:
            updates.append("is_active = ?")
            values.append(zone_data.is_active)

        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
            )

        updates.append("updated_at = ?")
        values.append(datetime.now().isoformat())

        values.extend([zone_id, user_id])

        cursor.execute(
            f"""
            UPDATE compass_zones
            SET {", ".join(updates)}
            WHERE zone_id = ? AND user_id = ?
            """,
            values,
        )
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")

        # Fetch updated zone
        cursor.execute(
            """
            SELECT zone_id, name, icon, simple_goal, color, sort_order, is_active,
                   created_at, updated_at
            FROM compass_zones
            WHERE zone_id = ? AND user_id = ?
            """,
            (zone_id, user_id),
        )

        row = cursor.fetchone()
        return ZoneResponse(
            zone_id=row[0],
            user_id=user_id,
            name=row[1],
            icon=row[2],
            simple_goal=row[3],
            color=row[4],
            sort_order=row[5],
            is_active=bool(row[6]),
            created_at=row[7],
            updated_at=row[8],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update zone: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update zone: {str(e)}",
        )


@router.get("/progress", response_model=list[ZoneProgressResponse])
async def get_zone_progress(current_user: User = Depends(get_current_user)):
    """
    Get task completion counts per zone.

    Shows:
    - Tasks completed today
    - Tasks completed this week
    - Tasks completed all time
    """
    user_id = current_user.user_id
    try:
        db = get_enhanced_database()
        conn = db.get_connection()
        cursor = conn.cursor()

        # Get zones and their task counts
        cursor.execute(
            """
            SELECT
                z.zone_id,
                z.name,
                z.icon,
                COUNT(CASE WHEN DATE(t.completed_at) = DATE('now') THEN 1 END) as today_count,
                COUNT(CASE WHEN DATE(t.completed_at) >= DATE('now', '-7 days') THEN 1 END) as week_count,
                COUNT(t.task_id) as total_count
            FROM compass_zones z
            LEFT JOIN tasks t ON t.zone_id = z.zone_id AND t.status = 'done'
            WHERE z.user_id = ? AND z.is_active = TRUE
            GROUP BY z.zone_id, z.name, z.icon
            ORDER BY z.sort_order
            """,
            (user_id,),
        )

        rows = cursor.fetchall()

        return [
            ZoneProgressResponse(
                zone_id=row[0],
                zone_name=row[1],
                zone_icon=row[2],
                tasks_completed_today=row[3] or 0,
                tasks_completed_this_week=row[4] or 0,
                tasks_completed_all_time=row[5] or 0,
            )
            for row in rows
        ]

    except Exception as e:
        logger.error(f"Failed to get zone progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get progress: {str(e)}",
        )


# ============================================================================
# MVP SCOPE NOTES
# ============================================================================

# ✅ IMPLEMENTED:
# - GET /zones: List zones (auto-creates default 3)
# - POST /zones: Create new zone (max 5)
# - PUT /zones/{id}: Update zone
# - GET /progress: View task counts per zone

# ✅ FEATURES:
# - Default 3 zones (Work, Life, Self)
# - Simple goal tracking (not abstract purpose)
# - Task count tracking (not hour goals)
# - Max 5 zones (keep it simple)

# ❌ NOT IN MVP:
# - Weekly hour goals
# - Abstract purpose statements
# - Zone analytics
# - Zone-based notifications
