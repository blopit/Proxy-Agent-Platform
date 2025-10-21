"""
Pattern recognition and analysis for user behavior.

Analyzes user activity patterns to identify productivity trends,
optimal timing, and behavioral insights.
"""

import statistics
from collections import defaultdict
from datetime import datetime
from typing import Any


class PatternAnalyzer:
    """Analyzes user patterns for productivity optimization."""

    def __init__(self):
        """Initialize the pattern analyzer."""
        self.confidence_threshold = 0.5

    async def detect_productivity_patterns(self, user_data: dict[str, Any]) -> dict[str, Any]:
        """
        Detect user productivity patterns from activity history.

        Args:
            user_data: User activity data with productivity scores by hour

        Returns:
            Dictionary containing detected patterns and confidence scores
        """
        activity_history = user_data.get("activity_history", [])

        if not activity_history:
            return {"peak_hours": [], "low_hours": [], "pattern_confidence": 0.0}

        # Group productivity scores by hour
        hour_scores = defaultdict(list)
        for activity in activity_history:
            hour = activity["hour"]
            score = activity["productivity_score"]
            hour_scores[hour].append(score)

        # Calculate average productivity by hour
        hour_averages = {}
        for hour, scores in hour_scores.items():
            hour_averages[hour] = statistics.mean(scores)

        # Identify peak and low hours
        if not hour_averages:
            return {"peak_hours": [], "low_hours": [], "pattern_confidence": 0.0}

        overall_avg = statistics.mean(hour_averages.values())
        overall_std = statistics.stdev(hour_averages.values()) if len(hour_averages) > 1 else 0

        # Peak hours: above average + 0.5 * std dev
        peak_threshold = overall_avg + (0.5 * overall_std)
        peak_hours = [hour for hour, avg in hour_averages.items() if avg >= peak_threshold]

        # Low hours: below average - 0.5 * std dev
        low_threshold = overall_avg - (0.5 * overall_std)
        low_hours = [hour for hour, avg in hour_averages.items() if avg <= low_threshold]

        # Calculate confidence based on data consistency
        confidence = self._calculate_pattern_confidence(hour_scores)

        return {
            "peak_hours": sorted(peak_hours),
            "low_hours": sorted(low_hours),
            "pattern_confidence": confidence,
            "hour_averages": hour_averages,
        }

    async def analyze_completion_patterns(self, completion_data: dict[str, Any]) -> dict[str, Any]:
        """
        Analyze task completion patterns by type and duration.

        Args:
            completion_data: Task completion history with types and outcomes

        Returns:
            Dictionary containing completion pattern analysis
        """
        completions = completion_data.get("completions", [])

        if not completions:
            return {"task_type_performance": {}, "optimal_durations": {}, "success_factors": {}}

        # Group by task type
        type_performance = defaultdict(lambda: {"success_rate": 0, "avg_time": 0, "count": 0})
        type_durations = defaultdict(list)

        for completion in completions:
            task_type = completion["task_type"]
            completion_time = completion["completion_time"]
            success = completion["success"]

            type_durations[task_type].append(completion_time)

            # Update performance metrics
            perf = type_performance[task_type]
            perf["count"] += 1
            perf["avg_time"] = ((perf["avg_time"] * (perf["count"] - 1)) + completion_time) / perf[
                "count"
            ]

            if success:
                perf["success_rate"] = ((perf["success_rate"] * (perf["count"] - 1)) + 1) / perf[
                    "count"
                ]
            else:
                perf["success_rate"] = (perf["success_rate"] * (perf["count"] - 1)) / perf["count"]

        # Calculate optimal durations
        optimal_durations = {}
        for task_type, durations in type_durations.items():
            if len(durations) >= 2:
                # Use median as optimal duration (more robust than mean)
                optimal_durations[task_type] = statistics.median(durations)
            elif len(durations) == 1:
                optimal_durations[task_type] = durations[0]

        # Identify success factors
        success_factors = self._analyze_success_factors(completions)

        return {
            "task_type_performance": dict(type_performance),
            "optimal_durations": optimal_durations,
            "success_factors": success_factors,
        }

    async def analyze_energy_patterns(self, energy_data: dict[str, Any]) -> dict[str, Any]:
        """
        Analyze energy level patterns throughout the day.

        Args:
            energy_data: Energy logs with timestamps and levels

        Returns:
            Dictionary containing energy pattern analysis
        """
        energy_logs = energy_data.get("energy_logs", [])

        if not energy_logs:
            return {"circadian_pattern": {}, "energy_peaks": [], "energy_valleys": []}

        # Parse timestamps and group by hour
        hour_energy = defaultdict(list)
        for log in energy_logs:
            timestamp = datetime.fromisoformat(log["timestamp"].replace("Z", "+00:00"))
            hour = timestamp.hour
            level = log["level"]
            hour_energy[hour].append(level)

        # Calculate average energy by hour
        circadian_pattern = {}
        for hour, levels in hour_energy.items():
            circadian_pattern[hour] = statistics.mean(levels)

        if not circadian_pattern:
            return {"circadian_pattern": {}, "energy_peaks": [], "energy_valleys": []}

        # Identify peaks and valleys
        energy_values = list(circadian_pattern.values())
        avg_energy = statistics.mean(energy_values)
        std_energy = statistics.stdev(energy_values) if len(energy_values) > 1 else 0

        # Energy peaks: above average + 0.5 * std dev
        peak_threshold = avg_energy + (0.5 * std_energy)
        energy_peaks = [
            hour for hour, energy in circadian_pattern.items() if energy >= peak_threshold
        ]

        # Energy valleys: below average - 0.5 * std dev
        valley_threshold = avg_energy - (0.5 * std_energy)
        energy_valleys = [
            hour for hour, energy in circadian_pattern.items() if energy <= valley_threshold
        ]

        return {
            "circadian_pattern": circadian_pattern,
            "energy_peaks": sorted(energy_peaks),
            "energy_valleys": sorted(energy_valleys),
            "average_energy": avg_energy,
        }

    def _calculate_pattern_confidence(self, hour_scores: dict[int, list[float]]) -> float:
        """Calculate confidence in detected patterns based on data consistency."""
        if not hour_scores:
            return 0.0

        # Calculate coefficient of variation for each hour
        cv_scores = []
        for hour, scores in hour_scores.items():
            if len(scores) > 1:
                mean_score = statistics.mean(scores)
                std_score = statistics.stdev(scores)
                if mean_score > 0:
                    cv = std_score / mean_score  # Coefficient of variation
                    cv_scores.append(cv)

        if not cv_scores:
            return 0.6  # Default confidence for single data points

        # Lower coefficient of variation means higher consistency
        avg_cv = statistics.mean(cv_scores)
        confidence = max(0.0, min(1.0, 1.0 - avg_cv))

        # Ensure minimum confidence is above threshold for meaningful patterns
        return max(0.51, confidence)

    def _analyze_success_factors(self, completions: list[dict[str, Any]]) -> dict[str, Any]:
        """Analyze factors that contribute to task success."""
        if not completions:
            return {}

        successful_tasks = [c for c in completions if c["success"]]
        failed_tasks = [c for c in completions if not c["success"]]

        success_factors = {}

        # Analyze completion time patterns
        if successful_tasks and failed_tasks:
            success_times = [t["completion_time"] for t in successful_tasks]
            fail_times = [t["completion_time"] for t in failed_tasks]

            success_factors["optimal_time_range"] = {
                "min": min(success_times),
                "max": max(success_times),
                "avg": statistics.mean(success_times),
            }

            success_factors["failure_time_range"] = {
                "min": min(fail_times),
                "max": max(fail_times),
                "avg": statistics.mean(fail_times),
            }

        # Overall success rate
        success_factors["overall_success_rate"] = len(successful_tasks) / len(completions)

        return success_factors
