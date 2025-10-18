"""
Focus Session API Endpoints - Focus & Energy Proxy Agents Integration

Provides RESTful API for:
- Starting and managing focus sessions (Pomodoro, Deep Work, Timeboxing)
- Real-time session status tracking
- Distraction monitoring and intervention
- Break recommendations
- Session analytics and completion metrics
"""

import logging
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.agents.focus_proxy_advanced import AdvancedFocusAgent
from src.api.auth import verify_token
from src.core.models import AgentRequest
from src.database.enhanced_adapter import EnhancedDatabaseAdapter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/focus", tags=["focus"])

# Pydantic models for request/response


class FocusSessionStartRequest(BaseModel):
    """Request to start a focus session"""

    task_context: str = Field(
        ..., description="Description of the task or work to focus on", min_length=1
    )
    technique: str | None = Field(
        None, description="Focus technique: pomodoro, deep_work, or timeboxing"
    )
    duration_minutes: int | None = Field(None, ge=5, le=180, description="Session duration")


class FocusSessionResponse(BaseModel):
    """Focus session creation response"""

    session_id: str
    technique: str
    planned_duration: int
    break_duration: int
    start_time: str
    status: str
    message: str


class SessionStatusResponse(BaseModel):
    """Current session status"""

    status: str
    elapsed_minutes: int
    remaining_minutes: int
    progress_percentage: float
    distraction_count: int
    technique: str


class DistractionReportRequest(BaseModel):
    """Report distraction during session"""

    distraction_type: str | None = None
    context: str


class DistractionInterventionResponse(BaseModel):
    """Distraction intervention response"""

    intervention_type: str
    primary_suggestion: str
    additional_strategies: list[str]
    encouragement: str


class BreakRecommendationResponse(BaseModel):
    """Break activity recommendations"""

    break_type: str
    duration_minutes: int
    recommended_activities: list[str]
    activities_to_avoid: list[str]
    reasoning: str


class SessionCompletionResponse(BaseModel):
    """Session completion metrics"""

    session_id: str
    actual_duration: float
    planned_duration: int
    completion_rate: float
    focus_score: float
    productivity_rating: float
    distraction_count: int
    recommendations: list[str]
    xp_earned: int


# Initialize focus agent (singleton pattern)
_focus_agent: AdvancedFocusAgent | None = None


def get_focus_agent() -> AdvancedFocusAgent:
    """Get or create Focus Agent instance"""
    global _focus_agent
    if _focus_agent is None:
        db = EnhancedDatabaseAdapter()
        _focus_agent = AdvancedFocusAgent(db)
    return _focus_agent


@router.post("/sessions/start", response_model=FocusSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_focus_session(
    request_data: FocusSessionStartRequest, current_username: str = Depends(verify_token)
):
    """
    Start a new focus session with intelligent configuration.

    The agent will:
    - Analyze task complexity from context
    - Recommend optimal session duration based on user patterns
    - Configure appropriate focus technique (Pomodoro, Deep Work, etc.)
    - Set up distraction monitoring
    """
    try:
        # Get user from username (simplified - in production would query user repo)
        user_id = current_username

        # Create agent request
        agent_request = AgentRequest(
            query=f"start focus: {request_data.task_context}",
            user_id=user_id,
            session_id=f"web_{user_id}_{int(datetime.now().timestamp())}",
            agent_type="focus",
            timestamp=datetime.now(),
        )

        # Start session through agent
        agent = get_focus_agent()
        session_data = await agent.start_focus_session(agent_request)

        return FocusSessionResponse(
            session_id=session_data.get("session_id", ""),
            technique=session_data.get("technique", "pomodoro"),
            planned_duration=session_data.get("planned_duration", 25),
            break_duration=session_data.get("break_duration", 5),
            start_time=session_data.get("start_time", datetime.now()).isoformat()
            if isinstance(session_data.get("start_time"), datetime)
            else session_data.get("start_time", datetime.now().isoformat()),
            status="active",
            message=f"Focus session started! {session_data.get('planned_duration', 25)} minutes of focused work ahead.",
        )

    except Exception as e:
        logger.error(f"Failed to start focus session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start focus session: {str(e)}",
        )


@router.get("/sessions/status", response_model=SessionStatusResponse)
async def get_session_status(
    session_id: str | None = None, current_username: str = Depends(verify_token)
):
    """
    Get current focus session status.

    Returns real-time progress including:
    - Elapsed and remaining time
    - Progress percentage
    - Distraction count
    - Session technique
    """
    try:
        user_id = current_username
        agent = get_focus_agent()

        # Use session_id if provided, otherwise find active session for user
        if not session_id:
            # Find active session for user
            active_sessions = [
                sid for sid, sess in agent.active_sessions.items() if sess["user_id"] == user_id
            ]
            if not active_sessions:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="No active focus session found"
                )
            session_id = active_sessions[0]

        status_data = await agent.get_session_status(session_id)

        if status_data.get("status") == "no_active_session":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No active focus session found"
            )

        return SessionStatusResponse(
            status=status_data["status"],
            elapsed_minutes=status_data["elapsed_minutes"],
            remaining_minutes=status_data["remaining_minutes"],
            progress_percentage=status_data["progress_percentage"],
            distraction_count=status_data["distraction_count"],
            technique=status_data["technique"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get session status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session status: {str(e)}",
        )


@router.post("/sessions/complete", response_model=SessionCompletionResponse)
async def complete_focus_session(
    session_id: str | None = None,
    productivity_rating: float | None = None,
    current_username: str = Depends(verify_token),
):
    """
    Complete current focus session and get analytics.

    Returns comprehensive metrics:
    - Completion rate
    - Focus quality score
    - Productivity rating
    - Recommendations for improvement
    - XP earned
    """
    try:
        user_id = current_username
        agent = get_focus_agent()

        # Find session if not provided
        if not session_id:
            active_sessions = [
                sid for sid, sess in agent.active_sessions.items() if sess["user_id"] == user_id
            ]
            if not active_sessions:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="No active focus session found"
                )
            session_id = active_sessions[0]

        # Complete session
        completion_data = {}
        if productivity_rating is not None:
            completion_data["productivity_rating"] = productivity_rating

        result = await agent.complete_focus_session(session_id, completion_data)

        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=result["error"]
            )

        # Calculate XP based on completion and focus score
        xp_earned = int(
            result.get("completion_rate", 0) * 30 + result.get("focus_score", 0) * 3
        )

        return SessionCompletionResponse(
            session_id=result["session_id"],
            actual_duration=result["actual_duration"],
            planned_duration=result["planned_duration"],
            completion_rate=result["completion_rate"],
            focus_score=result["focus_score"],
            productivity_rating=result["productivity_rating"],
            distraction_count=result["distraction_count"],
            recommendations=result.get("recommendations", []),
            xp_earned=xp_earned,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to complete focus session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete session: {str(e)}",
        )


@router.post("/distractions/report", response_model=DistractionInterventionResponse)
async def report_distraction(
    distraction: DistractionReportRequest,
    session_id: str | None = None,
    current_username: str = Depends(verify_token),
):
    """
    Report a distraction and get immediate intervention strategies.

    The agent will:
    - Record the distraction
    - Analyze distraction patterns
    - Provide specific intervention techniques
    - Offer encouragement to refocus
    """
    try:
        user_id = current_username
        agent = get_focus_agent()

        # Find session if not provided
        if not session_id:
            active_sessions = [
                sid for sid, sess in agent.active_sessions.items() if sess["user_id"] == user_id
            ]
            if not active_sessions:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No active focus session. Start a session first.",
                )
            session_id = active_sessions[0]

        # Handle distraction
        intervention = await agent.handle_distraction(session_id, distraction.context)

        return DistractionInterventionResponse(
            intervention_type=intervention.get("type", "distraction_intervention"),
            primary_suggestion=intervention["primary_suggestion"],
            additional_strategies=intervention.get("additional_strategies", []),
            encouragement=intervention.get(
                "encouragement", "You've got this! Refocus and continue."
            ),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to handle distraction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process distraction: {str(e)}",
        )


@router.get("/breaks/recommend", response_model=BreakRecommendationResponse)
async def get_break_recommendation(
    session_duration: int = 25,
    intensity: str = "medium",
    current_username: str = Depends(verify_token),
):
    """
    Get intelligent break recommendations.

    Recommendations are personalized based on:
    - Session duration and intensity
    - Time spent on screens
    - Physical activity during session
    - Energy levels
    """
    try:
        agent = get_focus_agent()

        session_data = {"duration": session_duration, "intensity": intensity}

        break_rec = await agent.recommend_break(session_data)

        return BreakRecommendationResponse(
            break_type=break_rec["type"],
            duration_minutes=break_rec["duration"],
            recommended_activities=break_rec["activities"],
            activities_to_avoid=break_rec["avoid"],
            reasoning=break_rec.get("reasoning", "Based on session characteristics"),
        )

    except Exception as e:
        logger.error(f"Failed to get break recommendation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendation: {str(e)}",
        )
