"""
Provider integrations module

This module handles OAuth 2.0 provider connections, data synchronization,
and AI-powered task generation from external services.
"""

from src.integrations.models import (
    CalendarEvent,
    ConnectionStatus,
    GmailMessage,
    IntegrationTask,
    IntegrationTaskCreate,
    IntegrationTaskListResponse,
    IntegrationTaskUpdate,
    ManualSyncRequest,
    ManualSyncResponse,
    OAuthAuthorizationRequest,
    OAuthAuthorizationResponse,
    OAuthCallbackRequest,
    ProviderItemType,
    ProviderType,
    SlackMessage,
    SyncStatus,
    TaskApprovalRequest,
    TaskDismissalRequest,
    TaskGenerationRequest,
    TaskGenerationResponse,
    UserIntegration,
    UserIntegrationCreate,
    UserIntegrationUpdate,
)
from src.integrations.oauth_provider import (
    OAuthProvider,
    ProviderRegistry,
    get_provider,
    provider_registry,
    register_provider,
)
from src.integrations.repository import IntegrationRepository
from src.integrations.service import IntegrationService

__all__ = [
    # Enums
    "ProviderType",
    "ConnectionStatus",
    "SyncStatus",
    "ProviderItemType",
    # User Integration Models
    "UserIntegration",
    "UserIntegrationCreate",
    "UserIntegrationUpdate",
    # Integration Task Models
    "IntegrationTask",
    "IntegrationTaskCreate",
    "IntegrationTaskUpdate",
    "IntegrationTaskListResponse",
    # Request/Response Models
    "OAuthAuthorizationRequest",
    "OAuthAuthorizationResponse",
    "OAuthCallbackRequest",
    "TaskApprovalRequest",
    "TaskDismissalRequest",
    "ManualSyncRequest",
    "ManualSyncResponse",
    # Provider-Specific Models
    "GmailMessage",
    "CalendarEvent",
    "SlackMessage",
    # AI Models
    "TaskGenerationRequest",
    "TaskGenerationResponse",
    # OAuth Infrastructure
    "OAuthProvider",
    "ProviderRegistry",
    "get_provider",
    "provider_registry",
    "register_provider",
    # Repository & Service
    "IntegrationRepository",
    "IntegrationService",
]
