"""
FastAPI App - Simple API for proxy agents
"""

import json
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from src.agents.registry import AgentRegistry
from src.api.auth import router as auth_router
from src.api.basic_tasks import router as basic_task_router
from src.api.capture import router as capture_router
from src.api.compass import router as compass_router  # MVP: Compass zones
from src.api.energy import router as energy_router
from src.api.focus import router as focus_router
from src.api.gamification import router as gamification_router
from src.api.progress import router as progress_router
from src.api.rewards import router as rewards_router
from src.api.ritual import router as ritual_router  # MVP: Morning ritual
from src.api.routes import tasks_v2_router  # New v2 API
from src.api.secretary import router as secretary_router
from src.api.simple_tasks import router as simple_task_router
from src.api.tasks import router as comprehensive_task_router
from src.api.websocket import (
    connection_manager,
)
from src.core.models import AgentRequest, AgentResponse
from src.database.enhanced_adapter import close_enhanced_database, get_enhanced_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.

    Replaces deprecated @app.on_event decorators.
    """
    # Startup
    get_enhanced_database()  # Initialize the enhanced SQLite database
    print("🚀 Proxy Agent Platform started with Enhanced SQLite")

    yield

    # Shutdown
    close_enhanced_database()
    print("✨ Proxy Agent Platform shutdown")


# Create FastAPI app with lifespan handler
app = FastAPI(
    title="Proxy Agent Platform",
    description="Personal productivity platform with AI proxy agents",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global agent registry
registry = AgentRegistry()

# Include routers - All routers now working with fixed service layer
# Note: v2 router should come first, then comprehensive router for backward compatibility
app.include_router(tasks_v2_router)  # NEW: v2 API with TaskService DI
app.include_router(comprehensive_task_router)  # Legacy: v1 task service
app.include_router(capture_router)  # Capture Mode brain dump system (Epic: Capture)
app.include_router(auth_router)  # Authentication endpoints
app.include_router(focus_router)  # Focus & Pomodoro endpoints (MVP Simplified)
app.include_router(energy_router)  # Energy management endpoints (MVP Simplified)
app.include_router(progress_router)  # Progress tracking endpoints (Epic 2.3)
app.include_router(gamification_router)  # Gamification endpoints (MVP Simplified)
app.include_router(compass_router)  # Compass zones (MVP Week 2)
app.include_router(ritual_router)  # Morning ritual (MVP Week 2)
app.include_router(rewards_router)  # Dopamine reward system (HABIT.md)
app.include_router(secretary_router)  # Secretary intelligent organization
app.include_router(simple_task_router)  # Legacy simple tasks
app.include_router(basic_task_router)  # Legacy basic tasks


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Proxy Agent Platform", "version": "0.1.0", "agents": registry.list_agents()}


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}


@app.post("/api/agents/task", response_model=AgentResponse)
async def task_agent(request: AgentRequest):
    """Task agent endpoint"""
    try:
        request.agent_type = "task"
        return await registry.process_request(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/agents/focus", response_model=AgentResponse)
async def focus_agent(request: AgentRequest):
    """Focus agent endpoint"""
    try:
        request.agent_type = "focus"
        return await registry.process_request(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/quick-capture")
async def quick_capture(query: str, user_id: str, session_id: str = "mobile"):
    """Quick task capture - optimized for 2-second mobile use"""
    try:
        request = AgentRequest(
            query=query, user_id=user_id, session_id=session_id, agent_type="task"
        )

        response = await registry.process_request(request)
        return {
            "success": response.success,
            "message": response.response,
            "xp_earned": response.xp_earned,
            "processing_time_ms": response.processing_time_ms,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/history/{session_id}")
async def get_history(session_id: str, limit: int = 10):
    """Get conversation history"""
    try:
        db = get_enhanced_database()
        # history = await db.get_conversation_history(session_id, limit)
        # Return mock data for now
        return {
            "session_id": session_id,
            "messages": [],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# WebSocket endpoints
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time communication"""
    await connection_manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await connection_manager.handle_message(websocket, message)
            except json.JSONDecodeError:
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "error_code": "invalid_json",
                            "message": "Invalid JSON format",
                        }
                    )
                )
    except WebSocketDisconnect:
        await connection_manager.disconnect(websocket)


# WebSocket utility endpoints for testing and administration
@app.get("/api/websocket/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    return connection_manager.get_connection_stats()


@app.post("/api/websocket/broadcast/{channel}")
async def broadcast_to_channel(channel: str, message: dict):
    """Broadcast message to a specific channel"""
    await connection_manager.broadcast_to_channel(message, channel)
    return {"success": True, "channel": channel}


@app.post("/api/websocket/notify/{user_id}")
async def send_notification(user_id: str, notification: dict):
    """Send notification to a specific user"""
    await connection_manager.send_personal_message(notification, user_id)
    return {"success": True, "user_id": user_id}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
