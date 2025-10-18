"""
MCP (Model Control Protocol) Server Implementation for Task Management
"""

import logging
from collections.abc import Callable
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any

from src.core.task_models import (
    DependencyType,
    Project,
    Task,
    TaskFilter,
    TaskPriority,
    TaskSort,
    TaskStatus,
)
from src.services.task_service import (
    ProjectCreationData,
    TaskCreationData,
    TaskService,
    TaskUpdateData,
)

logger = logging.getLogger(__name__)


@dataclass
class MCPError:
    """MCP error response"""

    code: int
    message: str
    data: dict[str, Any] | None = None


@dataclass
class MCPRequest:
    """MCP request data structure"""

    jsonrpc: str
    id: str | int
    method: str
    params: dict[str, Any] = field(default_factory=dict)


@dataclass
class MCPResponse:
    """MCP response data structure"""

    jsonrpc: str
    id: str | int
    result: dict[str, Any] | None = None
    error: MCPError | None = None


class MCPToolRegistry:
    """Registry for MCP tools"""

    def __init__(self):
        self.tools: dict[str, dict[str, Any]] = {}

    def register(
        self,
        name: str,
        function: Callable,
        description: str,
        parameters: dict[str, Any] | None = None,
    ):
        """Register a tool"""
        self.tools[name] = {
            "function": function,
            "description": description,
            "parameters": parameters or {},
        }

    def get_tools_info(self) -> list[dict[str, Any]]:
        """Get information about all registered tools"""
        return [
            {
                "name": name,
                "description": tool["description"],
                "parameters": tool["parameters"],
            }
            for name, tool in self.tools.items()
        ]

    def call_tool(self, name: str, params: dict[str, Any]) -> Any:
        """Call a registered tool"""
        if name not in self.tools:
            raise ValueError(f"Tool not found: {name}")

        try:
            return self.tools[name]["function"](params)
        except Exception as e:
            logger.error(f"Error calling tool {name}: {e}")
            raise


class TaskMCPTools:
    """MCP tools for task management"""

    def __init__(self, task_service: TaskService):
        self.task_service = task_service

    def create_task(self, params: dict[str, Any]) -> dict[str, Any]:
        """Create a new task"""
        try:
            # Convert string priority to enum
            priority_str = params.get("priority", "medium")
            priority = TaskPriority(priority_str.lower())

            # Create task data
            task_data = TaskCreationData(
                title=params["title"],
                description=params["description"],
                project_id=params["project_id"],
                parent_id=params.get("parent_id"),
                priority=priority,
                estimated_hours=Decimal(str(params["estimated_hours"]))
                if params.get("estimated_hours")
                else None,
                tags=params.get("tags", []),
                assignee=params.get("assignee"),
                due_date=params.get("due_date"),
            )

            task = self.task_service.create_task(task_data)

            return {
                "success": True,
                "task": self._task_to_dict(task),
            }

        except Exception as e:
            logger.error(f"Error creating task: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def update_task(self, params: dict[str, Any]) -> dict[str, Any]:
        """Update an existing task"""
        try:
            task_id = params["task_id"]

            # Convert optional fields
            update_data = TaskUpdateData(
                title=params.get("title"),
                description=params.get("description"),
                status=TaskStatus(params["status"]) if params.get("status") else None,
                priority=TaskPriority(params["priority"]) if params.get("priority") else None,
                estimated_hours=Decimal(str(params["estimated_hours"]))
                if params.get("estimated_hours")
                else None,
                actual_hours=Decimal(str(params["actual_hours"]))
                if params.get("actual_hours")
                else None,
                tags=params.get("tags"),
                assignee=params.get("assignee"),
                due_date=params.get("due_date"),
            )

            task = self.task_service.update_task(task_id, update_data)

            return {
                "success": True,
                "task": self._task_to_dict(task),
            }

        except Exception as e:
            logger.error(f"Error updating task: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def delete_task(self, params: dict[str, Any]) -> dict[str, Any]:
        """Delete a task"""
        try:
            task_id = params["task_id"]
            force = params.get("force", False)

            deleted = self.task_service.delete_task(task_id, force=force)

            return {
                "success": True,
                "deleted": deleted,
            }

        except Exception as e:
            logger.error(f"Error deleting task: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def get_task(self, params: dict[str, Any]) -> dict[str, Any]:
        """Get a task by ID"""
        try:
            task_id = params["task_id"]
            task = self.task_service.get_task(task_id)

            if task:
                return {
                    "success": True,
                    "task": self._task_to_dict(task),
                }
            else:
                return {
                    "success": False,
                    "error": "Task not found",
                }

        except Exception as e:
            logger.error(f"Error getting task: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def list_tasks(self, params: dict[str, Any]) -> dict[str, Any]:
        """List tasks with filtering and pagination"""
        try:
            # Build filter
            filter_obj = None
            if any(
                key in params
                for key in ["project_id", "assignee", "status", "priority", "search_text"]
            ):
                filter_obj = TaskFilter(
                    project_id=params.get("project_id"),
                    assignee=params.get("assignee"),
                    status=[TaskStatus(s) for s in params["status"]]
                    if params.get("status")
                    else None,
                    priority=[TaskPriority(p) for p in params["priority"]]
                    if params.get("priority")
                    else None,
                    search_text=params.get("search_text"),
                    parent_id=params.get("parent_id"),
                )

            # Build sort
            sort_obj = None
            if "sort_field" in params:
                sort_obj = TaskSort(
                    field=params["sort_field"],
                    direction=params.get("sort_direction", "desc"),
                )

            limit = params.get("limit", 50)
            offset = params.get("offset", 0)

            result = self.task_service.list_tasks(filter_obj, sort_obj, limit, offset)

            return {
                "success": True,
                "tasks": [self._task_to_dict(task) for task in result.items],
                "total": result.total,
                "limit": result.limit,
                "offset": result.offset,
            }

        except Exception as e:
            logger.error(f"Error listing tasks: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def get_task_hierarchy(self, params: dict[str, Any]) -> dict[str, Any]:
        """Get task hierarchy"""
        try:
            task_id = params["task_id"]
            hierarchy = self.task_service.get_task_hierarchy(task_id)

            return {
                "success": True,
                "hierarchy": self._hierarchy_to_dict(hierarchy),
            }

        except Exception as e:
            logger.error(f"Error getting task hierarchy: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def add_task_dependency(self, params: dict[str, Any]) -> dict[str, Any]:
        """Add task dependency"""
        try:
            task_id = params["task_id"]
            depends_on_task_id = params["depends_on_task_id"]
            dependency_type = DependencyType(params.get("dependency_type", "depends_on"))

            dependency = self.task_service.add_task_dependency(
                task_id, depends_on_task_id, dependency_type
            )

            return {
                "success": True,
                "dependency": {
                    "dependency_id": dependency.dependency_id,
                    "task_id": dependency.task_id,
                    "depends_on_task_id": dependency.depends_on_task_id,
                    "dependency_type": dependency.dependency_type.value,
                },
            }

        except Exception as e:
            logger.error(f"Error adding task dependency: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def estimate_task_duration(self, params: dict[str, Any]) -> dict[str, Any]:
        """Estimate task duration using AI"""
        try:
            task_id = params["task_id"]
            task = self.task_service.get_task(task_id)

            if not task:
                return {
                    "success": False,
                    "error": "Task not found",
                }

            estimated_hours = self.task_service.estimate_task_duration(task)

            return {
                "success": True,
                "estimated_hours": float(estimated_hours),
                "task_id": task_id,
            }

        except Exception as e:
            logger.error(f"Error estimating task duration: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def break_down_task(self, params: dict[str, Any]) -> dict[str, Any]:
        """Break down task into subtasks using AI"""
        try:
            task_id = params["task_id"]
            task = self.task_service.get_task(task_id)

            if not task:
                return {
                    "success": False,
                    "error": "Task not found",
                }

            subtasks = self.task_service.break_down_task(task)

            return {
                "success": True,
                "subtasks": [self._task_to_dict(subtask) for subtask in subtasks],
                "parent_task_id": task_id,
            }

        except Exception as e:
            logger.error(f"Error breaking down task: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def create_task_from_template(self, params: dict[str, Any]) -> dict[str, Any]:
        """Create task from template"""
        try:
            template_name = params["template_name"]
            project_id = params["project_id"]
            variables = params["variables"]

            task = self.task_service.create_task_from_template(template_name, project_id, variables)

            return {
                "success": True,
                "task": self._task_to_dict(task),
            }

        except Exception as e:
            logger.error(f"Error creating task from template: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def smart_prioritize_tasks(self, params: dict[str, Any]) -> dict[str, Any]:
        """Smart prioritization of tasks using AI"""
        try:
            project_id = params["project_id"]
            result = self.task_service.smart_prioritize_tasks(project_id)

            return {
                "success": True,
                "updated_count": result.updated_count,
                "priority_changes": {
                    task_id: priority.value for task_id, priority in result.priority_changes.items()
                },
            }

        except Exception as e:
            logger.error(f"Error prioritizing tasks: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def _task_to_dict(self, task: Task) -> dict[str, Any]:
        """Convert task to dictionary"""
        data = task.model_dump()
        # Convert enums to strings
        if hasattr(task.status, "value"):
            data["status"] = task.status.value
        else:
            data["status"] = str(task.status)

        if hasattr(task.priority, "value"):
            data["priority"] = task.priority.value
        else:
            data["priority"] = str(task.priority)

        # Convert decimals to floats
        if data.get("estimated_hours"):
            data["estimated_hours"] = float(data["estimated_hours"])
        if data.get("actual_hours"):
            data["actual_hours"] = float(data["actual_hours"])

        # Convert datetimes to ISO strings
        for field in ["created_at", "updated_at", "due_date", "started_at", "completed_at"]:
            if data.get(field):
                if hasattr(data[field], "isoformat"):
                    data[field] = data[field].isoformat()
                else:
                    data[field] = str(data[field])
        return data

    def _hierarchy_to_dict(self, hierarchy: dict[str, Any]) -> dict[str, Any]:
        """Convert hierarchy to dictionary"""
        result = {"task": self._task_to_dict(hierarchy["task"]), "children": []}

        for child in hierarchy["children"]:
            result["children"].append(self._hierarchy_to_dict(child))

        return result


class ProjectMCPTools:
    """MCP tools for project management"""

    def __init__(self, task_service: TaskService):
        self.task_service = task_service

    def create_project(self, params: dict[str, Any]) -> dict[str, Any]:
        """Create a new project"""
        try:
            project_data = ProjectCreationData(
                name=params["name"],
                description=params["description"],
                owner=params.get("owner"),
                team_members=params.get("team_members", []),
                start_date=params.get("start_date"),
                end_date=params.get("end_date"),
                settings=params.get("settings", {}),
            )

            project = self.task_service.create_project(project_data)

            return {
                "success": True,
                "project": self._project_to_dict(project),
            }

        except Exception as e:
            logger.error(f"Error creating project: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def get_project_analytics(self, params: dict[str, Any]) -> dict[str, Any]:
        """Get project analytics"""
        try:
            project_id = params["project_id"]
            analytics = self.task_service.get_project_analytics(project_id)

            # Convert analytics to serializable format
            result = {}
            for key, value in analytics.items():
                if key == "project":
                    result[key] = self._project_to_dict(value)
                elif isinstance(value, Decimal):
                    result[key] = float(value)
                else:
                    result[key] = value

            return {
                "success": True,
                "analytics": result,
            }

        except Exception as e:
            logger.error(f"Error getting project analytics: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def archive_project(self, params: dict[str, Any]) -> dict[str, Any]:
        """Archive a project"""
        try:
            project_id = params["project_id"]
            force = params.get("force", False)

            archived = self.task_service.archive_project(project_id, force=force)

            return {
                "success": True,
                "archived": archived,
            }

        except Exception as e:
            logger.error(f"Error archiving project: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def _project_to_dict(self, project: Project) -> dict[str, Any]:
        """Convert project to dictionary"""
        data = project.model_dump()
        # Convert datetimes to ISO strings
        for field in ["created_at", "updated_at", "start_date", "end_date"]:
            if data.get(field):
                if hasattr(data[field], "isoformat"):
                    data[field] = data[field].isoformat()
                else:
                    data[field] = str(data[field])
        return data


class MCPServer:
    """MCP Server for task management"""

    def __init__(self, task_service: TaskService | None = None):
        self.task_service = task_service or TaskService()
        self.tool_registry = MCPToolRegistry()
        self._register_built_in_tools()

    def _register_built_in_tools(self):
        """Register built-in tools"""
        task_tools = TaskMCPTools(self.task_service)
        project_tools = ProjectMCPTools(self.task_service)

        # Task management tools
        self.tool_registry.register(
            "tasks/create",
            task_tools.create_task,
            "Create a new task",
            {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Task description"},
                    "project_id": {"type": "string", "description": "Project ID"},
                    "parent_id": {"type": "string", "description": "Parent task ID (optional)"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                    "estimated_hours": {"type": "number", "description": "Estimated hours"},
                    "tags": {"type": "array", "items": {"type": "string"}},
                    "assignee": {"type": "string", "description": "Assigned user ID"},
                    "due_date": {"type": "string", "format": "date-time"},
                },
                "required": ["title", "description", "project_id"],
            },
        )

        self.tool_registry.register(
            "tasks/update",
            task_tools.update_task,
            "Update an existing task",
            {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "Task ID"},
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Task description"},
                    "status": {
                        "type": "string",
                        "enum": [
                            "todo",
                            "in_progress",
                            "in_review",
                            "blocked",
                            "completed",
                            "cancelled",
                        ],
                    },
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                    "estimated_hours": {"type": "number", "description": "Estimated hours"},
                    "actual_hours": {"type": "number", "description": "Actual hours"},
                    "tags": {"type": "array", "items": {"type": "string"}},
                    "assignee": {"type": "string", "description": "Assigned user ID"},
                    "due_date": {"type": "string", "format": "date-time"},
                },
                "required": ["task_id"],
            },
        )

        self.tool_registry.register(
            "tasks/delete",
            task_tools.delete_task,
            "Delete a task",
            {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "Task ID"},
                    "force": {
                        "type": "boolean",
                        "description": "Force delete even with dependencies",
                    },
                },
                "required": ["task_id"],
            },
        )

        self.tool_registry.register(
            "tasks/get",
            task_tools.get_task,
            "Get a task by ID",
            {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "Task ID"},
                },
                "required": ["task_id"],
            },
        )

        self.tool_registry.register(
            "tasks/list",
            task_tools.list_tasks,
            "List tasks with filtering and pagination",
            {
                "type": "object",
                "properties": {
                    "project_id": {"type": "string", "description": "Filter by project ID"},
                    "assignee": {"type": "string", "description": "Filter by assignee"},
                    "status": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by status",
                    },
                    "priority": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by priority",
                    },
                    "search_text": {
                        "type": "string",
                        "description": "Search in title and description",
                    },
                    "parent_id": {"type": "string", "description": "Filter by parent task ID"},
                    "sort_field": {"type": "string", "description": "Sort field"},
                    "sort_direction": {"type": "string", "enum": ["asc", "desc"]},
                    "limit": {"type": "integer", "minimum": 1, "maximum": 100},
                    "offset": {"type": "integer", "minimum": 0},
                },
            },
        )

        self.tool_registry.register(
            "tasks/hierarchy",
            task_tools.get_task_hierarchy,
            "Get task hierarchy",
            {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "Root task ID"},
                },
                "required": ["task_id"],
            },
        )

        self.tool_registry.register(
            "tasks/estimate",
            task_tools.estimate_task_duration,
            "Estimate task duration using AI",
            {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "Task ID"},
                },
                "required": ["task_id"],
            },
        )

        self.tool_registry.register(
            "tasks/breakdown",
            task_tools.break_down_task,
            "Break down task into subtasks using AI",
            {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "Task ID to break down"},
                },
                "required": ["task_id"],
            },
        )

        self.tool_registry.register(
            "tasks/from_template",
            task_tools.create_task_from_template,
            "Create task from template",
            {
                "type": "object",
                "properties": {
                    "template_name": {"type": "string", "description": "Template name"},
                    "project_id": {"type": "string", "description": "Project ID"},
                    "variables": {"type": "object", "description": "Template variables"},
                },
                "required": ["template_name", "project_id", "variables"],
            },
        )

        self.tool_registry.register(
            "tasks/prioritize",
            task_tools.smart_prioritize_tasks,
            "Smart prioritization of tasks using AI",
            {
                "type": "object",
                "properties": {
                    "project_id": {"type": "string", "description": "Project ID"},
                },
                "required": ["project_id"],
            },
        )

        self.tool_registry.register(
            "tasks/add_dependency",
            task_tools.add_task_dependency,
            "Add task dependency",
            {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "Task ID"},
                    "depends_on_task_id": {
                        "type": "string",
                        "description": "Task ID this depends on",
                    },
                    "dependency_type": {
                        "type": "string",
                        "enum": ["blocks", "depends_on", "related"],
                    },
                },
                "required": ["task_id", "depends_on_task_id"],
            },
        )

        # Project management tools
        self.tool_registry.register(
            "projects/create",
            project_tools.create_project,
            "Create a new project",
            {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Project name"},
                    "description": {"type": "string", "description": "Project description"},
                    "owner": {"type": "string", "description": "Project owner"},
                    "team_members": {"type": "array", "items": {"type": "string"}},
                    "start_date": {"type": "string", "format": "date-time"},
                    "end_date": {"type": "string", "format": "date-time"},
                    "settings": {"type": "object", "description": "Project settings"},
                },
                "required": ["name", "description"],
            },
        )

        self.tool_registry.register(
            "projects/analytics",
            project_tools.get_project_analytics,
            "Get project analytics",
            {
                "type": "object",
                "properties": {
                    "project_id": {"type": "string", "description": "Project ID"},
                },
                "required": ["project_id"],
            },
        )

        self.tool_registry.register(
            "projects/archive",
            project_tools.archive_project,
            "Archive a project",
            {
                "type": "object",
                "properties": {
                    "project_id": {"type": "string", "description": "Project ID"},
                    "force": {
                        "type": "boolean",
                        "description": "Force archive even with active tasks",
                    },
                },
                "required": ["project_id"],
            },
        )

    def register_tool(
        self,
        name: str,
        function: Callable,
        description: str,
        parameters: dict[str, Any] | None = None,
    ):
        """Register a custom tool"""
        self.tool_registry.register(name, function, description, parameters)

    def list_tools(self) -> list[dict[str, Any]]:
        """List all available tools"""
        return self.tool_registry.get_tools_info()

    async def handle_request(self, request: MCPRequest) -> MCPResponse:
        """Handle a single MCP request"""
        try:
            # Check if method exists
            if request.method not in self.tool_registry.tools:
                return MCPResponse(
                    jsonrpc=request.jsonrpc,
                    id=request.id,
                    error=MCPError(
                        code=-32601, message="Method not found", data={"method": request.method}
                    ),
                )

            # Call the tool
            result = self.tool_registry.call_tool(request.method, request.params)

            # Check if the tool returned an error
            if isinstance(result, dict) and result.get("success") is False:
                return MCPResponse(
                    jsonrpc=request.jsonrpc,
                    id=request.id,
                    error=MCPError(
                        code=-32602,
                        message="Tool execution failed",
                        data={"error": result.get("error", "Unknown error")},
                    ),
                )

            return MCPResponse(jsonrpc=request.jsonrpc, id=request.id, result=result)

        except ValueError as e:
            # Invalid parameters
            return MCPResponse(
                jsonrpc=request.jsonrpc,
                id=request.id,
                error=MCPError(code=-32602, message="Invalid params", data={"error": str(e)}),
            )

        except Exception as e:
            # Internal error
            logger.error(f"Internal error handling request {request.id}: {e}")
            return MCPResponse(
                jsonrpc=request.jsonrpc,
                id=request.id,
                error=MCPError(code=-32603, message="Internal error", data={"error": str(e)}),
            )

    async def handle_batch_requests(self, requests: list[MCPRequest]) -> list[MCPResponse]:
        """Handle batch MCP requests"""
        responses = []
        for request in requests:
            response = await self.handle_request(request)
            responses.append(response)
        return responses

    def start_server(self, host: str = "localhost", port: int = 8001):
        """Start the MCP server (placeholder for actual server implementation)"""
        logger.info(f"MCP Server would start on {host}:{port}")
        # This would typically start a WebSocket or HTTP server
        # For now, we'll just log the intent
