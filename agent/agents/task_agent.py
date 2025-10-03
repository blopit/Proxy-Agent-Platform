"""
Task Agent for the Proxy Agent Platform.

This module implements the Task Agent using PydanticAI, which manages tasks,
priorities, and productivity workflows for users.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from database import Task, TaskStatus, TaskPriority, AgentType
from .base_agent import BaseProxyAgent, AgentResponse


class TaskRequest(BaseModel):
    """Request schema for task operations."""
    action: str  # create, update, complete, prioritize, analyze
    task_data: Optional[Dict[str, Any]] = None
    task_id: Optional[int] = None
    context: Optional[str] = None


class TaskAnalysis(BaseModel):
    """Schema for task analysis results."""
    priority_score: float
    estimated_duration: int  # minutes
    suggested_tags: List[str]
    optimal_time_slot: str
    prerequisites: List[str]
    breaking_down_suggestion: Optional[str] = None


class TaskAgent(BaseProxyAgent):
    """
    AI-powered task management agent.

    This agent helps users create, prioritize, organize, and complete tasks
    using AI insights and productivity best practices.
    """

    def __init__(self):
        """Initialize the Task Agent."""
        super().__init__(AgentType.TASK, "gpt-4")

    def _get_system_prompt(self) -> str:
        """Get the system prompt for the Task Agent."""
        return """
You are a Task Agent, an AI assistant specialized in task management and productivity optimization.

Your primary responsibilities:
1. Help users create and organize tasks effectively
2. Analyze task priority and suggest optimal scheduling
3. Break down complex tasks into manageable subtasks
4. Provide intelligent task recommendations based on context
5. Track task completion patterns and suggest improvements

Key principles:
- Use productivity frameworks like GTD, Eisenhower Matrix, and Time Blocking
- Consider user's energy levels, current workload, and deadlines
- Suggest realistic time estimates based on task complexity
- Encourage task completion with positive reinforcement
- Identify dependencies and prerequisites between tasks

Response format:
- Always provide actionable suggestions
- Include estimated time requirements
- Suggest priority levels with reasoning
- Offer task breakdown when appropriate
- Maintain encouraging and supportive tone

You have access to the user's task history, completion patterns, and productivity metrics.
Use this data to provide personalized and intelligent task management assistance.
        """

    def _get_capabilities(self) -> List[str]:
        """Get capabilities of the Task Agent."""
        return [
            "Create and organize tasks",
            "Analyze task priority and complexity",
            "Break down complex tasks into subtasks",
            "Suggest optimal scheduling and time blocking",
            "Track task completion patterns",
            "Provide productivity insights and recommendations",
            "Manage task dependencies and prerequisites"
        ]

    async def process_request(
        self,
        db: AsyncSession,
        user_id: int,
        request: Dict[str, Any]
    ) -> AgentResponse:
        """
        Process a task-related request from the user.

        Args:
            db: Database session
            user_id: User ID
            request: User request data

        Returns:
            AgentResponse with task management result
        """
        try:
            task_request = TaskRequest(**request)
            user_context = await self.get_user_context(db, user_id)

            # Get user's task context
            task_context = await self._get_task_context(db, user_id)

            # Process different types of task requests
            if task_request.action == "create":
                return await self._create_task(db, user_id, task_request, user_context, task_context)
            elif task_request.action == "analyze":
                return await self._analyze_task(db, user_id, task_request, task_context)
            elif task_request.action == "prioritize":
                return await self._prioritize_tasks(db, user_id, task_context)
            elif task_request.action == "complete":
                return await self._complete_task(db, user_id, task_request)
            elif task_request.action == "recommend":
                return await self._recommend_tasks(db, user_id, user_context, task_context)
            else:
                return AgentResponse(
                    success=False,
                    message=f"Unknown action: {task_request.action}",
                    suggestions=["Try actions: create, analyze, prioritize, complete, recommend"]
                )

        except Exception as e:
            return AgentResponse(
                success=False,
                message=f"Error processing task request: {str(e)}"
            )

    async def _create_task(
        self,
        db: AsyncSession,
        user_id: int,
        request: TaskRequest,
        user_context: Dict[str, Any],
        task_context: Dict[str, Any]
    ) -> AgentResponse:
        """Create a new task with AI analysis."""
        if not request.task_data:
            return AgentResponse(
                success=False,
                message="Task data required for creation"
            )

        # Use AI to analyze the task
        ai_prompt = f"""
        Analyze this task creation request:
        Task: {request.task_data.get('title', '')}
        Description: {request.task_data.get('description', '')}

        User context: {user_context}
        Current tasks: {task_context.get('pending_tasks_count', 0)} pending

        Provide:
        1. Priority score (1-10)
        2. Estimated duration in minutes
        3. Suggested tags
        4. Optimal time slot recommendation
        5. Any prerequisites or dependencies
        6. Task breakdown if complex
        """

        # Run AI analysis
        ai_result = await self.agent.run(ai_prompt)
        analysis_data = ai_result.data if ai_result.data else {}

        # Create the task
        task = Task(
            user_id=user_id,
            title=request.task_data.get('title'),
            description=request.task_data.get('description'),
            priority=TaskPriority(request.task_data.get('priority', 'medium')),
            estimated_duration=analysis_data.get('estimated_duration', 30),
            ai_suggested=True,
            ai_priority_score=analysis_data.get('priority_score', 5.0),
            ai_tags=analysis_data.get('tags', []),
            xp_reward=max(50, int(analysis_data.get('estimated_duration', 30) * 1.5))
        )

        db.add(task)
        await db.commit()
        await db.refresh(task)

        # Log activity
        await self.log_activity(
            db, user_id, "task_created",
            f"Created task: {task.title}",
            {"task_id": task.id, "ai_analysis": analysis_data}
        )

        return AgentResponse(
            success=True,
            message=f"Task '{task.title}' created successfully!",
            data={
                "task_id": task.id,
                "estimated_duration": task.estimated_duration,
                "priority_score": task.ai_priority_score,
                "xp_reward": task.xp_reward
            },
            suggestions=analysis_data.get('suggestions', [])
        )

    async def _analyze_task(
        self,
        db: AsyncSession,
        user_id: int,
        request: TaskRequest,
        task_context: Dict[str, Any]
    ) -> AgentResponse:
        """Analyze an existing task and provide insights."""
        if not request.task_id:
            return AgentResponse(
                success=False,
                message="Task ID required for analysis"
            )

        # Get the task
        task = await db.get(Task, request.task_id)
        if not task or task.user_id != user_id:
            return AgentResponse(
                success=False,
                message="Task not found"
            )

        # AI analysis prompt
        ai_prompt = f"""
        Analyze this task in detail:
        Title: {task.title}
        Description: {task.description}
        Current Priority: {task.priority}
        Status: {task.status}
        Estimated Duration: {task.estimated_duration} minutes

        User's task context: {task_context}

        Provide insights on:
        1. Task complexity assessment
        2. Priority adjustment recommendation
        3. Time blocking suggestions
        4. Potential blockers or dependencies
        5. Breakdown into subtasks if beneficial
        6. Productivity tips for this specific task
        """

        ai_result = await self.agent.run(ai_prompt)

        return AgentResponse(
            success=True,
            message="Task analysis completed",
            data={
                "task_id": task.id,
                "analysis": ai_result.data,
                "current_status": task.status.value
            },
            suggestions=ai_result.suggestions or []
        )

    async def _prioritize_tasks(
        self,
        db: AsyncSession,
        user_id: int,
        task_context: Dict[str, Any]
    ) -> AgentResponse:
        """Prioritize user's pending tasks using AI."""
        # Get pending tasks
        result = await db.execute(
            select(Task).where(
                Task.user_id == user_id,
                Task.status == TaskStatus.PENDING
            ).order_by(Task.created_at)
        )
        pending_tasks = result.scalars().all()

        if not pending_tasks:
            return AgentResponse(
                success=True,
                message="No pending tasks to prioritize",
                suggestions=["Create some tasks to get started!"]
            )

        # AI prioritization prompt
        tasks_data = [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "current_priority": task.priority.value,
                "estimated_duration": task.estimated_duration,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "ai_priority_score": task.ai_priority_score
            }
            for task in pending_tasks
        ]

        ai_prompt = f"""
        Prioritize these {len(pending_tasks)} tasks for optimal productivity:

        Tasks: {tasks_data}

        Context: {task_context}

        Provide:
        1. Recommended priority order (task IDs in order)
        2. Reasoning for each prioritization decision
        3. Time blocking suggestions for today
        4. Quick wins vs. important long-term tasks identification
        5. Dependencies between tasks
        """

        ai_result = await self.agent.run(ai_prompt)

        # Log activity
        await self.log_activity(
            db, user_id, "tasks_prioritized",
            f"Prioritized {len(pending_tasks)} pending tasks",
            {"task_count": len(pending_tasks), "ai_recommendations": ai_result.data}
        )

        return AgentResponse(
            success=True,
            message=f"Prioritized {len(pending_tasks)} tasks",
            data={
                "prioritized_tasks": ai_result.data,
                "task_count": len(pending_tasks)
            },
            suggestions=ai_result.suggestions or []
        )

    async def _complete_task(
        self,
        db: AsyncSession,
        user_id: int,
        request: TaskRequest
    ) -> AgentResponse:
        """Mark a task as completed and award XP."""
        if not request.task_id:
            return AgentResponse(
                success=False,
                message="Task ID required for completion"
            )

        # Get the task
        task = await db.get(Task, request.task_id)
        if not task or task.user_id != user_id:
            return AgentResponse(
                success=False,
                message="Task not found"
            )

        if task.status == TaskStatus.COMPLETED:
            return AgentResponse(
                success=False,
                message="Task already completed"
            )

        # Mark as completed
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.utcnow()

        # Record actual duration if provided
        if request.task_data and 'actual_duration' in request.task_data:
            task.actual_duration = request.task_data['actual_duration']

        await db.commit()

        # Award XP
        await self.award_xp(db, user_id, task.xp_reward, f"Completed task: {task.title}")

        # Log activity
        await self.log_activity(
            db, user_id, "task_completed",
            f"Completed task: {task.title}",
            {"task_id": task.id, "xp_earned": task.xp_reward}
        )

        return AgentResponse(
            success=True,
            message=f"Congratulations! You completed '{task.title}'",
            data={
                "task_id": task.id,
                "xp_earned": task.xp_reward
            },
            xp_earned=task.xp_reward,
            suggestions=["Great job! Keep up the momentum with your next task."]
        )

    async def _recommend_tasks(
        self,
        db: AsyncSession,
        user_id: int,
        user_context: Dict[str, Any],
        task_context: Dict[str, Any]
    ) -> AgentResponse:
        """Provide AI-generated task recommendations."""
        ai_prompt = f"""
        Generate personalized task recommendations for this user:

        User context: {user_context}
        Task context: {task_context}

        Suggest 3-5 productive tasks based on:
        1. User's current productivity level and XP
        2. Common productivity patterns
        3. Quick wins to build momentum
        4. Important long-term goals
        5. Skills development opportunities

        For each task, provide:
        - Clear, actionable title
        - Brief description
        - Estimated duration
        - Expected XP reward
        - Why this task would be beneficial now
        """

        ai_result = await self.agent.run(ai_prompt)

        return AgentResponse(
            success=True,
            message="Generated personalized task recommendations",
            data=ai_result.data,
            suggestions=ai_result.suggestions or []
        )

    async def _get_task_context(self, db: AsyncSession, user_id: int) -> Dict[str, Any]:
        """Get user's task-related context for AI decision making."""
        # Get task statistics
        pending_result = await db.execute(
            select(func.count(Task.id)).where(
                Task.user_id == user_id,
                Task.status == TaskStatus.PENDING
            )
        )
        pending_count = pending_result.scalar() or 0

        completed_result = await db.execute(
            select(func.count(Task.id)).where(
                Task.user_id == user_id,
                Task.status == TaskStatus.COMPLETED
            )
        )
        completed_count = completed_result.scalar() or 0

        # Get recent completed tasks
        recent_completed = await db.execute(
            select(Task).where(
                Task.user_id == user_id,
                Task.status == TaskStatus.COMPLETED
            ).order_by(Task.completed_at.desc()).limit(5)
        )
        recent_tasks = recent_completed.scalars().all()

        return {
            "pending_tasks_count": pending_count,
            "completed_tasks_count": completed_count,
            "recent_completed_tasks": [
                {
                    "title": task.title,
                    "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                    "duration": task.actual_duration
                }
                for task in recent_tasks
            ],
            "completion_rate": completed_count / max(1, completed_count + pending_count)
        }

    async def get_recommendations(
        self,
        db: AsyncSession,
        user_id: int,
        context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Get proactive task recommendations for the user."""
        task_context = await self._get_task_context(db, user_id)

        # Provide recommendations based on user's current state
        recommendations = []

        # If user has no pending tasks, suggest creating some
        if task_context["pending_tasks_count"] == 0:
            recommendations.append({
                "agent": "task",
                "type": "suggestion",
                "title": "Create Your First Task",
                "description": "Start your productivity journey by creating a task!",
                "action": "create_task",
                "priority": "high"
            })

        # If user has many pending tasks, suggest prioritizing
        elif task_context["pending_tasks_count"] > 5:
            recommendations.append({
                "agent": "task",
                "type": "suggestion",
                "title": "Prioritize Your Tasks",
                "description": f"You have {task_context['pending_tasks_count']} pending tasks. Let me help you prioritize them.",
                "action": "prioritize_tasks",
                "priority": "medium"
            })

        return recommendations