"""
Integration tests for authentication with real database.
Tests complete authentication workflows from registration to profile access.
"""

import pytest
from datetime import datetime
from fastapi.testclient import TestClient

from src.api.main import app
from src.api.auth import settings
from src.core.task_models import User
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.repositories.enhanced_repositories import UserRepository


@pytest.fixture(scope="function")
def test_auth_db():
    """Create isolated test database for auth testing"""
    import tempfile
    import os

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    temp_file.close()

    db = EnhancedDatabaseAdapter(temp_file.name, check_same_thread=False)

    yield db

    try:
        os.unlink(temp_file.name)
    except Exception:
        pass


@pytest.fixture(scope="function")
def test_auth_client(test_auth_db):
    """FastAPI client with real test database and dependency override"""
    # Override the user_repo dependency to use test database
    import src.api.auth as auth_module

    # Store original user_repo
    original_user_repo = auth_module.user_repo

    # Create new user_repo with test database
    auth_module.user_repo = UserRepository(test_auth_db)

    client = TestClient(app)
    yield client

    # Restore original user_repo
    auth_module.user_repo = original_user_repo


class TestAuthenticationIntegrationRealDB:
    """Integration tests with real database"""

    def test_register_user_creates_database_record(self, test_auth_client, test_auth_db):
        """Test that user registration creates actual database record"""
        response = test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "securepassword123",
                "full_name": "New User",
            },
        )

        assert response.status_code == 201
        data = response.json()

        # Verify token is returned
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        # Verify user in database
        user_repo = UserRepository(test_auth_db)
        db_user = user_repo.get_by_username("newuser")

        assert db_user is not None
        assert db_user.username == "newuser"
        assert db_user.email == "newuser@example.com"
        assert db_user.full_name == "New User"
        assert db_user.password_hash is not None
        assert db_user.password_hash.startswith("$2b$")  # bcrypt hash
        assert db_user.is_active is True

    def test_complete_registration_login_profile_workflow(self, test_auth_client, test_auth_db):
        """Test complete workflow: register → login → access profile"""
        # Step 1: Register new user
        register_response = test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "workflowuser",
                "email": "workflow@example.com",
                "password": "password123",
                "full_name": "Workflow Test User",
            },
        )

        assert register_response.status_code == 201
        register_data = register_response.json()
        registration_token = register_data["access_token"]

        # Step 2: Login with credentials
        login_response = test_auth_client.post(
            "/api/v1/auth/login",
            json={"username": "workflowuser", "password": "password123"},
        )

        assert login_response.status_code == 200
        login_data = login_response.json()
        login_token = login_data["access_token"]

        # Both tokens should be valid
        assert len(registration_token) > 0
        assert len(login_token) > 0

        # Step 3: Access profile with login token
        profile_response = test_auth_client.get(
            "/api/v1/auth/profile", headers={"Authorization": f"Bearer {login_token}"}
        )

        assert profile_response.status_code == 200
        profile_data = profile_response.json()

        # Verify profile data matches
        assert profile_data["username"] == "workflowuser"
        assert profile_data["email"] == "workflow@example.com"
        assert profile_data["full_name"] == "Workflow Test User"
        assert profile_data["is_active"] is True

        # Verify database state
        user_repo = UserRepository(test_auth_db)
        db_user = user_repo.get_by_username("workflowuser")

        assert db_user.last_login is not None  # Login updated last_login

    def test_duplicate_username_prevented_by_database(self, test_auth_client):
        """Test that duplicate usernames are prevented"""
        # Register first user
        response1 = test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "duplicate",
                "email": "user1@example.com",
                "password": "password123",
            },
        )

        assert response1.status_code == 201

        # Attempt to register same username
        response2 = test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "duplicate",
                "email": "user2@example.com",
                "password": "password456",
            },
        )

        assert response2.status_code == 400
        assert "Username already registered" in response2.json()["detail"]

    def test_duplicate_email_prevented_by_database(self, test_auth_client):
        """Test that duplicate emails are prevented"""
        # Register first user
        response1 = test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "user1",
                "email": "duplicate@example.com",
                "password": "password123",
            },
        )

        assert response1.status_code == 201

        # Attempt to register same email
        response2 = test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "user2",
                "email": "duplicate@example.com",
                "password": "password456",
            },
        )

        assert response2.status_code == 400
        assert "Email already registered" in response2.json()["detail"]

    def test_password_hashing_security(self, test_auth_client, test_auth_db):
        """Test that passwords are properly hashed in database"""
        password = "mysecretpassword"

        # Register user
        response = test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "secureuser",
                "email": "secure@example.com",
                "password": password,
            },
        )

        assert response.status_code == 201

        # Check database
        user_repo = UserRepository(test_auth_db)
        db_user = user_repo.get_by_username("secureuser")

        # Password should be hashed, not stored in plain text
        assert db_user.password_hash != password
        assert db_user.password_hash.startswith("$2b$")  # bcrypt identifier
        assert len(db_user.password_hash) == 60  # bcrypt hash length

        # Should be able to login with original password
        login_response = test_auth_client.post(
            "/api/v1/auth/login", json={"username": "secureuser", "password": password}
        )

        assert login_response.status_code == 200

    def test_token_persistence_across_requests(self, test_auth_client):
        """Test that tokens work across multiple requests"""
        # Register and get token
        register_response = test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "persistent",
                "email": "persistent@example.com",
                "password": "password123",
            },
        )

        token = register_response.json()["access_token"]

        # Use token for multiple requests
        for _ in range(3):
            response = test_auth_client.get(
                "/api/v1/auth/profile", headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 200
            assert response.json()["username"] == "persistent"

        # Verify token still works
        verify_response = test_auth_client.get(
            "/api/v1/auth/verify", headers={"Authorization": f"Bearer {token}"}
        )

        assert verify_response.status_code == 200
        assert verify_response.json()["valid"] is True

    def test_login_updates_last_login_timestamp(self, test_auth_client, test_auth_db):
        """Test that login updates last_login field"""
        # Register user
        test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "timestampuser",
                "email": "timestamp@example.com",
                "password": "password123",
            },
        )

        user_repo = UserRepository(test_auth_db)

        # Get initial last_login (should be None from registration)
        user_before = user_repo.get_by_username("timestampuser")
        initial_last_login = user_before.last_login

        # Perform login
        import time

        time.sleep(0.1)  # Small delay to ensure timestamp difference

        test_auth_client.post(
            "/api/v1/auth/login",
            json={"username": "timestampuser", "password": "password123"},
        )

        # Check that last_login was updated
        user_after = user_repo.get_by_username("timestampuser")
        assert user_after.last_login is not None
        if initial_last_login is not None:
            assert user_after.last_login > initial_last_login

    def test_authentication_error_scenarios(self, test_auth_client):
        """Test various authentication error scenarios"""
        # Login with non-existent user
        response = test_auth_client.post(
            "/api/v1/auth/login",
            json={"username": "nonexistent", "password": "password123"},
        )
        assert response.status_code == 401

        # Register user
        test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "correctpassword",
            },
        )

        # Login with wrong password
        response = test_auth_client.post(
            "/api/v1/auth/login", json={"username": "testuser", "password": "wrongpassword"}
        )
        assert response.status_code == 401

        # Access protected endpoint without token
        response = test_auth_client.get("/api/v1/auth/profile")
        assert response.status_code == 403

        # Access protected endpoint with invalid token
        response = test_auth_client.get(
            "/api/v1/auth/profile", headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401


class TestAuthenticationSecurity:
    """Security-focused integration tests"""

    def test_jwt_secret_key_from_settings(self):
        """Test that JWT uses secret key from settings (not hardcoded)"""
        # Verify settings are loaded
        assert settings.jwt_secret_key is not None
        assert len(settings.jwt_secret_key) > 20  # Should be a long secure key
        assert settings.jwt_algorithm == "HS256"

    def test_bcrypt_password_hashing_enabled(self, test_auth_client, test_auth_db):
        """Test that bcrypt is actually being used"""
        test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "bcrypttest",
                "email": "bcrypt@example.com",
                "password": "testpassword",
            },
        )

        user_repo = UserRepository(test_auth_db)
        user = user_repo.get_by_username("bcrypttest")

        # bcrypt hashes start with $2b$ and are 60 characters
        assert user.password_hash.startswith("$2b$")
        assert len(user.password_hash) == 60

    def test_password_not_exposed_in_responses(self, test_auth_client):
        """Test that password hashes are never returned in API responses"""
        # Register
        register_response = test_auth_client.post(
            "/api/v1/auth/register",
            json={
                "username": "securitytest",
                "email": "security@example.com",
                "password": "password123",
            },
        )

        register_data = register_response.json()
        assert "password" not in register_data.get("user", {})
        assert "password_hash" not in register_data.get("user", {})

        # Login
        login_response = test_auth_client.post(
            "/api/v1/auth/login",
            json={"username": "securitytest", "password": "password123"},
        )

        login_data = login_response.json()
        assert "password" not in login_data.get("user", {})
        assert "password_hash" not in login_data.get("user", {})

        # Profile
        token = login_response.json()["access_token"]
        profile_response = test_auth_client.get(
            "/api/v1/auth/profile", headers={"Authorization": f"Bearer {token}"}
        )

        profile_data = profile_response.json()
        assert "password" not in profile_data
        assert "password_hash" not in profile_data
