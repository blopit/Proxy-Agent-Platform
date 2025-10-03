"""
TDD tests for CLI functionality.

This module tests the CLI interface using test-driven development.
"""

import os
import sys
from unittest.mock import Mock, patch

import pytest

# Add the project root to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import simple_cli


class TestSimpleCLI:
    """TDD tests for the simple CLI."""

    @patch('simple_cli.requests.get')
    def test_health_check_success(self, mock_get):
        """
        Test: Should successfully check API health.

        This test drives health check implementation.
        """
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"status": "healthy"}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.health_check()

        # Assert
        mock_get.assert_called_once_with(f"{simple_cli.API_URL}/health")
        mock_print.assert_called_with("✅ API Health: healthy")

    @patch('simple_cli.requests.get')
    def test_health_check_failure(self, mock_get):
        """
        Test: Should handle API health check failure.

        This test drives error handling in health check.
        """
        # Arrange
        mock_get.side_effect = Exception("Connection failed")

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.health_check()

        # Assert
        mock_print.assert_called_with("❌ API is not responding")

    @patch('simple_cli.requests.post')
    def test_create_task_success(self, mock_post):
        """
        Test: Should successfully create a task via API.

        This test drives task creation functionality.
        """
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {
            "id": 1,
            "title": "Test Task",
            "xp_reward": 50
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.create_task("Test Task", "Test description")

        # Assert
        expected_data = {
            "title": "Test Task",
            "description": "Test description",
            "priority": "medium"
        }
        mock_post.assert_called_once_with(
            f"{simple_cli.API_URL}/api/tasks/?user_id={simple_cli.USER_ID}",
            json=expected_data
        )
        mock_print.assert_any_call("✅ Created task: Test Task (ID: 1)")

    @patch('simple_cli.requests.get')
    def test_list_tasks_success(self, mock_get):
        """
        Test: Should successfully list tasks.

        This test drives task listing functionality.
        """
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = [
            {
                "id": 1,
                "title": "Task 1",
                "status": "pending",
                "priority": "high",
                "xp_reward": 75
            },
            {
                "id": 2,
                "title": "Task 2",
                "status": "completed",
                "priority": "medium",
                "xp_reward": 50
            }
        ]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.list_tasks()

        # Assert
        mock_get.assert_called_once_with(f"{simple_cli.API_URL}/api/tasks/?user_id={simple_cli.USER_ID}")
        mock_print.assert_any_call("\n📋 Your Tasks (2 total):")
        mock_print.assert_any_call("⏳ [1] Task 1")
        mock_print.assert_any_call("✅ [2] Task 2")

    @patch('simple_cli.requests.patch')
    def test_complete_task_success(self, mock_patch):
        """
        Test: Should successfully complete a task.

        This test drives task completion functionality.
        """
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {
            "message": "Task completed successfully",
            "task": {"xp_reward": 50}
        }
        mock_response.raise_for_status.return_value = None
        mock_patch.return_value = mock_response

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.complete_task(1)

        # Assert
        expected_url = f"{simple_cli.API_URL}/api/tasks/1/status?status=completed&user_id={simple_cli.USER_ID}"
        mock_patch.assert_called_once_with(expected_url)
        mock_print.assert_any_call("🎉 Task completed successfully")
        mock_print.assert_any_call("   XP Earned: +50")

    @patch('simple_cli.requests.get')
    def test_agent_status_success(self, mock_get):
        """
        Test: Should successfully get agent status.

        This test drives agent status functionality.
        """
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": "active",
            "active_agents": 1,
            "agents": {
                "task": {
                    "status": "active",
                    "model": "gpt-4"
                }
            }
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.agent_status()

        # Assert
        mock_get.assert_called_once_with(f"{simple_cli.API_URL}/api/agents/status")
        mock_print.assert_any_call("\n🤖 Agent Status: active")
        mock_print.assert_any_call("   Active Agents: 1")

    def test_show_help(self):
        """
        Test: Should display help information.

        This test drives help functionality.
        """
        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.show_help()

        # Assert
        mock_print.assert_called()
        # Check that help text includes key commands
        help_text = str(mock_print.call_args)
        assert "create" in help_text
        assert "list" in help_text
        assert "complete" in help_text
        assert "status" in help_text

    @patch('simple_cli.create_task')
    def test_main_create_command(self, mock_create):
        """
        Test: Should handle create command from main().

        This test drives command parsing.
        """
        # Arrange
        test_args = ['simple_cli.py', 'create', 'Test Task', 'Test description']

        # Act
        with patch('sys.argv', test_args):
            simple_cli.main()

        # Assert
        mock_create.assert_called_once_with('Test Task', 'Test description')

    @patch('simple_cli.list_tasks')
    def test_main_list_command(self, mock_list):
        """
        Test: Should handle list command from main().

        This test drives command parsing.
        """
        # Arrange
        test_args = ['simple_cli.py', 'list']

        # Act
        with patch('sys.argv', test_args):
            simple_cli.main()

        # Assert
        mock_list.assert_called_once()

    @patch('simple_cli.complete_task')
    def test_main_complete_command(self, mock_complete):
        """
        Test: Should handle complete command from main().

        This test drives command parsing with integer conversion.
        """
        # Arrange
        test_args = ['simple_cli.py', 'complete', '42']

        # Act
        with patch('sys.argv', test_args):
            simple_cli.main()

        # Assert
        mock_complete.assert_called_once_with(42)

    def test_main_invalid_task_id(self):
        """
        Test: Should handle invalid task ID gracefully.

        This test drives input validation.
        """
        # Arrange
        test_args = ['simple_cli.py', 'complete', 'not_a_number']

        # Act
        with patch('sys.argv', test_args), patch('builtins.print') as mock_print:
            simple_cli.main()

        # Assert
        mock_print.assert_called_with("❌ Task ID must be a number")

    def test_main_unknown_command(self):
        """
        Test: Should handle unknown commands gracefully.

        This test drives error handling for invalid commands.
        """
        # Arrange
        test_args = ['simple_cli.py', 'unknown_command']

        # Act
        with patch('sys.argv', test_args), patch('builtins.print') as mock_print:
            simple_cli.main()

        # Assert
        mock_print.assert_any_call("❌ Unknown command: unknown_command")

    def test_main_no_arguments(self):
        """
        Test: Should show help when no arguments provided.

        This test drives default behavior.
        """
        # Arrange
        test_args = ['simple_cli.py']

        # Act
        with patch('sys.argv', test_args), patch('simple_cli.show_help') as mock_help:
            simple_cli.main()

        # Assert
        mock_help.assert_called_once()


class TestAPIRequestHelper:
    """TDD tests for API request helper function."""

    @patch('simple_cli.requests.get')
    def test_api_request_get_success(self, mock_get):
        """
        Test: Should make successful GET request.

        This test drives API request functionality.
        """
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"data": "test"}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        # Act
        result = simple_cli.api_request("GET", "/test")

        # Assert
        assert result == {"data": "test"}
        mock_get.assert_called_once_with(f"{simple_cli.API_URL}/test")

    @patch('simple_cli.requests.post')
    def test_api_request_post_with_data(self, mock_post):
        """
        Test: Should make successful POST request with data.

        This test drives POST request functionality.
        """
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"success": True}
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        test_data = {"key": "value"}

        # Act
        result = simple_cli.api_request("POST", "/test", test_data)

        # Assert
        assert result == {"success": True}
        mock_post.assert_called_once_with(f"{simple_cli.API_URL}/test", json=test_data)

    @patch('simple_cli.requests.get')
    def test_api_request_handles_errors(self, mock_get):
        """
        Test: Should handle API request errors gracefully.

        This test drives error handling in API requests.
        """
        # Arrange
        mock_get.side_effect = Exception("Network error")

        # Act
        with patch('builtins.print') as mock_print:
            result = simple_cli.api_request("GET", "/test")

        # Assert
        assert result is None
        mock_print.assert_called_with("API Error: Network error")


if __name__ == "__main__":
    # Run tests with: python -m pytest tests/test_cli.py -v
    pytest.main([__file__, "-v"])
