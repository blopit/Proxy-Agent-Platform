"""
WebSocket manager for real-time dashboard updates.

Manages WebSocket connections and broadcasts real-time updates
for agent status, XP changes, and productivity metrics.
"""

import json
from collections import defaultdict
from datetime import datetime
from typing import Any

from fastapi import WebSocket


class WebSocketManager:
    """
    WebSocket connection manager for real-time dashboard updates.

    Handles connection lifecycle, user-specific broadcasting,
    and real-time event distribution.
    """

    def __init__(self):
        """Initialize WebSocket manager."""
        self.active_connections: dict[int, WebSocket] = {}
        self.connection_metadata: dict[int, dict[str, Any]] = defaultdict(dict)

    async def connect(self, websocket: WebSocket, user_id: int):
        """
        Accept WebSocket connection for user.

        Args:
            websocket: WebSocket connection
            user_id: User ID for this connection
        """
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.connection_metadata[user_id] = {
            "connected_at": datetime.now(),
            "last_ping": datetime.now(),
        }

    def disconnect(self, user_id: int):
        """
        Remove user's WebSocket connection.

        Args:
            user_id: User ID to disconnect
        """
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.connection_metadata:
            del self.connection_metadata[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        """
        Send message to specific user.

        Args:
            message: Message to send
            user_id: Target user ID
        """
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_text(message)
            except Exception:
                # Connection lost, remove it
                self.disconnect(user_id)

    async def broadcast_to_user(self, user_id: int, data: dict[str, Any]):
        """
        Broadcast data to specific user's WebSocket.

        Args:
            user_id: Target user ID
            data: Data to broadcast
        """
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                message = json.dumps(data, default=str)
                await websocket.send_text(message)
            except Exception:
                # Connection lost, remove it
                self.disconnect(user_id)

    async def broadcast_to_all(self, data: dict[str, Any]):
        """
        Broadcast data to all connected users.

        Args:
            data: Data to broadcast
        """
        if not self.active_connections:
            return

        message = json.dumps(data, default=str)
        disconnected_users = []

        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
            except Exception:
                # Mark for disconnection
                disconnected_users.append(user_id)

        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

    def get_connected_users(self) -> list[int]:
        """
        Get list of currently connected user IDs.

        Returns:
            List of connected user IDs
        """
        return list(self.active_connections.keys())

    def is_user_connected(self, user_id: int) -> bool:
        """
        Check if user is currently connected.

        Args:
            user_id: User ID to check

        Returns:
            True if user is connected
        """
        return user_id in self.active_connections


# Global WebSocket manager instance
websocket_manager = WebSocketManager()
