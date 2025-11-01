"""
Pydantic models for provider integrations

This module defines data models for OAuth provider connections,
AI-generated task suggestions, and sync operations.
"""

from datetime import datetime
from typing import Literal, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# Provider Types and Status Enums
# ============================================================================

ProviderType = Literal[
    "gmail",
    "google_calendar",
    "google_drive",
    "slack",
    "notion",
    "trello",
    "asana",
    "github",
    "linear",
]

ConnectionStatus = Literal["connected", "disconnected", "error", "connecting"]

SyncStatus = Literal["pending_approval", "approved", "dismissed", "auto_approved"]

ProviderItemType = Literal[
    "email",
    "calendar_event",
    "slack_message",
    "notion_page",
    "github_issue",
    "github_pr",
    "linear_issue",
]


# ============================================================================
# User Integration Models
# ============================================================================


class UserIntegrationBase(BaseModel):
    """Base fields for user integration"""

    provider: ProviderType
    provider_user_id: Optional[str] = None
    provider_username: Optional[str] = None
    status: ConnectionStatus = "disconnected"
    error_message: Optional[str] = None
    scopes: list[str] = Field(default_factory=list)
    sync_enabled: bool = True
    sync_frequency_minutes: int = 15
    auto_generate_tasks: bool = True
    settings: dict = Field(default_factory=dict)
    metadata: dict = Field(default_factory=dict)


class UserIntegrationCreate(UserIntegrationBase):
    """Model for creating a new user integration"""

    user_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "Bearer"
    token_expires_at: Optional[datetime] = None


class UserIntegrationUpdate(BaseModel):
    """Model for updating an existing user integration"""

    status: Optional[ConnectionStatus] = None
    error_message: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    last_sync_at: Optional[datetime] = None
    next_sync_at: Optional[datetime] = None
    sync_enabled: Optional[bool] = None
    sync_frequency_minutes: Optional[int] = None
    auto_generate_tasks: Optional[bool] = None
    settings: Optional[dict] = None
    provider_user_id: Optional[str] = None
    provider_username: Optional[str] = None


class UserIntegration(UserIntegrationBase):
    """Complete user integration model with database fields"""

    integration_id: UUID
    user_id: str
    last_sync_at: Optional[datetime] = None
    next_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Note: access_token and refresh_token are NOT included in public model
    # These are sensitive and should only be accessed by internal services

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Integration Task Models
# ============================================================================


class IntegrationTaskBase(BaseModel):
    """Base fields for integration task"""

    provider_item_id: str
    provider_item_type: ProviderItemType
    provider_url: Optional[str] = None
    suggested_title: str
    suggested_description: Optional[str] = None
    suggested_priority: Literal["low", "medium", "high"] = "medium"
    suggested_due_date: Optional[datetime] = None
    suggested_estimated_hours: Optional[float] = None
    suggested_tags: list[str] = Field(default_factory=list)
    ai_confidence: Optional[float] = None
    ai_reasoning: Optional[str] = None
    generation_model: Optional[str] = None
    provider_item_snapshot: dict = Field(default_factory=dict)
    metadata: dict = Field(default_factory=dict)


class IntegrationTaskCreate(IntegrationTaskBase):
    """Model for creating a new integration task"""

    integration_id: UUID
    sync_status: SyncStatus = "pending_approval"


class IntegrationTaskUpdate(BaseModel):
    """Model for updating an existing integration task"""

    task_id: Optional[str] = None
    sync_status: Optional[SyncStatus] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None


class IntegrationTask(IntegrationTaskBase):
    """Complete integration task model with database fields"""

    integration_task_id: UUID
    integration_id: UUID
    task_id: Optional[str] = None
    sync_status: SyncStatus
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Integration Sync Log Models
# ============================================================================


class IntegrationSyncLogCreate(BaseModel):
    """Model for creating a sync log entry"""

    integration_id: UUID
    sync_status: Literal["success", "partial_success", "failed"]
    error_message: Optional[str] = None
    items_fetched: int = 0
    tasks_generated: int = 0
    tasks_auto_approved: int = 0
    tasks_pending_review: int = 0
    api_calls_made: int = 0
    quota_remaining: Optional[int] = None
    metadata: dict = Field(default_factory=dict)


class IntegrationSyncLog(IntegrationSyncLogCreate):
    """Complete sync log model with database fields"""

    log_id: UUID
    sync_started_at: datetime
    sync_completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Request/Response Models for API
# ============================================================================


class OAuthAuthorizationRequest(BaseModel):
    """Request to start OAuth flow"""

    provider: ProviderType
    redirect_uri: Optional[str] = None
    state: Optional[str] = None


class OAuthAuthorizationResponse(BaseModel):
    """Response with OAuth authorization URL"""

    authorization_url: str
    state: str


class OAuthCallbackRequest(BaseModel):
    """OAuth callback parameters"""

    code: str
    state: str
    provider: ProviderType


class IntegrationListResponse(BaseModel):
    """Response for listing user integrations"""

    integrations: list[UserIntegration]
    total: int


class IntegrationTaskListResponse(BaseModel):
    """Response for listing integration tasks"""

    tasks: list[IntegrationTask]
    total: int
    pending_count: int
    approved_count: int
    dismissed_count: int


class TaskApprovalRequest(BaseModel):
    """Request to approve a suggested task"""

    integration_task_id: UUID
    modifications: Optional[dict] = None  # Optional edits before approval


class TaskDismissalRequest(BaseModel):
    """Request to dismiss a suggested task"""

    integration_task_id: UUID
    reason: Optional[str] = None


class ManualSyncRequest(BaseModel):
    """Request to manually trigger a sync"""

    integration_id: UUID
    force: bool = False  # Force sync even if recently synced


class ManualSyncResponse(BaseModel):
    """Response for manual sync"""

    integration_id: UUID
    sync_status: str
    items_fetched: int
    tasks_generated: int
    message: str


# ============================================================================
# Provider-Specific Models
# ============================================================================


class GmailMessage(BaseModel):
    """Gmail message for task generation"""

    message_id: str
    thread_id: str
    subject: str
    from_email: str
    from_name: Optional[str] = None
    to_email: str
    snippet: str
    body_text: Optional[str] = None
    received_at: datetime
    labels: list[str] = Field(default_factory=list)
    is_unread: bool = True


class CalendarEvent(BaseModel):
    """Calendar event for task generation"""

    event_id: str
    summary: str
    description: Optional[str] = None
    location: Optional[str] = None
    start: datetime
    end: datetime
    attendees: list[str] = Field(default_factory=list)
    organizer: Optional[str] = None
    status: str = "confirmed"


class SlackMessage(BaseModel):
    """Slack message for task generation"""

    message_ts: str
    channel_id: str
    channel_name: Optional[str] = None
    user_id: str
    user_name: Optional[str] = None
    text: str
    thread_ts: Optional[str] = None
    reactions: list[str] = Field(default_factory=list)
    posted_at: datetime


# ============================================================================
# AI Task Generation Models
# ============================================================================


class TaskGenerationRequest(BaseModel):
    """Request for AI to generate task from provider data"""

    provider: ProviderType
    provider_item_type: ProviderItemType
    provider_item_data: dict
    user_context: dict = Field(default_factory=dict)


class TaskGenerationResponse(BaseModel):
    """Response from AI task generation"""

    should_create_task: bool
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str
    suggested_title: Optional[str] = None
    suggested_description: Optional[str] = None
    suggested_priority: Optional[Literal["low", "medium", "high"]] = None
    suggested_due_date: Optional[datetime] = None
    suggested_estimated_hours: Optional[float] = None
    suggested_tags: list[str] = Field(default_factory=list)
