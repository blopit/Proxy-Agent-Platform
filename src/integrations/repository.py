"""
Repository layer for provider integration database operations.

Handles CRUD operations for:
- user_integrations (OAuth connections)
- integration_tasks (AI-generated task suggestions)
- integration_sync_logs (sync history)
"""

import json
import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from src.database.enhanced_adapter import EnhancedDatabaseAdapter

logger = logging.getLogger(__name__)


class IntegrationRepository:
    """Repository for provider integration database operations."""

    def __init__(self, db: EnhancedDatabaseAdapter):
        """
        Initialize integration repository.

        Args:
            db: Database adapter instance
        """
        self.db = db

    # ========================================================================
    # User Integrations (OAuth Connections)
    # ========================================================================

    def create_integration(
        self,
        user_id: str,
        provider: str,
        access_token: str,
        refresh_token: str,
        token_expires_at: datetime,
        scopes: list[str],
        provider_user_id: str,
        provider_username: str,
        settings: Optional[dict] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Create a new provider integration.

        Args:
            user_id: User ID
            provider: Provider type (gmail, google_calendar, etc.)
            access_token: Encrypted OAuth access token
            refresh_token: Encrypted OAuth refresh token
            token_expires_at: Token expiration datetime
            scopes: List of granted OAuth scopes
            provider_user_id: User ID from provider
            provider_username: Username from provider
            settings: Provider-specific settings
            metadata: Additional metadata

        Returns:
            Created integration data
        """
        integration_id = str(uuid4())
        now = datetime.now(timezone.utc)

        query = """
        INSERT INTO user_integrations (
            integration_id, user_id, provider, status,
            access_token, refresh_token, token_expires_at, scopes,
            provider_user_id, provider_username,
            sync_enabled, auto_generate_tasks,
            settings, metadata, connected_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        self.db.execute_write(
            query,
            (
                integration_id,
                user_id,
                provider,
                "connected",
                access_token,
                refresh_token,
                token_expires_at.isoformat(),
                json.dumps(scopes),
                provider_user_id,
                provider_username,
                1,  # sync_enabled
                1,  # auto_generate_tasks
                json.dumps(settings or {}),
                json.dumps(metadata or {}),
                now.isoformat(),
                now.isoformat(),
                now.isoformat(),
            ),
        )

        return self.get_integration(integration_id)

    def get_integration(self, integration_id: str) -> Optional[dict]:
        """
        Get integration by ID.

        Args:
            integration_id: Integration ID

        Returns:
            Integration data or None if not found
        """
        query = """
        SELECT
            integration_id, user_id, provider, status,
            access_token, refresh_token, token_expires_at, scopes,
            provider_user_id, provider_username,
            sync_enabled, auto_generate_tasks, last_sync_at,
            settings, metadata, connected_at, created_at, updated_at
        FROM user_integrations
        WHERE integration_id = ?
        """

        result = self.db.execute_read(query, (integration_id,))
        if not result:
            return None

        return self._parse_integration(result[0])

    def get_user_integrations(
        self, user_id: str, provider: Optional[str] = None, status: Optional[str] = None
    ) -> list[dict]:
        """
        Get all integrations for a user.

        Args:
            user_id: User ID
            provider: Optional provider filter
            status: Optional status filter

        Returns:
            List of integration data
        """
        query = """
        SELECT
            integration_id, user_id, provider, status,
            access_token, refresh_token, token_expires_at, scopes,
            provider_user_id, provider_username,
            sync_enabled, auto_generate_tasks, last_sync_at,
            settings, metadata, connected_at, created_at, updated_at
        FROM user_integrations
        WHERE user_id = ?
        """
        params = [user_id]

        if provider:
            query += " AND provider = ?"
            params.append(provider)

        if status:
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY created_at DESC"

        results = self.db.execute_read(query, tuple(params))
        return [self._parse_integration(row) for row in results]

    def update_integration(
        self,
        integration_id: str,
        access_token: Optional[str] = None,
        refresh_token: Optional[str] = None,
        token_expires_at: Optional[datetime] = None,
        status: Optional[str] = None,
        settings: Optional[dict] = None,
        last_sync_at: Optional[datetime] = None,
    ) -> Optional[dict]:
        """
        Update integration fields.

        Args:
            integration_id: Integration ID
            access_token: New encrypted access token
            refresh_token: New encrypted refresh token
            token_expires_at: New token expiration
            status: New status
            settings: Updated settings
            last_sync_at: Last sync timestamp

        Returns:
            Updated integration data or None if not found
        """
        updates = []
        params = []

        if access_token is not None:
            updates.append("access_token = ?")
            params.append(access_token)

        if refresh_token is not None:
            updates.append("refresh_token = ?")
            params.append(refresh_token)

        if token_expires_at is not None:
            updates.append("token_expires_at = ?")
            params.append(token_expires_at.isoformat())

        if status is not None:
            updates.append("status = ?")
            params.append(status)

        if settings is not None:
            updates.append("settings = ?")
            params.append(json.dumps(settings))

        if last_sync_at is not None:
            updates.append("last_sync_at = ?")
            params.append(last_sync_at.isoformat())

        if not updates:
            return self.get_integration(integration_id)

        updates.append("updated_at = ?")
        params.append(datetime.now(timezone.utc).isoformat())
        params.append(integration_id)

        query = f"UPDATE user_integrations SET {', '.join(updates)} WHERE integration_id = ?"

        self.db.execute_write(query, tuple(params))
        return self.get_integration(integration_id)

    def delete_integration(self, integration_id: str) -> bool:
        """
        Delete integration and all associated data.

        Args:
            integration_id: Integration ID

        Returns:
            True if deleted, False if not found
        """
        # Check if exists
        if not self.get_integration(integration_id):
            return False

        # Delete associated tasks
        self.db.execute_write(
            "DELETE FROM integration_tasks WHERE integration_id = ?",
            (integration_id,),
        )

        # Delete sync logs
        self.db.execute_write(
            "DELETE FROM integration_sync_logs WHERE integration_id = ?",
            (integration_id,),
        )

        # Delete integration
        self.db.execute_write(
            "DELETE FROM user_integrations WHERE integration_id = ?",
            (integration_id,),
        )

        return True

    # ========================================================================
    # Integration Tasks (AI Suggestions)
    # ========================================================================

    def create_integration_task(
        self,
        integration_id: str,
        provider_item_id: str,
        provider_item_type: str,
        suggested_title: str,
        suggested_description: Optional[str] = None,
        suggested_priority: Optional[str] = None,
        suggested_tags: Optional[list[str]] = None,
        suggested_deadline: Optional[datetime] = None,
        ai_confidence: Optional[float] = None,
        ai_reasoning: Optional[str] = None,
        ai_model: Optional[str] = None,
        provider_item_snapshot: Optional[dict] = None,
        sync_status: str = "pending_approval",
    ) -> dict:
        """
        Create AI-generated task suggestion.

        Args:
            integration_id: Integration ID
            provider_item_id: Provider item ID
            provider_item_type: Type of provider item
            suggested_title: Suggested task title
            suggested_description: Suggested task description
            suggested_priority: Suggested priority
            suggested_tags: Suggested tags
            suggested_deadline: Suggested deadline
            ai_confidence: AI confidence score (0.0-1.0)
            ai_reasoning: AI reasoning explanation
            ai_model: AI model used
            provider_item_snapshot: Full provider item data
            sync_status: Initial sync status

        Returns:
            Created integration task data
        """
        integration_task_id = str(uuid4())
        now = datetime.now(timezone.utc)

        query = """
        INSERT INTO integration_tasks (
            integration_task_id, integration_id, provider_item_id, provider_item_type,
            suggested_title, suggested_description, suggested_priority,
            suggested_tags, suggested_deadline,
            ai_confidence, ai_reasoning, ai_model,
            sync_status, provider_item_snapshot,
            metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        self.db.execute_write(
            query,
            (
                integration_task_id,
                integration_id,
                provider_item_id,
                provider_item_type,
                suggested_title,
                suggested_description,
                suggested_priority,
                json.dumps(suggested_tags or []),
                suggested_deadline.isoformat() if suggested_deadline else None,
                ai_confidence,
                ai_reasoning,
                ai_model,
                sync_status,
                json.dumps(provider_item_snapshot or {}),
                json.dumps({}),
                now.isoformat(),
                now.isoformat(),
            ),
        )

        return self.get_integration_task(integration_task_id)

    def get_integration_task(self, integration_task_id: str) -> Optional[dict]:
        """
        Get integration task by ID.

        Args:
            integration_task_id: Integration task ID

        Returns:
            Integration task data or None if not found
        """
        query = """
        SELECT
            integration_task_id, integration_id, task_id,
            provider_item_id, provider_item_type,
            suggested_title, suggested_description, suggested_priority,
            suggested_tags, suggested_deadline,
            ai_confidence, ai_reasoning, ai_model,
            sync_status, synced_at, approved_at, dismissed_at,
            provider_item_snapshot, metadata, created_at, updated_at
        FROM integration_tasks
        WHERE integration_task_id = ?
        """

        result = self.db.execute_read(query, (integration_task_id,))
        if not result:
            return None

        return self._parse_integration_task(result[0])

    def get_pending_tasks(
        self, user_id: str, provider: Optional[str] = None, limit: int = 50
    ) -> list[dict]:
        """
        Get pending task suggestions for user.

        Args:
            user_id: User ID
            provider: Optional provider filter
            limit: Max results

        Returns:
            List of pending integration task data
        """
        query = """
        SELECT
            it.integration_task_id, it.integration_id, it.task_id,
            it.provider_item_id, it.provider_item_type,
            it.suggested_title, it.suggested_description, it.suggested_priority,
            it.suggested_tags, it.suggested_deadline,
            it.ai_confidence, it.ai_reasoning, it.ai_model,
            it.sync_status, it.synced_at, it.approved_at, it.dismissed_at,
            it.provider_item_snapshot, it.metadata, it.created_at, it.updated_at
        FROM integration_tasks it
        JOIN user_integrations ui ON it.integration_id = ui.integration_id
        WHERE ui.user_id = ?
        AND it.sync_status = 'pending_approval'
        """
        params = [user_id]

        if provider:
            query += " AND ui.provider = ?"
            params.append(provider)

        query += " ORDER BY it.ai_confidence DESC, it.created_at DESC LIMIT ?"
        params.append(limit)

        results = self.db.execute_read(query, tuple(params))
        return [self._parse_integration_task(row) for row in results]

    def approve_task(self, integration_task_id: str, task_id: str) -> Optional[dict]:
        """
        Approve task suggestion and link to main task.

        Args:
            integration_task_id: Integration task ID
            task_id: Main task ID to link

        Returns:
            Updated integration task data or None if not found
        """
        now = datetime.now(timezone.utc)

        query = """
        UPDATE integration_tasks
        SET task_id = ?, sync_status = 'approved', approved_at = ?, updated_at = ?
        WHERE integration_task_id = ?
        """

        self.db.execute_write(
            query,
            (task_id, now.isoformat(), now.isoformat(), integration_task_id),
        )

        return self.get_integration_task(integration_task_id)

    def dismiss_task(self, integration_task_id: str) -> Optional[dict]:
        """
        Dismiss task suggestion.

        Args:
            integration_task_id: Integration task ID

        Returns:
            Updated integration task data or None if not found
        """
        now = datetime.now(timezone.utc)

        query = """
        UPDATE integration_tasks
        SET sync_status = 'dismissed', dismissed_at = ?, updated_at = ?
        WHERE integration_task_id = ?
        """

        self.db.execute_write(
            query,
            (now.isoformat(), now.isoformat(), integration_task_id),
        )

        return self.get_integration_task(integration_task_id)

    # ========================================================================
    # Sync Logs
    # ========================================================================

    def create_sync_log(
        self,
        integration_id: str,
        sync_status: str,
        items_fetched: int = 0,
        tasks_generated: int = 0,
        tasks_auto_approved: int = 0,
        api_calls_made: int = 0,
        error_message: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        """
        Create sync log entry.

        Args:
            integration_id: Integration ID
            sync_status: Sync status
            items_fetched: Number of items fetched
            tasks_generated: Number of tasks generated
            tasks_auto_approved: Number auto-approved
            api_calls_made: API calls made
            error_message: Error message if failed
            metadata: Additional metadata

        Returns:
            Created sync log data
        """
        log_id = str(uuid4())
        now = datetime.now(timezone.utc)

        query = """
        INSERT INTO integration_sync_logs (
            log_id, integration_id, sync_status, sync_started_at, sync_completed_at,
            items_fetched, tasks_generated, tasks_auto_approved, api_calls_made,
            error_message, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        self.db.execute_write(
            query,
            (
                log_id,
                integration_id,
                sync_status,
                now.isoformat(),
                now.isoformat(),
                items_fetched,
                tasks_generated,
                tasks_auto_approved,
                api_calls_made,
                error_message,
                json.dumps(metadata or {}),
            ),
        )

        return self.get_sync_log(log_id)

    def get_sync_log(self, log_id: str) -> Optional[dict]:
        """
        Get sync log by ID.

        Args:
            log_id: Sync log ID

        Returns:
            Sync log data or None if not found
        """
        query = """
        SELECT
            log_id, integration_id, sync_status,
            sync_started_at, sync_completed_at,
            items_fetched, tasks_generated, tasks_auto_approved, api_calls_made,
            error_message, metadata
        FROM integration_sync_logs
        WHERE log_id = ?
        """

        result = self.db.execute_read(query, (log_id,))
        if not result:
            return None

        return self._parse_sync_log(result[0])

    def get_sync_logs(
        self, integration_id: str, limit: int = 10
    ) -> list[dict]:
        """
        Get recent sync logs for integration.

        Args:
            integration_id: Integration ID
            limit: Max results

        Returns:
            List of sync log data
        """
        query = """
        SELECT
            log_id, integration_id, sync_status,
            sync_started_at, sync_completed_at,
            items_fetched, tasks_generated, tasks_auto_approved, api_calls_made,
            error_message, metadata
        FROM integration_sync_logs
        WHERE integration_id = ?
        ORDER BY sync_started_at DESC
        LIMIT ?
        """

        results = self.db.execute_read(query, (integration_id, limit))
        return [self._parse_sync_log(row) for row in results]

    # ========================================================================
    # Helper Methods
    # ========================================================================

    def _parse_integration(self, row: tuple) -> dict:
        """Parse integration database row to dict."""
        return {
            "integration_id": row[0],
            "user_id": row[1],
            "provider": row[2],
            "status": row[3],
            "access_token": row[4],
            "refresh_token": row[5],
            "token_expires_at": row[6],
            "scopes": json.loads(row[7]) if row[7] else [],
            "provider_user_id": row[8],
            "provider_username": row[9],
            "sync_enabled": bool(row[10]),
            "auto_generate_tasks": bool(row[11]),
            "last_sync_at": row[12],
            "settings": json.loads(row[13]) if row[13] else {},
            "metadata": json.loads(row[14]) if row[14] else {},
            "connected_at": row[15],
            "created_at": row[16],
            "updated_at": row[17],
        }

    def _parse_integration_task(self, row: tuple) -> dict:
        """Parse integration task database row to dict."""
        return {
            "integration_task_id": row[0],
            "integration_id": row[1],
            "task_id": row[2],
            "provider_item_id": row[3],
            "provider_item_type": row[4],
            "suggested_title": row[5],
            "suggested_description": row[6],
            "suggested_priority": row[7],
            "suggested_tags": json.loads(row[8]) if row[8] else [],
            "suggested_deadline": row[9],
            "ai_confidence": row[10],
            "ai_reasoning": row[11],
            "ai_model": row[12],
            "sync_status": row[13],
            "synced_at": row[14],
            "approved_at": row[15],
            "dismissed_at": row[16],
            "provider_item_snapshot": json.loads(row[17]) if row[17] else {},
            "metadata": json.loads(row[18]) if row[18] else {},
            "created_at": row[19],
            "updated_at": row[20],
        }

    def _parse_sync_log(self, row: tuple) -> dict:
        """Parse sync log database row to dict."""
        return {
            "log_id": row[0],
            "integration_id": row[1],
            "sync_status": row[2],
            "sync_started_at": row[3],
            "sync_completed_at": row[4],
            "items_fetched": row[5],
            "tasks_generated": row[6],
            "tasks_auto_approved": row[7],
            "api_calls_made": row[8],
            "error_message": row[9],
            "metadata": json.loads(row[10]) if row[10] else {},
        }
