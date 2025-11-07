"""
Tests for JWT authentication middleware - TDD RED phase

Testing get_current_user dependency that will be used across all protected routes.
"""

from unittest.mock import patch

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from src.api.auth import create_access_token, get_current_user
from src.core.task_models import User


class TestGetCurrentUser:
    """Test suite for get_current_user dependency"""

    def test_get_current_user_with_valid_token(self):
        """
        RED: Should extract user from valid JWT token.

        Given: A valid JWT token with user_id in payload
        When: get_current_user is called with the token
        Then: Should return User object with correct user_id
        """
        # Create a valid token
        token_data = {"sub": "testuser", "user_id": "user_123"}
        token = create_access_token(token_data)

        # Create mock credentials
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        # Mock the UserRepository
        with patch("src.api.auth.user_repo") as mock_repo:
            mock_user = User(
                user_id="user_123",
                username="testuser",
                email="test@example.com",
                hashed_password="hashed",
                is_active=True,
            )
            mock_repo.get_by_id.return_value = mock_user

            # Call get_current_user
            user = get_current_user(credentials)

            # Assert correct user returned
            assert user.user_id == "user_123"
            assert user.username == "testuser"
            assert user.email == "test@example.com"

    def test_get_current_user_with_expired_token(self):
        """
        RED: Should raise HTTPException for expired token.

        Given: An expired JWT token
        When: get_current_user is called
        Then: Should raise 401 Unauthorized with "Token has expired" message
        """
        from datetime import timedelta

        # Create an expired token (negative expiry)
        token_data = {"sub": "testuser", "user_id": "user_123"}
        token = create_access_token(token_data, expires_delta=timedelta(seconds=-60))

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        # Should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(credentials)

        assert exc_info.value.status_code == 401
        assert "expired" in exc_info.value.detail.lower()

    def test_get_current_user_with_invalid_token(self):
        """
        RED: Should raise HTTPException for malformed token.

        Given: A malformed/invalid JWT token
        When: get_current_user is called
        Then: Should raise 401 Unauthorized
        """
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid.token.here"
        )

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(credentials)

        assert exc_info.value.status_code == 401

    def test_get_current_user_with_missing_user_id(self):
        """
        RED: Should raise HTTPException if user_id missing from token.

        Given: A valid token but without user_id claim
        When: get_current_user is called
        Then: Should raise 401 Unauthorized
        """
        token_data = {"sub": "testuser"}  # Missing user_id
        token = create_access_token(token_data)

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(credentials)

        assert exc_info.value.status_code == 401
        assert "credentials" in exc_info.value.detail.lower()

    def test_get_current_user_with_nonexistent_user(self):
        """
        RED: Should raise HTTPException if user not found in database.

        Given: A valid token with user_id that doesn't exist in DB
        When: get_current_user is called
        Then: Should raise 404 Not Found
        """
        token_data = {"sub": "testuser", "user_id": "nonexistent_user"}
        token = create_access_token(token_data)

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with patch("src.api.auth.user_repo") as mock_repo:
            mock_repo.get_by_id.return_value = None  # User not found

            with pytest.raises(HTTPException) as exc_info:
                get_current_user(credentials)

            assert exc_info.value.status_code == 404
            assert "user not found" in exc_info.value.detail.lower()

    def test_get_current_user_with_inactive_user(self):
        """
        RED: Should raise HTTPException if user is inactive.

        Given: A valid token for an inactive user
        When: get_current_user is called
        Then: Should raise 403 Forbidden
        """
        token_data = {"sub": "testuser", "user_id": "user_123"}
        token = create_access_token(token_data)

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with patch("src.api.auth.user_repo") as mock_repo:
            mock_user = User(
                user_id="user_123",
                username="testuser",
                email="test@example.com",
                hashed_password="hashed",
                is_active=False,  # Inactive user
            )
            mock_repo.get_by_id.return_value = mock_user

            with pytest.raises(HTTPException) as exc_info:
                get_current_user(credentials)

            assert exc_info.value.status_code == 403
            assert "inactive" in exc_info.value.detail.lower()


class TestProtectedEndpointIntegration:
    """Integration tests for using get_current_user in endpoints"""

    def test_protected_endpoint_with_valid_auth(self, test_client):
        """
        RED: Should access protected endpoint with valid token.

        Given: A protected endpoint requiring authentication
        When: Request is made with valid Bearer token
        Then: Should return 200 and access granted
        """
        # This will be tested after we update actual endpoints
        # to use get_current_user dependency
        pass

    def test_protected_endpoint_without_auth(self, test_client):
        """
        RED: Should reject access to protected endpoint without token.

        Given: A protected endpoint requiring authentication
        When: Request is made without Authorization header
        Then: Should return 401 Unauthorized
        """
        pass
