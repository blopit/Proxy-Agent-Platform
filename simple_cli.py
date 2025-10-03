#!/usr/bin/env python3
"""
Simple CLI for Proxy Agent Platform API

A minimal command-line interface for basic task management.
"""

import requests
import json
import sys


API_URL = "http://localhost:8000"
USER_ID = 1


def api_request(method, endpoint, data=None):
    """Make API request with error handling."""
    url = f"{API_URL}{endpoint}"

    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PATCH":
            response = requests.patch(url, json=data)

        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        return None


def create_task(title, description=""):
    """Create a new task."""
    data = {
        "title": title,
        "description": description,
        "priority": "medium"
    }

    result = api_request("POST", f"/api/tasks/?user_id={USER_ID}", data)

    if result:
        print(f"✅ Created task: {result['title']} (ID: {result['id']})")
        print(f"   XP Reward: {result['xp_reward']}")
    else:
        print("❌ Failed to create task")


def list_tasks():
    """List all tasks."""
    result = api_request("GET", f"/api/tasks/?user_id={USER_ID}")

    if result:
        print(f"\n📋 Your Tasks ({len(result)} total):")
        print("-" * 50)
        for task in result:
            status_emoji = "✅" if task['status'] == 'completed' else "⏳"
            print(f"{status_emoji} [{task['id']}] {task['title']}")
            print(f"    Status: {task['status']} | Priority: {task['priority']} | XP: {task['xp_reward']}")
    else:
        print("❌ Failed to fetch tasks")


def complete_task(task_id):
    """Complete a task."""
    result = api_request("PATCH", f"/api/tasks/{task_id}/status?status=completed&user_id={USER_ID}")

    if result:
        print(f"🎉 {result['message']}")
        print(f"   XP Earned: +{result['task']['xp_reward']}")
    else:
        print("❌ Failed to complete task")


def agent_status():
    """Get agent status."""
    result = api_request("GET", "/api/agents/status")

    if result:
        print(f"\n🤖 Agent Status: {result['status']}")
        print(f"   Active Agents: {result['active_agents']}")

        for agent_name, info in result['agents'].items():
            print(f"\n   {agent_name.title()} Agent:")
            print(f"      Status: {info['status']}")
            print(f"      Model: {info['model']}")
    else:
        print("❌ Failed to get agent status")


def health_check():
    """Check API health."""
    result = api_request("GET", "/health")

    if result:
        print(f"✅ API Health: {result['status']}")
    else:
        print("❌ API is not responding")


def show_help():
    """Show help message."""
    print("""
🤖 Proxy Agent Platform CLI

Commands:
  create <title> [description]  - Create a new task
  list                         - List all tasks
  complete <task_id>           - Complete a task
  status                       - Show agent status
  health                       - Check API health
  help                         - Show this help

Examples:
  python simple_cli.py create "Review documentation"
  python simple_cli.py list
  python simple_cli.py complete 1
  python simple_cli.py status
    """)


def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2:
        show_help()
        return

    command = sys.argv[1].lower()

    if command == "create":
        if len(sys.argv) < 3:
            print("❌ Usage: create <title> [description]")
            return
        title = sys.argv[2]
        description = sys.argv[3] if len(sys.argv) > 3 else ""
        create_task(title, description)

    elif command == "list":
        list_tasks()

    elif command == "complete":
        if len(sys.argv) < 3:
            print("❌ Usage: complete <task_id>")
            return
        try:
            task_id = int(sys.argv[2])
            complete_task(task_id)
        except ValueError:
            print("❌ Task ID must be a number")

    elif command == "status":
        agent_status()

    elif command == "health":
        health_check()

    elif command == "help":
        show_help()

    else:
        print(f"❌ Unknown command: {command}")
        show_help()


if __name__ == "__main__":
    main()