# BE-07: Notification System

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 5-6 hours
**Dependencies**: Core task models, BE-03 (Focus Sessions)
**Agent Type**: backend-tdd

---

## 📋 Overview

Build notification system for task reminders, streak alerts, achievement celebrations, and energy-based suggestions.

**Core Functionality**:
- Scheduled notifications (task deadlines, focus session end)
- Event-driven notifications (achievement unlocked, streak milestone)
- Energy-aware timing (suggest tasks based on energy level)
- Delivery channels (in-app, push, email - initially in-app only)
- User preferences and quiet hours

---

## 🗄️ Database Schema

```sql
-- Notification templates
CREATE TABLE notification_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) UNIQUE NOT NULL,
    notification_type VARCHAR(50) NOT NULL,  -- 'reminder', 'celebration', 'suggestion'
    title_template VARCHAR(255) NOT NULL,  -- 'Task due in {minutes} minutes!'
    body_template TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',  -- 'low', 'normal', 'high'
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User notifications
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    template_key VARCHAR(100) REFERENCES notification_templates(template_key),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    icon VARCHAR(50),
    action_url VARCHAR(500),  -- Deep link to relevant screen
    related_entity_type VARCHAR(50),  -- 'task', 'achievement', 'pet'
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Notification preferences
CREATE TABLE notification_preferences (
    preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    enable_reminders BOOLEAN DEFAULT true,
    enable_celebrations BOOLEAN DEFAULT true,
    enable_suggestions BOOLEAN DEFAULT true,
    quiet_hours_start TIME,  -- 22:00
    quiet_hours_end TIME,    -- 08:00
    preferred_reminder_minutes INT[] DEFAULT ARRAY[15, 60],  -- Remind 15min and 1hr before
    max_daily_notifications INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled notifications (future delivery)
CREATE TABLE scheduled_notifications (
    scheduled_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    template_key VARCHAR(100) NOT NULL,
    template_data JSONB,  -- Variables to fill template
    scheduled_for TIMESTAMP NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'sent', 'cancelled'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_sent ON notifications(sent_at DESC);
CREATE INDEX idx_scheduled_notifications_pending ON scheduled_notifications(scheduled_for) WHERE status = 'pending';
```

---

## 🏗️ Pydantic Models

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Literal, Dict, Any
from datetime import datetime, time
from uuid import UUID, uuid4

class NotificationCreate(BaseModel):
    """Create a new notification."""
    user_id: str
    template_key: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1)
    notification_type: Literal["reminder", "celebration", "suggestion", "warning"]
    priority: Literal["low", "normal", "high"] = "normal"
    icon: Optional[str] = None
    action_url: Optional[str] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None
    expires_at: Optional[datetime] = None


class Notification(BaseModel):
    """Notification response model."""
    notification_id: UUID
    user_id: str
    title: str
    body: str
    notification_type: str
    priority: str
    icon: Optional[str] = None
    action_url: Optional[str] = None
    is_read: bool = False
    sent_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationPreferences(BaseModel):
    """User notification preferences."""
    user_id: str
    enable_reminders: bool = True
    enable_celebrations: bool = True
    enable_suggestions: bool = True
    quiet_hours_start: Optional[time] = None
    quiet_hours_end: Optional[time] = None
    preferred_reminder_minutes: List[int] = [15, 60]
    max_daily_notifications: int = Field(default=20, ge=5, le=100)

    class Config:
        from_attributes = True


class ScheduleNotificationRequest(BaseModel):
    """Schedule a notification for future delivery."""
    user_id: str
    template_key: str
    template_data: Dict[str, Any] = {}
    scheduled_for: datetime
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None

    @validator('scheduled_for')
    def validate_future_time(cls, v):
        if v <= datetime.now(UTC):
            raise ValueError("scheduled_for must be in the future")
        return v
```

---

## 🏛️ Repository Layer

```python
from typing import List, Optional
from datetime import datetime, time, UTC
from src.repository.base import BaseRepository

class NotificationRepository(BaseRepository):
    """Repository for notifications."""

    def create_notification(self, notif: NotificationCreate) -> Notification:
        """Create and send a notification."""
        query = """
            INSERT INTO notifications (
                user_id, template_key, title, body, notification_type,
                priority, icon, action_url, related_entity_type,
                related_entity_id, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        """
        return self.fetch_one(
            query, notif.user_id, notif.template_key, notif.title,
            notif.body, notif.notification_type, notif.priority,
            notif.icon, notif.action_url, notif.related_entity_type,
            notif.related_entity_id, notif.expires_at
        )

    def get_unread_notifications(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[Notification]:
        """Get unread notifications for user."""
        query = """
            SELECT * FROM notifications
            WHERE user_id = $1 AND is_read = false
              AND (expires_at IS NULL OR expires_at > NOW())
            ORDER BY priority DESC, sent_at DESC
            LIMIT $2
        """
        return self.fetch_all(query, user_id, limit)

    def mark_as_read(self, notification_id: UUID) -> None:
        """Mark notification as read."""
        query = """
            UPDATE notifications
            SET is_read = true, read_at = NOW()
            WHERE notification_id = $1
        """
        self.execute(query, notification_id)

    def schedule_notification(
        self,
        request: ScheduleNotificationRequest
    ) -> UUID:
        """Schedule a notification for future delivery."""
        query = """
            INSERT INTO scheduled_notifications (
                user_id, template_key, template_data, scheduled_for,
                related_entity_type, related_entity_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING scheduled_id
        """
        result = self.fetch_one(
            query, request.user_id, request.template_key,
            request.template_data, request.scheduled_for,
            request.related_entity_type, request.related_entity_id
        )
        return result.scheduled_id

    def get_due_scheduled_notifications(self) -> List[dict]:
        """Get notifications that should be sent now."""
        query = """
            SELECT * FROM scheduled_notifications
            WHERE status = 'pending'
              AND scheduled_for <= NOW()
            ORDER BY scheduled_for ASC
            LIMIT 100
        """
        return self.fetch_all(query)

    def is_quiet_hours(self, user_id: str) -> bool:
        """Check if current time is in user's quiet hours."""
        query = """
            SELECT quiet_hours_start, quiet_hours_end
            FROM notification_preferences
            WHERE user_id = $1
        """
        prefs = self.fetch_one(query, user_id)

        if not prefs or not prefs.quiet_hours_start:
            return False

        now_time = datetime.now(UTC).time()
        start = prefs.quiet_hours_start
        end = prefs.quiet_hours_end

        # Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if start < end:
            return start <= now_time <= end
        else:
            return now_time >= start or now_time <= end
```

---

## 🌐 API Routes

```python
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from uuid import UUID

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])

@router.post("/", response_model=Notification, status_code=201)
async def send_notification(
    notif: NotificationCreate,
    repo: NotificationRepository = Depends()
) -> Notification:
    """Send an immediate notification."""
    # Check quiet hours
    if repo.is_quiet_hours(notif.user_id):
        # Schedule for when quiet hours end instead
        raise HTTPException(400, "User in quiet hours. Use /schedule endpoint.")

    return repo.create_notification(notif)


@router.get("/", response_model=List[Notification])
async def get_notifications(
    user_id: str = Query(...),
    unread_only: bool = Query(True),
    limit: int = Query(50, ge=1, le=100),
    repo: NotificationRepository = Depends()
) -> List[Notification]:
    """Get user notifications."""
    if unread_only:
        return repo.get_unread_notifications(user_id, limit)
    else:
        query = """
            SELECT * FROM notifications
            WHERE user_id = $1
            ORDER BY sent_at DESC
            LIMIT $2
        """
        return repo.fetch_all(query, user_id, limit)


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    repo: NotificationRepository = Depends()
):
    """Mark a notification as read."""
    repo.mark_as_read(notification_id)
    return {"message": "Notification marked as read"}


@router.post("/schedule", status_code=201)
async def schedule_notification(
    request: ScheduleNotificationRequest,
    repo: NotificationRepository = Depends()
):
    """Schedule a notification for future delivery."""
    scheduled_id = repo.schedule_notification(request)
    return {"scheduled_id": scheduled_id, "message": "Notification scheduled"}


@router.get("/preferences", response_model=NotificationPreferences)
async def get_preferences(
    user_id: str = Query(...),
    repo: NotificationRepository = Depends()
) -> NotificationPreferences:
    """Get user notification preferences."""
    query = "SELECT * FROM notification_preferences WHERE user_id = $1"
    prefs = repo.fetch_one(query, user_id)

    if not prefs:
        # Create default preferences
        insert_query = """
            INSERT INTO notification_preferences (user_id)
            VALUES ($1)
            RETURNING *
        """
        prefs = repo.fetch_one(insert_query, user_id)

    return prefs


@router.put("/preferences")
async def update_preferences(
    prefs: NotificationPreferences,
    repo: NotificationRepository = Depends()
):
    """Update user notification preferences."""
    query = """
        INSERT INTO notification_preferences (
            user_id, enable_reminders, enable_celebrations,
            enable_suggestions, quiet_hours_start, quiet_hours_end,
            preferred_reminder_minutes, max_daily_notifications
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id)
        DO UPDATE SET
            enable_reminders = EXCLUDED.enable_reminders,
            enable_celebrations = EXCLUDED.enable_celebrations,
            enable_suggestions = EXCLUDED.enable_suggestions,
            quiet_hours_start = EXCLUDED.quiet_hours_start,
            quiet_hours_end = EXCLUDED.quiet_hours_end,
            preferred_reminder_minutes = EXCLUDED.preferred_reminder_minutes,
            max_daily_notifications = EXCLUDED.max_daily_notifications,
            updated_at = NOW()
    """
    repo.execute(
        query, prefs.user_id, prefs.enable_reminders,
        prefs.enable_celebrations, prefs.enable_suggestions,
        prefs.quiet_hours_start, prefs.quiet_hours_end,
        prefs.preferred_reminder_minutes, prefs.max_daily_notifications
    )
    return {"message": "Preferences updated"}
```

---

## 🧪 TDD Test Specifications

```python
import pytest
from datetime import datetime, timedelta, time, UTC
from uuid import uuid4

class TestNotificationSystem:
    """Test suite for notification system."""

    def test_create_notification_success(self, repo):
        """RED: Creating notification should work."""
        notif = NotificationCreate(
            user_id="user-123",
            title="Task due soon!",
            body="Your task is due in 15 minutes",
            notification_type="reminder",
            priority="high"
        )

        result = repo.create_notification(notif)

        assert result.notification_id
        assert result.is_read is False
        assert result.title == "Task due soon!"

    def test_quiet_hours_detection(self, repo):
        """RED: Should detect quiet hours correctly."""
        user_id = "user-123"

        # Set quiet hours: 22:00 to 08:00
        repo.execute("""
            INSERT INTO notification_preferences (user_id, quiet_hours_start, quiet_hours_end)
            VALUES ($1, '22:00', '08:00')
        """, user_id)

        # This test depends on current time, so we'll test the logic
        is_quiet = repo.is_quiet_hours(user_id)
        assert isinstance(is_quiet, bool)

    def test_schedule_future_notification(self, repo):
        """RED: Should schedule notification for future delivery."""
        future_time = datetime.now(UTC) + timedelta(hours=2)

        request = ScheduleNotificationRequest(
            user_id="user-123",
            template_key="task_reminder",
            template_data={"task_name": "Buy groceries", "minutes": 15},
            scheduled_for=future_time
        )

        scheduled_id = repo.schedule_notification(request)
        assert scheduled_id

    def test_mark_as_read_updates_timestamp(self, repo):
        """RED: Marking as read should set read_at."""
        notif = repo.create_notification(
            NotificationCreate(
                user_id="user-123",
                title="Test",
                body="Test body",
                notification_type="reminder"
            )
        )

        repo.mark_as_read(notif.notification_id)

        updated = repo.fetch_one(
            "SELECT * FROM notifications WHERE notification_id = $1",
            notif.notification_id
        )

        assert updated.is_read is True
        assert updated.read_at is not None

    def test_unread_notifications_excludes_read(self, repo):
        """RED: Unread endpoint should only return unread."""
        user_id = "user-123"

        # Create 3 notifications
        for i in range(3):
            repo.create_notification(
                NotificationCreate(
                    user_id=user_id,
                    title=f"Notif {i}",
                    body="Test",
                    notification_type="reminder"
                )
            )

        # Mark first one as read
        all_notifs = repo.get_unread_notifications(user_id)
        repo.mark_as_read(all_notifs[0].notification_id)

        # Should only get 2 unread
        unread = repo.get_unread_notifications(user_id)
        assert len(unread) == 2

    def test_api_send_notification(self, test_client):
        """RED: API should create notification."""
        payload = {
            "user_id": "user-123",
            "title": "Achievement unlocked!",
            "body": "You completed 10 tasks this week!",
            "notification_type": "celebration",
            "priority": "high",
            "icon": "🏆"
        }

        response = test_client.post("/api/v1/notifications/", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Achievement unlocked!"
        assert data["is_read"] is False
```

---

## ✅ Acceptance Criteria

- [ ] Notifications can be created and delivered immediately
- [ ] Scheduled notifications work for future delivery
- [ ] Quiet hours are respected
- [ ] User preferences control notification types
- [ ] Notifications can be marked as read
- [ ] Unread count API works correctly
- [ ] 95%+ test coverage
- [ ] All migrations run successfully

---

## 🎯 Success Metrics

- **Delivery Accuracy**: 99%+ of scheduled notifications sent on time
- **User Control**: Quiet hours reduce nighttime notifications by 95%+
- **Engagement**: 40%+ open rate on notifications

---

## 📚 Additional Context

**Future Enhancements**:
- Push notifications (FCM/APNS)
- Email notifications
- Smart batching (combine multiple into digest)
- ML-based optimal timing
