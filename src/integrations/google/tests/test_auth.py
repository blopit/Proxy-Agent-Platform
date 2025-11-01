"""
Tests for Google OAuth2 authentication service.

Following TDD methodology: RED → GREEN → REFACTOR
"""

import pytest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from src.integrations.google.auth import GoogleAuthService, AuthenticationError


class TestGoogleAuthService:
    """Test suite for GoogleAuthService."""

    @pytest.fixture
    def auth_service(self, tmp_path):
        """Provide a GoogleAuthService instance with temporary paths."""
        credentials_path = tmp_path / "credentials.json"
        token_path = tmp_path / "token.json"
        return GoogleAuthService(
            credentials_path=str(credentials_path),
            token_path=str(token_path),
            scopes=["https://www.googleapis.com/auth/calendar.readonly"],
        )

    def test_initialization_with_default_paths(self):
        """Test that service initializes with default credential paths."""
        service = GoogleAuthService()
        assert service.credentials_path is not None
        assert service.token_path is not None
        assert len(service.scopes) > 0

    def test_initialization_with_custom_paths(self, tmp_path):
        """Test that service accepts custom credential paths."""
        creds_path = str(tmp_path / "custom_creds.json")
        token_path = str(tmp_path / "custom_token.json")
        service = GoogleAuthService(
            credentials_path=creds_path, token_path=token_path
        )
        assert service.credentials_path == creds_path
        assert service.token_path == token_path

    def test_has_valid_credentials_returns_false_without_token(self, auth_service):
        """Test that has_valid_credentials returns False when no token exists."""
        assert auth_service.has_valid_credentials() is False

    @patch("src.integrations.google.auth.Credentials")
    def test_has_valid_credentials_returns_true_with_valid_token(
        self, mock_creds_class, auth_service, tmp_path
    ):
        """Test that has_valid_credentials returns True with valid token."""
        # Create a mock token file
        token_file = tmp_path / "token.json"
        token_file.write_text('{"token": "valid"}')

        # Mock credentials
        mock_creds = Mock()
        mock_creds.valid = True
        mock_creds.expired = False
        mock_creds_class.from_authorized_user_file.return_value = mock_creds

        # Update service to use this token path
        auth_service.token_path = str(token_file)

        assert auth_service.has_valid_credentials() is True

    @patch("src.integrations.google.auth.Credentials")
    def test_has_valid_credentials_returns_false_with_expired_token(
        self, mock_creds_class, auth_service, tmp_path
    ):
        """Test that has_valid_credentials returns False with expired token."""
        token_file = tmp_path / "token.json"
        token_file.write_text('{"token": "expired"}')

        mock_creds = Mock()
        mock_creds.valid = False
        mock_creds.expired = True
        mock_creds_class.from_authorized_user_file.return_value = mock_creds

        auth_service.token_path = str(token_file)

        assert auth_service.has_valid_credentials() is False

    def test_get_credentials_raises_error_without_credentials_file(
        self, auth_service
    ):
        """Test that get_credentials raises error when credentials file missing."""
        with pytest.raises(AuthenticationError) as exc_info:
            auth_service.get_credentials()

        assert "Credentials file not found" in str(exc_info.value)

    @patch("src.integrations.google.auth.InstalledAppFlow")
    @patch("src.integrations.google.auth.Credentials")
    def test_get_credentials_performs_oauth_flow_for_new_user(
        self, mock_creds_class, mock_flow_class, auth_service, tmp_path
    ):
        """Test that get_credentials performs OAuth flow for new users."""
        # Create credentials file
        creds_file = tmp_path / "credentials.json"
        creds_file.write_text('{"installed": {}}')
        auth_service.credentials_path = str(creds_file)
        auth_service.token_path = str(tmp_path / "token.json")

        # Mock the OAuth flow
        mock_flow = Mock()
        mock_creds = Mock()
        mock_creds.valid = True
        mock_creds.to_json.return_value = '{"token": "new"}'
        mock_flow.run_local_server.return_value = mock_creds
        mock_flow_class.from_client_secrets_file.return_value = mock_flow

        mock_creds_class.from_authorized_user_file.side_effect = FileNotFoundError

        credentials = auth_service.get_credentials()

        assert credentials == mock_creds
        mock_flow.run_local_server.assert_called_once()

    @patch("src.integrations.google.auth.Credentials")
    def test_get_credentials_refreshes_expired_token(
        self, mock_creds_class, auth_service, tmp_path
    ):
        """Test that get_credentials refreshes expired tokens."""
        # Create necessary files
        creds_file = tmp_path / "credentials.json"
        creds_file.write_text('{"installed": {}}')
        token_file = tmp_path / "token.json"
        token_file.write_text('{"token": "expired"}')

        auth_service.credentials_path = str(creds_file)
        auth_service.token_path = str(token_file)

        # Mock expired credentials
        mock_creds = Mock()
        mock_creds.valid = False
        mock_creds.expired = True
        mock_creds.refresh_token = "refresh_token"
        mock_creds.to_json.return_value = '{"token": "refreshed"}'
        mock_creds_class.from_authorized_user_file.return_value = mock_creds

        with patch("src.integrations.google.auth.Request") as mock_request:
            credentials = auth_service.get_credentials()

            mock_creds.refresh.assert_called_once()
            assert credentials == mock_creds

    @patch("src.integrations.google.auth.Credentials")
    def test_get_credentials_returns_valid_token(
        self, mock_creds_class, auth_service, tmp_path
    ):
        """Test that get_credentials returns existing valid token."""
        token_file = tmp_path / "token.json"
        token_file.write_text('{"token": "valid"}')
        auth_service.token_path = str(token_file)

        mock_creds = Mock()
        mock_creds.valid = True
        mock_creds.expired = False
        mock_creds.refresh_token = None
        mock_creds.to_json.return_value = '{"token": "valid"}'
        mock_creds_class.from_authorized_user_file.return_value = mock_creds

        credentials = auth_service.get_credentials()

        assert credentials == mock_creds

    def test_revoke_credentials_removes_token_file(self, auth_service, tmp_path):
        """Test that revoke_credentials deletes token file."""
        token_file = tmp_path / "token.json"
        token_file.write_text('{"token": "valid"}')
        auth_service.token_path = str(token_file)

        auth_service.revoke_credentials()

        assert not token_file.exists()

    def test_revoke_credentials_handles_missing_token_gracefully(self, auth_service):
        """Test that revoke_credentials handles missing token file."""
        # Should not raise an exception
        auth_service.revoke_credentials()

    @patch("src.integrations.google.auth.Credentials")
    def test_build_service_returns_google_service(
        self, mock_creds_class, auth_service, tmp_path
    ):
        """Test that build_service creates a Google API service."""
        token_file = tmp_path / "token.json"
        token_file.write_text('{"token": "valid"}')
        auth_service.token_path = str(token_file)

        mock_creds = Mock()
        mock_creds.valid = True
        mock_creds.expired = False
        mock_creds.refresh_token = None
        mock_creds.to_json.return_value = '{"token": "valid"}'
        mock_creds_class.from_authorized_user_file.return_value = mock_creds

        with patch("src.integrations.google.auth.build") as mock_build:
            mock_service = Mock()
            mock_build.return_value = mock_service

            service = auth_service.build_service("calendar", "v3")

            assert service == mock_service
            mock_build.assert_called_once_with(
                "calendar", "v3", credentials=mock_creds
            )
