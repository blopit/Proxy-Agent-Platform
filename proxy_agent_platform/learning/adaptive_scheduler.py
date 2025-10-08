"""
Adaptive scheduling system for optimal task timing.

Provides intelligent scheduling recommendations based on user patterns,
energy levels, and contextual factors.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Any


class SchedulingPriority(Enum):
    """Priority levels for task scheduling."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TimeSlot:
    """Represents a time slot with productivity information."""

    def __init__(self, start_time: datetime, end_time: datetime, productivity_score: float = 0.5):
        """Initialize a time slot."""
        self.start_time = start_time
        self.end_time = end_time
        self.productivity_score = productivity_score

    @property
    def duration_minutes(self) -> int:
        """Get duration in minutes."""
        return int((self.end_time - self.start_time).total_seconds() / 60)

    def overlaps_with(self, other: 'TimeSlot') -> bool:
        """Check if this time slot overlaps with another."""
        return (self.start_time < other.end_time and self.end_time > other.start_time)


class UserPreferences:
    """User scheduling preferences and constraints."""

    def __init__(
        self,
        user_id: int,
        preferred_work_hours: tuple[int, int] = (9, 17),
        break_duration_minutes: int = 15,
        max_focus_duration_minutes: int = 90,
        preferred_task_types: list[str] = None
    ):
        """Initialize user preferences."""
        self.user_id = user_id
        self.preferred_work_hours = preferred_work_hours
        self.break_duration_minutes = break_duration_minutes
        self.max_focus_duration_minutes = max_focus_duration_minutes
        self.preferred_task_types = preferred_task_types or []


class TaskSchedule:
    """Represents a scheduled task with timing and priority information."""

    def __init__(
        self,
        task_id: str,
        scheduled_start: datetime,
        estimated_duration_minutes: int,
        priority: SchedulingPriority,
        confidence_score: float = 0.5
    ):
        """Initialize a task schedule."""
        self.task_id = task_id
        self.scheduled_start = scheduled_start
        self.estimated_duration_minutes = estimated_duration_minutes
        self.priority = priority
        self.confidence_score = confidence_score

    @property
    def scheduled_end(self) -> datetime:
        """Get the scheduled end time."""
        return self.scheduled_start + timedelta(minutes=self.estimated_duration_minutes)


class AdaptiveScheduler:
    """Provides adaptive scheduling and timing optimization."""

    def __init__(self):
        """Initialize the adaptive scheduler."""
        self.confidence_threshold = 0.6
        self.user_patterns = {}
        self.scheduling_history = {}
        self.optimization_rules = {}
        self.user_preferences = {}

    async def suggest_optimal_timing(self, user_patterns: dict[str, Any]) -> dict[str, Any]:
        """
        Generate optimal timing suggestions based on user patterns.

        Args:
            user_patterns: User productivity patterns and preferences

        Returns:
            Dictionary containing scheduling recommendations
        """
        peak_hours = user_patterns.get("peak_hours", [])
        low_hours = user_patterns.get("low_hours", [])
        task_preferences = user_patterns.get("task_preferences", {})

        # Generate schedule recommendations
        recommended_schedule = self._create_optimal_schedule(
            peak_hours, low_hours, task_preferences
        )

        # Calculate confidence based on pattern data availability
        confidence_score = self._calculate_scheduling_confidence(user_patterns)

        # Generate reasoning for recommendations
        reasoning = self._generate_scheduling_reasoning(peak_hours, low_hours, task_preferences)

        return {
            "recommended_schedule": recommended_schedule,
            "confidence_score": confidence_score,
            "reasoning": reasoning,
        }

    async def dynamic_reschedule(self, current_state: dict[str, Any]) -> dict[str, Any]:
        """
        Dynamically reschedule tasks based on current conditions.

        Args:
            current_state: Current user state and scheduled tasks

        Returns:
            Dictionary containing updated schedule and optimization info
        """
        current_energy = current_state.get("current_energy", 0.5)
        scheduled_tasks = current_state.get("scheduled_tasks", [])
        available_slots = current_state.get("available_slots", [])

        # Analyze which tasks need rescheduling
        tasks_to_reschedule = []
        optimized_tasks = []

        for task in scheduled_tasks:
            task_type = task.get("type", "unknown")
            scheduled_time = task.get("scheduled_time", "")

            # Determine if task needs rescheduling based on energy requirements
            energy_requirement = self._get_energy_requirement(task_type)

            if self._should_reschedule(current_energy, energy_requirement):
                tasks_to_reschedule.append(task)
            else:
                optimized_tasks.append(task)

        # Reschedule tasks that need it
        changes_made = []
        for task in tasks_to_reschedule:
            best_slot = self._find_best_slot(task, available_slots, current_energy)
            if best_slot:
                task["scheduled_time"] = best_slot
                optimized_tasks.append(task)
                changes_made.append(
                    {
                        "task_id": task["id"],
                        "old_time": task.get("original_time", task["scheduled_time"]),
                        "new_time": best_slot,
                        "reason": "energy_optimization",
                    }
                )

        # Calculate optimization score
        optimization_score = self._calculate_optimization_score(changes_made, current_energy)

        return {
            "updated_schedule": optimized_tasks,
            "changes_made": changes_made,
            "optimization_score": optimization_score,
        }

    async def schedule_with_deadlines(self, scheduling_request: dict[str, Any]) -> dict[str, Any]:
        """
        Schedule tasks with deadline constraints and work hour limitations.

        Args:
            scheduling_request: Tasks with deadlines and constraints

        Returns:
            Dictionary containing optimized schedule and feasibility analysis
        """
        tasks = scheduling_request.get("tasks", [])
        constraints = scheduling_request.get("constraints", {})

        work_hours = constraints.get("work_hours", {"start": 9, "end": 17})
        break_requirements = constraints.get(
            "break_requirements", {"min_break": 15, "max_continuous": 120}
        )

        # Sort tasks by deadline urgency
        sorted_tasks = sorted(tasks, key=lambda t: datetime.fromisoformat(t["deadline"]))

        # Schedule tasks while respecting constraints
        optimized_schedule = []
        deadline_compliance = {}
        current_time = datetime.now()

        for task in sorted_tasks:
            deadline = datetime.fromisoformat(task["deadline"])
            duration = task["duration"]

            # Find available slot before deadline
            scheduled_slot = self._find_deadline_slot(
                current_time, deadline, duration, work_hours, break_requirements
            )

            if scheduled_slot:
                optimized_schedule.append(
                    {
                        "task_id": task["id"],
                        "scheduled_start": scheduled_slot.isoformat(),
                        "scheduled_end": (scheduled_slot + timedelta(minutes=duration)).isoformat(),
                        "deadline_met": True,
                    }
                )
                deadline_compliance[task["id"]] = True
            else:
                # Task cannot be scheduled before deadline
                optimized_schedule.append(
                    {
                        "task_id": task["id"],
                        "scheduled_start": None,
                        "scheduled_end": None,
                        "deadline_met": False,
                    }
                )
                deadline_compliance[task["id"]] = False

        # Check overall feasibility
        feasibility_check = self._check_schedule_feasibility(optimized_schedule, constraints)

        return {
            "optimized_schedule": optimized_schedule,
            "deadline_compliance": deadline_compliance,
            "feasibility_check": feasibility_check,
        }

    def _create_optimal_schedule(
        self, peak_hours: list[int], low_hours: list[int], task_preferences: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Create an optimal schedule based on patterns and preferences."""
        schedule = []

        # Schedule high-energy tasks during peak hours
        for hour in peak_hours:
            for task_type, prefs in task_preferences.items():
                if prefs.get("energy_requirement") == "high":
                    schedule.append(
                        {
                            "time_slot": f"{hour:02d}:00",
                            "recommended_task_type": task_type,
                            "energy_level": "high",
                            "duration": prefs.get("preferred_duration", 60),
                        }
                    )
                    break  # Only one high-energy task per peak hour

        # Schedule low-energy tasks during low hours
        for hour in low_hours:
            for task_type, prefs in task_preferences.items():
                if prefs.get("energy_requirement") == "low":
                    schedule.append(
                        {
                            "time_slot": f"{hour:02d}:00",
                            "recommended_task_type": task_type,
                            "energy_level": "low",
                            "duration": prefs.get("preferred_duration", 30),
                        }
                    )
                    break  # Only one task per hour

        return sorted(schedule, key=lambda x: x["time_slot"])

    def _calculate_scheduling_confidence(self, user_patterns: dict[str, Any]) -> float:
        """Calculate confidence in scheduling recommendations."""
        factors = []

        # Check if we have peak hours data
        if user_patterns.get("peak_hours"):
            factors.append(0.3)

        # Check if we have task preferences
        if user_patterns.get("task_preferences"):
            factors.append(0.4)

        # Check if we have low hours data
        if user_patterns.get("low_hours"):
            factors.append(0.3)

        return sum(factors)

    def _generate_scheduling_reasoning(
        self, peak_hours: list[int], low_hours: list[int], task_preferences: dict[str, Any]
    ) -> list[str]:
        """Generate human-readable reasoning for scheduling decisions."""
        reasoning = []

        if peak_hours:
            reasoning.append(f"High-energy tasks scheduled during peak hours: {peak_hours}")

        if low_hours:
            reasoning.append(f"Low-energy tasks scheduled during low-energy periods: {low_hours}")

        if task_preferences:
            reasoning.append("Task durations optimized based on historical performance")

        if not reasoning:
            reasoning.append("Schedule based on general productivity principles")

        return reasoning

    def _get_energy_requirement(self, task_type: str) -> str:
        """Determine energy requirement for a task type."""
        # Simple mapping - could be enhanced with learned patterns
        high_energy_tasks = ["coding", "planning", "analysis", "creative"]
        low_energy_tasks = ["email", "admin", "review", "documentation"]

        if task_type.lower() in high_energy_tasks:
            return "high"
        elif task_type.lower() in low_energy_tasks:
            return "low"
        else:
            return "medium"

    def _should_reschedule(self, current_energy: float, energy_requirement: str) -> bool:
        """Determine if a task should be rescheduled based on energy mismatch."""
        if energy_requirement == "high" and current_energy < 0.6:
            return True
        elif energy_requirement == "low" and current_energy > 0.8:
            return True  # Could use high energy for more important tasks
        return False

    def _find_best_slot(
        self, task: dict[str, Any], available_slots: list[str], current_energy: float
    ) -> str:
        """Find the best available slot for rescheduling a task."""
        task_type = task.get("type", "unknown")
        energy_requirement = self._get_energy_requirement(task_type)

        # Simple strategy: pick first available slot that matches energy needs
        for slot in available_slots:
            hour = int(slot.split(":")[0])

            # Assume energy is higher in morning (9-12) and lower in afternoon (14-16)
            if (
                energy_requirement == "high"
                and 9 <= hour <= 12
                or energy_requirement == "low"
                and 14 <= hour <= 16
            ):
                return slot

        # Fallback: return first available slot
        return available_slots[0] if available_slots else None

    def _calculate_optimization_score(
        self, changes_made: list[dict], current_energy: float
    ) -> float:
        """Calculate a score for how well the rescheduling optimized the schedule."""
        if not changes_made:
            return 1.0  # Perfect score if no changes needed

        # Score based on energy alignment and number of changes
        base_score = 0.8  # Start with good score
        change_penalty = len(changes_made) * 0.1  # Small penalty for each change

        return max(0.0, min(1.0, base_score - change_penalty))

    def _find_deadline_slot(
        self,
        start_time: datetime,
        deadline: datetime,
        duration_minutes: int,
        work_hours: dict[str, int],
        break_requirements: dict[str, int],
    ) -> datetime:
        """Find a suitable time slot before the deadline."""
        current = start_time
        work_start = work_hours["start"]
        work_end = work_hours["end"]

        while current + timedelta(minutes=duration_minutes) <= deadline:
            # Check if slot is within work hours
            if work_start <= current.hour < work_end:
                return current

            # Move to next hour
            current += timedelta(hours=1)

        return None  # No suitable slot found

    def _check_schedule_feasibility(
        self, schedule: list[dict[str, Any]], constraints: dict[str, Any]
    ) -> dict[str, Any]:
        """Check if the generated schedule is feasible."""
        scheduled_tasks = [task for task in schedule if task["scheduled_start"]]
        unscheduled_tasks = [task for task in schedule if not task["scheduled_start"]]

        return {
            "is_feasible": len(unscheduled_tasks) == 0,
            "scheduled_count": len(scheduled_tasks),
            "unscheduled_count": len(unscheduled_tasks),
            "feasibility_score": len(scheduled_tasks) / len(schedule) if schedule else 1.0,
        }

    def add_user_preferences(self, preferences: UserPreferences):
        """Add user preferences to the scheduler."""
        self.user_preferences[preferences.user_id] = preferences

    def analyze_productivity_patterns(self, user_id: int, historical_data: list[dict]) -> dict[str, Any]:
        """Analyze historical productivity data to identify patterns."""
        if not historical_data:
            return {"peak_hours": [], "low_hours": [], "task_preferences": {}}

        # Analyze productivity by hour
        hourly_productivity = {}
        for data_point in historical_data:
            hour = data_point.get("timestamp", datetime.now()).hour
            productivity = data_point.get("productivity_score", 0.5)
            if hour not in hourly_productivity:
                hourly_productivity[hour] = []
            hourly_productivity[hour].append(productivity)

        # Find peak and low hours
        avg_productivity = {}
        for hour, scores in hourly_productivity.items():
            avg_productivity[hour] = sum(scores) / len(scores)

        # Sort by productivity
        sorted_hours = sorted(avg_productivity.items(), key=lambda x: x[1], reverse=True)

        # Top 3 hours are peak, bottom 3 are low
        peak_hours = [hour for hour, _ in sorted_hours[:3]]
        low_hours = [hour for hour, _ in sorted_hours[-3:]]

        return {
            "peak_hours": peak_hours,
            "low_hours": low_hours,
            "task_type_preferences": {},
            "optimal_session_duration": 60  # Default 60 minutes
        }

    def optimize_schedule(self, user_id: int, tasks: list[dict], target_date: datetime) -> list[TaskSchedule]:
        """Optimize a schedule for the given tasks and date."""
        optimized = []

        # Sort tasks by priority (if available)
        sorted_tasks = sorted(tasks, key=lambda t: t.get("priority", "medium"))

        current_time = target_date.replace(hour=9, minute=0, second=0, microsecond=0)

        for task in sorted_tasks:
            duration = task.get("estimated_duration_minutes", task.get("duration_minutes", 30))
            priority_str = task.get("priority", "medium")

            # Convert string priority to enum
            priority_map = {
                "low": SchedulingPriority.LOW,
                "medium": SchedulingPriority.MEDIUM,
                "high": SchedulingPriority.HIGH,
                "urgent": SchedulingPriority.URGENT
            }
            priority = priority_map.get(priority_str, SchedulingPriority.MEDIUM)

            schedule = TaskSchedule(
                task_id=task.get("task_id", task.get("id", f"task-{len(optimized)}")),
                scheduled_start=current_time,
                estimated_duration_minutes=duration,
                priority=priority,
                confidence_score=0.8
            )

            optimized.append(schedule)
            current_time += timedelta(minutes=duration + 15)  # Add break time

        return optimized

    def suggest_optimal_time_slots(
        self,
        user_patterns: dict,
        task_type: str,
        duration_minutes: int,
        date: datetime
    ) -> list[TimeSlot]:
        """Suggest optimal time slots for a task."""
        slots = []

        # Generate time slots for the given date
        start_hour = 9
        end_hour = 17

        for hour in range(start_hour, end_hour):
            start_time = date.replace(hour=hour, minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(minutes=duration_minutes)

            # Simple productivity scoring (morning hours are more productive)
            productivity_score = 0.9 if hour < 12 else 0.7 if hour < 15 else 0.5

            slot = TimeSlot(
                start_time=start_time,
                end_time=end_time,
                productivity_score=productivity_score
            )
            slots.append(slot)

        # Sort by productivity score
        slots.sort(key=lambda s: s.productivity_score, reverse=True)

        return slots

    def update_scheduling_feedback(self, user_id: int, feedback: dict):
        """Update scheduling feedback for learning."""
        if user_id not in self.scheduling_history:
            self.scheduling_history[user_id] = []
        self.scheduling_history[user_id].append(feedback)

    def get_schedule_recommendations(self, user_id: int, upcoming_tasks: list[dict] = None) -> dict[str, Any]:
        """Get personalized schedule recommendations for a user."""
        if user_id not in self.user_preferences:
            return {"recommendations": [], "efficiency_tips": []}

        prefs = self.user_preferences[user_id]

        recommendations = [
            f"Schedule high-energy tasks between {prefs.preferred_work_hours[0]}:00 and 12:00",
            f"Take breaks every {prefs.max_focus_duration_minutes} minutes",
            f"Preferred task types: {', '.join(prefs.preferred_task_types)}"
        ]

        efficiency_tips = [
            "Batch similar tasks together",
            "Schedule important tasks during your peak hours",
            "Leave buffer time between tasks"
        ]

        return {
            "recommendations": recommendations,
            "efficiency_tips": efficiency_tips,
            "optimizations": [
                "Consider batching similar tasks",
                "Schedule high-priority tasks during peak hours",
                "Leave buffer time between tasks"
            ],
            "time_slots": [
                {"start": "09:00", "end": "10:00", "productivity": 0.9},
                {"start": "10:00", "end": "11:00", "productivity": 0.8},
                {"start": "14:00", "end": "15:00", "productivity": 0.7}
            ]
        }

    def calculate_schedule_efficiency(self, schedule: list[TaskSchedule]) -> float:
        """Calculate the efficiency score of a schedule."""
        if not schedule:
            return 0.0

        # Simple efficiency calculation based on priority distribution
        priority_scores = {
            SchedulingPriority.URGENT: 1.0,
            SchedulingPriority.HIGH: 0.8,
            SchedulingPriority.MEDIUM: 0.6,
            SchedulingPriority.LOW: 0.4
        }

        total_score = sum(priority_scores.get(task.priority, 0.5) for task in schedule)
        avg_score = total_score / len(schedule)

        return min(1.0, avg_score)
