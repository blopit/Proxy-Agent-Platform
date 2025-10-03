"""
Tasks router for the Proxy Agent Platform API.

This module provides CRUD endpoints for task management,
working in conjunction with the Task Agent.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db, Task, TaskCreate, TaskResponse, TaskStatus, TaskPriority

router = APIRouter()


@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    user_id: int = Query(..., description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new task.

    Args:
        task: Task creation data
        user_id: User ID
        db: Database session

    Returns:
        TaskResponse: Created task data
    """
    try:
        db_task = Task(
            user_id=user_id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            estimated_duration=task.estimated_duration,
            due_date=task.due_date,
            xp_reward=max(50, (task.estimated_duration or 30) * 2)  # Base XP calculation
        )

        db.add(db_task)
        await db.commit()
        await db.refresh(db_task)

        return TaskResponse.from_orm(db_task)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating task: {str(e)}"
        )


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    user_id: int = Query(..., description="User ID"),
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    limit: int = Query(50, le=100, description="Limit number of results"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get tasks for a user with optional filtering.

    Args:
        user_id: User ID
        status: Optional status filter
        priority: Optional priority filter
        limit: Maximum number of tasks to return
        db: Database session

    Returns:
        List[TaskResponse]: List of user tasks
    """
    try:
        query = select(Task).where(Task.user_id == user_id)

        if status:
            query = query.where(Task.status == status)
        if priority:
            query = query.where(Task.priority == priority)

        query = query.order_by(Task.created_at.desc()).limit(limit)

        result = await db.execute(query)
        tasks = result.scalars().all()

        return [TaskResponse.from_orm(task) for task in tasks]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching tasks: {str(e)}"
        )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    user_id: int = Query(..., description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific task by ID.

    Args:
        task_id: Task ID
        user_id: User ID for authorization
        db: Database session

    Returns:
        TaskResponse: Task data
    """
    try:
        task = await db.get(Task, task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if task.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        return TaskResponse.from_orm(task)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching task: {str(e)}"
        )


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskCreate,
    user_id: int = Query(..., description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing task.

    Args:
        task_id: Task ID
        task_update: Updated task data
        user_id: User ID for authorization
        db: Database session

    Returns:
        TaskResponse: Updated task data
    """
    try:
        task = await db.get(Task, task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if task.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Update fields
        task.title = task_update.title
        task.description = task_update.description
        task.priority = task_update.priority
        task.estimated_duration = task_update.estimated_duration
        task.due_date = task_update.due_date

        await db.commit()
        await db.refresh(task)

        return TaskResponse.from_orm(task)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating task: {str(e)}"
        )


@router.patch("/{task_id}/status")
async def update_task_status(
    task_id: int,
    status: TaskStatus,
    user_id: int = Query(..., description="User ID"),
    actual_duration: Optional[int] = Query(None, description="Actual duration in minutes"),
    db: AsyncSession = Depends(get_db)
):
    """
    Update task status (e.g., mark as completed).

    Args:
        task_id: Task ID
        status: New status
        user_id: User ID for authorization
        actual_duration: Actual time spent on task (for completed tasks)
        db: Database session

    Returns:
        Updated task data
    """
    try:
        task = await db.get(Task, task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if task.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        task.status = status

        if status == TaskStatus.COMPLETED:
            from datetime import datetime
            task.completed_at = datetime.utcnow()
            if actual_duration:
                task.actual_duration = actual_duration

        await db.commit()
        await db.refresh(task)

        return {
            "message": f"Task status updated to {status.value}",
            "task": TaskResponse.from_orm(task)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating task status: {str(e)}"
        )


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    user_id: int = Query(..., description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a task.

    Args:
        task_id: Task ID
        user_id: User ID for authorization
        db: Database session

    Returns:
        Confirmation message
    """
    try:
        task = await db.get(Task, task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if task.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        await db.delete(task)
        await db.commit()

        return {"message": "Task deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting task: {str(e)}"
        )