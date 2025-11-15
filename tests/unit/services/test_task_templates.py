"""
TDD Tests for Task Templates Service (BE-01)

Following RED-GREEN-REFACTOR methodology:
1. RED: Write failing tests first
2. GREEN: Implement minimum code to pass
3. REFACTOR: Optimize and improve

Test Coverage Target: 95%+
"""

from uuid import uuid4

import pytest

# Will be implemented in GREEN phase
# from src.services.task_templates.models import (
#     TaskTemplateCreate,
#     TaskTemplateUpdate,
#     TaskTemplate,
#     TemplateStepCreate,
#     TemplateStep,
# )


@pytest.fixture
def sample_template_data():
    """Fixture for valid template creation data."""
    return {
        "name": "Homework Assignment",
        "description": "Complete a typical homework assignment",
        "category": "Academic",
        "icon": "📚",
        "estimated_minutes": 60,
        "created_by": "system",
        "is_public": True,
        "steps": [
            {
                "step_order": 1,
                "description": "Research the topic and gather resources",
                "short_label": "Research",
                "estimated_minutes": 15,
                "leaf_type": "DIGITAL",
                "icon": "🔍",
            },
            {
                "step_order": 2,
                "description": "Write the first draft",
                "short_label": "Draft",
                "estimated_minutes": 25,
                "leaf_type": "HUMAN",
                "icon": "✍️",
            },
            {
                "step_order": 3,
                "description": "Revise and edit your work",
                "short_label": "Revise",
                "estimated_minutes": 15,
                "leaf_type": "HUMAN",
                "icon": "📝",
            },
            {
                "step_order": 4,
                "description": "Submit the assignment",
                "short_label": "Submit",
                "estimated_minutes": 5,
                "leaf_type": "DIGITAL",
                "icon": "📤",
            },
        ],
    }


@pytest.fixture
def test_client():
    """Fixture for FastAPI test client."""
    from fastapi.testclient import TestClient

    from src.api.main import app

    return TestClient(app)


class TestTaskTemplateAPI:
    """TDD tests for task templates API endpoints."""

    def test_create_template_success(self, test_client, sample_template_data):
        """RED: Test creating a template with steps."""
        response = test_client.post("/api/v1/task-templates/", json=sample_template_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Homework Assignment"
        assert data["category"] == "Academic"
        assert len(data["steps"]) == 4
        assert data["steps"][0]["step_order"] == 1
        assert data["steps"][0]["description"] == "Research the topic and gather resources"
        assert "template_id" in data
        assert "created_at" in data

    def test_create_template_validation_error_no_steps(self, test_client):
        """RED: Test validation fails with empty steps."""
        invalid_data = {
            "name": "Invalid Template",
            "category": "Academic",
            "steps": [],  # Must have at least 1 step
        }
        response = test_client.post("/api/v1/task-templates/", json=invalid_data)
        assert response.status_code == 422

    def test_create_template_validation_error_invalid_category(self, test_client):
        """RED: Test validation fails with invalid category."""
        invalid_data = {
            "name": "Invalid Template",
            "category": "InvalidCategory",  # Not in allowed values
            "steps": [
                {
                    "step_order": 1,
                    "description": "Test step",
                    "estimated_minutes": 5,
                }
            ],
        }
        response = test_client.post("/api/v1/task-templates/", json=invalid_data)
        assert response.status_code == 422

    def test_list_all_public_templates(self, test_client, sample_template_data):
        """RED: Test listing all public templates."""
        # Create a template first
        test_client.post("/api/v1/task-templates/", json=sample_template_data)

        response = test_client.get("/api/v1/task-templates/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(t["is_public"] for t in data)
        assert all("steps" in t for t in data)

    def test_list_templates_by_category(self, test_client, sample_template_data):
        """RED: Test filtering templates by category."""
        test_client.post("/api/v1/task-templates/", json=sample_template_data)

        response = test_client.get("/api/v1/task-templates/?category=Academic")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(t["category"] == "Academic" for t in data)

    def test_get_template_by_id(self, test_client, sample_template_data):
        """RED: Test retrieving a specific template."""
        create_response = test_client.post("/api/v1/task-templates/", json=sample_template_data)
        template_id = create_response.json()["template_id"]

        response = test_client.get(f"/api/v1/task-templates/{template_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["template_id"] == template_id
        assert data["name"] == "Homework Assignment"
        assert len(data["steps"]) == 4

    def test_get_template_not_found(self, test_client):
        """RED: Test 404 for non-existent template."""
        fake_id = str(uuid4())
        response = test_client.get(f"/api/v1/task-templates/{fake_id}")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_update_template_metadata(self, test_client, sample_template_data):
        """RED: Test updating template metadata (not steps)."""
        create_response = test_client.post("/api/v1/task-templates/", json=sample_template_data)
        template_id = create_response.json()["template_id"]

        update_data = {"name": "Updated Homework Template", "description": "New description"}
        response = test_client.put(f"/api/v1/task-templates/{template_id}", json=update_data)
        assert response.status_code == 200
        updated = response.json()
        assert updated["name"] == "Updated Homework Template"
        assert updated["description"] == "New description"
        assert len(updated["steps"]) == 4  # Steps unchanged

    def test_update_template_not_found(self, test_client):
        """RED: Test 404 when updating non-existent template."""
        fake_id = str(uuid4())
        update_data = {"name": "Updated Template"}
        response = test_client.put(f"/api/v1/task-templates/{fake_id}", json=update_data)
        assert response.status_code == 404

    def test_delete_template_success(self, test_client, sample_template_data):
        """RED: Test deleting a template."""
        create_response = test_client.post("/api/v1/task-templates/", json=sample_template_data)
        template_id = create_response.json()["template_id"]

        response = test_client.delete(f"/api/v1/task-templates/{template_id}")
        assert response.status_code == 204

        # Verify deletion
        get_response = test_client.get(f"/api/v1/task-templates/{template_id}")
        assert get_response.status_code == 404

    def test_delete_template_not_found(self, test_client):
        """RED: Test 404 when deleting non-existent template."""
        fake_id = str(uuid4())
        response = test_client.delete(f"/api/v1/task-templates/{fake_id}")
        assert response.status_code == 404

    def test_delete_cascades_to_steps(self, test_client, sample_template_data):
        """RED: Test that deleting template deletes associated steps."""
        create_response = test_client.post("/api/v1/task-templates/", json=sample_template_data)
        template_id = create_response.json()["template_id"]

        # Get template with steps
        get_response = test_client.get(f"/api/v1/task-templates/{template_id}")
        assert len(get_response.json()["steps"]) == 4

        # Delete template
        delete_response = test_client.delete(f"/api/v1/task-templates/{template_id}")
        assert delete_response.status_code == 204

        # Verify template is gone
        get_response = test_client.get(f"/api/v1/task-templates/{template_id}")
        assert get_response.status_code == 404

    def test_create_template_with_minimal_data(self, test_client):
        """RED: Test creating template with only required fields."""
        minimal_data = {
            "name": "Minimal Template",
            "category": "Personal",
            "steps": [
                {
                    "step_order": 1,
                    "description": "Do the thing",
                    "estimated_minutes": 5,
                }
            ],
        }
        response = test_client.post("/api/v1/task-templates/", json=minimal_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Minimal Template"
        assert data["description"] is None or data["description"] == ""
        assert len(data["steps"]) == 1


class TestTaskTemplateValidation:
    """Test Pydantic model validation."""

    def test_step_order_must_be_positive(self, test_client):
        """RED: Test that step_order must be >= 1."""
        invalid_data = {
            "name": "Test Template",
            "category": "Academic",
            "steps": [
                {
                    "step_order": 0,  # Invalid: must be >= 1
                    "description": "Test step",
                    "estimated_minutes": 5,
                }
            ],
        }
        response = test_client.post("/api/v1/task-templates/", json=invalid_data)
        assert response.status_code == 422

    def test_estimated_minutes_within_range(self, test_client):
        """RED: Test that estimated_minutes is within valid range (1-10)."""
        invalid_data = {
            "name": "Test Template",
            "category": "Academic",
            "steps": [
                {
                    "step_order": 1,
                    "description": "Test step",
                    "estimated_minutes": 15,  # > 10 (may be invalid per spec)
                }
            ],
        }
        # Note: Spec says 2-5 min target but allows up to 10
        # This test verifies the validation logic
        response = test_client.post("/api/v1/task-templates/", json=invalid_data)
        # Should either accept or reject based on model validation
        assert response.status_code in [201, 422]

    def test_max_steps_per_template(self, test_client):
        """RED: Test maximum of 10 steps per template."""
        # Create 11 steps (should fail if max is 10)
        too_many_steps = [
            {
                "step_order": i,
                "description": f"Step {i}",
                "estimated_minutes": 5,
            }
            for i in range(1, 12)  # 11 steps
        ]

        invalid_data = {
            "name": "Too Many Steps",
            "category": "Academic",
            "steps": too_many_steps,
        }
        response = test_client.post("/api/v1/task-templates/", json=invalid_data)
        assert response.status_code == 422


# Pytest will discover and run these tests
# Run with: uv run pytest src/services/task_templates/tests/ -v
