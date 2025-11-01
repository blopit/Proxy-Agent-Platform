"""
Service layer for provider integration business logic.

Orchestrates OAuth flows, token management, and provider interactions.
"""

import logging
import secrets
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from src.integrations.models import ProviderType, UserIntegration
from src.integrations.oauth_provider import get_provider
from src.integrations.repository import IntegrationRepository

logger = logging.getLogger(__name__)


class IntegrationError(Exception):
    """Base exception for integration errors."""

    pass


class ProviderNotFoundError(IntegrationError):
    """Provider not found or not configured."""

    pass


class OAuthFlowError(IntegrationError):
    """OAuth flow failed."""

    pass


class IntegrationService:
    """Service for managing provider integrations."""

    def __init__(self, repository: IntegrationRepository):
        """
        Initialize integration service.

        Args:
            repository: Integration repository instance
        """
        self.repo = repository
        self._oauth_states: dict[str, dict] = {}  # In-memory state storage for OAuth

    # ========================================================================
    # OAuth Flow
    # ========================================================================

    def initiate_oauth(
        self, provider: ProviderType, user_id: str, redirect_uri: Optional[str] = None
    ) -> str:
        """
        Generate OAuth authorization URL to start the flow.

        Args:
            provider: Provider type
            user_id: User ID initiating the flow
            redirect_uri: Optional custom redirect URI

        Returns:
            Authorization URL for user to visit

        Raises:
            ProviderNotFoundError: If provider not configured
        """
        # Get provider instance
        provider_instance = get_provider(provider, redirect_uri=redirect_uri)
        if not provider_instance:
            raise ProviderNotFoundError(
                f"Provider {provider} not configured. Check environment variables."
            )

        # Generate CSRF state token
        state = secrets.token_urlsafe(32)

        # Store state with user_id for validation in callback
        self._oauth_states[state] = {
            "user_id": user_id,
            "provider": provider,
            "created_at": datetime.now(timezone.utc),
        }

        # Get authorization URL
        auth_url = provider_instance.get_authorization_url(state)

        logger.info(f"Generated OAuth URL for {provider} (user: {user_id})")
        return auth_url

    async def handle_callback(
        self, provider: ProviderType, code: str, state: str
    ) -> dict:
        """
        Handle OAuth callback and create integration.

        Args:
            provider: Provider type
            code: Authorization code from OAuth callback
            state: CSRF state parameter

        Returns:
            Created integration data

        Raises:
            OAuthFlowError: If OAuth flow fails
            ProviderNotFoundError: If provider not configured
        """
        # Validate state
        state_data = self._oauth_states.get(state)
        if not state_data:
            raise OAuthFlowError("Invalid or expired OAuth state")

        if state_data["provider"] != provider:
            raise OAuthFlowError("Provider mismatch in OAuth callback")

        user_id = state_data["user_id"]

        # Clean up state
        del self._oauth_states[state]

        # Get provider instance
        provider_instance = get_provider(provider)
        if not provider_instance:
            raise ProviderNotFoundError(f"Provider {provider} not configured")

        try:
            # Exchange code for tokens
            (
                access_token,
                refresh_token,
                expires_at,
                granted_scopes,
            ) = await provider_instance.exchange_code_for_tokens(code)

            # Get user info from provider
            provider_user_id, provider_username = (
                await provider_instance.get_provider_user_info(access_token)
            )

            # Encrypt tokens
            encrypted_access, encrypted_refresh = provider_instance.encrypt_tokens(
                access_token, refresh_token
            )

            # Check if integration already exists
            existing = self.repo.get_user_integrations(user_id, provider=provider)
            if existing and len(existing) > 0:
                # Update existing integration
                integration = self.repo.update_integration(
                    integration_id=existing[0]["integration_id"],
                    access_token=encrypted_access,
                    refresh_token=encrypted_refresh,
                    token_expires_at=expires_at,
                    status="connected",
                )
                logger.info(f"Updated existing {provider} integration for user {user_id}")
            else:
                # Create new integration
                integration = self.repo.create_integration(
                    user_id=user_id,
                    provider=provider,
                    access_token=encrypted_access,
                    refresh_token=encrypted_refresh,
                    token_expires_at=expires_at,
                    scopes=granted_scopes,
                    provider_user_id=provider_user_id,
                    provider_username=provider_username,
                )
                logger.info(f"Created new {provider} integration for user {user_id}")

            return integration

        except Exception as e:
            logger.error(f"OAuth callback failed for {provider}: {e}", exc_info=True)
            raise OAuthFlowError(f"Failed to complete OAuth flow: {str(e)}")

    # ========================================================================
    # Integration Management
    # ========================================================================

    def get_user_integrations(
        self, user_id: str, provider: Optional[ProviderType] = None
    ) -> list[dict]:
        """
        Get all integrations for a user.

        Args:
            user_id: User ID
            provider: Optional provider filter

        Returns:
            List of integration data (tokens NOT decrypted)
        """
        integrations = self.repo.get_user_integrations(user_id, provider=provider)

        # Remove encrypted tokens from response for security
        for integration in integrations:
            integration.pop("access_token", None)
            integration.pop("refresh_token", None)

        return integrations

    def get_integration(self, integration_id: str, user_id: str) -> Optional[dict]:
        """
        Get integration by ID.

        Args:
            integration_id: Integration ID
            user_id: User ID (for authorization check)

        Returns:
            Integration data or None if not found or unauthorized
        """
        integration = self.repo.get_integration(integration_id)

        if not integration:
            return None

        # Authorization check
        if integration["user_id"] != user_id:
            logger.warning(
                f"User {user_id} attempted to access integration {integration_id} "
                f"owned by {integration['user_id']}"
            )
            return None

        # Remove encrypted tokens from response
        integration.pop("access_token", None)
        integration.pop("refresh_token", None)

        return integration

    async def disconnect_provider(
        self, integration_id: str, user_id: str
    ) -> bool:
        """
        Disconnect provider integration.

        Args:
            integration_id: Integration ID
            user_id: User ID (for authorization check)

        Returns:
            True if disconnected, False if not found

        Raises:
            IntegrationError: If authorization fails
        """
        integration = self.repo.get_integration(integration_id)

        if not integration:
            return False

        # Authorization check
        if integration["user_id"] != user_id:
            raise IntegrationError("Not authorized to disconnect this integration")

        # TODO: Optionally revoke tokens with provider
        # This requires provider-specific token revocation endpoints

        # Delete integration and all associated data
        deleted = self.repo.delete_integration(integration_id)

        if deleted:
            logger.info(
                f"Disconnected {integration['provider']} integration {integration_id}"
            )

        return deleted

    def get_connection_status(self, integration_id: str, user_id: str) -> dict:
        """
        Get connection health status.

        Args:
            integration_id: Integration ID
            user_id: User ID (for authorization check)

        Returns:
            Connection status details

        Raises:
            IntegrationError: If integration not found or unauthorized
        """
        integration = self.repo.get_integration(integration_id)

        if not integration:
            raise IntegrationError("Integration not found")

        if integration["user_id"] != user_id:
            raise IntegrationError("Not authorized to view this integration")

        # Get recent sync logs
        sync_logs = self.repo.get_sync_logs(integration_id, limit=1)
        last_sync = sync_logs[0] if sync_logs else None

        # Check token expiration
        token_expires_at = datetime.fromisoformat(integration["token_expires_at"])
        is_token_expired = datetime.now(timezone.utc) >= token_expires_at

        return {
            "integration_id": integration_id,
            "provider": integration["provider"],
            "status": integration["status"],
            "is_token_expired": is_token_expired,
            "token_expires_at": integration["token_expires_at"],
            "sync_enabled": integration["sync_enabled"],
            "last_sync_at": integration["last_sync_at"],
            "last_sync_status": last_sync["sync_status"] if last_sync else None,
            "provider_username": integration["provider_username"],
        }

    async def trigger_manual_sync(
        self, integration_id: str, user_id: str
    ) -> dict:
        """
        Trigger manual sync for integration.

        Args:
            integration_id: Integration ID
            user_id: User ID (for authorization check)

        Returns:
            Sync log data

        Raises:
            IntegrationError: If integration not found or unauthorized
        """
        integration = self.repo.get_integration(integration_id)

        if not integration:
            raise IntegrationError("Integration not found")

        if integration["user_id"] != user_id:
            raise IntegrationError("Not authorized to sync this integration")

        # Get provider instance
        provider_instance = get_provider(integration["provider"])
        if not provider_instance:
            raise ProviderNotFoundError(
                f"Provider {integration['provider']} not configured"
            )

        try:
            # Create UserIntegration model for provider
            user_integration = UserIntegration(
                integration_id=UUID(integration["integration_id"]),
                user_id=integration["user_id"],
                provider=integration["provider"],
                status=integration["status"],
                access_token=integration["access_token"],
                refresh_token=integration["refresh_token"],
                token_expires_at=datetime.fromisoformat(integration["token_expires_at"]),
                scopes=integration["scopes"],
                provider_user_id=integration["provider_user_id"],
                provider_username=integration["provider_username"],
                sync_enabled=integration["sync_enabled"],
                auto_generate_tasks=integration["auto_generate_tasks"],
                last_sync_at=integration["last_sync_at"],
                settings=integration["settings"],
                metadata=integration["metadata"],
                connected_at=datetime.fromisoformat(integration["connected_at"]),
                created_at=datetime.fromisoformat(integration["created_at"]),
                updated_at=datetime.fromisoformat(integration["updated_at"]),
            )

            # Fetch data from provider
            items = await provider_instance.fetch_data(user_integration)

            # Update last sync time
            self.repo.update_integration(
                integration_id=integration_id,
                last_sync_at=datetime.now(timezone.utc),
            )

            # Create sync log
            sync_log = self.repo.create_sync_log(
                integration_id=integration_id,
                sync_status="success",
                items_fetched=len(items),
                tasks_generated=0,  # Will be updated when AI task generation is implemented
                api_calls_made=1,
            )

            logger.info(
                f"Manual sync completed for {integration['provider']} "
                f"integration {integration_id}: {len(items)} items fetched"
            )

            return sync_log

        except Exception as e:
            logger.error(f"Manual sync failed: {e}", exc_info=True)

            # Create failed sync log
            sync_log = self.repo.create_sync_log(
                integration_id=integration_id,
                sync_status="failed",
                error_message=str(e),
            )

            raise IntegrationError(f"Sync failed: {str(e)}")

    # ========================================================================
    # Task Suggestions
    # ========================================================================

    def get_suggested_tasks(
        self, user_id: str, provider: Optional[ProviderType] = None, limit: int = 50
    ) -> list[dict]:
        """
        Get pending task suggestions for user.

        Args:
            user_id: User ID
            provider: Optional provider filter
            limit: Max results

        Returns:
            List of pending integration task data
        """
        return self.repo.get_pending_tasks(user_id, provider=provider, limit=limit)

    def approve_suggestion(
        self, integration_task_id: str, user_id: str, task_id: str
    ) -> dict:
        """
        Approve task suggestion and link to main task.

        Args:
            integration_task_id: Integration task ID
            user_id: User ID (for authorization check)
            task_id: Main task ID to link

        Returns:
            Updated integration task data

        Raises:
            IntegrationError: If task not found or unauthorized
        """
        task = self.repo.get_integration_task(integration_task_id)

        if not task:
            raise IntegrationError("Task suggestion not found")

        # Get integration to check ownership
        integration = self.repo.get_integration(task["integration_id"])
        if not integration or integration["user_id"] != user_id:
            raise IntegrationError("Not authorized to approve this task")

        # Approve task
        updated_task = self.repo.approve_task(integration_task_id, task_id)

        logger.info(
            f"Approved task suggestion {integration_task_id}, linked to task {task_id}"
        )

        return updated_task

    def dismiss_suggestion(
        self, integration_task_id: str, user_id: str
    ) -> dict:
        """
        Dismiss task suggestion.

        Args:
            integration_task_id: Integration task ID
            user_id: User ID (for authorization check)

        Returns:
            Updated integration task data

        Raises:
            IntegrationError: If task not found or unauthorized
        """
        task = self.repo.get_integration_task(integration_task_id)

        if not task:
            raise IntegrationError("Task suggestion not found")

        # Get integration to check ownership
        integration = self.repo.get_integration(task["integration_id"])
        if not integration or integration["user_id"] != user_id:
            raise IntegrationError("Not authorized to dismiss this task")

        # Dismiss task
        updated_task = self.repo.dismiss_task(integration_task_id)

        logger.info(f"Dismissed task suggestion {integration_task_id}")

        return updated_task

    # ========================================================================
    # Cleanup
    # ========================================================================

    def cleanup_expired_states(self, max_age_hours: int = 1) -> int:
        """
        Remove expired OAuth states.

        Args:
            max_age_hours: Maximum age in hours before state is expired

        Returns:
            Number of states removed
        """
        from datetime import timedelta

        now = datetime.now(timezone.utc)
        expired_states = []

        for state, data in self._oauth_states.items():
            created_at = data["created_at"]
            if now - created_at > timedelta(hours=max_age_hours):
                expired_states.append(state)

        for state in expired_states:
            del self._oauth_states[state]

        if expired_states:
            logger.info(f"Cleaned up {len(expired_states)} expired OAuth states")

        return len(expired_states)
