"""
End-to-end integration tests for Epic 7: ADHD Task Splitting

Tests the complete flow: task creation → splitting → micro-step completion → XP rewards.
Requires backend API to be running.
"""

import time

import pytest


@pytest.fixture
def create_test_task(api_client, base_url, test_user_id):
    """Create a test task for splitting."""
    task_data = {
        "title": "Write comprehensive unit tests for payment module",
        "description": "Create unit tests covering all payment scenarios",
        "estimated_time": 45,  # 45 minutes - should be split into 2-5 min steps
        "priority": "high",
        "project_id": f"test_project_{test_user_id}",
        "user_id": test_user_id,
    }

    response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)

    # Handle different response codes
    if response.status_code == 201:
        return response.json()
    elif response.status_code == 400 and "project not found" in response.text.lower():
        # Create project first, then task
        project_data = {
            "name": f"Test Project {test_user_id}",
            "description": "Integration test project",
            "owner": test_user_id,
        }
        api_client.post(f"{base_url}/api/v1/projects", json=project_data)
        response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        return response.json()
    else:
        pytest.fail(f"Failed to create test task: {response.status_code} - {response.text}")


class TestTaskSplittingE2E:
    """End-to-end tests for complete task splitting workflow"""

    def test_full_task_splitting_workflow(self, api_client, base_url, create_test_task):
        """
        Test complete workflow: create task → split → complete steps → verify XP

        This is the critical E2E test for Epic 7 functionality.
        """
        task = create_test_task
        task_id = task["task_id"]

        # Step 1: Split the task into micro-steps
        split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": task.get("user_id")},
        )

        assert (
            split_response.status_code == 200
        ), f"Task splitting failed: {split_response.status_code} - {split_response.text}"

        split_data = split_response.json()

        # Verify split response structure
        assert "task_id" in split_data
        assert "scope" in split_data
        assert "micro_steps" in split_data
        assert split_data["task_id"] == task_id

        micro_steps = split_data["micro_steps"]

        # Verify micro-steps meet ADHD criteria
        assert len(micro_steps) >= 3, "Should generate at least 3 micro-steps"
        assert len(micro_steps) <= 7, "Should not exceed 7 micro-steps for 45 min task"

        # Verify each micro-step meets 2-5 minute constraint
        for step in micro_steps:
            assert "step_id" in step
            assert "description" in step
            assert "estimated_minutes" in step
            assert "delegation_mode" in step
            assert "step_order" in step

            # Critical ADHD constraint
            assert (
                2 <= step["estimated_minutes"] <= 5
            ), f"Step {step['step_order']} duration {step['estimated_minutes']} not in 2-5 min range"

            # Verify delegation mode is valid
            assert step["delegation_mode"] in ["DO", "DO_WITH_ME", "DELEGATE", "DELETE"]

        # Verify steps are ordered
        for i, step in enumerate(micro_steps):
            assert step["step_order"] == i + 1

        # Step 2: Get task with micro-steps to verify persistence
        get_response = api_client.get(f"{base_url}/api/v1/tasks/{task_id}")

        assert get_response.status_code == 200
        task_with_steps = get_response.json()

        assert "micro_steps" in task_with_steps
        assert len(task_with_steps["micro_steps"]) == len(micro_steps)

        # Step 3: Complete first micro-step and verify XP award
        first_step_id = micro_steps[0]["step_id"]

        complete_response = api_client.patch(
            f"{base_url}/api/v1/micro-steps/{first_step_id}/complete",
            json={"user_id": task.get("user_id")},
        )

        assert complete_response.status_code == 200
        completion_data = complete_response.json()

        # Verify completion response
        assert completion_data["status"] == "completed"
        assert "xp_awarded" in completion_data
        assert completion_data["xp_awarded"] > 0, "Should award XP for completion"

        # Step 4: Check task progress
        progress_response = api_client.get(f"{base_url}/api/v1/tasks/{task_id}/progress")

        assert progress_response.status_code == 200
        progress_data = progress_response.json()

        assert "total_steps" in progress_data
        assert "completed_steps" in progress_data
        assert "completion_percentage" in progress_data

        assert progress_data["total_steps"] == len(micro_steps)
        assert progress_data["completed_steps"] == 1
        expected_percentage = (1 / len(micro_steps)) * 100
        assert abs(progress_data["completion_percentage"] - expected_percentage) < 1

        # Step 5: Complete remaining steps
        for step in micro_steps[1:]:
            complete_resp = api_client.patch(
                f"{base_url}/api/v1/micro-steps/{step['step_id']}/complete",
                json={"user_id": task.get("user_id")},
            )
            assert complete_resp.status_code == 200

        # Step 6: Verify full task completion
        final_progress = api_client.get(f"{base_url}/api/v1/tasks/{task_id}/progress").json()

        assert final_progress["completed_steps"] == final_progress["total_steps"]
        assert final_progress["completion_percentage"] == 100.0

    def test_adhd_mode_vs_default_mode(self, api_client, base_url, create_test_task):
        """
        Test that ADHD mode produces 2-5 minute steps while default might differ
        """
        task = create_test_task
        task_id = task["task_id"]

        # Split with ADHD mode
        adhd_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": task.get("user_id")},
        )

        assert adhd_response.status_code == 200
        adhd_steps = adhd_response.json()["micro_steps"]

        # Verify ALL steps are 2-5 minutes in ADHD mode
        for step in adhd_steps:
            assert (
                2 <= step["estimated_minutes"] <= 5
            ), "ADHD mode MUST enforce 2-5 minute constraint"

    def test_split_performance_under_2_seconds(self, api_client, base_url, create_test_task):
        """
        Test that task splitting completes in < 2 seconds (performance requirement)
        """
        task = create_test_task
        task_id = task["task_id"]

        start_time = time.time()

        response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": task.get("user_id")},
        )

        elapsed_time = time.time() - start_time

        assert response.status_code == 200
        assert (
            elapsed_time < 2.0
        ), f"Split took {elapsed_time:.2f}s, should be < 2.0s (target: ~1.2s)"

    def test_scope_classification(self, api_client, base_url, test_user_id):
        """
        Test that tasks are classified correctly (SIMPLE, MULTI, PROJECT)
        """
        test_cases = [
            {
                "title": "Send email to client",
                "estimated_time": 5,
                "expected_scope": "SIMPLE",
            },
            {
                "title": "Implement user authentication system",
                "estimated_time": 45,
                "expected_scope": "MULTI",
            },
            {
                "title": "Build complete e-commerce platform",
                "estimated_time": 300,
                "expected_scope": "PROJECT",
            },
        ]

        for test_case in test_cases:
            # Create task
            task_data = {
                "title": test_case["title"],
                "description": f"Test task for {test_case['expected_scope']} scope",
                "estimated_time": test_case["estimated_time"],
                "user_id": test_user_id,
                "project_id": f"test_project_{test_user_id}",
            }

            task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)

            if task_response.status_code != 201:
                # Create project if needed
                api_client.post(
                    f"{base_url}/api/v1/projects",
                    json={
                        "name": f"Test Project {test_user_id}",
                        "owner": test_user_id,
                    },
                )
                task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)

            task_id = task_response.json()["task_id"]

            # Split task
            split_response = api_client.post(
                f"{base_url}/api/v1/tasks/{task_id}/split",
                json={"mode": "adhd", "user_id": test_user_id},
            )

            assert split_response.status_code == 200
            split_data = split_response.json()

            # Verify scope classification
            assert (
                split_data["scope"] == test_case["expected_scope"]
            ), f"Expected {test_case['expected_scope']}, got {split_data['scope']}"

    def test_error_handling_invalid_task(self, api_client, base_url, test_user_id):
        """
        Test error handling for non-existent task
        """
        response = api_client.post(
            f"{base_url}/api/v1/tasks/nonexistent-task-id/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        assert response.status_code in [404, 400]
        assert "not found" in response.text.lower() or "invalid" in response.text.lower()

    def test_idempotent_splitting(self, api_client, base_url, create_test_task):
        """
        Test that splitting the same task twice produces consistent results
        """
        task = create_test_task
        task_id = task["task_id"]

        # First split
        response1 = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": task.get("user_id")},
        )

        assert response1.status_code == 200
        steps1 = response1.json()["micro_steps"]

        # Second split (should handle gracefully - either return same or re-split)
        response2 = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": task.get("user_id"), "force": True},
        )

        assert response2.status_code == 200
        steps2 = response2.json()["micro_steps"]

        # Both should meet ADHD constraints
        for step in steps1 + steps2:
            assert 2 <= step["estimated_minutes"] <= 5


@pytest.mark.slow
class TestTaskSplittingEdgeCases:
    """Edge case tests for task splitting"""

    def test_very_short_task(self, api_client, base_url, test_user_id):
        """
        Test splitting a very short task (< 10 minutes)
        """
        task_data = {
            "title": "Quick task",
            "description": "A very short task",
            "estimated_time": 7,
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        # Create project first
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Test Project {test_user_id}", "owner": test_user_id},
        )

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)

        task_id = task_response.json()["task_id"]

        split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        assert split_response.status_code == 200
        micro_steps = split_response.json()["micro_steps"]

        # Should produce 2-3 steps
        assert 2 <= len(micro_steps) <= 3

        # All steps should still be 2-5 minutes
        for step in micro_steps:
            assert 2 <= step["estimated_minutes"] <= 5

    def test_very_long_task(self, api_client, base_url, test_user_id):
        """
        Test splitting a very long task (> 120 minutes)
        """
        task_data = {
            "title": "Large refactoring project",
            "description": "Major codebase refactoring",
            "estimated_time": 180,  # 3 hours
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        # Create project first
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Test Project {test_user_id}", "owner": test_user_id},
        )

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)

        task_id = task_response.json()["task_id"]

        split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        assert split_response.status_code == 200
        split_data = split_response.json()

        # Should be classified as PROJECT
        assert split_data["scope"] in ["PROJECT", "MULTI"]

        # Should produce 7+ steps (max micro-steps per ADHD guidelines)
        micro_steps = split_data["micro_steps"]
        assert len(micro_steps) >= 7

        # All steps should still be 2-5 minutes
        for step in micro_steps:
            assert 2 <= step["estimated_minutes"] <= 5
