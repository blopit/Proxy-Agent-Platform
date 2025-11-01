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


# ============================================================================
# Task Query Endpoints (for dogfooding)
# ============================================================================


@router.get("/tasks", status_code=status.HTTP_200_OK)
def get_tasks(
    task_filter: Optional[str] = Query(None, alias="filter"),
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
) -> List[dict]:
    """
    Get all tasks with optional filtering.

    Args:
        task_filter: Filter type - 'all', 'coding', 'personal', 'unassigned', 'meta'
        db: Database adapter

    Returns:
        List[dict]: List of tasks matching the filter
    """
    conn = db.get_connection()
    cursor = conn.cursor()

    # Base query
    query = """
        SELECT
            task_id,
            title,
            description,
            status,
            priority,
            delegation_mode,
            estimated_hours,
            created_at,
            tags,
            is_meta_task,
            project_id,
            scope,
            capture_type
        FROM tasks
        WHERE 1=1
    """

    params = []

    # Apply filters
    if task_filter == 'coding':
        # Coding tasks: backend, frontend, refactor, test, api, database
        query += """ AND (
            tags LIKE '%coding%'
            OR tags LIKE '%backend%'
            OR tags LIKE '%frontend%'
            OR tags LIKE '%refactor%'
            OR tags LIKE '%test%'
            OR title LIKE '%BE-%'
            OR title LIKE '%FE-%'
        )"""
    elif task_filter == 'personal':
        # Personal tasks: not coding-related
        query += """ AND tags NOT LIKE '%coding%'
                 AND tags NOT LIKE '%backend%'
                 AND tags NOT LIKE '%frontend%'
                 AND title NOT LIKE '%BE-%'
                 AND title NOT LIKE '%FE-%'"""
    elif task_filter == 'unassigned':
        # Tasks without assignments
        query += """ AND task_id NOT IN (
            SELECT DISTINCT task_id FROM task_assignments WHERE status != 'completed'
        )"""
    elif task_filter == 'meta':
        # Only meta development tasks
        query += " AND is_meta_task = 1"
    # 'all' or None - no additional filter

    # Order by priority
    query += """
        ORDER BY
            CASE priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                ELSE 4
            END,
            created_at DESC
    """

    cursor.execute(query, params)
    rows = cursor.fetchall()

    tasks = []
    for row in rows:
        tasks.append({
            "task_id": row["task_id"],
            "title": row["title"],
            "description": row["description"],
            "status": row["status"],
            "priority": row["priority"],
            "delegation_mode": row["delegation_mode"],
            "estimated_hours": row["estimated_hours"],
            "created_at": row["created_at"],
            "tags": row["tags"],
            "is_meta_task": row["is_meta_task"],
            "project_id": row["project_id"],
            "scope": row["scope"],
            "capture_type": row["capture_type"],
        })

    return tasks


@router.get("/meta-tasks", status_code=status.HTTP_200_OK)
def get_meta_tasks(
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
) -> List[dict]:
    """
    Get all meta development tasks (is_meta_task = true).

    DEPRECATED: Use GET /tasks?filter=meta instead.

    Returns:
        List[dict]: List of development tasks for dogfooding
    """
    # Delegate to new endpoint
    return get_tasks(task_filter='meta', db=db)


# ============================================================================
# Claude Code AI Assignment Endpoint
# ============================================================================


@router.post("/tasks/{task_id}/assign-to-claude", status_code=status.HTTP_201_CREATED)
def assign_task_to_claude(
    task_id: str,
    repo: DelegationRepository = Depends(get_delegation_repo),
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database),
) -> dict:
    """
    Assign a coding task to Claude Code by generating a PRP file.

    This endpoint:
    1. Fetches the task details from the database
    2. Validates it's a coding-appropriate task
    3. Generates a PRP (Product Requirements Prompt) file
    4. Creates an assignment record for 'claude-code' agent
    5. Returns the PRP file path for user to execute via /execute-prp

    Args:
        task_id: Task identifier
        repo: Delegation repository
        db: Database adapter

    Returns:
        dict: Assignment details and PRP file path

    Raises:
        HTTPException: If task doesn't exist, not suitable for AI, or assignment fails
    """
    from pathlib import Path
    from src.services.delegation.prp_generator import save_prp_file

    # Fetch task from database
    conn = db.get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            task_id, title, description, status, priority,
            delegation_mode, estimated_hours, tags, is_meta_task, capture_type
        FROM tasks
        WHERE task_id = ?
    """

    cursor.execute(query, (task_id,))
    row = cursor.fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )

    task_dict = dict(row)

    # Validate task is suitable for coding (has coding-related tags or title pattern)
    title = task_dict.get('title', '')
    tags = task_dict.get('tags', '')
    coding_tags = ['coding', 'backend', 'frontend', 'refactor', 'test']

    is_coding_task = (
        any(tag in tags.lower() for tag in coding_tags)
        or 'BE-' in title
        or 'FE-' in title
    )

    if not is_coding_task:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task '{task_dict['title']}' is not suitable for AI assignment. "
                   f"Only coding tasks (backend, frontend, api, testing) can be assigned to Claude Code."
        )

    # Generate PRP file
    try:
        # Determine PRP directory (project root / .claude / prps)
        project_root = Path(__file__).parent.parent.parent.parent
        prp_dir = project_root / ".claude" / "prps"

        # Convert tags string to list for PRP generator
        if isinstance(tags, str):
            task_dict['tags'] = [t.strip() for t in tags.split(',') if t.strip()]

        prp_file_path = save_prp_file(task_dict, prp_dir)
        relative_path = prp_file_path.relative_to(project_root)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PRP file: {str(e)}"
        )

    # Create assignment for claude-code agent
    try:
        assignment_data = repo.create_assignment(
            task_id=task_id,
            assignee_id='claude-code',
            assignee_type='agent',
            estimated_hours=task_dict.get('estimated_hours', 4.0),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create assignment: {str(e)}"
        )

    return {
        "success": True,
        "message": f"Task assigned to Claude Code",
        "task_id": task_id,
        "task_title": task_dict['title'],
        "assignment_id": assignment_data['assignment_id'],
        "prp_file_path": str(relative_path),
        "next_step": f"Run: /execute-prp {relative_path}",
    }
