"""
XP transaction models for persistence layer.

Handles XP transaction storage, user XP totals, and historical tracking.
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from agent.database import Base


class XPTransactionType(str, Enum):
    """Types of XP transactions."""

    EARNED = "earned"
    SPENT = "spent"
    BONUS = "bonus"
    PENALTY = "penalty"
    ADJUSTMENT = "adjustment"


class XPTransactionCategory(str, Enum):
    """Categories of XP transactions."""

    TASK_COMPLETION = "task_completion"
    HABIT_STREAK = "habit_streak"
    ACHIEVEMENT = "achievement"
    SOCIAL = "social"
    LEARNING = "learning"
    CREATIVITY = "creativity"
    HEALTH = "health"
    OTHER = "other"


class XPTransactionStatus(str, Enum):
    """Status of XP transactions."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class XPTransaction(Base):
    """
    Database model for XP transactions.

    Tracks all XP gains and losses for users with full audit trail.
    """

    __tablename__ = "xp_transactions"

    transaction_id = Column(String, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    transaction_type = Column(String, nullable=False)
    xp_amount = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    activity_type = Column(String, nullable=True)
    source_agent = Column(String, nullable=True)
    event_data = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    is_processed = Column(Boolean, default=False, nullable=False)

    def __repr__(self):
        return f"<XPTransaction(user_id={self.user_id}, xp={self.xp_amount}, type={self.transaction_type})>"


class UserXPSummary(Base):
    """
    Database model for user XP summary/totals.

    Maintains current XP totals and lifetime statistics for efficient querying.
    """

    __tablename__ = "user_xp_summary"

    user_id = Column(Integer, primary_key=True)
    total_xp = Column(Integer, default=0, nullable=False)
    lifetime_xp_earned = Column(Integer, default=0, nullable=False)
    lifetime_xp_spent = Column(Integer, default=0, nullable=False)
    last_activity = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)

    def __repr__(self):
        return f"<UserXPSummary(user_id={self.user_id}, total_xp={self.total_xp})>"


# Pydantic models for API
class XPTransactionCreate(BaseModel):
    """Schema for creating XP transactions."""

    user_id: int = Field(..., description="User ID")
    transaction_type: XPTransactionType = Field(..., description="Type of transaction")
    xp_amount: int = Field(..., description="XP amount (positive for earned, negative for spent)")
    description: str = Field(
        ..., min_length=1, max_length=255, description="Description of transaction"
    )
    activity_type: str | None = Field(None, description="Type of activity that earned XP")
    source_agent: str | None = Field(None, description="Agent that triggered the XP")
    event_data: dict | None = Field(None, description="Additional event data")


class XPTransactionResponse(BaseModel):
    """Schema for XP transaction responses."""

    transaction_id: str
    user_id: int
    transaction_type: XPTransactionType
    xp_amount: int
    description: str
    activity_type: str | None
    source_agent: str | None
    created_at: datetime
    is_processed: bool

    class Config:
        from_attributes = True


class UserXPResponse(BaseModel):
    """Schema for user XP summary responses."""

    user_id: int
    total_xp: int
    lifetime_xp_earned: int
    lifetime_xp_spent: int
    last_activity: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class XPLeaderboardEntry(BaseModel):
    """Schema for XP leaderboard entries."""

    user_id: int
    total_xp: int
    rank: int
    xp_gained_today: int | None = None
    xp_gained_this_week: int | None = None


class XPStatistics(BaseModel):
    """Schema for XP statistics and analytics."""

    total_users: int
    total_xp_awarded: int
    average_xp_per_user: float
    top_activity_type: str | None = None
    most_active_agent: str | None = None
    xp_awarded_today: int
    xp_awarded_this_week: int
    xp_awarded_this_month: int
