"""
Focus session timer integration for dashboard.

Provides focus session management, progress tracking,
and integration with gamification system.
"""

import asyncio
from datetime import datetime, timedelta
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel

from ..gamification.gamification_service import GamificationService


class FocusSessionType(str, Enum):
    """Types of focus sessions."""

    POMODORO = "pomodoro"
    DEEP_WORK = "deep_work"
    SPRINT = "sprint"
    CUSTOM = "custom"


class FocusSessionStatus(str, Enum):
    """Focus session status states."""

    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class FocusSessionData(BaseModel):
    """Focus session configuration data."""

    duration_minutes: int
    task_id: str | None = None
    session_type: FocusSessionType = FocusSessionType.POMODORO
    break_duration: int | None = None


class FocusSession:
    """Active focus session tracking."""

    def __init__(self, session_id: str, user_id: int, config: FocusSessionData):
        self.session_id = session_id
        self.user_id = user_id
        self.config = config
        self.start_time = datetime.now()
        self.status = FocusSessionStatus.ACTIVE
        self.pause_time: datetime | None = None
        self.total_paused_duration = timedelta()

    @property
    def elapsed_time(self) -> timedelta:
        """Calculate elapsed time excluding pauses."""
        if self.status == FocusSessionStatus.PAUSED and self.pause_time:
            return self.pause_time - self.start_time - self.total_paused_duration
        return datetime.now() - self.start_time - self.total_paused_duration

    @property
    def remaining_time(self) -> timedelta:
        """Calculate remaining time in session."""
        total_duration = timedelta(minutes=self.config.duration_minutes)
        remaining = total_duration - self.elapsed_time
        return max(remaining, timedelta())

    @property
    def completion_percentage(self) -> float:
        """Calculate completion percentage."""
        total_duration = timedelta(minutes=self.config.duration_minutes)
        elapsed = self.elapsed_time
        percentage = (elapsed.total_seconds() / total_duration.total_seconds()) * 100
        return min(percentage, 100.0)


class FocusTimer:
    """
    Focus session timer with dashboard integration.

    Manages focus sessions, tracks progress, and integrates
    with gamification system for XP rewards.
    """

    def __init__(self):
        """Initialize focus timer."""
        self.active_sessions: dict[str, FocusSession] = {}
        self.gamification_service = GamificationService()

    async def start_session(self, user_id: int, session_data: dict[str, Any]) -> dict[str, Any]:
        """
        Start new focus session.

        Args:
            user_id: User starting the session
            session_data: Session configuration

        Returns:
            Session start response
        """
        session_id = str(uuid4())
        config = FocusSessionData(**session_data)

        session = FocusSession(session_id, user_id, config)
        self.active_sessions[session_id] = session

        # Schedule automatic completion
        asyncio.create_task(self._auto_complete_session(session_id, config.duration_minutes))

        return {
            "status": "success",
            "session_id": session_id,
            "start_time": session.start_time.isoformat(),
            "duration_minutes": config.duration_minutes,
            "session_type": config.session_type,
        }

    async def get_session_progress(self, session_id: str) -> dict[str, Any]:
        """
        Get current session progress.

        Args:
            session_id: Session ID to check

        Returns:
            Session progress data
        """
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}

        session = self.active_sessions[session_id]

        return {
            "session_id": session_id,
            "status": session.status.value,
            "elapsed_minutes": int(session.elapsed_time.total_seconds() / 60),
            "remaining_minutes": int(session.remaining_time.total_seconds() / 60),
            "completion_percentage": round(session.completion_percentage, 1),
            "session_type": session.config.session_type.value,
        }

    async def pause_session(self, session_id: str) -> dict[str, Any]:
        """
        Pause active session.

        Args:
            session_id: Session to pause

        Returns:
            Pause response
        """
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}

        session = self.active_sessions[session_id]
        if session.status == FocusSessionStatus.ACTIVE:
            session.status = FocusSessionStatus.PAUSED
            session.pause_time = datetime.now()

        return {
            "status": "success",
            "session_status": session.status.value,
            "paused_at": datetime.now().isoformat(),
        }

    async def resume_session(self, session_id: str) -> dict[str, Any]:
        """
        Resume paused session.

        Args:
            session_id: Session to resume

        Returns:
            Resume response
        """
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}

        session = self.active_sessions[session_id]
        if session.status == FocusSessionStatus.PAUSED and session.pause_time:
            # Add pause duration to total
            pause_duration = datetime.now() - session.pause_time
            session.total_paused_duration += pause_duration
            session.status = FocusSessionStatus.ACTIVE
            session.pause_time = None

        return {
            "status": "success",
            "session_status": session.status.value,
            "resumed_at": datetime.now().isoformat(),
        }

    async def complete_session(self, session_id: str) -> dict[str, Any]:
        """
        Complete focus session and calculate rewards.

        Args:
            session_id: Session to complete

        Returns:
            Completion response with XP and summary
        """
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}

        session = self.active_sessions[session_id]
        session.status = FocusSessionStatus.COMPLETED

        # Calculate XP based on session completion
        xp_earned = self._calculate_session_xp(session)

        # Create session summary
        session_summary = {
            "session_id": session_id,
            "duration_minutes": session.config.duration_minutes,
            "actual_duration": int(session.elapsed_time.total_seconds() / 60),
            "completion_percentage": session.completion_percentage,
            "session_type": session.config.session_type.value,
            "started_at": session.start_time.isoformat(),
            "completed_at": datetime.now().isoformat(),
        }

        # Remove from active sessions
        del self.active_sessions[session_id]

        return {"status": "success", "xp_earned": xp_earned, "session_summary": session_summary}

    def _calculate_session_xp(self, session: FocusSession) -> int:
        """
        Calculate XP earned for completed session.

        Args:
            session: Completed focus session

        Returns:
            XP points earned
        """
        base_xp = {
            FocusSessionType.POMODORO: 15,
            FocusSessionType.DEEP_WORK: 25,
            FocusSessionType.SPRINT: 20,
            FocusSessionType.CUSTOM: 10,
        }

        xp = base_xp.get(session.config.session_type, 10)

        # Bonus for full completion
        if session.completion_percentage >= 95:
            xp = int(xp * 1.2)

        # Bonus for longer sessions
        if session.config.duration_minutes >= 60:
            xp = int(xp * 1.3)

        return xp

    async def _auto_complete_session(self, session_id: str, duration_minutes: int):
        """
        Automatically complete session after duration.

        Args:
            session_id: Session to auto-complete
            duration_minutes: Session duration
        """
        await asyncio.sleep(duration_minutes * 60)

        if session_id in self.active_sessions:
            await self.complete_session(session_id)
