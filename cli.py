#!/usr/bin/env python3
"""
Proxy Agent Platform CLI

A command-line interface for interacting with the Proxy Agent Platform API.
Provides task management, agent interaction, and productivity tracking.
"""

import argparse
import json
import sys
from typing import Any

import httpx
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

# Configuration
API_BASE_URL = "http://localhost:8000"
DEFAULT_USER_ID = 1  # For demo purposes

console = Console()


class ProxyAgentCLI:
    """CLI interface for the Proxy Agent Platform."""

    def __init__(self, base_url: str = API_BASE_URL, user_id: int = DEFAULT_USER_ID):
        """Initialize the CLI with API configuration."""
        self.base_url = base_url
        self.user_id = user_id
        self.client = httpx.Client(base_url=base_url, timeout=30.0)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.client.close()

    # Task Management Commands

    def create_task(self, title: str, description: str = "", priority: str = "medium", duration: int | None = None):
        """Create a new task."""
        task_data = {
            "title": title,
            "description": description,
            "priority": priority,
            "estimated_duration": duration
        }

        try:
            response = self.client.post(
                f"/api/tasks/?user_id={self.user_id}",
                json=task_data
            )
            response.raise_for_status()
            task = response.json()

            console.print(f"✅ Task created: '{task['title']}'", style="green")
            console.print(f"   ID: {task['id']}, XP Reward: {task['xp_reward']}")
            return task

        except httpx.HTTPError as e:
            console.print(f"❌ Error creating task: {e}", style="red")
            return None

    def list_tasks(self, status: str | None = None, limit: int = 10):
        """List user tasks."""
        params = {"user_id": self.user_id, "limit": limit}
        if status:
            params["status"] = status

        try:
            response = self.client.get("/api/tasks/", params=params)
            response.raise_for_status()
            tasks = response.json()

            if not tasks:
                console.print("No tasks found.", style="yellow")
                return

            table = Table(title=f"Your Tasks ({len(tasks)} found)")
            table.add_column("ID", style="cyan")
            table.add_column("Title", style="white")
            table.add_column("Status", style="green")
            table.add_column("Priority", style="yellow")
            table.add_column("XP", style="magenta")

            for task in tasks:
                table.add_row(
                    str(task["id"]),
                    task["title"][:40] + "..." if len(task["title"]) > 40 else task["title"],
                    task["status"],
                    task["priority"],
                    str(task["xp_reward"])
                )

            console.print(table)
            return tasks

        except httpx.HTTPError as e:
            console.print(f"❌ Error fetching tasks: {e}", style="red")
            return None

    def complete_task(self, task_id: int, actual_duration: int | None = None):
        """Mark a task as completed."""
        params = {"user_id": self.user_id}
        if actual_duration:
            params["actual_duration"] = actual_duration

        try:
            response = self.client.patch(
                f"/api/tasks/{task_id}/status?status=completed",
                params=params
            )
            response.raise_for_status()
            result = response.json()

            console.print(f"🎉 {result['message']}", style="green")
            console.print(f"   XP Earned: +{result['task']['xp_reward']}")
            return result

        except httpx.HTTPError as e:
            console.print(f"❌ Error completing task: {e}", style="red")
            return None

    def get_task(self, task_id: int):
        """Get details of a specific task."""
        try:
            response = self.client.get(f"/api/tasks/{task_id}?user_id={self.user_id}")
            response.raise_for_status()
            task = response.json()

            panel = Panel.fit(
                f"[bold]{task['title']}[/bold]\n\n"
                f"Description: {task['description'] or 'No description'}\n"
                f"Status: {task['status']}\n"
                f"Priority: {task['priority']}\n"
                f"Estimated Duration: {task['estimated_duration'] or 'Not set'} minutes\n"
                f"XP Reward: {task['xp_reward']}\n"
                f"Created: {task['created_at'][:10]}",
                title=f"Task #{task['id']}"
            )
            console.print(panel)
            return task

        except httpx.HTTPError as e:
            console.print(f"❌ Error fetching task: {e}", style="red")
            return None

    # Agent Interaction Commands

    def interact_with_agent(self, agent_type: str, action: str, data: dict[str, Any] = None):
        """Interact with a specific proxy agent."""
        request_data = {
            "agent_type": agent_type,
            "action": action,
            "data": data or {},
            "user_id": self.user_id
        }

        try:
            response = self.client.post("/api/agents/interact", json=request_data)
            response.raise_for_status()
            result = response.json()

            if result["success"]:
                console.print(f"🤖 {agent_type.title()} Agent: {result['message']}", style="green")

                if result.get("suggestions"):
                    console.print("\n💡 Suggestions:")
                    for suggestion in result["suggestions"]:
                        console.print(f"   • {suggestion}")

                if result.get("xp_earned"):
                    console.print(f"\n✨ XP Earned: +{result['xp_earned']}")

                return result
            else:
                console.print(f"❌ Agent Error: {result['message']}", style="red")
                return None

        except httpx.HTTPError as e:
            console.print(f"❌ Error interacting with agent: {e}", style="red")
            return None

    def get_agent_status(self):
        """Get status of all proxy agents."""
        try:
            response = self.client.get("/api/agents/status")
            response.raise_for_status()
            status = response.json()

            console.print(f"🤖 Agent Platform Status: {status['status']}")
            console.print(f"   Active Agents: {status['active_agents']}")

            for agent_name, agent_info in status["agents"].items():
                console.print(f"\n   {agent_name.title()} Agent:")
                console.print(f"      Status: {agent_info['status']}")
                console.print(f"      Model: {agent_info['model']}")

            return status

        except httpx.HTTPError as e:
            console.print(f"❌ Error getting agent status: {e}", style="red")
            return None

    def get_recommendations(self):
        """Get AI recommendations from all agents."""
        try:
            response = self.client.get(f"/api/agents/recommendations/{self.user_id}")
            response.raise_for_status()
            result = response.json()

            recommendations = result.get("recommendations", [])

            if not recommendations:
                console.print("No recommendations available.", style="yellow")
                return

            console.print("🎯 AI Recommendations:", style="bold blue")
            for rec in recommendations:
                console.print(f"\n   {rec.get('title', 'Recommendation')}")
                console.print(f"   {rec.get('description', '')}")
                console.print(f"   From: {rec.get('agent', 'Unknown')} Agent")

            return recommendations

        except httpx.HTTPError as e:
            console.print(f"❌ Error getting recommendations: {e}", style="red")
            return None

    # Utility Commands

    def health_check(self):
        """Check if the API server is running."""
        try:
            response = self.client.get("/health")
            response.raise_for_status()
            result = response.json()

            console.print(f"✅ Server is healthy: {result['status']}", style="green")
            return True

        except httpx.HTTPError:
            console.print("❌ Server is not responding", style="red")
            return False

    def show_api_info(self):
        """Show API information."""
        try:
            response = self.client.get("/")
            response.raise_for_status()
            info = response.json()

            panel = Panel.fit(
                f"[bold]{info['message']}[/bold]\n\n"
                f"Version: {info['version']}\n"
                f"Description: {info['description']}\n\n"
                f"Available Agents:\n" +
                "\n".join([f"  • {name}: {desc}" for name, desc in info['agents'].items()]),
                title="Proxy Agent Platform API"
            )
            console.print(panel)
            return info

        except httpx.HTTPError as e:
            console.print(f"❌ Error getting API info: {e}", style="red")
            return None


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Proxy Agent Platform CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s info                           # Show API information
  %(prog)s status                         # Show agent status
  %(prog)s task create "Review docs"      # Create a new task
  %(prog)s task list                      # List all tasks
  %(prog)s task list --status pending    # List pending tasks
  %(prog)s task complete 1               # Complete task #1
  %(prog)s task show 1                   # Show task #1 details
  %(prog)s agent task recommend          # Get task recommendations
  %(prog)s recommendations               # Get all agent recommendations
        """
    )

    parser.add_argument("--url", default=API_BASE_URL, help="API base URL")
    parser.add_argument("--user", type=int, default=DEFAULT_USER_ID, help="User ID")

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Info commands
    subparsers.add_parser("info", help="Show API information")
    subparsers.add_parser("status", help="Show agent status")
    subparsers.add_parser("health", help="Check server health")
    subparsers.add_parser("recommendations", help="Get AI recommendations")

    # Task commands
    task_parser = subparsers.add_parser("task", help="Task management")
    task_subparsers = task_parser.add_subparsers(dest="task_action")

    create_parser = task_subparsers.add_parser("create", help="Create a new task")
    create_parser.add_argument("title", help="Task title")
    create_parser.add_argument("--description", default="", help="Task description")
    create_parser.add_argument("--priority", choices=["low", "medium", "high", "urgent"], default="medium")
    create_parser.add_argument("--duration", type=int, help="Estimated duration in minutes")

    list_parser = task_subparsers.add_parser("list", help="List tasks")
    list_parser.add_argument("--status", choices=["pending", "in_progress", "completed", "cancelled"])
    list_parser.add_argument("--limit", type=int, default=10, help="Maximum number of tasks to show")

    complete_parser = task_subparsers.add_parser("complete", help="Complete a task")
    complete_parser.add_argument("task_id", type=int, help="Task ID to complete")
    complete_parser.add_argument("--duration", type=int, help="Actual duration in minutes")

    show_parser = task_subparsers.add_parser("show", help="Show task details")
    show_parser.add_argument("task_id", type=int, help="Task ID to show")

    # Agent commands
    agent_parser = subparsers.add_parser("agent", help="Interact with agents")
    agent_parser.add_argument("agent_type", choices=["task", "focus", "energy", "progress"])
    agent_parser.add_argument("action", help="Action to perform")
    agent_parser.add_argument("--data", help="Additional data as JSON string")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    # Execute commands
    try:
        with ProxyAgentCLI(args.url, args.user) as cli:

            if args.command == "info":
                cli.show_api_info()

            elif args.command == "status":
                cli.get_agent_status()

            elif args.command == "health":
                cli.health_check()

            elif args.command == "recommendations":
                cli.get_recommendations()

            elif args.command == "task":
                if args.task_action == "create":
                    cli.create_task(args.title, args.description, args.priority, args.duration)
                elif args.task_action == "list":
                    cli.list_tasks(args.status, args.limit)
                elif args.task_action == "complete":
                    cli.complete_task(args.task_id, args.duration)
                elif args.task_action == "show":
                    cli.get_task(args.task_id)
                else:
                    task_parser.print_help()

            elif args.command == "agent":
                data = json.loads(args.data) if args.data else {}
                cli.interact_with_agent(args.agent_type, args.action, data)

    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="blue")
    except Exception as e:
        console.print(f"❌ Unexpected error: {e}", style="red")
        sys.exit(1)


if __name__ == "__main__":
    main()
