"""
Tests for MCP (Model Control Protocol) server implementation
"""

from typing import Any
from unittest.mock import Mock

import pytest

from src.core.task_models import Project, Task, TaskPriority, TaskStatus
from src.mcp.mcp_server import (
    MCPError,
    MCPRequest,
    MCPResponse,
    MCPServer,
    MCPToolRegistry,
    ProjectMCPTools,
    TaskMCPTools,
)


@pytest.fixture
def mock_task_service():
    """Create mock task service"""
    return Mock()


@pytest.fixture
def mcp_server(mock_task_service):
    """Create MCP server instance"""
    return MCPServer(task_service=mock_task_service)


@pytest.fixture
def sample_mcp_request():
    """Create sample MCP request"""
    return MCPRequest(
        jsonrpc="2.0",
        id="test-123",
        method="tasks/create",
        params={
            "title": "Test Task",
            "description": "A test task",
            "project_id": "proj-123",
            "priority": "high",
        },
    )


class TestMCPServer:
    """Test the MCPServer class"""

    def test_server_initialization(self, mcp_server):
        """Test MCP server initialization"""
        assert mcp_server.task_service is not None
        assert mcp_server.tool_registry is not None
        assert len(mcp_server.tool_registry.tools) > 0

    def test_register_tools(self, mcp_server):
        """Test tool registration"""
        initial_count = len(mcp_server.tool_registry.tools)

        # Register a custom tool
        def custom_tool(params: dict[str, Any]) -> dict[str, Any]:
            return {"result": "custom"}

        mcp_server.register_tool("custom_tool", custom_tool, "A custom tool")

        assert len(mcp_server.tool_registry.tools) == initial_count + 1
        assert "custom_tool" in mcp_server.tool_registry.tools

    def test_list_tools(self, mcp_server):
        """Test listing available tools"""
        tools = mcp_server.list_tools()

        assert isinstance(tools, list)
        assert len(tools) > 0

        # Check tool structure
        tool = tools[0]
        assert "name" in tool
        assert "description" in tool
        assert "parameters" in tool

    @pytest.mark.asyncio
    async def test_handle_request_success(self, mcp_server, mock_task_service, sample_mcp_request):
        """Test successful MCP request handling"""
        # Setup mock
        mock_task = Task(
            title="Test Task",
            description="A test task",
            project_id="proj-123",
            priority=TaskPriority.HIGH,
        )
        mock_task_service.create_task.return_value = mock_task

        # Handle request
        response = await mcp_server.handle_request(sample_mcp_request)

        # Verify response
        assert response.jsonrpc == "2.0"
        assert response.id == "test-123"
        assert response.result is not None
        assert response.error is None

    @pytest.mark.asyncio
    async def test_handle_request_method_not_found(self, mcp_server):
        """Test handling unknown method"""
        request = MCPRequest(jsonrpc="2.0", id="test-123", method="unknown/method", params={})

        response = await mcp_server.handle_request(request)

        assert response.error is not None
        assert response.error.code == -32601  # Method not found
        assert "Method not found" in response.error.message

    @pytest.mark.asyncio
    async def test_handle_request_invalid_params(self, mcp_server, mock_task_service):
        """Test handling invalid parameters"""
        # Setup mock to raise exception
        mock_task_service.create_task.side_effect = ValueError("Invalid parameters")

        request = MCPRequest(
            jsonrpc="2.0", id="test-123", method="tasks/create", params={"invalid": "params"}
        )

        response = await mcp_server.handle_request(request)

        assert response.error is not None
        assert response.error.code == -32602  # Invalid params
        assert "Tool execution failed" in response.error.message

    @pytest.mark.asyncio
    async def test_handle_batch_requests(self, mcp_server, mock_task_service):
        """Test handling batch requests"""
        # Setup mock
        mock_task = Task(
            title="Test Task",
            description="A test task",
            project_id="proj-123",
        )
        mock_task_service.create_task.return_value = mock_task

        requests = [
            MCPRequest(
                jsonrpc="2.0",
                id="req-1",
                method="tasks/create",
                params={"title": "Task 1", "description": "First task", "project_id": "proj-123"},
            ),
            MCPRequest(
                jsonrpc="2.0",
                id="req-2",
                method="tasks/create",
                params={"title": "Task 2", "description": "Second task", "project_id": "proj-123"},
            ),
        ]

        responses = await mcp_server.handle_batch_requests(requests)

        assert len(responses) == 2
        assert all(resp.id in ["req-1", "req-2"] for resp in responses)
        assert all(resp.error is None for resp in responses)


class TestTaskMCPTools:
    """Test Task MCP tools"""

    def test_create_task_tool(self, mock_task_service):
        """Test task creation tool"""
        tools = TaskMCPTools(mock_task_service)

        # Setup mock
        mock_task = Task(
            title="New Task",
            description="A new task",
            project_id="proj-123",
            priority=TaskPriority.MEDIUM,
        )
        mock_task_service.create_task.return_value = mock_task

        # Call tool
        params = {
            "title": "New Task",
            "description": "A new task",
            "project_id": "proj-123",
            "priority": "medium",
        }

        result = tools.create_task(params)

        # Verify result
        assert result["success"] is True
        assert result["task"]["title"] == "New Task"
        assert result["task"]["priority"] == "medium"

    def test_update_task_tool(self, mock_task_service):
        """Test task update tool"""
        tools = TaskMCPTools(mock_task_service)

        # Setup mock
        mock_task = Task(
            task_id="task-123",
            title="Updated Task",
            description="Updated description",
            project_id="proj-123",
            status=TaskStatus.COMPLETED,
        )
        mock_task_service.update_task.return_value = mock_task

        # Call tool
        params = {"task_id": "task-123", "title": "Updated Task", "status": "completed"}

        result = tools.update_task(params)

        # Verify result
        assert result["success"] is True
        assert result["task"]["title"] == "Updated Task"
        assert result["task"]["status"] == "completed"

    def test_delete_task_tool(self, mock_task_service):
        """Test task deletion tool"""
        tools = TaskMCPTools(mock_task_service)

        # Setup mock
        mock_task_service.delete_task.return_value = True

        # Call tool
        params = {"task_id": "task-123"}
        result = tools.delete_task(params)

        # Verify result
        assert result["success"] is True
        assert result["deleted"] is True

    def test_list_tasks_tool(self, mock_task_service):
        """Test task listing tool"""
        tools = TaskMCPTools(mock_task_service)

        # Setup mock
        mock_tasks = [
            Task(title="Task 1", description="First task", project_id="proj-123"),
            Task(title="Task 2", description="Second task", project_id="proj-123"),
        ]
        mock_result = Mock()
        mock_result.items = mock_tasks
        mock_result.total = 2
        mock_task_service.list_tasks.return_value = mock_result

        # Call tool
        params = {"project_id": "proj-123", "limit": 10}
        result = tools.list_tasks(params)

        # Verify result
        assert result["success"] is True
        assert len(result["tasks"]) == 2
        assert result["total"] == 2

    def test_get_task_hierarchy_tool(self, mock_task_service):
        """Test task hierarchy tool"""
        tools = TaskMCPTools(mock_task_service)

        # Setup mock
        parent_task = Task(
            task_id="parent", title="Parent Task", description="", project_id="proj-123"
        )
        child_task = Task(
            task_id="child",
            title="Child Task",
            description="",
            project_id="proj-123",
            parent_id="parent",
        )

        hierarchy = {"task": parent_task, "children": [{"task": child_task, "children": []}]}
        mock_task_service.get_task_hierarchy.return_value = hierarchy

        # Call tool
        params = {"task_id": "parent"}
        result = tools.get_task_hierarchy(params)

        # Verify result
        assert result["success"] is True
        assert result["hierarchy"]["task"]["task_id"] == "parent"
        assert len(result["hierarchy"]["children"]) == 1

    def test_estimate_task_duration_tool(self, mock_task_service):
        """Test AI task estimation tool"""
        tools = TaskMCPTools(mock_task_service)

        # Setup mock
        mock_task = Task(
            title="Complex Feature",
            description="Implement user authentication with OAuth",
            project_id="proj-123",
        )
        mock_task_service.get_task.return_value = mock_task
        mock_task_service.estimate_task_duration.return_value = 12.5

        # Call tool
        params = {"task_id": "task-123"}
        result = tools.estimate_task_duration(params)

        # Verify result
        assert result["success"] is True
        assert result["estimated_hours"] == 12.5

    def test_break_down_task_tool(self, mock_task_service):
        """Test AI task breakdown tool"""
        tools = TaskMCPTools(mock_task_service)

        # Setup mock
        mock_subtasks = [
            Task(
                title="Subtask 1",
                description="First subtask",
                project_id="proj-123",
                parent_id="task-123",
            ),
            Task(
                title="Subtask 2",
                description="Second subtask",
                project_id="proj-123",
                parent_id="task-123",
            ),
        ]
        mock_task_service.break_down_task.return_value = mock_subtasks

        # Call tool
        params = {"task_id": "task-123"}
        result = tools.break_down_task(params)

        # Verify result
        assert result["success"] is True
        assert len(result["subtasks"]) == 2
        assert all(task["parent_id"] == "task-123" for task in result["subtasks"])

    def test_create_task_from_template_tool(self, mock_task_service):
        """Test creating task from template"""
        tools = TaskMCPTools(mock_task_service)

        # Setup mock
        mock_task = Task(
            title="Fix: Authentication Bug",
            description="Bug: Users cannot login properly",
            project_id="proj-123",
            priority=TaskPriority.HIGH,
        )
        mock_task_service.create_task_from_template.return_value = mock_task

        # Call tool
        params = {
            "template_name": "Bug Fix Template",
            "project_id": "proj-123",
            "variables": {
                "issue_description": "Authentication Bug",
                "bug_details": "Users cannot login properly",
            },
        }
        result = tools.create_task_from_template(params)

        # Verify result
        assert result["success"] is True
        assert result["task"]["title"] == "Fix: Authentication Bug"
        assert result["task"]["priority"] == "high"


class TestProjectMCPTools:
    """Test Project MCP tools"""

    def test_create_project_tool(self, mock_task_service):
        """Test project creation tool"""
        tools = ProjectMCPTools(mock_task_service)

        # Setup mock
        mock_project = Project(
            name="New Project",
            description="A new project",
            owner="user123",
        )
        mock_task_service.create_project.return_value = mock_project

        # Call tool
        params = {"name": "New Project", "description": "A new project", "owner": "user123"}

        result = tools.create_project(params)

        # Verify result
        assert result["success"] is True
        assert result["project"]["name"] == "New Project"
        assert result["project"]["owner"] == "user123"

    def test_get_project_analytics_tool(self, mock_task_service):
        """Test project analytics tool"""
        tools = ProjectMCPTools(mock_task_service)

        # Setup mock
        mock_analytics = {
            "project": Project(name="Test Project", description="", owner="user123"),
            "total_tasks": 10,
            "completed_tasks": 7,
            "completion_percentage": 70.0,
            "total_estimated_hours": 50.0,
            "total_actual_hours": 35.5,
        }
        mock_task_service.get_project_analytics.return_value = mock_analytics

        # Call tool
        params = {"project_id": "proj-123"}
        result = tools.get_project_analytics(params)

        # Verify result
        assert result["success"] is True
        assert result["analytics"]["total_tasks"] == 10
        assert result["analytics"]["completion_percentage"] == 70.0

    def test_archive_project_tool(self, mock_task_service):
        """Test project archiving tool"""
        tools = ProjectMCPTools(mock_task_service)

        # Setup mock
        mock_task_service.archive_project.return_value = True

        # Call tool
        params = {"project_id": "proj-123", "force": False}
        result = tools.archive_project(params)

        # Verify result
        assert result["success"] is True
        assert result["archived"] is True


class TestMCPToolRegistry:
    """Test MCP tool registry"""

    def test_registry_initialization(self):
        """Test registry initialization"""
        registry = MCPToolRegistry()

        assert isinstance(registry.tools, dict)
        assert len(registry.tools) == 0

    def test_register_tool(self):
        """Test tool registration"""
        registry = MCPToolRegistry()

        def test_tool(params):
            return {"result": "test"}

        registry.register("test_tool", test_tool, "A test tool")

        assert "test_tool" in registry.tools
        assert registry.tools["test_tool"]["function"] == test_tool
        assert registry.tools["test_tool"]["description"] == "A test tool"

    def test_get_tool_info(self):
        """Test getting tool information"""
        registry = MCPToolRegistry()

        def test_tool(params):
            return {"result": "test"}

        registry.register("test_tool", test_tool, "A test tool")

        tools_info = registry.get_tools_info()

        assert len(tools_info) == 1
        assert tools_info[0]["name"] == "test_tool"
        assert tools_info[0]["description"] == "A test tool"

    def test_call_tool_success(self):
        """Test successful tool call"""
        registry = MCPToolRegistry()

        def test_tool(params):
            return {"input": params["value"], "doubled": params["value"] * 2}

        registry.register("test_tool", test_tool, "A test tool")

        result = registry.call_tool("test_tool", {"value": 5})

        assert result["input"] == 5
        assert result["doubled"] == 10

    def test_call_tool_not_found(self):
        """Test calling non-existent tool"""
        registry = MCPToolRegistry()

        with pytest.raises(ValueError, match="Tool not found"):
            registry.call_tool("nonexistent_tool", {})

    def test_call_tool_error(self):
        """Test tool execution error"""
        registry = MCPToolRegistry()

        def error_tool(params):
            raise ValueError("Tool error")

        registry.register("error_tool", error_tool, "An error tool")

        with pytest.raises(ValueError, match="Tool error"):
            registry.call_tool("error_tool", {})


class TestMCPDataClasses:
    """Test MCP data classes"""

    def test_mcp_request(self):
        """Test MCPRequest data class"""
        request = MCPRequest(
            jsonrpc="2.0", id="test-123", method="tasks/create", params={"title": "Test Task"}
        )

        assert request.jsonrpc == "2.0"
        assert request.id == "test-123"
        assert request.method == "tasks/create"
        assert request.params["title"] == "Test Task"

    def test_mcp_response_success(self):
        """Test successful MCPResponse"""
        response = MCPResponse(
            jsonrpc="2.0", id="test-123", result={"success": True, "task_id": "task-456"}
        )

        assert response.jsonrpc == "2.0"
        assert response.id == "test-123"
        assert response.result["success"] is True
        assert response.error is None

    def test_mcp_response_error(self):
        """Test error MCPResponse"""
        error = MCPError(code=-32602, message="Invalid params", data={"param": "title"})

        response = MCPResponse(jsonrpc="2.0", id="test-123", error=error)

        assert response.jsonrpc == "2.0"
        assert response.id == "test-123"
        assert response.result is None
        assert response.error.code == -32602
        assert response.error.message == "Invalid params"

    def test_mcp_error(self):
        """Test MCPError data class"""
        error = MCPError(
            code=-32600, message="Invalid Request", data={"details": "Missing required field"}
        )

        assert error.code == -32600
        assert error.message == "Invalid Request"
        assert error.data["details"] == "Missing required field"
