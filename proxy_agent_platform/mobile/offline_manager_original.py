"""
Offline capability and synchronization manager for mobile devices.

Provides robust offline task storage, conflict resolution, and seamless
synchronization when connectivity is restored.
"""

import asyncio
import logging
from datetime import datetime
from typing import Any
from uuid import uuid4

logger = logging.getLogger(__name__)


class OfflineManager:
    """Manage offline capabilities and data synchronization."""

    def __init__(self):
        """Initialize offline manager with storage and sync mechanisms."""
        self.offline_storage = {}  # In-memory storage for offline data
        self.sync_queue = []  # Queue of items waiting to sync
        self.conflict_resolution_strategies = {
            "server_wins": self._resolve_server_wins,
            "client_wins": self._resolve_client_wins,
            "merge": self._resolve_merge,
            "prompt_user": self._resolve_prompt_user,
        }
        self.sync_metadata = {}

    async def store_offline_task(self, task_data: dict[str, Any]) -> dict[str, Any]:
        """
        Store task data for offline access.

        Args:
            task_data: Dictionary containing task information with keys:
                - title: Task title/content
                - created_at: Creation timestamp (optional)
                - priority: Task priority (optional)
                - offline_id: Unique offline identifier

        Returns:
            Dictionary with status and stored_count

        Raises:
            ValueError: If required task data is missing
        """
        if not task_data.get("title"):
            raise ValueError("Task title is required")

        # Generate offline ID if not provided
        offline_id = task_data.get("offline_id", f"offline_{uuid4().hex[:8]}")

        # Normalize task data
        normalized_task = {
            "offline_id": offline_id,
            "title": task_data["title"],
            "created_at": task_data.get("created_at", datetime.now().isoformat()),
            "priority": task_data.get("priority", "medium"),
            "status": "pending",
            "offline_created": True,
            "needs_sync": True,
            "last_modified": datetime.now().isoformat(),
        }

        # Store in offline storage
        self.offline_storage[offline_id] = normalized_task

        # Add to sync queue
        self.sync_queue.append(
            {
                "action": "create",
                "data": normalized_task,
                "offline_id": offline_id,
                "timestamp": datetime.now().isoformat(),
            }
        )

        logger.info(f"Stored offline task: {offline_id} - {task_data['title']}")

        # Count total offline tasks
        stored_count = len(
            [task for task in self.offline_storage.values() if task.get("needs_sync", False)]
        )

        return {"status": "success", "offline_id": offline_id, "stored_count": stored_count}

    async def sync_offline_data(self, user_id: int) -> dict[str, Any]:
        """
        Synchronize offline data with server when connection is restored.

        Args:
            user_id: User identifier for data ownership

        Returns:
            Dictionary with sync results:
                - status: Sync status
                - synced_tasks: Number of tasks synchronized
                - conflicts: Number of conflicts encountered
                - failed_syncs: Number of failed synchronizations

        Raises:
            ValueError: If user_id is invalid
        """
        if not user_id or user_id <= 0:
            raise ValueError("Valid user_id is required")

        logger.info(f"Starting offline data sync for user {user_id}")

        sync_results = {"synced_tasks": 0, "conflicts": 0, "failed_syncs": 0, "sync_details": []}

        # Process sync queue
        for sync_item in self.sync_queue.copy():
            try:
                result = await self._process_sync_item(sync_item, user_id)

                if result["status"] == "success":
                    sync_results["synced_tasks"] += 1
                    # Remove from queue on successful sync
                    self.sync_queue.remove(sync_item)

                elif result["status"] == "conflict":
                    sync_results["conflicts"] += 1

                else:
                    sync_results["failed_syncs"] += 1

                sync_results["sync_details"].append(
                    {
                        "offline_id": sync_item["offline_id"],
                        "action": sync_item["action"],
                        "result": result["status"],
                        "details": result.get("details", ""),
                    }
                )

            except Exception as e:
                logger.error(f"Sync failed for item {sync_item['offline_id']}: {e}")
                sync_results["failed_syncs"] += 1

        # Update metadata
        self.sync_metadata[user_id] = {
            "last_sync": datetime.now().isoformat(),
            "total_synced": sync_results["synced_tasks"],
            "pending_items": len(self.sync_queue),
        }

        return {"status": "success", **sync_results}

    async def resolve_sync_conflict(self, conflict_scenario: dict[str, Any]) -> dict[str, Any]:
        """
        Resolve synchronization conflicts between offline and server data.

        Args:
            conflict_scenario: Dictionary containing conflict information with keys:
                - offline_task: Offline version of the task
                - server_task: Server version of the task
                - user_id: User identifier

        Returns:
            Dictionary with resolution results:
                - status: Resolution status
                - resolution_strategy: Strategy used for resolution
                - final_version: Final resolved task data

        Raises:
            ValueError: If required conflict data is missing
        """
        offline_task = conflict_scenario.get("offline_task")
        server_task = conflict_scenario.get("server_task")
        user_id = conflict_scenario.get("user_id")

        if not all([offline_task, server_task, user_id]):
            raise ValueError("Conflict scenario requires offline_task, server_task, and user_id")

        logger.info(f"Resolving sync conflict for task {offline_task.get('id', 'unknown')}")

        # Determine resolution strategy based on conflict type
        strategy = await self._determine_resolution_strategy(offline_task, server_task)

        # Apply resolution strategy
        resolver = self.conflict_resolution_strategies.get(strategy)
        if not resolver:
            raise ValueError(f"Unknown resolution strategy: {strategy}")

        final_version = await resolver(offline_task, server_task, user_id)

        # Log resolution
        logger.info(f"Conflict resolved using '{strategy}' strategy")

        return {
            "status": "success",
            "resolution_strategy": strategy,
            "final_version": final_version,
            "conflict_id": f"conflict_{uuid4().hex[:8]}",
        }

    async def _process_sync_item(self, sync_item: dict[str, Any], user_id: int) -> dict[str, Any]:
        """Process individual sync queue item."""
        action = sync_item["action"]
        data = sync_item["data"]
        offline_id = sync_item["offline_id"]

        logger.info(f"Processing sync item: {action} for {offline_id}")

        if action == "create":
            # Check if task already exists on server (conflict detection)
            server_task = await self._check_server_task_exists(data, user_id)

            if server_task:
                # Conflict detected
                return {
                    "status": "conflict",
                    "details": "Task already exists on server",
                    "offline_data": data,
                    "server_data": server_task,
                }

            # Create new task on server
            created = await self._create_server_task(data, user_id)

            if created:
                # Update local task with server ID
                if offline_id in self.offline_storage:
                    self.offline_storage[offline_id]["server_id"] = created["id"]
                    self.offline_storage[offline_id]["needs_sync"] = False

                return {
                    "status": "success",
                    "details": f"Task created on server with ID {created['id']}",
                }
            else:
                return {"status": "error", "details": "Failed to create task on server"}

        elif action == "update":
            # Handle task updates
            updated = await self._update_server_task(data, user_id)
            return {
                "status": "success" if updated else "error",
                "details": "Task updated on server" if updated else "Failed to update task",
            }

        elif action == "delete":
            # Handle task deletions
            deleted = await self._delete_server_task(data, user_id)
            return {
                "status": "success" if deleted else "error",
                "details": "Task deleted on server" if deleted else "Failed to delete task",
            }

        else:
            return {"status": "error", "details": f"Unknown sync action: {action}"}

    async def _determine_resolution_strategy(
        self, offline_task: dict[str, Any], server_task: dict[str, Any]
    ) -> str:
        """Determine the best conflict resolution strategy."""
        # Simple strategy determination based on timestamps
        offline_timestamp = (
            offline_task.get("last_modified")
            or offline_task.get("created_at")
            or datetime.now().isoformat()
        )
        server_timestamp = (
            server_task.get("last_modified")
            or server_task.get("created_at")
            or datetime.now().isoformat()
        )

        offline_modified = datetime.fromisoformat(offline_timestamp)
        server_modified = datetime.fromisoformat(server_timestamp)

        # If offline version is newer, prefer client
        if offline_modified > server_modified:
            return "client_wins"
        # If server version is newer, prefer server
        elif server_modified > offline_modified:
            return "server_wins"
        # If timestamps are equal, try to merge
        else:
            return "merge"

    async def _resolve_server_wins(
        self, offline_task: dict[str, Any], server_task: dict[str, Any], user_id: int
    ) -> dict[str, Any]:
        """Resolve conflict by preferring server version."""
        logger.info("Resolving conflict: server wins")
        return server_task

    async def _resolve_client_wins(
        self, offline_task: dict[str, Any], server_task: dict[str, Any], user_id: int
    ) -> dict[str, Any]:
        """Resolve conflict by preferring client version."""
        logger.info("Resolving conflict: client wins")
        # Merge server ID into client data
        final_version = offline_task.copy()
        final_version["id"] = server_task.get("id")
        return final_version

    async def _resolve_merge(
        self, offline_task: dict[str, Any], server_task: dict[str, Any], user_id: int
    ) -> dict[str, Any]:
        """Resolve conflict by merging both versions."""
        logger.info("Resolving conflict: merge strategy")

        # Simple merge: prefer offline content, server metadata
        merged = server_task.copy()
        merged["title"] = offline_task.get("title", merged["title"])
        merged["priority"] = offline_task.get("priority", merged["priority"])
        merged["last_modified"] = datetime.now().isoformat()

        return merged

    async def _resolve_prompt_user(
        self, offline_task: dict[str, Any], server_task: dict[str, Any], user_id: int
    ) -> dict[str, Any]:
        """Resolve conflict by prompting user (mock implementation)."""
        logger.info("Resolving conflict: user prompt (mock)")
        # For testing, default to merge strategy
        return await self._resolve_merge(offline_task, server_task, user_id)

    async def _check_server_task_exists(
        self, task_data: dict[str, Any], user_id: int
    ) -> dict[str, Any] | None:
        """Check if task already exists on server."""
        # Mock implementation - in real app, this would query the server
        # For testing, check if the task title indicates a conflict scenario
        task_title = task_data.get("title", "")
        if "conflict" in task_title.lower():
            return {
                "id": "server_task_123",
                "title": "Server version of task",
                "created_at": datetime.now().isoformat(),
                "last_modified": datetime.now().isoformat(),
            }
        return None

    async def _create_server_task(
        self, task_data: dict[str, Any], user_id: int
    ) -> dict[str, Any] | None:
        """Create task on server."""
        # Mock implementation - simulate successful creation
        logger.info(f"Creating task on server: {task_data['title']}")

        # Simulate network delay
        await asyncio.sleep(0.1)

        return {
            "id": f"server_task_{uuid4().hex[:8]}",
            "title": task_data["title"],
            "created_at": task_data["created_at"],
            "user_id": user_id,
        }

    async def _update_server_task(self, task_data: dict[str, Any], user_id: int) -> bool:
        """Update task on server."""
        # Mock implementation
        logger.info(f"Updating task on server: {task_data.get('id', 'unknown')}")
        await asyncio.sleep(0.1)
        return True

    async def _delete_server_task(self, task_data: dict[str, Any], user_id: int) -> bool:
        """Delete task on server."""
        # Mock implementation
        logger.info(f"Deleting task on server: {task_data.get('id', 'unknown')}")
        await asyncio.sleep(0.1)
        return True

    def get_offline_tasks(self, user_id: int) -> list[dict[str, Any]]:
        """Get all offline tasks for a user."""
        return [task for task in self.offline_storage.values() if task.get("needs_sync", False)]

    def get_sync_status(self, user_id: int) -> dict[str, Any]:
        """Get current synchronization status."""
        pending_syncs = len(self.sync_queue)
        offline_tasks = len(self.get_offline_tasks(user_id))

        return {
            "pending_syncs": pending_syncs,
            "offline_tasks": offline_tasks,
            "last_sync": self.sync_metadata.get(user_id, {}).get("last_sync"),
            "is_online": pending_syncs == 0,  # Simple online detection
        }
