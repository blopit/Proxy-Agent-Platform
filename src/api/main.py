"""
FastAPI App - Simple API for proxy agents
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.core.models import AgentRequest, AgentResponse
from src.agents.registry import AgentRegistry
from src.database.adapter import get_database, close_database

# Create FastAPI app
app = FastAPI(
    title="Proxy Agent Platform",
    description="Personal productivity platform with AI proxy agents",
    version="0.1.0"
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


@app.on_event("startup")
async def startup():
    """Initialize database on startup"""
    get_database()  # This initializes the SQLite database
    print("🚀 Proxy Agent Platform started with SQLite")


@app.on_event("shutdown")
async def shutdown():
    """Clean up on shutdown"""
    close_database()
    print("✨ Proxy Agent Platform shutdown")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Proxy Agent Platform",
        "version": "0.1.0",
        "agents": registry.list_agents()
    }


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
            query=query,
            user_id=user_id,
            session_id=session_id,
            agent_type="task"
        )

        response = await registry.process_request(request)
        return {
            "success": response.success,
            "message": response.response,
            "xp_earned": response.xp_earned,
            "processing_time_ms": response.processing_time_ms
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/history/{session_id}")
async def get_history(session_id: str, limit: int = 10):
    """Get conversation history"""
    try:
        db = get_database()
        history = await db.get_conversation_history(session_id, limit)

        return {
            "session_id": session_id,
            "messages": [
                {
                    "type": msg.message_type,
                    "content": msg.content,
                    "agent_type": msg.agent_type,
                    "created_at": msg.created_at.isoformat(),
                    "metadata": msg.metadata
                }
                for msg in history
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)