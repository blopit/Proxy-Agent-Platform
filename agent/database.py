"""
Database configuration and models for the Proxy Agent Platform.

This module provides SQLAlchemy models for the productivity platform,
including user data, tasks, focus sessions, energy tracking, and gamification.
"""

import os
from datetime import datetime
from enum import Enum

from dotenv import load_dotenv
from pydantic import BaseModel, ConfigDict
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    text,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./proxy_agent_platform.db")

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()


# Enums
class TaskStatus(str, Enum):
    """Task status enumeration."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    """Task priority enumeration."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class EnergyLevel(str, Enum):
    """Energy level enumeration."""

    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class AgentType(str, Enum):
    """Agent type enumeration."""

    TASK = "task"
    FOCUS = "focus"
    ENERGY = "energy"
    PROGRESS = "progress"


# SQLAlchemy Models
class User(Base):
    """User model for the productivity platform."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

    # Gamification fields
    total_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime)

    # Relationships
    tasks = relationship("Task", back_populates="user")
    focus_sessions = relationship("FocusSession", back_populates="user")
    energy_logs = relationship("EnergyLog", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")


class Task(Base):
    """Task model managed by the Task Agent."""

    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING)
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM)

    # Time tracking
    estimated_duration = Column(Integer)  # minutes
    actual_duration = Column(Integer)  # minutes
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    due_date = Column(DateTime)
    completed_at = Column(DateTime)

    # AI-generated metadata
    ai_suggested = Column(Boolean, default=False)
    ai_priority_score = Column(Float)
    ai_tags = Column(JSON)  # List of AI-generated tags

    # XP reward
    xp_reward = Column(Integer, default=50)

    # Relationships
    user = relationship("User", back_populates="tasks")


class FocusSession(Base):
    """Focus session model managed by the Focus Agent."""

    __tablename__ = "focus_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String)
    description = Column(Text)

    # Session timing
    planned_duration = Column(Integer, nullable=False)  # minutes
    actual_duration = Column(Integer)  # minutes
    started_at = Column(DateTime, default=func.now())
    ended_at = Column(DateTime)

    # Session quality metrics
    interruptions = Column(Integer, default=0)
    productivity_rating = Column(Integer)  # 1-10 scale
    focus_score = Column(Float)  # AI-calculated focus score

    # AI recommendations
    ai_recommended_duration = Column(Integer)
    ai_optimal_time_slot = Column(JSON)

    # XP reward
    xp_reward = Column(Integer, default=100)

    # Relationships
    user = relationship("User", back_populates="focus_sessions")


class EnergyLog(Base):
    """Energy tracking model managed by the Energy Agent."""

    __tablename__ = "energy_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Energy metrics
    energy_level = Column(SQLEnum(EnergyLevel), nullable=False)
    mood_rating = Column(Integer)  # 1-10 scale
    stress_level = Column(Integer)  # 1-10 scale
    sleep_hours = Column(Float)

    # Context
    activity = Column(String)  # What the user was doing
    location = Column(String)
    weather = Column(String)
    notes = Column(Text)

    # Timestamps
    logged_at = Column(DateTime, default=func.now())

    # AI insights
    ai_energy_prediction = Column(Float)
    ai_recommendations = Column(JSON)

    # Relationships
    user = relationship("User", back_populates="energy_logs")


class Achievement(Base):
    """Achievement definitions for gamification."""

    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=False)
    icon = Column(String)  # Icon name/path
    category = Column(String)  # task, focus, energy, streak, etc.
    xp_reward = Column(Integer, default=100)

    # Achievement criteria (stored as JSON)
    criteria = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=func.now())

    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    """User achievements tracking."""

    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)

    earned_at = Column(DateTime, default=func.now())
    progress = Column(Float, default=0.0)  # For progressive achievements

    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")


class AgentActivity(Base):
    """Activity log for AI agents."""

    __tablename__ = "agent_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_type = Column(SQLEnum(AgentType), nullable=False)

    action = Column(String, nullable=False)  # What the agent did
    description = Column(Text)
    context = Column(JSON)  # Additional context data

    created_at = Column(DateTime, default=func.now())


# Pydantic models for API responses
class UserCreate(BaseModel):
    """User creation schema."""

    email: str
    username: str
    password: str
    full_name: str | None = None


class UserResponse(BaseModel):
    """User response schema."""

    id: int
    email: str
    username: str
    full_name: str | None
    total_xp: int
    current_level: int
    current_streak: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskCreate(BaseModel):
    """Task creation schema."""

    title: str
    description: str | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_duration: int | None = None
    due_date: datetime | None = None


class TaskResponse(BaseModel):
    """Task response schema."""

    id: int
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    estimated_duration: int | None
    actual_duration: int | None
    created_at: datetime
    due_date: datetime | None
    completed_at: datetime | None
    ai_suggested: bool
    xp_reward: int

    model_config = ConfigDict(from_attributes=True)


# Database functions
async def init_db():
    """Initialize the database."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create default achievements
    await create_default_achievements()


async def close_db():
    """Close database connections."""
    await engine.dispose()


async def get_db():
    """Get database session."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_default_achievements():
    """Create default achievements for the platform."""
    default_achievements = [
        {
            "name": "First Task",
            "description": "Complete your first task!",
            "category": "task",
            "xp_reward": 100,
            "criteria": {"tasks_completed": 1},
        },
        {
            "name": "Week Warrior",
            "description": "Maintain a 7-day productivity streak",
            "category": "streak",
            "xp_reward": 500,
            "criteria": {"streak_days": 7},
        },
        {
            "name": "Focus Master",
            "description": "Complete a 2-hour focus session",
            "category": "focus",
            "xp_reward": 300,
            "criteria": {"focus_duration_minutes": 120},
        },
        {
            "name": "Energy Tracker",
            "description": "Log your energy for 7 consecutive days",
            "category": "energy",
            "xp_reward": 200,
            "criteria": {"energy_logs_consecutive": 7},
        },
    ]

    async with async_session() as session:
        for achievement_data in default_achievements:
            # Check if achievement exists
            existing = await session.execute(
                text("SELECT id FROM achievements WHERE name = :name"), {"name": achievement_data["name"]}
            )
            if not existing.first():
                achievement = Achievement(**achievement_data)
                session.add(achievement)

        await session.commit()
