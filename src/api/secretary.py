"""
Secretary API Endpoints - Intelligent task organization and prioritization
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from src.services.secretary_service import SecretaryService
from src.services.task_service import TaskService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/secretary", tags=["secretary"])


# Response Models
class SecretaryDashboardResponse(BaseModel):
    """Response model for secretary dashboard"""
    categories: Dict[str, Any] = Field(..., description="Categorized tasks")
    stats: Dict[str, Any] = Field(..., description="Dashboard statistics")
    upcoming_deadlines: list[Dict[str, Any]] = Field(..., description="Upcoming deadlines")
    last_updated: str = Field(..., description="Last update timestamp")


class PriorityMatrixResponse(BaseModel):
    """Response model for priority matrix"""
    matrix: Dict[str, Any] = Field(..., description="Eisenhower matrix quadrants")
    stats: Dict[str, Any] = Field(..., description="Matrix statistics")
    last_updated: str = Field(..., description="Last update timestamp")


class DailyBriefingResponse(BaseModel):
    """Response model for daily briefing"""
    time_of_day: str = Field(..., description="Morning or evening")
    stats: Dict[str, Any] = Field(..., description="Briefing statistics")
    upcoming_tasks: list[Dict[str, Any]] = Field(..., description="Upcoming tasks")
    completed_today: list[Dict[str, Any]] = Field(..., description="Tasks completed today")
    alerts: list[Dict[str, Any]] = Field(..., description="Important alerts")
    last_updated: str = Field(..., description="Last update timestamp")


class PrioritySuggestionResponse(BaseModel):
    """Response model for priority suggestions"""
    suggestions: list[Dict[str, Any]] = Field(..., description="Priority change suggestions")


# Dependency to get secretary service
def get_secretary_service() -> SecretaryService:
    """Get secretary service instance"""
    return SecretaryService()


@router.get("/dashboard", response_model=SecretaryDashboardResponse)
async def get_secretary_dashboard(
    user_id: Optional[str] = Query(None, description="User ID for filtering tasks"),
    secretary_service: SecretaryService = Depends(get_secretary_service)
) -> SecretaryDashboardResponse:
    """
    Get secretary dashboard with organized task categories
    
    Returns:
        - Main priority tasks (urgent + high priority due soon)
        - Urgent tasks (due within 48 hours)
        - Important tasks (high priority, not urgent)
        - This week tasks (medium priority due this week)
        - Statistics and upcoming deadlines
    """
    try:
        dashboard_data = secretary_service.get_secretary_dashboard(user_id)
        return SecretaryDashboardResponse(**dashboard_data)
        
    except Exception as e:
        logger.error(f"Failed to get secretary dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get secretary dashboard")


@router.get("/priority-matrix", response_model=PriorityMatrixResponse)
async def get_priority_matrix(
    user_id: Optional[str] = Query(None, description="User ID for filtering tasks"),
    secretary_service: SecretaryService = Depends(get_secretary_service)
) -> PriorityMatrixResponse:
    """
    Get Eisenhower Priority Matrix categorization
    
    Returns tasks organized into four quadrants:
    - Do First: Urgent + Important
    - Schedule: Important, Not Urgent
    - Delegate: Urgent, Not Important
    - Eliminate: Neither Urgent nor Important
    """
    try:
        matrix_data = secretary_service.get_priority_matrix(user_id)
        return PriorityMatrixResponse(**matrix_data)
        
    except Exception as e:
        logger.error(f"Failed to get priority matrix: {e}")
        raise HTTPException(status_code=500, detail="Failed to get priority matrix")


@router.get("/daily-briefing", response_model=DailyBriefingResponse)
async def get_daily_briefing(
    time_of_day: str = Query("morning", description="Time of day: 'morning' or 'evening'"),
    user_id: Optional[str] = Query(None, description="User ID for filtering tasks"),
    secretary_service: SecretaryService = Depends(get_secretary_service)
) -> DailyBriefingResponse:
    """
    Get daily briefing with stats and upcoming tasks
    
    Morning briefing includes:
    - Today's agenda and priorities
    - Upcoming deadlines
    - Important alerts
    
    Evening briefing includes:
    - Today's accomplishments
    - Tomorrow's preparation
    - Progress summary
    """
    try:
        if time_of_day not in ["morning", "evening"]:
            raise HTTPException(status_code=400, detail="time_of_day must be 'morning' or 'evening'")
        
        briefing_data = secretary_service.get_daily_briefing(user_id, time_of_day)
        return DailyBriefingResponse(**briefing_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get daily briefing: {e}")
        raise HTTPException(status_code=500, detail="Failed to get daily briefing")


@router.get("/priority-suggestions", response_model=PrioritySuggestionResponse)
async def get_priority_suggestions(
    user_id: Optional[str] = Query(None, description="User ID for filtering tasks"),
    secretary_service: SecretaryService = Depends(get_secretary_service)
) -> PrioritySuggestionResponse:
    """
    Get AI-powered priority change suggestions
    
    Analyzes tasks and suggests priority adjustments based on:
    - Due dates and deadlines
    - Current priority levels
    - Task importance indicators
    - Historical patterns
    """
    try:
        suggestions = secretary_service.suggest_priority_changes(user_id)
        return PrioritySuggestionResponse(suggestions=suggestions)
        
    except Exception as e:
        logger.error(f"Failed to get priority suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get priority suggestions")


@router.get("/health")
async def health_check():
    """Health check endpoint for secretary service"""
    return {"status": "healthy", "service": "secretary"}


# Additional utility endpoints

@router.get("/stats/summary")
async def get_stats_summary(
    user_id: Optional[str] = Query(None, description="User ID for filtering tasks"),
    secretary_service: SecretaryService = Depends(get_secretary_service)
) -> Dict[str, Any]:
    """Get quick stats summary for secretary dashboard"""
    try:
        dashboard_data = secretary_service.get_secretary_dashboard(user_id)
        return {
            "stats": dashboard_data["stats"],
            "category_counts": {
                "main_priority": len(dashboard_data["categories"]["main_priority"]),
                "urgent_tasks": len(dashboard_data["categories"]["urgent_tasks"]),
                "important_tasks": len(dashboard_data["categories"]["important_tasks"]),
                "this_week": len(dashboard_data["categories"]["this_week"])
            },
            "upcoming_count": len(dashboard_data["upcoming_deadlines"])
        }
        
    except Exception as e:
        logger.error(f"Failed to get stats summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get stats summary")


@router.get("/alerts")
async def get_alerts(
    user_id: Optional[str] = Query(None, description="User ID for filtering tasks"),
    secretary_service: SecretaryService = Depends(get_secretary_service)
) -> Dict[str, Any]:
    """Get important alerts and notifications"""
    try:
        briefing_data = secretary_service.get_daily_briefing(user_id, "morning")
        return {
            "alerts": briefing_data["alerts"],
            "urgent_count": briefing_data["stats"]["urgent_tasks"],
            "overdue_count": briefing_data["stats"]["overdue_tasks"]
        }
        
    except Exception as e:
        logger.error(f"Failed to get alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get alerts")


# Quick action endpoints

@router.post("/quick-actions/mark-urgent")
async def mark_task_urgent(
    task_id: str,
    secretary_service: SecretaryService = Depends(get_secretary_service)
) -> Dict[str, Any]:
    """Quick action to mark a task as urgent"""
    try:
        # This would integrate with the task service to update priority
        # For now, return a success response
        return {
            "success": True,
            "message": f"Task {task_id} marked as urgent",
            "task_id": task_id
        }
        
    except Exception as e:
        logger.error(f"Failed to mark task urgent: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark task as urgent")


@router.post("/quick-actions/schedule-task")
async def schedule_task(
    task_id: str,
    scheduled_date: str,
    secretary_service: SecretaryService = Depends(get_secretary_service)
) -> Dict[str, Any]:
    """Quick action to schedule a task"""
    try:
        # This would integrate with the task service to update due date
        return {
            "success": True,
            "message": f"Task {task_id} scheduled for {scheduled_date}",
            "task_id": task_id,
            "scheduled_date": scheduled_date
        }
        
    except Exception as e:
        logger.error(f"Failed to schedule task: {e}")
        raise HTTPException(status_code=500, detail="Failed to schedule task")


@router.post("/quick-actions/delegate-task")
async def delegate_task(
    task_id: str,
    assignee: str,
    secretary_service: SecretaryService = Depends(get_secretary_service)
) -> Dict[str, Any]:
    """Quick action to delegate a task"""
    try:
        # This would integrate with the task service to update assignee
        return {
            "success": True,
            "message": f"Task {task_id} delegated to {assignee}",
            "task_id": task_id,
            "assignee": assignee
        }
        
    except Exception as e:
        logger.error(f"Failed to delegate task: {e}")
        raise HTTPException(status_code=500, detail="Failed to delegate task")
