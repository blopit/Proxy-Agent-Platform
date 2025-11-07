"""
Google OAuth2 authentication service.

Handles authentication with Google services using OAuth2 flow.
Manages credentials, token refresh, and service building.
"""

import os
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build


class AuthenticationError(Exception):
    """Raised when authentication with Google services fails."""

    pass


class GoogleAuthService:
    """
    Service for handling Google OAuth2 authentication.

    Manages credentials, performs OAuth flow, refreshes tokens,
    and builds Google API service instances.
    """

    # Default scopes for Google services
    DEFAULT_SCOPES = [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
    ]

    def __init__(
        self,
        credentials_path: str | None = None,
        token_path: str | None = None,
        scopes: list[str] | None = None,
    ):
        """
        Initialize Google authentication service.

        Args:
            credentials_path: Path to credentials.json from Google Cloud Console
            token_path: Path to store/load OAuth token
            scopes: List of OAuth scopes to request

        Example:
            >>> auth = GoogleAuthService()
            >>> credentials = auth.get_credentials()
        """
        self.credentials_path = credentials_path or os.getenv(
            "GMAIL_CREDENTIALS_PATH", "./credentials/credentials.json"
        )
        self.token_path = token_path or os.getenv("GMAIL_TOKEN_PATH", "./credentials/token.json")
        self.scopes = scopes or self.DEFAULT_SCOPES

    def has_valid_credentials(self) -> bool:
        """
        Check if valid credentials exist.

        Returns:
            True if valid credentials exist, False otherwise

        Example:
            >>> auth = GoogleAuthService()
            >>> if not auth.has_valid_credentials():
            ...     auth.get_credentials()  # Perform OAuth flow
        """
        if not Path(self.token_path).exists():
            return False

        try:
            creds = Credentials.from_authorized_user_file(self.token_path, self.scopes)
            return creds.valid and not creds.expired
        except Exception:
            return False

    def get_credentials(self) -> Credentials:
        """
        Get valid Google credentials, performing OAuth flow if needed.

        Returns:
            Valid Google OAuth2 credentials

        Raises:
            AuthenticationError: If credentials cannot be obtained

        Example:
            >>> auth = GoogleAuthService()
            >>> credentials = auth.get_credentials()
            >>> # Use credentials to build services
        """
        creds = None

        # Load existing token if available
        if Path(self.token_path).exists():
            try:
                creds = Credentials.from_authorized_user_file(self.token_path, self.scopes)
            except Exception:
                # Token file is corrupted, will create new one
                pass

        # Refresh expired token
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                self._save_credentials(creds)
            except Exception as e:
                raise AuthenticationError(f"Failed to refresh token: {e}")

        # Perform OAuth flow for new user
        elif not creds or not creds.valid:
            if not Path(self.credentials_path).exists():
                raise AuthenticationError(
                    f"Credentials file not found at {self.credentials_path}. "
                    "Download from Google Cloud Console."
                )

            try:
                flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, self.scopes)
                creds = flow.run_local_server(port=0)
                self._save_credentials(creds)
            except Exception as e:
                raise AuthenticationError(f"OAuth flow failed: {e}")

        return creds

    def _save_credentials(self, credentials: Credentials) -> None:
        """
        Save credentials to token file.

        Args:
            credentials: Google OAuth2 credentials to save
        """
        # Ensure directory exists
        Path(self.token_path).parent.mkdir(parents=True, exist_ok=True)

        # Save credentials
        with open(self.token_path, "w") as token_file:
            token_file.write(credentials.to_json())

    def revoke_credentials(self) -> None:
        """
        Revoke credentials and delete token file.

        Example:
            >>> auth = GoogleAuthService()
            >>> auth.revoke_credentials()  # User logout
        """
        if Path(self.token_path).exists():
            Path(self.token_path).unlink()

    def build_service(self, service_name: str, version: str):
        """
        Build a Google API service.

        Args:
            service_name: Name of the Google service (e.g., 'calendar', 'gmail')
            version: API version (e.g., 'v3')

        Returns:
            Google API service instance

        Raises:
            AuthenticationError: If credentials cannot be obtained

        Example:
            >>> auth = GoogleAuthService()
            >>> calendar = auth.build_service('calendar', 'v3')
            >>> events = calendar.events().list(...).execute()
        """
        credentials = self.get_credentials()
        return build(service_name, version, credentials=credentials)
