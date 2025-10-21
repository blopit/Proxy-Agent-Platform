"""
Energy Proxy Agent - Manages energy levels and optimization.

This agent helps users track, maintain, and optimize their energy levels
through AI-powered energy management and recovery techniques.
"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic_ai import RunContext

from .base import BaseProxyAgent


class EnergyLevel(str, Enum):
    """Energy level classifications."""

    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class EnergyActivity(str, Enum):
    """Types of energy-affecting activities."""

    SLEEP = "sleep"
    EXERCISE = "exercise"
    NUTRITION = "nutrition"
    STRESS = "stress"
    WORK = "work"
    SOCIAL = "social"
    MEDITATION = "meditation"


class EnergyProxy(BaseProxyAgent):
    """Energy management and optimization agent."""

    def __init__(self):
        super().__init__(
            name="EnergyProxy",
            description="Manages energy levels and optimization strategies",
            capabilities=[
                "energy_tracking",
                "energy_optimization",
                "recovery_planning",
                "energy_analytics",
                "wellness_recommendations",
            ],
        )

    async def track_energy_level(
        self, level: EnergyLevel, factors: list[str], context: RunContext | None = None
    ) -> dict[str, Any]:
        """Track current energy level with contributing factors."""
        energy_entry = {
            "timestamp": datetime.now(),
            "level": level,
            "factors": factors,
            "score": self._level_to_score(level),
        }

        # Store in context (would typically go to database)
        if context:
            if "energy_history" not in context.state:
                context.state["energy_history"] = []
            context.state["energy_history"].append(energy_entry)

        return {
            "success": True,
            "energy_entry": energy_entry,
            "message": f"Energy level {level} recorded with factors: {', '.join(factors)}",
        }

    async def get_energy_analytics(
        self, days: int = 7, context: RunContext | None = None
    ) -> dict[str, Any]:
        """Get energy analytics for the specified period."""
        if not context or "energy_history" not in context.state:
            return {"success": False, "message": "No energy data available"}

        history = context.state["energy_history"]
        recent_history = [
            entry for entry in history if (datetime.now() - entry["timestamp"]).days <= days
        ]

        if not recent_history:
            return {"success": False, "message": f"No energy data for the last {days} days"}

        # Calculate analytics
        avg_score = sum(entry["score"] for entry in recent_history) / len(recent_history)
        level_distribution = {}
        for entry in recent_history:
            level = entry["level"]
            level_distribution[level] = level_distribution.get(level, 0) + 1

        # Find common factors
        all_factors = []
        for entry in recent_history:
            all_factors.extend(entry["factors"])

        factor_frequency = {}
        for factor in all_factors:
            factor_frequency[factor] = factor_frequency.get(factor, 0) + 1

        common_factors = sorted(factor_frequency.items(), key=lambda x: x[1], reverse=True)[:5]

        analytics = {
            "period_days": days,
            "total_entries": len(recent_history),
            "average_energy_score": round(avg_score, 1),
            "level_distribution": level_distribution,
            "common_factors": common_factors,
            "trend": self._calculate_energy_trend(recent_history),
            "recommendations": self._generate_energy_recommendations(avg_score, common_factors),
        }

        return {"success": True, "analytics": analytics}

    async def suggest_energy_boost(
        self,
        current_level: EnergyLevel,
        time_available_minutes: int,
        context: RunContext | None = None,
    ) -> dict[str, Any]:
        """Suggest energy-boosting activities based on current level and time."""
        suggestions = {
            EnergyLevel.VERY_LOW: {
                "quick": ["Take a 5-minute walk", "Drink water", "Deep breathing"],
                "medium": ["Power nap (15-20 min)", "Light stretching", "Healthy snack"],
                "long": ["Full meal", "30-min walk", "Meditation session"],
            },
            EnergyLevel.LOW: {
                "quick": ["Stand up and stretch", "Drink water", "Look at nature"],
                "medium": ["Light exercise", "Healthy snack", "Brief social interaction"],
                "long": ["Exercise session", "Social activity", "Creative hobby"],
            },
            EnergyLevel.MEDIUM: {
                "quick": ["Quick walk", "Hydrate", "Positive affirmation"],
                "medium": ["Moderate exercise", "Healthy meal", "Learning activity"],
                "long": ["Intensive workout", "Social gathering", "Creative project"],
            },
            EnergyLevel.HIGH: {
                "quick": ["Channel energy into work", "Help someone", "Take on challenge"],
                "medium": ["Intensive task", "Physical activity", "Creative project"],
                "long": ["Major project", "Intensive workout", "Social leadership"],
            },
            EnergyLevel.VERY_HIGH: {
                "quick": ["Channel into productive work", "Help others", "Take on big challenge"],
                "medium": ["Major project work", "Intensive exercise", "Leadership activity"],
                "long": ["Major creative project", "Intensive workout", "Social leadership"],
            },
        }

        # Determine time category
        if time_available_minutes <= 10:
            time_category = "quick"
        elif time_available_minutes <= 30:
            time_category = "medium"
        else:
            time_category = "long"

        available_suggestions = suggestions[current_level][time_category]

        return {
            "success": True,
            "current_level": current_level,
            "time_available": time_available_minutes,
            "suggestions": available_suggestions,
            "reasoning": f"Based on {current_level} energy level and {time_available_minutes} minutes available",
        }

    async def plan_energy_recovery(
        self,
        current_level: EnergyLevel,
        target_level: EnergyLevel,
        context: RunContext | None = None,
    ) -> dict[str, Any]:
        """Plan energy recovery strategy."""
        current_score = self._level_to_score(current_level)
        target_score = self._level_to_score(target_level)
        score_difference = target_score - current_score

        if score_difference <= 0:
            return {
                "success": False,
                "message": "Target energy level is not higher than current level",
            }

        # Create recovery plan based on score difference
        if score_difference <= 20:
            plan_type = "quick_recovery"
            duration_hours = 1
            activities = ["Hydrate", "Light snack", "Brief walk", "Deep breathing"]
        elif score_difference <= 40:
            plan_type = "moderate_recovery"
            duration_hours = 2
            activities = ["Healthy meal", "Light exercise", "Rest", "Social interaction"]
        else:
            plan_type = "extensive_recovery"
            duration_hours = 4
            activities = ["Full meal", "Exercise session", "Nap", "Social activity", "Hobby time"]

        recovery_plan = {
            "plan_type": plan_type,
            "duration_hours": duration_hours,
            "activities": activities,
            "current_level": current_level,
            "target_level": target_level,
            "estimated_improvement": score_difference,
        }

        return {
            "success": True,
            "recovery_plan": recovery_plan,
            "message": f"Created {plan_type} plan to improve energy from {current_level} to {target_level}",
        }

    def _level_to_score(self, level: EnergyLevel) -> int:
        """Convert energy level to numeric score."""
        level_scores = {
            EnergyLevel.VERY_LOW: 20,
            EnergyLevel.LOW: 40,
            EnergyLevel.MEDIUM: 60,
            EnergyLevel.HIGH: 80,
            EnergyLevel.VERY_HIGH: 100,
        }
        return level_scores[level]

    def _calculate_energy_trend(self, history: list[dict[str, Any]]) -> str:
        """Calculate energy trend from history."""
        if len(history) < 2:
            return "insufficient_data"

        recent_scores = [entry["score"] for entry in history[-5:]]
        older_scores = (
            [entry["score"] for entry in history[:-5]] if len(history) > 5 else recent_scores
        )

        recent_avg = sum(recent_scores) / len(recent_scores)
        older_avg = sum(older_scores) / len(older_scores)

        if recent_avg > older_avg + 5:
            return "improving"
        elif recent_avg < older_avg - 5:
            return "declining"
        else:
            return "stable"

    def _generate_energy_recommendations(
        self, avg_score: float, common_factors: list[tuple]
    ) -> list[str]:
        """Generate energy recommendations based on analytics."""
        recommendations = []

        if avg_score < 50:
            recommendations.append("Focus on sleep quality and duration")
            recommendations.append("Increase physical activity gradually")
            recommendations.append("Improve nutrition with balanced meals")

        if avg_score < 70:
            recommendations.append("Consider stress management techniques")
            recommendations.append("Ensure adequate hydration")
            recommendations.append("Take regular breaks during work")

        # Factor-based recommendations
        factor_text = " ".join([factor for factor, _ in common_factors])
        if "stress" in factor_text.lower():
            recommendations.append("Practice meditation or mindfulness")
        if "work" in factor_text.lower():
            recommendations.append("Implement better work-life balance")
        if "sleep" in factor_text.lower():
            recommendations.append("Establish consistent sleep schedule")

        return recommendations[:5]  # Limit to top 5 recommendations
