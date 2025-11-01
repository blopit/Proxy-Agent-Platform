"""
Base OAuth 2.0 provider infrastructure

This module provides the abstract base class for OAuth providers
and utilities for token management and encryption.
"""

import logging
import os
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Optional

from cryptography.fernet import Fernet

from src.integrations.models import (
    CalendarEvent,
    GmailMessage,
    ProviderType,
    SlackMessage,
    UserIntegration,
)

logger = logging.getLogger(__name__)


# ============================================================================
# Token Encryption/Decryption
# ============================================================================


class TokenEncryption:
    """Handles encryption and decryption of OAuth tokens"""

    def __init__(self, encryption_key: Optional[str] = None):
        """
        Initialize token encryption.

        Args:
            encryption_key: Base64-encoded Fernet key (from env if not provided)
        """
        key = encryption_key or os.getenv("INTEGRATION_ENCRYPTION_KEY")
        if not key:
            # Generate a key for development (should be set in production!)
            logger.warning(
                "No INTEGRATION_ENCRYPTION_KEY found, generating temporary key. "
                "Set INTEGRATION_ENCRYPTION_KEY in production!"
            )
            key = Fernet.generate_key().decode()

        self.fernet = Fernet(key.encode() if isinstance(key, str) else key)

    def encrypt_token(self, token: str) -> str:
        """Encrypt an OAuth token"""
        if not token:
            return ""
        return self.fernet.encrypt(token.encode()).decode()

    def decrypt_token(self, encrypted_token: str) -> str:
        """Decrypt an OAuth token"""
        if not encrypted_token:
            return ""
        return self.fernet.decrypt(encrypted_token.encode()).decode()


# Singleton instance
_token_encryption: Optional[TokenEncryption] = None


def get_token_encryption() -> TokenEncryption:
    """Get or create the token encryption singleton"""
    global _token_encryption
    if _token_encryption is None:
        _token_encryption = TokenEncryption()
    return _token_encryption


# ============================================================================
# Base OAuth Provider
# ============================================================================


class OAuthProvider(ABC):
    """
    Abstract base class for OAuth 2.0 providers.

    Subclasses must implement:
    - get_authorization_url()
    - exchange_code_for_tokens()
    - refresh_access_token()
    - get_provider_user_info()
    - fetch_data() (provider-specific data fetching)
    """

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        redirect_uri: str,
        scopes: list[str],
    ):
        """
        Initialize OAuth provider.

        Args:
            client_id: OAuth client ID
            client_secret: OAuth client secret
            redirect_uri: OAuth callback URL
            scopes: List of OAuth scopes to request
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.scopes = scopes
        self.token_encryption = get_token_encryption()

    @property
    @abstractmethod
    def provider_type(self) -> ProviderType:
        """Return the provider type identifier"""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the human-readable provider name"""
        pass

    @abstractmethod
    def get_authorization_url(self, state: str) -> str:
        """
        Generate OAuth authorization URL.

        Args:
            state: CSRF protection state parameter

        Returns:
            Authorization URL for user to visit
        """
        pass

    @abstractmethod
    async def exchange_code_for_tokens(
        self, code: str
    ) -> tuple[str, str, datetime, list[str]]:
        """
        Exchange authorization code for access/refresh tokens.

        Args:
            code: Authorization code from OAuth callback

        Returns:
            Tuple of (access_token, refresh_token, expires_at, granted_scopes)
        """
        pass

    @abstractmethod
    async def refresh_access_token(self, refresh_token: str) -> tuple[str, datetime]:
        """
        Refresh an expired access token.

        Args:
            refresh_token: Current refresh token

        Returns:
            Tuple of (new_access_token, new_expires_at)
        """
        pass

    @abstractmethod
    async def get_provider_user_info(self, access_token: str) -> tuple[str, str]:
        """
        Get user info from provider.

        Args:
            access_token: Valid access token

        Returns:
            Tuple of (provider_user_id, provider_username)
        """
        pass

    @abstractmethod
    async def fetch_data(
        self, integration: UserIntegration
    ) -> list[GmailMessage | CalendarEvent | SlackMessage]:
        """
        Fetch data from provider for task generation.

        Args:
            integration: User integration with decrypted tokens

        Returns:
            List of provider items (emails, events, messages, etc.)
        """
        pass

    @abstractmethod
    async def mark_item_processed(
        self, integration: UserIntegration, item_id: str, action: str
    ) -> bool:
        """
        Mark provider item as processed (e.g., mark email as read).

        Args:
            integration: User integration with decrypted tokens
            item_id: Provider item ID
            action: Action to perform ('mark_read', 'archive', 'complete', etc.)

        Returns:
            True if successful
        """
        pass

    # ========================================================================
    # Helper Methods (implemented in base class)
    # ========================================================================

    def encrypt_tokens(
        self, access_token: str, refresh_token: str
    ) -> tuple[str, str]:
        """Encrypt access and refresh tokens"""
        return (
            self.token_encryption.encrypt_token(access_token),
            self.token_encryption.encrypt_token(refresh_token),
        )

    def decrypt_tokens(
        self, encrypted_access: str, encrypted_refresh: str
    ) -> tuple[str, str]:
        """Decrypt access and refresh tokens"""
        return (
            self.token_encryption.decrypt_token(encrypted_access),
            self.token_encryption.decrypt_token(encrypted_refresh),
        )

    def is_token_expired(self, expires_at: datetime) -> bool:
        """Check if token is expired (with 5-minute buffer)"""
        if not expires_at:
            return True
        buffer = timedelta(minutes=5)
        return datetime.now(timezone.utc) >= (expires_at - buffer)

    async def ensure_valid_token(self, integration: UserIntegration) -> str:
        """
        Ensure integration has a valid access token, refreshing if needed.

        Args:
            integration: User integration (tokens will be decrypted)

        Returns:
            Valid access token

        Raises:
            Exception: If token refresh fails
        """
        # Decrypt tokens
        access_token, refresh_token = self.decrypt_tokens(
            integration.access_token or "", integration.refresh_token or ""
        )

        # Check if token is expired
        if self.is_token_expired(integration.token_expires_at):
            logger.info(
                f"Access token expired for integration {integration.integration_id}, refreshing"
            )

            # Refresh the token
            new_access_token, new_expires_at = await self.refresh_access_token(
                refresh_token
            )

            # Encrypt the new token
            encrypted_access, _ = self.encrypt_tokens(new_access_token, refresh_token)

            # Update integration (caller should save to database)
            integration.access_token = encrypted_access
            integration.token_expires_at = new_expires_at

            return new_access_token

        return access_token

    def get_scope_string(self) -> str:
        """Get space-separated scope string"""
        return " ".join(self.scopes)


# ============================================================================
# Provider Registry
# ============================================================================


class ProviderRegistry:
    """Registry of available OAuth providers"""

    def __init__(self):
        self._providers: dict[ProviderType, type[OAuthProvider]] = {}

    def register(self, provider_class: type[OAuthProvider]) -> None:
        """Register a provider class"""
        # Get provider_type from a temporary instance
        temp_instance = provider_class(
            client_id="", client_secret="", redirect_uri="", scopes=[]
        )
        self._providers[temp_instance.provider_type] = provider_class
        logger.info(f"Registered OAuth provider: {temp_instance.provider_name}")

    def get_provider_class(
        self, provider_type: ProviderType
    ) -> Optional[type[OAuthProvider]]:
        """Get provider class by type"""
        return self._providers.get(provider_type)

    def create_provider(
        self,
        provider_type: ProviderType,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        redirect_uri: Optional[str] = None,
        scopes: Optional[list[str]] = None,
    ) -> Optional[OAuthProvider]:
        """
        Create provider instance with credentials from environment.

        Args:
            provider_type: Type of provider to create
            client_id: OAuth client ID (from env if not provided)
            client_secret: OAuth client secret (from env if not provided)
            redirect_uri: OAuth redirect URI (from env if not provided)
            scopes: OAuth scopes (provider defaults if not provided)

        Returns:
            Provider instance or None if not registered
        """
        provider_class = self.get_provider_class(provider_type)
        if not provider_class:
            return None

        # Get credentials from environment if not provided
        provider_env_prefix = provider_type.upper()
        client_id = client_id or os.getenv(f"{provider_env_prefix}_CLIENT_ID")
        client_secret = client_secret or os.getenv(
            f"{provider_env_prefix}_CLIENT_SECRET"
        )
        redirect_uri = redirect_uri or os.getenv(
            f"{provider_env_prefix}_REDIRECT_URI",
            f"http://localhost:8000/api/v1/integrations/{provider_type}/callback",
        )

        if not client_id or not client_secret:
            logger.error(
                f"Missing OAuth credentials for {provider_type}. "
                f"Set {provider_env_prefix}_CLIENT_ID and {provider_env_prefix}_CLIENT_SECRET"
            )
            return None

        # Use provider defaults for scopes if not provided
        temp_instance = provider_class(
            client_id="", client_secret="", redirect_uri="", scopes=[]
        )
        scopes = scopes or temp_instance.scopes

        return provider_class(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            scopes=scopes,
        )

    def list_providers(self) -> list[ProviderType]:
        """List all registered provider types"""
        return list(self._providers.keys())


# Global provider registry
provider_registry = ProviderRegistry()


def register_provider(provider_class: type[OAuthProvider]) -> None:
    """Register a provider class with the global registry"""
    provider_registry.register(provider_class)


def get_provider(
    provider_type: ProviderType,
    client_id: Optional[str] = None,
    client_secret: Optional[str] = None,
    redirect_uri: Optional[str] = None,
    scopes: Optional[list[str]] = None,
) -> Optional[OAuthProvider]:
    """Get a provider instance from the global registry"""
    return provider_registry.create_provider(
        provider_type, client_id, client_secret, redirect_uri, scopes
    )
