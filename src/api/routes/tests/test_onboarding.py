"""
Integration tests for User Onboarding API endpoints

Tests all onboarding REST API endpoints with:
- Database persistence
- Request/response validation
- Error handling
"""

import pytest
from fastapi.testclient import TestClient

from src.api.main import app


@pytest.fixture
def test_client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def cleanup_db():
    """Clean up test data after each test"""
    yield
    # Clean up is handled by service layer


class TestOnboardingAPI:
    """Test User Onboarding API endpoints"""

    def test_create_onboarding_basic(self, test_client):
        """Test creating basic onboarding data"""
        user_id = "test_user_001"
        onboarding_data = {
            "work_preference": "remote",
            "adhd_support_level": 7,
        }

        response = test_client.put(f"/api/v1/users/{user_id}/onboarding", json=onboarding_data)

        assert response.status_code == 200
        data = response.json()

        assert data["user_id"] == user_id
        assert data["work_preference"] == "remote"
        assert data["adhd_support_level"] == 7
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_onboarding_full(self, test_client):
        """Test creating complete onboarding data"""
        user_id = "test_user_002"
        onboarding_data = {
            "work_preference": "hybrid",
            "adhd_support_level": 8,
            "adhd_challenges": ["time_blindness", "task_initiation", "focus"],
            "daily_schedule": {
                "time_preference": "morning",
                "flexible_enabled": False,
                "week_grid": {
                    "monday": "8-17",
                    "tuesday": "8-17",
                    "wednesday": "flexible",
                    "thursday": "8-17",
                    "friday": "8-13",
                },
            },
            "productivity_goals": ["reduce_overwhelm", "increase_focus", "build_habits"],
        }

        response = test_client.put(f"/api/v1/users/{user_id}/onboarding", json=onboarding_data)

        assert response.status_code == 200
        data = response.json()

        assert data["user_id"] == user_id
        assert data["work_preference"] == "hybrid"
        assert data["adhd_support_level"] == 8
        assert len(data["adhd_challenges"]) == 3
        assert "time_blindness" in data["adhd_challenges"]
        assert data["daily_schedule"]["time_preference"] == "morning"
        assert len(data["productivity_goals"]) == 3

    def test_get_onboarding_exists(self, test_client):
        """Test retrieving existing onboarding data"""
        user_id = "test_user_003"

        # Create first
        create_data = {"work_preference": "office", "adhd_support_level": 5}
        test_client.put(f"/api/v1/users/{user_id}/onboarding", json=create_data)

        # Then retrieve
        response = test_client.get(f"/api/v1/users/{user_id}/onboarding")

        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user_id
        assert data["work_preference"] == "office"

    def test_get_onboarding_not_found(self, test_client):
        """Test retrieving non-existent onboarding data"""
        response = test_client.get("/api/v1/users/nonexistent_user/onboarding")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_update_onboarding_partial(self, test_client):
        """Test partial update of onboarding data"""
        user_id = "test_user_004"

        # Create initial data
        create_data = {"work_preference": "remote", "adhd_support_level": 6}
        test_client.put(f"/api/v1/users/{user_id}/onboarding", json=create_data)

        # Update only ADHD level
        update_data = {"adhd_support_level": 9}
        response = test_client.put(f"/api/v1/users/{user_id}/onboarding", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["work_preference"] == "remote"  # Unchanged
        assert data["adhd_support_level"] == 9  # Updated

    def test_mark_onboarding_completed(self, test_client):
        """Test marking onboarding as completed"""
        user_id = "test_user_005"

        # Create data first
        create_data = {"work_preference": "flexible", "adhd_support_level": 7}
        test_client.put(f"/api/v1/users/{user_id}/onboarding", json=create_data)

        # Mark completed
        response = test_client.post(
            f"/api/v1/users/{user_id}/onboarding/complete", json={"completed": True}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["onboarding_completed"] is True
        assert data["onboarding_skipped"] is False
        assert data["completed_at"] is not None

    def test_mark_onboarding_skipped(self, test_client):
        """Test marking onboarding as skipped"""
        user_id = "test_user_006"

        # Mark skipped (creates record if doesn't exist)
        response = test_client.post(
            f"/api/v1/users/{user_id}/onboarding/complete", json={"completed": False}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["onboarding_completed"] is False
        assert data["onboarding_skipped"] is True
        assert data["skipped_at"] is not None

    def test_chatgpt_export_prompt(self, test_client):
        """Test storing ChatGPT export prompt"""
        user_id = "test_user_007"

        # Create with ChatGPT prompt
        prompt_text = "You are helping someone with ADHD who works remotely..."
        onboarding_data = {
            "work_preference": "remote",
            "adhd_support_level": 7,
            "chatgpt_export_prompt": prompt_text,
        }

        response = test_client.put(f"/api/v1/users/{user_id}/onboarding", json=onboarding_data)

        assert response.status_code == 200
        data = response.json()
        assert data["chatgpt_export_prompt"] == prompt_text
        assert data["chatgpt_exported_at"] is not None

    def test_delete_onboarding(self, test_client):
        """Test deleting onboarding data"""
        user_id = "test_user_008"

        # Create data first
        create_data = {"work_preference": "hybrid", "adhd_support_level": 6}
        test_client.put(f"/api/v1/users/{user_id}/onboarding", json=create_data)

        # Delete
        response = test_client.delete(f"/api/v1/users/{user_id}/onboarding")
        assert response.status_code == 204

        # Verify deleted
        get_response = test_client.get(f"/api/v1/users/{user_id}/onboarding")
        assert get_response.status_code == 404

    def test_delete_onboarding_not_found(self, test_client):
        """Test deleting non-existent onboarding data"""
        response = test_client.delete("/api/v1/users/nonexistent_user/onboarding")
        assert response.status_code == 404

    def test_invalid_work_preference(self, test_client):
        """Test invalid work preference value"""
        user_id = "test_user_009"
        onboarding_data = {
            "work_preference": "invalid_value",
            "adhd_support_level": 7,
        }

        response = test_client.put(f"/api/v1/users/{user_id}/onboarding", json=onboarding_data)
        assert response.status_code == 422  # Validation error

    def test_invalid_adhd_support_level(self, test_client):
        """Test invalid ADHD support level (out of range)"""
        user_id = "test_user_010"
        onboarding_data = {
            "work_preference": "remote",
            "adhd_support_level": 15,  # Out of range (1-10)
        }

        response = test_client.put(f"/api/v1/users/{user_id}/onboarding", json=onboarding_data)
        assert response.status_code == 422  # Validation error

    def test_response_schema_validation(self, test_client):
        """Test that responses match the expected schema"""
        user_id = "test_user_011"

        onboarding_data = {
            "work_preference": "remote",
            "adhd_support_level": 7,
            "adhd_challenges": ["focus", "organization"],
            "productivity_goals": ["reduce_overwhelm"],
        }

        response = test_client.put(f"/api/v1/users/{user_id}/onboarding", json=onboarding_data)

        assert response.status_code == 200
        data = response.json()

        # Verify all required fields exist
        required_fields = [
            "user_id",
            "work_preference",
            "adhd_support_level",
            "adhd_challenges",
            "productivity_goals",
            "onboarding_completed",
            "onboarding_skipped",
            "created_at",
            "updated_at",
        ]

        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

        # Verify types
        assert isinstance(data["adhd_challenges"], list)
        assert isinstance(data["productivity_goals"], list)
        assert isinstance(data["onboarding_completed"], bool)

    def test_concurrent_updates(self, test_client):
        """Test concurrent updates to same user"""
        user_id = "test_user_012"

        # Initial create
        test_client.put(
            f"/api/v1/users/{user_id}/onboarding",
            json={"work_preference": "remote", "adhd_support_level": 5},
        )

        # Multiple updates
        update1 = test_client.put(
            f"/api/v1/users/{user_id}/onboarding", json={"adhd_support_level": 7}
        )
        update2 = test_client.put(
            f"/api/v1/users/{user_id}/onboarding", json={"work_preference": "hybrid"}
        )

        assert update1.status_code == 200
        assert update2.status_code == 200

        # Verify final state
        final = test_client.get(f"/api/v1/users/{user_id}/onboarding")
        data = final.json()
        assert data["work_preference"] == "hybrid"
        assert data["adhd_support_level"] == 7

    def test_idempotent_completion(self, test_client):
        """Test that marking completed multiple times is idempotent"""
        user_id = "test_user_013"

        # Create initial data
        test_client.put(
            f"/api/v1/users/{user_id}/onboarding",
            json={"work_preference": "remote", "adhd_support_level": 7},
        )

        # Mark completed twice
        response1 = test_client.post(
            f"/api/v1/users/{user_id}/onboarding/complete", json={"completed": True}
        )
        response2 = test_client.post(
            f"/api/v1/users/{user_id}/onboarding/complete", json={"completed": True}
        )

        assert response1.status_code == 200
        assert response2.status_code == 200

        # Both should have completed status
        assert response1.json()["onboarding_completed"] is True
        assert response2.json()["onboarding_completed"] is True
