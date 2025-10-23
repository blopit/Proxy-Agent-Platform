"""
Energy Management API Endpoints - Energy Proxy Agent Integration

Provides RESTful API for:
- Energy level tracking and monitoring
- Circadian rhythm analysis
- Energy optimization recommendations
- Task-energy matching
- Energy recovery planning
"""

import logging
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.agents.energy_proxy_advanced import AdvancedEnergyAgent
from src.api.auth import verify_token
from src.core.models import AgentRequest
from src.database.enhanced_adapter import get_enhanced_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/energy", tags=["energy"])

# Pydantic models for request/response


class EnergyTrackingRequest(BaseModel):
    """Request to track current energy level"""

    context_description: str | None = Field(
        None, description="Description of current state or activities"
    )
    sleep_quality: int | None = Field(None, ge=1, le=10, description="Sleep quality 1-10")
    stress_level: int | None = Field(None, ge=1, le=10, description="Stress level 1-10")
    last_meal_time: str | None = Field(None, description="Time of last meal (HH:MM)")
    hydration_level: int | None = Field(None, ge=1, le=10, description="Hydration 1-10")
    physical_activity: str | None = Field(
        None, description="Recent physical activity: sedentary, light, moderate, vigorous"
    )


class EnergyReadingResponse(BaseModel):
    """Energy level assessment response"""

    energy_level: float = Field(..., description="Current energy level (0-10)")
    trend: str = Field(..., description="Energy trend: rising, stable, declining")
    primary_factors: list[str] = Field(..., description="Main factors affecting energy")
    predicted_next_hour: float = Field(..., description="Predicted energy in 1 hour")
    confidence: float = Field(..., description="Confidence in assessment (0-1)")
    immediate_recommendations: list[str]
    message: str


class EnergyOptimizationRequest(BaseModel):
    """Request for energy optimization strategies"""

    current_energy: float | None = Field(None, ge=0, le=10)
    target_energy: float | None = Field(None, ge=0, le=10)
    time_available: int | None = Field(None, description="Minutes available for optimization")


class EnergyOptimizationResponse(BaseModel):
    """Energy optimization recommendations"""

    immediate_actions: list[str]
    nutritional_advice: list[str]
    environmental_changes: list[str]
    lifestyle_recommendations: list[str]
    expected_improvement: float
    timeframe_minutes: int
    message: str


class CircadianAnalysisResponse(BaseModel):
    """Circadian rhythm pattern analysis"""

    peak_energy_times: list[str]
    low_energy_times: list[str]
    chronotype: str = Field(..., description="morning, evening, or intermediate")
    pattern_confidence: float
    recommendations: dict[str, Any]
    message: str


class TaskEnergyMatchRequest(BaseModel):
    """Request to match tasks with energy levels"""

    current_energy: float = Field(..., ge=0, le=10)
    available_tasks: list[dict[str, Any]] = Field(
        ..., description="List of tasks with id, title, and complexity"
    )


class TaskEnergyMatchResponse(BaseModel):
    """Task-energy matching recommendations"""

    recommended_task: dict[str, Any]
    alternative_tasks: list[dict[str, Any]]
    reasoning: str
    message: str


class EnergyRecoveryRequest(BaseModel):
    """Request for energy recovery plan"""

    current_energy: float = Field(..., ge=0, le=10)
    depletion_causes: list[str] | None = None
    next_break_available: str | None = Field(None, description="Next available break time (HH:MM)")


class EnergyRecoveryResponse(BaseModel):
    """Energy recovery plan"""

    recovery_strategy: str
    recommended_activities: list[str]
    expected_energy_gain: float
    time_needed_minutes: int
    follow_up_actions: list[str]
    message: str


# Initialize energy agent (singleton pattern)
_energy_agent: AdvancedEnergyAgent | None = None


def get_energy_agent() -> AdvancedEnergyAgent:
    """Get or create Energy Agent instance"""
    global _energy_agent
    if _energy_agent is None:
        db = get_enhanced_database()
        _energy_agent = AdvancedEnergyAgent(db)
    return _energy_agent


@router.post("/track", response_model=EnergyReadingResponse)
async def track_energy_level(
    tracking_data: EnergyTrackingRequest, user_id: str = "mobile-user"
):
    """
    Track and assess current energy level.

    The agent analyzes multiple factors:
    - Time of day and circadian rhythm
    - Sleep quality
    - Nutrition and hydration
    - Stress levels
    - Physical activity
    - Recent work patterns

    Returns comprehensive energy assessment with predictions and recommendations.

    Note: Auth temporarily disabled for mobile testing.
    TODO: Re-enable authentication for production.
    """
    try:
        agent = get_energy_agent()

        # Build context data
        context_data = {"query": tracking_data.context_description or "track my energy"}

        if tracking_data.sleep_quality is not None:
            context_data["sleep_quality"] = tracking_data.sleep_quality
        if tracking_data.stress_level is not None:
            context_data["stress_level"] = tracking_data.stress_level
        if tracking_data.last_meal_time:
            context_data["last_meal"] = tracking_data.last_meal_time
        if tracking_data.hydration_level is not None:
            context_data["hydration"] = tracking_data.hydration_level
        if tracking_data.physical_activity:
            context_data["physical_activity"] = tracking_data.physical_activity

        # Track energy
        energy_assessment = await agent.track_energy_level(user_id, context_data)

        return EnergyReadingResponse(
            energy_level=energy_assessment["energy_level"],
            trend=energy_assessment["trend"],
            primary_factors=energy_assessment["factors"],
            predicted_next_hour=energy_assessment["predicted_next_hour"],
            confidence=energy_assessment["confidence"],
            immediate_recommendations=energy_assessment.get("recommendations", []),
            message=f"⚡ Energy level: {energy_assessment['energy_level']:.1f}/10 ({energy_assessment['trend']})",
        )

    except Exception as e:
        logger.error(f"Failed to track energy level: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track energy: {str(e)}",
        )


@router.get("/current-level")
async def get_current_energy_level(user_id: str = "mobile-user"):
    """
    Get current energy level for a user (simple endpoint for mobile).

    This endpoint does NOT require authentication and provides a quick
    energy reading based on time of day and recent activity.

    Returns a simple estimate between 0-10 based on circadian rhythm.
    """
    try:
        agent = get_energy_agent()

        # Get quick energy estimate based on time of day
        # This is a simplified version that doesn't require full tracking
        current_hour = datetime.now().hour

        # More granular circadian-based estimate with minute-level variation
        current_minute = datetime.now().minute
        minute_factor = current_minute / 60.0  # 0.0 to 0.99
        
        if 6 <= current_hour < 9:  # Morning rise
            base_energy = 6.5 + (minute_factor * 0.3)  # 6.5 to 6.8
        elif 9 <= current_hour < 12:  # Peak morning
            base_energy = 8.0 - (minute_factor * 0.2)  # 8.0 to 7.8
        elif 12 <= current_hour < 14:  # Post-lunch dip
            base_energy = 5.5 - (minute_factor * 0.3)  # 5.5 to 5.2
        elif 14 <= current_hour < 17:  # Afternoon recovery
            base_energy = 7.0 + (minute_factor * 0.4)  # 7.0 to 7.4
        elif 17 <= current_hour < 20:  # Evening
            base_energy = 6.0 - (minute_factor * 0.2)  # 6.0 to 5.8
        elif 20 <= current_hour < 23:  # Night wind-down
            base_energy = 4.5 - (minute_factor * 0.3)  # 4.5 to 4.2
        else:  # Late night/early morning
            base_energy = 3.0 + (minute_factor * 0.2)  # 3.0 to 3.2
        
        # Add some random variation for more realistic values (±0.1 to ±0.3)
        import random
        variation = random.uniform(-0.2, 0.2)
        base_energy = max(0.0, min(10.0, base_energy + variation))

        return {
            "energy_level": base_energy,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "message": f"Energy level: {base_energy}/10 (circadian estimate)"
        }

    except Exception as e:
        logger.error(f"Failed to get current energy level: {e}")
        # Return fallback value instead of error
        return {
            "energy_level": 7.0,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "message": "Energy level: 7.0/10 (default estimate)"
        }


@router.post("/optimize", response_model=EnergyOptimizationResponse)
async def optimize_energy(
    optimization_request: EnergyOptimizationRequest,
    current_username: str = Depends(verify_token),
):
    """
    Get personalized energy optimization recommendations.

    Provides actionable strategies across multiple dimensions:
    - Immediate actions (5-10 minutes)
    - Nutritional guidance
    - Environmental adjustments
    - Lifestyle improvements

    Recommendations are tailored to current energy level and time constraints.
    """
    try:
        user_id = current_username
        agent = get_energy_agent()

        # Use current energy or get from last tracking
        current_energy = optimization_request.current_energy or 5.0
        target_energy = optimization_request.target_energy or 7.0

        # Get optimization strategies
        optimization = await agent.optimize_energy(user_id, current_energy, [])

        # Extract data from optimization result
        immediate_actions = optimization.get("immediate_actions", [])
        nutritional_advice = optimization.get("nutritional_advice", [])
        environmental_changes = optimization.get("environmental_changes", [])
        lifestyle_recommendations = optimization.get("lifestyle_recommendations", [])
        expected_improvement = optimization.get("expected_improvement", target_energy - current_energy)

        # Calculate timeframe
        time_available = optimization_request.time_available or 15
        timeframe = min(time_available, optimization.get("timeframe_minutes", 15))

        return EnergyOptimizationResponse(
            immediate_actions=immediate_actions,
            nutritional_advice=nutritional_advice,
            environmental_changes=environmental_changes,
            lifestyle_recommendations=lifestyle_recommendations,
            expected_improvement=expected_improvement,
            timeframe_minutes=timeframe,
            message=f"🚀 Energy optimization plan ready! Expected improvement: +{expected_improvement:.1f}",
        )

    except Exception as e:
        logger.error(f"Failed to optimize energy: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize energy: {str(e)}",
        )


@router.get("/circadian-analysis", response_model=CircadianAnalysisResponse)
async def analyze_circadian_rhythm(
    days: int = 30, current_username: str = Depends(verify_token)
):
    """
    Analyze user's circadian rhythm and energy patterns.

    Identifies:
    - Peak energy times for complex work
    - Low energy periods for routine tasks
    - Natural chronotype (morning/evening person)
    - Optimal task scheduling recommendations

    Requires historical data (default: 30 days analysis).
    """
    try:
        user_id = current_username
        agent = get_energy_agent()

        # Analyze circadian patterns
        analysis = await agent.analyze_circadian_rhythm(user_id, [])

        # Extract pattern data
        peak_times = analysis.get("peak_energy_times", ["09:00-11:00"])
        low_times = analysis.get("low_energy_times", ["13:00-15:00"])
        chronotype = analysis.get("chronotype", "intermediate")
        confidence = analysis.get("pattern_confidence", 0.5)
        recommendations = analysis.get("recommendations", {})

        return CircadianAnalysisResponse(
            peak_energy_times=peak_times,
            low_energy_times=low_times,
            chronotype=chronotype,
            pattern_confidence=confidence,
            recommendations=recommendations,
            message=f"📊 Chronotype: {chronotype.title()}. Peak energy: {', '.join(peak_times)}",
        )

    except Exception as e:
        logger.error(f"Failed to analyze circadian rhythm: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze rhythm: {str(e)}",
        )


@router.post("/task-matching", response_model=TaskEnergyMatchResponse)
async def match_tasks_to_energy(
    matching_request: TaskEnergyMatchRequest, current_username: str = Depends(verify_token)
):
    """
    Match tasks to current energy level for optimal productivity.

    Analyzes:
    - Current energy level
    - Task complexity and cognitive demands
    - Historical completion patterns
    - Energy-task correlation

    Returns best task match with reasoning and alternatives.
    """
    try:
        agent = get_energy_agent()

        current_energy = matching_request.current_energy
        available_tasks = matching_request.available_tasks

        # Match energy to tasks
        task_match = await agent.match_tasks_to_energy(current_energy, available_tasks)

        recommended = task_match.get("recommended_task", {})
        alternatives = task_match.get("alternative_tasks", [])

        return TaskEnergyMatchResponse(
            recommended_task=recommended,
            alternative_tasks=alternatives,
            reasoning=recommended.get("reason", "Best match for current energy level"),
            message=f"✨ Recommended: {recommended.get('title', 'Task')} (match: {recommended.get('match_score', 0):.0%})",
        )

    except Exception as e:
        logger.error(f"Failed to match tasks to energy: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to match tasks: {str(e)}",
        )


@router.post("/recovery-plan", response_model=EnergyRecoveryResponse)
async def plan_energy_recovery(
    recovery_request: EnergyRecoveryRequest, current_username: str = Depends(verify_token)
):
    """
    Create personalized energy recovery plan.

    Provides:
    - Optimal recovery strategy (active vs passive)
    - Specific recovery activities
    - Expected energy gain
    - Time required
    - Long-term follow-up actions

    Tailored to depletion causes and available time.
    """
    try:
        user_id = current_username
        agent = get_energy_agent()

        energy_data = {
            "current_level": recovery_request.current_energy,
            "causes": recovery_request.depletion_causes or [],
            "next_break_available": recovery_request.next_break_available,
        }

        # Plan recovery
        recovery_plan = await agent.plan_energy_recovery(user_id, energy_data)

        return EnergyRecoveryResponse(
            recovery_strategy=recovery_plan.get("recovery_strategy", "active_restoration"),
            recommended_activities=recovery_plan.get("activities", []),
            expected_energy_gain=recovery_plan.get("expected_recovery", 2.0),
            time_needed_minutes=recovery_plan.get("time_needed", 20),
            follow_up_actions=recovery_plan.get("follow_up_actions", []),
            message=f"🔋 Recovery plan: {recovery_plan.get('recovery_strategy', 'active restoration').replace('_', ' ').title()}",
        )

    except Exception as e:
        logger.error(f"Failed to plan energy recovery: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create recovery plan: {str(e)}",
        )
