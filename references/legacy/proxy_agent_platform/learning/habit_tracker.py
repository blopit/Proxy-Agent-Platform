"""
Habit formation tracking and analysis system.

Tracks user behavior patterns to identify forming habits,
analyze habit strength, and predict disruption risks.
"""

import statistics
from collections import defaultdict
from datetime import datetime
from typing import Any


class HabitTracker:
    """Tracks and analyzes habit formation and maintenance."""

    def __init__(self):
        """Initialize the habit tracker."""
        self.habit_threshold = 0.6  # Minimum consistency for habit recognition
        self.disruption_risk_threshold = 0.7

    async def detect_forming_habits(self, behavior_data: dict[str, Any]) -> dict[str, Any]:
        """
        Detect emerging habits from behavior patterns.

        Args:
            behavior_data: User activity data with timestamps and actions

        Returns:
            Dictionary containing detected habits and formation metrics
        """
        activities = behavior_data.get("activities", [])

        if not activities:
            return {"emerging_habits": [], "formation_strength": {}, "consistency_score": 0.0}

        # Group activities by action type
        action_groups = defaultdict(list)
        for activity in activities:
            action = activity["action"]
            timestamp = datetime.fromisoformat(activity["timestamp"].replace("Z", "+00:00"))
            action_groups[action].append(timestamp)

        # Analyze each action for habit formation
        emerging_habits = []
        formation_strength = {}

        for action, timestamps in action_groups.items():
            if len(timestamps) < 3:  # Need at least 3 occurrences
                continue

            habit_analysis = self._analyze_habit_formation(action, timestamps)

            if habit_analysis["is_emerging"]:
                emerging_habits.append(
                    {
                        "action": action,
                        "occurrences": len(timestamps),
                        "consistency": habit_analysis["consistency"],
                        "pattern_type": habit_analysis["pattern_type"],
                    }
                )

            formation_strength[action] = habit_analysis["strength"]

        # Calculate overall consistency score
        consistency_score = self._calculate_overall_consistency(action_groups)

        return {
            "emerging_habits": emerging_habits,
            "formation_strength": formation_strength,
            "consistency_score": consistency_score,
        }

    async def analyze_habit_strength(self, habit_data: dict[str, Any]) -> dict[str, Any]:
        """
        Analyze the strength and consistency of an established habit.

        Args:
            habit_data: Habit occurrence data with completion status

        Returns:
            Dictionary containing strength analysis and improvement suggestions
        """
        habit_name = habit_data.get("habit_name", "unknown")
        occurrences = habit_data.get("occurrences", [])

        if not occurrences:
            return {
                "strength_score": 0.0,
                "consistency_rating": "no_data",
                "improvement_suggestions": ["Start tracking this habit to build strength"],
            }

        # Calculate completion rate
        total_days = len(occurrences)
        completed_days = sum(1 for occ in occurrences if occ.get("completed", False))
        completion_rate = completed_days / total_days if total_days > 0 else 0

        # Analyze time consistency
        time_variances = [
            occ.get("time_variance", 0)
            for occ in occurrences
            if occ.get("time_variance") is not None
        ]
        time_consistency = self._calculate_time_consistency(time_variances)

        # Calculate overall strength score
        strength_score = (completion_rate * 0.7) + (time_consistency * 0.3)

        # Determine consistency rating
        consistency_rating = self._get_consistency_rating(strength_score)

        # Generate improvement suggestions
        improvement_suggestions = self._generate_improvement_suggestions(
            completion_rate, time_consistency, occurrences
        )

        return {
            "strength_score": strength_score,
            "consistency_rating": consistency_rating,
            "improvement_suggestions": improvement_suggestions,
            "completion_rate": completion_rate,
            "time_consistency": time_consistency,
        }

    async def predict_disruption_risk(self, disruption_data: dict[str, Any]) -> dict[str, Any]:
        """
        Predict the risk of habit disruption based on current factors.

        Args:
            disruption_data: Habit history and current risk factors

        Returns:
            Dictionary containing risk assessment and mitigation strategies
        """
        habit_history = disruption_data.get("habit_history", {})
        risk_factors = disruption_data.get("risk_factors", {})

        # Analyze habit stability
        current_streak = habit_history.get("current_streak", 0)
        longest_streak = habit_history.get("longest_streak", 0)
        recent_misses = habit_history.get("recent_misses", 0)
        consistency_trend = habit_history.get("consistency_trend", "unknown")

        # Calculate base risk from habit history
        history_risk = self._calculate_history_risk(
            current_streak, longest_streak, recent_misses, consistency_trend
        )

        # Calculate risk from current factors
        factor_risk = self._calculate_factor_risk(risk_factors)

        # Combine risks (weighted average)
        total_risk = (history_risk * 0.6) + (factor_risk * 0.4)

        # Determine risk level
        if total_risk < 0.3:
            risk_level = "low"
        elif total_risk < 0.7:
            risk_level = "medium"
        else:
            risk_level = "high"

        # Generate mitigation strategies
        mitigation_strategies = self._generate_mitigation_strategies(
            risk_level, risk_factors, habit_history
        )

        return {
            "risk_level": risk_level,
            "risk_score": total_risk,
            "risk_factors": self._identify_key_risk_factors(risk_factors),
            "mitigation_strategies": mitigation_strategies,
        }

    def _analyze_habit_formation(self, action: str, timestamps: list[datetime]) -> dict[str, Any]:
        """Analyze whether an action is forming into a habit."""
        # Sort timestamps
        sorted_timestamps = sorted(timestamps)

        # Calculate time intervals between occurrences
        intervals = []
        for i in range(1, len(sorted_timestamps)):
            interval = (
                sorted_timestamps[i] - sorted_timestamps[i - 1]
            ).total_seconds() / 3600  # hours
            intervals.append(interval)

        # Determine pattern consistency
        if not intervals:
            return {
                "is_emerging": False,
                "strength": 0.0,
                "consistency": 0.0,
                "pattern_type": "insufficient_data",
            }

        # Check for daily pattern (around 24 hours)
        daily_pattern_score = self._check_daily_pattern(intervals)

        # Check for weekly pattern (around 168 hours)
        weekly_pattern_score = self._check_weekly_pattern(intervals)

        # Determine dominant pattern
        if daily_pattern_score > weekly_pattern_score:
            pattern_type = "daily"
            consistency = daily_pattern_score
        else:
            pattern_type = "weekly"
            consistency = weekly_pattern_score

        # Determine if habit is emerging
        is_emerging = consistency > self.habit_threshold and len(timestamps) >= 3

        # Calculate formation strength
        recency_bonus = self._calculate_recency_bonus(sorted_timestamps)
        strength = consistency * (1 + recency_bonus)

        return {
            "is_emerging": is_emerging,
            "strength": min(1.0, strength),
            "consistency": consistency,
            "pattern_type": pattern_type,
        }

    def _check_daily_pattern(self, intervals: list[float]) -> float:
        """Check how well intervals match a daily pattern."""
        if not intervals:
            return 0.0

        # Look for intervals around 24 hours (with tolerance)
        daily_intervals = [abs(interval - 24) for interval in intervals]
        avg_deviation = statistics.mean(daily_intervals)

        # Score based on how close to 24 hours the intervals are
        if avg_deviation < 2:  # Within 2 hours
            return 1.0 - (avg_deviation / 24)
        elif avg_deviation < 6:  # Within 6 hours
            return 0.7 - (avg_deviation / 24)
        else:
            return max(0.0, 0.3 - (avg_deviation / 48))

    def _check_weekly_pattern(self, intervals: list[float]) -> float:
        """Check how well intervals match a weekly pattern."""
        if not intervals:
            return 0.0

        # Look for intervals around 168 hours (1 week)
        weekly_intervals = [abs(interval - 168) for interval in intervals]
        avg_deviation = statistics.mean(weekly_intervals)

        # Score based on how close to 168 hours the intervals are
        if avg_deviation < 12:  # Within 12 hours
            return 1.0 - (avg_deviation / 168)
        elif avg_deviation < 24:  # Within 24 hours
            return 0.7 - (avg_deviation / 168)
        else:
            return max(0.0, 0.3 - (avg_deviation / 336))

    def _calculate_recency_bonus(self, timestamps: list[datetime]) -> float:
        """Calculate bonus for recent habit activity."""
        if not timestamps:
            return 0.0

        last_occurrence = max(timestamps)
        hours_since_last = (datetime.now() - last_occurrence).total_seconds() / 3600

        # Bonus decreases as time since last occurrence increases
        if hours_since_last < 24:
            return 0.2
        elif hours_since_last < 48:
            return 0.1
        else:
            return 0.0

    def _calculate_overall_consistency(self, action_groups: dict[str, list[datetime]]) -> float:
        """Calculate overall consistency across all tracked actions."""
        if not action_groups:
            return 0.0

        consistency_scores = []
        for action, timestamps in action_groups.items():
            if len(timestamps) >= 2:
                habit_analysis = self._analyze_habit_formation(action, timestamps)
                consistency_scores.append(habit_analysis["consistency"])

        return statistics.mean(consistency_scores) if consistency_scores else 0.0

    def _calculate_time_consistency(self, time_variances: list[float]) -> float:
        """Calculate consistency score based on time variances."""
        if not time_variances:
            return 1.0  # Perfect consistency if no variance data

        avg_variance = statistics.mean(time_variances)

        # Convert variance to consistency score (lower variance = higher consistency)
        if avg_variance <= 5:  # Within 5 minutes
            return 1.0
        elif avg_variance <= 15:  # Within 15 minutes
            return 0.8
        elif avg_variance <= 30:  # Within 30 minutes
            return 0.6
        elif avg_variance <= 60:  # Within 1 hour
            return 0.4
        else:
            return 0.2

    def _get_consistency_rating(self, strength_score: float) -> str:
        """Convert strength score to human-readable rating."""
        if strength_score >= 0.8:
            return "excellent"
        elif strength_score >= 0.6:
            return "good"
        elif strength_score >= 0.4:
            return "fair"
        elif strength_score >= 0.2:
            return "poor"
        else:
            return "very_poor"

    def _generate_improvement_suggestions(
        self, completion_rate: float, time_consistency: float, occurrences: list[dict]
    ) -> list[str]:
        """Generate personalized suggestions for habit improvement."""
        suggestions = []

        if completion_rate < 0.7:
            suggestions.append(
                "Focus on consistency - try to complete the habit daily for one week"
            )

        if time_consistency < 0.6:
            suggestions.append("Try to perform the habit at the same time each day")

        # Check for recent missed days
        recent_misses = sum(1 for occ in occurrences[-7:] if not occ.get("completed", False))
        if recent_misses > 2:
            suggestions.append("You've missed this habit recently - consider setting reminders")

        if not suggestions:
            suggestions.append("Great job! Keep up the consistent habit performance")

        return suggestions

    def _calculate_history_risk(
        self, current_streak: int, longest_streak: int, recent_misses: int, trend: str
    ) -> float:
        """Calculate disruption risk based on habit history."""
        risk = 0.0

        # Streak-based risk
        if current_streak < 3:
            risk += 0.4
        elif current_streak < 7:
            risk += 0.2

        # Stability risk (current vs longest streak)
        if longest_streak > 0:
            stability_ratio = current_streak / longest_streak
            if stability_ratio < 0.3:
                risk += 0.3
            elif stability_ratio < 0.6:
                risk += 0.1

        # Recent performance risk
        if recent_misses > 2:
            risk += 0.3
        elif recent_misses > 0:
            risk += 0.1

        # Trend risk
        if trend == "declining":
            risk += 0.2

        return min(1.0, risk)

    def _calculate_factor_risk(self, risk_factors: dict[str, Any]) -> float:
        """Calculate risk from current environmental/personal factors."""
        risk = 0.0

        if risk_factors.get("schedule_changes", False):
            risk += 0.3

        stress_level = risk_factors.get("stress_level", 0.5)
        if stress_level > 0.7:
            risk += 0.3
        elif stress_level > 0.5:
            risk += 0.1

        recent_failures = risk_factors.get("recent_failures", 0)
        if recent_failures > 0:
            risk += min(0.4, recent_failures * 0.2)

        return min(1.0, risk)

    def _identify_key_risk_factors(self, risk_factors: dict[str, Any]) -> list[str]:
        """Identify the most significant risk factors."""
        factors = []

        if risk_factors.get("schedule_changes", False):
            factors.append("schedule_changes")

        if risk_factors.get("stress_level", 0.5) > 0.7:
            factors.append("high_stress")

        if risk_factors.get("recent_failures", 0) > 0:
            factors.append("recent_failures")

        return factors

    def _generate_mitigation_strategies(
        self, risk_level: str, risk_factors: dict[str, Any], habit_history: dict[str, Any]
    ) -> list[str]:
        """Generate specific strategies to mitigate disruption risk."""
        strategies = []

        if risk_level == "high":
            strategies.append("Consider a simplified version of the habit to maintain momentum")

        if risk_factors.get("schedule_changes", False):
            strategies.append("Plan alternative times for the habit during schedule disruptions")

        if risk_factors.get("stress_level", 0.5) > 0.7:
            strategies.append("Focus on stress management - consider the habit as self-care")

        if risk_factors.get("recent_failures", 0) > 0:
            strategies.append("Don't let recent misses discourage you - restart today")

        if habit_history.get("current_streak", 0) < 7:
            strategies.append("Focus on building a 7-day streak to strengthen the habit")

        if not strategies:
            strategies.append("Continue current approach - habit appears stable")

        return strategies
