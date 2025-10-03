"""
Task Proxy Agent for Proxy Agent Platform.

Handles micro-task capture, delegation, and completion tracking with real-time
progress monitoring and intelligent task management.
"""

from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from enum import Enum

from pydantic import Field
from pydantic_ai import RunContext

from .base import BaseProxyAgent, AgentExecutionContext, AgentResult, AgentStatus
from ..models.task import Task, TaskStatus, TaskPriority, TaskCategory


class TaskAction(str, Enum):
    """Actions the Task Proxy can perform."""
    CAPTURE = "capture"
    PRIORITIZE = "prioritize"
    SCHEDULE = "schedule"
    DELEGATE = "delegate"
    COMPLETE = "complete"
    UPDATE = "update"
    ARCHIVE = "archive"


@dataclass
class TaskProxyDependencies:
    """Dependencies for the Task Proxy agent."""
    user_id: str
    task_storage: Any  # Would be actual task storage service
    calendar_integration: Optional[Any] = None
    notification_service: Optional[Any] = None
    context_engineering_agent: Optional[Any] = None
    session_id: Optional[str] = None


class TaskProxy(BaseProxyAgent[TaskProxyDependencies]):
    """
    Task Proxy Agent for intelligent task management.

    Specializes in:
    - Instant task capture from any source (voice, mobile, desktop)
    - Intelligent task prioritization based on energy and context
    - Smart scheduling and delegation
    - Progress tracking with gamification
    - Context-aware task recommendations
    """

    def __init__(self):
        system_prompt = """
You are a Task Proxy, an AI agent specialized in personal productivity and task management. Your primary role is to help users capture, organize, prioritize, and complete tasks efficiently.

Your capabilities include:
1. **Instant Task Capture**: Quickly capture tasks from any input method (voice, text, mobile shortcuts)
2. **Intelligent Prioritization**: Analyze task importance, urgency, and user context to suggest optimal prioritization
3. **Smart Scheduling**: Consider user's energy levels, calendar, and preferences for optimal task scheduling
4. **Delegation Support**: Identify tasks that can be delegated to other agents or services
5. **Progress Tracking**: Monitor completion status and provide motivational feedback
6. **Context Awareness**: Adapt recommendations based on time, location, energy level, and user preferences

Key principles:
- Keep interactions fast and frictionless (especially for mobile)
- Always suggest the next best action
- Provide clear, actionable outputs
- Consider user's current energy and context
- Focus on helping users maintain momentum and avoid overwhelm

When capturing tasks:
- Extract clear, actionable descriptions
- Estimate time and energy requirements
- Suggest appropriate priority levels
- Identify any dependencies or prerequisites
- Recommend optimal timing based on context

When managing tasks:
- Help break down complex tasks into manageable steps
- Suggest task batching opportunities
- Provide progress updates and celebrate completions
- Adapt to user's working style and preferences
"""

        super().__init__(
            agent_type="task_proxy",
            system_prompt=system_prompt,
            deps_type=TaskProxyDependencies,
            description="Intelligent task capture, prioritization, and management with context awareness"
        )

    def _register_agent_tools(self) -> None:
        """Register Task Proxy specific tools."""

        @self.agent.tool
        async def capture_task(
            ctx: RunContext[TaskProxyDependencies],
            description: str,
            priority: str = "medium",
            category: str = "general",
            estimated_minutes: int = 30,
            energy_required: str = "medium",
            due_date: Optional[str] = None
        ) -> Dict[str, Any]:
            """
            Capture a new task with intelligent categorization and scheduling.

            Args:
                description: What needs to be done
                priority: low, medium, high, urgent
                category: general, work, personal, health, learning, etc.
                estimated_minutes: Estimated time to complete
                energy_required: low, medium, high energy requirement
                due_date: Optional due date (ISO format)
            """
            try:
                # Create task object
                task = Task(
                    user_id=ctx.deps.user_id,
                    title=description[:100],  # Limit title length
                    description=description,
                    status=TaskStatus.PENDING,
                    priority=TaskPriority(priority.lower()),
                    category=TaskCategory(category.lower()) if category.lower() in [c.value for c in TaskCategory] else TaskCategory.GENERAL,
                    estimated_minutes=estimated_minutes,
                    energy_level_required=energy_required.lower(),
                    due_date=datetime.fromisoformat(due_date) if due_date else None,
                )

                # Store task (would use actual storage)
                # task_id = await ctx.deps.task_storage.create_task(task)

                # Mock successful storage
                task_id = f"task_{datetime.now().timestamp()}"

                # Send notification if configured
                if ctx.deps.notification_service:
                    await self._send_task_notification(ctx.deps.notification_service, task, "created")

                return {
                    "success": True,
                    "task_id": task_id,
                    "task": task.to_dict(),
                    "message": f"Task captured successfully: {description[:50]}...",
                    "suggested_actions": [
                        "Schedule this task in your calendar",
                        "Break down into smaller steps if complex",
                        "Set up reminders if time-sensitive"
                    ]
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to capture task"
                }

        @self.agent.tool
        async def prioritize_tasks(
            ctx: RunContext[TaskProxyDependencies],
            energy_level: float = 7.0,
            available_minutes: int = 60,
            focus_area: str = "any"
        ) -> Dict[str, Any]:
            """
            Get prioritized task recommendations based on current context.

            Args:
                energy_level: Current energy level (1-10)
                available_minutes: How much time is available
                focus_area: work, personal, health, learning, or any
            """
            try:
                # Mock task retrieval - would query actual storage
                mock_tasks = [
                    {
                        "id": "task_1",
                        "title": "Review project proposal",
                        "priority": "high",
                        "estimated_minutes": 45,
                        "energy_required": "high",
                        "category": "work"
                    },
                    {
                        "id": "task_2",
                        "title": "Call dentist for appointment",
                        "priority": "medium",
                        "estimated_minutes": 5,
                        "energy_required": "low",
                        "category": "personal"
                    },
                    {
                        "id": "task_3",
                        "title": "Update project documentation",
                        "priority": "medium",
                        "estimated_minutes": 30,
                        "energy_required": "medium",
                        "category": "work"
                    }
                ]

                # Filter and prioritize based on context
                suitable_tasks = []
                for task in mock_tasks:
                    # Check time fit
                    if task["estimated_minutes"] <= available_minutes:
                        # Check energy match
                        task_energy = {"low": 3, "medium": 6, "high": 9}[task["energy_required"]]
                        if task_energy <= energy_level:
                            # Check focus area
                            if focus_area == "any" or task["category"] == focus_area:
                                suitable_tasks.append(task)

                # Sort by priority and energy match
                priority_scores = {"urgent": 4, "high": 3, "medium": 2, "low": 1}
                suitable_tasks.sort(
                    key=lambda t: (priority_scores[t["priority"]], -t["estimated_minutes"]),
                    reverse=True
                )

                return {
                    "success": True,
                    "recommended_tasks": suitable_tasks[:5],  # Top 5 recommendations
                    "context": {
                        "energy_level": energy_level,
                        "available_minutes": available_minutes,
                        "focus_area": focus_area
                    },
                    "message": f"Found {len(suitable_tasks)} suitable tasks for your current context",
                    "productivity_tip": self._get_productivity_tip(energy_level, available_minutes)
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to prioritize tasks"
                }

        @self.agent.tool
        async def complete_task(
            ctx: RunContext[TaskProxyDependencies],
            task_id: str,
            completion_notes: str = "",
            actual_time_spent: Optional[int] = None
        ) -> Dict[str, Any]:
            """
            Mark a task as completed and calculate XP rewards.

            Args:
                task_id: ID of the task to complete
                completion_notes: Optional notes about completion
                actual_time_spent: Actual minutes spent (for learning)
            """
            try:
                # Mock task completion - would update actual storage
                # task = await ctx.deps.task_storage.get_task(task_id)
                # await ctx.deps.task_storage.update_task_status(task_id, TaskStatus.COMPLETED)

                # Mock task data
                mock_task = {
                    "id": task_id,
                    "title": "Example completed task",
                    "priority": "medium",
                    "estimated_minutes": 30,
                    "category": "work"
                }

                # Calculate XP reward based on task characteristics
                base_xp = 50
                priority_bonus = {"low": 0, "medium": 10, "high": 20, "urgent": 30}
                xp_earned = base_xp + priority_bonus.get(mock_task["priority"], 0)

                # Efficiency bonus if completed faster than estimated
                if actual_time_spent and actual_time_spent < mock_task["estimated_minutes"]:
                    efficiency_bonus = int((mock_task["estimated_minutes"] - actual_time_spent) / mock_task["estimated_minutes"] * 20)
                    xp_earned += efficiency_bonus

                # Send completion notification
                if ctx.deps.notification_service:
                    await self._send_task_notification(
                        ctx.deps.notification_service,
                        mock_task,
                        "completed"
                    )

                return {
                    "success": True,
                    "task_id": task_id,
                    "xp_earned": xp_earned,
                    "message": f"🎉 Task completed! Earned {xp_earned} XP",
                    "completion_time": datetime.now(timezone.utc).isoformat(),
                    "suggested_actions": [
                        "Take a moment to celebrate this win!",
                        "Review what you learned during this task",
                        "Consider what task to tackle next"
                    ]
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to complete task"
                }

        @self.agent.tool
        async def break_down_task(
            ctx: RunContext[TaskProxyDependencies],
            task_description: str,
            max_subtasks: int = 5
        ) -> Dict[str, Any]:
            """
            Break down a complex task into smaller, manageable subtasks.

            Args:
                task_description: Description of the complex task
                max_subtasks: Maximum number of subtasks to create
            """
            try:
                # This would use AI to intelligently break down tasks
                # For now, mock some intelligent breakdown
                subtasks = []

                if "project" in task_description.lower():
                    subtasks = [
                        "Define project requirements and scope",
                        "Research and gather necessary resources",
                        "Create project timeline and milestones",
                        "Begin implementation of core features",
                        "Review and refine project deliverables"
                    ]
                elif "email" in task_description.lower():
                    subtasks = [
                        "Outline key points to communicate",
                        "Draft initial email content",
                        "Review and refine tone and clarity",
                        "Send email and set follow-up reminders"
                    ]
                else:
                    # Generic breakdown
                    subtasks = [
                        "Research and understand requirements",
                        "Plan approach and gather resources",
                        "Execute main work",
                        "Review and finalize results"
                    ]

                # Limit to max_subtasks
                subtasks = subtasks[:max_subtasks]

                return {
                    "success": True,
                    "original_task": task_description,
                    "subtasks": [
                        {
                            "title": subtask,
                            "estimated_minutes": 15 + (i * 10),  # Varying estimates
                            "order": i + 1
                        }
                        for i, subtask in enumerate(subtasks)
                    ],
                    "message": f"Broke down task into {len(subtasks)} manageable steps",
                    "tip": "Tackle these subtasks one at a time for steady progress"
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to break down task"
                }

        @self.agent.tool
        async def delegate_to_context_engineering(
            ctx: RunContext[TaskProxyDependencies],
            coding_task_description: str,
            complexity: str = "medium"
        ) -> Dict[str, Any]:
            """
            Delegate a coding or development task to the Context Engineering agent.

            Args:
                coding_task_description: Description of the coding task
                complexity: low, medium, high complexity level
            """
            try:
                if not ctx.deps.context_engineering_agent:
                    return {
                        "success": False,
                        "message": "Context Engineering agent not available",
                        "suggestion": "Set up Context Engineering integration for coding task delegation"
                    }

                # Mock delegation to Context Engineering agent
                delegation_result = {
                    "delegated": True,
                    "agent": "context_engineering",
                    "task_description": coding_task_description,
                    "complexity": complexity,
                    "estimated_completion": "2-4 hours" if complexity == "medium" else "1-2 hours" if complexity == "low" else "1-2 days",
                    "next_step": "Context Engineering agent will analyze requirements and create implementation plan"
                }

                return {
                    "success": True,
                    "delegation": delegation_result,
                    "message": f"Successfully delegated coding task to Context Engineering agent",
                    "tracking_id": f"ce_task_{datetime.now().timestamp()}",
                    "suggested_actions": [
                        "Monitor progress through Context Engineering dashboard",
                        "Review generated PRP when available",
                        "Provide feedback on implementation approach"
                    ]
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to delegate to Context Engineering agent"
                }

    async def _send_task_notification(
        self,
        notification_service: Any,
        task: Any,
        action: str
    ) -> None:
        """Send task-related notification."""
        # Mock notification sending
        pass

    def _get_productivity_tip(self, energy_level: float, available_minutes: int) -> str:
        """Get context-appropriate productivity tip."""
        if energy_level >= 8 and available_minutes >= 60:
            return "High energy + good time block = perfect for tackling your most challenging task!"
        elif energy_level >= 6 and available_minutes >= 30:
            return "Good energy levels - great time for focused work on important tasks."
        elif energy_level <= 4:
            return "Lower energy detected - consider easier tasks or take a break first."
        elif available_minutes <= 15:
            return "Short time window - perfect for quick wins and admin tasks."
        else:
            return "Steady energy and decent time - good for making consistent progress."