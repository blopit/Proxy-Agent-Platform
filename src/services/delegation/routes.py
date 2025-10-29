"""
FastAPI routes for Task Delegation System (BE-00).

Provides endpoints for:
- Task delegation
- Assignment lifecycle (accept, complete)
- Agent capability management
- Assignment queries
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database
from src.services.delegation.models import (
    AgentCapability,
    AgentCapabilityCreate,
    AssignmentComplete,
    TaskAssignment,
    TaskDelegationCreate,
)
from src.services.delegation.repository import DelegationRepository

router = APIRouter(prefix="/api/v1/delegation", tags=["delegation"])


def get_delegation_repo(
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
) -> DelegationRepository:
    """
    Dependency to get delegation repository.

    Args:
        db: Database adapter instance

    Returns:
        DelegationRepository: Delegation repository instance
    """
    return DelegationRepository(db)


# ============================================================================
# Task Delegation Endpoints
# ============================================================================


@router.post("/delegate", response_model=TaskAssignment, status_code=status.HTTP_201_CREATED)
def delegate_task(
    delegation: TaskDelegationCreate,
    repo: DelegationRepository = Depends(get_delegation_repo),
) -> TaskAssignment:
    """
    Delegate a task to a human or agent.

    Args:
        delegation: Task delegation data
        repo: Delegation repository

    Returns:
        TaskAssignment: Created assignment

    Raises:
        HTTPException: If task doesn't exist or validation fails
    """
    try:
        assignment_data = repo.create_assignment(
            task_id=delegation.task_id,
            assignee_id=delegation.assignee_id,
            assignee_type=delegation.assignee_type,
            estimated_hours=delegation.estimated_hours,
        )
        return TaskAssignment(**assignment_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create assignment: {str(e)}",
        )


# ============================================================================
# Assignment Query Endpoints
# ============================================================================


@router.get(
    "/assignments/agent/{agent_id}",
    response_model=List[TaskAssignment],
    status_code=status.HTTP_200_OK,
)
def get_agent_assignments(
    agent_id: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    repo: DelegationRepository = Depends(get_delegation_repo),
) -> List[TaskAssignment]:
    """
    Get all assignments for a specific agent.

    Args:
        agent_id: Agent identifier
        status_filter: Optional status filter (pending, in_progress, completed)
        repo: Delegation repository

    Returns:
        List[TaskAssignment]: List of assignments
    """
    assignments_data = repo.get_assignments_by_agent(agent_id, status=status_filter)
    return [TaskAssignment(**data) for data in assignments_data]


# ============================================================================
# Assignment Lifecycle Endpoints
# ============================================================================


@router.post(
    "/assignments/{assignment_id}/accept",
    response_model=TaskAssignment,
    status_code=status.HTTP_200_OK,
)
def accept_assignment(
    assignment_id: str,
    repo: DelegationRepository = Depends(get_delegation_repo),
) -> TaskAssignment:
    """
    Accept a pending assignment.

    Args:
        assignment_id: Assignment identifier
        repo: Delegation repository

    Returns:
        TaskAssignment: Updated assignment

    Raises:
        HTTPException: If assignment not found or already accepted
    """
    try:
        assignment_data = repo.accept_assignment(assignment_id)
        if not assignment_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assignment {assignment_id} not found",
            )
        return TaskAssignment(**assignment_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.post(
    "/assignments/{assignment_id}/complete",
    response_model=TaskAssignment,
    status_code=status.HTTP_200_OK,
)
def complete_assignment(
    assignment_id: str,
    completion: AssignmentComplete,
    repo: DelegationRepository = Depends(get_delegation_repo),
) -> TaskAssignment:
    """
    Complete an in-progress assignment.

    Args:
        assignment_id: Assignment identifier
        completion: Completion data (actual hours)
        repo: Delegation repository

    Returns:
        TaskAssignment: Updated assignment

    Raises:
        HTTPException: If assignment not found or not in progress
    """
    try:
        assignment_data = repo.complete_assignment(
            assignment_id, actual_hours=completion.actual_hours
        )
        if not assignment_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assignment {assignment_id} not found",
            )
        return TaskAssignment(**assignment_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


# ============================================================================
# Agent Capability Endpoints
# ============================================================================


@router.post("/agents", response_model=AgentCapability, status_code=status.HTTP_201_CREATED)
def register_agent(
    agent: AgentCapabilityCreate,
    repo: DelegationRepository = Depends(get_delegation_repo),
) -> AgentCapability:
    """
    Register a new agent capability.

    Args:
        agent: Agent capability data
        repo: Delegation repository

    Returns:
        AgentCapability: Created agent capability

    Raises:
        HTTPException: If registration fails
    """
    try:
        agent_data = repo.register_agent(
            agent_id=agent.agent_id,
            agent_name=agent.agent_name,
            agent_type=agent.agent_type,
            skills=agent.skills,
            max_concurrent_tasks=agent.max_concurrent_tasks,
        )
        return AgentCapability(**agent_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to register agent: {str(e)}",
        )


@router.get("/agents", response_model=List[AgentCapability], status_code=status.HTTP_200_OK)
def get_agents(
    agent_type: Optional[str] = Query(None),
    available_only: Optional[bool] = Query(None),
    repo: DelegationRepository = Depends(get_delegation_repo),
) -> List[AgentCapability]:
    """
    Get agents with optional filtering.

    Args:
        agent_type: Optional filter by agent type (backend, frontend, general)
        available_only: Filter to only available agents
        repo: Delegation repository

    Returns:
        List[AgentCapability]: List of agent capabilities
    """
    agents_data = repo.get_agents(
        agent_type=agent_type, available_only=available_only or False
    )
    return [AgentCapability(**data) for data in agents_data]
