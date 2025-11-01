"""
API routes for provider integration system.

Provides endpoints for:
- OAuth authorization flows
- Integration management
- Task suggestion approval/dismissal
- Manual sync triggers
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from src.api.auth import get_current_user
from src.core.task_models import User
from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database
from src.integrations.models import ProviderType
from src.integrations.repository import IntegrationRepository
from src.integrations.service import (
    IntegrationError,
    IntegrationService,
    OAuthFlowError,
    ProviderNotFoundError,
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/integrations", tags=["integrations"])


# ============================================================================
# Dependency Injection
# ============================================================================


def get_integration_service(
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
) -> IntegrationService:
    """
    Dependency injection for IntegrationService.

    Args:
        db: Database adapter (injected)

    Returns:
        IntegrationService instance with injected repository
    """
    repository = IntegrationRepository(db)
    return IntegrationService(repository)


# ============================================================================
# Request/Response Models
# ============================================================================


class AuthorizationResponse(BaseModel):
    """Response containing OAuth authorization URL."""

    authorization_url: str = Field(..., description="URL for user to visit")
    provider: str
    message: str = "Visit the authorization URL to connect your account"


class CallbackResponse(BaseModel):
    """Response from OAuth callback."""

    success: bool
    message: str
    integration_id: str


class IntegrationSummary(BaseModel):
    """Summary of a user integration."""

    integration_id: str
    provider: str
    status: str
    provider_username: Optional[str]
    sync_enabled: bool
    last_sync_at: Optional[str]
    connected_at: str


class ConnectionStatusResponse(BaseModel):
    """Connection health status."""

    integration_id: str
    provider: str
    status: str
    is_token_expired: bool
    token_expires_at: str
    sync_enabled: bool
    last_sync_at: Optional[str]
    last_sync_status: Optional[str]
    provider_username: Optional[str]


class SyncResponse(BaseModel):
    """Response from manual sync."""

    sync_status: str
    items_fetched: int
    tasks_generated: int
    log_id: str
    message: str


class TaskSuggestionResponse(BaseModel):
    """AI-generated task suggestion."""

    integration_task_id: str
    integration_id: str
    provider_item_type: str
    suggested_title: str
    suggested_description: Optional[str]
    suggested_priority: Optional[str]
    suggested_tags: list[str]
    suggested_deadline: Optional[str]
    ai_confidence: Optional[float]
    ai_reasoning: Optional[str]
    provider_item_snapshot: dict
    created_at: str


class ApproveTaskRequest(BaseModel):
    """Request to approve task suggestion."""

    task_id: str = Field(..., description="Main task ID to link to")


class ApproveTaskResponse(BaseModel):
    """Response from approving task."""

    integration_task_id: str
    task_id: str
    sync_status: str
    message: str


class DismissTaskResponse(BaseModel):
    """Response from dismissing task."""

    integration_task_id: str
    sync_status: str
    message: str


# ============================================================================
# OAuth Flow Endpoints
# ============================================================================


@router.post("/{provider}/authorize", response_model=AuthorizationResponse)
async def authorize_provider(
    provider: ProviderType,
    current_user: User = Depends(get_current_user),
    service: IntegrationService = Depends(get_integration_service),
):
    """
    Start OAuth authorization flow for a provider.

    This endpoint generates the OAuth authorization URL that the user
    needs to visit to grant permissions to the application.

    Args:
        provider: Provider type (gmail, google_calendar, etc.)
        current_user: Current authenticated user
        service: Integration service (injected)

    Returns:
        Authorization URL and instructions

    Raises:
        404: Provider not configured
        500: OAuth flow initialization failed
    """
    try:
        auth_url = service.initiate_oauth(provider, current_user.user_id)

        return AuthorizationResponse(
            authorization_url=auth_url,
            provider=provider,
        )

    except ProviderNotFoundError as e:
        logger.warning(f"Provider not found: {e}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"OAuth initiation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate OAuth: {str(e)}",
        )


@router.get("/{provider}/callback")
async def oauth_callback(
    provider: ProviderType,
    code: str = Query(..., description="Authorization code from OAuth provider"),
    state: str = Query(..., description="CSRF state parameter"),
    service: IntegrationService = Depends(get_integration_service),
):
    """
    Handle OAuth callback from provider.

    This endpoint is called by the OAuth provider after the user grants
    permissions. It exchanges the authorization code for access tokens
    and creates/updates the integration.

    Args:
        provider: Provider type
        code: Authorization code
        state: CSRF state parameter
        service: Integration service (injected)

    Returns:
        Redirect to frontend with integration_id

    Raises:
        400: Invalid OAuth state or code
        404: Provider not configured
        500: OAuth exchange failed
    """
    try:
        integration = await service.handle_callback(provider, code, state)

        # Redirect to frontend with success message
        # TODO: Configure frontend redirect URL from environment
        frontend_url = "http://localhost:3000"
        return RedirectResponse(
            url=f"{frontend_url}/integrations?success=true&integration_id={integration['integration_id']}&provider={provider}"
        )

    except OAuthFlowError as e:
        logger.warning(f"OAuth callback failed: {e}")
        # Redirect to frontend with error
        frontend_url = "http://localhost:3000"
        return RedirectResponse(
            url=f"{frontend_url}/integrations?success=false&error={str(e)}"
        )
    except ProviderNotFoundError as e:
        logger.error(f"Provider not found in callback: {e}")
        frontend_url = "http://localhost:3000"
        return RedirectResponse(
            url=f"{frontend_url}/integrations?success=false&error=Provider+not+configured"
        )
    except Exception as e:
        logger.error(f"OAuth callback exception: {e}", exc_info=True)
        frontend_url = "http://localhost:3000"
        return RedirectResponse(
            url=f"{frontend_url}/integrations?success=false&error=OAuth+failed"
        )


# ============================================================================
# Integration Management Endpoints
# ============================================================================


@router.get("/", response_model=list[IntegrationSummary])
async def list_integrations(
    provider: Optional[ProviderType] = Query(None, description="Filter by provider"),
    current_user: User = Depends(get_current_user),
    service: IntegrationService = Depends(get_integration_service),
):
    """
    List all integrations for the current user.

    Args:
        provider: Optional provider filter
        current_user: Current authenticated user
        service: Integration service (injected)

    Returns:
        List of user's integrations
    """
    try:
        integrations = service.get_user_integrations(current_user.user_id, provider=provider)

        return [
            IntegrationSummary(
                integration_id=i["integration_id"],
                provider=i["provider"],
                status=i["status"],
                provider_username=i["provider_username"],
                sync_enabled=i["sync_enabled"],
                last_sync_at=i["last_sync_at"],
                connected_at=i["connected_at"],
            )
            for i in integrations
        ]

    except Exception as e:
        logger.error(f"Failed to list integrations: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve integrations",
        )


@router.post("/{integration_id}/disconnect")
async def disconnect_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    service: IntegrationService = Depends(get_integration_service),
):
    """
    Disconnect a provider integration.

    This will delete the integration and all associated data
    (task suggestions, sync logs, etc.).

    Args:
        integration_id: Integration ID to disconnect
        current_user: Current authenticated user
        service: Integration service (injected)

    Returns:
        Success message

    Raises:
        403: Not authorized to disconnect this integration
        404: Integration not found
    """
    try:
        disconnected = await service.disconnect_provider(integration_id, current_user.user_id)

        if not disconnected:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Integration not found",
            )

        return {
            "success": True,
            "message": "Integration disconnected successfully",
            "integration_id": integration_id,
        }

    except IntegrationError as e:
        if "Not authorized" in str(e):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to disconnect integration: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to disconnect integration",
        )


@router.get("/{integration_id}/status", response_model=ConnectionStatusResponse)
async def get_integration_status(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    service: IntegrationService = Depends(get_integration_service),
):
    """
    Get connection health status for an integration.

    Args:
        integration_id: Integration ID
        current_user: Current authenticated user
        service: Integration service (injected)

    Returns:
        Connection status details

    Raises:
        403: Not authorized
        404: Integration not found
    """
    try:
        status_data = service.get_connection_status(integration_id, current_user.user_id)

        return ConnectionStatusResponse(**status_data)

    except IntegrationError as e:
        if "Not authorized" in str(e):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        if "not found" in str(e):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get integration status: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve status",
        )


@router.post("/{integration_id}/sync", response_model=SyncResponse)
async def trigger_sync(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    service: IntegrationService = Depends(get_integration_service),
):
    """
    Trigger manual sync for an integration.

    This will fetch data from the provider and generate task suggestions
    if auto-generation is enabled.

    Args:
        integration_id: Integration ID
        current_user: Current authenticated user
        service: Integration service (injected)

    Returns:
        Sync results

    Raises:
        403: Not authorized
        404: Integration not found
        500: Sync failed
    """
    try:
        sync_log = await service.trigger_manual_sync(integration_id, current_user.user_id)

        return SyncResponse(
            sync_status=sync_log["sync_status"],
            items_fetched=sync_log["items_fetched"],
            tasks_generated=sync_log["tasks_generated"],
            log_id=sync_log["log_id"],
            message="Sync completed successfully"
            if sync_log["sync_status"] == "success"
            else "Sync failed",
        )

    except IntegrationError as e:
        if "Not authorized" in str(e):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        if "not found" in str(e):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        logger.error(f"Sync failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sync failed",
        )


# ============================================================================
# Task Suggestion Endpoints
# ============================================================================


@router.get("/suggested-tasks", response_model=list[TaskSuggestionResponse])
async def get_suggested_tasks(
    provider: Optional[ProviderType] = Query(None, description="Filter by provider"),
    limit: int = Query(50, ge=1, le=100, description="Max results"),
    current_user: User = Depends(get_current_user),
    service: IntegrationService = Depends(get_integration_service),
):
    """
    Get pending task suggestions for the current user.

    Returns AI-generated task suggestions from connected providers
    that are awaiting user approval or dismissal.

    Args:
        provider: Optional provider filter
        limit: Max results to return
        current_user: Current authenticated user
        service: Integration service (injected)

    Returns:
        List of pending task suggestions
    """
    try:
        suggestions = service.get_suggested_tasks(
            current_user.user_id, provider=provider, limit=limit
        )

        return [
            TaskSuggestionResponse(
                integration_task_id=s["integration_task_id"],
                integration_id=s["integration_id"],
                provider_item_type=s["provider_item_type"],
                suggested_title=s["suggested_title"],
                suggested_description=s["suggested_description"],
                suggested_priority=s["suggested_priority"],
                suggested_tags=s["suggested_tags"],
                suggested_deadline=s["suggested_deadline"],
                ai_confidence=s["ai_confidence"],
                ai_reasoning=s["ai_reasoning"],
                provider_item_snapshot=s["provider_item_snapshot"],
                created_at=s["created_at"],
            )
            for s in suggestions
        ]

    except Exception as e:
        logger.error(f"Failed to get suggested tasks: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve task suggestions",
        )


@router.post("/tasks/{integration_task_id}/approve", response_model=ApproveTaskResponse)
async def approve_task_suggestion(
    integration_task_id: str,
    request: ApproveTaskRequest,
    current_user: User = Depends(get_current_user),
    service: IntegrationService = Depends(get_integration_service),
):
    """
    Approve a task suggestion and link it to a main task.

    Args:
        integration_task_id: Integration task ID
        request: Approval request with task ID
        current_user: Current authenticated user
        service: Integration service (injected)

    Returns:
        Approval confirmation

    Raises:
        403: Not authorized
        404: Task suggestion not found
    """
    try:
        updated_task = service.approve_suggestion(
            integration_task_id, current_user.user_id, request.task_id
        )

        return ApproveTaskResponse(
            integration_task_id=updated_task["integration_task_id"],
            task_id=updated_task["task_id"],
            sync_status=updated_task["sync_status"],
            message="Task suggestion approved successfully",
        )

    except IntegrationError as e:
        if "Not authorized" in str(e):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        if "not found" in str(e):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to approve task: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve task suggestion",
        )


@router.post("/tasks/{integration_task_id}/dismiss", response_model=DismissTaskResponse)
async def dismiss_task_suggestion(
    integration_task_id: str,
    current_user: User = Depends(get_current_user),
    service: IntegrationService = Depends(get_integration_service),
):
    """
    Dismiss a task suggestion.

    Args:
        integration_task_id: Integration task ID
        current_user: Current authenticated user
        service: Integration service (injected)

    Returns:
        Dismissal confirmation

    Raises:
        403: Not authorized
        404: Task suggestion not found
    """
    try:
        updated_task = service.dismiss_suggestion(integration_task_id, current_user.user_id)

        return DismissTaskResponse(
            integration_task_id=updated_task["integration_task_id"],
            sync_status=updated_task["sync_status"],
            message="Task suggestion dismissed successfully",
        )

    except IntegrationError as e:
        if "Not authorized" in str(e):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        if "not found" in str(e):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to dismiss task: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to dismiss task suggestion",
        )


# ============================================================================
# Health Check
# ============================================================================


@router.get("/health")
async def health_check():
    """Health check endpoint for integration system."""
    return {
        "status": "healthy",
        "service": "provider_integrations",
        "version": "1.0.0",
    }
