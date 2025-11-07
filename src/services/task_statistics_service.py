"""Task Statistics Service.

Calculates task completion statistics and productivity scores
for users based on their task history.
"""

from datetime import datetime, timedelta


class StatisticsService:
    """Service for calculating task statistics and productivity metrics."""

    def __init__(self):
        """Initialize the statistics service with in-memory storage."""
        # In-memory storage for demo purposes
        # In production, this would query a database
        self._tasks: dict[str, list[dict]] = {}
        self._completions: dict[str, list[dict]] = {}

    async def get_user_statistics(self, user_id: str) -> dict:
        """
        Calculate comprehensive statistics for a user.

        Args:
            user_id: The unique identifier for the user

        Returns:
            Dictionary containing:
            - total_tasks: Total number of tasks created
            - completed_tasks: Number of completed tasks
            - completion_rate: Percentage of tasks completed (0-100)
            - avg_completion_time_minutes: Average time to complete tasks
            - productivity_score: Overall productivity score (0-100)
            - streak_days: Current consecutive days with completions

        Raises:
            ValueError: If user_id is invalid
        """
        if not user_id or not isinstance(user_id, str):
            raise ValueError("Invalid user_id")

        tasks = self._tasks.get(user_id, [])
        completions = self._completions.get(user_id, [])

        total_tasks = len(tasks)
        completed_tasks = len(completions)

        # Calculate completion rate
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0

        # Calculate average completion time
        avg_completion_time = 0.0
        if completions:
            total_minutes = sum(c.get("completion_time_minutes", 0) for c in completions)
            avg_completion_time = total_minutes / len(completions)

        # Calculate streak
        streak_days = self._calculate_streak(completions)

        # Calculate productivity score
        productivity_score = self._calculate_productivity_score(
            completion_rate=completion_rate,
            avg_completion_time=avg_completion_time,
            streak_days=streak_days,
            total_completed=completed_tasks,
        )

        return {
            "user_id": user_id,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completion_rate, 2),
            "avg_completion_time_minutes": round(avg_completion_time, 2),
            "productivity_score": round(productivity_score, 2),
            "streak_days": streak_days,
        }

    async def get_productivity_score(self, user_id: str) -> float:
        """
        Calculate productivity score for a user.

        The productivity score is a composite metric (0-100) based on:
        - Completion rate (40% weight)
        - Task velocity (30% weight)
        - Consistency/streak (20% weight)
        - Volume (10% weight)

        Args:
            user_id: The unique identifier for the user

        Returns:
            Productivity score between 0 and 100

        Raises:
            ValueError: If user_id is invalid
        """
        if not user_id or not isinstance(user_id, str):
            raise ValueError("Invalid user_id")

        stats = await self.get_user_statistics(user_id)
        return stats["productivity_score"]

    def _calculate_streak(self, completions: list[dict]) -> int:
        """
        Calculate current consecutive days with task completions.

        Args:
            completions: List of completion records with timestamps

        Returns:
            Number of consecutive days with completions
        """
        if not completions:
            return 0

        # Sort completions by timestamp (most recent first)
        sorted_completions = sorted(
            completions,
            key=lambda x: x.get("completed_at", datetime.min),
            reverse=True,
        )

        streak = 0
        current_date = datetime.now().date()

        # Track unique days with completions
        completion_days = set()
        for completion in sorted_completions:
            completed_at = completion.get("completed_at")
            if completed_at:
                completion_days.add(completed_at.date())

        # Calculate streak from today backwards
        check_date = current_date
        while check_date in completion_days:
            streak += 1
            check_date -= timedelta(days=1)

        return streak

    def _calculate_productivity_score(
        self,
        completion_rate: float,
        avg_completion_time: float,
        streak_days: int,
        total_completed: int,
    ) -> float:
        """
        Calculate composite productivity score.

        Scoring algorithm:
        - Completion rate: 40% weight (0-40 points)
        - Task velocity: 30% weight (0-30 points, faster is better)
        - Consistency/streak: 20% weight (0-20 points)
        - Volume: 10% weight (0-10 points)

        Args:
            completion_rate: Percentage of tasks completed (0-100)
            avg_completion_time: Average minutes to complete tasks
            streak_days: Current consecutive days with completions
            total_completed: Total number of completed tasks

        Returns:
            Productivity score between 0 and 100
        """
        # Component 1: Completion rate (40% weight)
        completion_score = (completion_rate / 100) * 40

        # Component 2: Task velocity (30% weight)
        # Assume optimal completion time is 30 minutes
        # Score decreases as time deviates from optimal
        if avg_completion_time > 0:
            optimal_time = 30.0
            velocity_factor = optimal_time / max(avg_completion_time, optimal_time)
            velocity_score = velocity_factor * 30
        else:
            velocity_score = 0.0

        # Component 3: Consistency/streak (20% weight)
        # Diminishing returns after 30 days
        streak_score = min(streak_days / 30, 1.0) * 20

        # Component 4: Volume (10% weight)
        # Logarithmic scaling: 1 task = 1 point, 100 tasks = 10 points
        if total_completed > 0:
            import math

            volume_score = min(math.log10(total_completed + 1) * 5, 10.0)
        else:
            volume_score = 0.0

        total_score = completion_score + velocity_score + streak_score + volume_score

        return min(max(total_score, 0.0), 100.0)

    # Test helper methods (would be injected via dependency injection in production)
    def _add_task(self, user_id: str, task: dict):
        """Add a task for testing purposes."""
        if user_id not in self._tasks:
            self._tasks[user_id] = []
        self._tasks[user_id].append(task)

    def _add_completion(self, user_id: str, completion: dict):
        """Add a completion for testing purposes."""
        if user_id not in self._completions:
            self._completions[user_id] = []
        self._completions[user_id].append(completion)

    def _clear_data(self):
        """Clear all data for testing purposes."""
        self._tasks.clear()
        self._completions.clear()
