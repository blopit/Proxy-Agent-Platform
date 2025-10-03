"""
WebSocket router for real-time communication.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

router = APIRouter()

# Store active connections
active_connections: Dict[int, List[WebSocket]] = {}

@router.websocket("/connect/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """WebSocket endpoint for real-time communication."""
    await websocket.accept()

    # Add connection to active connections
    if user_id not in active_connections:
        active_connections[user_id] = []
    active_connections[user_id].append(websocket)

    try:
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": "Connected to Proxy Agent Platform",
            "user_id": user_id
        }))

        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            message = json.loads(data)

            # Echo back for now - will implement agent communication
            await websocket.send_text(json.dumps({
                "type": "echo",
                "message": f"Received: {message}",
                "timestamp": "2024-01-01T00:00:00Z"
            }))

    except WebSocketDisconnect:
        # Remove connection
        if user_id in active_connections:
            active_connections[user_id].remove(websocket)
            if not active_connections[user_id]:
                del active_connections[user_id]