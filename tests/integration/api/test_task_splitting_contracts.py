"""
Contract tests for Epic 7: ADHD Task Splitting API

Validates that API responses conform to expected schemas.
Critical for frontend integration reliability.
"""

from typing import Any


def validate_micro_step_schema(step: dict[str, Any]) -> None:
    """
    Validate a single micro-step matches expected schema.

    Required for mobile frontend TypeScript types to work correctly.
    """
    required_fields = [
        "step_id",
        "description",
        "estimated_minutes",
        "delegation_mode",
        "step_order",
    ]

    for field in required_fields:
        assert field in step, f"Missing required field: {field}"

    # Type validations
    assert isinstance(step["step_id"], str), "step_id must be string"
    assert isinstance(step["description"], str), "description must be string"
    assert isinstance(step["estimated_minutes"], int), "estimated_minutes must be int"
    assert isinstance(step["delegation_mode"], str), "delegation_mode must be string"
    assert isinstance(step["step_order"], int), "step_order must be int"

    # Value validations
    assert len(step["description"]) > 0, "description cannot be empty"
    assert (
        2 <= step["estimated_minutes"] <= 5
    ), f"estimated_minutes must be 2-5, got {step['estimated_minutes']}"
    assert step["delegation_mode"] in [
        "DO",
        "DO_WITH_ME",
        "DELEGATE",
        "DELETE",
    ], f"Invalid delegation_mode: {step['delegation_mode']}"
    assert step["step_order"] > 0, "step_order must be positive"


def validate_split_response_schema(response_data: dict[str, Any]) -> None:
    """
    Validate split task response schema.

    Contract: POST /api/v1/tasks/{id}/split
    """
    required_fields = ["task_id", "scope", "micro_steps"]

    for field in required_fields:
        assert field in response_data, f"Missing required field: {field}"

    # Type validations
    assert isinstance(response_data["task_id"], str)
    assert isinstance(response_data["scope"], str)
    assert isinstance(response_data["micro_steps"], list)

    # Value validations
    assert response_data["scope"] in [
        "SIMPLE",
        "MULTI",
        "PROJECT",
    ], f"Invalid scope: {response_data['scope']}"
    assert len(response_data["micro_steps"]) >= 1, "Must have at least 1 micro-step"

    # Validate each micro-step
    for step in response_data["micro_steps"]:
        validate_micro_step_schema(step)


def validate_task_with_steps_schema(task_data: dict[str, Any]) -> None:
    """
    Validate task with micro-steps response schema.

    Contract: GET /api/v1/tasks/{id}
    """
    required_task_fields = [
        "task_id",
        "title",
        "description",
        "status",
    ]

    for field in required_task_fields:
        assert field in task_data, f"Missing required field: {field}"

    # If task has been split, it should have micro_steps
    if "micro_steps" in task_data:
        assert isinstance(task_data["micro_steps"], list)
        for step in task_data["micro_steps"]:
            validate_micro_step_schema(step)


def validate_completion_response_schema(response_data: dict[str, Any]) -> None:
    """
    Validate micro-step completion response schema.

    Contract: PATCH /api/v1/micro-steps/{id}/complete
    """
    required_fields = ["status", "completed_at", "xp_awarded"]

    for field in required_fields:
        assert field in response_data, f"Missing required field: {field}"

    # Type validations
    assert isinstance(response_data["status"], str)
    assert isinstance(response_data["xp_awarded"], int | float)

    # Value validations
    assert response_data["status"] == "completed"
    assert response_data["xp_awarded"] > 0, "Should award XP on completion"


def validate_progress_response_schema(response_data: dict[str, Any]) -> None:
    """
    Validate task progress response schema.

    Contract: GET /api/v1/tasks/{id}/progress
    """
    required_fields = [
        "total_steps",
        "completed_steps",
        "completion_percentage",
    ]

    for field in required_fields:
        assert field in response_data, f"Missing required field: {field}"

    # Type validations
    assert isinstance(response_data["total_steps"], int)
    assert isinstance(response_data["completed_steps"], int)
    assert isinstance(response_data["completion_percentage"], int | float)

    # Value validations
    assert response_data["total_steps"] >= 0
    assert response_data["completed_steps"] >= 0
    assert response_data["completed_steps"] <= response_data["total_steps"]
    assert 0 <= response_data["completion_percentage"] <= 100


class TestTaskSplittingContracts:
    """Contract tests for task splitting API endpoints"""

    def test_split_task_response_contract(self, api_client, base_url, test_user_id):
        """
        Verify POST /api/v1/tasks/{id}/split returns correct schema
        """
        # Setup: Create a task
        project_data = {
            "name": f"Contract Test Project {test_user_id}",
            "owner": test_user_id,
        }
        api_client.post(f"{base_url}/api/v1/projects", json=project_data)

        task_data = {
            "title": "Contract test task",
            "description": "Testing API contract compliance",
            "estimated_time": 30,
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        task_id = task_response.json()["task_id"]

        # Test: Split task
        split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        assert split_response.status_code == 200

        # Validate contract
        response_data = split_response.json()
        validate_split_response_schema(response_data)

    def test_get_task_with_steps_contract(self, api_client, base_url, test_user_id):
        """
        Verify GET /api/v1/tasks/{id} returns correct schema after splitting
        """
        # Setup: Create and split a task
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Contract Test {test_user_id}", "owner": test_user_id},
        )

        task_data = {
            "title": "Get task contract test",
            "description": "Testing GET endpoint contract",
            "estimated_time": 25,
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        task_id = task_response.json()["task_id"]

        # Split task
        api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        # Test: Get task with steps
        get_response = api_client.get(f"{base_url}/api/v1/tasks/{task_id}")

        assert get_response.status_code == 200

        # Validate contract
        task_data = get_response.json()
        validate_task_with_steps_schema(task_data)

    def test_complete_micro_step_contract(self, api_client, base_url, test_user_id):
        """
        Verify PATCH /api/v1/micro-steps/{id}/complete returns correct schema
        """
        # Setup: Create, split task, get first step
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Contract Test {test_user_id}", "owner": test_user_id},
        )

        task_data = {
            "title": "Completion contract test",
            "description": "Testing completion endpoint contract",
            "estimated_time": 20,
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        task_id = task_response.json()["task_id"]

        split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        first_step_id = split_response.json()["micro_steps"][0]["step_id"]

        # Test: Complete micro-step
        complete_response = api_client.patch(
            f"{base_url}/api/v1/micro-steps/{first_step_id}/complete",
            json={"user_id": test_user_id},
        )

        assert complete_response.status_code == 200

        # Validate contract
        response_data = complete_response.json()
        validate_completion_response_schema(response_data)

    def test_get_task_progress_contract(self, api_client, base_url, test_user_id):
        """
        Verify GET /api/v1/tasks/{id}/progress returns correct schema
        """
        # Setup: Create and split a task
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Contract Test {test_user_id}", "owner": test_user_id},
        )

        task_data = {
            "title": "Progress contract test",
            "description": "Testing progress endpoint contract",
            "estimated_time": 20,
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        task_id = task_response.json()["task_id"]

        api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        # Test: Get progress
        progress_response = api_client.get(f"{base_url}/api/v1/tasks/{task_id}/progress")

        assert progress_response.status_code == 200

        # Validate contract
        response_data = progress_response.json()
        validate_progress_response_schema(response_data)

    def test_error_response_contract(self, api_client, base_url, test_user_id):
        """
        Verify error responses follow consistent schema
        """
        # Test with non-existent task
        error_response = api_client.post(
            f"{base_url}/api/v1/tasks/nonexistent-id/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        assert error_response.status_code in [400, 404]

        # Error responses should have "detail" field
        error_data = error_response.json()
        assert "detail" in error_data, "Error responses must have 'detail' field"
        assert isinstance(error_data["detail"], str)

    def test_micro_step_ordering_contract(self, api_client, base_url, test_user_id):
        """
        Verify micro-steps are always returned in correct order
        """
        # Setup
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Order Test {test_user_id}", "owner": test_user_id},
        )

        task_data = {
            "title": "Order test task",
            "description": "Testing step ordering",
            "estimated_time": 35,
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        task_id = task_response.json()["task_id"]

        split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        micro_steps = split_response.json()["micro_steps"]

        # Verify ordering is sequential
        for i, step in enumerate(micro_steps):
            assert (
                step["step_order"] == i + 1
            ), f"Step order should be {i + 1}, got {step['step_order']}"

    def test_delegation_mode_values_contract(self, api_client, base_url, test_user_id):
        """
        Verify delegation modes only use allowed values
        """
        # Setup
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Delegation Test {test_user_id}", "owner": test_user_id},
        )

        task_data = {
            "title": "Delegation mode test",
            "description": "Testing delegation mode values",
            "estimated_time": 30,
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        task_id = task_response.json()["task_id"]

        split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        micro_steps = split_response.json()["micro_steps"]

        # Verify each delegation mode is valid
        valid_modes = {"DO", "DO_WITH_ME", "DELEGATE", "DELETE"}
        for step in micro_steps:
            assert (
                step["delegation_mode"] in valid_modes
            ), f"Invalid delegation mode: {step['delegation_mode']}"

    def test_time_constraint_contract(self, api_client, base_url, test_user_id):
        """
        Verify ALL micro-steps strictly adhere to 2-5 minute constraint
        """
        # Setup
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Time Test {test_user_id}", "owner": test_user_id},
        )

        # Test with various task sizes
        test_times = [10, 25, 45, 60, 90]

        for estimated_time in test_times:
            task_data = {
                "title": f"Time test {estimated_time} min",
                "description": "Testing time constraints",
                "estimated_time": estimated_time,
                "user_id": test_user_id,
                "project_id": f"test_project_{test_user_id}",
            }

            task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
            task_id = task_response.json()["task_id"]

            split_response = api_client.post(
                f"{base_url}/api/v1/tasks/{task_id}/split",
                json={"mode": "adhd", "user_id": test_user_id},
            )

            micro_steps = split_response.json()["micro_steps"]

            # CRITICAL CONTRACT: Every single micro-step must be 2-5 minutes
            for step in micro_steps:
                assert 2 <= step["estimated_minutes"] <= 5, (
                    f"Contract violation: step duration {step['estimated_minutes']} "
                    f"outside 2-5 min range (task: {estimated_time} min)"
                )


class TestMobileFrontendContract:
    """
    Contract tests specifically for mobile frontend integration

    These tests ensure TypeScript types in mobile app will work correctly.
    """

    def test_mobile_split_flow_contract(self, api_client, base_url, test_user_id):
        """
        Test exact flow mobile app uses: create → split → display
        """
        # Mobile creates project
        project_response = api_client.post(
            f"{base_url}/api/v1/projects",
            json={
                "name": "Mobile Test Project",
                "description": "Created from mobile app",
                "owner": test_user_id,
            },
        )

        # Mobile creates task
        task_response = api_client.post(
            f"{base_url}/api/v1/tasks",
            json={
                "title": "Write tests for payment",
                "description": "Mobile-created task",
                "estimated_time": 30,
                "priority": "high",
                "project_id": project_response.json()["project_id"],
                "user_id": test_user_id,
            },
        )

        task_id = task_response.json()["task_id"]

        # Mobile calls split
        split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        # Validate mobile can parse response
        validate_split_response_schema(split_response.json())

        # Mobile displays steps - verify all required fields present
        steps = split_response.json()["micro_steps"]
        for step in steps:
            # These fields are required by TaskBreakdownModal.tsx
            assert "step_id" in step
            assert "description" in step
            assert "estimated_minutes" in step
            assert "delegation_mode" in step
            assert "step_order" in step

    def test_mobile_auto_split_contract(self, api_client, base_url, test_user_id):
        """
        Test contract for mobile auto-split (useAutoSplit hook)
        """
        # Setup project
        api_client.post(
            f"{base_url}/api/v1/projects", json={"name": "Auto Split Test", "owner": test_user_id}
        )

        # Mobile creates task with estimated_time > threshold (5 min)
        task_data = {
            "title": "Task to auto-split",
            "description": "Should trigger auto-split",
            "estimated_time": 25,  # > 5 min threshold
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        task_id = task_response.json()["task_id"]

        # Mobile auto-split hook calls split API
        auto_split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        # Validate response for mobile hook
        assert auto_split_response.status_code == 200
        validate_split_response_schema(auto_split_response.json())
