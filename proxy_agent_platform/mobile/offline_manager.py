"""
Enhanced offline capability and synchronization manager for mobile devices.

Provides robust offline task storage, advanced conflict resolution, priority queuing,
and intelligent synchronization with workflow engine integration.
"""

import asyncio
import hashlib
import json
import logging
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any
from uuid import uuid4

logger = logging.getLogger(__name__)


class SyncPriority(Enum):
    """Priority levels for sync operations."""
    CRITICAL = 1
    HIGH = 2
    NORMAL = 3
    LOW = 4
    BACKGROUND = 5


class ConflictResolutionStrategy(Enum):
    """Strategies for resolving sync conflicts."""
    SERVER_WINS = "server_wins"
    CLIENT_WINS = "client_wins"
    MERGE = "merge"
    MANUAL = "manual"
    TIMESTAMP_BASED = "timestamp_based"
    USER_PROMPT = "user_prompt"


@dataclass
class SyncOperation:
    """Represents a synchronization operation."""
    id: str
    action: str  # create, update, delete
    data: dict[str, Any]
    priority: SyncPriority
    created_at: datetime
    retry_count: int = 0
    max_retries: int = 3
    dependencies: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ConflictDetails:
    """Details about a synchronization conflict."""
    id: str
    offline_data: dict[str, Any]
    server_data: dict[str, Any]
    conflict_type: str
    created_at: datetime
    resolution_strategy: ConflictResolutionStrategy | None = None
    user_choice: str | None = None


class EnhancedOfflineManager:
    """Enhanced offline capabilities with intelligent sync and conflict resolution."""

    def __init__(self, workflow_engine=None):
        """Initialize offline manager with advanced sync mechanisms."""
        self.offline_storage = {}  # In-memory storage for offline data

        # Priority-based sync queues
        self.sync_queues = {
            SyncPriority.CRITICAL: deque(),
            SyncPriority.HIGH: deque(),
            SyncPriority.NORMAL: deque(),
            SyncPriority.LOW: deque(),
            SyncPriority.BACKGROUND: deque(),
        }

        # Enhanced conflict resolution
        self.conflict_resolver = AdvancedConflictResolver()
        self.pending_conflicts = {}

        # Sync orchestration
        self.sync_orchestrator = SyncOrchestrator(workflow_engine)

        # Performance and reliability
        self.sync_metadata = {}
        self.retry_scheduler = RetryScheduler()
        self.bandwidth_monitor = BandwidthMonitor()

        # Progressive sync capabilities
        self.progressive_sync = ProgressiveSyncManager()

        # Metrics and monitoring
        self.metrics = {
            "total_operations": 0,
            "successful_syncs": 0,
            "failed_syncs": 0,
            "conflicts_resolved": 0,
            "bandwidth_saved": 0,
        }

    async def store_offline_data(
        self, data: dict[str, Any], data_type: str = "task", priority: SyncPriority = SyncPriority.NORMAL
    ) -> dict[str, Any]:
        """
        Store data for offline access with enhanced capabilities.

        Args:
            data: Dictionary containing data to store
            data_type: Type of data (task, workflow, user_preference, etc.)
            priority: Sync priority level

        Returns:
            Dictionary with status and storage details

        Raises:
            ValueError: If required data is missing
        """
        if not data:
            raise ValueError("Data cannot be empty")

        # Generate unique offline ID
        offline_id = f"offline_{data_type}_{uuid4().hex[:8]}"
        timestamp = datetime.now()

        # Create normalized data structure
        normalized_data = {
            "offline_id": offline_id,
            "data_type": data_type,
            "original_data": data.copy(),
            "created_at": timestamp.isoformat(),
            "last_modified": timestamp.isoformat(),
            "offline_created": True,
            "needs_sync": True,
            "sync_attempts": 0,
            "data_hash": self._calculate_data_hash(data),
            "size_bytes": len(json.dumps(data).encode('utf-8')),
        }

        # Store in offline storage
        self.offline_storage[offline_id] = normalized_data

        # Create sync operation
        sync_operation = SyncOperation(
            id=offline_id,
            action="create",
            data=normalized_data,
            priority=priority,
            created_at=timestamp,
            metadata={"data_type": data_type, "original_size": normalized_data["size_bytes"]}
        )

        # Add to appropriate priority queue
        self.sync_queues[priority].append(sync_operation)
        self.metrics["total_operations"] += 1

        logger.info(f"Stored offline {data_type}: {offline_id} with priority {priority.name}")

        # Calculate storage statistics
        storage_stats = self._calculate_storage_stats()

        return {
            "status": "success",
            "offline_id": offline_id,
            "priority": priority.name,
            "storage_stats": storage_stats,
        }

    async def progressive_sync(
        self, user_id: int, max_operations: int = 50, bandwidth_limit: int | None = None
    ) -> dict[str, Any]:
        """
        Perform progressive synchronization with intelligent prioritization.

        Args:
            user_id: User identifier for data ownership
            max_operations: Maximum number of operations to sync in this batch
            bandwidth_limit: Optional bandwidth limit in bytes per second

        Returns:
            Dictionary with comprehensive sync results

        Raises:
            ValueError: If user_id is invalid
        """
        if not user_id or user_id <= 0:
            raise ValueError("Valid user_id is required")

        logger.info(f"Starting progressive sync for user {user_id} (max_ops: {max_operations})")

        sync_session = await self.sync_orchestrator.start_sync_session(user_id, {
            "max_operations": max_operations,
            "bandwidth_limit": bandwidth_limit,
            "start_time": datetime.now().isoformat()
        })

        sync_results = {
            "session_id": sync_session["id"],
            "synced_operations": 0,
            "conflicts_detected": 0,
            "conflicts_resolved": 0,
            "failed_operations": 0,
            "bandwidth_used": 0,
            "operations_details": [],
            "pending_conflicts": [],
        }

        operations_processed = 0
        bandwidth_used = 0

        # Process queues in priority order
        for priority in SyncPriority:
            if operations_processed >= max_operations:
                break

            queue = self.sync_queues[priority]

            while queue and operations_processed < max_operations:
                if bandwidth_limit and bandwidth_used >= bandwidth_limit:
                    logger.info("Bandwidth limit reached, pausing sync")
                    break

                sync_operation = queue.popleft()

                try:
                    # Process individual sync operation
                    result = await self._process_sync_operation(
                        sync_operation, user_id, bandwidth_limit
                    )

                    if result["status"] == "success":
                        sync_results["synced_operations"] += 1
                        self.metrics["successful_syncs"] += 1
                        bandwidth_used += result.get("bandwidth_used", 0)

                    elif result["status"] == "conflict":
                        sync_results["conflicts_detected"] += 1
                        # Handle conflict resolution
                        conflict_result = await self._handle_sync_conflict(
                            sync_operation, result["conflict_data"], user_id
                        )

                        if conflict_result["resolved"]:
                            sync_results["conflicts_resolved"] += 1
                            self.metrics["conflicts_resolved"] += 1
                        else:
                            sync_results["pending_conflicts"].append(conflict_result)

                    elif result["status"] == "retry":
                        # Reschedule for retry
                        await self.retry_scheduler.schedule_retry(sync_operation)

                    else:
                        sync_results["failed_operations"] += 1
                        self.metrics["failed_syncs"] += 1

                    sync_results["operations_details"].append({
                        "operation_id": sync_operation.id,
                        "action": sync_operation.action,
                        "priority": sync_operation.priority.name,
                        "status": result["status"],
                        "details": result.get("details", "")
                    })

                    operations_processed += 1

                except Exception as e:
                    logger.error(f"Sync operation failed: {sync_operation.id}: {e}")
                    sync_results["failed_operations"] += 1
                    self.metrics["failed_syncs"] += 1
                    operations_processed += 1

        sync_results["bandwidth_used"] = bandwidth_used
        self.metrics["bandwidth_saved"] += max(0, (bandwidth_limit or 0) - bandwidth_used)

        # Update sync session
        await self.sync_orchestrator.complete_sync_session(
            sync_session["id"], sync_results
        )

        # Update metadata
        self.sync_metadata[user_id] = {
            "last_sync": datetime.now().isoformat(),
            "total_synced": sync_results["synced_operations"],
            "pending_operations": self._get_total_pending_operations(),
            "session_id": sync_session["id"]
        }

        return {"status": "success", **sync_results}

    async def resolve_conflict_batch(
        self, conflicts: list[ConflictDetails], user_preferences: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        Resolve multiple conflicts in batch with intelligent strategies.

        Args:
            conflicts: List of conflict details to resolve
            user_preferences: User's conflict resolution preferences

        Returns:
            Dictionary with batch resolution results

        Raises:
            ValueError: If conflicts list is empty
        """
        if not conflicts:
            raise ValueError("Conflicts list cannot be empty")

        logger.info(f"Resolving {len(conflicts)} conflicts in batch")

        resolution_results = {
            "total_conflicts": len(conflicts),
            "resolved_conflicts": 0,
            "pending_manual_review": 0,
            "failed_resolutions": 0,
            "resolution_details": [],
            "recommended_strategies": {},
        }

        # Group conflicts by type and similarity
        conflict_groups = await self.conflict_resolver.group_similar_conflicts(conflicts)

        for group_name, group_conflicts in conflict_groups.items():
            try:
                # Determine optimal resolution strategy for the group
                strategy = await self.conflict_resolver.recommend_strategy(
                    group_conflicts, user_preferences
                )

                resolution_results["recommended_strategies"][group_name] = strategy.value

                # Apply resolution strategy to group
                group_results = await self.conflict_resolver.resolve_conflict_group(
                    group_conflicts, strategy, user_preferences
                )

                resolution_results["resolved_conflicts"] += group_results["resolved"]
                resolution_results["pending_manual_review"] += group_results["pending_manual"]
                resolution_results["failed_resolutions"] += group_results["failed"]
                resolution_results["resolution_details"].extend(group_results["details"])

            except Exception as e:
                logger.error(f"Failed to resolve conflict group {group_name}: {e}")
                resolution_results["failed_resolutions"] += len(group_conflicts)

        return {"status": "success", **resolution_results}

    def get_comprehensive_sync_status(self, user_id: int) -> dict[str, Any]:
        """Get comprehensive synchronization status with detailed metrics."""
        pending_operations = self._get_total_pending_operations()
        priority_breakdown = self._get_priority_breakdown()
        offline_data = self.get_offline_data(user_id)

        # Calculate sync health score
        sync_health = self._calculate_sync_health_score(user_id)

        # Get bandwidth and performance metrics
        bandwidth_stats = self.bandwidth_monitor.get_stats()

        return {
            "user_id": user_id,
            "sync_health_score": sync_health,
            "pending_operations": pending_operations,
            "priority_breakdown": priority_breakdown,
            "offline_data_count": len(offline_data),
            "pending_conflicts": len(self.pending_conflicts),
            "last_sync": self.sync_metadata.get(user_id, {}).get("last_sync"),
            "bandwidth_stats": bandwidth_stats,
            "metrics": self.metrics.copy(),
            "estimated_sync_time": self._estimate_sync_time(),
            "storage_usage": self._calculate_storage_usage(),
        }

    def get_offline_data(self, user_id: int, data_type: str | None = None) -> list[dict[str, Any]]:
        """Get offline data for a user, optionally filtered by type."""
        data = [item for item in self.offline_storage.values() if item.get("needs_sync", False)]

        if data_type:
            data = [item for item in data if item.get("data_type") == data_type]

        # Sort by priority and creation time
        return sorted(data, key=lambda x: (
            self._get_priority_value(x.get("priority", "normal")),
            x.get("created_at", "")
        ))

    async def execute_workflow_offline(
        self, workflow_name: str, parameters: dict[str, Any], user_id: int
    ) -> dict[str, Any]:
        """
        Execute workflow operations offline with intelligent queuing.

        Args:
            workflow_name: Name of workflow to execute
            parameters: Workflow parameters
            user_id: User identifier

        Returns:
            Dictionary with execution results and sync details
        """
        workflow_id = f"workflow_{workflow_name}_{uuid4().hex[:8]}"

        # Create workflow execution data
        workflow_data = {
            "workflow_id": workflow_id,
            "workflow_name": workflow_name,
            "parameters": parameters,
            "user_id": user_id,
            "status": "queued_offline",
            "created_at": datetime.now().isoformat(),
        }

        # Store workflow execution offline
        result = await self.store_offline_data(
            workflow_data,
            data_type="workflow_execution",
            priority=SyncPriority.HIGH  # Workflows get high priority
        )

        # Create dependencies for workflow steps
        workflow_steps = parameters.get("steps", [])
        step_operations = []

        for i, step in enumerate(workflow_steps):
            step_id = f"{workflow_id}_step_{i}"
            step_data = {
                "step_id": step_id,
                "workflow_id": workflow_id,
                "step_index": i,
                "step_config": step,
                "status": "pending",
            }

            step_result = await self.store_offline_data(
                step_data,
                data_type="workflow_step",
                priority=SyncPriority.HIGH
            )

            step_operations.append({
                "step_id": step_id,
                "offline_id": step_result["offline_id"],
                "depends_on": [workflow_id] if i == 0 else [f"{workflow_id}_step_{i-1}"]
            })

        return {
            "status": "success",
            "workflow_id": workflow_id,
            "offline_id": result["offline_id"],
            "step_operations": step_operations,
            "will_sync": True,
            "estimated_sync_priority": "HIGH"
        }

    # Helper methods for enhanced functionality
    def _calculate_data_hash(self, data: dict[str, Any]) -> str:
        """Calculate hash for data integrity checking."""
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_str.encode()).hexdigest()[:16]

    def _calculate_storage_stats(self) -> dict[str, Any]:
        """Calculate storage statistics."""
        total_items = len(self.offline_storage)
        total_size = sum(item.get("size_bytes", 0) for item in self.offline_storage.values())
        needs_sync = len([item for item in self.offline_storage.values() if item.get("needs_sync")])

        return {
            "total_items": total_items,
            "total_size_bytes": total_size,
            "items_needing_sync": needs_sync,
            "sync_completion_rate": (total_items - needs_sync) / max(total_items, 1) * 100
        }

    def _get_total_pending_operations(self) -> int:
        """Get total number of pending operations across all queues."""
        return sum(len(queue) for queue in self.sync_queues.values())

    def _get_priority_breakdown(self) -> dict[str, int]:
        """Get breakdown of operations by priority."""
        return {priority.name: len(queue) for priority, queue in self.sync_queues.items()}

    def _calculate_sync_health_score(self, user_id: int) -> float:
        """Calculate sync health score (0-100)."""
        total_ops = self._get_total_pending_operations()
        conflicts = len(self.pending_conflicts)
        failed_ratio = self.metrics["failed_syncs"] / max(self.metrics["total_operations"], 1)

        # Simple health score calculation
        health_score = 100.0
        health_score -= min(total_ops * 2, 50)  # Penalty for pending operations
        health_score -= min(conflicts * 10, 30)  # Penalty for conflicts
        health_score -= failed_ratio * 20  # Penalty for failures

        return max(0.0, health_score)

    def _estimate_sync_time(self) -> dict[str, Any]:
        """Estimate time required to complete pending sync operations."""
        total_ops = self._get_total_pending_operations()
        avg_op_time = 2.0  # seconds per operation (estimate)

        return {
            "estimated_seconds": total_ops * avg_op_time,
            "operations_remaining": total_ops,
            "bottlenecks": self._identify_sync_bottlenecks()
        }

    def _identify_sync_bottlenecks(self) -> list[str]:
        """Identify potential sync bottlenecks."""
        bottlenecks = []

        if len(self.pending_conflicts) > 5:
            bottlenecks.append("High number of pending conflicts")

        if self.metrics["failed_syncs"] / max(self.metrics["total_operations"], 1) > 0.1:
            bottlenecks.append("High failure rate")

        critical_ops = len(self.sync_queues[SyncPriority.CRITICAL])
        if critical_ops > 10:
            bottlenecks.append(f"Large critical operation queue ({critical_ops} items)")

        return bottlenecks

    def _calculate_storage_usage(self) -> dict[str, Any]:
        """Calculate storage usage statistics."""
        total_size = sum(item.get("size_bytes", 0) for item in self.offline_storage.values())

        return {
            "total_bytes": total_size,
            "total_mb": total_size / (1024 * 1024),
            "item_count": len(self.offline_storage),
            "avg_item_size": total_size / max(len(self.offline_storage), 1)
        }

    def _get_priority_value(self, priority_str: str) -> int:
        """Convert priority string to numerical value for sorting."""
        priority_map = {"critical": 1, "high": 2, "normal": 3, "low": 4, "background": 5}
        return priority_map.get(priority_str.lower(), 3)

    async def _process_sync_operation(
        self, sync_operation: SyncOperation, user_id: int, bandwidth_limit: int | None = None
    ) -> dict[str, Any]:
        """Process individual sync operation with enhanced capabilities."""
        logger.info(f"Processing sync operation: {sync_operation.action} for {sync_operation.id}")

        # Check bandwidth constraints
        operation_size = sync_operation.metadata.get("original_size", 0)
        if bandwidth_limit and operation_size > bandwidth_limit:
            return {
                "status": "deferred",
                "details": "Operation deferred due to bandwidth constraints",
                "bandwidth_used": 0
            }

        # Check dependencies
        if sync_operation.dependencies:
            dependency_check = await self._check_dependencies(sync_operation.dependencies)
            if not dependency_check["all_satisfied"]:
                return {
                    "status": "waiting",
                    "details": f"Waiting for dependencies: {dependency_check['missing']}",
                    "bandwidth_used": 0
                }

        action = sync_operation.action
        data = sync_operation.data
        offline_id = sync_operation.id

        try:
            if action == "create":
                return await self._handle_create_operation(data, user_id, offline_id)
            elif action == "update":
                return await self._handle_update_operation(data, user_id, offline_id)
            elif action == "delete":
                return await self._handle_delete_operation(data, user_id, offline_id)
            else:
                return {
                    "status": "error",
                    "details": f"Unknown sync action: {action}",
                    "bandwidth_used": 0
                }

        except Exception as e:
            # Increment retry count
            sync_operation.retry_count += 1

            if sync_operation.retry_count < sync_operation.max_retries:
                return {
                    "status": "retry",
                    "details": f"Operation failed, will retry: {str(e)}",
                    "bandwidth_used": 0
                }
            else:
                return {
                    "status": "failed",
                    "details": f"Operation failed after {sync_operation.max_retries} retries: {str(e)}",
                    "bandwidth_used": 0
                }

    async def _handle_sync_conflict(
        self, sync_operation: SyncOperation, conflict_data: dict[str, Any], user_id: int
    ) -> dict[str, Any]:
        """Handle synchronization conflict with advanced resolution."""
        conflict = ConflictDetails(
            id=f"conflict_{uuid4().hex[:8]}",
            offline_data=sync_operation.data,
            server_data=conflict_data.get("server_data", {}),
            conflict_type=conflict_data.get("type", "data_mismatch"),
            created_at=datetime.now()
        )

        # Store pending conflict
        self.pending_conflicts[conflict.id] = conflict

        # Attempt automatic resolution
        resolution_result = await self.conflict_resolver.auto_resolve_conflict(
            conflict, user_preferences=None  # Could be retrieved from user settings
        )

        if resolution_result["resolved"]:
            # Apply resolved data
            resolved_data = resolution_result["final_data"]

            # Update sync operation with resolved data
            sync_operation.data = resolved_data
            sync_operation.metadata["conflict_resolved"] = True
            sync_operation.metadata["resolution_strategy"] = resolution_result["strategy"]

            # Remove from pending conflicts
            del self.pending_conflicts[conflict.id]

            return {
                "resolved": True,
                "strategy": resolution_result["strategy"],
                "final_data": resolved_data
            }
        else:
            return {
                "resolved": False,
                "conflict_id": conflict.id,
                "requires_manual_review": True,
                "conflict_details": {
                    "type": conflict.conflict_type,
                    "offline_data": conflict.offline_data,
                    "server_data": conflict.server_data
                }
            }

    async def _check_dependencies(self, dependencies: list[str]) -> dict[str, Any]:
        """Check if operation dependencies are satisfied."""
        missing_deps = []

        for dep_id in dependencies:
            # Check if dependency operation has completed
            if not await self._is_dependency_satisfied(dep_id):
                missing_deps.append(dep_id)

        return {
            "all_satisfied": len(missing_deps) == 0,
            "missing": missing_deps,
            "satisfied_count": len(dependencies) - len(missing_deps)
        }

    async def _is_dependency_satisfied(self, dependency_id: str) -> bool:
        """Check if a specific dependency is satisfied."""
        # Mock implementation - check if operation completed
        return dependency_id not in [op.id for queue in self.sync_queues.values() for op in queue]

    async def _handle_create_operation(
        self, data: dict[str, Any], user_id: int, offline_id: str
    ) -> dict[str, Any]:
        """Handle create operation with conflict detection."""
        # Check if data already exists on server
        existing_data = await self._check_server_data_exists(data, user_id)

        if existing_data:
            return {
                "status": "conflict",
                "details": "Data already exists on server",
                "conflict_data": {
                    "type": "duplicate_creation",
                    "server_data": existing_data
                },
                "bandwidth_used": 100  # Small amount for conflict check
            }

        # Create new data on server
        created = await self._create_server_data(data, user_id)

        if created:
            # Update local data with server ID
            if offline_id in self.offline_storage:
                self.offline_storage[offline_id]["server_id"] = created["id"]
                self.offline_storage[offline_id]["needs_sync"] = False
                self.offline_storage[offline_id]["synced_at"] = datetime.now().isoformat()

            return {
                "status": "success",
                "details": f"Data created on server with ID {created['id']}",
                "bandwidth_used": self.offline_storage[offline_id].get("size_bytes", 0)
            }
        else:
            return {
                "status": "error",
                "details": "Failed to create data on server",
                "bandwidth_used": 0
            }

    async def _handle_update_operation(
        self, data: dict[str, Any], user_id: int, offline_id: str
    ) -> dict[str, Any]:
        """Handle update operation with conflict detection."""
        # Get current server version for conflict checking
        server_data = await self._get_server_data(data.get("server_id"), user_id)

        if server_data:
            # Check for conflicts
            if self._has_update_conflict(data, server_data):
                return {
                    "status": "conflict",
                    "details": "Update conflict detected",
                    "conflict_data": {
                        "type": "concurrent_update",
                        "server_data": server_data
                    },
                    "bandwidth_used": 100
                }

        # Update data on server
        updated = await self._update_server_data(data, user_id)

        if updated:
            if offline_id in self.offline_storage:
                self.offline_storage[offline_id]["needs_sync"] = False
                self.offline_storage[offline_id]["synced_at"] = datetime.now().isoformat()

            return {
                "status": "success",
                "details": "Data updated on server",
                "bandwidth_used": self.offline_storage[offline_id].get("size_bytes", 0)
            }
        else:
            return {
                "status": "error",
                "details": "Failed to update data on server",
                "bandwidth_used": 0
            }

    async def _handle_delete_operation(
        self, data: dict[str, Any], user_id: int, offline_id: str
    ) -> dict[str, Any]:
        """Handle delete operation."""
        deleted = await self._delete_server_data(data, user_id)

        if deleted:
            if offline_id in self.offline_storage:
                del self.offline_storage[offline_id]  # Remove from local storage

            return {
                "status": "success",
                "details": "Data deleted on server",
                "bandwidth_used": 50  # Small amount for delete operation
            }
        else:
            return {
                "status": "error",
                "details": "Failed to delete data on server",
                "bandwidth_used": 0
            }

    def _has_update_conflict(self, local_data: dict[str, Any], server_data: dict[str, Any]) -> bool:
        """Check if update operation has conflicts."""
        local_hash = local_data.get("data_hash")
        server_hash = self._calculate_data_hash(server_data.get("original_data", {}))

        # Simple conflict detection based on data hash
        return local_hash != server_hash

    # Mock server interaction methods (replace with actual implementations)
    async def _check_server_data_exists(
        self, data: dict[str, Any], user_id: int
    ) -> dict[str, Any] | None:
        """Check if data already exists on server."""
        # Mock implementation - simulate conflict detection
        original_data = data.get("original_data", {})
        if "conflict" in str(original_data).lower():
            return {
                "id": f"server_data_{uuid4().hex[:8]}",
                "original_data": original_data,
                "created_at": datetime.now().isoformat(),
                "last_modified": datetime.now().isoformat(),
            }
        return None

    async def _create_server_data(
        self, data: dict[str, Any], user_id: int
    ) -> dict[str, Any] | None:
        """Create data on server."""
        logger.info(f"Creating data on server for user {user_id}")

        # Simulate network delay
        await asyncio.sleep(0.1)

        return {
            "id": f"server_data_{uuid4().hex[:8]}",
            "original_data": data.get("original_data", {}),
            "created_at": data.get("created_at"),
            "user_id": user_id,
        }

    async def _get_server_data(
        self, data_id: str | None, user_id: int
    ) -> dict[str, Any] | None:
        """Get current data from server."""
        if not data_id:
            return None

        # Mock implementation
        await asyncio.sleep(0.05)

        return {
            "id": data_id,
            "original_data": {"mock": "server_data"},
            "last_modified": datetime.now().isoformat(),
        }

    async def _update_server_data(self, data: dict[str, Any], user_id: int) -> bool:
        """Update data on server."""
        logger.info(f"Updating data on server: {data.get('offline_id', 'unknown')}")
        await asyncio.sleep(0.1)
        return True

    async def _delete_server_data(self, data: dict[str, Any], user_id: int) -> bool:
        """Delete data on server."""
        logger.info(f"Deleting data on server: {data.get('offline_id', 'unknown')}")
        await asyncio.sleep(0.1)
        return True


class AdvancedConflictResolver:
    """Advanced conflict resolution with multiple strategies."""

    def __init__(self):
        self.resolution_strategies = {
            ConflictResolutionStrategy.SERVER_WINS: self._resolve_server_wins,
            ConflictResolutionStrategy.CLIENT_WINS: self._resolve_client_wins,
            ConflictResolutionStrategy.MERGE: self._resolve_merge,
            ConflictResolutionStrategy.TIMESTAMP_BASED: self._resolve_timestamp_based,
            ConflictResolutionStrategy.MANUAL: self._resolve_manual,
        }

    async def group_similar_conflicts(
        self, conflicts: list[ConflictDetails]
    ) -> dict[str, list[ConflictDetails]]:
        """Group similar conflicts for batch resolution."""
        groups = defaultdict(list)

        for conflict in conflicts:
            # Group by conflict type and data similarity
            group_key = f"{conflict.conflict_type}_{self._calculate_similarity_hash(conflict)}"
            groups[group_key].append(conflict)

        return dict(groups)

    async def recommend_strategy(
        self, conflicts: list[ConflictDetails], user_preferences: dict[str, Any] | None
    ) -> ConflictResolutionStrategy:
        """Recommend optimal resolution strategy for conflicts."""
        if not conflicts:
            return ConflictResolutionStrategy.MERGE

        # Analyze conflict characteristics
        conflict_analysis = self._analyze_conflicts(conflicts)

        # Apply user preferences if available
        if user_preferences:
            preferred_strategy = user_preferences.get("default_conflict_resolution")
            if preferred_strategy and preferred_strategy in [s.value for s in ConflictResolutionStrategy]:
                return ConflictResolutionStrategy(preferred_strategy)

        # Choose strategy based on analysis
        if conflict_analysis["has_timestamp_conflicts"]:
            return ConflictResolutionStrategy.TIMESTAMP_BASED
        elif conflict_analysis["simple_conflicts"] > conflict_analysis["complex_conflicts"]:
            return ConflictResolutionStrategy.MERGE
        else:
            return ConflictResolutionStrategy.MANUAL

    async def resolve_conflict_group(
        self, conflicts: list[ConflictDetails], strategy: ConflictResolutionStrategy,
        user_preferences: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Resolve a group of conflicts using specified strategy."""
        results = {"resolved": 0, "pending_manual": 0, "failed": 0, "details": []}

        for conflict in conflicts:
            try:
                resolution_result = await self._apply_resolution_strategy(
                    conflict, strategy, user_preferences
                )

                if resolution_result["success"]:
                    results["resolved"] += 1
                elif resolution_result.get("requires_manual"):
                    results["pending_manual"] += 1
                else:
                    results["failed"] += 1

                results["details"].append({
                    "conflict_id": conflict.id,
                    "strategy": strategy.value,
                    "result": resolution_result.get("status", "unknown"),
                    "final_data": resolution_result.get("final_data")
                })

            except Exception as e:
                logger.error(f"Failed to resolve conflict {conflict.id}: {e}")
                results["failed"] += 1

        return results

    async def auto_resolve_conflict(
        self, conflict: ConflictDetails, user_preferences: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Attempt automatic conflict resolution."""
        # Determine best strategy for this specific conflict
        strategy = await self._determine_best_strategy(conflict, user_preferences)

        if strategy == ConflictResolutionStrategy.MANUAL:
            return {
                "resolved": False,
                "requires_manual": True,
                "strategy": strategy.value
            }

        # Apply automatic resolution
        result = await self._apply_resolution_strategy(conflict, strategy, user_preferences)

        return {
            "resolved": result["success"],
            "strategy": strategy.value,
            "final_data": result.get("final_data"),
            "confidence": result.get("confidence", 0.5)
        }

    def _calculate_similarity_hash(self, conflict: ConflictDetails) -> str:
        """Calculate hash for grouping similar conflicts."""
        # Simple similarity based on data structure
        offline_keys = set(conflict.offline_data.keys())
        server_keys = set(conflict.server_data.keys())
        common_keys = offline_keys.intersection(server_keys)

        return hashlib.sha256(str(sorted(common_keys)).encode()).hexdigest()[:8]

    def _analyze_conflicts(self, conflicts: list[ConflictDetails]) -> dict[str, Any]:
        """Analyze conflicts to determine characteristics."""
        analysis = {
            "total_conflicts": len(conflicts),
            "has_timestamp_conflicts": False,
            "simple_conflicts": 0,
            "complex_conflicts": 0,
            "conflict_types": defaultdict(int)
        }

        for conflict in conflicts:
            analysis["conflict_types"][conflict.conflict_type] += 1

            # Check for timestamp-based conflicts
            offline_ts = conflict.offline_data.get("last_modified")
            server_ts = conflict.server_data.get("last_modified")
            if offline_ts and server_ts:
                analysis["has_timestamp_conflicts"] = True

            # Classify conflict complexity
            offline_keys = len(conflict.offline_data.keys())
            server_keys = len(conflict.server_data.keys())

            if abs(offline_keys - server_keys) <= 2:
                analysis["simple_conflicts"] += 1
            else:
                analysis["complex_conflicts"] += 1

        return analysis

    async def _determine_best_strategy(
        self, conflict: ConflictDetails, user_preferences: dict[str, Any] | None
    ) -> ConflictResolutionStrategy:
        """Determine best resolution strategy for individual conflict."""
        # Check if timestamps are available for timestamp-based resolution
        offline_ts = conflict.offline_data.get("last_modified")
        server_ts = conflict.server_data.get("last_modified")

        if offline_ts and server_ts:
            return ConflictResolutionStrategy.TIMESTAMP_BASED

        # Check conflict complexity
        if self._is_simple_conflict(conflict):
            return ConflictResolutionStrategy.MERGE

        return ConflictResolutionStrategy.MANUAL

    def _is_simple_conflict(self, conflict: ConflictDetails) -> bool:
        """Determine if conflict is simple enough for automatic resolution."""
        offline_keys = set(conflict.offline_data.keys())
        server_keys = set(conflict.server_data.keys())

        # Simple conflict: similar key structure, no complex nested data
        return (
            len(offline_keys.symmetric_difference(server_keys)) <= 2 and
            conflict.conflict_type in ["data_mismatch", "concurrent_update"]
        )

    async def _apply_resolution_strategy(
        self, conflict: ConflictDetails, strategy: ConflictResolutionStrategy,
        user_preferences: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Apply specific resolution strategy to conflict."""
        resolver = self.resolution_strategies.get(strategy)
        if not resolver:
            return {"success": False, "error": f"Unknown strategy: {strategy}"}

        try:
            result = await resolver(conflict, user_preferences)
            return {
                "success": True,
                "final_data": result,
                "status": "resolved",
                "confidence": 0.8
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "requires_manual": True,
                "status": "failed"
            }

    async def _resolve_server_wins(
        self, conflict: ConflictDetails, user_preferences: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Resolve conflict by preferring server version."""
        logger.info(f"Resolving conflict {conflict.id}: server wins")
        return conflict.server_data

    async def _resolve_client_wins(
        self, conflict: ConflictDetails, user_preferences: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Resolve conflict by preferring client version."""
        logger.info(f"Resolving conflict {conflict.id}: client wins")
        final_data = conflict.offline_data.copy()
        # Preserve server ID if available
        if "id" in conflict.server_data:
            final_data["id"] = conflict.server_data["id"]
        return final_data

    async def _resolve_merge(
        self, conflict: ConflictDetails, user_preferences: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Resolve conflict by merging both versions."""
        logger.info(f"Resolving conflict {conflict.id}: merge strategy")

        merged = conflict.server_data.copy()

        # Merge strategies based on data type
        for key, offline_value in conflict.offline_data.items():
            if key not in merged:
                merged[key] = offline_value
            elif key in ["title", "content", "description"]:
                # Prefer offline for content fields
                merged[key] = offline_value
            elif key == "priority":
                # Take higher priority
                merged[key] = self._merge_priority(merged.get(key), offline_value)

        merged["last_modified"] = datetime.now().isoformat()
        merged["conflict_resolved"] = True

        return merged

    async def _resolve_timestamp_based(
        self, conflict: ConflictDetails, user_preferences: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Resolve conflict based on timestamps."""
        logger.info(f"Resolving conflict {conflict.id}: timestamp-based")

        offline_ts = conflict.offline_data.get("last_modified")
        server_ts = conflict.server_data.get("last_modified")

        if not offline_ts or not server_ts:
            # Fallback to merge if timestamps unavailable
            return await self._resolve_merge(conflict, user_preferences)

        offline_time = datetime.fromisoformat(offline_ts)
        server_time = datetime.fromisoformat(server_ts)

        if offline_time > server_time:
            return await self._resolve_client_wins(conflict, user_preferences)
        else:
            return await self._resolve_server_wins(conflict, user_preferences)

    async def _resolve_manual(
        self, conflict: ConflictDetails, user_preferences: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Mark conflict for manual resolution."""
        logger.info(f"Conflict {conflict.id} requires manual resolution")
        # In a real implementation, this would queue for user review
        raise Exception("Manual resolution required")

    def _merge_priority(self, server_priority: Any, offline_priority: Any) -> Any:
        """Merge priority values, taking the higher priority."""
        priority_order = ["low", "medium", "high", "urgent"]

        try:
            server_idx = priority_order.index(str(server_priority).lower())
            offline_idx = priority_order.index(str(offline_priority).lower())
            return priority_order[max(server_idx, offline_idx)]
        except (ValueError, IndexError):
            return offline_priority  # Fallback to offline if comparison fails


class SyncOrchestrator:
    """Orchestrate sync sessions with workflow engine integration."""

    def __init__(self, workflow_engine=None):
        self.workflow_engine = workflow_engine
        self.active_sessions = {}

    async def start_sync_session(self, user_id: int, session_config: dict[str, Any]) -> dict[str, Any]:
        """Start a new sync session."""
        session_id = f"sync_session_{uuid4().hex[:8]}"

        session = {
            "id": session_id,
            "user_id": user_id,
            "config": session_config,
            "started_at": datetime.now().isoformat(),
            "status": "active"
        }

        self.active_sessions[session_id] = session

        # Trigger sync start workflow if available
        if self.workflow_engine:
            await self._trigger_sync_workflow("sync_started", session)

        logger.info(f"Started sync session {session_id} for user {user_id}")
        return session

    async def complete_sync_session(
        self, session_id: str, results: dict[str, Any]
    ) -> dict[str, Any]:
        """Complete a sync session with results."""
        if session_id not in self.active_sessions:
            raise ValueError(f"Unknown session: {session_id}")

        session = self.active_sessions[session_id]
        session["completed_at"] = datetime.now().isoformat()
        session["results"] = results
        session["status"] = "completed"

        # Trigger completion workflow if available
        if self.workflow_engine:
            await self._trigger_sync_workflow("sync_completed", session)

        # Clean up session
        del self.active_sessions[session_id]

        logger.info(f"Completed sync session {session_id}")
        return session

    async def _trigger_sync_workflow(self, event_type: str, session: dict[str, Any]):
        """Trigger sync-related workflow events."""
        try:
            # Mock workflow triggering
            logger.info(f"Triggering sync workflow: {event_type} for session {session['id']}")
        except Exception as e:
            logger.error(f"Failed to trigger sync workflow: {e}")


class RetryScheduler:
    """Schedule retry operations for failed sync attempts."""

    def __init__(self):
        self.retry_queue = deque()
        self.retry_delays = [5, 15, 30, 60, 300]  # Exponential backoff in seconds

    async def schedule_retry(self, sync_operation: SyncOperation):
        """Schedule operation for retry with exponential backoff."""
        if sync_operation.retry_count >= sync_operation.max_retries:
            logger.warning(f"Operation {sync_operation.id} exceeded max retries")
            return

        delay_idx = min(sync_operation.retry_count, len(self.retry_delays) - 1)
        retry_delay = self.retry_delays[delay_idx]

        retry_time = datetime.now() + timedelta(seconds=retry_delay)

        self.retry_queue.append({
            "operation": sync_operation,
            "retry_at": retry_time,
            "attempt": sync_operation.retry_count + 1
        })

        logger.info(
            f"Scheduled retry for operation {sync_operation.id} "
            f"in {retry_delay} seconds (attempt {sync_operation.retry_count + 1})"
        )

    def get_ready_retries(self) -> list[SyncOperation]:
        """Get operations ready for retry."""
        now = datetime.now()
        ready_operations = []

        while self.retry_queue and self.retry_queue[0]["retry_at"] <= now:
            retry_item = self.retry_queue.popleft()
            retry_item["operation"].retry_count += 1
            ready_operations.append(retry_item["operation"])

        return ready_operations


class BandwidthMonitor:
    """Monitor and manage bandwidth usage."""

    def __init__(self):
        self.usage_history = deque(maxlen=100)
        self.current_session_usage = 0

    def record_usage(self, bytes_used: int):
        """Record bandwidth usage."""
        self.usage_history.append({
            "bytes": bytes_used,
            "timestamp": datetime.now().isoformat()
        })
        self.current_session_usage += bytes_used

    def get_stats(self) -> dict[str, Any]:
        """Get bandwidth usage statistics."""
        if not self.usage_history:
            return {"total_bytes": 0, "average_per_operation": 0, "peak_usage": 0}

        total_bytes = sum(record["bytes"] for record in self.usage_history)
        average_per_operation = total_bytes / len(self.usage_history)
        peak_usage = max(record["bytes"] for record in self.usage_history)

        return {
            "total_bytes": total_bytes,
            "average_per_operation": average_per_operation,
            "peak_usage": peak_usage,
            "current_session": self.current_session_usage,
            "operations_tracked": len(self.usage_history)
        }

    def estimate_operation_bandwidth(self, operation_size: int) -> int:
        """Estimate bandwidth needed for operation."""
        # Add overhead estimation (headers, protocol overhead, etc.)
        overhead_factor = 1.2
        return int(operation_size * overhead_factor)


class ProgressiveSyncManager:
    """Manage progressive synchronization capabilities."""

    def __init__(self):
        self.sync_checkpoints = {}
        self.delta_tracking = defaultdict(list)

    async def create_checkpoint(self, user_id: int, data_snapshot: dict[str, Any]) -> str:
        """Create a sync checkpoint for incremental sync."""
        checkpoint_id = f"checkpoint_{uuid4().hex[:8]}"

        self.sync_checkpoints[checkpoint_id] = {
            "id": checkpoint_id,
            "user_id": user_id,
            "data_snapshot": data_snapshot,
            "created_at": datetime.now().isoformat()
        }

        logger.info(f"Created sync checkpoint {checkpoint_id} for user {user_id}")
        return checkpoint_id

    async def calculate_delta(
        self, checkpoint_id: str, current_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Calculate delta changes since checkpoint."""
        if checkpoint_id not in self.sync_checkpoints:
            raise ValueError(f"Unknown checkpoint: {checkpoint_id}")

        checkpoint = self.sync_checkpoints[checkpoint_id]
        snapshot_data = checkpoint["data_snapshot"]

        delta = {
            "added": [],
            "modified": [],
            "deleted": [],
            "unchanged": []
        }

        # Simple delta calculation (can be enhanced)
        snapshot_keys = set(snapshot_data.keys())
        current_keys = set(current_data.keys())

        delta["added"] = list(current_keys - snapshot_keys)
        delta["deleted"] = list(snapshot_keys - current_keys)

        for key in snapshot_keys.intersection(current_keys):
            if snapshot_data[key] != current_data[key]:
                delta["modified"].append(key)
            else:
                delta["unchanged"].append(key)

        return delta


# Backward compatibility alias
OfflineManager = EnhancedOfflineManager

# Additional aliases and stubs for test compatibility
ConflictResolution = ConflictResolutionStrategy
NetworkState = str  # TODO: Create proper NetworkState enum
OfflineQueueManager = SyncOrchestrator  # Alias to existing class
SyncConfiguration = dict  # TODO: Create proper SyncConfiguration class

# Export all public classes
__all__ = [
    "SyncPriority",
    "ConflictResolutionStrategy",
    "SyncOperation",
    "ConflictDetails",
    "EnhancedOfflineManager",
    "AdvancedConflictResolver",
    "SyncOrchestrator",
    "RetryScheduler",
    "BandwidthMonitor",
    "ProgressiveSyncManager",
    "OfflineManager",
    # Aliases for test compatibility
    "ConflictResolution",
    "NetworkState",
    "OfflineQueueManager",
    "SyncConfiguration",
]
