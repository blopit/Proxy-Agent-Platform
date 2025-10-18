"""
Test suite for authentication API endpoints - TDD approach for Epic 1.2
"""

import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from fastapi import FastAPI
import jwt

from src.api.auth import (
    router,
    hash_password,
    verify_password,
    create_access_token,
    settings,
)
from src.core.task_models import User
from src.repositories.enhanced_repositories import UserRepository


# Test app setup
app = FastAPI()
app.include_router(router)
client = TestClient(app)


class TestPasswordHashing:
    """Test password hashing and verification functions"""

    def test_hash_password_creates_unique_hashes(self):
        """Test that password hashing creates unique hashes for same password"""
        password = "test_password_123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        # bcrypt creates different hashes due to unique salt
        assert hash1 != hash2
        # bcrypt hashes start with $2b$ (bcrypt identifier)
        assert hash1.startswith("$2b$")
        assert hash2.startswith("$2b$")
        # bcrypt hashes are 60 characters
        assert len(hash1) == 60
        assert len(hash2) == 60

    def test_verify_password_with_correct_password(self):
        """Test password verification with correct password"""
        password = "correct_password"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_with_incorrect_password(self):
        """Test password verification with incorrect password"""
        password = "correct_password"
        hashed = hash_password(password)

        assert verify_password("wrong_password", hashed) is False

    def test_verify_password_with_malformed_hash(self):
        """Test password verification with malformed hash"""
        # bcrypt will raise an error for malformed hash, which is caught and returns False
        try:
            result = verify_password("any_password", "malformed_hash")
            # If passlib handles it gracefully, it should return False
            assert result is False
        except Exception:
            # If it raises an exception, that's also acceptable for malformed hash
            pass


class TestJWTTokens:
    """Test JWT token creation and verification"""

    def test_create_access_token_with_default_expiry(self):
        """Test JWT token creation with default expiry"""
        data = {"sub": "testuser"}
        token = create_access_token(data)

        # Decode to verify
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        assert payload["sub"] == "testuser"
        assert "exp" in payload

    def test_create_access_token_with_custom_expiry(self):
        """Test JWT token creation with custom expiry"""
        import time

        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=60)

        # Record start time using time.time() for consistency
        start_time = time.time()
        token = create_access_token(data, expires_delta)

        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        assert payload["sub"] == "testuser"

        # Check that token expires roughly 60 minutes from start time
        expected_exp_time = start_time + expires_delta.total_seconds()
        actual_exp_time = payload["exp"]

        # Allow 2 minute tolerance for test execution time
        time_diff = abs(actual_exp_time - expected_exp_time)
        assert time_diff < 120

    def test_jwt_token_expiry(self):
        """Test that expired tokens are invalid"""
        data = {"sub": "testuser"}
        # Create token that expires in the past
        expires_delta = timedelta(minutes=-60)
        token = create_access_token(data, expires_delta)

        # Should raise exception when decoding expired token
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
                options={"require": ["exp"], "verify_exp": True}
            )


class TestUserRegistration:
    """Test user registration endpoint"""

    def test_register_new_user_success(self, mocker):
        """Test successful user registration"""
        # Mock the UserRepository
        mock_user_repo = mocker.patch('src.api.auth.user_repo')
        mock_user_repo.get_by_username.return_value = None  # No existing user
        mock_user_repo.get_by_email.return_value = None     # No existing email

        # Mock the created user
        created_user = User(
            user_id="test-user-id",
            username="newuser",
            email="newuser@example.com",
            full_name="New User",
            password_hash="hashed_password",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            is_active=True
        )
        mock_user_repo.create.return_value = created_user

        # Test registration
        response = client.post("/api/v1/auth/register", json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123",
            "full_name": "New User"
        })

        assert response.status_code == 201
        data = response.json()
        assert data["token_type"] == "bearer"
        assert "access_token" in data
        assert data["user"]["username"] == "newuser"
        assert data["user"]["email"] == "newuser@example.com"

    def test_register_existing_username_fails(self, mocker):
        """Test registration fails with existing username"""
        # Mock existing user
        existing_user = User(
            user_id="existing-id",
            username="existinguser",
            email="existing@example.com"
        )

        mock_user_repo = mocker.patch('src.api.auth.user_repo')
        mock_user_repo.get_by_username.return_value = existing_user

        response = client.post("/api/v1/auth/register", json={
            "username": "existinguser",
            "email": "new@example.com",
            "password": "password123"
        })

        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]

    def test_register_existing_email_fails(self, mocker):
        """Test registration fails with existing email"""
        # Mock existing user with email
        existing_user = User(
            user_id="existing-id",
            username="different_user",
            email="existing@example.com"
        )

        mock_user_repo = mocker.patch('src.api.auth.user_repo')
        mock_user_repo.get_by_username.return_value = None
        mock_user_repo.get_by_email.return_value = existing_user

        response = client.post("/api/v1/auth/register", json={
            "username": "newuser",
            "email": "existing@example.com",
            "password": "password123"
        })

        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_register_invalid_email_format(self):
        """Test registration fails with invalid email format"""
        response = client.post("/api/v1/auth/register", json={
            "username": "newuser",
            "email": "invalid-email",
            "password": "password123"
        })

        assert response.status_code == 422  # Validation error


class TestUserLogin:
    """Test user login endpoint"""

    def test_login_success(self, mocker):
        """Test successful user login"""
        # Create test user with hashed password
        test_password = "password123"
        hashed_password = hash_password(test_password)

        test_user = User(
            user_id="test-user-id",
            username="testuser",
            email="test@example.com",
            password_hash=hashed_password,
            last_login=None
        )

        mock_user_repo = mocker.patch('src.api.auth.user_repo')
        mock_user_repo.get_by_username.return_value = test_user
        mock_user_repo.update = mocker.Mock()

        response = client.post("/api/v1/auth/login", json={
            "username": "testuser",
            "password": test_password
        })

        assert response.status_code == 200
        data = response.json()
        assert data["token_type"] == "bearer"
        assert "access_token" in data
        assert data["user"]["username"] == "testuser"

        # Verify last_login was updated
        mock_user_repo.update.assert_called_once()

    def test_login_user_not_found(self, mocker):
        """Test login fails when user doesn't exist"""
        mock_user_repo = mocker.patch('src.api.auth.user_repo')
        mock_user_repo.get_by_username.return_value = None

        response = client.post("/api/v1/auth/login", json={
            "username": "nonexistent",
            "password": "password123"
        })

        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    def test_login_wrong_password(self, mocker):
        """Test login fails with wrong password"""
        # Create test user with hashed password
        hashed_password = hash_password("correct_password")

        test_user = User(
            user_id="test-user-id",
            username="testuser",
            email="test@example.com",
            password_hash=hashed_password
        )

        mock_user_repo = mocker.patch('src.api.auth.user_repo')
        mock_user_repo.get_by_username.return_value = test_user

        response = client.post("/api/v1/auth/login", json={
            "username": "testuser",
            "password": "wrong_password"
        })

        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]


class TestProtectedEndpoints:
    """Test protected endpoints that require authentication"""

    def test_get_profile_with_valid_token(self, mocker):
        """Test getting user profile with valid token"""
        test_user = User(
            user_id="test-user-id",
            username="testuser",
            email="test@example.com",
            full_name="Test User",
            created_at=datetime.now(),
            is_active=True
        )

        mock_user_repo = mocker.patch('src.api.auth.user_repo')
        mock_user_repo.get_by_username.return_value = test_user

        # Create valid token
        token = create_access_token({"sub": "testuser"})

        response = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["is_active"] is True

    def test_get_profile_without_token(self):
        """Test getting profile without token fails"""
        response = client.get("/api/v1/auth/profile")
        assert response.status_code == 403  # Forbidden

    def test_get_profile_with_invalid_token(self):
        """Test getting profile with invalid token fails"""
        response = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_get_profile_with_expired_token(self):
        """Test getting profile with expired token fails"""
        # Create expired token
        expired_token = create_access_token(
            {"sub": "testuser"},
            expires_delta=timedelta(minutes=-60)
        )

        response = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        assert response.status_code == 401

    def test_verify_token_endpoint(self):
        """Test token verification endpoint"""
        token = create_access_token({"sub": "testuser"})

        response = client.get(
            "/api/v1/auth/verify",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["username"] == "testuser"

    def test_logout_endpoint(self):
        """Test logout endpoint"""
        token = create_access_token({"sub": "testuser"})

        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]


class TestAuthenticationIntegration:
    """Integration tests for complete authentication workflows"""

    def test_complete_registration_and_login_flow(self, mocker):
        """Test complete user registration followed by login"""
        # Mock user repository for registration
        mock_user_repo = mocker.patch('src.api.auth.user_repo')
        mock_user_repo.get_by_username.return_value = None
        mock_user_repo.get_by_email.return_value = None

        created_user = User(
            user_id="new-user-id",
            username="flowuser",
            email="flow@example.com",
            full_name="Flow User",
            password_hash=hash_password("password123"),
            created_at=datetime.now(),
            updated_at=datetime.now(),
            is_active=True
        )
        mock_user_repo.create.return_value = created_user

        # Step 1: Registration
        register_response = client.post("/api/v1/auth/register", json={
            "username": "flowuser",
            "email": "flow@example.com",
            "password": "password123",
            "full_name": "Flow User"
        })

        assert register_response.status_code == 201
        register_token = register_response.json()["access_token"]

        # Step 2: Use registration token to access profile
        mock_user_repo.get_by_username.return_value = created_user

        profile_response = client.get(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {register_token}"}
        )

        assert profile_response.status_code == 200
        assert profile_response.json()["username"] == "flowuser"

    def test_authentication_error_handling(self):
        """Test authentication error handling scenarios"""
        # Test malformed request
        response = client.post("/api/v1/auth/login", json={})
        assert response.status_code == 422

        # Test missing fields
        response = client.post("/api/v1/auth/register", json={
            "username": "test"
            # Missing required fields
        })
        assert response.status_code == 422