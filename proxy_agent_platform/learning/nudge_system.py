"""
Personalized nudging and intervention system.

Generates context-aware nudges to help users maintain productivity
and healthy habits through intelligent timing and personalized messaging.
"""

import statistics
from collections import defaultdict
from typing import Any


class PersonalizedNudgeSystem:
    """Generates and optimizes personalized nudges for users."""

    def __init__(self):
        """Initialize the personalized nudge system."""
        self.nudge_types = {
            "task_reminder": "Gentle reminder about pending tasks",
            "break_suggestion": "Suggestion to take a break",
            "energy_boost": "Motivation when energy is low",
            "habit_reinforcement": "Positive reinforcement for habits",
            "focus_redirect": "Help refocus when distracted",
        }

    async def generate_contextual_nudge(self, nudge_context: dict[str, Any]) -> dict[str, Any]:
        """
        Generate a context-aware nudge based on current user situation.

        Args:
            nudge_context: Current user context and preferences

        Returns:
            Dictionary containing personalized nudge information
        """
        current_situation = nudge_context.get("current_situation", {})
        user_preferences = nudge_context.get("user_preferences", {})

        # Analyze current context
        time = current_situation.get("time", "")
        energy_level = current_situation.get("energy_level", 0.5)
        recent_activity = current_situation.get("recent_activity", "")
        next_scheduled = current_situation.get("next_scheduled", "")

        # Determine appropriate nudge type
        nudge_type = self._determine_nudge_type(current_situation)

        # Generate personalized message
        message = self._generate_personalized_message(
            nudge_type, current_situation, user_preferences
        )

        # Determine optimal timing
        timing = self._calculate_nudge_timing(current_situation, user_preferences)

        # Estimate expected impact
        expected_impact = self._estimate_nudge_impact(
            nudge_type, current_situation, user_preferences
        )

        return {
            "message": message,
            "timing": timing,
            "nudge_type": nudge_type,
            "expected_impact": expected_impact,
        }

    async def optimize_nudge_timing(self, timing_data: dict[str, Any]) -> dict[str, Any]:
        """
        Optimize nudge delivery timing based on historical responses.

        Args:
            timing_data: Historical response data and current context

        Returns:
            Dictionary containing optimal timing recommendations
        """
        historical_responses = timing_data.get("historical_responses", [])
        current_context = timing_data.get("current_context", {})

        if not historical_responses:
            # Default timing if no history
            return self._default_timing_strategy(current_context)

        # Analyze response patterns by time
        time_effectiveness = self._analyze_time_effectiveness(historical_responses)

        # Find optimal time based on current context
        optimal_time = self._find_optimal_time(time_effectiveness, current_context)

        # Calculate confidence in timing recommendation
        confidence = self._calculate_timing_confidence(time_effectiveness, optimal_time)

        # Generate reasoning
        reasoning = self._generate_timing_reasoning(
            time_effectiveness, optimal_time, current_context
        )

        return {"optimal_time": optimal_time, "confidence": confidence, "reasoning": reasoning}

    async def analyze_nudge_effectiveness(
        self, effectiveness_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Analyze and track nudge effectiveness for optimization.

        Args:
            effectiveness_data: Historical nudge performance data

        Returns:
            Dictionary containing effectiveness analysis and optimization recommendations
        """
        nudge_history = effectiveness_data.get("nudge_history", [])

        if not nudge_history:
            return {
                "overall_effectiveness": 0.0,
                "type_performance": {},
                "optimization_recommendations": ["Start collecting nudge response data"],
            }

        # Calculate overall effectiveness
        total_nudges = len(nudge_history)
        successful_nudges = sum(
            1 for nudge in nudge_history if nudge.get("user_action") != "ignored"
        )
        overall_effectiveness = successful_nudges / total_nudges if total_nudges > 0 else 0

        # Analyze performance by nudge type
        type_performance = self._analyze_type_performance(nudge_history)

        # Generate optimization recommendations
        optimization_recommendations = self._generate_optimization_recommendations(
            overall_effectiveness, type_performance, nudge_history
        )

        return {
            "overall_effectiveness": overall_effectiveness,
            "type_performance": type_performance,
            "optimization_recommendations": optimization_recommendations,
        }

    def _determine_nudge_type(self, current_situation: dict[str, Any]) -> str:
        """Determine the most appropriate nudge type for the current situation."""
        energy_level = current_situation.get("energy_level", 0.5)
        recent_activity = current_situation.get("recent_activity", "")
        next_scheduled = current_situation.get("next_scheduled", "")
        time = current_situation.get("time", "")

        # Low energy situations
        if energy_level < 0.4:
            if "meeting" in recent_activity.lower():
                return "break_suggestion"
            else:
                return "energy_boost"

        # High energy with upcoming tasks
        if energy_level > 0.7 and next_scheduled:
            return "task_reminder"

        # Work hours without clear next action
        if time and self._is_work_hours(time):
            return "focus_redirect"

        # Default to gentle task reminder
        return "task_reminder"

    def _generate_personalized_message(
        self, nudge_type: str, situation: dict[str, Any], preferences: dict[str, Any]
    ) -> str:
        """Generate a personalized message based on nudge type and user preferences."""
        nudge_style = preferences.get("nudge_style", "gentle")
        communication_tone = preferences.get("communication_tone", "encouraging")

        messages = {
            "task_reminder": {
                "gentle": {
                    "encouraging": "You have a coding task coming up. Ready to dive in?",
                    "neutral": "Reminder: coding task scheduled next.",
                    "motivational": "Time to tackle that coding challenge! You've got this!",
                },
                "direct": {
                    "encouraging": "Your coding task is ready. Let's make progress!",
                    "neutral": "Time for your scheduled coding task.",
                    "motivational": "Coding time! Show that task who's boss!",
                },
            },
            "break_suggestion": {
                "gentle": {
                    "encouraging": "You've been working hard. How about a short break?",
                    "neutral": "Consider taking a 10-minute break.",
                    "motivational": "Fuel up with a quick break - you'll come back stronger!",
                },
                "direct": {
                    "encouraging": "Time for a break. You've earned it!",
                    "neutral": "Take a break now.",
                    "motivational": "Break time! Recharge and conquer!",
                },
            },
            "energy_boost": {
                "gentle": {
                    "encouraging": "Feeling low energy? Maybe try a quick walk or some water?",
                    "neutral": "Your energy seems low. Consider a brief refresher.",
                    "motivational": "Low energy detected! Time to recharge and bounce back!",
                },
                "direct": {
                    "encouraging": "Energy boost needed! Quick walk or stretch?",
                    "neutral": "Low energy. Take action to refresh.",
                    "motivational": "Energy dip? No problem! You've got the power to recharge!",
                },
            },
            "habit_reinforcement": {
                "gentle": {
                    "encouraging": "Great job keeping up with your habits!",
                    "neutral": "Habit completion noted.",
                    "motivational": "Habit streak going strong! You're building something amazing!",
                },
                "direct": {
                    "encouraging": "Excellent habit consistency!",
                    "neutral": "Habit completed successfully.",
                    "motivational": "Habit mastery in progress! Keep dominating!",
                },
            },
            "focus_redirect": {
                "gentle": {
                    "encouraging": "Ready to focus on what matters most right now?",
                    "neutral": "Consider focusing on your priority task.",
                    "motivational": "Focus time! Channel that energy into your top priority!",
                },
                "direct": {
                    "encouraging": "Let's get focused on your main task.",
                    "neutral": "Focus on priority task now.",
                    "motivational": "Focus mode activated! Time to crush your goals!",
                },
            },
        }

        return (
            messages.get(nudge_type, {})
            .get(nudge_style, {})
            .get(communication_tone, "Stay productive and take care of yourself!")
        )

    def _calculate_nudge_timing(
        self, situation: dict[str, Any], preferences: dict[str, Any]
    ) -> str:
        """Calculate optimal timing for nudge delivery."""
        frequency = preferences.get("frequency", "moderate")
        current_time = situation.get("time", "")

        # Simple timing strategy based on frequency preference
        if frequency == "low":
            return "in_30_minutes"
        elif frequency == "high":
            return "immediate"
        else:  # moderate
            return "in_5_minutes"

    def _estimate_nudge_impact(
        self, nudge_type: str, situation: dict[str, Any], preferences: dict[str, Any]
    ) -> float:
        """Estimate the expected impact/effectiveness of the nudge."""
        base_impact = {
            "task_reminder": 0.7,
            "break_suggestion": 0.6,
            "energy_boost": 0.5,
            "habit_reinforcement": 0.8,
            "focus_redirect": 0.6,
        }

        impact = base_impact.get(nudge_type, 0.5)

        # Adjust based on context
        energy_level = situation.get("energy_level", 0.5)
        if nudge_type == "energy_boost" and energy_level < 0.3:
            impact += 0.2  # Higher impact when really needed

        # Adjust based on preferences
        if (
            preferences.get("nudge_style") == "gentle"
            and preferences.get("communication_tone") == "encouraging"
        ):
            impact += 0.1  # Positive combination

        return min(1.0, impact)

    def _is_work_hours(self, time_str: str) -> bool:
        """Check if the given time is within typical work hours."""
        try:
            hour = int(time_str.split(":")[0])
            return 9 <= hour <= 17
        except (ValueError, IndexError):
            return False

    def _analyze_time_effectiveness(
        self, historical_responses: list[dict[str, Any]]
    ) -> dict[str, float]:
        """Analyze effectiveness of nudges by time of day."""
        time_effectiveness = defaultdict(list)

        for response in historical_responses:
            time = response.get("time", "")
            responded = response.get("responded", False)
            effectiveness = response.get("effectiveness", 0.0)

            if time and responded:
                hour = int(time.split(":")[0])
                time_effectiveness[hour].append(effectiveness)

        # Calculate average effectiveness for each hour
        avg_effectiveness = {}
        for hour, scores in time_effectiveness.items():
            avg_effectiveness[hour] = statistics.mean(scores)

        return avg_effectiveness

    def _find_optimal_time(
        self, time_effectiveness: dict[str, float], current_context: dict[str, Any]
    ) -> str:
        """Find the optimal time for nudge delivery."""
        if not time_effectiveness:
            return "immediate"  # Default if no data

        # Find hour with highest effectiveness
        best_hour = max(time_effectiveness.keys(), key=lambda h: time_effectiveness[h])

        # Check if user is currently available
        availability = current_context.get("availability", "unknown")
        if availability == "free":
            return "immediate"

        # Format as time string
        return f"{best_hour:02d}:00"

    def _calculate_timing_confidence(
        self, time_effectiveness: dict[str, float], optimal_time: str
    ) -> float:
        """Calculate confidence in the timing recommendation."""
        if not time_effectiveness:
            return 0.5  # Low confidence without data

        # Base confidence on data consistency
        effectiveness_values = list(time_effectiveness.values())
        if len(effectiveness_values) > 1:
            std_dev = statistics.stdev(effectiveness_values)
            confidence = max(0.5, 1.0 - std_dev)
        else:
            confidence = 0.7

        return confidence

    def _generate_timing_reasoning(
        self,
        time_effectiveness: dict[str, float],
        optimal_time: str,
        current_context: dict[str, Any],
    ) -> list[str]:
        """Generate reasoning for the timing recommendation."""
        reasoning = []

        if time_effectiveness:
            best_hour = optimal_time.split(":")[0]
            reasoning.append(f"Historical data shows best response at {best_hour}:00")

        availability = current_context.get("availability", "unknown")
        if availability == "free":
            reasoning.append("User is currently available")

        attention_level = current_context.get("attention_level", "unknown")
        if attention_level == "high":
            reasoning.append("High attention level detected")

        if not reasoning:
            reasoning.append("Using default timing strategy")

        return reasoning

    def _analyze_type_performance(
        self, nudge_history: list[dict[str, Any]]
    ) -> dict[str, dict[str, Any]]:
        """Analyze performance metrics by nudge type."""
        type_stats = defaultdict(lambda: {"total": 0, "successful": 0, "avg_response_time": 0})

        for nudge in nudge_history:
            nudge_type = nudge.get("type", "unknown")
            user_action = nudge.get("user_action", "ignored")
            response_time = nudge.get("response_time")

            stats = type_stats[nudge_type]
            stats["total"] += 1

            if user_action != "ignored":
                stats["successful"] += 1
                if response_time:
                    # Update rolling average
                    current_avg = stats["avg_response_time"]
                    current_count = stats["successful"]
                    stats["avg_response_time"] = (
                        (current_avg * (current_count - 1)) + response_time
                    ) / current_count

        # Calculate success rates
        performance = {}
        for nudge_type, stats in type_stats.items():
            success_rate = stats["successful"] / stats["total"] if stats["total"] > 0 else 0
            performance[nudge_type] = {
                "success_rate": success_rate,
                "total_sent": stats["total"],
                "avg_response_time": stats["avg_response_time"],
            }

        return performance

    def _generate_optimization_recommendations(
        self,
        overall_effectiveness: float,
        type_performance: dict[str, dict],
        nudge_history: list[dict],
    ) -> list[str]:
        """Generate actionable recommendations for nudge optimization."""
        recommendations = []

        # Overall effectiveness recommendations
        if overall_effectiveness < 0.4:
            recommendations.append(
                "Consider reducing nudge frequency - users may be experiencing nudge fatigue"
            )
        elif overall_effectiveness > 0.8:
            recommendations.append(
                "Excellent nudge performance! Consider expanding successful patterns"
            )

        # Type-specific recommendations
        for nudge_type, performance in type_performance.items():
            success_rate = performance["success_rate"]
            if success_rate < 0.3:
                recommendations.append(
                    f"'{nudge_type}' nudges are underperforming - review messaging and timing"
                )
            elif success_rate > 0.8:
                recommendations.append(
                    f"'{nudge_type}' nudges are highly effective - use as template for others"
                )

        # Response time recommendations
        avg_response_times = [
            p["avg_response_time"] for p in type_performance.values() if p["avg_response_time"] > 0
        ]
        if avg_response_times:
            overall_avg_response = statistics.mean(avg_response_times)
            if overall_avg_response > 600:  # 10 minutes
                recommendations.append(
                    "Users are slow to respond - consider more urgent or compelling messaging"
                )

        if not recommendations:
            recommendations.append("Nudge system performing well - continue current approach")

        return recommendations

    def _default_timing_strategy(self, current_context: dict[str, Any]) -> dict[str, Any]:
        """Provide default timing strategy when no historical data is available."""
        availability = current_context.get("availability", "unknown")

        if availability == "free":
            optimal_time = "immediate"
            confidence = 0.7
        else:
            optimal_time = "in_15_minutes"
            confidence = 0.5

        return {
            "optimal_time": optimal_time,
            "confidence": confidence,
            "reasoning": ["Using default timing strategy - no historical data available"],
        }
