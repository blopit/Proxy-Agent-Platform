"""
Test simple CLI functionality without external dependencies.

This file focuses on testing CLI logic without requiring the backend to be running.
"""

import pytest
from unittest.mock import Mock, patch, call
import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import simple_cli


class TestAPIRequestFunction:
    """Test the api_request helper function."""

    @patch('simple_cli.requests.get')
    def test_successful_get_request(self, mock_get):
        """Test successful GET request."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"success": True, "data": "test"}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        # Act
        result = simple_cli.api_request("GET", "/test")

        # Assert
        assert result == {"success": True, "data": "test"}
        mock_get.assert_called_once_with(f"{simple_cli.API_URL}/test")
        mock_response.raise_for_status.assert_called_once()

    @patch('simple_cli.requests.post')
    def test_successful_post_request(self, mock_post):
        """Test successful POST request with data."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"id": 1, "created": True}
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        test_data = {"title": "Test", "description": "Test description"}

        # Act
        result = simple_cli.api_request("POST", "/create", test_data)

        # Assert
        assert result == {"id": 1, "created": True}
        mock_post.assert_called_once_with(f"{simple_cli.API_URL}/create", json=test_data)

    @patch('simple_cli.requests.patch')
    def test_successful_patch_request(self, mock_patch):
        """Test successful PATCH request."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"updated": True}
        mock_response.raise_for_status.return_value = None
        mock_patch.return_value = mock_response

        # Act
        result = simple_cli.api_request("PATCH", "/update")

        # Assert
        assert result == {"updated": True}

    @patch('simple_cli.requests.get')
    def test_request_exception_handling(self, mock_get):
        """Test API request handles exceptions."""
        # Arrange
        import requests
        mock_get.side_effect = requests.RequestException("Connection failed")

        # Act
        with patch('builtins.print') as mock_print:
            result = simple_cli.api_request("GET", "/test")

        # Assert
        assert result is None
        mock_print.assert_called_with("API Error: Connection failed")

    @patch('simple_cli.requests.get')
    def test_http_error_handling(self, mock_get):
        """Test API request handles HTTP errors."""
        # Arrange
        import requests
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("404 Not Found")
        mock_get.return_value = mock_response

        # Act
        with patch('builtins.print') as mock_print:
            result = simple_cli.api_request("GET", "/test")

        # Assert
        assert result is None
        mock_print.assert_called_with("API Error: 404 Not Found")


class TestCreateTaskFunction:
    """Test the create_task function."""

    @patch('simple_cli.api_request')
    def test_create_task_success(self, mock_api_request):
        """Test successful task creation."""
        # Arrange
        mock_api_request.return_value = {
            "id": 1,
            "title": "Test Task",
            "xp_reward": 50
        }

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.create_task("Test Task", "Test description")

        # Assert
        expected_data = {
            "title": "Test Task",
            "description": "Test description",
            "priority": "medium"
        }
        mock_api_request.assert_called_once_with(
            "POST", f"/api/tasks/?user_id={simple_cli.USER_ID}", expected_data
        )
        mock_print.assert_any_call("✅ Created task: Test Task (ID: 1)")
        mock_print.assert_any_call("   XP Reward: 50")

    @patch('simple_cli.api_request')
    def test_create_task_failure(self, mock_api_request):
        """Test task creation failure."""
        # Arrange
        mock_api_request.return_value = None

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.create_task("Test Task")

        # Assert
        mock_print.assert_called_with("❌ Failed to create task")

    @patch('simple_cli.api_request')
    def test_create_task_with_empty_description(self, mock_api_request):
        """Test task creation with empty description."""
        # Arrange
        mock_api_request.return_value = {"id": 2, "title": "No Desc Task", "xp_reward": 40}

        # Act
        simple_cli.create_task("No Desc Task", "")

        # Assert
        expected_data = {
            "title": "No Desc Task",
            "description": "",
            "priority": "medium"
        }
        mock_api_request.assert_called_once_with(
            "POST", f"/api/tasks/?user_id={simple_cli.USER_ID}", expected_data
        )


class TestListTasksFunction:
    """Test the list_tasks function."""

    @patch('simple_cli.api_request')
    def test_list_tasks_success(self, mock_api_request):
        """Test successful task listing."""
        # Arrange
        mock_api_request.return_value = [
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

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.list_tasks()

        # Assert
        mock_api_request.assert_called_once_with("GET", f"/api/tasks/?user_id={simple_cli.USER_ID}")

        expected_calls = [
            call("\n📋 Your Tasks (2 total):"),
            call("-" * 50),
            call("⏳ [1] Task 1"),
            call("    Status: pending | Priority: high | XP: 75"),
            call("✅ [2] Task 2"),
            call("    Status: completed | Priority: medium | XP: 50")
        ]

        mock_print.assert_has_calls(expected_calls)

    @patch('simple_cli.api_request')
    def test_list_tasks_empty(self, mock_api_request):
        """Test listing when no tasks exist (empty list is falsy)."""
        # Arrange
        mock_api_request.return_value = []

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.list_tasks()

        # Assert - empty list is falsy, so goes to failure case
        mock_print.assert_called_with("❌ Failed to fetch tasks")

    @patch('simple_cli.api_request')
    def test_list_tasks_failure(self, mock_api_request):
        """Test task listing failure."""
        # Arrange
        mock_api_request.return_value = None

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.list_tasks()

        # Assert
        mock_print.assert_called_with("❌ Failed to fetch tasks")


class TestCompleteTaskFunction:
    """Test the complete_task function."""

    @patch('simple_cli.api_request')
    def test_complete_task_success(self, mock_api_request):
        """Test successful task completion."""
        # Arrange
        mock_api_request.return_value = {
            "message": "Task completed successfully",
            "task": {"xp_reward": 50}
        }

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.complete_task(1)

        # Assert
        expected_url = f"/api/tasks/1/status?status=completed&user_id={simple_cli.USER_ID}"
        mock_api_request.assert_called_once_with("PATCH", expected_url)

        mock_print.assert_any_call("🎉 Task completed successfully")
        mock_print.assert_any_call("   XP Earned: +50")

    @patch('simple_cli.api_request')
    def test_complete_task_failure(self, mock_api_request):
        """Test task completion failure."""
        # Arrange
        mock_api_request.return_value = None

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.complete_task(1)

        # Assert
        mock_print.assert_called_with("❌ Failed to complete task")


class TestAgentStatusFunction:
    """Test the agent_status function."""

    @patch('simple_cli.api_request')
    def test_agent_status_success(self, mock_api_request):
        """Test successful agent status retrieval."""
        # Arrange
        mock_api_request.return_value = {
            "status": "active",
            "active_agents": 2,
            "agents": {
                "task": {
                    "status": "active",
                    "model": "gpt-4"
                },
                "focus": {
                    "status": "idle",
                    "model": "gpt-4"
                }
            }
        }

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.agent_status()

        # Assert
        mock_api_request.assert_called_once_with("GET", "/api/agents/status")

        expected_calls = [
            call("\n🤖 Agent Status: active"),
            call("   Active Agents: 2"),
            call("\n   Task Agent:"),
            call("      Status: active"),
            call("      Model: gpt-4"),
            call("\n   Focus Agent:"),
            call("      Status: idle"),
            call("      Model: gpt-4")
        ]

        mock_print.assert_has_calls(expected_calls)

    @patch('simple_cli.api_request')
    def test_agent_status_failure(self, mock_api_request):
        """Test agent status failure."""
        # Arrange
        mock_api_request.return_value = None

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.agent_status()

        # Assert
        mock_print.assert_called_with("❌ Failed to get agent status")


class TestHealthCheckFunction:
    """Test the health_check function."""

    @patch('simple_cli.api_request')
    def test_health_check_success(self, mock_api_request):
        """Test successful health check."""
        # Arrange
        mock_api_request.return_value = {"status": "healthy"}

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.health_check()

        # Assert
        mock_api_request.assert_called_once_with("GET", "/health")
        mock_print.assert_called_with("✅ API Health: healthy")

    @patch('simple_cli.api_request')
    def test_health_check_failure(self, mock_api_request):
        """Test health check failure."""
        # Arrange
        mock_api_request.return_value = None

        # Act
        with patch('builtins.print') as mock_print:
            simple_cli.health_check()

        # Assert
        mock_print.assert_called_with("❌ API is not responding")


class TestShowHelpFunction:
    """Test the show_help function."""

    def test_show_help_content(self):
        """Test help function shows expected content."""
        with patch('builtins.print') as mock_print:
            simple_cli.show_help()

        # Get all printed content
        help_output = ' '.join([str(call) for call in mock_print.call_args_list])

        # Check for key commands
        assert "create" in help_output
        assert "list" in help_output
        assert "complete" in help_output
        assert "status" in help_output
        assert "health" in help_output
        assert "help" in help_output

        # Check for examples
        assert "simple_cli.py" in help_output


class TestMainFunction:
    """Test the main function and command parsing."""

    @patch('simple_cli.create_task')
    def test_main_create_command(self, mock_create_task):
        """Test main function handles create command."""
        test_args = ['simple_cli.py', 'create', 'Test Task', 'Test description']

        with patch('sys.argv', test_args):
            simple_cli.main()

        mock_create_task.assert_called_once_with('Test Task', 'Test description')

    @patch('simple_cli.create_task')
    def test_main_create_without_description(self, mock_create_task):
        """Test main function handles create command without description."""
        test_args = ['simple_cli.py', 'create', 'Task Only']

        with patch('sys.argv', test_args):
            simple_cli.main()

        mock_create_task.assert_called_once_with('Task Only', '')

    @patch('simple_cli.list_tasks')
    def test_main_list_command(self, mock_list_tasks):
        """Test main function handles list command."""
        test_args = ['simple_cli.py', 'list']

        with patch('sys.argv', test_args):
            simple_cli.main()

        mock_list_tasks.assert_called_once()

    @patch('simple_cli.complete_task')
    def test_main_complete_command(self, mock_complete_task):
        """Test main function handles complete command."""
        test_args = ['simple_cli.py', 'complete', '42']

        with patch('sys.argv', test_args):
            simple_cli.main()

        mock_complete_task.assert_called_once_with(42)

    @patch('simple_cli.agent_status')
    def test_main_status_command(self, mock_agent_status):
        """Test main function handles status command."""
        test_args = ['simple_cli.py', 'status']

        with patch('sys.argv', test_args):
            simple_cli.main()

        mock_agent_status.assert_called_once()

    @patch('simple_cli.health_check')
    def test_main_health_command(self, mock_health_check):
        """Test main function handles health command."""
        test_args = ['simple_cli.py', 'health']

        with patch('sys.argv', test_args):
            simple_cli.main()

        mock_health_check.assert_called_once()

    @patch('simple_cli.show_help')
    def test_main_help_command(self, mock_show_help):
        """Test main function handles help command."""
        test_args = ['simple_cli.py', 'help']

        with patch('sys.argv', test_args):
            simple_cli.main()

        mock_show_help.assert_called_once()

    def test_main_invalid_task_id(self):
        """Test main function handles invalid task ID."""
        test_args = ['simple_cli.py', 'complete', 'not_a_number']

        with patch('sys.argv', test_args), patch('builtins.print') as mock_print:
            simple_cli.main()

        mock_print.assert_called_with("❌ Task ID must be a number")

    @patch('simple_cli.show_help')
    def test_main_unknown_command(self, mock_show_help):
        """Test main function handles unknown command."""
        test_args = ['simple_cli.py', 'unknown']

        with patch('sys.argv', test_args), patch('builtins.print') as mock_print:
            simple_cli.main()

        mock_print.assert_called_with("❌ Unknown command: unknown")
        mock_show_help.assert_called_once()

    @patch('simple_cli.show_help')
    def test_main_no_arguments(self, mock_show_help):
        """Test main function shows help when no arguments."""
        test_args = ['simple_cli.py']

        with patch('sys.argv', test_args):
            simple_cli.main()

        mock_show_help.assert_called_once()

    def test_main_missing_task_title(self):
        """Test main function handles missing task title."""
        test_args = ['simple_cli.py', 'create']

        with patch('sys.argv', test_args), patch('builtins.print') as mock_print:
            simple_cli.main()

        mock_print.assert_called_with("❌ Usage: create <title> [description]")

    def test_main_missing_task_id_for_complete(self):
        """Test main function handles missing task ID for complete."""
        test_args = ['simple_cli.py', 'complete']

        with patch('sys.argv', test_args), patch('builtins.print') as mock_print:
            simple_cli.main()

        mock_print.assert_called_with("❌ Usage: complete <task_id>")


class TestConfigurationConstants:
    """Test configuration constants."""

    def test_api_url_configuration(self):
        """Test API URL is properly configured."""
        assert simple_cli.API_URL == "http://localhost:8000"

    def test_user_id_configuration(self):
        """Test default user ID is set."""
        assert simple_cli.USER_ID == 1

    def test_constants_are_strings_and_ints(self):
        """Test constants are correct types."""
        assert isinstance(simple_cli.API_URL, str)
        assert isinstance(simple_cli.USER_ID, int)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])