"""
TDD Tests for Task Templates Service (BE-01).

Following RED-GREEN-REFACTOR workflow.
These tests define the expected behavior before implementation.
"""

from uuid import uuid4


class TestTaskTemplateAPI:
    """TDD tests for task templates API endpoints."""

    def test_create_template_success(self, test_client, sample_template_data):
        """Test creating a template with steps."""
        response = test_client.post(
            "/api/v1/task-templates/", json=sample_template_data.model_dump()
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Homework Assignment"
        assert data["category"] == "Academic"
        assert data["icon"] == "book"
        assert len(data["steps"]) == 4
        assert data["steps"][0]["step_order"] == 1
        assert data["steps"][0]["short_label"] == "Research"
        assert "template_id" in data
        assert "created_at" in data

    def test_create_template_validation_error_no_steps(self, test_client):
        """Test validation fails with empty steps."""
        invalid_data = {
            "name": "Invalid Template",
            "category": "Academic",
            "steps": [],  # Must have at least 1 step
        }
        response = test_client.post("/api/v1/task-templates/", json=invalid_data)
        assert response.status_code == 422

    def test_create_template_validation_error_invalid_category(self, test_client):
        """Test validation fails with invalid category."""
        invalid_data = {
            "name": "Invalid Template",
            "category": "InvalidCategory",  # Not in allowed categories
            "steps": [
                {
                    "step_order": 1,
                    "description": "Step 1",
                    "estimated_minutes": 5,
                }
            ],
        }
        response = test_client.post("/api/v1/task-templates/", json=invalid_data)
        assert response.status_code == 422

    def test_list_all_public_templates(self, test_client, sample_template_data):
        """Test listing all public templates."""
        # Create a template first
        test_client.post("/api/v1/task-templates/", json=sample_template_data.model_dump())

        response = test_client.get("/api/v1/task-templates/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(t["is_public"] for t in data)
        assert all("steps" in t for t in data)

    def test_list_templates_by_category(
        self, test_client, sample_template_data, work_template_data
    ):
        """Test filtering templates by category."""
        # Create templates in different categories
        test_client.post("/api/v1/task-templates/", json=sample_template_data.model_dump())
        test_client.post("/api/v1/task-templates/", json=work_template_data.model_dump())

        # Filter by Academic
        response = test_client.get("/api/v1/task-templates/?category=Academic")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(t["category"] == "Academic" for t in data)

        # Filter by Work
        response = test_client.get("/api/v1/task-templates/?category=Work")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(t["category"] == "Work" for t in data)

    def test_get_template_by_id(self, test_client, sample_template_data):
        """Test retrieving a specific template."""
        create_response = test_client.post(
            "/api/v1/task-templates/", json=sample_template_data.model_dump()
        )
        template_id = create_response.json()["template_id"]

        response = test_client.get(f"/api/v1/task-templates/{template_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["template_id"] == template_id
        assert data["name"] == "Homework Assignment"
        assert len(data["steps"]) == 4
        # Verify steps are ordered
        assert data["steps"][0]["step_order"] == 1
        assert data["steps"][1]["step_order"] == 2
        assert data["steps"][2]["step_order"] == 3
        assert data["steps"][3]["step_order"] == 4

    def test_get_template_not_found(self, test_client):
        """Test 404 for non-existent template."""
        fake_id = str(uuid4())
        response = test_client.get(f"/api/v1/task-templates/{fake_id}")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_update_template_name(self, test_client, sample_template_data):
        """Test updating template name."""
        create_response = test_client.post(
            "/api/v1/task-templates/", json=sample_template_data.model_dump()
        )
        template_id = create_response.json()["template_id"]

        update_data = {"name": "Updated Homework Template"}
        response = test_client.put(f"/api/v1/task-templates/{template_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Homework Template"
        # Verify steps unchanged
        assert len(response.json()["steps"]) == 4

    def test_update_template_category(self, test_client, sample_template_data):
        """Test updating template category."""
        create_response = test_client.post(
            "/api/v1/task-templates/", json=sample_template_data.model_dump()
        )
        template_id = create_response.json()["template_id"]

        update_data = {"category": "Personal"}
        response = test_client.put(f"/api/v1/task-templates/{template_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["category"] == "Personal"

    def test_update_template_not_found(self, test_client):
        """Test 404 when updating non-existent template."""
        fake_id = str(uuid4())
        update_data = {"name": "New Name"}
        response = test_client.put(f"/api/v1/task-templates/{fake_id}", json=update_data)
        assert response.status_code == 404

    def test_delete_template(self, test_client, sample_template_data):
        """Test deleting a template."""
        create_response = test_client.post(
            "/api/v1/task-templates/", json=sample_template_data.model_dump()
        )
        template_id = create_response.json()["template_id"]

        response = test_client.delete(f"/api/v1/task-templates/{template_id}")
        assert response.status_code == 204

        # Verify deletion
        get_response = test_client.get(f"/api/v1/task-templates/{template_id}")
        assert get_response.status_code == 404

    def test_delete_template_not_found(self, test_client):
        """Test 404 when deleting non-existent template."""
        fake_id = str(uuid4())
        response = test_client.delete(f"/api/v1/task-templates/{fake_id}")
        assert response.status_code == 404

    def test_template_steps_ordered_correctly(self, test_client, sample_template_data):
        """Test that template steps are returned in correct order."""
        create_response = test_client.post(
            "/api/v1/task-templates/", json=sample_template_data.model_dump()
        )
        template_id = create_response.json()["template_id"]

        response = test_client.get(f"/api/v1/task-templates/{template_id}")
        steps = response.json()["steps"]

        # Verify ordering
        for i, step in enumerate(steps):
            assert step["step_order"] == i + 1

        # Verify expected labels in order
        assert steps[0]["short_label"] == "Research"
        assert steps[1]["short_label"] == "Draft"
        assert steps[2]["short_label"] == "Revise"
        assert steps[3]["short_label"] == "Submit"
