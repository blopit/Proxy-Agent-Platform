"""
WebSocket Real-time Infrastructure

Implements WebSocket server for:
- Live dashboard data streaming
- Agent status broadcasting
- Push notification system
- Real-time updates
"""

import asyncio
import json
import logging
from datetime import UTC, datetime
from typing import Any

from fastapi import WebSocket
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class WebSocketMessage(BaseModel):
    """WebSocket message structure"""

    type: str
    data: dict[str, Any] | None = None
    user_id: str | None = None
    session_id: str | None = None
    timestamp: str = None

    def __init__(self, **data):
        if not data.get("timestamp"):
            data["timestamp"] = datetime.now(UTC).isoformat()
        super().__init__(**data)


class ConnectionManager:
    """Manages WebSocket connections and broadcasting"""

    def __init__(self):
        # User connections: user_id -> Set[WebSocket]
        self.user_connections: dict[str, set[WebSocket]] = {}
        # WebSocket to user mapping: websocket -> user_id
        self.websocket_users: dict[WebSocket, str] = {}
        # Channel subscriptions: channel -> Set[user_id]
        self.channel_subscriptions: dict[str, set[str]] = {}
        # User subscriptions: user_id -> Set[channel]
        self.user_subscriptions: dict[str, set[str]] = {}
        # Connection metadata
        self.connection_metadata: dict[WebSocket, dict[str, Any]] = {}
        # Rate limiting
        self.rate_limits: dict[str, list[datetime]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a user's WebSocket"""
        await websocket.accept()

        # Add to user connections
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(websocket)

        # Map websocket to user
        self.websocket_users[websocket] = user_id

        # Initialize metadata
        self.connection_metadata[websocket] = {
            "connected_at": datetime.now(UTC),
            "last_heartbeat": datetime.now(UTC),
            "authenticated": False,
            "rate_limit_count": 0,
        }

        logger.info(f"WebSocket connected for user {user_id}")

        # Send connection acknowledgment
        await self.send_personal_message(
            {
                "type": "connection_ack",
                "user_id": user_id,
                "timestamp": datetime.now(UTC).isoformat(),
            },
            user_id,
        )

    async def disconnect(self, websocket: WebSocket):
        """Disconnect a WebSocket"""
        user_id = self.websocket_users.get(websocket)
        if user_id:
            # Remove from user connections
            if user_id in self.user_connections:
                self.user_connections[user_id].discard(websocket)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]

            # Clean up subscriptions
            if user_id in self.user_subscriptions:
                for channel in self.user_subscriptions[user_id]:
                    if channel in self.channel_subscriptions:
                        self.channel_subscriptions[channel].discard(user_id)
                        if not self.channel_subscriptions[channel]:
                            del self.channel_subscriptions[channel]
                del self.user_subscriptions[user_id]

            # Remove from mappings
            del self.websocket_users[websocket]

            logger.info(f"WebSocket disconnected for user {user_id}")

        # Clean up metadata
        if websocket in self.connection_metadata:
            del self.connection_metadata[websocket]

    async def authenticate(self, websocket: WebSocket, token: str) -> bool:
        """Authenticate a WebSocket connection"""
        # Simple authentication - in production, validate JWT token
        if token == "valid_token":
            if websocket in self.connection_metadata:
                self.connection_metadata[websocket]["authenticated"] = True
            return True
        return False

    async def subscribe_to_channel(self, user_id: str, channel: str):
        """Subscribe user to a channel"""
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = set()
        self.user_subscriptions[user_id].add(channel)

        if channel not in self.channel_subscriptions:
            self.channel_subscriptions[channel] = set()
        self.channel_subscriptions[channel].add(user_id)

        logger.info(f"User {user_id} subscribed to channel {channel}")

    async def unsubscribe_from_channel(self, user_id: str, channel: str):
        """Unsubscribe user from a channel"""
        if user_id in self.user_subscriptions:
            self.user_subscriptions[user_id].discard(channel)

        if channel in self.channel_subscriptions:
            self.channel_subscriptions[channel].discard(user_id)
            if not self.channel_subscriptions[channel]:
                del self.channel_subscriptions[channel]

        logger.info(f"User {user_id} unsubscribed from channel {channel}")

    async def send_personal_message(self, message: dict[str, Any], user_id: str):
        """Send message to a specific user"""
        if user_id in self.user_connections:
            websockets = list(self.user_connections[user_id])  # Copy to avoid iteration issues
            for websocket in websockets:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending message to {user_id}: {e}")
                    # Clean up broken connection
                    await self.disconnect(websocket)

    async def broadcast_to_channel(self, message: dict[str, Any], channel: str):
        """Broadcast message to all users in a channel"""
        if channel in self.channel_subscriptions:
            user_ids = list(self.channel_subscriptions[channel])  # Copy to avoid iteration issues
            for user_id in user_ids:
                await self.send_personal_message(message, user_id)

    async def broadcast_to_all(self, message: dict[str, Any]):
        """Broadcast message to all connected users"""
        for user_id in list(self.user_connections.keys()):
            await self.send_personal_message(message, user_id)

    async def handle_message(self, websocket: WebSocket, message: dict[str, Any]):
        """Handle incoming WebSocket message"""
        user_id = self.websocket_users.get(websocket)
        if not user_id:
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "error",
                        "error_code": "user_not_found",
                        "message": "User not associated with connection",
                    }
                )
            )
            return

        # Rate limiting
        if not await self._check_rate_limit(user_id):
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "rate_limit_warning",
                        "message": "Too many messages. Please slow down.",
                    }
                )
            )
            return

        message_type = message.get("type")

        try:
            if message_type == "auth":
                token = message.get("token", "")
                authenticated = await self.authenticate(websocket, token)
                response = {
                    "type": "auth_success" if authenticated else "auth_failed",
                    "authenticated": authenticated,
                }
                await websocket.send_text(json.dumps(response))

            elif message_type == "subscribe":
                channel = message.get("channel")
                if channel:
                    await self.subscribe_to_channel(user_id, channel)
                    await websocket.send_text(
                        json.dumps(
                            {"type": "subscription_ack", "channel": channel, "user_id": user_id}
                        )
                    )

            elif message_type == "unsubscribe":
                channel = message.get("channel")
                if channel:
                    await self.unsubscribe_from_channel(user_id, channel)
                    await websocket.send_text(
                        json.dumps({"type": "unsubscription_ack", "channel": channel})
                    )

            elif message_type == "heartbeat":
                # Update last heartbeat
                if websocket in self.connection_metadata:
                    self.connection_metadata[websocket]["last_heartbeat"] = datetime.now(UTC)
                await websocket.send_text(
                    json.dumps(
                        {"type": "heartbeat_ack", "timestamp": datetime.now(UTC).isoformat()}
                    )
                )

            elif message_type == "ping":
                await websocket.send_text(
                    json.dumps({"type": "pong", "timestamp": datetime.now(UTC).isoformat()})
                )

            else:
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "error_code": "invalid_message_type",
                            "message": f"Unknown message type: {message_type}",
                        }
                    )
                )

        except Exception as e:
            logger.error(f"Error handling message: {e}")
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "error",
                        "error_code": "message_processing_error",
                        "message": "Error processing message",
                    }
                )
            )

    async def _check_rate_limit(self, user_id: str, limit: int = 100, window: int = 60) -> bool:
        """Check if user is within rate limits"""
        now = datetime.now(UTC)
        window_start = now.timestamp() - window

        if user_id not in self.rate_limits:
            self.rate_limits[user_id] = []

        # Remove old timestamps
        self.rate_limits[user_id] = [
            ts for ts in self.rate_limits[user_id] if ts.timestamp() > window_start
        ]

        # Add current timestamp
        self.rate_limits[user_id].append(now)

        return len(self.rate_limits[user_id]) <= limit

    def get_connection_stats(self) -> dict[str, Any]:
        """Get connection statistics"""
        return {
            "total_connections": sum(
                len(connections) for connections in self.user_connections.values()
            ),
            "unique_users": len(self.user_connections),
            "total_channels": len(self.channel_subscriptions),
            "total_subscriptions": sum(len(users) for users in self.channel_subscriptions.values()),
        }


class DashboardStreamer:
    """Handles real-time dashboard data streaming"""

    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
        self.streaming_tasks: dict[str, asyncio.Task] = {}

    async def start_dashboard_streaming(self, user_id: str):
        """Start streaming dashboard data for a user"""
        if user_id in self.streaming_tasks:
            return  # Already streaming

        task = asyncio.create_task(self._stream_dashboard_data(user_id))
        self.streaming_tasks[user_id] = task
        logger.info(f"Started dashboard streaming for user {user_id}")

    async def stop_dashboard_streaming(self, user_id: str):
        """Stop streaming dashboard data for a user"""
        if user_id in self.streaming_tasks:
            self.streaming_tasks[user_id].cancel()
            del self.streaming_tasks[user_id]
            logger.info(f"Stopped dashboard streaming for user {user_id}")

    async def _stream_dashboard_data(self, user_id: str):
        """Stream dashboard data to user"""
        while True:
            try:
                # Generate mock dashboard data
                dashboard_data = {
                    "type": "dashboard_update",
                    "data": {
                        "tasks_completed_today": 5,
                        "current_xp": 1250,
                        "active_focus_session": True,
                        "energy_level": 7.5,
                        "streak_count": 3,
                        "productivity_score": 8.2,
                    },
                    "timestamp": datetime.now(UTC).isoformat(),
                }

                await self.connection_manager.send_personal_message(dashboard_data, user_id)
                await asyncio.sleep(10)  # Update every 10 seconds

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error streaming dashboard data: {e}")
                await asyncio.sleep(5)


class AgentStatusBroadcaster:
    """Handles agent status broadcasting"""

    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager

    async def broadcast_agent_status(self, agent_type: str, status: str, data: dict[str, Any]):
        """Broadcast agent status update"""
        message = {
            "type": "agent_status_update",
            "agent_type": agent_type,
            "status": status,
            "data": data,
            "timestamp": datetime.now(UTC).isoformat(),
        }

        await self.connection_manager.broadcast_to_channel(message, "agent_status")

    async def broadcast_agent_error(self, agent_type: str, error_type: str, error_message: str):
        """Broadcast agent error"""
        message = {
            "type": "agent_error",
            "agent_type": agent_type,
            "error_type": error_type,
            "error_message": error_message,
            "severity": "medium",
            "timestamp": datetime.now(UTC).isoformat(),
        }

        await self.connection_manager.broadcast_to_channel(message, "agent_errors")


class NotificationService:
    """Handles push notifications"""

    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager

    async def send_achievement_notification(self, user_id: str, achievement_data: dict[str, Any]):
        """Send achievement notification"""
        notification = {
            "type": "notification",
            "category": "achievement",
            "title": "New Achievement Unlocked!",
            "message": f"You've earned the '{achievement_data.get('name')}' achievement",
            "data": achievement_data,
            "priority": "high",
            "timestamp": datetime.now(UTC).isoformat(),
        }

        await self.connection_manager.send_personal_message(notification, user_id)

    async def send_break_reminder(self, user_id: str, session_duration: int):
        """Send break reminder notification"""
        notification = {
            "type": "notification",
            "category": "break_reminder",
            "title": "Time for a Break!",
            "message": f"You've been focused for {session_duration} minutes. Take a 10-minute break.",
            "data": {
                "session_duration": session_duration,
                "recommended_break": 10,
                "break_activities": ["walk", "stretch", "hydrate"],
            },
            "priority": "medium",
            "timestamp": datetime.now(UTC).isoformat(),
        }

        await self.connection_manager.send_personal_message(notification, user_id)

    async def send_deadline_warning(self, user_id: str, task_data: dict[str, Any]):
        """Send task deadline warning"""
        notification = {
            "type": "notification",
            "category": "deadline_warning",
            "title": "Task Deadline Approaching",
            "message": f"Task '{task_data.get('title')}' is due in {task_data.get('time_remaining')} minutes",
            "data": task_data,
            "priority": "high",
            "timestamp": datetime.now(UTC).isoformat(),
        }

        await self.connection_manager.send_personal_message(notification, user_id)

    async def send_motivational_message(self, user_id: str, motivation_data: dict[str, Any]):
        """Send motivational notification"""
        notification = {
            "type": "notification",
            "category": "motivation",
            "title": "You're on Fire! 🔥",
            "message": f"{motivation_data.get('message', 'Keep up the great work!')}",
            "data": motivation_data,
            "priority": "low",
            "timestamp": datetime.now(UTC).isoformat(),
        }

        await self.connection_manager.send_personal_message(notification, user_id)


# Global instances
connection_manager = ConnectionManager()
dashboard_streamer = DashboardStreamer(connection_manager)
agent_broadcaster = AgentStatusBroadcaster(connection_manager)
notification_service = NotificationService(connection_manager)
