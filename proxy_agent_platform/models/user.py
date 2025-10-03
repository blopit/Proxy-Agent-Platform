"""
User models for Proxy Agent Platform.

Defines user entities, preferences, and statistics following CLAUDE.md standards.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from uuid import UUID

from pydantic import Field, EmailStr, validator

from .base import BaseModel, TimestampMixin, UUIDMixin, MetadataMixin


class UserRole(str, Enum):
    """User roles in the platform."""
    BASIC = "basic"
    PREMIUM = "premium"
    ADMIN = "admin"


class UserStatus(str, Enum):
    """User account status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class NotificationPreference(str, Enum):
    """Notification delivery preferences."""
    EMAIL = "email"
    PUSH = "push"
    SMS = "sms"
    WEBHOOK = "webhook"
    DISABLED = "disabled"


class User(UUIDMixin, TimestampMixin, MetadataMixin):
    """
    User entity representing a platform user.

    Core user information with authentication and preference management.
    """

    # Basic Information
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    full_name: Optional[str] = Field(None, max_length=200, description="User's full name")
    avatar_url: Optional[str] = Field(None, description="URL to user's avatar image")

    # Account Status
    role: UserRole = Field(default=UserRole.BASIC, description="User's role in the platform")
    status: UserStatus = Field(default=UserStatus.PENDING, description="Account status")
    is_verified: bool = Field(default=False, description="Whether email is verified")

    # Authentication
    hashed_password: Optional[str] = Field(None, description="Hashed password")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    login_count: int = Field(default=0, description="Total number of logins")

    # OAuth Integration
    github_username: Optional[str] = Field(None, description="GitHub username")
    github_token: Optional[str] = Field(None, description="GitHub access token")
    google_email: Optional[str] = Field(None, description="Google account email")

    @validator('username')
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError("Username can only contain letters, numbers, underscores, and hyphens")
        return v.lower()

    @validator('email')
    def validate_email_unique(cls, v: EmailStr) -> EmailStr:
        """Email validation (uniqueness checked at service layer)."""
        return v.lower()

    def update_login(self) -> None:
        """Update login information."""
        self.last_login = datetime.now(timezone.utc)
        self.login_count += 1
        self.mark_updated()

    def is_premium(self) -> bool:
        """Check if user has premium access."""
        return self.role in (UserRole.PREMIUM, UserRole.ADMIN)

    def is_admin(self) -> bool:
        """Check if user is an admin."""
        return self.role == UserRole.ADMIN


class UserPreferences(UUIDMixin, TimestampMixin, UserContextMixin):
    """
    User preferences for personalization and agent behavior.

    Stores user-specific settings for agents, notifications, and UI.
    """

    # Agent Preferences
    preferred_llm_provider: str = Field(default="openai", description="Preferred LLM provider")
    preferred_llm_model: str = Field(default="gpt-4", description="Preferred LLM model")
    agent_personality: str = Field(default="professional", description="Agent personality style")

    # Productivity Preferences
    default_focus_duration: int = Field(default=25, ge=5, le=120, description="Default focus session minutes")
    energy_tracking_enabled: bool = Field(default=True, description="Enable energy level tracking")
    break_reminders: bool = Field(default=True, description="Enable break reminders")

    # Notification Preferences
    notification_methods: List[NotificationPreference] = Field(
        default=[NotificationPreference.EMAIL],
        description="Preferred notification methods"
    )
    quiet_hours_start: Optional[str] = Field(None, description="Quiet hours start time (HH:MM)")
    quiet_hours_end: Optional[str] = Field(None, description="Quiet hours end time (HH:MM)")

    # Gamification Preferences
    gamification_enabled: bool = Field(default=True, description="Enable gamification features")
    achievement_notifications: bool = Field(default=True, description="Show achievement notifications")
    streak_reminders: bool = Field(default=True, description="Enable streak reminders")

    # Mobile Integration
    ios_shortcuts_enabled: bool = Field(default=False, description="Enable iOS Shortcuts integration")
    android_tiles_enabled: bool = Field(default=False, description="Enable Android tiles")
    wearable_integration: bool = Field(default=False, description="Enable wearable device integration")

    # Privacy & Security
    data_sharing_analytics: bool = Field(default=False, description="Share usage analytics")
    external_integrations: List[str] = Field(default=[], description="Enabled external integrations")

    @validator('notification_methods')
    def validate_notification_methods(cls, v: List[NotificationPreference]) -> List[NotificationPreference]:
        """Validate notification methods."""
        if not v:
            return [NotificationPreference.EMAIL]  # Default fallback
        return list(set(v))  # Remove duplicates

    def get_focus_settings(self) -> Dict[str, Any]:
        """Get focus session settings."""
        return {
            "duration": self.default_focus_duration,
            "break_reminders": self.break_reminders,
            "energy_tracking": self.energy_tracking_enabled,
        }

    def is_in_quiet_hours(self) -> bool:
        """Check if current time is within quiet hours."""
        if not self.quiet_hours_start or not self.quiet_hours_end:
            return False

        now = datetime.now().time()
        try:
            start_time = datetime.strptime(self.quiet_hours_start, "%H:%M").time()
            end_time = datetime.strptime(self.quiet_hours_end, "%H:%M").time()

            if start_time <= end_time:
                return start_time <= now <= end_time
            else:  # Quiet hours span midnight
                return now >= start_time or now <= end_time
        except ValueError:
            return False


class UserStats(UUIDMixin, TimestampMixin, UserContextMixin):
    """
    User statistics and metrics for analytics and gamification.

    Tracks user activity, progress, and achievements.
    """

    # Activity Metrics
    total_tasks_completed: int = Field(default=0, description="Total tasks completed")
    total_focus_time: int = Field(default=0, description="Total focus time in minutes")
    total_xp: int = Field(default=0, description="Total XP earned")
    current_streak: int = Field(default=0, description="Current daily streak")
    longest_streak: int = Field(default=0, description="Longest daily streak")

    # Agent Usage
    agent_interactions: int = Field(default=0, description="Total agent interactions")
    favorite_agent: Optional[str] = Field(None, description="Most used agent type")

    # Productivity Metrics
    average_energy_level: float = Field(default=5.0, ge=1.0, le=10.0, description="Average energy level")
    peak_productivity_hour: Optional[int] = Field(None, ge=0, le=23, description="Most productive hour")
    completion_rate: float = Field(default=0.0, ge=0.0, le=1.0, description="Task completion rate")

    # Achievement Progress
    achievements_unlocked: List[str] = Field(default=[], description="Unlocked achievement IDs")
    badges_earned: List[str] = Field(default=[], description="Earned badge IDs")
    level: int = Field(default=1, ge=1, description="User level based on XP")

    # Time Tracking
    last_activity: Optional[datetime] = Field(None, description="Last platform activity")
    last_streak_update: Optional[datetime] = Field(None, description="Last streak update")

    def update_activity(self) -> None:
        """Update last activity timestamp."""
        self.last_activity = datetime.now(timezone.utc)
        self.mark_updated()

    def add_xp(self, amount: int) -> int:
        """Add XP and return new level if leveled up."""
        old_level = self.level
        self.total_xp += amount
        self.level = self._calculate_level(self.total_xp)
        self.mark_updated()
        return self.level - old_level

    def update_streak(self, increment: bool = True) -> None:
        """Update streak counter."""
        if increment:
            self.current_streak += 1
            if self.current_streak > self.longest_streak:
                self.longest_streak = self.current_streak
        else:
            self.current_streak = 0

        self.last_streak_update = datetime.now(timezone.utc)
        self.mark_updated()

    def complete_task(self, focus_time: int = 0) -> None:
        """Record task completion."""
        self.total_tasks_completed += 1
        self.total_focus_time += focus_time
        self.update_activity()

    def unlock_achievement(self, achievement_id: str) -> bool:
        """Unlock an achievement. Returns True if newly unlocked."""
        if achievement_id not in self.achievements_unlocked:
            self.achievements_unlocked.append(achievement_id)
            self.mark_updated()
            return True
        return False

    def _calculate_level(self, xp: int) -> int:
        """Calculate level based on XP using exponential curve."""
        if xp < 100:
            return 1

        # Level = floor(sqrt(XP / 100)) + 1
        import math
        return int(math.sqrt(xp / 100)) + 1

    def get_next_level_xp(self) -> int:
        """Get XP required for next level."""
        next_level = self.level + 1
        required_xp = (next_level - 1) ** 2 * 100
        return max(0, required_xp - self.total_xp)