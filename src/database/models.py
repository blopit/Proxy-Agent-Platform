"""
SQLAlchemy ORM models matching existing schema

This module provides SQLAlchemy models for all database tables,
matching the schema defined in enhanced_adapter.py
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Numeric,
    CheckConstraint,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


def utc_now() -> datetime:
    """Get current UTC timestamp"""
    return datetime.now(timezone.utc)


class User(Base):
    """User model"""

    __tablename__ = "users"

    user_id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    timezone = Column(String, default="UTC")
    avatar_url = Column(String)
    bio = Column(Text)
    preferences = Column(Text, default="{}")  # JSON stored as text
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    # Relationships
    projects = relationship(
        "Project", back_populates="owner", cascade="all, delete-orphan"
    )
    tasks = relationship("Task", back_populates="assignee")
    compass_zones = relationship(
        "CompassZone", back_populates="user", cascade="all, delete-orphan"
    )
    morning_rituals = relationship(
        "MorningRitual", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(user_id={self.user_id}, username={self.username})>"


class Project(Base):
    """Project model"""

    __tablename__ = "projects"

    project_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    owner_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        index=True,
    )
    team_members = Column(Text, default="[]")  # JSON array
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    settings = Column(Text, default="{}")
    project_metadata = Column("metadata", Text, default="{}")  # Column name 'metadata' in DB
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    # Relationships
    owner = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Project(project_id={self.project_id}, name={self.name})>"


class Task(Base):
    """Task model with Epic 7 fields for task splitting"""

    __tablename__ = "tasks"

    task_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    project_id = Column(
        String,
        ForeignKey("projects.project_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    parent_id = Column(
        String, ForeignKey("tasks.task_id", ondelete="CASCADE"), index=True
    )
    capture_type = Column(String, default="task")
    status = Column(String, default="todo", index=True)
    priority = Column(String, default="medium", index=True)
    estimated_hours = Column(Numeric(10, 2))
    actual_hours = Column(Numeric(10, 2), default=0.0)
    tags = Column(Text, default="[]")
    assignee_id = Column(String, ForeignKey("users.user_id", ondelete="SET NULL"))
    due_date = Column(DateTime(timezone=True), index=True)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )
    task_metadata = Column("metadata", Text, default="{}")  # Column name 'metadata' in DB

    # Epic 7 fields
    scope = Column(String, default="simple")
    delegation_mode = Column(String, default="do")
    is_micro_step = Column(Boolean, default=False)
    micro_steps = Column(Text, default="[]")
    level = Column(Integer, default=0)
    custom_emoji = Column(String)
    decomposition_state = Column(String, default="stub")
    children_ids = Column(Text, default="[]")
    total_minutes = Column(Integer, default=0)
    is_leaf = Column(Boolean, default=False)
    leaf_type = Column(String)
    zone_id = Column(String, ForeignKey("compass_zones.zone_id"), index=True)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks")
    parent = relationship("Task", remote_side=[task_id], backref="children")
    micro_step_records = relationship(
        "MicroStep", back_populates="task", cascade="all, delete-orphan"
    )
    comments = relationship(
        "TaskComment", back_populates="task", cascade="all, delete-orphan"
    )
    zone = relationship("CompassZone", back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task(task_id={self.task_id}, title={self.title}, status={self.status})>"


class MicroStep(Base):
    """Micro-step model for ADHD task splitting"""

    __tablename__ = "micro_steps"

    step_id = Column(String, primary_key=True)
    parent_task_id = Column(
        String,
        ForeignKey("tasks.task_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    step_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    estimated_minutes = Column(
        Integer,
        nullable=False,
        # CheckConstraint not directly on column in declarative, add separately
    )
    delegation_mode = Column(String, default="do")
    emoji = Column(String)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        CheckConstraint(
            "estimated_minutes >= 1 AND estimated_minutes <= 10",
            name="check_estimated_minutes_range",
        ),
    )

    # Relationships
    task = relationship("Task", back_populates="micro_step_records")

    def __repr__(self) -> str:
        return f"<MicroStep(step_id={self.step_id}, description={self.description})>"


class TaskComment(Base):
    """Task comment model"""

    __tablename__ = "task_comments"

    comment_id = Column(String, primary_key=True)
    task_id = Column(
        String,
        ForeignKey("tasks.task_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True))
    is_edited = Column(Boolean, default=False)

    # Relationships
    task = relationship("Task", back_populates="comments")

    def __repr__(self) -> str:
        return f"<TaskComment(comment_id={self.comment_id}, task_id={self.task_id})>"


class CompassZone(Base):
    """Compass zone model for life areas (Work, Life, Self)"""

    __tablename__ = "compass_zones"

    zone_id = Column(String, primary_key=True)
    user_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    simple_goal = Column(Text)
    color = Column(String, default="#3b82f6")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    # Relationships
    user = relationship("User", back_populates="compass_zones")
    tasks = relationship("Task", back_populates="zone")

    def __repr__(self) -> str:
        return f"<CompassZone(zone_id={self.zone_id}, name={self.name})>"


class MorningRitual(Base):
    """Morning ritual model for daily planning"""

    __tablename__ = "morning_rituals"

    ritual_id = Column(String, primary_key=True)
    user_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    completion_date = Column(String, nullable=False)  # DATE in YYYY-MM-DD format
    focus_task_1_id = Column(String)
    focus_task_2_id = Column(String)
    focus_task_3_id = Column(String)
    completed_at = Column(DateTime(timezone=True), default=utc_now)
    skipped = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="morning_rituals")

    def __repr__(self) -> str:
        return f"<MorningRitual(ritual_id={self.ritual_id}, date={self.completion_date})>"


class EnergySnapshot(Base):
    """Energy snapshot model for manual energy tracking"""

    __tablename__ = "energy_snapshots"

    snapshot_id = Column(String, primary_key=True)
    user_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    energy_level = Column(Integer, nullable=False)  # 1=Low, 2=Medium, 3=High
    recorded_at = Column(DateTime(timezone=True), default=utc_now)
    time_of_day = Column(String)
    notes = Column(Text)

    __table_args__ = (
        CheckConstraint(
            "energy_level >= 1 AND energy_level <= 3",
            name="check_energy_level_range",
        ),
    )

    def __repr__(self) -> str:
        return f"<EnergySnapshot(snapshot_id={self.snapshot_id}, level={self.energy_level})>"


class FocusSession(Base):
    """Focus/Pomodoro session model"""

    __tablename__ = "focus_sessions"

    session_id = Column(String, primary_key=True)
    user_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    task_id = Column(String, ForeignKey("tasks.task_id", ondelete="CASCADE"))
    duration_minutes = Column(Integer, default=25)
    started_at = Column(DateTime(timezone=True), default=utc_now)
    ended_at = Column(DateTime(timezone=True))
    is_completed = Column(Boolean, default=False)
    interruptions = Column(Integer, default=0)
    notes = Column(Text)

    def __repr__(self) -> str:
        return f"<FocusSession(session_id={self.session_id}, duration={self.duration_minutes})>"


class Goal(Base):
    """Goal model"""

    __tablename__ = "goals"

    goal_id = Column(String, primary_key=True)
    user_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String, nullable=False)
    description = Column(Text)
    target_date = Column(DateTime(timezone=True))
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utc_now)

    def __repr__(self) -> str:
        return f"<Goal(goal_id={self.goal_id}, title={self.title})>"


class Habit(Base):
    """Habit model"""

    __tablename__ = "habits"

    habit_id = Column(String, primary_key=True)
    user_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String, nullable=False)
    description = Column(Text)
    frequency = Column(String, default="daily")
    streak = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    def __repr__(self) -> str:
        return f"<Habit(habit_id={self.habit_id}, name={self.name}, streak={self.streak})>"


class Achievement(Base):
    """Achievement model for gamification"""

    __tablename__ = "achievements"

    achievement_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    xp_reward = Column(Integer, default=0)
    criteria = Column(Text, default="{}")  # JSON
    created_at = Column(DateTime(timezone=True), default=utc_now)

    def __repr__(self) -> str:
        return f"<Achievement(achievement_id={self.achievement_id}, name={self.name})>"


class UserAchievement(Base):
    """User achievement junction table"""

    __tablename__ = "user_achievements"

    user_achievement_id = Column(String, primary_key=True)
    user_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    achievement_id = Column(
        String,
        ForeignKey("achievements.achievement_id", ondelete="CASCADE"),
        nullable=False,
    )
    unlocked_at = Column(DateTime(timezone=True), default=utc_now)

    def __repr__(self) -> str:
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id})>"
